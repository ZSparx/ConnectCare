import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import AuthPage from './pages/AuthPage';
import AgentDashboard from './pages/AgentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import RecruitmentLanding from './pages/RecruitmentLanding';
import AgentApplicationForm from './pages/AgentApplicationForm';
import PrivacyPolicy from './pages/PrivacyPolicy';
import { Headset, Loader2 } from 'lucide-react';
import { useState } from 'react';

type View = 'dashboard' | 'apply' | 'recruitment' | 'privacy';

function AppContent() {
  const { session, profile, loading } = useAuth();
  const [view, setView] = useState<View>('recruitment');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-sky-500 rounded-xl flex items-center justify-center shadow-xl shadow-sky-500/30">
            <Headset size={24} className="text-white" />
          </div>
          <Loader2 size={20} className="animate-spin text-sky-500" />
        </div>
      </div>
    );
  }

  // Public recruitment landing page (no auth required)
  if (!session && view === 'recruitment') {
    return (
      <>
        <RecruitmentLanding
          onApply={() => setView('apply')}
          onLearnMore={() => {
            const el = document.getElementById('how-it-works');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          onSignIn={() => setView('dashboard')}
          onPrivacy={() => setView('privacy')}
        />
      </>
    );
  }

  // Application form (requires auth)
  if (!session && view === 'apply') {
    return <AuthPage onRecruitment={() => setView('recruitment')} />;
  }

  // Privacy policy (accessible without auth)
  if (!session && view === 'privacy') {
    return <PrivacyPolicy onBack={() => setView('recruitment')} />;
  }

  if (!session) {
    return <AuthPage onRecruitment={() => setView('recruitment')} />;
  }

  // Privacy policy (accessible when signed in)
  if (view === 'privacy') {
    return (
      <>
        <Header onNavigate={setView} />
        <PrivacyPolicy onBack={() => setView('dashboard')} />
      </>
    );
  }

  // Application form (signed in)
  if (view === 'apply') {
    return (
      <AgentApplicationForm
        onDone={() => setView('dashboard')}
        onCancel={() => setView('dashboard')}
      />
    );
  }

  return (
    <>
      <Header onNavigate={setView} />
      {profile?.role === 'admin' ? <AdminDashboard /> : <AgentDashboard onStartApplication={() => setView('apply')} />}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
