// import React, { useEffect, useMemo, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchVendors } from "../../features/vendor/vendorThunks";
// import { fetchProducts } from "../../features/products/productsSlice";
// import {fetchPurchaseOrders, createPurchaseOrder, updatePurchaseOrder } from "../../features/purchaseOrders/purchaseOrderSlice";

// const fx = (n) => (isNaN(n) ? "0.000" : Number(n).toFixed(3));

// const PurchaseOrderForm = ({ purchaseOrder, onSubmitted }) => {
//   const dispatch = useDispatch();
//   const { loading } = useSelector((s) => s.purchaseOrders);
//   const { vendors = [] } = useSelector((s) => s.vendor);
//   const { list: products = [], loading: productsLoading } = useSelector((s) => s.product);

//   const isEditMode = Boolean(purchaseOrder);

//   const [header, setHeader] = useState({});
//   const [rows, setRows] = useState([]);

//   // initial fetch
//   useEffect(() => {
//     dispatch(fetchPurchaseOrders());
//     dispatch(fetchVendors());
//     dispatch(fetchProducts());
//   }, [dispatch]);

//   // sync props -> state
//   useEffect(() => {
//     const initialHeader = {
//       po_no: "",
//       date: "",
//       bill_time: "",
//       bill_time_am_pm: "PM",
//       vendor_id: "",
//       address: "",
//       mobile_no: "",
//       gst_no: "",
//       gst_type: "ADD",
//       place_of_supply: "",
//       terms_condition: "",
//       edit_bill: "",
//     };

//     const initialRows = [
//       { product_id: "", item_name: "", hsn_code: "", qty: 1, rate: 0, d1_percent: 0, gst_percent: 0 },
//     ];

//     if (isEditMode && purchaseOrder) {
//       const normalizedDate = purchaseOrder.date
//         ? new Date(purchaseOrder.date).toISOString().split("T")[0]
//         : "";
//       setHeader({
//         ...initialHeader,
//         ...purchaseOrder,
//         date: normalizedDate,
//         bill_time_am_pm: "PM",
//       });
//       setRows(
//         purchaseOrder.items && purchaseOrder.items.length > 0
//           ? purchaseOrder.items.map((r) => ({
//               ...r,
//               qty: Number(r.qty || 0),
//               rate: Number(r.rate || 0),
//               d1_percent: Number(r.d1_percent ?? r.discount_rate ?? 0),
//               gst_percent: Number(r.gst_percent || 0),
//               product_id: String(r.product_id ?? ""),
//             }))
//           : initialRows
//       );
//     } else {
//       setHeader(initialHeader);
//       setRows(initialRows);
//     }
//   }, [purchaseOrder, isEditMode]);

// const onHeader = (e) => {
//   let value = e.target.value;

//   if (e.target.name === "vendor_id") {
//     value = parseInt(value, 10) || 0;

//     // vendor list me se select kiya hua vendor nikal
//     const selectedVendor = vendors.find(
//       (v) => String(v.id ?? v._id) === String(value)
//     );

//     if (selectedVendor) {
//       // vendor ke details auto fill
//       setHeader((p) => ({
//         ...p,
//         vendor_id: value,
//         address: selectedVendor.address || "",
//         mobile_no: selectedVendor.mobile_no || "",
//         gst_no: selectedVendor.gst_no || "",
//       }));
//       return; // niche wala code skip ho jaye
//     }
//   }

//   setHeader((p) => ({ ...p, [e.target.name]: value }));
// };


// const onRow = (i, field, value) => {
//   setRows((prev) => {
//     const next = [...prev];
//     const numericFields = ["qty", "rate", "d1_percent", "gst_percent", "product_id"];
//     next[i] = {
//       ...next[i],
//       [field]: numericFields.includes(field)
//         ? (value === "" ? 0 : Number(value))
//         : value,
//     };
//     if (field === "product_id") {
//       const product = products.find((p) => String(p.id ?? p._id) === String(value));
//       next[i].item_name = product ? product.product_name || "" : "";
//       next[i].hsn_code = product ? product.hsn_code || "" : "";
//       next[i].purchase_rate = product ? product.purchase_rate || "" : "";
//     }
//     return next;
//   });
// };



//   const addRow = () =>
//     setRows((p) => [
//       ...p,
//       { product_id: "", item_name: "", hsn_code: "", qty: 1, rate: 0, d1_percent: 0, gst_percent: 0 },
//     ]);
//   const removeRow = (i) => setRows((p) => p.filter((_, idx) => idx !== i));

//   // line calc: discount first, then GST on taxable
//   const calc = (r) => {
//     const base = (Number(r.qty) || 0) * (Number(r.rate) || 0);
//     const perUnitDisc = ((Number(r.rate) || 0) * (Number(r.d1_percent) || 0)) / 100;
//     const totalDisc = (Number(r.qty) || 0) * perUnitDisc;
//     const taxable = Math.max(base - totalDisc, 0);
//     const gstAmt = (taxable * (Number(r.gst_percent) || 0)) / 100;
//     const final = taxable + gstAmt;
//     return { base, perUnitDisc, totalDisc, taxable, gstAmt, final };
//   };

//   // totals
//   const totals = useMemo(
//     () =>
//       rows.reduce(
//         (a, r) => {
//           const c = calc(r);
//           a.base += c.base;
//           a.disc += c.totalDisc;
//           a.taxable += c.taxable;
//           a.gst += c.gstAmt;
//           a.final += c.final;
//           return a;
//         },
//         { base: 0, disc: 0, taxable: 0, gst: 0, final: 0 }
//       ),
//     [rows]
//   );

// const isFormValid = useMemo(() => {
//   // agar header ya rows empty ho → form invalid
//   if (!header || !rows || rows.length === 0) return false;

//   // ✅ Header validation
//   const headerValid =
//     header.po_no &&                     // PO No. must exist
//     String(header.po_no).trim() !== "" && // not empty string
//     header.vendor_id &&                 // vendor selected
//     Number(header.vendor_id) > 0;       // valid number

//   // ✅ Rows validation
//   const rowsValid = rows.every((r) => {
//     return (
//       r.product_id &&                   // product selected
//       Number(r.product_id) > 0 &&       // valid number
//       Number(r.qty) > 0 &&              // qty > 0
//       Number(r.rate) > 0                // rate > 0
//     );
//   });

//   return Boolean(headerValid && rowsValid); // header + all rows valid
// }, [header, rows]);


//   // submit
// const onSubmit = async (e) => {
//   e.preventDefault();

//   try {
//     // 🔹 Date + Time merge karna
//     let [h = "00", m = "00"] = String(header.bill_time || "00:00").split(":");
//     let hour = Number(h);
//     let minute = Number(m);

//     if (isNaN(hour)) hour = 0;
//     if (isNaN(minute)) minute = 0;

//     if (header.bill_time_am_pm === "PM" && hour < 12) hour += 12;
//     if (header.bill_time_am_pm === "AM" && hour === 12) hour = 0;

//     const bill_time = header.date
//       ? `${header.date} ${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`
//       : null;

//     // 🔹 Items array prepare karna
//     const items = rows.map((r) => {
//       const c = calc(r);
//       if (!r.product_id || Number(r.product_id) <= 0) {
//         throw new Error("Product ID is required for all items");
//       }
//       return {
//         ...r,
//         product_id: Number(r.product_id),
//         qty: Number(r.qty),
//         rate: Number(r.rate),
//         amount: c.base,
//         discount_rate: r.d1_percent,
//         discount_per_qty: c.perUnitDisc,
//         discount_total: c.totalDisc,
//         taxable_amount: c.taxable,
//         gst_amount: c.gstAmt,
//         total: c.final,
//       };
//     });

//     // 🔹 Summary calculation
//     const summary = {
//       total_amount: totals.base,
//       total_discount: totals.disc,
//       total_taxable: totals.taxable,
//       total_gst: totals.gst,
//       grand_total: totals.final,
//     };

//     // 🔹 Payload ready
//     const payload = { ...header, bill_time, items, summary };

//     // 🔹 Dispatch create/update action
//     const action = isEditMode
//       ? updatePurchaseOrder({ id: purchaseOrder._id || purchaseOrder.id, data: payload })
//       : createPurchaseOrder(payload);

//     const result = await dispatch(action);

//     // 🔹 Success callback
//     if (!result.error && onSubmitted) onSubmitted();
//   } catch (err) {
//     console.error("Error submitting purchase order:", err);
//     alert("Failed to submit purchase order. Check console for details.");
//   }
// };


//   return (
//     <form onSubmit={onSubmit} className="p-3">
//       {/* Header strip */}
//       <div className="grid grid-cols-6 gap-3 border p-3 rounded">
//         <div className="flex flex-col">
//           <label className="text-xs">PO No.</label>
//           <input className="border rounded p-1" name="po_no" value={header.po_no} onChange={onHeader} />
//         </div>

//         <div className="flex flex-col">
//           <label className="text-xs">DATE</label>
//           <input type="date" className="border rounded p-1" name="date" value={header.date} onChange={onHeader} />
//         </div>

//         <div className="flex flex-col">
//           <label className="text-xs">BILL TIME</label>
//           <div className="flex gap-1">
//             <input
//               type="time"
//               className="border rounded p-1 w-full"
//               name="bill_time"
//               value={header.bill_time}
//               onChange={onHeader}
//             />
//             <select
//               name="bill_time_am_pm"
//               className="border rounded p-1"
//               value={header.bill_time_am_pm}
//               onChange={onHeader}
//             >
//               <option>AM</option>
//               <option>PM</option>
//             </select>
//           </div>
          
//         </div>

//         <div className="flex flex-col">
//           <label className="text-xs">Vendor</label>
//           <select className="border rounded p-1" name="vendor_id" value={header.vendor_id} onChange={onHeader}>
//             <option value="">Select</option>
//             {vendors.map((v) => (
//               <option key={v.id ?? v._id} value={String(v.id ?? v._id)}>
//                 {v.name}
//               </option>
//             ))}
//           </select>
//         </div>

//         <div className="flex flex-col">
//           <label className="text-xs">ADDRESS</label>
//           <input className="border rounded p-1" name="address" value={header.address} onChange={onHeader} />
//         </div>

//         <div className="flex flex-col">
//           <label className="text-xs">MOBILE NO</label>
//           <input className="border rounded p-1" name="mobile_no" value={header.mobile_no} onChange={onHeader} />
//         </div>

//         <div className="flex flex-col">
//           <label className="text-xs">GST No</label>
//           <input className="border rounded p-1" name="gst_no" value={header.gst_no} onChange={onHeader} />
//         </div>

//         <div className="flex flex-col">
//           <label className="text-xs">Place of Supply</label>
//           <input
//             className="border rounded p-1"
//             name="place_of_supply"
//             value={header.place_of_supply}
//             onChange={onHeader}
//           />
//         </div>

//         <div className="flex flex-col col-span-2">
//           <label className="text-xs">Terms</label>
//           <input
//             className="border rounded p-1"
//             name="terms_condition"
//             value={header.terms_condition}
//             onChange={onHeader}
//             placeholder="e.g., 30 days payment term"
//           />
//         </div>
//       </div>

//       {/* Final Amount banner */}
//       <div className="bg-black text-yellow-300 text-center text-2xl font-semibold py-2 mt-3 mb-2 rounded">
//         FINAL AMOUNT: {fx(totals.final)}
//       </div>

//       {/* Items table */}
//       <div className="overflow-auto">
//         <table className="w-full text-sm border">
//           <thead className="bg-green-700 text-white">
//             <tr>
//               {["SI", "Item Name", "HSNCode", "Qty", "Rate", "Amount", "Disc %", "per qty Disc", "Disc", "GST%", "GST Amt", "FinalAmt", "Actions"].map(
//                 (h, idx) => (
//                   <th key={`${h}-${idx}`} className="border px-2 py-1 text-left">
//                     {h}
//                   </th>
//                 )
//               )}
//             </tr>
//           </thead>
//           <tbody>
//             {rows.map((r, i) => {
//               const c = calc(r);
//               return (
//                 <tr key={i} className="odd:bg-white even:bg-gray-50">
//                   <td className="border px-2 py-1">{i + 1}</td>

//                   <td className="border px-2 py-1">
//                     <div className="flex gap-1">
//                    <select
//   className="border rounded p-1 w-44"
//   value={r.product_id}
//   onChange={(e) => {
//     const pid = e.target.value;
//     const p = products.find((x) => String(x.id) === String(pid));
    
//     // ✅ update product_id & item_name
//     onRow(i, "product_id", pid);
//     if (p) {
//       onRow(i, "item_name", p.product_name || "");
//       onRow(i, "hsn_code", p.hsn_code || ""); // 👈 auto-fill HSN
//        onRow(i, "rate", Number(p.purchase_rate || 0)); // 👈 yahi line add ki
//     }
//   }}
// >
//   <option value="">Select</option>
//   {products.map((p) => (
//     <option key={p.id} value={String(p.id)}>
//       {p.product_name}
//     </option>
//   ))}
// </select>
//                     </div>
//                   </td>

//                   <td className="border px-2 py-1">
//                     <input
//                     readOnly
//                       className="border cursor-not-allowed bg-gray-100 rounded p-1 w-24"
//                       value={r.hsn_code}
//                       onChange={(e) => onRow(i, "hsn_code", e.target.value)}
//                     />
//                   </td>

//                   <td className="border px-2 py-1">
//                     <input
//                       type="number"
//                       className="border rounded p-1 w-20"
//                       value={r.qty === 0 ? "" : r.qty}
//                       onChange={(e) => onRow(i, "qty", e.target.value)}
//                     />
//                   </td>

//                   <td className="border px-2 py-1">
//                     <input
//                       type="number"
//                       className="border rounded p-1 w-20"
//                       value={r.rate}
//                       onChange={(e) => onRow(i, "rate", e.target.value)}
//                     />
//                   </td>

//                   <td className="border px-2 py-1">{fx(c.base)}</td>

//                   <td className="border px-2 py-1">
//                     <input
//                       type="number"
//                       className="border rounded p-1 w-16"
//                       value={r.d1_percent}
//                       onChange={(e) => onRow(i, "d1_percent", e.target.value)}
//                     />
//                   </td>

//                   <td className="border px-2 py-1">
//                     <input type="number" className="border rounded p-1 w-20 bg-gray-100" value={fx(c.perUnitDisc)} readOnly />
//                   </td>

//                   <td className="border px-2 py-1">
//                     <input type="number" className="border rounded p-1 w-24 bg-gray-100" value={fx(c.totalDisc)} readOnly />
//                   </td>

//                   <td className="border px-2 py-1">
//                     <input
//                       type="number"
//                       className="border rounded p-1 w-16"
//                       value={r.gst_percent}
//                       onChange={(e) => onRow(i, "gst_percent", e.target.value)}
//                     />
//                   </td>

//                   <td className="border px-2 py-1">{fx(c.gstAmt)}</td>
//                   <td className="border px-2 py-1">{fx(c.final)}</td>

//                   <td className="border px-2 py-1 text-center">
//                     <button type="button" className="text-red-600 active:scale-95" onClick={() => removeRow(i)}>
//                       ❌
//                     </button>
//                   </td>
//                 </tr>
//               );
//             })}
//           </tbody>

//           <tfoot>
//             <tr className="bg-gray-100 font-semibold">
//               <td className="border px-2 py-1" colSpan={5}>
//                 Totals
//               </td>
//               <td className="border px-2 py-1">{fx(totals.base)}</td>
//               <td className="border px-2 py-1">—</td>
//               <td className="border px-2 py-1">—</td>
//               <td className="border px-2 py-1">{fx(totals.disc)}</td>
//               <td className="border px-2 py-1">—</td>
//               <td className="border px-2 py-1">{fx(totals.gst)}</td>
//               <td className="border px-2 py-1">{fx(totals.final)}</td>
//               <td className="border px-2 py-1"></td>
//             </tr>
//           </tfoot>
//         </table>
//       </div>

//       <div className="flex gap-2 mt-3">
//         <button type="button" onClick={addRow} className="px-4 py-2 bg-blue-600 text-white rounded active:scale-95">
//           Add Item
//         </button>
//         <button
//           type="submit"
//           disabled={loading || productsLoading || !isFormValid}
//           className={`px-6 py-2 rounded text-white bg-green-700 transition-opacity active:scale-95 duration-200 ${
//             loading || productsLoading || !isFormValid ? "opacity-50 cursor-not-allowed" : "opacity-100 cursor-pointer"
//           }`}
//         >
//           {loading ? (isEditMode ? "Updating..." : "Saving...") : isEditMode ? "Update PO" : "Save PO"}
//         </button>
//       </div>
//     </form>
//   );
// };

// export default PurchaseOrderForm;





import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchVendors } from "../../features/vendor/vendorThunks";
import { fetchProducts } from "../../features/products/productsSlice";
import {
  fetchPurchaseOrders,
  createPurchaseOrder,
  updatePurchaseOrder,
} from "../../features/purchaseOrders/purchaseOrderSlice";

const fx = (n, d = 2) => (isNaN(n) ? "0.00" : Number(n).toFixed(d));

const PurchaseOrderForm = ({ purchaseOrder, onSubmitted }) => {
  const dispatch = useDispatch();
const { loading } = useSelector((s) => s.purchaseOrders || { loading: false });
const { vendors = [] } = useSelector((s) => s.vendors || { vendors: [] });
const { list: products = [] } = useSelector((s) => s.products || { list: [] });

  const isEditMode = Boolean(purchaseOrder);
  const [header, setHeader] = useState({});
  const [rows, setRows] = useState([]);

  useEffect(() => {
    dispatch(fetchPurchaseOrders());
    dispatch(fetchVendors());
    dispatch(fetchProducts());
  }, [dispatch]);

  useEffect(() => {
    const initialHeader = {
      po_no: "",
      date: "",
      bill_time: "",
      bill_time_am_pm: "PM",
      vendor_id: "",
      address: "",
      mobile_no: "",
      gst_no: "",
      place_of_supply: "",
      terms_condition: "",
    };
    const initialRows = [
      { product_id: "", item_name: "", hsn_code: "", qty: 1, rate: 0, d1_percent: 0, gst_percent: 0 },
    ];

    if (isEditMode && purchaseOrder) {
      const normalizedDate = purchaseOrder.date
        ? new Date(purchaseOrder.date).toISOString().split("T")[0]
        : "";
      setHeader({
        ...initialHeader,
        ...purchaseOrder,
        date: normalizedDate,
        bill_time_am_pm: "PM",
      });
      setRows(
        purchaseOrder.items && purchaseOrder.items.length > 0
          ? purchaseOrder.items.map((r) => ({
              ...r,
              qty: Number(r.qty || 0),
              rate: Number(r.rate || 0),
              d1_percent: Number(r.d1_percent ?? r.discount_rate ?? 0),
              gst_percent: Number(r.gst_percent || 0),
              product_id: String(r.product_id ?? ""),
              item_name: r.product_name || r.item_name || "",
            }))
          : initialRows
      );
    } else {
      setHeader(initialHeader);
      setRows(initialRows);
    }
  }, [purchaseOrder, isEditMode]);

  const onHeader = (e) => {
    let value = e.target.value;

    if (e.target.name === "vendor_id") {
      value = parseInt(value, 10) || 0;
      const selectedVendor = vendors.find((v) => String(v.id ?? v._id) === String(value));
      if (selectedVendor) {
        setHeader((p) => ({
          ...p,
          vendor_id: value,
          address: selectedVendor.address || "",
          mobile_no: selectedVendor.contact_number || selectedVendor.mobile_no || "",
          gst_no: selectedVendor.gst_no || "",
        }));
        return;
      }
    }
    setHeader((p) => ({ ...p, [e.target.name]: value }));
  };

  const onRow = (i, field, value) => {
    setRows((prev) => {
      const next = [...prev];
      const numericFields = ["qty", "rate", "d1_percent", "gst_percent", "product_id"];
      next[i] = {
        ...next[i],
        [field]: numericFields.includes(field) ? (value === "" ? 0 : Number(value)) : value,
      };
      if (field === "product_id") {
        const product = products.find((p) => String(p.id ?? p._id) === String(value));
        next[i].item_name = product ? product.product_name || "" : "";
        next[i].hsn_code = product ? product.hsn_code || "" : "";
        if (!next[i].rate && product?.purchase_rate) next[i].rate = Number(product.purchase_rate);
      }
      return next;
    });
  };

  const addRow = () =>
    setRows((p) => [
      ...p,
      { product_id: "", item_name: "", hsn_code: "", qty: 1, rate: 0, d1_percent: 0, gst_percent: 0 },
    ]);

  const removeRow = (i) => setRows((p) => p.filter((_, idx) => idx !== i));

  // Calc per line
  const calc = (r) => {
    const base = (Number(r.qty) || 0) * (Number(r.rate) || 0);
    const perUnitDisc = ((Number(r.rate) || 0) * (Number(r.d1_percent) || 0)) / 100;
    const totalDisc = (Number(r.qty) || 0) * perUnitDisc;
    const taxable = Math.max(base - totalDisc, 0);
    const gstAmt = (taxable * (Number(r.gst_percent) || 0)) / 100;
    const final = taxable + gstAmt;
    return { base, perUnitDisc, totalDisc, taxable, gstAmt, final };
  };

  const totals = useMemo(
    () =>
      rows.reduce(
        (a, r) => {
          const c = calc(r);
          a.base += c.base;
          a.disc += c.totalDisc;
          a.taxable += c.taxable;
          a.gst += c.gstAmt;
          a.final += c.final;
          return a;
        },
        { base: 0, disc: 0, taxable: 0, gst: 0, final: 0 }
      ),
    [rows]
  );

  const isFormValid = useMemo(() => {
    if (!header || !rows || rows.length === 0) return false;
    const headerValid = header.po_no && String(header.po_no).trim() !== "" && Number(header.vendor_id) > 0;
    const rowsValid = rows.every((r) => Number(r.product_id) > 0 && Number(r.qty) > 0 && Number(r.rate) > 0);
    return Boolean(headerValid && rowsValid);
  }, [header, rows]);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      let [h = "00", m = "00"] = String(header.bill_time || "00:00").split(":");
      let hour = Number(h);
      let minute = Number(m);
      if (isNaN(hour)) hour = 0;
      if (isNaN(minute)) minute = 0;
      if (header.bill_time_am_pm === "PM" && hour < 12) hour += 12;
      if (header.bill_time_am_pm === "AM" && hour === 12) hour = 0;
      const bill_time = header.date
        ? `${header.date} ${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`
        : null;

      const items = rows.map((r) => {
        const c = calc(r);
        if (!r.product_id || Number(r.product_id) <= 0) {
          throw new Error("Product ID is required for all items");
        }
        return {
          product_id: Number(r.product_id),
          hsn_code: r.hsn_code,
          qty: Number(r.qty),
          rate: Number(r.rate),
          amount: c.base,
          discount_per_qty: Number(r.d1_percent || 0), // percent per unit
          discount_rate: c.perUnitDisc, // calculated amount per unit
          discount_total: c.totalDisc,
          gst_percent: Number(r.gst_percent || 0),
          gst_amount: c.gstAmt,
          final_amount: c.final,
        };
      });

      const payload = {
        po_no: header.po_no,
        vendor_id: Number(header.vendor_id),
        date: header.date || null,
        bill_time,
        address: header.address || "",
        mobile_no: header.mobile_no || "",
        gst_no: header.gst_no || "",
        place_of_supply: header.place_of_supply || "",
        terms_condition: header.terms_condition || "",
        items,
      };

      const action = isEditMode
        ? updatePurchaseOrder({ id: purchaseOrder._id || purchaseOrder.id, data: payload })
        : createPurchaseOrder(payload);
      const result = await dispatch(action);

      if (!result.error) {
        if (onSubmitted) onSubmitted();
        dispatch(fetchPurchaseOrders());
        // reset if new
        if (!isEditMode) {
          setHeader((p) => ({ ...p, po_no: "", vendor_id: "", date: "", bill_time: "" }));
          setRows([{ product_id: "", item_name: "", hsn_code: "", qty: 1, rate: 0, d1_percent: 0, gst_percent: 0 }]);
        }
      }
    } catch (err) {
      console.error("Error submitting purchase order:", err);
      alert("Failed to submit purchase order. Check console for details.");
    }
  };

  return (
<form onSubmit={onSubmit} className="space-y-4">
  <h3 className="text-xl font-semibold">
    {isEditMode ? "Edit Purchase Order" : "Create Purchase Order"}
  </h3>

  <div className="grid grid-cols-2 gap-3">
    <div>
      <label className="text-xs text-gray-600">PO No</label>
      <input
        className="border rounded p-2 w-full"
        name="po_no"
        value={header.po_no || ""}
        onChange={onHeader}
        required
      />
    </div>

    <div>
      <label className="text-xs text-gray-600">Vendor</label>
      <select
        className="border rounded p-2 w-full"
        name="vendor_id"
        value={header.vendor_id || ""}
        onChange={onHeader}
        required
      >
        <option value="">Select vendor</option>
        {vendors.map((v) => (
          <option key={v.id || v._id} value={v.id || v._id}>
            {v.firm_name || v.vendor_name || v.name || `Vendor ${v.id}`}
          </option>
        ))}
      </select>
    </div>

    <div>
      <label className="text-xs text-gray-600">Date</label>
      <input
        type="date"
        className="border rounded p-2 w-full"
        name="date"
        value={header.date || ""}
        onChange={onHeader}
        required
      />
    </div>

    <div>
      <label className="text-xs text-gray-600">Bill Time</label>
      <div className="flex gap-2">
        <input
          type="time"
          className="border rounded p-2 w-full"
          name="bill_time"
          value={header.bill_time || ""}
          onChange={onHeader}
          step="60"
        />
        <select
          name="bill_time_am_pm"
          className="border rounded p-2"
          value={header.bill_time_am_pm || "PM"}
          onChange={onHeader}
        >
          <option>AM</option>
          <option>PM</option>
        </select>
      </div>
    </div>

    <div>
      <label className="text-xs text-gray-600">GST No</label>
      <input
        className="border rounded p-2 w-full"
        name="gst_no"
        value={header.gst_no || ""}
        onChange={onHeader}
      />
    </div>

    <div>
      <label className="text-xs text-gray-600">Mobile</label>
      <input
        className="border rounded p-2 w-full"
        name="mobile_no"
        value={header.mobile_no || ""}
        onChange={onHeader}
      />
    </div>

    <div className="col-span-2">
      <label className="text-xs text-gray-600">Address</label>
      <input
        className="border rounded p-2 w-full"
        name="address"
        value={header.address || ""}
        onChange={onHeader}
      />
    </div>

    <div>
      <label className="text-xs text-gray-600">Place of Supply</label>
      <input
        className="border rounded p-2 w-full"
        name="place_of_supply"
        value={header.place_of_supply || ""}
        onChange={onHeader}
      />
    </div>

    <div>
      <label className="text-xs text-gray-600">Terms</label>
      <input
        className="border rounded p-2 w-full"
        name="terms_condition"
        value={header.terms_condition || ""}
        onChange={onHeader}
      />
    </div>
  </div>

  <h4 className="mt-4 font-medium">Items</h4>

  <div className="overflow-x-auto">
    <table className="w-full text-sm border border-gray-200">
      <thead className="bg-gray-100">
        <tr>
          <th className="border px-2 py-1 text-left">#</th>
          <th className="border px-2 py-1 text-left">Product</th>
          <th className="border px-2 py-1 text-left">HSN</th>
          <th className="border px-2 py-1 text-left">Qty</th>
          <th className="border px-2 py-1 text-left">Rate</th>
          <th className="border px-2 py-1 text-left">Disc%/Unit</th>
          <th className="border px-2 py-1 text-left">GST%</th>
          <th className="border px-2 py-1 text-right">Taxable</th>
          <th className="border px-2 py-1 text-right">GST Amt</th>
          <th className="border px-2 py-1 text-right">Final</th>
          <th className="border px-2 py-1" />
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => {
          const c = calc(r);
          return (
            <tr key={i} className="odd:bg-white even:bg-gray-50">
              <td className="border px-2 py-1">{i + 1}</td>

              <td className="border px-2 py-1 min-w-[220px]">
                <select
                  className="border rounded p-1 w-full"
                  value={r.product_id || ""}
                  onChange={(e) => onRow(i, "product_id", e.target.value)}
                >
                  <option value="">Select</option>
                  {products.map((p) => (
                    <option key={p.id || p._id} value={p.id || p._id}>
                      {p.product_name}
                    </option>
                  ))}
                </select>
              </td>

              <td className="border px-2 py-1 min-w-[120px]">
                <input
                  className="border rounded p-1 w-full bg-gray-100"
                  value={r.hsn_code || ""}
                  onChange={(e) => onRow(i, "hsn_code", e.target.value)}
                  readOnly
                />
              </td>

              <td className="border px-2 py-1">
                <input
                  type="number"
                  className="border rounded p-1 w-20"
                  value={r.qty}
                  onChange={(e) => onRow(i, "qty", e.target.value)}
                  min="0"
                  step="1"
                />
              </td>

              <td className="border px-2 py-1">
                <input
                  type="number"
                  className="border rounded p-1 w-20"
                  value={r.rate}
                  onChange={(e) => onRow(i, "rate", e.target.value)}
                  min="0"
                  step="0.01"
                />
              </td>

              <td className="border px-2 py-1">
                <input
                  type="number"
                  className="border rounded p-1 w-24"
                  value={r.d1_percent}
                  onChange={(e) => onRow(i, "d1_percent", e.target.value)}
                  min="0"
                  step="0.01"
                />
              </td>

              <td className="border px-2 py-1">
                <input
                  type="number"
                  className="border rounded p-1 w-20"
                  value={r.gst_percent}
                  onChange={(e) => onRow(i, "gst_percent", e.target.value)}
                  min="0"
                  step="0.01"
                />
              </td>

              <td className="border px-2 py-1 text-right">{fx(c.taxable)}</td>
              <td className="border px-2 py-1 text-right">{fx(c.gstAmt)}</td>
              <td className="border px-2 py-1 text-right">{fx(c.final)}</td>

              <td className="border px-2 py-1 text-center">
                <button
                  type="button"
                  className="text-red-600 hover:underline"
                  onClick={() => removeRow(i)}
                >
                  Delete
                </button>
              </td>
            </tr>
          );
        })}

        <tr>
          <td className="border px-2 py-2" colSpan={11}>
            <button
              type="button"
              onClick={addRow}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 active:scale-95"
            >
              + Add Row
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <div className="flex justify-end gap-6">
    <div className="text-right">
      <div>Taxable: <span className="font-medium">{fx(totals.taxable)}</span></div>
      <div>GST: <span className="font-medium">{fx(totals.gst)}</span></div>
      <div className="font-semibold">Grand Total: {fx(totals.final)}</div>
    </div>
  </div>

  <div>
    <button
      type="submit"
      disabled={!isFormValid || loading}
      className={`px-6 py-2 rounded text-white ${(!isFormValid || loading)
        ? "bg-green-700/50 cursor-not-allowed"
        : "bg-green-700 hover:bg-green-800 active:scale-95"}`}
    >
      {isEditMode ? "Update PO" : "Create PO"}
    </button>
  </div>
</form>  

  );
};

export default PurchaseOrderForm;
