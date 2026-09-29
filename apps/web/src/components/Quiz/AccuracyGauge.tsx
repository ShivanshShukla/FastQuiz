import React from 'react';
import { Award } from 'lucide-react';

interface AccuracyGaugeProps {
  percentage: number;
  correctCount: number;
  totalCount: number;
  candidateTier?: string;
  topicTitle?: string;
}

export const AccuracyGauge: React.FC<AccuracyGaugeProps> = ({
  percentage,
  correctCount,
  totalCount,
  candidateTier = 'Top 8% Candidate',
  topicTitle = 'System Design: Distributed Caching',
}) => {
  // SVG Circumference: radius 60 -> 2 * PI * 60 = 376.99
  const circumference = 377;
  const strokeDashoffset = circumference - (circumference * percentage) / 100;

  return (
    <div className="flex flex-col sm:flex-row lg:flex-col items-center justify-center gap-4 p-5 rounded-lg bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 text-center sm:text-left lg:text-center">
      <div className="relative flex items-center justify-center shrink-0">
        <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 140 140">
          {/* Base track */}
          <circle
            className="text-zinc-200 dark:text-zinc-800"
            cx="70"
            cy="70"
            fill="transparent"
            r="60"
            stroke="currentColor"
            strokeWidth="10"
          />
          {/* Active accuracy stroke */}
          <circle
            className="text-emerald-500 dark:text-emerald-400 transition-all duration-700 ease-out"
            cx="70"
            cy="70"
            fill="transparent"
            r="60"
            stroke="currentColor"
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="text-2xl sm:text-3xl font-semibold font-mono text-zinc-900 dark:text-zinc-100 leading-none">
            {percentage}%
          </div>
          <span className="text-[10px] font-mono uppercase text-zinc-500 mt-1">
            Score
          </span>
          <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
            {correctCount} / {totalCount} Correct
          </span>
        </div>
      </div>

      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-xs font-mono font-medium">
          <Award className="w-3 h-3 text-emerald-500" />
          <span>{candidateTier}</span>
        </div>
        <p className="text-[11px] text-zinc-500 max-w-xs">{topicTitle}</p>
      </div>
    </div>
  );
};
