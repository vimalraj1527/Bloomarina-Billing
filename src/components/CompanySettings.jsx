import React, { useState } from 'react';
import { 
  Building2, 
  Save, 
  Upload, 
  Plus, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles,
  Info,
  CreditCard,
  FileText,
  FileCheck
} from 'lucide-react';
import { GST_STATES, getStateCodeFromGSTIN } from '../utils/gstCalculations';

export default function CompanySettings({ 
  company, 
  companies, 
  onSaveCompany, 
  onAddNewCompany 
}) {
  const [formData, setFormData] = useState({
    ...company,
    name: company?.name || '',
    tradeName: company?.tradeName || '',
    gstin: company?.gstin || '',
    pan: company?.pan || '',
    stateCode: company?.stateCode || '',
    stateName: company?.stateName || '',
    address: company?.address || '',
    city: company?.city || '',
    pincode: company?.pincode || '',
    email: company?.email || '',
    phone: company?.phone || '',
    bankName: company?.bankName || '',
    accountNo: company?.accountNo || '',
    ifsc: company?.ifsc || '',
    branch: company?.branch || '',
    upiId: company?.upiId || '',
    termsAndConditions: company?.termsAndConditions || '1. Goods once sold will not be returned without valid verification.\n2. Payment due within 15 days of invoice issue date.',
    invoicePrefix: company?.invoicePrefix || 'BLOOM-2425-'
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'gstin') {
        const code = getStateCodeFromGSTIN(value);
        if (code) {
          const st = GST_STATES.find(s => s.code === code);
          if (st) {
            updated.stateCode = st.code;
            updated.stateName = st.name;
          }
        }
      }
      return updated;
    });
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      handleInputChange('logoUrl', event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSignatureUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      handleInputChange('signatureUrl', event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Company legal name is required.');
      return;
    }
    onSaveCompany(formData);
    alert('Company profile updated successfully!');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="font-heading font-extrabold text-xl text-white">Company Profile & Branding</h1>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
              Settings
            </span>
          </div>
          <p className="text-xs text-slate-400">Configure business identity, tax details, bank info, and digital stamp</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 via-rose-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-white font-black text-xs px-5 py-2 rounded-xl shadow-lg shadow-amber-500/25 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Business Identity */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="font-heading font-bold text-sm text-amber-400 uppercase tracking-wider flex items-center space-x-2">
            <Building2 className="w-4 h-4" />
            <span>1. Business Legal & Tax Registration</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Company Legal Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter Company Legal Name"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-semibold focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Trade / Brand Name</label>
              <input
                type="text"
                value={formData.tradeName}
                onChange={(e) => handleInputChange('tradeName', e.target.value)}
                placeholder="Enter Brand / Trade Name"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">15-Digit GSTIN *</label>
              <input
                type="text"
                maxLength={15}
                required
                value={formData.gstin}
                onChange={(e) => handleInputChange('gstin', e.target.value.toUpperCase())}
                placeholder="Enter 15-Digit GSTIN"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-emerald-400 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">PAN Number</label>
              <input
                type="text"
                maxLength={10}
                value={formData.pan}
                onChange={(e) => handleInputChange('pan', e.target.value.toUpperCase())}
                placeholder="Enter PAN Number"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">State & State Code</label>
              <select
                value={formData.stateCode}
                onChange={(e) => {
                  const code = e.target.value;
                  const st = GST_STATES.find(s => s.code === code);
                  handleInputChange('stateCode', code);
                  if (st) handleInputChange('stateName', st.name);
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
              >
                <option value="" disabled>-- Select State --</option>
                {GST_STATES.map(s => (
                  <option key={s.code} value={s.code}>{s.code} - {s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Invoice Prefix Format</label>
              <input
                type="text"
                value={formData.invoicePrefix}
                onChange={(e) => handleInputChange('invoicePrefix', e.target.value)}
                placeholder="Enter Invoice Prefix"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-amber-400 font-bold focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Contact & Registered Address */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="font-heading font-bold text-sm text-amber-400 uppercase tracking-wider flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>2. Registered Address & Contact Details</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Building Address / Premises</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter Premises Address"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="Enter City"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">PIN Code</label>
              <input
                type="text"
                value={formData.pincode}
                onChange={(e) => handleInputChange('pincode', e.target.value)}
                placeholder="Enter PIN Code"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Official Billing Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter Email Address"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Enter Phone Number"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Bank & UPI Payment Gateway */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="font-heading font-bold text-sm text-amber-400 uppercase tracking-wider flex items-center space-x-2">
            <CreditCard className="w-4 h-4" />
            <span>3. Bank Account & Dynamic UPI QR Settlement</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Bank Name</label>
              <input
                type="text"
                value={formData.bankName}
                onChange={(e) => handleInputChange('bankName', e.target.value)}
                placeholder="Enter Bank Name"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Account Number</label>
              <input
                type="text"
                value={formData.accountNo}
                onChange={(e) => handleInputChange('accountNo', e.target.value)}
                placeholder="Enter Account Number"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">IFSC Code</label>
              <input
                type="text"
                value={formData.ifsc}
                onChange={(e) => handleInputChange('ifsc', e.target.value.toUpperCase())}
                placeholder="Enter IFSC Code"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">UPI ID (For Auto Invoice QR)</label>
              <input
                type="text"
                value={formData.upiId}
                onChange={(e) => handleInputChange('upiId', e.target.value)}
                placeholder="Enter UPI ID"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-amber-400 font-bold focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Brand Logo & Signature Stamp */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="font-heading font-bold text-sm text-amber-400 uppercase tracking-wider">
              Company Brand Logo Image
            </h3>

            {formData.logoUrl && (
              <div className="p-3 bg-white rounded-xl flex items-center justify-center">
                <img src={formData.logoUrl} alt="Company Logo" className="h-16 object-contain" />
              </div>
            )}

            <label className="flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-xl p-3 text-xs font-semibold cursor-pointer transition-colors">
              <Upload className="w-4 h-4 text-amber-400" />
              <span>Upload Brand Logo Image</span>
              <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
            </label>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="font-heading font-bold text-sm text-amber-400 uppercase tracking-wider">
              Authorized Signatory Stamp / Seal
            </h3>

            {formData.signatureUrl && (
              <div className="p-3 bg-white rounded-xl flex items-center justify-center">
                <img src={formData.signatureUrl} alt="Signature Stamp" className="h-16 object-contain" />
              </div>
            )}

            <label className="flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-xl p-3 text-xs font-semibold cursor-pointer transition-colors">
              <Upload className="w-4 h-4 text-emerald-400" />
              <span>Upload Digital Stamp Seal</span>
              <input type="file" accept="image/*" onChange={handleSignatureUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* Section 5: Standard Invoice Terms */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
          <h3 className="font-heading font-bold text-sm text-amber-400 uppercase tracking-wider">
            Standard Invoice Terms & Conditions
          </h3>

          <textarea
            rows={4}
            value={formData.termsAndConditions}
            onChange={(e) => handleInputChange('termsAndConditions', e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:border-amber-500 focus:outline-none leading-relaxed font-mono"
          />
        </div>
      </form>
    </div>
  );
}
