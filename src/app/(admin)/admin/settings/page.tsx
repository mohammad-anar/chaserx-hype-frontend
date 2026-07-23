"use client";
import React, { useState, useEffect } from "react";
import { Star, DollarSign, X, Camera, Lock, User, Bell, Shield, KeyRound, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { useGetProfileQuery, useUpdateProfileMutation, useChangePasswordMutation } from "@/redux/features/auth/authApi";
import NotificationDropdown from "@/components/NotificationDropdown";
import AdminProfileDropdown from "@/components/AdminProfileDropdown";

export default function Settings() {
    // RTK Query Hooks for user profile & password
    const { data: profileResponse, refetch: refetchProfile } = useGetProfileQuery(undefined);
    const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation();
    const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();

    // Loyalty Program States
    const [starsPerDollar, setStarsPerDollar] = useState(10);
    const [minOrderForStars, setMinOrderForStars] = useState(3.00);

    // System States
    const [autoNotifications, setAutoNotifications] = useState(true);
    const [maintenanceMode, setMaintenanceMode] = useState(false);

    // Admin Profile States
    const [profileModalOpen, setProfileModalOpen] = useState(false);
    const [adminPhoto, setAdminPhoto] = useState("/logo.png");
    const [displayName, setDisplayName] = useState("Admin");
    const [roleTitle, setRoleTitle] = useState("Super Admin");
    const [email, setEmail] = useState("admin@beanfien.com");
    const [phone, setPhone] = useState("+1555-0100");

    // Temp inputs for Profile Edit Modal
    const [tempDisplayName, setTempDisplayName] = useState("");
    const [tempRoleTitle, setTempRoleTitle] = useState("");
    const [tempEmail, setTempEmail] = useState("");
    const [tempPhone, setTempPhone] = useState("");

    // Change Password Form State
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    useEffect(() => {
        // Sync profile data from backend if available
        const profileData = profileResponse?.data || profileResponse;
        if (profileData) {
            if (profileData.name) setDisplayName(profileData.name);
            if (profileData.role) setRoleTitle(profileData.role);
            if (profileData.email) setEmail(profileData.email);
            if (profileData.phone) setPhone(profileData.phone);
            if (profileData.photo || profileData.image) setAdminPhoto(profileData.photo || profileData.image);
        } else {
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
        }

        const savedStars = localStorage.getItem("bf_stars_per_dollar");
        const savedMinOrder = localStorage.getItem("bf_min_order_stars");
        const savedAutoNotif = localStorage.getItem("bf_auto_notifications");
        const savedMaintMode = localStorage.getItem("bf_maintenance_mode");

        if (savedStars) setStarsPerDollar(Number(savedStars));
        if (savedMinOrder) setMinOrderForStars(Number(savedMinOrder));
        if (savedAutoNotif) setAutoNotifications(savedAutoNotif === "true");
        if (savedMaintMode) setMaintenanceMode(savedMaintMode === "true");

        // Open profile modal if query param profile=true
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            if (params.get("profile") === "true") {
                handleOpenProfile();
            }
        }
    }, [profileResponse]);

    const handleOpenProfile = () => {
        setTempDisplayName(displayName);
        setTempRoleTitle(roleTitle);
        setTempEmail(email);
        setTempPhone(phone);
        setProfileModalOpen(true);
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateProfile({
                name: tempDisplayName,
                phone: tempPhone,
                image: adminPhoto,
            }).unwrap();

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
            window.dispatchEvent(new Event("adminProfileUpdated"));
            toast.success("Admin profile updated successfully!");
        } catch (err: any) {
            // Local fallback
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
            window.dispatchEvent(new Event("adminProfileUpdated"));
            toast.success("Admin profile updated locally!");
        }
    };

    const handleChangePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!oldPassword.trim()) {
            toast.error("Please enter your current password");
            return;
        }

        if (newPassword.length < 6) {
            toast.error("New password must be at least 6 characters long");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("New password and Confirm Password do not match");
            return;
        }

        try {
            await changePassword({
                oldPassword,
                newPassword,
            }).unwrap();

            toast.success("Password changed successfully!");
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err: any) {
            toast.error(err?.data?.message || err?.message || "Failed to change password");
        }
    };

    const handleMaintenanceToggle = (val: boolean) => {
        setMaintenanceMode(val);
        localStorage.setItem("bf_maintenance_mode", String(val));
        window.dispatchEvent(new Event("maintenanceModeChanged"));

        if (val) {
            toast.warning("Maintenance Mode Activated! Storefront access is now restricted.", { duration: 5000 });
        } else {
            toast.success("Maintenance Mode Deactivated! Storefront is live for customers.", { duration: 5000 });
        }
    };

    const handleSaveChanges = () => {
        localStorage.setItem("bf_stars_per_dollar", String(starsPerDollar));
        localStorage.setItem("bf_min_order_stars", String(minOrderForStars));
        localStorage.setItem("bf_auto_notifications", String(autoNotifications));
        localStorage.setItem("bf_maintenance_mode", String(maintenanceMode));
        toast.success("System settings saved successfully!");
    };

    return (
        <div className="flex-1 p-4 md:p-8 space-y-6 bg-[#FAF6F0] dark:bg-background min-h-screen text-foreground transition-colors duration-300">
            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
                <div>
                    <h1 className="font-serif text-3xl font-bold tracking-tight text-[#2C1A14] dark:text-white">Admin Settings</h1>
                    <p className="text-sm text-muted-foreground mt-1">Manage profile, security credentials & maintenance mode</p>
                </div>

                <div className="flex items-center gap-3">
                    <NotificationDropdown />
                    <AdminProfileDropdown />
                </div>
            </header>

            {/* Settings Forms container */}
            <div className="space-y-6 max-w-4xl">
                {/* ADMIN PROFILE OVERVIEW CARD */}
                <div className="bg-white dark:bg-card rounded-3xl border border-border/65 shadow-sm p-6 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/20 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
                                <User className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-serif text-base font-bold text-[#2C1A14] dark:text-white">Admin Profile Information</h3>
                                <p className="text-xs text-muted-foreground">Manage admin credentials and personal avatar</p>
                            </div>
                        </div>

                        <button
                            onClick={handleOpenProfile}
                            className="px-4 py-2 bg-[#2C1A14] dark:bg-primary hover:opacity-90 text-white dark:text-[#1E0F0B] font-bold text-xs rounded-xl transition-all shadow-sm cursor-pointer self-start sm:self-auto"
                        >
                            Edit Profile
                        </button>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-full bg-[#3D251E] flex items-center justify-center text-white font-bold text-2xl overflow-hidden border-4 border-primary/20 shadow-md">
                                {adminPhoto ? (
                                    <img src={adminPhoto} alt="Admin Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="font-serif">BF</span>
                                )}
                            </div>
                            <button
                                onClick={handleOpenProfile}
                                className="absolute bottom-0 right-0 p-2 bg-[#8B4513] text-white rounded-full border border-white shadow hover:opacity-90 cursor-pointer"
                                title="Change Profile Image"
                            >
                                <Camera className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 w-full text-xs">
                            <div className="p-3.5 rounded-2xl bg-[#FAF6F0] dark:bg-zinc-900/60 border border-border/40 space-y-1">
                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Display Name</span>
                                <p className="font-bold text-sm text-[#2C1A14] dark:text-white">{displayName}</p>
                            </div>

                            <div className="p-3.5 rounded-2xl bg-[#FAF6F0] dark:bg-zinc-900/60 border border-border/40 space-y-1">
                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Role / Title</span>
                                <p className="font-bold text-sm text-[#2C1A14] dark:text-white">{roleTitle}</p>
                            </div>

                            <div className="p-3.5 rounded-2xl bg-[#FAF6F0] dark:bg-zinc-900/60 border border-border/40 space-y-1">
                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Email Address</span>
                                <p className="font-bold text-sm text-[#2C1A14] dark:text-white truncate">{email}</p>
                            </div>

                            <div className="p-3.5 rounded-2xl bg-[#FAF6F0] dark:bg-zinc-900/60 border border-border/40 space-y-1">
                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Phone Number</span>
                                <p className="font-bold text-sm text-[#2C1A14] dark:text-white">{phone}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CHANGE PASSWORD CARD */}
                <div className="bg-white dark:bg-card rounded-3xl border border-border/65 shadow-sm p-6 space-y-5">
                    <div className="flex items-center gap-3 border-b border-border/20 pb-4">
                        <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                            <KeyRound className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-serif text-base font-bold text-[#2C1A14] dark:text-white">Change Security Password</h3>
                            <p className="text-xs text-muted-foreground">Update your administrative account login password</p>
                        </div>
                    </div>

                    <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Current Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        type="password"
                                        required
                                        placeholder="••••••••"
                                        value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-[#F3ECE3]/30 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary text-sm font-medium"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        type="password"
                                        required
                                        placeholder="••••••••"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-[#F3ECE3]/30 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary text-sm font-medium"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Confirm New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        type="password"
                                        required
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-[#F3ECE3]/30 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary text-sm font-medium"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={isChangingPassword}
                                className="px-5 py-2.5 bg-[#8B4513] hover:opacity-95 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm cursor-pointer flex items-center gap-2"
                            >
                                {isChangingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                                Update Password
                            </button>
                        </div>
                    </form>
                </div>

                {/* Loyalty Program section - Commented out as requested
                <div className="bg-white dark:bg-card rounded-3xl border border-border/65 shadow-sm p-6 space-y-5">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Loyalty Program Settings</h3>
                    
                    <div className="space-y-4">
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
                */}

                {/* SYSTEM & MAINTENANCE SECTION */}
                <div className="bg-white dark:bg-card rounded-3xl border border-border/65 shadow-sm p-6 space-y-5">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">System & Storefront Security</h3>
                    
                    <div className="space-y-4">
                        {/* Socket Order Notifications */}
                        <div className="flex items-center justify-between py-2 border-b border-border/10">
                            <div className="space-y-0.5">
                                <h4 className="text-sm font-bold text-[#2C1A14] dark:text-white flex items-center gap-2">
                                    <Bell className="w-4 h-4 text-primary" /> Realtime Socket Notifications
                                </h4>
                                <p className="text-xs text-muted-foreground">Receive instant socket alerts for new orders & status changes</p>
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

                        {/* Maintenance Mode Toggle */}
                        <div className="flex items-center justify-between py-2">
                            <div className="space-y-0.5">
                                <h4 className="text-sm font-bold text-[#2C1A14] dark:text-white flex items-center gap-2">
                                    <Shield className={`w-4 h-4 ${maintenanceMode ? "text-red-500 animate-pulse" : "text-emerald-500"}`} /> Maintenance Mode
                                </h4>
                                <p className="text-xs text-muted-foreground">Temporarily lock storefront routes & show maintenance page to customers</p>
                            </div>
                            
                            <button
                                onClick={() => handleMaintenanceToggle(!maintenanceMode)}
                                className={`
                                    relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none
                                    ${maintenanceMode ? "bg-red-600" : "bg-zinc-300 dark:bg-zinc-700"}
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

                {/* Save System Changes button */}
                <button
                    onClick={handleSaveChanges}
                    className="px-6 py-3 bg-[#C07C4A] hover:opacity-95 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-[#C07C4A]/15 cursor-pointer flex items-center gap-2"
                >
                    <Check className="w-4 h-4" /> Save System Settings
                </button>
            </div>

            {/* EDIT ADMIN PROFILE MODAL */}
            {profileModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#1E0F0B] w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-border/80 relative animate-in fade-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="p-6 pb-4 border-b border-border/30 flex justify-between items-start">
                            <div>
                                <h2 className="font-serif text-xl font-bold text-[#2C1A14] dark:text-white">Edit Admin Profile</h2>
                                <p className="text-xs text-muted-foreground mt-0.5">Update name, photo and contact details</p>
                            </div>
                            <button 
                                onClick={() => setProfileModalOpen(false)}
                                className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full text-muted-foreground hover:text-foreground transition-all cursor-pointer"
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
                                        title="Upload Profile Image"
                                    >
                                        <Camera className="w-3.5 h-3.5" />
                                    </label>
                                </div>
                                <button 
                                    type="button"
                                    onClick={() => setAdminPhoto("")}
                                    className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors cursor-pointer"
                                >
                                    Remove Photo
                                </button>
                            </div>

                            {/* Input fields */}
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
                                <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={tempEmail}
                                    onChange={(e) => setTempEmail(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-[#F3ECE3]/40 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary text-sm font-semibold"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Phone Number</label>
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
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-[#FAF6F0] hover:bg-[#F3ECE3]/60 text-[#2C1A14] font-bold text-xs uppercase tracking-wider transition-colors border border-border/40 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUpdatingProfile}
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-[#1E0F0B] hover:opacity-95 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                                >
                                    {isUpdatingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                    Save Profile
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
