"use client";
import React, { useMemo, useEffect, useState } from "react";
import Link from "next/link";
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    BarChart,
    Bar
} from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";

// Mock data for line chart - Revenue Trend
const revenueData = [
    { name: "Jun 1", revenue: 1300 },
    { name: "Jun 5", revenue: 1500 },
    { name: "Jun 9", revenue: 1350 },
    { name: "Jun 13", revenue: 1750 },
    { name: "Jun 17", revenue: 1620 },
    { name: "Jun 21", revenue: 1880 },
    { name: "Jun 25", revenue: 1780 },
    { name: "Jun 29", revenue: 2150 }
];

// Mock data for bar chart - Orders per Day
const ordersData = [
    { name: "Mon", orders: 50 },
    { name: "Tue", orders: 65 },
    { name: "Wed", orders: 73 },
    { name: "Thu", orders: 57 },
    { name: "Fri", orders: 90 },
    { name: "Sat", orders: 105 },
    { name: "Sun", orders: 80 }
];

interface TopItem {
    rank: number;
    name: string;
    count: number;
    maxCount: number;
    image: string;
}

const topItems: TopItem[] = [
    { rank: 1, name: "Espresso", count: 421, maxCount: 421, image: "https://images.unsplash.com/photo-1510972527921-ce03766a1cf1?auto=format&fit=crop&w=100&q=80" },
    { rank: 2, name: "Flat White", count: 342, maxCount: 421, image: "https://images.unsplash.com/photo-1577968897966-3d4325b36b61?auto=format&fit=crop&w=100&q=80" },
    { rank: 3, name: "Latte Art", count: 287, maxCount: 421, image: "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=100&q=80" },
    { rank: 4, name: "Cold Brew", count: 198, maxCount: 421, image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=100&q=80" },
    { rank: 5, name: "Iced Latte", count: 156, maxCount: 421, image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=100&q=80" },
    { rank: 6, name: "Seasonal Special", count: 134, maxCount: 421, image: "https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=100&q=80" }
];

export default function Analytics() {
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

    return (
        <div className="flex-1 p-4 md:p-8 space-y-6 bg-[#FAF6F0] dark:bg-background min-h-screen text-foreground transition-colors duration-300">
            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
                <div>
                    <h1 className="font-serif text-3xl font-bold tracking-tight text-[#2C1A14] dark:text-white">Analytics</h1>
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

            {/* Charts Row */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Trend Line Chart */}
                <div className="bg-white dark:bg-card p-6 rounded-3xl border border-border/60 shadow-sm space-y-4">
                    <div>
                        <h3 className="font-serif text-base font-bold text-[#2C1A14] dark:text-white">Revenue Trend</h3>
                        <p className="text-xs text-muted-foreground">Monthly comparison</p>
                    </div>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8B4513" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#8B4513" stopOpacity={0.0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E6DFD5" className="dark:stroke-zinc-800" />
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fontSize: 10, fill: "#8E7E73" }}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tickFormatter={(val) => `$${val}`}
                                    domain={[0, 2800]}
                                    ticks={[0, 700, 1400, 2100, 2800]}
                                    tick={{ fontSize: 10, fill: "#8E7E73" }}
                                />
                                <Tooltip 
                                    formatter={(value) => [`$${value}`, "Revenue"]}
                                    contentStyle={{ borderRadius: 12, border: "1px solid #E6DFD5" }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="revenue" 
                                    stroke="#8B4513" 
                                    strokeWidth={2}
                                    fillOpacity={1} 
                                    fill="url(#colorRevenue)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Orders per Day Bar Chart */}
                <div className="bg-white dark:bg-card p-6 rounded-3xl border border-border/60 shadow-sm space-y-4">
                    <div>
                        <h3 className="font-serif text-base font-bold text-[#2C1A14] dark:text-white">Orders per Day</h3>
                        <p className="text-xs text-muted-foreground">Peak hours insight</p>
                    </div>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={ordersData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E6DFD5" className="dark:stroke-zinc-800" />
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fontSize: 10, fill: "#8E7E73" }}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    domain={[0, 120]}
                                    ticks={[0, 30, 60, 90, 120]}
                                    tick={{ fontSize: 10, fill: "#8E7E73" }}
                                />
                                <Tooltip 
                                    formatter={(value) => [value, "Orders"]}
                                    contentStyle={{ borderRadius: 12, border: "1px solid #E6DFD5" }}
                                />
                                <Bar 
                                    dataKey="orders" 
                                    fill="#8B4513" 
                                    radius={[6, 6, 0, 0]} 
                                    maxBarSize={36}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </section>

            {/* Three Middle Stats Cards */}
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {/* Avg Order Value */}
                <div className="bg-white dark:bg-card p-5 rounded-2xl border border-border/60 shadow-sm flex items-center justify-between min-h-[90px]">
                    <div className="space-y-1">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Avg Order Value</span>
                        <h3 className="font-serif text-2xl font-bold text-[#2C1A14] dark:text-white">$7.43</h3>
                    </div>
                    <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        <TrendingUp className="w-3.5 h-3.5" /> +3.2%
                    </span>
                </div>

                {/* Customer Return Rate */}
                <div className="bg-white dark:bg-card p-5 rounded-2xl border border-border/60 shadow-sm flex items-center justify-between min-h-[90px]">
                    <div className="space-y-1">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Customer Return Rate</span>
                        <h3 className="font-serif text-2xl font-bold text-[#2C1A14] dark:text-white">68%</h3>
                    </div>
                    <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        <TrendingUp className="w-3.5 h-3.5" /> +5.1%
                    </span>
                </div>

                {/* Rewards Redeemed */}
                <div className="bg-white dark:bg-card p-5 rounded-2xl border border-border/60 shadow-sm flex items-center justify-between min-h-[90px]">
                    <div className="space-y-1">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Rewards Redeemed</span>
                        <h3 className="font-serif text-2xl font-bold text-[#2C1A14] dark:text-white">147</h3>
                    </div>
                    <span className="inline-flex items-center gap-0.5 text-xs font-bold text-red-500">
                        <TrendingDown className="w-3.5 h-3.5" /> -1.8%
                    </span>
                </div>
            </section>

            {/* Top Performing Items Section */}
            <div className="bg-white dark:bg-card p-6 rounded-3xl border border-border/60 shadow-sm space-y-6">
                <div>
                    <h3 className="font-serif text-base font-bold text-[#2C1A14] dark:text-white">Top Performing Items</h3>
                    <p className="text-xs text-muted-foreground">By total orders this month</p>
                </div>

                <div className="space-y-4">
                    {topItems.map((item) => {
                        const fillWidth = `${(item.count / item.maxCount) * 100}%`;
                        return (
                            <div key={item.rank} className="flex items-center gap-4 text-xs font-semibold">
                                {/* Rank */}
                                <span className="w-4 text-muted-foreground text-center font-normal">{item.rank}</span>
                                
                                {/* Image Thumbnail */}
                                <div 
                                    className="w-10 h-10 rounded-xl bg-cover bg-center border border-border flex-shrink-0"
                                    style={{ backgroundImage: `url(${item.image})` }}
                                />

                                {/* Item Name */}
                                <span className="w-28 text-[#2C1A14] dark:text-white truncate">{item.name}</span>

                                {/* Progress Bar wrapper */}
                                <div className="flex-1 bg-[#FAF6F0] dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden relative">
                                    <div 
                                        className="bg-[#8B4513] h-full rounded-full transition-all duration-500" 
                                        style={{ width: fillWidth }} 
                                    />
                                </div>

                                {/* Count */}
                                <span className="w-10 text-right font-bold text-[#2C1A14] dark:text-white">{item.count}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
