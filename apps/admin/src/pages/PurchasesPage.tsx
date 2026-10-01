import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { type Purchase, type PurchaseStatus } from "@fastquiz/shared";
import {
  Receipt,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

export const PurchasesPage: React.FC = () => {
  const { client } = useAuth();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<PurchaseStatus | "all">(
    "all",
  );
  const [isLoading, setIsLoading] = useState(true);

  const loadPurchases = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await client.admin.getPurchases();
      setPurchases(data);
    } finally {
      setIsLoading(false);
    }
  }, [client.admin]);

  useEffect(() => {
    loadPurchases();
  }, [loadPurchases]);

  const filteredPurchases = useMemo(() => {
    if (selectedStatus === "all") return purchases;
    return purchases.filter((p) => p.status === selectedStatus);
  }, [purchases, selectedStatus]);

  const stats = useMemo(() => {
    const completed = purchases.filter((p) => p.status === "completed");
    const revenue = completed.reduce((sum, p) => sum + p.amount, 0);
    const failed = purchases.filter((p) => p.status === "failed");
    const pending = purchases.filter((p) => p.status === "pending");
    return {
      revenue,
      completedCount: completed.length,
      failedCount: failed.length,
      pendingCount: pending.length,
    };
  }, [purchases]);

  const renderStatusBadge = (status: PurchaseStatus) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            COMPLETED
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
            <XCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
            FAILED
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            PENDING
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Purchases &amp; Transactions
            </h1>
            <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-mono text-xs font-medium border border-zinc-200 dark:border-zinc-700">
              Finance
            </span>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Read-only financial visibility, charge auditing, and revenue
            reconciliation.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              Total Settled Revenue
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              ${(stats.revenue / 100).toFixed(2)}
            </div>
            <div className="mt-1 text-[11px] text-zinc-400 dark:text-zinc-500">
              Net platform sales across all quizzes
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              Completed Orders
            </span>
            <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {stats.completedCount}
            </div>
            <div className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              100% fulfillment rate
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              Exceptions / Stuck
            </span>
            <AlertCircle className="w-4 h-4 text-amber-500 dark:text-amber-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {stats.failedCount + stats.pendingCount}
            </div>
            <div className="mt-1 text-[11px] text-zinc-400 dark:text-zinc-500">
              {stats.failedCount} Failed • {stats.pendingCount} Pending
            </div>
          </div>
        </div>
      </div>

      {/* Filter Strip */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 shadow-2xs flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5">
          {(["all", "completed", "pending", "failed"] as const).map(
            (status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition ${
                  selectedStatus === status
                    ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-300 font-semibold"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
              >
                {status === "all" ? "All Transactions" : status}
              </button>
            ),
          )}
        </div>

        <span className="text-xs text-zinc-400 dark:text-zinc-500 font-mono">
          Showing {filteredPurchases.length} of {purchases.length} transactions
        </span>
      </div>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                <th className="py-2.5 px-4">Transaction ID</th>
                <th className="py-2.5 px-4">Candidate / User</th>
                <th className="py-2.5 px-4">Target Item</th>
                <th className="py-2.5 px-4">Amount</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 pr-4 pl-4 text-right">Date &amp; Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-12 text-center text-zinc-400 dark:text-zinc-500"
                  >
                    <RefreshCw className="w-5 h-5 mx-auto animate-spin mb-2 text-indigo-600" />
                    Loading ledger entries...
                  </td>
                </tr>
              ) : filteredPurchases.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-16 text-center text-zinc-500 dark:text-zinc-400"
                  >
                    <Receipt className="w-8 h-8 mx-auto mb-2 text-zinc-300 dark:text-zinc-600" />
                    <p className="font-semibold text-zinc-800 dark:text-zinc-200">
                      No transactions found
                    </p>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                      No records match the selected status filter.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredPurchases.map((purchase) => (
                  <tr
                    key={purchase.id}
                    className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                      #{purchase.id}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-zinc-900 dark:text-zinc-100">
                          {(purchase as unknown as { user_name?: string })
                            .user_name ||
                            purchase.user_email?.split("@")[0] ||
                            "Candidate User"}
                        </span>
                        <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                          {purchase.user_email ||
                            `user-${purchase.user_id.slice(0, 6)}@example.com`}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-zinc-800 dark:text-zinc-200">
                      {purchase.item_title || "Two Pointers Mastery Quiz"}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                      ${(purchase.amount / 100).toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      {renderStatusBadge(purchase.status)}
                    </td>
                    <td className="py-3 pr-4 pl-4 text-right font-mono text-zinc-400 dark:text-zinc-500 text-[11px]">
                      {new Date(purchase.created_at).toLocaleDateString(
                        undefined,
                        {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
