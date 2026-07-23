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
    RefreshCw
} from "lucide-react";
import { 
    useGetCoinProductsQuery, 
    useCreateCoinProductMutation, 
    useUpdateCoinProductMutation, 
    useDeleteCoinProductMutation 
} from "@/redux/features/coinProduct/coinProductApi";
import { useGetProductsQuery } from "@/redux/features/product/productApi";

interface GiftCardRequest {
    id: string;
    customer: string;
    email: string;
    date: string;
    amount: number;
    status: "Pending" | "Sent";
    code?: string;
}

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

const initialRequests: GiftCardRequest[] = [
    { id: "Q-01", customer: "Sarah Chen", email: "sarah.chen@email.com", date: "Jun 3", amount: 25.00, status: "Pending" },
    { id: "Q-02", customer: "James Park", email: "james.park@email.com", date: "Jun 3", amount: 50.00, status: "Pending" }
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

    const [createCoinProduct, { isLoading: isCreating }] = useCreateCoinProductMutation();
    const [updateCoinProduct, { isLoading: isUpdating }] = useUpdateCoinProductMutation();
    const [deleteCoinProduct] = useDeleteCoinProductMutation();

    const coinProducts = useMemo(() => {
        return coinProductsResponse?.data || [];
    }, [coinProductsResponse]);

    const menuProducts = useMemo(() => {
        return productsResponse?.data || [];
    }, [productsResponse]);

    // Modal State
    const [rewardModalOpen, setRewardModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedCoinProductId, setSelectedCoinProductId] = useState("");

    // Modal Inputs
    const [selectedProductId, setSelectedProductId] = useState("");
    const [needPoint, setNeedPoint] = useState(100);

    // Gift Card Settings state
    const [settingsTab, setSettingsTab] = useState<"amounts" | "designs">("amounts");
    const [giftAmounts, setGiftAmounts] = useState<number[]>([10, 25, 50]);
    const [newAmountInput, setNewAmountInput] = useState("");

    // Designs sub-state
    const [cardDesigns, setCardDesigns] = useState<CardDesign[]>(initialCardDesigns);
    const [newDesignLabel, setNewDesignLabel] = useState("");
    const [newDesignImage, setNewDesignImage] = useState("");

    // Requests state
    const [requests, setRequests] = useState<GiftCardRequest[]>(initialRequests);
    const [requestTab, setRequestTab] = useState<"Pending" | "All">("Pending");
    const [inputCodes, setInputCodes] = useState<{ [key: string]: string }>({});

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

    const pendingRequestsCount = useMemo(() => requests.filter(r => r.status === "Pending").length, [requests]);

    const filteredRequests = useMemo(() => {
        if (requestTab === "Pending") {
            return requests.filter(r => r.status === "Pending");
        }
        return requests;
    }, [requests, requestTab]);

    // Reward Catalog Handlers
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

    // Gift card requests actions
    const handleSendCode = (id: string) => {
        const code = inputCodes[id];
        if (!code || code.trim() === "") {
            toast.error("Please enter a valid gift card code first!");
            return;
        }

        setRequests(prev => prev.map(req => 
            req.id === id ? { ...req, status: "Sent", code: code.trim() } : req
        ));
        toast.success(`Gift card code "${code}" sent to customer!`);
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

            {/* Gift Card Requests Section */}
            <div className="bg-white dark:bg-card p-6 rounded-3xl border border-border/60 shadow-sm space-y-4">
                <div className="flex justify-between items-center flex-wrap gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-serif text-lg font-bold text-[#2C1A14] dark:text-white">Gift Card Requests</h3>
                            {pendingRequestsCount > 0 && (
                                <span className="px-2 py-0.5 bg-red-600 text-white rounded-full text-[10px] font-bold">
                                    {pendingRequestsCount} pending
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">Customers who requested a gift card — send them the code</p>
                    </div>

                    {/* Filter buttons */}
                    <div className="flex bg-[#F3ECE3] dark:bg-[#2C1711] p-1 rounded-xl w-fit border border-border/40">
                        {(["Pending", "All"] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setRequestTab(tab)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${requestTab === tab ? "bg-[#2C1A14] dark:bg-primary text-white dark:text-[#1E0F0B] shadow-sm font-bold" : "text-muted-foreground hover:text-[#2C1A14]"}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Requests list */}
                <div className="space-y-4">
                    {filteredRequests.length > 0 ? (
                        filteredRequests.map((req) => (
                            <div key={req.id} className="p-4 bg-[#FAF6F0]/40 dark:bg-black/10 rounded-2xl border border-border/40 space-y-3">
                                <div className="flex justify-between items-start flex-wrap gap-3">
                                    <div className="flex items-center gap-3">
                                        {/* Avatar Fallback */}
                                        <div className="w-10 h-10 rounded-full bg-[#8B4513] text-white flex items-center justify-center text-xs font-bold">
                                            {req.customer.split(" ").map(n => n[0]).join("").toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-sm">{req.customer}</h4>
                                                <span className="text-[10px] text-muted-foreground">{req.date}</span>
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${req.status === "Pending" ? "bg-amber-500/10 text-amber-600" : "bg-emerald-500/10 text-emerald-600"}`}>
                                                    {req.status}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground">{req.email}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#8B4513] dark:text-[#C07C4A]">
                                        <CreditCard className="w-4 h-4 text-primary" />
                                        Gift Card - ${req.amount.toFixed(2)}
                                    </div>
                                </div>

                                {req.status === "Pending" ? (
                                    <div className="flex gap-3 max-w-2xl">
                                        <input 
                                            type="text"
                                            value={inputCodes[req.id] || ""}
                                            onChange={(e) => setInputCodes({ ...inputCodes, [req.id]: e.target.value })}
                                            placeholder="Enter gift card code (e.g. BF-GC-XXXX-XXXX)"
                                            className="flex-1 px-4 py-2 rounded-xl border border-border bg-white dark:bg-zinc-900 text-xs focus:outline-none"
                                        />
                                        <button 
                                            onClick={() => handleSendCode(req.id)}
                                            className="px-4 py-2 bg-[#E2D4C5] hover:bg-[#D5C6B5] dark:bg-zinc-800 dark:hover:bg-zinc-700 text-[#2C1A14] dark:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                                        >
                                            <Send className="w-3.5 h-3.5" /> Send Code
                                        </button>
                                    </div>
                                ) : (
                                    <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-500/10 text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
                                        Sent Code: <span className="font-mono bg-white dark:bg-black/30 px-2 py-0.5 rounded border border-emerald-500/20">{req.code}</span>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-sm text-muted-foreground py-6">No requests found.</p>
                    )}
                </div>
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
        </div>
    );
}
