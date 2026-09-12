"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  useGetBaristaAssignedOrdersQuery,
  useUpdateOrderStatusMutation,
} from "@/redux/features/order/orderApi";
import { useClaimOrderMutation } from "@/redux/features/barista/baristaApi";
import {
  Coffee,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  Check,
  Flame,
  Snowflake,
  Layers,
  Search,
  RefreshCw,
  User,
  Phone,
  MessageSquare,
  Sparkles,
  ShoppingBag,
  Timer,
  ChevronRight,
  Filter,
  CheckSquare,
  Square,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

// Elapsed timer hook for live kitchen orders
function useElapsedTime(createdAt: string) {
  const [elapsed, setElapsed] = useState<string>("0m");

  useEffect(() => {
    const update = () => {
      const created = new Date(createdAt).getTime();
      const now = Date.now();
      const diffMinutes = Math.floor((now - created) / (1000 * 60));
      const diffSeconds = Math.floor(((now - created) % (1000 * 60)) / 1000);

      if (diffMinutes >= 60) {
        const hours = Math.floor(diffMinutes / 60);
        const mins = diffMinutes % 60;
        setElapsed(`${hours}h ${mins}m`);
      } else {
        setElapsed(`${diffMinutes}m ${diffSeconds}s`);
      }
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [createdAt]);

  return elapsed;
}

// Order Item Component with interactive barista checklist
function BaristaOrderItem({ item }: { item: any }) {
  const [checkedExtras, setCheckedExtras] = useState<Record<string, boolean>>({});

  const toggleExtra = (id: string) => {
    setCheckedExtras((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const isCold =
    item?.product?.temperatureType === "COLD" ||
    item?.temperature === "COLD" ||
    item?.product?.name?.toLowerCase().includes("iced") ||
    item?.product?.name?.toLowerCase().includes("cold");

  return (
    <div className="p-3.5 rounded-2xl bg-black/40 border border-[#C07C4A]/20 space-y-2.5 transition-all hover:border-[#C07C4A]/40">
      {/* Item Title & Quantity */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-[#C07C4A] text-white font-bold text-xs flex items-center justify-center shadow-sm">
            {item.quantity}x
          </span>
          <h4 className="text-sm font-bold text-white leading-snug">
            {item.product?.name || item.coinProduct?.name || "Specialty Coffee"}
          </h4>
        </div>

        {/* Temperature Badge */}
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 uppercase tracking-wider ${
            isCold
              ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
              : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
          }`}
        >
          {isCold ? (
            <>
              <Snowflake className="w-3 h-3 text-blue-400" />
              <span>COLD</span>
            </>
          ) : (
            <>
              <Flame className="w-3 h-3 text-amber-400" />
              <span>HOT</span>
            </>
          )}
        </span>
      </div>

      {/* Item Specifications (Size / Milk) */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-[#FAF6F0]/70">
        {item.selectedSize && (
          <span className="px-2 py-0.5 rounded-md bg-[#FAF6F0]/5 border border-white/10 font-medium text-[11px]">
            Size: <strong className="text-white">{item.selectedSize.name || item.selectedSize}</strong>
          </span>
        )}
        {item.selectedMilk && (
          <span className="px-2 py-0.5 rounded-md bg-[#FAF6F0]/5 border border-white/10 font-medium text-[11px]">
            Milk: <strong className="text-white">{item.selectedMilk.name || item.selectedMilk}</strong>
          </span>
        )}
      </div>

      {/* Extras Checklist */}
      {item.orderItemExtras && item.orderItemExtras.length > 0 && (
        <div className="pt-1 border-t border-white/5 space-y-1">
          <p className="text-[10px] uppercase font-bold text-[#C07C4A] tracking-wider">
            Customizations:
          </p>
          <div className="space-y-1">
            {item.orderItemExtras.map((extraItem: any, idx: number) => {
              const extraId = extraItem.id || `extra-${idx}`;
              const isChecked = !!checkedExtras[extraId];
              const extraName =
                extraItem.productExtra?.name || extraItem.name || "Custom Extra";

              return (
                <button
                  type="button"
                  key={extraId}
                  onClick={() => toggleExtra(extraId)}
                  className={`w-full flex items-center gap-2 text-left text-xs p-1.5 rounded-lg transition-colors ${
                    isChecked
                      ? "bg-emerald-500/15 text-emerald-300 line-through opacity-70"
                      : "bg-white/5 text-[#FAF6F0]/90 hover:bg-white/10"
                  }`}
                >
                  {isChecked ? (
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <Square className="w-3.5 h-3.5 text-[#C07C4A] shrink-0" />
                  )}
                  <span className="font-medium">{extraName}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// Single Order Card Component
function BaristaOrderCard({
  order,
  onClaim,
  onUpdateStatus,
  isClaiming,
  isUpdating,
}: {
  order: any;
  onClaim: (id: string) => void;
  onUpdateStatus: (id: string, status: string) => void;
  isClaiming: boolean;
  isUpdating: boolean;
}) {
  const elapsed = useElapsedTime(order.createdAt);
  const isUnassigned = !order.assignedBaristaId;
  const status = order.status;

  const statusColor = useMemo(() => {
    switch (status) {
      case "PREPARING":
        return "bg-amber-500/20 text-amber-300 border-amber-500/40";
      case "READY":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
      case "COMPLETED":
        return "bg-blue-500/20 text-blue-300 border-blue-500/40";
      case "CONFIRMED":
        return "bg-purple-500/20 text-purple-300 border-purple-500/40";
      default:
        return "bg-[#C07C4A]/20 text-[#C07C4A] border-[#C07C4A]/30";
    }
  }, [status]);

  return (
    <div
      className={`relative rounded-3xl p-5 border flex flex-col justify-between transition-all duration-300 shadow-xl ${
        isUnassigned
          ? "bg-[#180C07]/90 border-[#C07C4A]/40 shadow-orange-950/20 hover:border-[#C07C4A]"
          : status === "PREPARING"
          ? "bg-[#160B06]/95 border-amber-500/40 shadow-amber-950/30 ring-1 ring-amber-500/20"
          : status === "READY"
          ? "bg-[#0B150F]/95 border-emerald-500/40 shadow-emerald-950/30 ring-1 ring-emerald-500/20"
          : "bg-[#120805]/90 border-[#C07C4A]/20"
      }`}
    >
      {/* Header Info: Order ID, Elapsed Time, Status */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black text-white tracking-wide">
                #{order.orderNumber || order.id?.slice(-6)}
              </span>
              {isUnassigned && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-red-500/20 text-red-300 border border-red-500/30 animate-pulse">
                  Unassigned
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-[#FAF6F0]/60">
              <Clock className="w-3.5 h-3.5 text-[#C07C4A]" />
              <span className="font-semibold">{elapsed} elapsed</span>
            </div>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border shadow-sm ${statusColor}`}
          >
            {status}
          </span>
        </div>

        {/* Customer & Delivery / Dine-in Info */}
        <div className="p-3 rounded-xl bg-black/30 border border-white/5 mb-3 text-xs space-y-1">
          <div className="flex items-center justify-between text-[#FAF6F0]/90 font-medium">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#C07C4A]" />
              {order.shippingAddress?.fullName || order.user?.name || "Valued Customer"}
            </span>
            {order.shippingAddress?.phone && (
              <span className="text-[11px] text-[#FAF6F0]/60 flex items-center gap-1">
                <Phone className="w-3 h-3 text-[#C07C4A]" />
                {order.shippingAddress.phone}
              </span>
            )}
          </div>
        </div>

        {/* Customer Note / Special Instructions */}
        {order.note && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs mb-3 flex items-start gap-2">
            <MessageSquare className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[10px] uppercase tracking-wider text-amber-300">
                Customer Note:
              </p>
              <p className="font-medium italic mt-0.5">{order.note}</p>
            </div>
          </div>
        )}

        {/* Items List */}
        <div className="space-y-2 mb-4">
          {order.orderItems?.map((item: any, idx: number) => (
            <BaristaOrderItem key={item.id || idx} item={item} />
          ))}
        </div>
      </div>

      {/* Action Workflow Controls */}
      <div className="pt-3 border-t border-white/10">
        {isUnassigned ? (
          <button
            type="button"
            disabled={isClaiming}
            onClick={() => onClaim(order.id)}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#C07C4A] to-[#A66637] hover:brightness-110 active:scale-[0.98] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#C07C4A]/20 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Claim & Start Brewing</span>
          </button>
        ) : status === "CONFIRMED" || status === "PENDING" ? (
          <button
            type="button"
            disabled={isUpdating}
            onClick={() => onUpdateStatus(order.id, "PREPARING")}
            className="w-full py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 active:scale-[0.98] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-900/30 transition-all"
          >
            <Flame className="w-4 h-4" />
            <span>Start Brewing (In Prep)</span>
          </button>
        ) : status === "PREPARING" ? (
          <button
            type="button"
            disabled={isUpdating}
            onClick={() => onUpdateStatus(order.id, "READY")}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Mark Ready for Pickup</span>
          </button>
        ) : status === "READY" ? (
          <button
            type="button"
            disabled={isUpdating}
            onClick={() => onUpdateStatus(order.id, "COMPLETED")}
            className="w-full py-3 px-4 rounded-xl bg-[#C07C4A] hover:bg-[#A66637] active:scale-[0.98] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#C07C4A]/20 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Hand Over & Complete</span>
          </button>
        ) : (
          <div className="text-center py-2 text-xs font-bold text-emerald-400 flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>Order Completed</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BaristaKDSPage() {
  const [activeTab, setActiveTab] = useState<
    "all" | "unassigned" | "assigned" | "preparing" | "ready" | "completed"
  >("all");
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: ordersRes,
    isLoading,
    isFetching,
    refetch,
  } = useGetBaristaAssignedOrdersQuery(
    {
      view: activeTab === "completed" ? "completed" : activeTab === "unassigned" ? "unassigned" : "all",
      searchTerm: searchTerm || undefined,
    },
    {
      pollingInterval: 10000, // Real-time poll every 10s
    }
  );

  const [claimOrder, { isLoading: isClaiming }] = useClaimOrderMutation();
  const [updateOrderStatus, { isLoading: isUpdating }] = useUpdateOrderStatusMutation();

  const orders = useMemo(() => ordersRes?.data?.orders || [], [ordersRes]);
  const summary = ordersRes?.data?.summary || {
    unassignedCount: 0,
    myAssignedCount: 0,
    myPreparingCount: 0,
    myReadyCount: 0,
    myCompletedTodayCount: 0,
  };

  // Sound chime when new unassigned order is detected
  const prevCountRef = useRef<number>(summary.unassignedCount);
  useEffect(() => {
    if (summary.unassignedCount > prevCountRef.current) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
          osc.frequency.exponentialRampToValueAtTime(1046.5, ctx.currentTime + 0.3); // C6
          gain.gain.setValueAtTime(0.3, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.6);
        }
      } catch (e) {}
    }
    prevCountRef.current = summary.unassignedCount;
  }, [summary.unassignedCount]);

  // Client filter based on tab
  const filteredOrders = useMemo(() => {
    return orders.filter((order: any) => {
      if (activeTab === "unassigned") return !order.assignedBaristaId;
      if (activeTab === "assigned") return !!order.assignedBaristaId && order.status !== "COMPLETED";
      if (activeTab === "preparing") return order.status === "PREPARING";
      if (activeTab === "ready") return order.status === "READY";
      if (activeTab === "completed") return order.status === "COMPLETED";
      return true;
    });
  }, [orders, activeTab]);

  const handleClaim = async (orderId: string) => {
    try {
      await claimOrder(orderId).unwrap();
      toast.success("Order claimed! Started brewing.");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to claim order");
    }
  };

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      await updateOrderStatus({ orderId, status }).unwrap();
      toast.success(`Order updated to ${status}`);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update order status");
    }
  };

  return (
    <div className="space-y-6">
      {/* SHIFT SUMMARY METRIC CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Unassigned Queue */}
        <button
          type="button"
          onClick={() => setActiveTab("unassigned")}
          className={`p-4 rounded-3xl border text-left transition-all ${
            activeTab === "unassigned"
              ? "bg-red-500/20 border-red-500 shadow-lg shadow-red-950/30"
              : "bg-[#140A07]/60 border-[#C07C4A]/15 hover:border-red-500/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#FAF6F0]/60">
              Kitchen Queue
            </span>
            <AlertCircle className="w-4 h-4 text-red-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white mt-1">
            {summary.unassignedCount}
          </p>
          <p className="text-[10px] text-red-300/80 font-medium mt-0.5">
            Waiting to be claimed
          </p>
        </button>

        {/* My Assigned */}
        <button
          type="button"
          onClick={() => setActiveTab("assigned")}
          className={`p-4 rounded-3xl border text-left transition-all ${
            activeTab === "assigned"
              ? "bg-[#C07C4A]/25 border-[#C07C4A] shadow-lg shadow-[#C07C4A]/20"
              : "bg-[#140A07]/60 border-[#C07C4A]/15 hover:border-[#C07C4A]/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#FAF6F0]/60">
              My Active
            </span>
            <Coffee className="w-4 h-4 text-[#C07C4A]" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white mt-1">
            {summary.myAssignedCount}
          </p>
          <p className="text-[10px] text-[#C07C4A]/90 font-medium mt-0.5">
            Assigned in your flow
          </p>
        </button>

        {/* In Prep (Brewing) */}
        <button
          type="button"
          onClick={() => setActiveTab("preparing")}
          className={`p-4 rounded-3xl border text-left transition-all ${
            activeTab === "preparing"
              ? "bg-amber-500/20 border-amber-500 shadow-lg shadow-amber-950/30"
              : "bg-[#140A07]/60 border-[#C07C4A]/15 hover:border-amber-500/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#FAF6F0]/60">
              Brewing Now
            </span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white mt-1">
            {summary.myPreparingCount}
          </p>
          <p className="text-[10px] text-amber-300/80 font-medium mt-0.5">
            Under preparation
          </p>
        </button>

        {/* Ready for Pickup */}
        <button
          type="button"
          onClick={() => setActiveTab("ready")}
          className={`p-4 rounded-3xl border text-left transition-all ${
            activeTab === "ready"
              ? "bg-emerald-500/20 border-emerald-500 shadow-lg shadow-emerald-950/30"
              : "bg-[#140A07]/60 border-[#C07C4A]/15 hover:border-emerald-500/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#FAF6F0]/60">
              Ready
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white mt-1">
            {summary.myReadyCount}
          </p>
          <p className="text-[10px] text-emerald-300/80 font-medium mt-0.5">
            Awaiting pickup
          </p>
        </button>

        {/* Completed Today */}
        <button
          type="button"
          onClick={() => setActiveTab("completed")}
          className={`col-span-2 sm:col-span-1 p-4 rounded-3xl border text-left transition-all ${
            activeTab === "completed"
              ? "bg-blue-500/20 border-blue-500 shadow-lg shadow-blue-950/30"
              : "bg-[#140A07]/60 border-[#C07C4A]/15 hover:border-blue-500/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#FAF6F0]/60">
              Completed
            </span>
            <Sparkles className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white mt-1">
            {summary.myCompletedTodayCount}
          </p>
          <p className="text-[10px] text-blue-300/80 font-medium mt-0.5">
            Crafted today
          </p>
        </button>
      </div>

      {/* CONTROLS BAR: SEARCH, TABS & REFRESH */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#140A07]/60 p-3 rounded-3xl border border-[#C07C4A]/15 backdrop-blur-xl">
        {/* Tab Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: "all", label: "All Active" },
            { id: "unassigned", label: `Queue (${summary.unassignedCount})` },
            { id: "assigned", label: `Assigned (${summary.myAssignedCount})` },
            { id: "preparing", label: `Brewing (${summary.myPreparingCount})` },
            { id: "ready", label: `Ready (${summary.myReadyCount})` },
            { id: "completed", label: "Shift History" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? "bg-[#C07C4A] text-white shadow-md shadow-[#C07C4A]/20"
                  : "text-[#FAF6F0]/70 hover:text-white hover:bg-white/5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input & Manual Refresh */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#FAF6F0]/40" />
            <input
              type="text"
              placeholder="Search order # or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-black/40 border border-[#C07C4A]/20 text-xs text-white placeholder:text-[#FAF6F0]/30 focus:outline-none focus:border-[#C07C4A]"
            />
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            title="Refresh Orders"
            className="p-2.5 rounded-xl bg-black/40 border border-[#C07C4A]/20 text-[#FAF6F0]/70 hover:text-[#C07C4A] transition-all hover:bg-black/60"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin text-[#C07C4A]" : ""}`} />
          </button>
        </div>
      </div>

      {/* ORDERS GRID DISPLAY */}
      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-2 border-[#C07C4A] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#FAF6F0]/60 font-medium">
            Syncing live kitchen orders...
          </p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="py-20 text-center rounded-3xl bg-[#140A07]/40 border border-[#C07C4A]/10 p-8 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-[#C07C4A]/10 text-[#C07C4A] flex items-center justify-center mx-auto border border-[#C07C4A]/20">
            <Coffee className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-white">No Orders in this View</h3>
          <p className="text-xs text-[#FAF6F0]/50 max-w-sm mx-auto">
            {activeTab === "unassigned"
              ? "All incoming orders have been assigned or claimed!"
              : activeTab === "completed"
              ? "No completed orders recorded yet for today's shift."
              : "Your preparation queue is currently clear."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredOrders.map((order: any) => (
            <BaristaOrderCard
              key={order.id}
              order={order}
              onClaim={handleClaim}
              onUpdateStatus={handleUpdateStatus}
              isClaiming={isClaiming}
              isUpdating={isUpdating}
            />
          ))}
        </div>
      )}
    </div>
  );
}
