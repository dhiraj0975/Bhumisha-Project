import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts, addProduct, updateProduct, deleteProduct } from "../../features/products/productsSlice";
import { fetchCategories } from "../../features/Categories/categoiresSlice";
import { IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

// ✅ Discount calculation logic
const calculateDiscount = (billRate, size) => {
  let discount = 0;
  if (size === "5") discount = billRate * 0.3;   // 30% for 5kg
  else if (size === "10") discount = billRate * 0.25;
  else if (size === "25") discount = billRate * 0.5;
  else discount = 0;

  return discount;
};

export default function Products() {
  const dispatch = useDispatch();
  const { list: products, loading } = useSelector((state) => state.products);
  const { list: categories } = useSelector((state) => state.categories);

  const [formData, setFormData] = useState({
    category_id: "",
    product_name: "",
    size: "",
    bill_rate: "",
    transport_charge: "",
    local_transport: "",
    packaging_cost: "",
    packing_weight: "",
    hsn_code: "",
    value: "",
    total: "",
    gst: "",
  });
  const [editProduct, setEditProduct] = useState(null);

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCategories());
  }, [dispatch]);

  // ✅ Auto calculate values when size/bill_rate changes
  useEffect(() => {
    if (formData.bill_rate && formData.size) {
      const discount = calculateDiscount(Number(formData.bill_rate), formData.size);
      const value = Number(formData.bill_rate) - discount;
      const gstAmount = value * 0.18; // 18% GST
      const total = value + gstAmount + Number(formData.transport_charge || 0) + Number(formData.local_transport || 0) + Number(formData.packaging_cost || 0);

      setFormData((prev) => ({
        ...prev,
        value,
        discount_30: formData.size === "5" ? discount : 0,
        discount_25: formData.size === "10" ? discount : 0,
        discount_50: formData.size === "25" ? discount : 0,
        total,
        gst: gstAmount,
      }));
    }
  }, [formData.bill_rate, formData.size, formData.transport_charge, formData.local_transport, formData.packaging_cost]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAdd = () => {
    dispatch(addProduct(formData));
    setFormData({});
  };

  const handleUpdate = () => {
    dispatch(updateProduct({ id: editProduct.id, data: formData }));
    setEditProduct(null);
    setFormData({});
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this product?")) {
      dispatch(deleteProduct(id));
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Product Manager</h1>

      {/* Product Form */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <select name="category_id" value={formData.category_id} onChange={handleChange} className="border p-2 rounded">
          <option value="">Select Category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <input type="text" name="product_name" placeholder="Product Name" value={formData.product_name || ""} onChange={handleChange} className="border p-2 rounded" />
        <select name="size" value={formData.size} onChange={handleChange} className="border p-2 rounded">
          <option value="">Select Size</option>
          <option value="1">1 Kg</option>
          <option value="5">5 Kg</option>
          <option value="10">10 Kg</option>
          <option value="25">25 Kg</option>
        </select>

        <input type="number" name="bill_rate" placeholder="Bill Rate" value={formData.bill_rate || ""} onChange={handleChange} className="border p-2 rounded" />
        <input type="number" name="transport_charge" placeholder="Transport Charge" value={formData.transport_charge || ""} onChange={handleChange} className="border p-2 rounded" />
        <input type="number" name="local_transport" placeholder="Local Transport" value={formData.local_transport || ""} onChange={handleChange} className="border p-2 rounded" />
        <input type="number" name="packaging_cost" placeholder="Packaging Cost" value={formData.packaging_cost || ""} onChange={handleChange} className="border p-2 rounded" />
        <input type="number" name="packing_weight" placeholder="Packing Weight" value={formData.packing_weight || ""} onChange={handleChange} className="border p-2 rounded" />
        <input type="text" name="hsn_code" placeholder="HSN Code" value={formData.hsn_code || ""} onChange={handleChange} className="border p-2 rounded" />
        <input type="number" name="value" placeholder="Value" value={formData.value || ""} readOnly className="border p-2 rounded bg-gray-100" />
        <input type="number" name="total" placeholder="Total" value={formData.total || ""} readOnly className="border p-2 rounded bg-gray-100" />
        <input type="number" name="gst" placeholder="GST" value={formData.gst || ""} readOnly className="border p-2 rounded bg-gray-100" />
      </div>

      {editProduct ? (
        <button onClick={handleUpdate} className="px-4 py-2 bg-green-600 text-white rounded">Update</button>
      ) : (
        <button onClick={handleAdd} className="px-4 py-2 bg-blue-600 text-white rounded">Add Product</button>
      )}

      {/* Product List */}
      {loading ? (
        <p>Loading products...</p>
      ) : (
        <table className="w-full border mt-6">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">ID</th>
              <th className="p-2 border">Category</th>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Size</th>
              <th className="p-2 border">Bill Rate</th>
              <th className="p-2 border">Discount</th>
              <th className="p-2 border">Total</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td className="p-2 border">{p.id}</td>
                <td className="p-2 border">{p.category_name}</td>
                <td className="p-2 border">{p.product_name}</td>
                <td className="p-2 border">{p.size} Kg</td>
                <td className="p-2 border">{p.bill_rate}</td>
                <td className="p-2 border">
                  {p.discount_30 || p.discount_25 || p.discount_50 || 0}
                </td>
                <td className="p-2 border">{p.total}</td>
                <td className="p-2 border flex gap-2">
                  <IconButton color="primary" onClick={() => { setEditProduct(p); setFormData(p); }}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(p.id)}>
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
