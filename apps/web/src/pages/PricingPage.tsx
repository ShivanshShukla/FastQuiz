import React from "react";
import { CheckCircle2, ArrowRight, ShieldCheck, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { webMockStore } from "../services/webMockStore";

export const PricingPage: React.FC = () => {
  const { showToast } = useToast();

  const handleBuy = (planName: string, amount: string) => {
    webMockStore.purchaseItem("master-bundle");
    showToast(
      `Purchased ${planName} for ${amount}. Access unlocked.`,
      "success",
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-left space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
          PRICING & LICENSING
        </span>
        <h1 className="text-3xl sm:text-4xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
          Flexible, Pay-Per-Track Access
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          No recurring monthly traps or expensive annual lock-ins. Practice
          entrypoint diagnostics for free, and unlock comprehensive solution
          matrices only when needed.
        </p>
      </div>

      {/* Pricing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch max-w-5xl mx-auto">
        {/* Tier 1: Free Diagnostic */}
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-mono font-medium text-zinc-500 uppercase">
                Free Evaluation
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-semibold font-mono text-zinc-900 dark:text-zinc-100">
                  ₹0
                </span>
                <span className="text-xs text-zinc-500 font-mono">
                  / forever
                </span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed pt-1">
                Evaluate your instincts with 1 full diagnostic assessment per
                curriculum track.
              </p>
            </div>

            <div className="space-y-2.5 pt-4 border-t border-zinc-100 dark:border-zinc-800/80 text-xs text-zinc-600 dark:text-zinc-400">
              <div className="flex items-center gap-2">
                <CheckCircle2
                  className="w-3.5 h-3.5 text-emerald-500 shrink-0"
                  aria-hidden="true"
                />
                <span>1 Free Quiz per curriculum track</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2
                  className="w-3.5 h-3.5 text-emerald-500 shrink-0"
                  aria-hidden="true"
                />
                <span>Real-time test runner & countdown timer</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2
                  className="w-3.5 h-3.5 text-emerald-500 shrink-0"
                  aria-hidden="true"
                />
                <span>Accuracy and percentile benchmark matrix</span>
              </div>
            </div>
          </div>

          <div className="pt-8">
            <button
              type="button"
              onClick={() =>
                showToast(
                  "Free assessment access is active for all tracks.",
                  "info",
                )
              }
              className="w-full py-2.5 px-4 rounded-md border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer"
            >
              Current Active Access
            </button>
          </div>
        </div>

        {/* Tier 2: Single Module */}
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-mono font-medium text-indigo-600 dark:text-indigo-400 uppercase">
                Single Module
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-semibold font-mono text-zinc-900 dark:text-zinc-100">
                  ₹99
                </span>
                <span className="text-xs text-zinc-500 font-mono">
                  / module
                </span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed pt-1">
                Unlock a specific assessment with complete reference
                explanations and code.
              </p>
            </div>

            <div className="space-y-2.5 pt-4 border-t border-zinc-100 dark:border-zinc-800/80 text-xs text-zinc-600 dark:text-zinc-400">
              <div className="flex items-center gap-2">
                <CheckCircle2
                  className="w-3.5 h-3.5 text-emerald-500 shrink-0"
                  aria-hidden="true"
                />
                <span>Lifetime access to selected quiz</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2
                  className="w-3.5 h-3.5 text-emerald-500 shrink-0"
                  aria-hidden="true"
                />
                <span>Detailed step-by-step technical explanations</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2
                  className="w-3.5 h-3.5 text-emerald-500 shrink-0"
                  aria-hidden="true"
                />
                <span>Reference code snippets in Go & Java</span>
              </div>
            </div>
          </div>

          <div className="pt-8">
            <button
              type="button"
              onClick={() => handleBuy("Single Quiz", "₹99")}
              className="w-full py-2.5 px-4 rounded-md border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              Unlock Single Quiz • ₹99
            </button>
          </div>
        </div>

        {/* Tier 3: Track Master Bundle */}
        <div className="rounded-lg border-2 border-indigo-600 dark:border-indigo-500 bg-white dark:bg-zinc-900/60 p-6 flex flex-col justify-between relative shadow-sm">
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-medium text-indigo-600 dark:text-indigo-400 uppercase">
                  Complete Track Pass
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900">
                  RECOMMENDED
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-semibold font-mono text-zinc-900 dark:text-zinc-100">
                  ₹399
                </span>
                <span className="text-xs text-zinc-400 font-mono line-through">
                  ₹1,499
                </span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed pt-1">
                Full access to all 8 quizzes in the track, reference
                postmortems, and topologies.
              </p>
            </div>

            <div className="space-y-2.5 pt-4 border-t border-zinc-100 dark:border-zinc-800/80 text-xs text-zinc-700 dark:text-zinc-300">
              <div className="flex items-center gap-2">
                <CheckCircle2
                  className="w-3.5 h-3.5 text-emerald-500 shrink-0"
                  aria-hidden="true"
                />
                <span>All 8 Track Quizzes & Diagnostics</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2
                  className="w-3.5 h-3.5 text-emerald-500 shrink-0"
                  aria-hidden="true"
                />
                <span>Production failure postmortem case studies</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2
                  className="w-3.5 h-3.5 text-emerald-500 shrink-0"
                  aria-hidden="true"
                />
                <span>System architecture failure topologies</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2
                  className="w-3.5 h-3.5 text-emerald-500 shrink-0"
                  aria-hidden="true"
                />
                <span>Staff engineer grading rubrics</span>
              </div>
            </div>
          </div>

          <div className="pt-8">
            <button
              type="button"
              onClick={() => handleBuy("Master Bundle", "₹399")}
              className="w-full py-2.5 px-4 rounded-md bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white text-xs font-medium transition-colors shadow-sm flex items-center justify-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <span>Unlock Master Bundle • ₹399</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Trust & Refund Policy Note */}
      <div className="max-w-2xl mx-auto p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-600 dark:text-zinc-400">
        <div className="flex items-center gap-2">
          <ShieldCheck
            className="w-4 h-4 text-emerald-500 shrink-0"
            aria-hidden="true"
          />
          <span>
            All transactions in INR (₹) inclusive of GST. Razorpay verified.
          </span>
        </div>
        <Link
          to="/refund-policy"
          className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium flex items-center gap-1 shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
          <span>7-Day Refund Policy</span>
        </Link>
      </div>
    </div>
  );
};
