"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, X, Minus, Plus, Trash2, ArrowLeft, MapPin } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useCheckoutMutation } from "@/redux/features/order/orderApi";
import { useGetMyAddressesQuery } from "@/redux/features/address/addressApi";
import { useAppSelector } from "@/redux/hooks";
import { selectIsAuthenticated, selectUser } from "@/redux/features/auth/authSlice";

interface CartDrawerProps {
    theme?: "dark" | "light";
}

export default function CartDrawer({ theme = "light" }: CartDrawerProps) {
    const router = useRouter();
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const user = useAppSelector(selectUser);
    const { data: myAddressesData } = useGetMyAddressesQuery(undefined, { skip: !isAuthenticated });
    const [checkoutApi, { isLoading: isCheckingOut }] = useCheckoutMutation();

    const { 
        cart, 
        isCartOpen, 
        setIsCartOpen, 
        updateQuantity, 
        removeFromCart, 
        clearCart,
        showNotification 
    } = useCart();

    const isDark = theme === "dark";

    // Step state: "cart" -> "shipping"
    const [step, setStep] = useState<"cart" | "shipping">("cart");

    // Shipping Address Form state matching ShippingAddress model fields
    const [addressForm, setAddressForm] = useState({
        fullName: "",
        street1: "",
        state: "",
        city: "",
        country: "United States",
        postalCode: "",
        phone: "",
        note: ""
    });

    // Pre-fill address form from Redux user & my-addresses API
    useEffect(() => {
        if (isAuthenticated) {
            const savedAddress = Array.isArray(myAddressesData?.data) ? myAddressesData?.data?.[0] : myAddressesData?.data;
            setAddressForm(prev => ({
                fullName: prev.fullName || user?.name || user?.fullName || "",
                street1: prev.street1 || savedAddress?.street1 || user?.address || "",
                state: prev.state || savedAddress?.state || "",
                city: prev.city || savedAddress?.city || "",
                country: prev.country || savedAddress?.country || "United States",
                postalCode: prev.postalCode || savedAddress?.postalCode || "",
                phone: prev.phone || user?.phone || "",
                note: prev.note || ""
            }));
        }
    }, [isAuthenticated, user, myAddressesData]);

    const totalCartItems = cart.reduce((sum, item) => sum + (item?.quantity || 0), 0);
    const cartSubtotal = cart.reduce((sum, item) => sum + ((item?.finalPrice || 0) * (item?.quantity || 0)), 0);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setAddressForm(prev => ({ ...prev, [name]: value }));
    };

    // Step 1: Initial click to proceed to shipping address form
    const onProceedToShipping = () => {
        if (cart.length === 0) return;

        if (!isAuthenticated) {
            showNotification("Please sign in to proceed with checkout.");
            setIsCartOpen(false);
            router.push("/auth/login");
            return;
        }

        setStep("shipping");
    };

    // Step 2: Final Checkout Execution with complete Shipping Address model body
    const onFinalCheckoutClick = async (e: React.FormEvent) => {
        e.preventDefault();
        if (cart.length === 0 || isCheckingOut) return;

        const { fullName, street1, state, city, country, postalCode, phone, note } = addressForm;
        if (!street1.trim() || !city.trim() || !country.trim()) {
            showNotification("Please fill in all required shipping address fields (Street Address, City, Country).");
            return;
        }

        const checkoutPayload = {
            payType: "CARD",
            shippingAddress: {
                fullName: fullName.trim() || undefined,
                street1: street1.trim(),
                state: state.trim() || undefined,
                city: city.trim(),
                country: country.trim(),
                postalCode: postalCode.trim() || undefined,
                phone: phone.trim() || undefined
            },
            note: note.trim() || undefined
        };

        try {
            const res = await checkoutApi(checkoutPayload).unwrap();
            const paymentUrl = res?.data?.paymentUrl;

            clearCart();
            setStep("cart");
            setIsCartOpen(false);

            if (paymentUrl) {
                window.location.href = paymentUrl;
            } else {
                showNotification("Order placed successfully!");
                router.push("/rewards");
            }
        } catch (err: any) {
            console.error("Checkout Error:", err);
            const errMsg = err?.data?.message || err?.message || "Checkout failed. Please try again.";
            showNotification(errMsg);
        }
    };

    const handleClose = () => {
        setIsCartOpen(false);
        setStep("cart");
    };

    if (!isCartOpen) return null;

    const isFormValid = 
        addressForm.street1.trim() !== "" &&
        addressForm.city.trim() !== "" &&
        addressForm.country.trim() !== "";

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div 
                onClick={handleClose}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" 
            />

            <div className="relative w-full max-w-md bg-[#1E0F0B] h-full shadow-2xl p-6 flex flex-col justify-between border-l border-white/10 animate-slide-in-right">
                
                {/* Header */}
                <div className="flex justify-between items-center pb-5 border-b border-white/5">
                    {step === "shipping" ? (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setStep("cart")}
                                className="p-1 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                                title="Back to Cart"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <MapPin className={`w-5 h-5 ${isDark ? "text-[#E05A2B]" : "text-[#C07C4A]"}`} />
                            <h3 className="font-serif text-lg font-bold text-white">Shipping Address</h3>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <ShoppingCart className={`w-5 h-5 ${isDark ? "text-[#E05A2B]" : "text-[#C07C4A]"}`} />
                            <h3 className="font-serif text-lg font-bold text-white">Your Cart ({totalCartItems})</h3>
                        </div>
                    )}
                    
                    <button 
                        onClick={handleClose}
                        className="p-1.5 rounded-full hover:bg-white/5 text-white/70 hover:text-white transition-colors"
                        aria-label="Close cart"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* STEP 1: CART ITEMS LIST */}
                {step === "cart" && (
                    <>
                        <div className="flex-1 overflow-y-auto py-5 space-y-4 pr-1">
                            {cart.length > 0 ? (
                                cart.map((cartItem) => (
                                    <div 
                                        key={cartItem?.id}
                                        className="flex gap-4 bg-[#140A07] p-3.5 rounded-2xl border border-white/5 text-left items-center justify-between animate-fadeIn"
                                    >
                                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#24130F] flex-shrink-0">
                                            <img 
                                                src={cartItem?.item?.image} 
                                                alt={cartItem?.item?.name} 
                                                className="w-full h-full object-cover" 
                                            />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <h4 className="text-xs font-bold text-white truncate max-w-[130px]">
                                                {cartItem?.item?.name}
                                            </h4>
                                            
                                            {cartItem?.isReward ? (
                                                <p className={`text-[10px] font-semibold leading-none ${isDark ? "text-[#E05A2B]" : "text-[#C07C4A]"}`}>
                                                    Redeemed for {cartItem?.rewardPointsCost} PTS
                                                </p>
                                            ) : cartItem?.isGiftCard ? (
                                                <p className="text-[10px] text-white/50 leading-none">
                                                    Gift Card Recipient: {cartItem?.instructions?.replace("Recipient: ", "")?.split(".")[0]}
                                                </p>
                                            ) : (
                                                <p className="text-[10px] text-white/50 leading-none">
                                                    Size: <span className="capitalize">{cartItem?.size}</span> | Milk: <span className="capitalize">{cartItem?.milk}</span>
                                                </p>
                                            )}

                                            {cartItem?.addons?.length > 0 && (
                                                <p className={`text-[9px] truncate max-w-[150px] ${isDark ? "text-[#E05A2B]" : "text-[#C07C4A]"}`}>
                                                    + {cartItem?.addons?.join(", ")}
                                                </p>
                                            )}
                                            <p className={`text-xs font-bold ${isDark ? "text-[#E05A2B]" : "text-[#C07C4A]"}`}>
                                                {cartItem?.finalPrice === 0 ? "FREE" : `$${(cartItem?.finalPrice || 0).toFixed(2)}`}
                                            </p>
                                            
                                            {/* Quantity Adjuster */}
                                            <div className="flex items-center gap-2.5 pt-1">
                                                <button 
                                                    onClick={() => updateQuantity(cartItem?.id, -1)}
                                                    className="w-5 h-5 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors text-white"
                                                    aria-label="Decrease quantity"
                                                >
                                                    <Minus className="w-3 h-3" />
                                                </button>
                                                <span className="text-xs font-bold text-white">{cartItem?.quantity}</span>
                                                <button 
                                                    onClick={() => updateQuantity(cartItem?.id, 1)}
                                                    className="w-5 h-5 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors text-white"
                                                    aria-label="Increase quantity"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => removeFromCart(cartItem?.id)}
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
                                        onClick={handleClose}
                                        className={`text-xs font-bold hover:underline ${isDark ? "text-[#E05A2B]" : "text-[#C07C4A]"}`}
                                    >
                                        Browse the Menu
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Footer Summary - Step 1 */}
                        <div className="pt-5 border-t border-white/5 space-y-4">
                            <div className="flex justify-between items-center text-sm font-semibold">
                                <span className="text-white/60">Subtotal</span>
                                <span className="text-white text-base font-bold">${cartSubtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs text-[#6B5E59]">
                                <span>Taxes and delivery fee calculated at checkout</span>
                            </div>
                            <button
                                onClick={onProceedToShipping}
                                disabled={cart.length === 0}
                                className={`
                                    w-full py-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2
                                    ${cart.length > 0
                                        ? isDark
                                            ? "bg-[#E05A2B] text-[#080403] hover:scale-[1.02] cursor-pointer shadow-lg shadow-[#E05A2B]/10"
                                            : "bg-[#C07C4A] text-[#140A07] hover:scale-[1.02] cursor-pointer shadow-lg shadow-[#C07C4A]/10" 
                                        : "bg-white/5 text-white/30 cursor-not-allowed border border-white/5"
                                    }
                                `}
                            >
                                Checkout & Shipping Address
                            </button>
                        </div>
                    </>
                )}

                {/* STEP 2: COMPLETE SHIPPING ADDRESS FORM */}
                {step === "shipping" && (
                    <form onSubmit={onFinalCheckoutClick} className="flex flex-col h-full justify-between pt-4">
                        <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
                            <div className="space-y-1 text-left">
                                <label className="text-[11px] font-bold text-white/70 uppercase tracking-wider block">
                                    Full Name (fullName)
                                </label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={addressForm.fullName}
                                    onChange={handleInputChange}
                                    placeholder="John Doe"
                                    className="w-full bg-[#140A07] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-white/30 focus:border-[#C07C4A] outline-none transition-colors"
                                />
                            </div>

                            <div className="space-y-1 text-left">
                                <label className="text-[11px] font-bold text-white/70 uppercase tracking-wider block">
                                    Street Address (street1) <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="street1"
                                    required
                                    value={addressForm.street1}
                                    onChange={handleInputChange}
                                    placeholder="123 Coffee Bean St, Suite 100"
                                    className="w-full bg-[#140A07] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-white/30 focus:border-[#C07C4A] outline-none transition-colors"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-left">
                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-white/70 uppercase tracking-wider block">
                                        City (city) <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="city"
                                        required
                                        value={addressForm.city}
                                        onChange={handleInputChange}
                                        placeholder="New York"
                                        className="w-full bg-[#140A07] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-white/30 focus:border-[#C07C4A] outline-none transition-colors"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-white/70 uppercase tracking-wider block">
                                        State (state)
                                    </label>
                                    <input
                                        type="text"
                                        name="state"
                                        value={addressForm.state}
                                        onChange={handleInputChange}
                                        placeholder="NY"
                                        className="w-full bg-[#140A07] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-white/30 focus:border-[#C07C4A] outline-none transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-left">
                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-white/70 uppercase tracking-wider block">
                                        Country (country) <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="country"
                                        required
                                        value={addressForm.country}
                                        onChange={handleInputChange}
                                        placeholder="United States"
                                        className="w-full bg-[#140A07] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-white/30 focus:border-[#C07C4A] outline-none transition-colors"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-white/70 uppercase tracking-wider block">
                                        Postal Code (postalCode)
                                    </label>
                                    <input
                                        type="text"
                                        name="postalCode"
                                        value={addressForm.postalCode}
                                        onChange={handleInputChange}
                                        placeholder="10001"
                                        className="w-full bg-[#140A07] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-white/30 focus:border-[#C07C4A] outline-none transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1 text-left">
                                <label className="text-[11px] font-bold text-white/70 uppercase tracking-wider block">
                                    Phone Number (phone)
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={addressForm.phone}
                                    onChange={handleInputChange}
                                    placeholder="+1 (555) 000-0000"
                                    className="w-full bg-[#140A07] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-white/30 focus:border-[#C07C4A] outline-none transition-colors"
                                />
                            </div>
                        </div>

                        {/* Footer Summary - Step 2 */}
                        <div className="pt-4 border-t border-white/5 space-y-3 mt-3">
                            <div className="flex justify-between items-center text-sm font-semibold">
                                <span className="text-white/60">Total Payment</span>
                                <span className="text-white text-base font-bold">${cartSubtotal.toFixed(2)}</span>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setStep("cart")}
                                    className="px-4 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 text-xs font-bold transition-colors"
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={!isFormValid || isCheckingOut}
                                    className={`
                                        flex-1 py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2
                                        ${isFormValid && !isCheckingOut
                                            ? isDark
                                                ? "bg-[#E05A2B] text-[#080403] hover:scale-[1.02] cursor-pointer shadow-lg shadow-[#E05A2B]/10"
                                                : "bg-[#C07C4A] text-[#140A07] hover:scale-[1.02] cursor-pointer shadow-lg shadow-[#C07C4A]/10" 
                                            : "bg-white/5 text-white/30 cursor-not-allowed border border-white/5"
                                        }
                                    `}
                                >
                                    {isCheckingOut ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                                            <span>Processing Checkout...</span>
                                        </>
                                    ) : (
                                        "Checkout & Buy"
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                )}

            </div>
        </div>
    );
}
