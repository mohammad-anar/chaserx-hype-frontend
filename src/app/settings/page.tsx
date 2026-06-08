"use client";
import React, { useState } from "react";
import { Star, DollarSign, X, Camera } from "lucide-react";

export default function Settings() {
    // Loyalty Program States
    const [starsPerDollar, setStarsPerDollar] = useState(10);
    const [minOrderForStars, setMinOrderForStars] = useState(3.00);

    // System States
    const [autoNotifications, setAutoNotifications] = useState(true);
    const [maintenanceMode, setMaintenanceMode] = useState(false);

    // Profile States
    const [profileModalOpen, setProfileModalOpen] = useState(false);
    const [adminPhoto, setAdminPhoto] = useState("/bean-fien-logo.png"); // Default placeholder
    const [displayName, setDisplayName] = useState("Admin");
    const [roleTitle, setRoleTitle] = useState("Super Admin");
    const [email, setEmail] = useState("admin@beanfien.com");
    const [phone, setPhone] = useState("+1555-0100");

    // Temp inputs for modal
    const [tempDisplayName, setTempDisplayName] = useState("");
    const [tempRoleTitle, setTempRoleTitle] = useState("");
    const [tempEmail, setTempEmail] = useState("");
    const [tempPhone, setTempPhone] = useState("");

    React.useEffect(() => {
        const savedName = localStorage.getItem("bf_admin_name");
        const savedRole = localStorage.getItem("bf_admin_role");
        const savedEmail = localStorage.getItem("bf_admin_email");
        const savedPhone = localStorage.getItem("bf_admin_phone");
        const savedPhoto = localStorage.getItem("bf_admin_photo");

        if (savedName) setDisplayName(savedName);
        if (savedRole) setRoleTitle(savedRole);
        if (savedEmail) setEmail(savedEmail);
        if (savedPhone) setPhone(savedPhone);
        if (savedPhoto) setAdminPhoto(savedPhoto);

        const savedStars = localStorage.getItem("bf_stars_per_dollar");
        const savedMinOrder = localStorage.getItem("bf_min_order_stars");
        const savedAutoNotif = localStorage.getItem("bf_auto_notifications");
        const savedMaintMode = localStorage.getItem("bf_maintenance_mode");

        if (savedStars) setStarsPerDollar(Number(savedStars));
        if (savedMinOrder) setMinOrderForStars(Number(savedMinOrder));
        if (savedAutoNotif) setAutoNotifications(savedAutoNotif === "true");
        if (savedMaintMode) setMaintenanceMode(savedMaintMode === "true");

        // Check query param
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            if (params.get("profile") === "true") {
                setTempDisplayName(savedName || "Admin");
                setTempRoleTitle(savedRole || "Super Admin");
                setTempEmail(savedEmail || "admin@beanfien.com");
                setTempPhone(savedPhone || "+1555-0100");
                setProfileModalOpen(true);
            }
        }
    }, []);

    const handleOpenProfile = () => {
        setTempDisplayName(displayName);
        setTempRoleTitle(roleTitle);
        setTempEmail(email);
        setTempPhone(phone);
        setProfileModalOpen(true);
    };

    const handleSaveProfile = (e: React.FormEvent) => {
        e.preventDefault();
        setDisplayName(tempDisplayName);
        setRoleTitle(tempRoleTitle);
        setEmail(tempEmail);
        setPhone(tempPhone);

        localStorage.setItem("bf_admin_name", tempDisplayName);
        localStorage.setItem("bf_admin_role", tempRoleTitle);
        localStorage.setItem("bf_admin_email", tempEmail);
        localStorage.setItem("bf_admin_phone", tempPhone);
        localStorage.setItem("bf_admin_photo", adminPhoto);

        setProfileModalOpen(false);
        // Notify other windows/components that details updated
        window.dispatchEvent(new Event("adminProfileUpdated"));
        alert("Admin Profile updated successfully!");
    };

    const handleSaveChanges = () => {
        localStorage.setItem("bf_stars_per_dollar", String(starsPerDollar));
        localStorage.setItem("bf_min_order_stars", String(minOrderForStars));
        localStorage.setItem("bf_auto_notifications", String(autoNotifications));
        localStorage.setItem("bf_maintenance_mode", String(maintenanceMode));
        alert("Settings saved successfully!");
    };

    return (
        <div className="flex-1 p-4 md:p-8 space-y-6 bg-[#FAF6F0] dark:bg-background min-h-screen text-foreground transition-colors duration-300">
            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
                <div>
                    <h1 className="font-serif text-3xl font-bold tracking-tight text-[#2C1A14] dark:text-white">Settings</h1>
                    <p className="text-sm text-muted-foreground mt-1">Bean Fien Admin Panel</p>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleOpenProfile}
                        className="flex items-center gap-3 px-3 py-1.5 rounded-xl border border-border bg-white dark:bg-card hover:bg-slate-50 transition-colors text-left cursor-pointer"
                    >
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-primary/10 border border-primary/20 flex items-center justify-center relative">
                            {adminPhoto ? (
                                <img src={adminPhoto} alt="Admin" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-xs font-bold text-primary">BF</span>
                            )}
                        </div>
                        <div className="hidden sm:block text-left">
                            <h4 className="text-xs font-bold leading-tight">{displayName}</h4>
                            <p className="text-[10px] text-muted-foreground">{roleTitle}</p>
                        </div>
                    </button>
                </div>
            </header>

            {/* Settings Forms container */}
            <div className="space-y-6 max-w-3xl">
                {/* Loyalty Program section */}
                <div className="bg-white dark:bg-card rounded-2xl border border-border/65 shadow-sm p-6 space-y-5">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Loyalty Program</h3>
                    
                    <div className="space-y-4">
                        {/* Stars per $1 */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 border-b border-border/10">
                            <div>
                                <h4 className="text-sm font-bold text-[#2C1A14] dark:text-white">Stars per $1 spent</h4>
                                <p className="text-xs text-muted-foreground">How many stars customers earn per dollar</p>
                            </div>
                            
                            <div className="relative w-32">
                                <Star className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500 fill-amber-500/20" />
                                <input 
                                    type="number"
                                    value={starsPerDollar}
                                    onChange={(e) => setStarsPerDollar(Number(e.target.value))}
                                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-border bg-[#F3ECE3]/30 dark:bg-zinc-900 font-semibold text-sm focus:outline-none text-right"
                                />
                            </div>
                        </div>

                        {/* Minimum order for stars */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
                            <div>
                                <h4 className="text-sm font-bold text-[#2C1A14] dark:text-white">Minimum order for stars</h4>
                                <p className="text-xs text-muted-foreground">Orders below this won&apos;t earn stars</p>
                            </div>
                            
                            <div className="relative w-32">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input 
                                    type="number"
                                    step="0.01"
                                    value={minOrderForStars}
                                    onChange={(e) => setMinOrderForStars(Number(e.target.value))}
                                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-border bg-[#F3ECE3]/30 dark:bg-zinc-900 font-semibold text-sm focus:outline-none text-right"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* System section */}
                <div className="bg-white dark:bg-card rounded-2xl border border-border/65 shadow-sm p-6 space-y-5">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">System</h3>
                    
                    <div className="space-y-4">
                        {/* Auto Notifications */}
                        <div className="flex items-center justify-between py-2 border-b border-border/10">
                            <div>
                                <h4 className="text-sm font-bold text-[#2C1A14] dark:text-white">Auto Notifications</h4>
                                <p className="text-xs text-muted-foreground">Send push notifications for order updates</p>
                            </div>
                            
                            <button
                                onClick={() => setAutoNotifications(!autoNotifications)}
                                className={`
                                    relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none
                                    ${autoNotifications ? "bg-[#8B4513]" : "bg-zinc-300 dark:bg-zinc-700"}
                                `}
                            >
                                <span
                                    className={`
                                        pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                                        ${autoNotifications ? "translate-x-5" : "translate-x-0"}
                                    `}
                                />
                            </button>
                        </div>

                        {/* Maintenance Mode */}
                        <div className="flex items-center justify-between py-2">
                            <div>
                                <h4 className="text-sm font-bold text-[#2C1A14] dark:text-white">Maintenance Mode</h4>
                                <p className="text-xs text-muted-foreground">Temporarily disable the app for customers</p>
                            </div>
                            
                            <button
                                onClick={() => setMaintenanceMode(!maintenanceMode)}
                                className={`
                                    relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none
                                    ${maintenanceMode ? "bg-[#8B4513]" : "bg-zinc-300 dark:bg-zinc-700"}
                                `}
                            >
                                <span
                                    className={`
                                        pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                                        ${maintenanceMode ? "translate-x-5" : "translate-x-0"}
                                    `}
                                />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Save Changes button */}
                <button
                    onClick={handleSaveChanges}
                    className="px-6 py-3 bg-[#C07C4A] hover:opacity-95 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-[#C07C4A]/15 cursor-pointer"
                >
                    Save Changes
                </button>
            </div>

            {/* ADMIN PROFILE MODAL (Screenshot 3) */}
            {profileModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#1E0F0B] w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-border/80 relative animate-in fade-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="p-6 pb-4 border-b border-border/30 flex justify-between items-start">
                            <div>
                                <h2 className="font-serif text-xl font-bold text-[#2C1A14] dark:text-white">Admin Profile</h2>
                                <p className="text-xs text-muted-foreground mt-0.5">Update your name, photo and contact info</p>
                            </div>
                            <button 
                                onClick={() => setProfileModalOpen(false)}
                                className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full text-muted-foreground hover:text-foreground transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSaveProfile} className="p-6 space-y-5">
                            {/* Avatar Photo Section */}
                            <div className="flex flex-col items-center gap-2 py-2">
                                <div className="relative">
                                    <div className="w-20 h-20 rounded-full bg-[#3D251E] flex items-center justify-center text-white text-2xl font-bold shadow-md border-2 border-primary/25 overflow-hidden relative">
                                        {adminPhoto ? (
                                            <img src={adminPhoto} alt="Admin Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="font-serif text-xl">BF</span>
                                        )}
                                    </div>
                                    <input 
                                        type="file"
                                        id="admin-photo-upload"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    setAdminPhoto(reader.result as string);
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                    />
                                    <label 
                                        htmlFor="admin-photo-upload"
                                        className="absolute bottom-0 right-0 p-1.5 bg-[#2C1A14] text-white rounded-full shadow border border-white hover:opacity-90 cursor-pointer flex items-center justify-center"
                                    >
                                        <Camera className="w-3.5 h-3.5" />
                                    </label>
                                </div>
                                <button 
                                    type="button"
                                    onClick={() => setAdminPhoto("")}
                                    className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors"
                                >
                                    Remove Photo
                                </button>
                            </div>

                            {/* Form Input fields */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Display Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={tempDisplayName}
                                        onChange={(e) => setTempDisplayName(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-[#F3ECE3]/40 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary text-sm font-semibold"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Role / Title</label>
                                    <input
                                        type="text"
                                        required
                                        value={tempRoleTitle}
                                        onChange={(e) => setTempRoleTitle(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-[#F3ECE3]/40 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary text-sm font-semibold"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Email</label>
                                <input
                                    type="email"
                                    required
                                    value={tempEmail}
                                    onChange={(e) => setTempEmail(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-[#F3ECE3]/40 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary text-sm font-semibold"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Phone</label>
                                <input
                                    type="text"
                                    required
                                    value={tempPhone}
                                    onChange={(e) => setTempPhone(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-[#F3ECE3]/40 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary text-sm font-semibold"
                                />
                            </div>

                            {/* Footer Buttons */}
                            <div className="flex items-center gap-3 pt-4 border-t border-border/30">
                                <button
                                    type="button"
                                    onClick={() => setProfileModalOpen(false)}
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-[#FAF6F0] hover:bg-[#F3ECE3]/60 text-[#2C1A14] font-bold text-xs uppercase tracking-wider transition-colors border border-border/40"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-[#1E0F0B] hover:opacity-95 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
                                >
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
