import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type {
  AdminUserDetail,
  AdminUserQuestionBreakdown,
  AdminUserAttemptItem,
} from "@fastquiz/shared";
import {
  ArrowLeft,
  Eye,
  Ban,
  CheckCircle,
  Gift,
  RotateCcw,
  Clock,
  DollarSign,
  Award,
  BookOpen,
  AlertTriangle,
  Send,
  X,
  CheckCircle2,
  XCircle,
  MessageSquare,
} from "lucide-react";

export const UserDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentAdmin, client } = useAuth();
  const role = currentAdmin?.role || "reviewer";
  const isSupport = role === "support";

  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "attempts" | "purchases" | "free_grants" | "activity" | "notes"
  >("overview");
  const [revealedEmail, setRevealedEmail] = useState<string | null>(null);

  // Action Modals State
  const [suspendModalOpen, setSuspendModalOpen] = useState<boolean>(false);
  const [suspendReason, setSuspendReason] = useState<string>("");
  const [grantQuizModalOpen, setGrantQuizModalOpen] = useState<boolean>(false);
  const [selectedQuizToGrant, setSelectedQuizToGrant] = useState<string>(
    "quiz-sliding-window",
  );
  const [grantReason, setGrantReason] = useState<string>("");
  const [resetGrantModalOpen, setResetGrantModalOpen] =
    useState<boolean>(false);
  const [selectedTopicToReset, setSelectedTopicToReset] =
    useState<string>("topic-dsa-1");
  const [resetReason, setResetReason] = useState<string>("");

  // Per-Question Breakdown Modal State
  const [breakdownModalOpen, setBreakdownModalOpen] = useState<boolean>(false);
  const [selectedAttempt, setSelectedAttempt] =
    useState<AdminUserAttemptItem | null>(null);
  const [breakdownQuestions, setBreakdownQuestions] = useState<
    AdminUserQuestionBreakdown[]
  >([]);
  const [loadingBreakdown, setLoadingBreakdown] = useState<boolean>(false);

  // New Note State
  const [newNoteText, setNewNoteText] = useState<string>("");
  const [submittingNote, setSubmittingNote] = useState<boolean>(false);

  const loadUserDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await client.adminUsers.getDetail(id);
      setUser(data);
    } catch (err) {
      console.error("Failed to load user detail:", err);
    } finally {
      setLoading(false);
    }
  }, [client, id]);

  useEffect(() => {
    loadUserDetail();
  }, [loadUserDetail]);

  // Support Masked Email
  const getDisplayEmail = () => {
    if (!user) return "";
    if (!isSupport || revealedEmail) return revealedEmail || user.email;
    const parts = user.email.split("@");
    if (parts.length !== 2) return user.email;
    const prefix = parts[0];
    const maskedPrefix =
      prefix.length > 2 ? `${prefix.substring(0, 2)}***` : "***";
    return `${maskedPrefix}@${parts[1]}`;
  };

  const handleRevealEmail = async () => {
    if (!id) return;
    try {
      const res = await client.adminUsers.revealEmail(id);
      setRevealedEmail(res.email);
    } catch (err) {
      console.error("Failed to reveal email:", err);
    }
  };

  // Suspend / Unsuspend Handler
  const handleToggleSuspend = async () => {
    if (!id || !user || !suspendReason.trim()) return;
    try {
      if (user.status === "active") {
        await client.adminUsers.suspend(id, { reason: suspendReason.trim() });
      } else {
        await client.adminUsers.unsuspend(id, { reason: suspendReason.trim() });
      }
      setSuspendModalOpen(false);
      setSuspendReason("");
      await loadUserDetail();
    } catch (err) {
      console.error("Failed to toggle suspend:", err);
    }
  };

  // Grant Quiz Handler
  const handleGrantQuiz = async () => {
    if (!id || !grantReason.trim()) return;
    try {
      await client.adminUsers.grantQuiz(id, {
        quiz_id: selectedQuizToGrant,
        reason: grantReason.trim(),
      });
      setGrantQuizModalOpen(false);
      setGrantReason("");
      await loadUserDetail();
    } catch (err) {
      console.error("Failed to grant quiz:", err);
    }
  };

  // Reset Free Grant Handler
  const handleResetFreeGrant = async () => {
    if (!id || !resetReason.trim()) return;
    try {
      await client.adminUsers.resetFreeGrant(id, {
        topic_id: selectedTopicToReset,
        reason: resetReason.trim(),
      });
      setResetGrantModalOpen(false);
      setResetReason("");
      await loadUserDetail();
    } catch (err) {
      console.error("Failed to reset grant:", err);
    }
  };

  // Open Attempt Breakdown Modal
  const handleOpenBreakdown = async (attempt: AdminUserAttemptItem) => {
    setSelectedAttempt(attempt);
    setBreakdownModalOpen(true);
    setLoadingBreakdown(true);
    try {
      if (id) {
        const questions = await client.adminUsers.getQuestionBreakdown(
          id,
          attempt.id,
        );
        setBreakdownQuestions(questions);
      }
    } catch (err) {
      console.error("Failed to load breakdown:", err);
    } finally {
      setLoadingBreakdown(false);
    }
  };

  // Add Note Handler
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newNoteText.trim() || submittingNote) return;
    setSubmittingNote(true);
    try {
      await client.adminUsers.addNote(id, { text: newNoteText.trim() });
      setNewNoteText("");
      await loadUserDetail();
    } catch (err) {
      console.error("Failed to add note:", err);
    } finally {
      setSubmittingNote(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-6xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded w-48" />
        <div className="h-40 bg-zinc-100 dark:bg-zinc-900 rounded-xl" />
        <div className="h-64 bg-zinc-100 dark:bg-zinc-900 rounded-xl" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-12 text-center space-y-4">
        <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          Learner Not Found
        </h2>
        <button
          onClick={() => navigate("/users")}
          className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 rounded-lg"
        >
          Return to Learner Directory
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Top Back Nav */}
      <button
        onClick={() => navigate("/users")}
        className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Learner Directory</span>
      </button>

      {/* ========================================================================= */}
      {/* User Header Card                                                          */}
      {/* ========================================================================= */}
      <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-2xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold text-xl flex items-center justify-center shadow-xs">
              {user.name?.charAt(0) || "U"}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                  {user.name || "Learner"}
                </h1>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide ${
                    user.status === "active"
                      ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                      : "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800"
                  }`}
                >
                  {user.status.toUpperCase()}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 capitalize">
                  {user.source}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                <div className="flex items-center gap-1.5 font-mono">
                  <span>{getDisplayEmail()}</span>
                  {isSupport && !revealedEmail && (
                    <button
                      onClick={handleRevealEmail}
                      title="Reveal email (audit logged)"
                      className="p-1 hover:text-indigo-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <span>•</span>
                <span className="font-mono text-[11px] text-zinc-400">
                  ID: {user.id}
                </span>
                <span>•</span>
                <span>
                  Joined {new Date(user.created_at).toLocaleDateString()}
                </span>
                <span>•</span>
                <span>
                  Last active{" "}
                  {user.last_seen_at
                    ? new Date(user.last_seen_at).toLocaleDateString()
                    : "Never"}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Suspend / Unsuspend */}
            <button
              onClick={() => setSuspendModalOpen(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
                user.status === "active"
                  ? "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800 hover:bg-rose-100"
                  : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100"
              }`}
            >
              {user.status === "active" ? (
                <>
                  <Ban className="w-3.5 h-3.5" />
                  <span>Suspend Learner</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Reactivate Learner</span>
                </>
              )}
            </button>

            {/* Grant Quiz */}
            <button
              onClick={() => setGrantQuizModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
            >
              <Gift className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Grant Quiz Access</span>
            </button>

            {/* Reset Free Grant */}
            <button
              onClick={() => setResetGrantModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
              <span>Reset Free Attempt</span>
            </button>
          </div>
        </div>

        {/* 6 Tabs Navigation */}
        <div className="flex items-center gap-1 border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto text-xs font-medium">
          {(
            [
              { key: "overview", label: "Overview", icon: BookOpen },
              {
                key: "attempts",
                label: `Attempts (${user.attempts.length})`,
                icon: Award,
              },
              {
                key: "purchases",
                label: `Purchases (${user.purchases.length})`,
                icon: DollarSign,
              },
              {
                key: "free_grants",
                label: `Free Grants (${user.free_grants.length})`,
                icon: Gift,
              },
              {
                key: "activity",
                label: `Activity (${user.activity.length})`,
                icon: Clock,
              },
              {
                key: "notes",
                label: `Admin Notes (${user.notes.length})`,
                icon: MessageSquare,
              },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-3.5 py-2.5 border-b-2 font-medium transition whitespace-nowrap ${
                  isActive
                    ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold"
                    : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* Tab 1: Overview                                                           */}
      {/* ========================================================================= */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
            <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-2xs">
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block">
                Total Attempts
              </span>
              <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100 font-mono mt-1 block">
                {user.attempts_count}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-2xs">
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block">
                Average Score
              </span>
              <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400 font-mono mt-1 block">
                {user.avg_score}%
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-2xs">
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block">
                Purchased Quizzes
              </span>
              <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100 font-mono mt-1 block">
                {user.quizzes_purchased}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-2xs">
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block">
                Lifetime Spent
              </span>
              <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-1 block">
                ${user.total_spent.toFixed(2)}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-2xs">
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block">
                Daily Streak
              </span>
              <span className="text-xl font-bold text-amber-500 font-mono mt-1 block">
                {user.streak_days} days 🔥
              </span>
            </div>
          </div>

          {/* Recent Activity Teaser */}
          <div className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-2xs space-y-3">
            <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
              Recent Activity Trail
            </h3>
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {user.activity.map((act) => (
                <div
                  key={act.id}
                  className="py-2.5 flex items-start justify-between text-xs"
                >
                  <div>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">
                      {act.title}
                    </span>
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      {act.description}
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400 font-mono shrink-0">
                    {new Date(act.timestamp).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* Tab 2: Attempts                                                           */}
      {/* ========================================================================= */}
      {activeTab === "attempts" && (
        <div className="rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                Completed Quiz Attempts
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Click any row to inspect question-by-question responses,
                mistakes, and explanations.
              </p>
            </div>
          </div>

          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-800/40 text-zinc-500 dark:text-zinc-400 font-semibold select-none">
                <th className="py-3 px-4">Quiz Title</th>
                <th className="py-3 px-4">Topic</th>
                <th className="py-3 px-4">Score</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Explanations</th>
                <th className="py-3 px-4">Completed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {user.attempts.map((att) => (
                <tr
                  key={att.id}
                  data-testid={`attempt-row-${att.id}`}
                  onClick={() => handleOpenBreakdown(att)}
                  className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer transition"
                >
                  <td
                    onClick={() => handleOpenBreakdown(att)}
                    className="py-3 px-4 font-semibold text-zinc-900 dark:text-zinc-100"
                  >
                    {att.quiz_title}
                  </td>
                  <td className="py-3 px-4 text-zinc-500 dark:text-zinc-400">
                    {att.topic_name}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {att.score} / {att.total_questions}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        att.is_free_attempt
                          ? "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400"
                          : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400"
                      }`}
                    >
                      {att.is_free_attempt ? "Free Grant" : "Paid Attempt"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {att.explanations_unlocked ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                        Unlocked
                      </span>
                    ) : (
                      <span className="text-zinc-400">Locked</span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
                    {att.completed_at
                      ? new Date(att.completed_at).toLocaleDateString()
                      : "In Progress"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ========================================================================= */}
      {/* Tab 3: Purchases                                                          */}
      {/* ========================================================================= */}
      {activeTab === "purchases" && (
        <div className="rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-2xs overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-800/40 text-zinc-500 dark:text-zinc-400 font-semibold">
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">Item</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Gateway Reference</th>
                <th className="py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {user.purchases.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-8 text-center text-zinc-400 dark:text-zinc-500"
                  >
                    No purchase transactions on file.
                  </td>
                </tr>
              ) : (
                user.purchases.map((p) => (
                  <tr key={p.id}>
                    <td className="py-3 px-4 font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
                      {p.id}
                    </td>
                    <td className="py-3 px-4 font-medium text-zinc-900 dark:text-zinc-100">
                      {p.item_title}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      ${p.amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          p.status === "completed"
                            ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400"
                            : p.status === "failed"
                              ? "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400"
                              : "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400"
                        }`}
                      >
                        {p.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
                      {p.payment_provider_ref}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ========================================================================= */}
      {/* Tab 4: Free Grants                                                        */}
      {/* ========================================================================= */}
      {activeTab === "free_grants" && (
        <div className="rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-2xs overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-800/40 text-zinc-500 dark:text-zinc-400 font-semibold">
                <th className="py-3 px-4">Topic Name</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Used Timestamp</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {user.free_grants.map((g) => (
                <tr key={g.topic_id}>
                  <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-zinc-100">
                    {g.topic_name}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        g.status === "available"
                          ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                      }`}
                    >
                      {g.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
                    {g.used_at
                      ? new Date(g.used_at).toLocaleDateString()
                      : "Not yet used"}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {g.status === "used" && (
                      <button
                        onClick={() => {
                          setSelectedTopicToReset(g.topic_id);
                          setResetGrantModalOpen(true);
                        }}
                        className="px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 rounded hover:bg-amber-100 transition"
                      >
                        Reset Attempt
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ========================================================================= */}
      {/* Tab 5: Activity Timeline                                                  */}
      {/* ========================================================================= */}
      {activeTab === "activity" && (
        <div className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-2xs space-y-4">
          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-200 dark:before:bg-zinc-800">
            {user.activity.map((act) => (
              <div key={act.id} className="relative space-y-1">
                <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-indigo-600 ring-4 ring-white dark:ring-zinc-900" />
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {act.title}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {new Date(act.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  {act.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* Tab 6: Admin Notes Thread                                                 */}
      {/* ========================================================================= */}
      {activeTab === "notes" && (
        <div className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-2xs space-y-6">
          {/* Add Note Form */}
          <form onSubmit={handleAddNote} className="space-y-2">
            <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 block">
              Add Internal Admin Note
            </label>
            <textarea
              rows={3}
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              placeholder="Record notes on support requests, suspected fraudulent behavior, or manual grants..."
              className="w-full p-3 text-xs bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 outline-none focus:border-indigo-600 focus:bg-white dark:focus:bg-zinc-900 transition"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submittingNote || !newNoteText.trim()}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Post Note</span>
              </button>
            </div>
          </form>

          {/* Notes Thread */}
          <div className="space-y-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            {user.notes.length === 0 ? (
              <span className="text-xs text-zinc-400 block py-4 text-center">
                No internal notes posted for this learner yet.
              </span>
            ) : (
              user.notes.map((n) => (
                <div
                  key={n.id}
                  className="p-3.5 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {n.admin_name}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400 uppercase">
                        ({n.admin_role})
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {new Date(n.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                    {n.text}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* Modal 1: Suspend / Unsuspend Confirmation                                  */}
      {/* ========================================================================= */}
      {suspendModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-100">
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-800 max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Ban className="w-4 h-4 text-rose-600" />
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
                  {user.status === "active"
                    ? "Confirm Account Suspension"
                    : "Confirm Account Reactivation"}
                </h3>
              </div>
              <button
                onClick={() => setSuspendModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              {user.status === "active"
                ? `Suspending ${user.name} will terminate active login sessions and block access to quiz attempts.`
                : `Reactivating ${user.name} will restore login access and allow quiz participation.`}
            </p>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Mandatory Reason (Audit Logged) *
              </label>
              <textarea
                rows={3}
                required
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="Explain why this action is being taken..."
                className="w-full p-2.5 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSuspendModalOpen(false)}
                className="px-3 py-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleToggleSuspend}
                disabled={!suspendReason.trim()}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition disabled:opacity-50"
              >
                Confirm{" "}
                {user.status === "active" ? "Suspension" : "Reactivation"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* Modal 2: Grant Quiz Access                                                */}
      {/* ========================================================================= */}
      {grantQuizModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-100">
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-800 max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-indigo-600" />
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
                  Grant Direct Quiz Access
                </h3>
              </div>
              <button
                onClick={() => setGrantQuizModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                  Select Quiz
                </label>
                <select
                  value={selectedQuizToGrant}
                  onChange={(e) => setSelectedQuizToGrant(e.target.value)}
                  className="w-full h-9 px-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 outline-none"
                >
                  <option value="quiz-sliding-window">
                    Sliding Window Mastery (Arrays & Two Pointers)
                  </option>
                  <option value="quiz-cache-design">
                    Distributed Caching (System Design)
                  </option>
                  <option value="quiz-concurrency-os">
                    Concurrency & OS Mutexes
                  </option>
                  <option value="quiz-dp-foundations">
                    Dynamic Programming Foundations
                  </option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                  Mandatory Reason *
                </label>
                <textarea
                  rows={2}
                  value={grantReason}
                  onChange={(e) => setGrantReason(e.target.value)}
                  placeholder="e.g. Compensatory access for payment failure, educational scholarship"
                  className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setGrantQuizModalOpen(false)}
                className="px-3 py-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleGrantQuiz}
                disabled={!grantReason.trim()}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition disabled:opacity-50"
              >
                Grant Access
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* Modal 3: Reset Free Topic Grant                                           */}
      {/* ========================================================================= */}
      {resetGrantModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-100">
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-800 max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-amber-500" />
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
                  Reset Free Topic Attempt
                </h3>
              </div>
              <button
                onClick={() => setResetGrantModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                  Select Topic
                </label>
                <select
                  value={selectedTopicToReset}
                  onChange={(e) => setSelectedTopicToReset(e.target.value)}
                  className="w-full h-9 px-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 outline-none"
                >
                  <option value="topic-dsa-1">Arrays & Two Pointers</option>
                  <option value="topic-sys-2">
                    System Design Fundamentals
                  </option>
                  <option value="topic-os-3">Concurrency & OS Concepts</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                  Mandatory Reason *
                </label>
                <textarea
                  rows={2}
                  value={resetReason}
                  onChange={(e) => setResetReason(e.target.value)}
                  placeholder="e.g. Browser crash during first attempt, accidental submit"
                  className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setResetGrantModalOpen(false)}
                className="px-3 py-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleResetFreeGrant}
                disabled={!resetReason.trim()}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition disabled:opacity-50"
              >
                Reset Grant
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* Modal 4: Per-Question Attempt Breakdown Modal                             */}
      {/* ========================================================================= */}
      {breakdownModalOpen && selectedAttempt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-100">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 px-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                  {selectedAttempt.quiz_title} — Response Breakdown
                </h3>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                  Final Score: {selectedAttempt.score} /{" "}
                  {selectedAttempt.total_questions} (
                  {Math.round(
                    (selectedAttempt.score / selectedAttempt.total_questions) *
                      100,
                  )}
                  %)
                </span>
              </div>
              <button
                onClick={() => setBreakdownModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {loadingBreakdown ? (
                <div className="py-12 text-center text-zinc-400">
                  Loading response details...
                </div>
              ) : (
                breakdownQuestions.map((q, idx) => (
                  <div
                    key={q.question_id}
                    className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">
                        {idx + 1}. {q.stem}
                      </span>
                      {q.is_correct ? (
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold shrink-0">
                          <CheckCircle2 className="w-4 h-4" />
                          Correct
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-semibold shrink-0">
                          <XCircle className="w-4 h-4" />
                          Incorrect
                        </span>
                      )}
                    </div>

                    {/* Options list */}
                    <div className="space-y-1.5 pl-2">
                      {q.options.map((opt, oIdx) => {
                        const isLearnerAnswer = q.user_answer_index === oIdx;
                        const isCorrectAnswer = q.correct_answer_index === oIdx;

                        return (
                          <div
                            key={oIdx}
                            className={`p-2 rounded-lg border text-xs flex items-center justify-between ${
                              isCorrectAnswer
                                ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 font-medium"
                                : isLearnerAnswer
                                  ? "bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-300 font-medium"
                                  : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400"
                            }`}
                          >
                            <span>{opt}</span>
                            <div className="flex items-center gap-1 text-[10px] font-mono">
                              {isLearnerAnswer && (
                                <span className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200">
                                  Learner Choice
                                </span>
                              )}
                              {isCorrectAnswer && (
                                <span className="px-1.5 py-0.5 rounded bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100">
                                  Correct Answer
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    <div className="p-2.5 rounded-lg bg-white dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 text-[11px] leading-relaxed">
                      <strong className="text-zinc-800 dark:text-zinc-200 block mb-0.5">
                        Explanation:
                      </strong>
                      {q.explanation}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
              <button
                onClick={() => setBreakdownModalOpen(false)}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition"
              >
                Close Breakdown
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
