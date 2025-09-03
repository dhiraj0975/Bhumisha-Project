// import { useState } from "react";

// const AddProductForm = ({ onAdd }) => {
//   const [name, setName] = useState("");
//   const [price, setPrice] = useState("");
//   const [description, setDescription] = useState("");
//   const [imageUrl, setImageUrl] = useState("");

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (!name || !price || !imageUrl) return;

//     onAdd({
//       name,
//       price,
//       description,
//       image: imageUrl,
//       createdAt: new Date().toLocaleString(),
//     });

//     // reset form
//     setName("");
//     setPrice("");
//     setDescription("");
//     setImageUrl("");
//   };

//   return (
//     <div className="bg-white p-4 rounded-xl shadow drop-shadow-lg">
//       <h2 className="font-semibold mb-3">Add New Product</h2>
//       <form onSubmit={handleSubmit} className="space-y-3">
//         <input
//           type="text"
//           placeholder="Enter product name"
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//           className="border border-gray-300 rounded-lg px-3 py-2 w-full"
//         />
//         <input
//           type="number"
//           placeholder="Enter product price"
//           value={price}
//           onChange={(e) => setPrice(e.target.value)}
//           className="border border-gray-300 rounded-lg px-3 py-2 w-full"
//         />
//         <textarea
//           placeholder="Enter product description"
//           value={description}
//           onChange={(e) => setDescription(e.target.value)}
//           className="border border-gray-300 rounded-lg px-3 py-2 w-full"
//           rows="3"
//         />
//         <input
//           type="text"
//           placeholder="Paste image URL"
//           value={imageUrl}
//           onChange={(e) => setImageUrl(e.target.value)}
//           className="border border-gray-300 rounded-lg px-3 py-2 w-full"
//         />
//         <button
//           type="submit"
//           className="bg-[#4F46E5] hover:bg-[#4F46E5]/80 text-white px-4 py-2 w-full rounded-lg"
//         >
//           Save Product
//         </button>
//       </form>
//     </div>
//   );
// };

// export default AddProductForm;

import { useState } from "react";

const AddProductForm = ({ onAdd }) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !price || !imageFile) return;

    
    const imageUrl = URL.createObjectURL(imageFile);

    onAdd({
      name,
      price,
      description,
      image: imageUrl,
      createdAt: new Date().toLocaleString(),
    });

    // reset form
    setName("");
    setPrice("");
    setDescription("");
    setImageFile(null);
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow drop-shadow-lg">
      <h2 className="font-semibold mb-3">Add New Product</h2>
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

        {/* Image Upload Input */}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files[0])}
          className="border border-gray-300 rounded-lg px-3 py-2 w-full"
        />

        {/* Preview */}
        {imageFile && (
          <img
            src={URL.createObjectURL(imageFile)}
            alt="preview"
            className="w-32 h-32 object-cover rounded-md"
          />
        )}

        <button
          type="submit"
          className="bg-[#4F46E5] hover:bg-[#4F46E5]/80 text-white px-4 py-2 w-full rounded-lg"
        >
          Save Product
        </button>
      </form>
    </div>
  );
};

export default AddProductForm;


