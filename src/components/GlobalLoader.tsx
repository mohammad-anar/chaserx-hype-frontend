"use client";

import React from "react";
import { Coffee } from "lucide-react";

export default function GlobalLoader() {
    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0D0604] text-[#FAF6F0]">
            {/* Background ambient glow */}
            <div className="absolute w-72 h-72 bg-[#C07C4A]/10 rounded-full blur-3xl animate-pulse pointer-events-none" />

            <div className="relative flex flex-col items-center gap-6 p-8">
                {/* Coffee icon & animated ring container */}
                <div className="relative flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full border-2 border-[#C07C4A]/20 border-t-[#C07C4A] border-r-[#C07C4A]/80 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Coffee className="w-8 h-8 text-[#C07C4A] animate-pulse" />
                    </div>
                </div>

                {/* Brand title & loading text */}
                <div className="flex flex-col items-center text-center space-y-1">
                    <h1 className="text-xl font-bold tracking-wider text-white uppercase">
                        BEAN FIEN
                    </h1>
                    <p className="text-xs text-[#C07C4A] uppercase tracking-widest font-semibold animate-pulse">
                        Brewing your experience...
                    </p>
                </div>
            </div>
        </div>
    );
}
