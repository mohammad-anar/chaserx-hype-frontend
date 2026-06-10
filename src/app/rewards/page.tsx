"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
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

// Menu Items Interface (consistent with menu pages)
interface MenuItem {
    id: string;
    name: string;
    price: number;
    description: string;
    category: "espresso" | "coldbrew" | "seasonal" | "bakery";
    image: string;
}

const menuItems: MenuItem[] = [
    { id: "e1", name: "Double Espresso", price: 3.50, description: "Two shots of our signature house blend with notes of dark chocolate and roasted nuts.", category: "espresso", image: "https://images.unsplash.com/photo-1510972527921-ce03766a1cf1?auto=format&fit=crop&w=500&q=80" },
    { id: "e2", name: "Oat Milk Latte", price: 5.25, description: "Silky steamed oat milk poured over a rich double shot of espresso.", category: "espresso", image: "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=500&q=80" },
    { id: "e3", name: "Flat White", price: 4.75, description: "Micro-foam milk poured over ristretto shots for a velvety, intense flavor.", category: "espresso", image: "https://images.unsplash.com/photo-1577968897966-3d4325b36b61?auto=format&fit=crop&w=500&q=80" },
    { id: "c1", name: "Nitro Cold Brew", price: 5.50, description: "Infused with nitrogen for a smooth, creamy finish and a natural sweetness.", category: "coldbrew", image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=500&q=80" },
    { id: "c2", name: "Vanilla Sweet Cream", price: 6.00, description: "House-made cold brew topped with a float of vanilla-infused sweet cream.", category: "coldbrew", image: "https://images.unsplash.com/photo-1513530534585-c7b1394c6d51?auto=format&fit=crop&w=500&q=80" },
    { id: "c3", name: "Nitro Velvet", price: 6.50, description: "Steeped for 24 hours and nitrogen-infused for a creamy, silk-like finish that defines perfection.", category: "coldbrew", image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=500&q=80" }
];

interface CustomCartItem {
    id: string; 
    item: MenuItem;
    quantity: number;
    size: "small" | "medium" | "large";
    milk: "whole" | "oat" | "almond" | "coconut";
    addons: string[];
    instructions: string;
    finalPrice: number;
    isReward?: boolean;
    rewardPointsCost?: number;
}

export default function RewardsPage() {
    const [mounted, setMounted] = useState(false);
    const [cart, setCart] = useState<CustomCartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    
    // User Balance state
    const [pointsBalance, setPointsBalance] = useState(1240);
    
    // Success overlay / notification
    const [notification, setNotification] = useState<string | null>(null);

    useEffect(() => {
        setMounted(true);
        // Sync cart from sessionStorage
        const savedCart = sessionStorage.getItem("bf_cart_custom");
        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart));
            } catch (e) {
                console.error("Failed to parse cart", e);
            }
        }
    }, []);

    const saveCart = (newCart: CustomCartItem[]) => {
        setCart(newCart);
        sessionStorage.setItem("bf_cart_custom", JSON.stringify(newCart));
    };

    const showNotification = (msg: string) => {
        setNotification(msg);
        setTimeout(() => {
            setNotification(null);
        }, 3000);
    };

    const updateQuantity = (itemId: string, delta: number) => {
        const updated = cart.map(i => {
            if (i.id === itemId) {
                const newQty = i.quantity + delta;
                return newQty > 0 ? { ...i, quantity: newQty } : null;
            }
            return i;
        }).filter(Boolean) as CustomCartItem[];
        saveCart(updated);
    };

    const removeFromCart = (itemId: string) => {
        const updated = cart.filter(i => i.id !== itemId);
        saveCart(updated);
    };

    const handleCheckout = () => {
        if (cart.length === 0) return;
        showNotification("Checkout successful! Your coffee is brewing.");
        saveCart([]);
        setIsCartOpen(false);
    };

    // Redeem a Reward directly from the mascot cup
    const handleRedeemMascotReward = () => {
        if (pointsBalance >= 150) {
            setPointsBalance(prev => prev - 150);
            showNotification("Redeemed 150 PTS for a Free Specialty Drink!");
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
            saveCart([...cart, newCartItem]);
        } else {
            showNotification("Insufficient point balance for standard drink redemption (150 PTS needed).");
        }
    };

    // Add reward item to cart
    const handleAddRewardToCart = (pointsCost: number, name: string, baseId: string) => {
        if (pointsBalance < pointsCost) {
            showNotification(`You need ${pointsCost} points to redeem this item.`);
            return;
        }

        const baseItem = menuItems.find(i => i.id === baseId) || menuItems.find(i => i.name === "Vanilla Sweet Cream") || menuItems[0];
        
        setPointsBalance(prev => prev - pointsCost);
        showNotification(`Redeemed ${pointsCost} PTS for a Free ${name}!`);

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

        saveCart([...cart, newCartItem]);
    };

    const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartSubtotal = cart.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0);

    if (!mounted) return null;

    return (
        <div className="min-h-screen text-[#2C1A14] bg-[#FAF6F0] relative selection:bg-[#C07C4A] selection:text-[#FAF6F0] scroll-smooth font-sans">
            {/* Notification Toast */}
            {notification && (
                <div className="fixed bottom-5 right-5 z-50 bg-[#C07C4A] text-[#140A07] font-semibold px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-[#FAF6F0]/20 animate-bounce">
                    <Check className="w-4 h-4" />
                    <span>{notification}</span>
                </div>
            )}

            {/* Header Navigation */}
            <header className="relative z-40 border-b border-[#2C1A14]/10 backdrop-blur-md bg-[#FAF6F0]/85 sticky top-0 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-[#2C1711] border border-[#C07C4A]/40 flex items-center justify-center relative transition-transform duration-300 group-hover:scale-105">
                            <img src="/logo.svg" alt="Bean Fien Logo" className="w-full h-full object-cover p-1" />
                        </div>
                        <div className="hidden sm:block text-left">
                            <span className="font-serif text-lg font-bold tracking-wider block leading-none text-[#2C1A14]">Bean Fien</span>
                            <span className="text-[9px] uppercase tracking-widest text-[#C07C4A] font-bold">Specialty Coffee</span>
                        </div>
                    </Link>

                    {/* Center Desktop Navigation Menu */}
                    <nav className="hidden md:flex items-center gap-8 text-sm font-semibold tracking-wider uppercase">
                        <Link href="/" className="text-[#2C1A14] hover:text-[#C07C4A] transition-colors pb-1 border-b-2 border-transparent hover:border-[#C07C4A]/40">Home</Link>
                        <Link href="/menu" className="text-[#2C1A14] hover:text-[#C07C4A] transition-colors pb-1 border-b-2 border-transparent hover:border-[#C07C4A]/40">Menu</Link>
                        <Link href="/rewards" className="text-[#C07C4A] transition-colors border-b-2 border-[#C07C4A] pb-1">Rewards</Link>
                        <Link href="/gift-cards" className="text-[#2C1A14] hover:text-[#C07C4A] transition-colors pb-1 border-b-2 border-transparent hover:border-[#C07C4A]/40">Gift Cards</Link>
                    </nav>

                    {/* Right utility buttons */}
                    <div className="flex items-center gap-6">
                        {/* Cart Button */}
                        <button 
                            onClick={() => setIsCartOpen(true)}
                            className="p-2 hover:bg-[#2C1A14]/5 transition-colors relative group"
                        >
                            <ShoppingCart className="w-6 h-6 text-[#2C1A14] group-hover:text-[#C07C4A] transition-colors" />
                            {totalCartItems > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 bg-[#C07C4A] text-[#140A07] text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border border-[#FAF6F0] animate-pulse">
                                    {totalCartItems}
                                </span>
                            )}
                        </button>

                        {/* Sign Out Capsule Button */}
                        <button 
                            onClick={() => showNotification("Successfully logged out (mock)")}
                            className="bg-[#2C120C] hover:bg-[#4A241A] text-[#FAF6F0] text-sm font-semibold tracking-wide px-6 py-2.5 rounded-full transition-colors"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </header>

            {/* HERO / STATUS SECTION (Reference Image 1) */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-left">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    
                    {/* Left Details */}
                    <div className="lg:col-span-7 space-y-10">
                        <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#2C1A14] leading-tight">
                            Your Loyalty, Elevated.
                        </h1>

                        <div className="space-y-1">
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
                    <div className="lg:col-span-5 flex flex-col items-center justify-center">
                        <div className="relative flex flex-col items-center justify-center max-w-sm w-full group">
                            
                            {/* Mascot Image */}
                            <div className="w-80 h-80 relative">
                                <img 
                                    src="/coffee_bean_mascot.png" 
                                    alt="Bean Fien Mascot" 
                                    className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-102"
                                />
                                
                                {/* Overlay Mug fill badge showing 10% */}
                                <div className="absolute top-[68%] left-[62%] -translate-x-1/2 -translate-y-1/2 text-[#2C1A14] font-black text-xs sm:text-sm tracking-wide bg-transparent">
                                    10%
                                </div>
                            </div>

                            {/* Center-aligned Redeem Reward button directly below Mascot */}
                            <div className="mt-4 w-full flex justify-center">
                                <button
                                    onClick={handleRedeemMascotReward}
                                    className="px-8 py-3 rounded-full bg-[#2C120C] hover:bg-[#4A241A] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-md shadow-[#2C120C]/10"
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
                    <div className="space-y-1">
                        <span className="text-[#C07C4A] text-xs font-bold uppercase tracking-widest block">
                            REWARDS CATALOG
                        </span>
                        <h2 className="font-serif text-3xl md:text-4xl font-extrabold text-[#2C1A14]">
                            Unlock Your Benefits
                        </h2>
                    </div>

                    {/* Grid of Catalog Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        
                        {/* 50 PTS Card */}
                        <div className="bg-[#FAF6F0] rounded-3xl border border-[#2C1A14]/10 p-5 flex flex-col justify-between hover:shadow-lg transition-all duration-300 group hover:-translate-y-1">
                            <div className="relative h-64 rounded-2xl overflow-hidden mb-5">
                                <span className="absolute top-4.5 left-4.5 z-10 bg-[#2C120C] text-white text-[10px] font-black uppercase tracking-wider py-1.5 px-3 rounded-lg">
                                    50 PTS
                                </span>
                                <img 
                                    src="https://images.unsplash.com/photo-1513530534585-c7b1394c6d51?auto=format&fit=crop&w=500&q=80" 
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
                                
                                {/* Capsule shape, centered Add to Cart button */}
                                <div className="w-full flex justify-center pt-2">
                                    <button 
                                        onClick={() => handleAddRewardToCart(50, "Vanilla Sweet Cream (50 PTS)", "c2")}
                                        className="px-8 py-2.5 rounded-full bg-[#2C120C] hover:bg-[#4A241A] text-white text-xs font-bold uppercase tracking-wider transition-colors"
                                    >
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* 150 PTS Card */}
                        <div className="bg-[#FAF6F0] rounded-3xl border border-[#2C1A14]/10 p-5 flex flex-col justify-between hover:shadow-lg transition-all duration-300 group hover:-translate-y-1">
                            <div className="relative h-64 rounded-2xl overflow-hidden mb-5">
                                <span className="absolute top-4.5 left-4.5 z-10 bg-[#2C120C] text-white text-[10px] font-black uppercase tracking-wider py-1.5 px-3 rounded-lg">
                                    150 PTS
                                </span>
                                <img 
                                    src="https://images.unsplash.com/photo-1513530534585-c7b1394c6d51?auto=format&fit=crop&w=500&q=80" 
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
                                
                                {/* Capsule shape, centered Add to Cart button */}
                                <div className="w-full flex justify-center pt-2">
                                    <button 
                                        onClick={() => handleAddRewardToCart(150, "Vanilla Sweet Cream (150 PTS)", "c2")}
                                        className="px-8 py-2.5 rounded-full bg-[#2C120C] hover:bg-[#4A241A] text-white text-xs font-bold uppercase tracking-wider transition-colors"
                                    >
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* 500 PTS Card */}
                        <div className="bg-[#FAF6F0] rounded-3xl border border-[#2C1A14]/10 p-5 flex flex-col justify-between hover:shadow-lg transition-all duration-300 group hover:-translate-y-1">
                            <div className="relative h-64 rounded-2xl overflow-hidden mb-5">
                                <span className="absolute top-4.5 left-4.5 z-10 bg-[#2C120C] text-white text-[10px] font-black uppercase tracking-wider py-1.5 px-3 rounded-lg">
                                    500 PTS
                                </span>
                                <img 
                                    src="https://images.unsplash.com/photo-1513530534585-c7b1394c6d51?auto=format&fit=crop&w=500&q=80" 
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
                                
                                {/* Capsule shape, centered Add to Cart button */}
                                <div className="w-full flex justify-center pt-2">
                                    <button 
                                        onClick={() => handleAddRewardToCart(500, "Vanilla Sweet Cream (500 PTS)", "c2")}
                                        className="px-8 py-2.5 rounded-full bg-[#2C120C] hover:bg-[#4A241A] text-white text-xs font-bold uppercase tracking-wider transition-colors"
                                    >
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>

                </div>
            </section>

            {/* RECENT ACTIVITY SECTION (Reference Image 2) */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-left">
                <div className="space-y-8">
                    <h2 className="font-serif text-2xl md:text-3xl font-extrabold text-[#2C1A14]">
                        Recent Activity
                    </h2>

                    <div className="space-y-4 max-w-5xl">
                        
                        {/* Activity 1 - Border and rounded card, light background */}
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

                        {/* Activity 2 */}
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

                        {/* Activity 3 */}
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

                    </div>
                </div>
            </section>

            {/* Footer Section */}
            <footer className="relative z-30 bg-[#4E281F] text-[#FAF6F0] py-16 px-4 md:px-8 border-t border-white/5 overflow-hidden">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                    <div className="text-center md:text-left">
                        <p className="text-sm text-[#FAF6F0]/80 leading-relaxed font-sans font-light">
                            Crafting aesthetic experiences, one bean at a time.<br />
                            Designed for the modern aficionado.
                        </p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-6 md:gap-8 text-sm font-semibold tracking-wide text-[#FAF6F0]/90">
                        <Link href="#" className="hover:text-[#C07C4A] transition-colors">Privacy Policy</Link>
                        <Link href="#" className="hover:text-[#C07C4A] transition-colors">Terms of Service</Link>
                        <Link href="#" className="hover:text-[#C07C4A] transition-colors">Contact Us</Link>
                    </div>

                    <div className="flex gap-4">
                        <Link href="#" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-[#FAF6F0]/80 hover:text-white hover:border-white transition-all hover:scale-105">
                            <Globe className="w-4 h-4 stroke-[1.5]" />
                        </Link>
                        <Link href="#" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-[#FAF6F0]/80 hover:text-white hover:border-white transition-all hover:scale-105">
                            <AtSign className="w-4 h-4 stroke-[1.5]" />
                        </Link>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/5 flex flex-col items-center justify-center relative z-10 text-center">
                    <h2 className="font-sans font-black text-[70px] sm:text-[100px] md:text-[130px] leading-none text-white/5 tracking-wider select-none mb-3 uppercase">
                        Bean Fien
                    </h2>
                    <p className="text-[11px] text-[#FAF6F0]/65 font-medium tracking-wide">
                        © 2026 Bean Fien. All rights reserved.
                    </p>
                </div>
            </footer>

            {/* Shopping Cart Drawer */}
            {isCartOpen && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div 
                        onClick={() => setIsCartOpen(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
                    />

                    <div className="relative w-full max-w-md bg-[#1E0F0B] h-full shadow-2xl p-6 flex flex-col justify-between border-l border-[#C07C4A]/20 animate-in slide-in-from-right duration-300">
                        {/* Header */}
                        <div className="flex justify-between items-center pb-5 border-b border-white/5">
                            <div className="flex items-center gap-2">
                                <ShoppingCart className="w-5 h-5 text-[#C07C4A]" />
                                <h3 className="font-serif text-lg font-bold text-white">Your Cart ({totalCartItems})</h3>
                            </div>
                            <button 
                                onClick={() => setIsCartOpen(false)}
                                className="p-1.5 rounded-full hover:bg-white/5 text-white/70 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Cart Items List */}
                        <div className="flex-1 overflow-y-auto py-5 space-y-4 pr-1">
                            {cart.length > 0 ? (
                                cart.map((cartItem) => (
                                    <div 
                                        key={cartItem.id}
                                        className="flex gap-4 bg-[#140A07] p-3.5 rounded-2xl border border-white/5 text-left items-center justify-between"
                                    >
                                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#24130F] flex-shrink-0">
                                            <img src={cartItem.item.image} alt={cartItem.item.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <h4 className="text-xs font-bold text-white truncate max-w-[130px]">{cartItem.item.name}</h4>
                                            
                                            {cartItem.isReward ? (
                                                <p className="text-[10px] text-[#C07C4A] font-semibold leading-none">
                                                    Redeemed for {cartItem.rewardPointsCost} PTS
                                                </p>
                                            ) : (
                                                <p className="text-[10px] text-white/50 leading-none">
                                                    Size: <span className="capitalize">{cartItem.size}</span> | Milk: <span className="capitalize">{cartItem.milk}</span>
                                                </p>
                                            )}

                                            {cartItem.addons.length > 0 && (
                                                <p className="text-[9px] text-[#C07C4A] truncate max-w-[150px]">
                                                    + {cartItem.addons.join(", ")}
                                                </p>
                                            )}
                                            <p className="text-xs font-bold text-[#C07C4A]">
                                                {cartItem.finalPrice === 0 ? "FREE" : `$${cartItem.finalPrice.toFixed(2)}`}
                                            </p>
                                            
                                            {/* Quantity Adjuster */}
                                            <div className="flex items-center gap-2.5 pt-1">
                                                <button 
                                                    onClick={() => updateQuantity(cartItem.id, -1)}
                                                    className="w-5 h-5 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors text-white"
                                                >
                                                    <Minus className="w-3 h-3" />
                                                </button>
                                                <span className="text-xs font-bold text-white">{cartItem.quantity}</span>
                                                <button 
                                                    onClick={() => updateQuantity(cartItem.id, 1)}
                                                    className="w-5 h-5 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors text-white"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => removeFromCart(cartItem.id)}
                                            className="p-2 text-white/40 hover:text-red-400 transition-colors"
                                            title="Remove Item"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center h-60 text-white/40 space-y-3">
                                    <ShoppingCart className="w-10 h-10 stroke-1" />
                                    <p className="text-sm font-semibold">Your cart is empty.</p>
                                    <Link 
                                        href="/menu"
                                        onClick={() => setIsCartOpen(false)}
                                        className="text-xs font-bold text-[#C07C4A] hover:underline"
                                    >
                                        Browse the Menu
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Footer Summary */}
                        <div className="pt-5 border-t border-white/5 space-y-4">
                            <div className="flex justify-between items-center text-sm font-semibold">
                                <span className="text-white/60">Subtotal</span>
                                <span className="text-white text-base font-bold">${cartSubtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs text-white/40">
                                <span>Taxes and service fees calculated at checkout</span>
                            </div>
                            <button
                                onClick={handleCheckout}
                                disabled={cart.length === 0}
                                className={`
                                    w-full py-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300
                                    ${cart.length > 0 
                                        ? "bg-[#C07C4A] text-[#140A07] hover:scale-[1.02] cursor-pointer shadow-lg shadow-[#C07C4A]/10" 
                                        : "bg-white/5 text-white/30 cursor-not-allowed border border-white/5"
                                    }
                                `}
                            >
                                Checkout & Buy
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
