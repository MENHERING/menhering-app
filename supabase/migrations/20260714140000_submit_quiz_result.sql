-- 학습 탭 퀴즈 제출 — 원자적 RPC.
-- 새 테이블 없음: 기존 questions/user_progress/sessions/wrong_answers/avatars/avatar_status를 그대로 쓴다.
-- questions.answer는 정답 보기의 "텍스트"를 저장하므로(숫자 인덱스 아님), option_1~4와 대조해
-- 몇 번 보기가 정답인지 서버가 직접 계산한다 — 클라이언트가 정답 개수/성공 여부를 조작해 보낼 수 없다.

-- 파라미터는 integer로 받는다. smallint로 받으면 정수 리터럴(예: 1)을 그대로 넘길 때
-- PostgreSQL 함수 오버로드 해석이 실패한다(int4→int2는 "assignment" 캐스트라 자동 매칭 대상이 아님).
drop function if exists submit_quiz_result(varchar, smallint, jsonb, smallint);

create or replace function submit_quiz_result(
  p_level varchar,
  p_stage integer,
  p_answers jsonb,          -- [{ "question_id": uuid, "selected_option": integer(1~4) }, ...]
  p_duration_sec integer default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_avatar_id uuid;
  v_correct_count smallint := 0;
  v_wrong_count smallint := 0;
  v_total_count smallint;
  v_is_success boolean;
  v_session_id uuid;
  v_mood_value smallint;
  v_current_level varchar;
  v_current_stage smallint;
  v_last_attended date;
  v_streak smallint;
  v_xp_per_correct int4 := 10; -- 가안: 정답 1개당 XP. 조정 여지 있음
  rec record;
begin
  if v_user_id is null then
    raise exception 'unauthenticated';
  end if;

  select count(*) into v_total_count from questions where level = p_level and stage = p_stage;
  if v_total_count = 0 then
    raise exception 'unknown level/stage: %/%', p_level, p_stage;
  end if;

  -- 1) 채점: option_1~4 중 answer 텍스트와 일치하는 번호를 정답으로 보고 제출값과 비교
  for rec in
    select
      q.id as question_id,
      (a->>'selected_option')::smallint as selected_option,
      case q.answer
        when q.option_1 then 1 when q.option_2 then 2
        when q.option_3 then 3 when q.option_4 then 4
      end as correct_option
    from jsonb_array_elements(p_answers) a
    join questions q on q.id = (a->>'question_id')::uuid
    where q.level = p_level and q.stage = p_stage
  loop
    if rec.selected_option = rec.correct_option then
      v_correct_count := v_correct_count + 1;
    else
      v_wrong_count := v_wrong_count + 1;
    end if;
  end loop;

  -- "성공"은 5문제 전부 정답 + 제한시간(60초) 내. sessions.is_success 정의와 동일하게 맞춘다.
  v_is_success := (v_correct_count = v_total_count) and (p_duration_sec is null or p_duration_sec <= 60);

  -- 2) 세션 기록 (시도 이력 — 성공 실패 무관하게 항상 남긴다)
  insert into sessions (user_id, level, stage, correct_count, total_count, is_success, duration_sec)
  values (v_user_id, p_level, p_stage, v_correct_count, v_total_count, v_is_success, p_duration_sec)
  returning id into v_session_id;

  -- 3) 오답 기록. 동일 문제 재오답이면 최신 시도로 갱신(재복습 대상으로 되돌림).
  for rec in
    select
      q.id as question_id,
      (a->>'selected_option')::smallint as selected_option,
      case q.answer
        when q.option_1 then 1 when q.option_2 then 2
        when q.option_3 then 3 when q.option_4 then 4
      end as correct_option
    from jsonb_array_elements(p_answers) a
    join questions q on q.id = (a->>'question_id')::uuid
    where q.level = p_level and q.stage = p_stage
  loop
    if rec.selected_option != rec.correct_option then
      insert into wrong_answers
        (user_id, question_id, session_id, selected_answer, correct_answer, review_status)
      values
        (v_user_id, rec.question_id, v_session_id, rec.selected_option, rec.correct_option, '미복습')
      on conflict (user_id, question_id) do update
        set session_id = excluded.session_id,
            selected_answer = excluded.selected_answer,
            correct_answer = excluded.correct_answer,
            review_status = '미복습',
            reviewed_at = null,
            created_at = now();
    end if;
  end loop;

  -- 4) 진행도 갱신: 지금 이 (level, stage)가 유저의 "현재" 지점이고 성공했을 때만 다음 스테이지로 전진.
  -- 이미 지나온 스테이지를 복습 삼아 다시 풀었을 땐 stage를 되돌리거나 건드리지 않는다.
  select level, stage, last_attended, streak
    into v_current_level, v_current_stage, v_last_attended, v_streak
  from user_progress where user_id = v_user_id;

  if v_is_success and v_current_level = p_level and v_current_stage = p_stage then
    update user_progress
      set stage = stage + 1,
          xp = xp + (v_xp_per_correct * v_correct_count),
          last_attended = current_date,
          -- 어제 학습했으면 streak+1, 오늘 이미 했으면 유지, 아니면 1로 리셋
          streak = case
            when v_last_attended = current_date - 1 then coalesce(v_streak, 0) + 1
            when v_last_attended = current_date then coalesce(v_streak, 1)
            else 1
          end
      where user_id = v_user_id;
  end if;

  -- 5) 행복도 갱신 (avatars를 거쳐 avatar_status로 — user_id 직결 아님)
  select id into v_avatar_id from avatars where user_id = v_user_id;
  if v_avatar_id is not null then
    update avatar_status
      set mood_value = least(100, greatest(0, mood_value + v_correct_count * 2)),
          updated_at = now()
      where avatar_id = v_avatar_id
      returning mood_value into v_mood_value;
  end if;

  return jsonb_build_object(
    'correctCount', v_correct_count,
    'wrongCount', v_wrong_count,
    'isSuccess', v_is_success,
    'moodValue', v_mood_value
  );
end;
$$;

revoke execute on function submit_quiz_result(varchar, integer, jsonb, integer) from public;
grant execute on function submit_quiz_result(varchar, integer, jsonb, integer) to authenticated;
