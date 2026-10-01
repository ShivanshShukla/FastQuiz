import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Sun, Moon, Search, Menu, X, LogOut, Activity } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { BrandLogo } from '../Common/BrandLogo';
import { UserAvatar } from '../Common/UserAvatar';

const navLinks = [
  { label: 'Curriculum', path: '/curriculum' },
  { label: 'Topics', path: '/topics' },
  { label: 'Mock Tests', path: '/topics?filter=mock' },
  { label: 'Pricing', path: '/pricing' },
];

export const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/curriculum') {
      return location.pathname === '/curriculum' || location.pathname === '/dashboard';
    }
    const basePath = path.split('?')[0];
    return location.pathname === basePath;
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/topics?q=${encodeURIComponent(q)}` : '/topics');
    setMobileOpen(false);
  };

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate('/');
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 transition-colors">
      <div className="h-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center shrink-0 transition-opacity hover:opacity-85"
          aria-label="FastQuiz Home"
        >
          <BrandLogo size="md" showBadge={true} />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Primary navigation">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                isActive(link.path)
                  ? 'text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800/80 font-semibold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Minimal Search Input */}
          <form
            onSubmit={submitSearch}
            className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 focus-within:border-indigo-500 dark:focus-within:border-indigo-400 transition-colors"
          >
            <label htmlFor="nav-search-desktop" className="sr-only">
              Search topics
            </label>
            <Search className="w-3.5 h-3.5 text-zinc-400 shrink-0" aria-hidden="true" />
            <input
              id="nav-search-desktop"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search topics..."
              aria-label="Search topics"
              className="bg-transparent border-none text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none w-24 lg:w-32 placeholder:text-zinc-400"
            />
            <kbd className="hidden lg:inline text-[10px] font-mono text-zinc-400 dark:text-zinc-500 bg-zinc-200/60 dark:bg-zinc-800 px-1 py-0.5 rounded" aria-hidden="true">
              ⌘K
            </kbd>
          </form>

          {/* Understated Streak Metric */}
          {isAuthenticated && user && (
            <div
              className="hidden lg:flex items-center gap-1.5 px-2 py-1 rounded-md border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-mono"
              title={`Consecutive Streak: ${user.streakDays || 4} days`}
            >
              <Activity className="w-3 h-3 text-emerald-500" />
              <span>{user.streakDays || 4}d Streak</span>
            </div>
          )}

          {/* Clean Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-zinc-400 hover:text-zinc-100" /> : <Moon className="w-4 h-4 text-zinc-600" />}
          </button>

          {/* User Account / Auth */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-zinc-200 dark:border-zinc-800">
              <UserAvatar src={user.avatarUrl} name={user.name} size="md" />
              <div className="hidden xl:flex flex-col text-left min-w-0">
                <span className="text-xs font-medium text-zinc-900 dark:text-zinc-200 leading-none truncate">
                  {user.name}
                </span>
                <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 leading-tight mt-0.5 truncate">
                  {user.tierTitle}
                </span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                aria-label="Log out"
                title="Log out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Link
                to="/login"
                className="px-2.5 py-1.5 rounded-md text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 text-xs font-medium transition-colors"
              >
                Sign in
              </Link>
              <Link
                to="/quiz/quiz-cache-1/take"
                className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium transition-colors shadow-sm"
              >
                Start Free
              </Link>
            </div>
          )}

          {/* Mobile menu trigger */}
          <button
            type="button"
            className="md:hidden p-1.5 rounded-md text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3 space-y-3">
          <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`px-3 py-2 rounded-md text-xs font-medium ${
                  isActive(link.path)
                    ? 'text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800/80'
                    : 'text-zinc-600 dark:text-zinc-400'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <form onSubmit={submitSearch} className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <label htmlFor="nav-search-mobile" className="sr-only">
              Search topics
            </label>
            <Search className="w-3.5 h-3.5 text-zinc-400" aria-hidden="true" />
            <input
              id="nav-search-mobile"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search topics..."
              aria-label="Search topics"
              className="bg-transparent border-none text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none w-full"
            />
          </form>

          {isAuthenticated && user ? (
            <div className="flex items-center justify-between pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2 min-w-0">
                <UserAvatar src={user.avatarUrl} name={user.name} size="sm" />
                <span className="text-xs font-medium truncate text-zinc-900 dark:text-zinc-100">{user.name}</span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
              >
                Log out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="flex-1 text-center px-3 py-2 rounded-md border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium"
              >
                Sign in
              </Link>
              <Link
                to="/quiz/quiz-cache-1/take"
                onClick={() => setMobileOpen(false)}
                className="flex-1 text-center px-3 py-2 rounded-md bg-indigo-600 text-white text-xs font-medium"
              >
                Start Free
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
