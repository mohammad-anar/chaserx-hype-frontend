"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { logout, selectIsAuthenticated } from "@/redux/features/auth/authSlice";
import { ShoppingCart, ChevronDown } from "lucide-react";
import { useCart } from "@/hooks/useCart";

interface NavbarProps {
    theme?: "dark" | "light";
}

export default function Navbar({ theme = "light" }: NavbarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const { cart, setIsCartOpen, showNotification } = useCart();

    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [userName, setUserName] = useState("Admin");
    const [userRole, setUserRole] = useState("Super Admin");
    const [userPhoto, setUserPhoto] = useState("");

    // Load admin profile information on mount
    useEffect(() => {
        const savedName = localStorage.getItem("bf_admin_name");
        const savedRole = localStorage.getItem("bf_admin_role");
        const savedPhoto = localStorage.getItem("bf_admin_photo");
        if (savedName) setUserName(savedName);
        if (savedRole) setUserRole(savedRole);
        if (savedPhoto) setUserPhoto(savedPhoto);
    }, []);

    const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    const isDark = theme === "dark";

    const navLinks = [
        { href: "/", label: "Home" },
        { href: "/menu", label: "Menu" },
        { href: "/rewards", label: "Rewards" },
        { href: "/gift-cards", label: "Gift Cards" },
    ];

    const handleSignOut = () => {
        setIsProfileOpen(false);
        dispatch(logout());
        showNotification("Successfully logged out");
        router.push("/auth/login");
    };

    return (
        <header 
            className={`relative z-40 sticky top-0 transition-all duration-300 ${
                isDark 
                    ? "border-b border-white/[0.06] bg-[#080403]/60 backdrop-blur-xl" 
                    : "border-b border-[#2C1A14]/10 bg-[#FAF6F0]/90 backdrop-blur-md"
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
                    <div className={`w-11 h-11 rounded-full overflow-hidden flex items-center justify-center relative transition-transform duration-300 group-hover:scale-105 ${
                        isDark 
                            ? "bg-[#1E0E07] border-2 border-[#C07C4A]/60" 
                            : "bg-[#2C1711] border border-[#C07C4A]/40"
                    }`}>
                        <img 
                            src="/coffee_bean_mascot.png" 
                            alt="Bean Fien Logo" 
                            className="w-full h-full object-cover p-0.5" 
                        />
                    </div>
                    {!isDark && (
                        <div className="hidden sm:block text-left">
                            <span className="font-serif text-lg font-bold tracking-wider block leading-none text-[#2C1A14]">Bean Fien</span>
                            <span className="text-[9px] uppercase tracking-widest text-[#C07C4A] font-bold">Specialty Coffee</span>
                        </div>
                    )}
                </Link>

                {/* Desktop Menu — centered */}
                <nav className="hidden md:flex items-center gap-7 text-sm font-medium tracking-wide absolute left-1/2 -translate-x-1/2">
                    {navLinks.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`relative pb-0.5 transition-all duration-200 ${
                                    isActive
                                        ? isDark 
                                            ? "text-white font-semibold" 
                                            : "text-[#C07C4A] font-semibold"
                                        : isDark
                                            ? "text-[#C4B4A8]/80 hover:text-white font-normal"
                                            : "text-[#2C1A14]/70 hover:text-[#2C1A14] font-normal"
                                }`}
                            >
                                {link.label}
                                {isActive && (
                                    <span className={`absolute -bottom-0.5 left-0 right-0 h-[2px] rounded-full ${
                                        isDark ? "bg-[#E05A2B]" : "bg-[#C07C4A]"
                                    }`} />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Right utility buttons */}
                <div className="flex items-center gap-3 md:gap-4">
                    {/* Cart Button */}
                    <button 
                        onClick={() => setIsCartOpen(true)}
                        className={`p-2 rounded-full transition-colors relative group ${
                            isDark ? "hover:bg-white/8" : "hover:bg-[#2C1A14]/5"
                        }`}
                        aria-label="Open Cart"
                    >
                        <ShoppingCart className={`w-[22px] h-[22px] transition-colors ${
                            isDark 
                                ? "text-[#FAF6F0]/90 group-hover:text-white" 
                                : "text-[#2C1A14] group-hover:text-[#C07C4A]"
                        }`} />
                        {totalCartItems > 0 && (
                            <span className={`absolute -top-0.5 -right-0.5 text-[9px] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center ${
                                isDark 
                                    ? "bg-[#E05A2B] text-white" 
                                    : "bg-[#C07C4A] text-white"
                            }`}>
                                {totalCartItems}
                            </span>
                        )}
                    </button>

                    {/* Auth Button / Profile Dropdown */}
                    {isAuthenticated ? (
                        <div className="relative">
                            <button 
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold tracking-wide transition-all duration-200 ${
                                    isDark
                                        ? "bg-[#7B1E0E] hover:bg-[#9C2910] text-white shadow-md shadow-black/30"
                                        : "bg-[#2C120C] hover:bg-[#4A241A] text-[#FAF6F0]"
                                }`}
                            >
                                <div className="w-6 h-6 rounded-full overflow-hidden bg-[#C07C4A]/30 border border-[#C07C4A]/40 flex items-center justify-center">
                                    {userPhoto ? (
                                        <img src={userPhoto} alt="Admin" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-[9px] font-bold text-white">BF</span>
                                    )}
                                </div>
                                <span className="hidden md:inline-block">{userName}</span>
                                <ChevronDown className="w-3.5 h-3.5 hidden md:block opacity-70" />
                            </button>

                            {/* Dropdown Menu */}
                            {isProfileOpen && (
                                <div className="absolute right-0 mt-3 w-56 rounded-2xl border border-white/10 bg-[#1A0C08] shadow-2xl p-2 z-50">
                                    <div className="px-4 py-3 border-b border-white/5 text-left">
                                        <p className="text-xs font-bold uppercase tracking-wider text-[#E05A2B]">{userRole}</p>
                                        <p className="text-sm font-semibold text-white truncate">{userName}</p>
                                    </div>
                                    <div className="py-1.5 space-y-1">
                                        <Link 
                                            href="/admin" 
                                            onClick={() => setIsProfileOpen(false)}
                                            className="flex items-center w-full px-4 py-2.5 text-sm rounded-xl hover:bg-white/5 text-white hover:text-[#E05A2B] transition-all font-semibold"
                                        >
                                            Dashboard
                                        </Link>
                                        <Link 
                                            href="/admin/settings" 
                                            onClick={() => setIsProfileOpen(false)}
                                            className="flex items-center w-full px-4 py-2.5 text-sm rounded-xl hover:bg-white/5 text-white hover:text-[#E05A2B] transition-all font-semibold"
                                        >
                                            Settings
                                        </Link>
                                    </div>
                                    <div className="pt-1.5 border-t border-white/5">
                                        <button 
                                            onClick={handleSignOut}
                                            className="flex items-center w-full px-4 py-2.5 text-sm rounded-xl hover:bg-red-500/10 text-red-400 font-semibold text-left transition-colors"
                                        >
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link 
                            href="/auth/login"
                            className={`text-sm font-semibold tracking-wide px-5 py-2 rounded-full transition-all duration-200 text-center ${
                                isDark
                                    ? "bg-[#7B1E0E] hover:bg-[#9C2910] text-white shadow-md shadow-black/30"
                                    : "bg-[#2C120C] hover:bg-[#4A241A] text-[#FAF6F0]"
                            }`}
                        >
                            Sign In
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}
