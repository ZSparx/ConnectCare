import { useState, useMemo, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  COUNTRIES,
  TIME_ZONES,
  WORKABLE_TIME_ZONES,
  SKILL_OPTIONS,
  OPPORTUNITY_PREFERENCE_OPTIONS,
  REFERRAL_SOURCES,
  PROFICIENCY_LEVELS,
  CONTACT_METHODS,
  DAYS_OF_WEEK,
} from '../lib/countries';
import { Field, TextInput, TextArea, Select, CheckboxGroup, RadioGroup, Toggle } from '../components/form-ui';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  AlertCircle,
  User,
  MapPin,
  Briefcase,
  Star,
  Monitor,
  Wifi,
  Clock,
  Languages,
  ShieldCheck,
  FileCheck,
  Globe2,
} from 'lucide-react';

type Props = {
  onDone: () => void;
  onCancel: () => void;
};

const STEPS = [
  { label: 'Personal', icon: User },
  { label: 'Location', icon: MapPin },
  { label: 'Experience', icon: Briefcase },
  { label: 'Skills', icon: Star },
  { label: 'Languages', icon: Languages },
  { label: 'Equipment', icon: Monitor },
  { label: 'Internet', icon: Wifi },
  { label: 'Availability', icon: Clock },
  { label: 'Preferences', icon: Globe2 },
  { label: 'Consent', icon: ShieldCheck },
  { label: 'Review', icon: FileCheck },
];

export default function AgentApplicationForm({ onDone, onCancel }: Props) {
  const { user, profile } = useAuth();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [countrySearch, setCountrySearch] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  // Personal
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [preferredName, setPreferredName] = useState('');
  const [email, setEmail] = useState(user?.email ?? '');
  const [mobilePhone, setMobilePhone] = useState('');
  const [contactMethod, setContactMethod] = useState('Email');
  const [referralSource, setReferralSource] = useState('');

  // Location
  const [countryName, setCountryName] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [region, setRegion] = useState('');
  const [city, setCity] = useState('');
  const [timeZone, setTimeZone] = useState('');
  const [workLocationType, setWorkLocationType] = useState('home');
  const [currentlyLocatedHere, setCurrentlyLocatedHere] = useState(true);
  const [locationClarification, setLocationClarification] = useState('');
  const [legallyAuthorized, setLegallyAuthorized] = useState('');

  // Experience
  const [yearsCS, setYearsCS] = useState(0);
  const [yearsBPO, setYearsBPO] = useState(0);
  const [yearsRemote, setYearsRemote] = useState(0);
  const [previousEmployers, setPreviousEmployers] = useState('');
  const [expFlags, setExpFlags] = useState<string[]>([]);
  const [experienceSummary, setExperienceSummary] = useState('');

  // Skills
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [otherSkills, setOtherSkills] = useState('');

  // Languages
  const [languages, setLanguages] = useState<{ language: string; proficiency: string; isPrimaryLocal: boolean }[]>([
    { language: '', proficiency: 'intermediate', isPrimaryLocal: false },
  ]);

  // Equipment
  const [hasComputer, setHasComputer] = useState(false);
  const [computerManufacturer, setComputerManufacturer] = useState('');
  const [computerModel, setComputerModel] = useState('');
  const [os, setOs] = useState('');
  const [processor, setProcessor] = useState('');
  const [ram, setRam] = useState('');
  const [hasHeadset, setHasHeadset] = useState(false);
  const [headsetModel, setHeadsetModel] = useState('');
  const [hasWebcam, setHasWebcam] = useState(false);
  const [dedicatedWorkspace, setDedicatedWorkspace] = useState(false);
  const [quietWorkspace, setQuietWorkspace] = useState(false);
  const [privateWorkspace, setPrivateWorkspace] = useState(false);
  const [hasBackupPower, setHasBackupPower] = useState(false);
  const [backupPowerDesc, setBackupPowerDesc] = useState('');

  // Internet
  const [primaryProvider, setPrimaryProvider] = useState('');
  const [connectionType, setConnectionType] = useState('');
  const [downloadSpeed, setDownloadSpeed] = useState('');
  const [uploadSpeed, setUploadSpeed] = useState('');
  const [backupProvider, setBackupProvider] = useState('');
  const [hasBackupInternet, setHasBackupInternet] = useState(false);

  // Availability
  const [availabilityType, setAvailabilityType] = useState('flexible');
  const [hoursPerWeek, setHoursPerWeek] = useState(0);
  const [daysAvailable, setDaysAvailable] = useState<string[]>([]);
  const [preferredShift, setPreferredShift] = useState('');
  const [earliestStart, setEarliestStart] = useState('');
  const [employmentStatus, setEmploymentStatus] = useState('');
  const [workableTimeZones, setWorkableTimeZones] = useState<string[]>([]);
  const [customTimeZone, setCustomTimeZone] = useState('');

  // Opportunity preferences
  const [opportunityPrefs, setOpportunityPrefs] = useState<string[]>([]);

  // Consent
  const [consentAccuracy, setConsentAccuracy] = useState(false);
  const [consentPrivacy, setConsentPrivacy] = useState(false);
  const [consentContact, setConsentContact] = useState(false);

  // Check for existing application
  const [existingApp, setExistingApp] = useState(false);
  useEffect(() => {
    if (user) {
      supabase
        .from('agent_applications')
        .select('id')
        .eq('agent_id', user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) setExistingApp(true);
        });
    }
  }, [user]);

  const filteredCountries = useMemo(() => {
    const q = countrySearch.toLowerCase();
    return COUNTRIES.filter((c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)).slice(0, 50);
  }, [countrySearch]);

  // Auto-suggest time zone from browser
  useEffect(() => {
    if (!timeZone) {
      const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (browserTz) {
        const offset = -new Date().getTimezoneOffset() / 60;
        const sign = offset >= 0 ? '+' : '-';
        const absOffset = Math.abs(offset);
        const tzStr = `UTC${sign}${String(absOffset).padStart(2, '0')}:00 (${browserTz})`;
        const match = TIME_ZONES.find((tz) => tz.startsWith(`UTC${sign}${String(absOffset).padStart(2, '0')}:00`));
        setTimeZone(match ?? tzStr);
      }
    }
  }, [timeZone]);

  function selectCountry(name: string, code: string) {
    setCountryName(name);
    setCountryCode(code);
    setCountrySearch(name);
    setShowCountryDropdown(false);
  }

  function toggleArr(arr: string[], val: string): string[] {
    return arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];
  }

  function next() {
    if (step < STEPS.length - 1) setStep(step + 1);
  }
  function prev() {
    if (step > 0) setStep(step - 1);
  }

  function canProceed(): boolean {
    switch (step) {
      case 0: return firstName.trim() !== '' && lastName.trim() !== '' && email.trim() !== '' && mobilePhone.trim() !== '';
      case 1: return countryName !== '' && legallyAuthorized !== '';
      case 9: return consentAccuracy && consentPrivacy && consentContact;
      default: return true;
    }
  }

  function computeCompletion(): number {
    let filled = 0;
    const total = 10;
    if (firstName && lastName && email && mobilePhone) filled++;
    if (countryName && legallyAuthorized) filled++;
    if (yearsCS || yearsBPO || yearsRemote || expFlags.length) filled++;
    if (selectedSkills.length) filled++;
    if (languages.some((l) => l.language)) filled++;
    if (hasComputer || hasHeadset || hasWebcam) filled++;
    if (primaryProvider) filled++;
    if (availabilityType && hoursPerWeek) filled++;
    if (opportunityPrefs.length) filled++;
    if (consentAccuracy && consentPrivacy && consentContact) filled++;
    return Math.round((filled / total) * 100);
  }

  async function submit() {
    if (!user) return;
    setError('');
    setSubmitting(true);
    try {
      const agentId = user.id;
      const completion = computeCompletion();
      const requiresReview = legallyAuthorized !== 'yes';

      // Upsert application
      const { data: appData, error: appError } = await supabase
        .from('agent_applications')
        .upsert(
          {
            agent_id: agentId,
            status: 'submitted',
            referral_source: referralSource,
            legally_authorized: legallyAuthorized,
            requires_review: requiresReview,
            experience_summary: experienceSummary,
            profile_completion: completion,
            submitted_at: new Date().toISOString(),
          },
          { onConflict: 'agent_id' }
        )
        .select('id')
        .maybeSingle();

      if (appError) throw appError;
      const appId = appData?.id;
      if (!appId) throw new Error('Failed to create application record.');

      // Status history
      await supabase.from('agent_status_history').insert({
        agent_id: agentId,
        status: 'submitted',
        changed_by: agentId,
        note: 'Application submitted',
      });

      // Location
      await supabase.from('agent_locations').upsert({
        agent_id: agentId,
        country_name: countryName,
        country_code: countryCode,
        region,
        city,
        time_zone: timeZone,
        work_location_type: workLocationType,
        currently_located_here: currentlyLocatedHere,
        location_clarification: currentlyLocatedHere ? '' : locationClarification,
      }, { onConflict: 'agent_id' });

      // Experience
      await supabase.from('agent_experience').upsert({
        agent_id: agentId,
        years_customer_service: yearsCS,
        years_bpo: yearsBPO,
        years_remote: yearsRemote,
        previous_employers: previousEmployers,
        has_customer_service: expFlags.includes('Customer Service'),
        has_sales: expFlags.includes('Sales'),
        has_technical_support: expFlags.includes('Technical Support'),
        has_billing: expFlags.includes('Billing'),
        has_collections: expFlags.includes('Collections'),
        has_chat_support: expFlags.includes('Chat Support'),
        has_email_support: expFlags.includes('Email Support'),
        has_admin_support: expFlags.includes('Administrative Support'),
        summary: experienceSummary,
      }, { onConflict: 'agent_id' });

      // Skills
      await supabase.from('agent_skills').delete().eq('agent_id', agentId);
      if (selectedSkills.length) {
        await supabase.from('agent_skills').insert(selectedSkills.map((s) => ({ agent_id: agentId, skill: s })));
      }
      await supabase.from('agent_skills_other').upsert({
        agent_id: agentId,
        skills_text: otherSkills,
      }, { onConflict: 'agent_id' });

      // Languages
      await supabase.from('agent_languages').delete().eq('agent_id', agentId);
      const validLangs = languages.filter((l) => l.language.trim());
      if (validLangs.length) {
        await supabase.from('agent_languages').insert(validLangs.map((l) => ({
          agent_id: agentId,
          language: l.language,
          proficiency: l.proficiency,
          is_primary_local: l.isPrimaryLocal,
        })));
      }

      // Equipment
      await supabase.from('agent_equipment').upsert({
        agent_id: agentId,
        has_computer: hasComputer,
        computer_manufacturer: computerManufacturer,
        computer_model: computerModel,
        os,
        processor,
        ram,
        has_headset: hasHeadset,
        headset_model: headsetModel,
        has_webcam: hasWebcam,
        dedicated_workspace: dedicatedWorkspace,
        quiet_workspace: quietWorkspace,
        private_workspace: privateWorkspace,
        has_backup_power: hasBackupPower,
        backup_power_description: backupPowerDesc,
      }, { onConflict: 'agent_id' });

      // Internet
      await supabase.from('agent_internet').upsert({
        agent_id: agentId,
        primary_provider: primaryProvider,
        connection_type: connectionType,
        download_speed: downloadSpeed,
        upload_speed: uploadSpeed,
        backup_provider: backupProvider,
        has_backup_internet: hasBackupInternet,
      }, { onConflict: 'agent_id' });

      // Availability
      await supabase.from('agent_availability').upsert({
        agent_id: agentId,
        availability_type: availabilityType,
        hours_per_week: hoursPerWeek,
        days_available: daysAvailable,
        preferred_shift: preferredShift,
        earliest_start_date: earliestStart || null,
        current_employment_status: employmentStatus,
        workable_time_zones: workableTimeZones,
        custom_time_zone: customTimeZone,
      }, { onConflict: 'agent_id' });

      // Opportunity preferences
      await supabase.from('agent_opportunity_preferences').delete().eq('agent_id', agentId);
      if (opportunityPrefs.length) {
        await supabase.from('agent_opportunity_preferences').insert(
          opportunityPrefs.map((p) => ({ agent_id: agentId, preference: p }))
        );
      }

      // Update profile name
      const fullName = `${firstName} ${middleName} ${lastName}`.replace(/\s+/g, ' ').trim();
      await supabase.from('profiles').update({
        full_name: fullName || profile?.full_name || '',
        phone: mobilePhone,
      }).eq('id', agentId);

      onDone();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  }

  if (existingApp) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <AlertCircle size={40} className="text-sky-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Application already submitted</h2>
          <p className="text-slate-400 text-sm mb-6">You have already submitted an application. You can track its status from your dashboard.</p>
          <button onClick={onDone} className="px-6 py-3 bg-sky-500 hover:bg-sky-400 text-white font-semibold rounded-xl transition-all">
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={onCancel} className="text-slate-400 hover:text-white text-sm transition-colors flex items-center gap-1">
            <ArrowLeft size={16} /> Cancel
          </button>
          <p className="text-slate-500 text-xs">Step {step + 1} of {STEPS.length}</p>
        </div>

        {/* Progress bar */}
        <div className="flex gap-1 mb-8 overflow-x-auto pb-2">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-1 shrink-0">
              <div className={`flex flex-col items-center gap-1 ${i <= step ? 'opacity-100' : 'opacity-40'}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  i === step ? 'bg-sky-500 text-white' : i < step ? 'bg-sky-500/20 text-sky-400' : 'bg-slate-800 text-slate-500'
                }`}>
                  {i < step ? <CheckCircle2 size={16} /> : <s.icon size={15} />}
                </div>
                <span className="text-[10px] text-slate-500 hidden sm:block">{s.label}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`w-4 h-px ${i < step ? 'bg-sky-500/40' : 'bg-slate-800'}`} />}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="bg-slate-900/60 border border-white/8 rounded-2xl p-6">
          {/* STEP 0: Personal */}
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white mb-1">Personal Information</h2>
              <p className="text-slate-500 text-sm mb-4">Tell us about yourself. We do not collect sensitive information at this stage.</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="First Name" required><TextInput value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Jane" /></Field>
                <Field label="Middle Name"><TextInput value={middleName} onChange={(e) => setMiddleName(e.target.value)} placeholder="(optional)" /></Field>
                <Field label="Last Name" required><TextInput value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Smith" /></Field>
                <Field label="Preferred Name"><TextInput value={preferredName} onChange={(e) => setPreferredName(e.target.value)} placeholder="Jane" /></Field>
                <Field label="Email Address" required><TextInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" /></Field>
                <Field label="Mobile Phone Number" required><TextInput value={mobilePhone} onChange={(e) => setMobilePhone(e.target.value)} placeholder="+1 555 000 0000" /></Field>
                <Field label="Preferred Contact Method">
                  <Select value={contactMethod} onChange={(e) => setContactMethod(e.target.value)}>
                    {CONTACT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                  </Select>
                </Field>
                <Field label="How did you hear about us?">
                  <Select value={referralSource} onChange={(e) => setReferralSource(e.target.value)}>
                    <option value="">Select...</option>
                    {REFERRAL_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </Select>
                </Field>
              </div>
            </div>
          )}

          {/* STEP 1: Location */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white mb-1">Country of Residence</h2>
              <p className="text-slate-500 text-sm mb-4">We recruit from multiple countries. Your country of residence helps us match you with eligible opportunities.</p>

              <Field label="Country" required>
                <div className="relative">
                  <TextInput
                    value={countrySearch}
                    onChange={(e) => { setCountrySearch(e.target.value); setShowCountryDropdown(true); }}
                    onFocus={() => { setShowCountryDropdown(true); setCountrySearch(countryName); }}
                    placeholder="Search countries worldwide..."
                  />
                  {showCountryDropdown && (
                    <div className="absolute z-10 mt-1 w-full max-h-56 overflow-y-auto bg-slate-800 border border-white/10 rounded-xl shadow-xl">
                      {filteredCountries.length === 0 ? (
                        <p className="px-4 py-3 text-slate-500 text-sm">No countries found</p>
                      ) : filteredCountries.map((c) => (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => selectCountry(c.name, c.code)}
                          className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-slate-300 hover:bg-sky-500/10 hover:text-white transition-colors text-left"
                        >
                          <span>{c.name}</span>
                          <span className="text-slate-600 text-xs">{c.code}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {countryName && (
                  <p className="text-xs text-slate-500 mt-1">Selected: {countryName} ({countryCode})</p>
                )}
              </Field>

              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="State / Province / Region"><TextInput value={region} onChange={(e) => setRegion(e.target.value)} placeholder="e.g. Metro Manila" /></Field>
                <Field label="City"><TextInput value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Makati" /></Field>
              </div>

              <Field label="Time Zone" hint="Auto-detected from your browser. You can change it.">
                <Select value={timeZone} onChange={(e) => setTimeZone(e.target.value)}>
                  <option value="">Select your time zone...</option>
                  {TIME_ZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
                </Select>
              </Field>

              <Field label="Primary Work Location">
                <RadioGroup
                  options={[{ value: 'home', label: 'Home' }, { value: 'other_remote', label: 'Other approved remote location' }]}
                  value={workLocationType}
                  onChange={setWorkLocationType}
                />
              </Field>

              <Field label="Are you currently located in the country listed above?" required>
                <RadioGroup
                  options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]}
                  value={currentlyLocatedHere ? 'yes' : 'no'}
                  onChange={(v) => setCurrentlyLocatedHere(v === 'yes')}
                />
              </Field>

              {!currentlyLocatedHere && (
                <Field label="Please clarify your current location" required>
                  <TextArea value={locationClarification} onChange={(e) => setLocationClarification(e.target.value)} rows={2} placeholder="Explain your current location..." />
                </Field>
              )}

              <Field label="Are you legally authorized to work or provide services from your current location?" required
                hint="If you select No or Not sure, your application will be flagged for recruiter review rather than being rejected.">
                <RadioGroup
                  options={[
                    { value: 'yes', label: 'Yes' },
                    { value: 'no', label: 'No' },
                    { value: 'not_sure', label: 'Not sure' },
                  ]}
                  value={legallyAuthorized}
                  onChange={setLegallyAuthorized}
                />
              </Field>
            </div>
          )}

          {/* STEP 2: Experience */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white mb-1">Professional Experience</h2>
              <p className="text-slate-500 text-sm mb-4">Tell us about your relevant work experience.</p>
              <div className="grid sm:grid-cols-3 gap-4">
                <Field label="Years of customer service experience">
                  <Select value={String(yearsCS)} onChange={(e) => setYearsCS(Number(e.target.value))}>
                    {[0,1,2,3,4,5,6,7,8,9,10,15,20].map((n) => <option key={n} value={n}>{n}+</option>)}
                  </Select>
                </Field>
                <Field label="Years of BPO / call-center experience">
                  <Select value={String(yearsBPO)} onChange={(e) => setYearsBPO(Number(e.target.value))}>
                    {[0,1,2,3,4,5,6,7,8,9,10,15,20].map((n) => <option key={n} value={n}>{n}+</option>)}
                  </Select>
                </Field>
                <Field label="Years of work-from-home experience">
                  <Select value={String(yearsRemote)} onChange={(e) => setYearsRemote(Number(e.target.value))}>
                    {[0,1,2,3,4,5,6,7,8,9,10,15,20].map((n) => <option key={n} value={n}>{n}+</option>)}
                  </Select>
                </Field>
              </div>
              <Field label="Previous employer(s)"><TextArea value={previousEmployers} onChange={(e) => setPreviousEmployers(e.target.value)} rows={2} placeholder="List previous employers (optional)" /></Field>
              <Field label="Which of these areas do you have experience in?">
                <CheckboxGroup
                  options={['Customer Service', 'Sales', 'Technical Support', 'Billing', 'Collections', 'Chat Support', 'Email Support', 'Administrative Support']}
                  selected={expFlags}
                  onToggle={(v) => setExpFlags((prev) => toggleArr(prev, v))}
                  columns={2}
                />
              </Field>
              <Field label="Tell us briefly about your customer service, BPO, or remote-work experience.">
                <TextArea value={experienceSummary} onChange={(e) => setExperienceSummary(e.target.value)} rows={4} placeholder="Describe your experience..." />
              </Field>
            </div>
          )}

          {/* STEP 3: Skills */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white mb-1">Skills</h2>
              <p className="text-slate-500 text-sm mb-4">Select all skills that apply to you.</p>
              <Field label="Select your skills">
                <CheckboxGroup options={SKILL_OPTIONS} selected={selectedSkills} onToggle={(v) => setSelectedSkills((prev) => toggleArr(prev, v))} columns={2} />
              </Field>
              <Field label="Additional skills (optional)"><TextArea value={otherSkills} onChange={(e) => setOtherSkills(e.target.value)} rows={3} placeholder="List any other skills..." /></Field>
            </div>
          )}

          {/* STEP 4: Languages */}
          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white mb-1">Language Skills</h2>
              <p className="text-slate-500 text-sm mb-4">Add all languages you speak. Do not assume English is your primary language.</p>
              {languages.map((lang, i) => (
                <div key={i} className="flex flex-col sm:flex-row gap-2 items-start sm:items-end">
                  <div className="flex-1 w-full">
                    <Field label={`Language ${i + 1}`}>
                      <TextInput value={lang.language} onChange={(e) => setLanguages((prev) => prev.map((l, idx) => idx === i ? { ...l, language: e.target.value } : l))} placeholder="e.g. English, Tagalog, Spanish" />
                    </Field>
                  </div>
                  <div className="w-full sm:w-40">
                    <Field label="Proficiency">
                      <Select value={lang.proficiency} onChange={(e) => setLanguages((prev) => prev.map((l, idx) => idx === i ? { ...l, proficiency: e.target.value } : l))}>
                        {PROFICIENCY_LEVELS.map((p) => <option key={p} value={p.toLowerCase()}>{p}</option>)}
                      </Select>
                    </Field>
                  </div>
                  <div className="w-full sm:w-auto flex items-center gap-3 pb-2">
                    <Toggle label="Primary local" checked={lang.isPrimaryLocal} onChange={(v) => setLanguages((prev) => prev.map((l, idx) => idx === i ? { ...l, isPrimaryLocal: v } : l))} />
                  </div>
                  {languages.length > 1 && (
                    <button type="button" onClick={() => setLanguages((prev) => prev.filter((_, idx) => idx !== i))} className="text-slate-500 hover:text-red-400 transition-colors pb-2.5">
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={() => setLanguages((prev) => [...prev, { language: '', proficiency: 'intermediate', isPrimaryLocal: false }])} className="text-sky-400 hover:text-sky-300 text-sm font-medium transition-colors">
                + Add another language
              </button>
            </div>
          )}

          {/* STEP 5: Equipment */}
          {step === 5 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white mb-1">Equipment</h2>
              <p className="text-slate-500 text-sm mb-4">Tell us about your work-from-home equipment.</p>

              <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
                <span className="text-sm text-slate-300">Do you have a computer or laptop?</span>
                <Toggle label={hasComputer ? 'Yes' : 'No'} checked={hasComputer} onChange={setHasComputer} />
              </div>
              {hasComputer && (
                <div className="grid sm:grid-cols-2 gap-4 pl-3 border-l-2 border-sky-500/20">
                  <Field label="Manufacturer"><TextInput value={computerManufacturer} onChange={(e) => setComputerManufacturer(e.target.value)} placeholder="e.g. Dell, HP, Lenovo" /></Field>
                  <Field label="Model"><TextInput value={computerModel} onChange={(e) => setComputerModel(e.target.value)} placeholder="e.g. XPS 15" /></Field>
                  <Field label="Operating System"><TextInput value={os} onChange={(e) => setOs(e.target.value)} placeholder="e.g. Windows 11, macOS 14" /></Field>
                  <Field label="Processor"><TextInput value={processor} onChange={(e) => setProcessor(e.target.value)} placeholder="e.g. Intel i7, AMD Ryzen 5" /></Field>
                  <Field label="RAM"><TextInput value={ram} onChange={(e) => setRam(e.target.value)} placeholder="e.g. 16GB" /></Field>
                </div>
              )}

              <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
                <span className="text-sm text-slate-300">Do you have a headset?</span>
                <Toggle label={hasHeadset ? 'Yes' : 'No'} checked={hasHeadset} onChange={setHasHeadset} />
              </div>
              {hasHeadset && (
                <div className="pl-3 border-l-2 border-sky-500/20">
                  <Field label="Headset manufacturer / model"><TextInput value={headsetModel} onChange={(e) => setHeadsetModel(e.target.value)} placeholder="e.g. Jabra Evolve2 65" /></Field>
                </div>
              )}

              <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
                <span className="text-sm text-slate-300">Do you have a webcam?</span>
                <Toggle label={hasWebcam ? 'Yes' : 'No'} checked={hasWebcam} onChange={setHasWebcam} />
              </div>

              <div className="space-y-2 p-3 bg-slate-800/50 rounded-xl">
                <p className="text-sm text-slate-300 mb-2">Workspace</p>
                <Toggle label="Dedicated workspace?" checked={dedicatedWorkspace} onChange={setDedicatedWorkspace} />
                <Toggle label="Quiet workspace?" checked={quietWorkspace} onChange={setQuietWorkspace} />
                <Toggle label="Private workspace?" checked={privateWorkspace} onChange={setPrivateWorkspace} />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
                <span className="text-sm text-slate-300">Do you have backup power?</span>
                <Toggle label={hasBackupPower ? 'Yes' : 'No'} checked={hasBackupPower} onChange={setHasBackupPower} />
              </div>
              {hasBackupPower && (
                <div className="pl-3 border-l-2 border-sky-500/20">
                  <Field label="Description"><TextArea value={backupPowerDesc} onChange={(e) => setBackupPowerDesc(e.target.value)} rows={2} placeholder="e.g. UPS, generator" /></Field>
                </div>
              )}
            </div>
          )}

          {/* STEP 6: Internet */}
          {step === 6 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white mb-1">Internet Connection</h2>
              <p className="text-slate-500 text-sm mb-4">Tell us about your internet setup. We do not ask for passwords or account credentials.</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Primary Internet Provider"><TextInput value={primaryProvider} onChange={(e) => setPrimaryProvider(e.target.value)} placeholder="e.g. PLDT, Comcast" /></Field>
                <Field label="Connection Type">
                  <Select value={connectionType} onChange={(e) => setConnectionType(e.target.value)}>
                    <option value="">Select...</option>
                    <option value="fiber">Fiber</option>
                    <option value="cable">Cable</option>
                    <option value="dsl">DSL</option>
                    <option value="wireless">Wireless</option>
                    <option value="satellite">Satellite</option>
                    <option value="mobile">Mobile / Cellular</option>
                  </Select>
                </Field>
                <Field label="Download Speed"><TextInput value={downloadSpeed} onChange={(e) => setDownloadSpeed(e.target.value)} placeholder="e.g. 50 Mbps" /></Field>
                <Field label="Upload Speed"><TextInput value={uploadSpeed} onChange={(e) => setUploadSpeed(e.target.value)} placeholder="e.g. 10 Mbps" /></Field>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
                <span className="text-sm text-slate-300">Do you have backup internet?</span>
                <Toggle label={hasBackupInternet ? 'Yes' : 'No'} checked={hasBackupInternet} onChange={setHasBackupInternet} />
              </div>
              {hasBackupInternet && (
                <div className="pl-3 border-l-2 border-sky-500/20">
                  <Field label="Backup Internet Provider"><TextInput value={backupProvider} onChange={(e) => setBackupProvider(e.target.value)} placeholder="e.g. Globe, Verizon" /></Field>
                </div>
              )}
              <p className="text-slate-600 text-xs">An optional internet speed-test screenshot can be uploaded later during onboarding.</p>
            </div>
          )}

          {/* STEP 7: Availability */}
          {step === 7 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white mb-1">Availability</h2>
              <p className="text-slate-500 text-sm mb-4">Tell us when you're available to work.</p>
              <Field label="Availability Type">
                <RadioGroup
                  options={[{ value: 'full_time', label: 'Full-time' }, { value: 'part_time', label: 'Part-time' }, { value: 'flexible', label: 'Flexible' }]}
                  value={availabilityType}
                  onChange={setAvailabilityType}
                />
              </Field>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Hours available per week">
                  <Select value={String(hoursPerWeek)} onChange={(e) => setHoursPerWeek(Number(e.target.value))}>
                    {[0,5,10,15,20,25,30,35,40,45,50,55,60].map((n) => <option key={n} value={n}>{n}+ hrs</option>)}
                  </Select>
                </Field>
                <Field label="Preferred Shift">
                  <Select value={preferredShift} onChange={(e) => setPreferredShift(e.target.value)}>
                    <option value="">Select...</option>
                    <option value="day">Day</option>
                    <option value="evening">Evening</option>
                    <option value="night">Night / Overnight</option>
                    <option value="rotating">Rotating</option>
                    <option value="any">Any</option>
                  </Select>
                </Field>
                <Field label="Earliest Start Date"><TextInput type="date" value={earliestStart} onChange={(e) => setEarliestStart(e.target.value)} /></Field>
                <Field label="Current Employment Status">
                  <Select value={employmentStatus} onChange={(e) => setEmploymentStatus(e.target.value)}>
                    <option value="">Select...</option>
                    <option value="unemployed">Not currently employed</option>
                    <option value="employed">Currently employed</option>
                    <option value="self_employed">Self-employed</option>
                    <option value="student">Student</option>
                  </Select>
                </Field>
              </div>
              <Field label="Days Available">
                <CheckboxGroup options={DAYS_OF_WEEK} selected={daysAvailable} onToggle={(v) => setDaysAvailable((prev) => toggleArr(prev, v))} columns={3} />
              </Field>
              <Field label="Which time zones are you able to work?" hint="Select all that apply.">
                <CheckboxGroup options={WORKABLE_TIME_ZONES} selected={workableTimeZones} onToggle={(v) => setWorkableTimeZones((prev) => toggleArr(prev, v))} columns={2} />
              </Field>
              {workableTimeZones.includes('Other') && (
                <Field label="Specify your own time zone"><TextInput value={customTimeZone} onChange={(e) => setCustomTimeZone(e.target.value)} placeholder="e.g. UTC+08:00" /></Field>
              )}
            </div>
          )}

          {/* STEP 8: Opportunity Preferences */}
          {step === 8 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white mb-1">Opportunity Preferences</h2>
              <p className="text-slate-500 text-sm mb-4">What types of opportunities interest you? Select all that apply.</p>
              <Field label="Preferred opportunity types">
                <CheckboxGroup options={OPPORTUNITY_PREFERENCE_OPTIONS} selected={opportunityPrefs} onToggle={(v) => setOpportunityPrefs((prev) => toggleArr(prev, v))} columns={2} />
              </Field>
            </div>
          )}

          {/* STEP 9: Consent */}
          {step === 9 && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-white mb-1">Verification & Consent</h2>
              <p className="text-slate-500 text-sm mb-4">Please review and acknowledge the following.</p>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={consentAccuracy} onChange={(e) => setConsentAccuracy(e.target.checked)} className="mt-0.5 w-4 h-4 rounded border-slate-600 text-sky-500 focus:ring-sky-500" />
                <span className="text-sm text-slate-300">I confirm that the information I have provided is accurate and complete to the best of my knowledge.</span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={consentPrivacy} onChange={(e) => setConsentPrivacy(e.target.checked)} className="mt-0.5 w-4 h-4 rounded border-slate-600 text-sky-500 focus:ring-sky-500" />
                <span className="text-sm text-slate-300">I have read and agree to the Privacy Policy regarding how my personal information is collected, used, and shared.</span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={consentContact} onChange={(e) => setConsentContact(e.target.checked)} className="mt-0.5 w-4 h-4 rounded border-slate-600 text-sky-500 focus:ring-sky-500" />
                <span className="text-sm text-slate-300">I consent to be contacted about my application and potential opportunities that match my profile.</span>
              </label>
              <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-4 mt-4">
                <p className="text-amber-400/90 text-xs leading-relaxed">
                  Joining the agent pool does not guarantee employment, hours, income, or placement with a particular client.
                  Opportunities are subject to qualification, client requirements, location eligibility, training, certification, registration, and availability.
                </p>
              </div>
            </div>
          )}

          {/* STEP 10: Review */}
          {step === 10 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white mb-1">Review & Submit</h2>
              <p className="text-slate-500 text-sm mb-4">Please review your information before submitting.</p>
              <div className="space-y-3">
                <ReviewItem label="Name" value={`${firstName} ${lastName}`} />
                <ReviewItem label="Email" value={email} />
                <ReviewItem label="Phone" value={mobilePhone} />
                <ReviewItem label="Country" value={countryName ? `${countryName} (${countryCode})` : '—'} />
                <ReviewItem label="Region / City" value={`${region || '—'} / ${city || '—'}`} />
                <ReviewItem label="Time Zone" value={timeZone || '—'} />
                <ReviewItem label="Legally Authorized" value={legallyAuthorized === 'yes' ? 'Yes' : legallyAuthorized === 'no' ? 'No' : 'Not sure'} />
                <ReviewItem label="Experience" value={`${yearsCS}y CS, ${yearsBPO}y BPO, ${yearsRemote}y remote`} />
                <ReviewItem label="Skills" value={selectedSkills.length ? selectedSkills.join(', ') : '—'} />
                <ReviewItem label="Languages" value={languages.filter((l) => l.language).map((l) => `${l.language} (${l.proficiency})`).join(', ') || '—'} />
                <ReviewItem label="Equipment" value={`${hasComputer ? 'Computer' : ''} ${hasHeadset ? 'Headset' : ''} ${hasWebcam ? 'Webcam' : ''}`.trim() || '—'} />
                <ReviewItem label="Availability" value={`${availabilityType}, ${hoursPerWeek}+ hrs/week`} />
                <ReviewItem label="Workable Time Zones" value={workableTimeZones.length ? workableTimeZones.join(', ') : '—'} />
                <ReviewItem label="Opportunity Preferences" value={opportunityPrefs.length ? opportunityPrefs.join(', ') : '—'} />
              </div>
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">{error}</div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-6 pt-5 border-t border-white/5">
            <button
              onClick={prev}
              disabled={step === 0}
              className="flex items-center gap-1.5 px-4 py-2.5 border border-white/10 text-slate-300 hover:text-white rounded-xl text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ArrowLeft size={16} /> Back
            </button>
            {step < STEPS.length - 1 ? (
              <button
                onClick={next}
                disabled={!canProceed()}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-sky-500 hover:bg-sky-400 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-all"
              >
                Next <ArrowRight size={16} />
              </button>
            ) : (
              <button
                onClick={submit}
                disabled={submitting}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition-all"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                Submit Application
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start gap-4 py-2 border-b border-white/5 last:border-0">
      <span className="text-slate-500 text-sm shrink-0">{label}</span>
      <span className="text-slate-200 text-sm text-right">{value}</span>
    </div>
  );
}
