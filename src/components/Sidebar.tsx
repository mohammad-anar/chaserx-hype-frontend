"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppDispatch } from "@/redux/hooks";
import { logout } from "@/redux/features/auth/authSlice";
import { toast } from "sonner";
import { 
    LayoutDashboard, 
    ShoppingBag, 
    Coffee, 
    Layers,
    Users, 
    Gift, 
    BarChart3, 
    Settings, 
    LogOut, 
    Menu as MenuIcon, 
    X 
} from "lucide-react";
import Logo from "@/components/Logo";

interface MenuItem {
    title: string;
    url: string;
    icon: React.ComponentType<{ className?: string }>;
}

const menuItems: MenuItem[] = [
    { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
    { title: "Orders", url: "/admin/orders", icon: ShoppingBag },
    { title: "Menu", url: "/admin/menu", icon: Coffee },
    { title: "Categories", url: "/admin/categories", icon: Layers },
    { title: "Customers", url: "/admin/customers", icon: Users },
    { title: "Rewards", url: "/admin/rewards", icon: Gift },
    { title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
    { title: "Settings", url: "/admin/settings", icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const [isOpen, setIsOpen] = useState(false);

    const toggleSidebar = () => setIsOpen(!isOpen);

    const handleLogout = () => {
        dispatch(logout());
        toast.success("Successfully logged out");
        router.push("/auth/login");
    };

    return (
        <>
            {/* Mobile Header */}
            <div className="lg:hidden flex items-center justify-between p-4 bg-[#1E0F0B] text-white sticky top-0 z-40 border-b border-[#2C1711]">
                <div className="flex items-center gap-3">
                    <Logo className="w-10 h-10" />
                    <div>
                        <h1 className="font-serif text-lg font-bold tracking-wide text-white">Bean Fien</h1>
                        <p className="text-[10px] text-[#C4B4A5] uppercase tracking-widest font-semibold">Admin</p>
                    </div>
                </div>
                <button 
                    onClick={toggleSidebar}
                    className="p-2 hover:bg-[#2C1711] rounded-lg transition-colors text-[#C4B4A5] hover:text-white"
                >
                    {isOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
                </button>
            </div>

            {/* Sidebar Shell */}
            <aside 
                className={`
                    fixed inset-y-0 left-0 z-50 lg:z-30 lg:sticky lg:top-0 lg:h-screen
                    w-72 bg-[#1E0F0B] text-[#C4B4A5] flex flex-col justify-between
                    transition-transform duration-300 ease-in-out border-r border-[#2C1711] overflow-y-auto
                    ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
                `}
            >
                {/* Upper Section */}
                <div>
                    {/* Header Logo */}
                    <div className="p-6 flex items-center gap-3 border-b border-[#2C1711]">
                        <Logo className="w-12 h-12" />
                        <div>
                            <h1 className="font-serif text-xl font-bold tracking-wide text-white">Bean Fien</h1>
                            <p className="text-[10px] text-[#8B4513] uppercase tracking-widest font-black">Admin</p>
                        </div>
                    </div>

                    {/* Navigation Menu */}
                    <nav className="p-4 space-y-1.5">
                        {menuItems.map((item) => {
                            const isActive = pathname === item.url;
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.title}
                                    href={item.url}
                                    onClick={() => setIsOpen(false)}
                                    className={`
                                        group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200
                                        ${isActive 
                                            ? "bg-[#2C1711] text-white font-medium shadow-md shadow-black/10 border-l-4 border-[#C07C4A]" 
                                            : "hover:bg-[#251410] hover:text-[#EAD8C7]"
                                        }
                                    `}
                                >
                                    <div className="flex items-center gap-3.5">
                                        <Icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${isActive ? "text-[#C07C4A]" : "text-[#8E7E73]"}`} />
                                        <span className="text-sm tracking-wide">{item.title}</span>
                                    </div>
                                    {isActive && (
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#C07C4A] shadow-[0_0_8px_#C07C4A]"></span>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Footer Section - Sticky at Bottom */}
                <div className="mt-auto sticky bottom-0 bg-[#1E0F0B] p-4 border-t border-[#2C1711] space-y-2 z-10">
                    <Link 
                        href="/"
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 hover:bg-[#251410] text-[#C4B4A5] hover:text-white rounded-xl transition-all duration-200 text-sm font-medium"
                    >
                        <span>View Website</span>
                    </Link>
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#2D1616] hover:bg-[#3E1F1F] text-[#FCA5A5] hover:text-white rounded-xl transition-all duration-200 border border-[#4A2020] text-sm font-medium cursor-pointer"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Backdrop */}
            {isOpen && (
                <div 
                    onClick={toggleSidebar}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                />
            )}
        </>
    );
}
