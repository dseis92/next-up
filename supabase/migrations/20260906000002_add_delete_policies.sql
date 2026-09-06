-- Add DELETE policies for onboarding data cleanup
-- This enables clearOnboardingData to function correctly with RLS

-- onboarding_progress
CREATE POLICY "Users can delete own onboarding"
  ON onboarding_progress FOR DELETE
  USING (auth.uid() = user_id);

-- user_goals (already exists in initial schema, drop and recreate to be safe)
DROP POLICY IF EXISTS "Users can delete own goals" ON user_goals;
CREATE POLICY "Users can delete own goals"
  ON user_goals FOR DELETE
  USING (auth.uid() = user_id);

-- user_skills (already has delete policy from initial migration)
-- No action needed

-- work_experiences (already has delete policy from initial migration)
-- No action needed

-- target_roles (already has delete policy from initial migration)
-- No action needed

-- preferred_locations (already has delete policy from initial migration)
-- No action needed

-- user_preferences
CREATE POLICY "Users can delete own preferences"
  ON user_preferences FOR DELETE
  USING (auth.uid() = user_id);
