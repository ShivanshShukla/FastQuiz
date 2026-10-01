import { Sliders, Info, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

interface CookiePolicyPageProps {
  onOpenCookiePreferences?: () => void;
}

export const CookiePolicyPage: React.FC<CookiePolicyPageProps> = ({
  onOpenCookiePreferences,
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-left space-y-10">
      {/* Header */}
      <div className="space-y-4 border-b border-zinc-200 dark:border-zinc-800 pb-8">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono uppercase px-2.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-medium">
            TRANSPARENT STORAGE
          </span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1 font-mono">
            <Calendar className="w-3.5 h-3.5" />
            Last Updated: October 2026
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
          Cookie & Local Storage Policy
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-3xl">
          This Cookie Policy explains how{" "}
          <strong>FastQuiz Technologies Private Limited</strong> uses browser
          cookies, LocalStorage, and related web storage technologies on our
          website and applications, along with an explicit breakdown of the
          legal requirements under Indian law.
        </p>
      </div>

      {/* Legal Question Box: Do We Need Cookie Consent in India? */}
      <div className="p-6 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-4">
        <div className="flex items-center gap-2.5 text-indigo-900 dark:text-indigo-300 font-semibold text-sm">
          <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span>
            Legal Analysis: Is Cookie Consent Mandatory Under Indian Law?
          </span>
        </div>
        <div className="text-xs text-zinc-700 dark:text-zinc-300 space-y-3 leading-relaxed">
          <p>
            Unlike the European Union (which enforces the{" "}
            <em>ePrivacy Directive</em> requiring consent banners for all
            non-essential cookies),{" "}
            <strong>
              India does not have an explicit, standalone "Cookie Directive"
            </strong>
            . Instead, digital data storage is governed under the{" "}
            <strong>Digital Personal Data Protection Act, 2023 (DPDPA)</strong>{" "}
            and the <strong>Information Technology Act, 2000</strong>.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-lg bg-white/80 dark:bg-zinc-900/60 border border-indigo-100 dark:border-indigo-950 space-y-1">
              <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">
                1. Strictly Necessary & Functional Storage
              </span>
              <p className="text-zinc-600 dark:text-zinc-400">
                Identifiers used solely to authenticate sessions, secure API
                calls, or remember user preferences (such as light/dark mode) do
                not require blocking opt-in banners under Indian law, provided
                clear notice is provided in the Privacy and Cookie Policy.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-white/80 dark:bg-zinc-900/60 border border-indigo-100 dark:border-indigo-950 space-y-1">
              <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">
                2. FastQuiz's Privacy-First Approach
              </span>
              <p className="text-zinc-600 dark:text-zinc-400">
                Because FastQuiz{" "}
                <strong>
                  never deploys advertising or cross-site surveillance trackers
                </strong>
                , we do not inflict disruptive pop-up walls. However, to provide
                complete transparency and support international compliance, we
                provide an interactive Cookie Preferences Manager.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Itemized Table of Browser Storage */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Inventory of Local Storage & Cookies Used
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Complete inventory of keys stored on your device when navigating
              FastQuiz.
            </p>
          </div>
          {onOpenCookiePreferences && (
            <button
              type="button"
              onClick={onOpenCookiePreferences}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-sm cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Manage Cookie Preferences</span>
            </button>
          )}
        </div>

        <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-mono">
                <th className="p-3">Storage Key</th>
                <th className="p-3">Type</th>
                <th className="p-3">Category</th>
                <th className="p-3">Lifespan</th>
                <th className="p-3">Purpose</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300">
              <tr>
                <td className="p-3 font-mono font-medium text-indigo-600 dark:text-indigo-400">
                  fastquiz_access_token
                </td>
                <td className="p-3">LocalStorage</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono text-[10px] text-zinc-700 dark:text-zinc-300">
                    Strictly Necessary
                  </span>
                </td>
                <td className="p-3">Session / 30 Days</td>
                <td className="p-3 text-zinc-500">
                  Holds your encrypted JWT session authentication bearer token
                  to keep you safely signed in.
                </td>
              </tr>
              <tr>
                <td className="p-3 font-mono font-medium text-indigo-600 dark:text-indigo-400">
                  fastquiz_user
                </td>
                <td className="p-3">LocalStorage</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono text-[10px] text-zinc-700 dark:text-zinc-300">
                    Strictly Necessary
                  </span>
                </td>
                <td className="p-3">Session / 30 Days</td>
                <td className="p-3 text-zinc-500">
                  Caches active candidate name, email, and tier badge for
                  instantaneous UI rendering.
                </td>
              </tr>
              <tr>
                <td className="p-3 font-mono font-medium text-indigo-600 dark:text-indigo-400">
                  fastquiz_theme
                </td>
                <td className="p-3">LocalStorage</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono text-[10px] text-zinc-700 dark:text-zinc-300">
                    Functional / Preference
                  </span>
                </td>
                <td className="p-3">Persistent</td>
                <td className="p-3 text-zinc-500">
                  Stores your explicit display preference (Dark Mode or Light
                  Mode) to prevent screen flashes.
                </td>
              </tr>
              <tr>
                <td className="p-3 font-mono font-medium text-indigo-600 dark:text-indigo-400">
                  fastquiz_cookie_consent
                </td>
                <td className="p-3">LocalStorage</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono text-[10px] text-zinc-700 dark:text-zinc-300">
                    Strictly Necessary
                  </span>
                </td>
                <td className="p-3">1 Year</td>
                <td className="p-3 text-zinc-500">
                  Records whether you acknowledged our storage policy and saved
                  preferences.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Zero Third Party Ad Cookies */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          What We Do NOT Use
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-1">
            <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">
              No Ad Networks
            </span>
            <p className="text-zinc-500">
              No Google AdSense, Meta Pixel, TikTok, or advertising beacons.
            </p>
          </div>
          <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-1">
            <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">
              No Cross-Site Tracking
            </span>
            <p className="text-zinc-500">
              We do not track your browsing habits across external domains.
            </p>
          </div>
          <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-1">
            <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">
              No Invasive Session Replay
            </span>
            <p className="text-zinc-500">
              No screen recording or keystroke capture scripts (e.g. Hotjar).
            </p>
          </div>
        </div>
      </div>

      {/* Managing and Clearing Storage */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          How to Clear or Manage Browser Storage
        </h2>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
          You can clear your local storage and cookies at any time via your
          browser settings:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
          <li>
            <strong>Google Chrome:</strong> Settings &gt; Privacy and Security
            &gt; Delete browsing data &gt; Cookies and other site data.
          </li>
          <li>
            <strong>Mozilla Firefox:</strong> Settings &gt; Privacy & Security
            &gt; Cookies and Site Data &gt; Clear Data.
          </li>
          <li>
            <strong>Apple Safari:</strong> Preferences &gt; Privacy &gt; Manage
            Website Data.
          </li>
        </ul>
        <p className="text-xs text-zinc-500 pt-1">
          Note: Clearing Strictly Necessary storage will log you out of your
          FastQuiz account and reset your theme preference to default.
        </p>
      </div>

      {/* Navigation Footer */}
      <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-4 text-xs text-zinc-500">
        <Link
          to="/privacy"
          className="hover:text-zinc-900 dark:hover:text-zinc-100 underline"
        >
          Privacy Policy
        </Link>
        <Link
          to="/terms"
          className="hover:text-zinc-900 dark:hover:text-zinc-100 underline"
        >
          Terms & Conditions
        </Link>
        <Link
          to="/refund-policy"
          className="hover:text-zinc-900 dark:hover:text-zinc-100 underline"
        >
          Refund Policy
        </Link>
        <Link
          to="/about"
          className="hover:text-zinc-900 dark:hover:text-zinc-100 underline"
        >
          Company Details
        </Link>
      </div>
    </div>
  );
};
