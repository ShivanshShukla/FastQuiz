import React, { useState } from "react";
import { Lock, CheckCircle2, Shield, CreditCard, Sparkles } from "lucide-react";
import { useToast } from "../../context/ToastContext";
import { quizApi } from "../../services/api";

interface PaywallCardProps {
  quizId?: string;
  topicTitle?: string;
  onUnlocked?: () => void;
}

export const PaywallCard: React.FC<PaywallCardProps> = ({
  quizId = "current-quiz",
  topicTitle = "Current Topic",
  onUnlocked,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<"single" | "bundle">(
    "bundle",
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const { showToast } = useToast();

  const handleCheckout = () => {
    setIsProcessing(true);
    const amount = selectedPlan === "single" ? "₹99" : "₹399";
    showToast(`Initializing secure checkout for ${amount}...`, "info");

    setTimeout(async () => {
      await quizApi.purchaseItem(
        selectedPlan === "single" ? quizId || "single-quiz" : "master-bundle",
      );
      setIsProcessing(false);
      showToast(
        selectedPlan === "single"
          ? `Successfully unlocked explanations for ${topicTitle}!`
          : "Successfully unlocked System Architecture Master Bundle!",
        "success",
      );
      if (onUnlocked) onUnlocked();
    }, 1000);
  };

  return (
    <div
      id="paywallCard"
      className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-6 text-left space-y-5"
    >
      {/* Header Tag & Title */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
            PRO ACCESS PASS
          </span>
          <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            Free Diagnostic Complete
          </span>
        </div>

        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
          Unlock Senior Staff Explanations & Complete Playbooks
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
          Comprehensive production postmortems, reference code implementations,
          and interview rubrics for senior & staff loops.
        </p>
      </div>

      {/* Feature Bulletpoints */}
      <div className="space-y-2 text-xs text-zinc-700 dark:text-zinc-300">
        <div className="flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <span>
            System failure postmortems & architecture trade-off guides
          </span>
        </div>
        <div className="flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <span>Production code templates in Go, Java, and Redis Lua</span>
        </div>
        <div className="flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <span>L6/L7 grading rubric used in top-tier engineering loops</span>
        </div>
      </div>

      {/* Plan Radio Selector */}
      <div className="space-y-2.5 pt-1">
        <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block">
          Select Access Tier:
        </span>

        {/* Option 1: Single Quiz */}
        <label
          className={`flex items-center justify-between p-3 rounded-md cursor-pointer border transition-colors ${
            selectedPlan === "single"
              ? "border-indigo-600 dark:border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20"
              : "border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 hover:border-zinc-300 dark:hover:border-zinc-700"
          }`}
        >
          <div className="flex items-center gap-3">
            <input
              type="radio"
              name="plan_selection"
              value="single"
              checked={selectedPlan === "single"}
              onChange={() => setSelectedPlan("single")}
              className="h-3.5 w-3.5 text-indigo-600 focus:ring-indigo-500"
            />
            <div>
              <span className="text-xs font-medium text-zinc-900 dark:text-zinc-100 block">
                {topicTitle} Only
              </span>
              <span className="text-[11px] text-zinc-500">
                Lifetime access to this topic breakdown & answers
              </span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="text-sm font-semibold font-mono text-zinc-900 dark:text-zinc-100">
              ₹99
            </span>
            <span className="block text-[10px] font-mono text-zinc-400 line-through">
              ₹249
            </span>
          </div>
        </label>

        {/* Option 2: Full Master Bundle (Default) */}
        <label
          className={`flex items-center justify-between p-3 rounded-md cursor-pointer border transition-colors ${
            selectedPlan === "bundle"
              ? "border-indigo-600 dark:border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20"
              : "border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 hover:border-zinc-300 dark:hover:border-zinc-700"
          }`}
        >
          <div className="flex items-center gap-3">
            <input
              type="radio"
              name="plan_selection"
              value="bundle"
              checked={selectedPlan === "bundle"}
              onChange={() => setSelectedPlan("bundle")}
              className="h-3.5 w-3.5 text-indigo-600 focus:ring-indigo-500"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                  System Architecture Master Bundle
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-medium">
                  POPULAR
                </span>
              </div>
              <span className="text-[11px] text-zinc-500">
                8 Quizzes • 80 Explanations • Full Staff Playbooks
              </span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="text-sm font-semibold font-mono text-indigo-600 dark:text-indigo-400">
              ₹399
            </span>
            <span className="block text-[10px] font-mono text-zinc-400 line-through">
              ₹1,499
            </span>
          </div>
        </label>
      </div>

      {/* Primary Action Button */}
      <div className="space-y-3 pt-2">
        <button
          type="button"
          onClick={handleCheckout}
          disabled={isProcessing}
          aria-label={`Unlock ${selectedPlan === "single" ? `${topicTitle} single quiz for ₹99` : "System Architecture Master Bundle for ₹399"}`}
          className="w-full py-2.5 px-4 rounded-md bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white text-xs font-medium transition-colors shadow-sm cursor-pointer disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          {isProcessing
            ? "Processing..."
            : `Unlock Staff Playbook • ${selectedPlan === "single" ? "₹99" : "₹399"}`}
        </button>

        {/* Trust Badges */}
        <div className="flex items-center justify-center gap-3 text-zinc-400 font-mono text-[10px]">
          <div className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-emerald-500" />
            <span>256-bit SSL</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <CreditCard className="w-3 h-3 text-zinc-400" />
            <span>Cards & UPI</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-zinc-400" />
            <span>Razorpay Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
};
