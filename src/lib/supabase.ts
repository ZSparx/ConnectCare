import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  full_name: string;
  role: 'agent' | 'admin';
  status: 'available' | 'busy' | 'offline';
  phone: string | null;
  email: string | null;
  created_at: string;
};

export type Company = {
  id: string;
  name: string;
  industry: string;
  contact_name: string;
  contact_email: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  active: boolean;
  created_at: string;
};

export type AgentAssignment = {
  id: string;
  agent_id: string;
  company_id: string;
  notes: string;
  assigned_at: string;
  companies?: Company;
  profiles?: Profile;
};

export type ClientInquiry = {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  service_interest: string;
  message: string;
  status: 'new' | 'contacted';
  created_at: string;
};
