import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./CategoryManager.css";

const CategoryManager = ({
    orgId,
    onClose,
    onCategoryChange,
    inline = false,
}) => {
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState("");
    const [error, setError] = useState(null);
    const inputRef = useRef(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await axios.get(
                `http://localhost:8000/categories/${orgId}`
            );
            setCategories(res.data);
        } catch (err) {
            console.error("Failed to load categories", err);
        }
    };

    const handleAdd = async () => {
        if (!newCategory.trim()) return;
        try {
            await axios.post(
                `http://localhost:8000/categories/${orgId}?category_name=${newCategory}`
            );
            setNewCategory("");
            fetchCategories();
            onCategoryChange(); // refresh from parent
            // Keep focus on input after adding
            setTimeout(() => {
                if (inputRef.current) {
                    inputRef.current.focus();
                }
            }, 100);
        } catch (err) {
            console.error("Add failed", err);
            setError("Failed to add category");
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            handleAdd();
        }
    };

    const handleDelete = async (categoryId) => {
        try {
            await axios.delete(
                `http://localhost:8000/categories/${orgId}/${categoryId}`
            );
            fetchCategories();
            onCategoryChange(); // refresh from parent
        } catch (err) {
            console.error("Delete failed", err);
            setError("Cannot delete. Category may be in use.");
        }
    };

    const CategoryContent = () => (
        <>
            {!inline && (
                <button className="category-close-btn" onClick={onClose}>
                    ×
                </button>
            )}
            <h2>Categories</h2>

            {categories.map((cat) => (
                <div key={cat.category_id} className="category-chip">
                    {cat.name}
                    <button
                        onClick={() => handleDelete(cat.category_id)}
                        className="category-delete-btn"
                    >
                        ×
                    </button>
                </div>
            ))}

            <div className="add-category-row">
                <input
                    ref={inputRef}
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="New category name"
                    autoFocus
                />
                <button onClick={handleAdd}>Add Category</button>
            </div>

            {error && <p className="category-error">{error}</p>}
        </>
    );

    if (inline) {
        return (
            <div className="category-content-inline">
                <CategoryContent />
            </div>
        );
    }

    return (
        <div className="category-modal-overlay">
            <div className="category-modal">
                <CategoryContent />
            </div>
        </div>
    );
};

export default CategoryManager;
