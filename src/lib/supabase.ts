import { createClient } from '@supabase/supabase-js';

const env = import.meta.env as Record<string, string | undefined>;
const supabaseUrl = env.VITE_SUPABASE_URL ?? env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey =
  env.VITE_SUPABASE_ANON_KEY ??
  env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Vite previews can start before the connected integration variables are exposed.
// Keep module initialization safe so the app can render its configuration state.
const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);
const configuredUrl = supabaseUrl ?? 'https://placeholder.supabase.co';
const configuredAnonKey = supabaseAnonKey ?? 'placeholder-anon-key';

export const supabase = createClient(configuredUrl, configuredAnonKey);

export function isSupabaseConfigured() {
  return hasSupabaseConfig;
}

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
