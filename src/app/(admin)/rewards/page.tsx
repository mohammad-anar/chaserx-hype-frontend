"use client";
import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
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
    Image as ImageIcon 
} from "lucide-react";

interface Reward {
    id: string;
    title: string;
    type: "DRINK" | "FOOD" | "DISCOUNT" | "PROMO";
    starsRequired: number;
    claimedCount: number;
    active: boolean;
}

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

const initialRewards: Reward[] = [
    { id: "R-01", title: "Free Flat White", type: "DRINK", starsRequired: 1000, claimedCount: 24, active: true },
    { id: "R-02", title: "Free Pastry", type: "FOOD", starsRequired: 600, claimedCount: 41, active: true },
    { id: "R-03", title: "10% Off Order", type: "DISCOUNT", starsRequired: 400, claimedCount: 67, active: true },
    { id: "R-04", title: "Double Stars Day", type: "PROMO", starsRequired: 0, claimedCount: 0, active: false },
    { id: "R-05", title: "Birthday Free Drink", type: "PROMO", starsRequired: 0, claimedCount: 15, active: true }
];

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

export default function Rewards() {
    // Rewards state
    const [rewards, setRewards] = useState<Reward[]>(initialRewards);
    const [rewardModalOpen, setRewardModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedRewardId, setSelectedRewardId] = useState("");

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
    
    // Reward Modal Fields
    const [rewardName, setRewardName] = useState("Hot Coffee");
    const [rewardStars, setRewardStars] = useState(0);
    const [rewardActive, setRewardActive] = useState(true);

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

    // Summary calculations
    const activeRewardsCount = useMemo(() => rewards.filter(r => r.active).length, [rewards]);
    const totalClaimedCount = useMemo(() => rewards.reduce((sum, r) => sum + r.claimedCount, 0), [rewards]);
    
    const pendingRequestsCount = useMemo(() => requests.filter(r => r.status === "Pending").length, [requests]);

    const filteredRequests = useMemo(() => {
        if (requestTab === "Pending") {
            return requests.filter(r => r.status === "Pending");
        }
        return requests;
    }, [requests, requestTab]);

    // Reward catalog actions
    const handleOpenAddReward = () => {
        setEditMode(false);
        setRewardName("Hot Coffee");
        setRewardStars(0);
        setRewardActive(true);
        setRewardModalOpen(true);
    };

    const handleOpenEditReward = (reward: Reward) => {
        setEditMode(true);
        setSelectedRewardId(reward.id);
        setRewardName(reward.title);
        setRewardStars(reward.starsRequired);
        setRewardActive(reward.active);
        setRewardModalOpen(true);
    };

    const handleSaveReward = (e: React.FormEvent) => {
        e.preventDefault();

        // Infer type from title
        let type: "DRINK" | "FOOD" | "DISCOUNT" | "PROMO" = "DRINK";
        const titleLower = rewardName.toLowerCase();
        if (titleLower.includes("pastry") || titleLower.includes("food") || titleLower.includes("muffin")) {
            type = "FOOD";
        } else if (titleLower.includes("%") || titleLower.includes("off") || titleLower.includes("discount")) {
            type = "DISCOUNT";
        } else if (titleLower.includes("double") || titleLower.includes("birthday") || titleLower.includes("promo")) {
            type = "PROMO";
        }

        if (editMode) {
            setRewards(prev => prev.map(r => 
                r.id === selectedRewardId 
                    ? { ...r, title: rewardName, starsRequired: rewardStars, active: rewardActive, type }
                    : r
            ));
        } else {
            const newReward: Reward = {
                id: `R-${Math.floor(Math.random() * 900 + 100)}`,
                title: rewardName,
                type,
                starsRequired: rewardStars,
                claimedCount: 0,
                active: rewardActive
            };
            setRewards([...rewards, newReward]);
        }
        setRewardModalOpen(false);
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
            alert("Please enter a valid gift card code first!");
            return;
        }

        setRequests(prev => prev.map(req => 
            req.id === id ? { ...req, status: "Sent", code: code.trim() } : req
        ));
        alert(`Gift card code "${code}" sent to customer!`);
    };

    return (
        <div className="flex-1 p-4 md:p-8 space-y-6 bg-[#FAF6F0] dark:bg-background min-h-screen text-foreground transition-colors duration-300">
            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
                <div>
                    <h1 className="font-serif text-3xl font-bold tracking-tight text-[#2C1A14] dark:text-white">Rewards</h1>
                    <p className="text-sm text-muted-foreground mt-1">Bean Fien Admin Panel</p>
                </div>

                <div className="flex items-center gap-3">
                    <Link 
                        href="/settings?profile=true"
                        className="flex items-center gap-3 px-3 py-1.5 rounded-xl border border-border bg-white dark:bg-card hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors text-left"
                    >
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-primary/10 border border-primary/20 flex items-center justify-center relative">
                            {adminPhoto ? (
                                <img src={adminPhoto} alt="Admin" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-sm font-semibold text-primary">BF</span>
                            )}
                        </div>
                        <div className="hidden sm:block text-left">
                            <h4 className="text-xs font-bold leading-tight">{displayName}</h4>
                            <p className="text-[10px] text-muted-foreground">{roleTitle}</p>
                        </div>
                    </Link>
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

                {/* Stars Redeemed */}
                <div className="bg-white dark:bg-card p-6 rounded-2xl border border-border/60 shadow-sm flex items-center gap-4 min-h-[100px]">
                    <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl">
                        <Star className="w-6 h-6 fill-current" />
                    </div>
                    <div>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Stars Redeemed</span>
                        <h2 className="font-serif text-3xl font-extrabold text-[#2C1A14] dark:text-white mt-1">12.4K</h2>
                    </div>
                </div>
            </section>

            {/* Reward Catalog Section */}
            <div className="bg-white dark:bg-card p-6 rounded-3xl border border-border/60 shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="font-serif text-lg font-bold text-[#2C1A14] dark:text-white">Reward Catalog</h3>
                    <button
                        onClick={handleOpenAddReward}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2C1A14] dark:bg-primary text-white dark:text-[#1E0F0B] font-bold text-xs uppercase tracking-wider hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        New Reward
                    </button>
                </div>

                {/* Rewards List */}
                <div className="space-y-3">
                    {rewards.map((reward) => (
                        <div key={reward.id} className="p-4 bg-[#FAF6F0]/40 dark:bg-black/10 rounded-2xl border border-border/40 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                {/* Gift Circle Icon */}
                                <div className="w-12 h-12 rounded-2xl bg-[#8B4513] text-white flex items-center justify-center shadow-md flex-shrink-0">
                                    <Gift className="w-5 h-5" />
                                </div>
                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-serif font-bold text-sm text-[#2C1A14] dark:text-white leading-tight">{reward.title}</h4>
                                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-white/5 rounded-md text-[9px] font-bold text-muted-foreground">
                                            {reward.type}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {reward.starsRequired > 0 ? (
                                            <span className="text-[#8B4513] dark:text-[#C07C4A] font-semibold">★ {reward.starsRequired} stars required</span>
                                        ) : (
                                            <span className="text-red-500 font-semibold">0 for promo</span>
                                        )}
                                        <span className="ml-2 font-normal">{reward.claimedCount} claimed</span>
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={() => handleOpenEditReward(reward)}
                                    className="p-2 border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-xl text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors"
                                >
                                    <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <span className={`
                                    px-3 py-1 rounded-full text-xs font-semibold
                                    ${reward.active 
                                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                                        : "bg-red-500/10 text-red-600 dark:text-red-400"
                                    }
                                `}>
                                    {reward.active ? "Active" : "Inactive"}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
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
                                        className="p-0.5 rounded-full hover:bg-red-500/10 text-red-500 transition-colors"
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
                                            className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 rounded-lg border border-red-500/20 transition-colors"
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
                                                <button type="button" onClick={() => setNewDesignImage("")} className="text-red-500"><X className="w-4 h-4" /></button>
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

            {/* Gift Card Requests Section (Screenshot 2) */}
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
                                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${requestTab === tab ? "bg-[#2C1A14] dark:bg-primary text-white dark:text-[#1E0F0B] shadow-sm font-bold" : "text-muted-foreground hover:text-[#2C1A14]"}`}
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

            {/* NEW/EDIT REWARD MODAL (Screenshot 3) */}
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
                                    {editMode ? "Modify reward catalog item" : "Add a reward to the catalog"}
                                </p>
                            </div>
                            <button 
                                onClick={() => setRewardModalOpen(false)}
                                className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full text-muted-foreground hover:text-foreground transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSaveReward} className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Item name</label>
                                <select
                                    value={rewardName}
                                    onChange={(e) => setRewardName(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-[#F3ECE3]/40 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary text-sm font-semibold"
                                >
                                    <option value="Free Flat White">Free Flat White</option>
                                    <option value="Free Espresso">Free Espresso</option>
                                    <option value="Free Pastry">Free Pastry</option>
                                    <option value="10% Off Order">10% Off Order</option>
                                    <option value="Double Stars Day">Double Stars Day</option>
                                    <option value="Birthday Free Drink">Birthday Free Drink</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Stars Required</label>
                                <input
                                    type="number"
                                    value={rewardStars}
                                    onChange={(e) => setRewardStars(Number(e.target.value))}
                                    placeholder="0 for promo"
                                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-[#F3ECE3]/40 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary text-sm font-semibold"
                                />
                            </div>

                            {/* Active Switch Toggle */}
                            <div className="flex items-center gap-3 py-2">
                                <button
                                    type="button"
                                    onClick={() => setRewardActive(!rewardActive)}
                                    className={`
                                        relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none
                                        ${rewardActive ? "bg-primary" : "bg-zinc-300 dark:bg-zinc-700"}
                                    `}
                                >
                                    <span
                                        className={`
                                            pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                                            ${rewardActive ? "translate-x-5" : "translate-x-0"}
                                        `}
                                    />
                                </button>
                                <span className={`text-xs font-semibold ${rewardActive ? "text-emerald-500" : "text-muted-foreground"}`}>
                                    Active
                                </span>
                            </div>

                            {/* Footer Buttons */}
                            <div className="flex items-center gap-3 pt-4 border-t border-border/30">
                                <button
                                    type="button"
                                    onClick={() => setRewardModalOpen(false)}
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-[#FAF6F0] hover:bg-[#F3ECE3]/60 text-[#2C1A14] font-bold text-xs uppercase tracking-wider transition-colors border border-border/40"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-[#C07C4A] hover:opacity-95 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#C07C4A]/15 cursor-pointer"
                                >
                                    {editMode ? "Save Reward" : "Create Reward"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
