import React, { useState } from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showBadge?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showBadge = true,
  className = '',
}) => {
  const [imgError, setImgError] = useState(false);

  const emblemSizes = {
    sm: 'w-7 h-7',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Kinetic Brand Emblem */}
      <div className="relative shrink-0 flex items-center justify-center">
        {!imgError ? (
          <img
            src="/assets/logo-icon.png"
            alt="FastQuiz Logo"
            className={`${emblemSizes[size]} rounded-xl object-contain drop-shadow-[0_0_12px_rgba(99,102,241,0.45)] transition-transform hover:scale-105`}
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className={`${emblemSizes[size]} rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center relative shadow-[0_0_14px_rgba(99,102,241,0.5)] border border-indigo-400/30 overflow-hidden shrink-0`}
            aria-hidden="true"
          >
            {/* White electric momentum bolt */}
            <svg
              className="w-4 h-4 text-white fill-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]"
              viewBox="0 0 24 24"
            >
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            {/* Amber momentum indicator dot */}
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_4px_rgba(245,158,11,0.9)]" />
          </div>
        )}
      </div>

      {/* Brand Name Typography */}
      <div className="flex items-center gap-1.5">
        <span className="sr-only">FastQuiz</span>
        <span
          aria-hidden="true"
          className={`font-headline font-extrabold ${textSizes[size]} text-slate-900 dark:text-white tracking-tight leading-none`}
        >
          Fast<span className="text-primary dark:text-indigo-400">Quiz</span>
        </span>
        {showBadge && (
          <span className="text-indigo-600 dark:text-indigo-400 font-headline text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 dark:bg-primary/20 border border-primary/25 uppercase tracking-wider">
            • Prep
          </span>
        )}
      </div>
    </div>
  );
};
