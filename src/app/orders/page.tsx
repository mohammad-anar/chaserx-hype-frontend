"use client";
import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { 
    Search, 
    Download, 
    MapPin, 
    MessageSquare, 
    ShoppingBag, 
    Eye, 
    Pencil, 
    X, 
    Phone, 
    Check, 
    Clock, 
    AlertCircle,
    ArrowRight
} from "lucide-react";

interface OrderItem {
    name: string;
    qty: number;
    price: number;
    options: string[];
    subOptions: string[];
    image: string;
}

interface Order {
    id: string;
    customer: string;
    phone: string;
    itemsSummary: string;
    qtySummary: string;
    total: number;
    stars: number;
    status: "Completed" | "Preparing" | "Cancelled";
    flags: {
        isDelivery: boolean;
        address?: string;
        hasNote: boolean;
        note?: string;
    };
    time: string;
    paymentMethod: string;
    items: OrderItem[];
}

const initialOrders: Order[] = [
    {
        id: "#BF-2891",
        customer: "Sarah Chen",
        phone: "+1 555-0192",
        itemsSummary: "Flat White x 2",
        qtySummary: "+2 extras",
        total: 9.00,
        stars: 90,
        status: "Completed",
        flags: {
            isDelivery: true,
            address: "24 Maple Street",
            hasNote: true,
            note: "Extra hot, no foam on both"
        },
        time: "2 min ago",
        paymentMethod: "Apple Pay",
        items: [
            {
                name: "Flat White",
                qty: 2,
                price: 11.50,
                options: ["Large", "Oat Milk"],
                subOptions: ["Extra Shot", "Vanilla Syrup"],
                image: "https://images.unsplash.com/photo-1577968897966-3d4325b36b61?auto=format&fit=crop&w=150&q=80"
            }
        ]
    },
    {
        id: "#BF-2890",
        customer: "James Park",
        phone: "+1 555-0148",
        itemsSummary: "Cold Brew, Espresso",
        qtySummary: "+1 extras",
        total: 8.50,
        stars: 85,
        status: "Preparing",
        flags: {
            isDelivery: true,
            address: "88 Pine Avenue",
            hasNote: false
        },
        time: "5 min ago",
        paymentMethod: "Credit Card",
        items: [
            {
                name: "Cold Brew",
                qty: 1,
                price: 5.00,
                options: ["Medium"],
                subOptions: ["Sweetener"],
                image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=150&q=80"
            },
            {
                name: "Espresso",
                qty: 1,
                price: 3.50,
                options: ["Single Shot"],
                subOptions: [],
                image: "https://images.unsplash.com/photo-1510972527921-ce03766a1cf1?auto=format&fit=crop&w=150&q=80"
            }
        ]
    },
    {
        id: "#BF-2889",
        customer: "Mia Torres",
        phone: "+1 555-0271",
        itemsSummary: "Latte Art",
        qtySummary: "+1 extras",
        total: 5.50,
        stars: 55,
        status: "Completed",
        flags: {
            isDelivery: false,
            hasNote: false
        },
        time: "11 min ago",
        paymentMethod: "Apple Pay",
        items: [
            {
                name: "Latte Art",
                qty: 1,
                price: 5.50,
                options: ["Regular", "Whole Milk"],
                subOptions: ["Caramel Drizzle"],
                image: "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=150&q=80"
            }
        ]
    },
    {
        id: "#BF-2888",
        customer: "Liam Nguyen",
        phone: "+1 555-0334",
        itemsSummary: "Seasonal Special x 2",
        qtySummary: "+3 extras",
        total: 11.50,
        stars: 114,
        status: "Preparing",
        flags: {
            isDelivery: true,
            address: "415 Oak Lane",
            hasNote: true,
            note: "Leave at door, knock twice"
        },
        time: "14 min ago",
        paymentMethod: "Google Pay",
        items: [
            {
                name: "Seasonal Special",
                qty: 2,
                price: 11.50,
                options: ["Large", "Almond Milk"],
                subOptions: ["Cinnamon Toast Sprinkle", "Whipped Cream"],
                image: "https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=150&q=80"
            }
        ]
    },
    {
        id: "#BF-2887",
        customer: "Ava Williams",
        phone: "+1 555-0156",
        itemsSummary: "Iced Latte",
        qtySummary: "",
        total: 4.75,
        stars: 0,
        status: "Cancelled",
        flags: {
            isDelivery: false,
            hasNote: false
        },
        time: "18 min ago",
        paymentMethod: "Cash",
        items: [
            {
                name: "Iced Latte",
                qty: 1,
                price: 4.75,
                options: ["Regular", "Skim Milk"],
                subOptions: [],
                image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=150&q=80"
            }
        ]
    },
    {
        id: "#BF-2886",
        customer: "Noah Kim",
        phone: "+1 555-0423",
        itemsSummary: "Flat White, Cold Brew",
        qtySummary: "+3 extras",
        total: 9.50,
        stars: 95,
        status: "Completed",
        flags: {
            isDelivery: true,
            address: "12 Elm Road",
            hasNote: false
        },
        time: "22 min ago",
        paymentMethod: "Apple Pay",
        items: [
            {
                name: "Flat White",
                qty: 1,
                price: 4.50,
                options: ["Regular", "Whole Milk"],
                subOptions: [],
                image: "https://images.unsplash.com/photo-1577968897966-3d4325b36b61?auto=format&fit=crop&w=150&q=80"
            },
            {
                name: "Cold Brew",
                qty: 1,
                price: 5.00,
                options: ["Large"],
                subOptions: ["Sweetener"],
                image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=150&q=80"
            }
        ]
    },
    {
        id: "#BF-2885",
        customer: "Emma Davis",
        phone: "+1 555-0517",
        itemsSummary: "Espresso x 3",
        qtySummary: "+1 extras",
        total: 10.50,
        stars: 105,
        status: "Completed",
        flags: {
            isDelivery: false,
            hasNote: true,
            note: "Bring extra sugar packets"
        },
        time: "31 min ago",
        paymentMethod: "Apple Pay",
        items: [
            {
                name: "Espresso",
                qty: 3,
                price: 10.50,
                options: ["Double Shot"],
                subOptions: ["Caramel drizzle"],
                image: "https://images.unsplash.com/photo-1510972527921-ce03766a1cf1?auto=format&fit=crop&w=150&q=80"
            }
        ]
    },
    {
        id: "#BF-2884",
        customer: "Oliver Lee",
        phone: "+1 555-0689",
        itemsSummary: "Latte Art x 2",
        qtySummary: "+2 extras",
        total: 11.00,
        stars: 110,
        status: "Preparing",
        flags: {
            isDelivery: true,
            address: "702 Birch Boulevard",
            hasNote: true,
            note: "Ring bell when arriving"
        },
        time: "36 min ago",
        paymentMethod: "Google Pay",
        items: [
            {
                name: "Latte Art",
                qty: 2,
                price: 11.00,
                options: ["Large", "Oat Milk"],
                subOptions: ["Vanilla Syrup"],
                image: "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=150&q=80"
            }
        ]
    }
];

export default function OrderManagement() {
    const [orders, setOrders] = useState<Order[]>(initialOrders);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<"All" | "Preparing" | "Completed" | "Cancelled">("All");

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

    // Modal state
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    // Form state for editing
    const [editStatus, setEditStatus] = useState<"Completed" | "Preparing" | "Cancelled">("Preparing");

    // Recalculate stats based on current orders state
    const stats = useMemo(() => {
        let preparing = 0;
        let completed = 0;
        let cancelled = 0;
        orders.forEach(o => {
            if (o.status === "Preparing") preparing++;
            else if (o.status === "Completed") completed++;
            else if (o.status === "Cancelled") cancelled++;
        });
        return { preparing, completed, cancelled };
    }, [orders]);

    // Filtered orders
    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const matchesSearch = 
                order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.itemsSummary.toLowerCase().includes(searchQuery.toLowerCase());
            
            const matchesStatus = statusFilter === "All" || order.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [orders, searchQuery, statusFilter]);

    const handleOpenDetails = (order: Order) => {
        setSelectedOrder(order);
        setDetailsModalOpen(true);
    };

    const handleOpenEdit = (order: Order) => {
        setSelectedOrder(order);
        setEditStatus(order.status);
        setEditModalOpen(true);
    };

    const handleSaveStatus = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedOrder) return;

        setOrders(prev => prev.map(o => {
            if (o.id === selectedOrder.id) {
                // If cancelled, stars go to 0
                const updatedStars = editStatus === "Cancelled" ? 0 : Math.round(o.total * 10);
                return { ...o, status: editStatus, stars: updatedStars };
            }
            return o;
        }));

        setEditModalOpen(false);
        setSelectedOrder(null);
    };

    const handleExport = () => {
        // Construct CSV
        const headers = ["Order ID", "Customer", "Phone", "Items", "Total ($)", "Stars", "Status", "Delivery type", "Time"];
        const rows = orders.map(o => [
            o.id,
            o.customer,
            o.phone,
            o.itemsSummary,
            o.total.toFixed(2),
            o.stars,
            o.status,
            o.flags.isDelivery ? "Delivery" : "Pickup",
            o.time
        ]);

        const csvContent = "data:text/csv;charset=utf-8," 
            + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `orders_export_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex-1 p-4 md:p-8 space-y-6 bg-[#FAF6F0] dark:bg-background min-h-screen text-foreground transition-colors duration-300">
            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
                <div>
                    <h1 className="font-serif text-3xl font-bold tracking-tight text-[#2C1A14] dark:text-white">Order Management</h1>
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

            {/* Top Stats Cards (Preparing, Completed, Cancelled) */}
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {/* Preparing Stats */}
                <div className="bg-white dark:bg-card p-6 rounded-2xl border border-border/60 shadow-sm flex flex-col justify-between min-h-[120px]">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Preparing</span>
                    <h2 className="font-serif text-5xl font-bold text-[#C07C4A] mt-2">{stats.preparing}</h2>
                </div>

                {/* Completed Stats */}
                <div className="bg-white dark:bg-card p-6 rounded-2xl border border-border/60 shadow-sm flex flex-col justify-between min-h-[120px]">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Completed</span>
                    <h2 className="font-serif text-5xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">{stats.completed}</h2>
                </div>

                {/* Cancelled Stats */}
                <div className="bg-white dark:bg-card p-6 rounded-2xl border border-border/60 shadow-sm flex flex-col justify-between min-h-[120px]">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cancelled</span>
                    <h2 className="font-serif text-5xl font-bold text-red-600 dark:text-red-400 mt-2">{stats.cancelled}</h2>
                </div>
            </section>

            {/* Filter and Search controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Search */}
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search orders or customers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-white dark:bg-[#1E0F0B] text-sm focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary transition-all placeholder:text-muted-foreground/60"
                    />
                </div>

                {/* Status Tabs & Export */}
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex bg-[#F3ECE3] dark:bg-[#2C1711] p-1 rounded-xl w-fit border border-border/40">
                        {(["All", "Preparing", "Completed", "Cancelled"] as const).map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`
                                    px-4 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200
                                    ${statusFilter === status 
                                        ? "bg-white dark:bg-primary dark:text-[#1E0F0B] text-[#2C1A14] shadow-sm font-bold" 
                                        : "text-muted-foreground hover:text-primary"
                                    }
                                `}
                            >
                                {status}
                            </button>
                        ))}
                    </div>

                    <button 
                        onClick={handleExport}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2C1A14] dark:bg-primary text-white dark:text-[#1E0F0B] hover:opacity-90 transition-all font-semibold text-xs uppercase tracking-wider border border-[#2C1A14]/10"
                    >
                        <Download className="w-3.5 h-3.5" />
                        Export
                    </button>
                </div>
            </div>

            {/* Orders Table Container */}
            <div className="bg-white dark:bg-card rounded-2xl border border-border/60 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-border/60 bg-[#FAF6F0]/30 dark:bg-muted/10 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                <th className="py-4 px-6">Order ID</th>
                                <th className="py-4 px-6">Customer</th>
                                <th className="py-4 px-6">Items</th>
                                <th className="py-4 px-6">Total</th>
                                <th className="py-4 px-6">Stars</th>
                                <th className="py-4 px-6 text-center">Status</th>
                                <th className="py-4 px-6 text-center">Flags</th>
                                <th className="py-4 px-6">Time</th>
                                <th className="py-4 px-6 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/20 text-sm">
                            {filteredOrders.length > 0 ? (
                                filteredOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-[#F3ECE3]/10 dark:hover:bg-white/5 transition-colors">
                                        {/* Order ID */}
                                        <td className="py-4 px-6 font-bold text-[#8B4513] dark:text-[#C07C4A]">{order.id}</td>
                                        
                                        {/* Customer */}
                                        <td className="py-4 px-6">
                                            <div className="font-semibold text-[#2C1A14] dark:text-white leading-tight">{order.customer}</div>
                                            <div className="text-[11px] text-muted-foreground mt-0.5">{order.phone}</div>
                                        </td>
                                        
                                        {/* Items */}
                                        <td className="py-4 px-6">
                                            <div className="font-semibold leading-tight text-slate-800 dark:text-slate-200">{order.itemsSummary}</div>
                                            {order.qtySummary && (
                                                <div className="text-[11px] text-[#8B4513] dark:text-[#C07C4A] mt-0.5 font-medium">{order.qtySummary}</div>
                                            )}
                                        </td>
                                        
                                        {/* Total */}
                                        <td className="py-4 px-6 font-bold">${order.total.toFixed(2)}</td>
                                        
                                        {/* Stars */}
                                        <td className="py-4 px-6 font-bold text-[#8B4513] dark:text-[#C07C4A]">+{order.stars} ★</td>
                                        
                                        {/* Status */}
                                        <td className="py-4 px-6">
                                            <div className="flex justify-center">
                                                <span className={`
                                                    inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold
                                                    ${order.status === "Completed" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"}
                                                    ${order.status === "Preparing" && "bg-amber-500/10 text-amber-600 dark:text-amber-400"}
                                                    ${order.status === "Cancelled" && "bg-red-500/10 text-red-600 dark:text-red-400"}
                                                `}>
                                                    <span className={`w-1.5 h-1.5 rounded-full 
                                                        ${order.status === "Completed" && "bg-emerald-500"}
                                                        ${order.status === "Preparing" && "bg-amber-500"}
                                                        ${order.status === "Cancelled" && "bg-red-500"}
                                                    `} />
                                                    {order.status}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Flags */}
                                        <td className="py-4 px-6">
                                            <div className="flex justify-center items-center gap-1.5">
                                                {/* Delivery vs Pickup Icon */}
                                                {order.flags.isDelivery ? (
                                                    <span className="p-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" title="Delivery">
                                                        <MapPin className="w-3.5 h-3.5" />
                                                    </span>
                                                ) : (
                                                    <span className="p-1 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400" title="Pickup">
                                                        <ShoppingBag className="w-3.5 h-3.5" />
                                                    </span>
                                                )}

                                                {/* Customer Note Icon */}
                                                {order.flags.hasNote && (
                                                    <span className="p-1 rounded-md bg-[#8B4513]/10 text-[#8B4513] dark:text-[#C07C4A]" title={order.flags.note}>
                                                        <MessageSquare className="w-3.5 h-3.5" />
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Time */}
                                        <td className="py-4 px-6 text-xs text-muted-foreground font-medium">{order.time}</td>

                                        {/* Actions */}
                                        <td className="py-4 px-6">
                                            <div className="flex justify-center items-center gap-2">
                                                <button 
                                                    onClick={() => handleOpenDetails(order)}
                                                    className="p-1.5 border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => handleOpenEdit(order)}
                                                    className="p-1.5 border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 rounded-lg text-[#8B4513] dark:text-[#C07C4A] hover:bg-[#F3ECE3]/40 dark:hover:bg-[#2C1711]/40 transition-colors"
                                                    title="Update Status"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={9} className="py-12 text-center text-muted-foreground text-sm">
                                        No matching orders found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ORDER DETAILS MODAL (Screenshot 2) */}
            {detailsModalOpen && selectedOrder && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#1E0F0B] w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-border/80 relative animate-in fade-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="p-6 pb-4 border-b border-border/30 flex justify-between items-start">
                            <div>
                                <h2 className="font-serif text-xl font-bold text-[#2C1A14] dark:text-white">Order {selectedOrder.id}</h2>
                                <p className="text-xs text-muted-foreground mt-0.5">{selectedOrder.time} · {selectedOrder.customer}</p>
                            </div>
                            <button 
                                onClick={() => setDetailsModalOpen(false)}
                                className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full text-muted-foreground hover:text-foreground transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
                            {/* Delivery/Pickup Banner */}
                            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/10 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                        {selectedOrder.flags.isDelivery ? <MapPin className="w-5 h-5" /> : <ShoppingBag className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-400">
                                            {selectedOrder.flags.isDelivery ? "Delivery" : "Store Pickup"}
                                        </h4>
                                        <p className="text-xs text-emerald-700 dark:text-emerald-500/80 mt-0.5">
                                            {selectedOrder.flags.isDelivery ? selectedOrder.flags.address : "Main Cafe Branch"}
                                        </p>
                                    </div>
                                </div>
                                {selectedOrder.flags.isDelivery && (
                                    <button className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center gap-1">
                                        View Map <ArrowRight className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>

                            {/* Order Items */}
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Order Items</h3>
                                {selectedOrder.items.map((item, idx) => (
                                    <div key={idx} className="p-3 bg-[#FAF6F0]/60 dark:bg-black/20 rounded-2xl border border-border/40 flex gap-4">
                                        {/* Coffee Thumbnail */}
                                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-cover bg-center border border-border flex-shrink-0" style={{ backgroundImage: `url(${item.image})` }} />
                                        
                                        {/* Item Info */}
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div className="flex justify-between items-start gap-2">
                                                <h4 className="font-serif font-bold text-sm text-[#2C1A14] dark:text-white leading-tight">
                                                    {item.name} <span className="text-[#8B4513] dark:text-[#C07C4A]">x {item.qty}</span>
                                                </h4>
                                                <span className="font-extrabold text-[#8B4513] dark:text-[#C07C4A] text-sm">
                                                    ${item.price.toFixed(2)}
                                                </span>
                                            </div>

                                            {/* Badge Options */}
                                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                                                {item.options.map((opt, oIdx) => (
                                                    <span key={oIdx} className="px-2 py-0.5 bg-slate-100 dark:bg-white/5 rounded-md text-[10px] font-semibold text-muted-foreground">
                                                        {opt}
                                                    </span>
                                                ))}
                                                {item.subOptions.map((sub, sIdx) => (
                                                    <span key={sIdx} className="px-2 py-0.5 bg-[#FAF6F0] dark:bg-[#2C1711] rounded-md text-[10px] font-bold text-[#8B4513] dark:text-[#C07C4A] border border-[#8B4513]/10">
                                                        + {sub}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Details List */}
                            <div className="border-t border-border/30 pt-4 space-y-3.5">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground font-medium">Customer</span>
                                    <span className="font-semibold text-foreground">{selectedOrder.customer}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground font-medium">Total</span>
                                    <span className="font-extrabold text-lg text-foreground">${selectedOrder.total.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground font-medium">Stars Earned</span>
                                    <span className="font-bold text-[#8B4513] dark:text-[#C07C4A]">+{selectedOrder.stars} ★</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground font-medium">Payment</span>
                                    <span className="font-semibold text-foreground">{selectedOrder.paymentMethod}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground font-medium">Phone</span>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#EFF6FF] dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-bold border border-blue-500/10">
                                        <Phone className="w-3.5 h-3.5" />
                                        {selectedOrder.phone}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground font-medium">Status</span>
                                    <span className={`
                                        inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold
                                        ${selectedOrder.status === "Completed" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"}
                                        ${selectedOrder.status === "Preparing" && "bg-amber-500/10 text-amber-600 dark:text-amber-400"}
                                        ${selectedOrder.status === "Cancelled" && "bg-red-500/10 text-red-600 dark:text-red-400"}
                                    `}>
                                        <span className={`w-1.5 h-1.5 rounded-full 
                                            ${selectedOrder.status === "Completed" && "bg-emerald-500"}
                                            ${selectedOrder.status === "Preparing" && "bg-amber-500"}
                                            ${selectedOrder.status === "Cancelled" && "bg-red-500"}
                                        `} />
                                        {selectedOrder.status}
                                    </span>
                                </div>
                            </div>

                            {/* Customer Special Note */}
                            {selectedOrder.flags.hasNote && (
                                <div className="p-4 bg-[#FAF6F0] dark:bg-black/10 rounded-2xl border border-[#FAF6F0] dark:border-[#2C1711] space-y-1.5">
                                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary flex items-center gap-1.5">
                                        <MessageSquare className="w-3.5 h-3.5" /> Special Note From Customer
                                    </span>
                                    <p className="text-xs italic text-muted-foreground leading-relaxed">
                                        &ldquo;{selectedOrder.flags.note}&rdquo;
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* UPDATE STATUS MODAL (Screenshot 3) */}
            {editModalOpen && selectedOrder && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#1E0F0B] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-border/80 relative animate-in fade-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="p-6 pb-4 border-b border-border/30 flex justify-between items-start">
                            <div>
                                <h2 className="font-serif text-xl font-bold text-[#2C1A14] dark:text-white">Update Order Status</h2>
                                <p className="text-xs text-muted-foreground mt-0.5">{selectedOrder.id}</p>
                            </div>
                            <button 
                                onClick={() => setEditModalOpen(false)}
                                className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full text-muted-foreground hover:text-foreground transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSaveStatus} className="p-6 space-y-5">
                            <div className="space-y-1">
                                <label className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">Customer</label>
                                <p className="text-sm font-semibold">{selectedOrder.customer}</p>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">Items</label>
                                <p className="text-sm font-semibold">{selectedOrder.itemsSummary}</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">New Status</label>
                                <select
                                    value={editStatus}
                                    onChange={(e) => setEditStatus(e.target.value as any)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-[#F3ECE3]/40 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary text-sm font-semibold"
                                >
                                    <option value="Preparing">Preparing</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                            </div>

                            {/* Footer Buttons */}
                            <div className="flex items-center gap-3 pt-4 border-t border-border/30">
                                <button
                                    type="button"
                                    onClick={() => setEditModalOpen(false)}
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-[#FAF6F0] hover:bg-[#F3ECE3]/60 text-[#2C1A14] font-bold text-xs uppercase tracking-wider transition-colors border border-border/40"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-[#2C1A14] hover:opacity-95 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#2C1A14]/15"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
