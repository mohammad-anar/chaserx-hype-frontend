"use client";

import React, { useState } from "react";
import QRCodeRenderer from "@/components/QRCodeRenderer";
import { X, Copy, Check, Sparkles, Award, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useGetMyLoyaltyProfileQuery } from "@/redux/features/loyalty/loyaltyApi";

interface LoyaltyQrModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function LoyaltyQrModal({ isOpen, onClose }: LoyaltyQrModalProps) {
    const { data: loyaltyData, isLoading } = useGetMyLoyaltyProfileQuery(undefined, { skip: !isOpen });
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const profile = loyaltyData?.data || {};
    const loyaltyCode = profile.loyaltyCode || "CH-XXXX-XXXX";
    const stars = profile.stars ?? 0;
    const name = profile.name || "Valued Member";

    const handleCopy = () => {
        if (loyaltyCode) {
            navigator.clipboard.writeText(loyaltyCode);
            setCopied(true);
            toast.success("Loyalty Code copied to clipboard!");
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-sm rounded-3xl bg-[#FAF6F0] border border-[#2C1A14]/15 shadow-2xl overflow-hidden font-sans text-left">
                {/* Header pattern banner */}
                <div className="bg-[#2C120C] text-white px-6 py-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#C07C4A]/20 rounded-full blur-2xl -mr-10 -mt-10" />
                    
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                        title="Close"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    <div className="space-y-1">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FAF6F0]/15 border border-white/20 text-[10px] font-bold tracking-widest text-[#C07C4A] uppercase">
                            <Sparkles className="w-3 h-3" />
                            <span>Member Card</span>
                        </div>
                        <h2 className="font-serif text-2xl font-bold tracking-tight text-white">
                            {name}
                        </h2>
                        <p className="text-xs text-white/70">Scan at counter to earn & redeem beans</p>
                    </div>
                </div>

                {/* Body Content */}
                <div className="p-6 space-y-6 text-center">
                    {/* QR Code Container */}
                    <div className="bg-white p-6 rounded-2xl border border-[#2C1A14]/10 shadow-inner flex flex-col items-center justify-center gap-3 relative mx-auto max-w-[240px]">
                        {isLoading ? (
                            <div className="w-48 h-48 flex items-center justify-center text-xs text-[#6B5E59] animate-pulse">
                                Loading QR Code...
                            </div>
                        ) : (
                            <QRCodeRenderer
                                value={loyaltyCode}
                                size={190}
                                fgColor="#2C120C"
                                bgColor="#FFFFFF"
                            />
                        )}
                        <div className="flex items-center gap-1 text-[10px] text-[#6B5E59] font-medium pt-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Permanent Loyalty QR</span>
                        </div>
                    </div>

                    {/* Member Code Chip */}
                    <div className="space-y-2">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-[#6B5E59] block">
                            Member Code
                        </span>
                        <div className="flex items-center justify-center gap-2">
                            <span className="px-4 py-2 bg-white border border-[#2C1A14]/15 rounded-xl font-mono text-base font-bold text-[#2C1A14] tracking-wider shadow-sm">
                                {loyaltyCode}
                            </span>
                            <button
                                onClick={handleCopy}
                                className="p-2.5 rounded-xl bg-[#FAF0ED] border border-[#F6DED6] hover:bg-[#F6DED6] text-[#C07C4A] transition-colors cursor-pointer"
                                title="Copy Code"
                            >
                                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {/* Live Balance Footer */}
                    <div className="bg-[#FAF0ED] rounded-2xl border border-[#F6DED6] p-4 flex items-center justify-between text-left">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white border border-[#C07C4A]/30 flex items-center justify-center text-[#C07C4A] shadow-sm">
                                <Award className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="text-[10px] uppercase font-bold tracking-wider text-[#6B5E59] block leading-none">
                                    Current Balance
                                </span>
                                <span className="font-serif text-xl font-bold text-[#2C1A14]">
                                    {stars.toLocaleString()} <span className="text-xs font-sans font-medium text-[#C07C4A]">Beans</span>
                                </span>
                            </div>
                        </div>

                        <span className="text-[11px] font-bold text-[#C07C4A] bg-white px-2.5 py-1 rounded-full border border-[#C07C4A]/20">
                            Active
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
