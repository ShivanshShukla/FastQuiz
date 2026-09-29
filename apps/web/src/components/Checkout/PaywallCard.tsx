import React, { useState } from 'react';
import { Lock, Award, CheckCircle2, Shield, CreditCard, Sparkles, Zap } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { webMockStore } from '../../services/webMockStore';

interface PaywallCardProps {
  quizId?: string;
  topicTitle?: string;
  onUnlocked?: () => void;
}

export const PaywallCard: React.FC<PaywallCardProps> = ({
  quizId = 'quiz-cache-1',
  topicTitle = 'Distributed Caching',
  onUnlocked,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'single' | 'bundle'>('bundle');
  const [isProcessing, setIsProcessing] = useState(false);
  const { showToast } = useToast();

  const handleCheckout = () => {
    setIsProcessing(true);
    const amount = selectedPlan === 'single' ? '₹99' : '₹399';
    showToast(`Opening secure 256-bit checkout for ${amount}...`, 'info');

    setTimeout(() => {
      webMockStore.purchaseItem(selectedPlan === 'single' ? quizId : 'master-bundle');
      setIsProcessing(false);
      showToast(
        selectedPlan === 'single'
          ? `Successfully unlocked explanations for ${topicTitle}!`
          : 'Successfully unlocked System Architecture Master Bundle (All 8 Quizzes)!',
        'success'
      );
      if (onUnlocked) onUnlocked();
    }, 1200);
  };

  return (
    <div
      id="paywallCard"
      className="relative overflow-hidden rounded-2xl bg-white dark:bg-[#171b26] border-2 border-indigo-300 dark:border-[#6366F1]/50 p-6 sm:p-7 shadow-[0_0_35px_rgba(99,102,241,0.2)] text-left"
    >
      <div className="absolute -top-24 -right-24 w-52 h-52 rounded-full bg-[#6366F1]/20 blur-3xl pointer-events-none"></div>

      {/* Header Badge */}
      <div className="flex items-center justify-between pb-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 dark:bg-[#2a170f] border border-orange-300 dark:border-[#f97316]/40 text-orange-700 dark:text-[#ffb690] font-headline text-[11px] uppercase tracking-wider font-extrabold shadow-sm">
          <Award className="w-3.5 h-3.5 text-orange-500" />
          Staff Engineering Playbook
        </span>
        <span className="flex items-center gap-1 text-emerald-600 dark:text-[#10b981] font-mono text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          Free Attempt Complete
        </span>
      </div>

      <h2 className="font-headline text-xl sm:text-2xl text-slate-900 dark:text-white font-extrabold tracking-tight">
        Unlock Senior Staff Explanations & Complete Playbooks
      </h2>
      <p className="font-body text-xs sm:text-sm text-slate-600 dark:text-[#94A3B8] mt-2 leading-relaxed">
        Level up from guessing answers to mastering trade-offs. Inspect production failure postmortems, live topology diagrams, and interview rubrics.
      </p>

      {/* Value Proposition Checklist */}
      <div className="mt-5 space-y-2.5">
        <div className="flex items-start gap-2.5 text-slate-800 dark:text-[#F8FAFC]">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-[#10B981] shrink-0 mt-0.5" />
          <span className="font-body text-xs sm:text-sm">High-res system diagrams (Excalidraw & Draw.io editable files)</span>
        </div>
        <div className="flex items-start gap-2.5 text-slate-800 dark:text-[#F8FAFC]">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-[#10B981] shrink-0 mt-0.5" />
          <span className="font-body text-xs sm:text-sm">Production postmortem code examples (Go, Java, Redis Lua)</span>
        </div>
        <div className="flex items-start gap-2.5 text-slate-800 dark:text-[#F8FAFC]">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-[#10B981] shrink-0 mt-0.5" />
          <span className="font-body text-xs sm:text-sm">Exact L6/L7 grading rubric used in FAANG & tier-1 loops</span>
        </div>
      </div>

      {/* Pricing Selector Cards */}
      <div className="mt-6 flex flex-col gap-3">
        <div className="text-[11px] uppercase tracking-wider font-mono text-indigo-600 dark:text-[#818cf8] font-bold">
          Select Access Option:
        </div>

        {/* Option 1: Single Quiz */}
        <label
          className={`group relative flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all border ${
            selectedPlan === 'single'
              ? 'bg-indigo-50/70 dark:bg-[#1e1b4b]/40 border-indigo-500'
              : 'bg-slate-50 dark:bg-[#0a0e18] border-slate-200 dark:border-[#283145] hover:border-indigo-400'
          }`}
        >
          <div className="flex items-center gap-3">
            <input
              type="radio"
              name="plan_selection"
              value="single"
              checked={selectedPlan === 'single'}
              onChange={() => setSelectedPlan('single')}
              className="h-4 w-4 text-primary focus:ring-primary accent-primary"
            />
            <div>
              <span className="font-headline text-xs sm:text-sm text-slate-900 dark:text-white font-bold block">
                {topicTitle} Only
              </span>
              <span className="font-body text-[11px] text-slate-500 dark:text-[#94A3B8]">
                Lifetime access to this topic breakdown & answers
              </span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="font-headline text-lg sm:text-xl text-slate-900 dark:text-white font-extrabold">₹99</span>
            <span className="block font-mono text-[11px] text-slate-400 dark:text-[#64748B] line-through">₹249</span>
          </div>
        </label>

        {/* Option 2: Full Master Bundle (Featured Default) */}
        <label
          className={`group relative flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all border-2 ${
            selectedPlan === 'bundle'
              ? 'bg-indigo-50 dark:bg-gradient-to-r dark:from-[#1e1b4b]/80 dark:to-[#171b26] border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.25)]'
              : 'bg-slate-50 dark:bg-[#0a0e18] border-slate-200 dark:border-[#283145]'
          }`}
        >
          <div className="absolute -top-2.5 right-5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-600 text-white font-headline text-[10px] uppercase font-black tracking-wide shadow-md">
            BEST VALUE • SAVE 72%
          </div>
          <div className="flex items-center gap-3">
            <input
              type="radio"
              name="plan_selection"
              value="bundle"
              checked={selectedPlan === 'bundle'}
              onChange={() => setSelectedPlan('bundle')}
              className="h-4 w-4 text-primary focus:ring-primary accent-primary"
            />
            <div>
              <span className="font-headline text-xs sm:text-sm text-slate-900 dark:text-white font-black block">
                System Architecture Master Bundle
              </span>
              <span className="font-body text-[11px] text-slate-600 dark:text-[#cbd5e1]">
                8 Quizzes • 80 Explanations • Full Staff Playbooks
              </span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="font-headline text-lg sm:text-xl text-indigo-600 dark:text-[#818cf8] font-black">₹399</span>
            <span className="block font-mono text-[11px] text-slate-400 dark:text-[#64748B] line-through">₹1,499</span>
          </div>
        </label>
      </div>

      {/* Primary CTA Extrusion Button */}
      <div className="mt-6 flex flex-col gap-3">
        <button
          type="button"
          onClick={handleCheckout}
          disabled={isProcessing}
          className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-primary via-indigo-600 to-indigo-700 text-white font-headline text-base sm:text-lg font-black btn-tactile-primary hover:brightness-110 active:translate-y-1 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Zap className="w-5 h-5 fill-current" />
          <span>
            {isProcessing
              ? 'Processing...'
              : `Unlock Staff Playbook • ${selectedPlan === 'single' ? '₹99' : '₹399'}`}
          </span>
        </button>

        {/* Payment Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-slate-500 dark:text-[#94A3B8] font-mono text-[11px] pt-1">
          <div className="flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-emerald-500 dark:text-[#10B981]" />
            <span>256-bit SSL</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <CreditCard className="w-3.5 h-3.5 text-indigo-500 dark:text-[#818cf8]" />
            <span>UPI, Cards & Netbanking</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-orange-500 dark:text-[#f97316]" />
            <span>Razorpay Verified</span>
          </div>
        </div>
      </div>

      {/* Social Proof Endorsement Quote */}
      <div className="mt-5 pt-4 bg-slate-100 dark:bg-[#0a0e18]/80 border border-slate-200 dark:border-[#283145] p-4 rounded-xl flex items-center gap-3">
        <img
          className="w-10 h-10 rounded-full object-cover shrink-0 ring-1 ring-slate-300 dark:ring-[#283145]"
          alt="Senior SRE Siddharth"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBZoxpQ8QKeg1O3KgDxk1j4h_bpF78STcTVrYdjr95GZbpAw1ULnvKxqKILarIw9l3QyzoQfKo0XyvKg6I9c3s3-YaaZgalwHikg83thiRnbVpa82bVePWTsuvvBzGlFTcoaRatremN9Tfv-JQnBNBvxhWvEeRHtRZteRhaoF_N-elD-JThdPr4Dyinfb4lakc2y3H-uGZJZkEGYFj4fXgCwuBTE51z2FZH47cZ0LcM2mYW94jma8Gc"
        />
        <div>
          <p className="font-body text-xs text-slate-700 dark:text-[#CBD5E1] italic leading-snug">
            "The cache invalidation and thundering herd diagrams here directly mirrored my actual Uber L5 loop."
          </p>
          <span className="font-headline text-[11px] text-slate-500 dark:text-[#94A3B8] font-bold block mt-1">
            Siddharth N. • Senior SRE
          </span>
        </div>
      </div>
    </div>
  );
};
