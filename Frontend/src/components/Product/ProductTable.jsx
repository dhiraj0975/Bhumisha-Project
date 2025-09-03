// import ProductRow from "./ProductRow";

// const ProductTable = ({ products, onDelete, onEdit }) => (
//   <div className="overflow-x-auto bg-white rounded-xl drop-shadow-lg">
//     <table className="w-full text-sm">
//       <thead className="bg-[#4F46E5] text-left text-white">
//         <tr>
//           <th className="p-3">S/N</th>
//           <th className="p-3">Image</th>
//           <th className="p-3">Name</th>
//           <th className="p-3">Price</th>
//           <th className="p-3">Description</th>
//           <th className="p-3">Created At</th>
//           <th className="p-3">Actions</th>
//         </tr>
//       </thead>
//       <tbody>
//         {products.map((product, index) => (
//           <ProductRow
//             key={product.id}
//             index={index + 1}
//             product={product}
//             onDelete={onDelete}
//             onEdit={onEdit}
//           />
//         ))}
//       </tbody>
//     </table>
//   </div>
// );

// export default ProductTable;


import React from "react";
import { Link } from "react-router-dom";

const ProductTable = ({ products, onDelete, onEdit }) => {
  return (
    <div className="overflow-x-auto bg-white rounded-xl drop-shadow-lg">
      <table className="w-full text-sm">
        <thead className="bg-[#4F46E5] text-left text-white">
          <tr>
            <th className="p-3">S/N</th>
            <th className="p-3">Image</th>
            <th className="p-3">Name</th>
            <th className="p-3">Price</th>
            <th className="p-3">Description</th>
            <th className="p-3">Created At</th>
            <th className="p-3">Actions</th>


            {/* <th className="p-3">S/N</th>
      <th className="p-3">Image</th>
      <th className="p-3">Name</th>
      <th className="p-3">Price</th>
      <th className="p-3">Description</th>
      <th className="p-3">Created At</th>
      <th className="p-3">Bill Rate</th>
      <th className="p-3">Transport</th>
      <th className="p-3">Local Transport</th>
      <th className="p-3">Packaging</th>
      <th className="p-3">Profit %</th>
      <th className="p-3">5 KG (30%)</th>
      <th className="p-3">10 KG (25%)</th>
      <th className="p-3">HSN Code</th>
      <th className="p-3">Value</th>
      <th className="p-3">30% Discount</th>
      <th className="p-3">25% Discount</th>
      <th className="p-3">50% Discount</th>
      <th className="p-3">Total (with GST)</th>
      <th className="p-3">GST %</th>
      <th className="p-3">Actions</th> */}
          </tr>
        </thead>
        <tbody>
          {products.map((p, index) => (
            <tr key={p.id} className="border-t text-center">
              {/* S/N */}
              <td className="p-3">{index + 1}</td>

              {/* Image */}
              <td className="p-3">
                <Link to={`/products/${p.id}`}>
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-16 h-16 object-contain mx-auto cursor-pointer"
                  />
                </Link>
              </td>

              {/* Name */}
              <td className="p-3">{p.name}</td>

              {/* Price */}
              <td className="p-3">₹{p.price}</td>

              {/* Description */}
              <td className="p-3">{p.description || "—"}</td>

              {/* Created At */}
              <td className="p-3">{p.createdAt || "N/A"}</td>

              {/* Actions */}
              <td className="p-3 flex gap-2 justify-center">
                <button
                  onClick={() => onEdit(p.id)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-1 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(p.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
                <Link
                  to={`/products/${p.id}`}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                >
                  View More
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable;
