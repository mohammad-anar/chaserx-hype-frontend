"use client";
import React, { useState } from "react";
import { toast } from "sonner";
import NotificationDropdown from "@/components/NotificationDropdown";
import AdminProfileDropdown from "@/components/AdminProfileDropdown";
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Layers,
    RefreshCw,
    X,
    AlertTriangle,
    Loader2
} from "lucide-react";
import {
    useGetAdminCategoriesQuery,
    useCreateCategoryMutation,
    useUpdateCategoryMutation,
    useDeleteCategoryMutation
} from "@/redux/features/category/categoryApi";

interface Category {
    id: string;
    name: string;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export default function AdminCategoriesPage() {
    const { data: categoryData, isLoading, isFetching, refetch } = useGetAdminCategoriesQuery(undefined);
    const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
    const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
    const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();

    const categories: Category[] = categoryData?.data || [];

    // Local Search & Filter State
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [categoryName, setCategoryName] = useState("");
    const [isActive, setIsActive] = useState(true);

    // Delete Confirmation Modal State
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Filter categories
    const filteredCategories = categories.filter((cat) => {
        const matchesSearch = cat.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus =
            statusFilter === "ALL"
                ? true
                : statusFilter === "ACTIVE"
                ? cat.isActive
                : !cat.isActive;
        return matchesSearch && matchesStatus;
    });

    const handleOpenCreateModal = () => {
        setEditingCategory(null);
        setCategoryName("");
        setIsActive(true);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (cat: Category) => {
        setEditingCategory(cat);
        setCategoryName(cat.name);
        setIsActive(cat.isActive);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!categoryName.trim()) {
            toast.error("Category name is required");
            return;
        }

        try {
            if (editingCategory) {
                await updateCategory({
                    id: editingCategory.id,
                    data: { name: categoryName.trim(), isActive }
                }).unwrap();
                toast.success("Category updated successfully");
            } else {
                await createCategory({
                    name: categoryName.trim(),
                    isActive
                }).unwrap();
                toast.success("Category created successfully");
            }
            setIsModalOpen(false);
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to save category");
        }
    };

    const handleToggleStatus = async (cat: Category) => {
        try {
            await updateCategory({
                id: cat.id,
                data: { isActive: !cat.isActive }
            }).unwrap();
            toast.success(`Category ${!cat.isActive ? "activated" : "deactivated"}`);
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to update category status");
        }
    };

    const handleDelete = async () => {
        if (!deletingId) return;
        try {
            await deleteCategory(deletingId).unwrap();
            toast.success("Category deleted successfully");
            setDeletingId(null);
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to delete category");
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-12">
            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
                <div>
                    <h1 className="font-serif text-3xl font-bold tracking-tight text-[#2C1A14] dark:text-white">
                        Category Management
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Create, edit, and organize product categories for the menu
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <NotificationDropdown />
                    <button
                        onClick={() => refetch()}
                        disabled={isFetching}
                        className="p-2.5 rounded-xl border border-border bg-white dark:bg-card hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors text-muted-foreground hover:text-foreground cursor-pointer shadow-sm"
                        title="Refresh Categories"
                    >
                        <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin text-primary" : ""}`} />
                    </button>
                    <AdminProfileDropdown />
                </div>
            </header>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white dark:bg-card p-4 rounded-2xl border border-border/60 shadow-sm">
                <div className="flex flex-1 items-center gap-3">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search categories..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-border bg-slate-50 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={(e: any) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 text-sm rounded-xl border border-border bg-slate-50 dark:bg-zinc-900 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                    >
                        <option value="ALL">All Status</option>
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                    </select>
                </div>

                {/* Create Button */}
                <button
                    onClick={handleOpenCreateModal}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition-all cursor-pointer shadow-md shadow-primary/20 text-sm"
                >
                    <Plus className="w-4 h-4" />
                    <span>Add Category</span>
                </button>
            </div>

            {/* Content Table / Cards */}
            <div className="bg-white dark:bg-card rounded-2xl border border-border/60 shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <p className="text-sm font-medium">Loading categories...</p>
                    </div>
                ) : filteredCategories.length === 0 ? (
                    <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-1">
                            <Layers className="w-6 h-6" />
                        </div>
                        <h3 className="font-semibold text-foreground text-base">No Categories Found</h3>
                        <p className="text-sm max-w-sm">
                            {searchTerm || statusFilter !== "ALL"
                                ? "Try adjusting your search query or filter options."
                                : "Get started by creating your first coffee or food category."}
                        </p>
                        {!searchTerm && statusFilter === "ALL" && (
                            <button
                                onClick={handleOpenCreateModal}
                                className="mt-2 flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-xl"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Create Category</span>
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-zinc-900/60 border-b border-border text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Category Name</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Created Date</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60">
                                {filteredCategories.map((cat) => (
                                    <tr
                                        key={cat.id}
                                        className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/40 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                                                    <Layers className="w-4 h-4" />
                                                </div>
                                                <span className="font-semibold text-foreground text-base">
                                                    {cat.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleToggleStatus(cat)}
                                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                                                    cat.isActive
                                                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                                                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500/20"
                                                }`}
                                            >
                                                <span className={`w-1.5 h-1.5 rounded-full ${cat.isActive ? "bg-emerald-500" : "bg-amber-500"}`}></span>
                                                {cat.isActive ? "Active" : "Inactive"}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground text-xs">
                                            {cat.createdAt
                                                ? new Date(cat.createdAt).toLocaleDateString("en-US", {
                                                      year: "numeric",
                                                      month: "short",
                                                      day: "numeric",
                                                  })
                                                : "N/A"}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenEditModal(cat)}
                                                    className="p-2 rounded-lg border border-border bg-white dark:bg-card hover:bg-slate-100 dark:hover:bg-zinc-800 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                                    title="Edit Category"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setDeletingId(cat.id)}
                                                    className="p-2 rounded-lg border border-red-200 dark:border-red-900/40 bg-red-500/5 hover:bg-red-500/10 text-red-600 dark:text-red-400 transition-colors cursor-pointer"
                                                    title="Delete Category"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* CREATE / EDIT MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-card border border-border w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                            <h3 className="font-serif text-lg font-bold text-foreground">
                                {editingCategory ? "Edit Category" : "Add New Category"}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-zinc-800"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                    Category Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Espresso Drinks, Cold Brews, Pastries"
                                    value={categoryName}
                                    onChange={(e) => setCategoryName(e.target.value)}
                                    required
                                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-slate-50 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-slate-50 dark:bg-zinc-900">
                                <div>
                                    <h4 className="text-sm font-semibold text-foreground">Category Status</h4>
                                    <p className="text-xs text-muted-foreground">
                                        {isActive ? "Visible on customer menu" : "Hidden from customer menu"}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsActive(!isActive)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                        isActive ? "bg-primary" : "bg-slate-300 dark:bg-zinc-700"
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                            isActive ? "translate-x-6" : "translate-x-1"
                                        }`}
                                    />
                                </button>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreating || isUpdating}
                                    className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition-opacity text-sm cursor-pointer shadow-md"
                                >
                                    {(isCreating || isUpdating) && <Loader2 className="w-4 h-4 animate-spin" />}
                                    <span>{editingCategory ? "Update Category" : "Create Category"}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* DELETE CONFIRMATION MODAL */}
            {deletingId && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-card border border-border w-full max-w-sm rounded-2xl shadow-xl p-6 space-y-5 text-center">
                        <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 mx-auto flex items-center justify-center">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-serif text-lg font-bold text-foreground">Delete Category?</h3>
                            <p className="text-xs text-muted-foreground">
                                This action will soft-delete the category from your admin panel. Products attached will remain intact.
                            </p>
                        </div>
                        <div className="flex items-center justify-center gap-3 pt-2">
                            <button
                                onClick={() => setDeletingId(null)}
                                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="flex items-center gap-2 px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors text-sm cursor-pointer shadow-md"
                            >
                                {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                                <span>Delete</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
