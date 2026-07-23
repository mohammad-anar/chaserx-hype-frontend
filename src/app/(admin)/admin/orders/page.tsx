"use client";
import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
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
    ArrowRight,
    ChevronLeft,
    ChevronRight,
    Loader2,
    RefreshCw,
    CreditCard,
    Coins
} from "lucide-react";
import {
    useGetAllOrdersQuery,
    useUpdateOrderStatusMutation
} from "@/redux/features/order/orderApi";
import NotificationDropdown from "@/components/NotificationDropdown";
import AdminProfileDropdown from "@/components/AdminProfileDropdown";

interface OrderItem {
    name: string;
    qty: number;
    price: number;
    isCoinProduct: boolean;
    coinCost: number;
    options: string[];
    subOptions: string[];
    image: string;
}

interface Order {
    id: string;
    rawId: string;
    customer: string;
    phone: string;
    itemsSummary: string;
    qtySummary: string;
    total: number;
    stars: number;
    usedCoin: number;
    earnedCoin: number;
    isCoinOrder: boolean;
    status: string;
    rawStatus: string;
    paymentStatus: string;
    flags: {
        isDelivery: boolean;
        address?: string;
        hasNote: boolean;
        note?: string;
    };
    shippingDetails?: {
        fullName?: string;
        street1?: string;
        city?: string;
        state?: string;
        country?: string;
        postalCode?: string;
        phone?: string;
    };
    time: string;
    paymentMethod: string;
    items: OrderItem[];
}

export type OrderStatusTab =
    | "All"
    | "Pending"
    | "Confirmed"
    | "Preparing"
    | "Ready"
    | "Out For Delivery"
    | "Completed"
    | "Cancelled";

const STATUS_TABS: OrderStatusTab[] = [
    "All",
    "Pending",
    "Confirmed",
    "Preparing",
    "Ready",
    "Out For Delivery",
    "Completed",
    "Cancelled"
];

const getProductImg = (item: any) => {
    if (!item) return "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=500";
    let imgStr = "";
    if (Array.isArray(item?.image) && item?.image?.length > 0) {
        imgStr = item?.image?.[0] || "";
    } else if (typeof item?.image === "string" && item?.image) {
        imgStr = item?.image;
    }
    if (!imgStr) return "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=500";
    if (imgStr?.startsWith("http://") || imgStr?.startsWith("https://")) return imgStr;
    const baseUrl = process.env.NEXT_PUBLIC_BASEURL || "http://localhost:5000";
    return `${baseUrl}${imgStr?.startsWith("/") ? "" : "/"}${imgStr}`;
};

function formatStatus(status: string): string {
    switch (status?.toUpperCase()) {
        case "PENDING": return "Pending";
        case "CONFIRMED": return "Confirmed";
        case "PREPARING": return "Preparing";
        case "READY": return "Ready";
        case "OUT_FOR_DELIVERY": return "Out For Delivery";
        case "COMPLETED": return "Completed";
        case "CANCELED":
        case "CANCELLED": return "Cancelled";
        case "REFUNDED": return "Refunded";
        case "FAILED": return "Failed";
        default: return status || "Pending";
    }
}

function mapUiStatusToBackend(status: string): string {
    switch (status) {
        case "Pending": return "PENDING";
        case "Confirmed": return "CONFIRMED";
        case "Preparing": return "PREPARING";
        case "Ready": return "READY";
        case "Out For Delivery": return "OUT_FOR_DELIVERY";
        case "Completed": return "COMPLETED";
        case "Cancelled": return "CANCELED";
        default: return status.toUpperCase();
    }
}

function transformApiOrder(apiOrder: any): Order {
    const rawItems = apiOrder.orderItems || [];
    const itemsSummaryList = rawItems.map((item: any) => {
        const name = item.product?.name || item.coinProduct?.title || "Item";
        return `${name}${item.quantity > 1 ? ` x ${item.quantity}` : ''}`;
    });
    const itemsSummary = itemsSummaryList.join(", ") || "No items";

    let totalExtras = 0;
    rawItems.forEach((item: any) => {
        if (item.orderItemExtras) {
            totalExtras += item.orderItemExtras.length;
        }
    });
    const qtySummary = totalExtras > 0 ? `+${totalExtras} extra${totalExtras > 1 ? 's' : ''}` : "";

    const shipping = apiOrder.shippingAddress;
    const addressStr = shipping
        ? [shipping.street1, shipping.city, shipping.state, shipping.country].filter(Boolean).join(", ")
        : undefined;

    let timeAgo = "Just now";
    if (apiOrder.createdAt) {
        try {
            timeAgo = formatDistanceToNow(new Date(apiOrder.createdAt), { addSuffix: true });
        } catch {
            timeAgo = new Date(apiOrder.createdAt).toLocaleDateString();
        }
    }

    const items: OrderItem[] = rawItems.map((item: any) => {
        const targetProduct = item.product || item.coinProduct;
        const isCoin = item.isCoinProduct || !!item.coinProduct || apiOrder.payType === "REWARD_COINS";
        return {
            name: item.product?.name || item.coinProduct?.title || "Product",
            qty: item.quantity || 1,
            price: Number(item.totalPrice || item.basePrice || 0),
            isCoinProduct: isCoin,
            coinCost: Number(item.totalCoin || item.coinProduct?.coinCost || 0),
            options: item.selectedSizeId ? [item.selectedSizeId] : [],
            subOptions: item.orderItemExtras?.map((e: any) => e.productExtra?.name).filter(Boolean) || [],
            image: getProductImg(targetProduct),
        };
    });

    const customerName = shipping?.fullName || apiOrder.user?.name || "Guest Customer";
    const phone = shipping?.phone || apiOrder.user?.phone || "N/A";
    const paymentStatusStr = (apiOrder.paymentStatus || "PENDING").toUpperCase();

    const usedCoin = Number(apiOrder.usedCoin || 0);
    const earnedCoin = Number(apiOrder.earnedCoin || 0);
    const isCoinOrder = apiOrder.payType === "REWARD_COINS" || usedCoin > 0 || rawItems.some((i: any) => !!i.coinProduct || i.isCoinProduct);

    return {
        id: apiOrder.orderNumber || `#${apiOrder.id.slice(0, 8)}`,
        rawId: apiOrder.id,
        customer: customerName,
        phone,
        itemsSummary,
        qtySummary,
        total: Number(apiOrder.total || 0),
        stars: earnedCoin || usedCoin,
        usedCoin,
        earnedCoin,
        isCoinOrder,
        status: formatStatus(apiOrder.status),
        rawStatus: apiOrder.status,
        paymentStatus: paymentStatusStr,
        flags: {
            isDelivery: !!shipping,
            address: addressStr,
            hasNote: !!apiOrder.note,
            note: apiOrder.note,
        },
        shippingDetails: shipping ? {
            fullName: shipping.fullName || customerName,
            street1: shipping.street1,
            city: shipping.city,
            state: shipping.state,
            country: shipping.country,
            postalCode: shipping.postalCode,
            phone: shipping.phone || phone,
        } : undefined,
        time: timeAgo,
        paymentMethod: apiOrder.payType || apiOrder.paymentMethod || "Card",
        items,
    };
}

export default function OrderManagement() {
    // Pagination & Search & Status Filter state
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<OrderStatusTab>("All");

    // Admin header profile state
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

    // Construct query parameters for RTK Query
    const apiQueryParams = useMemo(() => {
        const params: Record<string, any> = {
            page,
            limit,
        };
        if (statusFilter !== "All") {
            params.status = mapUiStatusToBackend(statusFilter);
        }
        if (searchQuery.trim()) {
            params.searchTerm = searchQuery.trim();
        }
        return params;
    }, [page, limit, statusFilter, searchQuery]);

    // Query & Mutation Hooks
    const { data: apiResponse, isLoading, isFetching, refetch } = useGetAllOrdersQuery(apiQueryParams);
    const [updateOrderStatus, { isLoading: isUpdating }] = useUpdateOrderStatusMutation();

    // Modal state
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [editStatus, setEditStatus] = useState<string>("Pending");

    // Transformed Orders from API
    const orders: Order[] = useMemo(() => {
        if (!apiResponse?.data) return [];
        return apiResponse.data.map(transformApiOrder);
    }, [apiResponse]);

    // Top Stats Cards (Pending, Confirmed, Preparing, Ready, Out For Delivery, Completed, Cancelled)
    const stats = useMemo(() => {
        const counts = apiResponse?.meta?.statusCounts;
        if (counts) {
            return {
                pending: counts.PENDING || 0,
                confirmed: counts.CONFIRMED || 0,
                preparing: counts.PREPARING || 0,
                ready: counts.READY || 0,
                outForDelivery: counts.OUT_FOR_DELIVERY || 0,
                completed: counts.COMPLETED || 0,
                cancelled: (counts.CANCELED || 0) + (counts.REFUNDED || 0),
            };
        }
        return { pending: 0, confirmed: 0, preparing: 0, ready: 0, outForDelivery: 0, completed: 0, cancelled: 0 };
    }, [apiResponse]);

    // Pagination Metadata
    const totalItems = apiResponse?.meta?.total || 0;
    const totalPages = apiResponse?.meta?.totalPage || 1;
    const startCount = totalItems === 0 ? 0 : (page - 1) * limit + 1;
    const endCount = Math.min(page * limit, totalItems);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setPage(1);
    };

    const handleStatusFilterChange = (status: OrderStatusTab) => {
        setStatusFilter(status);
        setPage(1);
    };

    const handleOpenDetails = (order: Order) => {
        setSelectedOrder(order);
        setDetailsModalOpen(true);
    };

    const handleOpenEdit = (order: Order) => {
        setSelectedOrder(order);
        setEditStatus(order.status);
        setEditModalOpen(true);
    };

    const handleSaveStatus = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedOrder) return;

        try {
            const backendStatus = mapUiStatusToBackend(editStatus);
            const targetId = selectedOrder.rawId || selectedOrder.id;
            await updateOrderStatus({ orderId: targetId, status: backendStatus }).unwrap();
            toast.success(`Order ${selectedOrder.id} status updated to ${editStatus}`);
            setEditModalOpen(false);
            setSelectedOrder(null);
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to update order status");
        }
    };

    const handleExport = () => {
        if (orders.length === 0) {
            toast.error("No orders available to export.");
            return;
        }

        const headers = ["Order ID", "Customer", "Phone", "Shipping Address", "Items", "Total ($)", "Used Coins", "Earned Coins", "Payment Status", "Order Status", "Time"];
        const rows = orders.map(o => [
            `"${o.id}"`,
            `"${o.customer}"`,
            `"${o.phone}"`,
            `"${o.flags.address || 'N/A'}"`,
            `"${o.itemsSummary}"`,
            o.total.toFixed(2),
            o.usedCoin,
            o.earnedCoin,
            `"${o.paymentStatus}"`,
            `"${o.status}"`,
            `"${o.time}"`
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

    const getStatusBadgeStyle = (statusStr: string) => {
        switch (statusStr) {
            case "Pending":
                return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20";
            case "Confirmed":
                return "bg-[#8B4513]/10 text-[#8B4513] dark:text-[#C07C4A] border border-[#8B4513]/20";
            case "Preparing":
                return "bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20";
            case "Ready":
                return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20";
            case "Out For Delivery":
                return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20";
            case "Completed":
                return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20";
            case "Cancelled":
            case "Refunded":
            case "Failed":
                return "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20";
            default:
                return "bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20";
        }
    };

    const getStatusDotStyle = (statusStr: string) => {
        switch (statusStr) {
            case "Pending":
                return "bg-amber-500";
            case "Confirmed":
                return "bg-[#8B4513]";
            case "Preparing":
                return "bg-orange-500";
            case "Ready":
                return "bg-purple-500";
            case "Out For Delivery":
                return "bg-blue-500";
            case "Completed":
                return "bg-emerald-500";
            case "Cancelled":
            case "Refunded":
            case "Failed":
                return "bg-red-500";
            default:
                return "bg-slate-500";
        }
    };

    const getPaymentStatusBadgeStyle = (payStatus: string) => {
        switch (payStatus?.toUpperCase()) {
            case "PAID":
                return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20";
            case "PENDING":
            case "PROCESSING":
                return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20";
            case "FAILED":
            case "REFUNDED":
                return "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20";
            default:
                return "bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20";
        }
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
                    <NotificationDropdown />
                    <button
                        onClick={() => refetch()}
                        disabled={isFetching}
                        className="p-2 rounded-xl border border-border bg-white dark:bg-card hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors text-muted-foreground hover:text-foreground"
                        title="Refresh Orders"
                    >
                        <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin text-primary" : ""}`} />
                    </button>

                    <AdminProfileDropdown />
                </div>
            </header>

            {/* Top Stats Cards Organized */}
            <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {/* Pending Stats */}
                <div className="bg-white dark:bg-card p-4 rounded-2xl border border-border/60 shadow-sm flex flex-col justify-between min-h-[100px]">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Pending</span>
                    <h2 className="font-serif text-3xl font-bold text-amber-600 dark:text-amber-400 mt-1">{stats.pending}</h2>
                </div>

                {/* Confirmed Stats */}
                <div className="bg-white dark:bg-card p-4 rounded-2xl border border-border/60 shadow-sm flex flex-col justify-between min-h-[100px]">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Confirmed</span>
                    <h2 className="font-serif text-3xl font-bold text-[#8B4513] dark:text-[#C07C4A] mt-1">{stats.confirmed}</h2>
                </div>

                {/* Preparing Stats */}
                <div className="bg-white dark:bg-card p-4 rounded-2xl border border-border/60 shadow-sm flex flex-col justify-between min-h-[100px]">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Preparing</span>
                    <h2 className="font-serif text-3xl font-bold text-orange-600 dark:text-orange-400 mt-1">{stats.preparing}</h2>
                </div>

                {/* Ready Stats */}
                <div className="bg-white dark:bg-card p-4 rounded-2xl border border-border/60 shadow-sm flex flex-col justify-between min-h-[100px]">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Ready</span>
                    <h2 className="font-serif text-3xl font-bold text-purple-600 dark:text-purple-400 mt-1">{stats.ready}</h2>
                </div>

                {/* Completed Stats */}
                <div className="bg-white dark:bg-card p-4 rounded-2xl border border-border/60 shadow-sm flex flex-col justify-between min-h-[100px]">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Completed</span>
                    <h2 className="font-serif text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{stats.completed}</h2>
                </div>

                {/* Cancelled Stats */}
                <div className="bg-white dark:bg-card p-4 rounded-2xl border border-border/60 shadow-sm flex flex-col justify-between min-h-[100px]">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Cancelled</span>
                    <h2 className="font-serif text-3xl font-bold text-red-600 dark:text-red-400 mt-1">{stats.cancelled}</h2>
                </div>
            </section>

            {/* Filter and Search controls */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                {/* Search */}
                <div className="relative w-full xl:w-80">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search orders, customers, or phone..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-white dark:bg-[#1E0F0B] text-sm focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary transition-all placeholder:text-muted-foreground/60"
                    />
                </div>

                {/* Status Tabs & Export */}
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex bg-[#F3ECE3] dark:bg-[#2C1711] p-1 rounded-xl w-fit border border-border/40 overflow-x-auto max-w-full">
                        {STATUS_TABS.map((status) => (
                            <button
                                key={status}
                                onClick={() => handleStatusFilterChange(status)}
                                className={`
                                    px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-all duration-200
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
                                <th className="py-4 px-6">Shipping Address</th>
                                <th className="py-4 px-6">Items</th>
                                <th className="py-4 px-6">Total</th>
                                <th className="py-4 px-6 text-center">Payment Status</th>
                                <th className="py-4 px-6 text-center">Order Status</th>
                                <th className="py-4 px-6 text-center">Flags</th>
                                <th className="py-4 px-6">Time</th>
                                <th className="py-4 px-6 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/20 text-sm">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={10} className="py-16 text-center text-muted-foreground">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                            <span className="text-xs font-semibold">Loading orders...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : orders.length > 0 ? (
                                orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-[#F3ECE3]/10 dark:hover:bg-white/5 transition-colors">
                                        {/* Order ID */}
                                        <td className="py-4 px-6 font-bold text-[#8B4513] dark:text-[#C07C4A]">{order.id}</td>

                                        {/* Customer */}
                                        <td className="py-4 px-6">
                                            <div className="font-semibold text-[#2C1A14] dark:text-white leading-tight">{order.customer}</div>
                                            <div className="text-[11px] text-muted-foreground mt-0.5">{order.phone}</div>
                                        </td>

                                        {/* Shipping Address Column */}
                                        <td className="py-4 px-6 max-w-[220px]">
                                            {order.flags.address ? (
                                                <div className="flex items-start gap-1.5 text-xs text-foreground/90">
                                                    <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                                                    <span className="line-clamp-2 leading-snug font-medium" title={order.flags.address}>
                                                        {order.flags.address}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-muted-foreground italic">Store Pickup</span>
                                            )}
                                        </td>

                                        {/* Items */}
                                        <td className="py-4 px-6">
                                            <div className="font-semibold leading-tight text-slate-800 dark:text-slate-200">{order.itemsSummary}</div>
                                            {order.qtySummary && (
                                                <div className="text-[11px] text-[#8B4513] dark:text-[#C07C4A] mt-0.5 font-medium">{order.qtySummary}</div>
                                            )}
                                        </td>

                                        {/* Total */}
                                        <td className="py-4 px-6 font-bold">
                                            {order.isCoinOrder ? (
                                                <span className="text-[#8B4513] dark:text-[#C07C4A] flex items-center gap-1">
                                                    🪙 {order.usedCoin} Coins
                                                </span>
                                            ) : (
                                                `$${order.total.toFixed(2)}`
                                            )}
                                        </td>

                                        {/* Payment Status Column */}
                                        <td className="py-4 px-6 text-center">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${getPaymentStatusBadgeStyle(order.paymentStatus)}`}>
                                                {order.paymentStatus}
                                            </span>
                                        </td>

                                        {/* Order Status Column */}
                                        <td className="py-4 px-6">
                                            <div className="flex justify-center">
                                                <span className={`
                                                    inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold
                                                    ${getStatusBadgeStyle(order.status)}
                                                `}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${getStatusDotStyle(order.status)}`} />
                                                    {order.status}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Flags */}
                                        <td className="py-4 px-6">
                                            <div className="flex justify-center items-center gap-1.5">
                                                {/* Delivery vs Pickup Icon */}
                                                {order.flags.isDelivery ? (
                                                    <span className="p-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" title={`Delivery: ${order.flags.address || 'Address provided'}`}>
                                                        <MapPin className="w-3.5 h-3.5" />
                                                    </span>
                                                ) : (
                                                    <span className="p-1 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400" title="Store Pickup">
                                                        <ShoppingBag className="w-3.5 h-3.5" />
                                                    </span>
                                                )}

                                                {/* Customer Note Icon */}
                                                {order.flags.hasNote && (
                                                    <span className="p-1 rounded-md bg-[#8B4513]/10 text-[#8B4513] dark:text-[#C07C4A]" title={order.flags.note}>
                                                        <MessageSquare className="w-3.5 h-3.5" />
                                                    </span>
                                                )}

                                                {/* Coin Product Badge */}
                                                {order.isCoinOrder && (
                                                    <span className="p-1 rounded-md bg-[#8B4513]/10 text-[#8B4513] dark:text-[#C07C4A]" title="Coin / Reward Product">
                                                        <Coins className="w-3.5 h-3.5" />
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
                                    <td colSpan={10} className="py-12 text-center text-muted-foreground text-sm">
                                        No matching orders found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {totalItems > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-border/60 bg-[#FAF6F0]/20 dark:bg-muted/5">
                        <div className="text-xs text-muted-foreground font-medium">
                            Showing <span className="font-bold text-foreground">{startCount}</span> to{" "}
                            <span className="font-bold text-foreground">{endCount}</span> of{" "}
                            <span className="font-bold text-foreground">{totalItems}</span> orders
                        </div>

                        <div className="flex items-center gap-3 flex-wrap">
                            {/* Rows Per Page */}
                            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                                <span>Per page:</span>
                                <select
                                    value={limit}
                                    onChange={(e) => {
                                        setLimit(Number(e.target.value));
                                        setPage(1);
                                    }}
                                    className="px-2 py-1 rounded-lg border border-border bg-white dark:bg-card text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                </select>
                            </div>

                            {/* Page navigation */}
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page <= 1 || isFetching}
                                    className="p-1.5 rounded-lg border border-border bg-white dark:bg-card text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    title="Previous Page"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>

                                <span className="px-3 py-1 text-xs font-bold bg-[#F3ECE3] dark:bg-[#2C1711] text-[#2C1A14] dark:text-white rounded-lg border border-border/40">
                                    {page} / {totalPages}
                                </span>

                                <button
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page >= totalPages || isFetching}
                                    className="p-1.5 rounded-lg border border-border bg-white dark:bg-card text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    title="Next Page"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ORDER DETAILS MODAL */}
            {detailsModalOpen && selectedOrder && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#1E0F0B] w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-border/80 relative animate-in fade-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="p-6 pb-4 border-b border-border/30 flex justify-between items-start">
                            <div>
                                <h2 className="font-serif text-xl font-bold text-[#2C1A14] dark:text-white flex items-center gap-2">
                                    Order {selectedOrder.id}
                                    {selectedOrder.isCoinOrder && (
                                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#8B4513]/10 text-[#8B4513] dark:text-[#C07C4A] border border-[#8B4513]/20 font-bold">
                                            🪙 Coin Reward Order
                                        </span>
                                    )}
                                </h2>
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
                            {/* Delivery/Pickup Banner with Full Address Details */}
                            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/20 flex flex-col gap-2">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                        {selectedOrder.flags.isDelivery ? <MapPin className="w-5 h-5" /> : <ShoppingBag className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-400">
                                            {selectedOrder.flags.isDelivery ? "Shipping / Delivery Address" : "Store Pickup"}
                                        </h4>
                                        <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400/90 mt-0.5">
                                            {selectedOrder.flags.address || "123 Coffee Bean St, New York, NY, United States"}
                                        </p>
                                    </div>
                                </div>
                                {selectedOrder.shippingDetails && (
                                    <div className="mt-2 pt-2 border-t border-emerald-500/10 grid grid-cols-2 gap-2 text-[11px] text-emerald-900 dark:text-emerald-300">
                                        <div><span className="font-semibold">Recipient:</span> {selectedOrder.shippingDetails.fullName}</div>
                                        <div><span className="font-semibold">Phone:</span> {selectedOrder.shippingDetails.phone}</div>
                                        <div><span className="font-semibold">City/State:</span> {selectedOrder.shippingDetails.city}{selectedOrder.shippingDetails.state ? `, ${selectedOrder.shippingDetails.state}` : ''}</div>
                                        <div><span className="font-semibold">Country/Zip:</span> {selectedOrder.shippingDetails.country} {selectedOrder.shippingDetails.postalCode || ''}</div>
                                    </div>
                                )}
                            </div>

                            {/* Order Items */}
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Order Items</h3>
                                {selectedOrder.items.map((item, idx) => (
                                    <div key={idx} className="p-3 bg-[#FAF6F0]/60 dark:bg-black/20 rounded-2xl border border-border/40 flex gap-4">
                                        {/* Coffee Thumbnail */}
                                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-cover bg-center border border-border flex-shrink-0 relative">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        {/* Item Info */}
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div className="flex justify-between items-start gap-2">
                                                <h4 className="font-serif font-bold text-sm text-[#2C1A14] dark:text-white leading-tight">
                                                    {item.name} <span className="text-[#8B4513] dark:text-[#C07C4A]">x {item.qty}</span>
                                                </h4>
                                                <div className="text-right">
                                                    {item.isCoinProduct ? (
                                                        <span className="font-extrabold text-[#8B4513] dark:text-[#C07C4A] text-sm flex items-center gap-1 justify-end">
                                                            🪙 {item.coinCost ? item.coinCost * item.qty : "Coins"}
                                                        </span>
                                                    ) : (
                                                        <span className="font-extrabold text-[#8B4513] dark:text-[#C07C4A] text-sm">
                                                            ${item.price.toFixed(2)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Badge Options */}
                                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                                                {item.isCoinProduct && (
                                                    <span className="px-2 py-0.5 bg-[#8B4513]/10 text-[#8B4513] dark:text-[#C07C4A] rounded-md text-[10px] font-bold border border-[#8B4513]/20">
                                                        Reward Coin Item
                                                    </span>
                                                )}
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
                                    <span className="text-muted-foreground font-medium">Total Amount</span>
                                    <span className="font-extrabold text-lg text-foreground">${selectedOrder.total.toFixed(2)}</span>
                                </div>

                                {/* Display Used Coins if this order used coins / is a coin product order */}
                                {(selectedOrder.isCoinOrder || selectedOrder.usedCoin > 0) && (
                                    <div className="flex justify-between items-center text-sm bg-[#8B4513]/5 dark:bg-[#C07C4A]/10 p-2.5 rounded-xl border border-[#8B4513]/15">
                                        <span className="text-[#8B4513] dark:text-[#C07C4A] font-bold flex items-center gap-1.5">
                                            <Coins className="w-4 h-4" /> Used Coins (Redeemed)
                                        </span>
                                        <span className="font-extrabold text-[#8B4513] dark:text-[#C07C4A] text-sm">
                                            🪙 {selectedOrder.usedCoin} Coins
                                        </span>
                                    </div>
                                )}

                                {/* Display Earned Coins if user earned coins */}
                                {selectedOrder.earnedCoin > 0 && (
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground font-medium">Earned Coins</span>
                                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                            +{selectedOrder.earnedCoin} ★
                                        </span>
                                    </div>
                                )}

                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground font-medium">Payment Method</span>
                                    <span className="font-semibold text-foreground flex items-center gap-1.5">
                                        <CreditCard className="w-3.5 h-3.5 text-muted-foreground" />
                                        {selectedOrder.paymentMethod}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground font-medium">Payment Status</span>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${getPaymentStatusBadgeStyle(selectedOrder.paymentStatus)}`}>
                                        {selectedOrder.paymentStatus}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground font-medium">Phone</span>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#EFF6FF] dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-bold border border-blue-500/10">
                                        <Phone className="w-3.5 h-3.5" />
                                        {selectedOrder.phone}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground font-medium">Order Status</span>
                                    <span className={`
                                        inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold
                                        ${getStatusBadgeStyle(selectedOrder.status)}
                                    `}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${getStatusDotStyle(selectedOrder.status)}`} />
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

            {/* UPDATE STATUS MODAL */}
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
                                    onChange={(e) => setEditStatus(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-[#F3ECE3]/40 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary text-sm font-semibold"
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Confirmed">Confirmed</option>
                                    <option value="Preparing">Preparing</option>
                                    <option value="Ready">Ready</option>
                                    <option value="Out For Delivery">Out For Delivery</option>
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
                                    disabled={isUpdating}
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-[#2C1A14] hover:opacity-95 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#2C1A14]/15 flex items-center justify-center gap-2 disabled:opacity-50"
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
