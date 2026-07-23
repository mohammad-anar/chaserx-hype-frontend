"use client";
import React, { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useVerifyEmailMutation, useVerifyOtpMutation, useResendOtpMutation } from "@/redux/features/auth/authApi";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

function SubmitCodeContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get("email") || "your email";
    const type = searchParams.get("type") || "createAccount"; // createAccount or resetPassword

    const [verifyEmailMutation] = useVerifyEmailMutation();
    const [verifyOtpMutation] = useVerifyOtpMutation();
    const [resendOtpMutation] = useResendOtpMutation();

    const [code, setCode] = useState<string[]>(Array(6).fill(""));
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const inputRefs = useRef<HTMLInputElement[]>([]);

    useEffect(() => {
        // Focus the first input field on load
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    const handleChange = (value: string, index: number) => {
        const val = value.replace(/[^0-9]/g, ""); // Only allow digits
        if (!val) return;

        const newCode = [...code];
        newCode[index] = val.substring(val.length - 1); // Get last digit
        setCode(newCode);

        // Shift focus to the next field if not the last one
        if (index < 5 && newCode[index]) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === "Backspace") {
            const newCode = [...code];
            if (!newCode[index] && index > 0) {
                // Focus previous input and clear it
                newCode[index - 1] = "";
                setCode(newCode);
                inputRefs.current[index - 1].focus();
            } else {
                newCode[index] = "";
                setCode(newCode);
            }
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData("text").replace(/[^0-9]/g, "").substring(0, 6);
        if (pasteData) {
            const pasteArray = pasteData.split("");
            const newCode = [...code];
            for (let i = 0; i < 6; i++) {
                if (pasteArray[i]) {
                    newCode[i] = pasteArray[i];
                }
            }
            setCode(newCode);
            const focusIndex = Math.min(pasteData.length, 5);
            inputRefs.current[focusIndex].focus();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const fullCode = code.join("");

        if (fullCode.length < 6) {
            toast.error("Please enter all 6 digits of the code.");
            return;
        }

        setIsLoading(true);

        try {
            if (type === "resetPassword") {
                const res = await verifyOtpMutation({ email, otp: fullCode }).unwrap();
                setIsLoading(false);
                const resetToken = res?.data?.resetToken || res?.resetToken || "";
                toast.success(res?.message || "Code verified successfully! Please choose a new password.");
                router.push(`/auth/reset-password?email=${encodeURIComponent(email)}&resetToken=${encodeURIComponent(resetToken)}`);
            } else {
                const res = await verifyEmailMutation({ email, otp: fullCode }).unwrap();
                setIsLoading(false);
                toast.success(res?.message || "Account verified successfully! You can now log in.");
                router.push("/auth/login");
            }
        } catch (err: any) {
            setIsLoading(false);
            const errorMessage = err?.data?.message || err?.message || "Invalid or expired code. Please try again.";
            toast.error(errorMessage);
        }
    };

    const handleResend = async () => {
        if (!email || email === "your email") {
            toast.error("Email address is missing.");
            return;
        }

        setIsResending(true);
        try {
            const res = await resendOtpMutation({ email }).unwrap();
            setIsResending(false);
            toast.success(res?.message || `A new verification code has been sent to ${email}`);
        } catch (err: any) {
            setIsResending(false);
            const errorMessage = err?.data?.message || err?.message || "Failed to resend verification code.";
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
                <h2 className="text-2xl font-bold text-white tracking-wide">Submit Code</h2>
                <p className="text-xs text-[#FAF6F0]/60 mt-2 leading-relaxed">
                    Enter the 6-digit code sent to your email to complete your access.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* OTP Inputs Grid */}
                <div className="grid grid-cols-6 gap-2 sm:gap-3 justify-center py-2 opacity-0 animate-fade-in-up delay-300">
                    {code.map((num, idx) => (
                        <input
                            key={idx}
                            ref={(el) => {
                                if (el) inputRefs.current[idx] = el;
                            }}
                            type="text"
                            maxLength={1}
                            value={num}
                            onKeyDown={(e) => handleKeyDown(e, idx)}
                            onChange={(e) => handleChange(e.target.value, idx)}
                            onPaste={handlePaste}
                            className="w-full aspect-square text-center text-xl font-bold rounded-xl border border-[#C07C4A]/30 bg-black/20 text-[#FAF6F0] focus:outline-none focus:ring-2 focus:ring-[#C07C4A]/40 focus:border-[#C07C4A] transition-all"
                        />
                    ))}
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#C07C4A] hover:bg-[#A66637] active:scale-[0.98] disabled:bg-[#C07C4A]/50 text-white font-bold py-3.5 px-4 rounded-xl transition-all duration-300 uppercase tracking-widest text-xs shadow-lg shadow-[#C07C4A]/10 flex items-center justify-center gap-2 opacity-0 animate-fade-in-up delay-500"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Verifying code...</span>
                        </>
                    ) : (
                        <span>Submit Code</span>
                    )}
                </button>
            </form>

            {/* Footer Link */}
            <div className="text-center mt-6 text-xs text-[#FAF6F0]/60 opacity-0 animate-fade-in-up delay-700">
                Didn&apos;t receive a code?{" "}
                <button 
                    type="button" 
                    onClick={handleResend}
                    disabled={isResending}
                    className="text-[#C07C4A] font-bold hover:underline transition-all cursor-pointer bg-transparent border-none p-0 disabled:opacity-50"
                >
                    {isResending ? "Resending..." : "Resend"}
                </button>
            </div>
        </div>
    );
}

export default function SubmitCodePage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-[#C07C4A]" />
            </div>
        }>
            <SubmitCodeContent />
        </Suspense>
    );
}
