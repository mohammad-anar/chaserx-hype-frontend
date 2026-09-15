"use client";
import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import NotificationDropdown from "@/components/NotificationDropdown";
import AdminProfileDropdown from "@/components/AdminProfileDropdown";
import { 
    Plus, 
    Edit2, 
    X, 
    Gift, 
    CheckCircle, 
    Star, 
    Send, 
    Trash2, 
    CreditCard, 
    Image as ImageIcon,
    Loader2,
    RefreshCw,
    DollarSign
} from "lucide-react";
import { 
    useGetCoinProductsQuery, 
    useCreateCoinProductMutation, 
    useUpdateCoinProductMutation, 
    useDeleteCoinProductMutation 
} from "@/redux/features/coinProduct/coinProductApi";
import { useGetProductsQuery } from "@/redux/features/product/productApi";
import {
    useGetAllGiftCardsQuery,
    useAdminAddFundsMutation,
} from "@/redux/features/giftCard/giftCardApi";

interface CardDesign {
    id: string;
    label: string;
    image: string;
}

const initialCardDesigns: CardDesign[] = [
    { id: "D-01", label: "Coffee Beans", image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80" },
    { id: "D-02", label: "Café Scene", image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80" },
    { id: "D-03", label: "Latte Art", image: "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=600&q=80" },
    { id: "D-04", label: "Morning Brew", image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80" }
];

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

export default function Rewards() {
    // Admin Profile Header State
    const [displayName, setDisplayName] = useState("Admin");
    const [roleTitle, setRoleTitle] = useState("Super Admin");
    const [adminPhoto, setAdminPhoto] = useState("");

    useEffect(() => {
        const loadProfile = () => {
            const savedName = localStorage.getItem("bf_admin_name");
            const savedRole = localStorage.getItem("bf_admin_role");
            const savedPhoto = localStorage.getItem("bf_admin_photo");
            if (savedName) setDisplayName(savedName);
            if (savedRole) setRoleTitle(savedRole);
            if (savedPhoto) setAdminPhoto(savedPhoto);
        };

        loadProfile();
        window.addEventListener("adminProfileUpdated", loadProfile);
        return () => {
            window.removeEventListener("adminProfileUpdated", loadProfile);
        };
    }, []);

    // RTK Query Hooks for CoinProducts and Products
    const { data: coinProductsResponse, isLoading: isLoadingCoinProducts, isFetching, refetch } = useGetCoinProductsQuery(undefined);
    const { data: productsResponse } = useGetProductsQuery({ limit: 100 });
    const { data: allGiftCardsResponse, isLoading: isLoadingGiftCards, refetch: refetchGiftCards } = useGetAllGiftCardsQuery();

    const [createCoinProduct, { isLoading: isCreating }] = useCreateCoinProductMutation();
    const [updateCoinProduct, { isLoading: isUpdating }] = useUpdateCoinProductMutation();
    const [deleteCoinProduct] = useDeleteCoinProductMutation();
    const [adminAddFunds, { isLoading: isAddingFunds }] = useAdminAddFundsMutation();

    const coinProducts = useMemo(() => {
        return coinProductsResponse?.data || [];
    }, [coinProductsResponse]);

    const menuProducts = useMemo(() => {
        return productsResponse?.data || [];
    }, [productsResponse]);

    const allGiftCards = useMemo(() => {
        return allGiftCardsResponse?.data || [];
    }, [allGiftCardsResponse]);

    // Modal State for Coin Products
    const [rewardModalOpen, setRewardModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedCoinProductId, setSelectedCoinProductId] = useState("");
    const [selectedProductId, setSelectedProductId] = useState("");
    const [needPoint, setNeedPoint] = useState(100);

    // Gift Card Settings state
    const [settingsTab, setSettingsTab] = useState<"amounts" | "designs">("amounts");
    const [giftAmounts, setGiftAmounts] = useState<number[]>([10, 25, 50, 100]);
    const [newAmountInput, setNewAmountInput] = useState("");

    // Designs sub-state
    const [cardDesigns, setCardDesigns] = useState<CardDesign[]>(initialCardDesigns);
    const [newDesignLabel, setNewDesignLabel] = useState("");
    const [newDesignImage, setNewDesignImage] = useState("");

    // Gift Card Registry & Add Funds State
    const [giftCardFilterTab, setGiftCardFilterTab] = useState<"All" | "ACTIVE" | "REDEEMED" | "INACTIVE">("All");
    const [addFundsModalOpen, setAddFundsModalOpen] = useState(false);
    const [selectedGiftCardForFunds, setSelectedGiftCardForFunds] = useState<any>(null);
    const [addFundsEmail, setAddFundsEmail] = useState("");
    const [addFundsAmount, setAddFundsAmount] = useState(25);
    const [addFundsReason, setAddFundsReason] = useState("Staff courtesy credit");

    // Summary calculations from live API
    const activeRewardsCount = useMemo(() => coinProducts.length, [coinProducts]);
    
    const totalClaimedCount = useMemo(() => {
        return coinProducts.reduce((sum: number, cp: any) => sum + (cp._count?.orderItems || 0), 0);
    }, [coinProducts]);

    const totalCoinsRedeemed = useMemo(() => {
        return coinProducts.reduce((sum: number, cp: any) => {
            const count = cp._count?.orderItems || 0;
            return sum + (count * (cp.needPoint || 0));
        }, 0);
    }, [coinProducts]);

    const filteredGiftCards = useMemo(() => {
        if (giftCardFilterTab === "All") return allGiftCards;
        return allGiftCards.filter((card: any) => card.status === giftCardFilterTab);
    }, [allGiftCards, giftCardFilterTab]);

    // Handle Admin Add Funds Submit
    const handleSaveAddFunds = async (e: React.FormEvent) => {
        e.preventDefault();
        if (addFundsAmount <= 0) {
            toast.error("Please enter a valid amount greater than $0.");
            return;
        }

        try {
            await adminAddFunds({
                giftCardId: selectedGiftCardForFunds?.id || undefined,
                email: addFundsEmail.trim() || undefined,
                amount: Number(addFundsAmount),
                reason: addFundsReason.trim() || undefined,
            }).unwrap();

            toast.success(`Successfully credited $${Number(addFundsAmount).toFixed(2)}!`);
            setAddFundsModalOpen(false);
            refetchGiftCards();
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to credit funds.");
        }
    };

    const handleOpenAddReward = () => {
        setEditMode(false);
        setSelectedCoinProductId("");
        if (menuProducts.length > 0) {
            setSelectedProductId(menuProducts[0].id);
        } else {
            setSelectedProductId("");
        }
        setNeedPoint(100);
        setRewardModalOpen(true);
    };

    const handleOpenEditReward = (coinProduct: any) => {
        setEditMode(true);
        setSelectedCoinProductId(coinProduct.id);
        setSelectedProductId(coinProduct.productId || (menuProducts[0]?.id || ""));
        setNeedPoint(coinProduct.needPoint || 0);
        setRewardModalOpen(true);
    };

    const handleDeleteReward = async (id: string, name: string) => {
        if (confirm(`Are you sure you want to delete reward "${name}"?`)) {
            try {
                await deleteCoinProduct(id).unwrap();
                toast.success(`Reward "${name}" deleted successfully.`);
            } catch (err: any) {
                toast.error(err?.data?.message || "Failed to delete reward.");
            }
        }
    };

    const handleSaveReward = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedProductId) {
            toast.error("Please select an associated product for this reward.");
            return;
        }

        try {
            if (editMode) {
                await updateCoinProduct({
                    id: selectedCoinProductId,
                    data: {
                        productId: selectedProductId,
                        needPoint: Number(needPoint),
                    },
                }).unwrap();
                toast.success("Reward updated successfully.");
            } else {
                await createCoinProduct({
                    productId: selectedProductId,
                    needPoint: Number(needPoint),
                }).unwrap();
                toast.success("Reward created successfully.");
            }
            setRewardModalOpen(false);
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to save reward.");
        }
    };

    // Gift amounts actions
    const handleAddAmount = (e: React.FormEvent) => {
        e.preventDefault();
        const amt = parseFloat(newAmountInput);
        if (isNaN(amt) || amt <= 0) return;
        if (giftAmounts.includes(amt)) return;
        setGiftAmounts([...giftAmounts, amt].sort((a, b) => a - b));
        setNewAmountInput("");
    };

    const handleRemoveAmount = (amount: number) => {
        setGiftAmounts(giftAmounts.filter(a => a !== amount));
    };

    // Design cards actions
    const handleAddDesign = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newDesignLabel) return;
        const defaultImage = "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80";
        const img = newDesignImage.trim() !== "" ? newDesignImage.trim() : defaultImage;

        const newDesign: CardDesign = {
            id: `D-${Math.floor(Math.random() * 900 + 100)}`,
            label: newDesignLabel,
            image: img
        };
        setCardDesigns([...cardDesigns, newDesign]);
        setNewDesignLabel("");
        setNewDesignImage("");
    };

    const handleRemoveDesign = (id: string) => {
        setCardDesigns(cardDesigns.filter(d => d.id !== id));
    };

    return (
        <div className="flex-1 p-4 md:p-8 space-y-6 bg-[#FAF6F0] dark:bg-background min-h-screen text-foreground transition-colors duration-300">
            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
                <div>
                    <h1 className="font-serif text-3xl font-bold tracking-tight text-[#2C1A14] dark:text-white">Rewards Management</h1>
                    <p className="text-sm text-muted-foreground mt-1">Bean Fien Admin Panel</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Manage coin reward products, points required, and gift cards.</p>
                </div>

                <div className="flex items-center gap-3">
                    <NotificationDropdown />
                    <button
                        onClick={() => refetch()}
                        disabled={isFetching}
                        className="p-2.5 rounded-xl border border-border bg-white dark:bg-card hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
                        title="Refresh Reward Products"
                    >
                        <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin text-primary" : ""}`} />
                    </button>

                    <AdminProfileDropdown />
                </div>
            </header>

            {/* Top Stats Cards */}
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {/* Active Rewards */}
                <div className="bg-white dark:bg-card p-6 rounded-2xl border border-border/60 shadow-sm flex items-center gap-4 min-h-[100px]">
                    <div className="p-3 bg-[#8B4513]/10 text-[#8B4513] dark:text-[#C07C4A] rounded-2xl">
                        <Gift className="w-6 h-6" />
                    </div>
                    <div>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Active Rewards</span>
                        <h2 className="font-serif text-3xl font-extrabold text-[#2C1A14] dark:text-white mt-1">{activeRewardsCount}</h2>
                    </div>
                </div>

                {/* Total Claimed */}
                <div className="bg-white dark:bg-card p-6 rounded-2xl border border-border/60 shadow-sm flex items-center gap-4 min-h-[100px]">
                    <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                        <CheckCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Total Claimed</span>
                        <h2 className="font-serif text-3xl font-extrabold text-[#2C1A14] dark:text-white mt-1">{totalClaimedCount}</h2>
                    </div>
                </div>

                {/* Coins Redeemed */}
                <div className="bg-white dark:bg-card p-6 rounded-2xl border border-border/60 shadow-sm flex items-center gap-4 min-h-[100px]">
                    <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl">
                        <Star className="w-6 h-6 fill-current" />
                    </div>
                    <div>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Coins Redeemed</span>
                        <h2 className="font-serif text-3xl font-extrabold text-[#2C1A14] dark:text-white mt-1">🪙 {totalCoinsRedeemed}</h2>
                    </div>
                </div>
            </section>

            {/* Reward Catalog Section */}
            <div className="bg-white dark:bg-card p-6 rounded-3xl border border-border/60 shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="font-serif text-lg font-bold text-[#2C1A14] dark:text-white">Reward Catalog</h3>
                        <p className="text-xs text-muted-foreground">Coin products available for customers to redeem with coins</p>
                    </div>
                    <button
                        onClick={handleOpenAddReward}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2C1A14] dark:bg-primary text-white dark:text-[#1E0F0B] font-bold text-xs uppercase tracking-wider hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        New Reward
                    </button>
                </div>

                {/* Rewards List */}
                {isLoadingCoinProducts ? (
                    <div className="py-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        <span className="text-xs font-semibold">Loading reward catalog from database...</span>
                    </div>
                ) : coinProducts.length > 0 ? (
                    <div className="space-y-3">
                        {coinProducts.map((reward: any) => {
                            const rewardTitle = reward.product?.name || reward.name || "Reward Product";
                            const categoryName = reward.product?.category?.name || "Drink / Food";
                            const imgUrl = getProductImg(reward.product);
                            const claimedCount = reward._count?.orderItems || 0;

                            return (
                                <div key={reward.id} className="p-4 bg-[#FAF6F0]/40 dark:bg-black/10 rounded-2xl border border-border/40 flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        {/* Product Image Thumbnail */}
                                        <div 
                                            className="w-14 h-14 rounded-2xl bg-cover bg-center border border-border/60 flex-shrink-0 shadow-sm"
                                            style={{ backgroundImage: `url(${imgUrl})` }}
                                        />
                                        <div className="space-y-0.5">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-serif font-bold text-base text-[#2C1A14] dark:text-white leading-tight">{rewardTitle}</h4>
                                                <span className="px-2 py-0.5 bg-slate-100 dark:bg-white/5 rounded-md text-[9px] font-bold text-muted-foreground uppercase">
                                                    {categoryName}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground flex items-center gap-3">
                                                <span className="text-[#8B4513] dark:text-[#C07C4A] font-bold">
                                                    🪙 {reward.needPoint} Coins required
                                                </span>
                                                <span className="font-normal text-muted-foreground">
                                                    · {claimedCount} claimed
                                                </span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => handleOpenEditReward(reward)}
                                            className="p-2 border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-xl text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors cursor-pointer"
                                            title="Edit Reward"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteReward(reward.id, rewardTitle)}
                                            className="p-2 border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-100 transition-colors cursor-pointer"
                                            title="Delete Reward"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="py-12 text-center text-muted-foreground bg-[#FAF6F0]/20 dark:bg-black/10 rounded-2xl p-6 border border-border/40">
                        <p className="text-sm font-semibold">No reward products found in catalog.</p>
                        <p className="text-xs text-muted-foreground mt-1">Click "New Reward" to create a coin product.</p>
                    </div>
                )}
            </div>

            {/* Gift Card Settings Section */}
            <div className="bg-white dark:bg-card p-6 rounded-3xl border border-border/60 shadow-sm space-y-4">
                <div>
                    <h3 className="font-serif text-lg font-bold text-[#2C1A14] dark:text-white flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-primary" /> Gift Card Settings
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Manage amounts and card designs shown in the app</p>
                </div>

                {/* Tabs */}
                <div className="grid grid-cols-2 bg-[#FAF6F0] dark:bg-[#1E0F0B] p-1 rounded-xl border border-border/40 w-fit">
                    <button 
                        onClick={() => setSettingsTab("amounts")}
                        className={`px-6 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${settingsTab === "amounts" ? "bg-white dark:bg-card text-primary shadow-sm border-b-2 border-primary" : "text-muted-foreground hover:text-primary"}`}
                    >
                        Gift Amounts
                    </button>
                    <button 
                        onClick={() => setSettingsTab("designs")}
                        className={`px-6 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${settingsTab === "designs" ? "bg-white dark:bg-card text-primary shadow-sm border-b-2 border-primary" : "text-muted-foreground hover:text-primary"}`}
                    >
                        Card Designs
                    </button>
                </div>

                {/* Amounts Tab Panel */}
                {settingsTab === "amounts" && (
                    <div className="space-y-4 pt-2">
                        <p className="text-xs text-muted-foreground">Set the dollar amounts customers can choose when buying a gift card.</p>
                        
                        <div className="flex gap-2 flex-wrap">
                            {giftAmounts.map((amt) => (
                                <div key={amt} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF6F0] dark:bg-zinc-800 text-xs font-bold border border-border/60">
                                    ${amt}
                                    <button 
                                        onClick={() => handleRemoveAmount(amt)}
                                        className="p-0.5 rounded-full hover:bg-red-500/10 text-red-500 transition-colors cursor-pointer"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <form onSubmit={handleAddAmount} className="flex gap-3 max-w-md">
                            <div className="flex-1 space-y-1">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase">New Amount ($)</label>
                                <input 
                                    type="number"
                                    value={newAmountInput}
                                    onChange={(e) => setNewAmountInput(e.target.value)}
                                    placeholder="e.g. 100" 
                                    className="w-full px-4 py-2 rounded-xl border border-border bg-[#F3ECE3]/30 dark:bg-zinc-900 text-sm focus:outline-none"
                                />
                            </div>
                            <div className="flex items-end">
                                <button type="submit" className="px-5 py-2 rounded-xl bg-[#2C1A14] dark:bg-primary text-white dark:text-[#1E0F0B] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer">
                                    <Plus className="w-4 h-4" /> Add
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Designs Tab Panel */}
                {settingsTab === "designs" && (
                    <div className="space-y-6 pt-2">
                        <p className="text-xs text-muted-foreground">Add or remove gift card designs available in the app.</p>
                        
                        {/* Designs Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {cardDesigns.map((design) => (
                                <div key={design.id} className="bg-[#FAF6F0]/40 dark:bg-black/10 rounded-2xl border border-border/60 overflow-hidden group">
                                    <div className="h-24 w-full bg-cover bg-center" style={{ backgroundImage: `url(${design.image})` }} />
                                    <div className="p-3 flex justify-between items-center">
                                        <span className="text-xs font-bold">{design.label}</span>
                                        <button 
                                            onClick={() => handleRemoveDesign(design.id)}
                                            className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 rounded-lg border border-red-500/20 transition-colors cursor-pointer"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Add New Design Form */}
                        <div className="p-4 rounded-2xl bg-[#FAF6F0]/40 dark:bg-black/10 border border-border/50 max-w-xl space-y-4">
                            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Add New Design</h4>
                            
                            <form onSubmit={handleAddDesign} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Design Image</label>
                                    <div className="flex gap-3">
                                        <input 
                                            type="file"
                                            id="reward-design-photo-upload"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => {
                                                        setNewDesignImage(reader.result as string);
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                        />
                                        <label
                                            htmlFor="reward-design-photo-upload"
                                            className="px-4 py-2 rounded-xl border border-dashed border-border hover:bg-[#F3ECE3]/30 dark:hover:bg-white/5 font-bold text-xs text-[#8B4513] dark:text-[#C07C4A] flex items-center gap-1.5 cursor-pointer"
                                        >
                                            <ImageIcon className="w-4 h-4" /> Choose Photo
                                        </label>
                                        
                                        {newDesignImage && (
                                            <div className="flex items-center gap-2">
                                                <div className="w-10 h-10 rounded-lg bg-cover bg-center border border-border" style={{ backgroundImage: `url(${newDesignImage})` }} />
                                                <button type="button" onClick={() => setNewDesignImage("")} className="text-red-500 cursor-pointer"><X className="w-4 h-4" /></button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Label</label>
                                    <input 
                                        type="text"
                                        required
                                        value={newDesignLabel}
                                        onChange={(e) => setNewDesignLabel(e.target.value)}
                                        placeholder="e.g. Autumn Harvest"
                                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-white dark:bg-zinc-900 text-sm focus:outline-none"
                                    />
                                </div>

                                <button type="submit" className="w-full py-2.5 bg-[#2C1A14] dark:bg-primary text-white dark:text-[#1E0F0B] text-xs font-bold uppercase tracking-wider rounded-xl hover:opacity-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer">
                                    <Plus className="w-4 h-4" /> Add Design
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>

            {/* Gift Card Orders & System Registry Section */}
            <div className="bg-white dark:bg-card p-6 rounded-3xl border border-border/60 shadow-sm space-y-4">
                <div className="flex justify-between items-center flex-wrap gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-serif text-lg font-bold text-[#2C1A14] dark:text-white">Gift Cards Registry</h3>
                            {allGiftCards.length > 0 && (
                                <span className="px-2.5 py-0.5 bg-[#8B4513]/10 text-[#8B4513] dark:text-[#C07C4A] rounded-full text-[10px] font-bold">
                                    {allGiftCards.length} issued
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">Live digital gift cards issued in the system — view balances and credit funds</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => {
                                setSelectedGiftCardForFunds(null);
                                setAddFundsEmail("");
                                setAddFundsAmount(25);
                                setAddFundsReason("Staff courtesy credit");
                                setAddFundsModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2C1A14] dark:bg-primary text-white dark:text-[#1E0F0B] font-bold text-xs uppercase tracking-wider hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer"
                        >
                            <Plus className="w-4 h-4" />
                            Add / Credit Funds
                        </button>

                        {/* Filter buttons */}
                        <div className="flex bg-[#F3ECE3] dark:bg-[#2C1711] p-1 rounded-xl w-fit border border-border/40">
                            {(["All", "ACTIVE", "REDEEMED", "INACTIVE"] as const).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setGiftCardFilterTab(tab)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                                        giftCardFilterTab === tab 
                                            ? "bg-[#2C1A14] dark:bg-primary text-white dark:text-[#1E0F0B] shadow-sm font-bold" 
                                            : "text-muted-foreground hover:text-[#2C1A14]"
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Gift Cards list */}
                {isLoadingGiftCards ? (
                    <div className="py-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        <span className="text-xs font-semibold">Loading gift cards...</span>
                    </div>
                ) : filteredGiftCards.length > 0 ? (
                    <div className="space-y-3">
                        {filteredGiftCards.map((card: any) => {
                            const recipientLabel = card.recipientName || card.recipientEmail || "Customer";
                            const senderLabel = card.sender?.name || card.sender?.email || (card.isCustom ? "System Issued" : "Direct Purchase");
                            const formattedDate = new Date(card.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                            });

                            return (
                                <div key={card.id} className="p-4 bg-[#FAF6F0]/40 dark:bg-black/10 rounded-2xl border border-border/40 space-y-3 hover:border-border/80 transition-colors">
                                    <div className="flex justify-between items-start flex-wrap gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-[#8B4513] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                                                {recipientLabel.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h4 className="font-bold text-sm text-[#2C1A14] dark:text-white">{recipientLabel}</h4>
                                                    <span className="text-[10px] text-muted-foreground">{formattedDate}</span>
                                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                                        card.status === "ACTIVE" 
                                                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                                                            : card.status === "REDEEMED"
                                                            ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                                            : "bg-zinc-500/10 text-zinc-600"
                                                    }`}>
                                                        {card.status}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    To: <span className="font-medium text-foreground">{card.recipientEmail}</span> · From: <span className="font-medium text-foreground">{senderLabel}</span>
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-3">
                                            <div className="text-right">
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase block">Balance / Initial</span>
                                                <span className="text-sm font-black text-[#8B4513] dark:text-[#C07C4A]">
                                                    ${Number(card.balance || 0).toFixed(2)} <span className="text-muted-foreground font-normal text-xs">/ ${Number(card.initialAmount || 0).toFixed(2)}</span>
                                                </span>
                                            </div>

                                            <button
                                                onClick={() => {
                                                    setSelectedGiftCardForFunds(card);
                                                    setAddFundsEmail(card.recipientEmail || "");
                                                    setAddFundsAmount(25);
                                                    setAddFundsReason("Staff adjustment");
                                                    setAddFundsModalOpen(true);
                                                }}
                                                className="px-3 py-1.5 bg-[#E2D4C5] hover:bg-[#D5C6B5] dark:bg-zinc-800 dark:hover:bg-zinc-700 text-[#2C1A14] dark:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                                            >
                                                <Plus className="w-3.5 h-3.5" /> Credit
                                            </button>
                                        </div>
                                    </div>

                                    {/* Card Code display */}
                                    <div className="flex items-center justify-between gap-2 p-2.5 bg-white/70 dark:bg-black/30 rounded-xl border border-border/50 text-xs">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase">Card Code:</span>
                                            <span className="font-mono font-bold tracking-wider text-[#2C1A14] dark:text-white">{card.code}</span>
                                        </div>
                                        {card.personalMessage && (
                                            <p className="text-[11px] text-muted-foreground italic truncate max-w-xs">
                                                &quot;{card.personalMessage}&quot;
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-10 bg-[#FAF6F0]/20 dark:bg-black/10 rounded-2xl border border-border/40">
                        <p className="text-sm font-semibold text-muted-foreground">No gift cards match this filter.</p>
                    </div>
                )}
            </div>

            {/* NEW/EDIT REWARD MODAL */}
            {rewardModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#1E0F0B] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-border/80 relative animate-in fade-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="p-6 pb-4 border-b border-border/30 flex justify-between items-start">
                            <div>
                                <h2 className="font-serif text-xl font-bold text-[#2C1A14] dark:text-white">
                                    {editMode ? "Edit Reward" : "New Reward"}
                                </h2>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {editMode ? "Modify reward coin product" : "Link a product to the coin reward catalog"}
                                </p>
                            </div>
                            <button 
                                onClick={() => setRewardModalOpen(false)}
                                className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSaveReward} className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Select Menu Product</label>
                                <select
                                    value={selectedProductId}
                                    onChange={(e) => setSelectedProductId(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-[#F3ECE3]/40 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary text-sm font-semibold"
                                >
                                    {menuProducts.map((p: any) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name} (${Number(p.basePrice || 0).toFixed(2)})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Coins / Points Required</label>
                                <input
                                    type="number"
                                    required
                                    min={0}
                                    value={needPoint}
                                    onChange={(e) => setNeedPoint(Number(e.target.value))}
                                    placeholder="100"
                                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-[#F3ECE3]/40 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary text-sm font-semibold"
                                />
                            </div>

                            {/* Footer Buttons */}
                            <div className="flex items-center gap-3 pt-4 border-t border-border/30">
                                <button
                                    type="button"
                                    onClick={() => setRewardModalOpen(false)}
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-[#FAF6F0] hover:bg-[#F3ECE3]/60 text-[#2C1A14] font-bold text-xs uppercase tracking-wider transition-colors border border-border/40 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreating || isUpdating}
                                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#C07C4A] hover:opacity-95 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#C07C4A]/15 cursor-pointer disabled:opacity-50"
                                >
                                    {isCreating || isUpdating ? (
                                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                                    ) : editMode ? (
                                        "Save Reward"
                                    ) : (
                                        "Create Reward"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ADMIN ADD / CREDIT FUNDS MODAL */}
            {addFundsModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#1E0F0B] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-border/80 relative animate-in fade-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="p-6 pb-4 border-b border-border/30 flex justify-between items-start">
                            <div>
                                <h2 className="font-serif text-xl font-bold text-[#2C1A14] dark:text-white flex items-center gap-2">
                                    <DollarSign className="w-5 h-5 text-primary" /> Credit / Add Funds
                                </h2>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {selectedGiftCardForFunds 
                                        ? `Adding funds to card (${selectedGiftCardForFunds.code})` 
                                        : "Credit gift card balance for a customer email"}
                                </p>
                            </div>
                            <button 
                                onClick={() => setAddFundsModalOpen(false)}
                                className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleSaveAddFunds} className="p-6 space-y-4">
                            {!selectedGiftCardForFunds && (
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Recipient / Customer Email</label>
                                    <input
                                        type="email"
                                        required
                                        value={addFundsEmail}
                                        onChange={(e) => setAddFundsEmail(e.target.value)}
                                        placeholder="customer@example.com"
                                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-[#F3ECE3]/40 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary text-sm font-semibold"
                                    />
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Amount to Credit ($)</label>
                                <input
                                    type="number"
                                    required
                                    min={1}
                                    step="0.01"
                                    value={addFundsAmount}
                                    onChange={(e) => setAddFundsAmount(parseFloat(e.target.value))}
                                    placeholder="25.00"
                                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-[#F3ECE3]/40 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary text-sm font-semibold"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Reason / Note (Optional)</label>
                                <input
                                    type="text"
                                    value={addFundsReason}
                                    onChange={(e) => setAddFundsReason(e.target.value)}
                                    placeholder="e.g. VIP loyalty reward, customer satisfaction"
                                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-[#F3ECE3]/40 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary text-sm font-semibold"
                                />
                            </div>

                            {/* Footer Actions */}
                            <div className="flex items-center gap-3 pt-4 border-t border-border/30">
                                <button
                                    type="button"
                                    onClick={() => setAddFundsModalOpen(false)}
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-[#FAF6F0] hover:bg-[#F3ECE3]/60 text-[#2C1A14] font-bold text-xs uppercase tracking-wider transition-colors border border-border/40 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isAddingFunds}
                                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#C07C4A] hover:opacity-95 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#C07C4A]/15 cursor-pointer disabled:opacity-50"
                                >
                                    {isAddingFunds ? (
                                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                                    ) : (
                                        "Credit Funds"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
