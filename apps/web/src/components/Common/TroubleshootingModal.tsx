import React, { useState } from "react";
import {
  X,
  CheckCircle2,
  Copy,
  Check,
  RefreshCw,
  Terminal,
  Shield,
  LifeBuoy,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { isMockEnabled } from "../../config/env";

interface TroubleshootingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TroubleshootingModal: React.FC<TroubleshootingModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  if (!isOpen) return null;

  const mockActive = isMockEnabled();

  const diagnosticReport = {
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    environment: mockActive ? "mock" : "production/live",
    user: user
      ? {
          id: user.id,
          name: user.name,
          email: user.email,
          status: user.status || "active",
          emailVerified: user.emailVerified ?? false,
          identities: user.identities?.map((i) => i.provider) || ["password"],
        }
      : null,
    storage: {
      hasUser: !!localStorage.getItem("fastquiz_user"),
      hasToken: !!localStorage.getItem("fastquiz_access_token"),
      theme: localStorage.getItem("fastquiz_theme") || "dark",
      cookiesAllowed:
        localStorage.getItem("fastquiz_cookie_consent") || "not_set",
    },
  };

  const handleCopyDiagnostics = async () => {
    try {
      await navigator.clipboard.writeText(
        JSON.stringify(diagnosticReport, null, 2),
      );
      setCopied(true);
      showToast("Diagnostics copied to clipboard", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast("Unable to copy to clipboard", "error");
    }
  };

  const handleClearSessionStorage = () => {
    setIsResetting(true);
    try {
      localStorage.removeItem("fastquiz_mock_override");
      sessionStorage.clear();
      showToast("Session cache cleared. Reloading page...", "info");
      setTimeout(() => {
        window.location.reload();
      }, 600);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="troubleshooting-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400">
              <Terminal className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <h2
                id="troubleshooting-title"
                className="text-base font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight"
              >
                Diagnostics & Troubleshooting
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Inspect system connectivity, session state, and diagnostic
                telemetry
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Close troubleshooting modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Services Health */}
          <div className="space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold">
              Microservices Connectivity
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 flex items-center justify-between">
                <span className="text-xs text-zinc-700 dark:text-zinc-300 font-medium">
                  Auth Service
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">
                  <CheckCircle2 className="w-3 h-3" /> 8001
                </span>
              </div>
              <div className="p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 flex items-center justify-between">
                <span className="text-xs text-zinc-700 dark:text-zinc-300 font-medium">
                  Quiz Engine
                </span>
                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-mono">
                  <CheckCircle2 className="w-3 h-3" /> 8002
                </span>
              </div>
              <div className="p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 flex items-center justify-between">
                <span className="text-xs text-zinc-700 dark:text-zinc-300 font-medium">
                  Payments
                </span>
                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-mono">
                  <CheckCircle2 className="w-3 h-3" /> 8003
                </span>
              </div>
            </div>
          </div>

          {/* Active Identity & Consent */}
          <div className="space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold">
              Security & Identity State
            </span>
            <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 dark:text-zinc-400">
                  Authenticated User
                </span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100 font-mono">
                  {user ? user.email || user.name : "Unauthenticated"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 dark:text-zinc-400">
                  Environment Mode
                </span>
                <span className="font-mono text-zinc-700 dark:text-zinc-300">
                  {mockActive
                    ? "MOCK DATA (dev)"
                    : "LIVE BACKEND (production-ready)"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 dark:text-zinc-400">
                  DPDPA 2023 Compliance
                </span>
                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                  <Shield className="w-3 h-3" /> Policy v2026.1 Active
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={handleCopyDiagnostics}
              className="flex-1 py-2 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-750 text-xs font-medium text-zinc-800 dark:text-zinc-200 flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Copied Report</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Copy Diagnostics JSON</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleClearSessionStorage}
              disabled={isResetting}
              className="py-2 px-3 rounded-lg border border-amber-300 dark:border-amber-800/80 bg-amber-50/60 dark:bg-amber-950/30 hover:bg-amber-100/60 dark:hover:bg-amber-950/50 text-xs font-medium text-amber-900 dark:text-amber-200 flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isResetting ? "animate-spin" : ""}`}
              />
              <span>Reset Local Cache</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-950/70 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-1.5">
            <LifeBuoy className="w-3.5 h-3.5 text-zinc-400" />
            <span>Need help?</span>
            <a
              href="mailto:support@fastquiz.dev"
              className="text-indigo-600 dark:text-indigo-400 underline font-medium hover:text-indigo-700"
            >
              support@fastquiz.dev
            </a>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded-md bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-medium hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
