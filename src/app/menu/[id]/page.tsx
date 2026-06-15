"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    ShoppingBag,
    ChevronDown,
    Plus,
    Minus,
    Trash2,
    Check,
    X,
    ArrowRight,
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

const categoryDescriptions = {
    espresso: "TWO SHOTS OF OUR SIGNATURE HOUSE BLEND WITH NOTES OF DARK CHOCOLATE AND ROASTED",
    coldbrew: "12-HOUR COLD EXTRACTION INFUSED WITH NITROGEN FOR A SMOOTH STOUT-LIKE FINISH",
    seasonal: "TEMPORARY SPECIAL SELECTIONS CREATED FOR SEASONAL HARVEST SENSATIONS",
    bakery: "FRESHLY BAKED PASTRY SELECTIONS DELIVERED EVERY MORNING TO OUR BARISTAS",
    hot: "EXQUISITELY BREWED HOT SPECIALTIES SERVED AT THE PERFECT TEMPERATE HEIGHT",
    iced: "CHILLED ESSENCES SERVED OVER PRISTINE CRYSTALLINE ICE FOR CRISP REFRESHMENT",
    blended: "CREAMY CRUSHED BLENDS BALANCED WITH SWEET SYRUPS AND DELECTABLE WHIP"
};

const categoryTitles = {
    espresso: "Espresso Classics",
    coldbrew: "Cold Brew",
    seasonal: "Seasonal Specials",
    bakery: "Bakery Selections",
    hot: "Hot Beverages",
    iced: "Iced Refreshers",
    blended: "Blended Delights"
};

export default function MenuDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();

    const [mounted, setMounted] = useState(false);

    // Customizer State
    const [customSize, setCustomSize] = useState<"small" | "medium" | "large">("small");
    const [customMilk, setCustomMilk] = useState<"whole" | "oat" | "almond" | "coconut">("whole");
    const [customAddons, setCustomAddons] = useState<string[]>([]);
    const [customInstructions, setCustomInstructions] = useState("");

    const { cart, addToCart, updateQuantity } = useCart();

    // Find current selected item
    const selectedItem = menuItems.find(item => item.id === id) || menuItems[0];
    const categoryItems = menuItems.filter(item => item.category === selectedItem.category);

    useEffect(() => {
        setTimeout(() => {
            setMounted(true);
        }, 0);
    }, [id]);

    // Calculate customization price
    const calculateCustomizerPrice = () => {
        let base = selectedItem.price;
        // Size modifier
        if (customSize === "medium") base += 0.50;
        if (customSize === "large") base += 1.00;
        // Milk modifier
        if (customMilk !== "whole") base += 0.80;
        // Add-ons modifier
        base += customAddons.length * 0.75;
        return base;
    };

    const handleAddAddon = (addon: string) => {
        if (customAddons.includes(addon)) {
            setCustomAddons(prev => prev.filter(a => a !== addon));
        } else {
            setCustomAddons(prev => [...prev, addon]);
        }
    };

    // Add Customized Item to Cart
    const handleAddCustomizedToCart = () => {
        const itemPrice = calculateCustomizerPrice();

        const existing = cart.find(i => 
            i.item.id === selectedItem.id && 
            i.size === customSize && 
            i.milk === customMilk && 
            JSON.stringify(i.addons.slice().sort()) === JSON.stringify(customAddons.slice().sort()) && 
            i.instructions === customInstructions
        );

        if (existing) {
            updateQuantity(existing.id, 1);
        } else {
            const newCartItem: CustomCartItem = {
                id: `${selectedItem.id}-${Date.now()}`,
                item: selectedItem,
                quantity: 1,
                size: customSize,
                milk: customMilk,
                addons: [...customAddons],
                instructions: customInstructions,
                finalPrice: itemPrice
            };
            addToCart(newCartItem);
        }
    };

    if (!mounted) return null;

    const currentPrice = calculateCustomizerPrice();

    return (
        <div className="min-h-screen text-[#2C1A14] bg-[#FAF6F0] relative selection:bg-[#C07C4A] selection:text-[#FAF6F0] scroll-smooth">
            {/* Header Navigation */}
            <Navbar theme="light" />

            {/* CIRCULAR CATEGORY VISUALIZER SECTION (Screenshot 3 layout) */}
            <section className="w-full bg-[#FAF6F0] py-12 border-b border-[#2C1A14]/10 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-12">

                    {/* Left Column: Category title, line, all-caps description */}
                    <ScrollReveal variant="fadeInLeft" className="w-full md:w-[28%]">
                        <div className="text-left space-y-4">
                            <h2 className="font-serif text-5xl md:text-6xl font-black text-[#2C1A14] leading-tight">
                                {categoryTitles[selectedItem.category]}
                            </h2>
                            <div className="w-12 h-[2px] bg-[#2C1A14]/30" />
                            <p className="text-xs tracking-widest text-[#6B5E59] font-bold leading-relaxed max-w-xs">
                                {categoryDescriptions[selectedItem.category]}
                            </p>
                        </div>
                    </ScrollReveal>

                    {/* Middle Column: Large circular visual container filled with coffee beans, containing the drink circle */}
                    <ScrollReveal variant="scaleIn" className="w-full md:w-[42%] flex flex-col items-center justify-center">
                        <div className="relative w-80 h-80 rounded-full overflow-hidden border-[6px] border-[#C07C4A]/30 shadow-2xl flex items-center justify-center bg-[#2C1A14]">
                            {/* Coffee Beans Background Overlay */}
                            <div
                                className="absolute inset-0 bg-cover bg-center opacity-65 mix-blend-overlay"
                                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80')" }}
                            />

                            {/* Centered Circular drink cutout */}
                            <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-[#FAF6F0] relative z-10 shadow-xl bg-white p-1 transition-transform duration-500 hover:scale-105">
                                <img src={selectedItem.image} alt={selectedItem.name} className="w-full h-full rounded-full object-cover" />
                            </div>
                        </div>

                        {/* Order Now button below circle visualizer */}
                        <button
                            onClick={handleAddCustomizedToCart}
                            className="mt-8 px-10 py-4 rounded-lg bg-[#2A120C] hover:bg-[#4A241A] text-white border border-[#C07C4A]/40 text-xs font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-4 group transition-all duration-300 hover:scale-105"
                        >
                            <span>${currentPrice.toFixed(2)}</span>
                            <span className="opacity-30">— — —</span>
                            <span className="group-hover:text-[#C07C4A] transition-colors">Order Now</span>
                        </button>
                    </ScrollReveal>

                    {/* Right Column: List of items in the same category (rendered as rounded tiles) */}
                    <ScrollReveal variant="fadeInRight" delay={0.1} className="w-full md:w-[30%]">
                        <div className="flex flex-col gap-3.5 pr-1">
                            {categoryItems.map((item) => {
                                const isActive = item.id === selectedItem.id;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => router.push(`/menu/${item.id}`)}
                                        className={`
                                            w-full rounded-xl p-3 flex items-center gap-4 transition-all duration-300 border text-left shadow-sm
                                            ${isActive
                                                ? "bg-[#2A120C] text-[#FAF6F0] border-[#C07C4A] border-2 scale-102 ring-2 ring-[#C07C4A]/20"
                                                : "bg-white text-[#2C1A14] border-[#2C1A14]/10 hover:bg-[#2C1A14]/5"
                                            }
                                        `}
                                    >
                                        {/* Thumbnail inside small rounded box */}
                                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-[#2C1A14] flex-shrink-0 flex items-center justify-center p-0.5 relative border border-[#C07C4A]/20">
                                            <div
                                                className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay"
                                                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=100&q=80')" }}
                                            />
                                            <img src={item.image} alt={item.name} className="w-full h-full rounded-lg object-cover relative z-10" />
                                        </div>

                                        {/* Item text */}
                                        <div className="flex-1 min-w-0 space-y-0.5">
                                            <h4 className="text-[11px] font-bold uppercase tracking-wider truncate">{item.name}</h4>
                                            <p className={`text-[9px] line-clamp-2 leading-relaxed ${isActive ? "text-[#FAF6F0]/70" : "text-[#6B5E59]"}`}>
                                                {item.description}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </ScrollReveal>
                </div>
            </section>

            {/* CUSTOMIZATION PANEL SECTION (Screenshot 4 layout) */}
            <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-left">
                <div className="space-y-12">

                    {/* Item title and description heading */}
                    <ScrollReveal>
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-[#2C1A14]/10 pb-8">
                            <div className="space-y-3 max-w-2xl">
                                <h2 className="font-serif text-4xl sm:text-5xl font-black text-[#2C1A14] tracking-tight">
                                    {selectedItem.name}
                                </h2>
                                <p className="text-sm text-[#6B5E59] leading-relaxed font-sans font-light">
                                    {selectedItem.description}
                                </p>
                            </div>
                            <span className="font-serif text-3xl font-extrabold text-[#C07C4A] whitespace-nowrap">
                                ${selectedItem.price.toFixed(2)}
                            </span>
                        </div>
                    </ScrollReveal>

                    {/* Option 1: SIZE SELECTION */}
                    <ScrollReveal delay={0.1}>
                        <div className="space-y-4">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#6B5E59] block">Size Selection</span>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {(["small", "medium", "large"] as const).map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => setCustomSize(size)}
                                        className={`
                                            py-4.5 rounded-lg text-xs font-bold transition-all border text-center flex flex-col justify-center gap-1 shadow-sm hover:scale-[1.01] duration-200
                                            ${customSize === size
                                                ? "bg-[#2A120C] text-white border-[#2A120C]"
                                                : "bg-white border-[#2C1A14]/15 hover:bg-[#2C1A14]/5 text-[#2C1A14]"
                                            }
                                        `}
                                    >
                                        <span className="capitalize text-sm font-black">{size}</span>
                                        <span className="text-[9px] font-normal opacity-60">
                                            {size === "small" && "12oz"}
                                            {size === "medium" && "16oz (+$0.50)"}
                                            {size === "large" && "20oz (+$1.00)"}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </ScrollReveal>

                    {/* Option 2: MILK ALTERNATIVES */}
                    <ScrollReveal delay={0.2}>
                        <div className="space-y-4">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#6B5E59] block">Milk Alternatives</span>
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                                {(["whole", "oat", "almond", "coconut"] as const).map((milk) => (
                                    <button
                                        key={milk}
                                        onClick={() => setCustomMilk(milk)}
                                        className={`
                                            py-4 px-4 rounded-lg text-xs font-bold transition-all border flex items-center justify-center gap-2 shadow-sm hover:scale-[1.01] duration-200
                                            ${customMilk === milk
                                                ? "bg-[#2A120C] text-white border-[#2A120C]"
                                                : "bg-white border-[#2C1A14]/15 hover:bg-[#2C1A14]/5 text-[#2C1A14]"
                                            }
                                        `}
                                    >
                                        {customMilk === milk && <Check className="w-4 h-4 text-[#C07C4A]" />}
                                        <span className="capitalize font-black">{milk}</span>
                                        {milk !== "whole" && <span className="text-[9px] font-normal opacity-60">+$0.80</span>}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </ScrollReveal>

                    {/* Option 3: ADD-ONS */}
                    <ScrollReveal delay={0.3}>
                        <div className="space-y-4">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#6B5E59] block">Add-Ons</span>
                            <div className="flex flex-wrap gap-3">
                                {["Extra Shot", "Vanilla Syrup", "Caramel Drizzle"].map((addon) => {
                                    const isActive = customAddons.includes(addon);
                                    return (
                                        <button
                                            key={addon}
                                            type="button"
                                            onClick={() => handleAddAddon(addon)}
                                            className={`
                                                py-3 px-5 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 shadow-sm hover:scale-[1.02] duration-200
                                                ${isActive
                                                    ? "bg-[#2A120C] text-white border-[#2A120C]"
                                                    : "bg-white border-[#2C1A14]/15 hover:bg-[#2C1A14]/5 text-[#2C1A14]"
                                                }
                                            `}
                                        >
                                            <span className="font-black">+ {addon}</span>
                                            <span className="text-[9px] font-normal opacity-60">(+$0.75)</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </ScrollReveal>

                    {/* Option 4: SPECIAL INSTRUCTIONS */}
                    <ScrollReveal delay={0.4}>
                        <div className="space-y-4">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-[#6B5E59] block">Special Instructions</label>
                            <textarea
                                placeholder="Any specific preferences?"
                                value={customInstructions}
                                onChange={(e) => setCustomInstructions(e.target.value)}
                                className="w-full px-5 py-4 rounded-lg border border-[#2C1A14]/15 bg-white text-[#2C1A14] focus:outline-none focus:ring-2 focus:ring-[#C07C4A]/30 text-xs resize-none h-24 leading-relaxed"
                            />
                        </div>
                    </ScrollReveal>

                    {/* Bottom Add to Cart triggers */}
                    <ScrollReveal delay={0.5}>
                        <div className="space-y-3 pt-8 border-t border-[#2C1A14]/10">
                            <button
                                onClick={handleAddCustomizedToCart}
                                className="w-full py-4.5 rounded-lg bg-[#2A120C] hover:bg-[#4A241A] text-white text-xs font-bold tracking-wide transition-all shadow-md shadow-[#2A120C]/25 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
                            >
                                <ShoppingBag className="w-4 h-4 text-[#C07C4A]" />
                                <span>Add to Cart — ${currentPrice.toFixed(2)}</span>
                            </button>
                            <p className="text-[10px] text-center text-[#6B5E59] font-semibold tracking-wide">
                                Earn {Math.round(currentPrice * 10)} Rewards Points with this purchase
                            </p>
                        </div>
                    </ScrollReveal>

                </div>
            </section>

            {/* Footer Section */}
            <Footer theme="light" />

            {/* Shopping Cart Drawer */}
            <CartDrawer theme="light" />
        </div>
    );
}
