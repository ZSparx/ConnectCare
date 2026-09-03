import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Headset, Eye, EyeOff, Loader2, ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';

type Mode = 'signin' | 'signup';

type Props = {
  onRecruitment?: () => void;
};

export default function AuthPage({ onRecruitment }: Props = {}) {
  const [mode, setMode] = useState<Mode>('signin');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [signUpSuccess, setSignUpSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName, role: 'agent' } },
        });
        if (error) throw error;

        if (data.user && !data.session) {
          setSignUpSuccess(true);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred';
      if (msg.toLowerCase().includes('email not confirmed')) {
        setError('Your email is not confirmed yet. Please check your inbox for a confirmation link before signing in.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setResetLoading(true);
    setError('');
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: window.location.origin,
    });
    setResetLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setResetSent(true);
  }

  // Password reset view
  if (showReset) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
        <header className="px-8 py-5">
          <button
            onClick={onRecruitment}
            disabled={!onRecruitment}
            className="flex items-center gap-2.5 group disabled:cursor-default"
          >
            <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center group-hover:bg-sky-400 transition-colors">
              <Headset size={18} className="text-white" />
            </div>
            <span className="text-white font-semibold text-xl tracking-tight group-hover:text-sky-300 transition-colors">Connect Care</span>
          </button>
        </header>

        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
              <h1 className="text-2xl font-bold text-white mb-1">Reset your password</h1>
              <p className="text-slate-400 text-sm mb-8">
                Enter your email and we'll send you a link to reset your password.
              </p>

              {resetSent ? (
                <div className="text-center py-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={28} className="text-emerald-400" />
                  </div>
                  <h3 className="text-white font-semibold text-base mb-2">Check your email</h3>
                  <p className="text-slate-400 text-sm mb-6">
                    We've sent a password reset link to <span className="text-slate-200">{resetEmail}</span>. Follow the link in the email to reset your password.
                  </p>
                  <button
                    onClick={() => { setShowReset(false); setResetSent(false); setResetEmail(''); setMode('signin'); }}
                    className="px-5 py-2.5 border border-white/15 text-slate-200 hover:text-white hover:border-white/25 text-sm font-medium rounded-xl transition-all"
                  >
                    Back to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
                    <input
                      type="email"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                    />
                  </div>
                  {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">{error}</div>
                  )}
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full bg-sky-500 hover:bg-sky-400 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25"
                  >
                    {resetLoading && <Loader2 size={16} className="animate-spin" />}
                    Send Reset Link
                  </button>
                </form>
              )}

              <div className="text-center mt-4 pt-4 border-t border-white/5">
                <button
                  onClick={() => { setShowReset(false); setError(''); }}
                  className="inline-flex items-center gap-1.5 text-slate-500 hover:text-sky-400 text-sm transition-colors"
                >
                  <ArrowLeft size={14} /> Back to Sign In
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Sign-up success (email confirmation required)
  if (signUpSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
        <header className="px-8 py-5">
          <button
            onClick={onRecruitment}
            disabled={!onRecruitment}
            className="flex items-center gap-2.5 group disabled:cursor-default"
          >
            <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center group-hover:bg-sky-400 transition-colors">
              <Headset size={18} className="text-white" />
            </div>
            <span className="text-white font-semibold text-xl tracking-tight group-hover:text-sky-300 transition-colors">Connect Care</span>
          </button>
        </header>

        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm text-center">
              <div className="w-14 h-14 rounded-full bg-sky-500/15 flex items-center justify-center mx-auto mb-4">
                <Mail size={28} className="text-sky-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Check your email to confirm</h2>
              <p className="text-slate-400 text-sm mb-6">
                We've sent a confirmation link to <span className="text-slate-200">{email}</span>. Click the link in the email to activate your account, then come back here to sign in and complete your application.
              </p>
              <p className="text-slate-500 text-xs mb-6">
                Didn't receive the email? Check your spam folder, or try signing in — we'll resend the confirmation if needed.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => { setSignUpSuccess(false); setMode('signin'); }}
                  className="w-full bg-sky-500 hover:bg-sky-400 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-sky-500/25"
                >
                  Go to Sign In
                </button>
                <button
                  onClick={onRecruitment}
                  className="inline-flex items-center justify-center gap-1.5 text-slate-500 hover:text-sky-400 text-sm transition-colors"
                >
                  <ArrowLeft size={14} /> Back to home page
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Header */}
      <header className="px-8 py-5">
        <button
          onClick={onRecruitment}
          disabled={!onRecruitment}
          className="flex items-center gap-2.5 group disabled:cursor-default"
        >
          <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center group-hover:bg-sky-400 transition-colors">
            <Headset size={18} className="text-white" />
          </div>
          <span className="text-white font-semibold text-xl tracking-tight group-hover:text-sky-300 transition-colors">Connect Care</span>
        </button>
      </header>

      {/* Auth card */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
            {/* Toggle tabs */}
            <div className="flex bg-white/5 rounded-xl p-1 mb-8">
              {(['signin', 'signup'] as Mode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setError(''); setInfo(''); }}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    mode === m
                      ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {m === 'signin' ? 'Sign In' : 'Sign Up'}
                </button>
              ))}
            </div>

            <h1 className="text-2xl font-bold text-white mb-1">
              {mode === 'signin' ? 'Welcome back' : 'Create your account'}
            </h1>
            <p className="text-slate-400 text-sm mb-8">
              {mode === 'signin'
                ? 'Sign in to access the agent portal'
                : 'Join the Connect Care agent pool'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {mode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Jane Smith"
                    className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {mode === 'signin' && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => { setShowReset(true); setError(''); setResetEmail(email); }}
                    className="text-sky-400 hover:text-sky-300 text-xs font-medium transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
                  {error}
                </div>
              )}

              {info && (
                <div className="bg-sky-500/10 border border-sky-500/20 rounded-xl px-4 py-3 text-sky-400 text-sm">
                  {info}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-sky-500 hover:bg-sky-400 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 mt-2"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {mode === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <p className="text-center text-slate-400 text-sm mt-6">
              {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button
                onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); setInfo(''); }}
                className="text-sky-400 hover:text-sky-300 font-medium transition-colors"
              >
                {mode === 'signin' ? 'Sign up' : 'Sign in'}
              </button>
            </p>

            {onRecruitment && (
              <div className="text-center mt-4 pt-4 border-t border-white/5">
                <button
                  onClick={onRecruitment}
                  className="inline-flex items-center gap-1.5 text-slate-500 hover:text-sky-400 text-sm transition-colors"
                >
                  <ArrowLeft size={14} />
                  Back to home page
                </button>
              </div>
            )}
          </div>

          <p className="text-center text-slate-600 text-xs mt-6">
            &copy; 2026 Connect Care. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
