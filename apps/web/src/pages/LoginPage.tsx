import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

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
    login(email, email.split('@')[0]);
    showToast('Logged in successfully!', 'success');
    navigate('/');
  };

  const handleGuestLogin = () => {
    loginGuest();
    showToast('Logged in as Pro Scholar guest (Rohan V.)!', 'success');
    navigate('/');
  };

  return (
    <div className="min-h-[calc(100vh-160px)] flex items-center justify-center px-4 py-12 text-left">
      <div className="w-full max-w-md p-8 rounded-2xl bg-white dark:bg-[#171b26] border border-slate-200 dark:border-[#283145] shadow-2xl relative overflow-hidden">
        <div className="space-y-2 text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary font-headline text-xs font-bold uppercase tracking-wider mb-2">
            FastQuiz Candidate Portal
          </div>
          <h1 className="font-headline text-2xl font-extrabold text-slate-900 dark:text-white">
            Welcome to FastQuiz
          </h1>
          <p className="font-body text-xs text-slate-500 dark:text-[#94A3B8]">
            Sign in to access your interview diagnostic matrix and quiz history
          </p>
        </div>

        {/* 1-Click Guest Login Button */}
        <button
          type="button"
          onClick={handleGuestLogin}
          className="w-full py-3.5 px-4 mb-6 rounded-xl bg-gradient-to-r from-primary to-indigo-600 hover:brightness-110 text-white font-headline text-xs font-extrabold shadow-md active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Zap className="w-4 h-4 fill-current" />
          <span>Instant 1-Click Guest Access (Rohan V.)</span>
        </button>

        <div className="relative flex py-2 items-center mb-6">
          <div className="flex-grow border-t border-slate-200 dark:border-[#283145]"></div>
          <span className="flex-shrink mx-4 text-xs text-slate-400 font-mono">or email sign in</span>
          <div className="flex-grow border-t border-slate-200 dark:border-[#283145]"></div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-headline font-bold text-slate-700 dark:text-slate-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="candidate@techcompany.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0a0e18] border border-slate-200 dark:border-[#283145] text-slate-900 dark:text-white text-xs focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-headline font-bold text-slate-700 dark:text-slate-300 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0a0e18] border border-slate-200 dark:border-[#283145] text-slate-900 dark:text-white text-xs focus:outline-none focus:border-primary"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 font-headline text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            Sign In with Email
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-[#283145] flex items-center justify-center gap-1.5 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Secured with 256-bit encryption</span>
        </div>
      </div>
    </div>
  );
};
