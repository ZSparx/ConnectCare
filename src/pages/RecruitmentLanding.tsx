import { useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  Headset,
  TrendingUp,
  Wrench,
  CreditCard,
  MessageSquare,
  ClipboardList,
  Globe2,
  Users,
  ArrowRight,
  CheckCircle2,
  Search,
  FileText,
  Monitor,
  GraduationCap,
  Network,
  Clock,
  DollarSign,
  ShieldCheck,
  Languages,
  Home,
  Send,
  Loader2,
  Menu,
  X,
  Building2,
  Mail,
} from 'lucide-react';

type Props = {
  onApply: () => void;
  onLearnMore?: () => void;
  onSignIn: () => void;
  onPrivacy: () => void;
};

const SERVICES = [
  { icon: Headset, title: 'Customer Service', desc: 'Inbound and outbound customer support delivered by trained professionals who represent your brand with care.' },
  { icon: TrendingUp, title: 'Sales & Lead Gen', desc: 'Inbound sales, outbound prospecting, and lead qualification to grow your pipeline and close more deals.' },
  { icon: Wrench, title: 'Technical Support', desc: 'Tier 1–3 technical assistance, troubleshooting, and product guidance for your customers.' },
  { icon: CreditCard, title: 'Billing & Collections', desc: 'Billing inquiries, payment processing, and accounts-receivable collections handled with professionalism.' },
  { icon: MessageSquare, title: 'Chat & Email Support', desc: 'Omnichannel support across live chat, email, and social messaging — wherever your customers are.' },
  { icon: ClipboardList, title: 'Back-Office Support', desc: 'Data entry, order processing, scheduling, and administrative tasks that keep your operations running.' },
];

const CLIENT_BENEFITS = [
  { icon: Users, title: 'Scalable Staffing', desc: 'Scale your team up or down based on seasonal demand without the overhead of hiring and training.' },
  { icon: DollarSign, title: 'Reduced Overhead', desc: 'No office space, equipment, or benefits to manage. You pay for productive hours, not idle time.' },
  { icon: ShieldCheck, title: 'Quality Assurance', desc: 'Every agent is screened, trained, and monitored to ensure consistent, high-quality service.' },
  { icon: Clock, title: '24/7 Coverage', desc: 'Around-the-clock support across multiple time zones so your customers are never left waiting.' },
];

const AGENT_BENEFITS = [
  { icon: Home, title: 'Work From Home', desc: 'Skip the commute. Work from the comfort of your own home with a flexible, remote setup.' },
  { icon: Clock, title: 'Flexible Hours', desc: 'Choose full-time, part-time, or flexible schedules that fit your life and commitments.' },
  { icon: Globe2, title: 'Global Opportunities', desc: 'Access remote opportunities with clients across multiple countries and industries.' },
  { icon: GraduationCap, title: 'Grow Your Skills', desc: 'Gain experience across customer service, sales, tech support, and more — all from home.' },
];

const STEPS = [
  { icon: FileText, title: 'Submit your application', desc: 'Complete the online application form with your details.' },
  { icon: Search, title: 'Our recruiting team reviews your information', desc: 'A recruiter evaluates your qualifications and experience.' },
  { icon: Users, title: 'Complete screening and/or interview', desc: 'Participate in a screening call or interview as requested.' },
  { icon: Monitor, title: 'Verify your work-from-home setup', desc: 'Confirm your equipment and internet meet remote-work requirements.' },
  { icon: GraduationCap, title: 'Complete registration, training, or certification', desc: 'Complete any required steps for your target opportunities.' },
  { icon: Network, title: 'Join our qualified agent pool', desc: 'Become part of our network of qualified virtual call-center professionals.' },
  { icon: CheckCircle2, title: 'Be considered for available opportunities', desc: 'Be considered for opportunities that match your qualifications, location, and availability.' },
];

const SERVICE_OPTIONS = [
  'Customer Service',
  'Sales & Lead Generation',
  'Technical Support',
  'Billing & Collections',
  'Chat & Email Support',
  'Back-Office Support',
  'Not sure yet',
];

export default function RecruitmentLanding({ onApply, onSignIn, onPrivacy }: Props) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [form, setForm] = useState({
    company_name: '',
    contact_name: '',
    email: '',
    phone: '',
    service_interest: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState('');

  function scrollTo(id: string) {
    setMobileNavOpen(false);
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: 'smooth' });
  }

  async function handleInquirySubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    if (!form.company_name.trim() || !form.contact_name.trim() || !form.email.trim() || !form.service_interest) {
      setFormError('Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from('client_inquiries').insert({
      company_name: form.company_name.trim(),
      contact_name: form.contact_name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      service_interest: form.service_interest,
      message: form.message.trim(),
    });
    setSubmitting(false);
    if (error) {
      setFormError('Something went wrong. Please try again.');
      return;
    }
    setSubmitted(true);
    setForm({ company_name: '', contact_name: '', email: '', phone: '', service_interest: '', message: '' });
  }

  const navLinks = [
    { label: 'Services', id: 'services' },
    { label: 'Why Us', id: 'why-us' },
    { label: 'For Clients', id: 'inquiry' },
    { label: 'For Agents', id: 'how-it-works' },
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      {/* ─── Navigation ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center shadow-lg shadow-sky-500/30">
              <Headset size={18} className="text-white" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-white font-bold text-lg tracking-tight">Connect</span>
              <span className="text-sky-400 font-bold text-lg tracking-tight">Care</span>
            </div>
            <span className="hidden sm:block ml-2 px-2 py-0.5 bg-sky-500/10 border border-sky-500/20 rounded-md text-xs font-medium text-sky-400 tracking-wide">
              BPO SERVICES
            </span>
          </div>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollTo(link.id)}
                className="px-3 py-2 text-slate-400 hover:text-white text-sm font-medium transition-colors"
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={onSignIn}
              className="px-3 py-2 text-slate-400 hover:text-white text-sm font-medium transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={onApply}
              className="flex items-center gap-1.5 px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white text-sm font-semibold rounded-lg transition-all shadow-lg shadow-sky-500/20"
            >
              Become an Agent
              <ArrowRight size={15} />
            </button>
          </div>

          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="md:hidden text-slate-300 hover:text-white"
          >
            {mobileNavOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile nav */}
        {mobileNavOpen && (
          <div className="md:hidden bg-slate-950/95 border-b border-white/8 px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollTo(link.id)}
                className="block w-full text-left px-3 py-2.5 text-slate-400 hover:text-white text-sm font-medium transition-colors"
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => { setMobileNavOpen(false); onSignIn(); }}
              className="block w-full text-left px-3 py-2.5 text-slate-400 hover:text-white text-sm font-medium transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => { setMobileNavOpen(false); onApply(); }}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-white text-sm font-semibold rounded-lg transition-all"
            >
              Become an Agent
              <ArrowRight size={15} />
            </button>
          </div>
        )}
      </nav>

      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden pt-32 pb-20">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-900/30 via-slate-950 to-slate-950" />
        <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-sky-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute top-20 right-1/4 w-[500px] h-[300px] bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-500/10 border border-sky-500/20 rounded-full text-sky-400 text-xs font-medium mb-6">
            <Globe2 size={14} />
            Professional Virtual Call Center & BPO Services
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            Premium BPO Services.<br />
            <span className="text-sky-400">Flexible Remote Careers.</span>
          </h1>
          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto mb-4">
            We connect companies with skilled virtual call-center professionals — and help people find rewarding work-from-home opportunities that fit their lives.
          </p>
          <p className="text-slate-500 text-sm sm:text-base max-w-2xl mx-auto mb-10">
            Customer service, sales, technical support, and back-office solutions delivered by a global talent pool — built for the modern remote workforce.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => scrollTo('inquiry')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 bg-sky-500 hover:bg-sky-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-sky-500/25"
            >
              Get a Quote
              <ArrowRight size={18} />
            </button>
            <button
              onClick={onApply}
              className="w-full sm:w-auto px-7 py-3.5 border border-white/15 text-slate-200 hover:text-white hover:border-white/25 font-semibold rounded-xl transition-all"
            >
              Become an Agent
            </button>
          </div>
        </div>

        {/* Trust bar */}
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Clock, label: '24/7 Coverage' },
              { icon: Globe2, label: 'Global Talent Pool' },
              { icon: Languages, label: 'Multilingual Support' },
              { icon: Users, label: 'Flexible Scaling' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center justify-center gap-2.5 bg-slate-900/60 border border-white/8 rounded-xl py-4 px-3">
                <Icon size={18} className="text-sky-400 shrink-0" />
                <span className="text-slate-300 text-sm font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Services ─── */}
      <section id="services" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">Our Services</h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
            Comprehensive BPO solutions designed to scale with your business and deliver exceptional customer experiences.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="group bg-slate-900/60 border border-white/8 rounded-2xl p-6 hover:border-sky-500/30 hover:bg-slate-900/80 transition-all duration-200"
            >
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 flex items-center justify-center mb-4 group-hover:bg-sky-500/20 transition-colors">
                <Icon size={22} className="text-sky-400" />
              </div>
              <h3 className="text-white font-semibold text-base mb-2">{title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Why Choose Us ─── */}
      <section id="why-us" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">Why Choose Connect Care</h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
            Whether you're a company looking to scale support or a professional seeking remote work, we've built something for you.
          </p>
        </div>
        <div className="grid gap-8 lg:grid-cols-2">
          {/* For Companies */}
          <div className="bg-slate-900/60 border border-white/8 rounded-2xl p-7">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-sky-500/15 flex items-center justify-center">
                <Building2 size={20} className="text-sky-400" />
              </div>
              <h3 className="text-white font-bold text-lg">For Companies</h3>
            </div>
            <div className="space-y-4">
              {CLIENT_BENEFITS.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-sky-500/10 flex items-center justify-center shrink-0">
                    <Icon size={17} className="text-sky-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm mb-0.5">{title}</p>
                    <p className="text-slate-500 text-xs leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* For Agents */}
          <div className="bg-slate-900/60 border border-white/8 rounded-2xl p-7">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                <Home size={20} className="text-emerald-400" />
              </div>
              <h3 className="text-white font-bold text-lg">For Agents</h3>
            </div>
            <div className="space-y-4">
              {AGENT_BENEFITS.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <Icon size={17} className="text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm mb-0.5">{title}</p>
                    <p className="text-slate-500 text-xs leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Client Inquiry Form ─── */}
      <section id="inquiry" className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-950/40 via-slate-950 to-slate-950" />
        <div className="absolute bottom-0 right-1/3 w-[500px] h-[300px] bg-sky-500/8 rounded-full blur-3xl" />
        <div className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-500/10 border border-sky-500/20 rounded-full text-sky-400 text-xs font-medium mb-5">
              <Mail size={14} />
              Get in Touch
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">Let's Talk About Your Needs</h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-lg mx-auto">
              Tell us about your business and what you're looking for. Our team will get back to you by email within one business day.
            </p>
          </div>

          {submitted ? (
            <div className="bg-slate-900/80 border border-emerald-500/20 rounded-2xl p-10 text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={28} className="text-emerald-400" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Thank you for your inquiry!</h3>
              <p className="text-slate-400 text-sm mb-6">
                We've received your request and will follow up with you at the email you provided within one business day.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="px-5 py-2.5 border border-white/15 text-slate-200 hover:text-white hover:border-white/25 text-sm font-medium rounded-xl transition-all"
              >
                Submit Another Inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleInquirySubmit} className="bg-slate-900/80 border border-white/10 rounded-2xl p-6 sm:p-8 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Company Name <span className="text-sky-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.company_name}
                    onChange={(e) => setForm((f) => ({ ...f, company_name: e.target.value }))}
                    placeholder="Acme Corp"
                    className="w-full bg-slate-800 border border-white/10 text-white placeholder-slate-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Your Name <span className="text-sky-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.contact_name}
                    onChange={(e) => setForm((f) => ({ ...f, contact_name: e.target.value }))}
                    placeholder="John Doe"
                    className="w-full bg-slate-800 border border-white/10 text-white placeholder-slate-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Work Email <span className="text-sky-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="john@acme.com"
                    className="w-full bg-slate-800 border border-white/10 text-white placeholder-slate-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Phone <span className="text-slate-600 text-xs">(optional)</span>
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    placeholder="+1 (555) 123-4567"
                    className="w-full bg-slate-800 border border-white/10 text-white placeholder-slate-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Service of Interest <span className="text-sky-400">*</span>
                </label>
                <div className="relative">
                  <select
                    required
                    value={form.service_interest}
                    onChange={(e) => setForm((f) => ({ ...f, service_interest: e.target.value }))}
                    className="w-full bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-2.5 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all appearance-none"
                  >
                    <option value="">Select a service...</option>
                    {SERVICE_OPTIONS.map((s) => (
                      <option key={s} value={s} className="bg-slate-800">{s}</option>
                    ))}
                  </select>
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Tell us about your needs <span className="text-slate-600 text-xs">(optional)</span>
                </label>
                <textarea
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  placeholder="Describe your business, the volume of support you need, timelines, or any questions you have..."
                  className="w-full bg-slate-800 border border-white/10 text-white placeholder-slate-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all resize-none"
                />
              </div>

              {formError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
                  {formError}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 px-7 py-3.5 bg-sky-500 hover:bg-sky-400 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all shadow-lg shadow-sky-500/25"
              >
                {submitting ? (
                  <><Loader2 size={18} className="animate-spin" /> Sending...</>
                ) : (
                  <>Submit Inquiry <Send size={17} /></>
                )}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* ─── How It Works (For Agents) ─── */}
      <section id="how-it-works" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-medium mb-5">
            <Users size={14} />
            For Agents
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">How to Join Our Agent Pool</h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
            From application to our qualified agent pool — here's the process to start your remote career.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {STEPS.map((step, i) => (
            <div
              key={i}
              className="bg-slate-900/60 border border-white/8 rounded-2xl p-5 hover:border-emerald-500/25 transition-all duration-200"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <step.icon size={18} className="text-emerald-400" />
                </div>
                <span className="text-slate-600 text-xs font-bold">Step {i + 1}</span>
              </div>
              <h3 className="text-white font-semibold text-sm mb-1.5">{step.title}</h3>
              <p className="text-slate-500 text-xs leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 bg-amber-500/5 border border-amber-500/15 rounded-xl p-5 text-center">
          <p className="text-amber-400/90 text-sm">
            Joining the agent pool does not guarantee employment, hours, income, or placement with a particular client.
            Opportunities are subject to qualification, client requirements, location eligibility, and availability.
          </p>
        </div>
        <div className="mt-8 text-center">
          <button
            onClick={onApply}
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/25"
          >
            Apply to Become an Agent
            <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-white/8 bg-slate-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center shadow-lg shadow-sky-500/30">
                  <Headset size={18} className="text-white" />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-white font-bold text-lg tracking-tight">Connect</span>
                  <span className="text-sky-400 font-bold text-lg tracking-tight">Care</span>
                </div>
              </div>
              <p className="text-slate-500 text-sm max-w-xs">
                Professional virtual call center services and remote work opportunities for the modern workforce.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Quick Links</h4>
              <div className="space-y-2">
                {navLinks.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => scrollTo(link.id)}
                    className="block text-slate-500 hover:text-sky-400 text-sm transition-colors"
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Get Started</h4>
              <div className="space-y-2">
                <button
                  onClick={() => scrollTo('inquiry')}
                  className="block text-slate-500 hover:text-sky-400 text-sm transition-colors"
                >
                  Request a Quote
                </button>
                <button
                  onClick={onApply}
                  className="block text-slate-500 hover:text-sky-400 text-sm transition-colors"
                >
                  Apply as Agent
                </button>
                <button
                  onClick={onSignIn}
                  className="block text-slate-500 hover:text-sky-400 text-sm transition-colors"
                >
                  Agent Sign In
                </button>
                <button
                  onClick={onPrivacy}
                  className="block text-slate-500 hover:text-sky-400 text-sm transition-colors"
                >
                  Privacy Policy
                </button>
              </div>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-slate-600 text-xs">
              &copy; {new Date().getFullYear()} Connect Care. All rights reserved.
            </p>
            <p className="text-slate-600 text-xs">
              Professional BPO Services & Remote Work Opportunities
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
