import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sun, Moon, Search, Zap } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const location = useLocation();

  const navLinks = [
    { label: 'Curriculum', path: '/' },
    { label: 'Mock Tests', path: '/topics' },
    { label: 'Diagnostic Results', path: '/attempts/att-seed-1/results' },
    { label: 'Pricing', path: '/pricing' },
  ];

  return (
    <header className="fixed top-0 w-full z-50 bg-[#111827]/90 dark:bg-[#111827]/90 bg-white/90 backdrop-blur-xl border-b border-[#2d3748] dark:border-[#2d3748] border-slate-200 shadow-[0_4px_24px_rgba(0,0,0,0.3)] transition-colors">
      <div className="h-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex items-center justify-between gap-4">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/"
            className="flex items-center gap-2.5 transition-transform active:scale-95"
            aria-label="FastQuiz Home"
          >
            <img
              alt="FastQuiz Brand Logo"
              className="h-8 w-auto object-contain brightness-110 drop-shadow-[0_0_12px_rgba(99,102,241,0.35)]"
              src="https://lh3.googleusercontent.com/aida/AEtjO1V1HgzPJzHCKD-ssJjJEKyPrkwFMck1aF8jXkjn61PtW_BZMb0NLdcji9ju7zD8iv-NwPxaenCqzwJBEp7Iv0PylsXnRX9NnaICUCiyfRWkSeE2-YpAJrn4lOOXg2omX1nRngyS51o8-V7bHUj6XaphQQAH0KqN8sajYT8ReJJDyuydKZhzHc5_Nvl6ZW7bA6LaXi0a7xqi4cV53ZIiTWFeI-H_d5xI9nlr5ROtGap0ThvbGMRTnRSec-4"
            />
            <div className="flex items-center gap-1.5 font-headline text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              FastQuiz{' '}
              <span className="text-indigo-600 dark:text-indigo-400 font-headline text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/15 border border-primary/30">
                • Prep
              </span>
            </div>
          </Link>
        </div>

        {/* Center Rounded Navigation */}
        <nav
          className="hidden lg:flex items-center p-1 bg-slate-100 dark:bg-[#171b26] border border-slate-200 dark:border-[#2d3748] rounded-full shadow-inner"
          aria-label="Primary navigation"
        >
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-1.5 rounded-full font-headline text-sm transition-all ${
                  isActive
                    ? 'bg-primary text-white font-bold shadow-[0_0_12px_rgba(99,102,241,0.35)]'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-[#1e2433]'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Controls Strip */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Quick Search */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#171b26] border border-slate-200 dark:border-[#2d3748] text-slate-400 text-sm focus-within:border-primary/50 transition-all">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent border-none text-xs text-slate-900 dark:text-slate-200 focus:outline-none w-20 lg:w-28"
            />
            <span className="hidden xl:inline px-1 py-0.2 rounded bg-slate-200 dark:bg-[#1e2433] text-[10px] font-mono text-slate-400">
              ⌘K
            </span>
          </div>

          {/* Momentum Flame Streak Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-100 dark:bg-orange-950/60 border border-orange-300 dark:border-orange-500/40 text-orange-600 dark:text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.2)]">
            <span
              className="material-symbols-outlined text-[18px] text-orange-500 fill-1 animate-pulse"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              local_fire_department
            </span>
            <span className="font-headline text-xs font-bold">{user?.streakDays || 4}-Day Streak</span>
            <span className="hidden sm:inline text-[11px] font-semibold text-orange-500 dark:text-orange-300/80 pl-1 border-l border-orange-400/30">
              +{user?.xp || 240} XP
            </span>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-100 dark:bg-[#171b26] border border-slate-200 dark:border-[#2d3748] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>

          {/* CTA: Get All Access */}
          <Link
            to="/pricing"
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-indigo-600 text-white font-headline text-sm font-bold shadow-[0_0_16px_rgba(99,102,241,0.35)] hover:brightness-110 active:translate-y-0.5 border border-indigo-400/30 transition-all gap-1.5"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Get All Access</span>
          </Link>

          {/* User Profile Avatar with Pro Scholar badge */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-[#2d3748]">
            <div className="relative flex items-center gap-2.5">
              <img
                alt="Profile"
                className="w-9 h-9 rounded-full object-cover ring-2 ring-primary/60 shadow-[0_0_10px_rgba(99,102,241,0.4)]"
                src={
                  user?.avatarUrl ||
                  'https://lh3.googleusercontent.com/aida/AEtjO1UqIx93fD3QQEE3C22qcCiZQUkEfNSSdLSA3GM9pAgqT1z0CgkE5W4AAPqdv4ueHW3aZrTq7QhQbxM8nSq_vYBMgPrbKXX0Dbn_aHCWRvySQ3ct-yoOpPyuwO84nOZPVTHvqtcpZkKhxQpiVBZaSU0HxQH1lCMNtB4-YfLC2pAucHvIFL5ZfTnUmxJntDM2h3R95wI5dEiEtQhEWEQHo_1ArE97PVqhg6pXmC-s3QcfqBPMSpkqf4COCWQ'
                }
              />
              <div className="hidden xl:flex flex-col text-left">
                <span className="font-headline text-sm font-semibold text-slate-900 dark:text-slate-100 leading-none">
                  {user?.name || 'Rohan V.'}
                </span>
                <span className="font-headline text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 leading-tight mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  {user?.tierTitle || 'Pro Scholar'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
