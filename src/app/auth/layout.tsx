"use client";
import React from "react";
import NonAuthenticatedGuard from "@/providers/NonAuthenticatedGuard";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <NonAuthenticatedGuard redirectTo="/admin">
            <div className="relative min-h-screen w-full bg-[#0B0503] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden select-none">
                {/* Background image overlay with blur and low opacity */}
                <div 
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none opacity-40 scale-105"
                    style={{ 
                        backgroundImage: "url('/bg.jpg')",
                    }}
                />

                {/* Spotlight gradient effect */}
                <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,_rgba(217,83,30,0.15)_0%,_rgba(11,5,3,0.95)_70%,_#0B0503_100%)]" />

                {/* Decorative particles or subtle light glows */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-amber-600/10 rounded-full blur-[120px] pointer-events-none" />

                {/* Content wrapper */}
                <div className="relative z-10 w-full max-w-md flex flex-col items-center">
                    {children}
                </div>
            </div>
        </NonAuthenticatedGuard>
    );
}
