import React from 'react';
import { calculateInvoiceTotals, formatIndianNumber } from '../../utils/gstCalculations';

export default function SairamExactTemplate({ invoice, company }) {
  const totals = calculateInvoiceTotals(
    invoice?.items || [],
    company?.stateCode || '',
    invoice?.partyStateCode || '',
    invoice?.extraCharges || 0,
    invoice?.roundOff !== false
  );

  const isIntra = company?.stateCode === invoice?.partyStateCode || !invoice?.partyStateCode;

  // Calculate sum of item quantities for SUBTOTAL row
  const totalQty = (invoice?.items || []).reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);

  // Payment received vs balance
  const receivedAmount = invoice?.receivedAmount !== undefined ? Number(invoice.receivedAmount) : totals.grandTotal;
  const balanceAmount = Math.max(0, totals.grandTotal - receivedAmount);

  // Formatted Company Address
  const companyAddressFormatted = [
    company?.address,
    company?.city,
    company?.stateName ? `${company.stateName}${company?.pincode ? ` - ${company.pincode}` : ''}` : company?.pincode
  ].filter(Boolean).join(', ');

  return (
    <div 
      id="invoice-print-area" 
      className="w-full max-w-[800px] mx-auto bg-white text-slate-900 p-6 shadow-2xl border border-slate-300 font-sans print:shadow-none print:p-0 print:border-none print:max-w-full text-[12px] leading-tight select-none"
      style={{ boxSizing: 'border-box' }}
    >
      {/* 1. Header Section */}
      <div className="pb-2">
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center space-x-3">
            <h2 className="font-black text-lg tracking-wider text-black uppercase m-0 p-0 leading-none">
              {invoice?.docType || 'TAX INVOICE'}
            </h2>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                padding: '4px 10px', 
                fontSize: '9.5px', 
                fontWeight: '800', 
                letterSpacing: '0.5px',
                textTransform: 'uppercase', 
                textAlign: 'center', 
                color: '#0f172a', 
                backgroundColor: '#f1f5f9', 
                border: '1.5px solid #475569', 
                borderRadius: '4px',
                lineHeight: '1',
                boxSizing: 'border-box'
              }}>
                ORIGINAL FOR RECIPIENT
              </span>
            </div>
          </div>
          {invoice?.paymentStatus && (
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                padding: '4px 10px', 
                fontSize: '9.5px', 
                fontWeight: '800', 
                letterSpacing: '0.5px',
                textTransform: 'uppercase', 
                textAlign: 'center', 
                color: invoice.paymentStatus === 'Paid' ? '#065f46' : '#92400e', 
                backgroundColor: invoice.paymentStatus === 'Paid' ? '#d1fae5' : '#fef3c7', 
                border: invoice.paymentStatus === 'Paid' ? '1.5px solid #059669' : '1.5px solid #d97706', 
                borderRadius: '4px',
                lineHeight: '1',
                boxSizing: 'border-box'
              }}>
                {invoice.paymentStatus}
              </span>
            </div>
          )}
        </div>

        <h1 className="font-heading font-black text-2xl sm:text-3xl text-black tracking-tight pt-0.5 uppercase">
          {company?.name || ''}
        </h1>

        {companyAddressFormatted && (
          <p className="text-slate-700 text-xs font-medium pt-0.5">
            {companyAddressFormatted}
          </p>
        )}

        <p className="text-slate-800 text-xs font-semibold pt-0.5">
          {company?.phone && (
            <>
              <span>Mobile: </span><span className="font-bold">{company.phone}</span>
            </>
          )}
          {company?.gstin && (
            <>
              <span className={company?.phone ? "ml-6" : ""}>GSTIN: </span>
              <span className="font-bold uppercase font-mono">{company.gstin}</span>
            </>
          )}
        </p>

        {company?.email && (
          <p className="text-slate-700 text-xs font-medium">
            <span>Email: </span><span>{company.email}</span>
          </p>
        )}
      </div>

      <hr className="border-t-2 border-black my-1.5" />

      {/* 2. Invoice Meta Box */}
      <div className="border border-slate-400 rounded-lg p-2 bg-slate-50 flex justify-between items-center my-2 text-xs font-medium">
        <div>
          <span className="text-slate-600">Invoice No.: </span>
          <span className="font-bold font-mono text-black">{invoice?.invoiceNumber || ''}</span>
        </div>
        <div>
          <span className="text-slate-600">Invoice Date: </span>
          <span className="font-bold text-black">{invoice?.invoiceDate || ''}</span>
        </div>
        {invoice?.dueDate && (
          <div>
            <span className="text-slate-600">Due Date: </span>
            <span className="font-bold text-black">{invoice.dueDate}</span>
          </div>
        )}
      </div>

      {/* 3. Bill To & Ship To Boxes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 my-2">
        {/* BILL TO */}
        <div className="border border-slate-400 rounded-lg p-2.5 space-y-0.5 min-h-[105px] bg-white">
          <h3 className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider mb-0.5 border-b border-slate-200 pb-0.5">
            BILL TO (RECEIVER)
          </h3>
          <h4 className="font-extrabold text-sm text-black">
            {invoice?.partyName || ''}
          </h4>
          <p className="text-slate-700 text-xs leading-snug whitespace-pre-line">
            {invoice?.partyAddress || ''}
          </p>
          {invoice?.partyGstin && (
            <p className="text-xs pt-0.5">
              <span className="font-bold text-slate-700">GSTIN: </span>
              <span className="font-bold font-mono text-black uppercase">{invoice.partyGstin}</span>
            </p>
          )}
          {invoice?.partyStateName && (
            <p className="text-[11px] text-slate-600">
              <span>State: </span><span className="font-semibold text-black">{invoice.partyStateName} ({invoice.partyStateCode})</span>
            </p>
          )}
        </div>

        {/* SHIP TO */}
        <div className="border border-slate-400 rounded-lg p-2.5 space-y-0.5 min-h-[105px] bg-white">
          <h3 className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider mb-0.5 border-b border-slate-200 pb-0.5">
            SHIP TO (CONSIGNEE)
          </h3>
          <h4 className="font-extrabold text-sm text-black">
            {invoice?.shippingName || invoice?.partyName || ''}
          </h4>
          <p className="text-slate-700 text-xs leading-snug whitespace-pre-line">
            {invoice?.shippingAddress || invoice?.partyAddress || ''}
          </p>
          {invoice?.placeOfSupply && (
            <p className="text-[11px] text-slate-600 pt-0.5">
              <span>Place of Supply: </span><span className="font-semibold text-black">{invoice.placeOfSupply}</span>
            </p>
          )}
        </div>
      </div>

      {/* 4. Items Table */}
      <div className="my-2.5 border border-slate-400 rounded-lg overflow-hidden">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="bg-slate-100 text-black border-b border-slate-400 font-extrabold text-[11px] uppercase">
              <th className="p-2 border-r border-slate-400 w-[35%]">ITEMS</th>
              <th className="p-2 border-r border-slate-400 text-center w-[15%]">HSN</th>
              <th className="p-2 border-r border-slate-400 text-center w-[12%]">QTY.</th>
              <th className="p-2 border-r border-slate-400 text-right w-[12%]">RATE (₹)</th>
              <th className="p-2 border-r border-slate-400 text-right w-[13%]">TAX (₹)</th>
              <th className="p-2 text-right w-[13%]">AMOUNT (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-300">
            {totals.items.map((item, idx) => {
              const qtyDisplay = `${item.quantity} ${item.unit || ''}`;
              const gstPctDisplay = item.gstRate ? `(${item.gstRate}%)` : '';

              return (
                <tr key={idx} className="align-top">
                  <td className="p-2 border-r border-slate-400 font-semibold text-black uppercase">
                    {item.name}
                  </td>
                  <td className="p-2 border-r border-slate-400 text-center font-mono text-slate-800">
                    {item.hsnCode || '-'}
                  </td>
                  <td className="p-2 border-r border-slate-400 text-center font-medium">
                    {qtyDisplay}
                  </td>
                  <td className="p-2 border-r border-slate-400 text-right font-mono text-slate-800">
                    {formatIndianNumber(item.unitPrice)}
                  </td>
                  <td className="p-2 border-r border-slate-400 text-right font-mono">
                    <div className="font-semibold text-black">{formatIndianNumber(item.gstAmount)}</div>
                    {gstPctDisplay && (
                      <div className="text-[10px] text-slate-500 font-normal">{gstPctDisplay}</div>
                    )}
                  </td>
                  <td className="p-2 text-right font-mono font-bold text-black">
                    {formatIndianNumber(item.totalAmount)}
                  </td>
                </tr>
              );
            })}

            {/* SUBTOTAL ROW */}
            <tr className="border-t-2 border-slate-400 font-bold bg-slate-50 text-black text-xs">
              <td colSpan={2} className="p-2 border-r border-slate-400 text-left font-extrabold uppercase">
                SUBTOTAL
              </td>
              <td className="p-2 border-r border-slate-400 text-center font-extrabold">
                {totalQty}
              </td>
              <td className="p-2 border-r border-slate-400"></td>
              <td className="p-2 border-r border-slate-400"></td>
              <td className="p-2 text-right font-mono font-extrabold text-xs">
                ₹ {formatIndianNumber(totals.grandTotal)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 5. Summary Breakdown Section */}
      <div className="flex flex-col items-end my-2.5 text-xs font-medium space-y-1">
        <div className="w-full sm:w-72 space-y-1 border-b border-slate-300 pb-1.5">
          <div className="flex justify-between text-slate-700">
            <span>Taxable Amount</span>
            <span className="font-mono font-bold text-black">₹ {formatIndianNumber(totals.subtotalTaxable)}</span>
          </div>

          {isIntra ? (
            <>
              <div className="flex justify-between text-slate-700">
                <span>CGST</span>
                <span className="font-mono font-bold text-black">₹ {formatIndianNumber(totals.totalCGST)}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>SGST</span>
                <span className="font-mono font-bold text-black">₹ {formatIndianNumber(totals.totalSGST)}</span>
              </div>
            </>
          ) : (
            <div className="flex justify-between text-slate-700">
              <span>IGST</span>
              <span className="font-mono font-bold text-black">₹ {formatIndianNumber(totals.totalIGST)}</span>
            </div>
          )}

          {totals.extraCharges > 0 && (
            <div className="flex justify-between text-slate-700">
              <span>Delivery / Extra Charges</span>
              <span className="font-mono font-bold text-black">₹ {formatIndianNumber(totals.extraCharges)}</span>
            </div>
          )}

          {totals.roundOffAmount !== 0 && (
            <div className="flex justify-between text-slate-600 text-[11px]">
              <span>Round Off</span>
              <span className="font-mono font-bold text-black">{totals.roundOffAmount > 0 ? '+' : ''}{formatIndianNumber(totals.roundOffAmount)}</span>
            </div>
          )}
        </div>

        <div className="w-full sm:w-72 border-t-2 border-b-2 border-black py-1 flex justify-between font-extrabold text-xs text-black">
          <span>Total Amount</span>
          <span className="font-mono">₹ {formatIndianNumber(totals.grandTotal)}</span>
        </div>

        <div className="w-full sm:w-72 space-y-0.5 pt-0.5">
          <div className="flex justify-between text-slate-700">
            <span>Received Amount</span>
            <span className="font-mono font-bold text-black">₹ {formatIndianNumber(receivedAmount)}</span>
          </div>

          <div className="flex justify-between text-slate-700 font-bold">
            <span>Balance Due</span>
            <span className="font-mono font-bold text-black">₹ {formatIndianNumber(balanceAmount)}</span>
          </div>
        </div>

        {/* Total Amount in Words */}
        <div className="w-full text-right pt-2">
          <span className="block text-[11px] font-bold text-black">Total Amount (in words)</span>
          <span className="block text-xs font-semibold text-black italic">
            {totals.amountInWords}
          </span>
        </div>
      </div>

      {/* 6. Bank Details & Payment Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2.5 p-3 border border-slate-300 rounded-lg bg-slate-50 text-xs">
        <div className="space-y-0.5">
          <h4 className="font-extrabold text-[11px] text-black uppercase tracking-wider border-b border-slate-300 pb-0.5 mb-1">
            Bank Payment Details
          </h4>
          {company?.bankName && <p className="text-slate-800"><span className="font-semibold text-slate-600">Bank Name:</span> <span className="font-bold text-black">{company.bankName}</span></p>}
          {company?.accountNo && <p className="text-slate-800"><span className="font-semibold text-slate-600">Account No:</span> <span className="font-mono font-bold text-black">{company.accountNo}</span></p>}
          {company?.ifsc && <p className="text-slate-800"><span className="font-semibold text-slate-600">IFSC Code:</span> <span className="font-mono font-bold text-black uppercase">{company.ifsc}</span></p>}
          {company?.branch && <p className="text-slate-800"><span className="font-semibold text-slate-600">Branch:</span> <span className="font-medium text-black">{company.branch}</span></p>}
          {company?.upiId && <p className="text-slate-800"><span className="font-semibold text-slate-600">UPI ID:</span> <span className="font-mono font-bold text-emerald-800">{company.upiId}</span></p>}
        </div>

        {company?.upiId && (
          <div className="flex flex-col items-center justify-center text-center p-1.5 bg-white rounded border border-slate-200">
            <span className="text-[10px] font-bold text-slate-700 uppercase mb-0.5">Scan & Pay via UPI</span>
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(`upi://pay?pa=${company.upiId}&pn=${encodeURIComponent(company.name || 'Bloomarina')}&am=${totals.grandTotal}&cu=INR`)}`}
              alt="UPI QR Code"
              className="w-16 h-16 rounded border border-slate-200 p-0.5 object-contain bg-white"
            />
            <span className="font-mono text-[9px] text-slate-600 font-semibold mt-0.5">{company.upiId}</span>
          </div>
        )}
      </div>

      {/* 7. Footer & Signatory Note */}
      <div className="pt-2 border-t border-slate-200 mt-2 flex justify-between items-end">
        <div className="max-w-md text-slate-600 text-[10px] space-y-0.5">
          {company?.termsAndConditions && (
            <>
              <p className="font-bold text-slate-800 uppercase">Terms & Conditions:</p>
              <p className="whitespace-pre-line leading-snug">{company.termsAndConditions}</p>
            </>
          )}
          <p className="italic text-slate-500 pt-0.5">Thank you for your business!</p>
        </div>

        <div className="text-center w-44 border-t border-slate-300 pt-1">
          {company?.signatureUrl ? (
            <img src={company.signatureUrl} alt="Authorized Signatory" className="h-8 mx-auto mb-0.5 object-contain" />
          ) : (
            <div className="h-6"></div>
          )}
          <p className="font-bold text-slate-900 text-xs uppercase">For {company?.name || 'Company'}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Authorized Signatory</p>
        </div>
      </div>
    </div>
  );
}
