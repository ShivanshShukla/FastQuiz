import React from 'react';
import { Link } from 'react-router-dom';
import {
  Flame,
  Zap,
  CheckCircle,
  TrendingUp,
  Clock,
  ArrowRight,
  BookOpen,
  Award,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { webMockStore } from '../services/webMockStore';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const topics = webMockStore.getTopics();

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-12 py-8 space-y-10 text-left">
      {/* Section 1: Welcome & Motivational Momentum Strip */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-100 via-white to-slate-100 dark:from-[#171b26] dark:via-[#141925] dark:to-[#111827] border border-slate-200 dark:border-[#2d3748] shadow-[0_8px_32px_rgba(0,0,0,0.2)] p-6 lg:p-8">
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-indigo-600/15 blur-3xl pointer-events-none"></div>
        <div className="absolute -left-12 -bottom-12 w-64 h-64 rounded-full bg-orange-600/15 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950/70 border border-indigo-300 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 font-headline text-xs font-semibold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              ACTIVE SPRINT: DISTRIBUTED SYSTEMS
            </div>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Welcome back, {user?.name?.split(' ')[0] || 'Rohan'}! 🚀
            </h1>
            <p className="font-body text-base sm:text-lg text-slate-600 dark:text-slate-300">
              You're on a{' '}
              <span className="font-bold text-orange-600 dark:text-orange-400 drop-shadow-[0_0_8px_rgba(249,115,22,0.4)]">
                {user?.streakDays || 4}-day streak
              </span>{' '}
              — complete today's quiz to protect your streak and lock in algorithmic muscle memory!
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <Link
              to="/topics/distributed-caching"
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-primary to-indigo-600 text-white font-headline text-sm font-bold shadow-[0_4px_16px_rgba(99,102,241,0.4)] hover:brightness-110 active:translate-y-0.5 border border-indigo-400/30 transition-all flex items-center gap-2"
            >
              <span>Daily Workout</span>
              <Zap className="w-4 h-4 fill-current" />
            </Link>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-200 dark:border-[#2d3748]/70">
          {/* Stat 1: Momentum */}
          <div className="p-4 rounded-xl bg-white dark:bg-[#111827]/90 border border-slate-200 dark:border-[#2d3748] shadow-sm flex items-center gap-3.5 group hover:border-orange-500/50 transition-all">
            <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-950/70 border border-orange-300 dark:border-orange-500/40 flex items-center justify-center text-orange-600 dark:text-orange-400 shadow-[0_0_12px_rgba(249,115,22,0.2)]">
              <Flame className="w-6 h-6 fill-current animate-pulse" />
            </div>
            <div>
              <div className="font-headline text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Momentum
              </div>
              <div className="font-headline text-lg text-slate-900 dark:text-white font-extrabold flex items-center gap-1.5">
                {user?.streakDays || 4}-Day Streak
                <span className="inline-block w-2 h-2 rounded-full bg-orange-500 animate-ping"></span>
              </div>
            </div>
          </div>

          {/* Stat 2: Target Readiness */}
          <div className="p-4 rounded-xl bg-white dark:bg-[#111827]/90 border border-slate-200 dark:border-[#2d3748] shadow-sm flex items-center gap-3.5 group hover:border-primary/50 transition-all">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-950/70 border border-indigo-300 dark:border-primary/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.2)]">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="font-headline text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Target Readiness
              </div>
              <div className="font-headline text-lg text-slate-900 dark:text-white font-extrabold">
                88% Staff Level
              </div>
            </div>
          </div>

          {/* Stat 3: Quizzes Mastered */}
          <div className="p-4 rounded-xl bg-white dark:bg-[#111827]/90 border border-slate-200 dark:border-[#2d3748] shadow-sm flex items-center gap-3.5 group hover:border-emerald-500/50 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-500/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="font-headline text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Completed
              </div>
              <div className="font-headline text-lg text-slate-900 dark:text-white font-extrabold">
                24 Modules
              </div>
            </div>
          </div>

          {/* Stat 4: Time Logged */}
          <div className="p-4 rounded-xl bg-white dark:bg-[#111827]/90 border border-slate-200 dark:border-[#2d3748] shadow-sm flex items-center gap-3.5 group hover:border-slate-400 transition-all">
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="font-headline text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Weekly Practice
              </div>
              <div className="font-headline text-lg text-slate-900 dark:text-white font-extrabold">
                4.8 hrs Logged
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Curriculum Tracks & Topic Bento Grid */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-headline text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-primary" />
              Interview Curriculum Tracks
            </h2>
            <p className="font-body text-sm text-slate-500 dark:text-[#94A3B8]">
              High-frequency domains calibrated for Staff & Senior engineering loops.
            </p>
          </div>
          <Link
            to="/topics"
            className="text-primary font-headline text-xs font-bold hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>View All Tracks</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((topic) => (
            <div
              key={topic.id}
              className="group relative rounded-2xl bg-white dark:bg-[#171b26] border border-slate-200 dark:border-[#2d3748] p-6 shadow-md hover:border-primary/50 dark:hover:border-primary/50 transition-all hover:-translate-y-1 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/30 text-primary font-headline text-xs font-bold uppercase tracking-wider">
                    {topic.category}
                  </span>
                  {topic.freeGrantAvailable && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-headline text-xs font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      1 Free Quiz
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-headline text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors leading-snug">
                    {topic.title}
                  </h3>
                  <p className="font-body text-xs text-slate-600 dark:text-[#94A3B8] mt-2 line-clamp-2 leading-relaxed">
                    {topic.description}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-[#94A3B8] pt-2 border-t border-slate-100 dark:border-[#2d3748]/60">
                  <span>{topic.totalQuizzes} Quizzes Total</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {topic.faangRelevancePercent}% FAANG Relevance
                  </span>
                </div>
              </div>

              <div className="pt-6">
                <Link
                  to={`/topics/${topic.slug}`}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-[#1e2433] hover:bg-primary dark:hover:bg-primary text-slate-800 dark:text-white hover:text-white font-headline text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span>Explore Track</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 3: Recent Performance & Verified Scorecard Telemetry */}
      <section className="rounded-2xl bg-white dark:bg-[#171b26] border border-slate-200 dark:border-[#2d3748] p-6 lg:p-7 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-[#2d3748]">
          <div>
            <h2 className="font-headline text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-500" />
              Recent Diagnostic Sessions
            </h2>
            <p className="font-body text-xs text-slate-500 dark:text-[#94A3B8]">
              Your recent attempts, percentiles, and verified diagnostic benchmarks.
            </p>
          </div>
          <Link
            to="/attempts/att-seed-1/results"
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#1e2433] border border-slate-200 dark:border-[#2d3748] text-primary font-headline text-xs font-bold hover:bg-slate-200 dark:hover:bg-[#283144] transition-all self-start sm:self-auto"
          >
            Open Latest Diagnostic Matrix →
          </Link>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-[#2d3748]/60 pt-2">
          <div className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-[#10B981]/20 border border-emerald-300 dark:border-[#10B981]/40 text-emerald-600 dark:text-[#10B981] flex items-center justify-center shrink-0">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-headline text-xs font-bold text-slate-900 dark:text-white">
                    Quiz 1: Cache Strategies & Invalidation Dilemmas
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-mono text-[10px] font-bold">
                    90% ACCURACY
                  </span>
                </div>
                <p className="font-body text-xs text-slate-500 dark:text-[#94A3B8] mt-0.5">
                  Distributed Caching • 9/10 Valid • Latency: 6m 18s • Staff Level L6 Passed
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/attempts/att-seed-1/results"
                className="px-4 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-500/30 text-primary font-headline text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all"
              >
                View Matrix
              </Link>
              <Link
                to="/quiz/quiz-cache-1/take"
                className="px-4 py-1.5 rounded-lg bg-slate-100 dark:bg-[#1e2433] text-slate-700 dark:text-slate-300 font-headline text-xs font-semibold hover:text-white transition-all"
              >
                Retake
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
