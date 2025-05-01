import React, { useState, useEffect } from "react";
import axios from "axios";
import "./CategoryManager.css";

const CategoryManager = ({ orgId = 1, onClose, onCategoryChange }) => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`http://localhost:8000/categories/${orgId}`);
      setCategories(res.data);
    } catch (err) {
      console.error("Failed to load categories", err);
    }
  };

  const handleAdd = async () => {
    if (!newCategory.trim()) return;
    try {
      await axios.post(`http://localhost:8000/categories/${orgId}?category_name=${newCategory}`);
      setNewCategory("");
      fetchCategories();
      onCategoryChange(); // refresh from parent
    } catch (err) {
      console.error("Add failed", err);
      setError("Failed to add category");
    }
  };

  const handleDelete = async (categoryId) => {
    try {
      await axios.delete(`http://localhost:8000/categories/${orgId}/${categoryId}`);
      fetchCategories();
      onCategoryChange(); // refresh from parent
    } catch (err) {
      console.error("Delete failed", err);
      setError("Cannot delete. Category may be in use.");
    }
  };

  return (
    <div className="category-modal-overlay">
      <div className="category-modal">
        <button className="category-close-btn" onClick={onClose}>×</button>
        <h2>Categories</h2>

        {categories.map((cat) => (
          <div key={cat.category_id} className="category-chip">
            {cat.name}
            <button onClick={() => handleDelete(cat.category_id)} className="category-delete-btn">×</button>
          </div>
        ))}

        <div className="add-category-row">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="New category name"
          />
          <button onClick={handleAdd}>Add Category</button>
        </div>

        {error && <p className="category-error">{error}</p>}
      </div>
    </div>
  );
};

export default CategoryManager;
