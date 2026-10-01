import { ShieldCheck, Scale, AlertTriangle, Building2, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TermsAndConditionsPage: React.FC = () => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-left space-y-10">
      {/* Header */}
      <div className="space-y-4 border-b border-zinc-200 dark:border-zinc-800 pb-8">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono uppercase px-2.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-medium">
            INDIAN LAW GOVERNED
          </span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1 font-mono">
            <Calendar className="w-3.5 h-3.5" />
            Effective Date: October 2026
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
          Terms and Conditions of Use
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-3xl">
          These Terms and Conditions constitute a legally binding electronic agreement between you ("User", "you") and <strong>FastQuiz Technologies Private Limited</strong> ("FastQuiz", "Company", "we", "us") under the <strong>Information Technology Act, 2000</strong> and the <strong>Indian Contract Act, 1872</strong>.
        </p>
      </div>

      {/* Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40 space-y-1.5">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-xs font-mono uppercase">
            <Scale className="w-4 h-4" />
            Fair Pay-Per-Track
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            One free diagnostic per track. Paid single modules (₹99) and topic passes (₹399) unlock instant digital access.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40 space-y-1.5">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-xs font-mono uppercase">
            <ShieldCheck className="w-4 h-4" />
            Honor Code
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Assessments are for your individual skill calibration. Redistribution or automated scraping is prohibited.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40 space-y-1.5">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold text-xs font-mono uppercase">
            <Building2 className="w-4 h-4" />
            Indian Jurisdiction
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Subject to the laws of India, with exclusive jurisdiction resting in the competent courts of Bengaluru, Karnataka.
          </p>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-8 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
        {/* 1. Acceptance */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400">01.</span>
            Acceptance of Terms
          </h2>
          <p>
            By accessing or using the FastQuiz website, mobile apps, diagnostic engines, and services, you affirm that you are at least 18 years of age (or have received parental/guardian consent if between 15 and 18) and possess the legal capacity to enter into a valid contract under the Indian Contract Act, 1872. If you disagree with any portion of these Terms, you must discontinue platform use immediately.
          </p>
        </section>

        {/* 2. Account Registration & Security */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400">02.</span>
            Account Registration and Security
          </h2>
          <p>
            To save diagnostic attempt history and unlock paid modules, you must create an account providing accurate and truthful information. You are solely responsible for maintaining the confidentiality of your login credentials. You agree to notify us immediately at <a href="mailto:security@fastquiz.in" className="text-indigo-600 dark:text-indigo-400 underline">security@fastquiz.in</a> if you suspect unauthorized access to your account.
          </p>
        </section>

        {/* 3. Assessment Honor Code & Acceptable Use */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400">03.</span>
            Assessment Honor Code and Prohibited Conduct
          </h2>
          <p>
            FastQuiz is built to cultivate authentic engineering judgment. In using the platform, you agree NOT to:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400">
            <li>Use automated scrapers, bots, crawlers, or extraction scripts to harvest quiz questions, rubrics, or explanations.</li>
            <li>Resell, sublicense, publish, or publicly distribute FastQuiz assessment content on external forums or repositories.</li>
            <li>Attempt to reverse-engineer, decompile, or tamper with the assessment scoring algorithms, timer WebSockets, or paywall mechanisms.</li>
            <li>Share individual account credentials with multiple users to circumvent pay-per-module pricing.</li>
            <li>Impersonate another candidate or create fraudulent accounts.</li>
          </ul>
          <p className="text-xs text-zinc-500">
            Violation of these provisions will lead to immediate account suspension without refund and potential legal remedies under the Information Technology Act, 2000.
          </p>
        </section>

        {/* 4. Intellectual Property Rights */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400">04.</span>
            Intellectual Property Rights
          </h2>
          <p>
            All assessment stems, solution matrices, reference code snippets, interactive diagrams, UI designs, brand marks, and software code are the exclusive intellectual property of <strong>FastQuiz Technologies Private Limited</strong>, protected under the Copyright Act, 1957 and the Trade Marks Act, 1999 of India.
          </p>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            Purchasing a paid quiz or track pass grants you a non-exclusive, non-transferable, revocable personal license to view and study the unlocked diagnostic materials for personal educational use only.
          </p>
        </section>

        {/* 5. Pricing, Taxes & Payment Terms */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400">05.</span>
            Pricing, Billing, and Taxes (INR & GST)
          </h2>
          <p>
            FastQuiz adheres to a transparent, pay-as-you-need pricing model:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400">
            <li><strong>Free Entrypoint Diagnostic:</strong> 1 full assessment on every track is ₹0 forever without requiring payment card information.</li>
            <li><strong>Single Quiz Unlock:</strong> ₹99 per targeted module, granting lifetime access to detailed breakdowns and reference code for that module.</li>
            <li><strong>Topic Master Bundle:</strong> ₹399 per specialized track, granting full access to all 8 quizzes and architecture topologies.</li>
            <li><strong>Taxes:</strong> All listed prices for users in India are inclusive of applicable Goods and Services Tax (GST) as per Indian tax laws.</li>
            <li><strong>Payment Gateway:</strong> Transactions are routed through our RBI-authorized partner, Razorpay, supporting UPI, Net Banking, and major cards.</li>
          </ul>
        </section>

        {/* 6. Disclaimer of Warranties & Employment Outcomes */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400">06.</span>
            Educational Disclaimer & Employment Non-Guarantee
          </h2>
          <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 space-y-2">
            <div className="flex items-center gap-2 font-semibold">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>Truth in Advertising & Consumer Protection Notice</span>
            </div>
            <p className="leading-relaxed">
              FastQuiz is an independent technical self-assessment and educational preparation platform. FastQuiz does NOT guarantee that any candidate will receive an interview invitation, job offer, or specific score in employment screenings at any third-party company (including FAANG, Big Tech, or start-ups).
            </p>
            <p className="leading-relaxed">
              Trademarks such as Stripe, Uber, Datadog, Google, Meta, Redis, and Memcached referenced in architectural case studies are the property of their respective owners and are mentioned strictly for descriptive and technical educational purposes. No endorsement or affiliation is implied.
            </p>
          </div>
        </section>

        {/* 7. Limitation of Liability */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400">07.</span>
            Limitation of Liability
          </h2>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            To the maximum extent permitted by applicable Indian law, FastQuiz Technologies Private Limited, its directors, and employees shall not be liable for any indirect, incidental, punitive, or consequential damages resulting from platform downtime, assessment score results, or interview outcomes. In all circumstances, our aggregate liability shall not exceed the total amount paid by you for the specific diagnostic module giving rise to the claim.
          </p>
        </section>

        {/* 8. Governing Law & Dispute Resolution */}
        <section className="space-y-3 border-t border-zinc-200 dark:border-zinc-800 pt-6">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400">08.</span>
            Governing Law and Jurisdiction
          </h2>
          <p>
            These Terms shall be governed by, construed, and enforced in accordance with the laws of the Republic of India. In the event of any dispute or controversy arising under or relating to these Terms, the parties agree to first attempt resolution through good-faith mutual consultation.
          </p>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            If unresolved within 30 days, any dispute shall be submitted to the exclusive jurisdiction of the competent civil courts situated in <strong>Bengaluru, Karnataka, India</strong>.
          </p>
        </section>
      </div>

      {/* Navigation Footer */}
      <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-4 text-xs text-zinc-500">
        <Link to="/privacy" className="hover:text-zinc-900 dark:hover:text-zinc-100 underline">
          Privacy Policy
        </Link>
        <Link to="/cookies" className="hover:text-zinc-900 dark:hover:text-zinc-100 underline">
          Cookie Policy
        </Link>
        <Link to="/refund-policy" className="hover:text-zinc-900 dark:hover:text-zinc-100 underline">
          Refund Policy
        </Link>
        <Link to="/about" className="hover:text-zinc-900 dark:hover:text-zinc-100 underline">
          Company Details
        </Link>
      </div>
    </div>
  );
};
