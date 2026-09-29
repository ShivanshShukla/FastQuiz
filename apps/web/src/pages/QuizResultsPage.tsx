import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Share2,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ArrowRight,
  Check,
  X,
  Clock,
  BarChart3,
  Award,
} from 'lucide-react';
import { webMockStore, DiagnosticResult } from '../services/webMockStore';
import { AccuracyGauge } from '../components/Quiz/AccuracyGauge';
import { PaywallCard } from '../components/Checkout/PaywallCard';
import { useToast } from '../context/ToastContext';
import { isMockEnabled } from '../config/env';

export const QuizResultsPage: React.FC = () => {
  const { attemptId = 'att-seed-1' } = useParams<{ attemptId: string }>();
  const { showToast } = useToast();
  const [copying, setCopying] = useState(false);

  const mockFallback: DiagnosticResult | undefined = isMockEnabled()
    ? {
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
      }
    : undefined;

  const result: DiagnosticResult | undefined = webMockStore.getAttemptResult(attemptId) || mockFallback;

  if (!result) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Attempt Record Not Found</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md">
          No diagnostic results found for this attempt ID. Start a new diagnostic assessment to generate your performance score.
        </p>
        <Link
          to="/curriculum"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium transition-colors"
        >
          Browse Curriculum Tracks
        </Link>
      </div>
    );
  }

  const handleShare = () => {
    setCopying(true);
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(window.location.href);
    }
    showToast('Diagnostic evaluation link copied to clipboard.', 'success');
    setTimeout(() => setCopying(false), 2000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left space-y-8">
      {/* Session Breadcrumb & Status */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
          <span>DIAGNOSTIC RUN //</span>
          <span className="text-zinc-900 dark:text-zinc-100 font-semibold">{attemptId}</span>
          <span>•</span>
          <span>{result.quizTitle}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40">
            PASSED BENCHMARK
          </span>
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <Share2 className="w-3 h-3 text-zinc-400" />
            <span>{copying ? 'Copied' : 'Share Report'}</span>
          </button>
        </div>
      </div>

      {/* Hero Scoreboard & Metric Cards */}
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 sm:p-7">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Accuracy Gauge Left */}
          <div className="lg:col-span-4">
            <AccuracyGauge
              percentage={result.scorePercent}
              correctCount={result.correctCount}
              totalCount={result.totalCount}
              candidateTier={result.candidateTier}
              topicTitle={result.topicTitle}
            />
          </div>

          {/* Performance Overview Center */}
          <div className="lg:col-span-5 space-y-4">
            <div>
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block mb-1">
                Evaluation Summary
              </span>
              <h1 className="text-xl sm:text-2xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
                Interview Ready! Staff Assessment Passed
              </h1>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                Demonstrated staff-level mastery across stampede mitigation, eviction latency, and partition healing. 1 gap flagged in write-back transactional consistency.
              </p>
            </div>

            {/* Metrics Triad */}
            <div className="grid grid-cols-3 gap-3 pt-1">
              <div className="p-3 rounded-md bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-500 uppercase">
                  <Clock className="w-3 h-3 text-zinc-400" />
                  <span>Time</span>
                </div>
                <div className="text-base font-semibold font-mono text-zinc-900 dark:text-zinc-100 mt-0.5">
                  {result.latencyFormatted}
                </div>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 block mt-0.5">
                  Target: 8m 00s
                </span>
              </div>

              <div className="p-3 rounded-md bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-500 uppercase">
                  <BarChart3 className="w-3 h-3 text-indigo-500" />
                  <span>Percentile</span>
                </div>
                <div className="text-base font-semibold font-mono text-zinc-900 dark:text-zinc-100 mt-0.5">
                  {result.percentile}
                </div>
                <span className="text-[10px] font-mono text-zinc-400 block mt-0.5">
                  Top 8% Cohort
                </span>
              </div>

              <div className="p-3 rounded-md bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-500 uppercase">
                  <Award className="w-3 h-3 text-amber-500" />
                  <span>Band</span>
                </div>
                <div className="text-base font-semibold font-mono text-zinc-900 dark:text-zinc-100 mt-0.5">
                  {result.levelBand}
                </div>
                <span className="text-[10px] font-mono text-zinc-400 block mt-0.5">
                  Calibrated
                </span>
              </div>
            </div>
          </div>

          {/* Action Deck Right */}
          <div className="lg:col-span-3 flex flex-col justify-between gap-3 p-4 rounded-md bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 h-full">
            <div>
              <span className="text-[10px] font-mono text-zinc-500 uppercase">Next Steps</span>
              <p className="text-xs text-zinc-500 mt-0.5">
                Continue to the next module in this track or retake to reach 100%.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <Link
                to="/topics/distributed-caching"
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-md bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-medium hover:bg-zinc-800 dark:hover:bg-white transition-colors"
              >
                <span>Continue Track</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/quiz/quiz-cache-1/take"
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake Quiz</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Diagnostic Skill Competency Matrix */}
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Diagnostic Skill Competency Matrix
            </h2>
            <p className="text-xs text-zinc-500">
              Topic-level subskill breakdown calibrating your accuracy vs senior staff baselines.
            </p>
          </div>
          <div className="text-xs font-mono text-zinc-500">
            Pass Bar: <span className="font-semibold text-zinc-900 dark:text-zinc-100">75%</span> • Your Score: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{result.scorePercent}%</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {result.subSkills.map((skill) => (
            <div
              key={skill.name}
              className={`p-3.5 rounded-md border text-xs flex flex-col justify-between gap-3 ${
                skill.status === 'Needs Review'
                  ? 'border-amber-300 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20'
                  : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
                    {skill.status === 'Needs Review' && <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
                    {skill.name}
                  </span>
                  <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                    {skill.scorePercent}%
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 leading-snug">{skill.description}</p>
              </div>

              <div className="space-y-1 pt-1">
                <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      skill.status === 'Needs Review' ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.max(skill.scorePercent, 8)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                  <span>{skill.questionCountText}</span>
                  <span className={skill.status === 'Needs Review' ? 'text-amber-600 dark:text-amber-400 font-semibold' : 'text-emerald-600 dark:text-emerald-400 font-semibold'}>
                    {skill.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Analysis Split: Question Audit (Left) + Pro Access (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Question-by-Question Deep Dive (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between pb-1">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Question Audit & Technical Explanations
            </h2>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-emerald-600 dark:text-emerald-400">{result.correctCount} Correct</span>
              <span>•</span>
              <span className="text-amber-600 dark:text-amber-400">{result.totalCount - result.correctCount} Flagged</span>
            </div>
          </div>

          {/* Q1: Correct */}
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-5 space-y-3.5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </span>
                <div>
                  <div className="text-[10px] font-mono text-zinc-500 uppercase">
                    Question 01 • High Concurrency • 38s
                  </div>
                  <h3 className="text-xs sm:text-sm font-medium text-zinc-900 dark:text-zinc-100 mt-1">
                    Which eviction policy is optimal for mitigating Cache Stampede during heavy thundering-herd key expiration?
                  </h3>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-md bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 text-xs text-emerald-900 dark:text-emerald-300">
              <div className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Your Answer: Probabilistic Early Expiration (XFetch algorithm)</span>
              </div>
              <p className="mt-1 text-[11px] text-emerald-800/80 dark:text-emerald-300/80 leading-relaxed font-sans">
                By probabilistically recomputing keys in the background before hard TTL expiration using delta * beta * ln(rand()), stampedes are prevented without blocking read threads.
              </p>
            </div>
          </div>

          {/* Q3: Mistake Review (Flagged Gap) */}
          <div className="rounded-lg border border-amber-300 dark:border-amber-900/60 bg-amber-50/30 dark:bg-amber-950/10 p-5 space-y-3.5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                  <X className="w-3.5 h-3.5" />
                </span>
                <div>
                  <div className="text-[10px] font-mono text-amber-600 dark:text-amber-400 uppercase">
                    Question 03 • Data Consistency • 1m 04s • Gap Identified
                  </div>
                  <h3 className="text-xs sm:text-sm font-medium text-zinc-900 dark:text-zinc-100 mt-1">
                    Which caching write pattern ensures strong consistency for high-frequency banking ledgers without async lag?
                  </h3>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 rounded-md bg-white dark:bg-zinc-900 border border-amber-200 dark:border-amber-900/40 space-y-1">
                <div className="text-[10px] font-mono text-amber-600 dark:text-amber-400 uppercase font-semibold">
                  Your Answer (Flagged L6 Gap)
                </div>
                <div className="font-medium text-zinc-900 dark:text-zinc-100 line-through">
                  Write-Back (Write-Behind) Caching
                </div>
                <p className="text-[11px] text-zinc-500">
                  Dirty in-memory pages risk data loss on sudden node crash before asynchronous batch flush to disk.
                </p>
              </div>

              <div className="p-3 rounded-md bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-900/40 space-y-1">
                <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 uppercase font-semibold">
                  Optimal Architecture
                </div>
                <div className="font-medium text-zinc-900 dark:text-zinc-100">
                  Write-Through with 2PC Synchronous Commit
                </div>
                <p className="text-[11px] text-zinc-500">
                  Guarantees synchronous persistence and strict serializability before acknowledging client transactions.
                </p>
              </div>
            </div>
          </div>

          {/* Remaining Questions Summary */}
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-zinc-900 dark:text-zinc-100">
                Remaining Questions (7/7 Passed • 100%)
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">
                All Validated
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-600 dark:text-zinc-400">
              <div className="p-2 rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                <span>Q4: Memcached Multi-threaded Mutex</span>
                <span className="text-[10px] font-mono text-zinc-400">29s</span>
              </div>
              <div className="p-2 rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                <span>Q5: Consistent Hash 256 Vnodes</span>
                <span className="text-[10px] font-mono text-zinc-400">41s</span>
              </div>
              <div className="p-2 rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                <span>Q6: Bloom Filter Cache Penetration</span>
                <span className="text-[10px] font-mono text-zinc-400">33s</span>
              </div>
              <div className="p-2 rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                <span>Q7: Redis HyperLogLog Memory Limits</span>
                <span className="text-[10px] font-mono text-zinc-400">26s</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Pro Access Card (5 cols) */}
        <div className="lg:col-span-5 sticky top-20 space-y-4">
          <PaywallCard topicTitle={result.topicTitle} />
        </div>
      </div>
    </div>
  );
};
