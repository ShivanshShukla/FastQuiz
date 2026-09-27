import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Inbox,
  BookOpen,
  Receipt,
  LogOut,
  Keyboard,
  ShieldCheck,
  X,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900 font-sans">
      {/* Top Dense Desktop Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                FastQuiz <span className="text-amber-400">⚡</span>
              </span>
              <span className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 rounded font-mono font-semibold">
                ADMIN CONSOLE
              </span>
            </div>

            {/* Navigation Tabs */}
            <nav className="flex items-center gap-1 ml-6 border-l border-slate-700/60 pl-6 text-sm">
              <NavLink
                to="/review"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-1.5 rounded font-medium transition ${
                    isActive
                      ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`
                }
              >
                <Inbox className="w-4 h-4" />
                Review Queue
              </NavLink>

              <NavLink
                to="/content"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-1.5 rounded font-medium transition ${
                    isActive
                      ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`
                }
              >
                <BookOpen className="w-4 h-4" />
                Topics & Quizzes
              </NavLink>

              <NavLink
                to="/purchases"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-1.5 rounded font-medium transition ${
                    isActive
                      ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`
                }
              >
                <Receipt className="w-4 h-4" />
                Purchases
              </NavLink>
            </nav>
          </div>

          {/* User Controls & Shortcuts */}
          <div className="flex items-center gap-3">
            {/* Keyboard Shortcuts Trigger */}
            <button
              onClick={() => setShowShortcutsModal(true)}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 rounded border border-slate-700 transition"
              title="View Keyboard Shortcuts"
            >
              <Keyboard className="w-3.5 h-3.5" />
              <span>Shortcuts</span>
              <kbd className="bg-slate-900 px-1 py-0.5 rounded text-[10px] text-slate-300">?</kbd>
            </button>

            {/* Admin Badge */}
            <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1 rounded border border-slate-700 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-300 font-medium max-w-[160px] truncate" title={user?.email}>
                {user?.name || user?.email}
              </span>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs text-rose-300 hover:text-white hover:bg-rose-900/40 px-2.5 py-1.5 rounded transition border border-rose-900/30"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>

      {/* Keyboard Shortcuts Helper Modal */}
      {showShortcutsModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-amber-400" />
                <h3 className="font-semibold text-sm">Reviewer Keyboard Shortcuts</h3>
              </div>
              <button
                onClick={() => setShowShortcutsModal(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3 text-sm">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-600">Approve Question (on Detail page)</span>
                <kbd className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-mono font-bold rounded text-xs border border-emerald-300">
                  A
                </kbd>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-600">Reject Question (opens reason prompt)</span>
                <kbd className="px-2.5 py-1 bg-rose-100 text-rose-800 font-mono font-bold rounded text-xs border border-rose-300">
                  R
                </kbd>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-600">Close modal / Cancel prompt</span>
                <kbd className="px-2.5 py-1 bg-slate-100 text-slate-700 font-mono font-bold rounded text-xs border border-slate-300">
                  Esc
                </kbd>
              </div>
              <p className="text-xs text-slate-400 pt-2 italic">
                Optimized for high-speed question moderation. You can approve or reject batches without taking your hands off the keyboard.
              </p>
            </div>
            <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 text-right">
              <button
                onClick={() => setShowShortcutsModal(false)}
                className="px-4 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded hover:bg-slate-800 transition"
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
