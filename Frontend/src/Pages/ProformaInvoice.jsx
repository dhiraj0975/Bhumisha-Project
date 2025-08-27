import React from "react";

/**
 * Proforma Invoice – React + Tailwind (Print Only Invoice)
 * - Matches your PDF exactly
 * - Always prints only the proforma (hides navbar/sidebar)
 * - Ready to use in your app
 */

const data = {
  company: {
    name: "MAA RENUKA FOODS PVT LTD",
    addressLine1: "1107 DWARKAPURI INDORE MADHYA",
    addressLine2: "PRADESH, Indore, Madhya Pradesh, 452009",
    gstin: "23AAMCM4384N1ZW",
    mobile: "6260777506",
    pan: "AAMCM4384N",
  },
  paymentDetails: "BANK/UPI/CASH",
  paymentDate: "",
  invoice: {
    title: "PROFORMA INVOICE",
    numberLabel: "Proforma Invoice No.",
    number: "MR/PF/24-25/239",
    dateLabel: "Proforma Date",
    date: "12/03/2025",
  },
  billTo: {
    name: "BHUMISHA ORGANICS",
    address:
      "G-2/183, GULMOHAR COLONY MAIN ROAD, Bhopal, Bhopal, Madhya Pradesh, Bhopal, 462039",
    gstin: "23ATYPP9155E1Z3",
    state: "Madhya Pradesh",
    mobile: "9617435709",
    pan: "ATYPP9155E",
  },
  shipTo: {
    name: "BHUMISHA ORGANICS",
    address: "BHOPAL,",
  },
  items: [
    { sno: 1, item: "DHANIYA WHOLE", hsn: "0909", qty: "20 KGS", rate: 125, tax: 5, amount: 2625 },
    { sno: 2, item: "JOWAR", hsn: "-", qty: "100 KGS", rate: 40, tax: 0, amount: 4000 },
    { sno: 3, item: "BASMATI RICE", hsn: "1006", qty: "50 KGS", rate: 110, tax: 0, amount: 5500 },
    { sno: 4, item: "1544 Wheat", hsn: "1001", qty: "200 PCS", rate: 35, tax: 0, amount: 7000 },
    { sno: 5, item: "KABULI CHANA", hsn: "-", qty: "25 KGS", rate: 130, tax: 5, amount: 3412.5 },
    { sno: 6, item: "TUAR DAL", hsn: "0713", qty: "500 KGS", rate: 137, tax: 0, amount: 68500 },
    { sno: 7, item: "CHANA DAL", hsn: "-", qty: "25 KGS", rate: 85, tax: 5, amount: 2231.25 },
    { sno: 8, item: "MOONG WHOLE", hsn: "-", qty: "25 KGS", rate: 103, tax: 5, amount: 2703.75 },
    { sno: 9, item: "RED CHLLI POWDER", hsn: "-", qty: "25 KGS", rate: 310, tax: 5, amount: 8137.5 },
    { sno: 10, item: "AJWAIN", hsn: "0910", qty: "10 KGS", rate: 220, tax: 5, amount: 2310 },
    { sno: 11, item: "SAUF", hsn: "-", qty: "10 KGS", rate: 360, tax: 5, amount: 3780 },
    { sno: 12, item: "jaggery", hsn: "1701", qty: "25 KGS", rate: 65, tax: 5, amount: 1706.25 },
    { sno: 13, item: "jaggery powder", hsn: "-", qty: "100 KGS", rate: 65, tax: 5, amount: 6825 },
  ],
  otherCharges: [{ label: "LOCAL TRANSPORT", amount: 800, tax: 0 }],
  roundOff: 0.25,
  taxSummary: [
    { hsn: "1001", taxable: 7000, cgstRate: 0, cgstAmt: 0, sgstRate: 0, sgstAmt: 0 },
    { hsn: "1006", taxable: 5500, cgstRate: 0, cgstAmt: 0, sgstRate: 0, sgstAmt: 0 },
    { hsn: "-", taxable: 4000, cgstRate: 0, cgstAmt: 0, sgstRate: 0, sgstAmt: 0 },
    { hsn: "0713", taxable: 68500, cgstRate: 0, cgstAmt: 0, sgstRate: 0, sgstAmt: 0 },
    { hsn: "1701", taxable: 1625, cgstRate: 2.5, cgstAmt: 40.63, sgstRate: 2.5, sgstAmt: 40.63 },
    { hsn: "0909", taxable: 2500, cgstRate: 2.5, cgstAmt: 62.5, sgstRate: 2.5, sgstAmt: 62.5 },
    { hsn: "-", taxable: 25800, cgstRate: 2.5, cgstAmt: 645, sgstRate: 2.5, sgstAmt: 645 },
    { hsn: "0910", taxable: 2200, cgstRate: 2.5, cgstAmt: 55, sgstRate: 2.5, sgstAmt: 55 },
  ],
  totals: {
    totalTax: 1606.25,
    grandTotal: 119531,
    inWords: "One Lakh Nineteen Thousand Five Hundred Thirty One Rupees",
  },
  bank: {
    name: "MAA RENUKA FOODS PVT LTD",
    ifsc: "KKBK0005941",
    account: "5812884503",
    bankName: "KOTAK MAHINDRA BANK",
    branch: "ANNAPURNA ROAD BRANCH",
  },
  terms: [
    "ALL JURISDICTION LIES INDORE ONLY FOR ANY DISPUTE",
    "MATERIAL ONCE SOLD WILL NOT BE TAKEN BACK.",
    "ANY DAMAGES IN TRANSPORTATION IS NOT OUR RESPONSIBILITY.",
  ],
};

function formatINR(n) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(n);
}

function padRows(items, target = 14) {
  const rows = [...items];
  while (rows.length < target) {
    rows.push({ sno: rows.length + 1, item: "", hsn: "", qty: "", rate: "", tax: "", amount: "" });
  }
  return rows;
}

const Cell = ({ children, className = "" }) => (
  <td className={`p-2 align-top text-[12px] border border-black/70 ${className}`}>{children}</td>
);

export default function ProformaInvoice() {
  const items = padRows(data.items, 14);

  return (
    <div className="proforma-print mx-auto max-w-[900px] p-4 print:p-0 bg-white text-black">
      {/* Print button (hidden when printing) */}
      <div className="mb-4 flex justify-end gap-2 print:hidden">
        <button
          onClick={() => window.print()}
          className="px-4 py-2 rounded-lg border shadow-sm hover:shadow focus:outline-none"
        >
          Print
        </button>
      </div>

      {/* A4 Sheet */}
      <div className="relative bg-white text-[12px] leading-tight mx-auto border border-black/70 print:border-0">
        {/* --- HEADER --- */}
        <div className="p-4 border-b border-black/70 flex justify-between">
          <div>
            <h1 className="text-[18px] font-semibold uppercase">{data.company.name}</h1>
            <p>{data.company.addressLine1}</p>
            <p>{data.company.addressLine2}</p>
            <p>GSTIN: {data.company.gstin} | Mobile: {data.company.mobile}</p>
            <p>PAN: {data.company.pan} | Payment: {data.paymentDetails}</p>
          </div>
          <div className="text-right">
            <div className="text-[20px] font-bold">{data.invoice.title}</div>
            <div className="mt-2 border border-black/70 inline-block">
              <div className="flex border-b border-black/70">
                <div className="px-2 py-1 border-r border-black/70">{data.invoice.numberLabel}</div>
                <div className="px-2 py-1">{data.invoice.number}</div>
              </div>
              <div className="flex">
                <div className="px-2 py-1 border-r border-black/70">{data.invoice.dateLabel}</div>
                <div className="px-2 py-1">{data.invoice.date}</div>
              </div>
            </div>
          </div>
        </div>

        {/* --- BILL TO / SHIP TO --- */}
        <div className="p-4 border-b border-black/70 grid grid-cols-2 gap-4">
          <div className="border border-black/70 p-2">
            <div className="font-semibold border-b border-black/70 mb-1">BILL TO</div>
            <div>{data.billTo.name}</div>
            <div>{data.billTo.address}</div>
            <div>GSTIN: {data.billTo.gstin} | State: {data.billTo.state}</div>
            <div>Mobile: {data.billTo.mobile} | PAN: {data.billTo.pan}</div>
          </div>
          <div className="border border-black/70 p-2">
            <div className="font-semibold border-b border-black/70 mb-1">SHIP TO</div>
            <div>{data.shipTo.name}</div>
            <div>{data.shipTo.address}</div>
          </div>
        </div>

        {/* --- ITEMS --- */}
        <div className="p-4 border-b border-black/70">
          <table className="w-full border-collapse">
            <thead>
              <tr className="font-semibold">
                <Cell className="text-center">S.NO.</Cell>
                <Cell>ITEMS</Cell>
                <Cell className="text-center">HSN</Cell>
                <Cell className="text-center">QTY</Cell>
                <Cell className="text-right">RATE</Cell>
                <Cell className="text-center">TAX</Cell>
                <Cell className="text-right">AMOUNT</Cell>
              </tr>
            </thead>
            <tbody>
              {items.map((r, i) => (
                <tr key={i}>
                  <Cell className="text-center">{r.sno}</Cell>
                  <Cell>{r.item}</Cell>
                  <Cell className="text-center">{r.hsn}</Cell>
                  <Cell className="text-center">{r.qty}</Cell>
                  <Cell className="text-right">{r.rate}</Cell>
                  <Cell className="text-center">{r.tax ? `(${r.tax}%)` : ""}</Cell>
                  <Cell className="text-right">
                    {r.amount ? formatINR(r.amount).replace("₹", "") : ""}
                  </Cell>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* --- FOOTER --- */}
        <div className="p-4 grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="border border-black/70 p-2">
              <div className="font-semibold border-b border-black/70 mb-1">Bank Details</div>
              <div>Name: {data.bank.name}</div>
              <div>IFSC: {data.bank.ifsc}</div>
              <div>Account No: {data.bank.account}</div>
              <div>Bank: {data.bank.bankName} ({data.bank.branch})</div>
            </div>
            <div className="border border-black/70 p-2">
              <div className="font-semibold border-b border-black/70 mb-1">Terms</div>
              <ul className="list-disc pl-4">
                {data.terms.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border border-black/70 p-2 flex items-end justify-end">
            <div className="text-right">
              <div className="font-semibold">Authorised Signatory</div>
              <div>{data.company.name}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Print isolation */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .proforma-print, .proforma-print * { visibility: visible; }
          .proforma-print { position: absolute; left: 0; top: 0; width: 100%; }
          .print\\\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}
