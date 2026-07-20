-- 행복도(mood_value) 증가가 매 제출마다 정답 개수만큼(최대 +10/스테이지) 무한히 쌓여서
-- 체감상 너무 빨리 올랐다. XP·코인과 같은 원칙으로 정리한다:
-- 1) 복습(이미 깬 스테이지 재도전)은 반영하지 않고 "그 스테이지를 처음 깰 때"만 지급
-- 2) 증가폭을 정답 개수 비례(최대 10)에서 스테이지당 고정 5로 낮춘다(XP처럼 스테이지 단위 보상으로 통일)
--
-- 클라이언트가 URL 쿼리로 직접 상승분을 계산하던 것도 xpReward/coinReward와 같은 방식으로
-- 서버가 계산한 moodGain을 그대로 내려주도록 응답에 필드를 추가한다.
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
  v_mood_gain integer := 0;
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
  v_mood_gain_per_stage constant integer := 5;
  v_answer_count integer;
  v_distinct_valid_count integer;
  rec record;
begin
  if v_user_id is null then
    raise exception 'unauthenticated';
  end if;

  select count(*) into v_total_count from questions where level = p_level and stage = p_stage;
  if v_total_count = 0 then
    raise exception 'unknown level/stage: %/%', p_level, p_stage;
  end if;

  -- p_answers가 이 스테이지의 문제 집합과 정확히 1:1로 대응하는지 검증한다. 안 그러면
  -- 이미 정답을 아는 question_id 하나를 문제 수만큼 반복 제출해도 v_correct_count가
  -- v_total_count에 도달해 스테이지 클리어(+ 첫 클리어 보상)를 위조할 수 있다.
  select count(*) into v_answer_count from jsonb_array_elements(p_answers);

  select count(distinct q.id) into v_distinct_valid_count
  from jsonb_array_elements(p_answers) a
  join questions q on q.id = (a->>'question_id')::uuid
  where q.level = p_level and q.stage = p_stage;

  if v_answer_count != v_total_count or v_distinct_valid_count != v_total_count then
    raise exception 'answers do not match questions for level/stage: %/%', p_level, p_stage;
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
    v_mood_gain := v_mood_gain_per_stage;
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

  -- 6) 행복도도 이제 첫 클리어일 때만 고정폭(v_mood_gain)만큼 오른다. 복습·반복 제출은
  -- mood_value를 그대로 둔다(단, 갱신 시각은 조회 위해 그대로 읽는다).
  -- 반환하는 moodGain은 목표치가 아니라 "실제로 반영된" 증가량이어야 한다 — 100 상한에 걸려
  -- 일부만 반영되거나(예: 98→100은 +5가 아니라 +2), 아바타/상태 행 자체가 없어 아예 반영이
  -- 안 된 경우까지 정확히 잡아야 결과 화면의 "+N%p 상승" 표시가 실제 값과 어긋나지 않는다.
  select id into v_avatar_id from avatars where user_id = v_user_id;
  if v_avatar_id is not null then
    if v_mood_gain > 0 then
      -- 잠근 뒤 현재 값 기준으로 상한(100)까지 실제 적용 가능한 만큼만 올린다.
      select mood_value into v_mood_value
        from avatar_status where avatar_id = v_avatar_id for update;

      if found then
        v_mood_gain := least(v_mood_gain, greatest(0, 100 - v_mood_value));

        if v_mood_gain > 0 then
          update avatar_status
            set mood_value = mood_value + v_mood_gain,
                updated_at = now()
            where avatar_id = v_avatar_id
            returning mood_value into v_mood_value;
        end if;
      else
        v_mood_gain := 0;
      end if;
    else
      select mood_value into v_mood_value from avatar_status where avatar_id = v_avatar_id;
    end if;
  else
    v_mood_gain := 0;
  end if;

  return jsonb_build_object(
    'correctCount', v_correct_count,
    'wrongCount', v_wrong_count,
    'isSuccess', v_is_success,
    'moodValue', v_mood_value,
    'moodGain', v_mood_gain,
    'xpReward', v_xp_reward,
    'coinReward', v_coin_reward
  );
end;
$$;

revoke execute on function submit_quiz_result(varchar, integer, jsonb, integer) from public;
grant execute on function submit_quiz_result(varchar, integer, jsonb, integer) to authenticated;
