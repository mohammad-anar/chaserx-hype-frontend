"use client";

import React, { useState, useEffect } from "react";
import {
  useGetMyBaristaProfileQuery,
  useUpdateMyBaristaProfileMutation,
} from "@/redux/features/barista/baristaApi";
import {
  User,
  Coffee,
  ChefHat,
  Award,
  Sparkles,
  Phone,
  Mail,
  Save,
  CheckCircle2,
  Clock,
  Flame,
  ShieldCheck,
  Layers,
  Activity,
  HeartHandshake,
} from "lucide-react";
import { toast } from "sonner";

const AVAILABLE_STATIONS = [
  "Espresso Main Bar",
  "Pour-Over & Manual Drip",
  "Cold Brew & Nitro Station",
  "Blended, Frappe & Pastry Bar",
  "Roastery & Quality Station",
];

export default function BaristaProfilePage() {
  const { data: profileRes, isLoading, isFetching, refetch } = useGetMyBaristaProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateMyBaristaProfileMutation();

  const profile = profileRes?.data;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [station, setStation] = useState("Espresso Main Bar");
  const [isAvailable, setIsAvailable] = useState(true);

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setPhone(profile.phone || "");
      setStation(profile.station || "Espresso Main Bar");
      setIsAvailable(profile.isAvailable ?? true);
    }
  }, [profile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    try {
      await updateProfile({
        name,
        phone,
        station,
        isAvailable,
      }).unwrap();
      toast.success("Barista profile & shift settings updated successfully!");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update profile");
    }
  };

  const skillTitle = (level: number = 5) => {
    if (level >= 9) return "Master Coffee Sommelier";
    if (level >= 7) return "Senior Artisan Barista";
    if (level >= 5) return "Specialty Coffee Craftsman";
    return "Junior Barista Apprentice";
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-10 h-10 border-2 border-[#C07C4A] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-[#FAF6F0]/60 font-medium">
          Loading barista profile & metrics...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
      {/* HEADER & HERO SUMMARY */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1C0E08] via-[#140A07] to-[#0A0503] p-6 sm:p-8 border border-[#C07C4A]/25 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 rounded-full bg-[#C07C4A]/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          {/* Barista Avatar & Level */}
          <div className="relative">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-[#C07C4A] to-[#6E3614] flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-[#C07C4A]/20 border-2 border-white/10">
              {profile?.name ? profile.name.charAt(0).toUpperCase() : "B"}
            </div>
            <div className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-black uppercase tracking-wider shadow-md flex items-center gap-1">
              <Award className="w-3 h-3 text-black" />
              <span>Lv {profile?.skillLevel || 5}</span>
            </div>
          </div>

          {/* Barista Info */}
          <div className="flex-1 space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                {profile?.name || "Barista"}
              </h1>
              <span className="px-3 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#C07C4A]/20 text-[#C07C4A] border border-[#C07C4A]/30">
                {profile?.role || "BARISTA"}
              </span>
            </div>
            <p className="text-xs text-[#FAF6F0]/70 font-medium">
              {skillTitle(profile?.skillLevel || 5)} · {profile?.station || "Espresso Main Bar"}
            </p>
            <p className="text-[11px] text-[#FAF6F0]/40 mt-1">
              Member ID: {profile?.id}
            </p>
          </div>

          {/* Availability Status Badge */}
          <div>
            <span
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl border text-xs font-bold ${
                isAvailable
                  ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                  : "bg-amber-500/15 border-amber-500/30 text-amber-400"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isAvailable ? "bg-emerald-400 animate-ping" : "bg-amber-400"
                }`}
              />
              <span>{isAvailable ? "Online & Crafting" : "On Break"}</span>
            </span>
          </div>
        </div>
      </div>

      {/* SHIFT & LIFETIME METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-[#140A07]/60 border border-[#C07C4A]/15 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FAF6F0]/60">
              Active In-Flight
            </span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-3xl font-black text-white mt-2">
            {profile?.metrics?.activeOrdersCount || 0}
          </p>
          <p className="text-[11px] text-[#FAF6F0]/50 mt-1">
            Orders currently assigned to you
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-[#140A07]/60 border border-[#C07C4A]/15 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FAF6F0]/60">
              Completed Today
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-black text-white mt-2">
            {profile?.metrics?.completedTodayCount || 0}
          </p>
          <p className="text-[11px] text-[#FAF6F0]/50 mt-1">
            Cups brewed during today&apos;s shift
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-[#140A07]/60 border border-[#C07C4A]/15 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FAF6F0]/60">
              Total Lifetime
            </span>
            <Sparkles className="w-4 h-4 text-[#C07C4A]" />
          </div>
          <p className="text-3xl font-black text-white mt-2">
            {profile?.metrics?.totalCompletedCount || 0}
          </p>
          <p className="text-[11px] text-[#FAF6F0]/50 mt-1">
            Total handcrafted coffee orders
          </p>
        </div>
      </div>

      {/* PROFILE & SHIFT SETTINGS FORM */}
      <form
        onSubmit={handleSaveProfile}
        className="rounded-3xl bg-[#140A07]/60 border border-[#C07C4A]/20 p-6 sm:p-8 backdrop-blur-xl space-y-6 shadow-xl"
      >
        <div className="flex items-center gap-2.5 pb-4 border-b border-white/10">
          <ChefHat className="w-5 h-5 text-[#C07C4A]" />
          <div>
            <h2 className="text-base font-bold text-white">Shift & Station Settings</h2>
            <p className="text-xs text-[#FAF6F0]/50">
              Control your station routing and shift availability
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Shift Availability Switch */}
          <div className="sm:col-span-2 p-4 rounded-2xl bg-black/40 border border-[#C07C4A]/20 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-white">Shift Availability</p>
              <p className="text-xs text-[#FAF6F0]/60 mt-0.5">
                Toggle whether the automated dispatcher routes new orders to your station.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAvailable(!isAvailable)}
              className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${
                isAvailable ? "bg-[#C07C4A]" : "bg-white/15"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                  isAvailable ? "translate-x-8" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Assigned Station Selector */}
          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[#C07C4A]">
              Assigned Kitchen Station
            </label>
            <select
              value={station}
              onChange={(e) => setStation(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-black/40 border border-[#C07C4A]/25 text-white text-xs focus:outline-none focus:border-[#C07C4A] transition-all"
            >
              {AVAILABLE_STATIONS.map((st) => (
                <option key={st} value={st} className="bg-[#140A07] text-white">
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[#C07C4A]">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#FAF6F0]/40" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Barista Name"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/40 border border-[#C07C4A]/25 text-white text-xs placeholder:text-[#FAF6F0]/30 focus:outline-none focus:border-[#C07C4A] transition-all"
              />
            </div>
          </div>

          {/* Phone Number */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[#C07C4A]">
              Contact Phone
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#FAF6F0]/40" />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/40 border border-[#C07C4A]/25 text-white text-xs placeholder:text-[#FAF6F0]/30 focus:outline-none focus:border-[#C07C4A] transition-all"
              />
            </div>
          </div>

          {/* Email Address (Read-only) */}
          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[#C07C4A]">
              Email Address (Login Account)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#FAF6F0]/40" />
              <input
                type="email"
                value={profile?.email || ""}
                disabled
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/20 border border-white/10 text-[#FAF6F0]/50 text-xs cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4 border-t border-white/10">
          <button
            type="submit"
            disabled={isUpdating}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#C07C4A] to-[#A66637] hover:brightness-110 active:scale-[0.98] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#C07C4A]/20 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{isUpdating ? "Saving..." : "Save Shift Settings"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
