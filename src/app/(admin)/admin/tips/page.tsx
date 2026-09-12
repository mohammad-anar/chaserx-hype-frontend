"use client";

import React, { useState, useMemo } from "react";
import { useGetDailyTipsSummaryQuery } from "@/redux/features/order/orderApi";
import {
  DollarSign,
  Heart,
  Calendar,
  Coffee,
  TrendingUp,
  Award,
  Search,
  Filter,
  Users,
  MessageSquare,
  Sparkles,
  ArrowUpRight,
  RefreshCw,
  Gift,
} from "lucide-react";

export default function AdminTipsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data: tipsRes, isLoading, isFetching, refetch } = useGetDailyTipsSummaryQuery({
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  const summary = tipsRes?.data;
  const kpis = summary?.kpis || {
    totalTips: 0,
    todayTips: 0,
    totalTippedOrders: 0,
    avgTip: 0,
  };

  const dailyBreakdown = useMemo(() => summary?.dailyBreakdown || [], [summary]);
  const baristaLeaderboard = useMemo(() => summary?.baristaLeaderboard || [], [summary]);
  const recentTips = useMemo(() => summary?.recentTips || [], [summary]);

  const filteredDaily = useMemo(() => {
    if (!searchTerm) return dailyBreakdown;
    return dailyBreakdown.filter((d: any) =>
      d.date.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [dailyBreakdown, searchTerm]);

  const maxDailyAmount = useMemo(() => {
    if (dailyBreakdown.length === 0) return 1;
    return Math.max(...dailyBreakdown.map((d: any) => d.totalAmount || 0), 1);
  }, [dailyBreakdown]);

  return (
    <div className="space-y-6 sm:space-y-8 font-sans">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">
              Daily Tips & Gratuities
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Live Tracker
            </span>
          </div>
          <p className="text-xs text-[#FAF6F0]/60 mt-1">
            Monitor daily customer gratuities, barista tip allocations, and historical trends.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black/40 border border-[#C07C4A]/25 text-xs font-bold text-[#FAF6F0]/80 hover:text-white hover:bg-white/5 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin text-[#C07C4A]" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tips */}
        <div className="p-5 rounded-3xl bg-[#140A07]/70 border border-[#C07C4A]/20 backdrop-blur-xl shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FAF6F0]/60">
              Total Tips Collected
            </span>
            <div className="p-2 rounded-xl bg-[#C07C4A]/15 text-[#C07C4A]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-white">
            ${kpis.totalTips.toFixed(2)}
          </p>
          <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Lifetime customer appreciation</span>
          </p>
        </div>

        {/* Today's Tips */}
        <div className="p-5 rounded-3xl bg-[#140A07]/70 border border-emerald-500/30 backdrop-blur-xl shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FAF6F0]/60">
              Today&apos;s Tips
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-white">
            ${kpis.todayTips.toFixed(2)}
          </p>
          <p className="text-[11px] text-[#FAF6F0]/50 font-medium">
            Accumulated since midnight
          </p>
        </div>

        {/* Tipped Orders Count */}
        <div className="p-5 rounded-3xl bg-[#140A07]/70 border border-[#C07C4A]/20 backdrop-blur-xl shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FAF6F0]/60">
              Tipped Orders
            </span>
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-white">
            {kpis.totalTippedOrders}
          </p>
          <p className="text-[11px] text-[#FAF6F0]/50 font-medium">
            Orders with voluntary gratuity
          </p>
        </div>

        {/* Average Tip */}
        <div className="p-5 rounded-3xl bg-[#140A07]/70 border border-[#C07C4A]/20 backdrop-blur-xl shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FAF6F0]/60">
              Average Tip Amount
            </span>
            <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-white">
            ${kpis.avgTip.toFixed(2)}
          </p>
          <p className="text-[11px] text-[#FAF6F0]/50 font-medium">
            Per tipped customer order
          </p>
        </div>
      </div>

      {/* FILTER & DATE CONTROLS */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#140A07]/60 p-4 rounded-3xl border border-[#C07C4A]/15 backdrop-blur-xl">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#FAF6F0]/40" />
            <input
              type="text"
              placeholder="Search by date (YYYY-MM-DD)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-black/40 border border-[#C07C4A]/20 text-xs text-white placeholder:text-[#FAF6F0]/30 focus:outline-none focus:border-[#C07C4A]"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-[#FAF6F0]/70">
            <span className="text-[11px] font-semibold text-[#FAF6F0]/50">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-black/40 border border-[#C07C4A]/20 text-xs text-white focus:outline-none focus:border-[#C07C4A]"
            />
            <span className="text-[11px] font-semibold text-[#FAF6F0]/50">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-black/40 border border-[#C07C4A]/20 text-xs text-white focus:outline-none focus:border-[#C07C4A]"
            />
            {(startDate || endDate) && (
              <button
                type="button"
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                }}
                className="text-xs text-[#C07C4A] hover:underline"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* TWO COLUMN GRID: DAILY BREAKDOWN + BARISTA LEADERBOARD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* DAILY BREAKDOWN TABLE (2 Cols on LG) */}
        <div className="lg:col-span-2 rounded-3xl bg-[#140A07]/60 border border-[#C07C4A]/20 p-5 sm:p-6 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#C07C4A]" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Every Day Tips Breakdown
              </h2>
            </div>
            <span className="text-xs text-[#FAF6F0]/50">
              {filteredDaily.length} recorded days
            </span>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-xs text-[#FAF6F0]/50">
              Loading daily tips data...
            </div>
          ) : filteredDaily.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#FAF6F0]/50">
              No daily tip records found for the selected period.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-[11px] uppercase font-bold text-[#FAF6F0]/50">
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Tips Volume</th>
                    <th className="py-3 px-3 text-center">Orders</th>
                    <th className="py-3 px-3 text-right">Avg / Order</th>
                    <th className="py-3 px-3 text-right">Total Tips</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredDaily.map((day: any) => {
                    const ratio = Math.min(100, Math.round((day.totalAmount / maxDailyAmount) * 100));
                    return (
                      <tr key={day.date} className="hover:bg-white/5 transition-colors">
                        <td className="py-3.5 px-3 font-semibold text-white">
                          {day.date}
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="w-full max-w-[140px] bg-black/40 h-2 rounded-full overflow-hidden border border-white/10">
                            <div
                              className="h-full bg-gradient-to-r from-[#C07C4A] to-emerald-400 rounded-full transition-all"
                              style={{ width: `${ratio}%` }}
                            />
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-center text-[#FAF6F0]/70 font-medium">
                          {day.count}
                        </td>
                        <td className="py-3.5 px-3 text-right text-[#FAF6F0]/70 font-medium">
                          ${day.avgTip.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-3 text-right font-black text-emerald-400">
                          +${day.totalAmount.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* BARISTA LEADERBOARD (1 Col on LG) */}
        <div className="rounded-3xl bg-[#140A07]/60 border border-[#C07C4A]/20 p-5 sm:p-6 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Barista Distribution
              </h2>
            </div>
            <span className="text-xs text-[#FAF6F0]/50">
              {baristaLeaderboard.length} baristas
            </span>
          </div>

          {baristaLeaderboard.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#FAF6F0]/50">
              No barista tip distributions recorded yet.
            </div>
          ) : (
            <div className="space-y-3">
              {baristaLeaderboard.map((b: any, idx: number) => (
                <div
                  key={b.baristaId}
                  className="p-3.5 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between gap-3 hover:border-[#C07C4A]/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#C07C4A]/20 text-[#C07C4A] font-black text-xs flex items-center justify-center border border-[#C07C4A]/30">
                      #{idx + 1}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-white">{b.name}</h4>
                      <p className="text-[10px] text-[#FAF6F0]/50 font-medium">
                        {b.station} · {b.count} tips
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-emerald-400">
                      ${b.totalTips.toFixed(2)}
                    </p>
                    <p className="text-[10px] text-[#FAF6F0]/40 font-medium">
                      avg ${b.avgTip.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RECENT TIPS ACTIVITY FEED */}
      <div className="rounded-3xl bg-[#140A07]/60 border border-[#C07C4A]/20 p-5 sm:p-6 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-[#C07C4A]" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Recent Gratuity Activity & Compliments
            </h2>
          </div>
          <span className="text-xs text-[#FAF6F0]/50">
            Latest {recentTips.length} transactions
          </span>
        </div>

        {recentTips.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#FAF6F0]/50">
            No recent tip transactions recorded yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {recentTips.map((tip: any) => (
              <div
                key={tip.id}
                className="p-4 rounded-2xl bg-black/40 border border-[#C07C4A]/15 space-y-2 hover:border-[#C07C4A]/40 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-bold text-[#C07C4A]">
                      #{tip.order?.orderNumber || tip.orderId?.slice(-6)}
                    </span>
                    <h4 className="text-xs font-bold text-white mt-0.5">
                      {tip.user?.name || "Customer"}
                    </h4>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    +${Number(tip.amount || 0).toFixed(2)}
                  </span>
                </div>

                {tip.message && (
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-[11px] text-[#FAF6F0]/80 italic flex items-start gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>&ldquo;{tip.message}&rdquo;</span>
                  </div>
                )}

                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-[#FAF6F0]/50 font-medium">
                  <span>To: {tip.barista?.name || "Kitchen Team"}</span>
                  <span>{new Date(tip.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
