// src/pages/sales/SalesForm.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import Swal from "sweetalert2";
import salesAPI from "../../axios/salesAPI";
import customersAPI from "../../axios/customerAPI";
import productsAPI from "../../axios/productAPI";

const fx = (n) => (isNaN(n) ? "0.000" : Number(n).toFixed(3));

const getMarginPercentByQty = (qty) => {
  const q = Number(qty) || 0;
  if (q >= 1 && q <= 4) return 50;
  if (q >= 5 && q <= 9) return 30;
  if (q >= 10) return 25;
  return 0;
};

const getRowMarginPercent = (r) => getMarginPercentByQty(r.qty || 0);

const parseGst = (v) => {
  if (v == null) return 0;
  const s = String(v).replace("%", "");
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
};

export default function SalesForm({ sale, onSubmitted }) {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const isEditMode = Boolean(sale);

  // Always-on auto margin (locked)
  const [useCostMargin] = useState(true);

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
    old_remaining: 0,   // NEW
    cash_received: 0,   // NEW
  });

  const [rows, setRows] = useState([
    {
      product_id: "",
      item_name: "",
      hsn_code: "",
      available: 0,
      qty: 1,
      cost_rate: 0,
      rate: 0,
      d1_percent: 0,
      per_size_disc: 0,
      gst_percent: 0,
      unit: "PCS",
      manualRate: false,
    },
  ]);

  // Error state for styling
  const [errors, setErrors] = useState({
    header: {},
    rows: {},
  });

  // Header refs for focus
  const headerRefs = {
    date: useRef(null),
    customer_id: useRef(null),
    sale_no: useRef(null),
    address: useRef(null),
    mobile_no: useRef(null),
    gst_no: useRef(null),
    payment_status: useRef(null),
    payment_method: useRef(null),
    cash_received: useRef(null),
  };

  // Row refs
  const makeRowRefs = () => ({
    product_id: React.createRef(),
    qty: React.createRef(),
    rate: React.createRef(),
    gst_percent: React.createRef(),
  });
  const [rowRefs, setRowRefs] = useState([makeRowRefs()]);
  const syncRowRefs = React.useCallback((len) => {
    setRowRefs((prev) => {
      const next = [...prev];
      while (next.length < len) next.push(makeRowRefs());
      if (next.length > len) next.length = len;
      return next;
    });
  }, []);

  useEffect(() => {
    syncRowRefs(rows.length);
  }, [rows.length, syncRowRefs]);

  // Product picker modal state
  const [productPickerRow, setProductPickerRow] = useState(null); // row index or null
  const [productPickerQuery, setProductPickerQuery] = useState("");
  

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const [custRes, prodRes] = await Promise.all([customersAPI.getAll(), productsAPI.getAll()]);
        const allCustomers = custRes?.data || [];
        setCustomers(allCustomers);

        const normalized = (prodRes?.data || []).map((p) => ({
          id: p.id,
          product_name: p.product_name,
          hsn_code: p.hsn_code || "",
          available: Number(p.size || 0),
          cost_rate: Number(p.total || 0), // treat as cost
          gst_percent: parseGst(p.gst),
          raw: p,
        }));
        setProducts(normalized);

        if (isEditMode && sale) {
          const normalizedDate = sale.bill_date ? new Date(sale.bill_date).toISOString().split("T")[0] : "";
          const selectedCustomer = allCustomers.find((c) => Number(c.id) === Number(sale.customer_id));
          setHeader((prev) => ({
            ...prev,
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
            // old_remaining will be fetched when user re-selects customer if needed
            old_remaining: 0,
            cash_received: 0,
          }));

          const mapped = (sale.items || []).map((r) => {
            const product = normalized.find((p) => Number(p.id) === Number(r.product_id));
            return {
              product_id: r.product_id,
              item_name: product?.product_name || r.item_name || "",
              hsn_code: product?.hsn_code || r.hsn_code || "",
              available: product?.available ?? 0,
              qty: Number(r.qty) || 1,
              cost_rate: Number(product?.cost_rate ?? 0),
              rate: Number(r.rate ?? 0),
              manualRate: true,
              d1_percent: Number(r.discount_rate) || 0,
              per_size_disc: Number(r.per_size_disc || 0),
              gst_percent: Number(r.gst_percent ?? product?.gst_percent ?? 0),
              unit: r.unit || "PCS",
            };
          });
          setRows(
            mapped.length
              ? mapped
              : [
                  {
                    product_id: "",
                    item_name: "",
                    hsn_code: "",
                    available: 0,
                    qty: 1,
                    cost_rate: 0,
                    rate: 0,
                    d1_percent: 0,
                    per_size_disc: 0,
                    gst_percent: 0,
                    unit: "PCS",
                    manualRate: false,
                  },
                ]
          );
        } else {
          const { data } = await salesAPI.getNewBillNo();
          setHeader((prev) => ({
            ...prev,
            sale_no: data?.bill_no || "",
            date: new Date().toISOString().split("T")[0],
            payment_status: "Unpaid",
            payment_method: "Cash",
            status: "Active",
            old_remaining: 0,
            cash_received: 0,
          }));
        }
      } catch (err) {
        console.error("Failed to init SalesForm", err);
        Swal.fire({ icon: "error", title: "Failed to load", text: "Failed to load form data" });
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [isEditMode, sale]);

  const onHeader = async (e) => {
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
      setErrors((er) => ({ ...er, header: { ...er.header, customer_id: false } }));

      if (cid) {
        try {
          const res = await customersAPI.getBalance(cid);
          const prevDue = Number(res?.data?.previous_due || 0);
          setHeader((p) => ({ ...p, old_remaining: prevDue, cash_received: 0 }));
        } catch {
          setHeader((p) => ({ ...p, old_remaining: 0, cash_received: 0 }));
        }
      } else {
        setHeader((p) => ({ ...p, old_remaining: 0, cash_received: 0 }));
      }
      return;
    }

    if (name === "cash_received") {
      value = value === "" ? "" : Number(value);
    }

    setHeader((p) => ({ ...p, [name]: value }));
    setErrors((er) => ({ ...er, header: { ...er.header, [name]: false } }));
  };

  const recomputeSellingRate = (row) => {
    const q = Number(row.qty) || 0;
    const cost = Number(row.cost_rate) || 0;
    const mPct = getMarginPercentByQty(q);
    if (useCostMargin && !row.manualRate) {
      const selling = cost * (1 + mPct / 100);
      return Number.isFinite(selling) ? selling : 0;
    }
    return row.rate || 0;
  };

  const onRow = (i, field, value) => {
    setRows((prev) => {
      const next = [...prev];
      const numeric = ["qty", "rate", "d1_percent", "gst_percent", "per_size_disc", "cost_rate"];
      let v = value;
      if (numeric.includes(field)) v = value === "" ? 0 : Number(value);
      next[i] = { ...next[i], [field]: v };

      // clear row field error on change
      setErrors((er) => ({
        ...er,
        rows: {
          ...er.rows,
          [i]: { ...(er.rows[i] || {}), [field]: false },
        },
      }));

      if (field === "product_id") {
        const product = products.find((p) => String(p.id) === String(value));
        next[i].item_name = product?.product_name || "";
        next[i].hsn_code = product?.hsn_code || "";
        next[i].cost_rate = Number(product?.cost_rate || 0);
        next[i].gst_percent = Number(product?.gst_percent || 0);
        next[i].unit = "PCS";
        next[i].available = Number(product?.available || 0);
        next[i].qty = 1;
        next[i].per_size_disc = 0;
        next[i].d1_percent = 0;
        next[i].manualRate = false;
        next[i].rate = recomputeSellingRate(next[i]);
      }

      if (field === "qty") {
        const avail = Number(next[i].available || 0);
        let q = Number(value || 0);

        if (q > avail) {
          q = avail;
          Swal.fire({ icon: "info", title: "Stock limit", text: "Qty limited to available stock" });
        } else if (q < 1) {
          q = 1;
        }

        next[i].qty = q;

        if (useCostMargin && !next[i].manualRate) {
          const tmp = { ...next[i], qty: q };
          next[i].rate = recomputeSellingRate(tmp);
        }
      }

      if (field === "rate") {
        next[i].manualRate = true;
      }

      if (field === "cost_rate" && useCostMargin && !next[i].manualRate) {
        next[i].rate = recomputeSellingRate(next[i]);
      }

      return next;
    });
  };

  // Row math
  const calc = (r) => {
    const qty = Number(r.qty) || 0;
    const rate = Number(r.rate) || 0;
    const base = qty * rate;
    const pctDiscPerUnit = (rate * (Number(r.d1_percent) || 0)) / 100;
    const pctDiscTotal = qty * pctDiscPerUnit;
    const perQtyDisc = Number(r.per_size_disc || 0);
    const totalDisc = perQtyDisc + pctDiscTotal;
    const taxable = Math.max(base - totalDisc, 0);
    const gstAmt = (taxable * (Number(r.gst_percent) || 0)) / 100;
    const final = taxable + gstAmt;
    return { base, pctDiscPerUnit, pctDiscTotal, perQtyDisc, totalDisc, taxable, gstAmt, final };
  };

  const totals = useMemo(
    () =>
      rows.reduce(
        (a, r) => {
          const c = calc(r);
          a.base += c.base;
          a.perQtyDisc += c.perQtyDisc;
          a.pctDisc += c.pctDiscTotal;
          a.disc += c.totalDisc;
          a.taxable += c.taxable;
          a.gst += c.gstAmt;
          a.final += c.final;
          return a;
        },
        { base: 0, perQtyDisc: 0, pctDisc: 0, disc: 0, taxable: 0, gst: 0, final: 0 }
      ),
    [rows]
  );

  // Derived payment summary
  const saleTotal = useMemo(() => Number(totals.final || 0), [totals.final]);
  const grossDue = Number(header.old_remaining || 0) + saleTotal;
  const netDue = Math.max(grossDue - Number(header.cash_received || 0), 0);

  // Validation helpers
  const validateHeader = () => {
    const req = ["date", "customer_id", "sale_no"];
    const newErr = {};
    let firstKey = null;
    req.forEach((k) => {
      const miss = !header[k];
      newErr[k] = miss;
      if (miss && !firstKey) firstKey = k;
    });
    setErrors((er) => ({ ...er, header: { ...er.header, ...newErr } }));
    return firstKey; // null if none missing
  };

  const validateRows = () => {
    let first = { rowIdx: null, field: null };
    const newRowsErr = {};
    rows.forEach((r, i) => {
      const rowErr = {};
      if (!r.product_id) {
        rowErr.product_id = true;
        if (first.rowIdx === null) first = { rowIdx: i, field: "product_id" };
      }
      if (!(Number(r.qty) > 0)) {
        rowErr.qty = true;
        if (first.rowIdx === null) first = { rowIdx: i, field: "qty" };
      }
      if (!(Number(r.rate) > 0)) {
        rowErr.rate = true;
        if (first.rowIdx === null) first = { rowIdx: i, field: "rate" };
      }
      newRowsErr[i] = rowErr;
    });
    setErrors((er) => ({ ...er, rows: { ...er.rows, ...newRowsErr } }));
    return first.rowIdx !== null ? first : null;
  };

  const focusHeader = (key) => {
    const ref = headerRefs[key];
    if (ref?.current) ref.current.focus();
  };

  const focusRowCell = (rowIdx, field) => {
    const ref = rowRefs[rowIdx]?.[field];
    if (ref?.current) ref.current.focus();
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    const missingHeaderKey = validateHeader();
    if (missingHeaderKey) {
      Swal.fire({ icon: "error", title: "Header missing", text: `Please fill ${missingHeaderKey.replace("_", " ")}` });
      focusHeader(missingHeaderKey);
      return;
    }

    const firstBad = validateRows();
    if (firstBad) {
      Swal.fire({ icon: "error", title: "Item row missing", text: `Please fill row ${firstBad.rowIdx + 1} - ${firstBad.field}` });
      focusRowCell(firstBad.rowIdx, firstBad.field);
      return;
    }

    try {
      setLoading(true);

      const bad = rows.find((r) => Number(r.qty) > Number(r.available || 0));
      if (bad) {
        Swal.fire({ icon: "error", title: "Stock exceeded", text: "Quantity exceeds available stock" });
        setLoading(false);
        return;
      }

      const derivedPaymentStatus =
        netDue <= 0 ? "Paid" : (Number(header.cash_received || 0) > 0 ? "Partial" : "Unpaid");

      const payload = {
        customer_id: header.customer_id,
        bill_no: header.sale_no,
        bill_date: header.date,
        status: header.status || "Active",
        payment_status: derivedPaymentStatus,
        payment_method: header.payment_method || "Cash",
        remarks: header.terms_condition || "",
        cash_received: Number(header.cash_received || 0), // NEW
        items: rows.map((r) => ({
          product_id: r.product_id,
          qty: Number(r.qty),
          discount_rate: Number(r.d1_percent || 0),
          gst_percent: Number(r.gst_percent || 0),
          unit: r.unit || "PCS",
          rate: Number(r.rate || 0),
        })),
      };

      if (isEditMode) {
        await salesAPI.update(sale.id, payload);
        await Swal.fire({
          icon: "success",
          title: "Sale updated",
          text: "Sale updated successfully",
          confirmButtonColor: "#2563eb",
        });
      } else {
        const { data: result } = await salesAPI.create(payload);
        await Swal.fire({
          icon: "success",
          title: "Sale created",
          html: `
            <div style="text-align:left">
              <div>Old Due: <b>${Number(result?.previous_due || 0).toFixed(2)}</b></div>
              <div>Sale Total: <b>${Number(result?.total_amount || 0).toFixed(2)}</b></div>
              <div>Cash Received: <b>${Number(result?.cash_received || 0).toFixed(2)}</b></div>
              <div>New Due: <b>${Number(result?.new_due || 0).toFixed(2)}</b></div>
              <div>Status: <b>${result?.payment_status || "-"}</b></div>
            </div>
          `,
          confirmButtonColor: "#2563eb",
        });
      }

      // Reset form
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
        old_remaining: 0,
        cash_received: 0,
      });
      setRows([
        {
          product_id: "",
          item_name: "",
          hsn_code: "",
          available: 0,
          qty: 1,
          cost_rate: 0,
          rate: 0,
          d1_percent: 0,
          per_size_disc: 0,
          gst_percent: 0,
          unit: "PCS",
          manualRate: false,
        },
      ]);
      setErrors({ header: {}, rows: {} });
      onSubmitted && onSubmitted();
    } catch (e) {
      Swal.fire({
        icon: "error",
        title: "Failed to save",
        text: e?.response?.data?.error || "Failed to save sale",
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setLoading(false);
    }
  };

  const COLORS = {
    headerBg: "bg-green-700",
    headerText: "text-white",
    rowAlt: "odd:bg-white even:bg-gray-50",
    cellBorder: "border",
    input: "border rounded w-full h-8 px-2 text-xs",
    inputNum: "border rounded w-16 h-8 px-2 text-right text-xs",
    inputNumWide: "border rounded w-20 h-8 px-2 text-right text-xs",
    badge: "font-semibold",
  };

  const errClass = "border-red-500 ring-1 ring-red-400";

  return (
    <form onSubmit={onSubmit} className="bg-white shadow-lg rounded-xl p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">{isEditMode ? "Update Sale" : "Create Sale"}</h2>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left: Inputs (span 2 columns on lg) */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 mb-4">
            <div className="flex flex-col">
              <label htmlFor="date" className="text-sm text-gray-600 mb-1">Date</label>
              <input id="date" ref={headerRefs.date} type="date" className={`border p-2 rounded-lg ${errors.header.date ? errClass : ""}`} value={header.date} onChange={(e) => onHeader({ target: { name: "date", value: e.target.value } })} />
            </div>

            <div className="flex flex-col">
              <label htmlFor="sale_no" className="text-sm text-gray-600 mb-1">Bill No</label>
              <input id="sale_no" ref={headerRefs.sale_no} className={`border p-2 rounded-lg`} value={header.sale_no} onChange={(e) => setHeader((p) => ({ ...p, sale_no: e.target.value }))} />
            </div>

            <div className="flex flex-col">
              <label htmlFor="customer_id" className="text-sm text-gray-600 mb-1">Customer</label>
              <select id="customer_id" name="customer_id" ref={headerRefs.customer_id} className={`border p-2 rounded-lg ${errors.header.customer_id ? errClass : ""}`} value={header.customer_id} onChange={onHeader}>
                <option value="">Select Customer</option>
                {customers.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
              </select>
            </div>

            <div className="flex flex-col">
              <label htmlFor="address" className="text-sm text-gray-600 mb-1">Address</label>
              <input id="address" ref={headerRefs.address} className="border p-2 rounded-lg" placeholder="Address" value={header.address} onChange={(e) => setHeader((p) => ({ ...p, address: e.target.value }))} />
            </div>

            <div className="flex flex-col">
              <label htmlFor="mobile_no" className="text-sm text-gray-600 mb-1">Mobile No.</label>
              <input id="mobile_no" ref={headerRefs.mobile_no} className="border p-2 rounded-lg" placeholder="Mobile" value={header.mobile_no} onChange={(e) => setHeader((p) => ({ ...p, mobile_no: e.target.value }))} />
            </div>

            <div className="flex flex-col">
              <label htmlFor="gst_no" className="text-sm text-gray-600 mb-1">GST No.</label>
              <input id="gst_no" ref={headerRefs.gst_no} className="border p-2 rounded-lg" placeholder="GST No." value={header.gst_no} onChange={(e) => setHeader((p) => ({ ...p, gst_no: e.target.value }))} />
            </div>

            <div className="flex flex-col">
              <label htmlFor="old_remaining" className="text-sm text-gray-600 mb-1">Old Remaining</label>
              <input readOnly id="old_remaining" className="border p-2 rounded-lg bg-gray-100" value={fx(header.old_remaining)} />
            </div>

            <div className="flex flex-col">
              <label htmlFor="sale_total" className="text-sm text-gray-600 mb-1">Sale Total</label>
              <input readOnly id="sale_total" className="border p-2 rounded-lg bg-gray-100" value={fx(saleTotal)} />
            </div>

            <div className="flex flex-col">
              <label htmlFor="cash_received" className="text-sm text-gray-600 mb-1">Paid Amount</label>
              <input id="cash_received" ref={headerRefs.cash_received} type="number" min={0} step="0.01" className="border p-2 rounded-lg" value={header.cash_received} onChange={(e) => onHeader({ target: { name: "cash_received", value: e.target.value } })} placeholder="0.00" />
            </div>

            <div className="flex flex-col">
              <label htmlFor="payment_method" className="text-sm text-gray-600 mb-1">Payment Method</label>
              <select id="payment_method" ref={headerRefs.payment_method} className="border p-2 rounded-lg" value={header.payment_method} onChange={(e) => setHeader((p) => ({ ...p, payment_method: e.target.value }))}>
                <option>Cash</option><option>Card</option><option>Online</option><option>Credit Card</option><option>UPI</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input id="payment_status" type="hidden" value={header.payment_status} />
              <label className="text-sm text-gray-500">Payment Status: <span className="font-semibold">{header.payment_status}</span></label>
            </div>
          </div>

  </div>

  {/* Right: Payment summary card (span 2 cols = half width) */}
        <div className="lg:col-span-2">
          <div className="bg-gray-50 p-4 rounded-lg shadow-inner self-start w-auto max-w-md max-h-[50vh] overflow-auto">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Payment Summary</h3>
            <div className="grid gap-3">
              <div>
                <label className="text-xs text-gray-600">Old Remaining</label>
                <div className="text-lg font-semibold">{fx(header.old_remaining)}</div>
              </div>
              <div>
                <label className="text-xs text-gray-600">Sale Total</label>
                <div className="text-lg font-semibold">{fx(saleTotal)}</div>
              </div>
              <div>
                <label className="text-xs text-gray-600">Cash Received</label>
                <input id="cash_received" ref={headerRefs.cash_received} type="number" min={0} step="0.01" className="border p-2 rounded w-auto" value={header.cash_received} onChange={(e) => onHeader({ target: { name: "cash_received", value: e.target.value } })} />
              </div>
              <div>
                <label className="text-xs text-gray-600">Net Due</label>
                <div className="text-lg font-semibold">{fx(netDue)}</div>
              </div>
              <div className="mt-3 flex gap-2">
                <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-60">{isEditMode ? "Update" : "Save"}</button>
                <button type="button" className="flex-1 px-4 py-2 bg-gray-200 rounded-lg" onClick={() => {
                  setHeader((p) => ({
                    ...p,
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
                    old_remaining: 0,
                    cash_received: 0,
                  }));
                  setRows([
                    {
                      product_id: "",
                      item_name: "",
                      hsn_code: "",
                      available: 0,
                      qty: 1,
                      cost_rate: 0,
                      rate: 0,
                      d1_percent: 0,
                      per_size_disc: 0,
                      gst_percent: 0,
                      unit: "PCS",
                      manualRate: false,
                    },
                  ]);
                  setErrors({ header: {}, rows: {} });
                }}>Reset</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Items (moved to full width) */}
      <div className="mt-3 overflow-x-auto">
        <table className="min-w-full border text-xs">
          <thead>
            <tr className={`bg-green-700 text-white`}>
              <th className="px-2 py-2 border text-center w-10">Sl</th>
              <th className="px-2 py-2 border text-left">Item Name</th>
              <th className="px-2 py-2 border text-left">HSNCode</th>
              <th className="px-2 py-2 border text-center w-20">Aval QTY</th>
              <th className="px-2 py-2 border text-center w-16">QTY</th>
              <th className="px-2 py-2 border text-right">Rate</th>
              <th className="px-2 py-2 border text-right">Amount</th>
              <th className="px-2 py-2 border text-right">Disc %</th>
              <th className="px-2 py-2 border text-right">Per Qty Disc</th>
              <th className="px-2 py-2 border text-right">Total Disc</th>
              <th className="px-2 py-2 border text-right">GST%</th>
              <th className="px-2 py-2 border text-right">GST Amt</th>
              <th className="px-2 py-2 border text-right">FinalAmt</th>
              <th className="px-2 py-2 border text-center w-16">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const qty = Number(r.qty) || 0;
              const rate = Number(r.rate) || 0;
              const base = qty * rate;
              const pctDiscPerUnit = (rate * (Number(r.d1_percent) || 0)) / 100;
              const pctDiscTotal = qty * pctDiscPerUnit;
              const perQtyDisc = Number(r.per_size_disc || 0);
              const totalDisc = perQtyDisc + pctDiscTotal;
              const taxable = Math.max(base - totalDisc, 0);
              const gstAmt = (taxable * (Number(r.gst_percent) || 0)) / 100;
              const finalAmt = taxable + gstAmt;

              return (
                <tr key={i} className={`odd:bg-white even:bg-gray-50`}>
                  <td className="px-2 py-1 border text-center">{i + 1}</td>

                  <td className="px-2 py-1 border">
                        <div>
                          <button
                            type="button"
                            onClick={() => { setProductPickerRow(i); setProductPickerQuery(""); }}
                            className={`text-left border rounded w-full h-8 px-2 text-xs ${errors.rows[i]?.product_id ? errClass : ""}`}
                          >
                            {r.item_name ? `${r.item_name} (${r.available ?? 0})` : "Select product"}
                          </button>
                        </div>
                  </td>

                  <td className="px-2 py-1 border bg-gray-100">
                    <input readOnly className={`border rounded w-full h-8 px-2 text-xs`} value={r.hsn_code} />
                  </td>

                  <td className="px-2 py-1 border text-green-800 text-center">
                    <span className={"font-semibold"}>{r.available ?? 0}</span>
                  </td>

                  <td className="px-2 py-1 border text-center">
                    <input
                      ref={rowRefs[i]?.qty}
                      type="number"
                      min={1}
                      max={Number(r.available || 0)}
                      className={`border rounded w-14 h-8 px-2 text-center text-xs ${errors.rows[i]?.qty ? errClass : ""}`}
                      value={r.qty}
                      onChange={(e) => onRow(i, "qty", e.target.value)}
                    />
                  </td>

                  <td className="px-2 py-1 border text-right">
                    <input
                      ref={rowRefs[i]?.rate}
                      type="number"
                      readOnly={true}
                      className={`border rounded w-20 h-8 px-2 text-right text-xs bg-gray-100 cursor-not-allowed`}
                      value={r.rate}
                    />
                    <div className="text-[10px] text-gray-500 text-right">
                      {useCostMargin && !r.manualRate ? `Margin: ${getRowMarginPercent(r)}% (auto)` : "Manual rate"}
                    </div>
                  </td>

                  <td className="px-2 py-1 border text-right">
                    <span className={"font-semibold"}>{fx(base)}</span>
                  </td>

                  <td className="px-2 py-1 border text-right">
                    <input
                      type="number"
                      className={`border rounded w-16 h-8 px-2 text-right text-xs`}
                      value={r.d1_percent}
                      onChange={(e) => onRow(i, "d1_percent", e.target.value)}
                    />
                  </td>

                  <td className="px-2 py-1 border text-right">
                    <input type="text" className="border rounded p-1 w-20 text-right" value={fx(pctDiscTotal)} readOnly />
                  </td>

                  <td className="px-2 py-1 border text-right">
                    <span className={"font-semibold"}>{fx(totalDisc)}</span>
                  </td>

                  <td className="px-2 py-1 border text-right">
                    <input
                      ref={rowRefs[i]?.gst_percent}
                      type="number"
                      className={`border rounded w-16 h-8 px-2 text-right text-xs`}
                      value={r.gst_percent}
                      onChange={(e) => onRow(i, "gst_percent", e.target.value)}
                    />
                  </td>

                  <td className="px-2 py-1 border text-right">
                    <span className={"font-semibold"}>{fx(gstAmt)}</span>
                  </td>

                  <td className="px-2 py-1 border text-right">
                    <span className={"font-semibold"}>{fx(finalAmt)}</span>
                  </td>

                  <td className="px-2 py-1 border text-center">
                    <button
                      className="h-8 w-8 grid place-items-center rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                      onClick={async (ev) => {
                        ev.preventDefault();
                        const res = await Swal.fire({
                          title: "Remove this row?",
                          text: "This item will be removed from the sale.",
                          icon: "warning",
                          showCancelButton: true,
                          confirmButtonText: "Remove",
                          cancelButtonText: "Cancel",
                          confirmButtonColor: "#dc2626",
                        });
                        if (res.isConfirmed) {
                          setRows((p) => p.filter((_, idx) => idx !== i));
                          setErrors((er) => {
                            const copy = { ...er };
                            delete copy.rows[i];
                            return copy;
                          });
                        }
                      }}
                      type="button"
                      title="Remove"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>

          <tfoot>
            <tr className="bg-gray-100 font-semibold text-right text-xs">
              <td className="px-2 py-2 border text-center"></td>
              <td className="px-2 py-2 border text-left">Totals</td>
              <td className="px-2 py-2 border text-left"></td>
              <td className="px-2 py-2 border text-center"></td>
              <td className="px-2 py-2 border text-center">
                {fx(rows.reduce((a, r) => a + Number(r.qty || 0), 0))}
              </td>
              <td className="px-2 py-2 border text-right">
                {fx(rows.reduce((a, r) => a + Number(r.rate || 0), 0))}
              </td>
              <td className="px-2 py-2 border text-right">{fx(totals.base)}</td>
              <td className="px-2 py-2 border text-right"></td>
              <td className="px-2 py-2 border text-right">{fx(totals.pctDisc)}</td>
              <td className="px-2 py-2 border text-right">{fx(totals.disc)}</td>
              <td className="px-2 py-2 border text-right"></td>
              <td className="px-2 py-2 border text-right">{fx(totals.gst)}</td>
              <td className="px-2 py-2 border text-right">{fx(totals.final)}</td>
              <td className="px-2 py-2 border text-center"></td>
            </tr>
            <tr>
              <td className="px-2 py-1 border" colSpan={13}>
                <button
                  className="px-2 py-1 bg-gray-200 rounded text-xs"
                  onClick={(e) => {
                    e.preventDefault();
                    setRows((p) => [
                      ...p,
                      {
                        product_id: "",
                        item_name: "",
                        hsn_code: "",
                        available: 0,
                        qty: 1,
                        cost_rate: 0,
                        rate: 0,
                        d1_percent: 0,
                        per_size_disc: 0,
                        gst_percent: 0,
                        unit: "PCS",
                        manualRate: false,
                      },
                    ]);
                  }}
                  type="button"
                >
                  Add Row
                </button>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      
      {/* Product picker modal (full screen) */}
      {productPickerRow !== null && (
        <div className="fixed inset-0 z-50 bg-white p-4 overflow-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Select Product</h3>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search product..."
                className="border rounded px-3 py-2"
                value={productPickerQuery}
                onChange={(e) => setProductPickerQuery(e.target.value)}
              />
              <button className="px-3 py-2 bg-gray-200 rounded" onClick={() => setProductPickerRow(null)}>Close</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {products
              .filter((p) => String(p.product_name).toLowerCase().includes(String(productPickerQuery || "").toLowerCase()))
              .map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className="p-3 border rounded text-left hover:bg-gray-50"
                  onClick={() => {
                    // select product into row
                    setRows((prev) => {
                      const next = [...prev];
                      next[productPickerRow] = {
                        ...next[productPickerRow],
                        product_id: p.id,
                        item_name: p.product_name,
                        hsn_code: p.hsn_code || "",
                        available: p.available ?? 0,
                        cost_rate: p.cost_rate ?? 0,
                        gst_percent: p.gst_percent ?? 0,
                        unit: "PCS",
                        qty: 1,
                        rate: recomputeSellingRate({ ...(next[productPickerRow] || {}), qty: 1, cost_rate: p.cost_rate ?? 0 }),
                      };
                      return next;
                    });
                    setProductPickerRow(null);
                  }}
                >
                  <div className="font-medium">{p.product_name}</div>
                  <div className="text-xs text-gray-500">HSN: {p.hsn_code || '-'} • Avl: {p.available ?? 0}</div>
                </button>
              ))}
          </div>
        </div>
      )}
    </form>
  );
}
