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
    CreditCard,
    Ticket,
    Edit3,
    ShieldAlert,
    RefreshCw,
    ArrowRight,
    ShoppingBag,
    Coffee,
    Globe,
    AtSign
} from "lucide-react";

// Menu Item interface for cart compatibility
interface MenuItem {
    id: string;
    name: string;
    price: number;
    description: string;
    category: "espresso" | "coldbrew" | "seasonal" | "bakery";
    image: string;
}

interface CustomCartItem {
    id: string;
    item: MenuItem;
    quantity: number;
    size: "small" | "medium" | "large";
    milk: "whole" | "oat" | "almond" | "coconut";
    addons: string[];
    instructions: string;
    finalPrice: number;
    isGiftCard?: boolean;
}

const cardDesigns = [
    {
        id: 0,
        name: "Coffee Beans",
        url: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 1,
        name: "Morning Brew",
        url: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 2,
        name: "Swirled Cream",
        url: "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 3,
        name: "Cozy Mug",
        url: "https://images.unsplash.com/photo-1507133750040-4a8f57021571?auto=format&fit=crop&w=600&q=80"
    }
];

export default function GiftCardsPage() {
    const [mounted, setMounted] = useState(false);
    const [cart, setCart] = useState<CustomCartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Page view state: "purchase" or "balance"
    const [viewMode, setViewMode] = useState<"purchase" | "balance">("purchase");

    // Purchase Form State
    const [selectedDesign, setSelectedDesign] = useState(0);
    const [amountPreset, setAmountPreset] = useState<number | "custom">(25);
    const [customAmountVal, setCustomAmountVal] = useState("");
    const [recipientName, setRecipientName] = useState("");
    const [recipientEmail, setRecipientEmail] = useState("");
    const [personalMessage, setPersonalMessage] = useState("");

    // Balance & Card Details State (Mocked)
    const [cardBalance, setCardBalance] = useState(42.50);
    const [cardNickname, setCardNickname] = useState("Morning Ritual Card");
    const [isCardActive, setIsCardActive] = useState(true);
    const [isRenaming, setIsRenaming] = useState(false);
    const [tempNickname, setTempNickname] = useState("");

    // Redemption Code State
    const [redeemCode, setRedeemCode] = useState("");

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

    // Add Gift Card to Cart
    const handleAddGiftCardToCart = (e: React.FormEvent) => {
        e.preventDefault();

        // Calculate card value
        const cardValue = amountPreset === "custom" ? parseFloat(customAmountVal) : amountPreset;
        
        if (!cardValue || isNaN(cardValue) || cardValue <= 0) {
            showNotification("Please select or enter a valid gift card amount.");
            return;
        }

        if (!recipientName.trim() || !recipientEmail.trim()) {
            showNotification("Recipient name and email are required.");
            return;
        }

        const newGiftCardItem: CustomCartItem = {
            id: `giftcard-${Date.now()}`,
            item: {
                id: `gc-${selectedDesign}-${Date.now()}`,
                name: `Bean Fien Gift Card ($${cardValue.toFixed(2)})`,
                price: cardValue,
                description: `Sent to ${recipientName} (${recipientEmail}). Msg: "${personalMessage || "Enjoy some fresh brew!"}"`,
                category: "seasonal",
                image: cardDesigns[selectedDesign].url
            },
            quantity: 1,
            size: "medium",
            milk: "whole",
            addons: [],
            instructions: `Recipient: ${recipientName} (${recipientEmail}). Msg: ${personalMessage}`,
            finalPrice: cardValue,
            isGiftCard: true
        };

        saveCart([...cart, newGiftCardItem]);
        showNotification(`Added $${cardValue.toFixed(2)} Gift Card for ${recipientName} to Cart`);

        // Reset form
        setRecipientName("");
        setRecipientEmail("");
        setPersonalMessage("");
        setCustomAmountVal("");
        setAmountPreset(25);
    };

    // Handle Code Redemption
    const handleRedeemCode = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!redeemCode.trim()) {
            showNotification("Please enter a valid code.");
            return;
        }

        const codeClean = redeemCode.trim().replace(/-/g, "");
        if (codeClean.length < 8) {
            showNotification("Invalid code format. Codes should be 16-digits.");
            return;
        }

        showNotification("Success! $25.00 has been redeemed and added to your balance!");
        setCardBalance(prev => prev + 25.0);
        setViewMode("balance");
        setRedeemCode("");
    };

    // Save Nickname
    const handleSaveNickname = () => {
        if (tempNickname.trim()) {
            setCardNickname(tempNickname.trim());
            showNotification("Card renamed successfully!");
        }
        setIsRenaming(false);
    };

    const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartSubtotal = cart.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0);
    const currentCardValue = amountPreset === "custom" ? parseFloat(customAmountVal) || 0 : amountPreset;

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

                    {/* Desktop Menu */}
                    <nav className="hidden md:flex items-center gap-8 text-sm font-semibold tracking-wider uppercase">
                        <Link href="/" className="text-[#2C1A14] hover:text-[#C07C4A] transition-colors pb-1 border-b-2 border-transparent hover:border-[#C07C4A]/40">Home</Link>
                        <Link href="/menu" className="text-[#2C1A14] hover:text-[#C07C4A] transition-colors pb-1 border-b-2 border-transparent hover:border-[#C07C4A]/40">Menu</Link>
                        <Link href="/rewards" className="text-[#2C1A14] hover:text-[#C07C4A] transition-colors pb-1 border-b-2 border-transparent hover:border-[#C07C4A]/40">Rewards</Link>
                        <Link href="/gift-cards" className="text-[#C07C4A] transition-colors border-b-2 border-[#C07C4A] pb-1">Gift Cards</Link>
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

            {/* HERO / LANDING SECTION (Reference Image 3 & 5) */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-left">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    
                    {/* Left Column Description or Balance Details */}
                    <div className="lg:col-span-7 space-y-8">
                        {viewMode === "purchase" ? (
                            // Purchase Mode Header
                            <div className="space-y-6">
                                <div className="w-fit inline-flex items-center gap-2 px-3.5 py-1 rounded bg-[#FAF0ED] border border-[#F6DED6]">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#C07C4A]">Specialty Gifting</span>
                                </div>
                                <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#2C1A14] leading-tight">
                                    Share the craft of specialty coffee.
                                </h1>
                                <p className="text-[#6B5E59] text-sm sm:text-base leading-relaxed font-light max-w-xl">
                                    Bean Fien gift cards are more than a token—they are an invitation to experience the world's finest roasts, delivered with precision and passion.
                                </p>
                            </div>
                        ) : (
                            // Balance Mode Header
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <span className="text-[#C07C4A] text-xs font-black uppercase tracking-widest block">
                                        Gift Card Balance
                                    </span>
                                    <span className="font-serif font-black text-6xl sm:text-7xl text-[#2C1A14] tracking-tight block leading-none">
                                        ${isCardActive ? cardBalance.toFixed(2) : "0.00"}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {isRenaming ? (
                                        <div className="flex items-center gap-2 bg-[#FAF6F0] border border-[#2C1A14]/15 rounded-xl px-2 py-1">
                                            <input 
                                                type="text" 
                                                value={tempNickname} 
                                                onChange={(e) => setTempNickname(e.target.value)}
                                                className="bg-transparent focus:outline-none text-xs font-semibold text-[#2C1A14]"
                                            />
                                            <button onClick={handleSaveNickname} className="text-[#C07C4A] hover:text-[#8B4513]">
                                                <Check className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <span className="text-base font-semibold text-[#6B5E59]">
                                                {cardNickname}
                                            </span>
                                            {!isCardActive && (
                                                <span className="text-[10px] bg-red-100 border border-red-200 text-red-500 rounded px-1.5 py-0.5 font-bold uppercase">
                                                    Inactive
                                                </span>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* View Switchers */}
                        <div className="flex gap-4 pt-2">
                            <button 
                                onClick={() => setViewMode("purchase")}
                                className={`px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                                    viewMode === "purchase"
                                        ? "bg-[#2C120C] text-white shadow-md shadow-[#2C120C]/10"
                                        : "bg-white border border-[#2C1A14]/15 text-[#2C1A14] hover:bg-[#2C1A14]/5"
                                }`}
                            >
                                Purchase a New Card
                            </button>
                            <button 
                                onClick={() => {
                                    setViewMode("balance");
                                    setTempNickname(cardNickname);
                                }}
                                className={`px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                                    viewMode === "balance"
                                        ? "bg-[#2C120C] text-white shadow-md shadow-[#2C120C]/10"
                                        : "bg-white border border-[#2C1A14]/15 text-[#2C1A14] hover:bg-[#2C1A14]/5"
                                }`}
                            >
                                Check Balance
                            </button>
                        </div>
                    </div>

                    {/* Right Column: 3D Tilted Card Preview */}
                    <div className="lg:col-span-5 flex justify-center">
                        <div className="relative transform rotate-6 skew-y-3 skew-x-3 w-80 h-48 sm:w-[380px] sm:h-[220px] rounded-2xl overflow-hidden shadow-2xl transition-transform duration-500 hover:rotate-0 hover:skew-x-0 hover:skew-y-0 cursor-pointer group border border-white/10">
                            
                            {/* Selected Card Art Background */}
                            <img 
                                src={cardDesigns[selectedDesign].url} 
                                alt="Gift Card Design" 
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            
                            {/* Dark gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />

                            {/* Card Content Elements */}
                            <div className="absolute inset-0 p-5 flex flex-col justify-between text-left text-white z-10 font-sans">
                                <div className="flex justify-between items-start">
                                    <span className="font-serif font-black tracking-wider text-base sm:text-lg">Bean Fien</span>
                                    <div className="w-7 h-7 rounded-full bg-[#FAF6F0]/20 flex items-center justify-center backdrop-blur-sm border border-white/20">
                                        <CreditCard className="w-3.5 h-3.5 text-[#C07C4A]" />
                                    </div>
                                </div>

                                <div className="flex justify-between items-end">
                                    <div className="space-y-1">
                                        <span className="text-[9px] uppercase tracking-widest text-[#C07C4A] font-bold block leading-none">
                                            Gift Card
                                        </span>
                                        <span className="text-xl sm:text-2xl font-black font-serif leading-none tracking-tight block">
                                            {viewMode === "purchase" 
                                                ? `$${currentCardValue.toFixed(2)}` 
                                                : `$${isCardActive ? cardBalance.toFixed(2) : "0.00"}`
                                            }
                                        </span>
                                    </div>
                                    
                                    {/* Small coffee cup icon */}
                                    <div className="flex flex-col items-end gap-1 opacity-95">
                                        <div className="w-6 h-5 border-2 border-white rounded-b-lg relative">
                                            <div className="absolute -right-[4px] top-[2px] w-[5px] h-[7px] border-y-2 border-r-2 border-white rounded-r-md" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Deactivated stamp overlay */}
                            {!isCardActive && viewMode === "balance" && (
                                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-20 flex items-center justify-center">
                                    <div className="border-[3px] border-red-500 text-red-500 rounded-xl px-5 py-2 font-black uppercase text-lg tracking-widest rotate-12 scale-110 shadow-lg">
                                        Deactivated
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </section>

            {/* LOWER INTERACTIVE CONTENT */}
            {viewMode === "purchase" ? (
                // PURCHASE FORM SECTION (Reference Image 4)
                <section className="border-t border-[#2C1A14]/10 bg-[#FAF6F0] py-16 text-left">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <form onSubmit={handleAddGiftCardToCart} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                            
                            {/* Left purchase config parameters */}
                            <div className="lg:col-span-7 space-y-10">
                                
                                {/* Choose a Design */}
                                <div className="space-y-4">
                                    <h3 className="font-serif text-2xl font-black text-[#2C1A14]">
                                        1. Choose a Design
                                    </h3>
                                    <p className="text-xs text-[#6B5E59] -mt-2">
                                        Select the aesthetic that fits the occasion.
                                    </p>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        {cardDesigns.map((design) => (
                                            <button
                                                key={design.id}
                                                type="button"
                                                onClick={() => setSelectedDesign(design.id)}
                                                className={`relative h-24 rounded-xl overflow-hidden border-2 transition-all shadow-sm ${
                                                    selectedDesign === design.id
                                                        ? "border-[#C07C4A] ring-2 ring-[#C07C4A]/25 scale-102"
                                                        : "border-[#2C1A14]/15 hover:border-[#2C1A14]/40"
                                                }`}
                                            >
                                                <img src={design.url} alt={design.name} className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/35 hover:bg-black/10 transition-colors flex items-end p-2">
                                                    <span className="text-[10px] text-white font-bold tracking-wide">
                                                        {design.name}
                                                    </span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Select Amount */}
                                <div className="space-y-4">
                                    <h3 className="font-serif text-2xl font-black text-[#2C1A14]">
                                        2. Select Amount
                                    </h3>
                                    <p className="text-xs text-[#6B5E59] -mt-2">
                                        Select a preset or enter a custom value.
                                    </p>
                                    
                                    <div className="flex flex-wrap gap-4 items-center">
                                        {[10, 25, 50, 100].map((val) => (
                                            <button
                                                key={val}
                                                type="button"
                                                onClick={() => {
                                                    setAmountPreset(val);
                                                    setCustomAmountVal("");
                                                }}
                                                className={`px-6 py-3.5 rounded-xl text-xs font-bold border transition-all shadow-sm ${
                                                    amountPreset === val
                                                        ? "bg-[#FAF0ED] text-[#C07C4A] border-[#C07C4A] font-black"
                                                        : "bg-white border-[#2C1A14]/15 text-[#2C1A14] hover:bg-[#2C1A14]/5"
                                                }`}
                                            >
                                                ${val}
                                            </button>
                                        ))}

                                        {/* Custom Value input structured as same size pill */}
                                        {amountPreset === "custom" ? (
                                            <div className="flex items-center gap-1.5 px-4 py-2 border border-[#C07C4A] rounded-xl bg-[#FAF0ED] shadow-sm">
                                                <span className="text-xs font-bold text-[#C07C4A]">$</span>
                                                <input 
                                                    type="number"
                                                    placeholder="Enter"
                                                    value={customAmountVal}
                                                    onChange={(e) => setCustomAmountVal(e.target.value)}
                                                    className="w-12 bg-transparent text-xs font-bold focus:outline-none text-[#C07C4A]"
                                                />
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setAmountPreset("custom");
                                                    setCustomAmountVal("");
                                                }}
                                                className="px-6 py-3.5 rounded-xl text-xs font-bold border border-[#2C1A14]/15 text-[#2C1A14] bg-white hover:bg-[#2C1A14]/5 shadow-sm"
                                            >
                                                $Custom
                                            </button>
                                        )}
                                    </div>
                                </div>

                            </div>

                            {/* Right Recipient Details details card */}
                            <div className="lg:col-span-5">
                                <div className="bg-white rounded-3xl border border-[#2C1A14]/10 p-6 space-y-6 shadow-md">
                                    <h3 className="font-serif text-xl font-bold text-[#2C1A14]">
                                        Recipient Details
                                    </h3>
                                    
                                    <div className="space-y-4">
                                        {/* Name */}
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-bold text-[#6B5E59] uppercase tracking-wider block">
                                                Recipient Name
                                            </label>
                                            <input 
                                                type="text"
                                                placeholder="Who is it for?"
                                                value={recipientName}
                                                onChange={(e) => setRecipientName(e.target.value)}
                                                className="w-full bg-[#FAF6F0] border border-[#2C1A14]/10 rounded-xl px-4 py-3.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#C07C4A] text-[#2C1A14]"
                                                required
                                            />
                                        </div>

                                        {/* Email */}
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-bold text-[#6B5E59] uppercase tracking-wider block">
                                                Recipient Email
                                            </label>
                                            <input 
                                                type="email"
                                                placeholder="coffee@example.com"
                                                value={recipientEmail}
                                                onChange={(e) => setRecipientEmail(e.target.value)}
                                                className="w-full bg-[#FAF6F0] border border-[#2C1A14]/10 rounded-xl px-4 py-3.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#C07C4A] text-[#2C1A14]"
                                                required
                                            />
                                        </div>

                                        {/* Personal Message */}
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-bold text-[#6B5E59] uppercase tracking-wider block">
                                                Personal Message
                                            </label>
                                            <textarea 
                                                placeholder="A little something for your next brew..."
                                                value={personalMessage}
                                                onChange={(e) => setPersonalMessage(e.target.value)}
                                                className="w-full bg-[#FAF6F0] border border-[#2C1A14]/10 rounded-xl px-4 py-3 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#C07C4A] text-[#2C1A14] h-20 resize-none"
                                            />
                                        </div>
                                    </div>

                                    {/* Horizontal side-by-side Layout for Price and Button */}
                                    <div className="pt-5 border-t border-[#2C1A14]/5 flex justify-between items-center gap-4">
                                        <div className="text-left font-sans">
                                            <span className="text-[10px] uppercase font-bold text-[#6B5E59] block leading-none pb-1">
                                                Total Price:
                                            </span>
                                            <span className="text-xl font-extrabold text-[#2C1A14] font-serif">
                                                ${currentCardValue.toFixed(2)}
                                            </span>
                                        </div>

                                        <button 
                                            type="submit"
                                            className="px-8 py-3 rounded-full bg-[#2C120C] hover:bg-[#4A241A] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-md flex items-center gap-1.5 group"
                                        >
                                            <span>Add to Cart</span>
                                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                        </form>
                    </div>
                </section>
            ) : (
                // BALANCE / DETAIL VIEW (Reference Image 5)
                <section className="border-t border-[#2C1A14]/10 bg-[#FAF6F0] py-16 text-left">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                            
                            {/* Transaction History log */}
                            <div className="lg:col-span-7 space-y-8">
                                <div className="flex justify-between items-center border-b border-[#2C1A14]/5 pb-3">
                                    <h3 className="font-serif text-2xl font-black text-[#2C1A14]">
                                        Transaction History
                                    </h3>
                                    <button onClick={() => showNotification("Refreshed latest log details.")} className="text-xs font-bold uppercase tracking-wider text-[#C07C4A] hover:underline flex items-center gap-1">
                                        <RefreshCw className="w-3 h-3" />
                                        <span>Refresh</span>
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {/* Tx 1 */}
                                    <div className="bg-[#FAF6F0] rounded-2xl border border-[#2C1A14]/10 p-5 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-[#FAF0ED] border border-[#F6DED6] flex items-center justify-center text-[#C07C4A]">
                                                <Coffee className="w-5 h-5 stroke-[1.5]" />
                                            </div>
                                            <div className="text-left space-y-1">
                                                <h4 className="text-sm font-bold text-[#2C1A14]">Mobile Order</h4>
                                                <p className="text-xs text-[#6B5E59]">Downtown Soho • Oct 24, 2024</p>
                                            </div>
                                        </div>
                                        <span className="font-bold text-[#2C1A14] text-xs">
                                            - $6.50
                                        </span>
                                    </div>

                                    {/* Tx 2 */}
                                    <div className="bg-[#FAF6F0] rounded-2xl border border-[#2C1A14]/10 p-5 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-[#FAF0ED] border border-[#F6DED6] flex items-center justify-center text-[#C07C4A]">
                                                <CreditCard className="w-5 h-5 stroke-[1.5]" />
                                            </div>
                                            <div className="text-left space-y-1">
                                                <h4 className="text-sm font-bold text-[#C07C4A]">Reload</h4>
                                                <p className="text-xs text-[#6B5E59]">Auto-Reload • Oct 20, 2024</p>
                                            </div>
                                        </div>
                                        <span className="font-bold text-[#C07C4A] text-xs">
                                            + $25.00
                                        </span>
                                    </div>

                                    {/* Tx 3 */}
                                    <div className="bg-[#FAF6F0] rounded-2xl border border-[#2C1A14]/10 p-5 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-[#FAF0ED] border border-[#F6DED6] flex items-center justify-center text-[#C07C4A]">
                                                <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
                                            </div>
                                            <div className="text-left space-y-1">
                                                <h4 className="text-sm font-bold text-[#2C1A14]">In-Store Purchase</h4>
                                                <p className="text-xs text-[#6B5E59]">Chelsea Market • Oct 15, 2024</p>
                                            </div>
                                        </div>
                                        <span className="font-bold text-[#2C1A14] text-xs">
                                            - $14.20
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Card Management Action Card */}
                            <div className="lg:col-span-5">
                                <div className="bg-white rounded-3xl border border-[#2C1A14]/10 p-6 space-y-4 shadow-md">
                                    <h3 className="font-serif text-xl font-bold text-[#2C1A14] border-b border-[#2C1A14]/5 pb-3">
                                        Card Management
                                    </h3>

                                    <div className="space-y-4">
                                        {/* Rename Card */}
                                        <button 
                                            type="button"
                                            onClick={() => {
                                                if (isRenaming) {
                                                    handleSaveNickname();
                                                } else {
                                                    setIsRenaming(true);
                                                    setTempNickname(cardNickname);
                                                }
                                            }}
                                            className="w-full flex items-center justify-between p-4 rounded-xl border border-[#2C1A14]/10 hover:bg-[#FAF6F0] transition-colors text-left"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-[#FAF0ED] text-[#C07C4A] flex items-center justify-center border border-[#F6DED6]">
                                                    <Edit3 className="w-4 h-4" />
                                                </div>
                                                <div className="leading-tight">
                                                    <span className="text-xs font-black text-[#2C1A14] block">Rename Card</span>
                                                    <span className="text-[9px] text-[#6B5E59]">Change your card's nickname</span>
                                                </div>
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-[#C07C4A]" />
                                        </button>

                                        {/* Deactivate Card */}
                                        <button 
                                            type="button"
                                            onClick={() => {
                                                setIsCardActive(!isCardActive);
                                                showNotification(isCardActive ? "Card deactivated temporarily." : "Card reactivated.");
                                            }}
                                            className="w-full flex items-center justify-between p-4 rounded-xl border border-[#2C1A14]/10 hover:bg-red-50/5 transition-colors text-left"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-9 h-9 rounded-full flex items-center justify-center border ${
                                                    isCardActive 
                                                        ? "bg-red-50 text-red-500 border-red-100" 
                                                        : "bg-green-50 text-green-500 border-green-100"
                                                }`}>
                                                    <ShieldAlert className="w-4 h-4" />
                                                </div>
                                                <div className="leading-tight">
                                                    <span className={`text-xs font-black block ${
                                                        isCardActive ? "text-red-500" : "text-green-600"
                                                    }`}>
                                                        {isCardActive ? "Deactivate Card" : "Activate Card"}
                                                    </span>
                                                    <span className="text-[9px] text-[#6B5E59]">
                                                        {isCardActive ? "Temporarily disable this card" : "Enable transactions for this card"}
                                                    </span>
                                                </div>
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-[#C07C4A]" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </section>
            )}

            {/* REDEEM A CODE SECTION (Reference Image 4 bottom black card) */}
            <section className="bg-[#1E1B1A] text-white py-16 text-left border-t border-white/5 relative z-30 font-sans">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-[#141212] p-8 md:p-12 rounded-3xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative">
                        
                        {/* Ticket icon in header of section on far right */}
                        <div className="absolute top-8 right-8 text-[#C07C4A] hidden md:block">
                            <Ticket className="w-6 h-6 stroke-[1.5]" />
                        </div>

                        {/* Description */}
                        <div className="space-y-3 max-w-lg text-left">
                            <h3 className="font-serif text-2xl font-bold text-white">Redeem a Code</h3>
                            <p className="text-xs text-white/50 leading-relaxed font-light">
                                Add funds to your Bean Fien account by redeeming a digital or physical gift card. Enter your code below.
                            </p>
                        </div>

                        {/* Input redemption form */}
                        <form onSubmit={handleRedeemCode} className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-4 flex-1 max-w-md">
                            <input 
                                type="text"
                                placeholder="Enter 16-digit Code"
                                value={redeemCode}
                                onChange={(e) => setRedeemCode(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 focus:border-[#C07C4A] rounded-2xl px-5 py-4 text-xs font-semibold focus:outline-none text-white tracking-widest text-center"
                            />
                            
                            {/* Capsule Redeem Button */}
                            <button
                                type="submit"
                                className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#2A120C] hover:bg-[#4A241A] border border-[#C07C4A]/30 text-white text-xs font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap shadow-lg hover:scale-102"
                            >
                                Redeem
                            </button>
                        </form>

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
                                            
                                            {cartItem.isGiftCard ? (
                                                <p className="text-[10px] text-[#C07C4A] font-semibold leading-none">
                                                    Digital Gifting
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
