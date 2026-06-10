"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
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
    RefreshCw
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

// Mock Data
const revenueDataMap = {
    week: [
        { name: "Mon", value: 1200 },
        { name: "Tue", value: 1800 },
        { name: "Wed", value: 1600 },
        { name: "Thu", value: 2200 },
        { name: "Fri", value: 2900 },
        { name: "Sat", value: 3400 },
        { name: "Sun", value: 2800 },
    ],
    month: [
        { name: "Jun 1", value: 1300 },
        { name: "Jun 5", value: 1750 },
        { name: "Jun 9", value: 1400 },
        { name: "Jun 13", value: 2100 },
        { name: "Jun 17", value: 2000 },
        { name: "Jun 21", value: 2500 },
        { name: "Jun 25", value: 2350 },
        { name: "Jun 29", value: 2800 },
    ],
    year: [
        { name: "Jan", value: 12000 },
        { name: "Feb", value: 15000 },
        { name: "Mar", value: 14000 },
        { name: "Apr", value: 18500 },
        { name: "May", value: 21000 },
        { name: "Jun", value: 24580 },
        { name: "Jul", value: 23000 },
        { name: "Aug", value: 26000 },
        { name: "Sep", value: 25000 },
        { name: "Oct", value: 28000 },
        { name: "Nov", value: 30000 },
        { name: "Dec", value: 35000 },
    ]
};

const categorySplitData = [
    { name: "Hot Drinks", value: 45, color: "#5C2E16" }, // Dark Coffee Brown
    { name: "Iced", value: 28, color: "#8E512F" },      // Medium Coffee Brown
    { name: "Blended", value: 15, color: "#C07C4A" },   // Gold/Beige Brown
    { name: "Food", value: 12, color: "#D9975D" },      // Light warm tan
];

const dailyOrdersData = [
    { name: "Mon", value: 48 },
    { name: "Tue", value: 63 },
    { name: "Wed", value: 70 },
    { name: "Thu", value: 58 },
    { name: "Fri", value: 89 },
    { name: "Sat", value: 104 },
    { name: "Sun", value: 80 },
];

interface Order {
    id: string;
    customer: string;
    item: string;
    total: number;
    status: "Completed" | "Preparing" | "Cancelled";
}

const initialOrders: Order[] = [
    { id: "#BF-2891", customer: "Sarah Chen", item: "Flat White x 2", total: 9.00, status: "Completed" },
    { id: "#BF-2890", customer: "James Park", item: "Cold Brew, Espresso", total: 8.50, status: "Preparing" },
    { id: "#BF-2889", customer: "Mia Torres", item: "Latte Art", total: 5.50, status: "Completed" },
    { id: "#BF-2888", customer: "Liam Nguyen", item: "Seasonal Special x 2", total: 11.50, status: "Preparing" },
    { id: "#BF-2887", customer: "Ava Williams", item: "Iced Latte", total: 4.75, status: "Cancelled" },
];

export default function Dashboard() {
    const [mounted, setMounted] = useState(false);
    const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("month");
    const [searchQuery, setSearchQuery] = useState("");
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [orders, setOrders] = useState<Order[]>(initialOrders);
    const [isLive, setIsLive] = useState(true);
    const [displayName, setDisplayName] = useState("Admin");
    const [roleTitle, setRoleTitle] = useState("Super Admin");
    const [adminPhoto, setAdminPhoto] = useState("");

    useEffect(() => {
        setMounted(true);
        // Sync with system or body class for dark mode
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

    useEffect(() => {

        // Simulation of live updates
        const interval = setInterval(() => {
            if (isLive) {
                // Randomly add, complete or update an order
                setOrders(prev => {
                    const updated = [...prev];
                    // Change preparing to completed sometimes
                    const prepIndex = updated.findIndex(o => o.status === "Preparing");
                    if (prepIndex !== -1 && Math.random() > 0.6) {
                        updated[prepIndex] = { ...updated[prepIndex], status: "Completed" };
                    } else if (Math.random() > 0.7) {
                        // Add new order
                        const names = ["Oliver Smith", "Emma Watson", "Lucas Grey", "Sophia Martinez", "Jackson Doe"];
                        const items = ["Cappuccino", "Mocha Latte", "Caramel Macchiato", "Croissant", "Cold Brew"];
                        const prices = [4.50, 5.25, 5.50, 3.75, 4.00];
                        const randomIdx = Math.floor(Math.random() * names.length);
                        const newId = `#BF-${2892 + Math.floor(Math.random() * 100)}`;
                        
                        // Shift orders and insert new one at top
                        return [
                            {
                                id: newId,
                                customer: names[randomIdx],
                                item: items[randomIdx],
                                total: prices[randomIdx],
                                status: "Preparing" as const
                            },
                            ...updated.slice(0, 4)
                        ];
                    }
                    return updated;
                });
            }
        }, 12000);

        return () => clearInterval(interval);
    }, [isLive]);

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

    const filteredOrders = orders.filter(order => 
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.item.toLowerCase().includes(searchQuery.toLowerCase())
    );

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

    return (
        <div className="flex-1 p-4 md:p-8 space-y-6 bg-background min-h-screen text-foreground transition-colors duration-300">
            {/* Top Navigation / Header */}
            <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-5">
                <div>
                    <h1 className="font-serif text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-sm text-muted-foreground mt-1">Bean Fien Admin Panel</p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
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

                    {/* Dark Mode Toggle */}
                    <button 
                        onClick={toggleTheme}
                        className="p-2.5 rounded-xl border border-border bg-[#F3ECE3]/40 dark:bg-card text-muted-foreground hover:text-primary hover:border-primary transition-all"
                        title="Toggle Dark Mode"
                    >
                        {isDarkMode ? <Sun className="w-4 h-4 text-yellow-500" /> : <Moon className="w-4 h-4" />}
                    </button>

                    {/* Profile */}
                    <Link 
                        href="/admin/settings?profile=true"
                        className="flex items-center gap-3 px-3 py-1.5 rounded-xl border border-border bg-[#F3ECE3]/40 dark:bg-card hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors text-left"
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
                        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground hidden sm:block" />
                    </Link>
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
                        <h2 className="font-serif text-3xl font-extrabold mt-1 text-[#2C1A14] dark:text-white">$24,580</h2>
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
                        <h2 className="font-serif text-3xl font-extrabold mt-1 text-[#2C1A14] dark:text-white">1,234</h2>
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
                        <h2 className="font-serif text-3xl font-extrabold mt-1 text-[#2C1A14] dark:text-white">856</h2>
                    </div>
                </div>

                {/* Stars Card */}
                <div className="bg-card p-6 rounded-2xl border border-border/80 shadow-sm hover:shadow-md transition-all duration-300 group">
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl group-hover:scale-110 transition-transform">
                            <Star className="w-6 h-6" />
                        </div>
                        <span className="flex items-center gap-1 text-[11px] font-bold text-red-600 bg-red-50 dark:bg-red-950/30 px-2 py-0.5 rounded-full">
                            <TrendingDown className="w-3 h-3" /> -2.1%
                        </span>
                    </div>
                    <div className="mt-4">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Stars Issued</p>
                        <h2 className="font-serif text-3xl font-extrabold mt-1 text-[#2C1A14] dark:text-white">47.2K</h2>
                    </div>
                </div>
            </section>

            {/* Mid Section Charts */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Overview (Line Chart) */}
                <div className="bg-card p-6 rounded-2xl border border-border/80 shadow-sm lg:col-span-2 flex flex-col justify-between">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                        <div>
                            <h3 className="font-serif text-lg font-bold">Revenue Overview</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">Last 30 days</p>
                        </div>
                        {/* Time Range Tabs */}
                        <div className="flex bg-[#F3ECE3] dark:bg-[#2C1711] p-1 rounded-xl w-fit border border-border/40">
                            {(["week", "month", "year"] as const).map((range) => (
                                <button
                                    key={range}
                                    onClick={() => setTimeRange(range)}
                                    className={`
                                        px-4 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200
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
                                        <stop offset="5%" stopColor={isDarkMode ? "#C07C4A" : "#8B4513"} stopOpacity={0.2}/>
                                        <stop offset="95%" stopColor={isDarkMode ? "#C07C4A" : "#8B4513"} stopOpacity={0}/>
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
                                    formatter={(value: any) => [`${value}%`, "Share"]}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center Total label */}
                        <div className="absolute text-center">
                            <span className="text-2xl font-extrabold font-serif">100%</span>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Total Share</p>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border/40">
                        {categorySplitData.map((item) => (
                            <div key={item.name} className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                    <span className="text-muted-foreground">{item.name}</span>
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
                        <p className="text-xs text-muted-foreground mt-0.5">This week</p>
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
                            <p className="text-xs text-muted-foreground mt-0.5">Live updates</p>
                        </div>
                        {/* Live Indicator Switch */}
                        <button 
                            onClick={() => setIsLive(!isLive)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-[#F3ECE3]/40 transition-all"
                        >
                            <span className={`w-2 h-2 rounded-full ${isLive ? "bg-emerald-500 animate-pulse" : "bg-zinc-400"}`} />
                            <span className="text-muted-foreground">{isLive ? "Live" : "Paused"}</span>
                            <RefreshCw className={`w-3 h-3 text-muted-foreground ml-1 ${isLive ? "animate-spin" : ""}`} style={{ animationDuration: "3s" }} />
                        </button>
                    </div>

                    <div className="overflow-x-auto">
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
                                    filteredOrders.map((order) => (
                                        <tr key={order.id} className="hover:bg-[#F3ECE3]/10 dark:hover:bg-white/5 transition-colors">
                                            <td className="py-3.5 px-2 font-bold text-[#8B4513] dark:text-[#C07C4A]">{order.id}</td>
                                            <td className="py-3.5 px-2 font-medium">{order.customer}</td>
                                            <td className="py-3.5 px-2 text-muted-foreground text-xs">{order.item}</td>
                                            <td className="py-3.5 px-2 text-right font-bold">${order.total.toFixed(2)}</td>
                                            <td className="py-3.5 px-2">
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
                    </div>
                </div>
            </section>
        </div>
    );
}
