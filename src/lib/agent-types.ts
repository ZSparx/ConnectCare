// Shared types for the global agent pool system.
// These mirror the database schema and are used across the frontend.

export type Country = {
  id: string;
  name: string;
  iso_code: string;
  application_status: 'accepting' | 'review_required' | 'temp_closed' | 'not_available';
  notes: string;
  created_at: string;
  updated_at: string;
};

export type AgentApplication = {
  id: string;
  agent_id: string;
  status: string;
  referral_source: string;
  legally_authorized: 'yes' | 'no' | 'not_sure' | '';
  requires_review: boolean;
  experience_summary: string;
  profile_completion: number;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
};

export type AgentLocation = {
  id: string;
  agent_id: string;
  country_name: string;
  country_code: string;
  region: string;
  city: string;
  time_zone: string;
  work_location_type: 'home' | 'other_remote';
  currently_located_here: boolean;
  location_clarification: string;
};

export type AgentExperience = {
  id: string;
  agent_id: string;
  years_customer_service: number;
  years_bpo: number;
  years_remote: number;
  previous_employers: string;
  has_customer_service: boolean;
  has_sales: boolean;
  has_technical_support: boolean;
  has_billing: boolean;
  has_collections: boolean;
  has_chat_support: boolean;
  has_email_support: boolean;
  has_admin_support: boolean;
  summary: string;
};

export type AgentSkill = {
  id: string;
  agent_id: string;
  skill: string;
};

export type AgentLanguage = {
  id: string;
  agent_id: string;
  language: string;
  proficiency: 'basic' | 'intermediate' | 'advanced' | 'fluent';
  is_primary_local: boolean;
};

export type AgentEquipment = {
  id: string;
  agent_id: string;
  has_computer: boolean;
  computer_manufacturer: string;
  computer_model: string;
  os: string;
  processor: string;
  ram: string;
  has_headset: boolean;
  headset_model: string;
  has_webcam: boolean;
  dedicated_workspace: boolean;
  quiet_workspace: boolean;
  private_workspace: boolean;
  has_backup_power: boolean;
  backup_power_description: string;
};

export type AgentInternet = {
  id: string;
  agent_id: string;
  primary_provider: string;
  connection_type: string;
  download_speed: string;
  upload_speed: string;
  backup_provider: string;
  has_backup_internet: boolean;
  speed_test_url: string;
};

export type AgentAvailability = {
  id: string;
  agent_id: string;
  availability_type: 'full_time' | 'part_time' | 'flexible';
  hours_per_week: number;
  days_available: string[];
  preferred_shift: string;
  earliest_start_date: string | null;
  current_employment_status: string;
  workable_time_zones: string[];
  custom_time_zone: string;
};

export type AgentDocument = {
  id: string;
  agent_id: string;
  category: 'identity' | 'work_authorization' | 'equipment' | 'internet' | 'training' | 'other';
  file_path: string;
  file_name: string;
  uploaded_at: string;
};

export type AgentMessage = {
  id: string;
  agent_id: string;
  sender_id: string;
  body: string;
  read: boolean;
  created_at: string;
};

export type RecruiterNote = {
  id: string;
  agent_id: string;
  recruiter_id: string;
  note: string;
  created_at: string;
};

export type Opportunity = {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'closed' | 'paused';
  created_at: string;
  updated_at: string;
};

export type OpportunityRequirement = {
  id: string;
  opportunity_id: string;
  requirement_type: string;
  requirement_value: string;
};

export type ApplicationStatusConfig = {
  id: string;
  status: string;
  label: string;
  is_active: boolean;
  sort_order: number;
};

export type AgentPoolRow = {
  profile: {
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
    created_at: string;
  };
  application: AgentApplication | null;
  location: AgentLocation | null;
  experience: AgentExperience | null;
  skills: AgentSkill[];
  languages: AgentLanguage[];
  availability: AgentAvailability | null;
  equipment: AgentEquipment | null;
};
