"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Check } from "lucide-react";
import { CustomCartItem } from "@/types/menu";
import { useGetCartQuery } from "@/redux/features/cart/cartApi";
import { useAppSelector } from "@/redux/hooks";
import { selectIsAuthenticated } from "@/redux/features/auth/authSlice";

interface CartContextType {
    cart: CustomCartItem[];
    isCartOpen: boolean;
    setIsCartOpen: (open: boolean) => void;
    notification: string | null;
    showNotification: (msg: string) => void;
    addToCart: (item: CustomCartItem) => void;
    updateQuantity: (itemId: string, delta: number) => void;
    removeFromCart: (itemId: string) => void;
    clearCart: () => void;
    handleCheckout: () => void;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const { data: serverCartData } = useGetCartQuery(undefined, { skip: !isAuthenticated });

    const [cart, setCart] = useState<CustomCartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [notification, setNotification] = useState<string | null>(null);

    // Sync server cart data if user is logged in
    useEffect(() => {
        if (isAuthenticated && serverCartData?.data?.cartItems) {
            const mappedItems: CustomCartItem[] = serverCartData.data.cartItems.map((ci: any) => {
                const rawImg = ci?.coinProduct?.product?.image || ci?.product?.image || "";
                const baseUrl = process.env.NEXT_PUBLIC_BASEURL || "http://localhost:5000";
                const image = `${baseUrl}${rawImg}`

                return {
                    id: ci?.id,
                    item: {
                        id: ci?.productId || ci?.coinProductId || ci?.id,
                        name: ci?.coinProduct?.product?.name || ci?.product?.name || "Product",
                        image: image,
                        category: "Coffee",
                        price: ci?.isCoinProduct ? 0 : Number(ci?.product?.basePrice || 0),
                        description: ci?.product?.description || ""
                    },
                    quantity: ci?.quantity || 1,
                    size: "medium",
                    milk: "whole",
                    addons: [],
                    instructions: ci?.isCoinProduct ? "Redeemed with Points" : "",
                    finalPrice: ci?.isCoinProduct ? 0 : Number(ci?.totalPrice || 0),
                    isReward: Boolean(ci?.isCoinProduct),
                    rewardPointsCost: ci?.coinProduct?.needPoint || 0
                };
            });
            setCart(mappedItems);
        }
    }, [isAuthenticated, serverCartData]);

    // Load cart from sessionStorage on mount if unauthenticated
    useEffect(() => {
        if (!isAuthenticated) {
            const savedCart = sessionStorage.getItem("bf_cart_custom");
            if (savedCart) {
                try {
                    const parsedCart = JSON.parse(savedCart);
                    setTimeout(() => {
                        setCart(parsedCart);
                    }, 0);
                } catch (e) {
                    console.error("Failed to parse cart", e);
                }
            }
        }
    }, [isAuthenticated]);

    // Save cart to sessionStorage whenever it changes
    const saveCart = (newCart: CustomCartItem[]) => {
        setCart(newCart);
        if (typeof window !== "undefined") {
            sessionStorage.setItem("bf_cart_custom", JSON.stringify(newCart));
        }
    };

    const showNotification = (msg: string) => {
        setNotification(msg);
        setTimeout(() => {
            setNotification(null);
        }, 3000);
    };

    const addToCart = (newItem: CustomCartItem) => {
        const existingIndex = cart.findIndex(i => i.id === newItem.id);

        if (existingIndex > -1) {
            const updated = [...cart];
            updated[existingIndex].quantity += newItem.quantity;
            saveCart(updated);
        } else {
            saveCart([...cart, newItem]);
        }
        showNotification(`Added ${newItem.item.name} to Cart`);
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
        const itemToRemove = cart.find(i => i.id === itemId);
        const name = itemToRemove ? itemToRemove.item.name : "Item";
        const updated = cart.filter(i => i.id !== itemId);
        saveCart(updated);
        showNotification(`Removed ${name} from Cart`);
    };

    const clearCart = () => {
        saveCart([]);
    };

    const handleCheckout = () => {
        if (cart.length === 0) return;
        showNotification("Checkout successful! Your coffee is brewing.");
        clearCart();
        setIsCartOpen(false);
    };

    const isHomepage = pathname === "/";

    return (
        <CartContext.Provider value={{
            cart,
            isCartOpen,
            setIsCartOpen,
            notification,
            showNotification,
            addToCart,
            updateQuantity,
            removeFromCart,
            clearCart,
            handleCheckout
        }}>
            {children}

            {/* Global Notification Toast */}
            {notification && (
                <div
                    className={`fixed bottom-5 right-5 z-50 font-bold px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce border border-white/20 transition-all duration-300 ${isHomepage
                        ? "bg-[#E05A2B] text-[#080403]"
                        : "bg-[#C07C4A] text-[#140A07]"
                        }`}
                >
                    <Check className="w-4 h-4" />
                    <span>{notification}</span>
                </div>
            )}
        </CartContext.Provider>
    );
}
