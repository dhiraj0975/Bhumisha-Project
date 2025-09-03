import { useState } from "react";

const AddCategoryForm = ({ onAdd }) => {
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !imageUrl) return;
    onAdd({ name, image: imageUrl, createdAt: new Date().toLocaleString() });
    setName("");
    setImageUrl("");
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow drop-shadow-lg">
      <h2 className="font-semibold mb-3">Add New Category</h2>
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
          Save Category
        </button>
      </form>
    </div>
  );
};

export default AddCategoryForm;
