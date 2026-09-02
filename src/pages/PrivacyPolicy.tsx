import { useState } from 'react';
import { Shield } from 'lucide-react';

type Props = {
  onBack: () => void;
};

export default function PrivacyPolicy({ onBack }: Props) {
  const [expanded, setExpanded] = useState<number | null>(0);

  const sections = [
    {
      title: 'Information We Collect',
      body: 'We collect personal information you provide through our application form, including your name, contact details, location (country, region, city, time zone), professional experience, skills, languages, equipment and internet details, and availability preferences. We do not collect government IDs, banking information, or passwords during the initial application. Sensitive documentation may be requested only during a later secure onboarding stage if specifically required.',
    },
    {
      title: 'Why We Collect It',
      body: 'We collect this information to evaluate your qualifications for our agent pool, to match you with potential opportunities based on country eligibility, language, skills, experience, equipment, and availability, and to communicate with you about your application status and potential opportunities.',
    },
    {
      title: 'How We Use It',
      body: 'Your information is used to review your application, assess your suitability for available opportunities, contact you regarding your application, and — if you join our agent pool — to present you as a candidate for client opportunities that match your profile. We do not sell your personal information.',
    },
    {
      title: 'Who May Receive It',
      body: 'Access to your application data is restricted to authorized recruiters and administrators within our company. Client companies may receive summary information about qualified candidates during the matching process, but only as needed and only after you have been identified as a potential match. Documents you upload during onboarding are visible only to authorized administrators.',
    },
    {
      title: 'How Long We Retain It',
      body: 'We retain application data for the duration of your participation in the agent pool and for a reasonable period thereafter to support record-keeping and compliance. If you request deletion, we will remove your personal information except where retention is required by law.',
    },
    {
      title: 'Access and Correction',
      body: 'You may request access to your personal information and request corrections where applicable. To do so, contact us through the privacy contact below. We will respond within a reasonable timeframe in accordance with applicable data protection laws.',
    },
    {
      title: 'Privacy Questions',
      body: 'If you have privacy questions or concerns, you may submit them to our privacy team. We are committed to addressing your questions promptly and transparently.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button onClick={onBack} className="text-slate-400 hover:text-white text-sm mb-6 transition-colors">
          ← Back
        </button>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-sky-500/10 border border-sky-500/20 rounded-xl flex items-center justify-center">
            <Shield size={20} className="text-sky-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Privacy Policy</h1>
            <p className="text-slate-500 text-sm">How we handle your personal information</p>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-white/8 rounded-2xl overflow-hidden">
          {sections.map((s, i) => (
            <div key={i} className="border-b border-white/5 last:border-0">
              <button
                onClick={() => setExpanded(expanded === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/3 transition-colors"
              >
                <span className="text-white font-medium text-sm">{s.title}</span>
                <span className="text-slate-500 text-xs">{expanded === i ? '−' : '+'}</span>
              </button>
              {expanded === i && (
                <p className="px-5 pb-5 text-slate-400 text-sm leading-relaxed">{s.body}</p>
              )}
            </div>
          ))}
        </div>

        <p className="text-slate-600 text-xs mt-6 text-center">
          This privacy policy may be updated from time to time. Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>
    </div>
  );
}
