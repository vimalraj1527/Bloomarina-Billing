import React, { useState } from 'react';
import { Users, Plus, Edit3, Trash2, Search, CheckCircle2, AlertCircle, Building2 } from 'lucide-react';
import { GST_STATES, validateGSTIN, getStateCodeFromGSTIN } from '../utils/gstCalculations';

export default function PartyManager({ parties, onSaveParty, onDeleteParty }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [partyTypeFilter, setPartyTypeFilter] = useState('All');
  const [showDrawer, setShowDrawer] = useState(false);
  const [editingParty, setEditingParty] = useState(null);

  // Form State - empty defaults relying on placeholders
  const [name, setName] = useState('');
  const [partyType, setPartyType] = useState('Customer');
  const [gstin, setGstin] = useState('');
  const [stateCode, setStateCode] = useState('');
  const [stateName, setStateName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [creditPeriodDays, setCreditPeriodDays] = useState(30);

  const openNewPartyDrawer = () => {
    setEditingParty(null);
    setName('');
    setPartyType('Customer');
    setGstin('');
    setStateCode('');
    setStateName('');
    setEmail('');
    setPhone('');
    setBillingAddress('');
    setShippingAddress('');
    setCreditPeriodDays(30);
    setShowDrawer(true);
  };

  const openEditPartyDrawer = (party) => {
    setEditingParty(party);
    setName(party.name || '');
    setPartyType(party.partyType || 'Customer');
    setGstin(party.gstin || '');
    setStateCode(party.stateCode || '');
    setStateName(party.stateName || '');
    setEmail(party.email || '');
    setPhone(party.phone || '');
    setBillingAddress(party.billingAddress || '');
    setShippingAddress(party.shippingAddress || '');
    setCreditPeriodDays(party.creditPeriodDays || 30);
    setShowDrawer(true);
  };

  const handleGstinChange = (val) => {
    setGstin(val);
    const code = getStateCodeFromGSTIN(val);
    if (code) {
      const match = GST_STATES.find(s => s.code === code);
      if (match) {
        setStateCode(match.code);
        setStateName(match.name);
      }
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter party name.');
      return;
    }

    const payload = {
      id: editingParty?.id || `party_${Date.now()}`,
      name,
      partyType,
      gstin: gstin.toUpperCase(),
      stateCode,
      stateName,
      email,
      phone,
      billingAddress,
      shippingAddress: shippingAddress || billingAddress,
      creditPeriodDays: Number(creditPeriodDays) || 30
    };

    onSaveParty(payload);
    setShowDrawer(false);
  };

  const filteredParties = parties.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.gstin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.phone?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = partyTypeFilter === 'All' || p.partyType === partyTypeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-slate-800">
        <div>
          <h1 className="font-heading font-extrabold text-xl text-white">Customers & Vendors</h1>
          <p className="text-xs text-slate-400">Manage client master, GSTINs, and billing addresses</p>
        </div>

        <button
          onClick={openNewPartyDrawer}
          className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 via-rose-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-amber-500/25 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>+ Add New Party</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative sm:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search party by name, GSTIN, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div>
          <select
            value={partyTypeFilter}
            onChange={(e) => setPartyTypeFilter(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
          >
            <option value="All">All Party Types</option>
            <option value="Customer">Customers</option>
            <option value="Supplier">Suppliers / Vendors</option>
          </select>
        </div>
      </div>

      {/* Parties Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3.5">Party Name</th>
                <th className="p-3.5">Type</th>
                <th className="p-3.5">GSTIN / State</th>
                <th className="p-3.5">Contact Details</th>
                <th className="p-3.5">Address</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredParties.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No customers or vendors found.
                  </td>
                </tr>
              ) : (
                filteredParties.map(p => (
                  <tr key={p.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-white text-sm">{p.name}</div>
                      <div className="text-[10px] text-slate-400">Credit Term: {p.creditPeriodDays || 30} Days</div>
                    </td>

                    <td className="p-3.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        p.partyType === 'Supplier' 
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {p.partyType || 'Customer'}
                      </span>
                    </td>

                    <td className="p-3.5">
                      {p.gstin ? (
                        <div>
                          <span className="font-mono font-bold text-emerald-400">{p.gstin}</span>
                          <span className="block text-[10px] text-slate-400">{p.stateName} ({p.stateCode})</span>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">Unregistered (URP)</span>
                      )}
                    </td>

                    <td className="p-3.5">
                      <div className="text-slate-200">{p.phone || '-'}</div>
                      <div className="text-[10px] text-slate-400">{p.email || '-'}</div>
                    </td>

                    <td className="p-3.5 max-w-xs truncate text-slate-400">
                      {p.billingAddress || '-'}
                    </td>

                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => openEditPartyDrawer(p)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete party ${p.name}?`)) onDeleteParty(p.id);
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

      {/* Add / Edit Drawer Modal */}
      {showDrawer && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-lg bg-slate-900 border-l border-slate-800 h-full p-6 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="font-heading font-bold text-lg text-white">
                {editingParty ? 'Edit Party Details' : 'Add New Customer / Vendor'}
              </h2>
              <button
                onClick={() => setShowDrawer(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Party Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter Party Name"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Party Type</label>
                <select
                  value={partyType}
                  onChange={(e) => setPartyType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                >
                  <option value="Customer">Customer</option>
                  <option value="Supplier">Supplier / Vendor</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">GSTIN (15-Digit)</label>
                <input
                  type="text"
                  maxLength={15}
                  value={gstin}
                  onChange={(e) => handleGstinChange(e.target.value.toUpperCase())}
                  placeholder="Enter 15-Digit GSTIN"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-emerald-400 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">State / Location</label>
                <select
                  value={stateCode}
                  onChange={(e) => {
                    const code = e.target.value;
                    const st = GST_STATES.find(s => s.code === code);
                    setStateCode(code);
                    if (st) setStateName(st.name);
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                >
                  <option value="">-- Select State --</option>
                  {GST_STATES.map(s => (
                    <option key={s.code} value={s.code}>{s.code} - {s.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter Phone Number"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter Email Address"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Billing Address</label>
                <textarea
                  rows={3}
                  value={billingAddress}
                  onChange={(e) => setBillingAddress(e.target.value)}
                  placeholder="Enter full address"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
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
                  Save Party
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
