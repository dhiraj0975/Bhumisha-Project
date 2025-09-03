import React, { useState } from "react";
import SearchBar from "../components/categories/SearchBar";
import CategoryTable from "../components/categories/CategoryTable";
import AddCategoryForm from "../components/categories/AddCategoryForm";
import EditCategoryForm from "../components/categories/EditCategoryForm";
import CardStats from "../components/categories/CardStats";

const initialCategories = [
  { id: 1, name: "Electronics", createdAt: "6/15/2025, 3:38:47 PM" },
  { id: 2, name: "Fashion",  createdAt: "6/15/2025, 3:39:04 PM" },
  { id: 3, name: "Beauty & Personal Care", createdAt: "6/15/2025, 3:39:12 PM" },
];

const CategoryManager = () => {
  const [categories, setCategories] = useState(initialCategories);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // Add New Category
  const handleAddCategory = (newCategory) => {
    setCategories([...categories, { ...newCategory, id: categories.length + 1 }]);
    setShowForm(false);
  };

  // Update Existing Category
  const handleUpdateCategory = (updatedCategory) => {
    setCategories(
      categories.map((cat) =>
        cat.id === updatedCategory.id ? updatedCategory : cat
      )
    );
    setEditingCategory(null);
    setShowForm(false);
  };

  // Delete Category
  const handleDelete = (id) => {
    setCategories(categories.filter((cat) => cat.id !== id));
  };

  // Edit Category
  const handleEdit = (id) => {
    const categoryToEdit = categories.find((cat) => cat.id === id);
    setEditingCategory(categoryToEdit);
    setShowForm(true);
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <div className="max-w-7xl">
        <div className="md:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Category Manager</h1>
            <div className="flex items-center gap-2">
              <SearchBar search={search} setSearch={setSearch} />
              <button
                onClick={() => {
                  setShowForm(!showForm);
                  setEditingCategory(null); // reset when switching to add mode
                }}
                className="bg-[#4F46E5] hover:bg-[#4F46E5]/80 text-white px-4 py-2 rounded-lg transition-colors duration-200 drop-shadow-lg transform hover:scale-103"
              >
                {showForm ? "Close Form" : "Add Category"}
              </button>
            </div>
          </div>

          {/* Show either Add or Edit form */}
          {showForm ? (
            editingCategory ? (
              <EditCategoryForm
                onUpdate={handleUpdateCategory}
                editingCategory={editingCategory}
              />
            ) : (
              <AddCategoryForm onAdd={handleAddCategory} />
            )
          ) : (
            <CategoryTable
              categories={filteredCategories}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryManager;
