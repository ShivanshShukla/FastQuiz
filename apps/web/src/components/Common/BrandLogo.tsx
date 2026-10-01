import React, { useState } from "react";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  showBadge?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = "md",
  showBadge = true,
  className = "",
}) => {
  const [imgError, setImgError] = useState(false);

  const emblemSizes = {
    sm: "w-6 h-6",
    md: "w-7 h-7",
    lg: "w-9 h-9",
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-xl",
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Brand Emblem */}
      <div className="relative shrink-0 flex items-center justify-center">
        {!imgError ? (
          <img
            src="/assets/logo-icon.png"
            alt=""
            aria-hidden="true"
            className={`${emblemSizes[size]} rounded-lg object-contain transition-opacity hover:opacity-90`}
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className={`${emblemSizes[size]} rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center relative overflow-hidden shrink-0 shadow-sm`}
            aria-hidden="true"
          >
            {/* Minimalist Vector Bolt */}
            <svg
              className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400"
              viewBox="0 0 24 24"
            >
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
        )}
      </div>

      {/* Brand Name Typography */}
      <div className="flex items-center gap-2">
        <span className="sr-only">FastQuiz</span>
        <span
          aria-hidden="true"
          className={`font-headline font-semibold ${textSizes[size]} text-zinc-900 dark:text-zinc-100 tracking-tight leading-none`}
        >
          Fast<span className="text-indigo-600 dark:text-indigo-400">Quiz</span>
        </span>
        {showBadge && (
          <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400">
            PRO
          </span>
        )}
      </div>
    </div>
  );
};
