import React from 'react';
import { CheckCircle2, Zap, Award, Sparkles } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { webMockStore } from '../services/webMockStore';

export const PricingPage: React.FC = () => {
  const { showToast } = useToast();

  const handleBuy = (planName: string, amount: string) => {
    webMockStore.purchaseItem('master-bundle');
    showToast(`Purchased ${planName} for ${amount}! All quizzes and playbooks unlocked.`, 'success');
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-12 text-left">
      <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
        <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary font-headline text-xs font-bold uppercase tracking-wider">
          Pay As You Need • No Annual Subscriptions
        </span>
        <h1 className="font-headline text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Master the Technical Interview Loop
        </h1>
        <p className="font-body text-base sm:text-lg text-slate-600 dark:text-[#94A3B8]">
          Replace expensive, rigid annual subscriptions with flexible, single-quiz or topic bundles. Try each topic's diagnostic quiz for free before deciding.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {/* Tier 1: Freemium / Free Trial */}
        <div className="rounded-2xl bg-white dark:bg-[#171b26] border border-slate-200 dark:border-[#283145] p-8 flex flex-col justify-between shadow-sm">
          <div className="space-y-4">
            <span className="font-headline text-xs font-bold text-slate-500 uppercase tracking-wider">
              Free Learner
            </span>
            <div className="flex items-baseline gap-1">
              <span className="font-headline text-4xl font-extrabold text-slate-900 dark:text-white">₹0</span>
              <span className="text-xs text-slate-500">/ forever</span>
            </div>
            <p className="font-body text-xs text-slate-600 dark:text-[#94A3B8] leading-relaxed">
              Test your engineering instincts with 1 free comprehensive diagnostic quiz per topic track.
            </p>

            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-[#283145]">
              <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>1 Free Quiz per domain track</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Real-time countdown timer & scoring</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Accuracy percentile benchmark</span>
              </div>
            </div>
          </div>

          <div className="pt-8">
            <button
              type="button"
              onClick={() => showToast('You already have active Free Learner access!', 'info')}
              className="w-full py-3 px-4 rounded-xl bg-slate-100 dark:bg-[#1e2433] hover:bg-slate-200 dark:hover:bg-[#283144] text-slate-800 dark:text-white font-headline text-xs font-bold transition-all"
            >
              Current Access
            </button>
          </div>
        </div>

        {/* Tier 2: Single Quiz Unlock */}
        <div className="rounded-2xl bg-white dark:bg-[#171b26] border border-slate-200 dark:border-[#283145] p-8 flex flex-col justify-between shadow-sm">
          <div className="space-y-4">
            <span className="font-headline text-xs font-bold text-primary uppercase tracking-wider">
              Pay-Per-Quiz
            </span>
            <div className="flex items-baseline gap-1">
              <span className="font-headline text-4xl font-extrabold text-slate-900 dark:text-white">₹99</span>
              <span className="text-xs text-slate-500 dark:text-[#94A3B8]">/ single quiz</span>
            </div>
            <p className="font-body text-xs text-slate-600 dark:text-[#94A3B8] leading-relaxed">
              Unlock a specific module and all corresponding senior staff explanations with zero commitment.
            </p>

            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-[#283145]">
              <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Lifetime access to selected quiz</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Full step-by-step staff explanations</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Detailed code implementations</span>
              </div>
            </div>
          </div>

          <div className="pt-8">
            <button
              type="button"
              onClick={() => handleBuy('Single Quiz', '₹99')}
              className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary-container text-white font-headline text-xs font-bold transition-all shadow-md active:translate-y-0.5 cursor-pointer"
            >
              Unlock Single Quiz • ₹99
            </button>
          </div>
        </div>

        {/* Tier 3: Master Track Bundle (Featured) */}
        <div className="relative rounded-2xl bg-white dark:bg-[#171b26] border-2 border-indigo-500 p-8 flex flex-col justify-between shadow-xl">
          <div className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-600 text-white font-headline text-[10px] uppercase font-black tracking-wide shadow-md">
            BEST VALUE • SAVE 72%
          </div>

          <div className="space-y-4">
            <span className="font-headline text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider flex items-center gap-1">
              <Award className="w-4 h-4" />
              Pro Scholar Bundle
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-headline text-4xl font-extrabold text-indigo-600 dark:text-[#818cf8]">
                ₹399
              </span>
              <span className="font-mono text-sm text-slate-400 line-through">₹1,499</span>
            </div>
            <p className="font-body text-xs text-slate-600 dark:text-[#94A3B8] leading-relaxed">
              Complete access to all 8 quizzes in the track, 80+ staff explanations, downloadable diagrams, and postmortems.
            </p>

            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-[#283145]">
              <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-200 font-semibold">
                <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>All 8 Track Quizzes & Diagnostics</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Production failure postmortem case studies</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Editable Excalidraw architecture topologies</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Exact L6/L7 grading rubric used in loops</span>
              </div>
            </div>
          </div>

          <div className="pt-8">
            <button
              type="button"
              onClick={() => handleBuy('Master Bundle', '₹399')}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-primary to-indigo-600 text-white font-headline text-sm font-bold shadow-lg hover:brightness-110 active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Unlock Master Bundle • ₹399</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
