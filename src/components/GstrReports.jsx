import React, { useState } from 'react';
import { BarChart3, Download, FileSpreadsheet, ShieldCheck, Sparkles, Filter } from 'lucide-react';
import { calculateInvoiceTotals, formatCurrency, formatIndianNumber } from '../utils/gstCalculations';

export default function GstrReports({ invoices, company }) {
  const [activeReportTab, setActiveReportTab] = useState('gstr1_b2b'); // 'gstr1_b2b', 'gstr1_hsn', 'gstr3b'

  // 1. Process B2B Invoices (Invoices with registered GSTIN)
  const b2bInvoices = invoices.filter(inv => inv.partyGstin && inv.partyGstin.trim().length >= 15);

  // 2. Process HSN-Wise Summary
  const hsnMap = {};
  invoices.forEach(inv => {
    const isIntra = company.stateCode === inv.partyStateCode;
    (inv.items || []).forEach(item => {
      const code = item.hsnCode || 'N/A';
      if (!hsnMap[code]) {
        hsnMap[code] = {
          hsnCode: code,
          description: item.name,
          unit: item.unit || 'Pcs',
          totalQty: 0,
          taxableValue: 0,
          cgstAmount: 0,
          sgstAmount: 0,
          igstAmount: 0,
          totalTax: 0
        };
      }
      const qty = Number(item.quantity) || 0;
      const taxable = Number(item.unitPrice) * qty;
      const gstRate = Number(item.gstRate) || 0;
      const taxAmt = (taxable * gstRate) / 100;

      hsnMap[code].totalQty += qty;
      hsnMap[code].taxableValue += taxable;
      if (isIntra) {
        hsnMap[code].cgstAmount += taxAmt / 2;
        hsnMap[code].sgstAmount += taxAmt / 2;
      } else {
        hsnMap[code].igstAmount += taxAmt;
      }
      hsnMap[code].totalTax += taxAmt;
    });
  });

  const hsnSummaryList = Object.values(hsnMap);

  // 3. Process GSTR-3B Totals
  let gstr3bTaxable = 0;
  let gstr3bCGST = 0;
  let gstr3bSGST = 0;
  let gstr3bIGST = 0;

  invoices.forEach(inv => {
    const totals = calculateInvoiceTotals(
      inv.items || [],
      company.stateCode,
      inv.partyStateCode,
      inv.extraCharges || 0,
      inv.roundOff !== false
    );
    gstr3bTaxable += totals.subtotalTaxable;
    gstr3bCGST += totals.totalCGST;
    gstr3bSGST += totals.totalSGST;
    gstr3bIGST += totals.totalIGST;
  });

  // CSV Export Helper
  const downloadGstr1CSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    if (activeReportTab === 'gstr1_b2b') {
      csvContent += "GSTIN/UIN of Recipient,Receiver Name,Invoice Number,Invoice Date,Invoice Value,Place Of Supply,Reverse Charge,Rate,Taxable Value,Integrated Tax Amount,Central Tax Amount,State/UT Tax Amount\n";
      b2bInvoices.forEach(inv => {
        const totals = calculateInvoiceTotals(inv.items || [], company.stateCode, inv.partyStateCode);
        csvContent += `"${inv.partyGstin}","${inv.partyName}","${inv.invoiceNumber}","${inv.invoiceDate}",${totals.grandTotal},"${inv.placeOfSupply || inv.partyStateName}","N",18,${totals.subtotalTaxable},${totals.totalIGST},${totals.totalCGST},${totals.totalSGST}\n`;
      });
    } else if (activeReportTab === 'gstr1_hsn') {
      csvContent += "HSN,Description,UQC,Total Quantity,Total Value,Taxable Value,Integrated Tax Amount,Central Tax Amount,State/UT Tax Amount\n";
      hsnSummaryList.forEach(h => {
        csvContent += `"${h.hsnCode}","${h.description}","${h.unit}",${h.totalQty},${h.taxableValue + h.totalTax},${h.taxableValue},${h.igstAmount},${h.cgstAmount},${h.sgstAmount}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `GSTR1_${activeReportTab}_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="font-heading font-extrabold text-xl text-white">GSTR Tax Filing Assistant</h1>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30">
              CA & GST Portal Ready
            </span>
          </div>
          <p className="text-xs text-slate-400">Automated B2B Tables, HSN Summary & GSTR-3B Tax Liability</p>
        </div>

        <button
          onClick={downloadGstr1CSV}
          className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg transition-all"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Export CSV / Excel</span>
        </button>
      </div>

      {/* Report Tabs */}
      <div className="flex space-x-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveReportTab('gstr1_b2b')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeReportTab === 'gstr1_b2b'
              ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
              : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          GSTR-1: B2B Invoices ({b2bInvoices.length})
        </button>

        <button
          onClick={() => setActiveReportTab('gstr1_hsn')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeReportTab === 'gstr1_hsn'
              ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
              : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          GSTR-1: HSN Summary ({hsnSummaryList.length})
        </button>

        <button
          onClick={() => setActiveReportTab('gstr3b')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeReportTab === 'gstr3b'
              ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
              : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          GSTR-3B: Tax Liability Summary
        </button>
      </div>

      {/* Tab Content: GSTR-1 B2B Table */}
      {activeReportTab === 'gstr1_b2b' && (
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-heading font-bold text-sm text-white">Table 4A, 4B: B2B Registered Sales</h3>
            <span className="text-xs text-slate-400">Total B2B Count: {b2bInvoices.length}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Recipient GSTIN</th>
                  <th className="p-3.5">Receiver Name</th>
                  <th className="p-3.5">Invoice #</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5 text-right">Taxable Val</th>
                  <th className="p-3.5 text-right">CGST</th>
                  <th className="p-3.5 text-right">SGST</th>
                  <th className="p-3.5 text-right">IGST</th>
                  <th className="p-3.5 text-right">Invoice Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {b2bInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-500">
                      No B2B registered invoices recorded for this billing cycle.
                    </td>
                  </tr>
                ) : (
                  b2bInvoices.map(inv => {
                    const totals = calculateInvoiceTotals(inv.items || [], company.stateCode, inv.partyStateCode);

                    return (
                      <tr key={inv.id} className="hover:bg-slate-900/40 font-mono">
                        <td className="p-3.5 font-bold text-emerald-400">{inv.partyGstin}</td>
                        <td className="p-3.5 font-sans font-semibold text-white">{inv.partyName}</td>
                        <td className="p-3.5 text-white">{inv.invoiceNumber}</td>
                        <td className="p-3.5 text-slate-400">{inv.invoiceDate}</td>
                        <td className="p-3.5 text-right">₹{formatIndianNumber(totals.subtotalTaxable)}</td>
                        <td className="p-3.5 text-right text-sky-400">₹{formatIndianNumber(totals.totalCGST)}</td>
                        <td className="p-3.5 text-right text-sky-400">₹{formatIndianNumber(totals.totalSGST)}</td>
                        <td className="p-3.5 text-right text-purple-400">₹{formatIndianNumber(totals.totalIGST)}</td>
                        <td className="p-3.5 text-right font-bold text-white">₹{formatIndianNumber(totals.grandTotal)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content: HSN Summary */}
      {activeReportTab === 'gstr1_hsn' && (
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-heading font-bold text-sm text-white">Table 12: HSN-wise Summary of Outward Supplies</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3.5 text-center">HSN Code</th>
                  <th className="p-3.5">Description</th>
                  <th className="p-3.5 text-center">UQC</th>
                  <th className="p-3.5 text-right">Total Qty</th>
                  <th className="p-3.5 text-right">Total Taxable Value</th>
                  <th className="p-3.5 text-right">CGST</th>
                  <th className="p-3.5 text-right">SGST</th>
                  <th className="p-3.5 text-right">IGST</th>
                  <th className="p-3.5 text-right">Total Tax Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {hsnSummaryList.map((h, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/40 font-mono">
                    <td className="p-3.5 text-center font-bold text-emerald-400">{h.hsnCode}</td>
                    <td className="p-3.5 font-sans font-semibold text-white">{h.description}</td>
                    <td className="p-3.5 text-center text-slate-400">{h.unit}</td>
                    <td className="p-3.5 text-right font-semibold">{h.totalQty}</td>
                    <td className="p-3.5 text-right">₹{formatIndianNumber(h.taxableValue)}</td>
                    <td className="p-3.5 text-right text-sky-400">₹{formatIndianNumber(h.cgstAmount)}</td>
                    <td className="p-3.5 text-right text-sky-400">₹{formatIndianNumber(h.sgstAmount)}</td>
                    <td className="p-3.5 text-right text-purple-400">₹{formatIndianNumber(h.igstAmount)}</td>
                    <td className="p-3.5 text-right font-bold text-white">₹{formatIndianNumber(h.totalTax)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content: GSTR-3B Summary */}
      {activeReportTab === 'gstr3b' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="font-heading font-bold text-base text-white border-b border-slate-800 pb-2">
              3.1 Details of Outward Supplies (Tax Payable)
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between p-3 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-slate-400">Total Taxable Turnover:</span>
                <span className="font-mono font-bold text-white">₹{formatIndianNumber(gstr3bTaxable)}</span>
              </div>

              <div className="flex justify-between p-3 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-slate-400">Central Tax (CGST Payable):</span>
                <span className="font-mono font-bold text-sky-400">₹{formatIndianNumber(gstr3bCGST)}</span>
              </div>

              <div className="flex justify-between p-3 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-slate-400">State/UT Tax (SGST Payable):</span>
                <span className="font-mono font-bold text-sky-400">₹{formatIndianNumber(gstr3bSGST)}</span>
              </div>

              <div className="flex justify-between p-3 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-slate-400">Integrated Tax (IGST Payable):</span>
                <span className="font-mono font-bold text-purple-400">₹{formatIndianNumber(gstr3bIGST)}</span>
              </div>

              <div className="p-4 bg-gradient-to-r from-emerald-950 to-slate-900 rounded-xl border border-emerald-500/30 flex justify-between items-center text-sm">
                <span className="font-bold text-white">TOTAL TAX LIABILITY:</span>
                <span className="font-mono font-extrabold text-emerald-400 text-base">
                  ₹{formatIndianNumber(gstr3bCGST + gstr3bSGST + gstr3bIGST)}
                </span>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="font-heading font-bold text-base text-white border-b border-slate-800 pb-2">
              GSTR Return Filing Instructions
            </h3>
            <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
              <p>1. Export your <strong>GSTR-1 CSV</strong> report above using the export button.</p>
              <p>2. Login to the official GST Portal (<code className="text-cyan-400">gst.gov.in</code>).</p>
              <p>3. Navigate to Returns Dashboard → Select Financial Year & Return Period.</p>
              <p>4. Open GSTR-1 → Upload CSV or verify table data against your CA computation.</p>
              <p>5. Verify GSTR-3B auto-populated tax liabilities before final submission.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
