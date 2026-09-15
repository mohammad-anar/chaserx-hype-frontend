"use client";

import React, { useState, useEffect, useMemo } from "react";
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
    CreditCard, 
    Ticket, 
    Edit3, 
    ShieldAlert, 
    RefreshCw, 
    ArrowRight, 
    ShoppingBag, 
    Coffee, 
    Globe, 
    AtSign,
    Sparkles,
    Send,
    ExternalLink,
    CheckCircle2,
    Clock,
    AlertCircle,
    Copy,
    Heart,
    Gift
} from "lucide-react";
import { useCart } from "@/hooks/useCart";
import {
    useGetMyGiftCardsQuery,
    useCreateGiftCardOrderCheckoutMutation,
    useGetGiftCardOrderByIdQuery,
    useGetMyGiftCardOrdersQuery,
    useRedeemGiftCardCodeMutation,
    useUpdateGiftCardMutation,
    useGetGiftCardStylesQuery,
} from "@/redux/features/giftCard/giftCardApi";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import ScrollReveal from "@/components/ScrollReveal";

const defaultCardDesigns = [
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
    const router = useRouter();
    const dispatch = useAppDispatch();
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const [mounted, setMounted] = useState(false);

    // Page view mode: "purchase" | "balance" | "my-orders"
    const [viewMode, setViewMode] = useState<"purchase" | "balance" | "my-orders">("purchase");

    // RTK Query Hooks
    const { data: stylesResponse } = useGetGiftCardStylesQuery({ active: true });
    const { data: myGiftCardsResponse, isFetching, refetch: refetchCards } = useGetMyGiftCardsQuery(undefined, { skip: !isAuthenticated });
    const { data: myOrdersResponse, isFetching: isFetchingOrders, refetch: refetchOrders } = useGetMyGiftCardOrdersQuery(undefined, { skip: !isAuthenticated });
    const [createGiftCardOrderCheckout, { isLoading: isPurchasing }] = useCreateGiftCardOrderCheckoutMutation();
    const [redeemCodeApi, { isLoading: isRedeeming }] = useRedeemGiftCardCodeMutation();
    const [updateCardApi, { isLoading: isUpdatingCard }] = useUpdateGiftCardMutation();

    const activeCardDesigns = useMemo(() => {
        if (stylesResponse?.data && stylesResponse.data.length > 0) {
            return stylesResponse.data.map((s: any, idx: number) => ({
                id: idx,
                styleId: s.id,
                name: s.name,
                url: s.image,
            }));
        }
        return defaultCardDesigns;
    }, [stylesResponse]);

    // Purchase Form State
    const [selectedDesign, setSelectedDesign] = useState(0);
    const [amountPreset, setAmountPreset] = useState<number | "custom">(25);
    const [customAmountVal, setCustomAmountVal] = useState("");
    const [recipientName, setRecipientName] = useState("");
    const [recipientEmail, setRecipientEmail] = useState("");
    const [personalMessage, setPersonalMessage] = useState("");

    // Live Polling Modal State
    const [activePollingOrderId, setActivePollingOrderId] = useState<string | null>(null);
    const [lastOpenedPaymentUrl, setLastOpenedPaymentUrl] = useState<string | null>(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [copiedCode, setCopiedCode] = useState(false);

    // Balance & Card Details State
    const apiCardData = myGiftCardsResponse?.data;
    const cardBalance = apiCardData?.cardBalance ?? 0;
    const cardNickname = apiCardData?.cardNickname || "Morning Ritual Card";
    const isCardActive = apiCardData?.isCardActive ?? true;
    const transactions = apiCardData?.transactions || [];
    const primaryCardId = apiCardData?.cards?.[0]?.id || "primary";

    const [isRenaming, setIsRenaming] = useState(false);
    const [tempNickname, setTempNickname] = useState("");

    // Redemption Code State
    const [redeemCode, setRedeemCode] = useState("");

    const { showNotification } = useCart();

    // Polling hook for active pending order
    const { data: polledOrderResponse, refetch: refetchPolledOrder } = useGetGiftCardOrderByIdQuery(
        activePollingOrderId as string,
        {
            skip: !activePollingOrderId,
            pollingInterval: activePollingOrderId ? 2500 : 0,
        }
    );

    const polledOrder = polledOrderResponse?.data;

    useEffect(() => {
        setTimeout(() => {
            setMounted(true);
        }, 0);
    }, []);

    // Detect payment completion from polling
    useEffect(() => {
        if (polledOrder && polledOrder.paymentStatus === "PAID" && activePollingOrderId) {
            setActivePollingOrderId(null);
            setShowSuccessModal(true);
            refetchCards();
            if (isAuthenticated) refetchOrders();
            showNotification(`Payment confirmed! Gift card sent to ${polledOrder.recipientName}.`);
        }
    }, [polledOrder, activePollingOrderId, refetchCards, refetchOrders, showNotification, isAuthenticated]);

    // Direct Purchase Handler
    const handleDirectPurchase = async (e: React.FormEvent) => {
        e.preventDefault();

        const cardValue = amountPreset === "custom" ? parseFloat(customAmountVal) : amountPreset;
        
        if (!cardValue || isNaN(cardValue) || cardValue <= 0) {
            showNotification("Please enter a valid gift card amount.");
            return;
        }

        if (!recipientName.trim() || !recipientEmail.trim()) {
            showNotification("Please provide both recipient name and email.");
            return;
        }

        try {
            const res = await createGiftCardOrderCheckout({
                amount: cardValue,
                recipientName: recipientName.trim(),
                recipientEmail: recipientEmail.trim(),
                personalMessage: personalMessage.trim() || undefined,
                designIndex: selectedDesign,
            }).unwrap();

            const order = res?.data?.order;
            const paymentUrl = res?.data?.paymentUrl;

            if (paymentUrl) {
                // Open Stripe checkout in a separate window/tab
                setLastOpenedPaymentUrl(paymentUrl);
                window.open(paymentUrl, "_blank");
            }

            if (order?.id) {
                setActivePollingOrderId(order.id);
            }

            showNotification("Checkout initialized in a separate window. Complete payment to issue the card.");
        } catch (err: any) {
            console.error("Gift card checkout error:", err);
            const errMsg = err?.data?.message || err?.message || "Failed to initialize gift card purchase.";
            showNotification(errMsg);
        }
    };

    // Handle Code Redemption
    const handleRedeemCode = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!redeemCode.trim()) {
            showNotification("Please enter a gift card code.");
            return;
        }

        if (!isAuthenticated) {
            showNotification("Please sign in to redeem gift cards to your profile.");
            router.push("/auth/login");
            return;
        }

        try {
            const res = await redeemCodeApi({ code: redeemCode.trim() }).unwrap();
            showNotification(res?.message || "Gift card redeemed successfully!");
            setViewMode("balance");
            setRedeemCode("");
            refetchCards();
        } catch (err: any) {
            console.error("Redeem error:", err);
            const errMsg = err?.data?.message || err?.message || "Failed to redeem code. Please verify the code and try again.";
            showNotification(errMsg);
        }
    };

    // Save Nickname
    const handleSaveNickname = async () => {
        if (!tempNickname.trim()) {
            setIsRenaming(false);
            return;
        }

        try {
            await updateCardApi({
                id: primaryCardId,
                nickname: tempNickname.trim(),
            }).unwrap();
            showNotification("Card nickname updated successfully!");
        } catch (err: any) {
            showNotification(err?.data?.message || "Failed to update card nickname.");
        } finally {
            setIsRenaming(false);
        }
    };

    const currentCardValue = amountPreset === "custom" ? parseFloat(customAmountVal) || 0 : amountPreset;
    const mySentOrders = myOrdersResponse?.data || [];

    const handleCopyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
        showNotification("Gift card code copied to clipboard!");
    };

    if (!mounted) return null;

    return (
        <div className="min-h-screen text-[#2C1A14] bg-[#FAF6F0] relative selection:bg-[#C07C4A] selection:text-[#FAF6F0] scroll-smooth font-sans">
            {/* Header Navigation */}
            <Navbar theme="light" />

            {/* HERO / LANDING SECTION */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-left">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    
                    {/* Left Column Description or Balance Details */}
                    <div className="lg:col-span-7 space-y-8">
                        {viewMode === "purchase" ? (
                            // Purchase Mode Header
                            <div className="space-y-6">
                                <div className="w-fit inline-flex items-center gap-2 px-3.5 py-1 rounded bg-[#FAF0ED] border border-[#F6DED6]">
                                    <Sparkles className="w-3.5 h-3.5 text-[#C07C4A]" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#C07C4A]">Peer-to-Peer Gifting</span>
                                </div>
                                <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#2C1A14] leading-tight">
                                    Send a gift of artisan coffee.
                                </h1>
                                <p className="text-[#6B5E59] text-sm sm:text-base leading-relaxed font-light max-w-xl">
                                    Surprise a friend, colleague, or loved one. The recipient gets an instant notification, automatic account balance crediting, and can use their gift card to order drinks and food.
                                </p>
                            </div>
                        ) : viewMode === "balance" ? (
                            // Balance Mode Header
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <span className="text-[#C07C4A] text-xs font-black uppercase tracking-widest block">
                                        Your Redeemable Coffee Balance
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
                        ) : (
                            // Sent Orders Mode Header
                            <div className="space-y-6">
                                <div className="w-fit inline-flex items-center gap-2 px-3.5 py-1 rounded bg-[#FAF0ED] border border-[#F6DED6]">
                                    <Send className="w-3.5 h-3.5 text-[#C07C4A]" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#C07C4A]">Sent Gift Cards</span>
                                </div>
                                <h1 className="font-serif text-4xl md:text-5xl font-extrabold tracking-tight text-[#2C1A14] leading-tight">
                                    Your Gift Orders & History
                                </h1>
                                <p className="text-[#6B5E59] text-sm leading-relaxed font-light max-w-xl">
                                    View real-time payment and delivery status of all gift cards you&apos;ve sent to friends.
                                </p>
                            </div>
                        )}

                        {/* View Switchers */}
                        <div className="flex flex-wrap gap-3 pt-2">
                            <button 
                                onClick={() => setViewMode("purchase")}
                                className={`px-5 py-2.5 rounded-xl text-xs font-bold tracking-wider transition-all duration-300 cursor-pointer ${
                                    viewMode === "purchase"
                                        ? "bg-[#2C120C] text-white shadow-md shadow-[#2C120C]/10"
                                        : "bg-white border border-[#2C1A14]/15 text-[#2C1A14] hover:bg-[#2C1A14]/5"
                                }`}
                            >
                                Send a Gift Card
                            </button>
                            <button 
                                onClick={() => {
                                    setViewMode("balance");
                                    setTempNickname(cardNickname);
                                }}
                                className={`px-5 py-2.5 rounded-xl text-xs font-bold tracking-wider transition-all duration-300 cursor-pointer ${
                                    viewMode === "balance"
                                        ? "bg-[#2C120C] text-white shadow-md shadow-[#2C120C]/10"
                                        : "bg-white border border-[#2C1A14]/15 text-[#2C1A14] hover:bg-[#2C1A14]/5"
                                }`}
                            >
                                My Balance & Cards
                            </button>
                            {isAuthenticated && (
                                <button 
                                    onClick={() => setViewMode("my-orders")}
                                    className={`px-5 py-2.5 rounded-xl text-xs font-bold tracking-wider transition-all duration-300 cursor-pointer ${
                                        viewMode === "my-orders"
                                            ? "bg-[#2C120C] text-white shadow-md shadow-[#2C120C]/10"
                                            : "bg-white border border-[#2C1A14]/15 text-[#2C1A14] hover:bg-[#2C1A14]/5"
                                    }`}
                                >
                                    Sent Orders
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Right Column: 3D Tilted Card Preview */}
                    <div className="lg:col-span-5 flex justify-center">
                        <div className="relative transform rotate-3 sm:rotate-6 sm:skew-y-2 w-80 h-48 sm:w-[380px] sm:h-[220px] rounded-2xl overflow-hidden shadow-2xl transition-transform duration-500 hover:rotate-0 hover:skew-y-0 cursor-pointer group border border-white/10">
                            
                            {/* Selected Card Art Background */}
                            <img 
                                src={(activeCardDesigns[selectedDesign] || activeCardDesigns[0])?.url} 
                                alt="Gift Card Design" 
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            
                            {/* Dark gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />

                            {/* Card Content Elements */}
                            <div className="absolute inset-0 p-5 flex flex-col justify-between text-left text-white z-10 font-sans">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <span className="font-serif font-black tracking-wider text-base sm:text-lg block">Bean Fien</span>
                                        <span className="text-[10px] text-white/70 block">Digital Gift Pass</span>
                                    </div>
                                    <div className="w-7 h-7 rounded-full bg-[#FAF6F0]/20 flex items-center justify-center backdrop-blur-sm border border-white/20">
                                        <CreditCard className="w-3.5 h-3.5 text-[#C07C4A]" />
                                    </div>
                                </div>

                                <div className="flex justify-between items-end">
                                    <div className="space-y-1">
                                        <span className="text-[9px] uppercase tracking-widest text-[#C07C4A] font-bold block leading-none">
                                            {recipientName ? `For ${recipientName}` : "Card Value"}
                                        </span>
                                        <span className="text-xl sm:text-2xl font-black font-serif leading-none tracking-tight block">
                                            {viewMode === "purchase" 
                                                ? `$${currentCardValue.toFixed(2)}` 
                                                : `$${isCardActive ? cardBalance.toFixed(2) : "0.00"}`
                                            }
                                        </span>
                                    </div>
                                    
                                    <div className="flex flex-col items-end gap-1 opacity-95">
                                        <div className="w-6 h-5 border-2 border-white rounded-b-lg relative">
                                            <div className="absolute -right-[4px] top-[2px] w-[5px] h-[7px] border-y-2 border-r-2 border-white rounded-r-md" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            {/* LOWER INTERACTIVE CONTENT */}
            {viewMode === "purchase" ? (
                // DIRECT PURCHASE FORM SECTION
                <section className="border-t border-[#2C1A14]/10 bg-[#FAF6F0] py-16 text-left">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <form onSubmit={handleDirectPurchase} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                            
                            {/* Left purchase config parameters */}
                            <div className="lg:col-span-7 space-y-10">
                                
                                {/* Choose a Design */}
                                <ScrollReveal>
                                    <div className="space-y-4">
                                        <h3 className="font-serif text-2xl font-black text-[#2C1A14]">
                                            1. Choose a Design
                                        </h3>
                                        <p className="text-xs text-[#6B5E59] -mt-2">
                                            Select the aesthetic for the digital gift card.
                                        </p>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                            {activeCardDesigns.map((design: any) => (
                                                <button
                                                    key={design.id}
                                                    type="button"
                                                    onClick={() => setSelectedDesign(design.id)}
                                                    className={`relative h-28 rounded-xl overflow-hidden border-2 transition-all shadow-sm cursor-pointer ${
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
                                </ScrollReveal>

                                {/* Select Amount */}
                                <ScrollReveal delay={0.15}>
                                    <div className="space-y-4">
                                        <h3 className="font-serif text-2xl font-black text-[#2C1A14]">
                                            2. Select Amount
                                        </h3>
                                        <p className="text-xs text-[#6B5E59] -mt-2">
                                            Select a preset or enter a custom amount.
                                        </p>
                                        
                                        <div className="flex flex-wrap gap-3 items-center">
                                            {[10, 25, 50, 100].map((val) => (
                                                <button
                                                    key={val}
                                                    type="button"
                                                    onClick={() => {
                                                        setAmountPreset(val);
                                                        setCustomAmountVal("");
                                                    }}
                                                    className={`px-6 py-3.5 rounded-xl text-xs font-bold border transition-all shadow-sm cursor-pointer ${
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
                                                        placeholder="Amount"
                                                        value={customAmountVal}
                                                        onChange={(e) => setCustomAmountVal(e.target.value)}
                                                        className="w-16 bg-transparent text-xs font-bold focus:outline-none text-[#C07C4A]"
                                                        autoFocus
                                                    />
                                                </div>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setAmountPreset("custom");
                                                        setCustomAmountVal("");
                                                    }}
                                                    className="px-6 py-3.5 rounded-xl text-xs font-bold border border-[#2C1A14]/15 text-[#2C1A14] bg-white hover:bg-[#2C1A14]/5 shadow-sm cursor-pointer"
                                                >
                                                    $ Custom
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </ScrollReveal>

                            </div>

                            {/* Right Recipient Details details card */}
                            <ScrollReveal variant="fadeInRight" className="lg:col-span-5">
                                <div className="bg-[#FAF0ED] rounded-2xl border border-[#C07C4A]/20 p-6 space-y-6 shadow-md">
                                    <div>
                                        <h3 className="font-serif text-xl font-bold text-[#2C1A14]">
                                            Recipient & Delivery
                                        </h3>
                                        <p className="text-xs text-[#6B5E59] mt-0.5">
                                            The recipient will receive the gift card directly.
                                        </p>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        {/* Name */}
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-[#6B5E59] uppercase tracking-wider block">
                                                Recipient Name *
                                            </label>
                                            <input 
                                                type="text"
                                                placeholder="e.g. Sarah Jenkins"
                                                value={recipientName}
                                                onChange={(e) => setRecipientName(e.target.value)}
                                                className="w-full bg-[#FAF6F0] border border-[#2C1A14]/10 rounded-xl px-4 py-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#C07C4A]/40 text-[#2C1A14]"
                                                required
                                            />
                                        </div>

                                        {/* Email */}
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-[#6B5E59] uppercase tracking-wider block">
                                                Recipient Email Address *
                                            </label>
                                            <input 
                                                type="email"
                                                placeholder="sarah@example.com"
                                                value={recipientEmail}
                                                onChange={(e) => setRecipientEmail(e.target.value)}
                                                className="w-full bg-[#FAF6F0] border border-[#2C1A14]/10 rounded-xl px-4 py-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#C07C4A]/40 text-[#2C1A14]"
                                                required
                                            />
                                            <span className="text-[10px] text-[#6B5E59] block">
                                                If registered, their account balance will auto-credit instantly.
                                            </span>
                                        </div>

                                        {/* Personal Message */}
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-[#6B5E59] uppercase tracking-wider block">
                                                Personal Note (Optional)
                                            </label>
                                            <textarea 
                                                placeholder="Enjoy a pour-over on me!"
                                                value={personalMessage}
                                                onChange={(e) => setPersonalMessage(e.target.value)}
                                                className="w-full bg-[#FAF6F0] border border-[#2C1A14]/10 rounded-xl px-4 py-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#C07C4A]/40 text-[#2C1A14] h-20 resize-none"
                                            />
                                        </div>
                                    </div>

                                    {/* Direct Purchase Checkout Button */}
                                    <div className="pt-4 border-t border-[#2C1A14]/10 flex justify-between items-center gap-4">
                                        <div className="text-left font-sans">
                                            <span className="text-[10px] uppercase font-bold text-[#6B5E59] block leading-none pb-1">
                                                Total Value
                                            </span>
                                            <span className="text-2xl font-extrabold text-[#2C1A14] font-serif">
                                                ${currentCardValue.toFixed(2)}
                                            </span>
                                        </div>

                                        <button 
                                            type="submit"
                                            disabled={isPurchasing}
                                            className="px-6 py-3.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold tracking-wider transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                                        >
                                            {isPurchasing ? (
                                                <>
                                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                                    <span>Initializing...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>Direct Purchase & Send</span>
                                                    <ExternalLink className="w-4 h-4" />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </ScrollReveal>

                        </form>
                    </div>
                </section>
            ) : viewMode === "balance" ? (
                // BALANCE / DETAIL VIEW
                <section className="border-t border-[#2C1A14]/10 bg-[#FAF6F0] py-16 text-left">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                            
                            {/* Transaction History log */}
                            <ScrollReveal variant="fadeInLeft" className="lg:col-span-7">
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center border-b border-[#2C1A14]/10 pb-3">
                                        <h3 className="font-serif text-2xl font-black text-[#2C1A14]">
                                            Gift Card Activity & History
                                        </h3>
                                        <button onClick={() => refetchCards()} className="text-xs font-bold uppercase tracking-wider text-[#C07C4A] hover:underline flex items-center gap-1 cursor-pointer">
                                            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
                                            <span>Refresh</span>
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {transactions && transactions.length > 0 ? (
                                            transactions.map((tx: any) => {
                                                const isCredit = tx.type === "PURCHASE" || tx.type === "REDEMPTION" || tx.type === "ADMIN_ADJUSTMENT" || tx.type === "RELOAD";
                                                const formattedDate = new Date(tx.createdAt).toLocaleDateString("en-US", {
                                                    month: "short",
                                                    day: "numeric",
                                                    year: "numeric"
                                                });
                                                return (
                                                    <div key={tx.id} className="bg-white rounded-xl border border-[#2C1A14]/10 p-4 flex items-center justify-between shadow-xs hover:shadow-sm transition-shadow">
                                                        <div className="flex items-center gap-3.5">
                                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isCredit ? "bg-emerald-500/10 text-emerald-600" : "bg-primary/10 text-primary"}`}>
                                                                {isCredit ? <Gift className="w-5 h-5" /> : <Coffee className="w-5 h-5" />}
                                                            </div>
                                                            <div className="text-left space-y-0.5">
                                                                <h4 className="text-xs font-bold text-[#2C1A14]">
                                                                    {tx.title || (isCredit ? "Gift Card Received / Credited" : "Menu Order Payment")}
                                                                </h4>
                                                                <p className="text-[11px] text-[#6B5E59]">{formattedDate}</p>
                                                            </div>
                                                        </div>
                                                        <span className={`font-bold text-xs ${isCredit ? "text-emerald-600" : "text-[#2C1A14]"}`}>
                                                            {isCredit ? `+$${Number(tx.amount).toFixed(2)}` : `-$${Number(tx.amount).toFixed(2)}`}
                                                        </span>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="bg-white rounded-xl border border-[#2C1A14]/10 p-8 text-center text-[#6B5E59] text-xs">
                                                No gift card transactions recorded on your account yet.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </ScrollReveal>

                            {/* Card Management Action Card */}
                            <ScrollReveal variant="fadeInRight" className="lg:col-span-5">
                                <div className="bg-white rounded-2xl border border-[#2C1A14]/10 p-6 space-y-4 shadow-sm">
                                    <h3 className="font-serif text-xl font-bold text-[#2C1A14] border-b border-[#2C1A14]/5 pb-3">
                                        Card Controls
                                    </h3>

                                    <div className="space-y-3">
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
                                            className="w-full flex items-center justify-between p-4 rounded-xl border border-[#2C1A14]/10 hover:bg-[#FAF6F0] transition-colors text-left cursor-pointer"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-[#FAF0ED] text-[#C07C4A] flex items-center justify-center border border-[#F6DED6]">
                                                    <Edit3 className="w-4 h-4" />
                                                </div>
                                                <div className="leading-tight">
                                                    <span className="text-xs font-bold text-[#2C1A14] block">Rename Card</span>
                                                    <span className="text-[10px] text-[#6B5E59]">Custom nickname</span>
                                                </div>
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-[#C07C4A]" />
                                        </button>

                                        {/* Deactivate / Activate Card */}
                                        <button 
                                            type="button"
                                            onClick={async () => {
                                                try {
                                                    await updateCardApi({
                                                        id: primaryCardId,
                                                        isActive: !isCardActive,
                                                    }).unwrap();
                                                    showNotification(isCardActive ? "Card deactivated temporarily." : "Card reactivated.");
                                                    refetchCards();
                                                } catch (err: any) {
                                                    showNotification(err?.data?.message || "Failed to update card status.");
                                                }
                                            }}
                                            className="w-full flex items-center justify-between p-4 rounded-xl border border-[#2C1A14]/10 hover:bg-red-50/10 transition-colors text-left cursor-pointer"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-9 h-9 rounded-full flex items-center justify-center border ${
                                                    isCardActive 
                                                        ? "bg-red-50 text-red-500 border-red-100" 
                                                        : "bg-emerald-50 text-emerald-600 border-emerald-100"
                                                }`}>
                                                    <ShieldAlert className="w-4 h-4" />
                                                </div>
                                                <div className="leading-tight">
                                                    <span className={`text-xs font-bold block ${
                                                        isCardActive ? "text-red-500" : "text-emerald-600"
                                                    }`}>
                                                        {isCardActive ? "Freeze Card" : "Unfreeze Card"}
                                                    </span>
                                                    <span className="text-[10px] text-[#6B5E59]">
                                                        {isCardActive ? "Prevent unintended charges" : "Enable drink checkout"}
                                                    </span>
                                                </div>
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-[#C07C4A]" />
                                        </button>
                                    </div>
                                </div>
                            </ScrollReveal>
                        </div>
                    </div>
                </section>
            ) : (
                // SENT GIFT CARD ORDERS HISTORY VIEW
                <section className="border-t border-[#2C1A14]/10 bg-[#FAF6F0] py-16 text-left">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                        <div className="flex justify-between items-center border-b border-[#2C1A14]/10 pb-4">
                            <div>
                                <h3 className="font-serif text-2xl font-bold text-[#2C1A14]">
                                    Gift Cards Sent by You
                                </h3>
                                <p className="text-xs text-[#6B5E59] mt-0.5">
                                    All your purchased gift card orders and payment statuses.
                                </p>
                            </div>
                            <button
                                onClick={() => refetchOrders()}
                                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#2C1A14]/15 text-xs font-bold text-[#2C1A14] hover:bg-[#2C1A14]/5 cursor-pointer shadow-xs"
                            >
                                <RefreshCw className={`w-3.5 h-3.5 ${isFetchingOrders ? "animate-spin text-[#C07C4A]" : ""}`} />
                                <span>Refresh</span>
                            </button>
                        </div>

                        {mySentOrders.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-[#2C1A14]/10 p-12 text-center space-y-3">
                                <Gift className="w-12 h-12 text-[#C07C4A]/40 mx-auto" />
                                <h4 className="font-serif text-lg font-bold text-[#2C1A14]">No Gift Cards Sent Yet</h4>
                                <p className="text-xs text-[#6B5E59] max-w-sm mx-auto">
                                    Send a gift card to a friend or coworker to surprise them with artisan coffee!
                                </p>
                                <button
                                    onClick={() => setViewMode("purchase")}
                                    className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-sm"
                                >
                                    Purchase a Gift Card Now
                                </button>
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl border border-[#2C1A14]/10 overflow-hidden shadow-xs">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs border-collapse">
                                        <thead>
                                            <tr className="border-b border-[#2C1A14]/10 bg-[#FAF6F0]/60 text-[11px] font-bold text-[#6B5E59] uppercase tracking-wider">
                                                <th className="py-3.5 px-4">Order #</th>
                                                <th className="py-3.5 px-4">Recipient</th>
                                                <th className="py-3.5 px-4">Amount</th>
                                                <th className="py-3.5 px-4">Card Code</th>
                                                <th className="py-3.5 px-4 text-center">Payment Status</th>
                                                <th className="py-3.5 px-4 text-right">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#2C1A14]/5 text-xs">
                                            {mySentOrders.map((ord: any) => (
                                                <tr key={ord.id} className="hover:bg-[#FAF6F0]/40 transition-colors">
                                                    <td className="py-3.5 px-4 font-bold text-primary font-mono">
                                                        {ord.orderNumber}
                                                    </td>
                                                    <td className="py-3.5 px-4">
                                                        <div className="font-semibold text-[#2C1A14]">{ord.recipientName}</div>
                                                        <div className="text-[10px] text-[#6B5E59]">{ord.recipientEmail}</div>
                                                    </td>
                                                    <td className="py-3.5 px-4 font-bold text-[#2C1A14]">
                                                        ${Number(ord.amount).toFixed(2)}
                                                    </td>
                                                    <td className="py-3.5 px-4 font-mono font-bold text-[#C07C4A]">
                                                        {ord.giftCard?.code || (
                                                            <span className="text-[11px] text-muted-foreground font-sans italic">
                                                                Pending Payment
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="py-3.5 px-4 text-center">
                                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                                            ord.paymentStatus === "PAID"
                                                                ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                                                : ord.paymentStatus === "PENDING"
                                                                ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                                                                : "bg-red-500/10 text-red-600 border border-red-500/20"
                                                        }`}>
                                                            {ord.paymentStatus}
                                                        </span>
                                                    </td>
                                                    <td className="py-3.5 px-4 text-right text-[#6B5E59]">
                                                        {new Date(ord.createdAt).toLocaleDateString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* REDEEM A CODE SECTION */}
            <section className="bg-[#1E1B1A] text-white py-16 text-left border-t border-white/5 relative z-30 font-sans overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <ScrollReveal>
                        <div className="bg-[#141212] p-8 md:p-12 rounded-2xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative">
                            
                            <div className="absolute top-8 right-8 text-[#C07C4A] hidden md:block">
                                <Ticket className="w-6 h-6 stroke-[1.5]" />
                            </div>

                            {/* Description */}
                            <div className="space-y-3 max-w-lg text-left">
                                <h3 className="font-serif text-2xl font-bold text-white">Redeem a Code</h3>
                                <p className="text-xs text-white/50 leading-relaxed font-light">
                                    Got a Gift Card code from a friend? Enter your code below to claim and add the funds directly into your Bean Fien account for drinks & food ordering.
                                </p>
                            </div>

                            {/* Input redemption form */}
                            <form onSubmit={handleRedeemCode} className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-4 flex-1 max-w-md">
                                <input 
                                    type="text"
                                    placeholder="Enter GC-XXXX-XXXX-XXXX"
                                    value={redeemCode}
                                    onChange={(e) => setRedeemCode(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 focus:border-[#C07C4A] rounded-xl px-5 py-3.5 text-xs font-semibold focus:outline-none text-white tracking-widest text-center"
                                />
                                
                                <button
                                    type="submit"
                                    disabled={isRedeeming}
                                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-black tracking-widest transition-all duration-300 whitespace-nowrap shadow-lg cursor-pointer"
                                >
                                    {isRedeeming ? "Redeeming..." : "Redeem"}
                                </button>
                            </form>

                        </div>
                    </ScrollReveal>
                </div>
            </section>

            {/* LIVE POLLING MODAL: Waiting for Payment */}
            {activePollingOrderId && (
                <div className="fixed inset-0 bg-black/65 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-[#2C1A14]/15 text-center space-y-6 animate-scale-in">
                        <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-600 flex items-center justify-center mx-auto">
                            <Clock className="w-8 h-8 animate-pulse" />
                        </div>
                        
                        <div className="space-y-2">
                            <h3 className="font-serif text-2xl font-bold text-[#2C1A14]">
                                Awaiting Payment Completion
                            </h3>
                            <p className="text-xs text-[#6B5E59] leading-relaxed">
                                Stripe Checkout was opened in a separate window. Complete the payment to issue and deliver the gift card to <strong className="text-[#2C1A14] font-bold">{recipientName || "the recipient"}</strong>.
                            </p>
                        </div>

                        <div className="p-4 rounded-xl bg-[#FAF0ED] border border-[#C07C4A]/20 text-xs text-[#2C1A14] flex items-center justify-between">
                            <span className="text-[#6B5E59]">Amount Payable:</span>
                            <span className="font-black text-sm">${currentCardValue.toFixed(2)}</span>
                        </div>

                        <div className="flex flex-col gap-2 pt-2">
                            {lastOpenedPaymentUrl && (
                                <button
                                    type="button"
                                    onClick={() => window.open(lastOpenedPaymentUrl, "_blank")}
                                    className="w-full py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <span>Re-open Payment Window</span>
                                    <ExternalLink className="w-4 h-4" />
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => setActivePollingOrderId(null)}
                                className="w-full py-2.5 rounded-xl border border-[#2C1A14]/15 hover:bg-[#FAF6F0] text-xs font-bold text-[#6B5E59] cursor-pointer"
                            >
                                Close & Check Status Later
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* PAYMENT SUCCESS CELEBRATION MODAL */}
            {showSuccessModal && polledOrder && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-emerald-500/30 text-center space-y-6 animate-scale-in">
                        <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 flex items-center justify-center mx-auto">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>
                        
                        <div className="space-y-2">
                            <h3 className="font-serif text-2xl font-bold text-[#2C1A14]">
                                Gift Card Successfully Sent!
                            </h3>
                            <p className="text-xs text-[#6B5E59] leading-relaxed">
                                Your payment of <strong className="text-emerald-600 font-bold">${Number(polledOrder.amount).toFixed(2)}</strong> has been verified. The gift card is now active and ready for {polledOrder.recipientName}.
                            </p>
                        </div>

                        {polledOrder.giftCard?.code && (
                            <div className="p-4 rounded-2xl bg-[#FAF0ED] border border-[#C07C4A]/30 space-y-2 text-left">
                                <span className="text-[10px] font-bold text-[#6B5E59] uppercase tracking-wider block">
                                    Issued Card Code
                                </span>
                                <div className="flex items-center justify-between gap-2">
                                    <span className="font-mono font-black text-sm text-[#8B4513] tracking-widest">
                                        {polledOrder.giftCard.code}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => handleCopyCode(polledOrder.giftCard.code)}
                                        className="p-1.5 rounded-lg bg-white border border-[#C07C4A]/30 hover:bg-[#FAF6F0] text-[#8B4513] cursor-pointer"
                                        title="Copy Code"
                                    >
                                        {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowSuccessModal(false);
                                    setRecipientName("");
                                    setRecipientEmail("");
                                    setPersonalMessage("");
                                    setViewMode("my-orders");
                                }}
                                className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold transition-all shadow-md cursor-pointer"
                            >
                                View My Sent Gift Cards
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Footer Section */}
            <Footer theme="light" />

            {/* Shopping Cart Drawer */}
            <CartDrawer theme="light" />
        </div>
    );
}
