"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useGetCategoriesQuery } from "@/redux/features/category/categoryApi";
import { useGetProductsQuery } from "@/redux/features/product/productApi";
import { useAddToCartMutation } from "@/redux/features/cart/cartApi";
import { useAppSelector } from "@/redux/hooks";
import { selectIsAuthenticated } from "@/redux/features/auth/authSlice";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import ScrollReveal from "@/components/ScrollReveal";
import { CustomCartItem } from "@/types/menu";

export default function CustomerMenu() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
    const isAuthenticated = useAppSelector(selectIsAuthenticated);

    const { cart, addToCart } = useCart();
    const { data: categoriesRes } = useGetCategoriesQuery(undefined);
    const [addToCartApi] = useAddToCartMutation();

    const queryParams = selectedCategoryId !== "all" ? { categoryId: selectedCategoryId } : undefined;
    const { data: productsRes, isLoading: isProductsLoading } = useGetProductsQuery(queryParams);

    const categories = categoriesRes?.data || [];
    const products = productsRes?.data || [];

    useEffect(() => {
        setTimeout(() => {
            setMounted(true);
        }, 0);
    }, []);

    const parsePrice = (val: any): number => {
        const num = parseFloat(val);
        return isNaN(num) ? 5.50 : num;
    };

    const getProductImg = (item: any) => {
        if (!item) return "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=500";
        let imgStr = "";
        if (Array.isArray(item?.image) && item?.image?.length > 0) {
            imgStr = item?.image?.[0] || "";
        } else if (typeof item?.image === "string" && item?.image) {
            imgStr = item?.image;
        }
        if (!imgStr) return "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=500";
        if (imgStr?.startsWith("http://") || imgStr?.startsWith("https://")) return imgStr;
        const baseUrl = process.env.NEXT_PUBLIC_BASEURL || "http://localhost:5000";
        return `${baseUrl}${imgStr?.startsWith("/") ? "" : "/"}${imgStr}`;
    };

    const handleDirectAddToCart = async (item: any, e?: React.MouseEvent) => {
        if (e) e?.stopPropagation();

        if (isAuthenticated && item?.id) {
            try {
                await addToCartApi({
                    productId: item?.id,
                    quantity: 1,
                    isCoinProduct: false,
                }).unwrap();
            } catch (err) {
                console.log("Cart API note:", err);
            }
        }

        const priceVal = parsePrice(item?.basePrice ?? item?.price);
        const itemImg = getProductImg(item);

        const newCartItem: CustomCartItem = {
            id: `${item?.id}-${Date.now()}`,
            item: {
                id: item?.id,
                name: item?.name,
                price: priceVal,
                image: itemImg,
                category: typeof item?.category === "object" ? item?.category?.name?.toLowerCase() : (item?.category || "espresso"),
                description: item?.description || "",
            },
            quantity: 1,
            size: "small",
            milk: "whole",
            addons: [],
            instructions: "",
            finalPrice: priceVal
        };
        addToCart(newCartItem);
    };

    if (!mounted) return null;

    const activeCategoryObj = categories.find((c: any) => c?.id === selectedCategoryId);
    const activeHeading = selectedCategoryId === "all" ? "All Specialties" : (activeCategoryObj?.name || "Curated Menu");

    return (
        <div className="min-h-screen text-[#2C1A14] bg-[#FAF6F0] relative selection:bg-[#C07C4A] selection:text-[#FAF6F0] scroll-smooth">
            {/* Header Navigation */}
            <Navbar theme="light" />

            {/* Menu Header Title */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-6 text-left">
                <ScrollReveal>
                    <div className="space-y-4 max-w-3xl">
                        <h1 className="font-serif text-5xl md:text-6xl font-extrabold tracking-tight text-[#2C1A14] leading-none">
                            Our Menu
                        </h1>
                        <p className="text-[#6B5E59] text-base md:text-lg leading-relaxed font-sans font-light">
                            Crafted with precision, delivered with passion. Explore our curated selection of specialty coffee and seasonal favorites.
                        </p>

                        {/* Dynamic Categories Tab System */}
                        <div className="flex gap-6 pt-6 text-sm font-bold uppercase tracking-wider border-b border-[#2C1A14]/10 pb-3.5 flex-wrap">
                            <button
                                onClick={() => setSelectedCategoryId("all")}
                                className={`
                                    pb-2 transition-all font-bold tracking-wider uppercase border-b-[3px] text-xs sm:text-sm cursor-pointer
                                    ${selectedCategoryId === "all" 
                                        ? "text-[#2C1A14] border-[#8B4513] font-black" 
                                        : "text-[#6B5E59]/75 border-transparent hover:text-[#2C1A14] hover:border-[#2C1A14]/40"
                                    }
                                `}
                            >
                                All Menu
                            </button>
                            {categories.map((cat: any) => {
                                const isActive = selectedCategoryId === cat?.id;
                                return (
                                    <button
                                        key={cat?.id}
                                        onClick={() => setSelectedCategoryId(cat?.id)}
                                        className={`
                                            pb-2 transition-all font-bold tracking-wider uppercase border-b-[3px] text-xs sm:text-sm cursor-pointer
                                            ${isActive 
                                                ? "text-[#2C1A14] border-[#8B4513] font-black" 
                                                : "text-[#6B5E59]/75 border-transparent hover:text-[#2C1A14] hover:border-[#2C1A14]/40"
                                            }
                                        `}
                                    >
                                        {cat?.name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </ScrollReveal>
            </section>

            {/* ACTIVE TAB SECTION CONTENT */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[400px]">
                <div className="flex justify-between items-center mb-8 border-b border-[#2C1A14]/5 pb-4">
                    <h2 className="font-serif text-2xl md:text-3xl font-extrabold text-[#2C1A14]">
                        {activeHeading}
                    </h2>
                </div>

                {isProductsLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#8B4513]"></div>
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-16 space-y-3">
                        <h3 className="text-lg font-bold text-[#2C1A14]">No products found</h3>
                        <p className="text-xs text-[#6B5E59]">Try selecting another category or check back later.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                        {products.map((item: any, index: number) => {
                            const priceVal = parsePrice(item?.basePrice ?? item?.price);
                            return (
                                <ScrollReveal key={item?.id || index} delay={index * 0.08} duration={0.4} variant="scaleIn" className="h-full">
                                    <div 
                                        onClick={() => router.push(`/menu/${item?.id}`)}
                                        className="bg-[#FAF6F0] rounded-2xl border border-[#2C1A14]/15 p-4 flex flex-col justify-between hover:shadow-lg transition-all duration-300 group hover:-translate-y-1 h-full cursor-pointer"
                                    >
                                        <div className="h-64 rounded-xl overflow-hidden mb-5 relative">
                                            <img 
                                                src={getProductImg(item)} 
                                                alt={item?.name} 
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                                            />
                                        </div>
                                        <div className="space-y-4 flex flex-col flex-1 justify-between">
                                            <div className="space-y-1">
                                                <div className="flex justify-between items-start">
                                                    <h3 className="font-serif text-lg font-bold text-[#2C1A14] group-hover:text-[#8B4513] transition-colors">{item?.name}</h3>
                                                    <span className="font-bold text-[#8B4513] text-sm">${priceVal.toFixed(2)}</span>
                                                </div>
                                                <p className="text-xs text-[#6B5E59] leading-relaxed line-clamp-2">{item?.description}</p>
                                            </div>
                                            <button 
                                                type="button"
                                                onClick={(e) => handleDirectAddToCart(item, e)}
                                                className="w-full py-3 rounded-lg bg-[#2A120C] hover:bg-[#4A241A] text-white text-xs font-bold tracking-wider transition-colors text-center block shadow-md hover:scale-[1.01]"
                                            >
                                                Add to Cart
                                            </button>
                                        </div>
                                    </div>
                                </ScrollReveal>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* Footer Section */}
            <Footer theme="light" />

            {/* Shopping Cart Drawer */}
            <CartDrawer theme="light" />
        </div>
    );
}
