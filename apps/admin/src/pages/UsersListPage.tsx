import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type {
  AdminUserListItem,
  AdminUsersListParams,
  AdminUsersSummaryChips,
} from "@fastquiz/shared";
import {
  Search,
  Filter,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Users,
  UserCheck,
  CreditCard,
  Ban,
  RotateCcw,
  ShieldAlert,
} from "lucide-react";

export const UsersListPage: React.FC = () => {
  const { user, client } = useAuth();
  const navigate = useNavigate();
  const role = user?.role || "reviewer";

  // Role Gate: Reviewers cannot access Users Directory
  const isReviewer = role === "reviewer";
  const canExportCsv = role === "super_admin" || role === "finance";
  const isSupport = role === "support";

  // State
  const [loading, setLoading] = useState<boolean>(true);
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [summary, setSummary] = useState<AdminUsersSummaryChips | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Filters
  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [status, setStatus] = useState<"all" | "active" | "suspended">("all");
  const [hasPurchased, setHasPurchased] = useState<"all" | "yes" | "no">("all");
  const [source, setSource] = useState<"all" | "email" | "google">("all");
  const [signupFrom, setSignupFrom] = useState<string>("");
  const [signupTo, setSignupTo] = useState<string>("");
  const [showFiltersModal, setShowFiltersModal] = useState<boolean>(false);

  // Sorting
  const [sortBy, setSortBy] = useState<
    "created_at" | "last_seen_at" | "total_spent" | "quizzes_purchased"
  >("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Support Email Reveal State (tracks unmasked user IDs)
  const [revealedEmails, setRevealedEmails] = useState<Record<string, string>>(
    {},
  );

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to page 1 on new search
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Load Users from Client
  const loadUsers = useCallback(async () => {
    if (isReviewer) return;
    setLoading(true);
    try {
      const params: AdminUsersListParams = {
        page,
        page_size: pageSize,
        search: debouncedSearch,
        status,
        has_purchased: hasPurchased,
        source,
        signup_from: signupFrom || undefined,
        signup_to: signupTo || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      };

      const res = await client.adminUsers.list(params);
      setUsers(res.items);
      setTotalCount(res.total);
      setSummary(res.summary);
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setLoading(false);
    }
  }, [
    client,
    isReviewer,
    page,
    pageSize,
    debouncedSearch,
    status,
    hasPurchased,
    source,
    signupFrom,
    signupTo,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Sorting Handler
  const handleSort = (
    col: "created_at" | "last_seen_at" | "total_spent" | "quizzes_purchased",
  ) => {
    if (sortBy === col) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(col);
      setSortOrder("desc");
    }
    setPage(1);
  };

  // Support Masked Email Helper
  const getDisplayEmail = (userId: string, email: string) => {
    if (!isSupport) return email;
    if (revealedEmails[userId]) return revealedEmails[userId];
    const parts = email.split("@");
    if (parts.length !== 2) return email;
    const prefix = parts[0];
    const maskedPrefix =
      prefix.length > 2 ? `${prefix.substring(0, 2)}***` : "***";
    return `${maskedPrefix}@${parts[1]}`;
  };

  // Reveal Masked Email for Support
  const handleRevealEmail = async (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    try {
      const res = await client.adminUsers.revealEmail(userId);
      setRevealedEmails((prev) => ({ ...prev, [userId]: res.email }));
    } catch (err) {
      console.error("Failed to reveal email:", err);
    }
  };

  // CSV Export
  const handleExportCsv = async () => {
    try {
      const csvData = await client.adminUsers.exportCsv({
        search: debouncedSearch,
        status,
        has_purchased: hasPurchased,
        source,
        signup_from: signupFrom || undefined,
        signup_to: signupTo || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      });

      const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `fastquiz_learners_${new Date().toISOString().split("T")[0]}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("CSV export failed:", err);
    }
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setStatus("all");
    setHasPurchased("all");
    setSource("all");
    setSignupFrom("");
    setSignupTo("");
    setPage(1);
  };

  if (isReviewer) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
          Access Restricted
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Your account role (
          <strong className="font-semibold text-zinc-700 dark:text-zinc-300">
            Content Reviewer
          </strong>
          ) is restricted to question moderation and content hierarchy tools.
          Contact an administrator to request elevated permissions.
        </p>
        <button
          onClick={() => navigate("/review")}
          className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition"
        >
          Return to Review Queue
        </button>
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* ========================================================================= */}
      {/* Header & Export Action                                                    */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Learner Accounts Directory
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Search, filter, inspect quiz attempts, manage suspensions, and audit
            purchases.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canExportCsv ? (
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 shadow-2xs transition"
            >
              <Download className="w-3.5 h-3.5 text-zinc-500" />
              <span>Export Filtered CSV</span>
            </button>
          ) : (
            <span
              title="CSV export restricted to Super Admin & Finance roles"
              className="px-3 py-1.5 text-xs text-zinc-400 bg-zinc-100 dark:bg-zinc-800/60 rounded-lg cursor-not-allowed border border-zinc-200 dark:border-zinc-700"
            >
              CSV Export Restricted
            </span>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* Summary KPI Chips                                                         */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-2xs flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block">
              Total Registered
            </span>
            <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100 font-mono">
              {summary ? summary.total_registered.toLocaleString() : "—"}
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-2xs flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block">
              30d Active Users
            </span>
            <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100 font-mono">
              {summary ? summary.active_30d.toLocaleString() : "—"}
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-2xs flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
            <CreditCard className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block">
              Paying Customers
            </span>
            <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100 font-mono">
              {summary ? summary.paying_customers.toLocaleString() : "—"}
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-2xs flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <Ban className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block">
              Suspended
            </span>
            <span className="text-lg font-bold text-rose-600 dark:text-rose-400 font-mono">
              {summary ? summary.suspended.toLocaleString() : "—"}
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* Search & Filter Bar                                                       */}
      {/* ========================================================================= */}
      <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or user UUID..."
              className="w-full h-9 pl-9 pr-4 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 bg-zinc-50/60 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:border-indigo-600 focus:bg-white dark:focus:bg-zinc-900 outline-none transition"
            />
          </div>

          {/* Quick Dropdown: Status */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as "all" | "active" | "suspended");
              setPage(1);
            }}
            className="h-9 px-3 text-xs bg-zinc-50/60 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-700 dark:text-zinc-300 outline-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="suspended">Suspended Only</option>
          </select>

          {/* Quick Dropdown: Purchased */}
          <select
            value={hasPurchased}
            onChange={(e) => {
              setHasPurchased(e.target.value as "all" | "yes" | "no");
              setPage(1);
            }}
            className="h-9 px-3 text-xs bg-zinc-50/60 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-700 dark:text-zinc-300 outline-none cursor-pointer"
          >
            <option value="all">All Purchases</option>
            <option value="yes">Paying Customers (Yes)</option>
            <option value="no">Free Attempt Only (No)</option>
          </select>

          {/* Source dropdown */}
          <select
            value={source}
            onChange={(e) => {
              setSource(e.target.value as "all" | "email" | "google");
              setPage(1);
            }}
            className="h-9 px-3 text-xs bg-zinc-50/60 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-700 dark:text-zinc-300 outline-none cursor-pointer"
          >
            <option value="all">All Auth Sources</option>
            <option value="google">Google OAuth</option>
            <option value="email">Email / Password</option>
          </select>

          <button
            onClick={() => setShowFiltersModal(!showFiltersModal)}
            className={`flex items-center gap-1.5 px-3 h-9 text-xs font-medium rounded-lg border transition ${
              signupFrom || signupTo
                ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800"
                : "bg-zinc-50/60 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100"
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Dates</span>
          </button>

          {(search ||
            status !== "all" ||
            hasPurchased !== "all" ||
            source !== "all" ||
            signupFrom ||
            signupTo) && (
            <button
              onClick={handleResetFilters}
              title="Reset all filters"
              className="flex items-center gap-1 px-2.5 h-9 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Date Filter Expander */}
        {showFiltersModal && (
          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center gap-4 text-xs animate-in fade-in duration-100">
            <div className="flex items-center gap-2">
              <span className="text-zinc-500 dark:text-zinc-400 font-medium">
                Joined Between:
              </span>
              <input
                type="date"
                value={signupFrom}
                onChange={(e) => {
                  setSignupFrom(e.target.value);
                  setPage(1);
                }}
                className="h-8 px-2 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none"
              />
              <span className="text-zinc-400">and</span>
              <input
                type="date"
                value={signupTo}
                onChange={(e) => {
                  setSignupTo(e.target.value);
                  setPage(1);
                }}
                className="h-8 px-2 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* Users Data Table                                                          */}
      {/* ========================================================================= */}
      <div className="rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-800/40 text-zinc-500 dark:text-zinc-400 font-semibold select-none">
                <th className="py-3 px-4">Learner</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Source</th>
                <th
                  onClick={() => handleSort("quizzes_purchased")}
                  className="py-3 px-4 cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100 transition"
                >
                  <div className="flex items-center gap-1">
                    <span>Purchases</span>
                    {sortBy === "quizzes_purchased" ? (
                      sortOrder === "asc" ? (
                        <ArrowUp className="w-3 h-3 text-indigo-600" />
                      ) : (
                        <ArrowDown className="w-3 h-3 text-indigo-600" />
                      )
                    ) : (
                      <ArrowUpDown className="w-3 h-3 opacity-40" />
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("total_spent")}
                  className="py-3 px-4 cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100 transition"
                >
                  <div className="flex items-center gap-1">
                    <span>Total Spent</span>
                    {sortBy === "total_spent" ? (
                      sortOrder === "asc" ? (
                        <ArrowUp className="w-3 h-3 text-indigo-600" />
                      ) : (
                        <ArrowDown className="w-3 h-3 text-indigo-600" />
                      )
                    ) : (
                      <ArrowUpDown className="w-3 h-3 opacity-40" />
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("last_seen_at")}
                  className="py-3 px-4 cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100 transition"
                >
                  <div className="flex items-center gap-1">
                    <span>Last Active</span>
                    {sortBy === "last_seen_at" ? (
                      sortOrder === "asc" ? (
                        <ArrowUp className="w-3 h-3 text-indigo-600" />
                      ) : (
                        <ArrowDown className="w-3 h-3 text-indigo-600" />
                      )
                    ) : (
                      <ArrowUpDown className="w-3 h-3 opacity-40" />
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("created_at")}
                  className="py-3 px-4 cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100 transition"
                >
                  <div className="flex items-center gap-1">
                    <span>Joined Date</span>
                    {sortBy === "created_at" ? (
                      sortOrder === "asc" ? (
                        <ArrowUp className="w-3 h-3 text-indigo-600" />
                      ) : (
                        <ArrowDown className="w-3 h-3 text-indigo-600" />
                      )
                    ) : (
                      <ArrowUpDown className="w-3 h-3 opacity-40" />
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={8} className="py-4 px-4">
                      <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded w-full" />
                    </td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-zinc-400">
                    No learners match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr
                    key={u.id}
                    onClick={() => navigate(`/users/${u.id}`)}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer transition"
                  >
                    {/* Learner Name & ID */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs">
                          {u.name.charAt(0)}
                        </div>
                        <div className="truncate max-w-[140px]">
                          <span className="font-semibold text-zinc-900 dark:text-zinc-100 block truncate">
                            {u.name}
                          </span>
                          <span className="font-mono text-[10px] text-zinc-400 block truncate">
                            {u.id}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Email with Support Mask & Reveal */}
                    <td className="py-3.5 px-4 font-mono text-zinc-600 dark:text-zinc-300">
                      <div className="flex items-center gap-2">
                        <span>{getDisplayEmail(u.id, u.email)}</span>
                        {isSupport && !revealedEmails[u.id] && (
                          <button
                            onClick={(e) => handleRevealEmail(e, u.id)}
                            title="Reveal full email (Audit logged)"
                            className="p-1 rounded text-zinc-400 hover:text-indigo-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          u.status === "active"
                            ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                            : "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800"
                        }`}
                      >
                        {u.status.toUpperCase()}
                      </span>
                    </td>

                    {/* Source */}
                    <td className="py-3.5 px-4">
                      <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400 capitalize">
                        {u.source}
                      </span>
                    </td>

                    {/* Purchases Count */}
                    <td className="py-3.5 px-4 font-mono text-zinc-700 dark:text-zinc-300">
                      {u.quizzes_purchased > 0 ? (
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                          {u.quizzes_purchased} paid
                        </span>
                      ) : (
                        <span className="text-zinc-400">0</span>
                      )}
                    </td>

                    {/* Total Spent */}
                    <td className="py-3.5 px-4 font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                      ${u.total_spent.toFixed(2)}
                    </td>

                    {/* Last Active */}
                    <td className="py-3.5 px-4 text-zinc-500 dark:text-zinc-400 font-mono text-[11px]">
                      {u.last_seen_at
                        ? new Date(u.last_seen_at).toLocaleDateString()
                        : "Never"}
                    </td>

                    {/* Joined Date */}
                    <td className="py-3.5 px-4 text-zinc-500 dark:text-zinc-400 font-mono text-[11px]">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="py-3 px-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="h-7 px-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-zinc-800 dark:text-zinc-200 outline-none"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span>
              Showing {totalCount === 0 ? 0 : (page - 1) * pageSize + 1} -{" "}
              {Math.min(page * pageSize, totalCount)} of {totalCount} learners
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 disabled:opacity-40 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono px-2">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 disabled:opacity-40 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
