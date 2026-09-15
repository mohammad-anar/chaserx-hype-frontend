"use client";

import React, { useState, useMemo } from "react";
import NotificationDropdown from "@/components/NotificationDropdown";
import AdminProfileDropdown from "@/components/AdminProfileDropdown";
import {
  Users,
  UserCheck,
  Coffee,
  Sparkles,
  Pencil,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  Sliders,
  X,
  Plus,
  UserPlus,
  Loader2,
} from "lucide-react";
import {
  useGetAllBaristasQuery,
  useCreateBaristaMutation,
  useUpdateBaristaProfileMutation,
  Barista,
} from "@/redux/features/barista/baristaApi";
import { toast } from "sonner";

export default function AdminBaristasPage() {
  const [searchTerm, setSearchTerm] = useState("");

  // Edit Barista state
  const [editingBarista, setEditingBarista] = useState<Barista | null>(null);
  const [editSkillLevel, setEditSkillLevel] = useState<number>(5);
  const [editStation, setEditStation] = useState<string>("");
  const [editIsAvailable, setEditIsAvailable] = useState<boolean>(true);

  // Create Barista state
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newPassword, setNewPassword] = useState("Barista123@");
  const [newStation, setNewStation] = useState("Espresso Main Bar");
  const [newSkillLevel, setNewSkillLevel] = useState<number>(7);

  const { data: baristaResponse, isLoading, isFetching, refetch } = useGetAllBaristasQuery();
  const [createBarista, { isLoading: isCreating }] = useCreateBaristaMutation();
  const [updateBarista, { isLoading: isUpdating }] = useUpdateBaristaProfileMutation();

  const baristas: Barista[] = useMemo(
    () => (baristaResponse?.data || []).filter((b: any) => b.role !== "ADMIN"),
    [baristaResponse]
  );

  const stats = useMemo(() => {
    const total = baristas.length;
    const available = baristas.filter((b) => b.isAvailable).length;
    const totalActiveOrders = baristas.reduce(
      (sum, b) => sum + (b.activeOrderCount || 0),
      0
    );
    const avgSkill =
      total > 0
        ? (
            baristas.reduce((sum, b) => sum + (b.skillLevel || 5), 0) / total
          ).toFixed(1)
        : "5.0";

    return { total, available, totalActiveOrders, avgSkill };
  }, [baristas]);

  const filteredBaristas = useMemo(() => {
    return baristas.filter((b) => {
      return (
        !searchTerm ||
        b.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.station?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [baristas, searchTerm]);

  const openEditModal = (b: Barista) => {
    setEditingBarista(b);
    setEditSkillLevel(b.skillLevel || 5);
    setEditStation(b.station || "Espresso Main");
    setEditIsAvailable(b.isAvailable);
  };

  const handleCreateBarista = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) {
      toast.error("Name and email are required");
      return;
    }

    try {
      await createBarista({
        name: newName.trim(),
        email: newEmail.trim(),
        phone: newPhone.trim() || undefined,
        password: newPassword.trim() || "Barista123@",
        station: newStation.trim() || "Espresso Main Bar",
        skillLevel: Number(newSkillLevel),
      }).unwrap();

      toast.success(`Barista ${newName} created successfully!`);
      setIsAddModalOpen(false);
      setNewName("");
      setNewEmail("");
      setNewPhone("");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to create barista");
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBarista) return;

    try {
      await updateBarista({
        id: editingBarista.id,
        skillLevel: Number(editSkillLevel),
        station: editStation.trim() || undefined,
        isAvailable: editIsAvailable,
      }).unwrap();

      toast.success(`Updated ${editingBarista.name}'s profile successfully`);
      setEditingBarista(null);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update barista profile");
    }
  };

  const toggleAvailability = async (b: Barista) => {
    try {
      await updateBarista({
        id: b.id,
        isAvailable: !b.isAvailable,
      }).unwrap();
      toast.success(
        `${b.name} is now ${!b.isAvailable ? "Available" : "Offline"}`
      );
    } catch (err: any) {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="flex-1 p-4 md:p-8 space-y-6 bg-[#FAF6F0] dark:bg-background min-h-screen text-foreground transition-colors duration-300 text-left">
      {/* Top Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8B4513] dark:text-[#C07C4A] mb-1">
            <Users className="w-3.5 h-3.5" />
            <span>Staff & Barista Workload Engine</span>
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[#2C1A14] dark:text-white">
            Barista Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor barista stations, availability status, active order loads, and auto-dispatch scoring.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2 rounded-xl border border-border bg-white dark:bg-card hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors text-muted-foreground hover:text-foreground"
            title="Refresh Baristas"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin text-primary" : ""}`} />
          </button>
          <NotificationDropdown />
          <AdminProfileDropdown />
        </div>
      </header>

      {/* KPI Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Baristas */}
        <div className="bg-white dark:bg-card p-6 rounded-2xl border border-border/60 shadow-sm hover:shadow-md transition-all duration-300 group">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-[#8B4513]/10 dark:bg-[#C07C4A]/10 text-[#8B4513] dark:text-[#C07C4A] rounded-xl group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold text-[#8B4513] dark:text-[#C07C4A] bg-[#8B4513]/5 dark:bg-[#C07C4A]/10 px-2 py-0.5 rounded-full border border-[#8B4513]/15">
              Roster
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Baristas</p>
            <h2 className="font-serif text-3xl font-extrabold mt-1 text-[#2C1A14] dark:text-white">{stats.total}</h2>
            <p className="text-[11px] text-muted-foreground mt-1">Registered coffee artisans</p>
          </div>
        </div>

        {/* Available on Shift */}
        <div className="bg-white dark:bg-card p-6 rounded-2xl border border-border/60 shadow-sm hover:shadow-md transition-all duration-300 group">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl group-hover:scale-110 transition-transform">
              <UserCheck className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Online
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Available on Shift</p>
            <h2 className="font-serif text-3xl font-extrabold mt-1 text-emerald-600 dark:text-emerald-400">
              {stats.available} <span className="text-sm font-normal text-muted-foreground">/ {stats.total}</span>
            </h2>
            <p className="text-[11px] text-muted-foreground mt-1">Ready for auto-assignment</p>
          </div>
        </div>

        {/* Active Orders */}
        <div className="bg-white dark:bg-card p-6 rounded-2xl border border-border/60 shadow-sm hover:shadow-md transition-all duration-300 group">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-xl group-hover:scale-110 transition-transform">
              <Coffee className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold text-orange-600 bg-orange-50 dark:bg-orange-950/30 px-2 py-0.5 rounded-full border border-orange-500/20">
              In Prep
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Orders In Prep</p>
            <h2 className="font-serif text-3xl font-extrabold mt-1 text-orange-600 dark:text-orange-400">{stats.totalActiveOrders}</h2>
            <p className="text-[11px] text-muted-foreground mt-1">Currently being crafted</p>
          </div>
        </div>

        {/* Average Skill Rating */}
        <div className="bg-white dark:bg-card p-6 rounded-2xl border border-border/60 shadow-sm hover:shadow-md transition-all duration-300 group">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/30 px-2 py-0.5 rounded-full border border-blue-500/20">
              Craft
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Average Skill Rating</p>
            <h2 className="font-serif text-3xl font-extrabold mt-1 text-blue-600 dark:text-blue-400">
              {stats.avgSkill} <span className="text-sm font-normal text-muted-foreground">/ 10</span>
            </h2>
            <p className="text-[11px] text-muted-foreground mt-1">Team craftsmanship level</p>
          </div>
        </div>
      </section>

      {/* Baristas Grid & Action Bar */}
      <div className="p-6 rounded-2xl bg-white dark:bg-card border border-border/60 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-serif text-xl font-bold text-[#2C1A14] dark:text-white">
              Active Barista Rosters & Stations
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Deterministic AI assigns incoming orders to the barista with the highest availability score.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, email, station..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-[#F3ECE3]/40 dark:bg-[#1E0F0B] text-sm focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary transition-all placeholder:text-muted-foreground/60"
              />
            </div>

            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2C1A14] dark:bg-primary text-white dark:text-[#1E0F0B] hover:opacity-90 transition-all font-semibold text-xs uppercase tracking-wider border border-[#2C1A14]/10 shadow-sm cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Barista</span>
            </button>
          </div>
        </div>

        {/* Grid of Barista Cards */}
        {filteredBaristas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBaristas.map((barista) => {
              const workloadScore = (
                (barista.isAvailable ? 20 : -1000) +
                (10 - (barista.activeOrderCount || 0) * 2) +
                (barista.skillLevel || 5) * 1.5
              ).toFixed(1);

              return (
                <div
                  key={barista.id}
                  className="p-5 rounded-2xl bg-[#FAF6F0]/60 dark:bg-[#1E0F0B]/60 border border-border/60 space-y-4 hover:border-primary/40 transition-all flex flex-col justify-between shadow-sm"
                >
                  <div className="space-y-3">
                    {/* Header: Avatar, Name, Status */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#8B4513]/10 dark:bg-[#C07C4A]/20 flex items-center justify-center font-bold text-lg text-[#8B4513] dark:text-[#C07C4A] border border-[#8B4513]/20">
                          {barista.profileImage ? (
                            <img
                              src={barista.profileImage}
                              alt={barista.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            barista.name?.charAt(0) || "B"
                          )}
                        </div>
                        <div>
                          <h4 className="font-serif text-base font-bold text-[#2C1A14] dark:text-white">
                            {barista.name}
                          </h4>
                          <p className="text-[11px] text-muted-foreground">
                            {barista.email}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleAvailability(barista)}
                        className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 border transition-all cursor-pointer ${
                          barista.isAvailable
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                            : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
                        }`}
                      >
                        {barista.isAvailable ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            <span>On Shift</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" />
                            <span>Offline</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Metadata Badges */}
                    <div className="grid grid-cols-3 gap-2 pt-2 text-center">
                      <div className="p-2 rounded-xl bg-white dark:bg-card border border-border/60">
                        <span className="text-[10px] text-muted-foreground block uppercase font-semibold">
                          Station
                        </span>
                        <span className="text-xs font-bold text-foreground truncate block mt-0.5">
                          {barista.station || "Espresso 1"}
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-white dark:bg-card border border-border/60">
                        <span className="text-[10px] text-muted-foreground block uppercase font-semibold">
                          Skill Level
                        </span>
                        <span className="text-xs font-bold text-amber-600 dark:text-amber-400 block mt-0.5">
                          ⭐ {barista.skillLevel || 5}/10
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-white dark:bg-card border border-border/60">
                        <span className="text-[10px] text-muted-foreground block uppercase font-semibold">
                          Active Orders
                        </span>
                        <span className="text-xs font-bold text-orange-600 dark:text-orange-400 block mt-0.5">
                          {barista.activeOrderCount || 0}
                        </span>
                      </div>
                    </div>

                    {/* AI Assignment Score Display */}
                    <div className="p-2.5 rounded-xl bg-white dark:bg-card border border-border/60 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground font-medium flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-[#8B4513] dark:text-[#C07C4A]" /> AI Dispatch Score:
                      </span>
                      <span
                        className={`font-bold ${
                          barista.isAvailable ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                        }`}
                      >
                        {barista.isAvailable ? `${workloadScore} pts` : "Unavailable"}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-border/40">
                    <button
                      type="button"
                      onClick={() => openEditModal(barista)}
                      className="w-full py-2.5 rounded-xl bg-white dark:bg-card hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-bold text-[#8B4513] dark:text-[#C07C4A] transition-all flex items-center justify-center gap-2 border border-border/60 cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Edit Station & Skill</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-muted-foreground space-y-3">
            <Users className="w-8 h-8 mx-auto opacity-40 text-primary" />
            <p>
              {isLoading
                ? "Loading baristas from system..."
                : "No baristas found. Click 'Add Barista' to create your first barista."}
            </p>
          </div>
        )}
      </div>

      {/* CREATE BARISTA MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E0F0B] border border-border/80 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-3 border-b border-border/30">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#8B4513] dark:text-[#C07C4A]" />
                <h3 className="font-serif text-lg font-bold text-[#2C1A14] dark:text-white">
                  Add New Barista
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full text-muted-foreground hover:text-foreground transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBarista} className="space-y-4">
              <div>
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground block mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-[#F3ECE3]/40 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary text-sm font-semibold text-foreground"
                />
              </div>

              <div>
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground block mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g. alex.barista@beanfien.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-[#F3ECE3]/40 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary text-sm font-semibold text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground block mb-1">
                    Phone (Optional)
                  </label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+1 555 0192"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-[#F3ECE3]/40 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary text-sm font-semibold text-foreground"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground block mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Barista123@"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-[#F3ECE3]/40 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary text-sm font-semibold text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground block mb-1">
                  Assigned Workstation
                </label>
                <input
                  type="text"
                  value={newStation}
                  onChange={(e) => setNewStation(e.target.value)}
                  placeholder="e.g. Espresso Main Bar, Pour-Over Corner"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-[#F3ECE3]/40 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary text-sm font-semibold text-foreground"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                    Craft Skill Rating (1 - 10)
                  </label>
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                    {newSkillLevel} / 10
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={newSkillLevel}
                  onChange={(e) => setNewSkillLevel(Number(e.target.value))}
                  className="w-full accent-[#8B4513] dark:accent-[#C07C4A] cursor-pointer"
                />
              </div>

              <div className="pt-4 flex items-center gap-3 border-t border-border/30">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#FAF6F0] hover:bg-[#F3ECE3]/60 text-[#2C1A14] font-bold text-xs uppercase tracking-wider transition-colors border border-border/40 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#2C1A14] dark:bg-primary hover:opacity-95 text-white dark:text-[#1E0F0B] font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#2C1A14]/15 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add Barista"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT BARISTA MODAL */}
      {editingBarista && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E0F0B] border border-border/80 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-3 border-b border-border/30">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#8B4513] dark:text-[#C07C4A]" />
                <h3 className="font-serif text-lg font-bold text-[#2C1A14] dark:text-white">
                  Edit Barista Profile
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingBarista(null)}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full text-muted-foreground hover:text-foreground transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div>
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground block mb-1">
                  Barista Name
                </label>
                <input
                  type="text"
                  disabled
                  value={editingBarista.name}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-slate-100 dark:bg-zinc-800 text-sm font-semibold text-muted-foreground cursor-not-allowed"
                />
              </div>

              <div>
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground block mb-1">
                  Assigned Station / Bar
                </label>
                <input
                  type="text"
                  value={editStation}
                  onChange={(e) => setEditStation(e.target.value)}
                  placeholder="e.g. Espresso Station A, Pour-Over Bar"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-[#F3ECE3]/40 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary text-sm font-semibold text-foreground"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                    Craft Skill Level (1 - 10)
                  </label>
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                    {editSkillLevel} / 10
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={editSkillLevel}
                  onChange={(e) => setEditSkillLevel(Number(e.target.value))}
                  className="w-full accent-[#8B4513] dark:accent-[#C07C4A] cursor-pointer"
                />
              </div>

              <div>
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground block mb-2">
                  Shift Availability
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setEditIsAvailable(true)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      editIsAvailable
                        ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-sm"
                        : "bg-slate-50 dark:bg-zinc-800 border-border text-muted-foreground"
                    }`}
                  >
                    Available
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditIsAvailable(false)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      !editIsAvailable
                        ? "bg-red-500/10 border-red-500 text-red-600 dark:text-red-400 shadow-sm"
                        : "bg-slate-50 dark:bg-zinc-800 border-border text-muted-foreground"
                    }`}
                  >
                    Offline
                  </button>
                </div>
              </div>

              <div className="pt-4 flex items-center gap-3 border-t border-border/30">
                <button
                  type="button"
                  onClick={() => setEditingBarista(null)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#FAF6F0] hover:bg-[#F3ECE3]/60 text-[#2C1A14] font-bold text-xs uppercase tracking-wider transition-colors border border-border/40 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#2C1A14] dark:bg-primary hover:opacity-95 text-white dark:text-[#1E0F0B] font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#2C1A14]/15 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
