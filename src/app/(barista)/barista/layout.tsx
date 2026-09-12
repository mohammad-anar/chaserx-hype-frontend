"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { logout, selectUser, selectRole } from "@/redux/features/auth/authSlice";
import { useAppSelector } from "@/redux/hooks";
import BaristaGuard from "@/providers/BaristaGuard";
import {
  useGetMyBaristaProfileQuery,
  useUpdateMyBaristaProfileMutation,
} from "@/redux/features/barista/baristaApi";
import {
  Coffee,
  ChefHat,
  Bell,
  BellOff,
  User,
  LogOut,
  Sparkles,
  Layers,
  CheckCircle2,
  PauseCircle,
  PlayCircle,
  Volume2,
  VolumeX,
  Shield,
  Clock,
  Flame,
} from "lucide-react";
import { toast } from "sonner";

export default function BaristaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const currentUser = useAppSelector(selectUser);
  const userRole = useAppSelector(selectRole)?.toUpperCase();

  const { data: profileRes, isLoading: isProfileLoading, refetch } = useGetMyBaristaProfileQuery();
  const [updateProfile, { isLoading: isUpdatingStatus }] = useUpdateMyBaristaProfileMutation();

  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const profile = profileRes?.data;
  const isAvailable = profile?.isAvailable ?? true;
  const currentStation = profile?.station || "Espresso Main Bar";

  // Test / play sound chime using Web Audio API
  const playChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch (e) {
      console.error("Audio error:", e);
    }
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    if (next) {
      playChime();
      toast.success("Order sound alerts enabled");
    } else {
      toast.info("Order sound alerts muted");
    }
  };

  const handleToggleAvailability = async () => {
    try {
      const nextStatus = !isAvailable;
      await updateProfile({ isAvailable: nextStatus }).unwrap();
      toast.success(
        nextStatus
          ? "You are now Active and receiving orders!"
          : "Shift paused: You are marked as On Break."
      );
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update availability");
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Signed out successfully");
    router.push("/auth/login");
  };

  return (
    <BaristaGuard>
      <div className="min-h-screen bg-[#0A0503] text-[#FAF6F0] flex flex-col font-sans selection:bg-[#C07C4A]/30 selection:text-white">
        {/* TOP BAR / BARISTA KDS HEADER */}
        <header className="sticky top-0 z-50 bg-[#120805]/90 backdrop-blur-xl border-b border-[#C07C4A]/20 px-4 sm:px-6 lg:px-8 py-3.5 transition-all">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 sm:gap-4">
            {/* Brand & Portal Title */}
            <div className="flex items-center gap-3">
              <Link
                href="/barista"
                className="flex items-center gap-2.5 group transition-transform active:scale-95"
              >
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#C07C4A] to-[#8C4A1E] flex items-center justify-center shadow-lg shadow-[#C07C4A]/20 group-hover:scale-105 transition-transform">
                  <Coffee className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black tracking-wider text-white uppercase font-serif">
                      CHASER <span className="text-[#C07C4A]">X</span> HYPE
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#C07C4A]/20 text-[#C07C4A] border border-[#C07C4A]/30">
                      KDS Portal
                    </span>
                  </div>
                  <p className="text-[11px] text-[#FAF6F0]/50 font-medium">
                    Specialty Kitchen Display System
                  </p>
                </div>
              </Link>
            </div>

            {/* Navigation Tabs */}
            <nav className="flex items-center gap-1.5 bg-[#1B0D08]/80 p-1 rounded-2xl border border-[#C07C4A]/15">
              <Link
                href="/barista"
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  pathname === "/barista"
                    ? "bg-[#C07C4A] text-white shadow-md shadow-[#C07C4A]/20"
                    : "text-[#FAF6F0]/70 hover:text-white hover:bg-white/5"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Live Orders</span>
              </Link>

              <Link
                href="/barista/profile"
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  pathname === "/barista/profile"
                    ? "bg-[#C07C4A] text-white shadow-md shadow-[#C07C4A]/20"
                    : "text-[#FAF6F0]/70 hover:text-white hover:bg-white/5"
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Shift & Profile</span>
              </Link>
            </nav>

            {/* Shift Controls & Barista Info */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              {/* Station Badge */}
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black/40 border border-[#C07C4A]/20 text-[11px] text-[#FAF6F0]/80">
                <ChefHat className="w-3.5 h-3.5 text-[#C07C4A]" />
                <span className="font-semibold">{currentStation}</span>
              </div>

              {/* Sound Alerts Toggle */}
              <button
                type="button"
                onClick={toggleSound}
                title={soundEnabled ? "Mute order chimes" : "Enable order chimes"}
                className={`p-2 rounded-xl border transition-all ${
                  soundEnabled
                    ? "bg-[#C07C4A]/15 border-[#C07C4A]/30 text-[#C07C4A] hover:bg-[#C07C4A]/25"
                    : "bg-black/30 border-white/10 text-[#FAF6F0]/40 hover:text-white"
                }`}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              {/* Shift Availability Switch Button */}
              <button
                type="button"
                disabled={isUpdatingStatus || isProfileLoading}
                onClick={handleToggleAvailability}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                  isAvailable
                    ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25"
                    : "bg-amber-500/15 border-amber-500/30 text-amber-400 hover:bg-amber-500/25"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isAvailable ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                  }`}
                />
                <span>{isAvailable ? "Active (On Shift)" : "On Break"}</span>
              </button>

              {/* Admin Switch (if admin) */}
              {userRole === "ADMIN" && (
                <Link
                  href="/admin"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 hover:bg-purple-500/25 text-xs font-bold transition-all"
                  title="Switch to Admin Dashboard"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin</span>
                </Link>
              )}

              {/* Barista User badge & Sign Out */}
              <div className="flex items-center gap-2 pl-2 border-l border-white/10">
                <div className="hidden sm:block text-right">
                  <p className="text-xs font-bold text-white leading-tight">
                    {profile?.name || currentUser?.name || "Barista"}
                  </p>
                  <p className="text-[10px] text-[#FAF6F0]/50 font-medium capitalize">
                    {profile?.role?.toLowerCase() || "Barista"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* MAIN BODY CONTENT */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </BaristaGuard>
  );
}
