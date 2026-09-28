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
      className="w-full max-w-[800px] mx-auto bg-white text-slate-900 p-8 shadow-2xl border border-slate-300 font-sans print:shadow-none print:p-0 print:border-none print:max-w-full text-[13px] leading-tight select-none"
    >
      {/* 1. Header Section */}
      <div className="space-y-1 pb-3">
        <div className="flex flex-row items-center justify-start gap-3">
          <h2 className="font-extrabold text-base tracking-wider text-black uppercase leading-none m-0 p-0 inline-block align-middle">
            {invoice?.docType || 'TAX INVOICE'}
          </h2>
          <span className="text-[10px] font-bold text-slate-800 border border-slate-400 px-2 py-1 rounded uppercase leading-none inline-block align-middle bg-white shrink-0">
            ORIGINAL FOR RECIPIENT
          </span>
        </div>

        <h1 className="font-heading font-black text-2xl sm:text-3xl text-black tracking-tight pt-1 uppercase">
          {company?.name || ''}
        </h1>

        {companyAddressFormatted && (
          <p className="text-slate-700 text-xs font-medium">
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
              <span className="font-bold uppercase">{company.gstin}</span>
            </>
          )}
        </p>

        {company?.email && (
          <p className="text-slate-700 text-xs font-medium">
            <span>Email: </span><span>{company.email}</span>
          </p>
        )}
      </div>

      <hr className="border-t-2 border-black my-2" />

      {/* 2. Invoice Meta Box */}
      <div className="border border-slate-400 rounded-lg p-2.5 bg-slate-50/50 flex justify-between items-center my-3 text-xs font-medium">
        <div>
          <span>Invoice No.: </span>
          <span className="font-bold text-black">{invoice?.invoiceNumber || ''}</span>
        </div>
        <div>
          <span>Invoice Date: </span>
          <span className="font-bold text-black">{invoice?.invoiceDate || ''}</span>
        </div>
      </div>

      {/* 3. Bill To & Ship To Boxes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-3">
        {/* BILL TO */}
        <div className="border border-slate-400 rounded-xl p-3.5 space-y-1 min-h-[130px]">
          <h3 className="text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
            BILL TO
          </h3>
          <h4 className="font-extrabold text-sm text-black">
            {invoice?.partyName || ''}
          </h4>
          <p className="text-slate-700 text-xs leading-snug whitespace-pre-line">
            {invoice?.partyAddress || ''}
          </p>
          {invoice?.partyGstin && (
            <p className="text-xs pt-1">
              <span className="font-bold text-black">GSTIN: </span>
              <span className="font-bold text-black uppercase">{invoice.partyGstin}</span>
            </p>
          )}
        </div>

        {/* SHIP TO */}
        <div className="border border-slate-400 rounded-xl p-3.5 space-y-1 min-h-[130px]">
          <h3 className="text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
            SHIP TO
          </h3>
          <h4 className="font-extrabold text-sm text-black">
            {invoice?.shippingName || invoice?.partyName || ''}
          </h4>
          <p className="text-slate-700 text-xs leading-snug whitespace-pre-line">
            {invoice?.shippingAddress || invoice?.partyAddress || ''}
          </p>
        </div>
      </div>

      {/* 4. Items Table */}
      <div className="my-4 border border-slate-400 rounded-lg overflow-hidden">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="bg-slate-100 text-black border-b border-slate-400 font-extrabold text-[11px] uppercase">
              <th className="p-2.5 border-r border-slate-400 w-[35%]">ITEMS</th>
              <th className="p-2.5 border-r border-slate-400 text-center w-[15%]">HSN</th>
              <th className="p-2.5 border-r border-slate-400 text-center w-[12%]">QTY.</th>
              <th className="p-2.5 border-r border-slate-400 text-right w-[12%]">RATE (₹)</th>
              <th className="p-2.5 border-r border-slate-400 text-right w-[13%]">TAX (₹)</th>
              <th className="p-2.5 text-right w-[13%]">AMOUNT (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-300">
            {totals.items.map((item, idx) => {
              const qtyDisplay = `${item.quantity} ${item.unit || ''}`;
              const gstPctDisplay = item.gstRate ? `(${item.gstRate}%)` : '';

              return (
                <tr key={idx} className="align-top">
                  <td className="p-2.5 border-r border-slate-400 font-semibold text-black uppercase">
                    {item.name}
                  </td>
                  <td className="p-2.5 border-r border-slate-400 text-center font-mono text-slate-800">
                    {item.hsnCode || '-'}
                  </td>
                  <td className="p-2.5 border-r border-slate-400 text-center font-medium">
                    {qtyDisplay}
                  </td>
                  <td className="p-2.5 border-r border-slate-400 text-right font-mono text-slate-800">
                    {formatIndianNumber(item.unitPrice)}
                  </td>
                  <td className="p-2.5 border-r border-slate-400 text-right font-mono">
                    <div className="font-semibold text-black">{formatIndianNumber(item.gstAmount)}</div>
                    {gstPctDisplay && (
                      <div className="text-[10px] text-slate-500 font-normal">{gstPctDisplay}</div>
                    )}
                  </td>
                  <td className="p-2.5 text-right font-mono font-bold text-black">
                    {formatIndianNumber(item.totalAmount)}
                  </td>
                </tr>
              );
            })}

            {/* SUBTOTAL ROW */}
            <tr className="border-t-2 border-slate-400 font-bold bg-slate-50 text-black text-xs">
              <td colSpan={2} className="p-2.5 border-r border-slate-400 text-left font-extrabold uppercase">
                SUBTOTAL
              </td>
              <td className="p-2.5 border-r border-slate-400 text-center font-extrabold">
                {totalQty}
              </td>
              <td className="p-2.5 border-r border-slate-400"></td>
              <td className="p-2.5 border-r border-slate-400"></td>
              <td className="p-2.5 text-right font-mono font-extrabold text-sm">
                ₹ {formatIndianNumber(totals.grandTotal)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 5. Summary Breakdown Section */}
      <div className="flex flex-col items-end my-4 text-xs font-medium space-y-1.5">
        <div className="w-full sm:w-72 space-y-1.5 border-b border-slate-300 pb-2">
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
        </div>

        <div className="w-full sm:w-72 border-t-2 border-b-2 border-black py-1.5 flex justify-between font-extrabold text-sm text-black">
          <span>Total Amount</span>
          <span className="font-mono">₹ {formatIndianNumber(totals.grandTotal)}</span>
        </div>

        <div className="w-full sm:w-72 space-y-1 pt-1">
          <div className="flex justify-between text-slate-700">
            <span>Received Amount</span>
            <span className="font-mono font-bold text-black">₹ {formatIndianNumber(receivedAmount)}</span>
          </div>

          <div className="flex justify-between text-slate-700 font-bold">
            <span>Balance</span>
            <span className="font-mono font-bold text-black">₹ {formatIndianNumber(balanceAmount)}</span>
          </div>
        </div>

        {/* Total Amount in Words */}
        <div className="w-full text-right pt-3">
          <span className="block text-[11px] font-bold text-black">Total Amount (in words)</span>
          <span className="block text-xs font-semibold text-black italic">
            {totals.amountInWords}
          </span>
        </div>
      </div>

      {/* 6. Footer Note */}
      <div className="pt-8 text-center text-xs font-medium text-slate-700 italic border-t border-slate-200 mt-6">
        Thank you for your business!
      </div>
    </div>
  );
}
