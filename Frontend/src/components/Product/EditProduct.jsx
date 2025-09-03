
import { useState, useEffect } from "react";

const EditProduct = ({ onUpdate, editingProduct }) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  // ✅ Pre-fill when editing
  useEffect(() => {
    if (editingProduct) {
      setName(editingProduct.name || "");
      setPrice(editingProduct.price || "");
      setDescription(editingProduct.description || "");
      setImageUrl(editingProduct.image || "");
    }
  }, [editingProduct]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !price || !imageUrl) return;

    onUpdate({
      ...editingProduct,
      name,
      price,
      description,
      image: imageUrl,
    });
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow drop-shadow-lg">
      <h2 className="font-semibold mb-3">Edit Product</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Enter product name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 w-full"
        />
        <input
          type="number"
          placeholder="Enter product price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 w-full"
        />
        <textarea
          placeholder="Enter product description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 w-full"
          rows="3"
        />
        <input
          type="text"
          placeholder="Paste image URL"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 w-full"
        />
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

export default EditProduct;

