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
  // SVG Circumference calculations: radius 66 -> 2 * PI * 66 = 414.69
  const circumference = 414.6;
  const strokeDashoffset = circumference - (circumference * percentage) / 100;

  // Inner ring: radius 50 -> 2 * PI * 50 = 314
  const innerCircumference = 314;
  const innerOffset = innerCircumference - (innerCircumference * 80) / 100;

  return (
    <div className="flex flex-col sm:flex-row lg:flex-col items-center justify-center gap-5 p-5 rounded-2xl bg-white dark:bg-[#0a0e18]/80 border border-slate-200 dark:border-[#283145] text-center sm:text-left lg:text-center shadow-lg">
      <div className="relative flex items-center justify-center shrink-0 drop-shadow-[0_0_25px_rgba(16,185,129,0.35)]">
        <svg className="w-44 h-44 transform -rotate-90" viewBox="0 0 160 160">
          {/* Base outer track */}
          <circle
            className="text-slate-200 dark:text-[#1e2536]"
            cx="80"
            cy="80"
            fill="transparent"
            r="66"
            stroke="currentColor"
            strokeWidth="14"
          />
          {/* Active outer accuracy stroke */}
          <circle
            className="text-emerald-500 dark:text-[#10B981] transition-all duration-1000 ease-out"
            cx="80"
            cy="80"
            fill="transparent"
            r="66"
            stroke="currentColor"
            strokeWidth="14"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
          {/* Inner accent ring */}
          <circle
            className="text-indigo-500 dark:text-[#6366F1]"
            cx="80"
            cy="80"
            fill="transparent"
            r="50"
            stroke="currentColor"
            strokeWidth="6"
            strokeDasharray={innerCircumference}
            strokeDashoffset={innerOffset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="font-headline font-extrabold text-3xl sm:text-4xl text-emerald-600 dark:text-[#34d399] tracking-tight leading-none mb-1 font-tabular">
            {percentage}
            <span className="text-emerald-500 dark:text-[#10B981] text-2xl font-bold">%</span>
          </span>
          <span className="font-headline text-[10px] tracking-wider uppercase font-bold text-slate-500 dark:text-[#94a3b8] leading-none mb-1">
            Accuracy Index
          </span>
          <span className="font-mono text-xs font-semibold text-emerald-600 dark:text-[#10B981] leading-none">
            {correctCount} / {totalCount} VALID
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="inline-flex items-center justify-center sm:justify-start lg:justify-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-[#10b981]/15 border border-emerald-300 dark:border-[#10b981]/30 text-emerald-700 dark:text-[#34d399] shadow-sm">
          <Award className="w-4 h-4 text-emerald-600 dark:text-[#10B981]" />
          <span className="font-headline text-xs font-bold uppercase tracking-wider">{candidateTier}</span>
        </div>
        <p className="font-body text-xs text-slate-500 dark:text-[#94a3b8]">{topicTitle}</p>
      </div>
    </div>
  );
};
