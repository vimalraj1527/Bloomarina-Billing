import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  FileText, 
  Download, 
  Printer, 
  Edit3, 
  Trash2, 
  Copy, 
  CheckCircle2, 
  AlertCircle,
  Filter,
  Eye,
  Clock
} from 'lucide-react';
import { calculateInvoiceTotals, formatIndianNumber } from '../utils/gstCalculations';

export default function InvoiceList({ 
  invoices, 
  company, 
  onNewInvoice, 
  onEditInvoice, 
  onViewInvoice, 
  onDeleteInvoice, 
  onDuplicateInvoice,
  onSaveInvoice 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [docFilter, setDocFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Toggle Payment Status dynamically
  const handleTogglePaymentStatus = (inv) => {
    const nextStatus = inv.paymentStatus === 'Paid' ? 'Unpaid' : inv.paymentStatus === 'Unpaid' ? 'Partial' : 'Paid';
    const updated = { ...inv, paymentStatus: nextStatus };
    onSaveInvoice(updated);
  };

  // Filtered List
  const filteredInvoices = (invoices || []).filter(inv => {
    const matchesSearch = 
      inv.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.partyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.partyGstin?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDoc = docFilter === 'All' || inv.docType === docFilter;
    const matchesStatus = statusFilter === 'All' || inv.paymentStatus === statusFilter;

    return matchesSearch && matchesDoc && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-slate-800">
        <div>
          <h1 className="font-heading font-extrabold text-xl text-white">Sales & Tax Invoices</h1>
          <p className="text-xs text-slate-400">Manage all generated GST billing documents for {company?.name || 'Company'}</p>
        </div>

        <button
          onClick={onNewInvoice}
          className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 via-rose-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-amber-500/25 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>+ Create Document</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by Bill No, Party Name or GSTIN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
          />
        </div>

        {/* Doc Type Filter */}
        <div>
          <select
            value={docFilter}
            onChange={(e) => setDocFilter(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
          >
            <option value="All">All Document Types</option>
            <option value="Tax Invoice">Tax Invoice</option>
            <option value="Bill of Supply">Bill of Supply</option>
            <option value="Proforma Invoice">Proforma / Quotation</option>
            <option value="Credit Note">Credit Note</option>
            <option value="Debit Note">Debit Note</option>
            <option value="Delivery Challan">Delivery Challan</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
          >
            <option value="All">All Payment Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Unpaid">Unpaid / Pending</option>
            <option value="Partial">Partially Paid</option>
          </select>
        </div>
      </div>

      {/* Invoices Data Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3.5">Invoice #</th>
                <th className="p-3.5">Document Type</th>
                <th className="p-3.5">Customer / Party</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5 text-right">Taxable (₹)</th>
                <th className="p-3.5 text-right">Grand Total (₹)</th>
                <th className="p-3.5 text-center">Payment (Click to toggle)</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    No documents found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => {
                  const totals = calculateInvoiceTotals(
                    inv.items || [],
                    company.stateCode,
                    inv.partyStateCode,
                    inv.extraCharges || 0,
                    inv.roundOff !== false
                  );

                  return (
                    <tr key={inv.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-white">
                        {inv.invoiceNumber}
                      </td>

                      <td className="p-3.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {inv.docType}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <div className="font-semibold text-white">{inv.partyName}</div>
                        <div className="font-mono text-[10px] text-slate-400">{inv.partyGstin || 'URP'}</div>
                      </td>

                      <td className="p-3.5 text-slate-400 font-mono">{inv.invoiceDate}</td>

                      <td className="p-3.5 text-right font-mono text-slate-300">
                        ₹{formatIndianNumber(totals.subtotalTaxable)}
                      </td>

                      <td className="p-3.5 text-right font-mono font-bold text-white text-sm">
                        ₹{formatIndianNumber(totals.grandTotal)}
                      </td>

                      {/* Interactive Payment Status Toggle Button */}
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => handleTogglePaymentStatus(inv)}
                          title="Click to toggle payment status dynamically"
                          className={`inline-flex items-center space-x-1 text-[10px] font-bold px-2.5 py-1 rounded-full cursor-pointer transition-all transform active:scale-95 ${
                            inv.paymentStatus === 'Paid'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                              : inv.paymentStatus === 'Partial'
                              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30'
                          }`}
                        >
                          {inv.paymentStatus === 'Paid' ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : inv.paymentStatus === 'Partial' ? (
                            <Clock className="w-3 h-3" />
                          ) : (
                            <AlertCircle className="w-3 h-3" />
                          )}
                          <span>{inv.paymentStatus || 'Unpaid'}</span>
                        </button>
                      </td>

                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => onViewInvoice(inv)}
                            title="View / Print PDF"
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onEditInvoice(inv)}
                            title="Edit Document"
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-lg transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onDuplicateInvoice(inv)}
                            title="Duplicate Document"
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-purple-400 rounded-lg transition-colors"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Delete invoice ${inv.invoiceNumber}?`)) {
                                onDeleteInvoice(inv.id);
                              }
                            }}
                            title="Delete"
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-rose-400 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
