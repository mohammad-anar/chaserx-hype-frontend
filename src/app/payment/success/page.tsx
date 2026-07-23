"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, ArrowRight, ShoppingBag, Home, FileText } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import ScrollReveal from "@/components/ScrollReveal";

function PaymentSuccessContent() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get("session_id");
    const orderNumber = searchParams.get("order_number");
    const orderId = searchParams.get("order_id");
    const transactionId = searchParams.get("transaction_id");

    const hasSession = Boolean(sessionId);

    return (
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
            <ScrollReveal variant="scaleIn">
                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-[#2C1A14]/10 space-y-8 relative overflow-hidden">
                    {/* Top Decorative Banner */}
                    <div className={`h-2 w-full absolute top-0 left-0 ${hasSession ? "bg-emerald-500" : "bg-amber-500"}`} />

                    {/* Icon Badge */}
                    <div className="flex justify-center">
                        {hasSession ? (
                            <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border-2 border-emerald-200 shadow-inner animate-bounce-short">
                                <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
                            </div>
                        ) : (
                            <div className="w-20 h-20 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center border-2 border-amber-200 shadow-inner">
                                <FileText className="w-10 h-10 stroke-[2]" />
                            </div>
                        )}
                    </div>

                    {/* Main Title & Subtitle */}
                    <div className="space-y-3">
                        <h1 className="font-serif text-3xl md:text-4xl font-extrabold text-[#2C1A14]">
                            {hasSession ? "Payment Successful!" : "Payment Details"}
                        </h1>
                        <p className="text-sm text-[#6B5E59] max-w-md mx-auto leading-relaxed">
                            {hasSession
                                ? "Thank you for your order! Your payment has been processed and your coffee is being prepared."
                                : "No active payment session was found for this request."}
                        </p>
                    </div>

                    {/* Summary Details Box */}
                    <div className="bg-[#FAF6F0] rounded-2xl p-5 border border-[#2C1A14]/10 space-y-3 text-left">
                        <div className="flex justify-between items-center text-xs pb-2 border-b border-[#2C1A14]/10">
                            <span className="text-[#6B5E59] font-medium">Order Number</span>
                            <span className="font-mono font-bold text-[#2C1A14] truncate max-w-[200px] sm:max-w-[280px]">
                                {orderNumber || "N/A"}
                            </span>
                        </div>
                        {/* <div className="flex justify-between items-center text-xs pb-2 border-b border-[#2C1A14]/10">
                            <span className="text-[#6B5E59] font-medium">Order ID</span>
                            <span className="font-mono font-bold text-[#2C1A14] truncate max-w-[200px] sm:max-w-[280px]">
                                {orderId || "N/A"}
                            </span>
                        </div> */}
                        <div className="flex justify-between items-center text-xs pb-2 border-b border-[#2C1A14]/10">
                            <span className="text-[#6B5E59] font-medium">Transaction ID</span>
                            <span className="font-mono font-bold text-[#2C1A14] truncate max-w-[200px] sm:max-w-[280px]">
                                {transactionId || "N/A"}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-xs pb-2 border-b border-[#2C1A14]/10">
                            <span className="text-[#6B5E59] font-medium">Session ID</span>
                            <span className="font-mono font-bold text-[#2C1A14] truncate max-w-[200px] sm:max-w-[280px]">
                                {sessionId || "N/A"}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-[#6B5E59] font-medium">Payment Status</span>
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${hasSession ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                                }`}>
                                {hasSession ? "Paid & Confirmed" : "N/A"}
                            </span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                        <Link
                            href="/menu"
                            className="px-6 py-3.5 rounded-xl bg-[#2A120C] hover:bg-[#4A241A] text-white text-xs font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:scale-[1.02]"
                        >
                            <ShoppingBag className="w-4 h-4" />
                            <span>Order More Coffee</span>
                        </Link>
                        <Link
                            href="/"
                            className="px-6 py-3.5 rounded-xl bg-white border border-[#2C1A14]/20 hover:bg-[#FAF6F0] text-[#2C1A14] text-xs font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2"
                        >
                            <Home className="w-4 h-4" />
                            <span>Back to Home</span>
                        </Link>
                    </div>
                </div>
            </ScrollReveal>
        </div>
    );
}

export default function PaymentSuccessPage() {
    return (
        <div className="min-h-screen text-[#2C1A14] bg-[#FAF6F0] relative selection:bg-[#C07C4A] selection:text-[#FAF6F0] flex flex-col justify-between">
            <Navbar theme="light" />

            <Suspense fallback={
                <div className="flex justify-center items-center py-32">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#8B4513]"></div>
                </div>
            }>
                <PaymentSuccessContent />
            </Suspense>

            <Footer theme="light" />
            <CartDrawer theme="light" />
        </div>
    );
}
