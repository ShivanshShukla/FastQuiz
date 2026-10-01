import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Shield, CheckCircle2, ArrowLeft, KeyRound } from "lucide-react";
import { useAuth, UserIdentity } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { isMockEnabled } from "../config/env";

const GoogleIcon: React.FC<{ className?: string }> = ({
  className = "w-4 h-4",
}) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.92 0 12s.45 3.85 1.24 5.42l4.04-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

const GitHubIcon: React.FC<{ className?: string }> = ({
  className = "w-4 h-4",
}) => (
  <svg
    className={className}
    fill="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
    />
  </svg>
);

export const SettingsConnectionsPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();

  const [identities, setIdentities] = useState<UserIdentity[]>([]);
  const [hasPassword, setHasPassword] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const fetchConnections = async () => {
    if (isMockEnabled()) {
      setIdentities(
        user?.identities || [
          {
            provider: "google",
            provider_user_id: "google-alex",
            created_at: new Date().toISOString(),
          },
        ],
      );
      setHasPassword(user?.hasPassword ?? true);
      return;
    }

    try {
      const res = await fetch("/auth/me", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setIdentities(data.identities || []);
        setHasPassword(data.has_password ?? false);
      }
    } catch {
      // Ignore network errors
    }
  };

  useEffect(() => {
    fetchConnections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const googleIdent = identities.find((i) => i.provider === "google");
  const githubIdent = identities.find((i) => i.provider === "github");
  const totalMethods = identities.length + (hasPassword ? 1 : 0);

  const handleConnect = (provider: "google" | "github") => {
    window.location.href = `/auth/${provider}/login?next=/settings/connections`;
  };

  const handleDisconnect = async (provider: string) => {
    // Rule 6 client-side fast check
    if (totalMethods <= 1) {
      showToast(
        "Cannot disconnect your only remaining sign-in method. Please set a password or connect another provider first.",
        "error",
      );
      return;
    }

    setLoadingAction(provider);
    try {
      if (isMockEnabled()) {
        setIdentities((prev) => prev.filter((i) => i.provider !== provider));
        showToast(`Disconnected ${provider} account.`, "success");
        return;
      }

      const res = await fetch(`/auth/identities/${provider}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res
          .json()
          .catch(() => ({ detail: "Failed to disconnect" }));
        throw new Error(data.detail || "Failed to disconnect account");
      }

      showToast(`Successfully disconnected ${provider}.`, "success");
      await refreshUser();
      await fetchConnections();
    } catch (err: unknown) {
      showToast(
        (err as Error).message || "Failed to disconnect account",
        "error",
      );
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <Link
          to="/curriculum"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Curriculum</span>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Connected Accounts & Security
        </h1>
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          Manage the social providers and credentials linked to your FastQuiz
          profile ({user?.email || "Signed in user"}).
        </p>
      </div>

      {/* Security Banner: Last method protection notice */}
      <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 flex items-start gap-3">
        <Shield className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <p className="font-semibold text-zinc-900 dark:text-zinc-100">
            Account Takeover & Lockout Protection
          </p>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-[11px]">
            To prevent accidental lockout, you can never disconnect your last
            remaining sign-in method. Connecting multiple providers allows you
            to sign in with either service using a single unified profile.
          </p>
        </div>
      </div>

      {/* Providers Matrix */}
      <div className="space-y-4">
        <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-500 font-semibold">
          Sign-In Methods ({totalMethods} Active)
        </h2>

        <div className="grid grid-cols-1 gap-3.5">
          {/* Google Connection Card */}
          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                <GoogleIcon className="w-5 h-5 shrink-0" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Google
                  </span>
                  {googleIdent ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 className="w-3 h-3" />
                      Connected
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                      Not Linked
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-500">
                  {googleIdent
                    ? `Linked identity: ${googleIdent.email_at_link || "Google account"}`
                    : "Sign in with one click using your Google profile."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {googleIdent ? (
                <button
                  type="button"
                  onClick={() => handleDisconnect("google")}
                  disabled={loadingAction === "google" || totalMethods <= 1}
                  title={
                    totalMethods <= 1
                      ? "Cannot disconnect your only sign-in method"
                      : undefined
                  }
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 border border-red-200 dark:border-red-900/40 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  {loadingAction === "google"
                    ? "Disconnecting..."
                    : "Disconnect"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleConnect("google")}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 cursor-pointer transition-colors shadow-sm"
                >
                  Connect Google
                </button>
              )}
            </div>
          </div>

          {/* GitHub Connection Card */}
          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                <GitHubIcon className="w-5 h-5 shrink-0" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    GitHub
                  </span>
                  {githubIdent ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 className="w-3 h-3" />
                      Connected
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                      Not Linked
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-500">
                  {githubIdent
                    ? `Linked identity: ${githubIdent.email_at_link || "GitHub developer account"}`
                    : "Sign in with your developer profile and verified primary email."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {githubIdent ? (
                <button
                  type="button"
                  onClick={() => handleDisconnect("github")}
                  disabled={loadingAction === "github" || totalMethods <= 1}
                  title={
                    totalMethods <= 1
                      ? "Cannot disconnect your only sign-in method"
                      : undefined
                  }
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 border border-red-200 dark:border-red-900/40 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  {loadingAction === "github"
                    ? "Disconnecting..."
                    : "Disconnect"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleConnect("github")}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 cursor-pointer transition-colors shadow-sm"
                >
                  Connect GitHub
                </button>
              )}
            </div>
          </div>

          {/* Password Authentication Method */}
          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                <KeyRound className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Password Authentication
                  </span>
                  {hasPassword ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 className="w-3 h-3" />
                      Password Set
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                      Not Set (Social Login Only)
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-500">
                  {hasPassword
                    ? "Your account is secured with an Argon2id-hashed master password."
                    : "You currently use social login only. You can set a password anytime for fallback access."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
