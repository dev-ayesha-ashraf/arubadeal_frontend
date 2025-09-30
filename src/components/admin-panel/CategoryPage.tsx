import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PlusCircle, FolderPlus } from "lucide-react";

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

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/car_accessory/category/`, authHeader);
            setCategories(res.data);
        } catch (err) {
            console.error("Failed to fetch categories", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchSubCategories = async (categoryId: string) => {
        try {
            const res = await axios.get(
                `${API_URL}/car_accessory/sub-category/?category_id=${categoryId}`,
                authHeader
            );
            setSubCategories((prev) => ({ ...prev, [categoryId]: res.data }));
        } catch (err) {
            console.error("Failed to fetch subcategories", err);
        }
    };

    const handleAddCategory = async () => {
        if (!newCategory.trim()) return;
        try {
            await axios.post(
                `${API_URL}/car_accessory/category/create`,
                { name: newCategory },
                authHeader
            );
            setNewCategory("");
            fetchCategories();
        } catch (err) {
            console.error("Failed to add category", err);
        }
    };

    const handleAddSubCategory = async () => {
        if (!newSubCategory.trim() || !activeCategory) return;
        try {
            await axios.post(
                `${API_URL}/car_accessory/sub-category/create`,
                { name: newSubCategory, category_id: activeCategory },
                authHeader
            );
            setNewSubCategory("");
            fetchSubCategories(activeCategory);
        } catch (err) {
            console.error("Failed to add subcategory", err);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <motion.h1
                className="text-3xl font-bold text-center"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                Accessories Category Management
            </motion.h1>

            <Card className="p-4">
                <CardContent className="flex gap-2 items-center">
                    <Input
                        placeholder="Add new category..."
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                    />
                    <Button onClick={handleAddCategory}>
                        <PlusCircle className="mr-2" /> Add
                    </Button>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map((cat) => (
                    <motion.div
                        key={cat.id}
                        className="p-4 rounded-2xl shadow bg-white"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-semibold">{cat.name}</h2>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setActiveCategory(cat.id);
                                    fetchSubCategories(cat.id);
                                }}
                            >
                                <FolderPlus className="mr-1 h-4 w-4" /> Manage Subcategories
                            </Button>
                        </div>

                        {activeCategory === cat.id && (
                            <motion.div
                                className="mt-3 space-y-2"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                {(subCategories[cat.id] || []).length > 0 ? (
                                    subCategories[cat.id].map((sub) => (
                                        <div key={sub.id} className="text-gray-700 pl-3 border-l">
                                            ▸ {sub.name}
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-400 text-sm">No subcategories yet.</p>
                                )}

                                <div className="flex gap-2 mt-2">
                                    <Input
                                        placeholder="Add subcategory..."
                                        value={newSubCategory}
                                        onChange={(e) => setNewSubCategory(e.target.value)}
                                    />
                                    <Button size="sm" onClick={handleAddSubCategory}>
                                        <PlusCircle className="mr-1" /> Add
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                ))}
            </div>

            {loading && <p className="text-center text-gray-500">Loading...</p>}
        </div>
    );
}
