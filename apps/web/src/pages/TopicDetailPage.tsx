import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FolderOpen,
  CheckCircle,
  HelpCircle,
  Clock,
  Award,
  Lock,
  ArrowRight,
  Terminal,
  FileCode,
  ShieldCheck,
} from "lucide-react";
import { webMockStore } from "../services/webMockStore";
import { useToast } from "../context/ToastContext";

export const TopicDetailPage: React.FC = () => {
  const { topicId = "distributed-caching" } = useParams<{ topicId: string }>();
  const topic = webMockStore.getTopic(topicId) || webMockStore.getTopics()[0];
  const { showToast } = useToast();
  const [, setRefreshKey] = useState(0);

  const handleBuySingle = (quizId: string, title: string) => {
    webMockStore.purchaseItem(quizId);
    showToast(
      `Unlocked ${title} (₹99). Reference explanations are now active.`,
      "success",
    );
    setRefreshKey((k) => k + 1);
  };

  const handleBuyBundle = () => {
    webMockStore.purchaseItem("master-bundle");
    showToast("Unlocked full track access for all 8 modules.", "success");
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left space-y-8">
      {/* Breadcrumb Navigation */}
      <nav
        className="flex items-center gap-2 text-xs font-mono text-zinc-500"
        aria-label="Breadcrumb"
      >
        <Link
          to="/topics"
          className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors flex items-center gap-1"
        >
          <FolderOpen className="w-3.5 h-3.5" />
          <span>Topics</span>
        </Link>
        <span>/</span>
        <span className="text-zinc-600 dark:text-zinc-400">
          {topic.category}
        </span>
        <span>/</span>
        <span className="text-zinc-900 dark:text-zinc-100 font-medium truncate max-w-xs sm:max-w-none">
          {topic.title}
        </span>
      </nav>

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-3xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300">
              {topic.category}
            </span>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300">
              Level: {topic.difficulty}
            </span>
            <span className="text-[10px] font-mono text-zinc-500">
              {topic.totalQuizzes} Assessment Modules
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
            {topic.title}
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
            {topic.description}
          </p>
        </div>

        {/* Technical Specs Strip */}
        <div className="flex items-center gap-4 shrink-0 bg-white dark:bg-zinc-900/50 p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs">
          <div>
            <div className="text-lg font-semibold font-mono text-zinc-900 dark:text-zinc-100">
              {topic.quizzes.length}
            </div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider">
              Modules
            </div>
          </div>
          <div className="w-px h-7 bg-zinc-200 dark:bg-zinc-800" />
          <div>
            <div className="text-lg font-semibold font-mono text-zinc-900 dark:text-zinc-100">
              ~45m
            </div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider">
              Est. Time
            </div>
          </div>
          <div className="w-px h-7 bg-zinc-200 dark:bg-zinc-800" />
          <div>
            <div className="text-lg font-semibold font-mono text-emerald-600 dark:text-emerald-400">
              80%
            </div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider">
              Passing Mark
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols): Primary Assessment & Module List */}
        <div className="lg:col-span-8 space-y-6">
          {/* Primary Assessment Focus Card */}
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40">
                ENTRYPOINT ASSESSMENT • FREE ATTEMPT
              </span>
              <span className="text-xs font-mono text-zinc-500">
                Module 1 of {topic.totalQuizzes}
              </span>
            </div>

            <div className="space-y-1.5">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Quiz 1: Cache Strategies & Invalidation Dilemmas
              </h2>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Test your understanding of Cache-Aside vs Write-Through
                patterns, 2-phase commit hazards, and eventual consistency
                boundaries across replicated datastores.
              </p>
            </div>

            {/* Assessment Specs Grid */}
            <div className="grid grid-cols-3 gap-3 p-3 rounded-md bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-xs">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-zinc-400 shrink-0" />
                <div>
                  <div className="text-[10px] text-zinc-500 uppercase">
                    Questions
                  </div>
                  <div className="font-mono font-medium text-zinc-900 dark:text-zinc-200">
                    10 MCQs
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-zinc-400 shrink-0" />
                <div>
                  <div className="text-[10px] text-zinc-500 uppercase">
                    Duration
                  </div>
                  <div className="font-mono font-medium text-zinc-900 dark:text-zinc-200">
                    15 Minutes
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-500 shrink-0" />
                <div>
                  <div className="text-[10px] text-zinc-500 uppercase">
                    Target
                  </div>
                  <div className="font-mono font-medium text-zinc-900 dark:text-zinc-200">
                    80% Accuracy
                  </div>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
              <Link
                to="/quiz/quiz-cache-1/take"
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-medium hover:bg-zinc-800 dark:hover:bg-white transition-colors shadow-sm"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Start Assessment</span>
              </Link>
              <Link
                to="/attempts/att-seed-1/results"
                className="px-4 py-2.5 rounded-md border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium transition-colors text-center"
              >
                View Diagnostic Report
              </Link>
            </div>
          </div>

          {/* Module List Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Track Syllabus & Progression
              </h3>
              <span className="text-xs font-mono text-zinc-500">
                {topic.quizzes.length} Modules Total
              </span>
            </div>

            <div className="divide-y divide-zinc-200 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900/30 overflow-hidden">
              {topic.quizzes.map((quiz, idx) => (
                <div
                  key={quiz.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="text-xs font-mono text-zinc-400 mt-0.5">
                      0{idx + 1}
                    </span>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-zinc-900 dark:text-zinc-100 truncate">
                          {quiz.title}
                        </span>
                        {quiz.status === "completed" && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40">
                            {quiz.lastScore}%
                          </span>
                        )}
                        {quiz.status === "locked" && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border border-zinc-200 dark:border-zinc-700">
                            PRO
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1">
                        {quiz.description}
                      </p>
                      <div className="text-[11px] font-mono text-zinc-400 pt-0.5">
                        {quiz.questionsCount} Questions • {quiz.durationMinutes}{" "}
                        mins
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {quiz.status === "locked" ? (
                      <button
                        type="button"
                        onClick={() => handleBuySingle(quiz.id, quiz.title)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium transition-colors cursor-pointer"
                      >
                        <Lock className="w-3 h-3 text-zinc-400" />
                        <span>Unlock ₹99</span>
                      </button>
                    ) : quiz.status === "purchased" ? (
                      <Link
                        to={`/quiz/${quiz.id}/take`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
                      >
                        <span>Start</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    ) : quiz.status === "completed" ? (
                      <Link
                        to={`/quiz/${quiz.id}/take`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium transition-colors"
                      >
                        <span>Retake</span>
                      </Link>
                    ) : (
                      <Link
                        to={`/quiz/${quiz.id}/take`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-medium hover:bg-zinc-800 dark:hover:bg-white transition-colors"
                      >
                        <span>Start Free</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Track Access Plan (Sidebar) */}
        <aside className="lg:col-span-4 sticky top-20 space-y-4">
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-5 space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                Track Access
              </span>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                Distributed Systems Bundle
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Full access to all 8 practice modules, comprehensive failure
                postmortems, and technical reference explanations.
              </p>
            </div>

            <div className="space-y-2 pt-1 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>All 8 Deep-Dive Assessment Modules</span>
              </div>
              <div className="flex items-center gap-2">
                <FileCode className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span>Go & Python Reference Implementations</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <span>Lifetime access with future updates</span>
              </div>
            </div>

            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-baseline justify-between">
              <div>
                <span className="text-xl font-semibold font-mono text-zinc-900 dark:text-zinc-100">
                  ₹399
                </span>
                <span className="text-xs font-mono text-zinc-400 line-through ml-2">
                  ₹1,499
                </span>
              </div>
              <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400">
                Single Track Pass
              </span>
            </div>

            <button
              type="button"
              onClick={handleBuyBundle}
              className="w-full py-2.5 px-4 rounded-md bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white text-xs font-medium transition-colors shadow-sm cursor-pointer"
            >
              Unlock Track Access • ₹399
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};
