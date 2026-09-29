import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Terminal,
  Mail,
  ArrowRight,
  CheckCircle2,
  Github,
  Twitter,
  Linkedin,
  Activity,
} from 'lucide-react';
import { BrandLogo } from '../Common/BrandLogo';
import { useToast } from '../../context/ToastContext';
import { isMockEnabled } from '../../config/env';

export const Footer: React.FC = () => {
  const mockActive = isMockEnabled();
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Safe toast access with fallback in test environments
  let showToast: (msg: string, type?: 'success' | 'error' | 'info') => void = () => {};
  try {
    const toast = useToast();
    showToast = toast.showToast;
  } catch {
    // Graceful fallback if rendered outside ToastProvider
  }

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      showToast('Please enter a valid engineering email address.', 'error');
      return;
    }

    setIsSubscribed(true);
    showToast('Subscribed! You will receive our weekly Staff Architecture breakdown.', 'success');
  };

  return (
    <footer className="w-full bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800/80 mt-20 transition-colors text-left">
      {/* 1. Newsletter / Staff Architecture Digest Strip */}
      <div className="border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/60 dark:bg-zinc-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-xl space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-mono text-indigo-600 dark:text-indigo-400 font-medium">
                <Mail className="w-3.5 h-3.5" />
                <span>STAFF ARCHITECTURE DIGEST • TUESDAY RELEASES</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
                Deconstruct Staff-Level Distributed Edge Cases
              </h3>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                {mockActive
                  ? 'Join 8,500+ engineers receiving real interview dilemmas: Redis Sentinel split-brain healing, XFetch cache stampede math, and CPU memory consistency. No spam, ever.'
                  : 'Receive real staff interview dilemmas: Redis Sentinel split-brain healing, XFetch cache stampede math, and CPU memory consistency. No spam, ever.'}
              </p>
            </div>

            {/* Subscribe Form */}
            <div className="w-full lg:w-auto shrink-0">
              {!isSubscribed ? (
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row items-center gap-2 w-full max-w-md">
                  <div className="relative w-full sm:w-72">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="engineer@company.com"
                      aria-label="Email address for weekly digest"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors shadow-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer shrink-0"
                  >
                    <span>Subscribe</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              ) : (
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Subscribed! Check your inbox for Tuesday's breakdown.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main 5-Column Navigation Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Column 1: Brand & Status */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1 space-y-4">
            <Link to="/" className="inline-block transition-opacity hover:opacity-85" aria-label="FastQuiz Home">
              <BrandLogo size="md" showBadge={true} />
            </Link>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Precision engineering diagnostics and calibrated problem sets for senior and staff engineering roles. Pay only for what you practice.
            </p>

            {/* System Status Pill */}
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 w-fit">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-mono text-zinc-600 dark:text-zinc-400">
                All Systems Operational
              </span>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-1 text-zinc-400 dark:text-zinc-500">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                aria-label="GitHub Repository"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                aria-label="Twitter / X"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Curriculum Tracks */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-900 dark:text-zinc-100 font-semibold">
              Curriculum Tracks
            </h4>
            <ul className="space-y-2 text-xs text-zinc-500 dark:text-zinc-400">
              <li>
                <Link to="/topics/distributed-caching" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                  Distributed Caching
                </Link>
              </li>
              <li>
                <Link to="/topics/arrays-two-pointers" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                  Arrays & Two Pointers
                </Link>
              </li>
              <li>
                <Link to="/topics/concurrency-os" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                  Concurrency & Mutexes
                </Link>
              </li>
              <li>
                <Link to="/topics" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                  Topic Catalog
                </Link>
              </li>
              <li>
                <Link to="/topics?filter=mock" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                  Mock Tests & Timed Runs
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Platform Features */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-900 dark:text-zinc-100 font-semibold">
              Platform
            </h4>
            <ul className="space-y-2 text-xs text-zinc-500 dark:text-zinc-400">
              <li>
                <Link to={mockActive ? '/quiz/quiz-cache-1/take' : '/topics'} className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                  Free Diagnostics
                </Link>
              </li>
              <li>
                <Link to="/curriculum" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                  Curriculum Dashboard
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                  Pricing & Modules
                </Link>
              </li>
              <li>
                <Link to={mockActive ? '/attempts/att-seed-1/results' : '/curriculum'} className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                  Diagnostic Telemetry
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                  Topic Master Passes
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Architecture Blueprints */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-900 dark:text-zinc-100 font-semibold">
              Technical Insights
            </h4>
            <ul className="space-y-2 text-xs text-zinc-500 dark:text-zinc-400">
              <li>
                <Link to="/topics/distributed-caching" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                  XFetch Algorithm Math
                </Link>
              </li>
              <li>
                <Link to="/topics/distributed-caching" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                  Redis Sentinel Quorum
                </Link>
              </li>
              <li>
                <Link to="/topics/concurrency-os" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                  Memory Barrier Models
                </Link>
              </li>
              <li>
                <Link to="/curriculum" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                  FAANG L6 Staff Rubrics
                </Link>
              </li>
              <li>
                <Link to="/topics" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                  Latency Pacing Metrics
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Trust & Security */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-900 dark:text-zinc-100 font-semibold">
              Trust & Legal
            </h4>
            <ul className="space-y-2 text-xs text-zinc-500 dark:text-zinc-400">
              <li className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300">
                <Shield className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Encrypted Proctoring</span>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                  Terms of Assessment
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                  Zero Data-Mining Pledge
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                  Refund & Access Guarantee
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 3. Bottom Legal & Indicator Bar */}
      <div className="border-t border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-950/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-2">
            <span>© 2026 FastQuiz Inc. Built for ambitious engineers worldwide.</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 font-mono text-[11px]">
            <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
              <Shield className="w-3.5 h-3.5 text-indigo-500" />
              <span>TLS 1.3 Proctoring</span>
            </div>
            <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
              <Terminal className="w-3.5 h-3.5 text-zinc-400" />
              <span>L5/L6 Staff Calibrated</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <Activity className="w-3.5 h-3.5" />
              <span>99.98% Uptime</span>
            </div>
            <span className="text-zinc-400 dark:text-zinc-600">•</span>
            <span className="text-zinc-600 dark:text-zinc-400">INR (₹) / USD ($) Pay-As-You-Need</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
