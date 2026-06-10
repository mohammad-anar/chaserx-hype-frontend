"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
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
    ArrowUpRight
} from "lucide-react";

// Menu Items Interface
interface MenuItem {
    id: string;
    name: string;
    price: number;
    description: string;
    category: "hot" | "iced" | "blended" | "bakery";
    image: string;
}

// Full Menu Items List including "The Daily Grind" items
const menuItems: MenuItem[] = [
    // Daily Grind (Featured)
    { id: "dg1", name: "Nitro Velvet", price: 6.50, description: "12-hour cold extraction infused with nitrogen for a creamy, stout-like finish.", category: "iced", image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&q=80&w=500" },
    { id: "dg2", name: "Oat Silk Latte", price: 5.75, description: "Double ristretto shot paired with micro-foamed premium oat milk.", category: "hot", image: "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=500" },
    { id: "dg3", name: "Citrus Ember", price: 7.00, description: "A warming blend of spiced espresso and blood orange reduction.", category: "hot", image: "https://images.unsplash.com/photo-1513530534585-c7b1394c6d51?auto=format&fit=crop&q=80&w=500" },
    
    // Hot Drinks
    { id: "h1", name: "Classic Flat White", price: 4.50, description: "Smooth ristretto espresso with silky steamed milk.", category: "hot", image: "https://images.unsplash.com/photo-1577968897966-3d4325b36b61?auto=format&fit=crop&q=80&w=500" },
    { id: "h2", name: "Caramel Macchiato", price: 5.20, description: "Freshly steamed milk with vanilla-flavored syrup, marked with espresso.", category: "hot", image: "https://images.unsplash.com/photo-1485808191679-5f86510681a2?auto=format&fit=crop&q=80&w=500" },
    { id: "h3", name: "Cortado", price: 4.00, description: "Equal parts espresso and warm milk to reduce the acidity.", category: "hot", image: "https://images.unsplash.com/photo-151097252790b-af4f90267300?auto=format&fit=crop&q=80&w=500" },
    
    // Iced
    { id: "i1", name: "Swirled Iced Latte", price: 4.75, description: "Rich espresso over ice, swirled with organic whole milk and honey.", category: "iced", image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=500" },
    { id: "i2", name: "Cold Brew Tonic", price: 5.50, description: "Slow-steeped cold brew coffee topped with premium tonic and lime.", category: "iced", image: "https://images.unsplash.com/photo-1513530534585-c7b1394c6d51?auto=format&fit=crop&q=80&w=500" },
    { id: "i3", name: "Shakerato", price: 4.80, description: "Espresso shaken violently with ice and simple syrup, served frothy.", category: "iced", image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=500" },
    
    // Blended
    { id: "b1", name: "Hazelnut Frappe", price: 5.75, description: "Blended coffee, milk, and hazelnut syrup, finished with whipped cream.", category: "blended", image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&q=80&w=500" },
    { id: "b2", name: "Matcha Mint Blend", price: 5.90, description: "Creamy Japanese matcha blended with fresh mint and ice.", category: "blended", image: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&q=80&w=500" },
    
    // Bakery
    { id: "k1", name: "Butter Croissant", price: 3.75, description: "Flaky, golden-brown puff pastry baked fresh daily.", category: "bakery", image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=500" },
    { id: "k2", name: "Pistachio Almond Tart", price: 4.50, description: "Sweet crust filled with almond cream and chopped roasted pistachios.", category: "bakery", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=500" }
];

interface CartItem {
    item: MenuItem;
    quantity: number;
}

export default function WebsiteHome() {
    const [mounted, setMounted] = useState(false);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [menuTab, setMenuTab] = useState<"hot" | "iced" | "blended" | "bakery">("hot");
    
    // User / Profile Dropdown State
    const [isProfileOpen, setIsProfileOpen] = useState(false);
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

    // Success overlay / notification
    const [notification, setNotification] = useState<string | null>(null);

    useEffect(() => {
        setMounted(true);
        // Load admin profile information from localStorage if available
        const savedName = localStorage.getItem("bf_admin_name");
        const savedRole = localStorage.getItem("bf_admin_role");
        const savedPhoto = localStorage.getItem("bf_admin_photo");
        if (savedName) setUserName(savedName);
        if (savedRole) setUserRole(savedRole);
        if (savedPhoto) setUserPhoto(savedPhoto);

        // Load cart from sessionStorage if available
        const savedCart = sessionStorage.getItem("bf_cart");
        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart));
            } catch (e) {
                console.error("Failed to parse cart session", e);
            }
        }
    }, []);

    // Save cart to session storage
    const saveCart = (newCart: CartItem[]) => {
        setCart(newCart);
        sessionStorage.setItem("bf_cart", JSON.stringify(newCart));
    };

    const addToCart = (item: MenuItem) => {
        const existing = cart.find(i => i.item.id === item.id);
        if (existing) {
            const updated = cart.map(i => i.item.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
            saveCart(updated);
        } else {
            saveCart([...cart, { item, quantity: 1 }]);
        }
        showNotification(`Added ${item.name} to Cart`);
    };

    const updateQuantity = (itemId: string, delta: number) => {
        const updated = cart.map(i => {
            if (i.item.id === itemId) {
                const newQuantity = i.quantity + delta;
                return newQuantity > 0 ? { ...i, quantity: newQuantity } : null;
            }
            return i;
        }).filter(Boolean) as CartItem[];
        saveCart(updated);
    };

    const removeFromCart = (itemId: string) => {
        const updated = cart.filter(i => i.item.id !== itemId);
        saveCart(updated);
    };

    const showNotification = (msg: string) => {
        setNotification(msg);
        setTimeout(() => {
            setNotification(null);
        }, 3000);
    };

    const handleCheckout = () => {
        if (cart.length === 0) return;
        showNotification("Checkout successful! Your coffee is brewing.");
        saveCart([]);
        setIsCartOpen(false);
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

    const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartSubtotal = cart.reduce((sum, item) => sum + (item.item.price * item.quantity), 0);

    if (!mounted) return null;

    return (
        <div className="min-h-screen text-[#FAF6F0] bg-[#140A07] relative selection:bg-[#C07C4A] selection:text-[#140A07]">
            {/* Background Image Overlay */}
            <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none opacity-35"
                style={{ 
                    backgroundImage: "url('/bg.jpg')",
                    maskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 40%, rgba(0,0,0,0.1) 85%, rgba(0,0,0,0) 100%)",
                    WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 40%, rgba(0,0,0,0.1) 85%, rgba(0,0,0,0) 100%)"
                }}
            />

            {/* Notification Toast */}
            {notification && (
                <div className="fixed bottom-5 right-5 z-50 bg-[#C07C4A] text-[#140A07] font-semibold px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce border border-[#FAF6F0]/20">
                    <Check className="w-4 h-4" />
                    <span>{notification}</span>
                </div>
            )}

            {/* Header Navigation */}
            <header className="relative z-40 border-b border-[#FAF6F0]/10 backdrop-blur-md bg-[#140A07]/60 sticky top-0 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-[#2C1711] border border-[#C07C4A]/40 flex items-center justify-center relative transition-transform duration-300 group-hover:scale-105">
                            <img src="/logo.svg" alt="Bean Fien Logo" className="w-full h-full object-cover p-1" />
                        </div>
                        <div className="hidden sm:block">
                            <span className="font-serif text-lg font-bold tracking-wider block leading-none text-white">Bean Fien</span>
                            <span className="text-[9px] uppercase tracking-widest text-[#C07C4A] font-bold">Specialty Coffee</span>
                        </div>
                    </Link>

                    {/* Desktop Menu */}
                    <nav className="hidden md:flex items-center gap-8 text-sm font-semibold tracking-wider uppercase">
                        <Link href="#home" className="text-[#C07C4A] hover:text-[#C07C4A] transition-colors border-b-2 border-[#C07C4A] pb-1">Home</Link>
                        <Link href="#daily-grind" className="text-[#FAF6F0]/80 hover:text-white transition-colors pb-1 border-b-2 border-transparent hover:border-[#C07C4A]/40">Menu</Link>
                        <Link href="#loyalty" className="text-[#FAF6F0]/80 hover:text-white transition-colors pb-1 border-b-2 border-transparent hover:border-[#C07C4A]/40">Rewards</Link>
                        <Link href="#app-promo" className="text-[#FAF6F0]/80 hover:text-white transition-colors pb-1 border-b-2 border-transparent hover:border-[#C07C4A]/40">Gift Cards</Link>
                    </nav>

                    {/* Right utility buttons */}
                    <div className="flex items-center gap-4">
                        {/* Cart Button */}
                        <button 
                            onClick={() => setIsCartOpen(true)}
                            className="p-2.5 rounded-full hover:bg-white/5 transition-colors relative group"
                        >
                            <ShoppingBag className="w-6 h-6 text-[#FAF6F0] group-hover:text-[#C07C4A] transition-colors" />
                            {totalCartItems > 0 && (
                                <span className="absolute -top-1 -right-1 bg-[#C07C4A] text-[#140A07] text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border border-[#140A07] animate-pulse">
                                    {totalCartItems}
                                </span>
                            )}
                        </button>

                        {/* Profile Dropdown */}
                        <div className="relative">
                            <button 
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-left"
                            >
                                <div className="w-8 h-8 rounded-full overflow-hidden bg-[#C07C4A]/20 border border-[#C07C4A]/30 flex items-center justify-center relative">
                                    {userPhoto ? (
                                        <img src={userPhoto} alt="Admin" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-xs font-bold text-[#C07C4A]">BF</span>
                                    )}
                                </div>
                                <span className="text-xs font-semibold hidden md:inline-block pr-1 text-white">{userName}</span>
                                <ChevronDown className="w-3.5 h-3.5 text-[#C07C4A] hidden md:block" />
                            </button>

                            {/* Dropdown Menu */}
                            {isProfileOpen && (
                                <div className="absolute right-0 mt-3 w-56 rounded-2xl bg-[#1E0F0B] border border-[#C07C4A]/30 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="px-4 py-3 border-b border-white/5 text-left">
                                        <p className="text-xs text-[#C07C4A] font-bold uppercase tracking-wider">{userRole}</p>
                                        <p className="text-sm font-semibold text-white truncate">{userName}</p>
                                    </div>
                                    <div className="py-1.5 space-y-1">
                                        <Link 
                                            href="/admin" 
                                            onClick={() => setIsProfileOpen(false)}
                                            className="flex items-center w-full px-4 py-2.5 text-sm rounded-xl hover:bg-white/5 text-white hover:text-[#C07C4A] transition-all font-semibold"
                                        >
                                            Dashboard
                                        </Link>
                                        <Link 
                                            href="/settings" 
                                            onClick={() => setIsProfileOpen(false)}
                                            className="flex items-center w-full px-4 py-2.5 text-sm rounded-xl hover:bg-white/5 text-white hover:text-[#C07C4A] transition-all font-semibold"
                                        >
                                            Settings
                                        </Link>
                                    </div>
                                    <div className="pt-1.5 border-t border-white/5">
                                        <button 
                                            onClick={() => {
                                                setIsProfileOpen(false);
                                                showNotification("Successfully logged out (mock)");
                                            }}
                                            className="flex items-center w-full px-4 py-2.5 text-sm rounded-xl hover:bg-red-500/10 text-red-400 font-semibold text-left transition-colors"
                                        >
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section id="home" className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 flex flex-col lg:flex-row items-center gap-12 min-h-[calc(100vh-80px)] justify-center">
                {/* Hero Content Left */}
                <div className="flex-1 text-left space-y-6 max-w-xl">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#C07C4A]/10 border border-[#C07C4A]/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C07C4A] animate-ping" />
                        <span className="text-[11px] font-bold uppercase tracking-widest text-[#C07C4A]">Now Open in Town</span>
                    </div>

                    <div className="space-y-2">
                        <h1 className="font-serif text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-tight animate-fade-in">
                            Bean Fien.
                        </h1>
                        <h2 className="font-serif text-4xl md:text-5xl font-normal italic text-[#D9531E] leading-tight">
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
                            className="px-8 py-3.5 rounded-xl bg-[#5C2E16] hover:bg-[#8B4513] text-white text-sm font-bold tracking-wider uppercase transition-all duration-300 shadow-lg shadow-[#5C2E16]/30 hover:scale-[1.02]"
                        >
                            Order Now
                        </Link>
                        <Link 
                            href="#rewards" 
                            className="px-8 py-3.5 rounded-xl border border-white/20 hover:border-white/50 text-white text-sm font-bold tracking-wider uppercase transition-all duration-300 hover:bg-white/5"
                        >
                            Join Rewards
                        </Link>
                    </div>

                    {/* Explore line */}
                    <div className="pt-8 flex flex-col items-start gap-3">
                        <span className="text-[10px] uppercase tracking-widest text-[#FAF6F0]/40 font-bold">Explore</span>
                        <div className="w-[1px] h-14 bg-gradient-to-b from-[#C07C4A] to-transparent animate-pulse" />
                    </div>
                </div>

                {/* Hero Images Collage Right */}
                <div className="flex-1 w-full flex items-center justify-center relative min-h-[480px]">
                    {/* Splash Main Center Image */}
                    <div className="w-[280px] sm:w-[320px] h-[400px] sm:h-[450px] rounded-3xl overflow-hidden shadow-2xl border border-white/10 z-10 transition-transform duration-500 hover:scale-[1.02] relative group">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                        <img 
                            src="https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=800" 
                            alt="Coffee pouring splash" 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                        />
                        <div className="absolute bottom-6 left-6 z-20">
                            <span className="text-[10px] uppercase tracking-wider text-[#C07C4A] font-bold">House Blend</span>
                            <h4 className="font-serif text-lg font-bold text-white mt-1">Rich Arabica Extract</h4>
                        </div>
                    </div>

                    {/* Roasted Beans Stack top right */}
                    <div className="absolute top-0 right-4 sm:right-12 w-[140px] sm:w-[160px] h-[180px] rounded-2xl overflow-hidden shadow-2xl border border-white/10 z-20 hidden sm:block transform translate-x-4 rotate-3 transition-transform duration-500 hover:rotate-0 hover:scale-105 group">
                        <img 
                            src="https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=500" 
                            alt="Roasted coffee beans" 
                            className="w-full h-full object-cover" 
                        />
                    </div>

                    {/* Espresso Cup top right far */}
                    <div className="absolute top-0 right-0 w-[140px] h-[180px] rounded-2xl overflow-hidden shadow-2xl border border-white/10 z-0 hidden lg:block transform translate-x-12 translate-y-16 -rotate-6 transition-transform duration-500 hover:rotate-0 hover:scale-105">
                        <img 
                            src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=500" 
                            alt="Espresso cup close up" 
                            className="w-full h-full object-cover" 
                        />
                    </div>

                    {/* Swirled Iced Drink bottom right */}
                    <div className="absolute bottom-4 right-0 sm:right-6 w-[260px] sm:w-[280px] h-[200px] rounded-3xl overflow-hidden shadow-2xl border border-white/10 z-20 transition-transform duration-500 hover:scale-105 group">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10" />
                        <img 
                            src="https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=600" 
                            alt="Iced cream latte" 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                        />
                        <div className="absolute bottom-5 left-5 z-20">
                            <span className="text-[10px] uppercase tracking-wider text-[#C07C4A] font-bold">Cold & Creamy</span>
                            <h4 className="font-serif text-base font-bold text-white mt-0.5">Iced Swirl Signature</h4>
                        </div>
                    </div>
                </div>
            </section>

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
                                <button 
                                    onClick={() => addToCart(menuItems.find(i => i.id === "dg1")!)}
                                    className="w-full py-3 rounded-xl bg-[#2A120C] hover:bg-[#4A241A] text-white text-xs font-bold uppercase tracking-widest transition-all duration-300"
                                >
                                    Add to Cart
                                </button>
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
                                <button 
                                    onClick={() => addToCart(menuItems.find(i => i.id === "dg2")!)}
                                    className="w-full py-3 rounded-xl bg-[#2A120C] hover:bg-[#4A241A] text-white text-xs font-bold uppercase tracking-widest transition-all duration-300"
                                >
                                    Add to Cart
                                </button>
                            </div>
                        </div>

                        {/* Citrus Ember */}
                        <div className="bg-[#FAF6F0] rounded-2xl overflow-hidden border border-[#2C1A14]/15 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1.5 p-4">
                            <div className="h-64 sm:h-72 rounded-xl overflow-hidden relative">
                                <img 
                                    src="https://images.unsplash.com/photo-1513530534585-c7b1394c6d51?auto=format&fit=crop&q=80&w=500" 
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
                                <button 
                                    onClick={() => addToCart(menuItems.find(i => i.id === "dg3")!)}
                                    className="w-full py-3 rounded-xl bg-[#2A120C] hover:bg-[#4A241A] text-white text-xs font-bold uppercase tracking-widest transition-all duration-300"
                                >
                                    Add to Cart
                                </button>
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
                                <Gauge className="w-6 h-6 stroke-1.5" />
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
                            {/* Decorative badge overlay */}
                            <div className="absolute bottom-10 right-10 z-20 bg-[#0A0503]/85 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 flex items-center gap-1.5 shadow-lg">
                                <Star className="w-3.5 h-3.5 fill-[#C07C4A] text-[#C07C4A]" />
                                <span className="text-[10px] uppercase tracking-wider text-white font-bold">Exclusive Drops</span>
                            </div>
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
                            <div className="rounded-[2.2rem] overflow-hidden w-full h-full bg-[#F5EFEB] flex flex-col justify-between p-5 relative text-left">
                                {/* Floating coffee beans decor */}
                                <div className="absolute top-16 right-4 text-[10px] rotate-12 opacity-30 select-none">🍂</div>
                                <div className="absolute bottom-32 left-3 text-[14px] -rotate-45 opacity-30 select-none">🍂</div>
                                
                                {/* App Header Logo area */}
                                <div className="flex flex-col items-center text-center mt-8 space-y-3">
                                    <div className="w-16 h-16 rounded-full bg-[#3E1F17] flex items-center justify-center border border-[#8B4513] shadow-md p-1.5">
                                        <img src="/logo.svg" alt="Bean Fien character" className="w-full h-full object-contain" />
                                    </div>
                                    <span className="text-[9px] font-bold text-zinc-400 tracking-widest uppercase">Est 2024</span>
                                </div>

                                {/* App Promo Slogan */}
                                <div className="space-y-2 text-center py-4">
                                    <h3 className="font-serif text-lg font-black text-[#2C1A14] leading-tight tracking-tight">
                                        AITA COFFEE,<br />
                                        SOFE & YOU
                                    </h3>
                                    <p className="text-[9px] text-zinc-500 font-semibold italic">
                                        Brewing comfort. Serving vibes.
                                    </p>
                                </div>

                                {/* Small Coffee cup image */}
                                <div className="h-28 w-full rounded-2xl overflow-hidden shadow-inner my-2">
                                    <img 
                                        src="https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=400" 
                                        alt="Latte inside app" 
                                        className="w-full h-full object-cover" 
                                    />
                                </div>

                                {/* Call to Action Start Button */}
                                <button 
                                    type="button" 
                                    className="w-full py-2.5 rounded-xl bg-[#2A120C] text-white text-[11px] font-bold uppercase tracking-widest text-center shadow-md shadow-[#2A120C]/35 hover:bg-[#4A241A] transition-colors"
                                >
                                    Get Start
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>



            {/* Shopping Cart Drawer */}
            {isCartOpen && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    {/* Backdrop */}
                    <div 
                        onClick={() => setIsCartOpen(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
                    />

                    {/* Drawer Panel */}
                    <div className="relative w-full max-w-md bg-[#1E0F0B] h-full shadow-2xl p-6 flex flex-col justify-between border-l border-[#C07C4A]/20 animate-in slide-in-from-right duration-300">
                        {/* Header */}
                        <div className="flex justify-between items-center pb-5 border-b border-white/5">
                            <div className="flex items-center gap-2">
                                <ShoppingBag className="w-5 h-5 text-[#C07C4A]" />
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
                                        key={cartItem.item.id}
                                        className="flex gap-4 bg-[#140A07] p-3 rounded-2xl border border-white/5 text-left items-center justify-between"
                                    >
                                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#24130F] flex-shrink-0">
                                            <img src={cartItem.item.image} alt={cartItem.item.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <h4 className="text-xs font-bold text-white truncate max-w-[150px]">{cartItem.item.name}</h4>
                                            <p className="text-xs font-bold text-[#C07C4A]">${cartItem.item.price.toFixed(2)}</p>
                                            
                                            {/* Quantity Adjuster */}
                                            <div className="flex items-center gap-2.5 pt-1">
                                                <button 
                                                    onClick={() => updateQuantity(cartItem.item.id, -1)}
                                                    className="w-5 h-5 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors text-white"
                                                >
                                                    <Minus className="w-3 h-3" />
                                                </button>
                                                <span className="text-xs font-bold">{cartItem.quantity}</span>
                                                <button 
                                                    onClick={() => updateQuantity(cartItem.item.id, 1)}
                                                    className="w-5 h-5 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors text-white"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => removeFromCart(cartItem.item.id)}
                                            className="p-2 text-white/40 hover:text-red-400 transition-colors"
                                            title="Remove Item"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center h-60 text-white/40 space-y-3">
                                    <ShoppingBag className="w-10 h-10 stroke-1" />
                                    <p className="text-sm font-semibold">Your cart is empty.</p>
                                    <button 
                                        onClick={() => setIsCartOpen(false)}
                                        className="text-xs font-bold text-[#C07C4A] hover:underline"
                                    >
                                        Browse the Menu
                                    </button>
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
