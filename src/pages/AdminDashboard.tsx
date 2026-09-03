import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  Users,
  Plus,
  X,
  ChevronDown,
  Loader2,
  RefreshCw,
  LayoutDashboard,
  Building2,
  Globe2,
  Search,
  MessageSquare,
  Send,
  StickyNote,
  Trash2,
  ArrowUpDown,
  CheckCircle2,
  UserCheck,
  Shield,
  Briefcase,
  Tag,
  Phone,
  Clock,
  Mail,
} from 'lucide-react';
import { Profile, Company, AgentAssignment, ClientInquiry } from '../lib/supabase';
import type {
  AgentApplication,
  AgentLocation,
  AgentExperience,
  AgentSkill,
  AgentLanguage,
  AgentAvailability,
  AgentEquipment,
  AgentMessage,
  RecruiterNote,
  Country,
  ApplicationStatusConfig,
} from '../lib/agent-types';
import { getStatusLabel, getStatusColor, COUNTRY_STATUS_CONFIG } from '../lib/countries';

const PRIORITY_CONFIG = {
  critical: { label: 'Critical', color: 'text-red-400 bg-red-500/10 border-red-500/20' },
  high: { label: 'High', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
  medium: { label: 'Medium', color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' },
  low: { label: 'Low', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
};

const STATUS_CONFIG = {
  available: { label: 'Available', dot: 'bg-emerald-500' },
  busy: { label: 'Busy', dot: 'bg-orange-500' },
  offline: { label: 'Offline', dot: 'bg-slate-500' },
};

type Tab = 'overview' | 'agents' | 'pool' | 'companies' | 'countries' | 'opportunities' | 'statuses' | 'inquiries';

type AgentDetail = {
  profile: Profile;
  application: AgentApplication | null;
  location: AgentLocation | null;
  experience: AgentExperience | null;
  skills: AgentSkill[];
  languages: AgentLanguage[];
  availability: AgentAvailability | null;
  equipment: AgentEquipment | null;
};

type SortField = 'name' | 'country' | 'city' | 'status' | 'date';

export default function AdminDashboard() {
  const { signOut } = useAuth();
  const [tab, setTab] = useState<Tab>('overview');
  const [agents, setAgents] = useState<Profile[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [assignments, setAssignments] = useState<AgentAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignModal, setAssignModal] = useState<{ agent: Profile; existingIds: string[] } | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [assignNote, setAssignNote] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [addCompanyLoading, setAddCompanyLoading] = useState(false);
  const [addCompanyForm, setAddCompanyForm] = useState({ name: '', industry: '', contact_name: '', contact_email: '', priority: 'medium' });
  const [formError, setFormError] = useState('');

  // Agent pool state
  const [poolData, setPoolData] = useState<AgentDetail[]>([]);
  const [poolLoading, setPoolLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCountry, setFilterCountry] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSkill, setFilterSkill] = useState('');
  const [filterLanguage, setFilterLanguage] = useState('');
  const [filterTz, setFilterTz] = useState('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AgentDetail | null>(null);
  const [countries, setCountries] = useState<Country[]>([]);
  const [statusConfig, setStatusConfig] = useState<ApplicationStatusConfig[]>([]);

  // Country management
  const [showAddCountry, setShowAddCountry] = useState(false);
  const [countryForm, setCountryForm] = useState({ name: '', iso_code: '', application_status: 'accepting', notes: '' });
  const [countryLoading, setCountryLoading] = useState(false);

  // Opportunities
  const [opportunities, setOpportunities] = useState<{ id: string; title: string; description: string; status: string }[]>([]);
  const [showAddOpp, setShowAddOpp] = useState(false);
  const [oppForm, setOppForm] = useState({ title: '', description: '' });
  const [oppLoading, setOppLoading] = useState(false);

  // Client inquiries
  const [inquiries, setInquiries] = useState<ClientInquiry[]>([]);
  const [inquiriesLoading, setInquiriesLoading] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<ClientInquiry | null>(null);

  // Messages and notes
  const [newMessage, setNewMessage] = useState('');
  const [newNote, setNewNote] = useState('');
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [notes, setNotes] = useState<RecruiterNote[]>([]);

  useEffect(() => { fetchAll(); fetchCountries(); fetchStatusConfig(); fetchOpportunities(); fetchInquiries(); }, []);

  async function fetchAll() {
    setLoading(true);
    const [agentsRes, companiesRes, assignmentsRes] = await Promise.all([
      supabase.from('profiles').select('*').order('full_name'),
      supabase.from('companies').select('*').order('name'),
      supabase.from('agent_assignments').select('*, profiles(*), companies(*)'),
    ]);
    setAgents(agentsRes.data ?? []);
    setCompanies(companiesRes.data ?? []);
    setAssignments(assignmentsRes.data ?? []);
    setLoading(false);
  }

  async function fetchCountries() {
    const { data } = await supabase.from('countries').select('*').order('name');
    setCountries(data ?? []);
  }

  async function fetchStatusConfig() {
    const { data } = await supabase.from('application_status_config').select('*').order('sort_order');
    setStatusConfig(data ?? []);
  }

  async function fetchOpportunities() {
    const { data } = await supabase.from('opportunities').select('*').order('created_at', { ascending: false });
    setOpportunities(data ?? []);
  }

  async function fetchInquiries() {
    setInquiriesLoading(true);
    const { data } = await supabase.from('client_inquiries').select('*').order('created_at', { ascending: false });
    setInquiries(data ?? []);
    setInquiriesLoading(false);
  }

  async function updateInquiryStatus(inquiryId: string, newStatus: string) {
    await supabase.from('client_inquiries').update({ status: newStatus }).eq('id', inquiryId);
    await fetchInquiries();
    if (selectedInquiry && selectedInquiry.id === inquiryId) {
      setSelectedInquiry({ ...selectedInquiry, status: newStatus as 'new' | 'contacted' });
    }
  }

  async function fetchPool() {
    setPoolLoading(true);
    const agentProfiles = agents.filter((a) => a.role !== 'admin');
    const details: AgentDetail[] = [];
    for (const agent of agentProfiles) {
      const [appRes, locRes, expRes, skillsRes, langRes, availRes, equipRes] = await Promise.all([
        supabase.from('agent_applications').select('*').eq('agent_id', agent.id).maybeSingle(),
        supabase.from('agent_locations').select('*').eq('agent_id', agent.id).maybeSingle(),
        supabase.from('agent_experience').select('*').eq('agent_id', agent.id).maybeSingle(),
        supabase.from('agent_skills').select('*').eq('agent_id', agent.id),
        supabase.from('agent_languages').select('*').eq('agent_id', agent.id),
        supabase.from('agent_availability').select('*').eq('agent_id', agent.id).maybeSingle(),
        supabase.from('agent_equipment').select('*').eq('agent_id', agent.id).maybeSingle(),
      ]);
      details.push({
        profile: agent,
        application: appRes.data as AgentApplication | null,
        location: locRes.data as AgentLocation | null,
        experience: expRes.data as AgentExperience | null,
        skills: skillsRes.data ?? [],
        languages: langRes.data ?? [],
        availability: availRes.data as AgentAvailability | null,
        equipment: equipRes.data as AgentEquipment | null,
      });
    }
    setPoolData(details);
    setPoolLoading(false);
  }

  useEffect(() => {
    if (tab === 'pool' && poolData.length === 0 && !poolLoading && agents.length > 0) {
      fetchPool();
    }
  }, [tab, poolData.length, poolLoading, agents.length]);

  async function openAgentDetail(agent: AgentDetail) {
    setSelectedAgent(agent);
    const [msgRes, noteRes] = await Promise.all([
      supabase.from('agent_messages').select('*').eq('agent_id', agent.profile.id).order('created_at', { ascending: false }),
      supabase.from('recruiter_notes').select('*').eq('agent_id', agent.profile.id).order('created_at', { ascending: false }),
    ]);
    setMessages(msgRes.data ?? []);
    setNotes(noteRes.data ?? []);
  }

  async function sendMessage() {
    if (!selectedAgent || !newMessage.trim()) return;
    await supabase.from('agent_messages').insert({
      agent_id: selectedAgent.profile.id,
      sender_id: selectedAgent.profile.id,
      body: newMessage.trim(),
    });
    setNewMessage('');
    const { data } = await supabase.from('agent_messages').select('*').eq('agent_id', selectedAgent.profile.id).order('created_at', { ascending: false });
    setMessages(data ?? []);
  }

  async function addNote() {
    if (!selectedAgent || !newNote.trim()) return;
    await supabase.from('recruiter_notes').insert({
      agent_id: selectedAgent.profile.id,
      recruiter_id: selectedAgent.profile.id,
      note: newNote.trim(),
    });
    setNewNote('');
    const { data } = await supabase.from('recruiter_notes').select('*').eq('agent_id', selectedAgent.profile.id).order('created_at', { ascending: false });
    setNotes(data ?? []);
  }

  async function updateApplicationStatus(newStatus: string) {
    if (!selectedAgent?.application) return;
    await supabase.from('agent_applications').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('agent_id', selectedAgent.profile.id);
    await supabase.from('agent_status_history').insert({
      agent_id: selectedAgent.profile.id,
      status: newStatus,
      changed_by: selectedAgent.profile.id,
      note: 'Status updated by admin',
    });
    setSelectedAgent({ ...selectedAgent, application: { ...selectedAgent.application, status: newStatus } });
  }

  async function submitCountry(e: React.FormEvent) {
    e.preventDefault();
    setCountryLoading(true);
    await supabase.from('countries').insert({
      name: countryForm.name,
      iso_code: countryForm.iso_code.toUpperCase(),
      application_status: countryForm.application_status,
      notes: countryForm.notes,
    });
    setCountryForm({ name: '', iso_code: '', application_status: 'accepting', notes: '' });
    setShowAddCountry(false);
    await fetchCountries();
    setCountryLoading(false);
  }

  async function updateCountryStatus(countryId: string, newStatus: string) {
    await supabase.from('countries').update({ application_status: newStatus, updated_at: new Date().toISOString() }).eq('id', countryId);
    await fetchCountries();
  }

  async function deleteCountry(countryId: string) {
    await supabase.from('countries').delete().eq('id', countryId);
    await fetchCountries();
  }

  async function submitOpportunity(e: React.FormEvent) {
    e.preventDefault();
    setOppLoading(true);
    await supabase.from('opportunities').insert({ title: oppForm.title, description: oppForm.description, status: 'open' });
    setOppForm({ title: '', description: '' });
    setShowAddOpp(false);
    await fetchOpportunities();
    setOppLoading(false);
  }

  async function toggleOpportunityStatus(oppId: string, currentStatus: string) {
    const newStatus = currentStatus === 'open' ? 'closed' : 'open';
    await supabase.from('opportunities').update({ status: newStatus }).eq('id', oppId);
    await fetchOpportunities();
  }

  async function submitAssignment() {
    if (!assignModal || !selectedCompanyId) return;
    setAssignLoading(true);
    await supabase.from('agent_assignments').insert({
      agent_id: assignModal.agent.id,
      company_id: selectedCompanyId,
      notes: assignNote.trim(),
    });
    await fetchAll();
    setAssignModal(null);
    setAssignLoading(false);
  }

  async function removeAssignment(assignmentId: string) {
    await supabase.from('agent_assignments').delete().eq('id', assignmentId);
    await fetchAll();
  }

  async function toggleAgentRole(agent: Profile) {
    const newRole = agent.role === 'admin' ? 'agent' : 'admin';
    await supabase.from('profiles').update({ role: newRole }).eq('id', agent.id);
    await fetchAll();
    if (selectedAgent && selectedAgent.profile.id === agent.id) {
      setSelectedAgent({ ...selectedAgent, profile: { ...selectedAgent.profile, role: newRole } });
    }
  }

  async function submitAddCompany(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    if (!addCompanyForm.name.trim()) { setFormError('Company name is required.'); return; }
    setAddCompanyLoading(true);
    const { error } = await supabase.from('companies').insert(addCompanyForm);
    if (error) setFormError(error.message);
    else {
      setShowAddCompany(false);
      setAddCompanyForm({ name: '', industry: '', contact_name: '', contact_email: '', priority: 'medium' });
      await fetchAll();
    }
    setAddCompanyLoading(false);
  }

  // Filtering and sorting for agent pool
  const filteredPool = useMemo(() => {
    let result = [...poolData];
    const q = search.toLowerCase();
    if (q) {
      result = result.filter((d) =>
        d.profile.full_name?.toLowerCase().includes(q) ||
        d.location?.country_name?.toLowerCase().includes(q) ||
        d.location?.city?.toLowerCase().includes(q) ||
        d.location?.region?.toLowerCase().includes(q) ||
        d.skills.some((s) => s.skill.toLowerCase().includes(q)) ||
        d.languages.some((l) => l.language.toLowerCase().includes(q))
      );
    }
    if (filterCountry) result = result.filter((d) => d.location?.country_code === filterCountry);
    if (filterStatus) result = result.filter((d) => d.application?.status === filterStatus);
    if (filterSkill) result = result.filter((d) => d.skills.some((s) => s.skill === filterSkill));
    if (filterLanguage) result = result.filter((d) => d.languages.some((l) => l.language.toLowerCase().includes(filterLanguage.toLowerCase())));
    if (filterTz) result = result.filter((d) => d.availability?.workable_time_zones?.includes(filterTz));

    result.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'name': cmp = (a.profile.full_name || '').localeCompare(b.profile.full_name || ''); break;
        case 'country': cmp = (a.location?.country_name || '').localeCompare(b.location?.country_name || ''); break;
        case 'city': cmp = (a.location?.city || '').localeCompare(b.location?.city || ''); break;
        case 'status': cmp = (a.application?.status || '').localeCompare(b.application?.status || ''); break;
        case 'date': cmp = (a.application?.created_at || '').localeCompare(b.application?.created_at || ''); break;
      }
      return sortAsc ? cmp : -cmp;
    });
    return result;
  }, [poolData, search, filterCountry, filterStatus, filterSkill, filterLanguage, filterTz, sortField, sortAsc]);

  const availableToAssign = companies.filter((c) => !assignModal?.existingIds.includes(c.id));
  const agentAssignmentCount = (agentId: string) => assignments.filter((a) => a.agent_id === agentId).length;
  const companyAgentCount = (companyId: string) => assignments.filter((a) => a.company_id === companyId).length;

  const stats = {
    agents: agents.filter((a) => a.role !== 'admin').length,
    available: agents.filter((a) => a.status === 'available').length,
    companies: companies.length,
    assignments: assignments.length,
    countries: countries.length,
    opportunities: opportunities.length,
    newInquiries: inquiries.filter((i) => i.status === 'new').length,
  };

  const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'pool', label: 'Agent Pool', icon: Users },
    { id: 'agents', label: 'Assignments', icon: UserCheck },
    { id: 'companies', label: 'Companies', icon: Building2 },
    { id: 'countries', label: 'Countries', icon: Globe2 },
    { id: 'opportunities', label: 'Opportunities', icon: Briefcase },
    { id: 'statuses', label: 'Statuses', icon: Tag },
    { id: 'inquiries', label: 'Inquiries', icon: Mail },
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Page header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-sky-400 text-sm font-medium mb-0.5">Admin Panel</p>
            <h2 className="text-2xl font-bold text-white">Agent Pool Management</h2>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchAll} className="p-2.5 bg-slate-800/80 border border-white/10 rounded-xl text-slate-400 hover:text-white transition-colors">
              <RefreshCw size={16} />
            </button>
            <button onClick={signOut} className="px-4 py-2.5 bg-slate-800/80 border border-white/10 rounded-xl text-slate-400 hover:text-white text-sm font-medium transition-colors">
              Sign Out
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-900/60 border border-white/8 rounded-xl p-1 mb-8 w-fit overflow-x-auto">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                tab === id ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25' : 'text-slate-400 hover:text-white'
              }`}>
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32"><Loader2 size={32} className="animate-spin text-sky-500" /></div>
        ) : (
          <>
            {/* OVERVIEW */}
            {tab === 'overview' && (
              <div className="space-y-8">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Agents', value: stats.agents, icon: Users, color: 'sky' },
                    { label: 'Available Now', value: stats.available, icon: CheckCircle2, color: 'emerald' },
                    { label: 'Companies', value: stats.companies, icon: Building2, color: 'violet' },
                    { label: 'Assignments', value: stats.assignments, icon: UserCheck, color: 'orange' },
                    { label: 'Countries', value: stats.countries, icon: Globe2, color: 'cyan' },
                    { label: 'Opportunities', value: stats.opportunities, icon: Briefcase, color: 'amber' },
                    { label: 'New Inquiries', value: stats.newInquiries, icon: Mail, color: 'rose' },
                  ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="bg-slate-900/60 border border-white/8 rounded-2xl p-5">
                      <div className={`w-9 h-9 rounded-xl bg-${color}-500/10 flex items-center justify-center mb-3`}>
                        <Icon size={18} className={`text-${color}-400`} />
                      </div>
                      <p className="text-3xl font-bold text-white">{value}</p>
                      <p className="text-sm text-slate-500 mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>
                {/* Country status summary */}
                <div>
                  <h3 className="text-base font-semibold text-white mb-4">Country Status</h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {countries.map((c) => (
                      <div key={c.id} className="bg-slate-900/60 border border-white/8 rounded-xl p-4">
                        <p className="text-white text-sm font-medium">{c.name}</p>
                        <p className="text-slate-600 text-xs">{c.iso_code}</p>
                        <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-md border ${COUNTRY_STATUS_CONFIG[c.application_status]?.color ?? ''}`}>
                          {COUNTRY_STATUS_CONFIG[c.application_status]?.label ?? c.application_status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* AGENT POOL */}
            {tab === 'pool' && (
              <div className="space-y-4">
                {/* Search & filters */}
                <div className="bg-slate-900/60 border border-white/8 rounded-2xl p-4 space-y-3">
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search by name, country, city, skill, language..."
                      className="w-full bg-slate-800 border border-white/10 text-white placeholder-slate-600 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <FilterSelect label="Country" value={filterCountry} onChange={setFilterCountry}
                      options={countries.map((c) => ({ value: c.iso_code, label: c.name }))} />
                    <FilterSelect label="Status" value={filterStatus} onChange={setFilterStatus}
                      options={statusConfig.map((s) => ({ value: s.status, label: s.label }))} />
                    <FilterSelect label="Skill" value={filterSkill} onChange={setFilterSkill}
                      options={['Customer Service','Sales','Technical Support','Billing','Collections','Chat Support','Email Support','Administrative Support','Healthcare Support','E-commerce','Retail','Telecommunications','Financial Services','Travel'].map((s) => ({ value: s, label: s }))} />
                    <FilterSelect label="Language" value={filterLanguage} onChange={setFilterLanguage}
                      options={[{ value: 'English', label: 'English' }, { value: 'Spanish', label: 'Spanish' }, { value: 'Tagalog', label: 'Tagalog' }, { value: 'French', label: 'French' }, { value: 'Hindi', label: 'Hindi' }, { value: 'Portuguese', label: 'Portuguese' }]} />
                    <FilterSelect label="Time Zone" value={filterTz} onChange={setFilterTz}
                      options={['U.S. Eastern','U.S. Central','U.S. Mountain','U.S. Pacific','UK','European','Asia-Pacific','Other'].map((tz) => ({ value: tz, label: tz }))} />
                  </div>
                </div>

                {/* Pool table */}
                {poolLoading ? (
                  <div className="flex items-center justify-center py-20"><Loader2 size={28} className="animate-spin text-sky-500" /></div>
                ) : filteredPool.length === 0 ? (
                  <div className="text-center py-16 bg-slate-900/50 border border-white/5 rounded-2xl">
                    <Users size={36} className="text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-500 text-sm">{poolData.length === 0 ? 'No agents in the pool yet.' : 'No agents match your filters.'}</p>
                  </div>
                ) : (
                  <div className="bg-slate-900/60 border border-white/8 rounded-2xl overflow-x-auto">
                    <table className="w-full text-sm min-w-[900px]">
                      <thead>
                        <tr className="border-b border-white/8">
                          {[
                            { field: 'name' as SortField, label: 'Name' },
                            { field: 'country' as SortField, label: 'Country' },
                            { field: 'city' as SortField, label: 'City' },
                            { field: null, label: 'Time Zone' },
                            { field: null, label: 'Email' },
                            { field: null, label: 'Phone' },
                            { field: 'date' as SortField, label: 'Applied' },
                            { field: 'status' as SortField, label: 'Status' },
                            { field: null, label: 'Skills' },
                            { field: null, label: 'Languages' },
                          ].map((col) => (
                            <th key={col.label} className="text-left px-4 py-3.5 text-slate-500 font-medium">
                              {col.field ? (
                                <button onClick={() => { if (sortField === col.field) setSortAsc(!sortAsc); else { setSortField(col.field); setSortAsc(true); } }} className="flex items-center gap-1 hover:text-slate-300">
                                  {col.label} <ArrowUpDown size={11} />
                                </button>
                              ) : col.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPool.map((d) => (
                          <tr key={d.profile.id} onClick={() => openAgentDetail(d)} className="border-b border-white/5 last:border-0 hover:bg-white/3 cursor-pointer transition-colors">
                            <td className="px-4 py-3 text-white font-medium">{d.profile.full_name || 'Unnamed'}</td>
                            <td className="px-4 py-3 text-slate-300">{d.location?.country_name ?? '—'}</td>
                            <td className="px-4 py-3 text-slate-400">{d.location?.city ?? '—'}</td>
                            <td className="px-4 py-3 text-slate-400 text-xs">{d.location?.time_zone?.split(' (')[0] ?? '—'}</td>
                            <td className="px-4 py-3 text-slate-400 text-xs truncate max-w-[140px]">{d.profile.email ?? '—'}</td>
                            <td className="px-4 py-3 text-slate-400 text-xs">{d.profile.phone ?? '—'}</td>
                            <td className="px-4 py-3 text-slate-500 text-xs">{d.application?.submitted_at ? new Date(d.application.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}</td>
                            <td className="px-4 py-3">
                              {d.application ? (
                                <span className={`text-xs px-2 py-0.5 rounded-md border ${getStatusColor(d.application.status)}`}>{getStatusLabel(d.application.status)}</span>
                              ) : <span className="text-slate-600 text-xs">No app</span>}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap gap-1 max-w-[150px]">
                                {d.skills.slice(0, 2).map((s) => <span key={s.id} className="text-xs px-1.5 py-0.5 bg-sky-500/10 text-sky-300 rounded">{s.skill}</span>)}
                                {d.skills.length > 2 && <span className="text-xs text-slate-600">+{d.skills.length - 2}</span>}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-slate-400 text-xs">{d.languages.map((l) => l.language).join(', ') || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ASSIGNMENTS TAB (legacy agents) */}
            {tab === 'agents' && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {agents.filter((a) => a.role !== 'admin').length === 0 ? (
                  <div className="col-span-full text-center py-16 bg-slate-900/50 border border-white/5 rounded-2xl">
                    <Users size={36} className="text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-500 text-sm">No agents registered yet.</p>
                  </div>
                ) : agents.filter((a) => a.role !== 'admin').map((agent) => {
                  const sCfg = STATUS_CONFIG[agent.status];
                  const count = agentAssignmentCount(agent.id);
                  const agentAssigns = assignments.filter((a) => a.agent_id === agent.id);
                  return (
                    <div key={agent.id} className="bg-slate-900/60 border border-white/8 rounded-2xl p-5 hover:border-sky-500/25 transition-all">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-sky-500/15 flex items-center justify-center text-sky-300 font-bold">{agent.full_name?.[0] ?? '?'}</div>
                          <div>
                            <p className="font-semibold text-white text-sm">{agent.full_name || 'Unnamed Agent'}</p>
                            <p className="text-slate-500 text-xs mt-0.5">Agent</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${sCfg.dot}`} />
                          <span className="text-xs text-slate-400">{sCfg.label}</span>
                          <button
                            onClick={() => toggleAgentRole(agent)}
                            className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-md border transition-colors ${
                              agent.role === 'admin'
                                ? 'text-amber-400 bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20'
                                : 'text-slate-500 bg-slate-800 border-white/10 hover:text-amber-400 hover:border-amber-500/20'
                            }`}
                          >
                            <Shield size={11} />
                            {agent.role === 'admin' ? 'Admin' : 'Make Admin'}
                          </button>
                        </div>
                      </div>
                      <div className="mb-4">
                        <p className="text-xs text-slate-600 mb-2">{count} {count === 1 ? 'company' : 'companies'} assigned</p>
                        {agentAssigns.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {agentAssigns.map((a) => (
                              <div key={a.id} className="flex items-center gap-1 bg-slate-800 rounded-lg pl-2 pr-1 py-1">
                                <span className="text-xs text-slate-300 max-w-[90px] truncate">{a.companies?.name}</span>
                                <button onClick={() => removeAssignment(a.id)} className="text-slate-600 hover:text-red-400 transition-colors ml-0.5"><X size={12} /></button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <button onClick={() => { setAssignModal({ agent, existingIds: agentAssigns.map((a) => a.company_id) }); setSelectedCompanyId(''); setAssignNote(''); }}
                        disabled={availableToAssign.length === 0 && agentAssignmentCount(agent.id) === companies.length}
                        className="w-full flex items-center justify-center gap-1.5 py-2 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 text-sky-400 rounded-xl text-xs font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                        <Plus size={13} /> Assign Company
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* COMPANIES TAB */}
            {tab === 'companies' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-white">All Companies</h3>
                  <button onClick={() => setShowAddCompany(true)} className="flex items-center gap-1.5 px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-sky-500/20">
                    <Plus size={15} /> Add Company
                  </button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {companies.map((company) => {
                    const pCfg = PRIORITY_CONFIG[company.priority];
                    const count = companyAgentCount(company.id);
                    return (
                      <div key={company.id} className="bg-slate-900/60 border border-white/8 rounded-2xl p-5 hover:border-sky-500/25 transition-all">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-sky-500/10 border border-sky-500/20 rounded-xl flex items-center justify-center"><Building2 size={18} className="text-sky-400" /></div>
                            <div><p className="font-semibold text-white text-sm">{company.name}</p><p className="text-slate-500 text-xs mt-0.5">{company.industry}</p></div>
                          </div>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-lg border ${pCfg.color} flex items-center gap-1`}><Tag size={10} /> {pCfg.label}</span>
                        </div>
                        <div className="space-y-1.5 text-xs text-slate-400">
                          <div className="flex items-center gap-1.5"><Phone size={11} className="text-slate-600" /><span className="text-slate-300">{company.contact_name}</span></div>
                          <div className="flex items-center gap-1.5"><Clock size={11} className="text-slate-600" /><span>{company.contact_email}</span></div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-white/5"><p className="text-xs text-slate-600">{count} agent{count !== 1 ? 's' : ''} assigned</p></div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* COUNTRIES TAB */}
            {tab === 'countries' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-white">Countries</h3>
                  <button onClick={() => setShowAddCountry(true)} className="flex items-center gap-1.5 px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-sky-500/20">
                    <Plus size={15} /> Add Country
                  </button>
                </div>
                <div className="bg-slate-900/60 border border-white/8 rounded-2xl overflow-x-auto">
                  <table className="w-full text-sm min-w-[700px]">
                    <thead>
                      <tr className="border-b border-white/8">
                        <th className="text-left px-4 py-3.5 text-slate-500 font-medium">Country</th>
                        <th className="text-left px-4 py-3.5 text-slate-500 font-medium">ISO Code</th>
                        <th className="text-left px-4 py-3.5 text-slate-500 font-medium">Application Status</th>
                        <th className="text-left px-4 py-3.5 text-slate-500 font-medium hidden sm:table-cell">Notes</th>
                        <th className="text-left px-4 py-3.5 text-slate-500 font-medium hidden md:table-cell">Added</th>
                        <th className="text-left px-4 py-3.5 text-slate-500 font-medium hidden md:table-cell">Updated</th>
                        <th className="px-4 py-3.5" />
                      </tr>
                    </thead>
                    <tbody>
                      {countries.map((c) => (
                        <tr key={c.id} className="border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors">
                          <td className="px-4 py-3 text-white font-medium">{c.name}</td>
                          <td className="px-4 py-3 text-slate-400">{c.iso_code}</td>
                          <td className="px-4 py-3">
                            <div className="relative inline-block">
                              <select
                                value={c.application_status}
                                onChange={(e) => updateCountryStatus(c.id, e.target.value)}
                                className={`text-xs px-2 py-1 rounded-md border appearance-none pr-7 cursor-pointer ${COUNTRY_STATUS_CONFIG[c.application_status]?.color ?? ''}`}
                              >
                                <option value="accepting">Accepting Applications</option>
                                <option value="review_required">Review Required</option>
                                <option value="temp_closed">Temporarily Closed</option>
                                <option value="not_available">Not Currently Available</option>
                              </select>
                              <ChevronDown size={11} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-400 text-xs hidden sm:table-cell max-w-[150px] truncate">{c.notes || '—'}</td>
                          <td className="px-4 py-3 text-slate-500 text-xs hidden md:table-cell">{new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                          <td className="px-4 py-3 text-slate-500 text-xs hidden md:table-cell">{new Date(c.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                          <td className="px-4 py-3 text-right">
                            <button onClick={() => deleteCountry(c.id)} className="text-slate-600 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* OPPORTUNITIES TAB */}
            {tab === 'opportunities' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-white">Opportunities</h3>
                  <button onClick={() => setShowAddOpp(true)} className="flex items-center gap-1.5 px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-sky-500/20">
                    <Plus size={15} /> Add Opportunity
                  </button>
                </div>
                {opportunities.length === 0 ? (
                  <div className="text-center py-16 bg-slate-900/50 border border-white/5 rounded-2xl">
                    <Briefcase size={36} className="text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-500 text-sm">No opportunities yet. Create one to start matching agents.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {opportunities.map((opp) => (
                      <div key={opp.id} className="bg-slate-900/60 border border-white/8 rounded-2xl p-5">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-white text-sm">{opp.title}</p>
                            <p className="text-slate-500 text-xs mt-1">{opp.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-0.5 rounded-md border ${opp.status === 'open' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-slate-400 bg-slate-500/10 border-slate-500/20'}`}>
                              {opp.status}
                            </span>
                            <button
                              onClick={() => toggleOpportunityStatus(opp.id, opp.status)}
                              className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
                                opp.status === 'open'
                                  ? 'text-slate-400 bg-slate-800 border-white/10 hover:text-red-400 hover:border-red-500/20'
                                  : 'text-slate-400 bg-slate-800 border-white/10 hover:text-emerald-400 hover:border-emerald-500/20'
                              }`}
                            >
                              {opp.status === 'open' ? 'Close' : 'Reopen'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* INQUIRIES TAB */}
            {tab === 'inquiries' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-semibold text-white">Client Inquiries</h3>
                  <button onClick={fetchInquiries} className="p-2.5 bg-slate-800/80 border border-white/10 rounded-xl text-slate-400 hover:text-white transition-colors">
                    <RefreshCw size={16} />
                  </button>
                </div>
                {inquiriesLoading ? (
                  <div className="flex items-center justify-center py-20"><Loader2 size={28} className="animate-spin text-sky-500" /></div>
                ) : inquiries.length === 0 ? (
                  <div className="text-center py-16 bg-slate-900/50 border border-white/5 rounded-2xl">
                    <Mail size={36} className="text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-500 text-sm">No inquiries yet. They'll appear here when potential clients submit the form on your landing page.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {inquiries.map((inq) => (
                      <div
                        key={inq.id}
                        onClick={() => setSelectedInquiry(inq)}
                        className="bg-slate-900/60 border border-white/8 rounded-2xl p-5 hover:border-sky-500/25 cursor-pointer transition-all"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
                              <Building2 size={18} className="text-sky-400" />
                            </div>
                            <div>
                              <p className="font-semibold text-white text-sm">{inq.company_name}</p>
                              <p className="text-slate-500 text-xs mt-0.5">{inq.contact_name} · {inq.email}</p>
                            </div>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-md border ${inq.status === 'new' ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'}`}>
                            {inq.status === 'new' ? 'New' : 'Contacted'}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          {inq.service_interest && <span>Service: <span className="text-slate-300">{inq.service_interest}</span></span>}
                          <span>{new Date(inq.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        {inq.message && (
                          <p className="text-slate-400 text-xs mt-3 line-clamp-2">{inq.message}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* STATUSES TAB */}
            {tab === 'statuses' && (
              <div>
                <h3 className="text-base font-semibold text-white mb-4">Application Statuses</h3>
                <div className="bg-slate-900/60 border border-white/8 rounded-2xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/8">
                        <th className="text-left px-4 py-3.5 text-slate-500 font-medium">Status</th>
                        <th className="text-left px-4 py-3.5 text-slate-500 font-medium">Label</th>
                        <th className="text-left px-4 py-3.5 text-slate-500 font-medium">Active</th>
                        <th className="text-left px-4 py-3.5 text-slate-500 font-medium">Order</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statusConfig.map((s) => (
                        <tr key={s.id} className="border-b border-white/5 last:border-0">
                          <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-md border ${getStatusColor(s.status)}`}>{s.status}</span></td>
                          <td className="px-4 py-3 text-slate-300">{s.label}</td>
                          <td className="px-4 py-3"><span className={`text-xs ${s.is_active ? 'text-emerald-400' : 'text-slate-600'}`}>{s.is_active ? 'Yes' : 'No'}</span></td>
                          <td className="px-4 py-3 text-slate-500 text-xs">{s.sort_order}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-slate-600 text-xs mt-3">Statuses are configurable. Admins can add, edit, or deactivate statuses from this table.</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Agent detail drawer */}
      {selectedAgent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-end z-50" onClick={() => setSelectedAgent(null)}>
          <div className="bg-slate-900 border-l border-white/10 w-full max-w-md h-full overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-white text-lg">{selectedAgent.profile.full_name || 'Agent'}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-md border ${
                    selectedAgent.profile.role === 'admin'
                      ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                      : 'text-slate-400 bg-slate-800 border-white/10'
                  }`}>
                    {selectedAgent.profile.role === 'admin' ? 'Admin' : 'Agent'}
                  </span>
                  <button
                    onClick={() => toggleAgentRole(selectedAgent.profile)}
                    className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-md border transition-colors ${
                      selectedAgent.profile.role === 'admin'
                        ? 'text-slate-400 bg-slate-800 border-white/10 hover:text-amber-400 hover:border-amber-500/20'
                        : 'text-amber-400 bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20'
                    }`}
                  >
                    <Shield size={11} />
                    {selectedAgent.profile.role === 'admin' ? 'Demote to Agent' : 'Promote to Admin'}
                  </button>
                </div>
              </div>
              <button onClick={() => setSelectedAgent(null)} className="text-slate-500 hover:text-white"><X size={20} /></button>
            </div>

            {/* Status update */}
            {selectedAgent.application && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Application Status</label>
                <div className="relative">
                  <select
                    value={selectedAgent.application.status}
                    onChange={(e) => updateApplicationStatus(e.target.value)}
                    className="w-full bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-2.5 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 appearance-none"
                  >
                    {statusConfig.map((s) => <option key={s.id} value={s.status}>{s.label}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
                {selectedAgent.application.requires_review && (
                  <p className="text-amber-400 text-xs mt-2">Flagged for review (work authorization unclear)</p>
                )}
              </div>
            )}

            {/* Details */}
            <div className="space-y-4 mb-6">
              {selectedAgent.location && (
                <div>
                  <p className="text-slate-500 text-xs mb-1">Location</p>
                  <p className="text-slate-300 text-sm">{selectedAgent.location.country_name} ({selectedAgent.location.country_code})</p>
                  <p className="text-slate-500 text-xs">{[selectedAgent.location.region, selectedAgent.location.city].filter(Boolean).join(', ')}</p>
                  <p className="text-slate-500 text-xs">{selectedAgent.location.time_zone}</p>
                </div>
              )}
              {selectedAgent.experience && (
                <div>
                  <p className="text-slate-500 text-xs mb-1">Experience</p>
                  <p className="text-slate-300 text-sm">{selectedAgent.experience.years_customer_service}y CS · {selectedAgent.experience.years_bpo}y BPO · {selectedAgent.experience.years_remote}y remote</p>
                  {selectedAgent.experience.summary && <p className="text-slate-500 text-xs mt-1">{selectedAgent.experience.summary}</p>}
                </div>
              )}
              {selectedAgent.skills.length > 0 && (
                <div>
                  <p className="text-slate-500 text-xs mb-1">Skills</p>
                  <div className="flex flex-wrap gap-1.5">{selectedAgent.skills.map((s) => <span key={s.id} className="text-xs px-2 py-0.5 bg-sky-500/10 border border-sky-500/20 rounded-md text-sky-300">{s.skill}</span>)}</div>
                </div>
              )}
              {selectedAgent.languages.length > 0 && (
                <div>
                  <p className="text-slate-500 text-xs mb-1">Languages</p>
                  {selectedAgent.languages.map((l) => <p key={l.id} className="text-slate-300 text-sm">{l.language} <span className="text-slate-500 text-xs">({l.proficiency})</span></p>)}
                </div>
              )}
              {selectedAgent.availability && (
                <div>
                  <p className="text-slate-500 text-xs mb-1">Availability</p>
                  <p className="text-slate-300 text-sm capitalize">{selectedAgent.availability.availability_type.replace('_', '-')} · {selectedAgent.availability.hours_per_week}+ hrs/week</p>
                  {selectedAgent.availability.workable_time_zones.length > 0 && <p className="text-slate-500 text-xs">{selectedAgent.availability.workable_time_zones.join(', ')}</p>}
                </div>
              )}
              {selectedAgent.equipment && (
                <div>
                  <p className="text-slate-500 text-xs mb-1">Equipment</p>
                  <p className="text-slate-300 text-sm">{selectedAgent.equipment.has_computer ? 'Computer' : ''} {selectedAgent.equipment.has_headset ? '· Headset' : ''} {selectedAgent.equipment.has_webcam ? '· Webcam' : ''}</p>
                </div>
              )}
            </div>

            {/* Messages */}
            <div className="mb-6">
              <h4 className="text-white font-semibold text-sm mb-3 flex items-center gap-2"><MessageSquare size={15} className="text-sky-400" /> Messages</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto mb-3">
                {messages.length === 0 ? <p className="text-slate-600 text-xs text-center py-4">No messages</p> :
                  messages.map((m) => (
                    <div key={m.id} className={`rounded-xl px-3 py-2 text-xs ${m.sender_id === selectedAgent.profile.id ? 'bg-sky-500/10 text-slate-300' : 'bg-slate-800 text-slate-400'}`}>
                      <p>{m.body}</p>
                      <p className="text-slate-600 text-xs mt-1">{new Date(m.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</p>
                    </div>
                  ))
                }
              </div>
              <div className="flex gap-2">
                <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} placeholder="Send a message..." className="flex-1 bg-slate-800 border border-white/10 text-white placeholder-slate-600 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500" />
                <button onClick={sendMessage} disabled={!newMessage.trim()} className="px-3 py-2 bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-white rounded-xl"><Send size={14} /></button>
              </div>
            </div>

            {/* Recruiter notes */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-3 flex items-center gap-2"><StickyNote size={15} className="text-amber-400" /> Recruiter Notes</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto mb-3">
                {notes.length === 0 ? <p className="text-slate-600 text-xs text-center py-4">No notes</p> :
                  notes.map((n) => (
                    <div key={n.id} className="bg-amber-500/5 border border-amber-500/15 rounded-xl px-3 py-2 text-xs text-slate-300">
                      <p>{n.note}</p>
                      <p className="text-slate-600 text-xs mt-1">{new Date(n.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric' })}</p>
                    </div>
                  ))
                }
              </div>
              <div className="flex gap-2">
                <input type="text" value={newNote} onChange={(e) => setNewNote(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addNote()} placeholder="Add a note..." className="flex-1 bg-slate-800 border border-white/10 text-white placeholder-slate-600 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500" />
                <button onClick={addNote} disabled={!newNote.trim()} className="px-3 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-white rounded-xl"><Plus size={14} /></button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Company Modal */}
      {assignModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-white text-lg">Assign Company</h3>
              <button onClick={() => setAssignModal(null)} className="text-slate-500 hover:text-white"><X size={20} /></button>
            </div>
            <p className="text-slate-400 text-sm mb-5">Assigning to <span className="text-white font-medium">{assignModal.agent.full_name}</span></p>
            {availableToAssign.length === 0 ? (
              <p className="text-slate-500 text-sm py-4 text-center">All companies are already assigned to this agent.</p>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Company</label>
                  <div className="relative">
                    <select value={selectedCompanyId} onChange={(e) => setSelectedCompanyId(e.target.value)} className="w-full bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-3 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 appearance-none">
                      <option value="">Select a company...</option>
                      {availableToAssign.map((c) => <option key={c.id} value={c.id} className="bg-slate-800">{c.name}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Notes (optional)</label>
                  <input type="text" value={assignNote} onChange={(e) => setAssignNote(e.target.value)} placeholder="e.g. Primary contact for escalations" className="w-full bg-slate-800 border border-white/10 text-white placeholder-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setAssignModal(null)} className="flex-1 py-2.5 border border-white/10 text-slate-300 hover:text-white rounded-xl text-sm font-medium transition-colors">Cancel</button>
                  <button onClick={submitAssignment} disabled={!selectedCompanyId || assignLoading} className="flex-1 py-2.5 bg-sky-500 hover:bg-sky-400 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2">
                    {assignLoading && <Loader2 size={14} className="animate-spin" />} Assign
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Company Modal */}
      {showAddCompany && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-white text-lg">Add Company</h3>
              <button onClick={() => { setShowAddCompany(false); setFormError(''); }} className="text-slate-500 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={submitAddCompany} className="space-y-4">
              {[{ key: 'name', label: 'Company Name', placeholder: 'Acme Corp' }, { key: 'industry', label: 'Industry', placeholder: 'Automotive Retail' }, { key: 'contact_name', label: 'Contact Name', placeholder: 'John Doe' }, { key: 'contact_email', label: 'Contact Email', placeholder: 'john@example.com' }].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>
                  <input type={key === 'contact_email' ? 'email' : 'text'} value={addCompanyForm[key as keyof typeof addCompanyForm]} onChange={(e) => setAddCompanyForm((f) => ({ ...f, [key]: e.target.value }))} placeholder={placeholder} className="w-full bg-slate-800 border border-white/10 text-white placeholder-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Priority</label>
                <div className="relative">
                  <select value={addCompanyForm.priority} onChange={(e) => setAddCompanyForm((f) => ({ ...f, priority: e.target.value }))} className="w-full bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-3 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 appearance-none">
                    {['low', 'medium', 'high', 'critical'].map((p) => <option key={p} value={p} className="bg-slate-800">{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
              {formError && <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">{formError}</div>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowAddCompany(false); setFormError(''); }} className="flex-1 py-2.5 border border-white/10 text-slate-300 hover:text-white rounded-xl text-sm font-medium transition-colors">Cancel</button>
                <button type="submit" disabled={addCompanyLoading} className="flex-1 py-2.5 bg-sky-500 hover:bg-sky-400 disabled:opacity-60 text-white rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2">{addCompanyLoading && <Loader2 size={14} className="animate-spin" />} Add Company</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Country Modal */}
      {showAddCountry && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-white text-lg">Add Country</h3>
              <button onClick={() => setShowAddCountry(false)} className="text-slate-500 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={submitCountry} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Country Name</label>
                <input type="text" required value={countryForm.name} onChange={(e) => setCountryForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Brazil" className="w-full bg-slate-800 border border-white/10 text-white placeholder-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">ISO Code (2-letter)</label>
                <input type="text" required maxLength={2} value={countryForm.iso_code} onChange={(e) => setCountryForm((f) => ({ ...f, iso_code: e.target.value.toUpperCase() }))} placeholder="e.g. BR" className="w-full bg-slate-800 border border-white/10 text-white placeholder-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 uppercase" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Application Status</label>
                <div className="relative">
                  <select value={countryForm.application_status} onChange={(e) => setCountryForm((f) => ({ ...f, application_status: e.target.value }))} className="w-full bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-3 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 appearance-none">
                    <option value="accepting">Accepting Applications</option>
                    <option value="review_required">Review Required</option>
                    <option value="temp_closed">Temporarily Closed</option>
                    <option value="not_available">Not Currently Available</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Notes (optional)</label>
                <input type="text" value={countryForm.notes} onChange={(e) => setCountryForm((f) => ({ ...f, notes: e.target.value }))} placeholder="e.g. Specific documentation requirements" className="w-full bg-slate-800 border border-white/10 text-white placeholder-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddCountry(false)} className="flex-1 py-2.5 border border-white/10 text-slate-300 hover:text-white rounded-xl text-sm font-medium transition-colors">Cancel</button>
                <button type="submit" disabled={countryLoading} className="flex-1 py-2.5 bg-sky-500 hover:bg-sky-400 disabled:opacity-60 text-white rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2">{countryLoading && <Loader2 size={14} className="animate-spin" />} Add Country</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Opportunity Modal */}
      {showAddOpp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-white text-lg">Add Opportunity</h3>
              <button onClick={() => setShowAddOpp(false)} className="text-slate-500 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={submitOpportunity} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Title</label>
                <input type="text" required value={oppForm.title} onChange={(e) => setOppForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Customer Service - U.S. Eastern" className="w-full bg-slate-800 border border-white/10 text-white placeholder-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
                <textarea required value={oppForm.description} onChange={(e) => setOppForm((f) => ({ ...f, description: e.target.value }))} rows={3} placeholder="Describe the opportunity..." className="w-full bg-slate-800 border border-white/10 text-white placeholder-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddOpp(false)} className="flex-1 py-2.5 border border-white/10 text-slate-300 hover:text-white rounded-xl text-sm font-medium transition-colors">Cancel</button>
                <button type="submit" disabled={oppLoading} className="flex-1 py-2.5 bg-sky-500 hover:bg-sky-400 disabled:opacity-60 text-white rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2">{oppLoading && <Loader2 size={14} className="animate-spin" />} Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inquiry Detail Drawer */}
      {selectedInquiry && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-end z-50" onClick={() => setSelectedInquiry(null)}>
          <div className="bg-slate-900 border-l border-white/10 w-full max-w-md h-full overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-white text-lg">Inquiry from {selectedInquiry.company_name}</h3>
                <p className="text-slate-500 text-xs mt-1">{new Date(selectedInquiry.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</p>
              </div>
              <button onClick={() => setSelectedInquiry(null)} className="text-slate-500 hover:text-white"><X size={20} /></button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <p className="text-slate-500 text-xs mb-1">Contact Name</p>
                <p className="text-slate-300 text-sm">{selectedInquiry.contact_name}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs mb-1">Email</p>
                <a href={`mailto:${selectedInquiry.email}`} className="text-sky-400 text-sm hover:text-sky-300 transition-colors">{selectedInquiry.email}</a>
              </div>
              {selectedInquiry.phone && (
                <div>
                  <p className="text-slate-500 text-xs mb-1">Phone</p>
                  <p className="text-slate-300 text-sm">{selectedInquiry.phone}</p>
                </div>
              )}
              <div>
                <p className="text-slate-500 text-xs mb-1">Service of Interest</p>
                <p className="text-slate-300 text-sm">{selectedInquiry.service_interest}</p>
              </div>
              {selectedInquiry.message && (
                <div>
                  <p className="text-slate-500 text-xs mb-1">Message</p>
                  <p className="text-slate-300 text-sm leading-relaxed">{selectedInquiry.message}</p>
                </div>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Status</label>
              <div className="flex gap-2">
                <button
                  onClick={() => updateInquiryStatus(selectedInquiry.id, 'new')}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${selectedInquiry.status === 'new' ? 'bg-rose-500/15 border-rose-500/40 text-rose-300' : 'bg-slate-800 border-white/10 text-slate-400 hover:border-white/20'}`}
                >
                  New
                </button>
                <button
                  onClick={() => updateInquiryStatus(selectedInquiry.id, 'contacted')}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${selectedInquiry.status === 'contacted' ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' : 'bg-slate-800 border-white/10 text-slate-400 hover:border-white/20'}`}
                >
                  Contacted
                </button>
              </div>
            </div>

            <a
              href={`mailto:${selectedInquiry.email}?subject=Re: Your inquiry to Connect Care&body=Hi ${selectedInquiry.contact_name},%0D%0A%0D%0AThank you for reaching out to Connect Care regarding ${selectedInquiry.service_interest}.%0D%0A%0D%0A`}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-sky-500 hover:bg-sky-400 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-sky-500/20"
            >
              <Mail size={16} /> Reply via Email
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div className="relative">
      <select value={value} onChange={(e) => onChange(e.target.value)} className="bg-slate-800 border border-white/10 text-slate-300 rounded-xl pl-3 pr-8 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 appearance-none">
        <option value="">All {label}</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
    </div>
  );
}
