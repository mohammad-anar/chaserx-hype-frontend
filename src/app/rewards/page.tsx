"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { logout, selectIsAuthenticated } from "@/redux/features/auth/authSlice";
import {
    ShoppingCart,
    Plus,
    Minus,
    Trash2,
    Check,
    X,
    ShoppingBag,
    Gift,
    Heart,
    Globe,
    AtSign
} from "lucide-react";
import { MenuItem, CustomCartItem } from "@/types/menu";
import { menuItems } from "@/constants/menu";
import { useCart } from "@/hooks/useCart";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import ScrollReveal from "@/components/ScrollReveal";

export default function RewardsPage() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const [mounted, setMounted] = useState(false);

    // User Balance state
    const [pointsBalance, setPointsBalance] = useState(1240);

    const { addToCart } = useCart();

    useEffect(() => {
        setTimeout(() => {
            setMounted(true);
        }, 0);
    }, []);

    // Redeem a Reward directly from the mascot cup
    const handleRedeemMascotReward = () => {
        if (pointsBalance >= 150) {
            setPointsBalance(prev => prev - 150);
            const freeItem = menuItems.find(i => i.id === "e2") || menuItems[0];
            const newCartItem: CustomCartItem = {
                id: `reward-mascot-${Date.now()}`,
                item: freeItem,
                quantity: 1,
                size: "medium",
                milk: "oat",
                addons: [],
                instructions: "Redeemed from points balance",
                finalPrice: 0,
                isReward: true,
                rewardPointsCost: 150
            };
            addToCart(newCartItem);
        }
    };

    // Add reward item to cart
    const handleAddRewardToCart = (pointsCost: number, name: string, baseId: string) => {
        const baseItem = menuItems.find(i => i.id === baseId) || menuItems.find(i => i.name === "Vanilla Sweet Cream") || menuItems[0];

        setPointsBalance(prev => prev - pointsCost);

        const newCartItem: CustomCartItem = {
            id: `reward-${pointsCost}-${Date.now()}`,
            item: {
                ...baseItem,
                name: `${baseItem.name} (${pointsCost} PTS Reward)`
            },
            quantity: 1,
            size: "medium",
            milk: "whole",
            addons: [],
            instructions: "Point Catalog Reward",
            finalPrice: 0,
            isReward: true,
            rewardPointsCost: pointsCost
        };

        addToCart(newCartItem);
    };

    if (!mounted) return null;

    return (
        <div className="min-h-screen text-[#2C1A14] bg-[#FAF6F0] relative selection:bg-[#C07C4A] selection:text-[#FAF6F0] scroll-smooth font-sans">
            {/* Header Navigation */}
            <Navbar theme="light" />

            {/* HERO / STATUS SECTION (Reference Image 1) */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-left overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

                    {/* Left Details */}
                    <div className="lg:col-span-7 space-y-10 opacity-0 animate-fade-in-left">
                        <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#2C1A14] leading-tight">
                            Your Loyalty, Elevated.
                        </h1>

                        <div className="space-y-1 opacity-0 animate-fade-in-up delay-150">
                            <span className="text-[#6B5E59] text-xl font-bold font-sans tracking-wide block">
                                Your Balance
                            </span>
                            <span className="font-serif font-black text-7xl sm:text-8xl text-[#2C1A14] tracking-tight block leading-none">
                                {pointsBalance.toLocaleString()}
                            </span>
                            <span className="text-[#C07C4A]/60 text-[10px] font-bold uppercase tracking-widest block pt-2">
                                reward points available
                            </span>
                        </div>
                    </div>

                    {/* Right Mascot Illustration - Rendered Directly on Background, No Card Border */}
                    <div className="lg:col-span-5 flex flex-col items-center justify-center opacity-0 animate-fade-in-right delay-200">
                        <div className="relative flex flex-col items-center justify-center max-w-sm w-full group">

                            <div className="w-80 h-80 relative animate-float">
                                <img
                                    src="/reward.png"
                                    alt="Bean Fien Rewards"
                                    className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                                />
                            </div>

                            {/* Center-aligned Redeem Reward button directly below Mascot */}
                            <div className="mt-4 w-full flex justify-center opacity-0 animate-fade-in delay-300">
                                <button
                                    onClick={handleRedeemMascotReward}
                                    className="px-8 py-3 rounded-lg bg-[#2C120C] hover:bg-[#4A241A] text-white text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-md shadow-[#2C120C]/10 hover:scale-[1.03]"
                                >
                                    Redeem Reward
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            {/* CATALOG SECTION (Reference Image 2) */}
            <section className="bg-[#FAF6F0] py-16 text-left border-t border-[#2C1A14]/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

                    {/* Catalog Header */}
                    <ScrollReveal>
                        <div className="space-y-1">
                            <span className="text-[#C07C4A] text-xs font-bold uppercase tracking-widest block">
                                REWARDS CATALOG
                            </span>
                            <h2 className="font-serif text-3xl md:text-4xl font-extrabold text-[#2C1A14]">
                                Unlock Your Benefits
                            </h2>
                        </div>
                    </ScrollReveal>

                    {/* Grid of Catalog Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                        {/* 50 PTS Card */}
                        <ScrollReveal delay={0} className="h-full">
                            <div className="bg-[#FAF6F0] rounded-2xl border border-[#2C1A14]/10 p-5 flex flex-col justify-between hover:shadow-lg transition-all duration-300 group hover:-translate-y-1 h-full">
                                <div className="relative h-64 rounded-xl overflow-hidden mb-5">
                                    <span className="absolute top-4.5 left-4.5 z-10 bg-[#2C120C] text-white text-[10px] font-black uppercase tracking-wider py-1.5 px-3 rounded-lg">
                                        50 PTS
                                    </span>
                                    <img
                                        src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=500&q=80"
                                        alt="Vanilla Sweet Cream"
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                </div>
                                <div className="space-y-5 flex flex-col flex-1 justify-between text-center">
                                    <div className="space-y-2 text-left">
                                        <h3 className="font-serif text-lg font-bold text-[#2C1A14] group-hover:text-[#8B4513] transition-colors">
                                            Vanilla Sweet Cream
                                        </h3>
                                        <p className="text-xs text-[#6B5E59] leading-relaxed">
                                            House-made cold brew topped with a float of vanilla-infused sweet cream.
                                        </p>
                                    </div>

                                    {/* Centered Add to Cart button */}
                                    <div className="w-full flex justify-center pt-2">
                                        <button
                                            onClick={() => handleAddRewardToCart(50, "Vanilla Sweet Cream (50 PTS)", "c2")}
                                            className="px-8 py-2.5 rounded-lg bg-[#2C120C] hover:bg-[#4A241A] text-white text-xs font-bold tracking-wider transition-colors"
                                        >
                                            Add to Cart
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>

                        {/* 150 PTS Card */}
                        <ScrollReveal delay={0.15} className="h-full">
                            <div className="bg-[#FAF6F0] rounded-2xl border border-[#2C1A14]/10 p-5 flex flex-col justify-between hover:shadow-lg transition-all duration-300 group hover:-translate-y-1 h-full">
                                <div className="relative h-64 rounded-xl overflow-hidden mb-5">
                                    <span className="absolute top-4.5 left-4.5 z-10 bg-[#2C120C] text-white text-[10px] font-black uppercase tracking-wider py-1.5 px-3 rounded-lg">
                                        150 PTS
                                    </span>
                                    <img
                                        src="https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=500&q=80"
                                        alt="Oat Silk Latte"
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                </div>
                                <div className="space-y-5 flex flex-col flex-1 justify-between text-center">
                                    <div className="space-y-2 text-left">
                                        <h3 className="font-serif text-lg font-bold text-[#2C1A14] group-hover:text-[#8B4513] transition-colors">
                                            Oat Silk Latte
                                        </h3>
                                        <p className="text-xs text-[#6B5E59] leading-relaxed">
                                            Double ristretto shot paired with micro-foamed premium oat milk.
                                        </p>
                                    </div>

                                    {/* Centered Add to Cart button */}
                                    <div className="w-full flex justify-center pt-2">
                                        <button
                                            onClick={() => handleAddRewardToCart(150, "Oat Silk Latte (150 PTS)", "dg2")}
                                            className="px-8 py-2.5 rounded-lg bg-[#2C120C] hover:bg-[#4A241A] text-white text-xs font-bold tracking-wider transition-colors"
                                        >
                                            Add to Cart
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>

                        {/* 500 PTS Card */}
                        <ScrollReveal delay={0.3} className="h-full">
                            <div className="bg-[#FAF6F0] rounded-2xl border border-[#2C1A14]/10 p-5 flex flex-col justify-between hover:shadow-lg transition-all duration-300 group hover:-translate-y-1 h-full">
                                <div className="relative h-64 rounded-xl overflow-hidden mb-5">
                                    <span className="absolute top-4.5 left-4.5 z-10 bg-[#2C120C] text-white text-[10px] font-black uppercase tracking-wider py-1.5 px-3 rounded-lg">
                                        500 PTS
                                    </span>
                                    <img
                                        src="https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=500&q=80"
                                        alt="Hazelnut Frappe"
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                </div>
                                <div className="space-y-5 flex flex-col flex-1 justify-between text-center">
                                    <div className="space-y-2 text-left">
                                        <h3 className="font-serif text-lg font-bold text-[#2C1A14] group-hover:text-[#8B4513] transition-colors">
                                            Hazelnut Frappe
                                        </h3>
                                        <p className="text-xs text-[#6B5E59] leading-relaxed">
                                            Blended coffee, milk, and hazelnut syrup, finished with whipped cream.
                                        </p>
                                    </div>

                                    {/* Centered Add to Cart button */}
                                    <div className="w-full flex justify-center pt-2">
                                        <button
                                            onClick={() => handleAddRewardToCart(500, "Hazelnut Frappe (500 PTS)", "b1")}
                                            className="px-8 py-2.5 rounded-lg bg-[#2C120C] hover:bg-[#4A241A] text-white text-xs font-bold tracking-wider transition-colors"
                                        >
                                            Add to Cart
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>

                    </div>

                </div>
            </section>

            {/* RECENT ACTIVITY SECTION (Reference Image 2) */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-left">
                <div className="space-y-8">
                    <ScrollReveal>
                        <h2 className="font-serif text-2xl md:text-3xl font-extrabold text-[#2C1A14]">
                            Recent Activity
                        </h2>
                    </ScrollReveal>

                    <div className="space-y-4 max-w-5xl">

                        {/* Activity 1 - Border and rounded card, light background */}
                        <ScrollReveal delay={0}>
                            <div className="bg-[#FAF6F0] rounded-2xl border border-[#2C1A14]/10 p-5 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-[#FAF0ED] border border-[#F6DED6] flex items-center justify-center text-[#C07C4A]">
                                        <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
                                    </div>
                                    <div className="text-left space-y-1">
                                        <h4 className="text-sm font-bold text-[#2C1A14]">In-Store Purchase</h4>
                                        <p className="text-xs text-[#6B5E59]">May 12, 2024 • Downtown Soho</p>
                                    </div>
                                </div>
                                <span className="font-bold text-[#8B4513] text-sm tracking-wide">
                                    +120 pts
                                </span>
                            </div>
                        </ScrollReveal>

                        {/* Activity 2 */}
                        <ScrollReveal delay={0.1}>
                            <div className="bg-[#FAF6F0] rounded-2xl border border-[#2C1A14]/10 p-5 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-[#FAF0ED] border border-[#F6DED6] flex items-center justify-center text-[#C07C4A]">
                                        <Gift className="w-5 h-5 stroke-[1.5]" />
                                    </div>
                                    <div className="text-left space-y-1">
                                        <h4 className="text-sm font-bold text-[#2C1A14]">Reward Redeemed: Free Oat Latte</h4>
                                        <p className="text-xs text-[#6B5E59]">May 08, 2024 • Mobile Order</p>
                                    </div>
                                </div>
                                <span className="font-bold text-[#2C1A14] text-sm tracking-wide">
                                    -150 pts
                                </span>
                            </div>
                        </ScrollReveal>

                        {/* Activity 3 */}
                        <ScrollReveal delay={0.2}>
                            <div className="bg-[#FAF6F0] rounded-2xl border border-[#2C1A14]/10 p-5 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-[#FAF0ED] border border-[#F6DED6] flex items-center justify-center text-[#C07C4A]">
                                        <Heart className="w-5 h-5 stroke-[1.5]" />
                                    </div>
                                    <div className="text-left space-y-1">
                                        <h4 className="text-sm font-bold text-[#2C1A14]">Birthday Bonus</h4>
                                        <p className="text-xs text-[#6B5E59]">May 01, 2024 • System</p>
                                    </div>
                                </div>
                                <span className="font-bold text-[#8B4513] text-sm tracking-wide">
                                    +200 pts
                                </span>
                            </div>
                        </ScrollReveal>

                    </div>
                </div>
            </section>

            {/* Footer Section */}
            <Footer theme="light" />

            {/* Shopping Cart Drawer */}
            <CartDrawer theme="light" />
        </div>
    );
}
