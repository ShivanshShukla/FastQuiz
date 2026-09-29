import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FolderOpen,
  Bolt,
  CheckCircle,
  HelpCircle,
  Clock,
  Award,
  Lock,
  PlayCircle,
  CheckCheck,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  Zap,
} from 'lucide-react';
import { webMockStore } from '../services/webMockStore';
import { useToast } from '../context/ToastContext';

export const TopicDetailPage: React.FC = () => {
  const { topicId = 'distributed-caching' } = useParams<{ topicId: string }>();
  const topic = webMockStore.getTopic(topicId) || webMockStore.getTopics()[0];
  const { showToast } = useToast();
  const [, setRefreshKey] = useState(0);

  const handleBuySingle = (quizId: string, title: string) => {
    webMockStore.purchaseItem(quizId);
    showToast(`Purchased ${title} for ₹99! Explanations and quiz are now unlocked.`, 'success');
    setRefreshKey((k) => k + 1);
  };

  const handleBuyBundle = () => {
    webMockStore.purchaseItem('master-bundle');
    showToast('Successfully unlocked System Architecture Master Bundle (All 8 Quizzes)!', 'success');
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 relative z-10 text-left">
      {/* Breadcrumbs & Meta Overline */}
      <nav className="flex flex-wrap items-center gap-2 mb-4 font-headline text-xs text-slate-500 dark:text-[#94A3B8]" aria-label="Breadcrumb">
        <Link to="/topics" className="hover:text-primary transition-colors flex items-center gap-1">
          <FolderOpen className="w-4 h-4" />
          <span>Topics</span>
        </Link>
        <span className="text-slate-400 font-bold">/</span>
        <span className="text-slate-600 dark:text-slate-400">{topic.category}</span>
        <span className="text-slate-400 font-bold">/</span>
        <span className="text-slate-900 dark:text-white font-extrabold truncate max-w-xs sm:max-w-none">
          {topic.title}
        </span>
      </nav>

      {/* Header Section with Badges */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-slate-200 dark:border-[#2e384d]/60">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-full bg-primary/15 border border-primary/30 text-primary font-headline text-xs uppercase tracking-wider font-bold">
              {topic.category}
            </span>
            <span className="px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-950/60 border border-orange-300 dark:border-orange-500/30 text-orange-700 dark:text-orange-400 font-headline text-xs uppercase tracking-wider font-bold">
              Difficulty: {topic.difficulty}
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-[#1e2433] border border-slate-300 dark:border-[#283145] text-slate-700 dark:text-slate-300 font-headline text-xs font-semibold">
              {topic.totalQuizzes} Quizzes Total
            </span>
            {topic.freeGrantAvailable && (
              <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-headline text-xs flex items-center gap-1 font-bold">
                <Bolt className="w-3.5 h-3.5" />
                1 Free Grant Available
              </span>
            )}
          </div>

          <h1 className="font-headline text-2xl sm:text-3xl lg:text-4xl text-slate-900 dark:text-white tracking-tight font-extrabold mb-3">
            {topic.title}
          </h1>
          <p className="font-body text-base text-slate-600 dark:text-[#94A3B8] leading-relaxed mb-4">
            {topic.description}
          </p>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-[#131a29] border border-slate-200 dark:border-[#2e384d] text-primary font-headline text-xs">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span className="text-slate-800 dark:text-slate-200">
              Includes <strong className="text-slate-900 dark:text-white">1 Free Comprehensive Quiz</strong> + 7 Deep-Dive Practice Modules
            </span>
          </div>
        </div>

        {/* Quick Metrics Strip */}
        <div className="flex items-center gap-4 shrink-0 bg-white dark:bg-[#171b26] p-4 rounded-xl border border-slate-200 dark:border-[#2e384d] shadow-sm">
          <div className="flex flex-col items-center px-3">
            <span className="font-headline text-2xl text-primary font-extrabold drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]">
              {topic.faangRelevancePercent}%
            </span>
            <span className="font-headline text-[10px] text-slate-500 dark:text-[#94A3B8] uppercase tracking-wider">
              FAANG Relevance
            </span>
          </div>
          <div className="w-px h-8 bg-slate-200 dark:bg-[#2e384d]"></div>
          <div className="flex flex-col items-center px-3">
            <span className="font-headline text-2xl text-emerald-600 dark:text-emerald-400 font-extrabold drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">
              {topic.engineersTestedCount}
            </span>
            <span className="font-headline text-[10px] text-slate-500 dark:text-[#94A3B8] uppercase tracking-wider">
              Engineers Tested
            </span>
          </div>
        </div>
      </div>

      {/* Main Bento Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-8">
        {/* Left Column (8 cols): Pre-Start Hero Card & Quizzes List */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          {/* Interactive Pre-Start Focus Card */}
          <div className="relative bg-white dark:bg-[#171b26] rounded-2xl p-6 sm:p-8 border border-primary/40 shadow-xl overflow-hidden">
            <div className="absolute -right-16 -top-16 w-72 h-72 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 flex flex-col gap-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-400 font-headline text-xs tracking-wider uppercase font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Featured Module • Ready to Launch
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-[#1e2433] border border-slate-200 dark:border-[#2e384d] text-slate-700 dark:text-slate-300 font-headline text-xs">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  Free Grant: <span className="text-emerald-600 dark:text-emerald-400 font-bold">Available (Unused)</span>
                </div>
              </div>

              <div>
                <span className="font-headline text-xs text-primary font-bold uppercase tracking-wider block mb-1">
                  Entrypoint Diagnostic
                </span>
                <h2 className="font-headline text-xl sm:text-2xl text-slate-900 dark:text-white font-extrabold tracking-tight">
                  Quiz 1: Cache Strategies & Invalidation Dilemmas
                </h2>
                <p className="font-body text-sm text-slate-600 dark:text-[#94A3B8] mt-2 leading-relaxed">
                  Evaluate your instincts on Cache-Aside vs Write-Through topologies, the two-phase commit hazard, and eventual consistency bounds across replica nodes.
                </p>
              </div>

              {/* Quiz Param Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-[#131a29]/80 border border-slate-200 dark:border-[#2e384d] p-4 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-[#1e2433] border border-indigo-200 dark:border-[#2e384d] flex items-center justify-center text-primary shrink-0">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block font-headline text-[10px] text-slate-500 dark:text-[#94A3B8] uppercase">
                      Questions
                    </span>
                    <span className="font-headline text-sm text-slate-900 dark:text-white font-bold">10 MCQs</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-50 dark:bg-[#1e2433] border border-orange-200 dark:border-[#2e384d] flex items-center justify-center text-orange-500 shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block font-headline text-[10px] text-slate-500 dark:text-[#94A3B8] uppercase">
                      Duration
                    </span>
                    <span className="font-headline text-sm text-slate-900 dark:text-white font-bold">15 Mins</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-[#1e2433] border border-emerald-200 dark:border-[#2e384d] flex items-center justify-center text-emerald-500 shrink-0">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block font-headline text-[10px] text-slate-500 dark:text-[#94A3B8] uppercase">
                      Pass Mark
                    </span>
                    <span className="font-headline text-sm text-slate-900 dark:text-white font-bold">80% Accuracy</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-[#1e2433] border border-indigo-200 dark:border-[#2e384d] flex items-center justify-center text-indigo-500 shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block font-headline text-[10px] text-slate-500 dark:text-[#94A3B8] uppercase">
                      Tier
                    </span>
                    <span className="font-headline text-sm text-slate-900 dark:text-white font-bold">Unmetered</span>
                  </div>
                </div>
              </div>

              {/* Free Practice Notice Alert Box */}
              <div className="p-4 rounded-xl bg-orange-50 dark:bg-[#131a29] border border-orange-200 dark:border-orange-500/30 text-slate-800 dark:text-slate-200">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-950/60 border border-orange-300 dark:border-orange-500/40 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                    <Bolt className="w-4 h-4 fill-current" />
                  </div>
                  <div className="flex-1">
                    <span className="font-headline text-xs text-orange-700 dark:text-orange-400 font-bold block mb-0.5">
                      Free Practice Notice
                    </span>
                    <p className="font-body text-xs text-slate-600 dark:text-[#94A3B8] leading-relaxed">
                      In-depth step-by-step explanations, trade-off cheat sheets, and architecture diagrams remain locked until this quiz is purchased (or unlocked via bundle). You can still take, time, and score the quiz for free!
                    </p>
                  </div>
                </div>
              </div>

              {/* Pre-Start CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <Link
                  to="/quiz/quiz-cache-1/take"
                  className="flex-1 px-8 py-4 rounded-xl bg-primary text-white font-headline text-base font-bold shadow-[0_0_24px_rgba(99,102,241,0.45)] hover:bg-primary-container active:translate-y-0.5 transition-all flex items-center justify-center gap-3 cursor-pointer"
                >
                  <span>Start Free Attempt</span>
                  <Zap className="w-5 h-5 fill-current" />
                </Link>
                <Link
                  to="/attempts/att-seed-1/results"
                  className="px-5 py-4 rounded-xl bg-slate-100 dark:bg-[#1e2433] border border-slate-300 dark:border-[#283145] text-slate-800 dark:text-slate-200 font-headline text-xs font-semibold hover:bg-slate-200 dark:hover:bg-[#283144] transition-all flex items-center justify-center gap-2"
                >
                  <span>View Diagnostic Matrix</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Topic Quizzes List & Status Engine */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="font-headline text-lg text-slate-900 dark:text-white font-bold flex items-center gap-2">
                <span>Topic Modules in this Track</span>
              </h3>
              <span className="font-headline text-xs text-slate-500 dark:text-[#94A3B8]">
                {topic.quizzes.length} of {topic.totalQuizzes} Quizzes Displayed
              </span>
            </div>

            {topic.quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="bg-white dark:bg-[#171b26] border border-slate-200 dark:border-[#283145] p-5 sm:p-6 rounded-xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all hover:-translate-y-0.5"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-[#1e2433] border border-slate-200 dark:border-[#283145] text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
                    {quiz.status === 'locked' ? (
                      <Lock className="w-6 h-6 text-slate-400" />
                    ) : quiz.status === 'purchased' ? (
                      <PlayCircle className="w-6 h-6 text-primary" />
                    ) : quiz.status === 'completed' ? (
                      <CheckCheck className="w-6 h-6 text-emerald-500" />
                    ) : (
                      <Bolt className="w-6 h-6 text-emerald-500" />
                    )}
                  </div>

                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`px-2.5 py-0.5 rounded-full border text-[11px] font-headline uppercase font-extrabold ${
                          quiz.status === 'locked'
                            ? 'bg-slate-100 dark:bg-[#1e2433] text-slate-500 border-slate-300 dark:border-[#283145]'
                            : quiz.status === 'purchased'
                            ? 'bg-indigo-100 dark:bg-indigo-950/60 text-primary border-primary/30'
                            : quiz.status === 'completed'
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-300'
                            : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-300'
                        }`}
                      >
                        {quiz.status === 'locked'
                          ? 'Locked'
                          : quiz.status === 'purchased'
                          ? 'Purchased'
                          : quiz.status === 'completed'
                          ? `Completed (${quiz.lastScore}%)`
                          : 'Free Available'}
                      </span>
                      <span className="font-headline text-xs text-orange-600 dark:text-orange-400 font-bold">
                        {quiz.questionsCount} Questions • {quiz.durationMinutes} Mins
                      </span>
                    </div>
                    <h4 className="font-headline text-base text-slate-900 dark:text-white font-bold">
                      {quiz.title}
                    </h4>
                    <p className="font-body text-xs text-slate-500 dark:text-[#94A3B8] mt-1 line-clamp-1">
                      {quiz.description}
                    </p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 pt-2 md:pt-0">
                  {quiz.status === 'locked' ? (
                    <>
                      <span className="font-headline text-xs text-slate-500 dark:text-[#94A3B8]">
                        ₹99 or Topic Bundle
                      </span>
                      <button
                        type="button"
                        onClick={() => handleBuySingle(quiz.id, quiz.title)}
                        className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-headline text-xs font-bold shadow-md active:translate-y-0.5 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>Buy to Unlock — ₹99</span>
                      </button>
                    </>
                  ) : quiz.status === 'purchased' ? (
                    <>
                      <span className="font-headline text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCheck className="w-3.5 h-3.5" /> Explanations Unlocked
                      </span>
                      <Link
                        to={`/quiz/${quiz.id}/take`}
                        className="px-6 py-2 rounded-xl bg-primary hover:bg-primary-container text-white font-headline text-xs font-bold shadow-md active:translate-y-0.5 transition-all flex items-center gap-1.5"
                      >
                        <span>Start Quiz</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </>
                  ) : quiz.status === 'completed' ? (
                    <>
                      <span className="font-headline text-xs text-slate-500 dark:text-[#94A3B8]">
                        Last attempt: {quiz.lastAttemptDaysAgo || 2} days ago
                      </span>
                      <Link
                        to={`/quiz/${quiz.id}/take`}
                        className="px-5 py-2 rounded-xl bg-slate-100 dark:bg-[#1e2433] border border-slate-300 dark:border-[#283145] text-slate-800 dark:text-white font-headline text-xs hover:bg-slate-200 dark:hover:bg-[#283144] active:translate-y-0.5 transition-all flex items-center gap-1.5"
                      >
                        <span>Retake Quiz</span>
                      </Link>
                    </>
                  ) : (
                    <>
                      <span className="font-headline text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                        1 Free Attempt Available
                      </span>
                      <Link
                        to={`/quiz/${quiz.id}/take`}
                        className="px-6 py-2 rounded-xl bg-primary text-white font-headline text-xs font-bold shadow-md active:translate-y-0.5 transition-all flex items-center gap-1.5"
                      >
                        <span>Start Free Attempt</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (4 cols): Sticky Value Bundle Card */}
        <aside className="lg:col-span-4 sticky top-24 flex flex-col gap-6">
          <div className="rounded-2xl bg-white dark:bg-[#171b26] border-2 border-indigo-300 dark:border-primary/50 p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 px-4 py-1 rounded-bl-xl bg-gradient-to-r from-orange-500 to-amber-600 text-white font-headline text-[10px] uppercase font-black tracking-wide">
              SAVE 72%
            </div>

            <div className="space-y-4">
              <span className="font-headline text-xs text-primary font-bold uppercase tracking-wider block">
                Topic Master Bundle
              </span>
              <h3 className="font-headline text-xl text-slate-900 dark:text-white font-black leading-snug">
                System Architecture Master Bundle
              </h3>
              <p className="font-body text-xs text-slate-600 dark:text-[#94A3B8] leading-relaxed">
                Unlock all 8 quizzes in this track, including 80+ in-depth architecture failure postmortems and full FAANG grading rubrics.
              </p>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#131a29] border border-slate-200 dark:border-[#283145] space-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>All 8 Deep-Dive Quizzes Unlocked</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Interactive Diagnostics & Benchmarking</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Downloadable Excalidraw Topologies</span>
                </div>
              </div>

              <div className="flex items-baseline justify-between pt-2">
                <div>
                  <span className="font-headline text-2xl font-black text-indigo-600 dark:text-indigo-400">
                    ₹399
                  </span>
                  <span className="font-mono text-xs text-slate-400 dark:text-[#64748B] line-through ml-2">
                    ₹1,499
                  </span>
                </div>
                <span className="font-headline text-xs text-orange-600 dark:text-orange-400 font-bold">
                  Save ₹1,100
                </span>
              </div>

              <button
                type="button"
                onClick={handleBuyBundle}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-primary to-indigo-600 hover:brightness-110 text-white font-headline text-sm font-bold shadow-lg active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>Unlock All 8 Quizzes • ₹399</span>
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
