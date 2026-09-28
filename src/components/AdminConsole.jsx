import React, { useState } from 'react';
import { 
  ShieldCheck, 
  UserPlus, 
  Users, 
  Building2, 
  Key, 
  Lock, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  Sparkles,
  TrendingUp,
  FileText,
  Search,
  EyeOff,
  Phone,
  MapPin,
  Landmark,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { 
  formatCurrency, 
  formatIndianNumber, 
  calculateInvoiceTotals, 
  getStateCodeFromGSTIN, 
  getStateNameByCode 
} from '../utils/gstCalculations';

export default function AdminConsole({ 
  currentUser, 
  users, 
  companies, 
  invoices, 
  onSaveUser, 
  onDeleteUser, 
  onSwitchCompanyView 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDrawer, setShowAddDrawer] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showPasswords, setShowPasswords] = useState({});

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [gstin, setGstin] = useState('');
  const [role, setRole] = useState('User');
  const [status, setStatus] = useState('Active');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNo, setAccountNo] = useState('');
  const [ifsc, setIfsc] = useState('');

  const openAddUserModal = () => {
    setEditingUser(null);
    setEmail('');
    setPassword('');
    setName('');
    setCompanyName('');
    setGstin('');
    setRole('User');
    setStatus('Active');
    setPhone('');
    setAddress('');
    setCity('');
    setPincode('');
    setBankName('');
    setAccountNo('');
    setIfsc('');
    setShowAddDrawer(true);
  };

  const openEditUserModal = (u) => {
    const comp = companies.find(c => c.id === u.companyId);
    setEditingUser(u);
    setEmail(u.email || '');
    setPassword(u.password || '');
    setName(u.name || '');
    setRole(u.role || 'User');
    setStatus(u.status || 'Active');
    
    if (comp) {
      setCompanyName(comp.name || '');
      setGstin(comp.gstin || '');
      setPhone(comp.phone || '');
      setAddress(comp.address || '');
      setCity(comp.city || '');
      setPincode(comp.pincode || '');
      setBankName(comp.bankName || '');
      setAccountNo(comp.accountNo || '');
      setIfsc(comp.ifsc || '');
    } else {
      setCompanyName('');
      setGstin('');
      setPhone('');
      setAddress('');
      setCity('');
      setPincode('');
      setBankName('');
      setAccountNo('');
      setIfsc('');
    }
    setShowAddDrawer(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim() || !companyName.trim()) {
      alert('Email, password, and business name are required.');
      return;
    }

    let targetCompId = editingUser ? editingUser.companyId : `comp_user_${Date.now()}`;
    const existingComp = companies.find(c => c.id === targetCompId);

    const cleanGstin = gstin.trim().toUpperCase();
    const derivedStateCode = getStateCodeFromGSTIN(cleanGstin);
    const derivedStateName = getStateNameByCode(derivedStateCode) || (existingComp?.stateName || '');

    const compPayload = {
      id: targetCompId,
      name: companyName,
      tradeName: companyName,
      gstin: cleanGstin,
      pan: cleanGstin.length >= 10 ? cleanGstin.substring(2, 12) : (existingComp?.pan || ''),
      stateCode: derivedStateCode || existingComp?.stateCode || '',
      stateName: derivedStateName,
      email: email,
      phone: phone || existingComp?.phone || '',
      address: address || existingComp?.address || '',
      city: city || existingComp?.city || '',
      pincode: pincode || existingComp?.pincode || '',
      bankName: bankName || existingComp?.bankName || '',
      accountNo: accountNo || existingComp?.accountNo || '',
      ifsc: ifsc || existingComp?.ifsc || '',
      branch: existingComp?.branch || '',
      upiId: existingComp?.upiId || '',
      logoUrl: existingComp?.logoUrl || '',
      signatureUrl: existingComp?.signatureUrl || '',
      termsAndConditions: existingComp?.termsAndConditions || '1. Goods once sold will not be returned without valid verification.\n2. Payment due within 15 days of invoice issue date.',
      invoicePrefix: existingComp?.invoicePrefix || `${companyName.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase() || 'INV'}-2425-`,
      nextInvoiceNumber: existingComp?.nextInvoiceNumber || 101,
      defaultTemplate: existingComp?.defaultTemplate || 'sairam'
    };

    const userPayload = {
      id: editingUser ? editingUser.id : `user_${Date.now()}`,
      email: email.trim().toLowerCase(),
      password,
      name: name || companyName,
      role,
      companyId: targetCompId,
      status: status || 'Active',
      createdAt: editingUser ? editingUser.createdAt : new Date().toISOString().slice(0, 10)
    };

    onSaveUser(userPayload, compPayload);
    setShowAddDrawer(false);
  };

  const handleToggleUserStatus = (u) => {
    const newStatus = u.status === 'Disabled' ? 'Active' : 'Disabled';
    const comp = companies.find(c => c.id === u.companyId);
    
    const updatedUser = { ...u, status: newStatus };
    const updatedComp = comp || {
      id: u.companyId,
      name: u.name,
      email: u.email,
      defaultTemplate: 'sairam'
    };

    onSaveUser(updatedUser, updatedComp);
  };

  const togglePasswordVisibility = (userId) => {
    setShowPasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  // Compute Platform Overview Metrics Dynamically
  let totalPlatformVolume = 0;
  invoices.forEach(inv => {
    const totals = calculateInvoiceTotals(inv);
    totalPlatformVolume += (totals.grandTotal || 0);
  });

  const filteredUsers = users.filter(u => {
    const comp = companies.find(c => c.id === u.companyId);
    const search = searchTerm.toLowerCase().trim();
    if (!search) return true;
    return (
      u.email.toLowerCase().includes(search) ||
      u.name.toLowerCase().includes(search) ||
      (comp && comp.name.toLowerCase().includes(search)) ||
      (comp && comp.gstin.toLowerCase().includes(search))
    );
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/60 p-6 border border-slate-800 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              <span className="text-xs font-black uppercase tracking-widest text-amber-400">
                Super Admin Console
              </span>
            </div>
            <h1 className="font-heading font-black text-2xl text-white tracking-tight">
              Multi-Tenant User Management & Business Control
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Logged in as Super Admin: <span className="font-mono text-emerald-400 font-bold">{currentUser?.email}</span>
            </p>
          </div>

          <button
            onClick={openAddUserModal}
            className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 via-rose-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-amber-500/25 transition-all"
          >
            <UserPlus className="w-4 h-4 stroke-[3]" />
            <span>+ Create User Account</span>
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-amber-400">
            <Users className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">Accounts</span>
          </div>
          <div className="font-heading font-black text-2xl text-white">{users.length}</div>
          <p className="text-[11px] text-slate-400">Registered Business Accounts</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-emerald-400">
            <FileText className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">Invoices</span>
          </div>
          <div className="font-heading font-black text-2xl text-white">{invoices.length}</div>
          <p className="text-[11px] text-slate-400">System-wide Generated Documents</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-purple-400">
            <TrendingUp className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20">Volume</span>
          </div>
          <div className="font-heading font-black text-2xl text-white">{formatCurrency(totalPlatformVolume)}</div>
          <p className="text-[11px] text-slate-400">Total Billed Across All Companies</p>
        </div>
      </div>

      {/* User Accounts Directory */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-heading font-bold text-base text-white">Registered Business Accounts</h3>
            <p className="text-xs text-slate-400">Manage user credentials, tenant permissions, and GST business profiles</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search user, company, GSTIN..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3.5">User Account</th>
                <th className="p-3.5">Business & GSTIN</th>
                <th className="p-3.5 font-mono">Password</th>
                <th className="p-3.5 text-center">Billed Volume</th>
                <th className="p-3.5 text-center">Role</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No business accounts found matching your search.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(u => {
                  const comp = companies.find(c => c.id === u.companyId);
                  const companyInvoices = invoices.filter(i => i.companyId === u.companyId);
                  const companyVolume = companyInvoices.reduce((sum, inv) => sum + calculateInvoiceTotals(inv).grandTotal, 0);
                  const isPassVisible = showPasswords[u.id];

                  return (
                    <tr key={u.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-white text-sm">{u.email}</div>
                        <div className="text-[10px] text-slate-400">{u.name}</div>
                      </td>

                      <td className="p-3.5">
                        <div className="font-semibold text-amber-300">
                          {comp ? comp.name : 'Unassigned'}
                        </div>
                        {comp && (
                          <div className="text-[10px] font-mono text-emerald-400">
                            GST: {comp.gstin || 'Pending Setup'} {comp.stateName ? `(${comp.stateName})` : ''}
                          </div>
                        )}
                      </td>

                      <td className="p-3.5 font-mono text-slate-300">
                        <div className="flex items-center space-x-1.5">
                          <span>{isPassVisible ? u.password : '••••••••'}</span>
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility(u.id)}
                            className="text-slate-500 hover:text-amber-400 p-0.5"
                            title={isPassVisible ? "Hide password" : "Show password"}
                          >
                            {isPassVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>

                      <td className="p-3.5 text-center">
                        <div className="font-bold text-white">{formatCurrency(companyVolume)}</div>
                        <div className="text-[10px] text-slate-400">{companyInvoices.length} Invoices</div>
                      </td>

                      <td className="p-3.5 text-center">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          u.role === 'SuperAdmin' 
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                        }`}>
                          {u.role}
                        </span>
                      </td>

                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => u.role !== 'SuperAdmin' && handleToggleUserStatus(u)}
                          disabled={u.role === 'SuperAdmin'}
                          title={u.role === 'SuperAdmin' ? "Super Admin status cannot be toggled" : "Click to toggle Active / Disabled status"}
                          className={`inline-flex items-center space-x-1 text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all ${
                            u.status !== 'Disabled'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
                          } ${u.role === 'SuperAdmin' ? 'cursor-default' : 'cursor-pointer'}`}
                        >
                          {u.status !== 'Disabled' ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>Active</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-3 h-3 text-rose-400" />
                              <span>Disabled</span>
                            </>
                          )}
                        </button>
                      </td>

                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => onSwitchCompanyView(u.companyId)}
                            title="Inspect User Company Data"
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg text-[11px] font-semibold transition-colors flex items-center space-x-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span className="hidden lg:inline">View Data</span>
                          </button>

                          <button
                            onClick={() => openEditUserModal(u)}
                            title="Edit User & Company Profile"
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-lg transition-colors"
                          >
                            <Key className="w-4 h-4" />
                          </button>

                          {u.role !== 'SuperAdmin' && (
                            <button
                              onClick={() => {
                                if (confirm(`Delete user account ${u.email}?`)) onDeleteUser(u.id);
                              }}
                              title="Delete User Account"
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-rose-400 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
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

      {/* Create / Edit User Drawer */}
      {showAddDrawer && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-xl bg-slate-900 border-l border-slate-800 h-full p-6 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="font-heading font-bold text-lg text-white">
                  {editingUser ? 'Edit Account & Business Profile' : 'Create New User Account'}
                </h2>
                <p className="text-xs text-slate-400">Configure login credentials, role, status, and GST business profile</p>
              </div>
              <button 
                onClick={() => setShowAddDrawer(false)} 
                className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Account Credentials Section */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                  1. Login Credentials & Access Control
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">User Email / Username *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter User Email"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Account Password *</label>
                    <input
                      type="text"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter Password"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Account Holder Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter Full Name"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">User Role</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                    >
                      <option value="User">Regular Business User</option>
                      <option value="SuperAdmin">Super Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Account Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      disabled={editingUser?.role === 'SuperAdmin'}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none disabled:opacity-50"
                    >
                      <option value="Active">Active</option>
                      <option value="Disabled">Disabled</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Business & GST Profile Section */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
                  2. Business Legal & GST Details
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Business Legal Name *</label>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Enter Business Name"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">15-Digit GSTIN</label>
                    <input
                      type="text"
                      maxLength={15}
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value.toUpperCase())}
                      placeholder="Enter 15-Digit GSTIN"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-emerald-400 focus:border-amber-500 focus:outline-none"
                    />
                    {gstin.length >= 2 && (
                      <span className="text-[10px] text-slate-400 block mt-1">
                        Derived State: <strong className="text-amber-300">{getStateNameByCode(getStateCodeFromGSTIN(gstin)) || 'Custom/Unknown'}</strong> (Code: {getStateCodeFromGSTIN(gstin)})
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Phone / Mobile Number</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter Mobile Number"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">City / Region</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Enter City Name"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Business Registered Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter Office / Shop Street Address"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Bank Details Section */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-1">
                  3. Banking & Settlement Details (Optional Initial Setup)
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Bank Name</label>
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="Enter Bank Name"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Account Number</label>
                    <input
                      type="text"
                      value={accountNo}
                      onChange={(e) => setAccountNo(e.target.value)}
                      placeholder="Enter Account Number"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">IFSC Code</label>
                    <input
                      type="text"
                      value={ifsc}
                      onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                      placeholder="Enter IFSC Code"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddDrawer(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-amber-500 via-rose-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-white px-5 py-2 rounded-xl text-xs font-black shadow-lg transition-all"
                >
                  Save User & Business Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

