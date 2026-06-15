"use client";

import React from "react";
import Link from "next/link";
import { ShoppingCart, X, Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/hooks/useCart";

interface CartDrawerProps {
    theme?: "dark" | "light";
}

export default function CartDrawer({ theme = "light" }: CartDrawerProps) {
    const { 
        cart, 
        isCartOpen, 
        setIsCartOpen, 
        updateQuantity, 
        removeFromCart, 
        handleCheckout 
    } = useCart();

    const isDark = theme === "dark";

    const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartSubtotal = cart.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0);

    if (!isCartOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div 
                onClick={() => setIsCartOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" 
            />

            <div className="relative w-full max-w-md bg-[#1E0F0B] h-full shadow-2xl p-6 flex flex-col justify-between border-l border-white/10 animate-slide-in-right">
                {/* Header */}
                <div className="flex justify-between items-center pb-5 border-b border-white/5">
                    <div className="flex items-center gap-2">
                        <ShoppingCart className={`w-5 h-5 ${isDark ? "text-[#E05A2B]" : "text-[#C07C4A]"}`} />
                        <h3 className="font-serif text-lg font-bold text-white">Your Cart ({totalCartItems})</h3>
                    </div>
                    <button 
                        onClick={() => setIsCartOpen(false)}
                        className="p-1.5 rounded-full hover:bg-white/5 text-white/70 hover:text-white transition-colors"
                        aria-label="Close cart"
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
                                className="flex gap-4 bg-[#140A07] p-3.5 rounded-2xl border border-white/5 text-left items-center justify-between animate-fadeIn"
                            >
                                <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#24130F] flex-shrink-0">
                                    <img 
                                        src={cartItem.item.image} 
                                        alt={cartItem.item.name} 
                                        className="w-full h-full object-cover" 
                                    />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <h4 className="text-xs font-bold text-white truncate max-w-[130px]">
                                        {cartItem.item.name}
                                    </h4>
                                    
                                    {cartItem.isReward ? (
                                        <p className={`text-[10px] font-semibold leading-none ${isDark ? "text-[#E05A2B]" : "text-[#C07C4A]"}`}>
                                            Redeemed for {cartItem.rewardPointsCost} PTS
                                        </p>
                                    ) : cartItem.isGiftCard ? (
                                        <p className="text-[10px] text-white/50 leading-none">
                                            Gift Card Recipient: {cartItem.instructions.replace("Recipient: ", "").split(".")[0]}
                                        </p>
                                    ) : (
                                        <p className="text-[10px] text-white/50 leading-none">
                                            Size: <span className="capitalize">{cartItem.size}</span> | Milk: <span className="capitalize">{cartItem.milk}</span>
                                        </p>
                                    )}

                                    {cartItem.addons.length > 0 && (
                                        <p className={`text-[9px] truncate max-w-[150px] ${isDark ? "text-[#E05A2B]" : "text-[#C07C4A]"}`}>
                                            + {cartItem.addons.join(", ")}
                                        </p>
                                    )}
                                    <p className={`text-xs font-bold ${isDark ? "text-[#E05A2B]" : "text-[#C07C4A]"}`}>
                                        {cartItem.finalPrice === 0 ? "FREE" : `$${cartItem.finalPrice.toFixed(2)}`}
                                    </p>
                                    
                                    {/* Quantity Adjuster */}
                                    <div className="flex items-center gap-2.5 pt-1">
                                        <button 
                                            onClick={() => updateQuantity(cartItem.id, -1)}
                                            className="w-5 h-5 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors text-white"
                                            aria-label="Decrease quantity"
                                        >
                                            <Minus className="w-3 h-3" />
                                        </button>
                                        <span className="text-xs font-bold text-white">{cartItem.quantity}</span>
                                        <button 
                                            onClick={() => updateQuantity(cartItem.id, 1)}
                                            className="w-5 h-5 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors text-white"
                                            aria-label="Increase quantity"
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
                                className={`text-xs font-bold hover:underline ${isDark ? "text-[#E05A2B]" : "text-[#C07C4A]"}`}
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
                                ? isDark
                                    ? "bg-[#E05A2B] text-[#080403] hover:scale-[1.02] cursor-pointer shadow-lg shadow-[#E05A2B]/10"
                                    : "bg-[#C07C4A] text-[#140A07] hover:scale-[1.02] cursor-pointer shadow-lg shadow-[#C07C4A]/10" 
                                : "bg-white/5 text-white/30 cursor-not-allowed border border-white/5"
                            }
                        `}
                    >
                        Checkout & Buy
                    </button>
                </div>
            </div>
        </div>
    );
}
