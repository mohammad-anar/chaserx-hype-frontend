"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForgotPasswordMutation } from "@/redux/features/auth/authApi";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [forgotPasswordMutation] = useForgotPasswordMutation();

    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic Client Validation
        if (!email) {
            setError("Email address is required");
            toast.error("Please enter your email address.");
            return;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            setError("Please enter a valid email address");
            toast.error("Please enter a valid email address.");
            return;
        }

        setError("");
        setIsLoading(true);

        try {
            const res = await forgotPasswordMutation({ email }).unwrap();
            setIsLoading(false);
            toast.success(res?.message || `Recovery code sent to ${email}`);
            router.push(`/auth/submit-code?email=${encodeURIComponent(email)}&type=resetPassword`);
        } catch (err: any) {
            setIsLoading(false);
            const errorMessage = err?.data?.message || err?.message || "Failed to send reset code. Please try again.";
            toast.error(errorMessage);
        }
    };


    return (
        <div className="w-full bg-[#140A07]/50 backdrop-blur-xl border border-[#C07C4A]/15 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-black/80 flex flex-col relative opacity-0 animate-scale-in">
            {/* Back to Login */}
            <div className="text-left mb-4 opacity-0 animate-fade-in-up delay-100">
                <Link 
                    href="/auth/login" 
                    className="inline-flex items-center gap-2 text-xs font-semibold text-[#FAF6F0]/60 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Login</span>
                </Link>
            </div>

            <div className="text-left mb-6 opacity-0 animate-fade-in-up delay-200">
                <h2 className="text-2xl font-bold text-white tracking-wide">Forgot Password?</h2>
                <p className="text-xs text-[#FAF6F0]/60 mt-2 leading-relaxed">
                    Enter your email to receive a secure recovery key. We&apos;ll help you get back to your brew in no time.
                </p>
            </div>

            <form onSubmit={handleSendCode} className="space-y-5">
                {/* Email Input */}
                <div className="space-y-1.5 text-left opacity-0 animate-fade-in-up delay-300">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#C07C4A]">
                        Email Address
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#FAF6F0]/40">
                            <Mail className="w-4 h-4" />
                        </div>
                        <input
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-black/20 text-[#FAF6F0] placeholder:text-[#FAF6F0]/30 focus:outline-none focus:ring-2 focus:ring-[#C07C4A]/40 focus:border-[#C07C4A] transition-all text-sm
                                ${error ? "border-red-500/50 focus:ring-red-500/20" : "border-[#C07C4A]/25"}`}
                        />
                    </div>
                    {error && (
                        <p className="text-[11px] text-red-400 font-semibold mt-0.5">{error}</p>
                    )}
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-4 bg-[#C07C4A] hover:bg-[#A66637] active:scale-[0.98] disabled:bg-[#C07C4A]/50 text-white font-bold py-3.5 px-4 rounded-xl transition-all duration-300 uppercase tracking-widest text-xs shadow-lg shadow-[#C07C4A]/10 flex items-center justify-center gap-2 opacity-0 animate-fade-in-up delay-500"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Generating code...</span>
                        </>
                    ) : (
                        <span>Send Code</span>
                    )}
                </button>
            </form>
        </div>
    );
}
