// src/pages/sales/SalesForm.jsx
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import salesAPI from "../../axios/salesAPI";
import customersAPI from "../../axios/customerAPI";
import productsAPI from "../../axios/productAPI"; // assume simple getAll

const fx = (n) => (isNaN(n) ? "0.000" : Number(n).toFixed(3));

export default function SalesForm({ sale, onSubmitted }) {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const isEditMode = Boolean(sale);

  const [header, setHeader] = useState({
    sale_no: "",
    date: "",
    customer_id: "",
    address: "",
    mobile_no: "",
    gst_no: "",
    terms_condition: "",
    payment_status: "Unpaid",
    payment_method: "Cash",
    status: "Active",
  });

  const [rows, setRows] = useState([
    { product_id: "", item_name: "", hsn_code: "", qty: 1, rate: 0, d1_percent: 0, gst_percent: 0, unit: "PCS" },
  ]);

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const [custRes, prodRes] = await Promise.all([
          customersAPI.getAll(),
          productsAPI.getAll(),
        ]);
        const allCustomers = custRes?.data || [];
        setCustomers(allCustomers);
        const allProducts = prodRes?.data || [];
        setProducts(allProducts);

        if (isEditMode && sale) {
          const normalizedDate = sale.bill_date ? new Date(sale.bill_date).toISOString().split("T")[0] : "";
          const selectedCustomer = allCustomers.find((c) => Number(c.id) === Number(sale.customer_id));
          setHeader({
            sale_no: sale.bill_no || "",
            date: normalizedDate,
            customer_id: sale.customer_id || "",
            address: selectedCustomer?.address || "",
            mobile_no: selectedCustomer?.phone || "",
            gst_no: selectedCustomer?.gst_no || "",
            terms_condition: sale.remarks || "",
            payment_status: sale.payment_status || "Unpaid",
            payment_method: sale.payment_method || "Cash",
            status: sale.status || "Active",
          });

          const mapped = (sale.items || []).map((r) => {
            const product = allProducts.find((p) => Number(p.id) === Number(r.product_id));
            return {
              product_id: r.product_id,
              item_name: product?.product_name || r.item_name || "",
              hsn_code: product?.hsn_code || r.hsn_code || "",
              qty: Number(r.qty) || 1,
              rate: Number(r.rate ?? product?.sales_rate ?? 0),
              d1_percent: Number(r.discount_rate) || 0,
              gst_percent: Number(r.gst_percent) || 0,
              unit: r.unit || "PCS",
            };
          });
          setRows(mapped.length ? mapped : [{ product_id: "", item_name: "", hsn_code: "", qty: 1, rate: 0, d1_percent: 0, gst_percent: 0, unit: "PCS" }]);
        } else {
          const { data } = await salesAPI.getNewBillNo();
          setHeader((prev) => ({
            ...prev,
            sale_no: data?.bill_no || "",
            date: new Date().toISOString().split("T")[0],
            payment_status: "Unpaid",
            payment_method: "Cash",
            status: "Active",
          }));
        }
      } catch (e) {
        toast.error("Failed to load form data");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [isEditMode, sale]);

  const onHeader = (e) => {
    let { name, value } = e.target;
    if (name === "customer_id") {
      const cid = parseInt(value || 0, 10);
      const selected = customers.find((c) => Number(c.id) === cid);
      setHeader((p) => ({
        ...p,
        customer_id: cid || "",
        address: selected?.address || "",
        mobile_no: selected?.phone || "",
        gst_no: selected?.gst_no || "",
      }));
      return;
    }
    setHeader((p) => ({ ...p, [name]: value }));
  };

  const onRow = (i, field, value) => {
    setRows((prev) => {
      const next = [...prev];
      const numeric = ["qty", "rate", "d1_percent", "gst_percent"];
      let v = value;
      if (numeric.includes(field)) v = value === "" ? 0 : Number(value);
      next[i] = { ...next[i], [field]: v };
      if (field === "product_id") {
        const product = products.find((p) => String(p.id) === String(value));
        next[i].item_name = product?.product_name || "";
        next[i].hsn_code = product?.hsn_code || "";
        next[i].rate = Number(product?.sales_rate || 0);
        next[i].unit = "PCS";
      }
      return next;
    });
  };

  const addRow = () =>
    setRows((p) => [...p, { product_id: "", item_name: "", hsn_code: "", qty: 1, rate: 0, d1_percent: 0, gst_percent: 0, unit: "PCS" }]);

  const removeRow = (idx) => setRows((p) => p.filter((_, i) => i !== idx));

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
    const headerValid = header.sale_no && header.customer_id && header.date;
    const rowsValid = rows.every((r) => r.product_id && Number(r.qty) > 0 && Number(r.rate) > 0);
    return Boolean(headerValid && rowsValid);
  }, [header, rows]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) {
      toast.error("Please fill required fields");
      return;
    }
    try {
      setLoading(true);
      const payload = {
        customer_id: header.customer_id,
        bill_no: header.sale_no,
        bill_date: header.date,
        status: header.status || "Active",
        payment_status: header.payment_status || "Unpaid",
        payment_method: header.payment_method || "Cash",
        remarks: header.terms_condition || "",
        items: rows.map((r) => ({
          product_id: r.product_id,
          qty: r.qty,
          discount_rate: r.d1_percent || 0,
          gst_percent: r.gst_percent || 0,
          unit: r.unit || "PCS",
          // rate optional; backend product rate auto considered, but sending is fine
          rate: r.rate,
        })),
      };

      if (isEditMode) {
        await salesAPI.update(sale.id, payload);
        toast.success("Sale updated successfully");
      } else {
        await salesAPI.create(payload);
        toast.success("Sale created successfully");
      }

      setHeader({
        sale_no: "",
        date: "",
        customer_id: "",
        address: "",
        mobile_no: "",
        gst_no: "",
        terms_condition: "",
        payment_status: "Unpaid",
        payment_method: "Cash",
        status: "Active",
      });
      setRows([{ product_id: "", item_name: "", hsn_code: "", qty: 1, rate: 0, d1_percent: 0, gst_percent: 0, unit: "PCS" }]);
      if (onSubmitted) onSubmitted();
    } catch (e) {
      toast.error(e?.response?.data?.error || "Failed to save sale");
    } finally {
      setLoading(false);
    }
  };

  // Return same design wrappers and classes user provided
  return (
    <form onSubmit={onSubmit} className="bg-white shadow-lg rounded-xl p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">{isEditMode ? "Update Sale" : "Create Sale"}</h2>

      <div className="grid grid-cols-2 gap-4">
        <input className="border p-2 rounded-lg" placeholder="Sale No." value={header.sale_no} onChange={(e) => setHeader((p) => ({ ...p, sale_no: e.target.value }))} />
        <input type="date" className="border p-2 rounded-lg" value={header.date} onChange={(e) => setHeader((p) => ({ ...p, date: e.target.value }))} />
        <select name="customer_id" className="border p-2 rounded-lg" value={header.customer_id} onChange={onHeader}>
          <option value="">Select Customer</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <input className="border p-2 rounded-lg" placeholder="Address" value={header.address} onChange={(e) => setHeader((p) => ({ ...p, address: e.target.value }))} />
        <input className="border p-2 rounded-lg" placeholder="Mobile" value={header.mobile_no} onChange={(e) => setHeader((p) => ({ ...p, mobile_no: e.target.value }))} />
        <input className="border p-2 rounded-lg" placeholder="GST No." value={header.gst_no} onChange={(e) => setHeader((p) => ({ ...p, gst_no: e.target.value }))} />
        <select className="border p-2 rounded-lg" value={header.payment_status} onChange={(e) => setHeader((p) => ({ ...p, payment_status: e.target.value }))}>
          <option>Unpaid</option>
          <option>Partial</option>
          <option>Paid</option>
        </select>
        <select className="border p-2 rounded-lg" value={header.payment_method} onChange={(e) => setHeader((p) => ({ ...p, payment_method: e.target.value }))}>
          <option>Cash</option>
          <option>Card</option>
          <option>Online</option>
          <option>Credit Card</option>
          <option>UPI</option>
        </select>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Product</th>
              <th className="p-2 border">HSN</th>
              <th className="p-2 border">Qty</th>
              <th className="p-2 border">Rate</th>
              <th className="p-2 border">Disc %</th>
              <th className="p-2 border">GST %</th>
              <th className="p-2 border">Taxable</th>
              <th className="p-2 border">GST Amt</th>
              <th className="p-2 border">Total</th>
              <th className="p-2 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const c = calc(r);
              return (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="p-2 border">
                    <select
                      className="border p-2 rounded-lg w-full"
                      value={r.product_id}
                      onChange={(e) => onRow(i, "product_id", e.target.value)}
                    >
                      <option value="">Select</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.product_name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-2 border">
                    <input className="border p-2 rounded-lg w-full" value={r.hsn_code} onChange={(e) => onRow(i, "hsn_code", e.target.value)} />
                  </td>
                  <td className="p-2 border">
                    <input type="number" className="border p-2 rounded-lg w-24" value={r.qty} onChange={(e) => onRow(i, "qty", e.target.value)} />
                  </td>
                  <td className="p-2 border">
                    <input type="number" className="border p-2 rounded-lg w-28" value={r.rate} onChange={(e) => onRow(i, "rate", e.target.value)} />
                  </td>
                  <td className="p-2 border">
                    <input type="number" className="border p-2 rounded-lg w-24" value={r.d1_percent} onChange={(e) => onRow(i, "d1_percent", e.target.value)} />
                  </td>
                  <td className="p-2 border">
                    <input type="number" className="border p-2 rounded-lg w-24" value={r.gst_percent} onChange={(e) => onRow(i, "gst_percent", e.target.value)} />
                  </td>
                  <td className="p-2 border">{fx(c.taxable)}</td>
                  <td className="p-2 border">{fx(c.gstAmt)}</td>
                  <td className="p-2 border">{fx(c.final)}</td>
                  <td className="p-2 border">
                    <button className="px-3 py-1 bg-red-600 text-white rounded" onClick={() => removeRow(i)}>
                      Remove
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50">
              <td className="p-2 border" colSpan={10}>
                <button className="px-3 py-1 bg-gray-200 rounded" onClick={addRow} type="button">
                  Add Row
                </button>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-4">
        <div className="p-3 bg-gray-50 rounded">Base: {fx(totals.base)}</div>
        <div className="p-3 bg-gray-50 rounded">Discount: {fx(totals.disc)}</div>
        <div className="p-3 bg-gray-50 rounded">Taxable: {fx(totals.taxable)}</div>
        <div className="p-3 bg-gray-50 rounded">GST: {fx(totals.gst)}</div>
        <div className="p-3 bg-gray-50 rounded col-span-4">Total: {fx(totals.final)}</div>
      </div>

      <div className="mt-6 flex gap-2">
        <button type="submit" disabled={loading || !isFormValid} className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-60">
          {isEditMode ? "Update" : "Save"}
        </button>
        <button type="button" className="px-4 py-2 bg-gray-200 rounded-lg" onClick={() => {
          setHeader((p) => ({ ...p, terms_condition: "" }));
          setRows([{ product_id: "", item_name: "", hsn_code: "", qty: 1, rate: 0, d1_percent: 0, gst_percent: 0, unit: "PCS" }]);
        }}>
          Reset
        </button>
      </div>
    </form>
  );
}
