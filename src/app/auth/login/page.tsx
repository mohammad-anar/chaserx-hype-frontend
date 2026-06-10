"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/redux/features/auth/authSlice";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
    const router = useRouter();
    const dispatch = useDispatch();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Basic Client Validation
        const newErrors: { email?: string; password?: string } = {};
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

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error("Please correct the errors on the form.");
            return;
        }

        setErrors({});
        setIsLoading(true);

        // Simulate login timeout
        setTimeout(() => {
            setIsLoading(false);
            
            // Set mock localStorage variables matching the profile details
            localStorage.setItem("bf_admin_name", "Elias Thorne");
            localStorage.setItem("bf_admin_role", "Super Admin");
            localStorage.setItem("bf_admin_photo", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250");
            
            // Dispatch credentials to authenticate the app guard
            dispatch(setCredentials({
                accessToken: "mock-bean-fien-access-token",
                role: "ADMIN"
            }));

            toast.success("Welcome back! Signed in successfully.");
            router.push("/admin");
        }, 1200);
    };

    return (
        <div className="w-full flex flex-col items-center">
            {/* Mascot Character Logo */}
            <div className="w-20 h-20 rounded-full bg-[#1E0F0B] border-2 border-[#C07C4A]/40 flex items-center justify-center p-2 mb-4 shadow-xl shadow-black/40 animate-fade-in">
                <img src="/logo.svg" alt="Bean Fien Mascot" className="w-full h-full object-contain" />
            </div>

            {/* Brand Title */}
            <h1 className="font-serif text-4xl sm:text-5xl font-black text-white tracking-wide mb-8 drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                Bean Fien
            </h1>

            {/* Frosted Glass Form Card */}
            <div className="w-full bg-[#140A07]/50 backdrop-blur-xl border border-[#C07C4A]/15 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-black/80 flex flex-col">
                <div className="text-left mb-6">
                    <h2 className="text-2xl font-bold text-white tracking-wide">Sign in</h2>
                    <p className="text-xs text-[#FAF6F0]/60 mt-1 leading-relaxed">
                        Begin your journey into specialty coffee perfection.
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                    {/* Email Input */}
                    <div className="space-y-1.5 text-left">
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
                                    ${errors.email ? "border-red-500/50 focus:ring-red-500/20" : "border-[#C07C4A]/25"}`}
                            />
                        </div>
                        {errors.email && (
                            <p className="text-[11px] text-red-400 font-semibold mt-0.5">{errors.email}</p>
                        )}
                    </div>

                    {/* Password Input */}
                    <div className="space-y-1.5 text-left">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#C07C4A]">
                            Password
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

                    {/* Actions Row */}
                    <div className="flex items-center justify-between text-xs pt-1">
                        <label className="flex items-center gap-2 cursor-pointer text-[#FAF6F0]/80 hover:text-white select-none">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={() => setRememberMe(!rememberMe)}
                                className="w-4 h-4 rounded border-[#C07C4A]/30 bg-black/20 accent-[#C07C4A] focus:ring-0 focus:ring-offset-0 cursor-pointer"
                            />
                            <span>Remember me</span>
                        </label>
                        <Link 
                            href="/auth/forgot-password" 
                            className="text-[#FAF6F0]/60 hover:text-[#C07C4A] transition-colors underline underline-offset-4 decoration-[#FAF6F0]/20 hover:decoration-[#C07C4A]"
                        >
                            Forgot Password?
                        </Link>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full mt-4 bg-[#C07C4A] hover:bg-[#A66637] disabled:bg-[#C07C4A]/50 text-white font-bold py-3.5 px-4 rounded-xl transition-all duration-300 uppercase tracking-widest text-xs shadow-lg shadow-[#C07C4A]/10 flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Signing in...</span>
                            </>
                        ) : (
                            <span>Sign In</span>
                        )}
                    </button>
                </form>

                {/* Footer Link */}
                <div className="text-center mt-8 text-xs text-[#FAF6F0]/60">
                    Don't have an account?{" "}
                    <Link href="/auth/register" className="text-[#C07C4A] font-bold hover:underline transition-all">
                        Create an account
                    </Link>
                </div>
            </div>
        </div>
    );
}
