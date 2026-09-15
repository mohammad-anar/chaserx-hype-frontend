"use client";

import React, { useState } from "react";
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Coffee,
  Receipt,
  Boxes,
  RefreshCw,
  UserCheck,
  RotateCcw,
  Sliders,
} from "lucide-react";
import {
  useGetOrderAutomationStatusQuery,
  useRetryOrderAutomationMutation,
} from "@/redux/features/automation/automationApi";
import {
  useGetAllBaristasQuery,
  useAssignBaristaToOrderMutation,
} from "@/redux/features/barista/baristaApi";
import { toast } from "sonner";

interface OrderAutomationModalProps {
  orderId: string;
  orderNumber?: string;
  onClose: () => void;
}

export default function OrderAutomationModal({
  orderId,
  orderNumber,
  onClose,
}: OrderAutomationModalProps) {
  const [selectedBaristaId, setSelectedBaristaId] = useState<string>("");

  const {
    data: statusResponse,
    isLoading,
    isFetching,
    refetch,
  } = useGetOrderAutomationStatusQuery(orderId);

  const { data: baristasResponse } = useGetAllBaristasQuery();
  const [retryAutomation, { isLoading: isRetrying }] =
    useRetryOrderAutomationMutation();
  const [assignBarista, { isLoading: isAssigning }] =
    useAssignBaristaToOrderMutation();

  const automationData = statusResponse?.data;
  const baristas = (baristasResponse?.data || []).filter((b: any) => b.role !== "ADMIN");

  const handleRetry = async () => {
    try {
      await retryAutomation(orderId).unwrap();
      toast.success("Order automation restarted successfully");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to retry automation");
    }
  };

  const handleManualAssign = async () => {
    if (!selectedBaristaId) {
      toast.error("Please select a barista from the list");
      return;
    }
    try {
      await assignBarista({
        orderId,
        baristaId: selectedBaristaId,
      }).unwrap();
      toast.success("Barista reassigned successfully");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to reassign barista");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1E0F0B] border border-[#2C1711] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-6 p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200 text-left">
        {/* Header */}
        <div className="flex justify-between items-start pb-4 border-b border-[#2C1711]">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C07C4A] mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Order Automation & Inventory Pipeline</span>
            </div>
            <h3 className="font-serif text-2xl font-bold text-white">
              Order #{orderNumber || orderId.slice(0, 8)}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="p-2 hover:bg-[#2C1711] rounded-xl text-[#8E7E73] hover:text-white transition-colors cursor-pointer"
              title="Refresh Pipeline"
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#2C1711] rounded-xl text-[#8E7E73] hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="py-16 text-center space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin text-[#C07C4A] mx-auto" />
            <p className="text-xs text-[#8E7E73]">
              Loading automation telemetry...
            </p>
          </div>
        ) : automationData ? (
          <div className="space-y-6">
            {/* Quick Status Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Order Status */}
              <div className="p-3.5 rounded-2xl bg-[#140A07] border border-[#2C1711] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#8E7E73] block">
                  Order Status
                </span>
                <span className="text-xs font-bold text-[#10B981] bg-[#10B981]/15 border border-[#10B981]/30 px-2.5 py-0.5 rounded-full inline-block">
                  {automationData.currentStatus}
                </span>
              </div>

              {/* Assigned Barista */}
              <div className="p-3.5 rounded-2xl bg-[#140A07] border border-[#2C1711] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#8E7E73] block">
                  Assigned Barista
                </span>
                <span className="text-xs font-bold text-white block truncate">
                  {automationData.assignedBarista
                    ? `☕ ${automationData.assignedBarista.name}`
                    : "Unassigned"}
                </span>
              </div>

              {/* Invoice Number */}
              <div className="p-3.5 rounded-2xl bg-[#140A07] border border-[#2C1711] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#8E7E73] block">
                  Invoice Generated
                </span>
                <span className="text-xs font-bold text-[#EAD8C7] block truncate">
                  {automationData.invoice?.invoiceNumber || "Pending"}
                </span>
              </div>
            </div>

            {/* Automation Steps Pipeline */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#C07C4A] flex items-center gap-1.5">
                <Boxes className="w-4 h-4" /> Multi-Step Execution Flow
              </h4>

              <div className="space-y-2.5">
                {automationData.automationLogs?.length > 0 ? (
                  automationData.automationLogs.map((log, idx) => (
                    <div
                      key={log.id || idx}
                      className="p-3.5 rounded-2xl bg-[#140A07] border border-[#2C1711] flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="flex items-start gap-3">
                        <div className="pt-0.5">
                          {log.status === "SUCCESS" ? (
                            <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                          ) : log.status === "FAILED" ? (
                            <AlertCircle className="w-4 h-4 text-[#EF4444]" />
                          ) : (
                            <Clock className="w-4 h-4 text-[#F59E0B]" />
                          )}
                        </div>
                        <div className="space-y-0.5">
                          <p className="font-bold text-white">
                            {log.step.replace(/_/g, " ")}
                          </p>
                          {log.error && (
                            <p className="text-[11px] text-[#EF4444]">
                              {log.error}
                            </p>
                          )}
                          {log.details && (
                            <p className="text-[11px] text-[#8E7E73] truncate max-w-md">
                              {typeof log.details === "object"
                                ? JSON.stringify(log.details)
                                : String(log.details)}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="text-right whitespace-nowrap text-[10px] text-[#8E7E73]">
                        {log.durationMs ? `${log.durationMs}ms` : ""}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#8E7E73] py-3 text-center">
                    No automation logs recorded for this order yet.
                  </p>
                )}
              </div>
            </div>

            {/* Reserved Stock Movements */}
            {automationData.stockMovements?.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-[#2C1711]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#C07C4A] flex items-center gap-1.5">
                  <Coffee className="w-4 h-4" /> Reserved Recipe Ingredients
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {automationData.stockMovements.map((move) => (
                    <div
                      key={move.id}
                      className="p-2.5 rounded-xl bg-[#140A07] border border-[#2C1711] flex items-center justify-between text-xs"
                    >
                      <span className="text-white">
                        {move.ingredient?.name || "Ingredient"}
                      </span>
                      <span className="font-bold text-[#EAD8C7]">
                        {move.quantity} {move.ingredient?.unit || "units"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Manual Barista Override & Retry Action Bar */}
            <div className="p-4 rounded-2xl bg-[#140A07] border border-[#2C1711] space-y-3">
              <span className="text-xs font-bold uppercase text-[#A69385] block">
                Manual Barista Assignment / Retry
              </span>
              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={selectedBaristaId}
                  onChange={(e) => setSelectedBaristaId(e.target.value)}
                  className="flex-1 px-3 py-2.5 rounded-xl bg-[#1E0F0B] border border-[#2C1711] text-xs text-white focus:outline-none focus:border-[#C07C4A]"
                >
                  <option value="">Choose Barista to Assign...</option>
                  {baristas.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.station || "Main"} • {b.activeOrderCount} orders)
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={handleManualAssign}
                  disabled={isAssigning || !selectedBaristaId}
                  className="px-4 py-2.5 rounded-xl bg-[#C07C4A] hover:bg-[#D48D5B] text-xs font-bold text-[#140A07] transition-all cursor-pointer disabled:opacity-50"
                >
                  {isAssigning ? "Assigning..." : "Assign"}
                </button>

                <button
                  type="button"
                  onClick={handleRetry}
                  disabled={isRetrying}
                  className="px-4 py-2.5 rounded-xl bg-[#2C1711] hover:bg-[#3E1F1F] text-xs font-bold text-white border border-[#3E1F1F] transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{isRetrying ? "Retrying..." : "Retry Pipeline"}</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-[#8E7E73]">
            Unable to load order automation data.
          </div>
        )}
      </div>
    </div>
  );
}
