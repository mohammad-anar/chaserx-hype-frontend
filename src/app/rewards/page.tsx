"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import { selectIsAuthenticated } from "@/redux/features/auth/authSlice";
import { ShoppingBag, Gift, Heart } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useGetCoinProductsQuery } from "@/redux/features/coinProduct/coinProductApi";
import { useGetMyRewardPaymentsQuery } from "@/redux/features/payment/paymentApi";
import { useGetMyWalletQuery } from "@/redux/features/wallet/walletApi";
import { useAddToCartMutation } from "@/redux/features/cart/cartApi";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import ScrollReveal from "@/components/ScrollReveal";

export default function RewardsPage() {
    const router = useRouter();
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const [mounted, setMounted] = useState(false);

    const { showNotification, setIsCartOpen } = useCart();
    const { data: coinProductsData, isLoading: isCoinProductsLoading } = useGetCoinProductsQuery({});
    const { data: myRewardPaymentsData } = useGetMyRewardPaymentsQuery(undefined, { skip: !isAuthenticated });
    const { data: myWalletData } = useGetMyWalletQuery(undefined, { skip: !isAuthenticated });
    const [addToCartApi, { isLoading: isAddingToCart }] = useAddToCartMutation();

    const coinProducts = coinProductsData?.data || [];
    const rewardPayments = myRewardPaymentsData?.data || [];
    const walletBalance = myWalletData?.data?.balance ?? myWalletData?.balance ?? (isAuthenticated ? 0 : 1240);

    useEffect(() => {
        setTimeout(() => {
            setMounted(true);
        }, 0);
    }, []);

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

            {/* HERO / STATUS SECTION */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-left overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

                    {/* Left Details */}
                    <div className="lg:col-span-7 space-y-10 opacity-0 animate-fade-in-left">
                        <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#2C1A14] leading-tight">
                            Your Loyalty, Elevated.
                        </h1>

                        <div className="space-y-1 opacity-0 animate-fade-in-up delay-150">
                            <span className="text-[#6B5E59] text-xl font-bold font-sans tracking-wide block">
                                Your Balance
                            </span>
                            <span className="font-serif font-black text-7xl sm:text-8xl text-[#2C1A14] tracking-tight block leading-none">
                                {walletBalance.toLocaleString()}
                            </span>
                            <span className="text-[#C07C4A]/60 text-[10px] font-bold uppercase tracking-widest block pt-2">
                                reward points available
                            </span>
                        </div>
                    </div>

                    {/* Right Mascot Illustration */}
                    <div className="lg:col-span-5 flex flex-col items-center justify-center opacity-0 animate-fade-in-right delay-200">
                        <div className="relative flex flex-col items-center justify-center max-w-sm w-full group">
                            <div className="w-80 h-80 relative animate-float">
                                <img
                                    src="/reward.png"
                                    alt="Bean Fien Rewards"
                                    className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                                />
                            </div>

                            <div className="mt-4 w-full flex justify-center opacity-0 animate-fade-in delay-300">
                                <button
                                    onClick={() => {
                                        if (coinProducts.length > 0) {
                                            handleAddCoinProductToCart(coinProducts[0]);
                                        } else {
                                            handleAddFallbackRewardToCart(150, "Free Coffee Reward");
                                        }
                                    }}
                                    className="px-8 py-3 rounded-lg bg-[#2C120C] hover:bg-[#4A241A] text-white text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-md shadow-[#2C120C]/10 hover:scale-[1.03]"
                                >
                                    Redeem Reward
                                </button>
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

            {/* RECENT ACTIVITY SECTION - Rendered only if user has reward payments */}
            {isAuthenticated && rewardPayments?.length > 0 && (
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-left">
                    <div className="space-y-8">
                        <ScrollReveal>
                            <h2 className="font-serif text-2xl md:text-3xl font-extrabold text-[#2C1A14]">
                                Recent Activity
                            </h2>
                        </ScrollReveal>

                        <div className="space-y-4 max-w-5xl">
                            {rewardPayments.map((item: any, idx: number) => {
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
                            })}
                        </div>
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
