// Core domain types for NextUp

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// User Profile
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  headline?: string;
  location?: string;
  current_role?: string;
  years_experience?: number;
  about?: string;
  profile_strength: number;
  created_at: string;
  updated_at: string;
}

// Skills
export type SkillProficiency = "learning" | "comfortable" | "strong" | "expert";

export interface Skill {
  id: string;
  name: string;
  category?: string;
}

export interface UserSkill {
  id: string;
  user_id: string;
  skill_id: string;
  skill: Skill;
  proficiency: SkillProficiency;
  years?: number;
}

// Work Experience
export interface WorkExperience {
  id: string;
  user_id: string;
  company: string;
  title: string;
  location?: string;
  start_date: string;
  end_date?: string;
  current: boolean;
  description?: string;
  achievements?: string[];
}

// Education
export interface Education {
  id: string;
  user_id: string;
  institution: string;
  degree?: string;
  field?: string;
  start_date?: string;
  end_date?: string;
  current: boolean;
}

// Certifications
export interface Certification {
  id: string;
  user_id: string;
  name: string;
  issuer: string;
  issue_date?: string;
  expiry_date?: string;
  credential_id?: string;
  credential_url?: string;
}

// User Preferences
export interface UserPreferences {
  id: string;
  user_id: string;
  salary_min?: number;
  salary_max?: number;
  salary_ideal?: number;
  remote: boolean;
  hybrid: boolean;
  onsite: boolean;
  willing_to_relocate: boolean;
  preferred_locations?: string[];
  max_commute_minutes?: number;
  full_time: boolean;
  part_time: boolean;
  contract: boolean;
  travel_tolerance?: number;
  priorities: {
    salary: number;
    work_life_balance: number;
    career_growth: number;
    location: number;
    remote_flexibility: number;
    culture: number;
    stability: number;
    benefits: number;
    mission: number;
    learning: number;
  };
}

// Company
export interface Company {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  website?: string;
  industry?: string;
  size?: string;
  locations?: string[];
  created_at: string;
  updated_at: string;
}

// Job
export type WorkArrangement = "remote" | "hybrid" | "onsite";
export type EmploymentType = "full_time" | "part_time" | "contract" | "temporary";
export type ExperienceLevel = "entry" | "mid" | "senior" | "lead" | "executive";

export interface Job {
  id: string;
  company_id: string;
  company: Company;
  title: string;
  description: string;
  requirements?: string[];
  responsibilities?: string[];
  benefits?: string[];
  location?: string;
  work_arrangement: WorkArrangement;
  employment_type: EmploymentType;
  experience_level?: ExperienceLevel;
  salary_min?: number;
  salary_max?: number;
  salary_period?: "hourly" | "yearly";
  salary_is_estimated: boolean;
  posted_date: string;
  external_url?: string;
  external_provider?: string;
  external_id?: string;
  created_at: string;
  updated_at: string;
}

// Job Match
export interface JobMatch {
  id: string;
  user_id: string;
  job_id: string;
  job: Job;
  overall_score: number;
  qualification_score: number;
  lifestyle_score: number;
  breakdown: {
    skills: number;
    experience: number;
    salary: number;
    location: number;
    work_arrangement: number;
    career_goals: number;
  };
  matched_skills: string[];
  missing_skills: string[];
  reasons_fit: string[];
  reasons_concern: string[];
  created_at: string;
}

// Saved Jobs
export interface SavedJob {
  id: string;
  user_id: string;
  job_id: string;
  job: Job;
  notes?: string;
  created_at: string;
}

// Application
export type ApplicationStage =
  | "saved"
  | "preparing"
  | "applied"
  | "recruiter_screen"
  | "interview"
  | "final_interview"
  | "offer"
  | "accepted"
  | "rejected"
  | "withdrawn";

export interface Application {
  id: string;
  user_id: string;
  job_id: string;
  job: Job;
  stage: ApplicationStage;
  applied_date?: string;
  source?: string;
  salary_offered?: number;
  recruiter_name?: string;
  recruiter_email?: string;
  next_action?: string;
  next_action_date?: string;
  notes?: string;
  resume_version_id?: string;
  cover_letter?: string;
  created_at: string;
  updated_at: string;
}

// Application Events
export interface ApplicationEvent {
  id: string;
  application_id: string;
  event_type: string;
  from_stage?: ApplicationStage;
  to_stage?: ApplicationStage;
  event_date: string;
  description?: string;
  created_at: string;
}

// Resume
export interface Resume {
  id: string;
  user_id: string;
  name: string;
  is_primary: boolean;
  file_url?: string;
  parsed_data?: Json;
  created_at: string;
  updated_at: string;
}

// Daily Missions
export interface DailyMission {
  id: string;
  user_id: string;
  date: string;
  missions: {
    review_jobs: { target: number; completed: number };
    save_jobs: { target: number; completed: number };
    apply_jobs: { target: number; completed: number };
    career_activity: { target: number; completed: number };
  };
  completed: boolean;
  created_at: string;
  updated_at: string;
}

// Streaks
export interface Streak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string;
  created_at: string;
  updated_at: string;
}

// AI Conversation
export interface AIConversation {
  id: string;
  user_id: string;
  title?: string;
  context_type?: "general" | "job" | "resume" | "interview";
  context_id?: string;
  created_at: string;
  updated_at: string;
}

export interface AIMessage {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

// Onboarding
export interface OnboardingProgress {
  id: string;
  user_id: string;
  current_step: number;
  total_steps: number;
  data: Json;
  completed: boolean;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

// Career Paths
export interface CareerPath {
  id: string;
  from_role: string;
  to_role: string;
  difficulty: number;
  common_skills: string[];
  required_skills: string[];
  estimated_time_months?: number;
  salary_change_percent?: number;
}
