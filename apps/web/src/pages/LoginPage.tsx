import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { BrandLogo } from '../components/Common/BrandLogo';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loginGuest } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      showToast('Please enter your email', 'error');
      return;
    }
    if (!password) {
      showToast('Please enter your password', 'error');
      return;
    }
    login(email, email.split('@')[0]);
    showToast('Signed in successfully.', 'success');
    navigate('/');
  };

  const handleGuestLogin = () => {
    loginGuest();
    showToast('Signed in as demo engineer.', 'success');
    navigate('/');
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center px-4 py-12 text-left">
      <div className="w-full max-w-sm p-6 sm:p-8 rounded-lg bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-6">
        <div className="space-y-3 text-center flex flex-col items-center">
          <BrandLogo size="md" showBadge={false} />
          <div>
            <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
              Sign in to FastQuiz
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              Enter your credentials to access your assessment diagnostic history.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGuestLogin}
          className="w-full py-2.5 px-4 rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>Continue as Demo Engineer (Rohan V.)</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800" />
          <span className="flex-shrink mx-3 text-[11px] text-zinc-400 font-mono">or email</span>
          <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800" />
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="login-email" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Email Address
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full px-3 py-2 rounded-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="login-password" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Password
              </label>
              <span className="text-[10px] text-zinc-400 font-mono">Demo: any key</span>
            </div>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3 py-2 rounded-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-md bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white text-xs font-medium transition-colors shadow-sm cursor-pointer"
          >
            Sign In with Email
          </button>
        </form>

        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-center gap-1.5 text-[11px] text-zinc-400">
          <Shield className="w-3.5 h-3.5" />
          <span>Encrypted Session Authentication</span>
        </div>
      </div>
    </div>
  );
};
