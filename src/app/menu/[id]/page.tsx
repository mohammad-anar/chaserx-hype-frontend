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
import { MenuItem, CustomCartItem } from "@/types/menu";
import { menuItems } from "@/constants/menu";
import { useCart } from "@/hooks/useCart";
import { useGetProductByIdQuery, useGetProductsQuery } from "@/redux/features/product/productApi";
import { useAddToCartMutation } from "@/redux/features/cart/cartApi";
import { useAppSelector } from "@/redux/hooks";
import { selectIsAuthenticated } from "@/redux/features/auth/authSlice";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import ScrollReveal from "@/components/ScrollReveal";

const categoryDescriptions: Record<string, string> = {
    espresso: "TWO SHOTS OF OUR SIGNATURE HOUSE BLEND WITH NOTES OF DARK CHOCOLATE AND ROASTED",
    coldbrew: "12-HOUR COLD EXTRACTION INFUSED WITH NITROGEN FOR A SMOOTH STOUT-LIKE FINISH",
    seasonal: "TEMPORARY SPECIAL SELECTIONS CREATED FOR SEASONAL HARVEST SENSATIONS",
    bakery: "FRESHLY BAKED PASTRY SELECTIONS DELIVERED EVERY MORNING TO OUR BARISTAS",
    hot: "EXQUISITELY BREWED HOT SPECIALTIES SERVED AT THE PERFECT TEMPERATE HEIGHT",
    iced: "CHILLED ESSENCES SERVED OVER PRISTINE CRYSTALLINE ICE FOR CRISP REFRESHMENT",
    blended: "CREAMY CRUSHED BLENDS BALANCED WITH SWEET SYRUPS AND DELECTABLE WHIP"
};

const categoryTitles: Record<string, string> = {
    espresso: "Espresso Classics",
    coldbrew: "Cold Brew",
    seasonal: "Seasonal Specials",
    bakery: "Bakery Selections",
    hot: "Hot Beverages",
    iced: "Iced Refreshers",
    blended: "Blended Delights"
};

export default function MenuDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const isAuthenticated = useAppSelector(selectIsAuthenticated);

    const [mounted, setMounted] = useState(false);

    // Customizer State
    const [customSize, setCustomSize] = useState<"small" | "medium" | "large">("small");
    const [customMilk, setCustomMilk] = useState<"whole" | "oat" | "almond" | "coconut">("whole");
    const [customAddons, setCustomAddons] = useState<string[]>([]);
    const [customInstructions, setCustomInstructions] = useState("");

    const { cart, addToCart, updateQuantity } = useCart();
    const { data: productDetailRes } = useGetProductByIdQuery(id, { skip: !id });
    const { data: allProductsRes } = useGetProductsQuery(undefined);
    const [addToCartApi] = useAddToCartMutation();

    const parsePrice = (val: any): number => {
        const num = parseFloat(val);
        return isNaN(num) ? 5.50 : num;
    };

    const getImg = (item: any) => {
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

    const apiProduct = productDetailRes?.data;
    const allApiProducts = allProductsRes?.data || [];

    const localFallback = menuItems.find(item => item?.id === id) || menuItems[0];

    const selectedItem: MenuItem = apiProduct ? {
        id: apiProduct?.id,
        name: apiProduct?.name,
        category: (typeof apiProduct?.category === "object" ? apiProduct?.category?.name?.toLowerCase() : apiProduct?.category) || "espresso",
        price: parsePrice(apiProduct?.basePrice),
        description: apiProduct?.description || "",
        image: getImg(apiProduct),
    } : localFallback;

    // Filter 2 other products for the hero right column
    const rawOthers = (allApiProducts?.length > 0 ? allApiProducts : menuItems)
        .filter((item: any) => item?.id !== selectedItem?.id);
    const otherProducts = rawOthers?.slice(0, 2)?.map((item: any) => ({
        id: item?.id,
        name: item?.name,
        description: item?.description || "",
        price: parsePrice(item?.basePrice ?? item?.price),
        image: getImg(item),
    }));

    useEffect(() => {
        setTimeout(() => {
            setMounted(true);
        }, 0);
    }, [id]);

    // Calculate customization price
    const calculateCustomizerPrice = (): number => {
        let base = parsePrice(selectedItem.price);
        if (customSize === "medium") base += 0.50;
        if (customSize === "large") base += 1.00;
        if (customMilk !== "whole") base += 0.80;
        base += customAddons.length * 0.75;
        return Number(base);
    };

    const handleAddAddon = (addon: string) => {
        if (customAddons.includes(addon)) {
            setCustomAddons(prev => prev.filter(a => a !== addon));
        } else {
            setCustomAddons(prev => [...prev, addon]);
        }
    };

    // Add Customized Item to Cart
    const handleAddCustomizedToCart = async () => {
        const itemPrice = calculateCustomizerPrice();

        if (isAuthenticated) {
            try {
                await addToCartApi({
                    productId: selectedItem.id,
                    quantity: 1,
                    isCoinProduct: false,
                }).unwrap();
            } catch (err) {
                console.log("Cart API error:", err);
            }
        }

        const existing = cart.find(i =>
            i.item.id === selectedItem.id &&
            i.size === customSize &&
            i.milk === customMilk &&
            JSON.stringify(i.addons.slice().sort()) === JSON.stringify(customAddons.slice().sort()) &&
            i.instructions === customInstructions
        );

        if (existing) {
            updateQuantity(existing.id, 1);
        } else {
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
            addToCart(newCartItem);
        }
    };

    if (!mounted) return null;

    const currentPrice = calculateCustomizerPrice();

    return (
        <div className="min-h-screen text-[#2C1A14] bg-[#FAF6F0] relative selection:bg-[#C07C4A] selection:text-[#FAF6F0] scroll-smooth">
            {/* Header Navigation */}
            <Navbar theme="light" />

            {/* CIRCULAR CATEGORY VISUALIZER SECTION (Screenshot 3 layout) */}
            <section className="w-full bg-[#FAF6F0] py-12 border-b border-[#2C1A14]/10 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-12">

                    {/* Left Column: Product name, line, product description */}
                    <ScrollReveal variant="fadeInLeft" className="w-full md:w-[28%]">
                        <div className="text-left space-y-4">
                            <h2 className="font-serif text-4xl md:text-5xl font-black text-[#2C1A14] leading-tight">
                                {selectedItem?.name}
                            </h2>
                            <div className="w-12 h-[2px] bg-[#2C1A14]/30" />
                            <p className="text-xs tracking-widest text-[#6B5E59] font-bold leading-relaxed max-w-xs uppercase">
                                {selectedItem?.description}
                            </p>
                        </div>
                    </ScrollReveal>

                    {/* Middle Column: Large circular visual container filled with coffee beans, containing the drink circle */}
                    <ScrollReveal variant="scaleIn" className="w-full md:w-[42%] flex flex-col items-center justify-center">
                        <div className="relative w-80 h-80 rounded-full overflow-hidden border-[6px] border-[#C07C4A]/30 shadow-2xl flex items-center justify-center bg-[#2C1A14]">
                            {/* Coffee Beans Background Overlay */}
                            <div
                                className="absolute inset-0 bg-cover bg-center opacity-65 mix-blend-overlay"
                                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80')" }}
                            />

                            {/* Centered Circular drink cutout */}
                            <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-[#FAF6F0] relative z-10 shadow-xl bg-white p-1 transition-transform duration-500 hover:scale-105">
                                <img src={selectedItem.image} alt={selectedItem.name} className="w-full h-full rounded-full object-cover" />
                            </div>
                        </div>

                        {/* Order Now button below circle visualizer */}
                        <button
                            onClick={handleAddCustomizedToCart}
                            className="mt-8 px-10 py-4 rounded-lg bg-[#2A120C] hover:bg-[#4A241A] text-white border border-[#C07C4A]/40 text-xs font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-4 group transition-all duration-300 hover:scale-105"
                        >
                            <span>${currentPrice.toFixed(2)}</span>
                            <span className="opacity-30">— — —</span>
                            <span className="group-hover:text-[#C07C4A] transition-colors">Order Now</span>
                        </button>
                    </ScrollReveal>

                    {/* Right Column: Other two products in the right side card column */}
                    <ScrollReveal variant="fadeInRight" delay={0.1} className="w-full md:w-[30%]">
                        <div className="flex flex-col gap-4 pr-1">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#6B5E59] block text-left">More Specialty Drinks</span>
                            {otherProducts.map((item: any) => {
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => router.push(`/menu/${item.id}`)}
                                        className="w-full rounded-xl p-3.5 flex items-center gap-4 transition-all duration-300 border text-left shadow-sm bg-white text-[#2C1A14] border-[#2C1A14]/10 hover:bg-[#2C1A14]/5 hover:scale-[1.02] group cursor-pointer"
                                    >
                                        {/* Thumbnail inside small rounded box */}
                                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-[#2C1A14] flex-shrink-0 flex items-center justify-center p-0.5 relative border border-[#C07C4A]/20">
                                            <img src={item.image} alt={item.name} className="w-full h-full rounded-lg object-cover relative z-10 transition-transform group-hover:scale-105" />
                                        </div>

                                        {/* Item text */}
                                        <div className="flex-1 min-w-0 space-y-1">
                                            <div className="flex justify-between items-center">
                                                <h4 className="text-[12px] font-bold uppercase tracking-wider truncate group-hover:text-[#C07C4A] transition-colors">{item.name}</h4>
                                                <span className="text-[11px] font-extrabold text-[#8B4513]">${item.price.toFixed(2)}</span>
                                            </div>
                                            <p className="text-[9px] text-[#6B5E59] line-clamp-2 leading-relaxed">
                                                {item.description}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </ScrollReveal>
                </div>
            </section>

            {/* CUSTOMIZATION PANEL SECTION (Screenshot 4 layout) */}
            <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-left">
                <div className="space-y-12">

                    {/* Item title and description heading */}
                    <ScrollReveal>
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
                    </ScrollReveal>

                    {/* Option 1: SIZE SELECTION */}
                    <ScrollReveal delay={0.1}>
                        <div className="space-y-4">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#6B5E59] block">Size Selection</span>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {(["small", "medium", "large"] as const).map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => setCustomSize(size)}
                                        className={`
                                            py-4.5 rounded-lg text-xs font-bold transition-all border text-center flex flex-col justify-center gap-1 shadow-sm hover:scale-[1.01] duration-200
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
                    </ScrollReveal>

                    {/* Option 2: MILK ALTERNATIVES */}
                    <ScrollReveal delay={0.2}>
                        <div className="space-y-4">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#6B5E59] block">Milk Alternatives</span>
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                                {(["whole", "oat", "almond", "coconut"] as const).map((milk) => (
                                    <button
                                        key={milk}
                                        onClick={() => setCustomMilk(milk)}
                                        className={`
                                            py-4 px-4 rounded-lg text-xs font-bold transition-all border flex items-center justify-center gap-2 shadow-sm hover:scale-[1.01] duration-200
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
                    </ScrollReveal>

                    {/* Option 3: ADD-ONS */}
                    <ScrollReveal delay={0.3}>
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
                                                py-3 px-5 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 shadow-sm hover:scale-[1.02] duration-200
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
                    </ScrollReveal>

                    {/* Option 4: SPECIAL INSTRUCTIONS */}
                    <ScrollReveal delay={0.4}>
                        <div className="space-y-4">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-[#6B5E59] block">Special Instructions</label>
                            <textarea
                                placeholder="Any specific preferences?"
                                value={customInstructions}
                                onChange={(e) => setCustomInstructions(e.target.value)}
                                className="w-full px-5 py-4 rounded-lg border border-[#2C1A14]/15 bg-white text-[#2C1A14] focus:outline-none focus:ring-2 focus:ring-[#C07C4A]/30 text-xs resize-none h-24 leading-relaxed"
                            />
                        </div>
                    </ScrollReveal>

                    {/* Bottom Add to Cart triggers */}
                    <ScrollReveal delay={0.5}>
                        <div className="space-y-3 pt-8 border-t border-[#2C1A14]/10">
                            <button
                                onClick={handleAddCustomizedToCart}
                                className="w-full py-4.5 rounded-lg bg-[#2A120C] hover:bg-[#4A241A] text-white text-xs font-bold tracking-wide transition-all shadow-md shadow-[#2A120C]/25 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
                            >
                                <ShoppingBag className="w-4 h-4 text-[#C07C4A]" />
                                <span>Add to Cart — ${currentPrice.toFixed(2)}</span>
                            </button>
                            <p className="text-[10px] text-center text-[#6B5E59] font-semibold tracking-wide">
                                Earn {Math.round(currentPrice * 10)} Rewards Points with this purchase
                            </p>
                        </div>
                    </ScrollReveal>

                </div>
            </section>

            {/* Footer Section */}
            <Footer theme="light" />

            {/* Shopping Cart Drawer */}
            <CartDrawer theme="light" />
        </div>
    );
}
