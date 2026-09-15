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
    DollarSign,
    Eye,
    Copy,
    Check,
    Clock,
    Activity,
    ShieldAlert,
    User as UserIcon,
    Mail
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
    useGetAllGiftCardOrdersQuery,
    useAdminAddFundsMutation,
    useGetGiftCardStylesQuery,
    useCreateGiftCardStyleMutation,
    useUpdateGiftCardStyleMutation,
    useDeleteGiftCardStyleMutation,
    useAdminGetGiftCardByIdQuery,
    useAdminUpdateGiftCardMutation,
} from "@/redux/features/giftCard/giftCardApi";

interface CardDesign {
    id: string;
    label: string;
    image: string;
}

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

    // RTK Query Hooks
    const { data: coinProductsResponse, isLoading: isLoadingCoinProducts, isFetching, refetch } = useGetCoinProductsQuery(undefined);
    const { data: productsResponse } = useGetProductsQuery({ limit: 100 });
    const { data: allGiftCardsResponse, isLoading: isLoadingGiftCards, refetch: refetchGiftCards } = useGetAllGiftCardsQuery();
    const { data: allGiftCardOrdersResponse, isLoading: isLoadingOrders, refetch: refetchOrders } = useGetAllGiftCardOrdersQuery();
    const { data: stylesResponse, isLoading: isLoadingStyles, refetch: refetchStyles } = useGetGiftCardStylesQuery();

    const [createCoinProduct, { isLoading: isCreating }] = useCreateCoinProductMutation();
    const [updateCoinProduct, { isLoading: isUpdating }] = useUpdateCoinProductMutation();
    const [deleteCoinProduct] = useDeleteCoinProductMutation();
    const [adminAddFunds, { isLoading: isAddingFunds }] = useAdminAddFundsMutation();

    // Style Mutations
    const [createStyleApi, { isLoading: isCreatingStyle }] = useCreateGiftCardStyleMutation();
    const [updateStyleApi, { isLoading: isUpdatingStyle }] = useUpdateGiftCardStyleMutation();
    const [deleteStyleApi, { isLoading: isDeletingStyle }] = useDeleteGiftCardStyleMutation();

    // Admin Card Update Mutation
    const [adminUpdateCardApi, { isLoading: isUpdatingCard }] = useAdminUpdateGiftCardMutation();

    const coinProducts = useMemo(() => {
        return coinProductsResponse?.data || [];
    }, [coinProductsResponse]);

    const menuProducts = useMemo(() => {
        return productsResponse?.data || [];
    }, [productsResponse]);

    const allGiftCards = useMemo(() => {
        return allGiftCardsResponse?.data || [];
    }, [allGiftCardsResponse]);

    const allGiftCardOrders = useMemo(() => {
        return allGiftCardOrdersResponse?.data || [];
    }, [allGiftCardOrdersResponse]);

    const allStyles = useMemo(() => {
        return stylesResponse?.data || [];
    }, [stylesResponse]);

    // Modal State for Coin Products
    const [rewardModalOpen, setRewardModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedCoinProductId, setSelectedCoinProductId] = useState("");
    const [selectedProductId, setSelectedProductId] = useState("");
    const [needPoint, setNeedPoint] = useState(100);

    // Gift Card Settings state
    const [settingsTab, setSettingsTab] = useState<"amounts" | "designs">("designs");
    const [giftAmounts, setGiftAmounts] = useState<number[]>([10, 25, 50, 100]);
    const [newAmountInput, setNewAmountInput] = useState("");

    // Style Modal State
    const [styleModalOpen, setStyleModalOpen] = useState(false);
    const [styleEditMode, setStyleEditMode] = useState(false);
    const [selectedStyleId, setSelectedStyleId] = useState("");
    const [styleName, setStyleName] = useState("");
    const [styleImage, setStyleImage] = useState("");
    const [styleIsActive, setStyleIsActive] = useState(true);

    // Gift Card Registry & Add Funds State
    const [giftCardFilterTab, setGiftCardFilterTab] = useState<"All" | "ACTIVE" | "REDEEMED" | "INACTIVE">("All");
    const [orderFilterTab, setOrderFilterTab] = useState<"All" | "PAID" | "PENDING" | "FAILED">("All");
    const [orderSearchTerm, setOrderSearchTerm] = useState("");
    const [addFundsModalOpen, setAddFundsModalOpen] = useState(false);
    const [selectedGiftCardForFunds, setSelectedGiftCardForFunds] = useState<any>(null);
    const [addFundsEmail, setAddFundsEmail] = useState("");
    const [addFundsAmount, setAddFundsAmount] = useState(25);
    const [addFundsReason, setAddFundsReason] = useState("Staff courtesy credit");

    // Card View Details & Edit Modal States
    const [cardDetailsModalOpen, setCardDetailsModalOpen] = useState(false);
    const [selectedCardIdForDetails, setSelectedCardIdForDetails] = useState<string | null>(null);
    const [copiedCode, setCopiedCode] = useState(false);

    const [editCardModalOpen, setEditCardModalOpen] = useState(false);
    const [selectedCardForEdit, setSelectedCardForEdit] = useState<any>(null);
    const [editCardNickname, setEditCardNickname] = useState("");
    const [editCardRecipientName, setEditCardRecipientName] = useState("");
    const [editCardRecipientEmail, setEditCardRecipientEmail] = useState("");
    const [editCardPersonalMessage, setEditCardPersonalMessage] = useState("");
    const [editCardStatus, setEditCardStatus] = useState<string>("ACTIVE");
    const [editCardIsActive, setEditCardIsActive] = useState<boolean>(true);

    // Query card details on demand
    const { data: cardDetailsResponse, isLoading: isLoadingCardDetails } = useAdminGetGiftCardByIdQuery(
        selectedCardIdForDetails as string,
        { skip: !selectedCardIdForDetails }
    );
    const activeCardDetails = cardDetailsResponse?.data;

    // Filtered Gift Card Orders
    const filteredGiftCardOrders = useMemo(() => {
        return allGiftCardOrders.filter((ord: any) => {
            const matchesStatus = orderFilterTab === "All" || ord.paymentStatus === orderFilterTab;
            const matchesSearch = !orderSearchTerm.trim() || 
                (ord.orderNumber || "").toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
                (ord.recipientName || "").toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
                (ord.recipientEmail || "").toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
                (ord.purchaser?.name || "").toLowerCase().includes(orderSearchTerm.toLowerCase());
            return matchesStatus && matchesSearch;
        });
    }, [allGiftCardOrders, orderFilterTab, orderSearchTerm]);

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

    // Style Handlers
    const handleOpenCreateStyle = () => {
        setStyleEditMode(false);
        setSelectedStyleId("");
        setStyleName("");
        setStyleImage("");
        setStyleIsActive(true);
        setStyleModalOpen(true);
    };

    const handleOpenEditStyle = (style: any) => {
        setStyleEditMode(true);
        setSelectedStyleId(style.id);
        setStyleName(style.name || "");
        setStyleImage(style.image || "");
        setStyleIsActive(style.isActive !== false);
        setStyleModalOpen(true);
    };

    const handleSaveStyle = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!styleName.trim() || !styleImage.trim()) {
            toast.error("Please provide both style name and image URL.");
            return;
        }

        try {
            if (styleEditMode && selectedStyleId) {
                await updateStyleApi({
                    id: selectedStyleId,
                    name: styleName.trim(),
                    image: styleImage.trim(),
                    isActive: styleIsActive,
                }).unwrap();
                toast.success("Gift card style updated successfully.");
            } else {
                await createStyleApi({
                    name: styleName.trim(),
                    image: styleImage.trim(),
                }).unwrap();
                toast.success("Gift card style created successfully.");
            }
            setStyleModalOpen(false);
            refetchStyles();
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to save gift card style.");
        }
    };

    const handleDeleteStyle = async (id: string, name: string) => {
        if (confirm(`Are you sure you want to delete style template "${name}"?`)) {
            try {
                await deleteStyleApi(id).unwrap();
                toast.success(`Style "${name}" deleted.`);
                refetchStyles();
            } catch (err: any) {
                toast.error(err?.data?.message || "Failed to delete style.");
            }
        }
    };

    // Edit Gift Card Handlers
    const handleOpenEditCard = (card: any) => {
        setSelectedCardForEdit(card);
        setEditCardNickname(card.nickname || "");
        setEditCardRecipientName(card.recipientName || "");
        setEditCardRecipientEmail(card.recipientEmail || "");
        setEditCardPersonalMessage(card.personalMessage || "");
        setEditCardStatus(card.status || "ACTIVE");
        setEditCardIsActive(card.isActive !== false);
        setEditCardModalOpen(true);
    };

    const handleSaveEditCard = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCardForEdit?.id) return;

        try {
            await adminUpdateCardApi({
                id: selectedCardForEdit.id,
                nickname: editCardNickname.trim() || undefined,
                recipientName: editCardRecipientName.trim() || undefined,
                recipientEmail: editCardRecipientEmail.trim() || undefined,
                personalMessage: editCardPersonalMessage.trim() || undefined,
                status: editCardStatus,
                isActive: editCardIsActive,
            }).unwrap();

            toast.success("Gift card updated successfully.");
            setEditCardModalOpen(false);
            refetchGiftCards();
            if (selectedCardIdForDetails === selectedCardForEdit.id) {
                // details will auto-refresh via tag invalidation
            }
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to update gift card.");
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
                        <div className="flex justify-between items-center flex-wrap gap-4">
                            <div>
                                <p className="text-xs text-muted-foreground">Manage gift card visual style templates stored in the database.</p>
                                <p className="text-[11px] text-muted-foreground/80">These templates are shown to customers when customizing and purchasing gift cards.</p>
                            </div>
                            <button
                                onClick={handleOpenCreateStyle}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2C1A14] dark:bg-primary text-white dark:text-[#1E0F0B] font-bold text-xs uppercase tracking-wider hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer"
                            >
                                <Plus className="w-4 h-4" /> Add Style Template
                            </button>
                        </div>
                        
                        {/* Dynamic Styles Grid */}
                        {isLoadingStyles ? (
                            <div className="py-10 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
                                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                <span className="text-xs font-semibold">Loading style templates...</span>
                            </div>
                        ) : allStyles.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {allStyles.map((style: any) => (
                                    <div key={style.id} className="bg-[#FAF6F0]/40 dark:bg-black/10 rounded-2xl border border-border/60 overflow-hidden group shadow-sm flex flex-col justify-between">
                                        <div 
                                            className="h-28 w-full bg-cover bg-center relative group-hover:scale-105 transition-transform duration-300" 
                                            style={{ backgroundImage: `url(${style.image})` }}
                                        >
                                            {style.isActive === false && (
                                                <span className="absolute top-2 right-2 px-2 py-0.5 bg-red-600/90 text-white rounded-md text-[9px] font-bold uppercase">
                                                    Inactive
                                                </span>
                                            )}
                                        </div>
                                        <div className="p-3 flex justify-between items-center bg-white/60 dark:bg-zinc-900/60 border-t border-border/40">
                                            <div>
                                                <span className="text-xs font-bold block text-foreground">{style.name}</span>
                                                <span className="text-[10px] text-muted-foreground">ID: {style.id.slice(0, 8)}...</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <button 
                                                    onClick={() => handleOpenEditStyle(style)}
                                                    className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-foreground rounded-lg border border-border/60 transition-colors cursor-pointer"
                                                    title="Edit Style"
                                                >
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteStyle(style.id, style.name)}
                                                    className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 rounded-lg border border-red-500/20 transition-colors cursor-pointer"
                                                    title="Delete Style"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 bg-[#FAF6F0]/20 dark:bg-black/10 rounded-2xl border border-border/40">
                                <p className="text-sm font-semibold text-muted-foreground">No style templates found.</p>
                                <button
                                    onClick={handleOpenCreateStyle}
                                    className="mt-2 text-xs font-bold text-primary hover:underline cursor-pointer"
                                >
                                    + Add First Style Template
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Gift Card Direct Orders & Payments Section */}
            <div className="bg-white dark:bg-card p-6 rounded-3xl border border-border/60 shadow-sm space-y-4">
                <div className="flex justify-between items-center flex-wrap gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-serif text-lg font-bold text-[#2C1A14] dark:text-white">Gift Card Orders & Direct Payments</h3>
                            {allGiftCardOrders.length > 0 && (
                                <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-bold">
                                    {allGiftCardOrders.length} orders
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">Peer-to-peer customer gift card purchases with real-time payment fulfillment</p>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                        {/* Search */}
                        <div className="relative w-48 sm:w-60">
                            <input
                                type="text"
                                placeholder="Search order, email..."
                                value={orderSearchTerm}
                                onChange={(e) => setOrderSearchTerm(e.target.value)}
                                className="w-full px-3.5 py-1.5 rounded-xl border border-border/70 bg-[#FAF6F0]/40 dark:bg-zinc-900 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                        </div>

                        {/* Status Filters */}
                        <div className="flex bg-[#F3ECE3] dark:bg-[#2C1711] p-1 rounded-xl w-fit border border-border/40">
                            {(["All", "PAID", "PENDING", "FAILED"] as const).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setOrderFilterTab(tab)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                                        orderFilterTab === tab 
                                            ? "bg-[#2C1A14] dark:bg-primary text-white dark:text-[#1E0F0B] shadow-sm font-bold" 
                                            : "text-muted-foreground hover:text-[#2C1A14]"
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => refetchOrders()}
                            className="p-2 rounded-xl border border-border/70 bg-[#FAF6F0]/40 dark:bg-zinc-900 hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                            title="Refresh Orders"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingOrders ? "animate-spin text-primary" : ""}`} />
                        </button>
                    </div>
                </div>

                {isLoadingOrders ? (
                    <div className="py-10 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        <span className="text-xs font-semibold">Loading gift card orders...</span>
                    </div>
                ) : filteredGiftCardOrders.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-border/60 text-[11px] uppercase font-bold text-muted-foreground">
                                    <th className="py-3 px-3">Order #</th>
                                    <th className="py-3 px-3">Purchaser</th>
                                    <th className="py-3 px-3">Recipient</th>
                                    <th className="py-3 px-3 text-right">Amount</th>
                                    <th className="py-3 px-3">Card Code</th>
                                    <th className="py-3 px-3 text-center">Payment Status</th>
                                    <th className="py-3 px-3 text-right">Created</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40">
                                {filteredGiftCardOrders.map((ord: any) => (
                                    <tr key={ord.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="py-3.5 px-3 font-mono font-bold text-primary">
                                            {ord.orderNumber}
                                        </td>
                                        <td className="py-3.5 px-3">
                                            <div className="font-semibold text-foreground">{ord.purchaser?.name || "Guest Purchaser"}</div>
                                            <div className="text-[10px] text-muted-foreground">{ord.purchaser?.email || "Direct Checkout"}</div>
                                        </td>
                                        <td className="py-3.5 px-3">
                                            <div className="font-semibold text-foreground">{ord.recipientName}</div>
                                            <div className="text-[10px] text-muted-foreground">{ord.recipientEmail}</div>
                                        </td>
                                        <td className="py-3.5 px-3 text-right font-bold text-foreground">
                                            ${Number(ord.amount).toFixed(2)}
                                        </td>
                                        <td className="py-3.5 px-3 font-mono font-bold text-[#8B4513] dark:text-[#C07C4A]">
                                            {ord.giftCard?.code || (
                                                <span className="text-muted-foreground font-sans font-normal italic text-[11px]">
                                                    Pending Payment
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3.5 px-3 text-center">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                                ord.paymentStatus === "PAID"
                                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                                    : ord.paymentStatus === "PENDING"
                                                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                                                    : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                                            }`}>
                                                {ord.paymentStatus}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-3 text-right text-muted-foreground">
                                            {new Date(ord.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-8 text-muted-foreground text-xs">
                        No gift card direct orders found matching the filter.
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
                        <p className="text-xs text-muted-foreground mt-0.5">Live digital gift cards issued in the system — view balances, audit details, edit, and credit funds</p>
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
                                                    {card.isActive === false && (
                                                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-red-500/10 text-red-600">
                                                            Disabled
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    To: <span className="font-medium text-foreground">{card.recipientEmail}</span> · From: <span className="font-medium text-foreground">{senderLabel}</span>
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <div className="text-right mr-2">
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase block">Balance / Initial</span>
                                                <span className="text-sm font-black text-[#8B4513] dark:text-[#C07C4A]">
                                                    ${Number(card.balance || 0).toFixed(2)} <span className="text-muted-foreground font-normal text-xs">/ ${Number(card.initialAmount || 0).toFixed(2)}</span>
                                                </span>
                                            </div>

                                            {/* Action Buttons */}
                                            <button
                                                onClick={() => {
                                                    setSelectedCardIdForDetails(card.id);
                                                    setCardDetailsModalOpen(true);
                                                }}
                                                className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-foreground rounded-xl text-xs font-bold transition-all flex items-center gap-1 border border-border/60 cursor-pointer"
                                                title="View Details"
                                            >
                                                <Eye className="w-3.5 h-3.5 text-primary" /> Details
                                            </button>

                                            <button
                                                onClick={() => handleOpenEditCard(card)}
                                                className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-foreground rounded-xl text-xs font-bold transition-all flex items-center gap-1 border border-border/60 cursor-pointer"
                                                title="Edit Gift Card"
                                            >
                                                <Edit2 className="w-3.5 h-3.5" /> Edit
                                            </button>

                                            <button
                                                onClick={() => {
                                                    setSelectedGiftCardForFunds(card);
                                                    setAddFundsEmail(card.recipientEmail || "");
                                                    setAddFundsAmount(25);
                                                    setAddFundsReason("Staff adjustment");
                                                    setAddFundsModalOpen(true);
                                                }}
                                                className="px-3 py-2 bg-[#E2D4C5] hover:bg-[#D5C6B5] dark:bg-zinc-800 dark:hover:bg-zinc-700 text-[#2C1A14] dark:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
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

            {/* STYLE CREATE / EDIT MODAL */}
            {styleModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#1E0F0B] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-border/80 relative animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 pb-4 border-b border-border/30 flex justify-between items-start">
                            <div>
                                <h2 className="font-serif text-xl font-bold text-[#2C1A14] dark:text-white">
                                    {styleEditMode ? "Edit Style Template" : "New Style Template"}
                                </h2>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Define visual background style for digital gift cards
                                </p>
                            </div>
                            <button 
                                onClick={() => setStyleModalOpen(false)}
                                className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveStyle} className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Style Name</label>
                                <input
                                    type="text"
                                    required
                                    value={styleName}
                                    onChange={(e) => setStyleName(e.target.value)}
                                    placeholder="e.g. Espresso Gold, Autumn Roast"
                                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-[#F3ECE3]/40 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary text-sm font-semibold"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Image URL</label>
                                <input
                                    type="url"
                                    required
                                    value={styleImage}
                                    onChange={(e) => setStyleImage(e.target.value)}
                                    placeholder="https://images.unsplash.com/..."
                                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-[#F3ECE3]/40 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary text-sm font-semibold"
                                />
                            </div>

                            {/* Preview */}
                            {styleImage && (
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Preview</label>
                                    <div 
                                        className="h-28 w-full rounded-2xl bg-cover bg-center border border-border/80 shadow-sm"
                                        style={{ backgroundImage: `url(${styleImage})` }}
                                    />
                                </div>
                            )}

                            {styleEditMode && (
                                <div className="flex items-center gap-3 pt-1">
                                    <input 
                                        type="checkbox"
                                        id="style-active-toggle"
                                        checked={styleIsActive}
                                        onChange={(e) => setStyleIsActive(e.target.checked)}
                                        className="w-4 h-4 rounded text-primary focus:ring-primary"
                                    />
                                    <label htmlFor="style-active-toggle" className="text-xs font-semibold text-foreground cursor-pointer">
                                        Active & available for customer purchase
                                    </label>
                                </div>
                            )}

                            <div className="flex items-center gap-3 pt-4 border-t border-border/30">
                                <button
                                    type="button"
                                    onClick={() => setStyleModalOpen(false)}
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-[#FAF6F0] hover:bg-[#F3ECE3]/60 text-[#2C1A14] font-bold text-xs uppercase tracking-wider transition-colors border border-border/40 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreatingStyle || isUpdatingStyle}
                                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#C07C4A] hover:opacity-95 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#C07C4A]/15 cursor-pointer disabled:opacity-50"
                                >
                                    {isCreatingStyle || isUpdatingStyle ? (
                                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                                    ) : styleEditMode ? (
                                        "Update Style"
                                    ) : (
                                        "Create Style"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* GIFT CARD DETAILS MODAL */}
            {cardDetailsModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#1E0F0B] w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl overflow-y-auto border border-border/80 relative animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 pb-4 border-b border-border/30 flex justify-between items-start sticky top-0 bg-white/95 dark:bg-[#1E0F0B]/95 backdrop-blur z-10">
                            <div>
                                <h2 className="font-serif text-xl font-bold text-[#2C1A14] dark:text-white flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 text-primary" /> Gift Card Full Details
                                </h2>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Complete audit, linked order, and ledger timeline
                                </p>
                            </div>
                            <button 
                                onClick={() => {
                                    setCardDetailsModalOpen(false);
                                    setSelectedCardIdForDetails(null);
                                }}
                                className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {isLoadingCardDetails ? (
                            <div className="py-20 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
                                <Loader2 className="w-7 h-7 animate-spin text-primary" />
                                <span className="text-xs font-semibold">Fetching gift card details from database...</span>
                            </div>
                        ) : activeCardDetails ? (
                            <div className="p-6 space-y-6">
                                {/* Visual Card Header with Code Copy */}
                                <div className="relative rounded-2xl p-6 overflow-hidden bg-gradient-to-br from-[#2C1A14] via-[#3D251E] to-[#1E0F0B] text-white shadow-lg border border-[#8B4513]/30 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="text-[10px] font-bold text-[#C07C4A] uppercase tracking-widest block">BEAN FIEN GIFT CARD</span>
                                            <h3 className="font-serif text-2xl font-black mt-1">${Number(activeCardDetails.balance || 0).toFixed(2)}</h3>
                                            <span className="text-xs text-white/70">Initial Value: ${Number(activeCardDetails.initialAmount || 0).toFixed(2)}</span>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                                            activeCardDetails.status === "ACTIVE" 
                                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" 
                                                : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                        }`}>
                                            {activeCardDetails.status}
                                        </span>
                                    </div>

                                    {/* Card Code Bar with Copy */}
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/10 backdrop-blur border border-white/15">
                                        <div>
                                            <span className="text-[9px] text-white/60 uppercase block">Redemption Code</span>
                                            <span className="font-mono text-base font-black tracking-widest text-[#E2D4C5]">{activeCardDetails.code}</span>
                                        </div>
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(activeCardDetails.code);
                                                toast.success("Card code copied to clipboard!");
                                            }}
                                            className="px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                                        >
                                            <Copy className="w-3.5 h-3.5" /> Copy Code
                                        </button>
                                    </div>
                                </div>

                                {/* Details Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="p-4 rounded-2xl bg-[#FAF6F0]/60 dark:bg-zinc-900/60 border border-border/50 space-y-2">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                                            <UserIcon className="w-3.5 h-3.5 text-primary" /> Recipient
                                        </span>
                                        <p className="font-bold text-sm text-foreground">{activeCardDetails.recipientName || "N/A"}</p>
                                        <p className="text-xs text-muted-foreground">{activeCardDetails.recipientEmail || "N/A"}</p>
                                        {activeCardDetails.personalMessage && (
                                            <p className="text-xs italic text-muted-foreground/90 border-t border-border/40 pt-1.5 mt-1.5">
                                                &quot;{activeCardDetails.personalMessage}&quot;
                                            </p>
                                        )}
                                    </div>

                                    <div className="p-4 rounded-2xl bg-[#FAF6F0]/60 dark:bg-zinc-900/60 border border-border/50 space-y-2">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                                            <Mail className="w-3.5 h-3.5 text-primary" /> Sender / Purchaser
                                        </span>
                                        <p className="font-bold text-sm text-foreground">{activeCardDetails.sender?.name || activeCardDetails.giftCardOrder?.purchaser?.name || "System"}</p>
                                        <p className="text-xs text-muted-foreground">{activeCardDetails.sender?.email || activeCardDetails.giftCardOrder?.purchaser?.email || "Direct Checkout"}</p>
                                        {activeCardDetails.giftCardOrder && (
                                            <p className="text-[11px] text-primary font-mono border-t border-border/40 pt-1.5 mt-1.5">
                                                Order: #{activeCardDetails.giftCardOrder.orderNumber} ({activeCardDetails.giftCardOrder.paymentStatus})
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Transaction History Ledger */}
                                <div className="space-y-3">
                                    <h4 className="font-serif text-sm font-bold text-foreground flex items-center gap-2">
                                        <Activity className="w-4 h-4 text-primary" /> Transaction Ledger History
                                    </h4>

                                    {activeCardDetails.transactions && activeCardDetails.transactions.length > 0 ? (
                                        <div className="border border-border/60 rounded-2xl overflow-hidden divide-y divide-border/40">
                                            {activeCardDetails.transactions.map((tx: any) => (
                                                <div key={tx.id} className="p-3.5 bg-white dark:bg-zinc-900/40 flex items-center justify-between gap-3 text-xs">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${
                                                                tx.type === "CREDIT" 
                                                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                                                                    : "bg-red-500/10 text-red-600 dark:text-red-400"
                                                            }`}>
                                                                {tx.type}
                                                            </span>
                                                            <span className="font-semibold text-foreground">{tx.description || tx.type}</span>
                                                        </div>
                                                        <span className="text-[10px] text-muted-foreground">
                                                            {new Date(tx.createdAt).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <span className={`font-mono font-bold text-sm ${
                                                        tx.type === "CREDIT" ? "text-emerald-600" : "text-foreground"
                                                    }`}>
                                                        {tx.type === "CREDIT" ? "+" : "-"}${Number(tx.amount).toFixed(2)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-4 rounded-xl bg-muted/20 border border-border/40 text-center text-xs text-muted-foreground">
                                            No ledger transactions recorded yet.
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            )}

            {/* GIFT CARD EDIT MODAL */}
            {editCardModalOpen && selectedCardForEdit && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#1E0F0B] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-border/80 relative animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 pb-4 border-b border-border/30 flex justify-between items-start">
                            <div>
                                <h2 className="font-serif text-xl font-bold text-[#2C1A14] dark:text-white flex items-center gap-2">
                                    <Edit2 className="w-5 h-5 text-primary" /> Edit Gift Card
                                </h2>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Update details for card {selectedCardForEdit.code}
                                </p>
                            </div>
                            <button 
                                onClick={() => setEditCardModalOpen(false)}
                                className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveEditCard} className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Recipient Name</label>
                                <input
                                    type="text"
                                    value={editCardRecipientName}
                                    onChange={(e) => setEditCardRecipientName(e.target.value)}
                                    placeholder="Recipient Name"
                                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-[#F3ECE3]/40 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary text-sm font-semibold"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Recipient Email</label>
                                <input
                                    type="email"
                                    value={editCardRecipientEmail}
                                    onChange={(e) => setEditCardRecipientEmail(e.target.value)}
                                    placeholder="recipient@example.com"
                                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-[#F3ECE3]/40 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary text-sm font-semibold"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Status</label>
                                <select
                                    value={editCardStatus}
                                    onChange={(e) => setEditCardStatus(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-[#F3ECE3]/40 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary text-sm font-semibold"
                                >
                                    <option value="ACTIVE">ACTIVE</option>
                                    <option value="INACTIVE">INACTIVE</option>
                                    <option value="DEPLETED">DEPLETED</option>
                                    <option value="EXPIRED">EXPIRED</option>
                                    <option value="REDEEMED">REDEEMED</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Personal Message</label>
                                <textarea
                                    value={editCardPersonalMessage}
                                    onChange={(e) => setEditCardPersonalMessage(e.target.value)}
                                    rows={2}
                                    placeholder="Warm message..."
                                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-[#F3ECE3]/40 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary text-sm font-semibold"
                                />
                            </div>

                            <div className="flex items-center gap-3 pt-1">
                                <input 
                                    type="checkbox"
                                    id="edit-card-active-toggle"
                                    checked={editCardIsActive}
                                    onChange={(e) => setEditCardIsActive(e.target.checked)}
                                    className="w-4 h-4 rounded text-primary focus:ring-primary"
                                />
                                <label htmlFor="edit-card-active-toggle" className="text-xs font-semibold text-foreground cursor-pointer">
                                    Card is Active & usable for drink checkouts
                                </label>
                            </div>

                            <div className="flex items-center gap-3 pt-4 border-t border-border/30">
                                <button
                                    type="button"
                                    onClick={() => setEditCardModalOpen(false)}
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-[#FAF6F0] hover:bg-[#F3ECE3]/60 text-[#2C1A14] font-bold text-xs uppercase tracking-wider transition-colors border border-border/40 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUpdatingCard}
                                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#C07C4A] hover:opacity-95 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#C07C4A]/15 cursor-pointer disabled:opacity-50"
                                >
                                    {isUpdatingCard ? (
                                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                                    ) : (
                                        "Save Changes"
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
