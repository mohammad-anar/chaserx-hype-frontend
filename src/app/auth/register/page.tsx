"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function RegisterPage() {
    const router = useRouter();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [errors, setErrors] = useState<{
        name?: string;
        email?: string;
        password?: string;
        confirm?: string;
    }>({});

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();

        // Basic Client Validation
        const newErrors: typeof errors = {};
        if (!name) {
            newErrors.name = "Full name is required";
        }
        if (!email) {
            newErrors.email = "Email address is required";
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = "Please enter a valid email address";
        }
        if (!password) {
            newErrors.password = "Password is required";
        } else if (password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }
        if (!confirm) {
            newErrors.confirm = "Confirm password is required";
        } else if (password !== confirm) {
            newErrors.confirm = "Passwords do not match";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error("Please fill in all fields correctly.");
            return;
        }

        setErrors({});
        setIsLoading(true);

        // Simulate signup timeout
        setTimeout(() => {
            setIsLoading(false);
            toast.success(`Account created! OTP code sent to ${email}`);
            // Redirect to verify account screen
            router.push(`/auth/submit-code?email=${encodeURIComponent(email)}&type=createAccount`);
        }, 1200);
    };

    return (
        <div className="w-full bg-[#140A07]/50 backdrop-blur-xl border border-[#C07C4A]/15 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-black/80 flex flex-col opacity-0 animate-scale-in">
            <div className="text-left mb-6 opacity-0 animate-fade-in-up delay-100">
                <h2 className="text-2xl font-bold text-white tracking-wide">Create Account</h2>
                <p className="text-xs text-[#FAF6F0]/60 mt-1 leading-relaxed">
                    Begin your journey into specialty coffee perfection.
                </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
                {/* Full Name Input */}
                <div className="space-y-1 text-left opacity-0 animate-fade-in-up delay-200">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#C07C4A]">
                        Full Name
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#FAF6F0]/40">
                            <User className="w-4 h-4" />
                        </div>
                        <input
                            type="text"
                            placeholder="Elias Thorne"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-black/20 text-[#FAF6F0] placeholder:text-[#FAF6F0]/30 focus:outline-none focus:ring-2 focus:ring-[#C07C4A]/40 focus:border-[#C07C4A] transition-all text-sm
                                ${errors.name ? "border-red-500/50 focus:ring-red-500/20" : "border-[#C07C4A]/25"}`}
                        />
                    </div>
                    {errors.name && (
                        <p className="text-[11px] text-red-400 font-semibold mt-0.5">{errors.name}</p>
                    )}
                </div>

                {/* Email Input */}
                <div className="space-y-1 text-left opacity-0 animate-fade-in-up delay-300">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#C07C4A]">
                        Email Address
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#FAF6F0]/40">
                            <Mail className="w-4 h-4" />
                        </div>
                        <input
                            type="email"
                            placeholder="elias@ritual.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-black/20 text-[#FAF6F0] placeholder:text-[#FAF6F0]/30 focus:outline-none focus:ring-2 focus:ring-[#C07C4A]/40 focus:border-[#C07C4A] transition-all text-sm
                                ${errors.email ? "border-red-500/50 focus:ring-red-500/20" : "border-[#C07C4A]/25"}`}
                        />
                    </div>
                    {errors.email && (
                        <p className="text-[11px] text-red-400 font-semibold mt-0.5">{errors.email}</p>
                    )}
                </div>

                {/* Password & Confirm Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 opacity-0 animate-fade-in-up delay-400">
                    {/* Password */}
                    <div className="space-y-1 text-left">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#C07C4A]">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={`w-full px-4 py-2.5 rounded-xl border bg-black/20 text-[#FAF6F0] placeholder:text-[#FAF6F0]/30 focus:outline-none focus:ring-2 focus:ring-[#C07C4A]/40 focus:border-[#C07C4A] transition-all text-sm
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

                    {/* Confirm */}
                    <div className="space-y-1 text-left">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#C07C4A]">
                            Confirm
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={confirm}
                                onChange={(e) => setConfirm(e.target.value)}
                                className={`w-full px-4 py-2.5 rounded-xl border bg-black/20 text-[#FAF6F0] placeholder:text-[#FAF6F0]/30 focus:outline-none focus:ring-2 focus:ring-[#C07C4A]/40 focus:border-[#C07C4A] transition-all text-sm
                                    ${errors.confirm ? "border-red-500/50 focus:ring-red-500/20" : "border-[#C07C4A]/25"}`}
                            />
                        </div>
                        {errors.confirm && (
                            <p className="text-[11px] text-red-400 font-semibold mt-0.5">{errors.confirm}</p>
                        )}
                    </div>
                </div>

                {/* Disclaimer Terms text */}
                <p className="text-[10px] text-[#FAF6F0]/50 leading-relaxed text-left py-2 opacity-0 animate-fade-in-up delay-500">
                    By clicking &quot;Join the Ritual,&quot; you agree to our Terms of Service and Privacy Policy regarding your craft profile and loyalty rewards.
                </p>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#C07C4A] hover:bg-[#A66637] active:scale-[0.98] disabled:bg-[#C07C4A]/50 text-white font-bold py-3.5 px-4 rounded-xl transition-all duration-300 uppercase tracking-widest text-xs shadow-lg shadow-[#C07C4A]/10 flex items-center justify-center gap-2 opacity-0 animate-fade-in-up delay-700"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Steeping details...</span>
                        </>
                    ) : (
                        <span>Sign Up</span>
                    )}
                </button>
            </form>

            {/* Footer Link */}
            <div className="text-center mt-6 text-xs text-[#FAF6F0]/60 opacity-0 animate-fade-in-up delay-1000">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-[#C07C4A] font-bold hover:underline transition-all">
                    Sign In
                </Link>
            </div>
        </div>
    );
}
