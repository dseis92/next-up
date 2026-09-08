-- E3 Dealbreaker Engine - User Dealbreaker Preferences
-- Creates a dedicated table for user-defined non-negotiables
-- One row per user, owner-only access

-- Create user_dealbreakers table
CREATE TABLE user_dealbreakers (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Minimum compensation requirement (in yearly salary)
  minimum_salary INTEGER CHECK (minimum_salary IS NULL OR minimum_salary >= 0),

  -- Require salary disclosure
  require_salary_disclosure BOOLEAN NOT NULL DEFAULT false,

  -- Allowed work arrangements (empty array = no restriction)
  allowed_work_arrangements TEXT[] NOT NULL DEFAULT '{}' CHECK (
    allowed_work_arrangements <@ ARRAY['remote', 'hybrid', 'onsite']::TEXT[]
  ),

  -- Allowed employment types (empty array = no restriction)
  allowed_employment_types TEXT[] NOT NULL DEFAULT '{}' CHECK (
    allowed_employment_types <@ ARRAY['full_time', 'part_time', 'contract', 'temporary']::TEXT[]
  ),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_dealbreakers ENABLE ROW LEVEL SECURITY;

-- Policy: Users can select their own dealbreaker preferences
CREATE POLICY "Users can view their own dealbreaker preferences"
  ON user_dealbreakers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own dealbreaker preferences
CREATE POLICY "Users can create their own dealbreaker preferences"
  ON user_dealbreakers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own dealbreaker preferences
CREATE POLICY "Users can update their own dealbreaker preferences"
  ON user_dealbreakers
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own dealbreaker preferences
CREATE POLICY "Users can delete their own dealbreaker preferences"
  ON user_dealbreakers
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_user_dealbreakers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_dealbreakers_updated_at
  BEFORE UPDATE ON user_dealbreakers
  FOR EACH ROW
  EXECUTE FUNCTION update_user_dealbreakers_updated_at();
