// import React, { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   fetchProducts,
//   addProduct,
//   updateProduct,
//   deleteProduct,
// } from "../../features/products/productsSlice";
// import { fetchCategories } from "../../features/Categories/categoiresSlice";
// import { IconButton } from "@mui/material";
// import EditIcon from "@mui/icons-material/Edit";
// import DeleteIcon from "@mui/icons-material/Delete";
// // ✅ Discounts from Purchase Rate (not Value)
// const getDiscounts = (purchase) => ({
//   discount_30: (purchase * 30) / 100,
//   discount_25: (purchase * 25) / 100,
// });

// export default function Products() {
//   const dispatch = useDispatch();
//   const { list: products, loading } = useSelector((state) => state.products);
//   const { list: categories } = useSelector((state) => state.categories);
//   const [filterCategory, setFilterCategory] = useState(""); // category filter
// const [filterProduct, setFilterProduct] = useState("");   // product name search

//   const [openForm, setOpenForm] = useState(false);

//   const [formData, setFormData] = useState({
//     category_id: "",
//     product_name: "",
//     size: "",
//     purchase_rate: "",
//     transport_charge: 10,   // ✅ default number
//   local_transport: 5,     // ✅ default number
//   packaging_cost: 1.5,    // ✅ default number
//     hsn_code: "",
//     value: "",
//     discount_30: 0,
//     discount_25: 0,
//     total: "",
//     gst: "",
//     gstAmount: 0,
//   });

//   const [editProduct, setEditProduct] = useState(null);

//   useEffect(() => {
//     dispatch(fetchProducts());
//     dispatch(fetchCategories());
//   }, [dispatch]);

//   // ✅ Auto Calculation
//   useEffect(() => {
//     const purchase = Number(formData.purchase_rate) || 0;
//     const transport = Number(formData.transport_charge) || 10;
//     const local = Number(formData.local_transport) || 0.5;
//     const packaging = Number(formData.packaging_cost) || 1.5;

//     // Value = purchase + transport + local + packaging
//     const value = purchase + transport + local + packaging;

//     // Discounts from Purchase Rate
//     const { discount_30, discount_25 } = getDiscounts(purchase);

//     // ✅ Total Sales Rate = Value × 1.5
//     const salesRate = value * 1.5;

//     // GST
//     const gstPercent = Number(formData.gst) || 0;
//     const gstAmount = (salesRate * gstPercent) / 100;

//     // ✅ Final Total = Sales Rate + GST
//     const finalTotal = salesRate + gstAmount;

//     setFormData((prev) => ({
//       ...prev,
//       value,
//       discount_30,
//       discount_25,
//       total: finalTotal,
//       gst: gstPercent,
//       gstAmount,
//     }));
//   }, [
//     formData.purchase_rate,
//     formData.transport_charge,
//     formData.local_transport,
//     formData.packaging_cost,
//     formData.gst,
//   ]);

//   // ✅ Handle Input Change
//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   // ✅ Add Product
// const handleAdd = async () => {
//   const resultAction = await dispatch(addProduct(formData));
//   if (addProduct.fulfilled.match(resultAction)) {
//     // agar backend se new product mil gaya
//     dispatch(fetchProducts()); // ya manually state me push kar sakte ho
//   }
//   setFormData({});
//   setOpenForm(false);
// };


//   // ✅ Update Product
//   const handleUpdate = () => {
//     dispatch(updateProduct({ id: editProduct.id, data: formData }));
//     setEditProduct(null);
//     setFormData({});
//   };

//   // ✅ Delete Product
//   const handleDelete = (id) => {
//     if (window.confirm("Delete this product?")) {
//       dispatch(deleteProduct(id));
//     }
//   };

  

//   // ✅ Group products by category
//   // const groupedProducts = categories.map((cat) => ({
//   //   ...cat,
//   //   products: products.filter((p) => p.category_id === cat.id),
//   // }));

//   const filteredProducts = products.filter((p) => {
//   const categoryMatch = filterCategory ? p.category_id === filterCategory : true;
//   const productMatch = filterProduct
//     ? p.product_name.toLowerCase().includes(filterProduct.toLowerCase())
//     : true;
//   return categoryMatch && productMatch;
// });

// const groupedProducts = categories.map((cat) => ({
//   ...cat,
//   products: filteredProducts.filter((p) => p.category_id === cat.id),
// }));



  
// return (
//   <div className=" max-w-7xl mx-auto">
//    <div className="flex bg-white shadow-lg rounded justify-between items-center mb-4 px-6">
//      <h1 className="text-2xl   font-bold mb-2 text-gray-800">📦 Product Management</h1>




// {/* Add Product Button */}
// <div>
// <div className="my-4 flex gap-4 items-center">
//   {/* Search Product */}
//   <input
//     type="text"
//     placeholder="Search Product..."
//     className="border p-2 rounded-lg bg-gray-50 flex-1"
//     value={filterProduct}
//     onChange={(e) => setFilterProduct(e.target.value)}
//   />

//   {/* Category Filter */}
//   <select
//     value={filterCategory}
//     onChange={(e) => setFilterCategory(Number(e.target.value))}
//     className="border p-2 rounded-lg bg-gray-50"
//   >
//     <option value="">All Categories</option>
//     {categories.map((cat) => (
//       <option key={cat.id} value={cat.id}>
//         {cat.name}
//       </option>
//     ))}
//   </select>

//   {/* Add Product Button */}
//   <button
//     onClick={() => {
//       setEditProduct(null);
//       setFormData({
//         category_id: "",
//         product_name: "",
//         size: "",
//         purchase_rate: "",
//         transport_charge: 10,
//         local_transport: 5,
//         packaging_cost: 1.5,
//         hsn_code: "",
//         value: "",
//         discount_30: 0,
//         discount_25: 0,
//         total: "",
//         gst: "",
//         gstAmount: 0,
//       });
//       setOpenForm(true);
//     }}
//     className="px-3 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow transition"
//   >
//     ➕ Add Product
//   </button>
// </div>

// {/* </div> */}

// </div>
//    </div>


// {/* Product Form Modal */}
// {openForm && (
//   <div className="fixed inset-0 bg-gray-500 bg-opacity-40 flex justify-center items-center z-50">
//     <div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-100 w-11/12 max-w-5xl max-h-[100vh] overflow-y-auto">
//       <h2 className="text-xl font-semibold mb-6 text-gray-700 flex items-center gap-2">
//         🛒 Product Details
//       </h2>

//       {/* ✅ Single Form Only */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         {/* Category */}
//         <div className="flex flex-col">
//           <label className="mb-2 text-sm font-semibold text-gray-600">Category</label>
//           <select
//             name="category_id"
//             value={formData.category_id}
//             onChange={handleChange}
//             className="border p-3 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500"
//           >
//             <option value="">Select Category</option>
//             {categories.map((c) => (
//               <option key={c.id} value={c.id}>
//                 {c.name}
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* Product Name */}
//         <div className="flex flex-col">
//           <label className="mb-2 text-sm font-semibold text-gray-600">Product Name</label>
//           <input
//             type="text"
//             name="product_name"
//             value={formData.product_name || ""}
//             onChange={handleChange}
//             className="border p-3 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500"
//           />
//         </div>

//         {/* Size */}
//         <div className="flex flex-col">
//           <label className="mb-2 text-sm font-semibold text-gray-600">QTY</label>
//           <input
//             type="number"
//             name="size"
//             value={formData.size || ""}
//             onChange={handleChange}
//             className="border p-3 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500"
//           />
//         </div>

//         {/* Purchase Rate */}
//         <div className="flex flex-col">
//           <label className="mb-2 text-sm font-semibold text-gray-600">Purchase Rate</label>
//           <input
//             type="number"
//             name="purchase_rate"
//             value={formData.purchase_rate || ""}
//             onChange={handleChange}
//             className="border p-3 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500"
//           />
//         </div>

//         {/* Transport */}
//         <div className="flex flex-col">
//           <label className="mb-2 text-sm font-semibold text-gray-600">Transport</label>
//           <input
//             type="number"
//             name="transport_charge"
//             value={formData.transport_charge || 10}
//             onChange={handleChange}
//             className="border p-3 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500"
//           />
//         </div>

//         {/* Local Transport */}
//         <div className="flex flex-col">
//           <label className="mb-2 text-sm font-semibold text-gray-600">Local Transport</label>
//           <input
//             type="number"
//             name="local_transport"
//             value={formData.local_transport || 5}
//             onChange={handleChange}
//             className="border p-3 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500"
//           />
//         </div>

//         {/* Packaging */}
//         <div className="flex flex-col">
//           <label className="mb-2 text-sm font-semibold text-gray-600">Packaging Cost</label>
//           <input
//             type="number"
//             name="packaging_cost"
//             value={formData.packaging_cost || 1.5}
//             onChange={handleChange}
//             className="border p-3 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500"
//           />
//         </div>

//         {/* HSN Code */}
//         <div className="flex flex-col">
//           <label className="mb-2 text-sm font-semibold text-gray-600">HSN Code</label>
//           <input
//             type="text"
//             name="hsn_code"
//             value={formData.hsn_code || ""}
//             onChange={handleChange}
//             className="border p-3 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500"
//           />
//         </div>

//         {/* GST */}
//         <div className="flex flex-col">
//           <label className="mb-2 text-sm font-semibold text-gray-600">GST %</label>
//           <input
//             type="number"
//             name="gst"
//             value={formData.gst || ""}
//             onChange={handleChange}
//             className="border p-3 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500"
//           />
//         </div>

//         {/* ReadOnly Fields */}
//         <div className="flex flex-col">
//           <label className="mb-2 text-sm font-semibold text-gray-600">Value</label>
//           <input
//             type="number"
//             name="value"
//             value={formData.value || ""}
//             readOnly
//             className="border p-3 rounded-lg bg-gray-100 text-gray-600"
//           />
//         </div>

//         <div className="flex flex-col">
//           <label className="mb-2 text-sm font-semibold text-gray-600">5KG 30% / Margin</label>
//           <input
//             type="number"
//             value={formData.discount_30 || ""}
//             readOnly
//             className="border p-3 rounded-lg bg-gray-100 text-gray-600"
//           />
//         </div>

//         <div className="flex flex-col">
//           <label className="mb-2 text-sm font-semibold text-gray-600">10KG 25% / Margin</label>
//           <input
//             type="number"
//             value={formData.discount_25 || ""}
//             readOnly
//             className="border p-3 rounded-lg bg-gray-100 text-gray-600"
//           />
//         </div>

//         <div className="flex flex-col md:col-span-3">
//           <label className="mb-2 text-sm font-semibold text-gray-600">Total Sales Rate</label>
//           <input
//             type="number"
//             value={formData.total || ""}
//             readOnly
//             className="border p-3 rounded-lg bg-gray-100 text-gray-600"
//           />
//         </div>
//       </div>

//       {/* ✅ Buttons */}
//       <div className="mt-6 flex justify-end gap-4">
//         <button
//           onClick={() => setOpenForm(false)}
//           className="px-6 curser-pointer py-2 bg-red-400 hover:bg-gray-500 text-white rounded-lg"
//         >
//           ❌ Cancel
//         </button>
//         {editProduct ? (
//           <button
//             onClick={() => {
//               handleUpdate();
//               setOpenForm(false);
//             }}
//             className="px-6 py-2 curser-pointer bg-green-600 hover:bg-green-700 text-white rounded-lg"
//           >
//             ✅ Update
//           </button>
//         ) : (
//           <button
//             onClick={() => {
//               handleAdd();
//               setOpenForm(false);
//             }}
//             className="px-6 py-2 curser-pointer bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
//           >
//             ➕ Add Product
//           </button>
//         )}
//       </div>
//     </div>
//   </div>
// )}


   

//     {/* Products Table */}
//     {loading ? (
//       <p className="text-center text-gray-500">Loading...</p>
//     ) : (
//       <div className="overflow-x-auto bg-white shadow-xl rounded-2xl border border-gray-200">
//   <table className="w-full   text-left border-collapse">
//     <thead className="bg-gray-100 text-sm text-black sticky top-0 shadow-md">
//       <tr>
//         <th className="p-3">Sl/No.</th>
//         <th className="p-3">HSN Code</th>
//         <th className="p-3">Product Name</th>
//         <th className="p-3">Purchase R</th>
//         <th className="p-3">Tspt</th>
//         <th className="p-3">L-Tspt</th>
//         <th className="p-3">Pac</th>
//         <th className="p-3">Value</th>
//         <th className="p-3">5KG(30%)</th>
//         <th className="p-3">10KG(25%)</th>
//         <th className="p-3">/KG(50%)</th>
//         <th className="p-3">Total</th>
//         <th className="p-3">GST%</th>
//         <th className="p-3 text-center">Actions</th>
//       </tr>
//     </thead>
//     <tbody>
//       {groupedProducts.map((cat) => (
//         <React.Fragment key={cat.id}>
//           {/* Category Row */}
//           <tr className="bg-yellow-200">
//             <td colSpan="14" className="p-3 font-bold text-gray-800 text-lg">
//               {cat.name}
//             </td>
//           </tr>
//           {cat.products.map((p, index) => (
//             <tr
//               key={p.id}
//               className="border-b hover:bg-gray-50 transition duration-200 ease-in-out hover:shadow-lg"
//             >
//               <td className="p-3 text-center font-medium">{index + 1}</td>
//               <td className="p-3">{p.hsn_code}</td>
//               <td className="p-3 font-semibold text-gray-700">{p.product_name}</td>
//               <td className="p-3">{p.purchase_rate}</td>
//               <td className="p-3">{p.transport_charge}</td>
//               <td className="p-3">{p.local_transport}</td>
//               <td className="p-3">{p.packaging_cost}</td>
//               <td className="p-3 font-medium">{p.value}</td>
//               <td className="p-3">{p.discount_30}</td>
//               <td className="p-3">{p.discount_25}</td>
//               <td className="p-3">{p.discount_50 || "-"}</td>
//               <td className="p-3 font-semibold text-blue-600">{p.total}</td>
//               <td className="p-3">{p.gst}%</td>
//               <td className="p-3 flex gap-2 justify-center">
//                 <IconButton
//                   color="primary"
//                   className="hover:scale-110 transition-transform"
//                   onClick={() => {
//                     setEditProduct(p);
//                     setFormData(p);
//                     setOpenForm(true);
//                   }}
//                 >
//                   <EditIcon />
//                 </IconButton>

//                 <IconButton
//                   color="error"
//                   className="hover:scale-110 transition-transform"
//                   onClick={() => handleDelete(p.id)}
//                 >
//                   <DeleteIcon />
//                 </IconButton>
//               </td>
//             </tr>
//           ))}
//         </React.Fragment>
//       ))}
//     </tbody>
//   </table>
// </div>

//     )}
//   </div>
// );

// }
// src/components/Products.jsx
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

// Discounts from Purchase Rate (not Value)
const getDiscounts = (purchase) => ({
  discount_30: (purchase * 30) / 100,
  discount_25: (purchase * 25) / 100,
});

export default function Products() {
  const dispatch = useDispatch();
  const { list: products, loading } = useSelector((state) => state.products);
  const { list: categories } = useSelector((state) => state.categories);

  const [filterCategory, setFilterCategory] = useState("");
  const [filterProduct, setFilterProduct] = useState("");

  const [openForm, setOpenForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);

  const initialForm = {
    category_id: "",
    product_name: "",
    size: "",                 // bind size
    purchase_rate: "",
    transport_charge: 10,
    local_transport: 5,
    packaging_cost: 1.5,
    hsn_code: "",
    value: "",
    discount_30: 0,
    discount_25: 0,
    total: "",
    gst: "",
    gstAmount: 0,
  };

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCategories());
  }, [dispatch]);

  // Auto Calculation
  useEffect(() => {
    const purchase = Number(formData.purchase_rate) || 0;
    const transport = Number(formData.transport_charge) || 10;
    const local = Number(formData.local_transport) || 0.5;
    const packaging = Number(formData.packaging_cost) || 1.5;

    const value = purchase + transport + local + packaging;

    const { discount_30, discount_25 } = getDiscounts(purchase);

    const salesRate = value * 1.5;

    const gstPercent = Number(formData.gst) || 0;
    const gstAmount = (salesRate * gstPercent) / 100;

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Add Product
  const handleAdd = async () => {
    const resultAction = await dispatch(addProduct(formData));
    if (addProduct.fulfilled.match(resultAction)) {
      dispatch(fetchProducts());
    }
    setFormData(initialForm);
    setOpenForm(false);
  };

  // Update Product
  const handleUpdate = () => {
    if (!editProduct?.id) return;
    dispatch(updateProduct({ id: editProduct.id, data: formData }));
    setEditProduct(null);
    setFormData(initialForm);
    setOpenForm(false);
  };

  // Delete Product
  const handleDelete = (id) => {
    if (window.confirm("Delete this product?")) {
      dispatch(deleteProduct(id));
    }
  };

  // Filters
  const filteredProducts = products.filter((p) => {
    const categoryMatch = filterCategory ? p.category_id === filterCategory : true;
    const q = filterProduct.toLowerCase();
    const productMatch = filterProduct
      ? (p.product_name?.toLowerCase().includes(q) ||
         String(p.size ?? "").toLowerCase().includes(q))   // include size in search
      : true;
    return categoryMatch && productMatch;
  });

  const groupedProducts = categories.map((cat) => ({
    ...cat,
    products: filteredProducts.filter((p) => p.category_id === cat.id),
  }));

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex bg-white shadow-lg rounded justify-between items-center mb-4 px-6">
        <h1 className="text-2xl font-bold mb-2 text-gray-800">📦 Product Management</h1>

        <div>
          <div className="my-4 flex gap-4 items-center">
            {/* Search Product */}
            <input
              type="text"
              placeholder="Search Product..."
              className="border p-2 rounded-lg bg-gray-50 flex-1"
              value={filterProduct}
              onChange={(e) => setFilterProduct(e.target.value)}
            />

            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(Number(e.target.value))}
              className="border p-2 rounded-lg bg-gray-50"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* Add Product Button */}
            <button
              onClick={() => {
                setEditProduct(null);
                setFormData(initialForm);
                setOpenForm(true);
              }}
              className="px-3 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow transition"
            >
              ➕ Add Product
            </button>
          </div>
        </div>
      </div>

      {/* Product Form Modal */}
      {openForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-100 w-11/12 max-w-5xl max-h-[100vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-6 text-gray-700 flex items-center gap-2">
              🛒 Product Details
            </h2>

            {/* Single Form */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Category */}
              <div className="flex flex-col">
                <label className="mb-2 text-sm font-semibold text-gray-600">Category</label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  className="border p-3 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500"
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
                <label className="mb-2 text-sm font-semibold text-gray-600">Product Name</label>
                <input
                  type="text"
                  name="product_name"
                  value={formData.product_name || ""}
                  onChange={handleChange}
                  className="border p-3 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Size */}
              <div className="flex flex-col">
                <label className="mb-2 text-sm font-semibold text-gray-600">QTY (5KG, 10KG, 1L)</label>
                <input
                  type="text"                       // use "number" if strictly numeric quantities
                  name="size"
                  value={formData.size || ""}
                  onChange={handleChange}
                  placeholder="e.g., 5KG, 10KG, 1L"
                  className="border p-3 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500"
                />
              </div>
 
              {/* Purchase Rate */}
              <div className="flex flex-col">
                <label className="mb-2 text-sm font-semibold text-gray-600">Purchase Rate</label>
                <input
                  type="number"
                  name="purchase_rate"
                  value={formData.purchase_rate || ""}
                  onChange={handleChange}
                  className="border p-3 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Transport */}
              <div className="flex flex-col">
                <label className="mb-2 text-sm font-semibold text-gray-600">Transport</label>
                <input
                  type="number"
                  name="transport_charge"
                  value={formData.transport_charge || 10}
                  onChange={handleChange}
                  className="border p-3 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Local Transport */}
              <div className="flex flex-col">
                <label className="mb-2 text-sm font-semibold text-gray-600">Local Transport</label>
                <input
                  type="number"
                  name="local_transport"
                  value={formData.local_transport || 5}
                  onChange={handleChange}
                  className="border p-3 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Packaging */}
              <div className="flex flex-col">
                <label className="mb-2 text-sm font-semibold text-gray-600">Packaging Cost</label>
                <input
                  type="number"
                  name="packaging_cost"
                  value={formData.packaging_cost || 1.5}
                  onChange={handleChange}
                  className="border p-3 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* HSN Code */}
              <div className="flex flex-col">
                <label className="mb-2 text-sm font-semibold text-gray-600">HSN Code</label>
                <input
                  type="text"
                  name="hsn_code"
                  value={formData.hsn_code || ""}
                  onChange={handleChange}
                  className="border p-3 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* GST */}
              <div className="flex flex-col">
                <label className="mb-2 text-sm font-semibold text-gray-600">GST %</label>
                <input
                  type="number"
                  name="gst"
                  value={formData.gst || ""}
                  onChange={handleChange}
                  className="border p-3 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* ReadOnly Fields */}
              <div className="flex flex-col">
                <label className="mb-2 text-sm font-semibold text-gray-600">Value</label>
                <input
                  type="number"
                  name="value"
                  value={formData.value || ""}
                  readOnly
                  className="border p-3 rounded-lg bg-gray-100 text-gray-600"
                />
              </div>

              <div className="flex flex-col">
                <label className="mb-2 text-sm font-semibold text-gray-600">5KG 30% / Margin</label>
                <input
                  type="number"
                  value={formData.discount_30 || ""}
                  readOnly
                  className="border p-3 rounded-lg bg-gray-100 text-gray-600"
                />
              </div>

              <div className="flex flex-col">
                <label className="mb-2 text-sm font-semibold text-gray-600">10KG 25% / Margin</label>
                <input
                  type="number"
                  value={formData.discount_25 || ""}
                  readOnly
                  className="border p-3 rounded-lg bg-gray-100 text-gray-600"
                />
              </div>

              <div className="flex flex-col md:col-span-3">
                <label className="mb-2 text-sm font-semibold text-gray-600">Total Sales Rate</label>
                <input
                  type="number"
                  value={formData.total || ""}
                  readOnly
                  className="border p-3 rounded-lg bg-gray-100 text-gray-600"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-6 flex justify-end gap-4">
              <button
                onClick={() => setOpenForm(false)}
                className="px-6 curser-pointer py-2 bg-red-400 hover:bg-gray-500 text-white rounded-lg"
              >
                ❌ Cancel
              </button>
              {editProduct ? (
                <button
                  onClick={handleUpdate}
                  className="px-6 py-2 curser-pointer bg-green-600 hover:bg-green-700 text-white rounded-lg"
                >
                  ✅ Update
                </button>
              ) : (
                <button
                  onClick={handleAdd}
                  className="px-6 py-2 curser-pointer bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  ➕ Add Product
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Products Table */}
      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow-xl rounded-2xl border border-gray-200">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100 text-sm text-black sticky top-0 shadow-md">
              <tr>
                <th className="p-3">Sl/No.</th>
                <th className="p-3">HSN Code</th>
                <th className="p-3">Product Name</th>
                <th className="p-3">QTY</th> {/* NEW */}
                <th className="p-3">Purchase R</th>
                <th className="p-3">Tspt</th>
                <th className="p-3">L-Tspt</th>
                <th className="p-3">Pac</th>
                <th className="p-3">Value</th>
                <th className="p-3">5KG(30%)</th>
                <th className="p-3">10KG(25%)</th>
                <th className="p-3">/KG(50%)</th>
                <th className="p-3">Total Sale R</th>
                <th className="p-3">GST%</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {groupedProducts.map((cat) => (
                <React.Fragment key={cat.id}>
                  {/* Category Row */}
                  <tr className="bg-yellow-200">
                    <td colSpan="15" className="p-3 font-bold text-gray-800 text-lg">
                      {cat.name}
                    </td>
                  </tr>
                  {cat.products.map((p, index) => (
                    <tr
                      key={p.id}
                      className="border-b hover:bg-gray-50 transition duration-200 ease-in-out hover:shadow-lg"
                    >
                      <td className="p-3 text-center font-medium">{index + 1}</td>
                      <td className="p-3">{p.hsn_code}</td>
                      <td className="p-3 font-semibold text-gray-700">{p.product_name}</td>
                      <td className="p-3">{p.size ?? "-"}</td> {/* NEW */}
                      <td className="p-3">{p.purchase_rate}</td>
                      <td className="p-3">{p.transport_charge}</td>
                      <td className="p-3">{p.local_transport}</td>
                      <td className="p-3">{p.packaging_cost}</td>
                      <td className="p-3 font-medium">{p.value}</td>
                      <td className="p-3">{p.discount_30}</td>
                      <td className="p-3">{p.discount_25}</td>
                      <td className="p-3">{p.discount_50 || "-"}</td>
                      <td className="p-3 font-semibold text-blue-600">{p.total}</td>
                      <td className="p-3">{p.gst}%</td>
                      <td className="p-3 flex gap-2 justify-center">
                        <IconButton
                          color="primary"
                          className="hover:scale-110 transition-transform"
                          onClick={() => {
                            setEditProduct(p);
                            setFormData({
                              category_id: p.category_id ?? "",
                              product_name: p.product_name ?? "",
                              size: p.size ?? "",
                              purchase_rate: p.purchase_rate ?? "",
                              transport_charge: p.transport_charge ?? 10,
                              local_transport: p.local_transport ?? 5,
                              packaging_cost: p.packaging_cost ?? 1.5,
                              hsn_code: p.hsn_code ?? "",
                              value: p.value ?? "",
                              discount_30: p.discount_30 ?? 0,
                              discount_25: p.discount_25 ?? 0,
                              total: p.total ?? "",
                              gst: p.gst ?? "",
                              gstAmount: p.gstAmount ?? 0,
                            });
                            setOpenForm(true);
                          }}
                        >
                          <EditIcon />
                        </IconButton>

                        <IconButton
                          color="error"
                          className="hover:scale-110 transition-transform"
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
        </div>
      )}
    </div>
  );
}
