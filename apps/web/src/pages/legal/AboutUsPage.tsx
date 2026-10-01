import { Building2, MapPin, Mail, Phone, Scale } from "lucide-react";
import { Link } from "react-router-dom";

export const AboutUsPage: React.FC = () => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-left space-y-12">
      {/* Header */}
      <div className="space-y-4 border-b border-zinc-200 dark:border-zinc-800 pb-8">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono uppercase px-2.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-medium">
            COMPANY DISCLOSURES & ASSET COMPLIANCE
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
          About FastQuiz & Statutory Business Details
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-3xl">
          FastQuiz is a modern technical assessment platform dedicated to
          helping software engineers master high-scale distributed systems and
          algorithms through calibrated diagnostics — without rigid annual
          subscriptions.
        </p>
      </div>

      {/* Statutory Business Details Card (Consumer Protection E-Commerce Rules, 2020) */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                Statutory Corporate Entity Information
              </h2>
              <span className="text-xs text-zinc-500">
                Disclosed in accordance with Rule 4(1) of Consumer Protection
                (E-Commerce) Rules, 2020
              </span>
            </div>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            Active Entity
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-zinc-700 dark:text-zinc-300">
          <div className="space-y-3">
            <div>
              <span className="text-zinc-400 font-mono uppercase text-[10px] block">
                Legal Name of Entity
              </span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
                FastQuiz Technologies Private Limited
              </span>
            </div>
            <div>
              <span className="text-zinc-400 font-mono uppercase text-[10px] block">
                Corporate Identity Number (CIN)
              </span>
              <span className="font-mono text-zinc-900 dark:text-zinc-100">
                U72900KA2024PTC189421
              </span>
            </div>
            <div>
              <span className="text-zinc-400 font-mono uppercase text-[10px] block">
                Registered Jurisdiction
              </span>
              <span>Registrar of Companies (RoC), Karnataka, India</span>
            </div>
            <div>
              <span className="text-zinc-400 font-mono uppercase text-[10px] block">
                Goods & Services Tax Identification Number (GSTIN)
              </span>
              <span className="font-mono text-zinc-900 dark:text-zinc-100">
                29AAACF1234F1Z8 (State Code: 29 Karnataka)
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-zinc-400 font-mono uppercase text-[10px] block">
                Registered & Corporate Headquarters
              </span>
              <div className="flex items-start gap-1.5 pt-0.5">
                <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                <span>
                  4th Floor, Tech Innovation Hub, 14th Main Road, HSR Layout
                  Sector 4, Bengaluru, Karnataka 560102, India
                </span>
              </div>
            </div>

            <div>
              <span className="text-zinc-400 font-mono uppercase text-[10px] block">
                Customer Care Helpline & Email
              </span>
              <div className="space-y-1 pt-0.5">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <a
                    href="mailto:support@fastquiz.in"
                    className="text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    support@fastquiz.in
                  </a>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <span>+91 80 4567 8900 (Mon–Fri, 9:30 AM – 6:30 PM IST)</span>
                </div>
              </div>
            </div>

            <div>
              <span className="text-zinc-400 font-mono uppercase text-[10px] block">
                Grievance Redressal Officer
              </span>
              <div className="pt-0.5">
                <strong>Ankit Mehra</strong> (Data Protection & Grievance
                Officer)
                <div className="text-zinc-500">
                  Email:{" "}
                  <a
                    href="mailto:grievance@fastquiz.in"
                    className="text-indigo-600 dark:text-indigo-400 underline"
                  >
                    grievance@fastquiz.in
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Asset Rights & Licensing Audit */}
      <div className="space-y-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-mono uppercase text-xs font-semibold">
            <Scale className="w-4 h-4" />
            <span>Intellectual Property & Licensing Audit</span>
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Rights Verification for All Fonts, Images, Texts & Assets
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            FastQuiz operates with strict compliance regarding copyright,
            trademarks, and open-source licenses. Below is our comprehensive
            intellectual property audit:
          </p>
        </div>

        <div className="divide-y divide-zinc-200 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900 text-xs">
          {/* Typography */}
          <div className="p-4 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                1. Typography & Web Fonts
              </span>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                SIL Open Font License 1.1 / Apache 2.0
              </span>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              We use <em>Plus Jakarta Sans</em> (designed by Tokotype),{" "}
              <em>Inter</em> (designed by Rasmus Andersson),{" "}
              <em>JetBrains Mono</em> (designed by JetBrains), and{" "}
              <em>Material Symbols</em> (Google LLC). All fonts are distributed
              under the SIL Open Font License 1.1 or Apache 2.0, permitting full
              commercial web usage, embedding, and redistribution.
            </p>
          </div>

          {/* Icons & Visual Assets */}
          <div className="p-4 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                2. UI Icons & Software Libraries
              </span>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                MIT License
              </span>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Interface icons are supplied by <em>Lucide React</em> (licensed
              under MIT). Web application scaffolding uses React, Vite, and
              Tailwind CSS (all MIT licensed).
            </p>
          </div>

          {/* Proprietary Graphics & Logos */}
          <div className="p-4 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                3. Brand Artwork, Vector Icons & Avatars
              </span>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                Original Proprietary Work
              </span>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              The FastQuiz brand emblem, lightning bolt geometry, logo marks,
              and default candidate avatar graphics were created specifically
              for FastQuiz and are the exclusive intellectual property of
              FastQuiz Technologies Private Limited.
            </p>
          </div>

          {/* Question Texts & Explanations */}
          <div className="p-4 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                4. Diagnostic Content, Stems & Postmortems
              </span>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                Original Educational Works
              </span>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Assessment questions, options, diagnostic distractors, and
              solution matrices are original educational works authored for
              FastQuiz. Engineering algorithms cited (e.g. XFetch, Redis
              Sentinel Quorum, CPU memory barriers) reference publicly published
              academic papers, RFCs, and open-source documentation under fair
              educational doctrine.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-4 text-xs text-zinc-500">
        <Link
          to="/privacy"
          className="hover:text-zinc-900 dark:hover:text-zinc-100 underline"
        >
          Privacy Policy (DPDPA 2023)
        </Link>
        <Link
          to="/terms"
          className="hover:text-zinc-900 dark:hover:text-zinc-100 underline"
        >
          Terms & Conditions
        </Link>
        <Link
          to="/cookies"
          className="hover:text-zinc-900 dark:hover:text-zinc-100 underline"
        >
          Cookie Policy & Storage Details
        </Link>
        <Link
          to="/refund-policy"
          className="hover:text-zinc-900 dark:hover:text-zinc-100 underline"
        >
          Refund Policy
        </Link>
      </div>
    </div>
  );
};
