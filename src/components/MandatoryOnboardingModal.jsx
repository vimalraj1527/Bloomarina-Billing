import React, { useState } from 'react';
import { 
  Building2, 
  Save, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  Flower2, 
  ShieldCheck, 
  Sparkles,
  ArrowRight,
  Info
} from 'lucide-react';
import { GST_STATES, validateGSTIN, getStateCodeFromGSTIN, checkCompanyProfileCompleteness } from '../utils/gstCalculations';

export default function MandatoryOnboardingModal({ company, onSaveCompany }) {
  const [formData, setFormData] = useState({
    ...company,
    name: company?.name || '',
    gstin: company?.gstin || '',
    stateCode: company?.stateCode || '',
    stateName: company?.stateName || '',
    address: company?.address || '',
    city: company?.city || '',
    pincode: company?.pincode || '',
    phone: company?.phone || '',
    email: company?.email || '',
    bankName: company?.bankName || '',
    accountNo: company?.accountNo || '',
    ifsc: company?.ifsc || '',
    upiId: company?.upiId || '',
    invoicePrefix: company?.invoicePrefix || 'BLOOM-2425-'
  });

  const [errorMsg, setErrorMsg] = useState('');

  const completeness = checkCompanyProfileCompleteness(formData);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    let finalData = { ...formData };
    if (!finalData.stateCode && finalData.gstin && finalData.gstin.trim().length >= 2) {
      const code = getStateCodeFromGSTIN(finalData.gstin);
      if (code) {
        const st = GST_STATES.find(s => s.code === code);
        finalData.stateCode = code;
        if (st) finalData.stateName = st.name;
      }
    }

    const status = checkCompanyProfileCompleteness(finalData);

    if (!status.isComplete) {
      setErrorMsg(`Missing Mandatory Fields (${status.missingFields.length}): ${status.missingFields.join(', ')}`);
      return;
    }

    onSaveCompany(finalData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative max-h-[92vh] flex flex-col my-auto">
        
        {/* Header */}
        <div className="text-center space-y-2 border-b border-slate-800 pb-4">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-emerald-400 p-0.5 shadow-xl shadow-amber-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Flower2 className="w-6 h-6 text-amber-400" />
            </div>
          </div>

          <h1 className="font-heading font-black text-xl text-white tracking-tight">
            Mandatory Business Setup Required
          </h1>
          <p className="text-xs text-slate-400">
            Enter valid business & GST details to activate GST billing & invoice generation
          </p>

          {/* Progress Bar & Field Checklist */}
          <div className="max-w-xl mx-auto space-y-3 pt-2">
            <div className="flex justify-between text-[11px] font-bold">
              <span className="text-slate-400">Profile Completeness:</span>
              <span className={completeness.completionPercentage === 100 ? 'text-emerald-400 font-extrabold text-xs' : 'text-amber-400'}>
                {completeness.completionPercentage}% Completed
              </span>
            </div>
            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 via-rose-500 to-emerald-500 transition-all duration-500"
                style={{ width: `${completeness.completionPercentage}%` }}
              ></div>
            </div>

            {/* Live Field Checklist Badges */}
            <div className="flex flex-wrap justify-center gap-1.5 pt-1">
              {completeness.mandatoryChecks.map(check => (
                <span
                  key={check.field}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1 border ${
                    check.valid
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  }`}
                >
                  {check.valid ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <XCircle className="w-3 h-3 text-rose-400" />}
                  <span>{check.label}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Body - Empty textboxes with clean placeholders */}
        <form onSubmit={handleSubmit} className="overflow-y-auto space-y-4 pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Company Legal Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter Company Name"
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
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-emerald-400 font-bold focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">State & State Code *</label>
              <select
                value={formData.stateCode}
                onChange={(e) => {
                  const code = e.target.value;
                  const st = GST_STATES.find(s => s.code === code);
                  setFormData(prev => ({
                    ...prev,
                    stateCode: code,
                    stateName: st ? st.name : prev.stateName
                  }));
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
              >
                <option value="">-- Select State --</option>
                {GST_STATES.map(s => (
                  <option key={s.code} value={s.code}>{s.code} - {s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Phone Number *</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Enter Mobile / Phone Number"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Official Billing Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter Billing Email"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">City *</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="Enter City"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">PIN Code *</label>
              <input
                type="text"
                required
                value={formData.pincode}
                onChange={(e) => handleInputChange('pincode', e.target.value)}
                placeholder="Enter PIN Code"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">UPI Payment ID *</label>
              <input
                type="text"
                required
                value={formData.upiId}
                onChange={(e) => handleInputChange('upiId', e.target.value)}
                placeholder="Enter UPI ID"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-amber-400 font-bold focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Registered Address *</label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter Registered Premises / Street Address"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Bank Name *</label>
              <input
                type="text"
                required
                value={formData.bankName}
                onChange={(e) => handleInputChange('bankName', e.target.value)}
                placeholder="Enter Bank Name"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Bank Account Number *</label>
              <input
                type="text"
                required
                value={formData.accountNo}
                onChange={(e) => handleInputChange('accountNo', e.target.value)}
                placeholder="Enter Account Number"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Bank IFSC Code *</label>
              <input
                type="text"
                required
                value={formData.ifsc}
                onChange={(e) => handleInputChange('ifsc', e.target.value.toUpperCase())}
                placeholder="Enter IFSC Code"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-amber-500 focus:outline-none"
              />
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

          <div className="pt-4 border-t border-slate-800">
            <button
              type="submit"
              className="w-full py-3 text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 bg-gradient-to-r from-amber-500 via-rose-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 cursor-pointer shadow-amber-500/25"
            >
              <span>Save & Unlock GST Invoicing Suite</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
