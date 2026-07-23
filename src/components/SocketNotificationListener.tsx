"use client";
import { useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";

export default function SocketNotificationListener() {
    useEffect(() => {
        const socketUrl = process.env.NEXT_PUBLIC_BASEURL || "http://localhost:5000";
        const socket: Socket = io(socketUrl, {
            transports: ["websocket", "polling"],
        });

        socket.on("connect", () => {
            console.log("⚡ Connected to Socket.IO notification server:", socket.id);
            const userStr = localStorage.getItem("user");
            if (userStr) {
                try {
                    const user = JSON.parse(userStr);
                    if (user?.id) {
                        socket.emit("register", user.id);
                    }
                    if (user?.role === "ADMIN") {
                        socket.emit("join_room", "ADMIN");
                    }
                } catch (e) {
                    console.error("Socket register parse error:", e);
                }
            }
        });

        socket.on("order_notification", (data: { type: string; order: any; message: string }) => {
            console.log("🔔 Socket notification received:", data);
            if (data.type === "ORDER_PLACED") {
                toast.success(`🛒 ${data.message}`, {
                    description: `Total: $${Number(data.order?.total || 0).toFixed(2)} | Status: ${data.order?.status || 'PENDING'}`,
                    duration: 6000,
                });
            } else if (data.type === "ORDER_STATUS_CHANGED") {
                toast.info(`📦 ${data.message}`, {
                    description: `Order ${data.order?.orderNumber} status is now ${data.order?.status}`,
                    duration: 6000,
                });
            }
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    return null;
}
