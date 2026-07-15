-- 스테이지 클리어 보상(XP·코인) 도입. 기존엔 제출할 때마다 맞힌 개수만큼 XP를 줘서,
-- 이미 깬 스테이지를 반복 제출하면 XP를 무한히 파밍할 수 있었다. 코인도 같은 방식으로
-- 넣으면 똑같이 파밍되므로, 이번에 XP·코인 둘 다 "그 스테이지를 처음 깨는 순간"에만
-- 지급하도록 통일한다. user_level_progress.stage가 실제로 전진했는지(= 첫 클리어인지)를
-- 그 판정 신호로 쓴다.
--
-- 난이도별 마지막 스테이지는 questions에서 max(stage)로 판정한다(클라 CURRICULUM_TOTAL_COUNT와
-- 별개로 DB가 자체 소스로 판단 — 상수 드리프트 위험 없음).
--
-- 수치(팀 합의, 2026-07-15): 일반 스테이지 첫 클리어 XP 50(기존 5문제×10과 동일 총량)/코인 70,
-- 난이도 마지막 스테이지 첫 클리어는 코인 보너스 +180(총 250). 44스테이지 완주 시 코인 총 3,980으로,
-- 캐릭터(1,000×3=3,000)+컬러(100×5=500) 목표 3,500을 커버한다.
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
  v_assigned_level varchar;
  v_level_max_stage smallint;
  v_is_final_stage boolean;
  v_advanced_rows integer;
  v_is_first_clear boolean := false;
  v_xp_reward integer := 0;
  v_coin_reward integer := 0;
  v_xp_per_stage constant integer := 50;
  v_base_coin constant integer := 70;
  v_final_stage_bonus_coin constant integer := 180;
  rec record;
begin
  if v_user_id is null then
    raise exception 'unauthenticated';
  end if;

  select count(*) into v_total_count from questions where level = p_level and stage = p_stage;
  if v_total_count = 0 then
    raise exception 'unknown level/stage: %/%', p_level, p_stage;
  end if;

  select max(stage) into v_level_max_stage from questions where level = p_level;
  v_is_final_stage := (p_stage = v_level_max_stage);

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
        (v_user_id, rec.question_id, v_session_id, rec.selected_option, rec.correct_option, 'unreviewed')
      on conflict (user_id, question_id) do update
        set session_id = excluded.session_id,
            selected_answer = excluded.selected_answer,
            correct_answer = excluded.correct_answer,
            review_status = 'unreviewed',
            reviewed_at = null,
            created_at = now();
    end if;
  end loop;

  -- 4) 레벨별 독립 진행도 갱신. 행이 없으면 1번 스테이지로 새로 만든다(첫 시도).
  -- 전진은 UPDATE 문 자체의 WHERE에 stage = p_stage를 걸어 원자적으로 처리한다
  -- (select 후 별도 update면 동시 요청 시 이중 전진 위험이 있다).
  -- 이 UPDATE가 실제로 행을 건드렸는지(ROW_COUNT)가 "처음 깼는지"의 판정 신호다 —
  -- 이미 지나온 스테이지를 복습 삼아 다시 성공해도 stage가 그대로라 여기 안 걸린다.
  insert into user_level_progress (user_id, level, stage) values (v_user_id, p_level, 1)
  on conflict (user_id, level) do nothing;

  if v_is_success then
    update user_level_progress
      set stage = stage + 1, updated_at = now()
      where user_id = v_user_id and level = p_level and stage = p_stage;
    get diagnostics v_advanced_rows = row_count;
    v_is_first_clear := v_advanced_rows > 0;
  end if;

  if v_is_first_clear then
    v_xp_reward := v_xp_per_stage;
    v_coin_reward := v_base_coin + (case when v_is_final_stage then v_final_stage_bonus_coin else 0 end);
  end if;

  -- 5) XP·스트릭은 레벨 무관 전역 누적치라 user_progress에 그대로 쌓는다. XP는 위에서 판정한
  -- 첫 클리어 보상만 더한다(스트릭은 파밍 우려 없는 출석 신호라 매 제출마다 그대로 갱신).
  -- 레벨테스트로 배정된 레벨(user_progress.level)을 플레이한 경우엔 stage도 같이 맞춰 하위 호환 유지.
  select level into v_assigned_level from user_progress where user_id = v_user_id;

  update user_progress
    set xp = xp + v_xp_reward,
        last_attended = current_date,
        streak = case
          when last_attended = current_date - 1 then coalesce(streak, 0) + 1
          when last_attended = current_date then coalesce(streak, 1)
          else 1
        end,
        stage = case
          when v_is_success and v_assigned_level = p_level and stage = p_stage then stage + 1
          else stage
        end
    where user_id = v_user_id;

  -- 5-1) 코인은 첫 클리어일 때만 지급.
  if v_coin_reward > 0 then
    update public.users set coin = coin + v_coin_reward where id = v_user_id;
  end if;

  -- 6) 행복도 갱신 (avatars를 거쳐 avatar_status로 — user_id 직결 아님). 감정 신호라 파밍
  -- 걱정 없이 매 제출마다 갱신한다.
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
    'moodValue', v_mood_value,
    'isFirstClear', v_is_first_clear,
    'xpReward', v_xp_reward,
    'coinReward', v_coin_reward
  );
end;
$$;

revoke execute on function submit_quiz_result(varchar, integer, jsonb, integer) from public;
grant execute on function submit_quiz_result(varchar, integer, jsonb, integer) to authenticated;
