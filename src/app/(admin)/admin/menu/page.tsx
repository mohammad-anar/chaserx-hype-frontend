"use client";
import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import NotificationDropdown from "@/components/NotificationDropdown";
import { 
    Plus, 
    Edit2, 
    Trash2, 
    X, 
    Star, 
    Save, 
    Image as ImageIcon, 
    Trash, 
    Search, 
    Loader2, 
    RefreshCw,
    Flame
} from "lucide-react";
import { 
    useGetProductsQuery, 
    useCreateProductMutation, 
    useUpdateProductMutation, 
    useDeleteProductMutation 
} from "@/redux/features/product/productApi";
import { useGetCategoriesQuery } from "@/redux/features/category/categoryApi";

interface SizeOption {
    id?: string;
    name: string;
    oz: string;
    priceAdjustment: number;
    adjustmentType: "ADD" | "SUBTRACT";
}

interface MilkOption {
    id?: string;
    name: string;
    priceAdjustment: number;
    adjustmentType: "ADD" | "SUBTRACT";
}

interface ExtraOption {
    id?: string;
    name: string;
    price: number;
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

export default function MenuManagement() {
    // Search, Filter & Pagination
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>("All");

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
    const { data: categoriesResponse } = useGetCategoriesQuery(undefined);
    const categoriesList = useMemo(() => {
        return categoriesResponse?.data || categoriesResponse || [];
    }, [categoriesResponse]);

    // Build query params
    const queryParams = useMemo(() => {
        const params: Record<string, any> = { 
            limit: 100,
            sortBy: "popular",
            sortOrder: "desc"
        };
        if (searchTerm.trim()) {
            params.searchTerm = searchTerm.trim();
        }
        if (selectedCategoryTab !== "All" && selectedCategoryTab !== "Popular") {
            const matchedCat = categoriesList.find((c: any) => c.name === selectedCategoryTab);
            if (matchedCat) {
                params.categoryId = matchedCat.id;
            }
        }
        return params;
    }, [searchTerm, selectedCategoryTab, categoriesList]);

    const { data: productsResponse, isLoading, isFetching, refetch } = useGetProductsQuery(queryParams);

    const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
    const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
    const [deleteProduct] = useDeleteProductMutation();

    const rawProducts = useMemo(() => {
        return productsResponse?.data || [];
    }, [productsResponse]);

    // Calculate maximum order count across all products for popular threshold calculation
    const maxOrderCount = useMemo(() => {
        if (!rawProducts.length) return 0;
        return Math.max(...rawProducts.map((p: any) => p._count?.orderItems || 0));
    }, [rawProducts]);

    // Process and sort products by order count (popularity) descending
    const processedProducts = useMemo(() => {
        let list = [...rawProducts];
        if (selectedCategoryTab === "Popular") {
            list = list.filter((p: any) => (p._count?.orderItems || 0) > 0);
        }
        return list.sort((a: any, b: any) => (b._count?.orderItems || 0) - (a._count?.orderItems || 0));
    }, [rawProducts, selectedCategoryTab]);

    // Modal & Form State
    const [modalOpen, setModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentItemId, setCurrentItemId] = useState("");

    const [name, setName] = useState("");
    const [shortDescription, setShortDescription] = useState("");
    const [fullDescription, setFullDescription] = useState("");
    const [selectedCategoryId, setSelectedCategoryId] = useState("");
    const [price, setPrice] = useState(4.00);
    const [starsReward, setStarsReward] = useState(40);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState("");
    const [active, setActive] = useState(true);

    // Custom options state
    const [customOptionsEnabled, setCustomOptionsEnabled] = useState(true);
    const [activeTab, setActiveTab] = useState<"Sizes" | "Milks" | "Extras">("Sizes");
    const [sizes, setSizes] = useState<SizeOption[]>([]);
    const [milks, setMilks] = useState<MilkOption[]>([]);
    const [extras, setExtras] = useState<ExtraOption[]>([]);

    // Inputs for adding new options
    const [newSizeLabel, setNewSizeLabel] = useState("");
    const [newSizeOz, setNewSizeOz] = useState("");
    const [newSizeAdj, setNewSizeAdj] = useState(0);

    const [newMilkLabel, setNewMilkLabel] = useState("");
    const [newMilkPrice, setNewMilkPrice] = useState(0);

    const [newExtraLabel, setNewExtraLabel] = useState("");
    const [newExtraPrice, setNewExtraPrice] = useState(0);

    const handleOpenAdd = () => {
        setEditMode(false);
        setCurrentItemId("");
        setName("");
        setShortDescription("");
        setFullDescription("");
        if (categoriesList.length > 0) {
            setSelectedCategoryId(categoriesList[0].id);
        } else {
            setSelectedCategoryId("");
        }
        setPrice(4.50);
        setStarsReward(45);
        setImageFile(null);
        setImagePreview("");
        setActive(true);
        setCustomOptionsEnabled(true);
        setSizes([
            { name: "Small", oz: "12oz", priceAdjustment: 0.50, adjustmentType: "SUBTRACT" },
            { name: "Medium", oz: "16oz", priceAdjustment: 0.00, adjustmentType: "ADD" },
            { name: "Large", oz: "20oz", priceAdjustment: 0.75, adjustmentType: "ADD" }
        ]);
        setMilks([{ name: "Whole Milk", priceAdjustment: 0.00, adjustmentType: "ADD" }]);
        setExtras([]);
        setActiveTab("Sizes");
        setModalOpen(true);
    };

    const handleOpenEdit = (product: any) => {
        setEditMode(true);
        setCurrentItemId(product.id);
        setName(product.name || "");
        setShortDescription(product.shortDescription || "");
        setFullDescription(product.description || "");
        setSelectedCategoryId(product.categoryId || (categoriesList[0]?.id || ""));
        setPrice(Number(product.basePrice || 0));
        setStarsReward(Number(product.coin || 0));
        setImageFile(null);
        setImagePreview(getProductImg(product));
        setActive(!product.isDeleted);
        setCustomOptionsEnabled(Boolean(product.customOption));

        setSizes(
            (product.productSizes || []).map((s: any) => ({
                id: s.id,
                name: s.name,
                oz: s.oz,
                priceAdjustment: Number(s.priceAdjustment || 0),
                adjustmentType: s.adjustmentType || "ADD",
            }))
        );

        setMilks(
            (product.productMilks || []).map((m: any) => ({
                id: m.id,
                name: m.name,
                priceAdjustment: Number(m.priceAdjustment || 0),
                adjustmentType: m.adjustmentType || "ADD",
            }))
        );

        setExtras(
            (product.productExtras || []).map((e: any) => ({
                id: e.id,
                name: e.name,
                price: Number(e.price || 0),
            }))
        );

        setActiveTab("Sizes");
        setModalOpen(true);
    };

    const handleDelete = async (id: string, productName: string) => {
        if (confirm(`Are you sure you want to delete "${productName}"?`)) {
            try {
                await deleteProduct(id).unwrap();
                toast.success(`"${productName}" deleted successfully.`);
            } catch (err: any) {
                toast.error(err?.data?.message || "Failed to delete product.");
            }
        }
    };

    // Add / Update / Remove Size Option Handlers
    const handleAddSize = () => {
        if (!newSizeLabel || !newSizeOz) return;
        setSizes([
            ...sizes,
            {
                name: newSizeLabel,
                oz: newSizeOz,
                priceAdjustment: Math.abs(newSizeAdj),
                adjustmentType: newSizeAdj < 0 ? "SUBTRACT" : "ADD",
            },
        ]);
        setNewSizeLabel("");
        setNewSizeOz("");
        setNewSizeAdj(0);
    };

    const handleUpdateSize = (index: number, field: keyof SizeOption, value: any) => {
        setSizes(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
    };

    const handleRemoveSize = (index: number) => {
        setSizes(sizes.filter((_, i) => i !== index));
    };

    // Add / Update / Remove Milk Option Handlers
    const handleAddMilk = () => {
        if (!newMilkLabel) return;
        setMilks([
            ...milks,
            {
                name: newMilkLabel,
                priceAdjustment: Math.abs(newMilkPrice),
                adjustmentType: "ADD",
            },
        ]);
        setNewMilkLabel("");
        setNewMilkPrice(0);
    };

    const handleUpdateMilk = (index: number, field: keyof MilkOption, value: any) => {
        setMilks(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
    };

    const handleRemoveMilk = (index: number) => {
        setMilks(milks.filter((_, i) => i !== index));
    };

    // Add / Update / Remove Extra Option Handlers
    const handleAddExtra = () => {
        if (!newExtraLabel) return;
        setExtras([
            ...extras,
            {
                name: newExtraLabel,
                price: Number(newExtraPrice || 0),
            },
        ]);
        setNewExtraLabel("");
        setNewExtraPrice(0);
    };

    const handleUpdateExtra = (index: number, field: keyof ExtraOption, value: any) => {
        setExtras(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
    };

    const handleRemoveExtra = (index: number) => {
        setExtras(extras.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error("Product name is required.");
            return;
        }

        const catId = selectedCategoryId || (categoriesList[0]?.id || "");
        if (!catId) {
            toast.error("Please select or create a product category.");
            return;
        }

        const formData = new FormData();
        formData.append("name", name.trim());
        formData.append("shortDescription", shortDescription.trim());
        formData.append("description", fullDescription.trim() || shortDescription.trim());
        formData.append("basePrice", String(price));
        formData.append("coin", String(starsReward));
        formData.append("categoryId", catId);
        formData.append("customOption", String(customOptionsEnabled));

        if (customOptionsEnabled) {
            formData.append("productSize", JSON.stringify(sizes));
            formData.append("productMilk", JSON.stringify(milks));
            formData.append("productExtra", JSON.stringify(extras));
        } else {
            formData.append("productSize", JSON.stringify([]));
            formData.append("productMilk", JSON.stringify([]));
            formData.append("productExtra", JSON.stringify([]));
        }

        if (imageFile) {
            formData.append("image", imageFile);
        }

        try {
            if (editMode) {
                await updateProduct({ id: currentItemId, data: formData }).unwrap();
                toast.success(`Product "${name}" updated successfully.`);
            } else {
                await createProduct(formData).unwrap();
                toast.success(`Product "${name}" created successfully.`);
            }
            setModalOpen(false);
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to save product details.");
        }
    };

    return (
        <div className="flex-1 p-4 md:p-8 space-y-6 bg-[#FAF6F0] dark:bg-background min-h-screen text-foreground transition-colors duration-300">
            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
                <div>
                    <h1 className="font-serif text-3xl font-bold tracking-tight text-[#2C1A14] dark:text-white">Menu Management</h1>
                    <p className="text-sm text-muted-foreground mt-1">Bean Fien Admin Panel</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Manage products and custom drink options connected to live database.</p>
                </div>

                <div className="flex items-center gap-3">
                    <NotificationDropdown />
                    <button
                        onClick={() => refetch()}
                        disabled={isFetching}
                        className="p-2.5 rounded-xl border border-border bg-white dark:bg-card hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
                        title="Refresh Products"
                    >
                        <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin text-primary" : ""}`} />
                    </button>

                    <button 
                        onClick={handleOpenAdd}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2C1A14] dark:bg-primary text-white dark:text-[#1E0F0B] font-bold text-xs uppercase tracking-wider hover:opacity-90 active:scale-[0.98] transition-all shadow-md shadow-[#2C1A14]/10 cursor-pointer"
                    >
                        <Plus className="w-4.5 h-4.5" />
                        Add Item
                    </button>
                </div>
            </header>

            {/* Filter and Search Bar */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                {/* Search */}
                <div className="relative w-full xl:w-80">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search menu items..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-white dark:bg-[#1E0F0B] text-sm focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary transition-all placeholder:text-muted-foreground/60"
                    />
                </div>

                {/* Category Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
                    {["All", "Popular", ...categoriesList.map((c: any) => c.name)].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setSelectedCategoryTab(tab)}
                            className={`
                                px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-1.5
                                ${selectedCategoryTab === tab 
                                    ? "bg-[#2C1A14] dark:bg-primary text-white dark:text-[#1E0F0B] shadow-sm" 
                                    : "bg-white dark:bg-card text-muted-foreground hover:text-foreground border border-border/60"
                                }
                            `}
                        >
                            {tab === "Popular" && <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Menu Grid */}
            {isLoading ? (
                <div className="py-24 text-center text-muted-foreground flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <span className="text-sm font-semibold">Loading menu items from database...</span>
                </div>
            ) : processedProducts.length > 0 ? (
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {processedProducts.map((item: any) => {
                        const ordersCount = item._count?.orderItems || 0;
                        const isPopular = ordersCount > 0 && (ordersCount >= 3 || (maxOrderCount > 0 && ordersCount >= maxOrderCount * 0.4));
                        const itemImg = getProductImg(item);
                        const categoryName = item.category?.name || "General";
                        const priceNum = Number(item.basePrice || 0);

                        return (
                            <div 
                                key={item.id} 
                                className={`
                                    bg-white dark:bg-card rounded-3xl border border-border/60 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden relative
                                `}
                            >
                                {/* Coffee Image Container */}
                                <div 
                                    className="h-48 w-full bg-cover bg-center relative" 
                                    style={{ backgroundImage: `url(${itemImg})` }}
                                >
                                    {/* Badges on image */}
                                    <div className="absolute inset-x-4 top-4 flex justify-between items-center">
                                        {isPopular ? (
                                            <span className="text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-[#E89360] text-[#1E0F0B] shadow-sm flex items-center gap-1 animate-pulse">
                                                <Flame className="w-3 h-3 fill-current" /> Popular ({ordersCount})
                                            </span>
                                        ) : (
                                            <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-black/60 text-white backdrop-blur-sm">
                                                {categoryName}
                                            </span>
                                        )}

                                        <span className="text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full bg-[#6BC68C] text-[#113B20] shadow-sm">
                                            ● ACTIVE
                                        </span>
                                    </div>
                                </div>

                                {/* Card Content */}
                                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                                    <div className="space-y-1">
                                        <div className="flex justify-between items-start gap-3">
                                            <h3 className="font-serif font-bold text-lg text-[#2C1A14] dark:text-white leading-tight">
                                                {item.name}
                                            </h3>
                                            <span className="font-extrabold text-lg text-[#8B4513] dark:text-[#C07C4A]">
                                                ${priceNum.toFixed(2)}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                                            {item.shortDescription}
                                        </p>
                                    </div>

                                    {/* Rating, Coins and Orders Count */}
                                    <div className="flex items-center justify-between text-xs font-semibold">
                                        <div className="flex items-center gap-1.5 text-[#8B4513] dark:text-[#C07C4A]">
                                            <Star className="w-3.5 h-3.5 fill-current" />
                                            <span>4.9</span>
                                            <span className="text-muted-foreground font-normal ml-1">
                                                · {ordersCount} order{ordersCount !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                        <span className="text-[11px] font-extrabold text-[#8B4513] dark:text-[#C07C4A] bg-[#8B4513]/10 px-2 py-0.5 rounded-md">
                                            +{item.coin || 0} Coins
                                        </span>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2 pt-3 border-t border-border/30">
                                        <button
                                            onClick={() => handleOpenEdit(item)}
                                            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#FAF6F0] hover:bg-[#F3ECE3]/60 dark:bg-white/5 dark:hover:bg-white/10 text-[#2C1A14] dark:text-white font-bold text-xs uppercase tracking-wider transition-colors border border-border/40 cursor-pointer"
                                        >
                                            <Edit2 className="w-3.5 h-3.5" />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id, item.name)}
                                            className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 transition-colors cursor-pointer"
                                            title="Delete Item"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </section>
            ) : (
                <div className="py-20 text-center text-muted-foreground bg-white dark:bg-card rounded-3xl border border-border/60 p-8">
                    <p className="text-base font-semibold">No menu items found.</p>
                    <p className="text-xs text-muted-foreground mt-1">Try clearing your search or add a new menu product.</p>
                </div>
            )}

            {/* ADD/EDIT ITEM MODAL */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#1E0F0B] w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-border/80 relative animate-in fade-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="p-6 pb-4 border-b border-border/30 flex justify-between items-start">
                            <div>
                                <h2 className="font-serif text-xl font-bold text-[#2C1A14] dark:text-white">
                                    {editMode ? "Edit Menu Item" : "Add Menu Item"}
                                </h2>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {editMode ? name : "Create a new drink or food option"}
                                </p>
                            </div>
                            <button 
                                onClick={() => setModalOpen(false)}
                                className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full text-muted-foreground hover:text-foreground transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
                            {/* Row 1: Item Name */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Item Name</label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-[#F3ECE3]/30 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary text-sm font-medium"
                                    placeholder="Cold Brew"
                                />
                            </div>

                            {/* Row 2: Short Description */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Short Description</label>
                                <input
                                    type="text"
                                    required
                                    value={shortDescription}
                                    onChange={(e) => setShortDescription(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-[#F3ECE3]/30 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary text-sm font-medium"
                                    placeholder="18-hr steep, smooth & low-acid"
                                />
                            </div>

                            {/* Row 3: Full Description */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Full Description</label>
                                <textarea
                                    value={fullDescription}
                                    onChange={(e) => setFullDescription(e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-[#F3ECE3]/30 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary text-sm font-medium resize-none"
                                    placeholder="Detailed description shown in drink detail screen..."
                                />
                            </div>

                            {/* Row 4: Category, Price, Stars Reward */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Category</label>
                                    <select
                                        value={selectedCategoryId}
                                        onChange={(e) => setSelectedCategoryId(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-[#F3ECE3]/30 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary text-sm font-medium"
                                    >
                                        {categoriesList.map((c: any) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Base Price ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={price}
                                        onChange={(e) => setPrice(Number(e.target.value))}
                                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-[#F3ECE3]/30 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary text-sm font-medium"
                                        placeholder="4.50"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Coins Reward / Value</label>
                                <input
                                    type="number"
                                    required
                                    value={starsReward}
                                    onChange={(e) => setStarsReward(Number(e.target.value))}
                                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-[#F3ECE3]/30 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary text-sm font-medium"
                                    placeholder="45"
                                />
                            </div>

                            {/* Row 5: Item Photo */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Item Photo</label>
                                <div className="flex items-center gap-4">
                                    <div 
                                        className="w-16 h-16 rounded-2xl bg-cover bg-center border border-border flex-shrink-0"
                                        style={{ backgroundImage: `url(${imagePreview || "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=150&q=80"})` }}
                                    />
                                    
                                    <div className="flex-1 flex gap-2">
                                        <input 
                                            type="file"
                                            id="menu-item-photo-upload"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    setImageFile(file);
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => {
                                                        setImagePreview(reader.result as string);
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                        />
                                        <label
                                            htmlFor="menu-item-photo-upload"
                                            className="flex-1 px-4 py-2.5 rounded-xl border border-dashed border-border hover:bg-[#F3ECE3]/30 dark:hover:bg-white/5 font-bold text-xs text-[#8B4513] dark:text-[#C07C4A] text-center flex items-center justify-center gap-1.5 cursor-pointer"
                                        >
                                            <ImageIcon className="w-4 h-4" /> Change Photo
                                        </label>
                                        
                                        {imagePreview && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setImageFile(null);
                                                    setImagePreview("");
                                                }}
                                                className="px-3 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 rounded-xl border border-red-500/20"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* CUSTOM DRINK OPTIONS SECTION */}
                            <div className="border-t border-border/30 pt-4 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-bold text-sm">Custom Options Enabled</h3>
                                        <p className="text-[11px] text-muted-foreground">Sizes, milks & extra toppings for this product</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setCustomOptionsEnabled(!customOptionsEnabled)}
                                        className={`
                                            relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none
                                            ${customOptionsEnabled ? "bg-[#2C1A14] dark:bg-primary" : "bg-zinc-300 dark:bg-zinc-700"}
                                        `}
                                    >
                                        <span
                                            className={`
                                                pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                                                ${customOptionsEnabled ? "translate-x-5" : "translate-x-0"}
                                            `}
                                        />
                                    </button>
                                </div>

                                {customOptionsEnabled && (
                                    <div className="bg-[#FAF6F0] dark:bg-black/10 rounded-2xl p-4 border border-border/40 space-y-4">
                                        {/* Tabs: Sizes, Milks, Extras */}
                                        <div className="grid grid-cols-3 bg-[#FAF6F0] dark:bg-[#1E0F0B] p-1 rounded-xl border border-border/40">
                                            {(["Sizes", "Milks", "Extras"] as const).map((tab) => (
                                                <button
                                                    key={tab}
                                                    type="button"
                                                    onClick={() => setActiveTab(tab)}
                                                    className={`
                                                        py-1.5 rounded-lg text-xs font-semibold text-center transition-all duration-200 cursor-pointer
                                                        ${activeTab === tab 
                                                            ? "bg-white dark:bg-card text-primary shadow-sm border-b-2 border-primary" 
                                                            : "text-muted-foreground hover:text-primary"
                                                        }
                                                    `}
                                                >
                                                    {tab}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Sizes Tab Panel */}
                                        {activeTab === "Sizes" && (
                                            <div className="space-y-3">
                                                {/* Editable Sizes List */}
                                                <div className="space-y-2">
                                                    {sizes.map((s, idx) => (
                                                        <div key={idx} className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-center bg-white dark:bg-card p-3 rounded-xl border border-border/40 text-xs">
                                                            <input
                                                                type="text"
                                                                value={s.name}
                                                                onChange={(e) => handleUpdateSize(idx, "name", e.target.value)}
                                                                className="px-2 py-1 rounded border border-border bg-[#F3ECE3]/30 dark:bg-zinc-900 font-semibold focus:outline-none"
                                                                placeholder="Size name"
                                                            />
                                                            <input
                                                                type="text"
                                                                value={s.oz}
                                                                onChange={(e) => handleUpdateSize(idx, "oz", e.target.value)}
                                                                className="px-2 py-1 rounded border border-border bg-[#F3ECE3]/30 dark:bg-zinc-900 focus:outline-none"
                                                                placeholder="12oz"
                                                            />
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                value={s.priceAdjustment}
                                                                onChange={(e) => handleUpdateSize(idx, "priceAdjustment", Number(e.target.value))}
                                                                className="px-2 py-1 rounded border border-border bg-[#F3ECE3]/30 dark:bg-zinc-900 font-bold focus:outline-none"
                                                                placeholder="Price Adj"
                                                            />
                                                            <select
                                                                value={s.adjustmentType}
                                                                onChange={(e) => handleUpdateSize(idx, "adjustmentType", e.target.value as "ADD" | "SUBTRACT")}
                                                                className="px-2 py-1 rounded border border-border bg-[#F3ECE3]/30 dark:bg-zinc-900 font-medium focus:outline-none"
                                                            >
                                                                <option value="ADD">+ Add Price</option>
                                                                <option value="SUBTRACT">- Subtract</option>
                                                            </select>
                                                            <div className="flex justify-end">
                                                                <button type="button" onClick={() => handleRemoveSize(idx)} className="text-red-500 hover:text-red-600 transition-colors p-1" title="Delete Size">
                                                                    <Trash className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Add Size Inputs */}
                                                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2 border-t border-border/20">
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-bold text-muted-foreground uppercase">Label</label>
                                                        <input type="text" value={newSizeLabel} onChange={(e) => setNewSizeLabel(e.target.value)} placeholder="Large" className="w-full px-3 py-1.5 rounded-lg border border-border bg-[#F3ECE3]/30 text-xs focus:outline-none" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-bold text-muted-foreground uppercase">Oz</label>
                                                        <input type="text" value={newSizeOz} onChange={(e) => setNewSizeOz(e.target.value)} placeholder="20oz" className="w-full px-3 py-1.5 rounded-lg border border-border bg-[#F3ECE3]/30 text-xs focus:outline-none" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-bold text-muted-foreground uppercase">Adj $</label>
                                                        <input type="number" step="0.01" value={newSizeAdj} onChange={(e) => setNewSizeAdj(Number(e.target.value))} className="w-full px-3 py-1.5 rounded-lg border border-border bg-[#F3ECE3]/30 text-xs focus:outline-none" />
                                                    </div>
                                                    <div className="flex items-end">
                                                        <button type="button" onClick={handleAddSize} className="w-full py-1.5 bg-[#2C1A14] hover:opacity-95 text-white rounded-lg text-xs font-bold flex justify-center items-center gap-1 cursor-pointer">
                                                            <Plus className="w-3.5 h-3.5" /> Add Size
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Milks Tab Panel */}
                                        {activeTab === "Milks" && (
                                            <div className="space-y-3">
                                                {/* Editable Milks List */}
                                                <div className="space-y-2">
                                                    {milks.map((m, idx) => (
                                                        <div key={idx} className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center bg-white dark:bg-card p-3 rounded-xl border border-border/40 text-xs">
                                                            <input
                                                                type="text"
                                                                value={m.name}
                                                                onChange={(e) => handleUpdateMilk(idx, "name", e.target.value)}
                                                                className="px-2 py-1 rounded border border-border bg-[#F3ECE3]/30 dark:bg-zinc-900 font-semibold focus:outline-none"
                                                                placeholder="Milk option name"
                                                            />
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                value={m.priceAdjustment}
                                                                onChange={(e) => handleUpdateMilk(idx, "priceAdjustment", Number(e.target.value))}
                                                                className="px-2 py-1 rounded border border-border bg-[#F3ECE3]/30 dark:bg-zinc-900 font-bold focus:outline-none"
                                                                placeholder="Price"
                                                            />
                                                            <select
                                                                value={m.adjustmentType}
                                                                onChange={(e) => handleUpdateMilk(idx, "adjustmentType", e.target.value as "ADD" | "SUBTRACT")}
                                                                className="px-2 py-1 rounded border border-border bg-[#F3ECE3]/30 dark:bg-zinc-900 font-medium focus:outline-none"
                                                            >
                                                                <option value="ADD">+ Add Price</option>
                                                                <option value="SUBTRACT">- Subtract</option>
                                                            </select>
                                                            <div className="flex justify-end">
                                                                <button type="button" onClick={() => handleRemoveMilk(idx)} className="text-red-500 hover:text-red-600 transition-colors p-1" title="Delete Milk">
                                                                    <Trash className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Add Milk Inputs */}
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-border/20">
                                                    <input type="text" value={newMilkLabel} onChange={(e) => setNewMilkLabel(e.target.value)} placeholder="e.g. Oat Milk" className="w-full px-3 py-1.5 rounded-lg border border-border bg-[#F3ECE3]/30 text-xs focus:outline-none" />
                                                    <input type="number" step="0.01" value={newMilkPrice} onChange={(e) => setNewMilkPrice(Number(e.target.value))} placeholder="$0.75" className="w-full px-3 py-1.5 rounded-lg border border-border bg-[#F3ECE3]/30 text-xs focus:outline-none" />
                                                    <button type="button" onClick={handleAddMilk} className="py-1.5 bg-[#2C1A14] hover:opacity-95 text-white rounded-lg text-xs font-bold flex justify-center items-center gap-1 cursor-pointer">
                                                        <Plus className="w-3.5 h-3.5" /> Add Milk
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Extras Tab Panel */}
                                        {activeTab === "Extras" && (
                                            <div className="space-y-3">
                                                {/* Editable Extras List */}
                                                <div className="space-y-2">
                                                    {extras.map((ex, idx) => (
                                                        <div key={idx} className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center bg-white dark:bg-card p-3 rounded-xl border border-border/40 text-xs">
                                                            <input
                                                                type="text"
                                                                value={ex.name}
                                                                onChange={(e) => handleUpdateExtra(idx, "name", e.target.value)}
                                                                className="px-2 py-1 rounded border border-border bg-[#F3ECE3]/30 dark:bg-zinc-900 font-semibold focus:outline-none"
                                                                placeholder="Extra topping name"
                                                            />
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                value={ex.price}
                                                                onChange={(e) => handleUpdateExtra(idx, "price", Number(e.target.value))}
                                                                className="px-2 py-1 rounded border border-border bg-[#F3ECE3]/30 dark:bg-zinc-900 font-bold focus:outline-none"
                                                                placeholder="Price"
                                                            />
                                                            <div className="flex justify-end">
                                                                <button type="button" onClick={() => handleRemoveExtra(idx)} className="text-red-500 hover:text-red-600 transition-colors p-1" title="Delete Extra">
                                                                    <Trash className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Add Extras Inputs */}
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-border/20">
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-bold text-muted-foreground uppercase">Extra Name</label>
                                                        <input type="text" value={newExtraLabel} onChange={(e) => setNewExtraLabel(e.target.value)} placeholder="e.g. Vanilla Syrup" className="w-full px-3 py-1.5 rounded-lg border border-border bg-[#F3ECE3]/30 text-xs focus:outline-none" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-bold text-muted-foreground uppercase">Price $</label>
                                                        <input type="number" step="0.01" value={newExtraPrice} onChange={(e) => setNewExtraPrice(Number(e.target.value))} placeholder="0.50" className="w-full px-3 py-1.5 rounded-lg border border-border bg-[#F3ECE3]/30 text-xs focus:outline-none" />
                                                    </div>
                                                    <div className="flex items-end">
                                                        <button type="button" onClick={handleAddExtra} className="w-full py-1.5 bg-[#2C1A14] hover:opacity-95 text-white rounded-lg text-xs font-bold flex justify-center items-center gap-1 cursor-pointer">
                                                            <Plus className="w-3.5 h-3.5" /> Add Extra
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Footer Buttons */}
                            <div className="flex items-center gap-3 pt-4 border-t border-border/30">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-[#FAF6F0] hover:bg-[#F3ECE3]/60 text-[#2C1A14] font-bold text-xs uppercase tracking-wider transition-colors border border-border/40 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreating || isUpdating}
                                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#2C1A14] hover:opacity-95 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#2C1A14]/15 cursor-pointer disabled:opacity-50"
                                >
                                    {isCreating || isUpdating ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            Save Changes
                                        </>
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
