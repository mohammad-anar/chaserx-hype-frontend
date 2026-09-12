"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Coffee,
  Flame,
  Snowflake,
  RefreshCw,
  ArrowRight,
  Plus,
  Check,
  RotateCcw,
  SlidersHorizontal,
  ChevronRight,
  Compass,
} from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useAddToCartMutation } from "@/redux/features/cart/cartApi";
import { useGetMoodRecommendationMutation } from "@/redux/features/ai/aiApi";
import { useAppSelector } from "@/redux/hooks";
import { selectIsAuthenticated } from "@/redux/features/auth/authSlice";
import {
  MoodType,
  MoodOption,
  RecommendedProductItem,
  MoodRecommendationData,
} from "@/types/ai";
import { CustomCartItem } from "@/types/menu";
import ScrollReveal from "@/components/ScrollReveal";

const MOOD_OPTIONS: MoodOption[] = [
  {
    id: "happy",
    label: "Happy",
    emoji: "😊",
    description: "Vibrant & sweet flavor notes to match your sunny mood.",
    tagline: "Celebrate the good vibes",
  },
  {
    id: "relaxed",
    label: "Relaxed",
    emoji: "😌",
    description: "Smooth, velvety drinks for a peaceful mindful moment.",
    tagline: "Unwind & take it slow",
  },
  {
    id: "stressed",
    label: "Stressed",
    emoji: "😫",
    description: "Calming comfort sips crafted to melt away tension.",
    tagline: "A warm soothing reset",
  },
  {
    id: "tired",
    label: "Tired",
    emoji: "😴",
    description: "Smooth, invigorating boosts to gently wake up your senses.",
    tagline: "Recharge your spirit",
  },
  {
    id: "energetic",
    label: "Energetic",
    emoji: "⚡",
    description: "Bold roasts with lively kicks to power your momentum.",
    tagline: "High-voltage fuel",
  },
  {
    id: "focused",
    label: "Focused",
    emoji: "🎯",
    description: "Clean, rich espresso profiles designed for deep work.",
    tagline: "Zero distraction clarity",
  },
];

export default function MoodRecommendationSection() {
  const router = useRouter();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const { addToCart, showNotification } = useCart();
  const [addToCartApi] = useAddToCartMutation();

  const [selectedMood, setSelectedMood] = useState<MoodType>("relaxed");
  const [inputText, setInputText] = useState("");
  const [temperature, setTemperature] = useState<"BOTH" | "HOT" | "COLD">("BOTH");
  const [sweetnessPref, setSweetnessPref] = useState<"low" | "medium" | "high" | undefined>(undefined);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [addedItemIds, setAddedItemIds] = useState<Record<string, boolean>>({});

  const [
    getMoodRecommendation,
    { data: aiResponse, isLoading, isError, error, reset: resetAi },
  ] = useGetMoodRecommendationMutation();

  const [recommendationResult, setRecommendationResult] =
    useState<MoodRecommendationData | null>(null);

  const parsePrice = (val: any): number => {
    const num = parseFloat(val);
    return isNaN(num) ? 5.5 : num;
  };

  const getProductImg = (item: any) => {
    if (!item)
      return "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=500";
    let imgStr = "";
    if (Array.isArray(item?.image) && item?.image?.length > 0) {
      imgStr = item?.image?.[0] || "";
    } else if (typeof item?.image === "string" && item?.image) {
      imgStr = item?.image;
    }
    if (!imgStr)
      return "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=500";
    if (imgStr?.startsWith("http://") || imgStr?.startsWith("https://"))
      return imgStr;
    const baseUrl = process.env.NEXT_PUBLIC_BASEURL || "http://localhost:5000";
    return `${baseUrl}${imgStr?.startsWith("/") ? "" : "/"}${imgStr}`;
  };

  const handleGetRecommendations = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isLoading) return;

    try {
      const response = await getMoodRecommendation({
        mood: selectedMood,
        inputText: inputText.trim() || undefined,
        preferences: {
          temperature,
          sweet: sweetnessPref,
        },
      }).unwrap();

      if (response?.data) {
        setRecommendationResult(response.data);
      }
    } catch (err: any) {
      console.warn("AI Recommendation Error:", err);
    }
  };

  const handleReset = () => {
    setRecommendationResult(null);
    resetAi();
  };

  const handleAddToCartClick = async (item: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    const productId = item?.id;
    if (!productId) return;

    // Show temporary check state
    setAddedItemIds((prev) => ({ ...prev, [productId]: true }));
    setTimeout(() => {
      setAddedItemIds((prev) => ({ ...prev, [productId]: false }));
    }, 2000);

    // Sync with backend cart if authenticated
    if (isAuthenticated) {
      try {
        await addToCartApi({
          productId,
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
      id: `${productId}-${Date.now()}`,
      item: {
        id: productId,
        name: item?.name || "Handcrafted Coffee",
        price: priceVal,
        image: itemImg,
        category:
          typeof item?.category === "object"
            ? item?.category?.name?.toLowerCase()
            : item?.category || "espresso",
        description: item?.description || "",
      },
      quantity: 1,
      size: "small",
      milk: "whole",
      addons: [],
      instructions: "",
      finalPrice: priceVal,
    };

    addToCart(newCartItem);
  };

  return (
    <section
      id="mood-ordering"
      className="bg-[#0D0705] text-[#FAF6F0] py-20 relative z-30 border-y border-white/10 overflow-hidden"
    >
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#E05A2B]/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <ScrollReveal>
          <div className="text-center space-y-3 max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E05A2B]/15 border border-[#E05A2B]/30 text-[#E05A2B] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Sensory Sommelier</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
              Find a Drink for Your Mood
            </h2>
            <p className="text-sm sm:text-base text-[#C4B4A5] leading-relaxed">
              Tell our AI barista how you&apos;re feeling today, and we&apos;ll match you
              with handcrafted drinks dialed to your exact vibe.
            </p>
          </div>
        </ScrollReveal>

        {/* Dynamic State: Input Form vs Results */}
        {!recommendationResult ? (
          <ScrollReveal delay={0.1}>
            <div className="max-w-4xl mx-auto bg-[#1A0E0A]/90 border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-md">
              <form onSubmit={handleGetRecommendations} className="space-y-8">
                {/* Step 1: Quick Mood Pill Grid */}
                <div className="space-y-3 text-left">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#E05A2B] flex items-center gap-2">
                    <span>1. Select your current mood</span>
                  </label>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {MOOD_OPTIONS.map((mood) => {
                      const isSelected = selectedMood === mood.id;
                      return (
                        <button
                          key={mood.id}
                          type="button"
                          onClick={() => setSelectedMood(mood.id)}
                          className={`group flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 cursor-pointer text-center relative ${
                            isSelected
                              ? "bg-[#E05A2B] border-[#E05A2B] text-[#080403] shadow-lg shadow-[#E05A2B]/20 scale-105 font-bold"
                              : "bg-[#251410] border-white/5 text-[#EAD8C7] hover:border-[#E05A2B]/40 hover:bg-[#2C1711]"
                          }`}
                        >
                          <span className="text-2xl sm:text-3xl mb-1.5 transform transition-transform group-hover:scale-125">
                            {mood.emoji}
                          </span>
                          <span className="text-xs tracking-wide">
                            {mood.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Step 2: Optional Natural-Language Feelings Textarea */}
                <div className="space-y-2 text-left">
                  <div className="flex justify-between items-center">
                    <label
                      htmlFor="mood-text-input"
                      className="text-xs font-bold uppercase tracking-widest text-[#E05A2B]"
                    >
                      2. Tell us more (Optional)
                    </label>
                    <span className="text-[11px] text-[#A69385]">
                      Natural language enabled
                    </span>
                  </div>

                  <div className="relative">
                    <textarea
                      id="mood-text-input"
                      rows={2}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="e.g. I have a big presentation in an hour, need high focus and something iced with oat milk..."
                      className="w-full bg-[#120805] border border-white/10 rounded-2xl px-4 py-3.5 text-sm text-[#FAF6F0] placeholder-[#6E5D53] focus:outline-none focus:border-[#E05A2B] focus:ring-1 focus:ring-[#E05A2B] transition-all resize-none"
                    />
                  </div>
                </div>

                {/* Advanced Sensory Toggles (Expandable) */}
                <div className="space-y-4 pt-2 border-t border-white/5 text-left">
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-[#C4B4A5] hover:text-white transition-colors cursor-pointer"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-[#E05A2B]" />
                    <span>
                      {showAdvanced
                        ? "Hide Temperature & Taste Preferences"
                        : "Fine-tune Temperature & Sweetness"}
                    </span>
                  </button>

                  {showAdvanced && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[#140A07] border border-white/5 animate-in fade-in duration-300">
                      {/* Temperature */}
                      <div className="space-y-2">
                        <span className="text-xs font-medium text-[#A69385]">
                          Serving Temperature:
                        </span>
                        <div className="flex gap-2">
                          {(["BOTH", "HOT", "COLD"] as const).map((temp) => (
                            <button
                              key={temp}
                              type="button"
                              onClick={() => setTemperature(temp)}
                              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                                temperature === temp
                                  ? "bg-[#E05A2B] text-[#080403]"
                                  : "bg-[#251410] text-[#C4B4A5] hover:text-white"
                              }`}
                            >
                              {temp === "BOTH"
                                ? "Any ☕❄️"
                                : temp === "HOT"
                                ? "Hot ☕"
                                : "Iced ❄️"}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Sweetness */}
                      <div className="space-y-2">
                        <span className="text-xs font-medium text-[#A69385]">
                          Sweetness Preference:
                        </span>
                        <div className="flex gap-2">
                          {[
                            { val: undefined, label: "Any" },
                            { val: "low" as const, label: "Low" },
                            { val: "medium" as const, label: "Med" },
                            { val: "high" as const, label: "Sweet" },
                          ].map((item) => (
                            <button
                              key={item.label}
                              type="button"
                              onClick={() => setSweetnessPref(item.val)}
                              className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all ${
                                sweetnessPref === item.val
                                  ? "bg-[#E05A2B] text-[#080403]"
                                  : "bg-[#251410] text-[#C4B4A5] hover:text-white"
                              }`}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit CTA Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 px-8 rounded-2xl bg-[#E05A2B] hover:bg-[#F26A3B] text-[#080403] text-sm font-bold uppercase tracking-widest transition-all duration-300 shadow-xl shadow-[#E05A2B]/25 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>Brewing AI Recommendations...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        <span>Find My Perfect Drink</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </ScrollReveal>
        ) : (
          /* Recommendation Results Section */
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Results Action Bar */}
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-[#1A0E0A] border border-white/10">
              <div className="flex items-center gap-3 text-left">
                <div className="w-10 h-10 rounded-xl bg-[#E05A2B]/20 text-[#E05A2B] flex items-center justify-center font-bold text-xl">
                  {MOOD_OPTIONS.find((m) => m.id === selectedMood)?.emoji || "☕"}
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                    <span>Recommendations for &ldquo;{selectedMood.toUpperCase()}&rdquo;</span>
                  </h3>
                  <p className="text-xs text-[#C4B4A5]">
                    {recommendationResult.moodSummary ||
                      "Curated by Bean Fien's AI sensory matching engine."}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#251410] hover:bg-[#341B15] text-[#FAF6F0] text-xs font-bold uppercase tracking-wider transition-all border border-white/10 hover:border-[#E05A2B]/40 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#E05A2B]" />
                <span>Try Another Mood</span>
              </button>
            </div>

            {/* Recommended Product Cards Grid */}
            {recommendationResult.recommendations?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {recommendationResult.recommendations.map(
                  (recItem: RecommendedProductItem, idx: number) => {
                    const product = recItem.product;
                    const priceVal = parsePrice(product?.basePrice ?? product?.price);
                    const isAdded = addedItemIds[product?.id];

                    return (
                      <div
                        key={product?.id || idx}
                        className="bg-[#1A0E0A] rounded-2xl overflow-hidden border border-white/10 shadow-lg hover:shadow-2xl hover:border-[#E05A2B]/40 transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1.5 p-5"
                      >
                        <div>
                          {/* Image Container with Badge */}
                          <div
                            onClick={() => router.push(`/menu/${product?.id}`)}
                            className="h-60 sm:h-64 rounded-xl overflow-hidden relative cursor-pointer"
                          >
                            <img
                              src={getProductImg(product)}
                              alt={product?.name}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            {/* AI Match Badge */}
                            <div className="absolute top-3 left-3 bg-[#080403]/85 backdrop-blur-md border border-[#E05A2B]/40 text-[#E05A2B] px-3 py-1 rounded-full text-[11px] font-extrabold flex items-center gap-1.5 shadow-md">
                              <Sparkles className="w-3 h-3" />
                              <span>{recItem.score ? `${recItem.score}/10 Match` : "Recommended"}</span>
                            </div>

                            {product?.temperatureType && (
                              <div className="absolute top-3 right-3 bg-[#080403]/85 backdrop-blur-md border border-white/10 text-white px-2.5 py-1 rounded-full text-[10px] font-bold">
                                {product.temperatureType === "COLD" ? "❄️ Iced" : "☕ Hot"}
                              </div>
                            )}
                          </div>

                          {/* Product Details & AI Reason */}
                          <div className="pt-5 space-y-3 text-left">
                            <div className="flex justify-between items-start gap-2">
                              <h4
                                onClick={() => router.push(`/menu/${product?.id}`)}
                                className="font-serif text-xl font-bold text-white group-hover:text-[#E05A2B] transition-colors cursor-pointer line-clamp-1"
                              >
                                {product?.name}
                              </h4>
                              <span className="text-lg font-bold text-[#E05A2B] whitespace-nowrap">
                                ${priceVal.toFixed(2)}
                              </span>
                            </div>

                            {/* Sensory Reasoning Box */}
                            <div className="p-3 rounded-xl bg-[#120805] border border-white/5 space-y-1">
                              <p className="text-[11px] font-bold uppercase tracking-wider text-[#E05A2B] flex items-center gap-1">
                                <Sparkles className="w-3 h-3" /> Why It Fits:
                              </p>
                              <p className="text-xs text-[#C4B4A5] leading-relaxed italic">
                                &ldquo;{recItem.reason}&rdquo;
                              </p>
                            </div>

                            {product?.description && (
                              <p className="text-xs text-[#8E7E73] line-clamp-2 leading-relaxed">
                                {product.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-5 flex items-center gap-3">
                          <button
                            type="button"
                            onClick={(e) => handleAddToCartClick(product, e)}
                            className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                              isAdded
                                ? "bg-[#22C55E] text-white"
                                : "bg-[#E05A2B] hover:bg-[#F26A3B] text-[#080403] hover:scale-[1.01]"
                            }`}
                          >
                            {isAdded ? (
                              <>
                                <Check className="w-4 h-4" />
                                <span>Added</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-4 h-4" />
                                <span>Add to Cart</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => router.push(`/menu/${product?.id}`)}
                            aria-label="View drink details"
                            className="p-3 rounded-xl bg-[#251410] hover:bg-[#341B15] text-[#C4B4A5] hover:text-white transition-colors border border-white/10 cursor-pointer"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            ) : (
              /* No Results State */
              <div className="p-12 rounded-3xl bg-[#1A0E0A] border border-white/10 text-center space-y-4 max-w-lg mx-auto">
                <Compass className="w-12 h-12 text-[#E05A2B] mx-auto opacity-70" />
                <h4 className="font-serif text-xl font-bold text-white">
                  We couldn&apos;t find an exact match
                </h4>
                <p className="text-xs text-[#A69385] leading-relaxed">
                  Try adjusting your flavor preferences or explore our complete handcrafted coffee catalogue.
                </p>
                <div className="pt-2 flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-5 py-2.5 rounded-xl bg-[#251410] hover:bg-[#341B15] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Adjust Mood
                  </button>
                  <Link
                    href="/menu"
                    className="px-5 py-2.5 rounded-xl bg-[#E05A2B] hover:bg-[#F26A3B] text-[#080403] text-xs font-bold uppercase tracking-wider transition-colors"
                  >
                    Browse Full Menu
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error Notification Banner if API failed */}
        {isError && !recommendationResult && (
          <div className="max-w-md mx-auto mt-6 p-4 rounded-2xl bg-[#2D1616] border border-[#4A2020] text-center space-y-2">
            <p className="text-xs font-semibold text-[#FCA5A5]">
              Sorry, we couldn&apos;t generate mood recommendations right now.
            </p>
            <button
              type="button"
              onClick={handleGetRecommendations}
              className="px-4 py-1.5 rounded-lg bg-[#E05A2B] hover:bg-[#F26A3B] text-[#080403] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
