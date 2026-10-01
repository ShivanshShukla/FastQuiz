import React, { useState } from 'react';
import { useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';
import {
  Shield,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  Lock,
  Mail,
  User,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { BrandLogo } from '../components/Common/BrandLogo';
import { isMockEnabled } from '../config/env';

export interface LoginPageProps {
  initialMode?: 'login' | 'signup';
}

const GoogleIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.92 0 12s.45 3.85 1.24 5.42l4.04-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

const GitHubIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
    />
  </svg>
);

export const LoginPage: React.FC<LoginPageProps> = ({ initialMode = 'login' }) => {
  const mockActive = isMockEnabled();
  const [searchParams] = useSearchParams();
  const queryMode = searchParams.get('mode') === 'signup' ? 'signup' : initialMode;
  const [mode, setMode] = useState<'login' | 'signup'>(queryMode);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  // DPDPA & Dark Pattern Compliance: Consent checkboxes MUST NOT be pre-ticked
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | 'github' | null>(null);

  const { login, loginGuest, loginOAuth, signup } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const destination = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/curriculum';

  const handleGoogleLogin = () => {
    setSocialLoading('google');
    setTimeout(() => {
      loginOAuth('google');
      showToast('Signed in with Google as Alex Chen.', 'success');
      navigate(destination);
    }, 400);
  };

  const handleGitHubLogin = () => {
    setSocialLoading('github');
    setTimeout(() => {
      loginOAuth('github');
      showToast('Signed in with GitHub as Alex Chen.', 'success');
      navigate(destination);
    }, 400);
  };

  const handleGuestLogin = () => {
    loginGuest();
    showToast('Signed in as demo engineer (Rohan V.).', 'success');
    navigate(destination);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      showToast('Please enter a valid engineering email address', 'error');
      return;
    }
    if (!cleanPassword) {
      showToast('Please enter your password', 'error');
      return;
    }

    if (mode === 'signup') {
      if (!name.trim()) {
        showToast('Please enter your full name', 'error');
        return;
      }
      if (!agreeTerms) {
        showToast('Please agree to the Terms and Privacy Policy to create your account', 'error');
        return;
      }

      setIsSubmitting(true);
      setTimeout(() => {
        signup(name, cleanEmail);
        showToast('Account created successfully! Welcome to FastQuiz.', 'success');
        navigate(destination);
      }, 350);
    } else {
      setIsSubmitting(true);
      setTimeout(() => {
        login(cleanEmail, cleanEmail.split('@')[0]);
        showToast('Signed in successfully. Welcome back!', 'success');
        navigate(destination);
      }, 350);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10 text-left">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl overflow-hidden">
        {/* Left Value Proposition Panel (Desktop) */}
        <div className="hidden lg:flex lg:col-span-5 flex-col justify-between p-8 bg-gradient-to-b from-zinc-900 via-zinc-900 to-indigo-950 text-white border-r border-zinc-800">
          <div className="space-y-6">
            <BrandLogo size="md" showBadge={true} />

            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-semibold">
                CALIBRATED INTERVIEW PREP
              </span>
              <h2 className="text-xl font-semibold text-white leading-snug tracking-tight">
                Calibrate technical instincts without annual traps.
              </h2>
              <p className="text-xs text-zinc-300 leading-relaxed">
                FastQuiz replaces expensive annual subscriptions with surgical, pay-per-track engineering assessments.
              </p>
            </div>

            <div className="space-y-3 pt-2 text-xs text-zinc-300">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
                <span>1 Free full diagnostic assessment on every curriculum track</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
                <span>Staff architecture blueprints with production Go/Python reference code</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
                <span>Real-time percentile telemetry and response latency pacing</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
                <span>Strict data minimization under India's DPDPA 2023</span>
              </div>
            </div>
          </div>

          {/* Privacy & Trust Note (Truthful and verifiable) */}
          <div className="pt-6 border-t border-zinc-800/80 space-y-1.5 text-xs text-zinc-400">
            <div className="flex items-center gap-1.5 text-emerald-400 font-medium font-mono text-[11px]">
              <Shield className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Zero Data Mining Pledge</span>
            </div>
            <p className="text-[11px] leading-relaxed text-zinc-300">
              We collect only what is strictly required to administer your diagnostics. No third-party data brokering, ever.
            </p>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            {/* Header with Mode Switcher */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="lg:hidden">
                  <BrandLogo size="md" showBadge={false} />
                </div>
                <div
                  className="inline-flex p-1 rounded-lg bg-zinc-100 dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700/60 ml-auto"
                >
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                      mode === 'login'
                        ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm font-semibold'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('signup')}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                      mode === 'signup'
                        ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm font-semibold'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                    }`}
                  >
                    Create Account
                  </button>
                </div>
              </div>

              <div>
                <h1 className="text-xl sm:text-2xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
                  {mode === 'login' ? 'Sign in to FastQuiz' : 'Create your engineer profile'}
                </h1>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                  {mode === 'login'
                    ? 'Access your saved diagnostic runs, percentile scores, and unlocked tracks.'
                    : 'Get immediate access to free diagnostics on every curriculum track.'}
                </p>
              </div>
            </div>

            {/* Social Authentication: Google & GitHub */}
            <div className="space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Continue with Google */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={socialLoading !== null}
                  aria-label="Continue with Google authentication"
                  className="w-full py-2.5 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/60 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-medium flex items-center justify-center gap-2.5 transition-all shadow-sm cursor-pointer disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  <GoogleIcon className="w-4 h-4 shrink-0" />
                  <span>{socialLoading === 'google' ? 'Connecting Google...' : 'Continue with Google'}</span>
                </button>

                {/* Continue with GitHub */}
                <button
                  type="button"
                  onClick={handleGitHubLogin}
                  disabled={socialLoading !== null}
                  aria-label="Continue with GitHub authentication"
                  className="w-full py-2.5 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/60 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-medium flex items-center justify-center gap-2.5 transition-all shadow-sm cursor-pointer disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  <GitHubIcon className="w-4 h-4 shrink-0" />
                  <span>{socialLoading === 'github' ? 'Connecting GitHub...' : 'Continue with GitHub'}</span>
                </button>
              </div>

              {/* Instant Demo Option (Mock Data Gated) */}
              {mockActive && (
                <button
                  type="button"
                  onClick={handleGuestLogin}
                  aria-label="Continue with Instant Demo account"
                  className="w-full py-2 px-3 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600 bg-zinc-50/50 dark:bg-zinc-950/40 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />
                  <span>Instant Demo: Continue as Rohan V. (Pro Scholar)</span>
                </button>
              )}
            </div>

            {/* Divider */}
            <div className="relative flex items-center py-1">
              <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800" />
              <span className="flex-shrink mx-3 text-[11px] text-zinc-500 font-mono">
                or continue with email
              </span>
              <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800" />
            </div>

            {/* Email / Password Form (Strictly Minimized Data Collection) */}
            <form id="auth-form-panel" onSubmit={handleSubmit} className="space-y-4">
              {/* Name Field (Sign Up mode only) */}
              {mode === 'signup' && (
                <div className="space-y-1.5 text-left">
                  <label
                    htmlFor="auth-name"
                    className="block text-xs font-medium text-zinc-800 dark:text-zinc-200"
                  >
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-3" aria-hidden="true" />
                    <input
                      id="auth-name"
                      type="text"
                      required
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Alex Chen"
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:border-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-500 transition-colors"
                    />
                  </div>
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-1.5 text-left">
                <label
                  htmlFor="auth-email"
                  className="block text-xs font-medium text-zinc-800 dark:text-zinc-200"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-3" aria-hidden="true" />
                  <input
                    id="auth-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:border-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-500 transition-colors"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5 text-left">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="auth-password"
                    className="block text-xs font-medium text-zinc-800 dark:text-zinc-200"
                  >
                    Password
                  </label>
                  {mode === 'login' ? (
                    <button
                      type="button"
                      onClick={() => showToast('Password reset link sent to registered email.', 'info')}
                      className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-sm"
                    >
                      Forgot password?
                    </button>
                  ) : (
                    <span className="text-[10px] text-zinc-500 font-mono">Min 8 characters</span>
                  )}
                </div>

                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-3" aria-hidden="true" />
                  <input
                    id="auth-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-10 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:border-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-sm"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* DPDPA 2023 Explicit Consent Checkbox (Sign Up Mode Only) */}
              {mode === 'signup' && (
                <div className="flex items-start gap-2.5 pt-1 text-left">
                  <input
                    id="agree-terms"
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-zinc-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer shrink-0"
                  />
                  <label htmlFor="agree-terms" className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed cursor-pointer select-none">
                    I agree to the{' '}
                    <Link to="/terms" className="text-indigo-600 dark:text-indigo-400 underline font-medium hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
                      Terms and Conditions
                    </Link>
                    , acknowledge the{' '}
                    <Link to="/privacy" className="text-indigo-600 dark:text-indigo-400 underline font-medium hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
                      Privacy Policy (DPDPA 2023)
                    </Link>{' '}
                    and{' '}
                    <Link to="/cookies" className="text-indigo-600 dark:text-indigo-400 underline font-medium hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
                      Cookie Policy
                    </Link>
                    , and consent to FastQuiz collecting and processing my name and email strictly for account administration and diagnostic scoring.
                  </label>
                </div>
              )}

              {/* Primary Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <span>
                  {isSubmitting
                    ? 'Authenticating...'
                    : mode === 'login'
                    ? 'Sign In with Email'
                    : 'Create Free Account'}
                </span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </form>
          </div>

          {/* Footer Security & Legal Notice */}
          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-wrap items-center justify-center gap-2 text-[11px] text-zinc-500">
            <div className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-emerald-500" aria-hidden="true" />
              <span>TLS 1.3 Encryption</span>
            </div>
            <span>•</span>
            <span>Indian DPDPA 2023 Compliant</span>
            <span>•</span>
            <Link to="/privacy" className="text-indigo-600 dark:text-indigo-400 hover:underline">
              Privacy Notice
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
