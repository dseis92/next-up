-- Tighten RLS policies for application_events and application_notes
-- Ensure events/notes can only be created for applications owned by the user

-- Drop existing policies for application_events
DROP POLICY IF EXISTS "Users can view own application events" ON application_events;
DROP POLICY IF EXISTS "Users can insert own application events" ON application_events;

-- Create new policies with application ownership validation
CREATE POLICY "Users can view own application events"
  ON application_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own application events"
  ON application_events FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1
      FROM applications
      WHERE applications.id = application_id
        AND applications.user_id = auth.uid()
    )
  );

-- Drop existing policies for application_notes
DROP POLICY IF EXISTS "Users can view own application notes" ON application_notes;
DROP POLICY IF EXISTS "Users can insert own application notes" ON application_notes;
DROP POLICY IF EXISTS "Users can update own application notes" ON application_notes;
DROP POLICY IF EXISTS "Users can delete own application notes" ON application_notes;

-- Create new policies with application ownership validation
CREATE POLICY "Users can view own application notes"
  ON application_notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own application notes"
  ON application_notes FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1
      FROM applications
      WHERE applications.id = application_id
        AND applications.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own application notes"
  ON application_notes FOR UPDATE
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1
      FROM applications
      WHERE applications.id = application_id
        AND applications.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own application notes"
  ON application_notes FOR DELETE
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1
      FROM applications
      WHERE applications.id = application_id
        AND applications.user_id = auth.uid()
    )
  );
