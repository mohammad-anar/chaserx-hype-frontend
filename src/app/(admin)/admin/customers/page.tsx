"use client";
import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import NotificationDropdown from "@/components/NotificationDropdown";
import AdminProfileDropdown from "@/components/AdminProfileDropdown";
import { 
    Search, 
    Filter, 
    Eye, 
    Star, 
    X, 
    User as UserIcon, 
    Loader2, 
    RefreshCw, 
    Trash2, 
    MapPin, 
    ShoppingBag, 
    ShieldCheck, 
    Phone, 
    Mail 
} from "lucide-react";
import { 
    useGetAllUsersQuery, 
    useGetUserByIdQuery, 
    useUpdateUserStatusMutation, 
    useDeleteUserMutation 
} from "@/redux/features/user/userApi";

const formatJoinedDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    } catch {
        return dateString;
    }
};

const getAvatarBg = (name: string) => {
    const colors = ["bg-[#8B4513]", "bg-[#A0522D]", "bg-[#CD853F]", "bg-[#D2691E]", "bg-[#8B5A2B]", "bg-[#65350F]"];
    let hash = 0;
    for (let i = 0; i < (name || "").length; i++) {
        hash += name.charCodeAt(i);
    }
    return colors[Math.abs(hash) % colors.length];
};

const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
};

const STATUS_OPTIONS = [
    { value: "ACTIVE", label: "Active" },
    { value: "INACTIVE", label: "Inactive" },
    { value: "BLOCKED", label: "Blocked" },
    { value: "SUSPENDED", label: "Suspended" },
];

export default function Customers() {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);

    // Admin Profile Header State
    const [displayName, setDisplayName] = useState("Admin");
    const [roleTitle, setRoleTitle] = useState("Super Admin");
    const [adminPhoto, setAdminPhoto] = useState("");

    useEffect(() => {
        const loadProfile = () => {
            const savedName = localStorage.getItem("bf_admin_name");
            const savedRole = localStorage.getItem("bf_admin_role");
            const savedPhoto = localStorage.getItem("bf_admin_photo");
            if (savedName) setDisplayName(savedName);
            if (savedRole) setRoleTitle(savedRole);
            if (savedPhoto) setAdminPhoto(savedPhoto);
        };

        loadProfile();
        window.addEventListener("adminProfileUpdated", loadProfile);
        return () => {
            window.removeEventListener("adminProfileUpdated", loadProfile);
        };
    }, []);

    // Query Params
    const queryParams = useMemo(() => {
        const params: Record<string, any> = { limit: 100 };
        if (searchQuery.trim()) {
            params.searchTerm = searchQuery.trim();
        }
        if (statusFilter !== "ALL") {
            params.status = statusFilter;
        }
        return params;
    }, [searchQuery, statusFilter]);

    // RTK Query Hooks
    const { data: usersResponse, isLoading, isFetching, refetch } = useGetAllUsersQuery(queryParams);
    const [updateUserStatus] = useUpdateUserStatusMutation();
    const [deleteUser] = useDeleteUserMutation();

    const rawUsers = useMemo(() => {
        return usersResponse?.data || [];
    }, [usersResponse]);

    // Single User Detail Query for Modal
    const { data: userDetailResponse, isLoading: isLoadingDetail } = useGetUserByIdQuery(
        selectedUserId || "",
        { skip: !selectedUserId || !detailsModalOpen }
    );
    const selectedCustomer = userDetailResponse?.data || userDetailResponse;

    // Calculate customer stats dynamically
    const stats = useMemo(() => {
        let active = 0;
        let inactive = 0;
        rawUsers.forEach((u: any) => {
            if (u.status === "ACTIVE") active++;
            else inactive++;
        });
        return { total: rawUsers.length, active, inactive };
    }, [rawUsers]);

    const handleOpenDetails = (userId: string) => {
        setSelectedUserId(userId);
        setDetailsModalOpen(true);
    };

    const handleStatusChange = async (userId: string, newStatus: string) => {
        try {
            await updateUserStatus({ id: userId, status: newStatus }).unwrap();
            toast.success(`Customer status updated to ${newStatus}`);
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to update user status.");
        }
    };

    const handleDeleteUser = async (userId: string, name: string) => {
        if (confirm(`Are you sure you want to delete customer "${name}"?`)) {
            try {
                await deleteUser(userId).unwrap();
                toast.success(`Customer "${name}" deleted successfully.`);
            } catch (err: any) {
                toast.error(err?.data?.message || "Failed to delete customer.");
            }
        }
    };

    return (
        <div className="flex-1 p-4 md:p-8 space-y-6 bg-[#FAF6F0] dark:bg-background min-h-screen text-foreground transition-colors duration-300">
            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
                <div>
                    <h1 className="font-serif text-3xl font-bold tracking-tight text-[#2C1A14] dark:text-white">Customers</h1>
                    <p className="text-sm text-muted-foreground mt-1">Bean Fien Admin Panel</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Manage customer accounts, status & reward balances.</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <NotificationDropdown />
                    <button
                        onClick={() => refetch()}
                        disabled={isFetching}
                        className="p-2.5 rounded-xl border border-border bg-white dark:bg-card hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
                        title="Refresh Customers"
                    >
                        <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin text-primary" : ""}`} />
                    </button>

                    <AdminProfileDropdown />
                </div>
            </header>

            {/* Top Stats Cards */}
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {/* Total Customers */}
                <div className="bg-white dark:bg-card p-6 rounded-2xl border border-border/60 shadow-sm flex flex-col justify-between min-h-[120px]">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Customers</span>
                    <h2 className="font-serif text-5xl font-bold text-[#8B4513] dark:text-[#C07C4A] mt-2">{stats.total}</h2>
                </div>

                {/* Active */}
                <div className="bg-white dark:bg-card p-6 rounded-2xl border border-border/60 shadow-sm flex flex-col justify-between min-h-[120px]">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Customers</span>
                    <h2 className="font-serif text-5xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">{stats.active}</h2>
                </div>

                {/* Inactive */}
                <div className="bg-white dark:bg-card p-6 rounded-2xl border border-border/60 shadow-sm flex flex-col justify-between min-h-[120px]">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Inactive / Blocked</span>
                    <h2 className="font-serif text-5xl font-bold text-[#8E7E73] dark:text-[#8E7E73] mt-2">{stats.inactive}</h2>
                </div>
            </section>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Search input */}
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search customers by name, email or phone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-white dark:bg-[#1E0F0B] text-sm focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary transition-all placeholder:text-muted-foreground/60"
                    />
                </div>

                {/* Filter Status Selector */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {["ALL", "ACTIVE", "INACTIVE", "BLOCKED", "SUSPENDED"].map((st) => (
                        <button
                            key={st}
                            onClick={() => setStatusFilter(st)}
                            className={`
                                px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer whitespace-nowrap
                                ${statusFilter === st 
                                    ? "bg-[#2C1A14] dark:bg-primary text-white dark:text-[#1E0F0B] shadow-sm" 
                                    : "bg-white dark:bg-card text-muted-foreground hover:text-foreground border border-border/60"
                                }
                            `}
                        >
                            {st === "ALL" ? "All Status" : st}
                        </button>
                    ))}
                </div>
            </div>

            {/* Customers Table */}
            <div className="bg-white dark:bg-card rounded-2xl border border-border/60 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-border/60 bg-[#FAF6F0]/30 dark:bg-muted/10 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                <th className="py-4 px-6">Customer</th>
                                <th className="py-4 px-6">Email & Contact</th>
                                <th className="py-4 px-6 text-center">Orders</th>
                                <th className="py-4 px-6">Stars Balance</th>
                                <th className="py-4 px-6">Total Spent</th>
                                <th className="py-4 px-6">Joined</th>
                                <th className="py-4 px-6 text-center">Status</th>
                                <th className="py-4 px-6 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/20 text-sm">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={8} className="py-16 text-center text-muted-foreground">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                            <span className="text-xs font-semibold">Loading customer database...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : rawUsers.length > 0 ? (
                                rawUsers.map((customer: any) => {
                                    const avatarBg = getAvatarBg(customer.name || customer.email);
                                    const initials = getInitials(customer.name);
                                    const ordersCount = customer.ordersCount ?? customer._count?.orders ?? 0;
                                    const totalSpent = Number(customer.totalSpent || 0);
                                    const starsBalance = customer.stars || 0;
                                    const joinedDate = formatJoinedDate(customer.createdAt);

                                    return (
                                        <tr key={customer.id} className="hover:bg-[#F3ECE3]/10 dark:hover:bg-white/5 transition-colors">
                                            {/* Avatar & Name */}
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    {customer.profileImage ? (
                                                        <img 
                                                            src={customer.profileImage.startsWith("http") ? customer.profileImage : `${process.env.NEXT_PUBLIC_BASEURL || "http://localhost:5000"}${customer.profileImage.startsWith("/") ? "" : "/"}${customer.profileImage}`} 
                                                            alt={customer.name} 
                                                            className="w-10 h-10 rounded-full object-cover border border-border"
                                                        />
                                                    ) : (
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm ${avatarBg}`}>
                                                            {initials}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <span className="font-semibold text-[#2C1A14] dark:text-white block">{customer.name || "Customer"}</span>
                                                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{customer.role || "USER"}</span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Email & Phone */}
                                            <td className="py-4 px-6">
                                                <div className="space-y-0.5">
                                                    <span className="text-muted-foreground font-medium block">{customer.email}</span>
                                                    {customer.phone && (
                                                        <span className="text-xs text-muted-foreground/80 block">{customer.phone}</span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Orders */}
                                            <td className="py-4 px-6 text-center font-semibold">{ordersCount}</td>

                                            {/* Stars */}
                                            <td className="py-4 px-6 font-bold text-[#8B4513] dark:text-[#C07C4A]">
                                                🪙 {starsBalance}
                                            </td>

                                            {/* Spent */}
                                            <td className="py-4 px-6 font-bold">${totalSpent.toFixed(2)}</td>

                                            {/* Joined */}
                                            <td className="py-4 px-6 text-xs text-muted-foreground font-medium">{joinedDate}</td>

                                            {/* Status Select Dropdown */}
                                            <td className="py-4 px-6">
                                                <div className="flex justify-center">
                                                    <select
                                                        value={customer.status || "ACTIVE"}
                                                        onChange={(e) => handleStatusChange(customer.id, e.target.value)}
                                                        className={`
                                                            px-3 py-1.5 rounded-xl text-xs font-bold border outline-none cursor-pointer transition-all shadow-sm
                                                            ${customer.status === "ACTIVE" 
                                                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" 
                                                                : customer.status === "BLOCKED" || customer.status === "SUSPENDED"
                                                                ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30"
                                                                : "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/30"
                                                            }
                                                        `}
                                                    >
                                                        {STATUS_OPTIONS.map((opt) => (
                                                            <option key={opt.value} value={opt.value} className="bg-white dark:bg-[#1E0F0B] text-foreground font-semibold">
                                                                {opt.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </td>

                                            {/* Actions */}
                                            <td className="py-4 px-6">
                                                <div className="flex justify-center items-center gap-2">
                                                    <button
                                                        onClick={() => handleOpenDetails(customer.id)}
                                                        className="p-1.5 border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors cursor-pointer"
                                                        title="View Customer Details"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteUser(customer.id, customer.name || customer.email)}
                                                        className="p-1.5 border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-100 transition-colors cursor-pointer"
                                                        title="Delete Customer"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={8} className="py-12 text-center text-muted-foreground text-sm">
                                        No matching customers found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* CUSTOMER DETAILS MODAL */}
            {detailsModalOpen && selectedUserId && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#1E0F0B] w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-border/80 relative animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
                        {/* Header */}
                        <div className="p-6 pb-4 border-b border-border/30 flex justify-between items-start">
                            <div>
                                <h2 className="font-serif text-xl font-bold text-[#2C1A14] dark:text-white">
                                    {selectedCustomer?.name || "Customer Details"}
                                </h2>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Joined {formatJoinedDate(selectedCustomer?.createdAt)}
                                </p>
                            </div>
                            <button 
                                onClick={() => {
                                    setDetailsModalOpen(false);
                                    setSelectedUserId(null);
                                }}
                                className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        {isLoadingDetail ? (
                            <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
                                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                <span className="text-xs font-semibold">Loading customer details...</span>
                            </div>
                        ) : selectedCustomer ? (
                            <div className="p-6 space-y-5 overflow-y-auto flex-1">
                                {/* Inner Info Card */}
                                <div className="p-4 rounded-2xl bg-[#FAF6F0] dark:bg-black/10 border border-border/40 flex items-center gap-4">
                                    <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-md ${getAvatarBg(selectedCustomer.name || selectedCustomer.email)}`}>
                                        {getInitials(selectedCustomer.name)}
                                    </div>
                                    <div className="space-y-0.5 flex-1">
                                        <h3 className="font-serif font-bold text-base text-[#2C1A14] dark:text-white">{selectedCustomer.name}</h3>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Mail className="w-3.5 h-3.5" />
                                            <span>{selectedCustomer.email}</span>
                                        </div>
                                        {selectedCustomer.phone && (
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <Phone className="w-3.5 h-3.5" />
                                                <span>{selectedCustomer.phone}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* 4 Stats Cards Grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Total Orders */}
                                    <div className="bg-[#FAF6F0]/65 dark:bg-white/5 p-4 rounded-2xl border border-border/45 flex flex-col justify-between min-h-[90px]">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Orders</span>
                                        <h4 className="font-serif text-2xl font-bold text-[#8B4513] dark:text-[#C07C4A] mt-2">
                                            {selectedCustomer.ordersCount ?? selectedCustomer.orders?.length ?? 0}
                                        </h4>
                                    </div>

                                    {/* Stars Balance */}
                                    <div className="bg-[#FAF6F0]/65 dark:bg-white/5 p-4 rounded-2xl border border-border/45 flex flex-col justify-between min-h-[90px]">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Coins Balance</span>
                                        <h4 className="font-serif text-2xl font-bold text-[#8B4513] dark:text-[#C07C4A] mt-2">
                                            🪙 {selectedCustomer.stars || 0}
                                        </h4>
                                    </div>

                                    {/* Total Spent */}
                                    <div className="bg-[#FAF6F0]/65 dark:bg-white/5 p-4 rounded-2xl border border-border/45 flex flex-col justify-between min-h-[90px]">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Spent</span>
                                        <h4 className="font-serif text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
                                            ${Number(selectedCustomer.totalSpent || 0).toFixed(2)}
                                        </h4>
                                    </div>

                                    {/* Editable Status Select */}
                                    <div className="bg-[#FAF6F0]/65 dark:bg-white/5 p-4 rounded-2xl border border-border/45 flex flex-col justify-between min-h-[90px]">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Account Status</span>
                                        <select
                                            value={selectedCustomer.status || "ACTIVE"}
                                            onChange={(e) => handleStatusChange(selectedCustomer.id, e.target.value)}
                                            className="mt-2 w-full px-3 py-1.5 rounded-xl text-xs font-bold border border-border bg-white dark:bg-zinc-900 text-foreground focus:outline-none cursor-pointer"
                                        >
                                            {STATUS_OPTIONS.map((opt) => (
                                                <option key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Saved Addresses Section */}
                                {selectedCustomer.addresses && selectedCustomer.addresses.length > 0 && (
                                    <div className="space-y-2 pt-2 border-t border-border/30">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                            <MapPin className="w-3.5 h-3.5 text-primary" /> Saved Addresses ({selectedCustomer.addresses.length})
                                        </h4>
                                        <div className="space-y-2">
                                            {selectedCustomer.addresses.map((addr: any, i: number) => (
                                                <div key={i} className="p-3 bg-[#FAF6F0]/40 dark:bg-white/5 rounded-xl border border-border/40 text-xs leading-relaxed">
                                                    <p className="font-semibold text-foreground">{addr.street1} {addr.street2 || ""}</p>
                                                    <p className="text-muted-foreground">{addr.city}, {addr.state} {addr.country}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Recent Orders History */}
                                {selectedCustomer.orders && selectedCustomer.orders.length > 0 && (
                                    <div className="space-y-2 pt-2 border-t border-border/30">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                            <ShoppingBag className="w-3.5 h-3.5 text-primary" /> Order History ({selectedCustomer.orders.length})
                                        </h4>
                                        <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                                            {selectedCustomer.orders.slice(0, 5).map((ord: any) => (
                                                <div key={ord.id} className="flex justify-between items-center p-2.5 bg-[#FAF6F0]/40 dark:bg-white/5 rounded-xl border border-border/40 text-xs">
                                                    <div>
                                                        <span className="font-bold text-[#8B4513] dark:text-[#C07C4A]">#{ord.orderNumber}</span>
                                                        <span className="text-[10px] text-muted-foreground ml-2">
                                                            {new Date(ord.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-bold">${Number(ord.total || 0).toFixed(2)}</span>
                                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-600">
                                                            {ord.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : null}
                    </div>
                </div>
            )}
        </div>
    );
}
