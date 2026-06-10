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
    Heart
} from "lucide-react";

// Mock Menu Items
interface MenuItem {
    id: string;
    name: string;
    price: number;
    description: string;
    category: "hot" | "iced" | "blended" | "bakery";
    image: string;
}

const menuItems: MenuItem[] = [
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
                        <Link href="#menu" className="text-[#FAF6F0]/80 hover:text-white transition-colors pb-1 border-b-2 border-transparent hover:border-[#C07C4A]/40">Menu</Link>
                        <Link href="#rewards" className="text-[#FAF6F0]/80 hover:text-white transition-colors pb-1 border-b-2 border-transparent hover:border-[#C07C4A]/40">Rewards</Link>
                        <Link href="#gift-cards" className="text-[#FAF6F0]/80 hover:text-white transition-colors pb-1 border-b-2 border-transparent hover:border-[#C07C4A]/40">Gift Cards</Link>
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
            <section id="home" className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24 flex flex-col lg:flex-row items-center gap-12 min-h-[calc(100vh-80px)] justify-center">
                {/* Hero Content Left */}
                <div className="flex-1 text-left space-y-6 max-w-xl">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#C07C4A]/10 border border-[#C07C4A]/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C07C4A] animate-ping" />
                        <span className="text-[11px] font-bold uppercase tracking-widest text-[#C07C4A]">Now Open in Town</span>
                    </div>

                    <div className="space-y-2">
                        <h1 className="font-serif text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-tight">
                            Bean Fien.
                        </h1>
                        <h2 className="font-serif text-4xl md:text-5xl font-normal italic text-[#D9531E] leading-tight font-serif">
                            A vibe for the ride
                        </h2>
                    </div>

                    <p className="text-base text-[#FAF6F0]/80 leading-relaxed font-sans font-light">
                        Experience the precision of specialty roasting and the energy of a modern pulse. 
                        Crafted for those who value the art of the pour.
                    </p>

                    <div className="flex flex-wrap gap-4 pt-2">
                        <Link 
                            href="#menu" 
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

            {/* Menu Section */}
            <section id="menu" className="relative z-30 bg-[#1A0D09]/95 py-24 border-t border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="text-center space-y-4 max-w-2xl mx-auto mb-16">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-[#C07C4A]">Curated Menu</span>
                        <h2 className="font-serif text-4xl md:text-5xl font-extrabold text-white">
                            Discover the Art of Specialty Pour
                        </h2>
                        <div className="w-16 h-[2px] bg-[#C07C4A] mx-auto mt-4" />
                    </div>

                    {/* Category tabs */}
                    <div className="flex justify-center flex-wrap gap-2 sm:gap-3 mb-12">
                        {(["hot", "iced", "blended", "bakery"] as const).map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setMenuTab(cat)}
                                className={`
                                    px-6 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all duration-300
                                    ${menuTab === cat 
                                        ? "bg-[#C07C4A] text-[#140A07] shadow-lg shadow-[#C07C4A]/20" 
                                        : "bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10"
                                    }
                                `}
                            >
                                {cat === "hot" && "Hot Drinks"}
                                {cat === "iced" && "Iced Coffee"}
                                {cat === "blended" && "Blended Frappes"}
                                {cat === "bakery" && "Fresh Bakery"}
                            </button>
                        ))}
                    </div>

                    {/* Menu items grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        {menuItems.filter(item => item.category === menuTab).map((item) => (
                            <div 
                                key={item.id}
                                className="bg-[#24130F] rounded-2xl overflow-hidden border border-white/5 shadow-md flex flex-col justify-between hover:border-[#C07C4A]/30 transition-all duration-300 hover:-translate-y-1 group"
                            >
                                <div className="h-52 w-full overflow-hidden relative">
                                    <img 
                                        src={item.image} 
                                        alt={item.name} 
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                                    />
                                    <div className="absolute top-4 right-4 bg-[#140A07]/80 backdrop-blur-md px-3.5 py-1 rounded-full border border-white/10">
                                        <span className="text-sm font-bold text-[#C07C4A]">${item.price.toFixed(2)}</span>
                                    </div>
                                </div>
                                <div className="p-6 flex-1 flex flex-col justify-between space-y-4 text-left">
                                    <div>
                                        <h3 className="font-serif text-lg font-bold text-white group-hover:text-[#C07C4A] transition-colors">{item.name}</h3>
                                        <p className="text-xs text-[#FAF6F0]/60 mt-2 line-clamp-2 leading-relaxed">{item.description}</p>
                                    </div>
                                    <button
                                        onClick={() => addToCart(item)}
                                        className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-[#C07C4A] border border-[#C07C4A]/30 hover:border-[#C07C4A] text-white hover:text-[#140A07] text-xs font-bold uppercase tracking-wider transition-all duration-300"
                                    >
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Rewards Program Section */}
            <section id="rewards" className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
                <div className="max-w-4xl mx-auto bg-gradient-to-br from-[#24130F] to-[#140A07] rounded-3xl p-8 md:p-12 border border-[#C07C4A]/20 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center gap-10">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#C07C4A]/5 rounded-full blur-3xl pointer-events-none" />
                    
                    {/* Left: Info */}
                    <div className="flex-1 text-left space-y-6">
                        <div className="inline-flex items-center gap-2 text-[#C07C4A] bg-[#C07C4A]/10 border border-[#C07C4A]/20 px-3 py-1 rounded-full">
                            <Gift className="w-4 h-4" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Rewards Program</span>
                        </div>
                        <h2 className="font-serif text-3xl md:text-4xl font-extrabold text-white">
                            Sip, Earn Stars & Redeem Rewards
                        </h2>
                        <p className="text-sm text-[#FAF6F0]/70 leading-relaxed font-light">
                            Receive 2 Stars for every $1 spent in shop or online. Accumulate stars and redeem them 
                            for handcrafted beverages, bakery selections, or signature blends.
                        </p>

                        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/5">
                            <div>
                                <span className="text-2xl font-bold text-[#C07C4A] block">200 ★</span>
                                <span className="text-[10px] text-white/50 uppercase tracking-widest font-semibold">Free Coffee</span>
                            </div>
                            <div>
                                <span className="text-2xl font-bold text-[#C07C4A] block">400 ★</span>
                                <span className="text-[10px] text-white/50 uppercase tracking-widest font-semibold">Free Pastry + Bag</span>
                            </div>
                            <div>
                                <span className="text-2xl font-bold text-[#C07C4A] block">150 ★</span>
                                <span className="text-[10px] text-white/50 uppercase tracking-widest font-semibold">Current Balance</span>
                            </div>
                        </div>
                    </div>

                    {/* Right: Live Interactive Card */}
                    <div className="w-full md:w-80 bg-[#1E0F0B] p-6 rounded-2xl border border-white/5 shadow-xl text-center space-y-5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase text-white/40 tracking-wider">Loyalty Club</span>
                            <div className="flex items-center gap-1 text-[#C07C4A] font-bold text-xs bg-[#C07C4A]/10 px-2 py-0.5 rounded-full">
                                <Star className="w-3.5 h-3.5 fill-[#C07C4A]" />
                                <span>{userStars} Stars</span>
                            </div>
                        </div>

                        {/* Visual Progress ring/bar */}
                        <div className="space-y-2 text-left">
                            <div className="flex justify-between text-xs font-semibold">
                                <span className="text-white/70">Next Reward (Free Coffee)</span>
                                <span className="text-[#C07C4A]">150 / 200</span>
                            </div>
                            <div className="w-full bg-[#FAF6F0]/10 h-3 rounded-full overflow-hidden p-[2px] border border-white/5">
                                <div 
                                    className="bg-gradient-to-r from-[#8B4513] to-[#C07C4A] h-full rounded-full transition-all duration-1000"
                                    style={{ width: `${(userStars / 200) * 100}%` }}
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            {starsClaimed ? (
                                <div className="py-2 px-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-center gap-2">
                                    <Check className="w-4 h-4" /> Reward Claimed Successfully!
                                </div>
                            ) : (
                                <button
                                    onClick={claimReward}
                                    disabled={userStars < 150}
                                    className={`
                                        w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300
                                        ${userStars >= 150 
                                            ? "bg-[#C07C4A] text-[#140A07] hover:scale-[1.02] cursor-pointer shadow-lg shadow-[#C07C4A]/10" 
                                            : "bg-white/5 text-white/30 cursor-not-allowed border border-white/5"
                                        }
                                    `}
                                >
                                    Claim Reward (150 ★)
                                </button>
                            )}
                        </div>

                        <p className="text-[9px] text-[#FAF6F0]/40 leading-normal">
                            Stars never expire for loyalty card holders. Terms apply.
                        </p>
                    </div>
                </div>
            </section>

            {/* Gift Cards Section */}
            <section id="gift-cards" className="relative z-30 bg-[#1A0D09]/95 py-24 border-t border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="text-center space-y-4 max-w-2xl mx-auto mb-16">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-[#C07C4A]">Send Love</span>
                        <h2 className="font-serif text-4xl md:text-5xl font-extrabold text-white">
                            Bean Fien Gift Cards
                        </h2>
                        <p className="text-sm text-[#FAF6F0]/60 max-w-lg mx-auto">
                            Design a custom e-gift card for friends and family. Delivered instantly to their email address.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Interactive Design Preview */}
                        <div className="flex flex-col items-center gap-6 justify-center">
                            {/* Card Body */}
                            <div 
                                className={`
                                    w-80 sm:w-96 h-48 sm:h-56 rounded-3xl p-6 flex flex-col justify-between border relative overflow-hidden shadow-2xl transition-all duration-500
                                    ${gcDesign === "classic" && "bg-gradient-to-br from-[#2C1711] to-[#120604] border-[#C07C4A]/30 text-white"}
                                    ${gcDesign === "birthday" && "bg-gradient-to-br from-[#5C2E16] to-[#A25F37] border-white/10 text-white"}
                                    ${gcDesign === "holiday" && "bg-gradient-to-br from-[#1E0F0B] to-[#5C2E16] border-[#D9531E]/40 text-white"}
                                `}
                            >
                                <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl pointer-events-none" />
                                
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full overflow-hidden bg-white/10 border border-white/20 flex items-center justify-center">
                                            <img src="/logo.svg" alt="Logo" className="w-full h-full object-cover p-0.5" />
                                        </div>
                                        <div>
                                            <h4 className="font-serif text-xs font-bold leading-none tracking-wide">Bean Fien</h4>
                                            <span className="text-[8px] uppercase tracking-wider opacity-60">e-Gift Card</span>
                                        </div>
                                    </div>
                                    <CreditCard className="w-6 h-6 opacity-40" />
                                </div>

                                <div className="text-left">
                                    <span className="text-[9px] uppercase tracking-widest opacity-60">Card Value</span>
                                    <div className="text-3xl sm:text-4xl font-serif font-bold mt-1">
                                        ${gcCustomAmount ? gcCustomAmount : gcAmount}
                                    </div>
                                </div>

                                <div className="flex justify-between items-center text-[10px] opacity-75">
                                    <span>TO: {gcRecipient || "Your Name"}</span>
                                    <span>VALID FOREVER</span>
                                </div>
                            </div>

                            {/* Card Themes Selector */}
                            <div className="space-y-2">
                                <span className="text-xs font-bold uppercase tracking-widest text-[#FAF6F0]/40">Choose Card Theme</span>
                                <div className="flex gap-3">
                                    {(["classic", "birthday", "holiday"] as const).map((style) => (
                                        <button
                                            key={style}
                                            onClick={() => setGcDesign(style)}
                                            className={`
                                                px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all border
                                                ${gcDesign === style 
                                                    ? "bg-[#C07C4A] text-[#140A07] border-[#C07C4A]" 
                                                    : "bg-white/5 text-white/70 border-white/10 hover:text-white"
                                                }
                                            `}
                                        >
                                            {style}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Gift Card Builder Form */}
                        <form onSubmit={handleGiftCardPurchase} className="bg-[#24130F] p-8 rounded-3xl border border-white/5 text-left space-y-6 shadow-xl max-w-lg mx-auto w-full">
                            <h3 className="font-serif text-xl font-bold text-white">Customise Gift Amount</h3>
                            
                            {/* Standard Amounts */}
                            <div className="space-y-3">
                                <span className="text-xs font-semibold text-white/50 block">Select standard amount:</span>
                                <div className="grid grid-cols-4 gap-3">
                                    {[10, 25, 50, 100].map((amount) => (
                                        <button
                                            type="button"
                                            key={amount}
                                            onClick={() => {
                                                setGcAmount(amount);
                                                setGcCustomAmount("");
                                            }}
                                            className={`
                                                py-2.5 rounded-xl text-sm font-bold transition-all border
                                                ${gcAmount === amount && !gcCustomAmount
                                                    ? "bg-[#C07C4A] text-[#140A07] border-[#C07C4A]" 
                                                    : "bg-white/5 border-white/10 text-white/80 hover:text-white hover:bg-white/10"
                                                }
                                            `}
                                        >
                                            ${amount}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Custom Amount */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-white/50 block">Or enter custom amount ($):</label>
                                <input
                                    type="number"
                                    min="5"
                                    max="500"
                                    placeholder="Enter custom card value"
                                    value={gcCustomAmount}
                                    onChange={(e) => setGcCustomAmount(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#140A07] text-white focus:outline-none focus:ring-2 focus:ring-[#C07C4A]/50 focus:border-[#C07C4A] transition-all text-sm"
                                />
                            </div>

                            {/* Recipient Details */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-white/50 block">Recipient Email / Name:</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="friend@email.com"
                                    value={gcRecipient}
                                    onChange={(e) => setGcRecipient(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#140A07] text-white focus:outline-none focus:ring-2 focus:ring-[#C07C4A]/50 focus:border-[#C07C4A] transition-all text-sm"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-4 rounded-xl bg-[#5C2E16] hover:bg-[#8B4513] text-white text-xs font-bold uppercase tracking-widest transition-all duration-300 shadow-md shadow-[#5C2E16]/30"
                            >
                                Purchase e-Gift Card
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            {/* Footer Section */}
            <footer className="relative z-30 bg-[#140A07] border-t border-white/10 py-16 text-left">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-10">
                    <div className="space-y-4">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-[#2C1711] border border-[#C07C4A]/40 flex items-center justify-center">
                                <img src="/logo.svg" alt="Bean Fien Logo" className="w-full h-full object-cover p-1" />
                            </div>
                            <span className="font-serif text-lg font-bold tracking-wider text-white">Bean Fien</span>
                        </Link>
                        <p className="text-xs text-white/50 leading-relaxed font-light">
                            Specialty coffee micro-roaster supplying high-grade roasted beans, cold brews, 
                            and fine artisan bakery goods to the local community.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-serif text-sm font-bold text-white uppercase tracking-wider mb-4">Opening Hours</h4>
                        <ul className="text-xs text-white/60 space-y-2">
                            <li>Monday - Friday: 6:00 AM - 8:00 PM</li>
                            <li>Saturday: 7:00 AM - 9:00 PM</li>
                            <li>Sunday: 7:00 AM - 6:00 PM</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-serif text-sm font-bold text-white uppercase tracking-wider mb-4">Location</h4>
                        <p className="text-xs text-white/60 leading-relaxed">
                            482 Espresso Boulevard,<br />
                            Coffee Quarter, Suite 101<br />
                            Portland, OR 97201
                        </p>
                    </div>

                    <div>
                        <h4 className="font-serif text-sm font-bold text-white uppercase tracking-wider mb-4">Connect</h4>
                        <div className="flex items-center gap-4 text-xs text-white/60 mb-3">
                            <Link href="#" className="hover:text-[#C07C4A] transition-colors">Instagram</Link>
                            <Link href="#" className="hover:text-[#C07C4A] transition-colors">Twitter</Link>
                            <Link href="#" className="hover:text-[#C07C4A] transition-colors">Facebook</Link>
                        </div>
                        <p className="text-[10px] text-white/30">
                            &copy; 2026 Bean Fien Coffee. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>

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
