import React from 'react';
import { 
  IndianRupee, 
  TrendingUp, 
  Clock, 
  Users, 
  Package, 
  FileText, 
  ArrowUpRight, 
  Plus, 
  Download, 
  Eye,
  CheckCircle2,
  AlertCircle,
  Flower2,
  Sparkles
} from 'lucide-react';
import { calculateInvoiceTotals, formatCurrency, formatIndianNumber } from '../utils/gstCalculations';

export default function Dashboard({ 
  invoices, 
  parties, 
  items, 
  company, 
  onNewInvoice, 
  onViewInvoice, 
  setActiveTab 
}) {
  // Compute Dashboard Metrics dynamically
  let totalSales = 0;
  let totalTaxCollected = 0;
  let totalUnpaid = 0;
  let paidCount = 0;
  let unpaidCount = 0;

  (invoices || []).forEach(inv => {
    const totals = calculateInvoiceTotals(
      inv.items || [],
      company?.stateCode || '',
      inv.partyStateCode,
      inv.extraCharges || 0,
      inv.roundOff !== false
    );

    totalSales += totals.grandTotal;
    totalTaxCollected += (totals.totalCGST + totals.totalSGST + totals.totalIGST);

    if (inv.paymentStatus === 'Paid') {
      paidCount++;
    } else {
      totalUnpaid += totals.grandTotal;
      unpaidCount++;
    }
  });

  return (
    <div className="space-y-6">
      {/* Bloomarina Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/60 p-6 border border-slate-800 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <Flower2 className="w-5 h-5 text-amber-400" />
              <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400">
                Bloomarina Suite Dashboard
              </span>
            </div>
            <h1 className="font-heading font-black text-2xl text-white tracking-tight">
              {company.name}
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              GSTIN: <span className="font-mono text-emerald-400 font-bold">{company.gstin}</span> | State: {company.stateName} ({company.stateCode})
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onNewInvoice}
              className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 via-rose-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-amber-500/25 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Create New Bill</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Billed */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Billed Volume</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="font-heading font-black text-2xl text-white">
              {formatCurrency(totalSales)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Across {invoices.length} active documents</p>
          </div>
        </div>

        {/* GST Tax Collected */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">GST Collected Liability</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="font-heading font-black text-2xl text-emerald-400">
              {formatCurrency(totalTaxCollected)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">CGST + SGST + IGST summary</p>
          </div>
        </div>

        {/* Pending Receivables */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Pending Receivables</span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="font-heading font-black text-2xl text-rose-400">
              {formatCurrency(totalUnpaid)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">{unpaidCount} unpaid/pending bills</p>
          </div>
        </div>

        {/* Master Catalog Counts */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Active Business Masters</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-heading font-bold text-xl text-white">{parties.length}</div>
              <p className="text-[10px] text-slate-400">Customers & Vendors</p>
            </div>
            <div className="h-8 w-px bg-slate-800"></div>
            <div>
              <div className="font-heading font-bold text-xl text-white">{items.length}</div>
              <p className="text-[10px] text-slate-400">Products & Services</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={onNewInvoice}
          className="p-4 glass-card hover:bg-slate-800/80 rounded-xl border border-slate-800 text-left space-y-1 transition-all group"
        >
          <div className="flex items-center justify-between text-amber-400">
            <FileText className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <ArrowUpRight className="w-4 h-4 text-slate-500" />
          </div>
          <p className="font-bold text-xs text-white">Create GST Bill</p>
          <p className="text-[10px] text-slate-400">Issue Tax Invoice</p>
        </button>

        <button
          onClick={() => setActiveTab('parties')}
          className="p-4 glass-card hover:bg-slate-800/80 rounded-xl border border-slate-800 text-left space-y-1 transition-all group"
        >
          <div className="flex items-center justify-between text-emerald-400">
            <Users className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <ArrowUpRight className="w-4 h-4 text-slate-500" />
          </div>
          <p className="font-bold text-xs text-white">Add Customer</p>
          <p className="text-[10px] text-slate-400">Save Client & GSTIN</p>
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className="p-4 glass-card hover:bg-slate-800/80 rounded-xl border border-slate-800 text-left space-y-1 transition-all group"
        >
          <div className="flex items-center justify-between text-purple-400">
            <Package className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <ArrowUpRight className="w-4 h-4 text-slate-500" />
          </div>
          <p className="font-bold text-xs text-white">Add Product/HSN</p>
          <p className="text-[10px] text-slate-400">Item rates & stock</p>
        </button>

        <button
          onClick={() => setActiveTab('gstr')}
          className="p-4 glass-card hover:bg-slate-800/80 rounded-xl border border-slate-800 text-left space-y-1 transition-all group"
        >
          <div className="flex items-center justify-between text-rose-400">
            <TrendingUp className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <ArrowUpRight className="w-4 h-4 text-slate-500" />
          </div>
          <p className="font-bold text-xs text-white">GSTR Reports</p>
          <p className="text-[10px] text-slate-400">GSTR-1 & 3B CSV</p>
        </button>
      </div>

      {/* Recent Invoices Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <div>
            <h3 className="font-heading font-bold text-base text-white">
              Recent {company.name || 'Company'} Invoices
            </h3>
            <p className="text-xs text-slate-400">Dynamic invoice generator logs and real-time payment states</p>
          </div>
          <button
            onClick={() => setActiveTab('invoices')}
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
          >
            View All Invoices →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3.5">Bill #</th>
                <th className="p-3.5">Customer / Party</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5 text-right">Grand Total</th>
                <th className="p-3.5 text-center">Tax Type</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {invoices.slice(0, 5).map(inv => {
                const totals = calculateInvoiceTotals(
                  inv.items || [],
                  company.stateCode,
                  inv.partyStateCode,
                  inv.extraCharges || 0,
                  inv.roundOff !== false
                );
                const isIntra = company.stateCode === inv.partyStateCode;

                return (
                  <tr key={inv.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-white">
                      {inv.invoiceNumber}
                      <span className="block text-[10px] text-slate-400 font-normal">{inv.docType}</span>
                    </td>
                    <td className="p-3.5 font-medium">
                      <div className="text-white font-semibold">{inv.partyName}</div>
                      <div className="font-mono text-[10px] text-slate-400">{inv.partyGstin || 'URP'}</div>
                    </td>
                    <td className="p-3.5 text-slate-400 font-mono">{inv.invoiceDate}</td>
                    <td className="p-3.5 text-right font-mono font-bold text-white">
                      ₹{formatIndianNumber(totals.grandTotal)}
                    </td>
                    <td className="p-3.5 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isIntra 
                          ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' 
                          : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                      }`}>
                        {isIntra ? 'CGST+SGST' : 'IGST'}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <span className={`inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        inv.paymentStatus === 'Paid'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {inv.paymentStatus === 'Paid' ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <AlertCircle className="w-3 h-3" />
                        )}
                        <span>{inv.paymentStatus || 'Unpaid'}</span>
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => onViewInvoice(inv)}
                        className="inline-flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-amber-400 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View / Print</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
