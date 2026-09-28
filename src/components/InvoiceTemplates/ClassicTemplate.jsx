import React from 'react';
import { calculateInvoiceTotals, formatIndianNumber } from '../../utils/gstCalculations';

export default function ClassicTemplate({ invoice, company }) {
  const totals = calculateInvoiceTotals(
    invoice.items || [],
    company.stateCode,
    invoice.partyStateCode,
    invoice.extraCharges || 0,
    invoice.roundOff !== false
  );

  const isIntra = company.stateCode === invoice.partyStateCode;

  return (
    <div id="invoice-print-area" className="w-full bg-white text-black p-6 shadow-2xl border-2 border-black print:shadow-none print:p-2 text-xs font-serif">
      {/* Top Banner */}
      <div className="text-center border-b-2 border-black pb-2 mb-2">
        <h1 className="text-xl font-bold uppercase tracking-wider">{invoice.docType || 'TAX INVOICE'}</h1>
        <p className="text-[10px] italic">(Issued under Rule 46 of Central Goods and Services Tax Rules, 2017)</p>
      </div>

      {/* Header Grid */}
      <div className="grid grid-cols-2 border-b-2 border-black divide-x-2 divide-black mb-0">
        <div className="p-3">
          <h2 className="font-bold text-base uppercase">{company.name}</h2>
          <p>{company.address}, {company.city} - {company.pincode}</p>
          <p>State: {company.stateName} (Code: {company.stateCode})</p>
          <p><strong>GSTIN:</strong> {company.gstin}</p>
          <p>Email: {company.email} | Phone: {company.phone}</p>
        </div>

        <div className="p-3 space-y-1">
          <p><strong>Invoice No:</strong> {invoice.invoiceNumber}</p>
          <p><strong>Invoice Date:</strong> {invoice.invoiceDate}</p>
          <p><strong>State of Supply:</strong> {invoice.placeOfSupply || invoice.partyStateName}</p>
          {invoice.ewayBillNo && <p><strong>E-Way Bill:</strong> {invoice.ewayBillNo}</p>}
          {invoice.vehicleNo && <p><strong>Vehicle No:</strong> {invoice.vehicleNo}</p>}
        </div>
      </div>

      {/* Buyer Info */}
      <div className="border-b-2 border-black p-3 bg-gray-50">
        <h3 className="font-bold uppercase mb-1">Details of Receiver / Billed To:</h3>
        <p className="font-bold text-sm">{invoice.partyName}</p>
        <p>{invoice.partyAddress}</p>
        <p>State: {invoice.partyStateName} (Code: {invoice.partyStateCode})</p>
        <p><strong>GSTIN / UIN:</strong> {invoice.partyGstin || 'Unregistered'}</p>
      </div>

      {/* Table */}
      <table className="w-full border-collapse border-b-2 border-black text-center">
        <thead>
          <tr className="bg-gray-200 border-b-2 border-black font-bold uppercase text-[10px]">
            <th className="border-r border-black p-1">S.N.</th>
            <th className="border-r border-black p-1 text-left">Description of Goods / Services</th>
            <th className="border-r border-black p-1">HSN/SAC</th>
            <th className="border-r border-black p-1">Qty</th>
            <th className="border-r border-black p-1">Rate</th>
            <th className="border-r border-black p-1">Taxable Val</th>
            {isIntra ? (
              <>
                <th className="border-r border-black p-1">CGST %</th>
                <th className="border-r border-black p-1">CGST Amt</th>
                <th className="border-r border-black p-1">SGST %</th>
                <th className="border-r border-black p-1">SGST Amt</th>
              </>
            ) : (
              <>
                <th className="border-r border-black p-1">IGST %</th>
                <th className="border-r border-black p-1">IGST Amt</th>
              </>
            )}
            <th className="p-1">Total (₹)</th>
          </tr>
        </thead>
        <tbody>
          {totals.items.map((item, idx) => (
            <tr key={idx} className="border-b border-gray-300 font-sans text-xs">
              <td className="border-r border-black p-1.5">{idx + 1}</td>
              <td className="border-r border-black p-1.5 text-left font-semibold">{item.name}</td>
              <td className="border-r border-black p-1.5">{item.hsnCode || '-'}</td>
              <td className="border-r border-black p-1.5">{item.quantity} {item.unit}</td>
              <td className="border-r border-black p-1.5">{formatIndianNumber(item.unitPrice)}</td>
              <td className="border-r border-black p-1.5">{formatIndianNumber(item.taxableAmount)}</td>
              {isIntra ? (
                <>
                  <td className="border-r border-black p-1.5">{item.cgstRate}%</td>
                  <td className="border-r border-black p-1.5">{formatIndianNumber(item.cgstAmount)}</td>
                  <td className="border-r border-black p-1.5">{item.sgstRate}%</td>
                  <td className="border-r border-black p-1.5">{formatIndianNumber(item.sgstAmount)}</td>
                </>
              ) : (
                <>
                  <td className="border-r border-black p-1.5">{item.igstRate}%</td>
                  <td className="border-r border-black p-1.5">{formatIndianNumber(item.igstAmount)}</td>
                </>
              )}
              <td className="p-1.5 font-bold">{formatIndianNumber(item.totalAmount)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals Grid */}
      <div className="grid grid-cols-12 border-b-2 border-black divide-x-2 divide-black">
        <div className="col-span-7 p-3 font-sans">
          <p className="font-bold text-xs uppercase mb-1">Invoice Amount in Words:</p>
          <p className="italic font-semibold">{totals.amountInWords}</p>
          <div className="mt-3 pt-2 border-t border-gray-300">
            <p className="font-bold uppercase text-[10px]">Bank Account Details:</p>
            <p>Bank: {company.bankName} | A/C: {company.accountNo} | IFSC: {company.ifsc}</p>
          </div>
        </div>

        <div className="col-span-5 p-3 space-y-1 font-sans text-xs">
          <div className="flex justify-between">
            <span>Total Taxable Amount:</span>
            <span>₹{formatIndianNumber(totals.subtotalTaxable)}</span>
          </div>
          {isIntra ? (
            <>
              <div className="flex justify-between">
                <span>Total CGST:</span>
                <span>₹{formatIndianNumber(totals.totalCGST)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total SGST:</span>
                <span>₹{formatIndianNumber(totals.totalSGST)}</span>
              </div>
            </>
          ) : (
            <div className="flex justify-between">
              <span>Total IGST:</span>
              <span>₹{formatIndianNumber(totals.totalIGST)}</span>
            </div>
          )}
          {totals.roundOffAmount !== 0 && (
            <div className="flex justify-between text-gray-600">
              <span>Round Off:</span>
              <span>{totals.roundOffAmount > 0 ? '+' : ''}{formatIndianNumber(totals.roundOffAmount)}</span>
            </div>
          )}
          <div className="border-t border-black pt-1 flex justify-between font-bold text-sm">
            <span>GRAND TOTAL:</span>
            <span>₹{formatIndianNumber(totals.grandTotal)}</span>
          </div>
        </div>
      </div>

      {/* Terms & Signature */}
      <div className="grid grid-cols-2 p-3 pt-4">
        <div>
          <p className="font-bold uppercase text-[10px]">Terms & Conditions:</p>
          <p className="whitespace-pre-line text-[10px] text-gray-700">{company.termsAndConditions}</p>
        </div>
        <div className="text-right pt-6">
          <p className="font-bold">For {company.name}</p>
          <div className="h-10"></div>
          <p className="text-[10px] border-t border-black inline-block pt-1 px-4">Authorized Signatory</p>
        </div>
      </div>
    </div>
  );
}
