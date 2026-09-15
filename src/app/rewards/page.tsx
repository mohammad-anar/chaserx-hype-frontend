"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import { selectIsAuthenticated } from "@/redux/features/auth/authSlice";
import { 
    ShoppingBag, 
    Gift, 
    Heart, 
    QrCode, 
    Copy, 
    Check, 
    Award, 
    Sparkles, 
    Flame, 
    ArrowRight,
    Clock,
    CreditCard,
    Coffee
} from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useGetCoinProductsQuery } from "@/redux/features/coinProduct/coinProductApi";
import { useGetMyRewardPaymentsQuery } from "@/redux/features/payment/paymentApi";
import { useGetMyWalletQuery } from "@/redux/features/wallet/walletApi";
import { useAddToCartMutation } from "@/redux/features/cart/cartApi";
import { 
    useGetMyLoyaltyProfileQuery, 
    useGetMyPointsHistoryQuery 
} from "@/redux/features/loyalty/loyaltyApi";
import QRCodeRenderer from "@/components/QRCodeRenderer";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import ScrollReveal from "@/components/ScrollReveal";

export default function RewardsPage() {
    const router = useRouter();
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const [mounted, setMounted] = useState(false);
    const [copiedCode, setCopiedCode] = useState(false);
    const [historyTab, setHistoryTab] = useState<"points" | "rewards">("points");

    const { showNotification, setIsCartOpen } = useCart();
    const { data: coinProductsData, isLoading: isCoinProductsLoading } = useGetCoinProductsQuery({});
    const { data: myRewardPaymentsData } = useGetMyRewardPaymentsQuery(undefined, { skip: !isAuthenticated });
    const { data: myWalletData } = useGetMyWalletQuery(undefined, { skip: !isAuthenticated });
    const { data: loyaltyProfileData } = useGetMyLoyaltyProfileQuery(undefined, { skip: !isAuthenticated });
    const { data: loyaltyHistoryData } = useGetMyPointsHistoryQuery(undefined, { skip: !isAuthenticated });
    const [addToCartApi, { isLoading: isAddingToCart }] = useAddToCartMutation();

    const coinProducts = coinProductsData?.data || [];
    const rewardPayments = myRewardPaymentsData?.data || [];
    const loyaltyProfile = loyaltyProfileData?.data;
    const pointTransactions = loyaltyHistoryData?.data || [];
    
    // Live balances
    const walletBalance = loyaltyProfile?.pointsBalance ?? (myWalletData?.data?.balance ?? myWalletData?.balance ?? (isAuthenticated ? 0 : 1240));
    const loyaltyCode = loyaltyProfile?.loyaltyCode || "CH-7821-9940";
    const tierName = loyaltyProfile?.tier || (walletBalance >= 1000 ? "Gold Artisan" : walletBalance >= 500 ? "Silver Brewmaster" : "Bean Member");

    useEffect(() => {
        setTimeout(() => {
            setMounted(true);
        }, 0);
    }, []);

    const handleCopyCode = () => {
        if (!loyaltyCode) return;
        navigator.clipboard.writeText(loyaltyCode);
        setCopiedCode(true);
        showNotification("Loyalty Member Code copied to clipboard!");
        setTimeout(() => setCopiedCode(false), 2000);
    };

    const getCoinProductImage = (imgPath?: string) => {
        if (!imgPath) return "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=500&q=80";

        const baseUrl = process.env.NEXT_PUBLIC_BASEURL || "http://localhost:5000";
        return `${baseUrl}${imgPath}`;
    };

    // Add coin product reward item to cart
    const handleAddCoinProductToCart = async (coinProduct: any) => {
        if (!isAuthenticated) {
            showNotification("Please sign in to redeem rewards.");
            setIsCartOpen(true);
            router.push("/auth/login");
            return;
        }

        try {
            await addToCartApi({
                isCoinProduct: true,
                coinProductId: coinProduct?.id,
                quantity: 1
            }).unwrap();

            const productName = coinProduct?.product?.name || coinProduct?.name || "Reward";
            showNotification(`Added ${productName} to Cart`);
            setIsCartOpen(true);
        } catch (err: any) {
            console.error("Failed to add reward to cart:", err);
            const errMsg = err?.data?.message || err?.message || "Failed to add reward to cart.";
            showNotification(errMsg);
        }
    };

    // Fallback static rewards if API returns empty
    const handleAddFallbackRewardToCart = (pointsCost: number, name: string) => {
        if (!isAuthenticated) {
            showNotification("Please sign in to redeem rewards.");
            setIsCartOpen(true);
            router.push("/auth/login");
            return;
        }
        showNotification(`Redeemed ${name}!`);
        setIsCartOpen(true);
    };

    if (!mounted) return null;

    return (
        <div className="min-h-screen text-[#2C1A14] bg-[#FAF6F0] relative selection:bg-[#C07C4A] selection:text-[#FAF6F0] scroll-smooth font-sans">
            {/* Header Navigation */}
            <Navbar theme="light" />

            {/* HERO / LOYALTY STATUS SECTION */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 text-left overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">

                    {/* Left Details */}
                    <div className="lg:col-span-6 space-y-6 opacity-0 animate-fade-in-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8B4513]/10 border border-[#8B4513]/20 text-[#8B4513] text-xs font-bold uppercase tracking-widest">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>{tierName}</span>
                        </div>

                        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#2C1A14] leading-[1.1]">
                            Your Loyalty, Elevated.
                        </h1>

                        <p className="text-sm text-[#6B5E59] max-w-lg leading-relaxed">
                            Scan your member QR code at any Bean Fien counter or order online to earn points with every purchase. Redeem for handcrafted roasts, artisan pastries, and exclusive experiences.
                        </p>

                        <div className="space-y-1 pt-2 opacity-0 animate-fade-in-up delay-150">
                            <span className="text-[#6B5E59] text-sm font-bold font-sans tracking-wide block">
                                Points Balance
                            </span>
                            <div className="flex items-baseline gap-3">
                                <span className="font-serif font-black text-6xl sm:text-7xl text-[#2C1A14] tracking-tight block leading-none">
                                    {walletBalance.toLocaleString()}
                                </span>
                                <span className="text-[#C07C4A] text-xs font-black uppercase tracking-widest block">
                                    PTS
                                </span>
                            </div>
                        </div>

                        {/* Quick CTA Actions */}
                        <div className="flex flex-wrap gap-4 pt-2">
                            <button
                                onClick={() => {
                                    if (coinProducts.length > 0) {
                                        handleAddCoinProductToCart(coinProducts[0]);
                                    } else {
                                        handleAddFallbackRewardToCart(150, "Free Coffee Reward");
                                    }
                                }}
                                className="px-7 py-3.5 rounded-xl bg-[#2C120C] hover:bg-[#4A241A] text-white text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-md shadow-[#2C120C]/15 hover:scale-[1.02] flex items-center gap-2"
                            >
                                <Gift className="w-4 h-4" />
                                <span>Redeem Reward</span>
                            </button>

                            <Link
                                href="/gift-cards"
                                className="px-7 py-3.5 rounded-xl bg-white hover:bg-[#F3ECE3] text-[#2C1A14] border border-[#2C1A14]/15 text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-sm flex items-center gap-2"
                            >
                                <CreditCard className="w-4 h-4 text-[#C07C4A]" />
                                <span>Digital Gift Cards</span>
                            </Link>
                        </div>
                    </div>

                    {/* Right Loyalty Digital Pass with QR Code */}
                    <div className="lg:col-span-6 flex flex-col items-center justify-center opacity-0 animate-fade-in-right delay-200">
                        <div className="w-full max-w-md bg-gradient-to-br from-[#1E0F0B] via-[#2C120C] to-[#140805] text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/10 relative overflow-hidden group">
                            {/* Decorative background glow */}
                            <div className="absolute -top-24 -right-24 w-60 h-60 bg-[#C07C4A]/20 rounded-full blur-3xl pointer-events-none" />
                            <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-[#8B4513]/20 rounded-full blur-3xl pointer-events-none" />

                            <div className="relative z-10 space-y-6 text-left">
                                {/* Card Header */}
                                <div className="flex justify-between items-start border-b border-white/10 pb-4">
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-2">
                                            <Coffee className="w-5 h-5 text-[#C07C4A]" />
                                            <span className="font-serif font-black tracking-wider text-base uppercase">BEAN FIEN</span>
                                        </div>
                                        <p className="text-[10px] text-white/50 tracking-widest font-semibold uppercase">Official Loyalty Pass</p>
                                    </div>

                                    <span className="px-3 py-1 rounded-full bg-[#C07C4A]/20 border border-[#C07C4A]/40 text-[#FAF0ED] text-[10px] font-black uppercase tracking-wider">
                                        {tierName}
                                    </span>
                                </div>

                                {/* QR Code Display in Card */}
                                <div className="flex flex-col sm:flex-row items-center gap-6 bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10">
                                    <div className="bg-white p-3 rounded-xl shadow-md flex-shrink-0 flex items-center justify-center">
                                        <QRCodeRenderer
                                            value={loyaltyCode}
                                            size={120}
                                            fgColor="#2C120C"
                                            bgColor="#FFFFFF"
                                        />
                                    </div>

                                    <div className="space-y-3 text-center sm:text-left flex-1">
                                        <div>
                                            <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider block">
                                                Customer Member ID
                                            </span>
                                            <span className="font-mono text-base font-bold text-white tracking-widest">
                                                {loyaltyCode}
                                            </span>
                                        </div>

                                        <button
                                            onClick={handleCopyCode}
                                            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-[11px] font-semibold text-white transition-all cursor-pointer"
                                        >
                                            {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#C07C4A]" />}
                                            <span>{copiedCode ? "Copied!" : "Copy Code"}</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Footer info */}
                                <div className="pt-1 flex items-center justify-between text-[10px] text-white/50 border-t border-white/10">
                                    <span>Scan at counter to earn 1 pt / $1 spent</span>
                                    <span className="font-semibold text-[#C07C4A]">Lifetime Points: {loyaltyProfile?.lifetimePoints ?? walletBalance}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            {/* CATALOG SECTION */}
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
                    {isCoinProductsLoading ? (
                        <div className="flex justify-center items-center py-16">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#8B4513]"></div>
                        </div>
                    ) : coinProducts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {coinProducts.map((cp: any, index: number) => {
                                const productName = cp?.product?.name || cp?.name || "Loyalty Reward";
                                const description = cp?.product?.shortDescription || cp?.product?.description || "Exclusive loyalty reward available with your points balance.";
                                const imageSrc = getCoinProductImage(cp?.product?.image);
                                const pointsCost = cp?.needPoint || 100;

                                return (
                                    <ScrollReveal key={cp?.id || index} delay={index * 0.1} className="h-full">
                                        <div className="bg-[#FAF6F0] rounded-2xl border border-[#2C1A14]/10 p-5 flex flex-col justify-between hover:shadow-lg transition-all duration-300 group hover:-translate-y-1 h-full">
                                            <div className="relative h-64 rounded-xl overflow-hidden mb-5 bg-[#FAF0ED]">
                                                <span className="absolute top-4.5 left-4.5 z-10 bg-[#2C120C] text-white text-[10px] font-black uppercase tracking-wider py-1.5 px-3 rounded-lg">
                                                    {pointsCost} PTS
                                                </span>
                                                <img
                                                    src={imageSrc}
                                                    alt={productName}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                />
                                            </div>
                                            <div className="space-y-5 flex flex-col flex-1 justify-between text-center">
                                                <div className="space-y-2 text-left">
                                                    <h3 className="font-serif text-lg font-bold text-[#2C1A14] group-hover:text-[#8B4513] transition-colors">
                                                        {productName}
                                                    </h3>
                                                    <p className="text-xs text-[#6B5E59] leading-relaxed line-clamp-2">
                                                        {description}
                                                    </p>
                                                </div>

                                                <div className="w-full flex justify-center pt-2">
                                                    <button
                                                        onClick={() => handleAddCoinProductToCart(cp)}
                                                        disabled={isAddingToCart}
                                                        className="px-8 py-2.5 rounded-lg bg-[#2C120C] hover:bg-[#4A241A] text-white text-xs font-bold tracking-wider transition-colors disabled:opacity-50"
                                                    >
                                                        {isAddingToCart ? "Adding..." : "Add to Cart"}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </ScrollReveal>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Fallback Static Cards */}
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

                                        <div className="w-full flex justify-center pt-2">
                                            <button
                                                onClick={() => handleAddFallbackRewardToCart(50, "Vanilla Sweet Cream")}
                                                className="px-8 py-2.5 rounded-lg bg-[#2C120C] hover:bg-[#4A241A] text-white text-xs font-bold tracking-wider transition-colors"
                                            >
                                                Add to Cart
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </ScrollReveal>

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

                                        <div className="w-full flex justify-center pt-2">
                                            <button
                                                onClick={() => handleAddFallbackRewardToCart(150, "Oat Silk Latte")}
                                                className="px-8 py-2.5 rounded-lg bg-[#2C120C] hover:bg-[#4A241A] text-white text-xs font-bold tracking-wider transition-colors"
                                            >
                                                Add to Cart
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </ScrollReveal>

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

                                        <div className="w-full flex justify-center pt-2">
                                            <button
                                                onClick={() => handleAddFallbackRewardToCart(500, "Hazelnut Frappe")}
                                                className="px-8 py-2.5 rounded-lg bg-[#2C120C] hover:bg-[#4A241A] text-white text-xs font-bold tracking-wider transition-colors"
                                            >
                                                Add to Cart
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </ScrollReveal>
                        </div>
                    )}

                </div>
            </section>

            {/* RECENT ACTIVITY SECTION */}
            {isAuthenticated && (
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-left border-t border-[#2C1A14]/10">
                    <div className="space-y-8">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <ScrollReveal>
                                <div className="space-y-1">
                                    <span className="text-[#C07C4A] text-xs font-bold uppercase tracking-widest block">
                                        ACTIVITY LOG
                                    </span>
                                    <h2 className="font-serif text-2xl md:text-3xl font-extrabold text-[#2C1A14]">
                                        Your Point & Reward History
                                    </h2>
                                </div>
                            </ScrollReveal>

                            <div className="flex bg-[#F3ECE3] p-1 rounded-xl border border-[#2C1A14]/10 w-fit">
                                <button
                                    onClick={() => setHistoryTab("points")}
                                    className={`px-5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                        historyTab === "points"
                                            ? "bg-[#2C120C] text-white shadow-sm"
                                            : "text-[#6B5E59] hover:text-[#2C1A14]"
                                    }`}
                                >
                                    Points History ({pointTransactions.length})
                                </button>
                                <button
                                    onClick={() => setHistoryTab("rewards")}
                                    className={`px-5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                        historyTab === "rewards"
                                            ? "bg-[#2C120C] text-white shadow-sm"
                                            : "text-[#6B5E59] hover:text-[#2C1A14]"
                                    }`}
                                >
                                    Redeemed Rewards ({rewardPayments.length})
                                </button>
                            </div>
                        </div>

                        {historyTab === "points" ? (
                            <div className="space-y-4 max-w-5xl">
                                {pointTransactions.length > 0 ? (
                                    pointTransactions.map((tx: any, idx: number) => {
                                        const isCredit = tx.type === "EARNED" || tx.type === "MANUAL_ADJUST" || tx.type === "BONUS";
                                        const formattedDate = new Date(tx.createdAt || Date.now()).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "2-digit",
                                            year: "numeric"
                                        });

                                        return (
                                            <ScrollReveal key={tx.id || idx} delay={idx * 0.04}>
                                                <div className="bg-[#FAF6F0] rounded-2xl border border-[#2C1A14]/10 p-5 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-full bg-[#FAF0ED] border border-[#F6DED6] flex items-center justify-center text-[#C07C4A]">
                                                            {isCredit ? <Sparkles className="w-5 h-5 stroke-[1.5]" /> : <Coffee className="w-5 h-5 stroke-[1.5]" />}
                                                        </div>
                                                        <div className="text-left space-y-1">
                                                            <h4 className="text-sm font-bold text-[#2C1A14]">
                                                                {tx.description || (isCredit ? "Points Credited" : "Points Deducted")}
                                                            </h4>
                                                            <p className="text-xs text-[#6B5E59]">
                                                                {formattedDate} {tx.orderId ? `• Order #${tx.orderId.slice(-6).toUpperCase()}` : ""}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <span className={`font-bold text-sm tracking-wide ${isCredit ? "text-emerald-700" : "text-[#8B4513]"}`}>
                                                        {isCredit ? `+${tx.points} pts` : `-${tx.points} pts`}
                                                    </span>
                                                </div>
                                            </ScrollReveal>
                                        );
                                    })
                                ) : (
                                    <div className="bg-[#FAF6F0] rounded-2xl border border-[#2C1A14]/10 p-8 text-center text-[#6B5E59] text-xs">
                                        No point transactions recorded yet. Scan your member QR code when purchasing in-store to earn points!
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4 max-w-5xl">
                                {rewardPayments.length > 0 ? (
                                    rewardPayments.map((item: any, idx: number) => {
                                        const itemName = 
                                            item?.order?.orderItems?.[0]?.coinProduct?.product?.name || 
                                            item?.order?.orderItems?.[0]?.product?.name || 
                                            item?.order?.orderItems?.[0]?.name ||
                                            "Reward Item";
                                        const formattedDate = new Date(item?.createdAt || item?.updatedAt || Date.now()).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "2-digit",
                                            year: "numeric"
                                        });
                                        const usedCoin = item?.coin || item?.order?.usedCoin || 0;

                                        return (
                                            <ScrollReveal key={item?.id || idx} delay={idx * 0.05}>
                                                <div className="bg-[#FAF6F0] rounded-2xl border border-[#2C1A14]/10 p-5 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-full bg-[#FAF0ED] border border-[#F6DED6] flex items-center justify-center text-[#C07C4A]">
                                                            <Gift className="w-5 h-5 stroke-[1.5]" />
                                                        </div>
                                                        <div className="text-left space-y-1">
                                                            <h4 className="text-sm font-bold text-[#2C1A14]">Reward Redeemed: {itemName}</h4>
                                                            <p className="text-xs text-[#6B5E59]">
                                                                {formattedDate} • Order #{item?.order?.orderNumber || item?.orderId || "N/A"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <span className="font-bold text-[#8B4513] text-sm tracking-wide">
                                                        -{usedCoin} pts
                                                    </span>
                                                </div>
                                            </ScrollReveal>
                                        );
                                    })
                                ) : (
                                    <div className="bg-[#FAF6F0] rounded-2xl border border-[#2C1A14]/10 p-8 text-center text-[#6B5E59] text-xs">
                                        No rewards redeemed yet. Pick an item from the rewards catalog above to redeem with your points.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* Footer Section */}
            <Footer theme="light" />

            {/* Shopping Cart Drawer */}
            <CartDrawer theme="light" />
        </div>
    );
}
