import React from 'react';
import { calculateInvoiceTotals, formatIndianNumber } from '../../utils/gstCalculations';

export default function MinimalTemplate({ invoice, company }) {
  const totals = calculateInvoiceTotals(
    invoice?.items || [],
    company?.stateCode || '',
    invoice?.partyStateCode || '',
    invoice?.extraCharges || 0,
    invoice?.roundOff !== false
  );

  const isIntra = company?.stateCode === invoice?.partyStateCode || !invoice?.partyStateCode;

  return (
    <div id="invoice-print-area" className="w-full max-w-[800px] mx-auto bg-white text-slate-800 p-8 shadow-2xl rounded-sm print:shadow-none print:p-4 text-xs font-sans">
      {/* Header */}
      <div className="flex justify-between items-start mb-8 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <h1 className="text-3xl font-light tracking-wider text-slate-900 leading-none m-0 p-0">{invoice?.docType || 'INVOICE'}</h1>
            <div style={{ display: 'inline-block', verticalAlign: 'middle' }}>
              <span style={{ 
                display: 'inline-block', 
                lineHeight: '14px', 
                padding: '3px 10px', 
                fontSize: '10px', 
                fontWeight: '800', 
                textTransform: 'uppercase', 
                textAlign: 'center', 
                color: '#334155', 
                backgroundColor: '#f8fafc', 
                border: '1.5px solid #cbd5e1', 
                borderRadius: '4px',
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
                  boxSizing: 'border-box'
                }}>
                  {invoice.paymentStatus}
                </span>
              </div>
            )}
          </div>
          <p className="font-mono text-sm text-slate-500">#{invoice?.invoiceNumber}</p>
        </div>
        <div className="text-right">
          <h2 className="text-base font-bold text-slate-900">{company?.name}</h2>
          <p className="text-slate-500">{company?.city}, {company?.stateName}</p>
          {company?.gstin && <p className="font-mono text-xs text-sky-800 font-semibold mt-1">GSTIN: {company.gstin}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 py-4 border-b border-slate-200 mb-8">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">BILLED TO</span>
          <p className="font-bold text-sm text-slate-900">{invoice?.partyName}</p>
          <p className="text-slate-600 mt-0.5">{invoice?.partyAddress}</p>
          {invoice?.partyGstin && <p className="font-mono text-xs text-slate-700 mt-1">GSTIN: {invoice.partyGstin}</p>}
        </div>

        <div className="text-right space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">DETAILS</span>
          <p><span className="text-slate-500">Date:</span> <span className="font-semibold">{invoice?.invoiceDate}</span></p>
          <p><span className="text-slate-500">Due Date:</span> <span className="font-semibold">{invoice?.dueDate || 'On Receipt'}</span></p>
          {invoice?.partyStateName && <p><span className="text-slate-500">POS:</span> <span className="font-semibold">{invoice.partyStateName} ({invoice.partyStateCode})</span></p>}
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
          
          {/* Bank Payment Details */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-0.5 text-xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">BANK PAYMENT DETAILS</span>
            {company?.bankName && <p><span className="font-semibold text-slate-600">Bank:</span> <span className="font-bold text-slate-900">{company.bankName}</span></p>}
            {company?.accountNo && <p><span className="font-semibold text-slate-600">A/C No:</span> <span className="font-mono font-bold text-slate-900">{company.accountNo}</span></p>}
            {company?.ifsc && <p><span className="font-semibold text-slate-600">IFSC:</span> <span className="font-mono font-bold text-slate-900">{company.ifsc}</span></p>}
            {company?.branch && <p><span className="font-semibold text-slate-600">Branch:</span> <span className="text-slate-900">{company.branch}</span></p>}
            {company?.upiId && <p><span className="font-semibold text-slate-600">UPI ID:</span> <span className="font-mono font-bold text-slate-900">{company.upiId}</span></p>}
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
          {totals.extraCharges > 0 && (
            <div className="flex justify-between text-slate-600">
              <span>Extra Charges:</span>
              <span>₹{formatIndianNumber(totals.extraCharges)}</span>
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
