import React from 'react';
import { calculateInvoiceTotals, formatIndianNumber } from '../../utils/gstCalculations';

export default function MinimalTemplate({ invoice, company }) {
  const totals = calculateInvoiceTotals(
    invoice.items || [],
    company.stateCode,
    invoice.partyStateCode,
    invoice.extraCharges || 0,
    invoice.roundOff !== false
  );

  const isIntra = company.stateCode === invoice.partyStateCode;

  return (
    <div id="invoice-print-area" className="w-full bg-white text-slate-800 p-8 shadow-2xl rounded-sm print:shadow-none print:p-4 text-xs font-sans">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-light tracking-wider text-slate-900 mb-1">{invoice.docType || 'INVOICE'}</h1>
          <p className="font-mono text-sm text-slate-500">#{invoice.invoiceNumber}</p>
        </div>
        <div className="text-right">
          <h2 className="text-base font-bold text-slate-900">{company.name}</h2>
          <p className="text-slate-500">{company.city}, {company.stateName}</p>
          <p className="font-mono text-xs text-sky-800 font-semibold mt-1">GSTIN: {company.gstin}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 py-4 border-y border-slate-200 mb-8">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">BILLED TO</span>
          <p className="font-bold text-sm text-slate-900">{invoice.partyName}</p>
          <p className="text-slate-600 mt-0.5">{invoice.partyAddress}</p>
          <p className="font-mono text-xs text-slate-700 mt-1">GSTIN: {invoice.partyGstin || 'Unregistered'}</p>
        </div>

        <div className="text-right space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">DETAILS</span>
          <p><span className="text-slate-500">Date:</span> <span className="font-semibold">{invoice.invoiceDate}</span></p>
          <p><span className="text-slate-500">Due Date:</span> <span className="font-semibold">{invoice.dueDate || 'On Receipt'}</span></p>
          <p><span className="text-slate-500">POS:</span> <span className="font-semibold">{invoice.partyStateName} ({invoice.partyStateCode})</span></p>
        </div>
      </div>

      <table className="w-full border-collapse mb-8">
        <thead>
          <tr className="border-b-2 border-slate-900 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
            <th className="py-2">Item</th>
            <th className="py-2 text-center">HSN</th>
            <th className="py-2 text-right">Qty</th>
            <th className="py-2 text-right">Rate</th>
            <th className="py-2 text-right">Taxable</th>
            <th className="py-2 text-right">GST</th>
            <th className="py-2 text-right">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {totals.items.map((item, idx) => (
            <tr key={idx} className="text-xs">
              <td className="py-3 font-semibold text-slate-900">{item.name}</td>
              <td className="py-3 text-center font-mono text-slate-500">{item.hsnCode || '-'}</td>
              <td className="py-3 text-right">{item.quantity}</td>
              <td className="py-3 text-right font-mono">₹{formatIndianNumber(item.unitPrice)}</td>
              <td className="py-3 text-right font-mono">₹{formatIndianNumber(item.taxableAmount)}</td>
              <td className="py-3 text-right font-mono text-slate-500">{item.gstRate}%</td>
              <td className="py-3 text-right font-mono font-bold text-slate-900">₹{formatIndianNumber(item.totalAmount)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-between items-start pt-4 border-t border-slate-200">
        <div className="max-w-sm space-y-3">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">IN WORDS</span>
            <p className="font-semibold text-slate-800 italic text-xs">{totals.amountInWords}</p>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">PAYMENT DETAILS</span>
            <p className="text-slate-600">{company.bankName} | A/C: {company.accountNo} | IFSC: {company.ifsc}</p>
          </div>
        </div>

        <div className="w-64 space-y-2 text-right font-mono">
          <div className="flex justify-between text-slate-600">
            <span>Taxable Amount:</span>
            <span>₹{formatIndianNumber(totals.subtotalTaxable)}</span>
          </div>
          {isIntra ? (
            <>
              <div className="flex justify-between text-slate-600">
                <span>CGST:</span>
                <span>₹{formatIndianNumber(totals.totalCGST)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>SGST:</span>
                <span>₹{formatIndianNumber(totals.totalSGST)}</span>
              </div>
            </>
          ) : (
            <div className="flex justify-between text-slate-600">
              <span>IGST:</span>
              <span>₹{formatIndianNumber(totals.totalIGST)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold text-slate-900 border-t-2 border-slate-900 pt-2 font-sans">
            <span>TOTAL:</span>
            <span className="font-mono">₹{formatIndianNumber(totals.grandTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
