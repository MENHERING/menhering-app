-- 오답노트 "다시 풀기" 복습 보상 도입. 퀴즈 스테이지 클리어(stage_clear_rewards)와 같은 이유로,
-- review_status가 실제로 '미복습' → '복습완료'로 전환되는 순간에만 보상을 준다 — 이미 복습
-- 완료된 행을 다시 호출해도(멱등 재시도 등) 중복 지급되지 않도록 UPDATE의 WHERE에
-- review_status = '미복습'을 걸고, 실제로 행이 바뀌었는지(ROW_COUNT)로 판정한다.
--
-- 수치(임시값, 팀 논의 필요): 복습 1건당 XP 10 (퀴즈 스테이지 첫 클리어가 문제당 10으로
-- 환산되는 것과 맞춤), 기분 +1 (퀴즈 정답당 +2의 절반 — 새 학습보다 낮은 가중치로 둠).
-- 스트릭은 출석 신호라 퀴즈와 동일하게 매번 갱신한다.
--
-- ⚠️ 한 문제를 "복습 완료 → (나중에 같은 문제를 다시 틀림) → 다시 복습 완료"로 반복하면
-- 보상을 다시 받을 수 있다. 막으려면 wrong_answers에 "보상을 받은 적 있는지" 별도 이력이
-- 필요한데, 일부러 여러 번 틀려야 하는 구조라 실익이 낮아 지금은 방지하지 않는다.
create or replace function apply_wrong_note_review_reward(p_wrong_answer_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_avatar_id uuid;
  v_mood_value_before smallint;
  v_mood_value_after smallint;
  v_streak smallint;
  v_updated_rows integer;
  v_rewarded boolean := false;
  v_xp_reward integer := 0;
  v_xp_per_review constant integer := 10;
  v_mood_gain constant smallint := 1;
  v_wrong_answer record;
begin
  if v_user_id is null then
    raise exception 'unauthenticated';
  end if;

  -- review_status가 '미복습'일 때만 '복습완료'로 전환한다 (WHERE절 조건으로 원자적 판정).
  update wrong_answers
    set review_status = '복습완료', reviewed_at = now()
    where id = p_wrong_answer_id and user_id = v_user_id and review_status = '미복습';
  get diagnostics v_updated_rows = row_count;
  v_rewarded := v_updated_rows > 0;

  select * into v_wrong_answer from wrong_answers where id = p_wrong_answer_id and user_id = v_user_id;
  if not found then
    raise exception 'wrong answer not found: %', p_wrong_answer_id;
  end if;

  select streak into v_streak from user_progress where user_id = v_user_id;
  select mood_value into v_mood_value_before
    from avatar_status a join avatars v on v.id = a.avatar_id
    where v.user_id = v_user_id;
  v_mood_value_after := v_mood_value_before;

  if v_rewarded then
    v_xp_reward := v_xp_per_review;

    -- XP·스트릭은 user_progress에 그대로 쌓는다 (퀴즈와 동일한 출석/누적 로직).
    update user_progress
      set xp = xp + v_xp_reward,
          last_attended = current_date,
          streak = case
            when last_attended = current_date - 1 then coalesce(streak, 0) + 1
            when last_attended = current_date then coalesce(streak, 1)
            else 1
          end
      where user_id = v_user_id
      returning streak into v_streak;

    -- 기분 갱신 (avatars를 거쳐 avatar_status로 — user_id 직결 아님).
    select id into v_avatar_id from avatars where user_id = v_user_id;
    if v_avatar_id is not null then
      update avatar_status
        set mood_value = least(100, greatest(0, mood_value + v_mood_gain)),
            updated_at = now()
        where avatar_id = v_avatar_id
        returning mood_value into v_mood_value_after;
    end if;
  end if;

  return jsonb_build_object(
    'wrongAnswer', to_jsonb(v_wrong_answer),
    'xpReward', v_xp_reward,
    'moodValueBefore', v_mood_value_before,
    'moodValueAfter', v_mood_value_after,
    'streak', v_streak,
    'rewarded', v_rewarded
  );
end;
$$;

revoke execute on function apply_wrong_note_review_reward(uuid) from public;
grant execute on function apply_wrong_note_review_reward(uuid) to authenticated;
