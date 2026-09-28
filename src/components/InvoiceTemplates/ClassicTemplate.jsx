import React from 'react';
import { calculateInvoiceTotals, formatIndianNumber } from '../../utils/gstCalculations';

export default function ClassicTemplate({ invoice, company }) {
  const totals = calculateInvoiceTotals(
    invoice?.items || [],
    company?.stateCode || '',
    invoice?.partyStateCode || '',
    invoice?.extraCharges || 0,
    invoice?.roundOff !== false
  );

  const isIntra = company?.stateCode === invoice?.partyStateCode || !invoice?.partyStateCode;

  return (
    <div id="invoice-print-area" className="w-full max-w-[800px] mx-auto bg-white text-black p-6 shadow-2xl border-2 border-black print:shadow-none print:p-2 text-xs font-serif">
      {/* Top Banner */}
      <div className="text-center border-b-2 border-black pb-2 mb-2">
        <div className="flex items-center justify-center space-x-3 mb-1">
          <h1 className="text-xl font-bold uppercase tracking-wider leading-none m-0 p-0">{invoice?.docType || 'TAX INVOICE'}</h1>
          <div style={{ display: 'inline-block', verticalAlign: 'middle' }}>
            <span style={{ 
              display: 'inline-block', 
              lineHeight: '14px', 
              padding: '3px 10px', 
              fontSize: '10px', 
              fontWeight: '800', 
              textTransform: 'uppercase', 
              textAlign: 'center', 
              color: '#000000', 
              backgroundColor: '#f8fafc', 
              border: '1.5px solid #000000', 
              borderRadius: '4px',
              fontFamily: 'sans-serif',
              boxSizing: 'border-box'
            }}>
              ORIGINAL FOR RECIPIENT
            </span>
          </div>
          {invoice?.paymentStatus && (
            <div style={{ display: 'inline-block', verticalAlign: 'middle' }}>
              <span style={{ 
                display: 'inline-block', 
                lineHeight: '14px', 
                padding: '3px 10px', 
                fontSize: '10px', 
                fontWeight: '800', 
                textTransform: 'uppercase', 
                textAlign: 'center', 
                color: invoice.paymentStatus === 'Paid' ? '#065f46' : '#92400e', 
                backgroundColor: invoice.paymentStatus === 'Paid' ? '#d1fae5' : '#fef3c7', 
                border: invoice.paymentStatus === 'Paid' ? '1.5px solid #059669' : '1.5px solid #d97706', 
                borderRadius: '4px',
                fontFamily: 'sans-serif',
                boxSizing: 'border-box'
              }}>
                {invoice.paymentStatus}
              </span>
            </div>
          )}
        </div>
        <p className="text-[10px] italic font-sans text-slate-700">(Issued under Rule 46 of Central Goods and Services Tax Rules, 2017)</p>
      </div>

      {/* Header Grid */}
      <div className="grid grid-cols-2 border-b-2 border-black divide-x-2 divide-black mb-0">
        <div className="p-3 space-y-0.5 font-sans text-xs">
          <h2 className="font-bold text-base uppercase text-black font-serif">{company?.name}</h2>
          <p>{company?.address}, {company?.city} - {company?.pincode}</p>
          {company?.stateName && <p>State: {company.stateName} (Code: {company.stateCode})</p>}
          {company?.gstin && <p><strong>GSTIN:</strong> <span className="font-mono">{company.gstin}</span></p>}
          <p>Email: {company?.email} | Phone: {company?.phone}</p>
        </div>

        <div className="p-3 space-y-1 font-sans text-xs">
          <p><strong>Invoice No:</strong> <span className="font-mono font-bold">{invoice?.invoiceNumber}</span></p>
          <p><strong>Invoice Date:</strong> {invoice?.invoiceDate}</p>
          {invoice?.dueDate && <p><strong>Due Date:</strong> {invoice.dueDate}</p>}
          <p><strong>Place of Supply:</strong> {invoice?.placeOfSupply || invoice?.partyStateName}</p>
          {invoice?.ewayBillNo && <p><strong>E-Way Bill:</strong> {invoice.ewayBillNo}</p>}
          {invoice?.vehicleNo && <p><strong>Vehicle No:</strong> {invoice.vehicleNo}</p>}
        </div>
      </div>

      {/* Buyer Info */}
      <div className="border-b-2 border-black p-3 bg-gray-50 font-sans text-xs">
        <h3 className="font-bold uppercase text-[10px] mb-1 tracking-wider text-slate-700">Details of Receiver / Billed To:</h3>
        <p className="font-bold text-sm text-black">{invoice?.partyName}</p>
        <p className="text-slate-800">{invoice?.partyAddress}</p>
        {invoice?.partyStateName && <p className="text-slate-800">State: {invoice.partyStateName} (Code: {invoice.partyStateCode})</p>}
        <p><strong>GSTIN / UIN:</strong> <span className="font-mono font-bold">{invoice?.partyGstin || 'Unregistered'}</span></p>
      </div>

      {/* Table */}
      <table className="w-full border-collapse border-b-2 border-black text-center font-sans text-xs">
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
            <tr key={idx} className="border-b border-gray-300 text-xs">
              <td className="border-r border-black p-1.5">{idx + 1}</td>
              <td className="border-r border-black p-1.5 text-left font-semibold">{item.name}</td>
              <td className="border-r border-black p-1.5 font-mono">{item.hsnCode || '-'}</td>
              <td className="border-r border-black p-1.5">{item.quantity} {item.unit || ''}</td>
              <td className="border-r border-black p-1.5 font-mono">{formatIndianNumber(item.unitPrice)}</td>
              <td className="border-r border-black p-1.5 font-mono">{formatIndianNumber(item.taxableAmount)}</td>
              {isIntra ? (
                <>
                  <td className="border-r border-black p-1.5">{item.cgstRate}%</td>
                  <td className="border-r border-black p-1.5 font-mono">{formatIndianNumber(item.cgstAmount)}</td>
                  <td className="border-r border-black p-1.5">{item.sgstRate}%</td>
                  <td className="border-r border-black p-1.5 font-mono">{formatIndianNumber(item.sgstAmount)}</td>
                </>
              ) : (
                <>
                  <td className="border-r border-black p-1.5">{item.igstRate}%</td>
                  <td className="border-r border-black p-1.5 font-mono">{formatIndianNumber(item.igstAmount)}</td>
                </>
              )}
              <td className="p-1.5 font-bold font-mono">{formatIndianNumber(item.totalAmount)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals & Bank Details Grid */}
      <div className="grid grid-cols-12 border-b-2 border-black divide-x-2 divide-black">
        <div className="col-span-7 p-3 font-sans space-y-3">
          <div>
            <p className="font-bold text-[10px] uppercase mb-0.5 text-slate-700">Invoice Amount in Words:</p>
            <p className="italic font-semibold text-xs text-black">{totals.amountInWords}</p>
          </div>

          {/* Detailed Bank Details Box */}
          <div className="pt-2 border-t border-gray-300 space-y-1">
            <p className="font-bold uppercase text-[10px] text-black border-b border-gray-200 pb-0.5 mb-1">
              Bank Payment Details
            </p>
            {company?.bankName && <p className="text-[11px]"><span className="font-semibold text-slate-700">Bank Name:</span> <span className="font-bold">{company.bankName}</span></p>}
            {company?.accountNo && <p className="text-[11px]"><span className="font-semibold text-slate-700">Account No:</span> <span className="font-mono font-bold">{company.accountNo}</span></p>}
            {company?.ifsc && <p className="text-[11px]"><span className="font-semibold text-slate-700">IFSC Code:</span> <span className="font-mono font-bold uppercase">{company.ifsc}</span></p>}
            {company?.branch && <p className="text-[11px]"><span className="font-semibold text-slate-700">Branch:</span> <span>{company.branch}</span></p>}
            {company?.upiId && <p className="text-[11px]"><span className="font-semibold text-slate-700">UPI ID:</span> <span className="font-mono font-bold text-black">{company.upiId}</span></p>}
          </div>
        </div>

        <div className="col-span-5 p-3 space-y-1 font-sans text-xs">
          <div className="flex justify-between">
            <span>Total Taxable Amount:</span>
            <span className="font-mono">₹{formatIndianNumber(totals.subtotalTaxable)}</span>
          </div>
          {isIntra ? (
            <>
              <div className="flex justify-between">
                <span>Total CGST:</span>
                <span className="font-mono">₹{formatIndianNumber(totals.totalCGST)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total SGST:</span>
                <span className="font-mono">₹{formatIndianNumber(totals.totalSGST)}</span>
              </div>
            </>
          ) : (
            <div className="flex justify-between">
              <span>Total IGST:</span>
              <span className="font-mono">₹{formatIndianNumber(totals.totalIGST)}</span>
            </div>
          )}
          {totals.extraCharges > 0 && (
            <div className="flex justify-between">
              <span>Delivery / Extra Charges:</span>
              <span className="font-mono">₹{formatIndianNumber(totals.extraCharges)}</span>
            </div>
          )}
          {totals.roundOffAmount !== 0 && (
            <div className="flex justify-between text-gray-600">
              <span>Round Off:</span>
              <span className="font-mono">{totals.roundOffAmount > 0 ? '+' : ''}{formatIndianNumber(totals.roundOffAmount)}</span>
            </div>
          )}
          <div className="border-t border-black pt-1 flex justify-between font-bold text-sm">
            <span>GRAND TOTAL:</span>
            <span className="font-mono">₹{formatIndianNumber(totals.grandTotal)}</span>
          </div>
        </div>
      </div>

      {/* Terms & Signature */}
      <div className="grid grid-cols-2 p-3 pt-4 font-sans">
        <div>
          {company?.termsAndConditions && (
            <>
              <p className="font-bold uppercase text-[10px] text-slate-700">Terms & Conditions:</p>
              <p className="whitespace-pre-line text-[10px] text-gray-700">{company.termsAndConditions}</p>
            </>
          )}
        </div>
        <div className="text-right pt-4">
          <p className="font-bold text-xs">For {company?.name}</p>
          <div className="h-10"></div>
          <p className="text-[10px] border-t border-black inline-block pt-1 px-4">Authorized Signatory</p>
        </div>
      </div>
    </div>
  );
}
