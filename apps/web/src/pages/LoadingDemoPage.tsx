import React, { useState } from 'react';
import { LoadingScreen } from '../components/Common/LoadingScreen';
import { Play, Sliders, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { isMockEnabled, getMockModeSource } from '../config/env';

export const LoadingDemoPage: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [customTimeout, setCustomTimeout] = useState(3);
  const [customMessage, setCustomMessage] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  const handleLaunch = () => {
    setIsActive(true);
  };

  const handleRetry = () => {
    setRetryCount((c) => c + 1);
  };

  const handleDismiss = () => {
    setIsActive(false);
  };

  if (isActive) {
    return (
      <LoadingScreen
        fullscreen={isFullscreen}
        timeoutSeconds={customTimeout}
        message={customMessage.trim() || undefined}
        onRetry={handleRetry}
        onCancel={handleDismiss}
      />
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-left space-y-8">
      {/* Header */}
      <div className="space-y-3 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2 text-xs font-mono text-indigo-600 dark:text-indigo-400 font-medium">
          <Sliders className="w-3.5 h-3.5" />
          <span>DEVELOPER PLAYGROUND • TELEMETRY UTILITY</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
          Application Loading Screen
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl leading-relaxed">
          Configure and preview the high-resilience loading screen designed for slow networks, long diagnostic runtime handshakes, and sandbox provisioning.
        </p>

        {/* Mock Environment Status Badge */}
        <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[11px]">
          <span className="text-zinc-500">MOCK ENVIRONMENT:</span>
          <span
            className={`px-2 py-0.5 rounded font-semibold ${
              isMockEnabled()
                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700'
            }`}
          >
            {isMockEnabled() ? 'ACTIVE' : 'INACTIVE'} (source: {getMockModeSource()})
          </span>
          {!isMockEnabled() && (
            <span className="text-zinc-400">
              (All dummy data disabled. Append <code className="text-indigo-500">?mock=true</code> to preview dummy datasets)
            </span>
          )}
        </div>
      </div>

      {/* Control Panel */}
      <div className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-6 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-mono">
          Configuration & Trigger
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Custom Message */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Custom Status Message (Optional)
            </label>
            <input
              type="text"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="e.g. Loading Distributed Sharding Matrix..."
              className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-indigo-500"
            />
            <span className="text-[11px] text-zinc-400">
              Leave blank to automatically cycle through calibrated diagnostic runtime steps.
            </span>
          </div>

          {/* Timeout slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-zinc-700 dark:text-zinc-300">
                Trigger "Taking Longer" Warning:
              </span>
              <span className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
                {customTimeout} seconds
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={customTimeout}
              onChange={(e) => setCustomTimeout(Number(e.target.value))}
              className="w-full cursor-pointer accent-indigo-600"
            />
            <span className="text-[11px] text-zinc-400">
              When network or runtime exceeds this duration, the recovery panel automatically animates in.
            </span>
          </div>
        </div>

        {/* Display Mode Toggles */}
        <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <label className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer">
            <input
              type="checkbox"
              checked={isFullscreen}
              onChange={(e) => setIsFullscreen(e.target.checked)}
              className="rounded accent-indigo-600"
            />
            <span>Fullscreen Mode (with backdrop blur)</span>
          </label>

          {retryCount > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-mono ml-auto">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Retries triggered: {retryCount}</span>
            </div>
          )}
        </div>

        {/* Launch Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={handleLaunch}
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Launch Loading Screen Preview</span>
          </button>

          <Link
            to="/curriculum"
            className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-center transition-colors"
          >
            Return to Curriculum
          </Link>
        </div>
      </div>

      {/* Embedded Live Preview */}
      <div className="space-y-3">
        <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-500 font-semibold">
          Embedded Inline Preview Mode
        </h3>
        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40">
          <LoadingScreen
            fullscreen={false}
            timeoutSeconds={customTimeout}
            message="Provisioning isolated Redis sandbox..."
            subtext="Allocating 256MB in-memory cluster node"
          />
        </div>
      </div>
    </div>
  );
};
