"use client";
import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Coffee, ShieldAlert, Wrench } from "lucide-react";

export default function MaintenanceGuard({ children }: { children: React.ReactNode }) {
    const [isMaintenance, setIsMaintenance] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const checkMaintenance = () => {
            const savedMode = localStorage.getItem("bf_maintenance_mode");
            setIsMaintenance(savedMode === "true");
        };

        checkMaintenance();
        window.addEventListener("maintenanceModeChanged", checkMaintenance);
        window.addEventListener("storage", checkMaintenance);

        return () => {
            window.removeEventListener("maintenanceModeChanged", checkMaintenance);
            window.removeEventListener("storage", checkMaintenance);
        };
    }, []);

    // Prevent non-admin routes from navigating when Maintenance Mode is ON
    const isAdminRoute = pathname?.startsWith("/admin");

    if (isMaintenance && !isAdminRoute) {
        return (
            <div className="fixed inset-0 z-[99999] bg-[#1E0F0B] text-[#FAF6F0] flex flex-col items-center justify-center p-6 text-center select-none">
                <div className="max-w-md w-full space-y-6 flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
                    {/* Coffee Maintenance Animated Icon */}
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-[#3D251E] border-2 border-[#C07C4A]/40 flex items-center justify-center shadow-2xl">
                            <Coffee className="w-12 h-12 text-[#C07C4A] animate-bounce" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 p-2 bg-[#8B4513] text-amber-300 rounded-full border border-[#1E0F0B] shadow-lg">
                            <Wrench className="w-5 h-5 animate-spin" style={{ animationDuration: "6s" }} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8B4513]/40 border border-[#C07C4A]/30 text-xs font-bold uppercase tracking-wider text-amber-300">
                            <ShieldAlert className="w-3.5 h-3.5" /> Maintenance Mode Active
                        </span>
                        <h1 className="font-serif text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                            We&apos;ll Be Right Back!
                        </h1>
                        <p className="text-sm text-amber-100/75 leading-relaxed">
                            Bean Fien Coffee Shop is currently undergoing scheduled system maintenance to serve you better. All storefront ordering and customer routes are temporarily disabled.
                        </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#2C1A14]/80 border border-[#C07C4A]/20 w-full text-xs text-muted-foreground space-y-1">
                        <p className="font-bold text-amber-200">Estimated Return: Shortly</p>
                        <p className="text-[11px] opacity-75">Thank you for your patience while we brew something special!</p>
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
