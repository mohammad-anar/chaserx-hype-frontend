"use client";
import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import NotificationDropdown from "@/components/NotificationDropdown";
import AdminProfileDropdown from "@/components/AdminProfileDropdown";
import { 
    Search, 
    TrendingUp, 
    TrendingDown, 
    DollarSign, 
    ShoppingBag, 
    Users, 
    Star, 
    Coffee, 
    Sun, 
    Moon, 
    ChevronDown,
    RefreshCw,
    Loader2,
    Heart,
} from "lucide-react";
import { 
    ResponsiveContainer, 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    Tooltip as ChartTooltip, 
    PieChart, 
    Pie, 
    Cell, 
    BarChart, 
    Bar 
} from "recharts";
import { useGetAllOrdersQuery, useGetDailyTipsSummaryQuery } from "@/redux/features/order/orderApi";
import { useGetAllUsersQuery } from "@/redux/features/user/userApi";
import { useGetProductsQuery } from "@/redux/features/product/productApi";
import { useGetCategoriesQuery } from "@/redux/features/category/categoryApi";

const defaultCategoryColors = ["#5C2E16", "#8E512F", "#C07C4A", "#D9975D", "#A36B4C"];

export default function Dashboard() {
    const [mounted, setMounted] = useState(false);
    const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("month");
    const [searchQuery, setSearchQuery] = useState("");
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [displayName, setDisplayName] = useState("Admin");
    const [roleTitle, setRoleTitle] = useState("Super Admin");
    const [adminPhoto, setAdminPhoto] = useState("");

    useEffect(() => {
        setMounted(true);
        const isDark = document.documentElement.classList.contains("dark");
        setIsDarkMode(isDark);

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

    // RTK Query Hooks
    const { data: ordersResponse, isLoading: isLoadingOrders, refetch: refetchOrders } = useGetAllOrdersQuery({ limit: 100 });
    const { data: usersResponse, isLoading: isLoadingUsers, refetch: refetchUsers } = useGetAllUsersQuery({ limit: 100 });
    const { data: productsResponse, isLoading: isLoadingProducts, refetch: refetchProducts } = useGetProductsQuery({ limit: 100 });
    const { data: categoriesResponse, isLoading: isLoadingCategories, refetch: refetchCategories } = useGetCategoriesQuery(undefined);
    const { data: tipsResponse, refetch: refetchTips } = useGetDailyTipsSummaryQuery(undefined);

    const refetchAll = () => {
        refetchOrders();
        refetchUsers();
        refetchProducts();
        refetchCategories();
        refetchTips();
    };

    const tipsData = useMemo(() => tipsResponse?.data, [tipsResponse]);

    const rawOrders = useMemo(() => ordersResponse?.data || [], [ordersResponse]);
    const rawUsers = useMemo(() => usersResponse?.data || [], [usersResponse]);
    const rawProducts = useMemo(() => productsResponse?.data || [], [productsResponse]);
    const rawCategories = useMemo(() => categoriesResponse?.data || categoriesResponse || [], [categoriesResponse]);

    // 1. Stats Cards
    const stats = useMemo(() => {
        const validOrders = rawOrders.filter((o: any) => o.status !== "CANCELED" && o.status !== "FAILED");
        const totalRevenue = validOrders.reduce((sum: number, o: any) => sum + Number(o.total || o.finalAmount || 0), 0);
        const totalOrders = rawOrders.length;
        const totalUsers = rawUsers.length;
        
        // Sum of all coins held by registered users
        const totalCoins = rawUsers.reduce((sum: number, u: any) => sum + Number(u.coin || 0), 0);

        const formatCoins = (coins: number) => {
            if (coins >= 1000) return `${(coins / 1000).toFixed(1)}K`;
            return coins.toLocaleString();
        };

        const hasRealData = rawOrders.length > 0 || rawUsers.length > 0;

        return {
            revenue: hasRealData 
                ? `$${totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
                : "$0.00",
            ordersCount: hasRealData ? totalOrders.toLocaleString() : "0",
            customersCount: hasRealData ? totalUsers.toLocaleString() : "0",
            coinsCount: hasRealData ? formatCoins(totalCoins) : "0",
        };
    }, [rawOrders, rawUsers]);

    // 2. Revenue Overview Data Map (Week, Month, Year)
    const revenueDataMap = useMemo(() => {
        const validOrders = rawOrders.filter((o: any) => o.status !== "CANCELED" && o.status !== "FAILED");
        const now = new Date();

        // 1. Week View: Monday to Sunday of the current week
        const startOfWeek = new Date(now);
        const dayOfWeek = startOfWeek.getDay(); // 0 is Sun, 1 is Mon...
        const diffToMon = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
        startOfWeek.setDate(startOfWeek.getDate() + diffToMon);
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 7);

        const weekDays = [
            { label: "Mon", dayIndex: 1 },
            { label: "Tue", dayIndex: 2 },
            { label: "Wed", dayIndex: 3 },
            { label: "Thu", dayIndex: 4 },
            { label: "Fri", dayIndex: 5 },
            { label: "Sat", dayIndex: 6 },
            { label: "Sun", dayIndex: 0 },
        ];
        const weekMap: Record<string, number> = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };

        // 2. Month View: Weeks 1 to 4 of the current month
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        const monthMap: Record<string, number> = { "Wk 1": 0, "Wk 2": 0, "Wk 3": 0, "Wk 4": 0 };

        // 3. Year View: Jan to Dec of the current year
        const yearMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const yearMap: Record<string, number> = {};
        yearMonths.forEach(m => { yearMap[m] = 0; });

        if (validOrders.length > 0) {
            validOrders.forEach((ord: any) => {
                if (!ord.createdAt) return;
                const ordDate = new Date(ord.createdAt);
                if (isNaN(ordDate.getTime())) return;

                const amount = Number(ord.total ?? ord.finalAmount ?? 0);
                if (isNaN(amount) || amount <= 0) return;

                // Week calculation
                if (ordDate.getTime() >= startOfWeek.getTime() && ordDate.getTime() < endOfWeek.getTime()) {
                    const dayIdx = ordDate.getDay();
                    const matchingDay = weekDays.find(w => w.dayIndex === dayIdx);
                    if (matchingDay && weekMap[matchingDay.label] !== undefined) {
                        weekMap[matchingDay.label] += amount;
                    }
                }

                // Month calculation
                if (ordDate.getFullYear() === currentYear && ordDate.getMonth() === currentMonth) {
                    const dom = ordDate.getDate();
                    let wk = "Wk 1";
                    if (dom > 21) wk = "Wk 4";
                    else if (dom > 14) wk = "Wk 3";
                    else if (dom > 7) wk = "Wk 2";
                    monthMap[wk] += amount;
                }

                // Year calculation
                if (ordDate.getFullYear() === currentYear) {
                    const monthName = yearMonths[ordDate.getMonth()];
                    if (yearMap[monthName] !== undefined) {
                        yearMap[monthName] += amount;
                    }
                }
            });
        }

        return {
            week: weekDays.map(d => ({ name: d.label, value: Math.round(weekMap[d.label] * 100) / 100 })),
            month: Object.entries(monthMap).map(([name, val]) => ({ name, value: Math.round(val * 100) / 100 })),
            year: yearMonths.map(name => ({ name, value: Math.round(yearMap[name] * 100) / 100 })),
        };
    }, [rawOrders]);

    const maxRevenueOverviewYAxis = useMemo(() => {
        const currentData = revenueDataMap[timeRange] || [];
        const peak = Math.max(...currentData.map((d: any) => d.value || 0), 0);
        if (peak <= 0) return 100;
        return Math.ceil((peak * 1.25) / 50) * 50;
    }, [revenueDataMap, timeRange]);

    // 3. Category Split Data
    const categorySplitData = useMemo(() => {
        const validOrders = rawOrders.filter((o: any) => o.status !== "CANCELED" && o.status !== "FAILED");

        // Map category ID to Category Name
        const catNameMap: Record<string, string> = {};
        rawCategories.forEach((c: any) => {
            if (c.id && c.name) catNameMap[c.id] = c.name;
        });

        // Initialize category tally
        const catCountMap: Record<string, number> = {};
        rawCategories.forEach((c: any) => {
            if (c.name) catCountMap[c.name] = 0;
        });

        let totalItemsSold = 0;

        // 1. Tally from live customer order items
        validOrders.forEach((ord: any) => {
            const items = ord.orderItems || ord.items || [];
            items.forEach((item: any) => {
                const catName =
                    item.product?.category?.name ||
                    (item.product?.categoryId && catNameMap[item.product.categoryId]) ||
                    item.coinProduct?.product?.category?.name ||
                    item.category?.name ||
                    "Other";

                const qty = Number(item.quantity || 1);
                catCountMap[catName] = (catCountMap[catName] || 0) + qty;
                totalItemsSold += qty;
            });
        });

        // 2. Fallback to product catalog breakdown if no orders placed yet
        if (totalItemsSold === 0 && rawProducts.length > 0) {
            rawProducts.forEach((p: any) => {
                const catName = p.category?.name || (p.categoryId && catNameMap[p.categoryId]) || "Other";
                catCountMap[catName] = (catCountMap[catName] || 0) + 1;
                totalItemsSold += 1;
            });
        }

        // 3. Fallback to categories list if no products
        if (totalItemsSold === 0 && rawCategories.length > 0) {
            rawCategories.forEach((c: any) => {
                catCountMap[c.name] = 1;
                totalItemsSold += 1;
            });
        }

        // If categories still empty or initial loading
        if (totalItemsSold === 0) {
            return [
                { name: "Coffee", value: 40, count: 0, color: defaultCategoryColors[0] },
                { name: "Specialty Drinks", value: 30, count: 0, color: defaultCategoryColors[1] },
                { name: "Pastries & Food", value: 20, count: 0, color: defaultCategoryColors[2] },
                { name: "Merchandise", value: 10, count: 0, color: defaultCategoryColors[3] },
            ];
        }

        // Filter and sort top categories
        const entries = Object.entries(catCountMap)
            .filter(([_, count]) => count > 0)
            .sort((a, b) => b[1] - a[1]);

        if (entries.length === 0) {
            return [
                { name: "Coffee", value: 100, count: 0, color: defaultCategoryColors[0] }
            ];
        }

        const topCategories = entries.slice(0, 5);
        const topSum = topCategories.reduce((acc, curr) => acc + curr[1], 0) || 1;

        return topCategories.map(([name, count], index) => ({
            name,
            count,
            value: Math.max(1, Math.round((count / topSum) * 100)),
            color: defaultCategoryColors[index % defaultCategoryColors.length],
        }));
    }, [rawOrders, rawCategories, rawProducts]);

    const totalCategoryItemsCount = useMemo(() => {
        return categorySplitData.reduce((sum, item: any) => sum + (item.count || 0), 0);
    }, [categorySplitData]);

    // 4. Daily Orders Bar Chart Data (Current Week)
    const dailyOrdersData = useMemo(() => {
        const daysMap: Record<string, number> = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

        const now = new Date();
        const startOfWeek = new Date(now);
        const dayOfWeek = startOfWeek.getDay();
        const diffToMon = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
        startOfWeek.setDate(startOfWeek.getDate() + diffToMon);
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 7);

        const validOrders = rawOrders.filter((o: any) => o.status !== "CANCELED" && o.status !== "FAILED");

        if (validOrders.length > 0) {
            validOrders.forEach((ord: any) => {
                if (!ord.createdAt) return;
                const ordDate = new Date(ord.createdAt);
                if (isNaN(ordDate.getTime())) return;

                if (ordDate.getTime() >= startOfWeek.getTime() && ordDate.getTime() < endOfWeek.getTime()) {
                    const dayName = dayNames[ordDate.getDay()];
                    if (daysMap[dayName] !== undefined) {
                        daysMap[dayName] += 1;
                    }
                }
            });
        }

        const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        return days.map(name => ({
            name,
            value: daysMap[name],
        }));
    }, [rawOrders]);

    const maxDailyOrdersYAxis = useMemo(() => {
        const peak = Math.max(...dailyOrdersData.map(d => d.value), 0);
        if (peak <= 0) return 50;
        return Math.ceil((peak * 1.25) / 10) * 10;
    }, [dailyOrdersData]);

    // 5. Recent Orders Table
    const formattedOrders = useMemo(() => {
        return rawOrders.map((ord: any) => {
            const customerName = ord.user?.name || ord.user?.email || "Guest Customer";
            const itemsSummary = ord.orderItems && ord.orderItems.length > 0
                ? ord.orderItems.map((i: any) => `${i.product?.name || i.coinProduct?.name || 'Item'} x${i.quantity || 1}`).join(", ")
                : "Coffee & Pastries";

            let displayStatus: "Completed" | "Preparing" | "Cancelled" | "Pending" = "Preparing";
            if (ord.status === "COMPLETED" || ord.status === "DELIVERED" || ord.paymentStatus === "PAID") displayStatus = "Completed";
            else if (ord.status === "CANCELED" || ord.status === "FAILED") displayStatus = "Cancelled";
            else if (ord.status === "CONFIRMED" || ord.status === "PREPARING") displayStatus = "Preparing";
            else displayStatus = "Pending";

            return {
                id: `#${ord.orderNumber || ord.id?.slice(0, 8)}`,
                rawId: ord.id,
                customer: customerName,
                item: itemsSummary,
                total: Number(ord.total || 0),
                status: displayStatus,
            };
        });
    }, [rawOrders]);

    const filteredOrders = useMemo(() => {
        if (!searchQuery.trim()) return formattedOrders.slice(0, 7);
        const q = searchQuery.toLowerCase();
        return formattedOrders.filter((ord: any) =>
            ord.id.toLowerCase().includes(q) ||
            ord.customer.toLowerCase().includes(q) ||
            ord.item.toLowerCase().includes(q)
        ).slice(0, 10);
    }, [formattedOrders, searchQuery]);

    const toggleTheme = () => {
        const root = document.documentElement;
        if (isDarkMode) {
            root.classList.remove("dark");
            setIsDarkMode(false);
        } else {
            root.classList.add("dark");
            setIsDarkMode(true);
        }
    };

    if (!mounted) {
        return (
            <div className="flex-1 p-8 flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-3">
                    <Coffee className="w-10 h-10 text-primary animate-bounce" />
                    <p className="text-sm font-medium text-muted-foreground">Loading Bean Fien Dashboard...</p>
                </div>
            </div>
        );
    }

    const isLoading = isLoadingOrders || isLoadingUsers || isLoadingProducts || isLoadingCategories;

    return (
        <div className="flex-1 p-4 md:p-8 space-y-6 bg-background min-h-screen text-foreground transition-colors duration-300">
            {/* Top Navigation / Header */}
            <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-5">
                <div>
                    <h1 className="font-serif text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-sm text-muted-foreground mt-1">Bean Fien Admin Panel</p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    {/* Refresh Button */}
                    <button
                        onClick={refetchAll}
                        disabled={isLoading}
                        className="p-2.5 rounded-xl border border-border bg-[#F3ECE3]/40 dark:bg-card text-muted-foreground hover:text-primary hover:border-primary transition-all cursor-pointer"
                        title="Refresh Dashboard"
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-primary" : ""}`} />
                    </button>

                    {/* Search Bar */}
                    <div className="relative min-w-[240px] md:min-w-[320px]">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search orders, customers..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-[#F3ECE3]/40 dark:bg-card focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm placeholder:text-muted-foreground/60"
                        />
                    </div>

                    {/* Notifications Dropdown */}
                    <NotificationDropdown />

                    {/* Dark Mode Toggle */}
                    <button 
                        onClick={toggleTheme}
                        className="p-2.5 rounded-xl border border-border bg-[#F3ECE3]/40 dark:bg-card text-muted-foreground hover:text-primary hover:border-primary transition-all cursor-pointer"
                        title="Toggle Dark Mode"
                    >
                        {isDarkMode ? <Sun className="w-4 h-4 text-yellow-500" /> : <Moon className="w-4 h-4" />}
                    </button>

                    {/* Profile Dropdown */}
                    <AdminProfileDropdown />
                </div>
            </header>

            {/* Stat Cards Grid */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Revenue Card */}
                <div className="bg-card p-6 rounded-2xl border border-border/80 shadow-sm hover:shadow-md transition-all duration-300 group">
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl group-hover:scale-110 transition-transform">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">
                            <TrendingUp className="w-3 h-3" /> +12.4%
                        </span>
                    </div>
                    <div className="mt-4">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Revenue</p>
                        <h2 className="font-serif text-3xl font-extrabold mt-1 text-[#2C1A14] dark:text-white">{stats.revenue}</h2>
                    </div>
                </div>

                {/* Orders Card */}
                <div className="bg-card p-6 rounded-2xl border border-border/80 shadow-sm hover:shadow-md transition-all duration-300 group">
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-[#8B5A2B]/10 text-[#8B5A2B] dark:text-[#C07C4A] rounded-xl group-hover:scale-110 transition-transform">
                            <ShoppingBag className="w-6 h-6" />
                        </div>
                        <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">
                            <TrendingUp className="w-3 h-3" /> +8.1%
                        </span>
                    </div>
                    <div className="mt-4">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Orders</p>
                        <h2 className="font-serif text-3xl font-extrabold mt-1 text-[#2C1A14] dark:text-white">{stats.ordersCount}</h2>
                    </div>
                </div>

                {/* Customers Card */}
                <div className="bg-card p-6 rounded-2xl border border-border/80 shadow-sm hover:shadow-md transition-all duration-300 group">
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl group-hover:scale-110 transition-transform">
                            <Users className="w-6 h-6" />
                        </div>
                        <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">
                            <TrendingUp className="w-3 h-3" /> +5.3%
                        </span>
                    </div>
                    <div className="mt-4">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Customers</p>
                        <h2 className="font-serif text-3xl font-extrabold mt-1 text-[#2C1A14] dark:text-white">{stats.customersCount}</h2>
                    </div>
                </div>

                {/* Stars Card */}
                <div className="bg-card p-6 rounded-2xl border border-border/80 shadow-sm hover:shadow-md transition-all duration-300 group">
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl group-hover:scale-110 transition-transform">
                            <Star className="w-6 h-6" />
                        </div>
                        <span className="flex items-center gap-1 text-[11px] font-bold text-red-600 bg-red-50 dark:bg-red-950/30 px-2 py-0.5 rounded-full">
                            <TrendingDown className="w-3 h-3" /> Live
                        </span>
                    </div>
                    <div className="mt-4">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Stars Issued</p>
                        <h2 className="font-serif text-3xl font-extrabold mt-1 text-[#2C1A14] dark:text-white">{stats.coinsCount}</h2>
                    </div>
                </div>
            </section>

            {/* Daily Tips & Gratuities Quick Widget */}
            <div className="bg-gradient-to-r from-[#1E0F0B] via-[#2A140B] to-[#1E0F0B] border border-[#C07C4A]/30 p-5 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 text-left">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 shadow-md">
                        <Heart className="w-6 h-6 fill-emerald-400" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-white tracking-wide">Daily Gratuities & Barista Tips</h3>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                Today: ${(tipsData?.kpis?.todayTips || 0).toFixed(2)}
                            </span>
                        </div>
                        <p className="text-xs text-[#FAF6F0]/70 mt-0.5">
                            Total Tips Collected: <strong className="text-white">${(tipsData?.kpis?.totalTips || 0).toFixed(2)}</strong> across {tipsData?.kpis?.totalTippedOrders || 0} customer orders.
                        </p>
                    </div>
                </div>
                <Link
                    href="/admin/tips"
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#C07C4A] hover:bg-[#A66637] text-white text-xs font-bold transition-all shadow-lg shadow-[#C07C4A]/20 flex items-center justify-center gap-1.5 shrink-0"
                >
                    <span>View Daily Tips</span>
                    <TrendingUp className="w-3.5 h-3.5" />
                </Link>
            </div>

            {/* Mid Section Charts */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Overview (Area Chart) */}
                <div className="bg-card p-6 rounded-2xl border border-border/80 shadow-sm lg:col-span-2 flex flex-col justify-between">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                        <div>
                            <h3 className="font-serif text-lg font-bold">Revenue Overview</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">Live store orders performance</p>
                        </div>
                        {/* Time Range Tabs */}
                        <div className="flex bg-[#F3ECE3] dark:bg-[#2C1711] p-1 rounded-xl w-fit border border-border/40">
                            {(["week", "month", "year"] as const).map((range) => (
                                <button
                                    key={range}
                                    onClick={() => setTimeRange(range)}
                                    className={`
                                        px-4 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer
                                        ${timeRange === range 
                                            ? "bg-white dark:bg-primary dark:text-[#1E0F0B] text-primary shadow-sm" 
                                            : "text-muted-foreground hover:text-primary"
                                        }
                                    `}
                                >
                                    {range}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueDataMap[timeRange]} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={isDarkMode ? "#C07C4A" : "#8B4513"} stopOpacity={0.4}/>
                                        <stop offset="95%" stopColor={isDarkMode ? "#C07C4A" : "#8B4513"} stopOpacity={0.02}/>
                                    </linearGradient>
                                </defs>
                                <XAxis 
                                    dataKey="name" 
                                    stroke="#8E7E73" 
                                    fontSize={11} 
                                    tickLine={false} 
                                    axisLine={false} 
                                />
                                <YAxis 
                                    stroke="#8E7E73" 
                                    fontSize={11} 
                                    tickLine={false} 
                                    axisLine={false} 
                                    domain={[0, maxRevenueOverviewYAxis]}
                                    tickFormatter={(val) => `$${val}`}
                                />
                                <ChartTooltip
                                    contentStyle={{
                                        backgroundColor: isDarkMode ? "#1E0F0B" : "#ffffff",
                                        borderColor: "#EADDCB",
                                        borderRadius: "12px",
                                        color: isDarkMode ? "#F5EFEB" : "#2C1A14"
                                    }}
                                    formatter={(value: any) => [`$${value}`, "Revenue"]}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="value" 
                                    stroke={isDarkMode ? "#C07C4A" : "#8B4513"} 
                                    strokeWidth={3} 
                                    fillOpacity={1} 
                                    fill="url(#colorRevenue)" 
                                    dot={{ r: 4, fill: isDarkMode ? "#C07C4A" : "#8B4513", strokeWidth: 2, stroke: "#fff" }}
                                    activeDot={{ r: 7, fill: isDarkMode ? "#C07C4A" : "#8B4513", strokeWidth: 2, stroke: "#fff" }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Category Split (Doughnut Chart) */}
                <div className="bg-card p-6 rounded-2xl border border-border/80 shadow-sm flex flex-col justify-between">
                    <div>
                        <h3 className="font-serif text-lg font-bold">Category Split</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">Orders by type</p>
                    </div>

                    <div className="h-56 relative flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categorySplitData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={4}
                                    dataKey="value"
                                >
                                    {categorySplitData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <ChartTooltip 
                                    contentStyle={{
                                        backgroundColor: isDarkMode ? "#1E0F0B" : "#ffffff",
                                        borderColor: "#EADDCB",
                                        borderRadius: "12px",
                                        color: isDarkMode ? "#F5EFEB" : "#2C1A14"
                                    }}
                                    formatter={(value: any, name: any, item: any) => [
                                        `${value}% ${item?.payload?.count ? `(${item.payload.count} sold)` : ""}`,
                                        "Share"
                                    ]}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center Total label */}
                        <div className="absolute text-center pointer-events-none">
                            <span className="text-2xl font-extrabold font-serif">
                                {totalCategoryItemsCount > 0 ? totalCategoryItemsCount : "100%"}
                            </span>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                                {totalCategoryItemsCount > 0 ? "Items Sold" : "Total Share"}
                            </p>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border/40">
                        {categorySplitData.map((item) => (
                            <div key={item.name} className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                    <span className="text-muted-foreground truncate max-w-[90px]">{item.name}</span>
                                </div>
                                <span className="font-bold text-[#2C1A14] dark:text-white">{item.value}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Bottom Section */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Daily Orders Bar Chart */}
                <div className="bg-card p-6 rounded-2xl border border-border/80 shadow-sm flex flex-col justify-between">
                    <div>
                        <h3 className="font-serif text-lg font-bold">Daily Orders</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">Distribution across week</p>
                    </div>

                    <div className="h-64 w-full pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dailyOrdersData} margin={{ left: -20, right: 0, top: 10, bottom: 0 }}>
                                <XAxis 
                                    dataKey="name" 
                                    stroke="#8E7E73" 
                                    fontSize={11} 
                                    tickLine={false} 
                                    axisLine={false}
                                />
                                <YAxis 
                                    stroke="#8E7E73" 
                                    fontSize={11} 
                                    tickLine={false} 
                                    axisLine={false}
                                    domain={[0, maxDailyOrdersYAxis]}
                                />
                                <ChartTooltip 
                                    cursor={{ fill: "rgba(139, 69, 19, 0.05)" }}
                                    formatter={(value: any) => [value, "Orders"]}
                                />
                                <Bar 
                                    dataKey="value" 
                                    fill={isDarkMode ? "#C07C4A" : "#8B4513"} 
                                    radius={[6, 6, 0, 0]} 
                                    maxBarSize={32}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Orders (Table) */}
                <div className="bg-card p-6 rounded-2xl border border-border/80 shadow-sm lg:col-span-2 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="font-serif text-lg font-bold">Recent Orders</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">Live store order feed</p>
                        </div>
                        <Link 
                            href="/admin/orders"
                            className="text-xs font-bold text-primary hover:underline"
                        >
                            View All Orders →
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        {isLoadingOrders ? (
                            <div className="py-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
                                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                <span className="text-xs font-semibold">Loading recent orders...</span>
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-border/60 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                        <th className="py-3 px-2">Order</th>
                                        <th className="py-3 px-2">Customer</th>
                                        <th className="py-3 px-2">Item</th>
                                        <th className="py-3 px-2 text-right">Total</th>
                                        <th className="py-3 px-2 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/30 text-sm">
                                    {filteredOrders.length > 0 ? (
                                        filteredOrders.map((order: any) => (
                                            <tr key={order.rawId || order.id} className="hover:bg-[#F3ECE3]/10 dark:hover:bg-white/5 transition-colors">
                                                <td className="py-3.5 px-2 font-bold text-[#8B4513] dark:text-[#C07C4A]">{order.id}</td>
                                                <td className="py-3.5 px-2 font-medium">{order.customer}</td>
                                                <td className="py-3.5 px-2 text-muted-foreground text-xs max-w-[200px] truncate" title={order.item}>{order.item}</td>
                                                <td className="py-3.5 px-2 text-right font-bold">${order.total.toFixed(2)}</td>
                                                <td className="py-3.5 px-2">
                                                    <div className="flex justify-center">
                                                        <span className={`
                                                            inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold
                                                            ${order.status === "Completed" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"}
                                                            ${order.status === "Preparing" && "bg-amber-500/10 text-amber-600 dark:text-amber-400"}
                                                            ${order.status === "Pending" && "bg-blue-500/10 text-blue-600 dark:text-blue-400"}
                                                            ${order.status === "Cancelled" && "bg-red-500/10 text-red-600 dark:text-red-400"}
                                                        `}>
                                                            <span className={`w-1.5 h-1.5 rounded-full 
                                                                ${order.status === "Completed" && "bg-emerald-500"}
                                                                ${order.status === "Preparing" && "bg-amber-500"}
                                                                ${order.status === "Pending" && "bg-blue-500"}
                                                                ${order.status === "Cancelled" && "bg-red-500"}
                                                            `} />
                                                            {order.status}
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="py-8 text-center text-muted-foreground text-sm">
                                                No matching orders found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}
