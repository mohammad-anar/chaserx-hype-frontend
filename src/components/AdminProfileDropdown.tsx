"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/redux/hooks";
import { logout } from "@/redux/features/auth/authSlice";
import { toast } from "sonner";
import { Settings, User, LogOut, ChevronDown, ExternalLink } from "lucide-react";

export default function AdminProfileDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const [displayName, setDisplayName] = useState("Admin");
    const [roleTitle, setRoleTitle] = useState("Super Admin");
    const [email, setEmail] = useState("admin@beanfien.com");
    const [adminPhoto, setAdminPhoto] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const dispatch = useAppDispatch();

    const loadProfile = () => {
        const savedName = localStorage.getItem("bf_admin_name");
        const savedRole = localStorage.getItem("bf_admin_role");
        const savedEmail = localStorage.getItem("bf_admin_email");
        const savedPhoto = localStorage.getItem("bf_admin_photo");

        if (savedName) setDisplayName(savedName);
        if (savedRole) setRoleTitle(savedRole);
        if (savedEmail) setEmail(savedEmail);
        if (savedPhoto) setAdminPhoto(savedPhoto);
    };

    useEffect(() => {
        loadProfile();
        window.addEventListener("adminProfileUpdated", loadProfile);
        return () => window.removeEventListener("adminProfileUpdated", loadProfile);
    }, []);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        setIsOpen(false);
        dispatch(logout());
        toast.success("Successfully signed out");
        router.push("/auth/login");
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Profile Button Pill */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 px-3 py-1.5 rounded-xl border border-border bg-[#F3ECE3]/40 dark:bg-card hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors text-left cursor-pointer shadow-sm focus:outline-none"
                title="Admin Profile Menu"
            >
                <div className="w-8 h-8 rounded-full overflow-hidden bg-primary/10 border border-primary/20 flex items-center justify-center relative flex-shrink-0">
                    {adminPhoto ? (
                        <img src={adminPhoto} alt={displayName} className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-xs font-bold text-primary uppercase">BF</span>
                    )}
                </div>
                <div className="hidden sm:block text-left">
                    <h4 className="text-xs font-bold leading-tight text-[#2C1A14] dark:text-white truncate max-w-[110px]">{displayName}</h4>
                    <p className="text-[10px] text-muted-foreground truncate max-w-[110px]">{roleTitle}</p>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown Menu Overlay */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-[#1E0F0B] border border-border/80 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    {/* Header info */}
                    <div className="p-4 border-b border-border/30 bg-[#FAF6F0]/60 dark:bg-zinc-900/60 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                            {adminPhoto ? (
                                <img src={adminPhoto} alt={displayName} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-sm font-bold text-primary uppercase">BF</span>
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-extrabold text-[#2C1A14] dark:text-white truncate">{displayName}</h4>
                            <p className="text-[10px] text-primary font-bold uppercase tracking-wider truncate">{roleTitle}</p>
                            <p className="text-[11px] text-muted-foreground truncate">{email}</p>
                        </div>
                    </div>

                    {/* Links */}
                    <div className="p-2 space-y-1">
                        <Link
                            href="/admin/settings?profile=true"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-foreground hover:bg-[#FAF6F0] dark:hover:bg-zinc-800 transition-colors"
                        >
                            <User className="w-4 h-4 text-primary" />
                            <span>Edit Profile</span>
                        </Link>

                        <Link
                            href="/admin/settings"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-foreground hover:bg-[#FAF6F0] dark:hover:bg-zinc-800 transition-colors"
                        >
                            <Settings className="w-4 h-4 text-amber-500" />
                            <span>Admin Settings</span>
                        </Link>

                        <Link
                            href="/"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-foreground hover:bg-[#FAF6F0] dark:hover:bg-zinc-800 transition-colors"
                        >
                            <ExternalLink className="w-4 h-4 text-blue-500" />
                            <span>View Storefront</span>
                        </Link>
                    </div>

                    {/* Logout Footer Button */}
                    <div className="p-2 border-t border-border/30 bg-[#FAF6F0]/30 dark:bg-zinc-900/30">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/60 font-bold text-xs transition-colors cursor-pointer"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Sign Out</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
