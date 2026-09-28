import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Lock, Mail, AlertCircle, ArrowRight, ShieldCheck, Terminal } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('admin@fastquiz.dev');
  const [password, setPassword] = useState('AdminSecret123!');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, loginWithGoogle, loginDemoAdmin, loginDemoUser } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const destination = (location.state as { from?: { pathname: string } })?.from?.pathname || '/review';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
      success('Logged in successfully as Administrator');
      navigate(destination, { replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid credentials or connection error.';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    try {
      await loginWithGoogle();
      success('Authenticated via Google as Admin');
      navigate(destination, { replace: true });
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Google authentication failed.');
    }
  };

  const handleDemoAdmin = () => {
    loginDemoAdmin();
    success('Logged in as Demo Admin');
    navigate(destination, { replace: true });
  };

  const handleDemoUser = () => {
    loginDemoUser();
    navigate('/review');
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900 flex flex-col items-center justify-center p-4 relative font-sans">
      {/* Subtle background precision grid pattern */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: 'radial-gradient(circle, #e4e4e7 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      <div className="relative max-w-md w-full bg-white rounded-xl shadow-xs border border-zinc-200 p-8 flex flex-col gap-6">
        {/* Brand Header */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-2xs">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <div>
                <h1 className="text-base font-bold text-zinc-950 tracking-tight leading-none">
                  FastQuiz Admin
                </h1>
                <span className="font-mono text-[10px] text-zinc-400">v2.4.0 (Enterprise)</span>
              </div>
            </div>
            <span className="font-mono text-[10px] bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded border border-zinc-200 font-medium">
              INTERNAL USE
            </span>
          </div>

          <div className="pt-2 border-t border-zinc-100">
            <p className="text-xs text-zinc-500 leading-normal">
              Content Review &amp; Editorial Workbench console. Authentication restricted to verified platform reviewers.
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div role="alert" className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <span className="font-medium">{errorMsg}</span>
          </div>
        )}

        {/* Authentication Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5" htmlFor="email-input">
              Reviewer Work Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
              <input
                id="email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@fastquiz.dev"
                className="w-full pl-9 pr-3 py-2 text-xs font-mono bg-zinc-50/50 border border-zinc-200 rounded-lg text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-zinc-700" htmlFor="password-input">
                Hardware / Password Key
              </label>
              <span className="text-[11px] text-zinc-400 font-mono">Min 8 chars</span>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
              <input
                id="password-input"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2 text-xs font-mono bg-zinc-50/50 border border-zinc-200 rounded-lg text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-1 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-2xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>{isSubmitting ? 'Verifying...' : 'Sign in to Console'}</span>
            <kbd className="font-mono text-[10px] bg-white/20 px-1 py-0.2 rounded text-white">↵</kbd>
            <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="w-full border-t border-zinc-200"></div>
          <span className="absolute bg-white px-2 text-[10px] uppercase font-mono text-zinc-400 font-semibold tracking-wider">
            SSO / Federated
          </span>
        </div>

        {/* Google SSO Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full py-2 px-4 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-700 transition flex items-center justify-center gap-2.5 cursor-pointer shadow-2xs"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Sign in with Google</span>
        </button>

        {/* Development Quick Access Panel */}
        <div className="pt-4 border-t border-zinc-100 flex flex-col gap-2">
          <div className="flex items-center justify-between text-[11px] text-zinc-400">
            <span className="flex items-center gap-1 font-mono uppercase tracking-wider text-[10px]">
              <Terminal className="w-3 h-3 text-zinc-400" />
              Dev Environment Quick Keys
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
              MOCK OK
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={handleDemoAdmin}
              className="py-1.5 px-2 bg-zinc-50 hover:bg-zinc-100 text-zinc-800 border border-zinc-200 rounded font-medium transition text-center cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Log in as Admin</span>
            </button>
            <button
              type="button"
              onClick={handleDemoUser}
              className="py-1.5 px-2 bg-zinc-50 hover:bg-zinc-100 text-zinc-600 border border-zinc-200 rounded font-medium transition text-center cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <span>Test Non-Admin</span>
            </button>
          </div>
        </div>
      </div>

      {/* Audit Footnote */}
      <footer className="relative mt-6 text-center text-[11px] text-zinc-400 font-mono">
        Strict audit logging enabled &bull; All review actions are cryptographic signed
      </footer>
    </div>
  );
};
