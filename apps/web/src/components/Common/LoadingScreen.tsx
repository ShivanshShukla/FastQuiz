import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  RotateCcw,
  AlertTriangle,
  ArrowRight,
  Wifi,
  Shield,
  Terminal,
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';

export interface LoadingScreenProps {
  /** Optional custom primary message */
  message?: string;
  /** Optional custom subtext or context */
  subtext?: string;
  /** Whether the loading screen fills the entire viewport */
  fullscreen?: boolean;
  /** Seconds before revealing the "Taking longer than expected" troubleshooting state */
  timeoutSeconds?: number;
  /** Callback when user clicks "Retry Connection" */
  onRetry?: () => void;
  /** Callback when user clicks "Cancel / Return" */
  onCancel?: () => void;
  /** Whether to show the simulated progress bar */
  showProgress?: boolean;
  /** Optional custom container className */
  className?: string;
}

const DEFAULT_CALIBRATION_STEPS = [
  'Calibrating proctored diagnostic runtime...',
  'Verifying question bank cryptographic checksums...',
  'Connecting to low-latency telemetry channel...',
  'Synthesizing Staff-level benchmark criteria...',
  'Finalizing assessment session sandbox...',
];

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message,
  subtext = 'Connecting to low-latency assessment cluster',
  fullscreen = true,
  timeoutSeconds = 5,
  onRetry,
  onCancel,
  showProgress = true,
  className = '',
}) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(15);
  const [isTakingLonger, setIsTakingLonger] = useState(false);

  // Timer for elapsed seconds and "taking longer than expected" trigger
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => {
        const next = prev + 1;
        if (next >= timeoutSeconds) {
          setIsTakingLonger(true);
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeoutSeconds]);

  // Rotate calibration message if no fixed message is passed
  useEffect(() => {
    if (message) return;

    const interval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % DEFAULT_CALIBRATION_STEPS.length);
    }, 1800);

    return () => clearInterval(interval);
  }, [message]);

  // Simulate smooth progress ramp towards 92%
  useEffect(() => {
    if (!showProgress) return;

    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 92) return prev;
        const increment = Math.max(1, Math.floor((92 - prev) / 6));
        return Math.min(prev + increment, 92);
      });
    }, 500);

    return () => clearInterval(progressTimer);
  }, [showProgress]);

  const handleManualRetry = () => {
    setElapsedSeconds(0);
    setProgress(20);
    setIsTakingLonger(false);
    if (onRetry) {
      onRetry();
    }
  };

  const handlePageReload = () => {
    window.location.reload();
  };

  const currentMessage = message || DEFAULT_CALIBRATION_STEPS[stepIndex];

  const containerClasses = fullscreen
    ? 'fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-50/95 dark:bg-zinc-950/95 backdrop-blur-md px-4 py-8 select-none'
    : 'w-full py-16 flex flex-col items-center justify-center px-4 select-none';

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={`${containerClasses} ${className} transition-colors duration-300 text-left`}
    >
      <div className="w-full max-w-md mx-auto flex flex-col items-center text-center space-y-6">
        {/* Brand Emblem with Animated Concentric Orbit */}
        <div className="relative flex items-center justify-center">
          {/* Subtle Ambient Glowing Ring */}
          <div className="absolute -inset-3 rounded-2xl bg-indigo-500/15 dark:bg-indigo-500/25 blur-lg animate-pulse" />

          {/* Outer Rotating Dashed Ring */}
          <div className="absolute w-20 h-20 rounded-2xl border border-dashed border-indigo-400/40 dark:border-indigo-500/40 animate-[spin_10s_linear_infinite]" />

          {/* Inner Brand Logo */}
          <div className="relative p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-md">
            <BrandLogo size="lg" showBadge={false} />
          </div>
        </div>

        {/* Dynamic Status Text */}
        <div className="space-y-1.5 w-full">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-[11px] font-mono text-zinc-600 dark:text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            <span>SESSION RUNTIME • INITIALIZING</span>
          </div>

          <h2
            key={currentMessage}
            className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight transition-all duration-300"
          >
            {currentMessage}
          </h2>

          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto">
            {subtext}
          </p>
        </div>

        {/* Simulated Smooth Progress Bar */}
        {showProgress && (
          <div className="w-full space-y-2 pt-1">
            <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
              <span className="flex items-center gap-1">
                <Terminal className="w-3 h-3 text-zinc-400" />
                <span>Diagnostics</span>
              </span>
              <span>{progress}%</span>
            </div>
          </div>
        )}

        {/* Taking Longer Than Expected Troubleshooting Drawer */}
        {isTakingLonger && (
          <div className="w-full mt-4 p-4 rounded-xl border border-amber-300/80 dark:border-amber-900/60 bg-amber-50/80 dark:bg-amber-950/30 text-left space-y-3.5 shadow-sm animate-in fade-in duration-300">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <h3 className="text-xs font-semibold text-amber-900 dark:text-amber-200">
                  This is taking longer than usual ({elapsedSeconds}s)
                </h3>
                <p className="text-[11px] text-amber-800/90 dark:text-amber-300/80 leading-relaxed">
                  The assessment server handshake is delayed. Your local connection might be throttled, or the cloud runtime is provisioning your isolated sandbox.
                </p>
              </div>
            </div>

            {/* Quick Resolution Controls */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-amber-200/60 dark:border-amber-900/40">
              <button
                type="button"
                onClick={handleManualRetry}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-medium transition-colors shadow-sm cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Retry Handshake</span>
              </button>

              <button
                type="button"
                onClick={handlePageReload}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-amber-300 dark:border-amber-800 bg-white dark:bg-zinc-900 text-amber-900 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-zinc-800 text-[11px] font-medium transition-colors cursor-pointer"
              >
                <Wifi className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                <span>Reload Page</span>
              </button>

              {onCancel ? (
                <button
                  type="button"
                  onClick={onCancel}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 text-[11px] font-medium transition-colors ml-auto cursor-pointer"
                >
                  <span>Cancel</span>
                </button>
              ) : (
                <Link
                  to="/curriculum"
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-800 dark:text-amber-300 hover:underline ml-auto"
                >
                  <span>Return to Curriculum</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Security & Reliability Footnote */}
        <div className="pt-2 flex items-center justify-center gap-2 text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
          <Shield className="w-3 h-3 text-emerald-500" />
          <span>Encrypted Proctoring Telemetry • FastQuiz v0.1</span>
        </div>
      </div>
    </div>
  );
};
