// ProductDetail.jsx
import React from "react";
import { useParams } from "react-router-dom";

const ProductDetail = ({ products }) => {
  const { id } = useParams();
  const product = products?.find((p) => String(p.id) === id);

  if (!product) {
    return <div className="p-4 text-red-500">Product not found!</div>;
  }

  return (
    <div className="p-8 max-w-2xl mx-auto bg-white rounded-lg shadow">
      <img
        src={product.image}
        alt={product.name}
        className="w-70 h-70 rounded-md object-cover mx-auto"
      />
      <h2 className="text-2xl font-bold mt-4">{product.name}</h2>
      {/* <p className="p-3">Biller</p> */}
      <p className="text-lg text-gray-600">₹{product.price}</p>
      <p className="mt-2 text-gray-500">{product.description}</p>
      <p className="mt-2 text-gray-400 text-sm">
        Created At: {product.createdAt}
      </p>
    </div>
  );
};

export default ProductDetail;
