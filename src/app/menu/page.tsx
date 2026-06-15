"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { menuItems } from "@/constants/menu";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import ScrollReveal from "@/components/ScrollReveal";

const categoryDisplayNames = {
    espresso: "Espresso Classics",
    coldbrew: "Cold Brew",
    seasonal: "Seasonal Specials",
    bakery: "Bakery Selections"
};

type CategoryType = "espresso" | "coldbrew" | "seasonal" | "bakery";

export default function CustomerMenu() {
    const [mounted, setMounted] = useState(false);
    const [activeTab, setActiveTab] = useState<CategoryType>("espresso");

    useEffect(() => {
        setTimeout(() => {
            setMounted(true);
        }, 0);
    }, []);

    if (!mounted) return null;

    return (
        <div className="min-h-screen text-[#2C1A14] bg-[#FAF6F0] relative selection:bg-[#C07C4A] selection:text-[#FAF6F0] scroll-smooth">
            {/* Header Navigation */}
            <Navbar theme="light" />

            {/* Menu Header Title */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-6 text-left">
                <ScrollReveal>
                    <div className="space-y-4 max-w-3xl">
                        <h1 className="font-serif text-5xl md:text-6xl font-extrabold tracking-tight text-[#2C1A14] leading-none">
                            Our Menu
                        </h1>
                        <p className="text-[#6B5E59] text-base md:text-lg leading-relaxed font-sans font-light">
                            Crafted with precision, delivered with passion. Explore our curated selection of specialty coffee and seasonal favorites.
                        </p>

                        {/* Section links TAB SYSTEM bar (State Driven) */}
                        <div className="flex gap-6 pt-6 text-sm font-bold uppercase tracking-wider border-b border-[#2C1A14]/10 pb-3.5 flex-wrap">
                            {(["espresso", "coldbrew", "seasonal", "bakery"] as const).map((tab) => {
                                const label = tab === "espresso" ? "Espresso" : tab === "coldbrew" ? "Cold Brew" : tab === "seasonal" ? "Seasonal Specials" : "Bakery";
                                const isActive = activeTab === tab;
                                return (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`
                                            pb-2 transition-all font-bold tracking-wider uppercase border-b-[3px] text-xs sm:text-sm
                                            ${isActive 
                                                ? "text-[#2C1A14] border-[#8B4513] font-black" 
                                                : "text-[#6B5E59]/75 border-transparent hover:text-[#2C1A14] hover:border-[#2C1A14]/40"
                                            }
                                        `}
                                    >
                                        {label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </ScrollReveal>
            </section>

            {/* ACTIVE TAB SECTION CONTENT */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[400px]">
                <div className="flex justify-between items-center mb-8 border-b border-[#2C1A14]/5 pb-4">
                    <h2 className="font-serif text-2xl md:text-3xl font-extrabold text-[#2C1A14]">
                        {categoryDisplayNames[activeTab]}
                    </h2>
                    <Link 
                        href={`/menu/${menuItems.filter(i => i.category === activeTab)[0]?.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#C07C4A] hover:text-[#8B4513] transition-colors group"
                    >
                        <span>See all</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                    {menuItems.filter(i => i.category === activeTab).map((item, index) => (
                        <ScrollReveal key={item.id} delay={index * 0.08} duration={0.4} variant="scaleIn" className="h-full">
                            <div className="bg-[#FAF6F0] rounded-2xl border border-[#2C1A14]/15 p-4 flex flex-col justify-between hover:shadow-lg transition-all duration-300 group hover:-translate-y-1 h-full">
                                <div className="h-64 rounded-xl overflow-hidden mb-5">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                </div>
                                <div className="space-y-4 flex flex-col flex-1 justify-between">
                                    <div className="space-y-1">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-serif text-lg font-bold text-[#2C1A14] group-hover:text-[#8B4513] transition-colors">{item.name}</h3>
                                            <span className="font-bold text-[#8B4513] text-sm">${item.price.toFixed(2)}</span>
                                        </div>
                                        <p className="text-xs text-[#6B5E59] leading-relaxed line-clamp-2">{item.description}</p>
                                    </div>
                                    <Link 
                                        href={`/menu/${item.id}`}
                                        className="w-full py-3 rounded-lg bg-[#2A120C] hover:bg-[#4A241A] text-white text-xs font-bold tracking-wider transition-colors text-center block"
                                    >
                                        Add to Cart
                                    </Link>
                                </div>
                            </div>
                        </ScrollReveal>
                    ))}
                </div>
            </section>

            {/* Footer Section */}
            <Footer theme="light" />

            {/* Shopping Cart Drawer */}
            <CartDrawer theme="light" />
        </div>
    );
}
