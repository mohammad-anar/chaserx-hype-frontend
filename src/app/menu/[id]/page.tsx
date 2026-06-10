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

// Menu Items Interface
interface MenuItem {
    id: string;
    name: string;
    price: number;
    description: string;
    category: "espresso" | "coldbrew" | "seasonal" | "bakery";
    image: string;
}

const menuItems: MenuItem[] = [
    // Espresso Classics
    { id: "e1", name: "Double Espresso", price: 3.50, description: "Two shots of our signature house blend with notes of dark chocolate and roasted nuts.", category: "espresso", image: "https://images.unsplash.com/photo-1510972527921-ce03766a1cf1?auto=format&fit=crop&w=500&q=80" },
    { id: "e2", name: "Oat Milk Latte", price: 5.25, description: "Silky steamed oat milk poured over a rich double shot of espresso.", category: "espresso", image: "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=500&q=80" },
    { id: "e3", name: "Flat White", price: 4.75, description: "Micro-foam milk poured over ristretto shots for a velvety, intense flavor.", category: "espresso", image: "https://images.unsplash.com/photo-1577968897966-3d4325b36b61?auto=format&fit=crop&w=500&q=80" },

    // Cold Brew
    { id: "c1", name: "Nitro Cold Brew", price: 5.50, description: "Infused with nitrogen for a smooth, creamy finish and a natural sweetness.", category: "coldbrew", image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=500&q=80" },
    { id: "c2", name: "Vanilla Sweet Cream", price: 6.00, description: "House-made cold brew topped with a float of vanilla-infused sweet cream.", category: "coldbrew", image: "https://images.unsplash.com/photo-1513530534585-c7b1394c6d51?auto=format&fit=crop&w=500&q=80" },
    { id: "c3", name: "Nitro Velvet", price: 6.50, description: "Steeped for 24 hours and nitrogen-infused for a creamy, silk-like finish that defines perfection.", category: "coldbrew", image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=500&q=80" },

    // Seasonal Specials
    { id: "s1", name: "Citrus Ember", price: 7.00, description: "A warming blend of spiced espresso and blood orange reduction.", category: "seasonal", image: "https://images.unsplash.com/photo-1513530534585-c7b1394c6d51?auto=format&fit=crop&w=500&q=80" },
    { id: "s2", name: "Spiced Honey Cold Brew", price: 6.50, description: "Signature cold brew infused with organic local honey, cinnamon, and a dash of nutmeg.", category: "seasonal", image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=500&q=80" },

    // Bakery
    { id: "k1", name: "Butter Croissant", price: 3.75, description: "Flaky, golden-brown puff pastry baked fresh daily.", category: "bakery", image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=500&q=80" },
    { id: "k2", name: "Pistachio Almond Tart", price: 4.50, description: "Sweet crust filled with almond cream and chopped roasted pistachios.", category: "bakery", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=500&q=80" }
];

interface CustomCartItem {
    id: string; // Unique instance id
    item: MenuItem;
    quantity: number;
    size: "small" | "medium" | "large";
    milk: "whole" | "oat" | "almond" | "coconut";
    addons: string[];
    instructions: string;
    finalPrice: number;
}

const categoryDescriptions = {
    espresso: "TWO SHOTS OF OUR SIGNATURE HOUSE BLEND WITH NOTES OF DARK CHOCOLATE AND ROASTED",
    coldbrew: "12-HOUR COLD EXTRACTION INFUSED WITH NITROGEN FOR A SMOOTH STOUT-LIKE FINISH",
    seasonal: "TEMPORARY SPECIAL SELECTIONS CREATED FOR SEASONAL HARVEST SENSATIONS",
    bakery: "FRESHLY BAKED PASTRY SELECTIONS DELIVERED EVERY MORNING TO OUR BARISTAS"
};

const categoryTitles = {
    espresso: "Espresso Classics",
    coldbrew: "Cold Brew",
    seasonal: "Seasonal Specials",
    bakery: "Bakery Selections"
};

export default function MenuDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();

    const [mounted, setMounted] = useState(false);
    const [cart, setCart] = useState<CustomCartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Profile Dropdown state
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [userName, setUserName] = useState("Admin");
    const [userRole, setUserRole] = useState("Super Admin");
    const [userPhoto, setUserPhoto] = useState("");

    // Customizer State
    const [customSize, setCustomSize] = useState<"small" | "medium" | "large">("small");
    const [customMilk, setCustomMilk] = useState<"whole" | "oat" | "almond" | "coconut">("whole");
    const [customAddons, setCustomAddons] = useState<string[]>([]);
    const [customInstructions, setCustomInstructions] = useState("");

    // Success overlay / notification
    const [notification, setNotification] = useState<string | null>(null);

    // Find current selected item
    const selectedItem = menuItems.find(item => item.id === id) || menuItems[0];
    const categoryItems = menuItems.filter(item => item.category === selectedItem.category);

    useEffect(() => {
        setMounted(true);
        // Load profile from localStorage
        const savedName = localStorage.getItem("bf_admin_name");
        const savedRole = localStorage.getItem("bf_admin_role");
        const savedPhoto = localStorage.getItem("bf_admin_photo");
        if (savedName) setUserName(savedName);
        if (savedRole) setUserRole(savedRole);
        if (savedPhoto) setUserPhoto(savedPhoto);

        // Sync cart from sessionStorage
        const savedCart = sessionStorage.getItem("bf_cart_custom");
        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart));
            } catch (e) {
                console.error("Failed to parse cart", e);
            }
        }
    }, [id]);

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

        const updated = [...cart, newCartItem];
        saveCart(updated);
        showNotification(`Added ${selectedItem.name} (${customSize}) to Cart`);
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

    const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartSubtotal = cart.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0);

    if (!mounted) return null;

    const currentPrice = calculateCustomizerPrice();

    return (
        <div className="min-h-screen text-[#2C1A14] bg-[#FAF6F0] relative selection:bg-[#C07C4A] selection:text-[#FAF6F0] scroll-smooth">
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

                    {/* Desktop Menu */}
                    <nav className="hidden md:flex items-center gap-8 text-sm font-semibold tracking-wider uppercase">
                        <Link href="/" className="text-[#2C1A14] hover:text-[#C07C4A] transition-colors pb-1 border-b-2 border-transparent hover:border-[#C07C4A]/40">Home</Link>
                        <Link href="/menu" className="text-[#C07C4A] transition-colors border-b-2 border-[#C07C4A] pb-1">Menu</Link>
                        <Link href="/rewards" className="text-[#2C1A14] hover:text-[#C07C4A] transition-colors pb-1 border-b-2 border-transparent hover:border-[#C07C4A]/40">Rewards</Link>
                        <Link href="/gift-cards" className="text-[#2C1A14] hover:text-[#C07C4A] transition-colors pb-1 border-b-2 border-transparent hover:border-[#C07C4A]/40">Gift Cards</Link>
                    </nav>

                    {/* Right utility buttons */}
                    <div className="flex items-center gap-4">
                        {/* Cart Button */}
                        <button
                            onClick={() => setIsCartOpen(true)}
                            className="p-2.5 rounded-full hover:bg-[#2C1A14]/5 transition-colors relative group"
                        >
                            <ShoppingBag className="w-6 h-6 text-[#2C1A14] group-hover:text-[#C07C4A] transition-colors" />
                            {totalCartItems > 0 && (
                                <span className="absolute -top-1 -right-1 bg-[#C07C4A] text-[#140A07] text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border border-[#FAF6F0] animate-pulse">
                                    {totalCartItems}
                                </span>
                            )}
                        </button>

                        {/* Profile Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#2C1A14]/15 bg-[#2C1A14]/5 hover:bg-[#2C1A14]/10 transition-all text-left"
                            >
                                <div className="w-8 h-8 rounded-full overflow-hidden bg-[#C07C4A]/20 border border-[#C07C4A]/30 flex items-center justify-center relative">
                                    {userPhoto ? (
                                        <img src={userPhoto} alt="Admin" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-xs font-bold text-[#C07C4A]">BF</span>
                                    )}
                                </div>
                                <span className="text-xs font-semibold hidden md:inline-block pr-1 text-[#2C1A14]">{userName}</span>
                                <ChevronDown className="w-3.5 h-3.5 text-[#C07C4A] hidden md:block" />
                            </button>

                            {/* Dropdown Menu */}
                            {isProfileOpen && (
                                <div className="absolute right-0 mt-3 w-56 rounded-2xl bg-[#1E0F0B] border border-[#C07C4A]/30 shadow-2xl p-2 z-50">
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
                                            href="/admin/settings"
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

            {/* CIRCULAR CATEGORY VISUALIZER SECTION (Screenshot 3 layout) */}
            <section className="w-full bg-[#FAF6F0] py-12 border-b border-[#2C1A14]/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-12">

                    {/* Left Column: Category title, line, all-caps description */}
                    <div className="w-full md:w-[28%] text-left space-y-4">
                        <h2 className="font-serif text-5xl md:text-6xl font-black text-[#2C1A14] leading-tight">
                            {categoryTitles[selectedItem.category]}
                        </h2>
                        <div className="w-12 h-[2px] bg-[#2C1A14]/30" />
                        <p className="text-xs tracking-widest text-[#6B5E59] font-bold leading-relaxed max-w-xs">
                            {categoryDescriptions[selectedItem.category]}
                        </p>
                    </div>

                    {/* Middle Column: Large circular visual container filled with coffee beans, containing the drink circle */}
                    <div className="w-full md:w-[42%] flex flex-col items-center justify-center">
                        <div className="relative w-80 h-80 rounded-full overflow-hidden border-[6px] border-[#C07C4A]/30 shadow-2xl flex items-center justify-center bg-[#2C1A14]">
                            {/* Coffee Beans Background Overlay */}
                            <div
                                className="absolute inset-0 bg-cover bg-center opacity-65 mix-blend-overlay"
                                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80')" }}
                            />

                            {/* Centered Circular drink cutout */}
                            <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-[#FAF6F0] relative z-10 shadow-xl bg-white p-1 transition-transform duration-500 hover:scale-102">
                                <img src={selectedItem.image} alt={selectedItem.name} className="w-full h-full rounded-full object-cover" />
                            </div>
                        </div>

                        {/* Order Now button below circle visualizer */}
                        <button
                            onClick={handleAddCustomizedToCart}
                            className="mt-8 px-10 py-4 rounded-full bg-[#2A120C] hover:bg-[#4A241A] text-white border border-[#C07C4A]/40 text-xs font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-4 group transition-all duration-300 hover:scale-105"
                        >
                            <span>${currentPrice.toFixed(2)}</span>
                            <span className="opacity-40">|</span>
                            <span className="group-hover:text-[#C07C4A] transition-colors">Order Now</span>
                        </button>
                    </div>

                    {/* Right Column: List of items in the same category (rendered as rounded white pills) */}
                    <div className="w-full md:w-[30%] flex flex-col gap-3.5 pr-1">
                        {categoryItems.map((item) => {
                            const isActive = item.id === selectedItem.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => router.push(`/menu/${item.id}`)}
                                    className={`
                                        w-full rounded-full p-2.5 pr-6 flex items-center gap-4 transition-all duration-300 border text-left shadow-sm
                                        ${isActive
                                            ? "bg-[#2A120C] text-[#FAF6F0] border-[#C07C4A]/40"
                                            : "bg-white text-[#2C1A14] border-[#2C1A14]/10 hover:bg-[#2C1A14]/5"
                                        }
                                    `}
                                >
                                    {/* Thumbnail inside small circle */}
                                    <div className="w-14 h-14 rounded-full overflow-hidden bg-[#2C1A14] flex-shrink-0 flex items-center justify-center p-0.5 relative border border-[#C07C4A]/20">
                                        <div
                                            className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay"
                                            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=100&q=80')" }}
                                        />
                                        <img src={item.image} alt={item.name} className="w-full h-full rounded-full object-cover relative z-10" />
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
                </div>
            </section>

            {/* CUSTOMIZATION PANEL SECTION (Screenshot 4 layout) */}
            <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-left">
                <div className="space-y-12">

                    {/* Item title and description heading */}
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

                    {/* Option 1: SIZE SELECTION */}
                    <div className="space-y-4">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#6B5E59] block">Size Selection</span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {(["small", "medium", "large"] as const).map((size) => (
                                <button
                                    key={size}
                                    onClick={() => setCustomSize(size)}
                                    className={`
                                        py-4.5 rounded-2xl text-xs font-bold transition-all border text-center flex flex-col justify-center gap-1 shadow-sm
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

                    {/* Option 2: MILK ALTERNATIVES */}
                    <div className="space-y-4">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#6B5E59] block">Milk Alternatives</span>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                            {(["whole", "oat", "almond", "coconut"] as const).map((milk) => (
                                <button
                                    key={milk}
                                    onClick={() => setCustomMilk(milk)}
                                    className={`
                                        py-4 px-4 rounded-2xl text-xs font-bold transition-all border flex items-center justify-center gap-2 shadow-sm
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

                    {/* Option 3: ADD-ONS */}
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
                                            py-3 px-5 rounded-2xl text-xs font-bold transition-all border flex items-center gap-1.5 shadow-sm
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

                    {/* Option 4: SPECIAL INSTRUCTIONS */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#6B5E59] block">Special Instructions</label>
                        <textarea
                            placeholder="Any specific preferences?"
                            value={customInstructions}
                            onChange={(e) => setCustomInstructions(e.target.value)}
                            className="w-full px-5 py-4 rounded-2xl border border-[#2C1A14]/15 bg-white text-[#2C1A14] focus:outline-none focus:ring-2 focus:ring-[#C07C4A]/30 text-xs resize-none h-24 leading-relaxed"
                        />
                    </div>

                    {/* Bottom Add to Cart triggers */}
                    <div className="space-y-3 pt-8 border-t border-[#2C1A14]/10">
                        <button
                            onClick={handleAddCustomizedToCart}
                            className="w-full py-4.5 rounded-2xl bg-[#2A120C] hover:bg-[#4A241A] text-white text-xs font-black uppercase tracking-widest transition-all shadow-md shadow-[#2A120C]/25 flex items-center justify-center gap-2 hover:scale-[1.01]"
                        >
                            <ShoppingBag className="w-4 h-4 text-[#C07C4A]" />
                            <span>Add to Cart — ${currentPrice.toFixed(2)}</span>
                        </button>
                        <p className="text-[10px] text-center text-[#6B5E59] font-semibold tracking-wide">
                            Earn {Math.round(currentPrice * 10)} Rewards Points with this purchase
                        </p>
                    </div>

                </div>
            </section>

            {/* Footer Section */}
            <footer className="relative z-30 bg-[#4E281F] text-[#FAF6F0] py-16 px-4 md:px-8 border-t border-white/5 overflow-hidden">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                    {/* Left side description */}
                    <div className="text-center md:text-left">
                        <p className="text-sm text-[#FAF6F0]/80 leading-relaxed font-sans font-light">
                            Crafting aesthetic experiences, one bean at a time.<br />
                            Designed for the modern aficionado.
                        </p>
                    </div>

                    {/* Middle navigation links */}
                    <div className="flex flex-wrap justify-center gap-6 md:gap-8 text-sm font-semibold tracking-wide text-[#FAF6F0]/90">
                        <Link href="#" className="hover:text-[#C07C4A] transition-colors">Privacy Policy</Link>
                        <Link href="#" className="hover:text-[#C07C4A] transition-colors">Terms of Service</Link>
                        <Link href="#" className="hover:text-[#C07C4A] transition-colors">Contact Us</Link>
                    </div>

                    {/* Right side social links */}
                    <div className="flex gap-4">
                        <Link href="#" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-[#FAF6F0]/80 hover:text-white hover:border-white transition-all hover:scale-105">
                            <Globe className="w-4 h-4 stroke-[1.5]" />
                        </Link>
                        <Link href="#" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-[#FAF6F0]/80 hover:text-white hover:border-white transition-all hover:scale-105">
                            <AtSign className="w-4 h-4 stroke-[1.5]" />
                        </Link>
                    </div>
                </div>

                {/* Bottom branding and copyright */}
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
                                        key={cartItem.id}
                                        className="flex gap-4 bg-[#140A07] p-3.5 rounded-2xl border border-white/5 text-left items-center justify-between"
                                    >
                                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#24130F] flex-shrink-0">
                                            <img src={cartItem.item.image} alt={cartItem.item.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <h4 className="text-xs font-bold text-white truncate max-w-[130px]">{cartItem.item.name}</h4>
                                            <p className="text-[10px] text-white/50 leading-none">
                                                Size: <span className="capitalize">{cartItem.size}</span> | Milk: <span className="capitalize">{cartItem.milk}</span>
                                            </p>
                                            {cartItem.addons.length > 0 && (
                                                <p className="text-[9px] text-[#C07C4A] truncate max-w-[150px]">
                                                    + {cartItem.addons.join(", ")}
                                                </p>
                                            )}
                                            <p className="text-xs font-bold text-[#C07C4A]">${cartItem.finalPrice.toFixed(2)}</p>

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
