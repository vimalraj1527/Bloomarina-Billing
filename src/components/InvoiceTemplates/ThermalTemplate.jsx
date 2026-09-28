import React from 'react';
import { calculateInvoiceTotals, formatIndianNumber } from '../../utils/gstCalculations';

export default function ThermalTemplate({ invoice, company }) {
  const totals = calculateInvoiceTotals(
    invoice.items || [],
    company.stateCode,
    invoice.partyStateCode,
    invoice.extraCharges || 0,
    invoice.roundOff !== false
  );

  const isIntra = company.stateCode === invoice.partyStateCode;

  return (
    <div id="invoice-print-area" className="w-[300px] mx-auto bg-white text-black p-3 shadow-md print:shadow-none print:w-full font-mono text-[11px] leading-tight">
      {/* Header */}
      <div className="text-center border-b border-dashed border-black pb-2 mb-2">
        <h2 className="font-bold text-sm uppercase">{company.name}</h2>
        <p className="text-[10px]">{company.address}</p>
        <p className="text-[10px]">GSTIN: {company.gstin}</p>
        <p className="text-[10px]">Ph: {company.phone}</p>
      </div>

      {/* Bill Meta */}
      <div className="border-b border-dashed border-black pb-2 mb-2 space-y-0.5">
        <div className="flex justify-between font-bold">
          <span>{invoice.docType || 'INVOICE'}</span>
          <span>{invoice.invoiceNumber}</span>
        </div>
        <div className="flex justify-between">
          <span>Date: {invoice.invoiceDate}</span>
          <span>POS: {invoice.partyStateCode}</span>
        </div>
        <div>
          <span>Customer: </span>
          <span className="font-bold">{invoice.partyName}</span>
        </div>
        {invoice.partyGstin && <div>GSTIN: {invoice.partyGstin}</div>}
      </div>

      {/* Items */}
      <div className="border-b border-dashed border-black pb-2 mb-2">
        <div className="flex justify-between font-bold border-b border-black pb-1 mb-1">
          <span className="w-1/2">ITEM</span>
          <span className="w-1/4 text-center">QTY</span>
          <span className="w-1/4 text-right">AMT</span>
        </div>

        {totals.items.map((item, idx) => (
          <div key={idx} className="mb-1">
            <div className="font-bold">{item.name}</div>
            <div className="flex justify-between text-[10px] text-gray-700">
              <span>HSN:{item.hsnCode} @{item.gstRate}%</span>
              <span>{item.quantity} x ₹{formatIndianNumber(item.unitPrice)}</span>
              <span className="font-bold text-black">₹{formatIndianNumber(item.totalAmount)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="space-y-1 border-b border-dashed border-black pb-2 mb-2">
        <div className="flex justify-between">
          <span>Taxable Value:</span>
          <span>₹{formatIndianNumber(totals.subtotalTaxable)}</span>
        </div>
        {isIntra ? (
          <>
            <div className="flex justify-between">
              <span>CGST:</span>
              <span>₹{formatIndianNumber(totals.totalCGST)}</span>
            </div>
            <div className="flex justify-between">
              <span>SGST:</span>
              <span>₹{formatIndianNumber(totals.totalSGST)}</span>
            </div>
          </>
        ) : (
          <div className="flex justify-between">
            <span>IGST:</span>
            <span>₹{formatIndianNumber(totals.totalIGST)}</span>
          </div>
        )}
        {totals.roundOffAmount !== 0 && (
          <div className="flex justify-between">
            <span>Round Off:</span>
            <span>{totals.roundOffAmount > 0 ? '+' : ''}{formatIndianNumber(totals.roundOffAmount)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-xs border-t border-black pt-1">
          <span>NET AMOUNT:</span>
          <span>₹{formatIndianNumber(totals.grandTotal)}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center space-y-1 pt-1">
        <p className="font-bold">Thank You! Visit Again.</p>
        {company.upiId && (
          <div className="flex flex-col items-center mt-2">
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=70x70&data=${encodeURIComponent(`upi://pay?pa=${company.upiId}&pn=${encodeURIComponent(company.name)}&am=${totals.grandTotal}&cu=INR`)}`}
              alt="UPI QR Code"
              className="w-14 h-14"
            />
            <span className="text-[9px] mt-0.5">Pay via UPI: {company.upiId}</span>
          </div>
        )}
        <p className="text-[9px] text-gray-500 mt-1">E. & O.E.</p>
      </div>
    </div>
  );
}
