import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Layers,
  BarChart2,
  Terminal,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { webMockStore } from "../services/webMockStore";

export const DashboardPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const topics = webMockStore.getTopics();
  const firstName = user?.name ? user.name.split(" ")[0] : "Engineer";

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>FASTQUIZ ENVIRONMENT • PRO PREP</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
            {isAuthenticated
              ? `Welcome back, ${firstName}`
              : "Technical Assessment Curriculum"}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl">
            Precision engineering diagnostics and system design problem sets
            designed for senior and staff engineering interviews.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            to="/topics/distributed-caching"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-medium hover:bg-zinc-800 dark:hover:bg-white transition-colors shadow-sm"
          >
            <span>Resume Active Assessment</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Engineering Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1 */}
        <div className="p-4 rounded-lg bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-500 text-xs">
            <span className="font-medium">Completed Quizzes</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 font-mono">
              3{" "}
              <span className="text-xs font-normal text-zinc-500 font-sans">
                / 12 modules
              </span>
            </div>
            <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full"
                style={{ width: "25%" }}
              />
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-4 rounded-lg bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-500 text-xs">
            <span className="font-medium">Average Score</span>
            <BarChart2 className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 font-mono">
              88.4%
            </div>
            <div className="text-xs text-zinc-500 mt-1 font-mono">
              Top 10% benchmark
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-4 rounded-lg bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-500 text-xs">
            <span className="font-medium">Time Practiced</span>
            <Clock className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 font-mono">
              4.8{" "}
              <span className="text-xs font-normal text-zinc-500 font-sans">
                hours
              </span>
            </div>
            <div className="text-xs text-zinc-500 mt-1 font-mono">
              Across 3 tracks
            </div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-4 rounded-lg bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-500 text-xs">
            <span className="font-medium">Strongest Topic</span>
            <Layers className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-3">
            <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
              Distributed Systems
            </div>
            <div className="text-xs text-zinc-500 mt-1 font-mono">
              100% on Caching Algorithms
            </div>
          </div>
        </div>
      </div>

      {/* Featured In-Progress Track Banner */}
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/50">
              IN PROGRESS
            </span>
            <span className="text-xs text-zinc-500">Track 1 of 3</span>
          </div>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            Distributed Caching & Invalidation Dilemmas
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Cache-aside vs write-through patterns, Redis cluster failover, and
            probabilistic cache stampede prevention.
          </p>
        </div>

        <Link
          to="/quiz/quiz-seed-1/take"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors shrink-0 shadow-sm"
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Launch Quiz Arena</span>
        </Link>
      </div>

      {/* Curriculum Tracks Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              Curriculum Tracks
            </h2>
            <p className="text-xs text-zinc-500">
              Structured modules with verified technical answer keys and code
              walkthroughs.
            </p>
          </div>
          <Link
            to="/topics"
            className="text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-1 transition-colors"
          >
            <span>View All Tracks ({topics.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topics.map((topic) => (
            <div
              key={topic.id}
              className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 p-5 flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 uppercase">
                    {topic.category}
                  </span>
                  <span className="text-[11px] font-mono text-zinc-400">
                    {topic.totalQuizzes} quizzes
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">
                    {topic.title}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                    {topic.description}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                <span className="text-[11px] text-zinc-400 font-mono">
                  Senior / Staff
                </span>
                <Link
                  to={`/topics/${topic.slug}`}
                  className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors"
                >
                  <span>Open Track</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Diagnostic Attempts Table */}
      <section className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Recent Assessment Runs
            </h2>
            <p className="text-xs text-zinc-500">
              Verified test runs with question-level breakdown and diagnostic
              matrices.
            </p>
          </div>
          <Link
            to="/attempts/att-seed-1/results"
            className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-1 transition-colors"
          >
            <span>Latest Report</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>

        <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <div className="font-medium text-zinc-900 dark:text-zinc-200">
                Cache Invalidation & Thundering Herd Dilemmas
              </div>
              <div className="text-zinc-500 text-[11px] font-mono">
                Completed today • 10 MCQs • Time: 6m 18s
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40">
                  90% SCORE (9/10)
                </span>
              </div>
              <Link
                to="/attempts/att-seed-1/results"
                className="px-3 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors font-medium shrink-0"
              >
                Review Matrix
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
