-- NextUp Initial Schema Migration
-- Creates all tables with Row Level Security enabled

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- PROFILES
-- ==========================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  about TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ==========================================
-- ONBOARDING PROGRESS
-- ==========================================
CREATE TABLE onboarding_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_title TEXT,
  industry TEXT,
  years_experience INTEGER,
  employment_status TEXT,
  location TEXT,
  max_commute INTEGER,
  willing_to_relocate BOOLEAN DEFAULT FALSE,
  salary_min INTEGER,
  salary_ideal INTEGER,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE onboarding_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own onboarding"
  ON onboarding_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own onboarding"
  ON onboarding_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own onboarding"
  ON onboarding_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- ==========================================
-- USER GOALS
-- ==========================================
CREATE TABLE user_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own goals"
  ON user_goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals"
  ON user_goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals"
  ON user_goals FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_user_goals_user_id ON user_goals(user_id);

-- ==========================================
-- USER PREFERENCES
-- ==========================================
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  remote BOOLEAN DEFAULT FALSE,
  hybrid BOOLEAN DEFAULT FALSE,
  onsite BOOLEAN DEFAULT FALSE,
  full_time BOOLEAN DEFAULT TRUE,
  part_time BOOLEAN DEFAULT FALSE,
  contract BOOLEAN DEFAULT FALSE,
  travel_tolerance INTEGER,
  priorities JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- ==========================================
-- PREFERRED LOCATIONS
-- ==========================================
CREATE TABLE preferred_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  location TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE preferred_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferred locations"
  ON preferred_locations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferred locations"
  ON preferred_locations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own preferred locations"
  ON preferred_locations FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_preferred_locations_user_id ON preferred_locations(user_id);

-- ==========================================
-- TARGET ROLES
-- ==========================================
CREATE TABLE target_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE target_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own target roles"
  ON target_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own target roles"
  ON target_roles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own target roles"
  ON target_roles FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_target_roles_user_id ON target_roles(user_id);

-- ==========================================
-- SKILLS (shared reference data)
-- ==========================================
CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Skills are publicly readable but only insertable by system
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view skills"
  ON skills FOR SELECT
  TO authenticated
  USING (TRUE);

-- ==========================================
-- USER SKILLS
-- ==========================================
CREATE TABLE user_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL, -- Denormalized for flexibility
  proficiency TEXT CHECK (proficiency IN ('learning', 'comfortable', 'strong', 'expert')),
  years INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, skill_name)
);

ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own skills"
  ON user_skills FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own skills"
  ON user_skills FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own skills"
  ON user_skills FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own skills"
  ON user_skills FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_user_skills_user_id ON user_skills(user_id);

-- ==========================================
-- WORK EXPERIENCES
-- ==========================================
CREATE TABLE work_experiences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  start_date TEXT,
  end_date TEXT,
  current BOOLEAN DEFAULT FALSE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE work_experiences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own experiences"
  ON work_experiences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own experiences"
  ON work_experiences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own experiences"
  ON work_experiences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own experiences"
  ON work_experiences FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_work_experiences_user_id ON work_experiences(user_id);

-- ==========================================
-- COMPANIES (shared reference data)
-- ==========================================
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  website TEXT,
  industry TEXT,
  size TEXT,
  locations TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view companies"
  ON companies FOR SELECT
  TO authenticated
  USING (TRUE);

-- ==========================================
-- JOBS (shared data, publicly readable)
-- ==========================================
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT[],
  responsibilities TEXT[],
  benefits TEXT[],
  location TEXT,
  work_arrangement TEXT CHECK (work_arrangement IN ('remote', 'hybrid', 'onsite')),
  employment_type TEXT CHECK (employment_type IN ('full_time', 'part_time', 'contract', 'temporary')),
  experience_level TEXT,
  salary_min INTEGER,
  salary_max INTEGER,
  salary_period TEXT CHECK (salary_period IN ('hourly', 'yearly')),
  salary_is_estimated BOOLEAN DEFAULT FALSE,
  posted_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  external_url TEXT,
  external_provider TEXT,
  external_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view jobs"
  ON jobs FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE INDEX idx_jobs_company_id ON jobs(company_id);
CREATE INDEX idx_jobs_work_arrangement ON jobs(work_arrangement);
CREATE INDEX idx_jobs_posted_date ON jobs(posted_date DESC);

-- ==========================================
-- SAVED JOBS
-- ==========================================
CREATE TABLE saved_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, job_id)
);

ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved jobs"
  ON saved_jobs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved jobs"
  ON saved_jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved jobs"
  ON saved_jobs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved jobs"
  ON saved_jobs FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_saved_jobs_user_id ON saved_jobs(user_id);
CREATE INDEX idx_saved_jobs_created_at ON saved_jobs(created_at DESC);

-- ==========================================
-- PASSED JOBS
-- ==========================================
CREATE TABLE passed_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, job_id)
);

ALTER TABLE passed_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own passed jobs"
  ON passed_jobs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own passed jobs"
  ON passed_jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own passed jobs"
  ON passed_jobs FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_passed_jobs_user_id ON passed_jobs(user_id);

-- ==========================================
-- APPLICATIONS
-- ==========================================
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  stage TEXT NOT NULL CHECK (stage IN (
    'saved', 'preparing', 'applied', 'recruiter_screen',
    'interview', 'final_interview', 'offer', 'accepted',
    'rejected', 'withdrawn'
  )),
  applied_date TIMESTAMP WITH TIME ZONE,
  source TEXT,
  salary_offered INTEGER,
  recruiter_name TEXT,
  recruiter_email TEXT,
  next_action TEXT,
  next_action_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, job_id)
);

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own applications"
  ON applications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own applications"
  ON applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own applications"
  ON applications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own applications"
  ON applications FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_applications_user_id ON applications(user_id);
CREATE INDEX idx_applications_stage ON applications(stage);
CREATE INDEX idx_applications_created_at ON applications(created_at DESC);

-- ==========================================
-- APPLICATION EVENTS
-- ==========================================
CREATE TABLE application_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  from_stage TEXT,
  to_stage TEXT,
  description TEXT,
  event_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE application_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own application events"
  ON application_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own application events"
  ON application_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_application_events_application_id ON application_events(application_id);
CREATE INDEX idx_application_events_created_at ON application_events(created_at DESC);

-- ==========================================
-- APPLICATION NOTES
-- ==========================================
CREATE TABLE application_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE application_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own application notes"
  ON application_notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own application notes"
  ON application_notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own application notes"
  ON application_notes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own application notes"
  ON application_notes FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_application_notes_application_id ON application_notes(application_id);

-- ==========================================
-- UPDATED_AT TRIGGERS
-- ==========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_onboarding_progress_updated_at
  BEFORE UPDATE ON onboarding_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_work_experiences_updated_at
  BEFORE UPDATE ON work_experiences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_application_notes_updated_at
  BEFORE UPDATE ON application_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
