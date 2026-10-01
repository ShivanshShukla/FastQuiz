import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type {
  AdminDashboardDateRange,
  AdminDashboardSummary,
  AdminTimeseriesData,
  AdminFunnelData,
  AdminTopQuizItem,
  AdminAttentionItem,
  AdminRecentSignup,
  AdminRecentPurchase,
  AdminAuditActivityItem,
} from "@fastquiz/shared";
import {
  TrendingUp,
  TrendingDown,
  Users,
  UserCheck,
  DollarSign,
  Award,
  AlertTriangle,
  Calendar,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  FileCheck,
  Activity,
  Flame,
  XCircle,
} from "lucide-react";

export const DashboardPage: React.FC = () => {
  const { user, client } = useAuth();
  const navigate = useNavigate();
  const role = user?.role || "reviewer";

  const [dateRange, setDateRange] = useState<AdminDashboardDateRange>("7d");
  const [customFrom, setCustomFrom] = useState<string>("");
  const [customTo, setCustomTo] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [topQuizzesMetric, setTopQuizzesMetric] = useState<
    "revenue" | "attempts"
  >("revenue");

  // Dashboard Data State
  const [summary, setSummary] = useState<AdminDashboardSummary | null>(null);
  const [timeseries, setTimeseries] = useState<AdminTimeseriesData | null>(
    null,
  );
  const [funnel, setFunnel] = useState<AdminFunnelData | null>(null);
  const [topQuizzes, setTopQuizzes] = useState<AdminTopQuizItem[]>([]);
  const [attentionItems, setAttentionItems] = useState<AdminAttentionItem[]>(
    [],
  );
  const [recentSignups, setRecentSignups] = useState<AdminRecentSignup[]>([]);
  const [recentPurchases, setRecentPurchases] = useState<AdminRecentPurchase[]>(
    [],
  );
  const [recentAudit, setRecentAudit] = useState<AdminAuditActivityItem[]>([]);

  // Hover state for interactive SVG charts
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(
    null,
  );
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [
        sumRes,
        timeRes,
        funnelRes,
        topQuizzesRes,
        attRes,
        signupsRes,
        purchasesRes,
        auditRes,
      ] = await Promise.all([
        client.adminDashboard.getSummary(dateRange, customFrom, customTo),
        client.adminDashboard.getTimeseries(dateRange, customFrom, customTo),
        client.adminDashboard.getFunnel(dateRange, customFrom, customTo),
        client.adminDashboard.getTopQuizzes(topQuizzesMetric, 5),
        client.adminDashboard.getAttention(),
        client.adminDashboard.getRecentSignups(6),
        client.adminDashboard.getRecentPurchases(6),
        client.adminDashboard.getRecentAuditActivity(5),
      ]);

      setSummary(sumRes);
      setTimeseries(timeRes);
      setFunnel(funnelRes);
      setTopQuizzes(Array.isArray(topQuizzesRes) ? topQuizzesRes : []);
      setAttentionItems(Array.isArray(attRes?.items) ? attRes.items : []);
      setRecentSignups(Array.isArray(signupsRes) ? signupsRes : []);
      setRecentPurchases(Array.isArray(purchasesRes) ? purchasesRes : []);
      setRecentAudit(Array.isArray(auditRes) ? auditRes : []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load dashboard metrics",
      );
    } finally {
      setLoading(false);
    }
  }, [client, dateRange, customFrom, customTo, topQuizzesMetric]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // Auto-refresh timer: 60s
  useEffect(() => {
    const timer = setInterval(() => {
      loadDashboard();
    }, 60000);
    return () => clearInterval(timer);
  }, [loadDashboard]);

  // Currency Formatter
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Delta Pill Helper
  const renderDelta = (delta: number) => {
    const isPos = delta >= 0;
    return (
      <span
        className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] font-semibold ${
          isPos
            ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400"
            : "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400"
        }`}
      >
        {isPos ? (
          <TrendingUp className="w-3 h-3" />
        ) : (
          <TrendingDown className="w-3 h-3" />
        )}
        {isPos ? `+${delta}%` : `${delta}%`}
      </span>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* ========================================================================= */}
      {/* Top Header & Range Controls                                               */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Welcome back, {user?.name || "Administrator"}
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              {role.toUpperCase()}
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Real-time learner activity, content quality queue, and financial
            velocity.
          </p>
        </div>

        {/* Date Range Selector & Refresh */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-0.5 shadow-2xs">
            {(
              ["today", "7d", "30d", "custom"] as AdminDashboardDateRange[]
            ).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition ${
                  dateRange === range
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                }`}
              >
                {range === "today"
                  ? "Today"
                  : range === "7d"
                    ? "7 Days"
                    : range === "30d"
                      ? "30 Days"
                      : "Custom"}
              </button>
            ))}
          </div>

          {dateRange === "custom" && (
            <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1 text-xs">
              <Calendar className="w-3.5 h-3.5 text-zinc-400" />
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="bg-transparent text-xs text-zinc-900 dark:text-zinc-100 outline-none"
              />
              <span className="text-zinc-400">to</span>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="bg-transparent text-xs text-zinc-900 dark:text-zinc-100 outline-none"
              />
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center justify-between text-xs text-rose-700 dark:text-rose-300">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => loadDashboard()}
            className="px-2.5 py-1 rounded bg-rose-600 text-white font-medium hover:bg-rose-700 transition"
          >
            Retry
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 10 Stat Cards Deck                                                        */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Registered Learners */}
        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-2xs hover:border-zinc-300 dark:hover:border-zinc-700 transition">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
            <span className="text-xs font-medium">Registered Users</span>
            <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight font-mono">
              {loading
                ? "—"
                : (summary?.registered_users ?? 0).toLocaleString()}
            </span>
            {summary && renderDelta(summary.registered_users_delta ?? 0)}
          </div>
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 block">
            Total learner accounts
          </span>
        </div>

        {/* Card 2: DAU */}
        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-2xs hover:border-zinc-300 dark:hover:border-zinc-700 transition">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
            <span className="text-xs font-medium">Active (DAU)</span>
            <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight font-mono">
              {loading ? "—" : (summary?.active_dau ?? 0).toLocaleString()}
            </span>
            {summary && renderDelta(summary.active_dau_delta ?? 0)}
          </div>
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 block">
            WAU: {summary?.active_wau ?? 0} • MAU: {summary?.active_mau ?? 0}
          </span>
        </div>

        {/* Card 3: New Signups */}
        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-2xs hover:border-zinc-300 dark:hover:border-zinc-700 transition">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
            <span className="text-xs font-medium">New Signups</span>
            <UserCheck className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight font-mono">
              {loading ? "—" : (summary?.new_signups ?? 0).toLocaleString()}
            </span>
            {summary && renderDelta(summary.new_signups_delta ?? 0)}
          </div>
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 block">
            In selected {dateRange} range
          </span>
        </div>

        {/* Card 4: Paying Users */}
        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-2xs hover:border-zinc-300 dark:hover:border-zinc-700 transition">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
            <span className="text-xs font-medium">Paying Customers</span>
            <CreditCard className="w-4 h-4 text-violet-600 dark:text-violet-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight font-mono">
              {loading ? "—" : (summary?.paying_users ?? 0).toLocaleString()}
            </span>
            {summary && renderDelta(summary.paying_users_delta ?? 0)}
          </div>
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 block">
            Completed purchase count
          </span>
        </div>

        {/* Card 5: Free->Paid Conversion */}
        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-2xs hover:border-zinc-300 dark:hover:border-zinc-700 transition">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
            <span className="text-xs font-medium">Free→Paid Conv.</span>
            <Flame className="w-4 h-4 text-amber-500 dark:text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight font-mono">
              {loading ? "—" : `${summary?.free_to_paid_conversion ?? 0}%`}
            </span>
            {summary && renderDelta(summary.free_to_paid_delta ?? 0)}
          </div>
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 block">
            Free attempt to checkout
          </span>
        </div>

        {/* Card 6: Revenue (Finance Highlight) */}
        <div
          className={`p-4 rounded-xl bg-white dark:bg-zinc-900 border shadow-2xs transition ${
            role === "finance"
              ? "border-indigo-500/80 ring-1 ring-indigo-500/50 dark:border-indigo-400"
              : "border-zinc-200/90 dark:border-zinc-800"
          }`}
        >
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
            <span className="text-xs font-medium">Gross Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight font-mono">
              {loading ? "—" : formatCurrency(summary?.revenue ?? 0)}
            </span>
            {summary && renderDelta(summary.revenue_delta ?? 0)}
          </div>
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 block">
            Net completed purchases
          </span>
        </div>

        {/* Card 7: Attempts Completed */}
        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-2xs hover:border-zinc-300 dark:hover:border-zinc-700 transition">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
            <span className="text-xs font-medium">Quiz Attempts</span>
            <Award className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight font-mono">
              {loading
                ? "—"
                : (summary?.attempts_completed ?? 0).toLocaleString()}
            </span>
            {summary && renderDelta(summary.attempts_delta ?? 0)}
          </div>
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 block">
            Started: {summary?.attempts_started ?? 0}
          </span>
        </div>

        {/* Card 8: Pending Reviews (Reviewer Highlight) */}
        <div
          onClick={() => navigate("/review")}
          className={`p-4 rounded-xl bg-white dark:bg-zinc-900 border shadow-2xs cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-600 transition ${
            role === "reviewer"
              ? "border-indigo-500/80 ring-1 ring-indigo-500/50 dark:border-indigo-400"
              : "border-zinc-200/90 dark:border-zinc-800"
          }`}
        >
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
            <span className="text-xs font-medium">Pending Review</span>
            <FileCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-amber-600 dark:text-amber-400 tracking-tight font-mono">
              {loading ? "—" : (summary?.pending_reviews ?? 0)}
            </span>
            <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded">
              Action Req
            </span>
          </div>
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 block">
            Questions in queue
          </span>
        </div>

        {/* Card 9: Failed Purchases */}
        <div
          onClick={() => navigate("/purchases?status=failed")}
          className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-2xs cursor-pointer hover:border-rose-400 transition"
        >
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
            <span className="text-xs font-medium">Failed Orders</span>
            <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-rose-600 dark:text-rose-400 tracking-tight font-mono">
              {loading ? "—" : (summary?.failed_purchases ?? 0)}
            </span>
            <span className="text-[11px] font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-1.5 py-0.5 rounded">
              Check
            </span>
          </div>
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 block">
            Declined payments
          </span>
        </div>

        {/* Card 10: Open Reports */}
        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-2xs hover:border-zinc-300 dark:hover:border-zinc-700 transition">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
            <span className="text-xs font-medium">Open Reports</span>
            <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight font-mono">
              {loading ? "—" : (summary?.open_reports ?? 0)}
            </span>
            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
              Stable
            </span>
          </div>
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 block">
            Learner feedback flags
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* Charts Section: Line Chart (Signups/Active) & Bar Chart (Revenue)         */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Reactive SVG Line Chart — Signups vs Active Users */}
        <div className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                User Velocity & Engagement
              </h2>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Daily new accounts vs active learners
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                Signups
              </span>
              <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Active Learners
              </span>
            </div>
          </div>

          {/* SVG Line Chart */}
          <div className="h-60 w-full relative select-none">
            {timeseries &&
            Array.isArray(timeseries.points) &&
            timeseries.points.length > 0 ? (
              (() => {
                const pts = timeseries.points;
                const width = 500;
                const height = 220;
                const padding = 30;

                const maxActive = Math.max(
                  ...pts.map((p) => p.active_users || 0),
                  20,
                );
                const maxSignups = Math.max(
                  ...pts.map((p) => p.signups || 0),
                  5,
                );
                const scaleY = (val: number, max: number) =>
                  height -
                  padding -
                  (val / (max || 1)) * (height - padding * 2);

                const stepX =
                  (width - padding * 2) / Math.max(1, pts.length - 1);

                // Coordinates
                const activeCoords = pts.map((p, i) => ({
                  x: padding + i * stepX,
                  y: scaleY(p.active_users || 0, maxActive),
                }));

                const signupCoords = pts.map((p, i) => ({
                  x: padding + i * stepX,
                  y: scaleY(p.signups || 0, maxSignups * 2.5), // Scale appropriately
                }));

                const activePath = activeCoords.reduce(
                  (acc, c, i) =>
                    i === 0 ? `M ${c.x} ${c.y}` : `${acc} L ${c.x} ${c.y}`,
                  "",
                );

                const signupPath = signupCoords.reduce(
                  (acc, c, i) =>
                    i === 0 ? `M ${c.x} ${c.y}` : `${acc} L ${c.x} ${c.y}`,
                  "",
                );

                return (
                  <svg
                    viewBox={`0 0 ${width} ${height}`}
                    className="w-full h-full overflow-visible"
                    preserveAspectRatio="none"
                  >
                    {/* Horizontal Grid lines */}
                    {[0, 0.33, 0.66, 1].map((ratio) => {
                      const y =
                        height - padding - ratio * (height - padding * 2);
                      return (
                        <line
                          key={ratio}
                          x1={padding}
                          y1={y}
                          x2={width - padding}
                          y2={y}
                          stroke="currentColor"
                          className="text-zinc-100 dark:text-zinc-800"
                          strokeDasharray="4 4"
                          strokeWidth="1"
                        />
                      );
                    })}

                    {/* Active Learners Line (Emerald) */}
                    <path
                      d={activePath}
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Signups Line (Indigo) */}
                    <path
                      d={signupPath}
                      fill="none"
                      stroke="#6366f1"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Interactive Points */}
                    {pts.map((p, i) => {
                      const cAct = activeCoords[i];
                      const cSig = signupCoords[i];
                      const isHovered = hoveredPointIndex === i;

                      return (
                        <g key={i}>
                          {/* Signups node */}
                          <circle
                            cx={cSig.x}
                            cy={cSig.y}
                            r={isHovered ? 5 : 3.5}
                            fill="#6366f1"
                            className="transition-all cursor-pointer"
                            onMouseEnter={() => setHoveredPointIndex(i)}
                            onMouseLeave={() => setHoveredPointIndex(null)}
                          />

                          {/* Active node */}
                          <circle
                            cx={cAct.x}
                            cy={cAct.y}
                            r={isHovered ? 5 : 3.5}
                            fill="#10b981"
                            className="transition-all cursor-pointer"
                            onMouseEnter={() => setHoveredPointIndex(i)}
                            onMouseLeave={() => setHoveredPointIndex(null)}
                          />

                          {/* Date Label on X axis */}
                          {(i === 0 ||
                            i === Math.floor(pts.length / 2) ||
                            i === pts.length - 1) && (
                            <text
                              x={cAct.x}
                              y={height - 8}
                              textAnchor="middle"
                              className="fill-zinc-400 text-[10px] font-mono"
                            >
                              {p.date}
                            </text>
                          )}
                        </g>
                      );
                    })}
                  </svg>
                );
              })()
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-zinc-400">
                No timeseries points recorded
              </div>
            )}

            {/* Hover Tooltip Popup */}
            {hoveredPointIndex !== null &&
              timeseries &&
              timeseries.points &&
              timeseries.points[hoveredPointIndex] && (
                <div className="absolute top-2 right-4 bg-zinc-900/90 dark:bg-zinc-800/95 text-white text-xs px-3 py-2 rounded-lg shadow-lg border border-zinc-700 pointer-events-none animate-in fade-in duration-100">
                  <span className="font-mono text-[10px] text-zinc-400 block mb-1">
                    {timeseries.points[hoveredPointIndex].date}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-indigo-400 font-semibold">
                      Signups:{" "}
                      {timeseries.points[hoveredPointIndex].signups ?? 0}
                    </span>
                    <span className="text-emerald-400 font-semibold">
                      Active:{" "}
                      {timeseries.points[hoveredPointIndex].active_users ?? 0}
                    </span>
                  </div>
                </div>
              )}
          </div>
        </div>

        {/* Chart 2: Reactive SVG Bar Chart — Revenue Breakdown */}
        <div className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Revenue Trajectory
              </h2>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Daily completed purchase income ($ USD)
              </p>
            </div>
            <span className="font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
              Total: {formatCurrency(summary?.revenue || 0)}
            </span>
          </div>

          {/* SVG Bar Chart */}
          <div className="h-60 w-full relative select-none">
            {timeseries &&
            Array.isArray(timeseries.points) &&
            timeseries.points.length > 0 ? (
              (() => {
                const pts = timeseries.points;
                const width = 500;
                const height = 220;
                const padding = 30;
                const maxRev = Math.max(...pts.map((p) => p.revenue || 0), 100);

                const barWidth = Math.max(
                  8,
                  Math.min(28, (width - padding * 2) / pts.length - 8),
                );
                const stepX = (width - padding * 2) / pts.length;

                return (
                  <svg
                    viewBox={`0 0 ${width} ${height}`}
                    className="w-full h-full overflow-visible"
                    preserveAspectRatio="none"
                  >
                    {/* Horizontal Grid lines */}
                    {[0, 0.33, 0.66, 1].map((ratio) => {
                      const y =
                        height - padding - ratio * (height - padding * 2);
                      return (
                        <line
                          key={ratio}
                          x1={padding}
                          y1={y}
                          x2={width - padding}
                          y2={y}
                          stroke="currentColor"
                          className="text-zinc-100 dark:text-zinc-800"
                          strokeDasharray="4 4"
                          strokeWidth="1"
                        />
                      );
                    })}

                    {/* Bars */}
                    {pts.map((p, i) => {
                      const barHeight =
                        ((p.revenue || 0) / maxRev) * (height - padding * 2);
                      const x = padding + i * stepX + (stepX - barWidth) / 2;
                      const y = height - padding - barHeight;
                      const isHovered = hoveredBarIndex === i;

                      return (
                        <g key={i}>
                          <rect
                            x={x}
                            y={y}
                            width={barWidth}
                            height={Math.max(2, barHeight)}
                            rx="3"
                            fill={isHovered ? "#4f46e5" : "#6366f1"}
                            className="transition-colors cursor-pointer"
                            onMouseEnter={() => setHoveredBarIndex(i)}
                            onMouseLeave={() => setHoveredBarIndex(null)}
                          />
                          {(i === 0 ||
                            i === Math.floor(pts.length / 2) ||
                            i === pts.length - 1) && (
                            <text
                              x={x + barWidth / 2}
                              y={height - 8}
                              textAnchor="middle"
                              className="fill-zinc-400 text-[10px] font-mono"
                            >
                              {p.date}
                            </text>
                          )}
                        </g>
                      );
                    })}
                  </svg>
                );
              })()
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-zinc-400">
                No revenue points recorded
              </div>
            )}

            {/* Hover Tooltip for Bars */}
            {hoveredBarIndex !== null &&
              timeseries &&
              timeseries.points &&
              timeseries.points[hoveredBarIndex] && (
                <div className="absolute top-2 right-4 bg-zinc-900/90 dark:bg-zinc-800/95 text-white text-xs px-3 py-2 rounded-lg shadow-lg border border-zinc-700 pointer-events-none animate-in fade-in duration-100">
                  <span className="font-mono text-[10px] text-zinc-400 block mb-0.5">
                    {timeseries.points[hoveredBarIndex].date}
                  </span>
                  <span className="text-emerald-400 font-bold text-sm">
                    {formatCurrency(
                      timeseries.points[hoveredBarIndex].revenue || 0,
                    )}
                  </span>
                </div>
              )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* Funnel & Top Quizzes Row                                                  */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversion Funnel (1 col) */}
        <div className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Free-to-Paid Conversion Funnel
            </h2>
            <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 font-mono">
              {summary?.free_to_paid_conversion ?? 0}% overall
            </span>
          </div>

          <div className="space-y-4 pt-1">
            {funnel &&
            Array.isArray(funnel.steps) &&
            funnel.steps.length > 0 ? (
              funnel.steps.map((step, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">
                      {idx + 1}.{" "}
                      {step.name ||
                        (step as unknown as { step?: string }).step ||
                        "Step"}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-zinc-500 dark:text-zinc-400">
                        {(step.count ?? 0).toLocaleString()}
                      </span>
                      <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100 text-[11px]">
                        {step.percentage ?? 0}%
                      </span>
                    </div>
                  </div>

                  {/* Progress track */}
                  <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        idx === 0
                          ? "bg-indigo-600"
                          : idx === 1
                            ? "bg-indigo-500"
                            : idx === 2
                              ? "bg-indigo-400"
                              : "bg-emerald-500"
                      }`}
                      style={{
                        width: `${Math.min(100, Math.max(0, step.percentage ?? 0))}%`,
                      }}
                    />
                  </div>

                  {idx < funnel.steps.length - 1 && (
                    <div className="flex items-center justify-end text-[10px] text-zinc-400 font-mono">
                      Drop-off:{" "}
                      {step.count > 0
                        ? (
                            100 -
                            ((funnel.steps[idx + 1]?.count ?? 0) / step.count) *
                              100
                          ).toFixed(1)
                        : "0.0"}
                      %
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-zinc-400 text-xs">
                No funnel data available.
              </div>
            )}
          </div>
        </div>

        {/* Top 5 Quizzes (2 cols) */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Top Performing Quizzes
              </h2>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Ranked by customer demand and completion rates
              </p>
            </div>

            <div className="inline-flex rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 p-0.5 text-xs">
              <button
                onClick={() => setTopQuizzesMetric("revenue")}
                className={`px-2.5 py-1 font-medium rounded-md transition ${
                  topQuizzesMetric === "revenue"
                    ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xs"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                By Revenue
              </button>
              <button
                onClick={() => setTopQuizzesMetric("attempts")}
                className={`px-2.5 py-1 font-medium rounded-md transition ${
                  topQuizzesMetric === "attempts"
                    ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xs"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                By Attempts
              </button>
            </div>
          </div>

          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {(topQuizzes || []).length === 0 ? (
              <div className="p-8 text-center text-zinc-400 text-xs">
                No quiz activity recorded yet.
              </div>
            ) : (
              topQuizzes.map((quiz, i) => (
                <div
                  key={
                    quiz.id ||
                    (quiz as unknown as { quiz_id?: string }).quiz_id ||
                    i
                  }
                  className="py-3 flex items-center justify-between gap-4 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40 px-2 rounded-lg transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-5 font-mono text-xs font-bold text-zinc-400 shrink-0">
                      #{i + 1}
                    </span>
                    <div className="truncate">
                      <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 block truncate">
                        {quiz.title}
                      </span>
                      <span className="text-[10px] text-zinc-400 block truncate">
                        {quiz.topic_name}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 shrink-0 text-right">
                    <div>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono block">
                        {formatCurrency(quiz.revenue || 0)}
                      </span>
                      <span className="text-[10px] text-zinc-400 block">
                        {(
                          quiz.attempts ??
                          (quiz as unknown as { attempts_count?: number })
                            .attempts_count ??
                          0
                        ).toLocaleString()}{" "}
                        attempts
                      </span>
                    </div>

                    <div className="w-20 hidden sm:block">
                      <div className="flex justify-between text-[10px] text-zinc-500 mb-1">
                        <span>Completion</span>
                        <span className="font-mono font-semibold">
                          {quiz.completion_rate ?? 0}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full"
                          style={{ width: `${quiz.completion_rate ?? 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* Feeds Section: Needs Attention Hub & Recent Activity                      */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Needs Attention Alert Hub (1 col) */}
        <div className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="w-4 h-4" />
              </span>
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Needs Attention
              </h2>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
              {(attentionItems || []).length} Urgent
            </span>
          </div>

          <div className="space-y-2.5">
            {(attentionItems || []).length === 0 ? (
              <div className="p-8 text-center text-zinc-400 text-xs">
                No urgent alerts requiring admin attention.
              </div>
            ) : (
              (attentionItems || []).map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate(item.link)}
                  className="p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40 hover:border-indigo-300 dark:hover:border-indigo-700 cursor-pointer transition space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-1">
                      {item.title}
                    </span>
                    <span
                      className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded shrink-0 ${
                        item.severity === "high"
                          ? "bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300"
                          : item.severity === "medium"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300"
                            : "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"
                      }`}
                    >
                      {item.severity}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2">
                    {item.description}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-indigo-600 dark:text-indigo-400 font-medium pt-1">
                    <span>Take action</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Purchases & Signups (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Purchases Feed */}
          <div className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Recent Completed Purchases
              </h2>
              {role !== "reviewer" && (
                <button
                  onClick={() => navigate("/purchases")}
                  className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  View ledger
                </button>
              )}
            </div>

            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {(recentPurchases || []).length === 0 ? (
                <div className="p-8 text-center text-zinc-400 text-xs">
                  No recent purchases recorded.
                </div>
              ) : (
                (recentPurchases || []).map((p) => (
                  <div
                    key={p.id}
                    className="py-2.5 flex items-center justify-between text-xs"
                  >
                    <div className="truncate pr-4">
                      <span className="font-medium text-zinc-900 dark:text-zinc-100 block truncate">
                        {p.item_title}
                      </span>
                      <span className="text-[11px] text-zinc-400 font-mono truncate">
                        {p.user_email}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                        {formatCurrency(p.amount || 0)}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          p.status === "completed"
                            ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                            : p.status === "failed"
                              ? "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800"
                              : "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                        }`}
                      >
                        {(p.status || "completed").toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Signups & Audit Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Recent Signups */}
            <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  Recent Signups
                </h3>
                {role !== "reviewer" && (
                  <button
                    onClick={() => navigate("/users")}
                    className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    All users
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {(recentSignups || []).length === 0 ? (
                  <div className="p-6 text-center text-zinc-400 text-xs">
                    No recent signups found.
                  </div>
                ) : (
                  (recentSignups || []).slice(0, 4).map((u) => (
                    <div
                      key={u.id}
                      onClick={() =>
                        role !== "reviewer" && navigate(`/users/${u.id}`)
                      }
                      className={`flex items-center justify-between text-xs p-1.5 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition ${
                        role !== "reviewer" ? "cursor-pointer" : ""
                      }`}
                    >
                      <div className="truncate">
                        <span className="font-medium text-zinc-900 dark:text-zinc-100 block truncate">
                          {u.name}
                        </span>
                        <span className="text-[10px] text-zinc-400 block truncate">
                          {u.email}
                        </span>
                      </div>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 shrink-0">
                        {u.source}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Audit Log */}
            <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-2xs space-y-3">
              <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                Recent Audit Trail
              </h3>
              <div className="space-y-2">
                {(recentAudit || []).length === 0 ? (
                  <div className="p-6 text-center text-zinc-400 text-xs">
                    No audit logs found.
                  </div>
                ) : (
                  (recentAudit || []).slice(0, 3).map((a) => (
                    <div key={a.id} className="text-xs space-y-0.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                          {a.admin_name}
                        </span>
                        <span className="text-[10px] text-zinc-400">
                          {a.timestamp
                            ? new Date(a.timestamp).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "—"}
                        </span>
                      </div>
                      <p className="text-[10.5px] text-zinc-500 dark:text-zinc-400 line-clamp-1">
                        {a.details}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
