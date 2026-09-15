"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useGetDailyTipsSummaryQuery } from "@/redux/features/order/orderApi";
import NotificationDropdown from "@/components/NotificationDropdown";
import AdminProfileDropdown from "@/components/AdminProfileDropdown";
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
  Sun,
  Moon,
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
    <div className="flex-1 p-4 md:p-8 space-y-6 bg-background min-h-screen text-foreground transition-colors duration-300 text-left">
      {/* PAGE HEADER */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary mb-1">
            <Heart className="w-3.5 h-3.5 fill-primary text-primary" />
            <span>Gratuity & Staff Appreciation</span>
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">
            Daily Tips & Gratuities
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor daily customer gratuities, barista tip allocations, and historical trends.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card hover:bg-muted/60 transition-colors text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin text-primary" : ""}`} />
            <span>Refresh</span>
          </button>

          <NotificationDropdown />
          <AdminProfileDropdown />
        </div>
      </header>

      {/* KPI METRICS CARDS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tips */}
        <div className="bg-card p-6 rounded-2xl border border-border/70 shadow-sm hover:shadow-md hover:border-primary/40 transition-all duration-300 group">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl group-hover:scale-110 transition-transform">
              <DollarSign className="w-6 h-6" />
            </div>
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <TrendingUp className="w-3 h-3" /> Lifetime
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Tips Collected
            </p>
            <h2 className="font-serif text-3xl font-extrabold mt-1 text-foreground">
              ${kpis.totalTips.toFixed(2)}
            </h2>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
              Customer appreciation
            </p>
          </div>
        </div>

        {/* Today's Tips */}
        <div className="bg-card p-6 rounded-2xl border border-border/70 shadow-sm hover:shadow-md hover:border-primary/40 transition-all duration-300 group">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-primary/10 text-primary rounded-xl group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <span className="flex items-center gap-1 text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
              Today
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Today&apos;s Tips
            </p>
            <h2 className="font-serif text-3xl font-extrabold mt-1 text-foreground">
              ${kpis.todayTips.toFixed(2)}
            </h2>
            <p className="text-[11px] text-muted-foreground mt-1">
              Accumulated since midnight
            </p>
          </div>
        </div>

        {/* Tipped Orders Count */}
        <div className="bg-card p-6 rounded-2xl border border-border/70 shadow-sm hover:shadow-md hover:border-primary/40 transition-all duration-300 group">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl group-hover:scale-110 transition-transform">
              <Heart className="w-6 h-6" />
            </div>
            <span className="flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              Orders
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Tipped Orders
            </p>
            <h2 className="font-serif text-3xl font-extrabold mt-1 text-foreground">
              {kpis.totalTippedOrders}
            </h2>
            <p className="text-[11px] text-muted-foreground mt-1">
              Voluntary patron gratuities
            </p>
          </div>
        </div>

        {/* Average Tip */}
        <div className="bg-card p-6 rounded-2xl border border-border/70 shadow-sm hover:shadow-md hover:border-primary/40 transition-all duration-300 group">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl group-hover:scale-110 transition-transform">
              <Award className="w-6 h-6" />
            </div>
            <span className="flex items-center gap-1 text-[11px] font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
              Average
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Average Tip Amount
            </p>
            <h2 className="font-serif text-3xl font-extrabold mt-1 text-foreground">
              ${kpis.avgTip.toFixed(2)}
            </h2>
            <p className="text-[11px] text-muted-foreground mt-1">
              Per tipped customer order
            </p>
          </div>
        </div>
      </section>

      {/* FILTER & DATE CONTROLS */}
      <div className="bg-card p-4 rounded-2xl border border-border/70 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 w-full">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by date (YYYY-MM-DD)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="text-[11px] font-semibold">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary transition-all"
            />
            <span className="text-[11px] font-semibold">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary transition-all"
            />
            {(startDate || endDate) && (
              <button
                type="button"
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                }}
                className="px-3 py-2 rounded-xl text-xs font-bold text-primary hover:underline cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* TWO COLUMN GRID: DAILY BREAKDOWN + BARISTA LEADERBOARD */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* DAILY BREAKDOWN TABLE (2 Cols on LG) */}
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border/70 p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <h2 className="font-serif text-lg font-bold text-foreground">
                Daily Tips Breakdown
              </h2>
            </div>
            <span className="text-xs text-muted-foreground font-medium">
              {filteredDaily.length} recorded days
            </span>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-xs text-muted-foreground flex flex-col items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-primary" />
              <span>Loading daily tips data...</span>
            </div>
          ) : filteredDaily.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              No daily tip records found for the selected period.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border text-[11px] uppercase font-bold text-muted-foreground">
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Tips Volume</th>
                    <th className="py-3 px-3 text-center">Orders</th>
                    <th className="py-3 px-3 text-right">Avg / Order</th>
                    <th className="py-3 px-3 text-right">Total Tips</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredDaily.map((day: any) => {
                    const ratio = Math.min(100, Math.round((day.totalAmount / maxDailyAmount) * 100));
                    return (
                      <tr key={day.date} className="hover:bg-muted/40 transition-colors">
                        <td className="py-3.5 px-3 font-semibold text-foreground">
                          {day.date}
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="w-full max-w-[140px] bg-muted h-2 rounded-full overflow-hidden border border-border/60">
                            <div
                              className="h-full bg-gradient-to-r from-primary to-emerald-500 rounded-full transition-all"
                              style={{ width: `${ratio}%` }}
                            />
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-center text-muted-foreground font-medium">
                          {day.count}
                        </td>
                        <td className="py-3.5 px-3 text-right text-muted-foreground font-medium">
                          ${day.avgTip.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
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
        <div className="bg-card rounded-2xl border border-border/70 p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <h2 className="font-serif text-lg font-bold text-foreground">
                Barista Distribution
              </h2>
            </div>
            <span className="text-xs text-muted-foreground font-medium">
              {baristaLeaderboard.length} baristas
            </span>
          </div>

          {baristaLeaderboard.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              No barista tip distributions recorded yet.
            </div>
          ) : (
            <div className="space-y-3">
              {baristaLeaderboard.map((b: any, idx: number) => (
                <div
                  key={b.baristaId}
                  className="p-3.5 rounded-xl bg-muted/30 border border-border/60 flex items-center justify-between gap-3 hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary font-black text-xs flex items-center justify-center border border-primary/20">
                      #{idx + 1}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">{b.name}</h4>
                      <p className="text-[10px] text-muted-foreground font-medium">
                        {b.station} · {b.count} tips
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      ${b.totalTips.toFixed(2)}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-medium">
                      avg ${b.avgTip.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* RECENT TIPS ACTIVITY FEED */}
      <section className="bg-card rounded-2xl border border-border/70 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-primary fill-primary/20" />
            <h2 className="font-serif text-lg font-bold text-foreground">
              Recent Gratuity Activity & Compliments
            </h2>
          </div>
          <span className="text-xs text-muted-foreground font-medium">
            Latest {recentTips.length} transactions
          </span>
        </div>

        {recentTips.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted-foreground">
            No recent tip transactions recorded yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {recentTips.map((tip: any) => (
              <div
                key={tip.id}
                className="p-4 rounded-xl bg-muted/20 border border-border/60 space-y-2 hover:border-primary/40 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-bold text-primary">
                      #{tip.order?.orderNumber || tip.orderId?.slice(-6)}
                    </span>
                    <h4 className="text-xs font-bold text-foreground mt-0.5">
                      {tip.user?.name || "Customer"}
                    </h4>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    +${Number(tip.amount || 0).toFixed(2)}
                  </span>
                </div>

                {tip.message && (
                  <div className="p-2.5 rounded-lg bg-muted/60 border border-border/50 text-[11px] text-foreground italic flex items-start gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span>&ldquo;{tip.message}&rdquo;</span>
                  </div>
                )}

                <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[10px] text-muted-foreground font-medium">
                  <span>To: {tip.barista?.name || "Kitchen Team"}</span>
                  <span>{new Date(tip.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
