import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Share2,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ArrowRight,
  Sparkles,
  Flame,
  Check,
  X,
  FileCode,
  LockOpen,
  BarChart3,
  Timer,
  ShieldAlert,
} from 'lucide-react';
import { webMockStore, DiagnosticResult } from '../services/webMockStore';
import { AccuracyGauge } from '../components/Quiz/AccuracyGauge';
import { PaywallCard } from '../components/Checkout/PaywallCard';
import { useToast } from '../context/ToastContext';

export const QuizResultsPage: React.FC = () => {
  const { attemptId = 'att-seed-1' } = useParams<{ attemptId: string }>();
  const { showToast } = useToast();
  const [copying, setCopying] = useState(false);

  const result: DiagnosticResult = webMockStore.getAttemptResult(attemptId) || {
    attemptId,
    quizTitle: 'Quiz 1: Cache Strategies & Invalidation Dilemmas',
    topicTitle: 'Distributed Caching: Redis, Memcached & Cache Invalidation',
    scorePercent: 90,
    correctCount: 9,
    totalCount: 10,
    benchmarkPassed: true,
    candidateTier: 'Top 8% Candidate',
    latencyFormatted: '6m 18s',
    targetLatencyFormatted: '8m 00s (-21%)',
    percentile: '92nd %ile',
    levelBand: 'L6 / Staff',
    streakDays: 4,
    xpEarned: 50,
    subSkills: [
      {
        name: 'Cache Invalidation',
        description: 'TTL heuristics, active stampede mitigation, & XFetch.',
        scorePercent: 100,
        questionCountText: '2/2 Questions',
        status: 'Mastered',
      },
      {
        name: 'Eviction Policies',
        description: 'LRU, LFU, 2Q buffers, and memory ceiling eviction.',
        scorePercent: 100,
        questionCountText: '3/3 Questions',
        status: 'Mastered',
      },
      {
        name: 'Consistency & Writes',
        description: 'Write-Through vs Write-Back risk in financial ledgers.',
        scorePercent: 0,
        questionCountText: '0/1 Question',
        status: 'Needs Review',
      },
      {
        name: 'Distributed Hashing',
        description: 'Consistent hash rings, virtual vnodes, & partition healing.',
        scorePercent: 100,
        questionCountText: '4/4 Questions',
        status: 'Mastered',
      },
    ],
    questionsReview: [],
  };

  const handleShare = () => {
    setCopying(true);
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(window.location.href);
    }
    showToast('Diagnostic Scorecard link copied to clipboard!', 'success');
    setTimeout(() => setCopying(false), 2000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 lg:py-10 text-left">
      {/* Top Context & Breadcrumb Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-400 dark:text-[#64748B]">DIAGNOSTIC_SESSION //</span>
          <span className="text-indigo-600 dark:text-[#818cf8] font-semibold">SYS-DES-402</span>
          <span className="text-slate-400 dark:text-[#64748B]">•</span>
          <span className="text-slate-600 dark:text-[#94A3B8]">OCT 24, 2026 • 14:32 IST</span>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="px-2.5 py-1 rounded-md bg-emerald-100 dark:bg-[#10B981]/15 border border-emerald-300 dark:border-[#10B981]/40 text-emerald-700 dark:text-[#34d399] font-headline text-xs font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            EVALUATION COMPLETE: L6 BENCHMARK PASSED
          </span>
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 dark:bg-[#171b26] border border-slate-300 dark:border-[#283145] text-slate-800 dark:text-white hover:bg-slate-200 dark:hover:bg-[#1e2536] font-headline text-xs font-semibold transition-all cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-primary" />
            <span>Share Matrix</span>
          </button>
        </div>
      </div>

      {/* HERO SCOREBOARD: Telemetry Command Center */}
      <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gradient-to-b dark:from-[#171b26] dark:to-[#0f131d] border border-slate-200 dark:border-[#283145] p-6 lg:p-8 shadow-xl mb-8">
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left: Multi-segment Arc Accuracy Gauge */}
          <div className="lg:col-span-4">
            <AccuracyGauge
              percentage={result.scorePercent}
              correctCount={result.correctCount}
              totalCount={result.totalCount}
              candidateTier={result.candidateTier}
              topicTitle={result.topicTitle}
            />
          </div>

          {/* Center: Split Telemetry Metrics */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-4 h-full">
            <div className="space-y-1.5 text-center sm:text-left">
              <span className="font-headline text-xs uppercase tracking-wider text-primary font-extrabold flex items-center justify-center sm:justify-start gap-1">
                <Sparkles className="w-4 h-4" />
                Performance Cockpit Telemetry
              </span>
              <h1 className="font-headline text-2xl lg:text-3xl text-slate-900 dark:text-white font-extrabold tracking-tight">
                Interview Ready! Staff Assessment Passed
              </h1>
              <p className="font-body text-xs sm:text-sm text-slate-600 dark:text-[#94a3b8] leading-relaxed">
                Exceeded staff-level thresholds across stampede mitigation, eviction latency, and partition tolerance. 1 gap flagged in write-back transactional consistency.
              </p>
            </div>

            {/* Metric Tiles Grid */}
            <div className="grid grid-cols-3 gap-2.5 pt-2">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0a0e18]/80 border border-slate-200 dark:border-[#283145] text-left">
                <span className="font-headline text-[10px] uppercase tracking-wider text-slate-500 dark:text-[#94a3b8] font-bold flex items-center gap-1">
                  <Timer className="w-3 h-3 text-primary" />
                  Latency
                </span>
                <div className="font-headline text-base lg:text-lg text-slate-900 dark:text-white font-black mt-0.5 font-tabular">
                  {result.latencyFormatted}
                </div>
                <span className="text-[10px] text-emerald-600 dark:text-[#10b981] font-mono block">
                  {result.targetLatencyFormatted}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0a0e18]/80 border border-slate-200 dark:border-[#283145] text-left">
                <span className="font-headline text-[10px] uppercase tracking-wider text-slate-500 dark:text-[#94a3b8] font-bold flex items-center gap-1">
                  <BarChart3 className="w-3 h-3 text-emerald-500" />
                  Percentile
                </span>
                <div className="font-headline text-base lg:text-lg text-emerald-600 dark:text-[#10B981] font-black mt-0.5">
                  {result.percentile}
                </div>
                <span className="text-[10px] text-slate-500 dark:text-[#94a3b8] font-mono block">
                  Cohort: 1,420 devs
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0a0e18]/80 border border-slate-200 dark:border-[#283145] text-left">
                <span className="font-headline text-[10px] uppercase tracking-wider text-slate-500 dark:text-[#94a3b8] font-bold flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3 text-orange-500" />
                  Level Band
                </span>
                <div className="font-headline text-base lg:text-lg text-slate-900 dark:text-white font-black mt-0.5">
                  {result.levelBand}
                </div>
                <span className="text-[10px] text-indigo-600 dark:text-[#818cf8] font-mono block">
                  FAANG Calibrated
                </span>
              </div>
            </div>

            {/* Streak Pill */}
            <div className="rounded-xl bg-orange-50 dark:bg-gradient-to-r dark:from-[#2a170f] dark:via-[#1e2536] dark:to-[#171b26] border border-orange-200 dark:border-orange-500/30 p-2.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white shadow-sm">
                  <Flame className="w-5 h-5 fill-current" />
                </span>
                <div>
                  <span className="font-headline text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    4-Day Streak Maintained!{' '}
                    <span className="px-1.5 py-0.2 rounded bg-orange-100 dark:bg-orange-950/60 border border-orange-300 dark:border-orange-500/40 text-orange-700 dark:text-[#ffb690] text-[10px] font-black">
                      +{result.xpEarned} XP
                    </span>
                  </span>
                  <span className="font-body text-[11px] text-orange-800 dark:text-[#fed7aa]/80 block">
                    Level 6 Architect • 850 / 1,000 XP
                  </span>
                </div>
              </div>
              <div className="hidden sm:block text-right shrink-0">
                <span className="font-headline text-[11px] font-semibold text-orange-700 dark:text-[#fed7aa]">
                  Next: Day 5 Trophy
                </span>
              </div>
            </div>
          </div>

          {/* Right: Fast Execution Command Deck */}
          <div className="lg:col-span-3 flex flex-col justify-between gap-3 h-full p-4 rounded-2xl bg-slate-50 dark:bg-[#0a0e18]/90 border border-slate-200 dark:border-[#283145]">
            <div className="space-y-1">
              <span className="font-headline text-[11px] uppercase tracking-wider text-slate-500 dark:text-[#94a3b8] font-bold block">
                Session Actions
              </span>
              <p className="font-body text-xs text-slate-400 dark:text-[#64748B]">
                Immediate next steps to maintain learning velocity
              </p>
            </div>

            <div className="flex flex-col gap-2.5">
              <Link
                to="/topics/distributed-caching"
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-primary to-indigo-600 text-white font-headline text-xs font-extrabold shadow-md hover:brightness-110 active:translate-y-0.5 transition-all"
              >
                <span>Next: Consistent Hashing</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl bg-white dark:bg-[#171b26] border border-slate-200 dark:border-[#283145] font-headline text-xs font-bold text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-[#1e2536] transition-all cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-primary" />
                <span>{copying ? 'Copied!' : 'Share Scorecard'}</span>
              </button>
              <Link
                to="/quiz/quiz-cache-1/take"
                className="inline-flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-[#171b26]/50 border border-slate-200 dark:border-[#283145] font-headline text-xs font-semibold text-slate-600 dark:text-[#94a3b8] hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-[#171b26] transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake Assessment</span>
              </Link>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-[#283145]/60 flex items-center justify-between text-[11px] text-slate-400 dark:text-[#64748B] font-mono">
              <span>REVISION: L6-CACH-09</span>
              <span className="text-emerald-600 dark:text-[#10b981] font-bold">VERIFIED</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. DIAGNOSTIC SKILL BREAKDOWN MATRIX */}
      <div className="mb-10 rounded-2xl bg-white dark:bg-[#171b26] border border-slate-200 dark:border-[#283145] p-6 lg:p-7 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-[#283145]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              <h2 className="font-headline text-lg sm:text-xl text-slate-900 dark:text-white font-extrabold tracking-tight">
                Diagnostic Skill Competency Matrix
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-primary/15 border border-primary/30 text-primary font-headline text-[10px] font-bold uppercase">
                4 Sub-Domains
              </span>
            </div>
            <p className="font-body text-xs sm:text-sm text-slate-500 dark:text-[#94A3B8]">
              Granular breakdown calibrating your decision boundaries vs top tier Staff engineer baselines.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#0a0e18] border border-slate-200 dark:border-[#283145] text-xs font-mono text-slate-500 dark:text-[#94a3b8]">
              Pass Bar: <strong className="text-slate-900 dark:text-white font-bold">75%</strong>
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-emerald-100 dark:bg-[#10B981]/15 border border-emerald-300 dark:border-[#10B981]/30 text-xs font-mono text-emerald-700 dark:text-[#34d399] font-bold">
              Your Avg: {result.scorePercent}%
            </span>
          </div>
        </div>

        {/* Matrix Bars & Competency Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
          {result.subSkills.map((skill) => (
            <div
              key={skill.name}
              className={`p-4 rounded-xl border flex flex-col justify-between gap-3 ${
                skill.status === 'Needs Review'
                  ? 'bg-rose-50/50 dark:bg-gradient-to-b dark:from-[#2a1215]/40 dark:to-[#0a0e18]/80 border-rose-300 dark:border-rose-500/40'
                  : 'bg-slate-50 dark:bg-[#0a0e18]/70 border-slate-200 dark:border-[#283145]'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-headline text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                    {skill.status === 'Needs Review' && <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />}
                    {skill.name}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full font-mono text-xs font-black ${
                      skill.status === 'Needs Review'
                        ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300'
                        : 'bg-emerald-100 dark:bg-[#10B981]/15 text-emerald-700 dark:text-[#34d399]'
                    }`}
                  >
                    {skill.scorePercent}%
                  </span>
                </div>
                <p className="font-body text-[11px] text-slate-500 dark:text-[#94a3b8]">{skill.description}</p>
              </div>

              <div className="space-y-1.5">
                <div className="w-full bg-slate-200 dark:bg-[#1e2536] rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full ${
                      skill.status === 'Needs Review'
                        ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.7)]'
                        : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]'
                    }`}
                    style={{ width: `${Math.max(skill.scorePercent, 12)}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-400 dark:text-[#64748B]">{skill.questionCountText}</span>
                  <span
                    className={`font-bold ${
                      skill.status === 'Needs Review'
                        ? 'text-rose-600 dark:text-rose-400 uppercase tracking-wider'
                        : 'text-emerald-600 dark:text-[#10b981]'
                    }`}
                  >
                    {skill.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MAIN DUAL-COLUMN LAYOUT: Detailed Audits (Left) + High-Conversion Paywall (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Question-by-Question Deep Dive (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="text-left">
              <h2 className="font-headline text-xl text-slate-900 dark:text-white font-extrabold tracking-tight flex items-center gap-2">
                <FileCode className="w-5 h-5 text-primary" />
                Question Audit & Architecture Deep Dive
              </h2>
              <p className="font-body text-xs sm:text-sm text-slate-500 dark:text-[#94A3B8]">
                Review real answers, latency per question, and inspect staff-level architectural trade-offs
              </p>
            </div>
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-[#171B26] border border-slate-200 dark:border-[#283145] rounded-lg font-headline text-xs font-bold">
              <span className="px-2.5 py-1 rounded bg-emerald-100 dark:bg-[#10B981]/20 text-emerald-700 dark:text-[#34d399] border border-emerald-300 dark:border-[#10B981]/30">
                {result.correctCount} Passed
              </span>
              <span className="px-2.5 py-1 rounded bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-500/20">
                {result.totalCount - result.correctCount} Flagged
              </span>
            </div>
          </div>

          {/* Question Cards List */}
          <div className="flex flex-col gap-5">
            {/* Q1: Correct */}
            <div className="rounded-2xl bg-white dark:bg-[#171B26] border border-slate-200 dark:border-[#283145] p-6 shadow-md flex flex-col gap-4 hover:border-primary/50 transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-[#10B981]/20 border border-emerald-300 dark:border-[#10B981]/40 text-emerald-600 dark:text-[#10B981] font-headline text-sm font-bold shadow-sm">
                    <Check className="w-4 h-4" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-headline text-[11px] text-emerald-600 dark:text-[#10B981] uppercase tracking-wider font-extrabold">
                        Question 01 • High Concurrency
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-[#10b981]/15 text-emerald-700 dark:text-[#34d399] font-mono text-[10px] font-bold">
                        100% ACCURACY
                      </span>
                    </div>
                    <h3 className="font-headline text-base text-slate-900 dark:text-white font-bold mt-1.5 leading-snug">
                      Which eviction policy is optimal for mitigating Cache Stampede during heavy thundering-herd key expiration?
                    </h3>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#1E2536] border border-slate-200 dark:border-[#283145] font-mono text-xs font-bold text-slate-500 dark:text-[#94A3B8] shrink-0">
                  38s
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0a0e18]/60 border border-slate-200 dark:border-[#283145] font-body text-xs text-slate-400 dark:text-[#64748B] flex items-center justify-between">
                  <span>A. Pure LRU with strict sync invalidation</span>
                  <span className="text-[10px] font-mono">Stampede Risk</span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-[#10B981]/15 border border-emerald-200 dark:border-[#10B981]/40 font-body text-xs text-emerald-700 dark:text-[#34d399] font-semibold flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-[10px]">
                      ✓
                    </span>
                    <span>B. Probabilistic Early Expiration (XFetch)</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-[#10b981]/20 text-emerald-700 dark:text-[#10B981] font-mono text-[10px] font-bold">
                    Optimal
                  </span>
                </div>
              </div>

              {/* Blurred Playbook Teaser */}
              <div className="relative overflow-hidden rounded-xl bg-slate-100 dark:bg-[#0a0e18] border border-slate-200 dark:border-[#283145] p-4.5">
                <div className="filter blur-[4px] select-none pointer-events-none opacity-25 text-slate-700 dark:text-[#cbd5e1] font-mono text-xs leading-relaxed">
                  <p>
                    The XFetch algorithm approximates optimal early recomputation: delta * beta * ln(rand()). By probabilistically triggering background cache regenerations before hard TTL expiry, lock contention drops by 94% across distributed Redis clusters.
                  </p>
                  <div className="mt-3 p-3 rounded bg-white dark:bg-[#1E2536]/80 border border-slate-200 dark:border-[#283145] font-mono text-[11px] text-indigo-600 dark:text-[#818cf8]">
                    func ShouldRefresh(key string, ttl time.Duration, computeTime float64) bool &#123; return -(computeTime * beta * math.Log(rand.Float64())) &gt; ttl.Seconds() &#125;
                  </div>
                </div>

                <div className="absolute inset-0 flex items-center justify-between px-5 bg-gradient-to-r from-slate-100/90 via-slate-100/70 to-slate-100/90 dark:from-[#0a0e18]/90 dark:via-[#0a0e18]/70 dark:to-[#0a0e18]/90 backdrop-blur-[2px]">
                  <div className="flex items-center gap-2.5">
                    <LockOpen className="w-4 h-4 text-primary" />
                    <div className="text-left">
                      <span className="font-headline text-xs font-bold text-slate-900 dark:text-white block">
                        Staff Solution & Go Impl Previewed
                      </span>
                      <span className="font-body text-[11px] text-slate-500 dark:text-[#94a3b8]">
                        Probabilistic early recomputation via optimal XFetch delta heuristic
                      </span>
                    </div>
                  </div>
                  <a
                    href="#paywallCard"
                    className="px-3 py-1.5 rounded-lg bg-primary/15 hover:bg-primary/25 border border-primary/30 text-primary font-headline text-xs font-bold transition-all shrink-0"
                  >
                    Inspect Go Code
                  </a>
                </div>
              </div>
            </div>

            {/* Q2: Correct */}
            <div className="rounded-2xl bg-white dark:bg-[#171B26] border border-slate-200 dark:border-[#283145] p-6 shadow-md flex flex-col gap-4 hover:border-primary/50 transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-[#10B981]/20 border border-emerald-300 dark:border-[#10B981]/40 text-emerald-600 dark:text-[#10B981] font-headline text-sm font-bold shadow-sm">
                    <Check className="w-4 h-4" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-headline text-[11px] text-emerald-600 dark:text-[#10B981] uppercase tracking-wider font-extrabold">
                        Question 02 • Cluster Partitioning
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-[#10b981]/15 text-emerald-700 dark:text-[#34d399] font-mono text-[10px] font-bold">
                        100% ACCURACY
                      </span>
                    </div>
                    <h3 className="font-headline text-base text-slate-900 dark:text-white font-bold mt-1.5 leading-snug">
                      How does Redis Sentinel resolve split-brain scenarios when a partition heals?
                    </h3>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#1E2536] border border-slate-200 dark:border-[#283145] font-mono text-xs font-bold text-slate-500 dark:text-[#94A3B8] shrink-0">
                  42s
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-[#10B981]/15 border border-emerald-200 dark:border-[#10B981]/40 font-body text-xs text-emerald-700 dark:text-[#34d399] font-semibold flex items-center justify-between">
                <span>Your answer: Demotes unacknowledged master and flushes unsynced lag buffer via quorum consensus</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              </div>

              <div className="relative overflow-hidden rounded-xl bg-slate-100 dark:bg-[#0a0e18] border border-slate-200 dark:border-[#283145] p-4">
                <div className="filter blur-[4px] select-none pointer-events-none opacity-25 text-slate-700 dark:text-[#cbd5e1] font-mono text-xs">
                  <p>
                    Epoch monotonic advancement diagram: Sentinel leader election quorum checks min-replicas-to-write and min-replicas-max-lag before accepting slave re-point commands...
                  </p>
                </div>

                <div className="absolute inset-0 flex items-center justify-between px-5 bg-gradient-to-r from-slate-100/90 via-slate-100/70 to-slate-100/90 dark:from-[#0a0e18]/90 dark:via-[#0a0e18]/70 dark:to-[#0a0e18]/90 backdrop-blur-[2px]">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <div className="text-left">
                      <span className="font-headline text-xs font-bold text-slate-900 dark:text-white block">
                        Redis Sentinel Split-Brain Sequence
                      </span>
                      <span className="font-body text-[11px] text-slate-500 dark:text-[#94a3b8]">
                        Epoch monotonic advancement & raft quorum consensus graph
                      </span>
                    </div>
                  </div>
                  <a
                    href="#paywallCard"
                    className="px-3 py-1.5 rounded-lg bg-emerald-100 dark:bg-[#10b981]/15 hover:bg-emerald-200 dark:hover:bg-[#10b981]/25 border border-emerald-300 dark:border-[#10b981]/30 text-emerald-700 dark:text-[#34d399] font-headline text-xs font-bold transition-all shrink-0"
                  >
                    View Sequence Diagram
                  </a>
                </div>
              </div>
            </div>

            {/* Q3: Incorrect (Flagged Gap) */}
            <div className="rounded-2xl bg-rose-50/50 dark:bg-gradient-to-b dark:from-[#1c1a24] dark:to-[#171b26] border-2 border-rose-400 dark:border-rose-500/50 p-6 shadow-md flex flex-col gap-4 relative">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-500/20 border border-rose-300 dark:border-rose-500/40 text-rose-600 dark:text-rose-400 font-headline text-sm font-bold shadow-sm">
                    <X className="w-4 h-4" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-headline text-[11px] text-rose-600 dark:text-rose-400 uppercase tracking-wider font-extrabold">
                        Question 03 • Data Consistency
                      </span>
                      <span className="px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 font-headline text-[10px] uppercase font-black tracking-wide">
                        Critical Mistake Identified
                      </span>
                    </div>
                    <h3 className="font-headline text-base text-slate-900 dark:text-white font-bold mt-1.5 leading-snug">
                      Which caching write pattern ensures strong consistency for high-frequency banking ledgers without async lag?
                    </h3>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#1E2536] border border-slate-200 dark:border-[#283145] font-mono text-xs font-bold text-slate-500 dark:text-[#94A3B8] shrink-0">
                  1m 04s
                </span>
              </div>

              {/* Mistake Comparison Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-4 rounded-xl bg-rose-100/60 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-500/40 flex items-start gap-3 text-rose-900 dark:text-rose-300">
                  <X className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="block font-headline text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400">
                        Your Selection (Flagged L6 Gap)
                      </span>
                      <span className="px-1.5 py-0.2 rounded bg-rose-200 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 text-[9px] font-mono font-bold">
                        FAIL
                      </span>
                    </div>
                    <span className="font-body text-xs line-through text-rose-700 dark:text-rose-200 font-semibold block">
                      Write-Back (Write-Behind) Caching
                    </span>
                    <p className="font-body text-[11px] text-rose-600 dark:text-rose-200/80 leading-relaxed">
                      Dirty pages in memory risk permanent loss on host termination prior to async WAL flush.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-[#10B981]/15 border border-emerald-200 dark:border-[#10B981]/40 flex items-start gap-3 text-emerald-900 dark:text-[#34d399]">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="block font-headline text-[10px] uppercase font-bold text-emerald-600 dark:text-[#10B981]">
                        Optimal Staff Architecture
                      </span>
                      <span className="px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-[#10B981]/20 text-emerald-800 dark:text-[#34d399] text-[9px] font-mono font-bold">
                        PASS
                      </span>
                    </div>
                    <span className="font-body text-xs font-bold text-slate-900 dark:text-white block">
                      Write-Through with 2PC Synchronous Commit
                    </span>
                    <p className="font-body text-[11px] text-emerald-700 dark:text-[#34d399]/80 leading-relaxed">
                      Guarantees strict linearizability between persistence layer and read replicas during node failover.
                    </p>
                  </div>
                </div>
              </div>

              {/* Embedded Playbook Alert Card */}
              <div className="rounded-xl bg-orange-50 dark:bg-[#0a0e18] border border-orange-200 dark:border-[#f97316]/40 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-orange-100 dark:bg-[#2a170f] border border-orange-300 dark:border-[#f97316]/40 text-orange-600 dark:text-[#f97316] shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-headline text-xs sm:text-sm text-slate-900 dark:text-white font-extrabold block">
                      Why Write-Back Causes Silent Ledger Desync
                    </span>
                    <p className="font-body text-xs text-slate-600 dark:text-[#94A3B8] mt-0.5">
                      Read the 12-page breakdown of Stripe's idempotent lock strategy and how Uber prevented ghost charge double-spend.
                    </p>
                  </div>
                </div>
                <a
                  href="#paywallCard"
                  className="shrink-0 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 text-white font-headline text-xs font-bold shadow-md hover:brightness-110 active:translate-y-0.5 transition-all text-center w-full sm:w-auto"
                >
                  Unlock Playbook
                </a>
              </div>
            </div>

            {/* Questions 4 to 10 Expandable Accordion Deck */}
            <div className="rounded-2xl bg-white dark:bg-[#171B26] border border-slate-200 dark:border-[#283145] p-5 flex flex-col gap-3.5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="font-headline text-xs text-slate-900 dark:text-white font-extrabold uppercase tracking-wider">
                    Remaining 7 Questions (7/7 Passed • 100%)
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-[#10b981]/15 text-emerald-700 dark:text-[#34d399] font-mono text-[10px] font-bold">
                  ALL CORRECT
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 dark:text-[#94A3B8] font-body text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-[#0a0e18] border border-slate-200 dark:border-[#283145]">
                  <div className="flex items-center gap-2 truncate">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="truncate">Q4: Memcached Multi-thread mutex</span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-400">29s</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-[#0a0e18] border border-slate-200 dark:border-[#283145]">
                  <div className="flex items-center gap-2 truncate">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="truncate">Q5: Consistent Hash 256 Vnodes</span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-400">41s</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-[#0a0e18] border border-slate-200 dark:border-[#283145]">
                  <div className="flex items-center gap-2 truncate">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="truncate">Q6: Bloom Filter Cache Penetration</span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-400">33s</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-[#0a0e18] border border-slate-200 dark:border-[#283145]">
                  <div className="flex items-center gap-2 truncate">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="truncate">Q7: Redis HyperLogLog 12KB count</span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-400">26s</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-[#0a0e18] border border-slate-200 dark:border-[#283145]">
                  <div className="flex items-center gap-2 truncate">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="truncate">Q8: Two-Tier L1 RAM + L2 Cluster</span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-400">51s</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-[#0a0e18] border border-slate-200 dark:border-[#283145]">
                  <div className="flex items-center gap-2 truncate">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="truncate">Q9: Dual-Write Out-of-Order race</span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-400">47s</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-[#0a0e18] border border-slate-200 dark:border-[#283145] sm:col-span-2">
                  <div className="flex items-center gap-2 truncate">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="truncate">Q10: CDN Edge Stale-While-Revalidate RFC 5861</span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-400">35s</span>
                </div>
              </div>

              <div className="pt-1 flex items-center justify-between text-slate-400 dark:text-[#64748B] text-xs font-mono">
                <span>Detailed Go & Java architecture templates included for all 10 questions.</span>
                <a href="#paywallCard" className="text-primary hover:underline">
                  View All Snippets →
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: High-Conversion Paywall Container (5 Cols) */}
        <div className="lg:col-span-5 sticky top-24 flex flex-col gap-6">
          <PaywallCard topicTitle={result.topicTitle} />
        </div>
      </div>
    </div>
  );
};
