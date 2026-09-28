import React, { useState } from 'react';
import { Package, Plus, Edit3, Trash2, Search, Tag, Sparkles } from 'lucide-react';
import { formatCurrency, formatIndianNumber } from '../utils/gstCalculations';
import { HSN_DATABASE, searchHSN } from '../utils/hsnDatabase';

export default function InventoryManager({ items, onSaveItem, onDeleteItem }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDrawer, setShowDrawer] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [hsnCode, setHsnCode] = useState('');
  const [unit, setUnit] = useState('Pcs');
  const [sellingPrice, setSellingPrice] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [gstRate, setGstRate] = useState(18);
  const [isTaxInclusive, setIsTaxInclusive] = useState(false);
  const [stockQty, setStockQty] = useState('');
  const [type, setType] = useState('Goods');

  const openNewItemDrawer = () => {
    setEditingItem(null);
    setName('');
    setHsnCode('');
    setUnit('Pcs');
    setSellingPrice('');
    setPurchasePrice('');
    setGstRate(18);
    setIsTaxInclusive(false);
    setStockQty('');
    setType('Goods');
    setShowDrawer(true);
  };

  const openEditItemDrawer = (item) => {
    setEditingItem(item);
    setName(item.name || '');
    setHsnCode(item.hsnCode || '');
    setUnit(item.unit || 'Pcs');
    setSellingPrice(item.sellingPrice ?? '');
    setPurchasePrice(item.purchasePrice ?? '');
    setGstRate(item.gstRate ?? 18);
    setIsTaxInclusive(item.isTaxInclusive || false);
    setStockQty(item.stockQty ?? '');
    setType(item.type || 'Goods');
    setShowDrawer(true);
  };

  const handleHsnSelect = (hsnObj) => {
    setHsnCode(hsnObj.code);
    setGstRate(hsnObj.defaultGst);
    setType(hsnObj.type);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter item name.');
      return;
    }

    const payload = {
      id: editingItem?.id || `item_${Date.now()}`,
      name,
      hsnCode,
      unit,
      sellingPrice: Number(sellingPrice) || 0,
      purchasePrice: Number(purchasePrice) || 0,
      gstRate: Number(gstRate) || 0,
      isTaxInclusive,
      stockQty: Number(stockQty) || 0,
      type
    };

    onSaveItem(payload);
    setShowDrawer(false);
  };

  const filteredItems = items.filter(i => 
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.hsnCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-slate-800">
        <div>
          <h1 className="font-heading font-extrabold text-xl text-white">Items & Inventory</h1>
          <p className="text-xs text-slate-400">Master product catalog, HSN/SAC codes, and GST rates</p>
        </div>

        <button
          onClick={openNewItemDrawer}
          className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 via-rose-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-amber-500/25 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>+ Add Product / Service</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        <input
          type="text"
          placeholder="Search items by name or HSN code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
        />
      </div>

      {/* Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3.5">Item Name</th>
                <th className="p-3.5">Type</th>
                <th className="p-3.5 text-center">HSN/SAC</th>
                <th className="p-3.5 text-right">Selling Rate</th>
                <th className="p-3.5 text-center">GST %</th>
                <th className="p-3.5 text-right">Current Stock</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No products or services found in your inventory catalog.
                  </td>
                </tr>
              ) : (
                filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-white text-sm">{item.name}</div>
                      <div className="text-[10px] text-slate-400">Unit: {item.unit}</div>
                    </td>

                    <td className="p-3.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        item.type === 'Service' 
                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                          : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                      }`}>
                        {item.type || 'Goods'}
                      </span>
                    </td>

                    <td className="p-3.5 text-center font-mono font-bold text-emerald-400">
                      {item.hsnCode || '-'}
                    </td>

                    <td className="p-3.5 text-right font-mono font-bold text-white">
                      ₹{formatIndianNumber(item.sellingPrice)}
                    </td>

                    <td className="p-3.5 text-center font-mono text-amber-400 font-bold">
                      {item.gstRate}%
                    </td>

                    <td className="p-3.5 text-right font-mono font-semibold">
                      {item.type === 'Service' ? (
                        <span className="text-slate-500 font-normal">N/A</span>
                      ) : (
                        <span className={item.stockQty > 5 ? 'text-emerald-400' : 'text-amber-400'}>
                          {item.stockQty} {item.unit}
                        </span>
                      )}
                    </td>

                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => openEditItemDrawer(item)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete ${item.name}?`)) onDeleteItem(item.id);
                          }}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-rose-400 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer */}
      {showDrawer && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-lg bg-slate-900 border-l border-slate-800 h-full p-6 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="font-heading font-bold text-lg text-white">
                {editingItem ? 'Edit Product / Service' : 'Add New Item to Catalog'}
              </h2>
              <button onClick={() => setShowDrawer(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Item Description *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter Product / Service Description"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* HSN Directory Quick Selector */}
              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                  HSN / SAC Code Lookup Directory
                </span>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {HSN_DATABASE.slice(0, 6).map(h => (
                    <button
                      key={h.code}
                      type="button"
                      onClick={() => handleHsnSelect(h)}
                      className="w-full text-left p-1.5 rounded hover:bg-slate-800 text-[11px] flex justify-between items-center transition-colors"
                    >
                      <span className="font-mono text-emerald-400 font-bold">{h.code}</span>
                      <span className="truncate max-w-[220px] text-slate-300">{h.description}</span>
                      <span className="text-amber-400 font-bold">{h.defaultGst}%</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">HSN/SAC Code</label>
                  <input
                    type="text"
                    value={hsnCode}
                    onChange={(e) => setHsnCode(e.target.value)}
                    placeholder="Enter HSN / SAC Code"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-emerald-400 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">GST Rate %</label>
                  <select
                    value={gstRate}
                    onChange={(e) => setGstRate(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-amber-400 focus:border-amber-500 focus:outline-none"
                  >
                    <option value={0}>0% (Exempt)</option>
                    <option value={5}>5%</option>
                    <option value={12}>12%</option>
                    <option value={18}>18%</option>
                    <option value={28}>28%</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Selling Rate (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    placeholder="Enter Selling Price"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Unit of Measure</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="Pcs">Pcs</option>
                    <option value="Kg">Kg</option>
                    <option value="Mtr">Mtr</option>
                    <option value="Box">Box</option>
                    <option value="Set">Set</option>
                    <option value="Hrs">Hrs</option>
                    <option value="Yr">Yr</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Item Category</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="Goods">Goods (Physical Product)</option>
                    <option value="Service">Service</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Initial Stock Qty</label>
                  <input
                    type="number"
                    value={stockQty}
                    onChange={(e) => setStockQty(e.target.value)}
                    placeholder="Enter Stock Quantity"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowDrawer(false)}
                  className="bg-slate-800 text-slate-300 px-4 py-2 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-amber-500 to-emerald-500 text-white px-5 py-2 rounded-xl text-xs font-black shadow-lg"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
