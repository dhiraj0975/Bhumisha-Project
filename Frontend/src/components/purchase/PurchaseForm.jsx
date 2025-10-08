import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PurchaseAPI from "../../axios/purchaseApi";
import VendorAPI from "../../axios/vendorsAPI";
import ProductAPI from "../../axios/productAPI";

const fx = (n) => (isNaN(n) ? "0.000" : Number(n).toFixed(3));

const to24h = (hhmm = "00:00", ampm = "PM") => {
  let [hh, mm] = (hhmm || "00:00").split(":").map((x) => Number(x || 0));
  if (ampm === "AM") {
    if (hh === 12) hh = 0;
  } else {
    if (hh !== 12) hh = hh + 12;
  }
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:00`;
};

const fromISOToTime = (iso = "") => {
  const hh = Number(iso?.slice(11, 13) || 0);
  const mm = iso?.slice(14, 16) || "00";
  const ampm = hh >= 12 ? "PM" : "AM";
  let displayH = hh % 12;
  if (displayH === 0) displayH = 12;
  return { time: `${String(displayH).padStart(2, "0")}:${mm}`, ampm };
};

const PurchaseForm = ({ onSaved }) => {
  const { poId } = useParams();
  const isEditMode = Boolean(poId);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);

  const [header, setHeader] = useState({
    bill_date: "",
    bill_time: "00:00",
    
    vendor_id: "",
    address: "",
    mobile_no: "",
    gst_no: "",
    bill_no: "",
    terms_condition: "",
  });

  const [rows, setRows] = useState([
    { product_id: "", item_name: "", hsn_code: "", size: 1, rate: 0, d1_percent: 0, gst_percent: 0 },
  ]);

  useEffect(() => {
    const fetchMaster = async () => {
      try {
        const [vRes, pRes] = await Promise.all([
          VendorAPI.getAll(),
          ProductAPI.getAll(),
        ]);
        setVendors(vRes?.data || []);
        setProducts(pRes?.data || []);

        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const ampm = hours >= 12 ? "PM" : "AM";
        let displayH = hours % 12;
        if (displayH === 0) displayH = 12;

        const formattedTime = `${String(displayH).padStart(2, "0")}:${String(
          minutes
        ).padStart(2, "0")}`;
        const formattedDate = `${year}-${month}-${day}`;

        setHeader((prev) => ({
          ...prev,
          bill_date: formattedDate,
          bill_time: formattedTime,

        }));
      } catch (e) {
        console.error("Master fetch error", e);
      }
    };
    fetchMaster();
  }, []);

  const onVendorChange = (e) => {
    const vendorId = e.target.value;
    const selectedVendor = vendors.find((v) => String(v.id) === String(vendorId));

    if (selectedVendor) {
      setHeader((prev) => ({
        ...prev,
        vendor_id: vendorId,
        address: selectedVendor.address || "",
        mobile_no: selectedVendor.contact_number || "",
        gst_no: selectedVendor.gst_no || "",
      }));
    } else {
      setHeader((prev) => ({
        ...prev,
        vendor_id: "",
        address: "",
        mobile_no: "",
        gst_no: "",
      }));
    }
  };

  useEffect(() => {
    if (!isEditMode) return;
    const load = async () => {
      try {
        const res = await PurchaseAPI.getById(poId);
        const data = res?.data || {};
        const { time, ampm } = data.bill_time
          ? fromISOToTime(data.bill_time)
          : { time: "00:00"};
        setHeader({
          bill_date: data.bill_date || "",
          bill_time: time, 
          vendor_id: data.vendor_id || "",
          address: data.address || "",
          mobile_no: data.mobile_no || "",
          gst_no: data.gst_no || "",
          bill_no: data.bill_no || "",
          terms_condition: data.terms_condition || "",
        });
        setRows(
          (data.items || []).map((it) => ({
            product_id: String(it.product_id || ""),
            item_name: it.item_name || it.product_name || "",
            hsn_code: it.hsn_code || "",
            size: Number(it.size || 0),
            rate: Number(it.rate || 0),
            d1_percent: Number(it.d1_percent ?? it.discount_rate ?? 0),
            gst_percent: Number(it.gst_percent ?? 0),
          }))
        );
      } catch (e) {
        console.error("Purchase fetch error", e);
      }
    };
    load();
  }, [isEditMode, poId]);

  const onHeader = (e) => setHeader((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onRow = (i, field, value) => {
    setRows((prev) => {
      const next = [...prev];
      const numeric = ["size", "rate", "d1_percent", "gst_percent"];
      next[i] = { ...next[i], [field]: numeric.includes(field) ? Number(value || 0) : value };
      return next;
    });
  };

  const addRow = () =>
    setRows((p) => [
      ...p,
      { product_id: "", item_name: "", hsn_code: "", size: 1, rate: 0, d1_percent: 0, gst_percent: 0 },
    ]);
  const removeRow = (i) => setRows((p) => p.filter((_, idx) => idx !== i));

  const calc = (r) => {
    const base = (r.size || 0) * (r.rate || 0);
    const perUnitDisc = ((r.rate || 0) * (r.d1_percent || 0)) / 100;
    const totalDisc = (r.size || 0) * perUnitDisc;
    const taxable = Math.max(0, base - totalDisc);
    const gstAmt = (taxable * (r.gst_percent || 0)) / 100;
    const final = taxable + gstAmt;
    return { base, perUnitDisc, totalDisc, taxable, gstAmt, final };
  };

  const totals = useMemo(
    () =>
      rows.reduce((a, r) => {
        const c = calc(r);
        a.base += c.base;
        a.disc += c.totalDisc;
        a.taxable += c.taxable;
        a.gst += c.gstAmt;
        a.final += c.final;
        return a;
      }, { base: 0, disc: 0, taxable: 0, gst: 0, final: 0 }),
    [rows]
  );

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      let bill_time_iso = "";
      if (header.bill_date) {
        const t24 = to24h(header.bill_time || "00:00", header.bill_time_am_pm || "PM");
        bill_time_iso = `${header.bill_date}T${t24}`;
      }

      const payload = {
        ...header,
        bill_time: bill_time_iso,
        items: rows,
        summary: totals,
      };

      if (isEditMode) {
        await PurchaseAPI.update(poId, payload);
        alert("Purchase updated successfully");
        // navigate back to list after update
        navigate("/purchases");
      } else {
        await PurchaseAPI.create(payload);
        alert("Purchase saved successfully");

        if (!isEditMode && typeof onSaved === "function") {
          onSaved();
        }
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save purchase");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    String(header.bill_date || "").trim() !== "" &&
    String(header.vendor_id || "").trim() !== "" &&
    rows.length > 0 &&
    rows.every(
      (r) => String(r.product_id).trim() !== "" && String(r.item_name || "").trim() !== "" && Number(r.size) > 0 && Number(r.rate) > 0
    );

  return (
    <form onSubmit={onSubmit} className="p-3">
      <div className="grid grid-cols-6 gap-3 border p-3 rounded">
        <div className="flex flex-col">
          <label className="text-xs">Bill Date</label>
          <input
            type="date"
            className="border rounded p-1"
            name="bill_date"
            value={header.bill_date}
            onChange={onHeader}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-xs">BILL TIME</label>
          <div className="flex gap-1">
            <input
              type="time"
              name="bill_time"
              value={header.bill_time || "00:00"}
              onChange={onHeader}
              className="border rounded p-1"
            />
            {/* <select
              name="bill_time_am_pm"
              value={header.bill_time_am_pm || "PM"}
              onChange={onHeader}
              className="border rounded p-1"
            >
              <option>AM</option>
              <option>PM</option>
            </select> */}
          </div>
        </div>

        <div className="flex flex-col">
          <label className="text-xs">Vendor</label>
          <select
            className="border rounded p-1"
            name="vendor_id"
            value={header.vendor_id}
            onChange={onVendorChange}
          >
            <option value="">Select</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.vendor_name || v.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-xs">ADDRESS</label>
          <input className="border rounded p-1" name="address" value={header.address} onChange={onHeader} />
        </div>

        <div className="flex flex-col">
          <label className="text-xs">MOBILE NO</label>
          <input className="border rounded p-1" name="mobile_no" value={header.mobile_no} onChange={onHeader} />
        </div>

        <div className="flex flex-col">
          <label className="text-xs">GST No</label>
          <input className="border rounded p-1" name="gst_no" value={header.gst_no} onChange={onHeader} />
        </div>

        <div className="flex flex-col">
          <label className="text-xs">Bill No.</label>
          <input className="border rounded p-1" name="bill_no" value={header.bill_no} onChange={onHeader} />
        </div>
      </div>

      <div className="bg-black text-yellow-300 text-center text-2xl font-semibold py-2 mt-3 mb-2 rounded">
        FINAL AMOUNT: {fx(totals.final)}
      </div>

      <div className="overflow-auto">
        <table className="w-full text-sm border">
          <thead className="bg-green-700 text-white">
            <tr>
              {[
                "SI",
                "Item Name",
                "HSNCode",
                "QTY",
                "Rate",
                "Amount",
                "Disc %",
                "Per Qty Disc",
                "Total Disc",
                "GST%",
                "GST Amt",
                "FinalAmt",
                "Actions",
              ].map((h, idx) => (
                <th key={`${h}-${idx}`} className="border px-2 py-1 text-left">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const c = calc(r);
              return (
                <tr key={i} className="odd:bg-white even:bg-gray-50">
                  <td className="border px-2 py-1">{i + 1}</td>

                  <td className="border px-2 py-1">
                    <div className="flex gap-1">
                      <select
                        className="border rounded p-1 w-44"
                        value={r.product_id}
                        onChange={(e) => {
                          const pid = e.target.value;
                          const p = products.find((x) => String(x.id) === String(pid));
                          onRow(i, "product_id", pid);
                          if (p) {
                            onRow(i, "item_name", p.product_name || "");
                            onRow(i, "hsn_code", p.hsn_code || "");
                            onRow(i, "rate", Number(p.purchase_rate || 0));
                          }
                        }}
                      >
                        <option value="">Select</option>
                        {products.map((p) => (
                          <option key={p.id} value={String(p.id)}>
                            {p.product_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>

                  <td className="border px-2 py-1">
                    <input
                      readOnly
                      className="border cursor-not-allowed bg-gray-100 rounded p-1 w-24"
                      value={r.hsn_code}
                      onChange={(e) => onRow(i, "hsn_code", e.target.value)}
                    />
                  </td>

                  <td className="border px-2 py-1">
                    <input
                      type="number"
                      className="border rounded p-1 w-20"
                      value={r.size}
                      onChange={(e) => onRow(i, "size", e.target.value)}
                    />
                  </td>

                  <td className="border px-2 py-1">
                    <input
                      type="number"
                      className="border rounded p-1 w-20"
                      value={r.rate}
                      onChange={(e) => onRow(i, "rate", e.target.value)}
                    />
                  </td>

                  <td className="border px-2 py-1">{fx(c.base)}</td>

                  <td className="border px-2 py-1">
                    <input
                      type="number"
                      className="border rounded p-1 w-16"
                      value={r.d1_percent}
                      onChange={(e) => onRow(i, "d1_percent", e.target.value)}
                    />
                  </td>

                  <td className="border px-2 py-1">
                    <input type="text" className="border rounded p-1 w-20 bg-gray-100" value={fx(c.perUnitDisc)} readOnly />
                  </td>

                  <td className="border px-2 py-1">
                    <input type="text" className="border rounded p-1 w-24 bg-gray-100" value={fx(c.totalDisc)} readOnly />
                  </td>

                  <td className="border px-2 py-1">
                    <input
                      type="number"
                      className="border rounded p-1 w-16"
                      value={r.gst_percent}
                      onChange={(e) => onRow(i, "gst_percent", e.target.value)}
                    />
                  </td>

                  <td className="border px-2 py-1">{fx(c.gstAmt)}</td>
                  <td className="border px-2 py-1">{fx(c.final)}</td>

                  <td className="border px-2 py-1 text-center">
                    <button type="button" className="text-red-600 active:scale-95" onClick={() => removeRow(i)}>
                      ❌
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>

          <tfoot>
            <tr className="bg-gray-100 font-semibold">
              <td className="border px-2 py-1" colSpan={5}>
                Totals
              </td>
              <td className="border px-2 py-1">{fx(totals.base)}</td>
              <td className="border px-2 py-1">—</td>
              <td className="border px-2 py-1">—</td>
              <td className="border px-2 py-1">{fx(totals.disc)}</td>
              <td className="border px-2 py-1">—</td>
              <td className="border px-2 py-1">{fx(totals.gst)}</td>
              <td className="border px-2 py-1">{fx(totals.final)}</td>
              <td className="border px-2 py-1"></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="flex gap-2 mt-3">
        <button type="button" onClick={addRow} className="px-4 py-2 bg-blue-600 action:scale-95 text-white rounded">
          Add Item
        </button>
        <button
          type="submit"
          disabled={loading || !isFormValid}
          className={`px-6 py-2 active:scale-95 rounded text-white bg-green-700 transition-opacity duration-200 ${
            loading || !isFormValid ? "opacity-50 cursor-not-allowed" : "opacity-100 cursor-pointer"
          }`}
        >
          {loading ? (isEditMode ? "Updating..." : "Saving...") : isEditMode ? "Update" : "Save Purchase"}
        </button>
      </div>
    </form>
  );
};

export default PurchaseForm;
