import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProducts,
  addProduct,
  updateProduct,
  deleteProduct,
} from "../../features/products/productsSlice";
import { fetchCategories } from "../../features/Categories/categoiresSlice";
import { IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
// ✅ Discounts from Purchase Rate (not Value)
const getDiscounts = (purchase) => ({
  discount_30: (purchase * 30) / 100,
  discount_25: (purchase * 25) / 100,
});

export default function Products() {
  const dispatch = useDispatch();
  const { list: products, loading } = useSelector((state) => state.products);
  const { list: categories } = useSelector((state) => state.categories);

  const [formData, setFormData] = useState({
    category_id: "",
    product_name: "",
    size: "",
    purchase_rate: "",
     transport_charge: 10,   // ✅ default number
  local_transport: 5,     // ✅ default number
  packaging_cost: 1.5,    // ✅ default number
    hsn_code: "",
    value: "",
    discount_30: 0,
    discount_25: 0,
    total: "",
    gst: "",
    gstAmount: 0,
  });

  const [editProduct, setEditProduct] = useState(null);

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCategories());
  }, [dispatch]);

  // ✅ Auto Calculation
  useEffect(() => {
    const purchase = Number(formData.purchase_rate) || 0;
    const transport = Number(formData.transport_charge) || 10;
    const local = Number(formData.local_transport) || 0.5;
    const packaging = Number(formData.packaging_cost) || 1.5;

    // Value = purchase + transport + local + packaging
    const value = purchase + transport + local + packaging;

    // Discounts from Purchase Rate
    const { discount_30, discount_25 } = getDiscounts(purchase);

    // ✅ Total Sales Rate = Value × 1.5
    const salesRate = value * 1.5;

    // GST
    const gstPercent = Number(formData.gst) || 0;
    const gstAmount = (salesRate * gstPercent) / 100;

    // ✅ Final Total = Sales Rate + GST
    const finalTotal = salesRate + gstAmount;

    setFormData((prev) => ({
      ...prev,
      value,
      discount_30,
      discount_25,
      total: finalTotal,
      gst: gstPercent,
      gstAmount,
    }));
  }, [
    formData.purchase_rate,
    formData.transport_charge,
    formData.local_transport,
    formData.packaging_cost,
    formData.gst,
  ]);

  // ✅ Handle Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Add Product
  const handleAdd = () => {
    dispatch(addProduct(formData));
    setFormData({});
  };

  // ✅ Update Product
  const handleUpdate = () => {
    dispatch(updateProduct({ id: editProduct.id, data: formData }));
    setEditProduct(null);
    setFormData({});
  };

  // ✅ Delete Product
  const handleDelete = (id) => {
    if (window.confirm("Delete this product?")) {
      dispatch(deleteProduct(id));
    }
  };

  // ✅ Group products by category
  const groupedProducts = categories.map((cat) => ({
    ...cat,
    products: products.filter((p) => p.category_id === cat.id),
  }));
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Product Manager</h1>

      {/* Product Form */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* Category */}
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium">Category</label>
          <select
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            className="border p-2 rounded"
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Product Name */}
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium">Product Name</label>
          <input
            type="text"
            name="product_name"
            placeholder="Product Name"
            value={formData.product_name || ""}
            onChange={handleChange}
            className="border p-2 rounded"
          />
        </div>

        {/* Size */}
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium">QTY</label>
          <input
            type="number"
            name="size"
            value={formData.size || ""}
            onChange={handleChange}
            className="border p-2 rounded"
          />
        </div>

        {/* Purchase Rate */}
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium">Purchase Rate</label>
          <input
            type="number"
            name="purchase_rate"
            value={formData.purchase_rate || ""}
            onChange={handleChange}
            className="border p-2 rounded"
          />
        </div>

        {/* Transport */}
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium">Transport</label>
          <input
            type="number"
            name="transport_charge"
            value={formData.transport_charge || "10"}
            onChange={handleChange}
            className="border p-2 rounded"
          />
        </div>

        {/* Local Transport */}
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium">Local Transport</label>
          <input
            type="number"
            name="local_transport"
            value={formData.local_transport || "5"}
            onChange={handleChange}
            className="border p-2 rounded"
          />
        </div>

        {/* Packaging */}
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium">Packaging Cost</label>
          <input
            type="number"
            name="packaging_cost"
            value={formData.packaging_cost || "1.5"}
            onChange={handleChange}
            className="border p-2 rounded"
          />
        </div>

        {/* HSN Code */}
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium">HSN Code</label>
          <input
            type="text"
            name="hsn_code"
            value={formData.hsn_code || ""}
            onChange={handleChange}
            className="border p-2 rounded"
          />
        </div>

        {/* GST */}
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium">GST %</label>
          <input
            type="number"
            name="gst"
            value={formData.gst || ""}
            onChange={handleChange}
            className="border p-2 rounded"
          />
        </div>

        {/* Value */}
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium">Value</label>
          <input
            type="number"
            name="value"
            value={formData.value || ""}
            readOnly
            className="border p-2 rounded bg-gray-100"
          />
        </div>

        {/* Discounts */}
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium">5KG 30% / Margin</label>
          <input
            type="number"
            name="discount_30"
            value={formData.discount_30 || ""}
            readOnly
            className="border p-2 rounded bg-gray-100"
          />
        </div>

        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium">10KG 25% / Margin</label>
          <input
            type="number"
            name="discount_25"
            value={formData.discount_25 || ""}
            readOnly
            className="border p-2 rounded bg-gray-100"
          />
        </div>



        {/* Total */}
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium">Total Sales Rate</label>
          <input
            type="number"
            name="total"
            value={formData.total || ""}
            readOnly
            className="border p-2 rounded bg-gray-100"
          />
        </div>
      </div>

      {editProduct ? (
        <button
          onClick={handleUpdate}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Update
        </button>
      ) : (
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Add Product
        </button>
      )}

   {/* Products Table */}
{loading ? (
  <p>Loading...</p>
) : (
  <table className="w-full border mt-6 text-sm">
    <thead>
      <tr className="bg-gray-200">
        <th className="p-2 border">Sl/No.</th>
        <th className="p-2 border">HSN Code</th>
        <th className="p-2 border">Product Name</th>
        <th className="p-2 border">Purchase R</th>
        <th className="p-2 border">Tspt</th>
        <th className="p-2 border">L-Tspt</th>
        <th className="p-2 border">Pac</th>
        <th className="p-2 border">Value</th>
        <th className="p-2 border">5KG (30%)</th>
        <th className="p-2 border">10KG (25%)</th>
        <th className="p-2 border">/KG (50%)</th>
        <th className="p-2 border">Total</th>
        <th className="p-2 border">GST %</th>
        <th className="p-2 border">Actions</th>
      </tr>
    </thead>
    <tbody>
      {groupedProducts.map((cat) => (
        <React.Fragment key={cat.id}>
          <tr className="bg-yellow-200 font-bold">
            <td colSpan="14" className="p-2 border">
              {cat.name}
            </td>
          </tr>
          {cat.products.map((p, index) => (
            <tr key={p.id}>
              <td className="p-2 border text-center">{index + 1}</td>
              <td className="p-2 border">{p.hsn_code}</td>
              <td className="p-2 border">{p.product_name}</td>
              <td className="p-2 border">{p.purchase_rate}</td>
              <td className="p-2 border">{p.transport_charge}</td>
              <td className="p-2 border">{p.local_transport}</td>
              <td className="p-2 border">{p.packaging_cost}</td>
              <td className="p-2 border">{p.value}</td>
              <td className="p-2 border">{p.discount_30}</td>
              <td className="p-2 border">{p.discount_25}</td>
              <td className="p-2 border">{p.discount_50}</td>
              <td className="p-2 border">{p.total}</td>
              <td className="p-2 border">{p.gst}%</td>
              <td className="p-2 border flex gap-2">
                <IconButton
                  color="primary"
                  onClick={() => {
                    setEditProduct(p);
                    setFormData(p);
                  }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  color="error"
                  onClick={() => handleDelete(p.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </td>
            </tr>
          ))}
        </React.Fragment>
      ))}
    </tbody>
  </table>
)}

    </div>
  );
}
