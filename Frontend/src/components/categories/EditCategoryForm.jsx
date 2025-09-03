import { useState, useEffect } from "react";

const EditCategoryForm = ({ onUpdate, editingCategory }) => {
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  // Pre-fill when editing
  useEffect(() => {
    if (editingCategory) {
      setName(editingCategory.name);
      setImageUrl(editingCategory.image);
    }
  }, [editingCategory]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !imageUrl) return;
    onUpdate({
      ...editingCategory,
      name,
      image: imageUrl,
    });
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow drop-shadow-lg">
      <h2 className="font-semibold mb-3">Edit Category</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Enter category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 w-full"
        />
        {/* <input
          type="text"
          placeholder="Paste image URL"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 w-full"
        /> */}
        <button
          type="submit"
          className="bg-[#4F46E5] hover:bg-[#4F46E5]/80 text-white px-4 py-2 w-full rounded-lg"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default EditCategoryForm;
