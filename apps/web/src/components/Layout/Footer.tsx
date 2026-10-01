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
  Sliders,
} from 'lucide-react';
import { BrandLogo } from '../Common/BrandLogo';
import { useToast } from '../../context/ToastContext';

export const Footer: React.FC = () => {
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

  const openCookiePreferences = () => {
    window.dispatchEvent(new CustomEvent('open-cookie-preferences'));
  };

  return (
    <footer className="w-full bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800/80 mt-20 transition-colors text-left">
      {/* 1. Newsletter / Staff Architecture Digest Strip */}
      <div className="border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/60 dark:bg-zinc-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-xl space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-mono text-indigo-600 dark:text-indigo-400 font-medium">
                <Mail className="w-3.5 h-3.5" aria-hidden="true" />
                <span>STAFF ARCHITECTURE DIGEST • TUESDAY RELEASES</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
                Deconstruct Staff-Level Distributed Edge Cases
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Receive real engineering dilemmas: Redis Sentinel split-brain healing, XFetch cache stampede math, and CPU memory consistency. Strictly zero spam, and no data sharing.
              </p>
            </div>

            {/* Subscribe Form with explicit accessible label and consent note */}
            <div className="w-full lg:w-auto shrink-0">
              {!isSubscribed ? (
                <div className="space-y-1.5">
                  <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row items-center gap-2 w-full max-w-md">
                    <div className="relative w-full sm:w-72">
                      <label htmlFor="footer-newsletter-email" className="sr-only">
                        Email address for weekly engineering digest
                      </label>
                      <input
                        id="footer-newsletter-email"
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
                      aria-label="Subscribe to weekly engineering digest"
                      className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    >
                      <span>Subscribe</span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </form>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    We collect only your email to deliver the digest. Unsubscribe anytime. View our{' '}
                    <Link to="/privacy" className="underline hover:text-indigo-600 dark:hover:text-indigo-400">
                      Privacy Policy
                    </Link>.
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
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
          {/* Column 1: Brand, Status & Entity */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1 space-y-4">
            <Link to="/" className="inline-block transition-opacity hover:opacity-85" aria-label="FastQuiz Home">
              <BrandLogo size="md" showBadge={true} />
            </Link>

            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Precision engineering diagnostics and calibrated problem sets for senior and staff engineering roles. Pay only for what you practice.
            </p>

            {/* System Status Pill */}
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 w-fit">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
              <span className="text-[11px] font-mono text-zinc-600 dark:text-zinc-400">
                All Systems Operational
              </span>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-1 text-zinc-400 dark:text-zinc-500">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors p-1"
                aria-label="Visit FastQuiz on GitHub"
              >
                <Github className="w-4 h-4" aria-hidden="true" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors p-1"
                aria-label="Visit FastQuiz on Twitter"
              >
                <Twitter className="w-4 h-4" aria-hidden="true" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors p-1"
                aria-label="Visit FastQuiz on LinkedIn"
              >
                <Linkedin className="w-4 h-4" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Column 2: Curriculum Tracks */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-900 dark:text-zinc-100 font-semibold">
              Curriculum Tracks
            </h4>
            <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
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
                <Link to="/curriculum" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                  Curriculum Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Platform Features */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-900 dark:text-zinc-100 font-semibold">
              Platform & Pricing
            </h4>
            <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
              <li>
                <Link to="/pricing" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                  Free Diagnostics (₹0)
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                  Single Modules (₹99)
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                  Topic Master Passes (₹399)
                </Link>
              </li>
              <li>
                <Link to="/curriculum" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                  Diagnostic Telemetry
                </Link>
              </li>
              <li>
                <Link to="/refund-policy" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                  Refund & Access Guarantee
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Architecture Blueprints */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-900 dark:text-zinc-100 font-semibold">
              Engineering Specs
            </h4>
            <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
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
                <Link to="/about" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                  Open Source & Asset Rights
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                  Statutory Business Details
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Trust, Legal & Privacy (DPDPA 2023 Compliant) */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-900 dark:text-zinc-100 font-semibold">
              Trust & Legal (India)
            </h4>
            <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
              <li>
                <Link to="/privacy" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                  Privacy Policy (DPDPA 2023)
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                  Cookie & Storage Policy
                </Link>
              </li>
              <li>
                <Link to="/refund-policy" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                  Refund Policy (E-Commerce)
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                  About & Company Details
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={openCookiePreferences}
                  className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer pt-1"
                >
                  <Sliders className="w-3 h-3" aria-hidden="true" />
                  <span>Cookie Settings</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 3. Bottom Legal & Entity Bar (Consumer Protection E-Commerce Rules, 2020) */}
      <div className="border-t border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-950/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-500 dark:text-zinc-400">
          <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
            <span>© 2026 FastQuiz Technologies Private Limited. Registered in Bengaluru, Karnataka, India.</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 font-mono text-[11px]">
            <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
              <Shield className="w-3.5 h-3.5 text-indigo-500" aria-hidden="true" />
              <span>TLS 1.3 Encrypted</span>
            </div>
            <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
              <Terminal className="w-3.5 h-3.5 text-zinc-400" aria-hidden="true" />
              <span>Calibrated Assessments</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <Activity className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Systems Operational</span>
            </div>
            <span className="text-zinc-400 dark:text-zinc-600">•</span>
            <span className="text-zinc-600 dark:text-zinc-400">INR (₹) / Razorpay Verified</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
