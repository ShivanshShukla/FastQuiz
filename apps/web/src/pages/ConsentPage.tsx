import React, { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Shield, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { BrandLogo } from "../components/Common/BrandLogo";
import { isMockEnabled } from "../config/env";

export const ConsentPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const nextParam = searchParams.get("next") || "/curriculum";
  const { user, refreshUser, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [hasConsented, setHasConsented] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);

  const handleAccept = async () => {
    if (!hasConsented) {
      showToast("Please check the consent box to proceed.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      if (isMockEnabled()) {
        showToast("Consent granted. Welcome to FastQuiz!", "success");
        navigate(nextParam);
        return;
      }

      const res = await fetch("/auth/consent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ policy_version: "2026.1", accepted: true }),
      });

      if (!res.ok) {
        const err = await res
          .json()
          .catch(() => ({ detail: "Consent recording failed" }));
        throw new Error(err.detail || "Consent recording failed");
      }

      await refreshUser();
      showToast("Consent granted. Your account is activated!", "success");
      navigate(nextParam);
    } catch (err: unknown) {
      showToast((err as Error).message || "Failed to submit consent", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDecline = async () => {
    setIsSubmitting(true);
    try {
      if (!isMockEnabled()) {
        await fetch("/auth/consent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ policy_version: "2026.1", accepted: false }),
        });
      }
      await logout();
      navigate("/login?notice=consent_declined");
    } catch (err: unknown) {
      showToast((err as Error).message || "Error processing request", "error");
    } finally {
      setIsSubmitting(false);
      setShowDeclineModal(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10 text-left">
      <div className="w-full max-w-2xl rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl p-6 sm:p-10 space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-zinc-100 dark:border-zinc-800 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                <Shield className="w-3 h-3" />
                DPDPA 2023 Compliant • Policy v2026.1
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
              Data Protection & Privacy Notice
            </h1>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
              Before activating your FastQuiz account (
              {user?.email || "your profile"}), please review and grant consent
              for data processing.
            </p>
          </div>
          <BrandLogo size="sm" showBadge={false} />
        </div>

        {/* Specified Purposes Matrix */}
        <div className="space-y-4">
          <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-500 font-semibold">
            Purposes of Processing
          </h2>
          <div className="grid grid-cols-1 gap-3">
            <div className="p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>Account Identity & Access Management</span>
              </div>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed pl-6">
                Processing your verified email, display name, and avatar from
                your identity provider (Google, GitHub, or password) to
                authenticate your sessions and maintain your security.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Diagnostic Telemetry & Curriculum Analytics</span>
              </div>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed pl-6">
                Recording your quiz response choices, percentile benchmarks,
                topic calibrations, and response pacing to generate diagnostic
                insight reports.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Assessment Integrity & Proctoring Telemetry</span>
              </div>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed pl-6">
                Recording browser tab switch events and session focus timestamps
                during timed diagnostic assessments to safeguard benchmark
                validity.
              </p>
            </div>
          </div>
        </div>

        {/* User Rights Notice */}
        <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-800/30 text-[11px] text-zinc-600 dark:text-zinc-400 space-y-1">
          <p className="font-medium text-zinc-900 dark:text-zinc-200">
            Your Statutory Rights under DPDPA 2023:
          </p>
          <p className="leading-relaxed">
            You retain the unconditional right to access your stored data,
            rectify inaccuracies, or withdraw this consent at any time from your
            Account Settings. Withdrawing consent triggers automated cascading
            deletion of all associated personal identities and telemetry
            records. Read our full{" "}
            <Link
              to="/privacy"
              target="_blank"
              className="text-indigo-600 dark:text-indigo-400 underline"
            >
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link
              to="/terms"
              target="_blank"
              className="text-indigo-600 dark:text-indigo-400 underline"
            >
              Terms of Service
            </Link>
            .
          </p>
        </div>

        {/* Mandatory Unticked Checkbox */}
        <div className="pt-2">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              id="dpdpa-consent-checkbox"
              checked={hasConsented}
              onChange={(e) => setHasConsented(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-indigo-600 border-zinc-300 rounded focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800"
            />
            <span className="text-xs text-zinc-700 dark:text-zinc-300 leading-snug group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
              I give explicit, informed, and revocable consent to FastQuiz to
              process my personal data for the specified purposes outlined above
              in compliance with India's Digital Personal Data Protection Act
              (DPDPA 2023).
            </span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => setShowDeclineModal(true)}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-4 py-2.5 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
          >
            Decline & Cancel Registration
          </button>

          <button
            type="button"
            onClick={handleAccept}
            disabled={!hasConsented || isSubmitting}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <span>
              {isSubmitting ? "Activating..." : "Accept & Activate Account"}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Decline Confirmation Modal */}
      {showDeclineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                Cancel Account Registration?
              </h3>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Without consent, we cannot legally create or operate your FastQuiz
              account under the DPDPA 2023. If you decline, your pending account
              and login credentials will be permanently erased.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-3">
              <button
                type="button"
                onClick={() => setShowDeclineModal(false)}
                className="px-3.5 py-2 rounded-lg text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Keep Reviewing
              </button>
              <button
                type="button"
                onClick={handleDecline}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-red-600 hover:bg-red-500"
              >
                Confirm Decline & Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
