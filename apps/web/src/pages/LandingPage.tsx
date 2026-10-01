import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Terminal,
  ChevronDown,
  ChevronUp,
  Check,
  Code2,
  RotateCcw,
  Shield,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { quizApi, TopicData } from "../services/api";
import { isMockEnabled } from "../config/env";

// Interactive Sample Question Data for the Live Demo
const SAMPLE_QUESTION = {
  title: "Distributed Caching Under High Concurrency",
  tag: "Staff-Level Dilemma",
  stem: 'In a distributed cache-aside architecture under heavy concurrent read traffic (85,000 req/sec), what is the most optimal strategy to prevent a "Cache Stampede" (Thundering Herd) when an expensive key expires?',
  options: [
    {
      id: "A",
      text: "Purge all downstream replica caches and immediately return HTTP 429 Too Many Requests until recomputed.",
      isCorrect: false,
    },
    {
      id: "B",
      text: "Use probabilistic early expiration (XFetch algorithm) or a distributed mutex so only one worker recalculates while others serve stale data.",
      isCorrect: true,
    },
    {
      id: "C",
      text: "Increase Redis TTL indefinitely and rely purely on OS LRU memory eviction when memory hits 95%.",
      isCorrect: false,
    },
    {
      id: "D",
      text: "Execute synchronous write-through operations on every read miss directly against the SQL primary pool.",
      isCorrect: false,
    },
  ],
  explanation:
    "The XFetch algorithm approximates optimal early recomputation: delta * beta * ln(rand()). By probabilistically triggering background cache regeneration before hard TTL expiry, lock contention drops by 94% across distributed clusters without thundering herd spikes.",
  codeSnippet: `// Production XFetch early refresh heuristic
func ShouldRefresh(key string, ttl time.Duration, computeTime float64) bool {
    // Probabilistic early expiration avoids thundering herd
    return -(computeTime * beta * math.Log(rand.Float64())) > ttl.Seconds()
}`,
};

const FAQ_ITEMS = [
  {
    question: "Is the entrypoint diagnostic really 100% free?",
    answer:
      "Yes. Every single curriculum track (Distributed Systems, DSA, Concurrency) includes one full 10-question proctored diagnostic assessment with score benchmarking and explanation summaries at zero cost. No credit card or trial enrollment required.",
  },
  {
    question: "How does the pay-per-track model work?",
    answer:
      "Unlike platforms charging $250–$350 upfront per year, FastQuiz lets you unlock individual modules for ₹99 or entire specialized topic passes for ₹499. You own access to purchased tracks indefinitely, with zero recurring charges or subscription traps.",
  },
  {
    question: "Who writes and calibrates the questions?",
    answer:
      "Questions are authored and verified by Staff and Principal engineers who have conducted 200+ interview loops at tier-1 tech companies. Questions focus on production trade-offs, RFC standards, concurrency bugs, and system architecture rather than trivia.",
  },
  {
    question: "Do questions include diagrams and production code?",
    answer:
      "Yes. Deep-dive explanations include architectural flowcharts, sequence diagrams, benchmark heuristics, and reference code implementations in Go, Python, and C++.",
  },
  {
    question: "Can I track my score percentiles and diagnostic progress?",
    answer:
      "Every assessment submission yields live telemetry: completion latency, target latency deltas, accuracy percentages, sub-skill mastery breakdowns, and candidate percentile bands (e.g., Top 8% Candidate / Staff Benchmark).",
  },
];

export const LandingPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const mockActive = isMockEnabled();
  const [topics, setTopics] = useState<TopicData[]>([]);

  useEffect(() => {
    let isMounted = true;
    quizApi.getTopics().then((data) => {
      if (isMounted) setTopics(data);
    });
    return () => {
      isMounted = false;
    };
  }, []);
  const firstName = user?.name ? user.name.split(" ")[0] : "Engineer";

  // Interactive sample state
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [showExplanationCode, setShowExplanationCode] = useState(true);

  // FAQ accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handleSelectOption = (idx: number) => {
    if (!isAnswerSubmitted) {
      setSelectedOption(idx);
    }
  };

  const handleCheckAnswer = () => {
    if (selectedOption !== null) {
      setIsAnswerSubmitted(true);
    }
  };

  const handleResetSample = () => {
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
  };

  const toggleFaq = (idx: number) => {
    setOpenFaqIndex(openFaqIndex === idx ? null : idx);
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* 1. HERO SECTION */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 pb-14 text-left">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium tracking-wide">
              SPRING 2026 BENCHMARKS • PAY-AS-YOU-NEED PREP
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 leading-[1.12]">
            Master Technical Interviews{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-700 dark:from-indigo-400 dark:via-indigo-300 dark:to-indigo-200">
              Without Bloated Subscriptions.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Calibrated diagnostic assessments across Distributed Systems,
            High-Concurrency Architectures, and DSA. Take a complete diagnostic
            free on every track—no credit card or annual lock-in required.
          </p>

          {/* Hero Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {isAuthenticated ? (
              <Link
                to="/curriculum"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-all shadow-sm hover:shadow-indigo-500/20"
              >
                <span>Resume Your Curriculum ({firstName})</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                to={mockActive ? "/quiz/quiz-cache-1/take" : "/curriculum"}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-all shadow-sm hover:shadow-indigo-500/20"
              >
                <span>Start Free Diagnostic (No Card Needed)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}

            <Link
              to="/topics"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-medium text-sm transition-colors"
            >
              <span>Explore All Curriculum Tracks</span>
            </Link>
          </div>

          {/* Trust Stat Strip (Mock Data Gated) */}
          {mockActive && (
            <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800/80 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto text-center">
              <div className="p-3">
                <div className="text-xl sm:text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100">
                  3 Tracks
                </div>
                <div className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                  Targeted Curriculum
                </div>
              </div>
              <div className="p-3">
                <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  ₹0 Free
                </div>
                <div className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                  Full Diagnostic Per Track
                </div>
              </div>
              <div className="p-3">
                <div className="text-xl sm:text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100">
                  100% Original
                </div>
                <div className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                  Calibrated Diagnostics
                </div>
              </div>
              <div className="p-3">
                <div className="text-xl sm:text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400">
                  Staff L6
                </div>
                <div className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                  Calibrated Difficulty
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 2. INTERACTIVE LIVE CHALLENGE TEASER (Mock Data Gated) */}
      {mockActive && (
        <section className="w-full bg-zinc-100/70 dark:bg-zinc-900/30 border-y border-zinc-200 dark:border-zinc-800 py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-indigo-600 dark:text-indigo-400 font-medium">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>INTERACTIVE DEMO • TEST YOUR INSTINCTS NOW</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mt-1">
                  {SAMPLE_QUESTION.title}
                </h2>
              </div>
              <span className="self-start sm:self-auto text-[11px] font-mono uppercase px-2 py-0.5 rounded border border-amber-300 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400">
                {SAMPLE_QUESTION.tag}
              </span>
            </div>

            {/* Question Card */}
            <div className="p-5 sm:p-6 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-5 text-left">
              <p className="text-sm sm:text-base text-zinc-800 dark:text-zinc-200 font-medium leading-relaxed">
                {SAMPLE_QUESTION.stem}
              </p>

              {/* Options */}
              <div className="space-y-2.5">
                {SAMPLE_QUESTION.options.map((option, idx) => {
                  const isSelected = selectedOption === idx;
                  let optionStyle =
                    "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/50";

                  if (isSelected && !isAnswerSubmitted) {
                    optionStyle =
                      "border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200";
                  } else if (isAnswerSubmitted) {
                    if (option.isCorrect) {
                      optionStyle =
                        "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200";
                    } else if (isSelected && !option.isCorrect) {
                      optionStyle =
                        "border-rose-500 bg-rose-50 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200";
                    }
                  }

                  return (
                    <button
                      key={option.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => handleSelectOption(idx)}
                      className={`w-full text-left p-3.5 rounded-lg border text-xs sm:text-sm transition-all flex items-start gap-3 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${optionStyle}`}
                    >
                      <span
                        className={`w-5 h-5 rounded flex items-center justify-center font-mono font-medium text-xs shrink-0 mt-0.5 ${
                          isSelected
                            ? "bg-indigo-600 text-white dark:bg-indigo-500"
                            : "bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                        }`}
                      >
                        {option.id}
                      </span>
                      <span className="flex-1 leading-normal">
                        {option.text}
                      </span>
                      {isAnswerSubmitted && option.isCorrect && (
                        <CheckCircle2
                          className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5"
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Actions & Result */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-zinc-100 dark:border-zinc-800/80">
                <div className="flex items-center gap-2">
                  {!isAnswerSubmitted ? (
                    <button
                      type="button"
                      disabled={selectedOption === null}
                      onClick={handleCheckAnswer}
                      className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white text-xs font-medium transition-colors shadow-sm cursor-pointer"
                    >
                      Verify Answer
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResetSample}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-zinc-300 dark:border-zinc-700 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Try Again</span>
                    </button>
                  )}
                  {selectedOption === null && !isAnswerSubmitted && (
                    <span className="text-xs text-zinc-400">
                      Select an option above to verify
                    </span>
                  )}
                </div>

                <Link
                  to={mockActive ? "/quiz/quiz-cache-1/take" : "/curriculum"}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  <span>Take full 10-question diagnostic</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Verified Explanation Drawer */}
              {isAnswerSubmitted && (
                <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Optimal Staff Architecture: Option B</span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setShowExplanationCode(!showExplanationCode)
                      }
                      className="text-[11px] font-mono text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Code2 className="w-3 h-3" />
                      <span>
                        {showExplanationCode ? "Hide Code" : "Show Code"}
                      </span>
                    </button>
                  </div>

                  <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    {SAMPLE_QUESTION.explanation}
                  </p>

                  {showExplanationCode && (
                    <div className="rounded-md bg-zinc-900 border border-zinc-800 p-3 overflow-x-auto text-[11px] font-mono text-zinc-200">
                      <pre>{SAMPLE_QUESTION.codeSnippet}</pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 3. PLATFORM COMPARISON (Why FastQuiz) */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-left space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
            THE VALUE PROPOSITION
          </span>
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Why FastQuiz vs. Traditional Annual Subscriptions
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            Traditional interview platforms force upfront annual fees for
            content you will never touch. FastQuiz gives you control.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Legacy Platform Box */}
          <div className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/20 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <span className="text-sm font-semibold text-zinc-500">
                Traditional Prep Platforms
              </span>
              <span className="text-xs font-mono text-rose-500 font-medium">
                $299–$399 / year
              </span>
            </div>
            <ul className="space-y-3 text-xs text-zinc-600 dark:text-zinc-400">
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">✕</span>
                <span>
                  Forced 12-month subscriptions when you only need 3 weeks of
                  targeted prep
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">✕</span>
                <span>
                  No free full-length diagnostics to baseline skills before
                  purchase
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">✕</span>
                <span>
                  Shallow multiple-choice trivia without production architecture
                  diagrams
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">✕</span>
                <span>
                  Expired access after subscription ends; re-billed
                  automatically
                </span>
              </li>
            </ul>
          </div>

          {/* FastQuiz Box */}
          <div className="p-6 rounded-xl border-2 border-indigo-500/50 bg-indigo-50/20 dark:bg-indigo-950/20 space-y-4 relative shadow-sm">
            <div className="absolute -top-3 right-4 bg-indigo-600 text-white text-[10px] font-mono uppercase px-2 py-0.5 rounded font-semibold tracking-wide">
              The Modern Standard
            </div>
            <div className="flex items-center justify-between pb-3 border-b border-indigo-200 dark:border-indigo-900/60">
              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                FastQuiz Approach
              </span>
              <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                ₹0 Free + ₹99 / module
              </span>
            </div>
            <ul className="space-y-3 text-xs text-zinc-700 dark:text-zinc-300">
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>1 Complete Free Diagnostic</strong> on every
                  curriculum track forever
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Pay only for what you need</strong>: unlock single
                  modules (₹99) or topics (₹499)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Staff-grade architecture diagrams</strong>, RFC
                  citations, and production Go/Python code
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Lifetime retention</strong> of all unlocked diagnostic
                  questions and review records
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 4. FEATURED CURRICULUM TRACKS */}
      <section className="w-full bg-zinc-100/50 dark:bg-zinc-900/40 border-y border-zinc-200 dark:border-zinc-800 py-16 text-left">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                CURRICULUM TRACKS
              </span>
              <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
                Calibrated Engineering Question Banks
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                Designed to pinpoint gaps in technical intuition under realistic
                interview time limits.
              </p>
            </div>
            <Link
              to="/topics"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline shrink-0"
            >
              <span>View Full Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {topics.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {topics.map((topic) => (
                <div
                  key={topic.id}
                  className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between space-y-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all shadow-sm"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                        {topic.category}
                      </span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                        Free Quiz Included
                      </span>
                    </div>

                    <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">
                      {topic.title}
                    </h3>

                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-3 leading-relaxed">
                      {topic.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 space-y-3">
                    <div className="flex items-center justify-between text-xs text-zinc-500 font-mono">
                      <span>{topic.totalQuizzes} Modules</span>
                      <span>{topic.engineersTestedCount} tested</span>
                    </div>

                    <Link
                      to={`/topics/${topic.slug}`}
                      className="w-full py-2 px-3 rounded-md bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <span>Inspect Track & Quizzes</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/40 text-center space-y-3 max-w-xl mx-auto">
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                No curriculum tracks published yet.
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Connect your live question catalog or toggle mock mode (via{" "}
                <code className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono text-[11px] text-indigo-600 dark:text-indigo-400">
                  ?mock=true
                </code>
                ) to preview sample tracks.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* 5. HOW IT WORKS (3-Step Workflow) */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-left space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
            HOW FASTQUIZ WORKS
          </span>
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Three Steps to Interview Confidence
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            A surgical workflow designed to maximize preparation ROI without
            wasting hours on solved domains.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-mono font-bold text-sm">
              01
            </div>
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              1. Take Baseline Diagnostic Free
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Launch a timed 10-question evaluation on any track. Measure your
              baseline speed and accuracy with zero upfront commitment.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-mono font-bold text-sm">
              02
            </div>
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              2. Inspect Granular Telemetry
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Examine sub-skill breakdowns, percentile comparisons against
              candidate pools, and Staff-level architectural blueprints.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-mono font-bold text-sm">
              03
            </div>
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              3. Target Weak Spots Surgically
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Purchase only the specific drill modules you need for ₹99. No
              recurring charges, cancelation hassle, or unused content.
            </p>
          </div>
        </div>
      </section>

      {/* 6. DIAGNOSTIC SCOREBOARD PREVIEW (Mock Data Gated) */}
      {mockActive && (
        <section className="w-full bg-zinc-100/60 dark:bg-zinc-900/30 border-y border-zinc-200 dark:border-zinc-800 py-16 text-left">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                CANDIDATE INTELLIGENCE
              </span>
              <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
                Real-Time Diagnostic Scorecards
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                Every completed assessment generates rich analytics mirroring
                real interview rubrics.
              </p>
            </div>

            {/* Scoreboard Mockup Card */}
            <div className="p-6 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800 gap-3">
                <div>
                  <span className="text-[10px] font-mono uppercase text-emerald-600 dark:text-emerald-400 font-semibold">
                    BENCHMARK PASSED • TOP 8% CANDIDATE
                  </span>
                  <h4 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    Distributed Caching & Invalidation Diagnostic
                  </h4>
                </div>
                <div className="flex items-center gap-3 font-mono text-xs">
                  <span className="px-2.5 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                    Time: 6m 18s (-21%)
                  </span>
                  <span className="px-2.5 py-1 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-semibold">
                    Score: 90% (9/10)
                  </span>
                </div>
              </div>

              {/* Sub-skills progress preview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 rounded-lg border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-950">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">
                      Cache Invalidation
                    </span>
                    <span className="font-mono text-emerald-500 font-semibold">
                      100%
                    </span>
                  </div>
                  <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full"
                      style={{ width: "100%" }}
                    />
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-950">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">
                      Eviction Policies
                    </span>
                    <span className="font-mono text-emerald-500 font-semibold">
                      100%
                    </span>
                  </div>
                  <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full"
                      style={{ width: "100%" }}
                    />
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-950">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">
                      Distributed Hashing
                    </span>
                    <span className="font-mono text-emerald-500 font-semibold">
                      100%
                    </span>
                  </div>
                  <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full"
                      style={{ width: "100%" }}
                    />
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-950">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">
                      Consistency & Writes
                    </span>
                    <span className="font-mono text-amber-500 font-semibold">
                      Needs Review
                    </span>
                  </div>
                  <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full"
                      style={{ width: "35%" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 7. CALIBRATION STANDARDS & METHODOLOGY (Mock Data Gated) */}
      {mockActive && (
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-left space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
              METHODOLOGY & RUBRICS
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
              Calibrated Against Real Distributed Systems
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
              Our assessment rubrics mirror production engineering trade-offs,
              RFC standards, and systems literature.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 flex flex-col justify-between space-y-4">
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-mono text-xs font-semibold">
                  <Terminal className="w-4 h-4" aria-hidden="true" />
                  <span>Real System Postmortems</span>
                </div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Cache Stampede & Failover Dilemmas
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Questions are modeled on documented production edge cases:
                  Redis Sentinel split-brain quorums, XFetch probabilistic early
                  expirations, and Linux kernel TCP socket buffers.
                </p>
              </div>
              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 text-[11px] font-mono text-zinc-500">
                Peer-reviewed against open RFCs
              </div>
            </div>

            <div className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 flex flex-col justify-between space-y-4">
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                  <span>Transparent Pay-Per-Track</span>
                </div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  No Annual Subscription Traps
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Practice one full diagnostic assessment per track completely
                  free. Pay only ₹99 for targeted single modules or ₹399 for
                  complete topic passes when you need them.
                </p>
              </div>
              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 text-[11px] font-mono text-zinc-500">
                INR (₹) / Razorpay verified checkout
              </div>
            </div>

            <div className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 flex flex-col justify-between space-y-4">
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-mono text-xs font-semibold">
                  <Shield className="w-4 h-4" aria-hidden="true" />
                  <span>Data Minimization & Honor Code</span>
                </div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Indian DPDPA 2023 Compliant
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Strictly zero third-party advertising cookies or background
                  data mining. Your quiz response telemetry is stored only to
                  generate your personal skill breakdown.
                </p>
              </div>
              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 text-[11px] font-mono text-zinc-500">
                Audited privacy & security practices
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 8. PRICING TEASER */}
      <section className="w-full bg-zinc-100/60 dark:bg-zinc-900/40 border-y border-zinc-200 dark:border-zinc-800 py-16 text-left">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
              TRANSPARENT PRICING
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
              Pay As You Practice. Zero Commitments.
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              Practice entrypoint diagnostics for free, and unlock comprehensive
              solution matrices only when needed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Free */}
            <div className="p-6 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <span className="text-xs font-mono font-medium text-zinc-500 uppercase">
                  Free Diagnostic
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-semibold font-mono text-zinc-900 dark:text-zinc-100">
                    ₹0
                  </span>
                  <span className="text-xs text-zinc-400 font-mono">
                    / forever
                  </span>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  1 full diagnostic assessment on every curriculum track with
                  complete scoring.
                </p>
              </div>
              <Link
                to={mockActive ? "/quiz/quiz-cache-1/take" : "/curriculum"}
                className="w-full py-2.5 rounded-md border border-zinc-300 dark:border-zinc-700 text-center text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                Start Free Diagnostic
              </Link>
            </div>

            {/* Single Module */}
            <div className="p-6 rounded-xl bg-white dark:bg-zinc-900 border-2 border-indigo-600 dark:border-indigo-500 flex flex-col justify-between space-y-4 relative shadow-sm">
              <div className="space-y-3">
                <span className="text-xs font-mono font-medium text-indigo-600 dark:text-indigo-400 uppercase">
                  Single Module
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-semibold font-mono text-zinc-900 dark:text-zinc-100">
                    ₹99
                  </span>
                  <span className="text-xs text-zinc-400 font-mono">
                    / module
                  </span>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Unlock any targeted advanced assessment with full diagrams and
                  code.
                </p>
              </div>
              <Link
                to="/pricing"
                className="w-full py-2.5 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-center text-xs font-medium transition-colors shadow-sm"
              >
                View Module Options
              </Link>
            </div>

            {/* Topic Pass */}
            <div className="p-6 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <span className="text-xs font-mono font-medium text-zinc-500 uppercase">
                  Topic Master Pass
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-semibold font-mono text-zinc-900 dark:text-zinc-100">
                    ₹499
                  </span>
                  <span className="text-xs text-zinc-400 font-mono">
                    / track
                  </span>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  All modules in a specialized track (e.g., all 8 Distributed
                  Caching quizzes).
                </p>
              </div>
              <Link
                to="/pricing"
                className="w-full py-2.5 rounded-md border border-zinc-300 dark:border-zinc-700 text-center text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                Explore Track Passes
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FAQ ACCORDION */}
      <section className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-left space-y-8">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
            COMMON QUESTIONS
          </span>
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            Everything you need to know about FastQuiz diagnostics and access.
          </p>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4 flex items-center justify-between text-left text-sm font-medium text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
                >
                  <span>{item.question}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-zinc-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-800/60 pt-3">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 10. FINAL BOTTOM CALL TO ACTION BANNER */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="p-8 sm:p-12 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-indigo-950 text-white text-center space-y-6 shadow-xl border border-zinc-800 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <span className="text-[11px] font-mono uppercase px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              ZERO RISK • FREE DIAGNOSTIC
            </span>
            <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-white">
              Ready to test your systems and algorithmic depth?
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Sharpen your distributed systems and algorithmic instincts with
              calibrated diagnostics. Take your first diagnostic in under 15
              minutes.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to={mockActive ? "/quiz/quiz-cache-1/take" : "/curriculum"}
                className="w-full sm:w-auto px-6 py-3 rounded-lg bg-white text-zinc-900 hover:bg-zinc-100 font-semibold text-xs sm:text-sm transition-colors shadow-sm"
              >
                Take Free Diagnostic Now
              </Link>
              <Link
                to="/curriculum"
                className="w-full sm:w-auto px-6 py-3 rounded-lg border border-zinc-700 hover:bg-zinc-800/80 text-white font-medium text-xs sm:text-sm transition-colors"
              >
                Browse Curriculum
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
