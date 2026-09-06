/**
 * Add missing UPDATE policy for passed_jobs
 *
 * Issue: passJob() uses upsert with onConflict, which requires UPDATE permission
 * on duplicate user_id,job_id. Without UPDATE policy, repeated pass fails with RLS error.
 *
 * Root cause: Initial schema included SELECT, INSERT, DELETE but not UPDATE
 * Symptom: First pass succeeds (INSERT), second pass fails (UPDATE blocked)
 * Fix: Add owner-only UPDATE policy matching saved_jobs pattern
 */

-- Drop policy if it exists (defensive, for replayability)
DROP POLICY IF EXISTS "Users can update own passed jobs" ON passed_jobs;

-- Create UPDATE policy for own-row updates
CREATE POLICY "Users can update own passed jobs"
  ON passed_jobs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
