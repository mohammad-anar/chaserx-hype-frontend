"use client";
import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Search, Filter, Eye, Star, X, User } from "lucide-react";

interface Customer {
    id: string;
    name: string;
    email: string;
    orders: number;
    stars: number;
    spent: number;
    joined: string;
    status: "Active" | "Inactive";
    avatarColor: string;
}

const initialCustomers: Customer[] = [
    { id: "C-01", name: "Sarah Chen", email: "sarah.chen@email.com", orders: 43, stars: 847, spent: 201.50, joined: "Jan 2024", status: "Active", avatarColor: "bg-[#8B4513]" },
    { id: "C-02", name: "James Park", email: "james.park@email.com", orders: 28, stars: 420, spent: 134.00, joined: "Mar 2024", status: "Active", avatarColor: "bg-[#A0522D]" },
    { id: "C-03", name: "Mia Torres", email: "mia.torres@email.com", orders: 12, stars: 180, spent: 58.75, joined: "May 2024", status: "Active", avatarColor: "bg-[#CD853F]" },
    { id: "C-04", name: "Liam Nguyen", email: "liam.n@email.com", orders: 61, stars: 1240, spent: 298.25, joined: "Nov 2023", status: "Inactive", avatarColor: "bg-zinc-500" },
    { id: "C-05", name: "Ava Williams", email: "ava.w@email.com", orders: 19, stars: 310, spent: 94.50, joined: "Feb 2024", status: "Active", avatarColor: "bg-[#D2691E]" },
    { id: "C-06", name: "Noah Kim", email: "noah.kim@email.com", orders: 7, stars: 95, spent: 32.00, joined: "Jun 2024", status: "Active", avatarColor: "bg-[#8B5A2B]" }
];

export default function Customers() {
    const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);

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

    // Calculate customer stats dynamically
    const stats = useMemo(() => {
        let active = 0;
        let inactive = 0;
        customers.forEach(c => {
            if (c.status === "Active") active++;
            else inactive++;
        });
        return { total: customers.length, active, inactive };
    }, [customers]);

    // Filtered customers
    const filteredCustomers = useMemo(() => {
        return customers.filter(c => 
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [customers, searchQuery]);

    const handleOpenDetails = (customer: Customer) => {
        setSelectedCustomer(customer);
        setDetailsModalOpen(true);
    };

    const getInitials = (name: string) => {
        return name.split(" ").map(n => n[0]).join("").toUpperCase();
    };

    return (
        <div className="flex-1 p-4 md:p-8 space-y-6 bg-[#FAF6F0] dark:bg-background min-h-screen text-foreground transition-colors duration-300">
            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
                <div>
                    <h1 className="font-serif text-3xl font-bold tracking-tight text-[#2C1A14] dark:text-white">Customers</h1>
                    <p className="text-sm text-muted-foreground mt-1">Bean Fien Admin Panel</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <Link 
                        href="/settings?profile=true"
                        className="flex items-center gap-3 px-3 py-1.5 rounded-xl border border-border bg-white dark:bg-card hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors text-left"
                    >
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-primary/10 border border-primary/20 flex items-center justify-center relative">
                            {adminPhoto ? (
                                <img src={adminPhoto} alt="Admin" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-sm font-semibold text-primary">BF</span>
                            )}
                        </div>
                        <div className="hidden sm:block text-left">
                            <h4 className="text-xs font-bold leading-tight">{displayName}</h4>
                            <p className="text-[10px] text-muted-foreground">{roleTitle}</p>
                        </div>
                    </Link>
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
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active</span>
                    <h2 className="font-serif text-5xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">{stats.active}</h2>
                </div>

                {/* Inactive */}
                <div className="bg-white dark:bg-card p-6 rounded-2xl border border-border/60 shadow-sm flex flex-col justify-between min-h-[120px]">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Inactive</span>
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
                        placeholder="Search customers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-white dark:bg-[#1E0F0B] text-sm focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary transition-all placeholder:text-muted-foreground/60"
                    />
                </div>

                {/* Filter button */}
                <button
                    onClick={() => alert("Filter options flow...")}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#F3ECE3] hover:bg-[#FAF6F0] dark:bg-zinc-800 text-xs font-bold uppercase tracking-wider transition-colors border border-border/40 w-fit cursor-pointer"
                >
                    <Filter className="w-4 h-4 text-muted-foreground" />
                    Filter
                </button>
            </div>

            {/* Customers Table */}
            <div className="bg-white dark:bg-card rounded-2xl border border-border/60 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-border/60 bg-[#FAF6F0]/30 dark:bg-muted/10 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                <th className="py-4 px-6">Customer</th>
                                <th className="py-4 px-6">Email</th>
                                <th className="py-4 px-6 text-center">Orders</th>
                                <th className="py-4 px-6">Stars</th>
                                <th className="py-4 px-6">Spent</th>
                                <th className="py-4 px-6">Joined</th>
                                <th className="py-4 px-6 text-center">Status</th>
                                <th className="py-4 px-6 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/20 text-sm">
                            {filteredCustomers.length > 0 ? (
                                filteredCustomers.map((customer) => (
                                    <tr key={customer.id} className="hover:bg-[#F3ECE3]/10 dark:hover:bg-white/5 transition-colors">
                                        {/* Avatar & Name */}
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm ${customer.avatarColor}`}>
                                                    {getInitials(customer.name)}
                                                </div>
                                                <span className="font-semibold text-[#2C1A14] dark:text-white">{customer.name}</span>
                                            </div>
                                        </td>

                                        {/* Email */}
                                        <td className="py-4 px-6 text-muted-foreground">{customer.email}</td>

                                        {/* Orders */}
                                        <td className="py-4 px-6 text-center font-semibold">{customer.orders}</td>

                                        {/* Stars */}
                                        <td className="py-4 px-6 font-bold text-[#8B4513] dark:text-[#C07C4A]">
                                            {customer.stars} ★
                                        </td>

                                        {/* Spent */}
                                        <td className="py-4 px-6 font-bold">${customer.spent.toFixed(2)}</td>

                                        {/* Joined */}
                                        <td className="py-4 px-6 text-xs text-muted-foreground font-medium">{customer.joined}</td>

                                        {/* Status */}
                                        <td className="py-4 px-6">
                                            <div className="flex justify-center">
                                                <span className={`
                                                    inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold
                                                    ${customer.status === "Active" 
                                                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                                                        : "bg-zinc-500/10 text-zinc-500"
                                                    }
                                                `}>
                                                    <span className={`w-1.5 h-1.5 rounded-full 
                                                        ${customer.status === "Active" ? "bg-emerald-500" : "bg-zinc-500"}
                                                    `} />
                                                    {customer.status}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Actions */}
                                        <td className="py-4 px-6">
                                            <div className="flex justify-center">
                                                <button
                                                    onClick={() => handleOpenDetails(customer)}
                                                    className="p-1.5 border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
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

            {/* CUSTOMER DETAILS MODAL (Screenshot 5) */}
            {detailsModalOpen && selectedCustomer && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#1E0F0B] w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-border/80 relative animate-in fade-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="p-6 pb-4 border-b border-border/30 flex justify-between items-start">
                            <div>
                                <h2 className="font-serif text-xl font-bold text-[#2C1A14] dark:text-white">{selectedCustomer.name}</h2>
                                <p className="text-xs text-muted-foreground mt-0.5">Joined {selectedCustomer.joined}</p>
                            </div>
                            <button 
                                onClick={() => setDetailsModalOpen(false)}
                                className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full text-muted-foreground hover:text-foreground transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-6">
                            {/* Inner Info Card */}
                            <div className="p-4 rounded-2xl bg-[#FAF6F0] dark:bg-black/10 border border-border/40 flex items-center gap-4">
                                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-md ${selectedCustomer.avatarColor}`}>
                                    {getInitials(selectedCustomer.name)}
                                </div>
                                <div className="space-y-0.5">
                                    <h3 className="font-serif font-bold text-base text-[#2C1A14] dark:text-white">{selectedCustomer.name}</h3>
                                    <p className="text-xs text-muted-foreground">{selectedCustomer.email}</p>
                                </div>
                            </div>

                            {/* 4 Stats Cards Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                {/* Total Orders */}
                                <div className="bg-[#FAF6F0]/65 dark:bg-white/5 p-4 rounded-2xl border border-border/45 flex flex-col justify-between min-h-[90px]">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Orders</span>
                                    <h4 className="font-serif text-2xl font-bold text-[#8B4513] dark:text-[#C07C4A] mt-2">{selectedCustomer.orders}</h4>
                                </div>

                                {/* Stars Balance */}
                                <div className="bg-[#FAF6F0]/65 dark:bg-white/5 p-4 rounded-2xl border border-border/45 flex flex-col justify-between min-h-[90px]">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Stars Balance</span>
                                    <h4 className="font-serif text-2xl font-bold text-[#8B4513] dark:text-[#C07C4A] mt-2">{selectedCustomer.stars} ★</h4>
                                </div>

                                {/* Total Spent */}
                                <div className="bg-[#FAF6F0]/65 dark:bg-white/5 p-4 rounded-2xl border border-border/45 flex flex-col justify-between min-h-[90px]">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Spent</span>
                                    <h4 className="font-serif text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">${selectedCustomer.spent.toFixed(2)}</h4>
                                </div>

                                {/* Status */}
                                <div className="bg-[#FAF6F0]/65 dark:bg-white/5 p-4 rounded-2xl border border-border/45 flex flex-col justify-between min-h-[90px]">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Status</span>
                                    <h4 className="font-serif text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">{selectedCustomer.status}</h4>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
