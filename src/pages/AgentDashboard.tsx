import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  Building2,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  RefreshCw,
  Tag,
  FileText,
  MapPin,
  Star,
  Monitor,
  Languages,
  Briefcase,
  MessageSquare,
  Send,
} from 'lucide-react';
import { AgentAssignment, Profile } from '../lib/supabase';
import type {
  AgentApplication,
  AgentLocation,
  AgentExperience,
  AgentSkill,
  AgentLanguage,
  AgentEquipment,
  AgentAvailability,
  AgentMessage,
} from '../lib/agent-types';
import { getStatusLabel, getStatusColor } from '../lib/countries';

const PRIORITY_CONFIG = {
  critical: { label: 'Critical', color: 'text-red-400 bg-red-500/10 border-red-500/20' },
  high: { label: 'High', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
  medium: { label: 'Medium', color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' },
  low: { label: 'Low', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
};

const STATUS_OPTIONS: Profile['status'][] = ['available', 'busy', 'offline'];
const STATUS_CONFIG = {
  available: { label: 'Available', color: 'bg-emerald-500', icon: CheckCircle2 },
  busy: { label: 'Busy', color: 'bg-orange-500', icon: Phone },
  offline: { label: 'Offline', color: 'bg-slate-500', icon: Clock },
};

type Props = {
  onStartApplication: () => void;
};

export default function AgentDashboard({ onStartApplication }: Props) {
  const { profile, refreshProfile, signOut } = useAuth();
  const [assignments, setAssignments] = useState<AgentAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);
  const [application, setApplication] = useState<AgentApplication | null>(null);
  const [location, setLocation] = useState<AgentLocation | null>(null);
  const [experience, setExperience] = useState<AgentExperience | null>(null);
  const [skills, setSkills] = useState<AgentSkill[]>([]);
  const [languages, setLanguages] = useState<AgentLanguage[]>([]);
  const [equipment, setEquipment] = useState<AgentEquipment | null>(null);
  const [availability, setAvailability] = useState<AgentAvailability | null>(null);
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    if (profile) {
      fetchAll();
      fetchAssignments();
    }
  }, [profile]);

  async function fetchAll() {
    if (!profile) return;
    const [appRes, locRes, expRes, skillsRes, langRes, equipRes, availRes, msgRes] = await Promise.all([
      supabase.from('agent_applications').select('*').eq('agent_id', profile.id).maybeSingle(),
      supabase.from('agent_locations').select('*').eq('agent_id', profile.id).maybeSingle(),
      supabase.from('agent_experience').select('*').eq('agent_id', profile.id).maybeSingle(),
      supabase.from('agent_skills').select('*').eq('agent_id', profile.id),
      supabase.from('agent_languages').select('*').eq('agent_id', profile.id),
      supabase.from('agent_equipment').select('*').eq('agent_id', profile.id).maybeSingle(),
      supabase.from('agent_availability').select('*').eq('agent_id', profile.id).maybeSingle(),
      supabase.from('agent_messages').select('*').eq('agent_id', profile.id).order('created_at', { ascending: false }),
    ]);
    setApplication(appRes.data as AgentApplication | null);
    setLocation(locRes.data as AgentLocation | null);
    setExperience(expRes.data as AgentExperience | null);
    setSkills(skillsRes.data ?? []);
    setLanguages(langRes.data ?? []);
    setEquipment(equipRes.data as AgentEquipment | null);
    setAvailability(availRes.data as AgentAvailability | null);
    setMessages(msgRes.data ?? []);
  }

  async function fetchAssignments() {
    if (!profile) return;
    setLoading(true);
    const { data } = await supabase
      .from('agent_assignments')
      .select('*, companies(*)')
      .eq('agent_id', profile.id)
      .order('assigned_at', { ascending: false });
    setAssignments(data ?? []);
    setLoading(false);
  }

  async function updateStatus(newStatus: Profile['status']) {
    if (!profile) return;
    setStatusLoading(true);
    await supabase.from('profiles').update({ status: newStatus }).eq('id', profile.id);
    await refreshProfile();
    setStatusLoading(false);
  }

  async function sendMessage() {
    if (!profile || !newMessage.trim()) return;
    setSendingMessage(true);
    await supabase.from('agent_messages').insert({
      agent_id: profile.id,
      sender_id: profile.id,
      body: newMessage.trim(),
    });
    setNewMessage('');
    await fetchAll();
    setSendingMessage(false);
  }

  const currentStatus = profile?.status ?? 'offline';
  const hasApplication = !!application;
  const completion = application?.profile_completion ?? 0;

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Welcome banner */}
        <div className="bg-gradient-to-r from-sky-600/20 to-slate-800/40 border border-sky-500/20 rounded-2xl p-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-sky-400 text-sm font-medium mb-0.5">Agent Portal</p>
            <h2 className="text-2xl font-bold text-white">
              {profile?.full_name ? `Hello, ${profile.full_name.split(' ')[0]}` : 'Hello'}
            </h2>
            <p className="text-slate-400 text-sm mt-0.5">
              {hasApplication ? 'Your application is on file' : 'Complete your application to join our agent pool'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-800/80 border border-white/10 rounded-xl px-4 py-2.5">
              {statusLoading ? (
                <Loader2 size={14} className="animate-spin text-slate-400" />
              ) : (
                <span className={`w-2 h-2 rounded-full ${STATUS_CONFIG[currentStatus].color}`} />
              )}
              <select
                value={currentStatus}
                onChange={(e) => updateStatus(e.target.value as Profile['status'])}
                disabled={statusLoading}
                className="bg-transparent text-white text-sm font-medium focus:outline-none cursor-pointer appearance-none pr-1"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s} className="bg-slate-800">{STATUS_CONFIG[s].label}</option>
                ))}
              </select>
            </div>
            <button onClick={() => { fetchAll(); fetchAssignments(); }} className="p-2.5 bg-slate-800/80 border border-white/10 rounded-xl text-slate-400 hover:text-white transition-colors">
              <RefreshCw size={16} />
            </button>
            <button onClick={signOut} className="px-4 py-2.5 bg-slate-800/80 border border-white/10 rounded-xl text-slate-400 hover:text-white text-sm font-medium transition-colors">
              Sign Out
            </button>
          </div>
        </div>

        {/* Application status section */}
        {!hasApplication ? (
          <div className="bg-slate-900/60 border border-white/8 rounded-2xl p-8 text-center mb-8">
            <FileText size={40} className="text-sky-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">No application on file</h3>
            <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">
              Submit your application to join our global virtual call-center agent pool and be considered for potential opportunities.
            </p>
            <button
              onClick={onStartApplication}
              className="inline-flex items-center gap-2 px-6 py-3 bg-sky-500 hover:bg-sky-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-sky-500/25"
            >
              <FileText size={18} /> Apply to Become an Agent
            </button>
          </div>
        ) : (
          <div className="space-y-6 mb-8">
            {/* Application progress */}
            <div className="bg-slate-900/60 border border-white/8 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <FileText size={18} className="text-sky-400" />
                  Application Progress
                </h3>
                <span className={`text-xs px-2.5 py-1 rounded-lg border ${getStatusColor(application.status)}`}>
                  {getStatusLabel(application.status)}
                </span>
              </div>
              {/* Progress bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                  <span>Profile Completion</span>
                  <span>{completion}%</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-sky-500 to-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${completion}%` }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <InfoChip label="Application ID" value={application.id.slice(0, 8).toUpperCase()} />
                <InfoChip label="Submitted" value={application.submitted_at ? new Date(application.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'} />
                <InfoChip label="Review Flag" value={application.requires_review ? 'Flagged' : 'Clear'} />
                <InfoChip label="Authorization" value={application.legally_authorized === 'yes' ? 'Yes' : application.legally_authorized === 'no' ? 'No' : 'Not sure'} />
              </div>
            </div>

            {/* Profile details grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              {location && (
                <DetailCard icon={MapPin} title="Location">
                  <p className="text-slate-300 text-sm">{location.country_name} ({location.country_code})</p>
                  <p className="text-slate-500 text-xs">{[location.region, location.city].filter(Boolean).join(', ')}</p>
                  <p className="text-slate-500 text-xs">{location.time_zone}</p>
                </DetailCard>
              )}
              {experience && (
                <DetailCard icon={Briefcase} title="Experience">
                  <p className="text-slate-300 text-sm">{experience.years_customer_service}y CS · {experience.years_bpo}y BPO · {experience.years_remote}y remote</p>
                  {experience.summary && <p className="text-slate-500 text-xs mt-1 line-clamp-2">{experience.summary}</p>}
                </DetailCard>
              )}
              {skills.length > 0 && (
                <DetailCard icon={Star} title="Skills">
                  <div className="flex flex-wrap gap-1.5">
                    {skills.map((s) => (
                      <span key={s.id} className="text-xs px-2 py-0.5 bg-sky-500/10 border border-sky-500/20 rounded-md text-sky-300">{s.skill}</span>
                    ))}
                  </div>
                </DetailCard>
              )}
              {languages.length > 0 && (
                <DetailCard icon={Languages} title="Languages">
                  {languages.map((l) => (
                    <p key={l.id} className="text-slate-300 text-sm">{l.language} <span className="text-slate-500 text-xs">({l.proficiency})</span></p>
                  ))}
                </DetailCard>
              )}
              {equipment && (
                <DetailCard icon={Monitor} title="Equipment">
                  <p className="text-slate-300 text-sm">
                    {equipment.has_computer ? 'Computer' : ''} {equipment.has_headset ? '· Headset' : ''} {equipment.has_webcam ? '· Webcam' : ''}
                  </p>
                  <p className="text-slate-500 text-xs">
                    {equipment.dedicated_workspace ? 'Dedicated workspace' : ''} {equipment.quiet_workspace ? '· Quiet' : ''} {equipment.private_workspace ? '· Private' : ''}
                  </p>
                </DetailCard>
              )}
              {availability && (
                <DetailCard icon={Clock} title="Availability">
                  <p className="text-slate-300 text-sm capitalize">{availability.availability_type.replace('_', '-')} · {availability.hours_per_week}+ hrs/week</p>
                  {availability.workable_time_zones.length > 0 && (
                    <p className="text-slate-500 text-xs">{availability.workable_time_zones.join(', ')}</p>
                  )}
                </DetailCard>
              )}
            </div>

            {/* Messages */}
            <div className="bg-slate-900/60 border border-white/8 rounded-2xl p-6">
              <h3 className="text-base font-semibold text-white flex items-center gap-2 mb-4">
                <MessageSquare size={18} className="text-sky-400" />
                Recruiter Messages
              </h3>
              {messages.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-6">No messages yet. Your recruiter will reach out here.</p>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {messages.map((m) => (
                    <div key={m.id} className={`flex ${m.sender_id === profile?.id ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] rounded-xl px-4 py-2.5 text-sm ${
                        m.sender_id === profile?.id
                          ? 'bg-sky-500/15 text-slate-200'
                          : 'bg-slate-800 text-slate-300'
                      }`}>
                        <p>{m.body}</p>
                        <p className="text-slate-600 text-xs mt-1">{new Date(m.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2 mt-4">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message to your recruiter..."
                  className="flex-1 bg-slate-800 border border-white/10 text-white placeholder-slate-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || sendingMessage}
                  className="px-4 py-2.5 bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-white rounded-xl transition-all"
                >
                  {sendingMessage ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Assignments */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Building2 size={20} className="text-sky-400" />
            Your Company Assignments
          </h3>
          {loading ? (
            <div className="flex items-center justify-center py-20"><Loader2 size={28} className="animate-spin text-sky-500" /></div>
          ) : assignments.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/50 border border-white/5 rounded-2xl">
              <AlertCircle size={36} className="text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 font-medium text-sm">No assignments yet</p>
              <p className="text-slate-600 text-xs mt-1">Assignments appear here when you are matched with a client opportunity.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {assignments.map((a) => {
                const company = a.companies!;
                const pCfg = PRIORITY_CONFIG[company.priority];
                return (
                  <div key={a.id} className="bg-slate-900/60 border border-white/8 rounded-2xl p-5 hover:border-sky-500/30 transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-sky-500/10 border border-sky-500/20 rounded-xl flex items-center justify-center">
                          <Building2 size={18} className="text-sky-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-white text-sm">{company.name}</h4>
                          <p className="text-slate-500 text-xs">{company.industry}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-lg border ${pCfg.color} flex items-center gap-1`}>
                        <Tag size={10} /> {pCfg.label}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Phone size={13} className="text-slate-600" /><span className="text-slate-300">{company.contact_name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Mail size={13} className="text-slate-600" /><span className="truncate">{company.contact_email}</span>
                      </div>
                    </div>
                    {a.notes && <div className="mt-3 pt-3 border-t border-white/5"><p className="text-xs text-slate-500 italic">{a.notes}</p></div>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-800/50 rounded-lg px-3 py-2">
      <p className="text-slate-600 text-xs mb-0.5">{label}</p>
      <p className="text-slate-300 text-sm font-medium truncate">{value}</p>
    </div>
  );
}

function DetailCard({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-slate-900/60 border border-white/8 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={16} className="text-sky-400" />
        <h4 className="text-white font-semibold text-sm">{title}</h4>
      </div>
      {children}
    </div>
  );
}
