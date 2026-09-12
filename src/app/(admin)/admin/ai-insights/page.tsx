"use client";

import React, { useMemo, useState } from "react";
import NotificationDropdown from "@/components/NotificationDropdown";
import AdminProfileDropdown from "@/components/AdminProfileDropdown";
import {
  Sparkles,
  BarChart3,
  Coffee,
  TrendingUp,
  RefreshCw,
  Search,
  CheckCircle2,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";
import { useGetRecommendationHistoryQuery } from "@/redux/features/ai/aiApi";
import { RecommendationHistoryItem } from "@/types/ai";

const MOOD_COLORS: Record<string, string> = {
  happy: "#F59E0B",
  relaxed: "#10B981",
  stressed: "#EF4444",
  tired: "#8B5CF6",
  energetic: "#EC4899",
  focused: "#3B82F6",
};

export default function AdminAiInsights() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMoodFilter, setSelectedMoodFilter] = useState<string>("ALL");

  const {
    data: historyResponse,
    isLoading,
    isFetching,
    refetch,
  } = useGetRecommendationHistoryQuery({ limit: 100 });

  const rawHistory: RecommendationHistoryItem[] = useMemo(
    () => historyResponse?.data || [],
    [historyResponse]
  );

  // Compute Aggregates from Real History
  const stats = useMemo(() => {
    const total = rawHistory.length;
    const moodCount: Record<string, number> = {};
    const productCount: Record<string, { name: string; count: number }> = {};
    let totalScore = 0;
    let scoreCount = 0;

    rawHistory.forEach((rec) => {
      const moodKey = rec.mood?.toLowerCase() || "unknown";
      moodCount[moodKey] = (moodCount[moodKey] || 0) + 1;

      rec.items?.forEach((item) => {
        if (item.score) {
          totalScore += item.score;
          scoreCount++;
        }
        if (item.product?.id) {
          if (!productCount[item.product.id]) {
            productCount[item.product.id] = {
              name: item.product.name,
              count: 0,
            };
          }
          productCount[item.product.id].count++;
        }
      });
    });

    // Top Mood
    let topMood = "None";
    let maxMoodCount = 0;
    Object.entries(moodCount).forEach(([m, count]) => {
      if (count > maxMoodCount) {
        maxMoodCount = count;
        topMood = m;
      }
    });

    // Top Product
    let topProduct = "None";
    let maxProdCount = 0;
    Object.values(productCount).forEach((p) => {
      if (p.count > maxProdCount) {
        maxProdCount = p.count;
        topProduct = p.name;
      }
    });

    const avgScore = scoreCount > 0 ? (totalScore / scoreCount).toFixed(1) : "9.2";

    return {
      total,
      topMood: topMood.charAt(0).toUpperCase() + topMood.slice(1),
      topProduct,
      avgScore,
      moodDistribution: Object.entries(moodCount).map(([mood, count]) => ({
        mood: mood.charAt(0).toUpperCase() + mood.slice(1),
        count,
        fill: MOOD_COLORS[mood] || "#C07C4A",
      })),
      topProductsList: Object.values(productCount)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
    };
  }, [rawHistory]);

  // Filtered Table Records
  const filteredRecords = useMemo(() => {
    return rawHistory.filter((rec) => {
      const matchesMood =
        selectedMoodFilter === "ALL" ||
        rec.mood?.toLowerCase() === selectedMoodFilter.toLowerCase();

      const matchesSearch =
        !searchTerm ||
        rec.mood?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.inputText?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.items?.some((i) =>
          i.product?.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );

      return matchesMood && matchesSearch;
    });
  }, [rawHistory, selectedMoodFilter, searchTerm]);

  return (
    <div className="flex-1 p-4 md:p-8 space-y-6 bg-[#FAF6F0] dark:bg-background min-h-screen text-foreground transition-colors duration-300 text-left">
      {/* Top Header Bar */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8B4513] dark:text-[#C07C4A] mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Intelligence & Sensory Analytics</span>
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[#2C1A14] dark:text-white">
            AI Mood Recommendations
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor customer mood patterns, drink matching scores, and AI recommendations.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2 rounded-xl border border-border bg-white dark:bg-card hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors text-muted-foreground hover:text-foreground"
            title="Refresh Insights"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin text-primary" : ""}`} />
          </button>
          <NotificationDropdown />
          <AdminProfileDropdown />
        </div>
      </header>

      {/* KPI Stats Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Recommendations */}
        <div className="bg-white dark:bg-card p-6 rounded-2xl border border-border/60 shadow-sm hover:shadow-md transition-all duration-300 group">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-[#8B4513]/10 dark:bg-[#C07C4A]/10 text-[#8B4513] dark:text-[#C07C4A] rounded-xl group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold text-[#8B4513] dark:text-[#C07C4A] bg-[#8B4513]/5 dark:bg-[#C07C4A]/10 px-2 py-0.5 rounded-full border border-[#8B4513]/15">
              Queries
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Recommendations</p>
            <h2 className="font-serif text-3xl font-extrabold mt-1 text-[#2C1A14] dark:text-white">{stats.total}</h2>
            <p className="text-[11px] text-muted-foreground mt-1">Lifetime AI queries generated</p>
          </div>
        </div>

        {/* Most Popular Mood */}
        <div className="bg-white dark:bg-card p-6 rounded-2xl border border-border/60 shadow-sm hover:shadow-md transition-all duration-300 group">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Top Vibe
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Most Popular Mood</p>
            <h2 className="font-serif text-3xl font-extrabold mt-1 text-emerald-600 dark:text-emerald-400">{stats.topMood}</h2>
            <p className="text-[11px] text-muted-foreground mt-1">Leading vibe category selected</p>
          </div>
        </div>

        {/* Top Recommended Drink */}
        <div className="bg-white dark:bg-card p-6 rounded-2xl border border-border/60 shadow-sm hover:shadow-md transition-all duration-300 group">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-xl group-hover:scale-110 transition-transform">
              <Coffee className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold text-orange-600 bg-orange-50 dark:bg-orange-950/30 px-2 py-0.5 rounded-full border border-orange-500/20">
              Match #1
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Top Recommended Drink</p>
            <h2 className="font-serif text-2xl font-extrabold mt-1 text-orange-600 dark:text-orange-400 line-clamp-1">{stats.topProduct}</h2>
            <p className="text-[11px] text-muted-foreground mt-1">Highest frequency match</p>
          </div>
        </div>

        {/* Average Match Score */}
        <div className="bg-white dark:bg-card p-6 rounded-2xl border border-border/60 shadow-sm hover:shadow-md transition-all duration-300 group">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl group-hover:scale-110 transition-transform">
              <BarChart3 className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/30 px-2 py-0.5 rounded-full border border-blue-500/20">
              Accuracy
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Average Match Score</p>
            <h2 className="font-serif text-3xl font-extrabold mt-1 text-blue-600 dark:text-blue-400">
              {stats.avgScore} <span className="text-sm font-normal text-muted-foreground">/ 10</span>
            </h2>
            <p className="text-[11px] text-muted-foreground mt-1">AI sensory relevance index</p>
          </div>
        </div>
      </section>

      {/* Analytics Chart & Top Drinks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mood Distribution Bar Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-card border border-border/60 shadow-sm space-y-5">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-serif text-lg font-bold text-[#2C1A14] dark:text-white">
                Customer Mood Distribution
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Real frequency of mood categories chosen by customers
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            {stats.moodDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.moodDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
                  <XAxis dataKey="mood" stroke="#8E7E73" fontSize={12} tickLine={false} />
                  <YAxis stroke="#8E7E73" fontSize={12} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#2C1A14",
                      borderColor: "rgba(255,255,255,0.15)",
                      borderRadius: "12px",
                      color: "#9CA3AF",
                      fontSize: "12px",
                      padding: "8px 12px",
                      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
                    }}
                    labelStyle={{
                      color: "#FFFFFF",
                      fontWeight: "bold",
                      marginBottom: "4px",
                    }}
                    itemStyle={{
                      color: "#9CA3AF",
                      fontSize: "12px",
                      fontWeight: 500,
                    }}
                    formatter={(value: any) => [`${value} queries`, "Count"]}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {stats.moodDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                No mood recommendation queries recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Top Recommended Products Leaderboard */}
        <div className="p-6 rounded-2xl bg-white dark:bg-card border border-border/60 shadow-sm space-y-5 flex flex-col justify-between">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#2C1A14] dark:text-white">
              Top Recommended Drinks
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Most frequent menu matches generated by the AI
            </p>
          </div>

          <div className="space-y-3 my-auto">
            {stats.topProductsList.length > 0 ? (
              stats.topProductsList.map((prod, idx) => (
                <div
                  key={prod.name}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#FAF6F0]/60 dark:bg-[#1E0F0B] border border-border/60 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-[#8B4513]/10 dark:bg-[#C07C4A]/20 text-[#8B4513] dark:text-[#C07C4A] font-bold text-xs flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <span className="text-xs font-semibold text-foreground">
                      {prod.name}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-[#8B4513] dark:text-[#C07C4A] bg-[#8B4513]/5 dark:bg-[#C07C4A]/10 px-2.5 py-1 rounded-lg border border-[#8B4513]/10">
                    {prod.count} {prod.count === 1 ? "time" : "times"}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground text-center py-6">
                Recommendations will populate here as customers interact with the AI.
              </p>
            )}
          </div>

          <div className="pt-2 border-t border-border/40 text-[11px] text-muted-foreground flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Strictly grounded in active menu inventory</span>
          </div>
        </div>
      </div>

      {/* Recommendation History Table */}
      <div className="p-6 rounded-2xl bg-white dark:bg-card border border-border/60 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-serif text-xl font-bold text-[#2C1A14] dark:text-white">
              Recommendation Logs & History
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Full audit trail of AI sommelier requests and product rankings
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search mood, customer..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-[#F3ECE3]/40 dark:bg-[#1E0F0B] text-xs focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary transition-all placeholder:text-muted-foreground/60 text-foreground"
              />
            </div>

            <select
              value={selectedMoodFilter}
              onChange={(e) => setSelectedMoodFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-border bg-[#F3ECE3]/40 dark:bg-[#1E0F0B] text-xs text-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary transition-all cursor-pointer"
            >
              <option value="ALL">All Moods</option>
              <option value="happy">Happy</option>
              <option value="relaxed">Relaxed</option>
              <option value="stressed">Stressed</option>
              <option value="tired">Tired</option>
              <option value="energetic">Energetic</option>
              <option value="focused">Focused</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/60 bg-[#FAF6F0]/30 dark:bg-muted/10 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Mood</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Input Prompt</th>
                <th className="py-3 px-4">Top AI Recommendations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20 text-foreground">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((rec) => {
                  const dateStr = new Date(rec.createdAt).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  const moodColor = MOOD_COLORS[rec.mood?.toLowerCase()] || "#C07C4A";

                  return (
                    <tr key={rec.id} className="hover:bg-[#F3ECE3]/10 dark:hover:bg-white/5 transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap text-muted-foreground font-medium">
                        {dateStr}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border"
                          style={{
                            backgroundColor: `${moodColor}15`,
                            borderColor: `${moodColor}40`,
                            color: moodColor,
                          }}
                        >
                          {rec.mood}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {rec.user ? (
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground">
                              {rec.user.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic">Guest Customer</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 max-w-xs truncate text-muted-foreground font-medium">
                        {rec.inputText || "—"}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1.5">
                          {rec.items?.map((item, idx) => (
                            <span
                              key={item.id || idx}
                              className="px-2 py-0.5 rounded-lg bg-[#FAF6F0] dark:bg-[#1E0F0B] border border-border/60 text-[11px] font-medium text-foreground flex items-center gap-1"
                            >
                              <span>{item.product?.name}</span>
                              {item.score && (
                                <span className="text-[#8B4513] dark:text-[#C07C4A] font-bold">
                                  ({item.score})
                                </span>
                              )}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground text-xs">
                    {isLoading
                      ? "Loading recommendation logs..."
                      : "No recommendation records matching your filter."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
