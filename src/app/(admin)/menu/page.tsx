"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Edit2, Trash2, X, Star, Save, Image as ImageIcon, Trash } from "lucide-react";

interface SizeOption {
    label: string;
    oz: string;
    adjPrice: number;
}

interface MilkOption {
    label: string;
    price: number;
}

interface ExtraOption {
    label: string;
    price: number;
}

interface MenuItem {
    id: string;
    name: string;
    shortDescription: string;
    fullDescription: string;
    category: string;
    price: number;
    starsReward: number;
    rating: number;
    ordersCount: number;
    isPopular: boolean;
    active: boolean;
    image: string;
    customOptionsEnabled: boolean;
    sizes: SizeOption[];
    milks: MilkOption[];
    extras: ExtraOption[];
}

const initialMenuItems: MenuItem[] = [
    {
        id: "M-01",
        name: "Flat White",
        price: 4.50,
        shortDescription: "Double ristretto, steamed microfoam",
        fullDescription: "A specialty espresso beverage containing double shot of ristretto espresso, combined with textured oat or dairy microfoam.",
        category: "Hot Drinks",
        starsReward: 45,
        rating: 4.5,
        ordersCount: 342,
        isPopular: true,
        active: true,
        image: "https://images.unsplash.com/photo-1577968897966-3d4325b36b61?auto=format&fit=crop&w=400&q=80",
        customOptionsEnabled: true,
        sizes: [
            { label: "Small", oz: "12oz", adjPrice: -0.50 },
            { label: "Medium", oz: "16oz", adjPrice: 0.00 },
            { label: "Large", oz: "20oz", adjPrice: 0.75 }
        ],
        milks: [
            { label: "Whole Milk", price: 0.00 },
            { label: "Oat Milk", price: 0.75 },
            { label: "Almond Milk", price: 0.50 }
        ],
        extras: [
            { label: "Extra Shot", price: 0.75 },
            { label: "Vanilla Syrup", price: 0.50 }
        ]
    },
    {
        id: "M-02",
        name: "Latte Art",
        price: 5.50,
        shortDescription: "Signature single origin, rosetta pour",
        fullDescription: "A beautiful cup of signature latte crafted using single-origin washed coffee beans, micro-foamed milk, poured with rosetta latte art.",
        category: "Hot Drinks",
        starsReward: 55,
        rating: 4.9,
        ordersCount: 287,
        isPopular: true,
        active: true,
        image: "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=400&q=80",
        customOptionsEnabled: true,
        sizes: [
            { label: "Regular", oz: "12oz", adjPrice: 0.00 },
            { label: "Large", oz: "16oz", adjPrice: 0.75 }
        ],
        milks: [
            { label: "Whole Milk", price: 0.00 },
            { label: "Oat Milk", price: 0.75 }
        ],
        extras: [
            { label: "Caramel Drizzle", price: 0.50 }
        ]
    },
    {
        id: "M-03",
        name: "Cold Brew",
        price: 5.00,
        shortDescription: "18-hr steep, smooth & low-acid",
        fullDescription: "Detailed description shown in drink detail screen...",
        category: "Iced",
        starsReward: 50,
        rating: 4.7,
        ordersCount: 198,
        isPopular: false,
        active: true,
        image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=400&q=80",
        customOptionsEnabled: true,
        sizes: [
            { label: "Small", oz: "12oz", adjPrice: -0.50 },
            { label: "Medium", oz: "16oz", adjPrice: 0.00 },
            { label: "Large", oz: "20oz", adjPrice: 0.75 }
        ],
        milks: [
            { label: "Whole", price: 0.00 }
        ],
        extras: [
            { label: "Extra Shot", price: 0.75 },
            { label: "Vanilla Syrup", price: 0.50 },
            { label: "Caramel Drizzle", price: 0.50 },
            { label: "Whipped Cream", price: 0.00 },
            { label: "Hazelnut Syrup", price: 0.50 },
            { label: "Cinnamon Dust", price: 0.00 }
        ]
    },
    {
        id: "M-04",
        name: "Iced Latte",
        price: 4.75,
        shortDescription: "Espresso over ice, choice of milk",
        fullDescription: "Bold espresso shots served over ice cubes with your choice of cold milk.",
        category: "Iced",
        starsReward: 47,
        rating: 4.6,
        ordersCount: 156,
        isPopular: false,
        active: false,
        image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=400&q=80",
        customOptionsEnabled: true,
        sizes: [
            { label: "Medium", oz: "16oz", adjPrice: 0.00 },
            { label: "Large", oz: "20oz", adjPrice: 0.75 }
        ],
        milks: [
            { label: "Whole Milk", price: 0.00 }
        ],
        extras: []
    },
    {
        id: "M-05",
        name: "Espresso",
        price: 3.50,
        shortDescription: "Single or double shot, pure origin",
        fullDescription: "A concentrated, bold espresso shot, using single-origin beans.",
        category: "Hot Drinks",
        starsReward: 35,
        rating: 4.9,
        ordersCount: 421,
        isPopular: false,
        active: true,
        image: "https://images.unsplash.com/photo-1510972527921-ce03766a1cf1?auto=format&fit=crop&w=400&q=80",
        customOptionsEnabled: false,
        sizes: [],
        milks: [],
        extras: []
    },
    {
        id: "M-06",
        name: "Seasonal Special",
        price: 5.75,
        shortDescription: "Hand-crafted seasonal creation",
        fullDescription: "Our special craft drink made with seasonal spices, extracts, and single-origin washed coffee beans.",
        category: "Blended",
        starsReward: 57,
        rating: 4.8,
        ordersCount: 134,
        isPopular: true,
        active: true,
        image: "https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=400&q=80",
        customOptionsEnabled: true,
        sizes: [
            { label: "Regular", oz: "12oz", adjPrice: 0.00 },
            { label: "Large", oz: "16oz", adjPrice: 0.75 }
        ],
        milks: [
            { label: "Whole Milk", price: 0.00 }
        ],
        extras: []
    }
];

export default function MenuManagement() {
    const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
    const [modalOpen, setModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);

    const [displayName, setDisplayName] = useState("Admin");
    const [roleTitle, setRoleTitle] = useState("Super Admin");

    useEffect(() => {
        const loadProfile = () => {
            const savedName = localStorage.getItem("bf_admin_name");
            const savedRole = localStorage.getItem("bf_admin_role");
            if (savedName) setDisplayName(savedName);
            if (savedRole) setRoleTitle(savedRole);
        };

        loadProfile();
        window.addEventListener("adminProfileUpdated", loadProfile);
        return () => {
            window.removeEventListener("adminProfileUpdated", loadProfile);
        };
    }, []);
    
    // Form fields state
    const [currentItemId, setCurrentItemId] = useState("");
    const [name, setName] = useState("");
    const [shortDescription, setShortDescription] = useState("");
    const [fullDescription, setFullDescription] = useState("");
    const [category, setCategory] = useState("Hot Drinks");
    const [price, setPrice] = useState(4.00);
    const [starsReward, setStarsReward] = useState(40);
    const [image, setImage] = useState("");
    const [isPopular, setIsPopular] = useState(false);
    const [active, setActive] = useState(true);
    
    // Custom options list state
    const [customOptionsEnabled, setCustomOptionsEnabled] = useState(true);
    const [activeTab, setActiveTab] = useState<"Sizes" | "Milks" | "Extras">("Sizes");
    const [sizes, setSizes] = useState<SizeOption[]>([]);
    const [milks, setMilks] = useState<MilkOption[]>([]);
    const [extras, setExtras] = useState<ExtraOption[]>([]);

    // Form inputs for adding options
    const [newSizeLabel, setNewSizeLabel] = useState("");
    const [newSizeOz, setNewSizeOz] = useState("");
    const [newSizeAdj, setNewSizeAdj] = useState(0);

    const [newMilkLabel, setNewMilkLabel] = useState("");
    const [newMilkPrice, setNewMilkPrice] = useState(0);

    const [newExtraLabel, setNewExtraLabel] = useState("");
    const [newExtraPrice, setNewExtraPrice] = useState(0);

    const handleToggleActive = (id: string) => {
        setMenuItems(prev => prev.map(item => 
            item.id === id ? { ...item, active: !item.active } : item
        ));
    };

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this menu item?")) {
            setMenuItems(prev => prev.filter(item => item.id !== id));
        }
    };

    const handleOpenAdd = () => {
        setEditMode(false);
        setName("");
        setShortDescription("");
        setFullDescription("");
        setCategory("Hot Drinks");
        setPrice(4.00);
        setStarsReward(40);
        setImage("");
        setIsPopular(false);
        setActive(true);
        setCustomOptionsEnabled(true);
        setSizes([
            { label: "Small", oz: "12oz", adjPrice: -0.50 },
            { label: "Medium", oz: "16oz", adjPrice: 0.00 },
            { label: "Large", oz: "20oz", adjPrice: 0.75 }
        ]);
        setMilks([{ label: "Whole", price: 0.00 }]);
        setExtras([]);
        setActiveTab("Sizes");
        setModalOpen(true);
    };

    const handleOpenEdit = (item: MenuItem) => {
        setEditMode(true);
        setCurrentItemId(item.id);
        setName(item.name);
        setShortDescription(item.shortDescription);
        setFullDescription(item.fullDescription);
        setCategory(item.category);
        setPrice(item.price);
        setStarsReward(item.starsReward);
        setImage(item.image);
        setIsPopular(item.isPopular);
        setActive(item.active);
        setCustomOptionsEnabled(item.customOptionsEnabled);
        setSizes(item.sizes || []);
        setMilks(item.milks || []);
        setExtras(item.extras || []);
        setActiveTab("Sizes");
        setModalOpen(true);
    };

    const handleAddSize = () => {
        if (!newSizeLabel || !newSizeOz) return;
        setSizes([...sizes, { label: newSizeLabel, oz: newSizeOz, adjPrice: newSizeAdj }]);
        setNewSizeLabel("");
        setNewSizeOz("");
        setNewSizeAdj(0);
    };

    const handleAddMilk = () => {
        if (!newMilkLabel) return;
        setMilks([...milks, { label: newMilkLabel, price: newMilkPrice }]);
        setNewMilkLabel("");
        setNewMilkPrice(0);
    };

    const handleAddExtra = () => {
        if (!newExtraLabel) return;
        setExtras([...extras, { label: newExtraLabel, price: newExtraPrice }]);
        setNewExtraLabel("");
        setNewExtraPrice(0);
    };

    const handleRemoveSize = (index: number) => {
        setSizes(sizes.filter((_, i) => i !== index));
    };

    const handleRemoveMilk = (index: number) => {
        setMilks(milks.filter((_, i) => i !== index));
    };

    const handleRemoveExtra = (index: number) => {
        setExtras(extras.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const defaultImage = "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=400&q=80";
        const finalImage = image.trim() !== "" ? image.trim() : defaultImage;

        if (editMode) {
            setMenuItems(prev => prev.map(item => 
                item.id === currentItemId 
                    ? { 
                        ...item, 
                        name, 
                        shortDescription, 
                        fullDescription, 
                        category, 
                        price, 
                        starsReward, 
                        image: finalImage, 
                        isPopular, 
                        active,
                        customOptionsEnabled,
                        sizes,
                        milks,
                        extras
                      }
                    : item
            ));
        } else {
            const newItem: MenuItem = {
                id: `M-${Math.floor(Math.random() * 900 + 100)}`,
                name,
                price,
                shortDescription,
                fullDescription,
                category,
                starsReward,
                rating: 5.0,
                ordersCount: 0,
                isPopular,
                active,
                image: finalImage,
                customOptionsEnabled,
                sizes,
                milks,
                extras
            };
            setMenuItems([...menuItems, newItem]);
        }
        
        setModalOpen(false);
    };

    return (
        <div className="flex-1 p-4 md:p-8 space-y-6 bg-[#FAF6F0] dark:bg-background min-h-screen text-foreground transition-colors duration-300">
            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
                <div>
                    <h1 className="font-serif text-3xl font-bold tracking-tight text-[#2C1A14] dark:text-white">Menu Management</h1>
                    <p className="text-sm text-muted-foreground mt-1">Bean Fien Admin Panel</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Manage menu items. Each item can have its own custom drink options.</p>
                </div>

                <button 
                    onClick={handleOpenAdd}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2C1A14] dark:bg-primary text-white dark:text-[#1E0F0B] font-bold text-xs uppercase tracking-wider hover:opacity-90 active:scale-[0.98] transition-all shadow-md shadow-[#2C1A14]/10 cursor-pointer"
                >
                    <Plus className="w-4.5 h-4.5" />
                    Add Item
                </button>
            </header>

            {/* Menu Grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {menuItems.map((item) => (
                    <div 
                        key={item.id} 
                        className={`
                            bg-white dark:bg-card rounded-3xl border border-border/60 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden relative
                            ${!item.active && "opacity-75"}
                        `}
                    >
                        {/* Coffee Image Container */}
                        <div 
                            className="h-48 w-full bg-cover bg-center relative" 
                            style={{ backgroundImage: `url(${item.image})` }}
                        >
                            {/* Badges on image */}
                            <div className="absolute inset-x-4 top-4 flex justify-between items-center">
                                {item.isPopular ? (
                                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-[#E89360] text-[#1E0F0B] shadow-sm animate-pulse">
                                        Popular
                                    </span>
                                ) : (
                                    <div />
                                )}

                                <button
                                    onClick={() => handleToggleActive(item.id)}
                                    className={`
                                        text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full shadow-sm transition-all duration-300 cursor-pointer
                                        ${item.active 
                                            ? "bg-[#6BC68C] text-[#113B20]" 
                                            : "bg-[#E05E5E] text-white"
                                        }
                                    `}
                                >
                                    {item.active ? "● ON" : "● OFF"}
                                </button>
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
                                        ${item.price.toFixed(2)}
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                                    {item.shortDescription}
                                </p>
                            </div>

                            {/* Rating and Orders */}
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#8B4513] dark:text-[#C07C4A]">
                                <Star className="w-3.5 h-3.5 fill-current" />
                                <span>{item.rating.toFixed(1)}</span>
                                <span className="text-muted-foreground font-normal ml-1">{item.ordersCount} orders</span>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2 pt-3 border-t border-border/30">
                                <button
                                    onClick={() => handleOpenEdit(item)}
                                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#FAF6F0] hover:bg-[#F3ECE3]/60 dark:bg-white/5 dark:hover:bg-white/10 text-[#2C1A14] dark:text-white font-bold text-xs uppercase tracking-wider transition-colors border border-border/40"
                                >
                                    <Edit2 className="w-3.5 h-3.5" />
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 transition-colors cursor-pointer"
                                    title="Delete Item"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </section>

            {/* ADD/EDIT ITEM MODAL (Screenshots 1, 2, 3) */}
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
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-[#F3ECE3]/30 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary text-sm font-medium"
                                    >
                                        <option value="Hot Drinks">Hot Drinks</option>
                                        <option value="Iced">Iced</option>
                                        <option value="Blended">Blended</option>
                                        <option value="Food">Food</option>
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Price ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={price}
                                        onChange={(e) => setPrice(Number(e.target.value))}
                                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-[#F3ECE3]/30 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary text-sm font-medium"
                                        placeholder="5"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Stars Reward</label>
                                <input
                                    type="number"
                                    required
                                    value={starsReward}
                                    onChange={(e) => setStarsReward(Number(e.target.value))}
                                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-[#F3ECE3]/30 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary text-sm font-medium"
                                    placeholder="50"
                                />
                            </div>

                            {/* Row 5: Item Photo */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Item Photo</label>
                                <div className="flex items-center gap-4">
                                    <div 
                                        className="w-16 h-16 rounded-2xl bg-cover bg-center border border-border flex-shrink-0"
                                        style={{ backgroundImage: `url(${image || "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=150&q=80"})` }}
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
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => {
                                                        setImage(reader.result as string);
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
                                        
                                        {image && (
                                            <button
                                                type="button"
                                                onClick={() => setImage("")}
                                                className="px-3 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 rounded-xl border border-red-500/20"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Mark as Popular Toggle */}
                            <div className="flex items-center justify-between py-2">
                                <span className="text-sm font-semibold">Mark as Popular</span>
                                <button
                                    type="button"
                                    onClick={() => setIsPopular(!isPopular)}
                                    className={`
                                        relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none
                                        ${isPopular ? "bg-[#C07C4A]" : "bg-zinc-300 dark:bg-zinc-700"}
                                    `}
                                >
                                    <span
                                        className={`
                                            pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                                            ${isPopular ? "translate-x-5" : "translate-x-0"}
                                        `}
                                    />
                                </button>
                            </div>

                            {/* CUSTOM DRINK OPTIONS SECTION */}
                            <div className="border-t border-border/30 pt-4 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-bold text-sm">Custom Drink Options</h3>
                                        <p className="text-[11px] text-muted-foreground">Override sizes, milks & extras for this item only</p>
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
                                                        py-1.5 rounded-lg text-xs font-semibold text-center transition-all duration-200
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
                                                {/* Sizes List */}
                                                <div className="space-y-2">
                                                    {sizes.map((s, idx) => (
                                                        <div key={idx} className="flex justify-between items-center bg-white dark:bg-card p-3 rounded-xl border border-border/40 text-xs">
                                                            <span className="font-semibold">{s.label}</span>
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-muted-foreground">{s.oz}</span>
                                                                <span className={`font-bold ${s.adjPrice < 0 ? "text-red-500" : "text-emerald-500"}`}>
                                                                    {s.adjPrice < 0 ? `-$${Math.abs(s.adjPrice).toFixed(2)}` : `+$${s.adjPrice.toFixed(2)}`}
                                                                </span>
                                                                <button type="button" onClick={() => handleRemoveSize(idx)} className="text-red-500 hover:text-red-600 transition-colors p-1">
                                                                    <Trash className="w-3.5 h-3.5" />
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
                                                            <Plus className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Milks Tab Panel */}
                                        {activeTab === "Milks" && (
                                            <div className="space-y-3">
                                                {/* Milks List */}
                                                <div className="space-y-2">
                                                    {milks.map((m, idx) => (
                                                        <div key={idx} className="flex justify-between items-center bg-white dark:bg-card p-3 rounded-xl border border-border/40 text-xs">
                                                            <span className="font-semibold">{m.label}</span>
                                                            <div className="flex items-center gap-3">
                                                                <span className="font-bold text-emerald-500">
                                                                    {m.price === 0 ? "Free" : `+$${m.price.toFixed(2)}`}
                                                                </span>
                                                                <button type="button" onClick={() => handleRemoveMilk(idx)} className="text-red-500 hover:text-red-600 transition-colors p-1">
                                                                    <Trash className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Add Milk Inputs */}
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-border/20">
                                                    <input type="text" value={newMilkLabel} onChange={(e) => setNewMilkLabel(e.target.value)} placeholder="e.g. Coconut" className="w-full px-3 py-1.5 rounded-lg border border-border bg-[#F3ECE3]/30 text-xs focus:outline-none" />
                                                    <input type="number" step="0.01" value={newMilkPrice} onChange={(e) => setNewMilkPrice(Number(e.target.value))} placeholder="$0.00" className="w-full px-3 py-1.5 rounded-lg border border-border bg-[#F3ECE3]/30 text-xs focus:outline-none" />
                                                    <button type="button" onClick={handleAddMilk} className="py-1.5 bg-[#2C1A14] hover:opacity-95 text-white rounded-lg text-xs font-bold flex justify-center items-center gap-1 cursor-pointer">
                                                        <Plus className="w-3.5 h-3.5" /> Add
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Extras Tab Panel */}
                                        {activeTab === "Extras" && (
                                            <div className="space-y-3">
                                                {/* Extras List */}
                                                <div className="space-y-2">
                                                    {extras.map((ex, idx) => (
                                                        <div key={idx} className="flex justify-between items-center bg-white dark:bg-card p-3 rounded-xl border border-border/40 text-xs">
                                                            <span className="font-semibold">{ex.label}</span>
                                                            <div className="flex items-center gap-3">
                                                                <span className="font-bold text-emerald-500">
                                                                    {ex.price === 0 ? "Free" : `+$${ex.price.toFixed(2)}`}
                                                                </span>
                                                                <button type="button" onClick={() => handleRemoveExtra(idx)} className="text-red-500 hover:text-red-600 transition-colors p-1">
                                                                    <Trash className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Add Extras Inputs */}
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-border/20">
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-bold text-muted-foreground uppercase">Extra Name</label>
                                                        <input type="text" value={newExtraLabel} onChange={(e) => setNewExtraLabel(e.target.value)} placeholder="e.g. Oat Milk Upgrade" className="w-full px-3 py-1.5 rounded-lg border border-border bg-[#F3ECE3]/30 text-xs focus:outline-none" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-bold text-muted-foreground uppercase">Price $</label>
                                                        <input type="number" step="0.01" value={newExtraPrice} onChange={(e) => setNewExtraPrice(Number(e.target.value))} placeholder="0.50" className="w-full px-3 py-1.5 rounded-lg border border-border bg-[#F3ECE3]/30 text-xs focus:outline-none" />
                                                    </div>
                                                    <div className="flex items-end">
                                                        <button type="button" onClick={handleAddExtra} className="w-full py-1.5 bg-[#2C1A14] hover:opacity-95 text-white rounded-lg text-xs font-bold flex justify-center items-center gap-1 cursor-pointer">
                                                            <Plus className="w-3.5 h-3.5" />
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
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-[#FAF6F0] hover:bg-[#F3ECE3]/60 text-[#2C1A14] font-bold text-xs uppercase tracking-wider transition-colors border border-border/40"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#2C1A14] hover:opacity-95 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#2C1A14]/15 cursor-pointer"
                                >
                                    <Save className="w-4 h-4" />
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
