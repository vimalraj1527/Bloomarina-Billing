import React from 'react';
import { calculateInvoiceTotals, getStateNameByCode, formatIndianNumber } from '../../utils/gstCalculations';

export default function ModernTemplate({ invoice, company }) {
  const totals = calculateInvoiceTotals(
    invoice.items || [],
    company.stateCode,
    invoice.partyStateCode,
    invoice.extraCharges || 0,
    invoice.roundOff !== false
  );

  const isIntra = company.stateCode === invoice.partyStateCode;

  return (
    <div id="invoice-print-area" className="w-full bg-white text-slate-900 p-8 shadow-2xl rounded-sm print:shadow-none print:p-4 text-xs font-sans">
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-sky-600 pb-6 mb-6">
        <div>
          {company.logoUrl ? (
            <img src={company.logoUrl} alt={company.name} className="h-16 object-contain mb-3" />
          ) : (
            <div className="text-2xl font-extrabold text-sky-700 uppercase tracking-wide">
              {company.name}
            </div>
          )}
          {company.tradeName && company.tradeName !== company.name && (
            <div className="text-sm font-semibold text-slate-700">({company.tradeName})</div>
          )}
          <div className="text-slate-600 mt-1 space-y-0.5 leading-relaxed">
            <p>{company.address}, {company.city} - {company.pincode}</p>
            <p><span className="font-semibold text-slate-800">State:</span> {company.stateName} ({company.stateCode})</p>
            <p><span className="font-semibold text-slate-800">GSTIN:</span> <span className="font-mono font-bold text-sky-800">{company.gstin}</span> | <span className="font-semibold text-slate-800">PAN:</span> {company.pan}</p>
            <p><span className="font-semibold text-slate-800">Email:</span> {company.email} | <span className="font-semibold text-slate-800">Phone:</span> {company.phone}</p>
          </div>
        </div>

        <div className="text-right">
          <span className="inline-block bg-sky-700 text-white font-bold text-base px-4 py-1.5 rounded uppercase tracking-wider mb-3">
            {invoice.docType || 'TAX INVOICE'}
          </span>
          <div className="space-y-1 text-slate-700">
            <p><span className="font-semibold">Invoice No:</span> <span className="font-mono font-bold text-slate-900">{invoice.invoiceNumber}</span></p>
            <p><span className="font-semibold">Date:</span> {invoice.invoiceDate}</p>
            {invoice.dueDate && <p><span className="font-semibold">Due Date:</span> {invoice.dueDate}</p>}
            <p><span className="font-semibold">Place of Supply:</span> {invoice.placeOfSupply || invoice.partyStateName}</p>
            {invoice.reverseCharge && <p><span className="font-semibold">Reverse Charge (RCM):</span> {invoice.reverseCharge}</p>}
          </div>
        </div>
      </div>

      {/* Bill To & Ship To Grid */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-sky-50/60 p-4 rounded border border-sky-100">
          <h3 className="text-xs font-bold text-sky-900 uppercase tracking-wider mb-2 border-b border-sky-200 pb-1">
            Billed To (Buyer)
          </h3>
          <p className="font-bold text-sm text-slate-900">{invoice.partyName}</p>
          <div className="text-slate-600 mt-1 space-y-0.5 leading-relaxed">
            <p>{invoice.partyAddress}</p>
            <p><span className="font-semibold text-slate-800">State:</span> {invoice.partyStateName} (Code: {invoice.partyStateCode})</p>
            <p><span className="font-semibold text-slate-800">GSTIN / UIN:</span> <span className="font-mono font-bold text-sky-800">{invoice.partyGstin || 'URP (Unregistered)'}</span></p>
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded border border-slate-200">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 border-b border-slate-200 pb-1">
            Transport & E-Way Details
          </h3>
          <div className="text-slate-600 space-y-1">
            {invoice.ewayBillNo ? (
              <>
                <p><span className="font-semibold text-slate-800">E-Way Bill No:</span> <span className="font-mono font-bold">{invoice.ewayBillNo}</span></p>
                <p><span className="font-semibold text-slate-800">Vehicle No:</span> {invoice.vehicleNo || 'N/A'}</p>
                <p><span className="font-semibold text-slate-800">Transporter:</span> {invoice.transporterName || 'N/A'}</p>
              </>
            ) : (
              <p className="italic text-slate-500">No transport/E-Way bill info attached</p>
            )}
            {invoice.irn && (
              <div className="mt-2 pt-2 border-t border-slate-200">
                <p className="font-semibold text-slate-800">E-Invoice IRN:</p>
                <p className="font-mono text-[9px] break-all text-slate-600">{invoice.irn}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full border-collapse mb-6">
        <thead>
          <tr className="bg-sky-800 text-white text-[11px] uppercase tracking-wider font-semibold">
            <th className="p-2.5 text-center w-10">#</th>
            <th className="p-2.5 text-left">Item Description</th>
            <th className="p-2.5 text-center">HSN/SAC</th>
            <th className="p-2.5 text-right">Qty</th>
            <th className="p-2.5 text-right">Rate (₹)</th>
            <th className="p-2.5 text-right">Taxable (₹)</th>
            <th className="p-2.5 text-center">GST %</th>
            {isIntra ? (
              <>
                <th className="p-2.5 text-right">CGST (₹)</th>
                <th className="p-2.5 text-right">SGST (₹)</th>
              </>
            ) : (
              <th className="p-2.5 text-right">IGST (₹)</th>
            )}
            <th className="p-2.5 text-right">Amount (₹)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 text-slate-800">
          {totals.items.map((item, index) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
              <td className="p-2.5 text-center text-slate-500 font-mono">{index + 1}</td>
              <td className="p-2.5 font-medium text-slate-900">
                {item.name}
                {item.discountPercent > 0 && (
                  <span className="block text-[10px] text-emerald-600">({item.discountPercent}% Disc applied)</span>
                )}
              </td>
              <td className="p-2.5 text-center font-mono text-slate-600">{item.hsnCode || '-'}</td>
              <td className="p-2.5 text-right font-medium">{item.quantity} {item.unit || 'Pcs'}</td>
              <td className="p-2.5 text-right font-mono">{formatIndianNumber(item.unitPrice)}</td>
              <td className="p-2.5 text-right font-mono">{formatIndianNumber(item.taxableAmount)}</td>
              <td className="p-2.5 text-center font-mono">{item.gstRate}%</td>
              {isIntra ? (
                <>
                  <td className="p-2.5 text-right font-mono text-slate-600">{formatIndianNumber(item.cgstAmount)}</td>
                  <td className="p-2.5 text-right font-mono text-slate-600">{formatIndianNumber(item.sgstAmount)}</td>
                </>
              ) : (
                <td className="p-2.5 text-right font-mono text-slate-600">{formatIndianNumber(item.igstAmount)}</td>
              )}
              <td className="p-2.5 text-right font-mono font-bold text-slate-900">{formatIndianNumber(item.totalAmount)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary Section */}
      <div className="grid grid-cols-12 gap-6 mb-6">
        <div className="col-span-7 space-y-4">
          <div className="bg-sky-50/50 p-3.5 rounded border border-sky-100">
            <span className="text-xs font-bold text-sky-900 uppercase block mb-1">Total Amount in Words</span>
            <p className="font-semibold text-slate-800 italic">{totals.amountInWords}</p>
          </div>

          {/* Bank Details & UPI QR */}
          <div className="grid grid-cols-2 gap-3 border border-slate-200 rounded p-3 bg-slate-50">
            <div>
              <h4 className="font-bold text-xs text-slate-800 border-b pb-1 mb-1">Bank Payment Details</h4>
              <p><span className="font-semibold">Bank:</span> {company.bankName}</p>
              <p><span className="font-semibold">A/C No:</span> <span className="font-mono font-bold">{company.accountNo}</span></p>
              <p><span className="font-semibold">IFSC Code:</span> <span className="font-mono">{company.ifsc}</span></p>
              <p><span className="font-semibold">Branch:</span> {company.branch}</p>
            </div>

            {company.upiId && (
              <div className="flex flex-col items-center justify-center text-center pl-2 border-l border-slate-200">
                <span className="text-[10px] font-bold text-slate-700 uppercase mb-1">Scan & Pay via UPI</span>
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=${encodeURIComponent(`upi://pay?pa=${company.upiId}&pn=${encodeURIComponent(company.name)}&am=${totals.grandTotal}&cu=INR`)}`}
                  alt="UPI QR Code"
                  className="w-16 h-16 rounded border bg-white p-1"
                />
                <span className="font-mono text-[9px] text-slate-600 mt-1">{company.upiId}</span>
              </div>
            )}
          </div>
        </div>

        {/* Tax & Grand Total Breakdown */}
        <div className="col-span-5 bg-slate-50 p-4 rounded border border-slate-200 space-y-2 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal Taxable Amount:</span>
            <span className="font-mono font-semibold">₹{formatIndianNumber(totals.subtotalTaxable)}</span>
          </div>
          {isIntra ? (
            <>
              <div className="flex justify-between text-slate-600">
                <span>Central Tax (CGST Total):</span>
                <span className="font-mono">₹{formatIndianNumber(totals.totalCGST)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>State Tax (SGST Total):</span>
                <span className="font-mono">₹{formatIndianNumber(totals.totalSGST)}</span>
              </div>
            </>
          ) : (
            <div className="flex justify-between text-slate-600">
              <span>Integrated Tax (IGST Total):</span>
              <span className="font-mono">₹{formatIndianNumber(totals.totalIGST)}</span>
            </div>
          )}

          {totals.extraCharges > 0 && (
            <div className="flex justify-between text-slate-600">
              <span>Delivery / Extra Charges:</span>
              <span className="font-mono">₹{formatIndianNumber(totals.extraCharges)}</span>
            </div>
          )}

          {totals.roundOffAmount !== 0 && (
            <div className="flex justify-between text-slate-500 text-[11px]">
              <span>Round Off:</span>
              <span className="font-mono">{totals.roundOffAmount > 0 ? '+' : ''}{formatIndianNumber(totals.roundOffAmount)}</span>
            </div>
          )}

          <div className="border-t-2 border-sky-700 pt-2 mt-2 flex justify-between items-center text-sm">
            <span className="font-extrabold text-sky-900 uppercase">Grand Total:</span>
            <span className="font-mono font-extrabold text-base text-sky-900">₹{formatIndianNumber(totals.grandTotal)}</span>
          </div>
        </div>
      </div>

      {/* Footer & Signature */}
      <div className="border-t border-slate-200 pt-4 flex justify-between items-end">
        <div className="max-w-md text-slate-500 text-[10px] space-y-1">
          <p className="font-bold text-slate-700 uppercase">Terms & Conditions:</p>
          <p className="whitespace-pre-line leading-relaxed">{company.termsAndConditions}</p>
        </div>

        <div className="text-center w-48 border-t border-slate-300 pt-2">
          {company.signatureUrl ? (
            <img src={company.signatureUrl} alt="Authorized Stamp" className="h-12 mx-auto mb-1 object-contain" />
          ) : (
            <div className="h-12"></div>
          )}
          <p className="font-bold text-slate-900 text-xs uppercase">For {company.name}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Authorized Signatory</p>
        </div>
      </div>
    </div>
  );
}
