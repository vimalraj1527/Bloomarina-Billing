import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Save, 
  Eye, 
  ArrowLeft, 
  Search, 
  FileText, 
  Download, 
  Printer, 
  Sparkles,
  Calculator,
  Truck,
  CheckCircle2,
  X
} from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { GST_STATES, getStateCodeFromGSTIN, calculateInvoiceTotals, formatIndianNumber } from '../utils/gstCalculations';
import { HSN_DATABASE, searchHSN } from '../utils/hsnDatabase';
import SairamExactTemplate from './InvoiceTemplates/SairamExactTemplate';
import ModernTemplate from './InvoiceTemplates/ModernTemplate';
import ClassicTemplate from './InvoiceTemplates/ClassicTemplate';
import MinimalTemplate from './InvoiceTemplates/MinimalTemplate';
import ThermalTemplate from './InvoiceTemplates/ThermalTemplate';

export default function InvoiceEditor({ 
  company, 
  parties, 
  itemsCatalog, 
  editingInvoice, 
  onSave, 
  onCancel 
}) {
  const [docType, setDocType] = useState(editingInvoice?.docType || 'Tax Invoice');
  const [invoiceNumber, setInvoiceNumber] = useState(
    editingInvoice?.invoiceNumber || (company?.invoicePrefix ? `${company.invoicePrefix}${company.nextInvoiceNumber || 101}` : '')
  );
  const [invoiceDate, setInvoiceDate] = useState(editingInvoice?.invoiceDate || new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState(editingInvoice?.dueDate || '');

  // Party details - empty defaults, relying on selection or user input
  const [selectedPartyId, setSelectedPartyId] = useState(editingInvoice?.partyId || '');
  const [partyName, setPartyName] = useState(editingInvoice?.partyName || '');
  const [partyGstin, setPartyGstin] = useState(editingInvoice?.partyGstin || '');
  const [partyStateCode, setPartyStateCode] = useState(editingInvoice?.partyStateCode || company?.stateCode || '');
  const [partyStateName, setPartyStateName] = useState(editingInvoice?.partyStateName || company?.stateName || '');
  const [partyAddress, setPartyAddress] = useState(editingInvoice?.partyAddress || '');
  const [placeOfSupply, setPlaceOfSupply] = useState(
    editingInvoice?.placeOfSupply || (company?.stateCode ? `${company.stateCode}-${company.stateName}` : '')
  );
  const [paymentStatus, setPaymentStatus] = useState(editingInvoice?.paymentStatus || 'Unpaid');

  // E-Way Bill & E-Invoice
  const [ewayBillNo, setEwayBillNo] = useState(editingInvoice?.ewayBillNo || '');
  const [vehicleNo, setVehicleNo] = useState(editingInvoice?.vehicleNo || '');
  const [transporterName, setTransporterName] = useState(editingInvoice?.transporterName || '');
  const [irn, setIrn] = useState(editingInvoice?.irn || '');
  const [notes, setNotes] = useState(editingInvoice?.notes || '');
  const [extraCharges, setExtraCharges] = useState(editingInvoice?.extraCharges || 0);
  const [roundOff, setRoundOff] = useState(editingInvoice?.roundOff !== false);

  // Line items
  const [items, setItems] = useState(editingInvoice?.items || [
    {
      id: Date.now(),
      name: '',
      hsnCode: '',
      quantity: 1,
      unit: 'Pcs',
      unitPrice: 0,
      discountPercent: 0,
      gstRate: 18,
      isTaxInclusive: false
    }
  ]);

  // Preview Modal
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(company.defaultTemplate || 'sairam');

  // Auto-fill party details when selected from dropdown
  const handlePartySelect = (e) => {
    const pId = e.target.value;
    setSelectedPartyId(pId);
    if (!pId) return;
    const p = parties.find(party => party.id === pId);
    if (p) {
      setPartyName(p.name);
      setPartyGstin(p.gstin);
      setPartyStateCode(p.stateCode);
      setPartyStateName(p.stateName);
      setPartyAddress(p.billingAddress);
      setPlaceOfSupply(`${p.stateCode}-${p.stateName}`);
    }
  };

  // Auto-detect state code when typing GSTIN manually
  const handleGstinChange = (val) => {
    setPartyGstin(val);
    const code = getStateCodeFromGSTIN(val);
    if (code) {
      const match = GST_STATES.find(s => s.code === code);
      if (match) {
        setPartyStateCode(match.code);
        setPartyStateName(match.name);
        setPlaceOfSupply(`${match.code}-${match.name}`);
      }
    }
  };

  // Add line item
  const addLineItem = () => {
    setItems([
      ...items,
      {
        id: Date.now(),
        name: '',
        hsnCode: '',
        quantity: 1,
        unit: 'Pcs',
        unitPrice: 0,
        discountPercent: 0,
        gstRate: 18,
        isTaxInclusive: false
      }
    ]);
  };

  // Quick fill item from Catalog
  const handleCatalogItemSelect = (idx, catalogId) => {
    const catItem = itemsCatalog.find(i => i.id === catalogId);
    if (!catItem) return;
    const updated = [...items];
    updated[idx] = {
      ...updated[idx],
      name: catItem.name,
      hsnCode: catItem.hsnCode,
      unit: catItem.unit,
      unitPrice: catItem.sellingPrice,
      gstRate: catItem.gstRate,
      isTaxInclusive: catItem.isTaxInclusive || false
    };
    setItems(updated);
  };

  // Remove line item
  const removeLineItem = (idx) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== idx));
  };

  // Update line item property
  const updateItemField = (idx, field, value) => {
    const updated = [...items];
    updated[idx][field] = value;
    setItems(updated);
  };

  // Calculate Summary
  const invoiceSummary = calculateInvoiceTotals(
    items,
    company.stateCode,
    partyStateCode,
    extraCharges,
    roundOff
  );

  const isIntra = company.stateCode === partyStateCode;

  // Save Invoice Handler with mandatory GST field enforcement
  const handleSaveInvoice = () => {
    const missing = [];

    if (!invoiceNumber || !invoiceNumber.trim()) {
      missing.push('Invoice Number');
    }
    if (!invoiceDate || !invoiceDate.trim()) {
      missing.push('Invoice Date');
    }
    if (!partyName || !partyName.trim()) {
      missing.push('Customer / Party Legal Name (Bill To)');
    }
    if (!partyAddress || !partyAddress.trim()) {
      missing.push('Customer Address (Bill To)');
    }
    if (!partyStateCode || !partyStateCode.trim()) {
      missing.push('Customer State Code');
    }
    if (docType === 'Tax Invoice' && (!partyGstin || !partyGstin.trim())) {
      missing.push('Customer GSTIN (Required for B2B Tax Invoice)');
    }

    if (!items || items.length === 0) {
      missing.push('At least 1 Line Item');
    } else {
      items.forEach((item, index) => {
        const itemNum = index + 1;
        if (!item.name || !item.name.trim()) {
          missing.push(`Item #${itemNum}: Product / Service Description`);
        }
        if (!item.hsnCode || !item.hsnCode.trim()) {
          missing.push(`Item #${itemNum}: HSN / SAC Code`);
        }
        if (!item.quantity || Number(item.quantity) <= 0) {
          missing.push(`Item #${itemNum}: Quantity (must be > 0)`);
        }
        if (item.unitPrice === undefined || item.unitPrice === '' || Number(item.unitPrice) <= 0) {
          missing.push(`Item #${itemNum}: Unit Price / Rate (must be > 0)`);
        }
      });
    }

    if (missing.length > 0) {
      alert(
        `⛔ CANNOT CREATE GST BILL!\n\nPlease fill in all required details before generating this invoice:\n\n` +
        missing.map(m => `• ${m}`).join('\n')
      );
      return;
    }

    const payload = {
      id: editingInvoice?.id || `inv_${Date.now()}`,
      companyId: company.id,
      docType,
      invoiceNumber: invoiceNumber.trim(),
      invoiceDate: invoiceDate.trim(),
      dueDate,
      partyId: selectedPartyId,
      partyName: partyName.trim(),
      partyGstin: partyGstin.trim().toUpperCase(),
      partyStateCode: partyStateCode.trim(),
      partyStateName: partyStateName.trim(),
      partyAddress: partyAddress.trim(),
      placeOfSupply,
      paymentStatus,
      ewayBillNo,
      vehicleNo,
      transporterName,
      irn,
      notes,
      extraCharges: Number(extraCharges) || 0,
      roundOff,
      items
    };

    onSave(payload);
  };

  // PDF Export using html2pdf.js
  const handleDownloadPDF = () => {
    const element = document.getElementById('invoice-print-area');
    if (!element) return;

    const opt = {
      margin: [5, 5, 5, 5],
      filename: `Invoice_${invoiceNumber || 'Draft'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true,
        letterRendering: true,
        scrollX: 0,
        scrollY: 0
      },
      jsPDF: { unit: 'mm', format: selectedTemplate === 'thermal' ? [80, 200] : 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

  // Direct Print
  const handleDirectPrint = () => {
    window.print();
  };

  // Full Invoice Construct for Template
  const constructedInvoiceData = {
    docType,
    invoiceNumber,
    invoiceDate,
    dueDate,
    partyName,
    partyGstin,
    partyStateCode,
    partyStateName,
    partyAddress,
    placeOfSupply,
    paymentStatus,
    ewayBillNo,
    vehicleNo,
    transporterName,
    irn,
    notes,
    extraCharges,
    roundOff,
    items
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center space-x-3">
          <button
            onClick={onCancel}
            className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-heading font-extrabold text-xl text-white">
              {editingInvoice ? 'Edit Document' : 'Create New GST Document'}
            </h1>
            <p className="text-xs text-slate-400">
              Live tax calculations & invoice generator
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowPreviewModal(true)}
            className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 font-bold text-xs px-4 py-2.5 rounded-xl transition-all"
          >
            <Eye className="w-4 h-4" />
            <span>Live PDF Preview</span>
          </button>

          <button
            onClick={handleSaveInvoice}
            className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 via-rose-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-amber-500/25 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Invoice</span>
          </button>
        </div>
      </div>

      {/* Main Document Details Form */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
        {/* Document Type & Invoice Number Header */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pb-6 border-b border-slate-800">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Document Type</label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold focus:border-amber-500 focus:outline-none"
            >
              <option value="Tax Invoice">Tax Invoice (B2B / B2C)</option>
              <option value="Bill of Supply">Bill of Supply (Exempt / Composition)</option>
              <option value="Proforma Invoice">Proforma Invoice / Quotation</option>
              <option value="Credit Note">Credit Note</option>
              <option value="Debit Note">Debit Note</option>
              <option value="Delivery Challan">Delivery Challan</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Invoice Number</label>
            <input
              type="text"
              placeholder="Enter Invoice Number"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-amber-400 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Invoice Date</label>
            <input
              type="date"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Status</label>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-semibold focus:border-amber-500 focus:outline-none"
            >
              <option value="Unpaid">Unpaid / Pending</option>
              <option value="Paid">Paid</option>
              <option value="Partial">Partially Paid</option>
            </select>
          </div>
        </div>

        {/* Customer / Party Details */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-sm text-amber-400 uppercase tracking-wider flex items-center space-x-2">
              <span>Customer / Billed To Details</span>
            </h3>

            {/* Quick Party Selector */}
            {parties.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400">Select Customer:</span>
                <select
                  value={selectedPartyId}
                  onChange={handlePartySelect}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1 text-xs text-white focus:border-amber-500 focus:outline-none"
                >
                  <option value="">-- Select Saved Customer --</option>
                  {parties.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.gstin || 'URP'})</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Customer / Party Name *</label>
              <input
                type="text"
                placeholder="Enter Party Name"
                value={partyName}
                onChange={(e) => setPartyName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-semibold focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Party GSTIN (15-Digit)</label>
              <input
                type="text"
                maxLength={15}
                placeholder="Enter 15-Digit GSTIN"
                value={partyGstin}
                onChange={(e) => handleGstinChange(e.target.value.toUpperCase())}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-semibold text-emerald-400 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Place of Supply (State)</label>
              <select
                value={partyStateCode && partyStateName ? `${partyStateCode}-${partyStateName}` : ''}
                onChange={(e) => {
                  const [code, name] = e.target.value.split('-');
                  setPartyStateCode(code);
                  setPartyStateName(name);
                  setPlaceOfSupply(e.target.value);
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
              >
                <option value="">-- Select State --</option>
                {GST_STATES.map(st => (
                  <option key={st.code} value={`${st.code}-${st.name}`}>
                    {st.code} - {st.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2 md:col-span-3">
              <label className="block text-xs font-semibold text-slate-400 mb-1">Billing & Shipping Address</label>
              <input
                type="text"
                placeholder="Enter Full Address details with PIN code"
                value={partyAddress}
                onChange={(e) => setPartyAddress(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Tax Indicator */}
        <div className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-bold ${
          isIntra 
            ? 'bg-sky-500/10 border-sky-500/30 text-sky-300' 
            : 'bg-purple-500/10 border-purple-500/30 text-purple-300'
        }`}>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 shrink-0 text-amber-400" />
            <span>
              Supply Classification: {isIntra ? 'Intrastate (Same State)' : 'Interstate (Cross-State)'}
            </span>
          </div>
          <span className="font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700">
            Calculated GST: {isIntra ? 'CGST (Half) + SGST (Half)' : 'IGST (Full)'}
          </span>
        </div>

        {/* Dynamic Line Items Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-sm text-amber-400 uppercase tracking-wider">
              Item Details & GST Rates
            </h3>
            <button
              onClick={addLineItem}
              className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Item Line</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs min-w-[900px]">
              <thead className="bg-slate-900 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3 w-10 text-center">#</th>
                  <th className="p-3 min-w-[200px]">Item / Service Description</th>
                  <th className="p-3 w-28 text-center">HSN/SAC</th>
                  <th className="p-3 w-20 text-center">Qty</th>
                  <th className="p-3 w-24 text-center">Unit</th>
                  <th className="p-3 w-28 text-right">Rate (₹)</th>
                  <th className="p-3 w-20 text-center">Disc %</th>
                  <th className="p-3 w-24 text-center">GST %</th>
                  <th className="p-3 w-32 text-right">Taxable (₹)</th>
                  <th className="p-3 w-32 text-right">Total (₹)</th>
                  <th className="p-3 w-10 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 bg-slate-950/40">
                {items.map((item, idx) => {
                  const lineCalc = invoiceSummary.items[idx] || {};

                  return (
                    <tr key={item.id || idx} className="hover:bg-slate-900/30">
                      <td className="p-3 text-center text-slate-500 font-mono">{idx + 1}</td>
                      
                      <td className="p-2 space-y-1">
                        <input
                          type="text"
                          placeholder="Enter item description"
                          value={item.name}
                          onChange={(e) => updateItemField(idx, 'name', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white font-semibold focus:border-amber-500 focus:outline-none"
                        />
                        {itemsCatalog.length > 0 && (
                          <select
                            onChange={(e) => handleCatalogItemSelect(idx, e.target.value)}
                            defaultValue=""
                            className="w-full bg-slate-950 text-[10px] text-slate-400 border border-slate-800 rounded px-1.5 py-0.5 focus:outline-none"
                          >
                            <option value="" disabled>-- Or pick from Item Catalog --</option>
                            {itemsCatalog.map(cat => (
                              <option key={cat.id} value={cat.id}>{cat.name} (HSN: {cat.hsnCode})</option>
                            ))}
                          </select>
                        )}
                      </td>

                      <td className="p-2 text-center">
                        <input
                          type="text"
                          placeholder="HSN Code"
                          value={item.hsnCode}
                          onChange={(e) => updateItemField(idx, 'hsnCode', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs font-mono text-center text-slate-200 focus:border-amber-500 focus:outline-none"
                        />
                      </td>

                      <td className="p-2">
                        <input
                          type="number"
                          min="0.01"
                          step="any"
                          value={item.quantity}
                          onChange={(e) => updateItemField(idx, 'quantity', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs font-semibold text-center text-white focus:border-amber-500 focus:outline-none"
                        />
                      </td>

                      <td className="p-2">
                        <select
                          value={item.unit || 'Pcs'}
                          onChange={(e) => updateItemField(idx, 'unit', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-1.5 py-1 text-xs text-center text-slate-200 focus:border-amber-500 focus:outline-none"
                        >
                          <option value="Pcs">Pcs</option>
                          <option value="Kg">Kg</option>
                          <option value="Mtr">Mtr</option>
                          <option value="Box">Box</option>
                          <option value="Set">Set</option>
                          <option value="Hrs">Hrs</option>
                          <option value="Yr">Yr</option>
                        </select>
                      </td>

                      <td className="p-2">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={item.unitPrice}
                          onChange={(e) => updateItemField(idx, 'unitPrice', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs font-mono font-semibold text-right text-white focus:border-amber-500 focus:outline-none"
                        />
                      </td>

                      <td className="p-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={item.discountPercent}
                          onChange={(e) => updateItemField(idx, 'discountPercent', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-1 py-1 text-xs text-center text-slate-200 focus:border-amber-500 focus:outline-none"
                        />
                      </td>

                      <td className="p-2">
                        <select
                          value={item.gstRate}
                          onChange={(e) => updateItemField(idx, 'gstRate', Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-1 py-1 text-xs font-bold text-center text-amber-400 focus:border-amber-500 focus:outline-none"
                        >
                          <option value={0}>0%</option>
                          <option value={5}>5%</option>
                          <option value={12}>12%</option>
                          <option value={18}>18%</option>
                          <option value={28}>28%</option>
                        </select>
                      </td>

                      <td className="p-3 text-right font-mono font-medium text-slate-300">
                        ₹{formatIndianNumber(lineCalc.taxableAmount || 0)}
                      </td>

                      <td className="p-3 text-right font-mono font-bold text-white">
                        ₹{formatIndianNumber(lineCalc.totalAmount || 0)}
                      </td>

                      <td className="p-3 text-center">
                        <button
                          onClick={() => removeLineItem(idx)}
                          className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* E-Way & E-Invoice Info */}
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-3">
          <h4 className="font-heading font-bold text-xs text-slate-300 uppercase tracking-wider flex items-center space-x-2">
            <Truck className="w-4 h-4 text-amber-400" />
            <span>Optional E-Way Bill & E-Invoice Reference Fields</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">E-Way Bill Number</label>
              <input
                type="text"
                placeholder="Enter 12-digit EWay Bill No"
                value={ewayBillNo}
                onChange={(e) => setEwayBillNo(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Vehicle Number</label>
              <input
                type="text"
                placeholder="Enter Vehicle Number"
                value={vehicleNo}
                onChange={(e) => setVehicleNo(e.target.value.toUpperCase())}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Transporter Name</label>
              <input
                type="text"
                placeholder="Enter Transporter Name"
                value={transporterName}
                onChange={(e) => setTransporterName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Totals Summary */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-4 border-t border-slate-800">
          <div className="md:col-span-7 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Invoice Notes / Custom Payment Terms</label>
              <textarea
                rows={3}
                placeholder="Enter custom terms or invoice notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Amount in Words</span>
              <p className="text-xs font-bold text-amber-300 italic">{invoiceSummary.amountInWords}</p>
            </div>
          </div>

          <div className="md:col-span-5 glass-card p-4 rounded-xl border border-slate-800 space-y-2.5 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal Taxable Amount:</span>
              <span className="font-mono font-semibold text-white">₹{formatIndianNumber(invoiceSummary.subtotalTaxable)}</span>
            </div>

            {isIntra ? (
              <>
                <div className="flex justify-between text-slate-400">
                  <span>Central Tax (CGST Total):</span>
                  <span className="font-mono text-sky-400">₹{formatIndianNumber(invoiceSummary.totalCGST)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>State Tax (SGST Total):</span>
                  <span className="font-mono text-sky-400">₹{formatIndianNumber(invoiceSummary.totalSGST)}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between text-slate-400">
                <span>Integrated Tax (IGST Total):</span>
                <span className="font-mono text-purple-400">₹{formatIndianNumber(invoiceSummary.totalIGST)}</span>
              </div>
            )}

            <div className="flex justify-between items-center text-slate-400 pt-1">
              <span>Shipping / Delivery Charges:</span>
              <input
                type="number"
                min="0"
                value={extraCharges}
                onChange={(e) => setExtraCharges(e.target.value)}
                className="w-24 bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-xs font-mono text-right text-white focus:outline-none"
              />
            </div>

            <div className="flex justify-between items-center text-slate-400 border-t border-slate-800 pt-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={roundOff}
                  onChange={(e) => setRoundOff(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0"
                />
                <span>Auto Round Off Amount</span>
              </label>
              <span className="font-mono text-slate-400">
                {invoiceSummary.roundOffAmount > 0 ? '+' : ''}{formatIndianNumber(invoiceSummary.roundOffAmount)}
              </span>
            </div>

            <div className="border-t-2 border-amber-500/50 pt-2.5 mt-2 flex justify-between items-center">
              <span className="font-heading font-extrabold text-sm text-white uppercase">Grand Total:</span>
              <span className="font-mono font-black text-lg text-amber-400">₹{formatIndianNumber(invoiceSummary.grandTotal)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Live PDF & Print Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <span className="font-heading font-bold text-sm text-white">Select Layout Template:</span>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1 text-xs text-amber-400 font-bold focus:outline-none"
                >
                  <option value="sairam">General Template</option>
                  <option value="modern">Emerald Modern</option>
                  <option value="classic">Classic Accounting Grid</option>
                  <option value="minimal">Minimal Clean</option>
                  <option value="thermal">3-Inch (80mm) Thermal POS</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center space-x-1.5 bg-gradient-to-r from-amber-500 to-emerald-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg transition-colors shadow-md"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>

                <button
                  onClick={handleDirectPrint}
                  className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print</span>
                </button>

                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Canvas Body */}
            <div className="p-6 overflow-y-auto bg-slate-950 flex justify-center print-container">
              {selectedTemplate === 'sairam' && (
                <SairamExactTemplate invoice={constructedInvoiceData} company={company} />
              )}
              {selectedTemplate === 'modern' && (
                <ModernTemplate invoice={constructedInvoiceData} company={company} />
              )}
              {selectedTemplate === 'classic' && (
                <ClassicTemplate invoice={constructedInvoiceData} company={company} />
              )}
              {selectedTemplate === 'minimal' && (
                <MinimalTemplate invoice={constructedInvoiceData} company={company} />
              )}
              {selectedTemplate === 'thermal' && (
                <ThermalTemplate invoice={constructedInvoiceData} company={company} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
