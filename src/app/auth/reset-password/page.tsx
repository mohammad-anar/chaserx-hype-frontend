"use client";
import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

function ResetPasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get("email") || "";

    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});

    const handleReset = (e: React.FormEvent) => {
        e.preventDefault();

        // Basic Client Validation
        const newErrors: typeof errors = {};
        if (!password) {
            newErrors.password = "New password is required";
        } else if (password.length < 8) {
            newErrors.password = "Password must be at least 8 characters";
        }
        if (!confirm) {
            newErrors.confirm = "Please confirm your password";
        } else if (password !== confirm) {
            newErrors.confirm = "Passwords do not match";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error("Please fill in the fields correctly.");
            return;
        }

        setErrors({});
        setIsLoading(true);

        // Simulate password reset
        setTimeout(() => {
            setIsLoading(false);
            toast.success("Password reset successfully! Please login with your new password.");
            router.push("/auth/login");
        }, 1200);
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
                <h2 className="text-2xl font-bold text-white tracking-wide">Reset Password</h2>
                <p className="text-xs text-[#FAF6F0]/60 mt-2 leading-relaxed">
                    Choose a strong new password to protect your account.
                </p>
            </div>

            <form onSubmit={handleReset} className="space-y-5">
                {/* Password Input */}
                <div className="space-y-1.5 text-left opacity-0 animate-fade-in-up delay-300">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#C07C4A]">
                        New Password
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#FAF6F0]/40">
                            <Lock className="w-4 h-4" />
                        </div>
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={`w-full pl-10 pr-12 py-3 rounded-xl border bg-black/20 text-[#FAF6F0] placeholder:text-[#FAF6F0]/30 focus:outline-none focus:ring-2 focus:ring-[#C07C4A]/40 focus:border-[#C07C4A] transition-all text-sm
                                ${errors.password ? "border-red-500/50 focus:ring-red-500/20" : "border-[#C07C4A]/25"}`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#FAF6F0]/40 hover:text-white transition-colors"
                        >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                    {errors.password && (
                        <p className="text-[11px] text-red-400 font-semibold mt-0.5">{errors.password}</p>
                    )}
                </div>

                {/* Confirm Input */}
                <div className="space-y-1.5 text-left opacity-0 animate-fade-in-up delay-400">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#C07C4A]">
                        Confirm Password
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#FAF6F0]/40">
                            <Lock className="w-4 h-4" />
                        </div>
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-black/20 text-[#FAF6F0] placeholder:text-[#FAF6F0]/30 focus:outline-none focus:ring-2 focus:ring-[#C07C4A]/40 focus:border-[#C07C4A] transition-all text-sm
                                ${errors.confirm ? "border-red-500/50 focus:ring-red-500/20" : "border-[#C07C4A]/25"}`}
                        />
                    </div>
                    {errors.confirm && (
                        <p className="text-[11px] text-red-400 font-semibold mt-0.5">{errors.confirm}</p>
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
                            <span>Resetting password...</span>
                        </>
                    ) : (
                        <span>Reset Password</span>
                    )}
                </button>
            </form>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-[#C07C4A]" />
            </div>
        }>
            <ResetPasswordContent />
        </Suspense>
    );
}
