import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { isMockEnabled } from '../config/env';
import {
  LayoutDashboard,
  Users,
  Inbox,
  Layers,
  HelpCircle,
  LogOut,
  X,
  Search,
  CheckCircle2,
  Bell,
  ChevronRight,
  Receipt,
  Sun,
  Moon,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Role permissions
  const role = user?.role || 'reviewer';
  const canViewUsers = role !== 'reviewer';
  const canViewPurchases = role === 'super_admin' || role === 'admin' || role === 'finance';

  // Dynamic breadcrumb label
  const getBreadcrumb = () => {
    if (location.pathname === '/') {
      return <span className="font-medium text-zinc-900 dark:text-zinc-100">Executive & Ops Dashboard</span>;
    }
    if (location.pathname.startsWith('/users/')) {
      const qid = location.pathname.split('/')[2];
      return (
        <>
          <NavLink to="/users" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            Learner Directory
          </NavLink>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          <span className="font-mono text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100">
            {qid}
          </span>
        </>
      );
    }
    if (location.pathname === '/users') {
      return <span className="font-medium text-zinc-900 dark:text-zinc-100">Learner Directory</span>;
    }
    if (location.pathname.startsWith('/review/')) {
      const qid = location.pathname.split('/')[2];
      return (
        <>
          <NavLink to="/review" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            Review Queue
          </NavLink>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          <span className="font-mono text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100">
            #{qid}
          </span>
        </>
      );
    }
    if (location.pathname === '/content') {
      return <span className="font-medium text-zinc-900 dark:text-zinc-100">Curated Content</span>;
    }
    if (location.pathname === '/purchases') {
      return <span className="font-medium text-zinc-900 dark:text-zinc-100">Purchases & Revenue</span>;
    }
    return <span className="font-medium text-zinc-900 dark:text-zinc-100">Admin Console</span>;
  };

  const getRoleDisplayName = (r: string) => {
    switch (r) {
      case 'super_admin':
        return 'Super Admin';
      case 'finance':
        return 'Finance Admin';
      case 'support':
        return 'Support Specialist';
      case 'admin':
        return 'Senior Administrator';
      case 'reviewer':
      default:
        return 'Content Reviewer';
    }
  };

  return (
    <div className="min-h-screen flex bg-[#fafafa] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans antialiased selection:bg-indigo-100 dark:selection:bg-indigo-900 selection:text-indigo-900 dark:selection:text-indigo-100 transition-colors duration-150">
      {/* ========================================================================= */}
      {/* Fixed Left Sidebar (240px / w-60)                                         */}
      {/* ========================================================================= */}
      <aside className="fixed left-0 top-0 h-screen w-60 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 z-50 flex flex-col justify-between select-none">
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Logo & Brand Header */}
          <div className="h-14 flex items-center gap-2.5 px-4 border-b border-zinc-200 dark:border-zinc-800">
            <div className="w-7 h-7 rounded-md bg-indigo-600 flex items-center justify-center shadow-xs shrink-0">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13 2L3 14h8l-2 8 10-12h-8l2-8z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-[14px] text-zinc-900 dark:text-zinc-100 tracking-tight leading-none">
                FastQuiz
              </span>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded tracking-wide leading-none w-max">
                  ADMIN HUD
                </span>
                {isMockEnabled() ? (
                  <span className="text-[9px] font-mono font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 px-1 py-0.2 rounded leading-none">
                    MOCK ON
                  </span>
                ) : (
                  <span className="text-[9px] font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-1 py-0.2 rounded leading-none">
                    PRODUCTION
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Nav Sections */}
          <div className="p-3 space-y-4">
            {/* Section: Overview */}
            <div>
              <div className="px-2.5 py-1 text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                Overview
              </div>
              <nav className="mt-1 space-y-0.5">
                <NavLink
                  to="/"
                  end
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13.5px] transition-colors ${
                      isActive
                        ? 'bg-indigo-50/90 dark:bg-indigo-950/60 text-indigo-950 dark:text-indigo-200 font-semibold border-l-2 border-indigo-600'
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 hover:text-zinc-950 dark:hover:text-zinc-200'
                    }`
                  }
                >
                  <LayoutDashboard className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Dashboard</span>
                </NavLink>
              </nav>
            </div>

            {/* Section: Review & Workflow */}
            <div>
              <div className="px-2.5 py-1 text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                Review & Workflow
              </div>
              <nav className="mt-1 space-y-0.5">
                <NavLink
                  to="/review"
                  className={({ isActive }) =>
                    `flex items-center justify-between px-2.5 py-2 rounded-lg text-[13.5px] transition-colors ${
                      isActive
                        ? 'bg-indigo-50/90 dark:bg-indigo-950/60 text-indigo-950 dark:text-indigo-200 font-semibold border-l-2 border-indigo-600'
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 hover:text-zinc-950 dark:hover:text-zinc-200'
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <Inbox className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>Review Queue</span>
                  </div>
                  {isMockEnabled() && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-mono text-[11px] font-semibold">
                      24
                    </span>
                  )}
                </NavLink>
              </nav>
            </div>

            {/* Section: Content */}
            <div>
              <div className="px-2.5 py-1 text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                Curated Content
              </div>
              <nav className="mt-1 space-y-0.5">
                <NavLink
                  to="/content"
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13.5px] transition-colors ${
                      isActive
                        ? 'bg-indigo-50/90 dark:bg-indigo-950/60 text-indigo-950 dark:text-indigo-200 font-semibold border-l-2 border-indigo-600'
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 hover:text-zinc-950 dark:hover:text-zinc-200'
                    }`
                  }
                >
                  <Layers className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                  <span>Content Hierarchy</span>
                </NavLink>
              </nav>
            </div>

            {/* Section: Operations */}
            <div>
              <div className="px-2.5 py-1 text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                Operations
              </div>
              <nav className="mt-1 space-y-0.5">
                {canViewUsers && (
                  <NavLink
                    to="/users"
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13.5px] transition-colors ${
                        isActive
                          ? 'bg-indigo-50/90 dark:bg-indigo-950/60 text-indigo-950 dark:text-indigo-200 font-semibold border-l-2 border-indigo-600'
                          : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 hover:text-zinc-950 dark:hover:text-zinc-200'
                      }`
                    }
                  >
                    <Users className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                    <span>Learner Directory</span>
                  </NavLink>
                )}

                {canViewPurchases && (
                  <NavLink
                    to="/purchases"
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13.5px] transition-colors ${
                        isActive
                          ? 'bg-indigo-50/90 dark:bg-indigo-950/60 text-indigo-950 dark:text-indigo-200 font-semibold border-l-2 border-indigo-600'
                          : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 hover:text-zinc-950 dark:hover:text-zinc-200'
                      }`
                    }
                  >
                    <Receipt className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                    <span>Purchases & Rev</span>
                  </NavLink>
                )}
              </nav>
            </div>
          </div>
        </div>

        {/* Sidebar Footer: Profile & Shortcuts */}
        <div className="border-t border-zinc-200 dark:border-zinc-800 p-3 bg-white dark:bg-zinc-900">
          <div className="flex items-center justify-between mb-2 px-2 py-1.5 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors">
            <div className="flex items-center gap-2.5">
              <img
                src="/reviewer-avatar.png"
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover border border-zinc-200 dark:border-zinc-700"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop';
                }}
              />
              <div className="flex flex-col text-left overflow-hidden">
                <span className="text-[12.5px] font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight truncate">
                  {user?.name || 'Administrator'}
                </span>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                  {getRoleDisplayName(role)}
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
              title="Sign out"
              type="button"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setShowShortcutsModal(true)}
            className="w-full pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between px-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors text-left"
          >
            <span className="text-[11px] font-medium">Shortcuts Help</span>
            <kbd className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono text-[10px] text-zinc-600 dark:text-zinc-400 shadow-2xs">
              ?
            </kbd>
          </button>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* Main Content Area (Offset by 240px / pl-60)                               */}
      {/* ========================================================================= */}
      <div className="pl-60 flex flex-col flex-1 min-h-screen">
        {/* Fixed Top Header (h-14) */}
        <header className="fixed top-0 left-60 right-0 h-14 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800 z-40 px-6 flex items-center justify-between transition-colors">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            <span className="text-zinc-400 dark:text-zinc-500">FastQuiz Admin</span>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
            {getBreadcrumb()}
          </div>

          {/* Right Header HUD Actions */}
          <div className="flex items-center gap-3">
            {/* Shift Daily Progress Pill (Demo Only) */}
            {isMockEnabled() && (
              <div className="hidden sm:flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-800/80 px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span className="text-zinc-700 dark:text-zinc-300">
                  <strong className="text-zinc-900 dark:text-zinc-100 font-semibold">18</strong> of 42 reviewed today
                </span>
              </div>
            )}

            {/* Quick Search */}
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 absolute left-2.5 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
              <input
                type="text"
                placeholder="Search quick jump..."
                className="w-48 sm:w-56 h-8 pl-8 pr-10 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 bg-white dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition"
              />
              <div className="absolute right-1.5 flex items-center">
                <kbd className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 font-mono text-[9px] text-zinc-500 dark:text-zinc-400">
                  ⌘K
                </kbd>
              </div>
            </div>

            {/* Theme Toggle (Light / Dark) */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              type="button"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-zinc-600" />
              )}
            </button>

            {/* Notifications Indicator */}
            <button
              aria-label="Notifications"
              className="relative p-1.5 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              type="button"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-zinc-900"></span>
            </button>
          </div>
        </header>

        {/* Router Outlet for Pages */}
        <main className="flex-1 pt-14 bg-[#fafafa] dark:bg-zinc-950">
          <Outlet />
        </main>
      </div>

      {/* Keyboard Shortcuts Cheat-Sheet Modal */}
      {showShortcutsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-800 max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  <HelpCircle className="w-4 h-4" />
                </span>
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">Keyboard Shortcuts</h3>
              </div>
              <button
                onClick={() => setShowShortcutsModal(false)}
                className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-zinc-700 dark:text-zinc-300">
              <div className="flex items-center justify-between py-1.5 px-2 rounded bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700">
                <span>Approve & Publish question in review</span>
                <kbd className="px-2 py-0.5 rounded bg-white dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 font-mono font-bold text-indigo-700 dark:text-indigo-300 shadow-2xs">
                  A
                </kbd>
              </div>

              <div className="flex items-center justify-between py-1.5 px-2 rounded bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700">
                <span>Reject question in review</span>
                <kbd className="px-2 py-0.5 rounded bg-white dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 font-mono font-bold text-rose-700 dark:text-rose-400 shadow-2xs">
                  R
                </kbd>
              </div>

              <div className="flex items-center justify-between py-1.5 px-2 rounded bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700">
                <span>Next question in queue</span>
                <kbd className="px-2 py-0.5 rounded bg-white dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 font-mono font-bold text-zinc-700 dark:text-zinc-300 shadow-2xs">
                  K
                </kbd>
              </div>

              <div className="flex items-center justify-between py-1.5 px-2 rounded bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700">
                <span>Focus search input</span>
                <kbd className="px-2 py-0.5 rounded bg-white dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 font-mono font-bold text-zinc-700 dark:text-zinc-300 shadow-2xs">
                  /
                </kbd>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowShortcutsModal(false)}
                className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
