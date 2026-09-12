"use client";

import React, { useState } from "react";
import { useAddOrderTipMutation } from "@/redux/features/order/orderApi";
import {
  Heart,
  Coffee,
  Sparkles,
  X,
  Smile,
  DollarSign,
  CheckCircle2,
  Loader2,
  Award,
  Gift,
} from "lucide-react";
import { toast } from "sonner";

interface TipModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: {
    id: string;
    orderNumber?: string;
    total?: number | string;
    tipAmount?: number | string;
    assignedBarista?: {
      id?: string;
      name?: string;
      station?: string;
      profileImage?: string;
    } | null;
  };
  onSuccess?: () => void;
}

const PRESET_AMOUNTS = [1, 2, 3, 5, 10];

export default function TipModal({
  isOpen,
  onClose,
  order,
  onSuccess,
}: TipModalProps) {
  const [selectedPreset, setSelectedPreset] = useState<number | "custom">(2);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [isSuccessState, setIsSuccessState] = useState(false);

  const [addTip, { isLoading }] = useAddOrderTipMutation();

  if (!isOpen) return null;

  const baristaName = order.assignedBarista?.name || "Your Artisan Barista";
  const baristaStation = order.assignedBarista?.station || "Specialty Bar";

  const effectiveAmount =
    selectedPreset === "custom" ? Number(customAmount) : selectedPreset;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isNaN(effectiveAmount) || effectiveAmount <= 0) {
      toast.error("Please select or enter a valid tip amount.");
      return;
    }

    try {
      await addTip({
        orderId: order.id,
        amount: Number(effectiveAmount.toFixed(2)),
        message: message.trim() || undefined,
        payType: "CARD",
      }).unwrap();

      setIsSuccessState(true);
      toast.success(`Thank you for tipping $${effectiveAmount.toFixed(2)}!`);

      setTimeout(() => {
        setIsSuccessState(false);
        onClose();
        if (onSuccess) onSuccess();
      }, 1800);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to add tip. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#1C0E08] via-[#140A07] to-[#0A0503] border border-[#C07C4A]/30 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-black text-[#FAF6F0] overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-40 h-40 rounded-full bg-[#C07C4A]/15 blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 text-[#FAF6F0]/60 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {isSuccessState ? (
          /* SUCCESS CELEBRATION */
          <div className="py-10 text-center space-y-4 animate-scale-in">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-950/40">
              <Heart className="w-8 h-8 fill-emerald-400 text-emerald-400 animate-bounce" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-white">
                Gratuity Sent with Love!
              </h3>
              <p className="text-xs text-[#FAF6F0]/70 max-w-xs mx-auto">
                Your ${effectiveAmount.toFixed(2)} tip has been routed to{" "}
                <strong className="text-[#C07C4A]">{baristaName}</strong>.
              </p>
            </div>
          </div>
        ) : (
          /* TIPPING FORM */
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Header: Barista badge & Title */}
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#C07C4A] to-[#8C4A1E] flex items-center justify-center text-white text-xl font-black mx-auto shadow-lg shadow-[#C07C4A]/20 border border-white/10">
                <Coffee className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">
                  Tip Your Barista
                </h3>
                <p className="text-xs text-[#FAF6F0]/60 mt-0.5">
                  Handcrafted with care by{" "}
                  <strong className="text-white">{baristaName}</strong> (
                  {baristaStation})
                </p>
              </div>
            </div>

            {/* Presets Selector */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#C07C4A] block text-center">
                Select Gratuity Amount
              </label>
              <div className="grid grid-cols-5 gap-2">
                {PRESET_AMOUNTS.map((amt) => {
                  const isSelected = selectedPreset === amt;
                  return (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setSelectedPreset(amt)}
                      className={`py-3 rounded-2xl font-black text-sm transition-all flex flex-col items-center justify-center border ${
                        isSelected
                          ? "bg-[#C07C4A] text-white border-[#C07C4A] shadow-lg shadow-[#C07C4A]/30 scale-105"
                          : "bg-black/40 text-[#FAF6F0]/80 border-white/10 hover:border-[#C07C4A]/40 hover:bg-white/5"
                      }`}
                    >
                      <span>${amt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Tip Option */}
              <div className="pt-2">
                {selectedPreset === "custom" ? (
                  <div className="relative">
                    <DollarSign className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C07C4A]" />
                    <input
                      type="number"
                      step="0.50"
                      min="0.50"
                      autoFocus
                      placeholder="Enter custom tip (e.g. 7.50)"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className="w-full pl-9 pr-20 py-2.5 rounded-xl bg-black/50 border border-[#C07C4A] text-white text-xs placeholder:text-[#FAF6F0]/30 focus:outline-none focus:ring-1 focus:ring-[#C07C4A]"
                    />
                    <button
                      type="button"
                      onClick={() => setSelectedPreset(2)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase px-2 py-1 rounded-lg bg-white/10 text-white/70 hover:text-white"
                    >
                      Presets
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPreset("custom");
                      setCustomAmount("");
                    }}
                    className="w-full py-2 text-center text-xs font-semibold text-[#C07C4A] hover:text-[#D49A6A] transition-colors"
                  >
                    + Enter a custom amount
                  </button>
                )}
              </div>
            </div>

            {/* Note / Message for Barista */}
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#FAF6F0]/60 flex items-center gap-1">
                <Smile className="w-3.5 h-3.5 text-[#C07C4A]" />
                <span>Say thanks (Optional message)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Amazing flat white, made my day! ☕"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={100}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder:text-[#FAF6F0]/30 focus:outline-none focus:border-[#C07C4A] transition-all"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || (selectedPreset === "custom" && !customAmount)}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#C07C4A] to-[#8C4A1E] hover:brightness-110 active:scale-[0.98] disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-[#C07C4A]/25 transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Gratuity...</span>
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4 fill-white text-white" />
                  <span>
                    Send ${isNaN(effectiveAmount) ? "0.00" : effectiveAmount.toFixed(2)} Tip
                  </span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
