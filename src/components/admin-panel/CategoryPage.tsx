import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Plus,
    FolderOpen,
    FolderClosed,
    ChevronDown,
    ChevronRight,
    Layers,
    Tag,
    Sparkles,
    Search,
    Trash2,
    Edit3
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;
const authHeader = {
    headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
        Accept: "application/json",
    },
};

type Category = {
    id: string;
    name: string;
};

type SubCategory = {
    id: string;
    name: string;
    category_id: string;
};

export default function CategoryPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [subCategories, setSubCategories] = useState<Record<string, SubCategory[]>>({});
    const [loading, setLoading] = useState(false);
    const [newCategory, setNewCategory] = useState("");
    const [newSubCategory, setNewSubCategory] = useState("");
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchCategories = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await axios.get(`${API_URL}/car_accessory/category/`, authHeader);
            setCategories(res.data);
        } catch (err) {
            console.error("Failed to fetch categories", err);
            setError("Failed to load categories");
        } finally {
            setLoading(false);
        }
    };

    const fetchSubCategories = async (categoryId: string) => {
        try {
            setError(null);
            const res = await axios.get(
                `${API_URL}/car_accessory/sub-category/?category_id=${categoryId}`,
                authHeader
            );
            setSubCategories((prev) => ({ ...prev, [categoryId]: res.data }));
        } catch (err) {
            console.error("Failed to fetch subcategories", err);
            setError("Failed to load subcategories");
        }
    };

    const handleAddCategory = async () => {
        if (!newCategory.trim()) return;
        try {
            setError(null);
            await axios.post(
                `${API_URL}/car_accessory/category/create`,
                { name: newCategory },
                authHeader
            );
            setNewCategory("");
            fetchCategories();
        } catch (err) {
            console.error("Failed to add category", err);
            setError("Failed to add category");
        }
    };

    const handleAddSubCategory = async () => {
        if (!newSubCategory.trim() || !activeCategory) return;
        try {
            setError(null);
            await axios.post(
                `${API_URL}/car_accessory/sub-category/create`,
                { name: newSubCategory, category_id: activeCategory },
                authHeader
            );
            setNewSubCategory("");
            fetchSubCategories(activeCategory);
        } catch (err) {
            console.error("Failed to add subcategory", err);
            setError("Failed to add subcategory");
        }
    };

    const toggleCategory = (categoryId: string) => {
        if (activeCategory === categoryId) {
            setActiveCategory(null);
        } else {
            setActiveCategory(categoryId);
            if (!subCategories[categoryId]) {
                fetchSubCategories(categoryId);
            }
        }
    };

    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        fetchCategories();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/20 p-6">
            <div className="max-w-6xl mx-auto space-y-8">
                <motion.div
                    className="text-center space-y-4"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="flex items-center justify-center gap-3 mt-10">
                        <div className="p-3 bg-dealership-primary/70 from-dealership-primary/80 to-dealership-primary rounded-2xl shadow-lg">
                            <Layers className="h-8 w-8 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold bg-dealership-primary bg-clip-text text-transparent p-3">
                            Category Manager
                        </h1>
                    </div>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto ">
                        Organize your car accessories with intuitive category management
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2 bg-white/80 backdrop-blur-sm border-blue-100 shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <Search className="h-5 w-5 text-gray-400" />
                                <Input
                                    placeholder="Search categories..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-dealership-primary/80 text-white border-0 shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-100 text-sm">Total Categories</p>
                                    <p className="text-3xl font-bold">{categories.length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <AnimatePresence>
                    {error && (
                        <motion.div
                            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl shadow-sm"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                        >
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                {error}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="bg-white/90 backdrop-blur-sm border-blue-100 shadow-lg rounded-2xl overflow-hidden">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2 text-dealership-primary">
                                <Plus className="h-5 w-5" />
                                Create New Category
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <Input
                                        placeholder="Enter category name..."
                                        value={newCategory}
                                        onChange={(e) => setNewCategory(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                                        className="bg-white border-blue-200 focus:border-blue-400"
                                    />
                                </div>
                                <Button
                                    onClick={handleAddCategory}
                                    disabled={!newCategory.trim()}
                                    className="bg-dealership-primary hover:from-blue-600 hover:bg-dealership-primary/90 shadow-lg transition-all duration-200"
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    <AnimatePresence mode="popLayout">
                        {filteredCategories.map((cat, index) => (
                            <motion.div
                                key={cat.id}
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                                transition={{ delay: index * 0.1 }}
                                layout
                            >
                                <Card className={`bg-white/90 backdrop-blur-sm border-l-4 ${activeCategory === cat.id
                                    ? 'border-dealership-primary shadow-xl scale-[1.02]'
                                    : 'border-gray-200 shadow-sm hover:shadow-md'
                                    } transition-all duration-300 rounded-2xl overflow-hidden group hover:border-dealership-primary/80`}>
                                    <CardContent className="p-0">
                                        <div className="p-6 pb-4">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                                    <div className={`p-2 rounded-lg flex-shrink-0 ${activeCategory === cat.id
                                                        ? 'bg-dealership-primary/50 text-dealership-primary'
                                                        : 'bg-gray-100 text-gray-600 group-hover:bg-dealership-primary/30 group-hover:text-dealership-primary'
                                                        } transition-colors`}>
                                                        {activeCategory === cat.id ?
                                                            <FolderOpen className="h-5 w-5" /> :
                                                            <FolderClosed className="h-5 w-5" />
                                                        }
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <h3 className="font-semibold text-gray-900 text-lg group-hover:text-dealership-primary transition-colors truncate">
                                                            {cat.name}
                                                        </h3>
                                                        <Badge
                                                            variant="secondary"
                                                            className="mt-1 bg-dealership-primary/30 text-dealership-primary hover:bg-blue-100"
                                                        >
                                                            {subCategories[cat.id]?.length || 0} subcategories
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => toggleCategory(cat.id)}
                                                    className="h-8 w-8 p-0 rounded-full hover:bg-dealership-primary/30 hover:text-dealership-primary transition-colors flex-shrink-0"
                                                >
                                                    {activeCategory === cat.id ?
                                                        <ChevronDown className="h-4 w-4" /> :
                                                        <ChevronRight className="h-4 w-4" />
                                                    }
                                                </Button>
                                            </div>                                        </div>

                                        <AnimatePresence>
                                            {activeCategory === cat.id && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: "auto" }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                    className="border-t border-gray-100"
                                                >
                                                    <div className="p-6 space-y-4">
                                                        <div className="space-y-2 max-h-48 overflow-y-auto">
                                                            {(subCategories[cat.id] || []).length > 0 ? (
                                                                subCategories[cat.id].map((sub) => (
                                                                    <motion.div
                                                                        key={sub.id}
                                                                        initial={{ opacity: 0, x: -10 }}
                                                                        animate={{ opacity: 1, x: 0 }}
                                                                        className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-blue-50 group/sub transition-colors"
                                                                    >
                                                                        <div className="flex items-center gap-2">
                                                                            <Tag className="h-3 w-3 text-dealership-primary/70" />
                                                                            <span className="text-gray-700 hover:text-dealership-primary transition-colors">
                                                                                {sub.name}
                                                                            </span>
                                                                        </div>

                                                                    </motion.div>
                                                                ))
                                                            ) : (
                                                                <div className="text-center py-6 text-gray-400">
                                                                    <Tag className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                                                    <p className="text-sm">No subcategories yet</p>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="flex gap-2 pt-2">
                                                            <Input
                                                                placeholder="Add subcategory..."
                                                                value={newSubCategory}
                                                                onChange={(e) => setNewSubCategory(e.target.value)}
                                                                onKeyPress={(e) => e.key === 'Enter' && handleAddSubCategory()}
                                                                className="flex-1 bg-white border-blue-200 focus:border-blue-400"
                                                            />
                                                            <Button
                                                                size="sm"
                                                                onClick={handleAddSubCategory}
                                                                disabled={!newSubCategory.trim()}
                                                                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg"
                                                            >
                                                                <Plus className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {loading && (
                    <div className="text-center py-12">
                        <div className="inline-flex items-center gap-3">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                            <span className="text-gray-600">Loading categories...</span>
                        </div>
                    </div>
                )}

                {!loading && categories.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-16"
                    >
                        <div className="max-w-md mx-auto space-y-4">
                            <div className="w-16 h-16 mx-auto bg-blue-100 rounded-2xl flex items-center justify-center">
                                <Layers className="h-8 w-8 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900">No categories yet</h3>
                            <p className="text-gray-600">
                                Start by creating your first category to organize your car accessories
                            </p>
                        </div>
                    </motion.div>
                )}

                {!loading && categories.length > 0 && filteredCategories.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12"
                    >
                        <div className="max-w-md mx-auto space-y-3">
                            <Search className="h-12 w-12 text-gray-300 mx-auto" />
                            <h3 className="text-lg font-semibold text-gray-900">No categories found</h3>
                            <p className="text-gray-600">
                                No categories match your search term "{searchTerm}"
                            </p>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}