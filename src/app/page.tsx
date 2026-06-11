"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { logout, selectIsAuthenticated } from "@/redux/features/auth/authSlice";
import { 
    ShoppingBag, 
    ChevronDown, 
    Plus, 
    Minus, 
    Trash2, 
    Check, 
    Gift, 
    CreditCard, 
    ArrowRight, 
    Star, 
    X,
    Gauge,
    Tag,
    MapPin,
    ArrowUpRight,
    Globe,
    AtSign
} from "lucide-react";
import { MenuItem, CustomCartItem } from "@/types/menu";
import { menuItems } from "@/constants/menu";
import { useCart } from "@/hooks/useCart";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import Logo from "@/components/Logo";

export default function WebsiteHome() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const [mounted, setMounted] = useState(false);
    const [menuTab, setMenuTab] = useState<"hot" | "iced" | "blended" | "bakery">("hot");
    
    // User / Profile Dropdown State
    const [userName, setUserName] = useState("Admin");
    const [userRole, setUserRole] = useState("Super Admin");
    const [userPhoto, setUserPhoto] = useState("");

    // Rewards status
    const [userStars, setUserStars] = useState(150);
    const [starsClaimed, setStarsClaimed] = useState(false);

    // Gift Card customiser state
    const [gcDesign, setGcDesign] = useState<"classic" | "birthday" | "holiday">("classic");
    const [gcAmount, setGcAmount] = useState<number>(25);
    const [gcCustomAmount, setGcCustomAmount] = useState<string>("");
    const [gcRecipient, setGcRecipient] = useState("");
    const [gcSuccess, setGcSuccess] = useState(false);

    const { cart, addToCart, updateQuantity, showNotification } = useCart();

    useEffect(() => {
        setMounted(true);
        // Load admin profile information from localStorage if available
        const savedName = localStorage.getItem("bf_admin_name");
        const savedRole = localStorage.getItem("bf_admin_role");
        const savedPhoto = localStorage.getItem("bf_admin_photo");
        if (savedName) setUserName(savedName);
        if (savedRole) setUserRole(savedRole);
        if (savedPhoto) setUserPhoto(savedPhoto);
    }, []);

    const handleAddToCart = (item: MenuItem) => {
        const existing = cart.find(i => 
            i.item.id === item.id && 
            i.size === "small" && 
            i.milk === "whole" && 
            i.addons.length === 0
        );
        if (existing) {
            updateQuantity(existing.id, 1);
        } else {
            const newCartItem: CustomCartItem = {
                id: `${item.id}-${Date.now()}`,
                item,
                quantity: 1,
                size: "small",
                milk: "whole",
                addons: [],
                instructions: "",
                finalPrice: item.price
            };
            addToCart(newCartItem);
        }
    };

    const claimReward = () => {
        if (userStars >= 150 && !starsClaimed) {
            setUserStars(prev => prev - 150);
            setStarsClaimed(true);
            showNotification("Free Coffee Reward claimed! Check your email coupon.");
        }
    };

    const handleGiftCardPurchase = (e: React.FormEvent) => {
        e.preventDefault();
        setGcSuccess(true);
        setTimeout(() => {
            setGcSuccess(false);
            setGcRecipient("");
            setGcCustomAmount("");
        }, 4000);
        showNotification(`Gift Card of $${gcCustomAmount ? gcCustomAmount : gcAmount} sent to ${gcRecipient || "recipient"}!`);
    };

    if (!mounted) return null;

    return (
        <div className="min-h-screen text-[#FAF6F0] bg-[#080403] relative selection:bg-[#E05A2B] selection:text-[#080403] overflow-x-hidden">
            {/* Background Image Overlay */}
            <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none opacity-25"
                style={{ 
                    backgroundImage: "url('/bg.jpg')",
                    filter: "brightness(0.4) contrast(1.2) saturate(0.9)",
                    maskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 50%, rgba(0,0,0,0.2) 85%, rgba(0,0,0,0) 100%)",
                    WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 50%, rgba(0,0,0,0.2) 85%, rgba(0,0,0,0) 100%)"
                }}
            />

            {/* Ambient Spotlight Radial Glow */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_35%_25%,_rgba(224,99,40,0.14)_0%,_rgba(8,4,3,0.99)_75%)]" />

            {/* Header + Hero Section Wrapper with Banner Background */}
            <div className="relative w-full bg-[#080403]">
                {/* Background Image Banner */}
                <div 
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none"
                    style={{ 
                        backgroundImage: "url('/banner.png')",
                    }}
                />
                
                {/* Custom Overlay for Banner background */}
                <div className="absolute inset-0 bg-black/60 pointer-events-none" />
                <div 
                    className="absolute inset-0 pointer-events-none" 
                    style={{
                        background: "linear-gradient(to bottom, transparent 40%, rgba(8, 4, 3, 0.75) 80%, #080403 100%)"
                    }}
                />

                {/* Content */}
                <div className="relative z-10">
                    {/* Header Navigation */}
                    <Navbar theme="dark" transparent={true} />

                    {/* Hero Section */}
                    <section id="home" className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 flex flex-col lg:flex-row items-center gap-12 min-h-[calc(100vh-72px)] justify-center">
                        {/* Hero Content Left */}
                        <div className="flex-1 text-left space-y-6 max-w-xl">
                            <div className="space-y-2">
                                <h1 className="font-sans text-6xl md:text-7xl font-black tracking-tight text-white leading-tight animate-fade-in">
                                    Bean Fien.
                                </h1>
                                <h2 className="font-serif text-4xl md:text-5xl font-normal italic text-[#E05A2B] leading-tight">
                                    A vibe for the ride
                                </h2>
                            </div>

                            <p className="text-base text-[#FAF6F0]/80 leading-relaxed font-sans font-light">
                                Experience the precision of specialty roasting and the energy of a modern pulse. 
                                Crafted for those who value the art of the pour.
                            </p>

                            <div className="flex flex-wrap gap-4 pt-2">
                                <Link 
                                    href="#daily-grind" 
                                    className="px-8 py-3.5 rounded-lg bg-[#2C120C] hover:bg-[#3E1A12] border border-[#E05A2B]/20 text-white text-sm font-bold tracking-wider uppercase transition-all duration-300 shadow-lg shadow-black/30 hover:scale-[1.02]"
                                >
                                    Order Now
                                </Link>
                                <Link 
                                    href="/rewards" 
                                    className="px-8 py-3.5 rounded-lg border border-white/40 hover:border-white/70 text-white text-sm font-bold tracking-wider uppercase transition-all duration-300 hover:bg-white/5"
                                >
                                    Join Rewards
                                </Link>
                            </div>
                        </div>

                        {/* Hero Images Collage Right */}
                        <div className="flex-1 w-full flex items-center justify-center relative min-h-[480px]">
                            <div className="flex items-center gap-4">
                                {/* Left Tall Image */}
                                <div className="w-[260px] sm:w-[280px] md:w-[300px] h-[400px] sm:h-[450px] md:h-[480px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative group">
                                    <img 
                                        src="https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=800" 
                                        alt="Coffee pouring splash" 
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                                    />
                                </div>

                                {/* Right Column Grid */}
                                <div className="flex flex-col gap-4 w-[260px] sm:w-[280px] md:w-[300px] h-[400px] sm:h-[450px] md:h-[480px]">
                                    {/* Top Row: Two Smaller Images */}
                                    <div className="flex gap-4 h-[190px] sm:h-[215px] md:h-[230px]">
                                        <div className="flex-1 rounded-xl overflow-hidden border border-white/10 shadow-2xl relative group">
                                            <img 
                                                src="https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=500" 
                                                alt="Roasted coffee beans" 
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                                            />
                                        </div>
                                        <div className="flex-1 rounded-xl overflow-hidden border border-white/10 shadow-2xl relative group">
                                            <img 
                                                src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=500" 
                                                alt="Espresso cup close up" 
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                                            />
                                        </div>
                                    </div>

                                    {/* Bottom Row: Wide Image */}
                                    <div className="flex-1 rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative group">
                                        <img 
                                            src="https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=600" 
                                            alt="Iced cream latte" 
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Explore text centered at the bottom */}
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 pointer-events-none">
                            <span className="text-[10px] uppercase tracking-[0.25em] text-[#FAF6F0]/65 font-bold">Explore</span>
                        </div>
                    </section>
                </div>
            </div>

            {/* SECTION 1: Stats Bar */}
            <section className="bg-[#2C1711] py-10 border-y border-white/5 relative z-30 shadow-inner">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
                        <div className="space-y-1 flex flex-col items-center">
                            <h3 className="font-serif text-3xl sm:text-4xl font-extrabold text-white">10x</h3>
                            <p className="text-xs text-[#EAD8C7]/75 font-semibold tracking-wide">Points per purchase</p>
                        </div>
                        <div className="space-y-1 flex flex-col items-center">
                            <h3 className="font-serif text-3xl sm:text-4xl font-extrabold text-white">500+</h3>
                            <p className="text-xs text-[#EAD8C7]/75 font-semibold tracking-wide">Menu combinations</p>
                        </div>
                        <div className="space-y-1 flex flex-col items-center">
                            <h3 className="font-serif text-3xl sm:text-4xl font-extrabold text-white">Free</h3>
                            <p className="text-xs text-[#EAD8C7]/75 font-semibold tracking-wide">Drink at 150 pts</p>
                        </div>
                        <div className="space-y-1 flex flex-col items-center">
                            <h3 className="font-serif text-3xl sm:text-4xl font-extrabold text-white">5 min</h3>
                            <p className="text-xs text-[#EAD8C7]/75 font-semibold tracking-wide">Avg. pickup time</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 2: The Daily Grind */}
            <section id="daily-grind" className="bg-[#FAF6F0] text-[#2C1A14] py-24 relative z-30 border-b border-[#2C1A14]/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Section Header */}
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-16">
                        <div className="text-left space-y-2">
                            <h2 className="font-serif text-4xl sm:text-5xl font-extrabold tracking-tight text-[#2C1A14]">
                                The Daily Grind
                            </h2>
                            <p className="text-sm sm:text-base text-[#6B5E59] font-medium">
                                Our most requested pours, crafted to perfection.
                            </p>
                        </div>
                        <Link 
                            href="#menu" 
                            className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#2C1A14] hover:text-[#8B4513] transition-colors border-b border-[#2C1A14] pb-1 hover:border-[#8B4513] group w-fit"
                        >
                            <span>Full Menu</span>
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </div>

                    {/* Drink Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Nitro Velvet */}
                        <div className="bg-[#FAF6F0] rounded-2xl overflow-hidden border border-[#2C1A14]/15 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1.5 p-4">
                            <div className="h-64 sm:h-72 rounded-xl overflow-hidden relative">
                                <img 
                                    src="https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&q=80&w=500" 
                                    alt="Nitro Velvet cold extraction" 
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                                />
                            </div>
                            <div className="pt-5 flex-1 flex flex-col justify-between text-left space-y-4">
                                <div className="space-y-1">
                                    <div className="flex justify-between items-center">
                                        <h4 className="font-serif text-xl font-bold text-[#2C1A14]">Nitro Velvet</h4>
                                        <span className="text-lg font-bold text-[#8B4513]">${menuItems.find(i => i.id === "dg1")?.price.toFixed(2)}</span>
                                    </div>
                                    <p className="text-xs text-[#6B5E59] leading-relaxed">
                                        12-hour cold extraction infused with nitrogen for a creamy, stout-like finish.
                                    </p>
                                </div>
                                <Link 
                                    href="/menu/c3"
                                    className="w-full py-3 rounded-lg bg-[#2A120C] hover:bg-[#4A241A] text-white text-xs font-bold uppercase tracking-widest transition-all duration-300 text-center block"
                                >
                                    Add to Cart
                                </Link>
                            </div>
                        </div>

                        {/* Oat Silk Latte */}
                        <div className="bg-[#FAF6F0] rounded-2xl overflow-hidden border border-[#2C1A14]/15 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1.5 p-4">
                            <div className="h-64 sm:h-72 rounded-xl overflow-hidden relative">
                                <img 
                                    src="https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=500" 
                                    alt="Oat Silk Latte" 
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                                />
                            </div>
                            <div className="pt-5 flex-1 flex flex-col justify-between text-left space-y-4">
                                <div className="space-y-1">
                                    <div className="flex justify-between items-center">
                                        <h4 className="font-serif text-xl font-bold text-[#2C1A14]">Oat Silk Latte</h4>
                                        <span className="text-lg font-bold text-[#8B4513]">${menuItems.find(i => i.id === "dg2")?.price.toFixed(2)}</span>
                                    </div>
                                    <p className="text-xs text-[#6B5E59] leading-relaxed">
                                        Double ristretto shot paired with micro-foamed premium oat milk.
                                    </p>
                                </div>
                                <Link 
                                    href="/menu/e2"
                                    className="w-full py-3 rounded-lg bg-[#2A120C] hover:bg-[#4A241A] text-white text-xs font-bold uppercase tracking-widest transition-all duration-300 text-center block"
                                >
                                    Add to Cart
                                </Link>
                            </div>
                        </div>

                        {/* Citrus Ember */}
                        <div className="bg-[#FAF6F0] rounded-2xl overflow-hidden border border-[#2C1A14]/15 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1.5 p-4">
                            <div className="h-64 sm:h-72 rounded-xl overflow-hidden relative">
                                <img 
                                    src="https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=500" 
                                    alt="Citrus Ember espresso" 
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                                />
                            </div>
                            <div className="pt-5 flex-1 flex flex-col justify-between text-left space-y-4">
                                <div className="space-y-1">
                                    <div className="flex justify-between items-center">
                                        <h4 className="font-serif text-xl font-bold text-[#2C1A14]">Citrus Ember</h4>
                                        <span className="text-lg font-bold text-[#8B4513]">${menuItems.find(i => i.id === "dg3")?.price.toFixed(2)}</span>
                                    </div>
                                    <p className="text-xs text-[#6B5E59] leading-relaxed">
                                        A warming blend of spiced espresso and blood orange reduction.
                                    </p>
                                </div>
                                <Link 
                                    href="/menu/s1"
                                    className="w-full py-3 rounded-lg bg-[#2A120C] hover:bg-[#4A241A] text-white text-xs font-bold uppercase tracking-widest transition-all duration-300 text-center block"
                                >
                                    Add to Cart
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 3: Everything in one app */}
            <section className="bg-[#FAF6F0] text-[#2C1A14] py-24 relative z-30 border-b border-[#2C1A14]/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Section Header */}
                    <div className="text-center space-y-3 max-w-2xl mx-auto mb-16">
                        <h2 className="font-serif text-4xl sm:text-5xl font-extrabold tracking-tight text-[#2C1A14]">
                            Everything in one app
                        </h2>
                        <p className="text-sm sm:text-base text-[#6B5E59] font-medium">
                            The ultimate coffee companion for your daily ritual.
                        </p>
                    </div>

                    {/* Features cards grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Express Checkout */}
                        <div className="bg-[#FAF6F0] p-8 rounded-2xl border border-[#2C1A14]/15 shadow-sm text-left space-y-4 hover:shadow-md transition-all duration-300">
                            <div className="w-12 h-12 rounded-xl bg-[#8B4513]/5 border border-[#8B4513]/10 flex items-center justify-center text-[#8B4513]">
                                <CreditCard className="w-6 h-6 stroke-1.5" />
                            </div>
                            <h3 className="font-serif text-xl font-bold text-[#2C1A14]">Express Checkout</h3>
                            <p className="text-xs text-[#6B5E59] leading-relaxed">
                                Save your favorites and skip the line with one-tap mobile ordering and payment.
                            </p>
                        </div>

                        {/* Elite Rewards */}
                        <div className="bg-[#FAF6F0] p-8 rounded-2xl border border-[#2C1A14]/15 shadow-sm text-left space-y-4 hover:shadow-md transition-all duration-300">
                            <div className="w-12 h-12 rounded-xl bg-[#8B4513]/5 border border-[#8B4513]/10 flex items-center justify-center text-[#8B4513]">
                                <Tag className="w-6 h-6 stroke-1.5" />
                            </div>
                            <h3 className="font-serif text-xl font-bold text-[#2C1A14]">Elite Rewards</h3>
                            <p className="text-xs text-[#6B5E59] leading-relaxed">
                                Track your points in real-time and unlock exclusive perks, early access, and free drinks.
                            </p>
                        </div>

                        {/* Brew Tracker */}
                        <div className="bg-[#FAF6F0] p-8 rounded-2xl border border-[#2C1A14]/15 shadow-sm text-left space-y-4 hover:shadow-md transition-all duration-300">
                            <div className="w-12 h-12 rounded-xl bg-[#8B4513]/5 border border-[#8B4513]/10 flex items-center justify-center text-[#8B4513]">
                                <MapPin className="w-6 h-6 stroke-1.5" />
                            </div>
                            <h3 className="font-serif text-xl font-bold text-[#2C1A14]">Brew Tracker</h3>
                            <p className="text-xs text-[#6B5E59] leading-relaxed">
                                Follow your delivery from the moment our baristas pull the shot to your doorstep.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 4: Loyalty Program (Your next pour is on us) */}
            <section id="loyalty" className="bg-[#0A0503] py-24 relative z-30 border-b border-white/5 text-left">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-16">
                    {/* Left details & progress indicator */}
                    <div className="flex-1 space-y-8 max-w-xl w-full">
                        <div className="space-y-4">
                            <span className="text-xs font-bold uppercase tracking-widest text-[#C07C4A]">Loyalty Program</span>
                            <h2 className="font-serif text-4xl sm:text-5xl font-extrabold text-white leading-tight">
                                Your next pour is on us.
                            </h2>
                            <p className="text-sm text-[#FAF6F0]/70 leading-relaxed font-light">
                                Join the Bean Fien circle. Earn beans with every purchase and unlock exclusive seasonal drops and members-only events.
                            </p>
                        </div>

                        {/* Current Balance Box */}
                        <div className="bg-[#180C08] p-6 rounded-2xl border border-white/5 space-y-6 shadow-xl w-full">
                            <div className="flex justify-between items-center text-xs font-bold">
                                <span className="text-white/80">Current Balance: 750 Beans</span>
                                <span className="text-[#C07C4A]">Free Drink at 1000</span>
                            </div>

                            {/* Progress bar */}
                            <div className="space-y-3">
                                <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden p-[1px] border border-white/5">
                                    <div 
                                        className="bg-gradient-to-r from-[#8B4513] to-[#C07C4A] h-full rounded-full transition-all duration-1000"
                                        style={{ width: "75%" }}
                                    />
                                </div>
                                {/* Progress Ticks */}
                                <div className="flex justify-between text-[10px] font-bold text-white/40 px-1">
                                    <span>250</span>
                                    <span>500</span>
                                    <span className="text-[#C07C4A] font-extrabold">750</span>
                                    <span>1000</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Black marble tray with coffee cups */}
                    <div className="flex-1 w-full flex justify-center relative">
                        <div className="w-full max-w-[480px] h-[340px] sm:h-[400px] bg-gradient-to-br from-[#1E252C] to-[#0D1013] rounded-3xl p-6 border border-white/10 shadow-2xl relative overflow-hidden flex items-center justify-center transform lg:rotate-2 hover:rotate-0 transition-transform duration-500 group">
                            {/* Coffee Cup Layout Collage Image */}
                            <img 
                                src="https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80&w=800" 
                                alt="Coffee cups tray view" 
                                className="w-full h-full object-cover rounded-2xl shadow-inner border border-white/5 group-hover:scale-[1.02] transition-transform duration-700"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 5: App Promotion with Tilted iPhone mockup */}
            <section id="app-promo" className="bg-[#FAF6F0] text-[#2C1A14] py-24 relative z-30 border-b border-[#2C1A14]/10 text-left">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-16">
                    {/* Left Column Description */}
                    <div className="flex-1 space-y-6 max-w-xl">
                        <h2 className="font-serif text-4xl sm:text-5xl font-extrabold tracking-tight text-[#2C1A14] leading-tight">
                            Your daily ritual,<br />now in your pocket.
                        </h2>
                        <p className="text-sm sm:text-base text-[#6B5E59] leading-relaxed font-light font-sans">
                            Order ahead, skip the line, and customize your drink with surgical precision. The Bean Fien app is coffee at your fingertips.
                        </p>

                        {/* Store Badges */}
                        <div className="flex flex-wrap gap-4 pt-4">
                            {/* App Store Badge */}
                            <Link 
                                href="#" 
                                className="inline-flex items-center gap-3 bg-[#2A120C] text-white px-5 py-3 rounded-2xl shadow hover:bg-[#4A241A] transition-all duration-300 w-fit"
                            >
                                <svg className="w-6 h-6 fill-current text-white" viewBox="0 0 24 24">
                                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.21.67-2.93 1.49-.62.69-1.16 1.84-1.01 2.96 1.11.09 2.26-.57 2.95-1.39z"/>
                                </svg>
                                <div className="text-left leading-none">
                                    <span className="text-[9px] uppercase tracking-wider block opacity-75">Download on the</span>
                                    <span className="text-sm font-bold block font-sans">App Store</span>
                                </div>
                            </Link>

                            {/* Google Play Badge */}
                            <Link 
                                href="#" 
                                className="inline-flex items-center gap-3 bg-[#2A120C] text-white px-5 py-3 rounded-2xl shadow hover:bg-[#4A241A] transition-all duration-300 w-fit"
                            >
                                <svg className="w-6 h-6 fill-current text-white" viewBox="0 0 24 24">
                                    <path d="M5 3.25c-.28 0-.5.22-.5.5v16.5c0 .28.22.5.5.5h1.22l9.06-9.06L6.22 3.25H5zm2.84.5l8.13 8.13-1.63 1.63L6.44 5.61l1.4-1.86zm8.88 8.88l3.19-3.19c.28-.28.28-.72 0-1L12.56 1.13c-.28-.28-.72-.28-1 0L7.88 4.81l8.84 8.82zm.72.72l-8.84-8.84-3.19 3.19c-.28.28-.28.72 0 1l7.35 7.35c.28.28.72.28 1 0l3.68-3.7z"/>
                                </svg>
                                <div className="text-left leading-none">
                                    <span className="text-[9px] uppercase tracking-wider block opacity-75">Get it on</span>
                                    <span className="text-sm font-bold block font-sans">Google Play</span>
                                </div>
                            </Link>
                        </div>
                    </div>

                    {/* Right Column Tilted iPhone Mockup */}
                    <div className="flex-1 w-full flex justify-center items-center relative py-6">
                        {/* CSS iPhone Frame */}
                        <div className="relative border-zinc-800 bg-zinc-800 border-[12px] rounded-[3rem] h-[580px] w-[285px] shadow-2xl transform lg:rotate-6 hover:rotate-0 transition-transform duration-500 overflow-hidden flex flex-col justify-between p-5 text-center relative border-b-[14px]">
                            {/* Speaker notch */}
                            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-4 bg-black rounded-full z-40 flex items-center justify-center">
                                <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 absolute left-4" />
                                <span className="w-8 h-1 bg-zinc-800 rounded-full" />
                            </div>

                            {/* Mobile App Screen Content */}
                            <div className="rounded-[2.2rem] overflow-hidden w-full h-full bg-[#0A0503] flex flex-col justify-between p-5 relative text-left border border-white/5">
                                {/* Ambient Spotlight Glow */}
                                <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_30%,_rgba(224,90,43,0.15)_0%,_transparent_70%)]" />

                                {/* Floating coffee beans decor */}
                                <div className="absolute top-16 right-4 text-[10px] rotate-12 opacity-15 select-none">🍂</div>
                                <div className="absolute bottom-32 left-3 text-[14px] -rotate-45 opacity-15 select-none">🍂</div>
                                
                                {/* App Header Logo area */}
                                <div className="flex flex-col items-center text-center mt-8 space-y-3 relative z-10">
                                    <Logo className="w-16 h-16" />
                                    <span className="text-[9px] font-bold text-[#C07C4A] tracking-widest uppercase">Est 2026</span>
                                </div>

                                {/* App Promo Slogan */}
                                <div className="space-y-2 text-center py-4 relative z-10">
                                    <h3 className="font-serif text-lg font-black text-white leading-tight tracking-tight">
                                        AITA COFFEE,<br />
                                        SOFE & YOU
                                    </h3>
                                    <p className="text-[9px] text-[#FAF6F0]/60 font-semibold italic">
                                        Brewing comfort. Serving vibes.
                                    </p>
                                </div>

                                {/* Small Coffee cup image */}
                                <div className="h-28 w-full rounded-xl overflow-hidden shadow-inner my-2 border border-white/5 relative z-10">
                                    <img 
                                        src="https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=400" 
                                        alt="Latte inside app" 
                                        className="w-full h-full object-cover" 
                                    />
                                </div>

                                {/* Call to Action Start Button */}
                                <button 
                                    type="button" 
                                    className="w-full py-2.5 rounded-lg bg-[#C07C4A] text-[#140A07] text-[11px] font-bold uppercase tracking-widest text-center shadow-md shadow-[#C07C4A]/20 hover:bg-[#FAF6F0] transition-colors relative z-10"
                                >
                                    Get Started
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer Section */}
            <Footer theme="dark" />

            {/* Shopping Cart Drawer */}
            <CartDrawer theme="dark" />
        </div>
    );
}
