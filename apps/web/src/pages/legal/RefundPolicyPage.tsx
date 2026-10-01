import { CheckCircle2, ShieldCheck, Clock, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

export const RefundPolicyPage: React.FC = () => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-left space-y-10">
      {/* Header */}
      <div className="space-y-4 border-b border-zinc-200 dark:border-zinc-800 pb-8">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono uppercase px-2.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-medium">
            CONSUMER PROTECTION COMPLIANT
          </span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1 font-mono">
            <Calendar className="w-3.5 h-3.5" />
            Last Updated: October 2026
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
          Refund & Access Guarantee Policy
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-3xl">
          At <strong>FastQuiz Technologies Private Limited</strong>, we believe
          engineering preparation should be fair, transparent, and completely
          free of subscription traps. In compliance with the{" "}
          <strong>Consumer Protection Act, 2019</strong> and the{" "}
          <strong>Consumer Protection (E-Commerce) Rules, 2020</strong> of
          India, this Refund Policy outlines our refund guidelines for all
          digital module purchases.
        </p>
      </div>

      {/* Try Before You Buy Promise */}
      <div className="p-6 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-3">
        <div className="flex items-center gap-2.5 text-emerald-900 dark:text-emerald-300 font-semibold text-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>The FastQuiz "Try-Before-You-Buy" Core Guarantee</span>
        </div>
        <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
          Every curriculum track on FastQuiz includes{" "}
          <strong>
            1 full diagnostic assessment completely free (₹0 forever)
          </strong>
          , including live question navigation, real-time timer countdown, and
          preliminary competency scoring. We encourage every engineer to take
          this free assessment first to ensure our question caliber, technical
          depth, and interface meet your standards before purchasing any paid
          module.
        </p>
      </div>

      {/* Policy Details */}
      <div className="space-y-8 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
        {/* 1. Digital Content Nature */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400">
              01.
            </span>
            Digital Goods & Instant Unlock
          </h2>
          <p>
            FastQuiz products (Single Quiz Unlocks at ₹99 and Topic Master
            Bundles at ₹399) are{" "}
            <strong>digital educational assessment tools</strong>. Upon
            successful payment verification via Razorpay, access to the
            questions, solution matrices, and reference architecture
            implementations is unlocked immediately in your candidate account.
          </p>
        </section>

        {/* 2. Situations Where Full Refunds Are Granted */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400">
              02.
            </span>
            Eligible Refund Circumstances
          </h2>
          <p>
            We provide a <strong>100% full refund</strong> without hassle in the
            following scenarios:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
            <div className="p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-1">
              <span className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Technical Access Failure
              </span>
              <p className="text-zinc-500">
                Payment was successful, but the module or track failed to unlock
                on your account due to a technical server error that cannot be
                resolved within 24 hours of reporting.
              </p>
            </div>

            <div className="p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-1">
              <span className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Duplicate or Erroneous Charges
              </span>
              <p className="text-zinc-500">
                You were accidentally debited twice for the same quiz module or
                bundle due to a payment gateway timeout or network interruption.
              </p>
            </div>

            <div className="p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-1">
              <span className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Unauthorized Payment
              </span>
              <p className="text-zinc-500">
                Documented fraudulent use of your payment instrument, verified
                through bank or Razorpay payment security protocols.
              </p>
            </div>

            <div className="p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-1">
              <span className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Severe Content Discrepancy
              </span>
              <p className="text-zinc-500">
                The unlocked module is fundamentally missing the syllabus items
                or questions described in the curriculum outline.
              </p>
            </div>
          </div>
        </section>

        {/* 3. Non-Refundable Scenarios */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400">
              03.
            </span>
            Non-Refundable Circumstances
          </h2>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            Because digital assessments provide immediate revelation of
            confidential questions, solutions, and postmortem answers, refunds
            cannot be granted in the following cases:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
            <li>
              Where the assessment questions and solution keys have already been
              viewed or completed in full.
            </li>
            <li>
              Change of mind after viewing the comprehensive solution matrix.
            </li>
            <li>
              Unsatisfactory interview outcomes or screening rejections from
              external third-party companies.
            </li>
            <li>
              Accounts suspended for violating the Assessment Honor Code (such
              as scraping or sharing content).
            </li>
          </ul>
        </section>

        {/* 4. Refund Claim Window & Procedure */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400">
              04.
            </span>
            How to Request a Refund (Step-by-Step)
          </h2>
          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 text-xs space-y-3">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold">
              <Clock className="w-4 h-4 shrink-0" />
              <span>
                Refund Request Window: Within 7 Calendar Days of Purchase
              </span>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400">
              To submit a claim, send an email to{" "}
              <a
                href="mailto:billing@fastquiz.in"
                className="text-indigo-600 dark:text-indigo-400 underline font-medium"
              >
                billing@fastquiz.in
              </a>{" "}
              with the subject line{" "}
              <code>Refund Request - [Order / Payment ID]</code> containing:
            </p>
            <ol className="list-decimal pl-5 space-y-1 text-zinc-600 dark:text-zinc-400">
              <li>Your registered FastQuiz account email.</li>
              <li>
                The Razorpay payment reference ID (e.g. <code>pay_...</code>) or
                UPI transaction reference.
              </li>
              <li>The name of the module or topic bundle purchased.</li>
              <li>
                A brief description of the technical issue or reason for the
                request.
              </li>
            </ol>
            <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800/80 text-[11px] text-zinc-500">
              <strong>Processing Timeline:</strong> Our billing team will verify
              the payment log within <strong>24 business hours</strong>.
              Approved refunds are credited back to the original payment source
              (bank account, UPI handle, or credit/debit card) within{" "}
              <strong>5 to 7 business days</strong> as per banking and RBI
              settlement cycles.
            </div>
          </div>
        </section>
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
          to="/cookies"
          className="hover:text-zinc-900 dark:hover:text-zinc-100 underline"
        >
          Cookie Policy
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
