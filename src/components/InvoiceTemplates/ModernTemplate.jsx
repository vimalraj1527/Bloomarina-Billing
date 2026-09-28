import React from 'react';
import { calculateInvoiceTotals, formatIndianNumber } from '../../utils/gstCalculations';

export default function ModernTemplate({ invoice, company }) {
  const totals = calculateInvoiceTotals(
    invoice?.items || [],
    company?.stateCode || '',
    invoice?.partyStateCode || '',
    invoice?.extraCharges || 0,
    invoice?.roundOff !== false
  );

  const isIntra = company?.stateCode === invoice?.partyStateCode || !invoice?.partyStateCode;

  return (
    <div id="invoice-print-area" className="w-full max-w-[800px] mx-auto bg-white text-slate-900 p-6 shadow-2xl rounded-sm print:shadow-none print:p-0 text-xs font-sans" style={{ boxSizing: 'border-box' }}>
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-sky-600 pb-4 mb-4">
        <div>
          {company?.logoUrl ? (
            <img src={company.logoUrl} alt={company.name} className="h-14 object-contain mb-2" />
          ) : (
            <div className="text-2xl font-extrabold text-sky-700 uppercase tracking-wide">
              {company?.name}
            </div>
          )}
          {company?.tradeName && company.tradeName !== company.name && (
            <div className="text-sm font-semibold text-slate-700">({company.tradeName})</div>
          )}
          <div className="text-slate-600 mt-1 space-y-0.5 leading-relaxed">
            <p>{company?.address}, {company?.city} - {company?.pincode}</p>
            {company?.stateName && <p><span className="font-semibold text-slate-800">State:</span> {company.stateName} ({company.stateCode})</p>}
            <p><span className="font-semibold text-slate-800">GSTIN:</span> <span className="font-mono font-bold text-sky-800">{company?.gstin}</span>{company?.pan ? ` | PAN: ${company.pan}` : ''}</p>
            <p><span className="font-semibold text-slate-800">Email:</span> {company?.email} | <span className="font-semibold text-slate-800">Phone:</span> {company?.phone}</p>
          </div>
        </div>

        <div className="text-right space-y-1.5">
          <div className="flex flex-col items-end space-y-1.5">
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '26px',
              padding: '0 14px',
              fontSize: '13px',
              fontWeight: '800',
              textTransform: 'uppercase',
              color: '#ffffff',
              backgroundColor: '#0369a1',
              borderRadius: '4px',
              boxSizing: 'border-box',
              lineHeight: '1'
            }}>
              {invoice?.docType || 'TAX INVOICE'}
            </div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '22px',
              padding: '0 10px',
              fontSize: '10px',
              fontWeight: '800',
              textTransform: 'uppercase',
              color: '#0c4a6e',
              backgroundColor: '#f0f9ff',
              border: '1.5px solid #7dd3fc',
              borderRadius: '4px',
              boxSizing: 'border-box',
              lineHeight: '1'
            }}>
              ORIGINAL FOR RECIPIENT
            </div>
            {invoice?.paymentStatus && (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '22px',
                padding: '0 10px',
                fontSize: '10px',
                fontWeight: '800',
                textTransform: 'uppercase',
                color: invoice.paymentStatus === 'Paid' ? '#065f46' : '#92400e',
                backgroundColor: invoice.paymentStatus === 'Paid' ? '#d1fae5' : '#fef3c7',
                border: invoice.paymentStatus === 'Paid' ? '1.5px solid #059669' : '1.5px solid #d97706',
                borderRadius: '4px',
                boxSizing: 'border-box',
                lineHeight: '1'
              }}>
                {invoice.paymentStatus}
              </div>
            )}
          </div>
          <div className="space-y-0.5 text-slate-700 pt-1">
            <p><span className="font-semibold">Invoice No:</span> <span className="font-mono font-bold text-slate-900">{invoice?.invoiceNumber}</span></p>
            <p><span className="font-semibold">Date:</span> {invoice?.invoiceDate}</p>
            {invoice?.dueDate && <p><span className="font-semibold">Due Date:</span> {invoice.dueDate}</p>}
            <p><span className="font-semibold">Place of Supply:</span> {invoice?.placeOfSupply || invoice?.partyStateName}</p>
          </div>
        </div>
      </div>

      {/* Bill To & Ship To Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-sky-50/60 p-3 rounded-lg border border-sky-100 space-y-0.5">
          <h3 className="text-xs font-bold text-sky-900 uppercase tracking-wider mb-1 border-b border-sky-200 pb-0.5">
            Billed To (Buyer)
          </h3>
          <p className="font-bold text-sm text-slate-900">{invoice?.partyName}</p>
          <div className="text-slate-600 mt-0.5 space-y-0.5 leading-relaxed">
            <p>{invoice?.partyAddress}</p>
            {invoice?.partyStateName && <p><span className="font-semibold text-slate-800">State:</span> {invoice.partyStateName} (Code: {invoice.partyStateCode})</p>}
            <p><span className="font-semibold text-slate-800">GSTIN / UIN:</span> <span className="font-mono font-bold text-sky-800">{invoice?.partyGstin || 'URP (Unregistered)'}</span></p>
          </div>
        </div>

        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-0.5">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1 border-b border-slate-200 pb-0.5">
            Transport & Consignee Details
          </h3>
          <div className="text-slate-600 space-y-0.5">
            <p><span className="font-semibold text-slate-800">Shipped To:</span> {invoice?.shippingName || invoice?.partyName}</p>
            {invoice?.ewayBillNo ? (
              <>
                <p><span className="font-semibold text-slate-800">E-Way Bill No:</span> <span className="font-mono font-bold">{invoice.ewayBillNo}</span></p>
                <p><span className="font-semibold text-slate-800">Vehicle No:</span> {invoice.vehicleNo || 'N/A'}</p>
              </>
            ) : (
              <p className="italic text-slate-500 text-[11px]">No transport/E-Way bill info attached</p>
            )}
          </div>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full border-collapse mb-4 rounded-lg overflow-hidden border border-slate-200 text-xs">
        <thead>
          <tr className="bg-sky-800 text-white text-[11px] uppercase tracking-wider font-semibold">
            <th className="p-2 text-center w-10">#</th>
            <th className="p-2 text-left">Item Description</th>
            <th className="p-2 text-center">HSN/SAC</th>
            <th className="p-2 text-right">Qty</th>
            <th className="p-2 text-right">Rate (₹)</th>
            <th className="p-2 text-right">Taxable (₹)</th>
            <th className="p-2 text-center">GST %</th>
            {isIntra ? (
              <>
                <th className="p-2 text-right">CGST (₹)</th>
                <th className="p-2 text-right">SGST (₹)</th>
              </>
            ) : (
              <th className="p-2 text-right">IGST (₹)</th>
            )}
            <th className="p-2 text-right">Amount (₹)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 text-slate-800">
          {totals.items.map((item, index) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
              <td className="p-2 text-center text-slate-500 font-mono">{index + 1}</td>
              <td className="p-2 font-medium text-slate-900">
                {item.name}
              </td>
              <td className="p-2 text-center font-mono text-slate-600">{item.hsnCode || '-'}</td>
              <td className="p-2 text-right font-medium">{item.quantity} {item.unit || 'Pcs'}</td>
              <td className="p-2 text-right font-mono">{formatIndianNumber(item.unitPrice)}</td>
              <td className="p-2 text-right font-mono">{formatIndianNumber(item.taxableAmount)}</td>
              <td className="p-2 text-center font-mono">{item.gstRate}%</td>
              {isIntra ? (
                <>
                  <td className="p-2 text-right font-mono text-slate-600">{formatIndianNumber(item.cgstAmount)}</td>
                  <td className="p-2 text-right font-mono text-slate-600">{formatIndianNumber(item.sgstAmount)}</td>
                </>
              ) : (
                <td className="p-2 text-right font-mono text-slate-600">{formatIndianNumber(item.igstAmount)}</td>
              )}
              <td className="p-2 text-right font-mono font-bold text-slate-900">{formatIndianNumber(item.totalAmount)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary Section */}
      <div className="grid grid-cols-12 gap-4 mb-4">
        <div className="col-span-7 space-y-3">
          <div className="bg-sky-50/50 p-2.5 rounded-lg border border-sky-100">
            <span className="text-[11px] font-bold text-sky-900 uppercase block mb-0.5">Total Amount in Words</span>
            <p className="font-semibold text-slate-800 italic">{totals.amountInWords}</p>
          </div>

          {/* Bank Details & UPI QR */}
          <div className="grid grid-cols-2 gap-2.5 border border-slate-200 rounded-lg p-2.5 bg-slate-50">
            <div className="space-y-0.5 text-xs">
              <h4 className="font-bold text-[11px] text-slate-900 border-b border-slate-200 pb-0.5 mb-1 uppercase">
                Bank Payment Details
              </h4>
              {company?.bankName && <p><span className="font-semibold text-slate-600">Bank:</span> <span className="font-bold text-slate-900">{company.bankName}</span></p>}
              {company?.accountNo && <p><span className="font-semibold text-slate-600">A/C No:</span> <span className="font-mono font-bold text-slate-900">{company.accountNo}</span></p>}
              {company?.ifsc && <p><span className="font-semibold text-slate-600">IFSC:</span> <span className="font-mono font-bold text-slate-900">{company.ifsc}</span></p>}
              {company?.branch && <p><span className="font-semibold text-slate-600">Branch:</span> <span className="text-slate-900">{company.branch}</span></p>}
              {company?.upiId && <p><span className="font-semibold text-slate-600">UPI ID:</span> <span className="font-mono font-bold text-sky-800">{company.upiId}</span></p>}
            </div>

            {company?.upiId && (
              <div className="flex flex-col items-center justify-center text-center pl-2 border-l border-slate-200">
                <span className="text-[10px] font-bold text-slate-700 uppercase mb-0.5">Scan & Pay via UPI</span>
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(`upi://pay?pa=${company.upiId}&pn=${encodeURIComponent(company.name || 'Bloomarina')}&am=${totals.grandTotal}&cu=INR`)}`}
                  alt="UPI QR Code"
                  className="w-14 h-14 rounded border bg-white p-0.5 object-contain"
                />
                <span className="font-mono text-[9px] text-slate-600 font-semibold mt-0.5">{company.upiId}</span>
              </div>
            )}
          </div>
        </div>

        {/* Tax & Grand Total Breakdown */}
        <div className="col-span-5 bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5 text-xs">
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

          <div className="border-t-2 border-sky-700 pt-1.5 mt-1.5 flex justify-between items-center text-xs">
            <span className="font-extrabold text-sky-900 uppercase">Grand Total:</span>
            <span className="font-mono font-extrabold text-sm text-sky-900">₹{formatIndianNumber(totals.grandTotal)}</span>
          </div>
        </div>
      </div>

      {/* Footer & Signature */}
      <div className="border-t border-slate-200 pt-2 flex justify-between items-end">
        <div className="max-w-md text-slate-500 text-[10px] space-y-0.5">
          {company?.termsAndConditions && (
            <>
              <p className="font-bold text-slate-700 uppercase">Terms & Conditions:</p>
              <p className="whitespace-pre-line leading-relaxed">{company.termsAndConditions}</p>
            </>
          )}
        </div>

        <div className="text-center w-44 border-t border-slate-300 pt-1">
          {company?.signatureUrl ? (
            <img src={company.signatureUrl} alt="Authorized Stamp" className="h-8 mx-auto mb-0.5 object-contain" />
          ) : (
            <div className="h-6"></div>
          )}
          <p className="font-bold text-slate-900 text-xs uppercase">For {company?.name}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Authorized Signatory</p>
        </div>
      </div>
    </div>
  );
}
