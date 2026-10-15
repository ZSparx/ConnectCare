import { Users, ArrowRight, CheckCircle2, Search, FileText, Monitor, GraduationCap, Network } from 'lucide-react';

type Props = {
  onStartApplication: () => void;
};

const STEPS = [
  { icon: FileText, title: 'Submit your application', desc: 'Complete the online application form with your details.' },
  { icon: Search, title: 'Our recruiting team reviews your information', desc: 'A recruiter evaluates your qualifications and experience.' },
  { icon: Users, title: 'Complete screening and/or interview', desc: 'Participate in a screening call or interview as requested.' },
  { icon: Monitor, title: 'Verify your work-from-home setup', desc: 'Confirm your equipment and internet meet remote-work requirements.' },
  { icon: GraduationCap, title: 'Complete registration, training, or certification', desc: 'Complete any required steps for your target opportunities.' },
  { icon: Network, title: 'Join our qualified agent pool', desc: 'Become part of our network of qualified virtual call-center professionals.' },
  { icon: CheckCircle2, title: 'Be considered for available opportunities', desc: 'Be considered for opportunities that match your qualifications, location, and availability.' },
];

export default function HowItWorks({ onStartApplication }: Props) {
  return (
    <div className="min-h-screen bg-slate-950">
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
            onClick={onStartApplication}
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/25"
          >
            Start your application
            <ArrowRight size={18} />
          </button>
        </div>
      </section>
    </div>
  );
}
