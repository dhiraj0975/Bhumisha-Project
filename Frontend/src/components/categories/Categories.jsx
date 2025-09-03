import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories, addCategory, updateCategory, deleteCategory } from "../../features/Categories/categoiresSlice";
import { IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export default function Categories() {
  const dispatch = useDispatch();
  const { list: categories, loading } = useSelector((state) => state.categories);

  const [newCategory, setNewCategory] = useState("");
  const [editCategory, setEditCategory] = useState(null);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleAdd = () => {
    if (!newCategory.trim()) return;
    dispatch(addCategory({ name: newCategory }));
    setNewCategory("");
  };

  const handleUpdate = () => {
    if (!editCategory.name.trim()) return;
    dispatch(updateCategory({ id: editCategory.id, data: { name: editCategory.name } }));
    setEditCategory(null);
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this category?")) {
      dispatch(deleteCategory(id));
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Category Manager</h1>

      {/* Add Category */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Enter category name"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          className="border rounded p-2 flex-1"
        />
        <button onClick={handleAdd} className="px-4 py-2 bg-blue-600 text-white rounded">
          Add
        </button>
      </div>

      {/* Update Category */}
      {editCategory && (
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={editCategory.name}
            onChange={(e) => setEditCategory({ ...editCategory, name: e.target.value })}
            className="border rounded p-2 flex-1"
          />
          <button onClick={handleUpdate} className="px-4 py-2 bg-green-600 text-white rounded">
            Update
          </button>
          <button onClick={() => setEditCategory(null)} className="px-4 py-2 bg-gray-400 text-white rounded">
            Cancel
          </button>
        </div>
      )}

      {/* Category List */}
      {loading ? (
        <p>Loading categories...</p>
      ) : (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">ID</th>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id}>
                <td className="p-2 border">{cat.id}</td>
                <td className="p-2 border">{cat.name}</td>
                <td className="p-2 border flex gap-2">
                  <IconButton color="primary" onClick={() => setEditCategory(cat)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(cat.id)}>
                    <DeleteIcon />
                  </IconButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
