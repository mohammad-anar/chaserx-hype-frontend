"use client";

import React, { createContext, useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { Check } from "lucide-react";
import { CustomCartItem } from "@/types/menu";
import { 
    useGetCartQuery, 
    useAddToCartMutation, 
    useUpdateCartItemMutation, 
    useRemoveCartItemMutation, 
    useClearCartMutation 
} from "@/redux/features/cart/cartApi";
import { useAppSelector } from "@/redux/hooks";
import { selectIsAuthenticated } from "@/redux/features/auth/authSlice";

interface CartContextType {
    cart: CustomCartItem[];
    isCartOpen: boolean;
    setIsCartOpen: (open: boolean) => void;
    notification: string | null;
    showNotification: (msg: string) => void;
    addToCart: (item: CustomCartItem) => Promise<void> | void;
    updateQuantity: (itemId: string, delta: number) => Promise<void> | void;
    removeFromCart: (itemId: string) => Promise<void> | void;
    clearCart: () => Promise<void> | void;
    handleCheckout: () => void;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

const getProductImg = (item: any) => {
    if (!item) return "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=500";
    let imgStr = "";
    if (Array.isArray(item?.image) && item?.image?.length > 0) {
        imgStr = item?.image?.[0] || "";
    } else if (typeof item?.image === "string" && item?.image) {
        imgStr = item?.image;
    }
    if (!imgStr) return "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=500";
    if (imgStr.startsWith("http://") || imgStr.startsWith("https://")) return imgStr;
    const baseUrl = process.env.NEXT_PUBLIC_BASEURL || "http://localhost:5000";
    return `${baseUrl}${imgStr.startsWith("/") ? "" : "/"}${imgStr}`;
};

export function CartProvider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    
    // RTK Query Cart Hooks
    const { data: serverCartData, refetch: refetchCart } = useGetCartQuery(undefined, { skip: !isAuthenticated });
    const [addToCartApi] = useAddToCartMutation();
    const [updateCartItemApi] = useUpdateCartItemMutation();
    const [removeCartItemApi] = useRemoveCartItemMutation();
    const [clearCartApi] = useClearCartMutation();

    const [cart, setCart] = useState<CustomCartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [notification, setNotification] = useState<string | null>(null);

    // Sync server cart data if user is logged in
    useEffect(() => {
        if (isAuthenticated) {
            if (serverCartData?.data?.cartItems) {
                const mappedItems: CustomCartItem[] = serverCartData.data.cartItems.map((ci: any) => {
                    const prod = ci?.coinProduct?.product || ci?.product;
                    const image = getProductImg(prod);
                    const prodName = ci?.coinProduct?.product?.name || ci?.coinProduct?.name || ci?.product?.name || "Product";
                    const prodDesc = ci?.coinProduct?.product?.description || ci?.product?.description || "";
                    const basePrice = ci?.isCoinProduct ? 0 : Number(ci?.product?.basePrice || 0);
                    const finalPrice = ci?.isCoinProduct ? 0 : Number(ci?.totalPrice || (basePrice * (ci?.quantity || 1)));

                    return {
                        id: ci?.id, // server cartItem id
                        item: {
                            id: ci?.productId || ci?.coinProductId || ci?.id,
                            name: prodName,
                            image: image,
                            category: (typeof ci?.product?.category === "object" ? ci?.product?.category?.name?.toLowerCase() : ci?.product?.category) || "espresso",
                            price: basePrice,
                            description: prodDesc,
                        },
                        quantity: Number(ci?.quantity || 1),
                        size: ci?.selectedSize?.name?.toLowerCase() || "medium",
                        milk: ci?.selectedMild?.name?.toLowerCase() || "whole",
                        addons: Array.isArray(ci?.cartItemExtras) ? ci.cartItemExtras.map((e: any) => e.productExtra?.name || "Extra") : [],
                        instructions: ci?.isCoinProduct ? "Redeemed with Points" : "",
                        finalPrice: finalPrice,
                        isReward: Boolean(ci?.isCoinProduct),
                        rewardPointsCost: ci?.coinProduct?.needPoint || 0,
                    };
                });
                setCart(mappedItems);
            } else if (serverCartData?.data && Array.isArray(serverCartData.data.cartItems) && serverCartData.data.cartItems.length === 0) {
                setCart([]);
            }
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

    // Save cart to sessionStorage whenever it changes locally
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

    const addToCart = async (newItem: CustomCartItem) => {
        if (isAuthenticated) {
            try {
                await addToCartApi({
                    productId: newItem.isReward ? undefined : (newItem.item.id || undefined),
                    coinProductId: newItem.isReward ? (newItem.item.id || undefined) : undefined,
                    isCoinProduct: Boolean(newItem.isReward),
                    quantity: newItem.quantity || 1,
                }).unwrap();
                refetchCart();
            } catch (err: any) {
                console.error("Cart add error:", err);
                const msg = err?.data?.message || err?.message || "Failed to add item to cart.";
                showNotification(msg);
                return;
            }
        } else {
            const existingIndex = cart.findIndex(i => 
                i.item.id === newItem.item.id && 
                i.size === newItem.size && 
                i.milk === newItem.milk
            );

            if (existingIndex > -1) {
                const updated = [...cart];
                updated[existingIndex].quantity += newItem.quantity;
                saveCart(updated);
            } else {
                saveCart([...cart, newItem]);
            }
        }
        showNotification(`Added ${newItem.item.name} to Cart`);
    };

    const updateQuantity = async (itemId: string, delta: number) => {
        const targetItem = cart.find(i => i.id === itemId);
        if (!targetItem) return;

        const newQty = targetItem.quantity + delta;

        if (isAuthenticated) {
            try {
                if (newQty > 0) {
                    await updateCartItemApi({ cartItemId: itemId, quantity: newQty }).unwrap();
                } else {
                    await removeCartItemApi(itemId).unwrap();
                }
                refetchCart();
            } catch (err: any) {
                console.error("Cart update error:", err);
                const msg = err?.data?.message || err?.message || "Failed to update item quantity.";
                showNotification(msg);
            }
        } else {
            const updated = cart.map(i => {
                if (i.id === itemId) {
                    return newQty > 0 ? { ...i, quantity: newQty } : null;
                }
                return i;
            }).filter(Boolean) as CustomCartItem[];
            saveCart(updated);
        }
    };

    const removeFromCart = async (itemId: string) => {
        const itemToRemove = cart.find(i => i.id === itemId);
        const name = itemToRemove ? itemToRemove.item.name : "Item";

        if (isAuthenticated) {
            try {
                await removeCartItemApi(itemId).unwrap();
                refetchCart();
            } catch (err: any) {
                console.error("Cart remove error:", err);
                const msg = err?.data?.message || err?.message || "Failed to remove item from cart.";
                showNotification(msg);
            }
        } else {
            const updated = cart.filter(i => i.id !== itemId);
            saveCart(updated);
        }
        showNotification(`Removed ${name} from Cart`);
    };

    const clearCart = async () => {
        if (isAuthenticated) {
            try {
                await clearCartApi({}).unwrap();
                refetchCart();
            } catch (err: any) {
                console.error("Cart clear error:", err);
            }
        }
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
