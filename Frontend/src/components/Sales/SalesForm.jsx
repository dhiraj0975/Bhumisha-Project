import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
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

  const [useCostMargin, setUseCostMargin] = useState(true);

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
    { product_id: "", item_name: "", hsn_code: "", available: 0, qty: 1, cost_rate: 0, rate: 0, d1_percent: 0, per_size_disc: 0, gst_percent: 0, unit: "PCS", manualRate: false },
  ]);

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
          setRows(mapped.length ? mapped : [{ product_id: "", item_name: "", hsn_code: "", available: 0, qty: 1, cost_rate: 0, rate: 0, d1_percent: 0, per_size_disc: 0, gst_percent: 0, unit: "PCS", manualRate: false }]);
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
        Swal.fire({ icon: "error", title: "Failed to load", text: "Failed to load form data" });
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
        const q = Number(next[i].qty || 0);
        if (q > avail) {
          next[i].qty = avail;
          Swal.fire({ icon: "info", title: "Stock limit", text: "Qty limited to available stock" });
        } else if (q < 1) {
          next[i].qty = 1;
        }
        if (useCostMargin && !next[i].manualRate) {
          next[i].rate = recomputeSellingRate(next[i]);
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

  const isFormValid = useMemo(() => {
    const headerValid = header.sale_no && header.customer_id && header.date;
    const rowsValid = rows.every((r) => r.product_id && Number(r.qty) > 0 && Number(r.rate) > 0);
    return Boolean(headerValid && rowsValid);
  }, [header, rows]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) {
      Swal.fire({ icon: "error", title: "Required fields missing", text: "Please fill required fields" });
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
          qty: Number(r.qty),
          discount_rate: Number(r.d1_percent || 0),
          // per_size_disc: Number(r.per_size_disc || 0), // enable if backend supports
          gst_percent: Number(r.gst_percent || 0),
          unit: r.unit || "PCS",
          rate: Number(r.rate || 0),
        })),
      };

      if (isEditMode) {
        await salesAPI.update(sale.id, payload);
        await Swal.fire({ icon: "success", title: "Sale updated", text: "Sale updated successfully", confirmButtonColor: "#2563eb" });
      } else {
        await salesAPI.create(payload);
        await Swal.fire({ icon: "success", title: "Sale created", text: "Sale created successfully", confirmButtonColor: "#2563eb" });
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
      setRows([{ product_id: "", item_name: "", hsn_code: "", available: 0, qty: 1, cost_rate: 0, rate: 0, d1_percent: 0, per_size_disc: 0, gst_percent: 0, unit: "PCS", manualRate: false }]);
      onSubmitted && onSubmitted();
    } catch (e) {
      Swal.fire({ icon: "error", title: "Failed to save", text: e?.response?.data?.error || "Failed to save sale", confirmButtonColor: "#dc2626" });
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

  return (
    <form onSubmit={onSubmit} className="bg-white shadow-lg rounded-xl p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">{isEditMode ? "Update Sale" : "Create Sale"}</h2>

      <div className="grid grid-cols-4 gap-4">
        <div className="flex items-center gap-2">
          <input id="useCostMargin" type="checkbox" checked={useCostMargin} onChange={(e)=>setUseCostMargin(e.target.checked)} />
          <label htmlFor="useCostMargin" className="text-sm text-gray-700">Use cost-based margin</label>
        </div>

        <div className="flex flex-col">
          <label htmlFor="date" className="text-sm text-gray-600 mb-1">Date</label>
          <input id="date" type="date" className="border p-2 rounded-lg" value={header.date} onChange={(e) => setHeader((p) => ({ ...p, date: e.target.value }))} />
        </div>

        <div className="flex flex-col">
          <label htmlFor="customer_id" className="text-sm text-gray-600 mb-1">Customer</label>
          <select id="customer_id" name="customer_id" className="border p-2 rounded-lg" value={header.customer_id} onChange={onHeader}>
            <option value="">Select Customer</option>
            {customers.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
          </select>
        </div>

        <div className="flex flex-col">
          <label htmlFor="address" className="text-sm text-gray-600 mb-1">Address</label>
          <input id="address" className="border p-2 rounded-lg" placeholder="Address" value={header.address} onChange={(e) => setHeader((p) => ({ ...p, address: e.target.value }))} />
        </div>

        <div className="flex flex-col">
          <label htmlFor="mobile_no" className="text-sm text-gray-600 mb-1">Mobile</label>
          <input id="mobile_no" className="border p-2 rounded-lg" placeholder="Mobile" value={header.mobile_no} onChange={(e) => setHeader((p) => ({ ...p, mobile_no: e.target.value }))} />
        </div>

        <div className="flex flex-col">
          <label htmlFor="gst_no" className="text-sm text-gray-600 mb-1">GST No.</label>
          <input id="gst_no" className="border p-2 rounded-lg" placeholder="GST No." value={header.gst_no} onChange={(e) => setHeader((p) => ({ ...p, gst_no: e.target.value }))} />
        </div>

        <div className="flex flex-col">
          <label htmlFor="payment_status" className="text-sm text-gray-600 mb-1">Payment Status</label>
          <select id="payment_status" className="border p-2 rounded-lg" value={header.payment_status} onChange={(e) => setHeader((p) => ({ ...p, payment_status: e.target.value }))}>
            <option>Unpaid</option><option>Partial</option><option>Paid</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label htmlFor="payment_method" className="text-sm text-gray-600 mb-1">Payment Method</label>
          <select id="payment_method" className="border p-2 rounded-lg" value={header.payment_method} onChange={(e) => setHeader((p) => ({ ...p, payment_method: e.target.value }))}>
            <option>Cash</option><option>Card</option><option>Online</option><option>Credit Card</option><option>UPI</option>
          </select>
        </div>
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="min-w-full border text-xs">
          <thead>
            <tr className={`${"bg-green-700"} ${"text-white"}`}>
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
                    <select className={`border rounded w-full h-8 px-2 text-xs`} value={r.product_id} onChange={(e) => onRow(i, "product_id", e.target.value)}>
                      <option value="">Select</option>
                      {products.map((p) => (<option key={p.id} value={p.id}>{p.product_name}</option>))}
                    </select>
                  </td>

                  <td className="px-2 py-1 border bg-gray-100">
                    <input readOnly className={`border rounded w-full h-8 px-2 text-xs`} value={r.hsn_code} />
                  </td>

                  <td className="px-2 py-1 border text-green-800 text-center">
                    <span className={"font-semibold"}>{r.available ?? 0}</span>
                  </td>

                  <td className="px-2 py-1 border text-center">
                    <input type="number" min={1} max={Number(r.available || 0)} className="border rounded w-14 h-8 px-2 text-center text-xs" value={r.qty} onChange={(e) => onRow(i, "qty", e.target.value)} />
                  </td>

<td className="px-2 py-1 border text-right">
  <input
    type="number"
    className={`border rounded w-20 h-8 px-2 text-right text-xs`}
    value={r.rate}
    onChange={(e) => onRow(i, "rate", e.target.value)}
  />
  <div className="text-[10px] text-gray-500 text-right">
    {useCostMargin && !r.manualRate
      ? `Margin: ${getRowMarginPercent(r)}% (auto)`
      : "Manual rate"}
  </div>
</td>


                  <td className="px-2 py-1 border text-right">
                    <span className={"font-semibold"}>{fx(base)}</span>
                  </td>

                  <td className="px-2 py-1 border text-right">
                    <input type="number" className={`border rounded w-16 h-8 px-2 text-right text-xs`} value={r.d1_percent} onChange={(e) => onRow(i, "d1_percent", e.target.value)} />
                  </td>

                  <td className="px-2 py-1 border text-right">
                    <input type="text" className="border rounded p-1 w-20 text-right" value={fx(pctDiscTotal)} readOnly />
                  </td>

                  <td className="px-2 py-1 border text-right">
                    <span className={"font-semibold"}>{fx(totalDisc)}</span>
                  </td>

                  <td className="px-2 py-1 border text-right">
                    <input type="number" className={`border rounded w-16 h-8 px-2 text-right text-xs`} value={r.gst_percent} onChange={(e) => onRow(i, "gst_percent", e.target.value)} />
                  </td>

                  <td className="px-2 py-1 border text-right">
                    <span className={"font-semibold"}>{fx(gstAmt)}</span>
                  </td>

                  <td className="px-2 py-1 border text-right">
                    <span className={"font-semibold"}>{fx(finalAmt)}</span>
                  </td>

                  <td className="px-2 py-1 border text-center">
                    <button className="h-8 w-8 grid place-items-center rounded-full bg-red-100 text-red-600 hover:bg-red-200" onClick={async (ev) => { ev.preventDefault();
                      const res = await Swal.fire({ title: "Remove this row?", text: "This item will be removed from the sale.", icon: "warning", showCancelButton: true, confirmButtonText: "Remove", cancelButtonText: "Cancel", confirmButtonColor: "#dc2626" });
                      if (res.isConfirmed) setRows((p)=>p.filter((_,idx)=>idx!==i));
                    }} type="button" title="Remove">×</button>
                  </td>
                </tr>
              );
            })}

            {/* <tr className="bg-gray-100">
              <td className="px-2 py-2 border" colSpan={6}>Totals</td>
              <td className="px-2 py-2 border text-right">
                <span className={"font-semibold"}>{fx(rows.reduce((a,r)=>a+((Number(r.qty)||0)*(Number(r.rate)||0)),0))}</span>
              </td>
              <td className="px-2 py-2 border text-center">—</td>
              <td className="px-2 py-2 border text-right">
                <span className={"font-semibold"}>{fx(rows.reduce((a,r)=>{
                  const rate = Number(r.rate)||0;
                  const pct = Number(r.d1_percent)||0;
                  const qty = Number(r.qty)||0;
                  const perUnitDisc = (rate * pct)/100;
                  const perUnitTotal = perUnitDisc * qty;
                  const perQty = Number(r.per_size_disc||0);
                  return a + perUnitTotal + perQty;
                },0))}</span>
              </td>
              <td className="px-2 py-2 border text-center">—</td>
              <td className="px-2 py-2 border text-right">
                <span className={"font-semibold"}>{fx(rows.reduce((a,r)=>{
                  const base=(Number(r.qty)||0)*(Number(r.rate)||0);
                  const perUnit=((Number(r.rate)||0)*(Number(r.d1_percent)||0))/100*(Number(r.qty)||0);
                  const perQty=Number(r.per_size_disc||0);
                  const taxable=Math.max(base - (perUnit+perQty),0);
                  const gstAmt=(taxable*(Number(r.gst_percent)||0))/100;
                  return a + gstAmt;
                },0))}</span>
              </td>
              <td className="px-2 py-2 border text-right">
                <span className={"font-semibold"}>{fx(rows.reduce((a,r)=>{
                  const base=(Number(r.qty)||0)*(Number(r.rate)||0);
                  const perUnit=((Number(r.rate)||0)*(Number(r.d1_percent)||0))/100*(Number(r.qty)||0);
                  const perQty=Number(r.per_size_disc||0);
                  const taxable=Math.max(base - (perUnit+perQty),0);
                  const gstAmt=(taxable*(Number(r.gst_percent)||0))/100;
                  return a + taxable + gstAmt;
                },0))}</span>
              </td>
              <td className="px-2 py-2 border"></td>
            </tr> */}
          </tbody>
<tfoot>
  <tr className="bg-gray-100 font-semibold text-right text-xs">
    <td className="px-2 py-2 border text-center"></td>
    <td className="px-2 py-2 border text-left">Totals</td>
    <td className="px-2 py-2 border text-left"></td>
    <td className="px-2 py-2 border text-center"></td>
    <td className="px-2 py-2 border text-center">
      {fx(rows.reduce((a,r)=>a+Number(r.qty||0),0))}
    </td>
    <td className="px-2 py-2 border text-right">
      {fx(rows.reduce((a,r)=>a+Number(r.rate||0),0))}
    </td>
    <td className="px-2 py-2 border text-right">{fx(totals.base)}</td>
    <td className="px-2 py-2 border text-right"></td>
    <td className="px-2 py-2 border text-right">{fx(totals.pctDisc)}</td>
    <td className="px-2 py-2 border text-right">{fx(totals.disc)}</td>
    <td className="px-2 py-2 border text-right"></td>
    <td className="px-2 py-2 border text-right">{fx(totals.gst)}</td>
    <td className="px-2 py-2 border text-right">{fx(totals.final)}</td>
    <td className="px-2 py-2 border text-center">
      
    </td>
  </tr>
  <tr>
    <td className="px-2 py-1 border" colSpan={13}>
      <button
        className="px-2 py-1 bg-gray-200 rounded text-xs"
        onClick={(e)=>{e.preventDefault(); setRows((p)=>[...p,{
          product_id:"", item_name:"", hsn_code:"", available:0, qty:1,
          cost_rate:0, rate:0, d1_percent:0, per_size_disc:0, gst_percent:0,
          unit:"PCS", manualRate:false
        }])}}
        type="button"
      >
        Add Row
      </button>
    </td>
  </tr>
</tfoot>


        </table>
      </div>

      <div className="mt-6 flex gap-2">
        <button type="submit" disabled={loading || !isFormValid} className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-60">
          {isEditMode ? "Update" : "Save"}
        </button>
        <button type="button" className="px-4 py-2 bg-gray-200 rounded-lg" onClick={() => {
          setHeader((p) => ({ ...p, terms_condition: "" }));
          setRows([{ product_id: "", item_name: "", hsn_code: "", available: 0, qty: 1, cost_rate: 0, rate: 0, d1_percent: 0, per_size_disc: 0, gst_percent: 0, unit: "PCS", manualRate: false }]);
        }}>
          Reset
        </button>
      </div>
    </form>
  );
}
