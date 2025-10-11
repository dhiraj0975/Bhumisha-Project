import React, { useEffect, useMemo, useState } from "react";
import { refApi, soApi } from "../../axios/soApi.js";

const fx = (n, d = 2) => (isNaN(n) ? (0).toFixed(d) : Number(n).toFixed(d));

const calcLine = (r) => {
  const qty = Number(r.qty) || 0;
  const rate = Number(r.rate) || 0;
  const d1 = Number(r.d1_percent) || 0;
  const gst = Number(r.gst_percent) || 0;
  const amount = qty * rate;
  const discPerUnit = (rate * d1) / 100;
  const discTotal = discPerUnit * qty;
  const taxable = Math.max(amount - discTotal, 0);
  const gstAmt = (taxable * gst) / 100;
  const finalAmt = taxable + gstAmt;
  return { amount, discPerUnit, discTotal, taxable, gstAmt, finalAmt };
};

export default function CreateSalesOrder({ so = null, onSaved }) {
  const isEditMode = Boolean(so);
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  const [form, setForm] = useState({
    so_no: "",
    customer_id: "",
    date: "",
    bill_time: "",
    bill_time_am_pm: "PM",
    address: "",
    mobile_no: "",
    gst_no: "",
    place_of_supply: "",
    terms_condition: "",
    items: [{ product_id: "", hsn_code: "", qty: 1, rate: 0, d1_percent: 0, gst_percent: 0 }],
  });

  // Load reference data
  useEffect(() => {
    (async () => {
      try {
        const [cRes, pRes] = await Promise.all([refApi.customers(), refApi.products()]);
        setCustomers(cRes.data || []);
        setProducts(pRes.data?.list || pRes.data || []);
      } catch (e) {
        console.error(e);
        alert(e?.response?.data?.error || e.message || "Failed to load reference data");
      }
    })();
  }, []);

  // Hydrate edit mode
  useEffect(() => {
    if (!isEditMode || !so) return;
    const normalizedDate = so.date ? new Date(so.date).toISOString().split("T")[0] : "";
    setForm((p) => ({
      ...p,
      so_no: so.so_no || "",
      customer_id: String(so.customer_id || ""),
      date: normalizedDate,
      bill_time: "",
      bill_time_am_pm: "PM",
      address: so.address || "",
      mobile_no: so.mobile_no || "",
      gst_no: so.gst_no || "",
      place_of_supply: so.place_of_supply || "",
      terms_condition: so.terms_condition || "",
      items:
        so.items?.map((it) => ({
          product_id: String(it.product_id || ""),
          hsn_code: it.hsn_code || "",
          qty: Number(it.qty || 0),
          rate: Number(it.rate || 0),
          d1_percent: Number(it.discount_per_qty ?? 0),
          gst_percent: Number(it.gst_percent || 0),
        })) || [{ product_id: "", hsn_code: "", qty: 1, rate: 0, d1_percent: 0, gst_percent: 0 }],
    }));
  }, [isEditMode, so]);

  // Header change
  const onHeader = (e) => {
    const { name, value } = e.target;
    if (name === "customer_id") {
      const c = customers.find((x) => String(x.id) === String(value));
      if (c) {
        setForm((p) => ({
          ...p,
          customer_id: String(value),
          address: c.address || "",
          mobile_no: c.phone || "",
          gst_no: c.add_gst ? c.gst_no || "" : "",
        }));
        return;
      }
    }
    setForm((p) => ({ ...p, [name]: value }));
  };

  // Item change
  const onItem = (i, e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev };
      const row = { ...next.items[i] };
      const numeric = ["qty", "rate", "d1_percent", "gst_percent", "product_id"];
      row[name] = numeric.includes(name) ? (value === "" ? "" : Number(value)) : value;

      if (name === "product_id") {
        const p = products.find((x) => String(x.id ?? x._id) === String(value));
        row.hsn_code = p?.hsn_code || "";
        if ((!row.rate || row.rate === 0) && p?.value) row.rate = Number(p.value);
      }

      next.items = next.items.map((r, idx) => (idx === i ? row : r));
      return next;
    });
  };

  const addItem = () =>
    setForm((p) => ({
      ...p,
      items: [...p.items, { product_id: "", hsn_code: "", qty: 1, rate: 0, d1_percent: 0, gst_percent: 0 }],
    }));

  const removeItem = (i) =>
    setForm((p) => ({
      ...p,
      items: p.items.filter((_, idx) => idx !== i),
    }));

  // Totals
  const totals = useMemo(() => {
    return form.items.reduce(
      (a, r) => {
        const c = calcLine({
          qty: Number(r.qty || 0),
          rate: Number(r.rate || 0),
          d1_percent: Number(r.d1_percent || 0),
          gst_percent: Number(r.gst_percent || 0),
        });
        a.taxable += c.taxable;
        a.gst += c.gstAmt;
        a.final += c.finalAmt;
        return a;
      },
      { taxable: 0, gst: 0, final: 0 }
    );
  }, [form.items]);

  // Validation
  const isValid = useMemo(() => {
    const headOk = form.so_no && Number(form.customer_id) > 0;
    const itemsOk =
      form.items.length > 0 &&
      form.items.every((r) => Number(r.product_id) > 0 && Number(r.qty) > 0 && Number(r.rate) > 0);
    return Boolean(headOk && itemsOk);
  }, [form]);

  // Submit
  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      // Merge 12h time
      let [h = "00", m = "00"] = String(form.bill_time || "00:00").split(":");
      let hour = Number(h);
      let minute = Number(m);
      if (isNaN(hour)) hour = 0;
      if (isNaN(minute)) minute = 0;
      if (form.bill_time_am_pm === "PM" && hour < 12) hour += 12;
      if (form.bill_time_am_pm === "AM" && hour === 12) hour = 0;
      const bill_time = form.date
        ? `${form.date} ${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`
        : null;

      const items = form.items.map((r) => ({
        product_id: Number(r.product_id),
        hsn_code: r.hsn_code || "",
        qty: Number(r.qty || 0),
        rate: Number(r.rate || 0),
        discount_per_qty: Number(r.d1_percent || 0),
        gst_percent: Number(r.gst_percent || 0),
      }));

      const payload = {
        so_no: form.so_no,
        customer_id: Number(form.customer_id),
        date: form.date || null,
        bill_time,
        address: form.address || "",
        mobile_no: form.mobile_no || "",
        gst_no: form.gst_no || "",
        place_of_supply: form.place_of_supply || "",
        terms_condition: form.terms_condition || "",
        items,
      };

      if (isEditMode) {
        await soApi.update(so.id || so._id, payload);
      } else {
        await soApi.create(payload);
      }

      setLoading(false);
      onSaved && onSaved();

      if (!isEditMode) {
        setForm({
          so_no: "",
          customer_id: "",
          date: "",
          bill_time: "",
          bill_time_am_pm: "PM",
          address: "",
          mobile_no: "",
          gst_no: "",
          place_of_supply: "",
          terms_condition: "",
          items: [{ product_id: "", hsn_code: "", qty: 1, rate: 0, d1_percent: 0, gst_percent: 0 }],
        });
      }
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.error ||
        (err?.message?.includes("ER_DUP_ENTRY")
          ? "SO number already exists. Please use a unique SO No."
          : err.message) ||
        "Failed to save SO";
      alert(msg);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="bg-white shadow-lg rounded-xl p-6 mb-6">
      <h3 className="text-xl font-semibold mb-3">{isEditMode ? "Edit Sales Order" : "Create Sales Order"}</h3>

      {/* Summary + Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start mb-4">
        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white border rounded-xl shadow-sm p-4">
            <h4 className="text-sm font-semibold text-gray-800 mb-3">Order Summary</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Taxable</span>
                <span className="font-semibold">{fx(totals.taxable)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">GST</span>
                <span className="font-semibold">{fx(totals.gst)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Grand Total</span>
                <span className="text-base font-semibold">{fx(totals.final)}</span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Customer</span>
                  <span className="text-xs text-gray-800">
                    {(() => {
                      const c = customers.find((x) => Number(x.id) === Number(form.customer_id));
                      return c?.name || "-";
                    })()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Place of Supply</span>
                  <span className="text-xs text-gray-800">{form.place_of_supply || "-"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="lg:col-span-2">
          <div className="bg-white border rounded-xl shadow-sm p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex flex-col">
                <label className="text-xs text-gray-600">SO No</label>
                <input className="border rounded p-2" name="so_no" value={form.so_no} onChange={onHeader} required />
              </div>

              <div className="flex flex-col">
                <label className="text-xs text-gray-600">Customer</label>
                <select className="border rounded p-2" name="customer_id" value={form.customer_id} onChange={onHeader} required>
                  <option value="">Select customer</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-xs text-gray-600">Date</label>
                <input type="date" className="border rounded p-2" name="date" value={form.date} onChange={onHeader} />
              </div>

              <div className="flex flex-col">
                <label className="text-xs text-gray-600">Bill Time</label>
                <div className="flex gap-2">
                  <input type="time" className="border rounded p-2 w-full" name="bill_time" value={form.bill_time} onChange={onHeader} />
                  <select name="bill_time_am_pm" className="border rounded p-2" value={form.bill_time_am_pm} onChange={onHeader}>
                    <option>AM</option>
                    <option>PM</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col lg:col-span-2">
                <label className="text-xs text-gray-600">Address</label>
                <input className="border rounded p-2" name="address" value={form.address} onChange={onHeader} />
              </div>

              <div className="flex flex-col">
                <label className="text-xs text-gray-600">Mobile</label>
                <input className="border rounded p-2" name="mobile_no" value={form.mobile_no} onChange={onHeader} />
              </div>

              <div className="flex flex-col">
                <label className="text-xs text-gray-600">GST No</label>
                <input className="border rounded p-2" name="gst_no" value={form.gst_no} onChange={onHeader} />
              </div>

              <div className="flex flex-col">
                <label className="text-xs text-gray-600">Place of Supply</label>
                <input className="border rounded p-2" name="place_of_supply" value={form.place_of_supply} onChange={onHeader} />
              </div>

              <div className="flex flex-col lg:col-span-3">
                <label className="text-xs text-gray-600">Terms</label>
                <input className="border rounded p-2" name="terms_condition" value={form.terms_condition} onChange={onHeader} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="mt-2">
        <div className="text-sm font-semibold mb-2">Items</div>

        {form.items.map((it, i) => {
          const c = calcLine({
            qty: Number(it.qty || 0),
            rate: Number(it.rate || 0),
            d1_percent: Number(it.d1_percent || 0),
            gst_percent: Number(it.gst_percent || 0),
          });
          return (
            <div key={i} className="mb-3 border rounded p-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                <select className="border rounded p-2" name="product_id" value={it.product_id} onChange={(e) => onItem(i, e)}>
                  <option value="">Select product</option>
                  {products.map((p) => (
                    <option key={p.id || p._id} value={p.id || p._id}>
                      {p.product_name}
                    </option>
                  ))}
                </select>

                <input className="border rounded p-2" name="hsn_code" placeholder="HSN" value={it.hsn_code || ""} onChange={(e) => onItem(i, e)} />

                <input
                  className="border rounded p-2"
                  name="qty"
                  type="number"
                  min={0}
                  step="0.01"
                  inputMode="decimal"
                  value={it.qty}
                  onChange={(e) => onItem(i, e)}
                  placeholder="Qty"
                />

                <input
                  className="border rounded p-2"
                  name="rate"
                  type="number"
                  min={0}
                  step="0.01"
                  inputMode="decimal"
                  value={it.rate}
                  onChange={(e) => onItem(i, e)}
                  placeholder="Rate"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mt-2 items-center">
                <input
                  className="border rounded p-2"
                  name="d1_percent"
                  type="number"
                  min={0}
                  step="0.01"
                  inputMode="decimal"
                  value={it.d1_percent}
                  onChange={(e) => onItem(i, e)}
                  placeholder="Disc%/Unit"
                />

                <input
                  className="border rounded p-2"
                  name="gst_percent"
                  type="number"
                  min={0}
                  step="0.01"
                  inputMode="decimal"
                  value={it.gst_percent}
                  onChange={(e) => onItem(i, e)}
                  placeholder="GST%"
                />

                <div className="text-right">
                  <span className="text-xs text-gray-600 mr-2">Final:</span>
                  <span className="font-semibold">{fx(c.finalAmt)}</span>
                </div>

                <div className="text-right">
                  <button
                    type="button"
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 active:scale-95"
                    onClick={() => removeItem(i)}
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2 text-xs text-gray-600">
                <div>Amount: <span className="font-medium text-gray-800">{fx(c.amount)}</span></div>
                <div>Disc Total: <span className="font-medium text-gray-800">{fx(c.discTotal)}</span></div>
                <div>Taxable: <span className="font-medium text-gray-800">{fx(c.taxable)}</span></div>
              </div>
            </div>
          );
        })}

        <button
          type="button"
          onClick={addItem}
          className="mt-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 active:scale-95"
        >
          + Add Item
        </button>
      </div>

      <div className="flex justify-end mt-4">
        <div className="text-right">
          <div>Taxable: <span className="font-medium">{fx(totals.taxable)}</span></div>
          <div>GST: <span className="font-medium">{fx(totals.gst)}</span></div>
          <div className="font-semibold text-lg">Grand Total: {fx(totals.final)}</div>
        </div>
      </div>

      <div className="pt-3 flex gap-3 justify-end">
        <button
          type="button"
          className="px-4 py-2 bg-gray-200 rounded"
          onClick={() => {
            setForm({
              so_no: "",
              customer_id: "",
              date: "",
              bill_time: "",
              bill_time_am_pm: "PM",
              address: "",
              mobile_no: "",
              gst_no: "",
              place_of_supply: "",
              terms_condition: "",
              items: [{ product_id: "", hsn_code: "", qty: 1, rate: 0, d1_percent: 0, gst_percent: 0 }],
            });
          }}
        >
          Reset
        </button>
        <button
          type="submit"
          disabled={!isValid || loading}
          className={`px-6 py-2 rounded text-white ${
            !isValid || loading ? "bg-green-700/50 cursor-not-allowed" : "bg-green-700 hover:bg-green-800 active:scale-95"
          }`}
        >
          {isEditMode ? "Update SO" : "Create SO"}
        </button>
      </div>
    </form>
  );
}
