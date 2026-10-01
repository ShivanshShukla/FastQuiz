import React, { useState, useEffect, useRef } from 'react';
import { Cookie, X, Sliders } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface CookiePreferences {
  essential: boolean; // Always true
  functional: boolean; // Theme preferences, etc.
  diagnostics: boolean; // Assessment latency telemetry
}

const STORAGE_KEY = 'fastquiz_cookie_consent';

export const CookieConsentBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    functional: true,
    diagnostics: false,
  });

  const modalRef = useRef<HTMLDivElement>(null);

  // Check saved preferences on load
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setPreferences(JSON.parse(saved));
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
    } catch {
      // Graceful fallback if localStorage is disabled
      setIsVisible(true);
    }
  }, []);

  // Listen for custom event to re-open preferences from footer or policy page
  useEffect(() => {
    const handleOpenEvent = () => {
      setShowPreferencesModal(true);
      setIsVisible(false);
    };

    window.addEventListener('open-cookie-preferences', handleOpenEvent);
    return () => window.removeEventListener('open-cookie-preferences', handleOpenEvent);
  }, []);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showPreferencesModal) {
        setShowPreferencesModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showPreferencesModal]);

  const savePreferences = (prefs: CookiePreferences) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      // Ignore storage errors
    }
    setPreferences(prefs);
    setIsVisible(false);
    setShowPreferencesModal(false);
  };

  const handleAcceptAll = () => {
    savePreferences({
      essential: true,
      functional: true,
      diagnostics: true,
    });
  };

  const handleRejectNonEssential = () => {
    savePreferences({
      essential: true,
      functional: false,
      diagnostics: false,
    });
  };

  const handleSaveCustom = () => {
    savePreferences(preferences);
  };

  if (!isVisible && !showPreferencesModal) {
    return null;
  }

  return (
    <>
      {/* 1. Bottom Fixed Banner */}
      {isVisible && !showPreferencesModal && (
        <aside
          role="region"
          aria-label="Cookie and data storage preferences"
          className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-5 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 shadow-2xl transition-all"
        >
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5 max-w-3xl">
              <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5">
                <Cookie className="w-5 h-5" aria-hidden="true" />
              </div>
              <div className="space-y-1 text-left">
                <h2 className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Your Privacy & Storage Choices (DPDPA 2023 Compliant)
                </h2>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  We use essential local storage to securely sign you in and remember your assessment session. We do <strong>not</strong> use advertising trackers or sell your personal data. Read our{' '}
                  <Link
                    to="/cookies"
                    className="text-indigo-600 dark:text-indigo-400 underline hover:text-indigo-700 dark:hover:text-indigo-300 focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-sm"
                  >
                    Cookie Policy
                  </Link>{' '}
                  and{' '}
                  <Link
                    to="/privacy"
                    className="text-indigo-600 dark:text-indigo-400 underline hover:text-indigo-700 dark:hover:text-indigo-300 focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-sm"
                  >
                    Privacy Policy
                  </Link>.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setShowPreferencesModal(true)}
                className="px-3.5 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer"
              >
                Customize
              </button>
              <button
                type="button"
                onClick={handleRejectNonEssential}
                className="px-3.5 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer"
              >
                Reject Non-Essential
              </button>
              <button
                type="button"
                onClick={handleAcceptAll}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer"
              >
                Accept All
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* 2. Granular Preferences Modal */}
      {showPreferencesModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 dark:bg-zinc-950/80 backdrop-blur-sm"
        >
          <div
            ref={modalRef}
            className="w-full max-w-xl rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-6 shadow-2xl text-left"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
              <div className="flex items-center gap-2.5">
                <Sliders className="w-5 h-5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                <h2 id="cookie-modal-title" className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  Cookie & Storage Preferences
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowPreferencesModal(false)}
                aria-label="Close preferences modal"
                className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Category Toggles */}
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {/* Category 1: Strictly Necessary */}
              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    Strictly Necessary Storage (Always Active)
                  </span>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                    Mandatory
                  </span>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Required to authenticate sessions via JWT (<code>fastquiz_access_token</code>), prevent CSRF attacks, and preserve assessment attempt status. Cannot be switched off.
                </p>
              </div>

              {/* Category 2: Functional & Preferences */}
              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    Functional & UI Preferences
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.functional}
                      onChange={(e) =>
                        setPreferences({ ...preferences, functional: e.target.checked })
                      }
                      className="sr-only peer"
                      aria-label="Toggle Functional and UI preferences storage"
                    />
                    <div className="w-9 h-5 bg-zinc-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-zinc-600 peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Remembers your display theme (Dark vs. Light mode in <code>fastquiz_theme</code>) and UI layout sizing to avoid screen flickering upon page loads.
                </p>
              </div>

              {/* Category 3: Diagnostic Telemetry */}
              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    Anonymous Diagnostic Telemetry
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.diagnostics}
                      onChange={(e) =>
                        setPreferences({ ...preferences, diagnostics: e.target.checked })
                      }
                      className="sr-only peer"
                      aria-label="Toggle Anonymous Diagnostic Telemetry"
                    />
                    <div className="w-9 h-5 bg-zinc-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-zinc-600 peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Measures test question latency and response pacing to calibrate question difficulty. No personal identifiers or external tracking beacons are involved.
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={handleRejectNonEssential}
                className="px-3.5 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer"
              >
                Reject Non-Essential
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveCustom}
                  className="px-4 py-2 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-medium hover:bg-zinc-800 dark:hover:bg-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer"
                >
                  Save Choices
                </button>
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer"
                >
                  Accept All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
