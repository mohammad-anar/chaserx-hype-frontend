"use client";
import React, { useState, useEffect, useRef } from "react";
import { Bell, CheckCheck, ShoppingBag, Info, Clock, Loader2 } from "lucide-react";
import { io, Socket } from "socket.io-client";
import { formatDistanceToNow } from "date-fns";
import { 
    useGetMyNotificationsQuery, 
    useMarkAsReadMutation, 
    useMarkAllAsReadMutation 
} from "@/redux/features/notification/notificationApi";
import { toast } from "sonner";

interface NotificationDropdownProps {
    variant?: "admin" | "storefront";
    isDark?: boolean;
}

export default function NotificationDropdown({ variant = "admin", isDark = false }: NotificationDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const { data: response, isLoading, refetch } = useGetMyNotificationsQuery(undefined, {
        pollingInterval: 15000,
    });

    const [markAsRead] = useMarkAsReadMutation();
    const [markAllAsRead, { isLoading: isMarkingAll }] = useMarkAllAsReadMutation();

    const notifications = response?.data?.notifications || [];
    const unreadCount = response?.data?.unreadCount || 0;

    // Listen to real-time socket events & refetch notifications
    useEffect(() => {
        const socketUrl = process.env.NEXT_PUBLIC_BASEURL || "http://localhost:5000";
        const socket: Socket = io(socketUrl, {
            transports: ["websocket", "polling"],
        });

        socket.on("connect", () => {
            const userStr = localStorage.getItem("user");
            if (userStr) {
                try {
                    const user = JSON.parse(userStr);
                    if (user?.id) socket.emit("register", user.id);
                    if (user?.role === "ADMIN") socket.emit("join_room", "ADMIN");
                } catch (e) {
                    console.error("Socket user parse error:", e);
                }
            }
        });

        socket.on("order_notification", () => {
            refetch();
        });

        return () => {
            socket.disconnect();
        };
    }, [refetch]);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleMarkSingleRead = async (id: string, isRead: boolean) => {
        if (isRead) return;
        try {
            await markAsRead(id).unwrap();
        } catch (e) {
            console.error("Failed to mark notification as read:", e);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllAsRead(undefined).unwrap();
            toast.success("All notifications marked as read");
        } catch (e) {
            toast.error("Failed to mark all as read");
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Notification Bell Icon Button */}
            {variant === "storefront" ? (
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`p-2 rounded-full transition-colors relative group cursor-pointer ${
                        isDark ? "hover:bg-white/8" : "hover:bg-[#2C1A14]/5"
                    }`}
                    title="Notifications"
                    aria-label="Notifications"
                >
                    <Bell className={`w-[22px] h-[22px] transition-colors ${
                        isDark 
                            ? "text-[#FAF6F0]/90 group-hover:text-white" 
                            : "text-[#2C1A14] group-hover:text-[#C07C4A]"
                    }`} />
                    
                    {unreadCount > 0 && (
                        <span className={`absolute -top-0.5 -right-0.5 text-[9px] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center ${
                            isDark 
                                ? "bg-[#E05A2B] text-white" 
                                : "bg-[#C07C4A] text-white"
                        }`}>
                            {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                    )}
                </button>
            ) : (
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="relative p-2.5 rounded-xl border border-border bg-white dark:bg-card hover:bg-[#FAF6F0] dark:hover:bg-zinc-800 text-foreground transition-all cursor-pointer shadow-sm focus:outline-none"
                    title="Notifications"
                >
                    <Bell className="w-5 h-5 text-[#2C1A14] dark:text-amber-200" />
                    
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-md animate-pulse">
                            {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                    )}
                </button>
            )}

            {/* Notification Dropdown Panel */}
            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-white dark:bg-[#1E0F0B] border border-border/80 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    {/* Header */}
                    <div className="p-4 border-b border-border/30 flex items-center justify-between bg-[#FAF6F0]/60 dark:bg-zinc-900/60">
                        <div className="flex items-center gap-2">
                            <h3 className="font-serif text-sm font-bold text-[#2C1A14] dark:text-white">Notifications</h3>
                            {unreadCount > 0 && (
                                <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 text-[10px] font-extrabold">
                                    {unreadCount} New
                                </span>
                            )}
                        </div>

                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                disabled={isMarkingAll}
                                className="flex items-center gap-1 text-[11px] font-bold text-[#8B4513] hover:text-[#C07C4A] dark:text-amber-400 dark:hover:text-amber-300 transition-colors cursor-pointer"
                            >
                                {isMarkingAll ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCheck className="w-3.5 h-3.5" />}
                                Mark all as read
                            </button>
                        )}
                    </div>

                    {/* Body List */}
                    <div className="max-h-80 overflow-y-auto divide-y divide-border/20">
                        {isLoading ? (
                            <div className="p-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin text-primary" /> Loading notifications...
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 text-center space-y-2">
                                <Bell className="w-8 h-8 text-muted-foreground/40 mx-auto" />
                                <p className="text-xs font-bold text-muted-foreground">No notifications yet</p>
                                <p className="text-[11px] text-muted-foreground/75">You&apos;ll be notified when orders are placed or updated.</p>
                            </div>
                        ) : (
                            notifications.map((item: any) => (
                                <div
                                    key={item.id}
                                    onClick={() => handleMarkSingleRead(item.id, item.isRead)}
                                    className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer ${
                                        !item.isRead 
                                            ? "bg-[#FAF6F0]/80 dark:bg-amber-950/20 hover:bg-[#F3ECE3]" 
                                            : "hover:bg-slate-50 dark:hover:bg-zinc-900/50 opacity-80"
                                    }`}
                                >
                                    <div className={`p-2 rounded-xl flex-shrink-0 mt-0.5 ${
                                        item.type === "ORDER_PLACED"
                                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                            : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                                    }`}>
                                        {item.type === "ORDER_PLACED" ? <ShoppingBag className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                                    </div>

                                    <div className="flex-1 min-w-0 space-y-1">
                                        <div className="flex items-start justify-between gap-2">
                                            <h4 className={`text-xs font-bold truncate ${!item.isRead ? "text-[#2C1A14] dark:text-white font-extrabold" : "text-foreground"}`}>
                                                {item.title}
                                            </h4>
                                            {!item.isRead && (
                                                <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0 mt-1" />
                                            )}
                                        </div>

                                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                            {item.message}
                                        </p>

                                        <p className="text-[10px] text-muted-foreground/70 flex items-center gap-1 font-medium pt-0.5">
                                            <Clock className="w-3 h-3" />
                                            {item.createdAt ? formatDistanceToNow(new Date(item.createdAt), { addSuffix: true }) : "Just now"}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-2.5 bg-[#FAF6F0]/60 dark:bg-zinc-900/60 border-t border-border/30 text-center">
                        <span className="text-[10px] text-muted-foreground font-semibold">
                            Bean Fien Realtime Order Activity System
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
