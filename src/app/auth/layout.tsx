"use client";
import React from "react";
import NonAuthenticatedGuard from "@/providers/NonAuthenticatedGuard";
import Logo from "@/components/Logo";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <NonAuthenticatedGuard redirectTo="/admin">
            <div className="relative min-h-screen w-full bg-[#080403] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden select-none">
                {/* Background image overlay with blur and low opacity */}
                <div 
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none opacity-20 scale-105"
                    style={{ 
                        backgroundImage: "url('/bg.jpg')",
                    }}
                />

                {/* Spotlight gradient effect */}
                <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,_rgba(192,124,74,0.12)_0%,_rgba(8,4,3,0.98)_70%,_#080403_100%)]" />

                {/* Decorative particles or subtle light glows */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-amber-600/5 rounded-full blur-[120px] pointer-events-none" />

                {/* Content wrapper */}
                <div className="relative z-10 w-full max-w-md flex flex-col items-center">
                    {/* Mascot Character Logo */}
                    <Logo className="w-20 h-20 mb-4 animate-fade-in" />

                    {/* Brand Title */}
                    <h1 className="font-serif text-4xl sm:text-5xl font-black text-white tracking-wide mb-8 drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                        Bean Fien
                    </h1>
                    {children}
                </div>
            </div>
        </NonAuthenticatedGuard>
    );
}
