import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { type Purchase, type PurchaseStatus } from '@fastquiz/shared';
import {
  Receipt,
  Filter,
  DollarSign,
  Calendar,
  Mail,
  RefreshCw,
  CheckCircle2,
  XCircle,
  RotateCcw,
} from 'lucide-react';

export const PurchasesPage: React.FC = () => {
  const { client } = useAuth();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<PurchaseStatus | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);

  const loadPurchases = async () => {
    setIsLoading(true);
    try {
      const data = await client.admin.getPurchases();
      setPurchases(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPurchases();
  }, []);

  const filteredPurchases = useMemo(() => {
    if (selectedStatus === 'all') return purchases;
    return purchases.filter((p) => p.status === selectedStatus);
  }, [purchases, selectedStatus]);

  const totalRevenue = useMemo(() => {
    return purchases
      .filter((p) => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);
  }, [purchases]);

  const renderStatusBadge = (status: PurchaseStatus) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            COMPLETED
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
            <XCircle className="w-3 h-3 text-rose-600" />
            FAILED
          </span>
        );
      case 'refunded':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-300">
            <RotateCcw className="w-3 h-3 text-slate-500" />
            REFUNDED
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
            PENDING
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Page Title & Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Platform Purchases
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Read-only audit trail of individual quiz unlocks and bundle purchases.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-white border border-slate-200 shadow-2xs px-3 py-1.5 rounded-lg text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Completed</span>
            <span className="text-sm font-black text-emerald-700 font-mono">
              ${totalRevenue.toFixed(2)}
            </span>
          </div>

          <button
            onClick={loadPurchases}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs flex items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
          <Filter className="w-3.5 h-3.5" />
          Filter by Status:
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value as PurchaseStatus | 'all')}
          className="px-2.5 py-1.5 border border-slate-300 rounded bg-white text-slate-800 font-medium focus:ring-1 focus:ring-indigo-500 focus:outline-none"
        >
          <option value="all">All Statuses ({purchases.length})</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500 text-xs">Loading purchases...</div>
        ) : filteredPurchases.length === 0 ? (
          <div className="p-12 text-center">
            <Receipt className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-700">No purchases found</h3>
            <p className="text-xs text-slate-500 mt-1">No transaction records match the selected status.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[10px] tracking-wider">
                <th className="py-2.5 px-4">Transaction ID / Ref</th>
                <th className="py-2.5 px-3">Customer Email</th>
                <th className="py-2.5 px-3">Item Purchased</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-4 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPurchases.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                    <div>{p.id}</div>
                    <span className="text-[10px] text-slate-400">{p.payment_provider_ref}</span>
                  </td>
                  <td className="py-3 px-3 text-slate-800 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      {p.user_email || `User #${p.user_id}`}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-700 font-medium">
                    {p.item_title || (p.bundle_id ? 'Bundle Purchase' : 'Quiz Unlock')}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-900">
                    <span className="inline-flex items-center gap-0.5">
                      <DollarSign className="w-3 h-3 text-slate-400" />
                      {p.amount.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    {renderStatusBadge(p.status)}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-500 text-[11px] whitespace-nowrap">
                    <span className="flex items-center justify-end gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {new Date(p.created_at).toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
