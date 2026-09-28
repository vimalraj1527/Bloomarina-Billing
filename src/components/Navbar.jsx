import React, { useState } from 'react';
import { 
  Building2, 
  Plus, 
  Download, 
  Upload, 
  ChevronDown, 
  FileCheck,
  Flower2,
  LogOut,
  ShieldCheck,
  Lock
} from 'lucide-react';
import { exportAllDataJSON, importAllDataJSON } from '../utils/storage';

export default function Navbar({ 
  currentUser, 
  companies, 
  activeCompany, 
  setActiveCompanyId, 
  onNewInvoice,
  onDataRefresh,
  onLogout,
  onOpenAdminConsole 
}) {
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = importAllDataJSON(event.target.result);
      if (result.success) {
        alert('Data restored successfully!');
        if (onDataRefresh) onDataRefresh();
      } else {
        alert('Import failed: ' + result.message);
      }
    };
    reader.readAsText(file);
  };

  const isSuperAdmin = currentUser?.role === 'SuperAdmin';

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/95 backdrop-blur-xl border-b border-slate-800/80 px-2.5 sm:px-6 py-2.5 overflow-x-hidden">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-1.5 sm:gap-3">
        
        {/* Bloomarina Brand Logo */}
        <div className="flex items-center space-x-2 shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-emerald-400 p-0.5 shadow-lg shadow-amber-500/20 shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Flower2 className="w-4 h-4 sm:w-6 sm:h-6 text-amber-400 animate-pulse" />
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <span className="font-heading font-black text-sm sm:text-xl tracking-tight text-white truncate">
                Bloomarina <span className="hidden xs:inline bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-emerald-400 to-cyan-400">Billing</span>
              </span>
              {isSuperAdmin && (
                <span className="text-[9px] sm:text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 hidden md:flex items-center space-x-1 shrink-0">
                  <ShieldCheck className="w-3 h-3" />
                  <span>ADMIN</span>
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400 hidden lg:block">Professional Multi-Tenant GST Billing Suite</p>
          </div>
        </div>

        {/* Company Profile Display */}
        <div className="relative shrink min-w-0">
          {isSuperAdmin ? (
            <button
              onClick={() => setShowCompanyDropdown(!showCompanyDropdown)}
              className="flex items-center space-x-1.5 bg-slate-900/90 hover:bg-slate-800 border border-amber-500/40 rounded-xl px-2 sm:px-3 py-1.5 transition-all shadow-inner max-w-[110px] sm:max-w-[200px] md:max-w-[260px]"
              title="Super Admin: Click to switch tenant view"
            >
              <Building2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <div className="text-left min-w-0 flex-1 truncate">
                <span className="block text-[11px] sm:text-xs font-bold text-white truncate">
                  {activeCompany?.name || 'Bloomarina'}
                </span>
                <span className="hidden sm:block text-[9px] font-mono text-emerald-400 truncate">
                  GSTIN: {activeCompany?.gstin || 'N/A'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            </button>
          ) : (
            <div className="flex items-center space-x-1.5 bg-slate-900/90 border border-slate-800 rounded-xl px-2 sm:px-3 py-1.5 max-w-[110px] sm:max-w-[200px] md:max-w-[260px]">
              <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <div className="text-left min-w-0 flex-1 truncate">
                <span className="block text-[11px] sm:text-xs font-bold text-white truncate">
                  {activeCompany?.name || 'Company'}
                </span>
                <span className="hidden sm:block text-[9px] font-mono text-slate-400 truncate">
                  GSTIN: {activeCompany?.gstin || 'N/A'}
                </span>
              </div>
              <Lock className="w-3 h-3 text-slate-500 shrink-0" title="Locked to your company account" />
            </div>
          )}

          {/* Company Switcher Dropdown (Super Admin Only) */}
          {isSuperAdmin && showCompanyDropdown && (
            <div className="absolute right-0 mt-2 w-64 sm:w-72 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 p-2 divide-y divide-slate-800">
              <div className="px-3 py-2 text-[10px] font-semibold text-amber-400 uppercase tracking-wider flex items-center justify-between">
                <span>Tenant Inspector</span>
                <span className="text-[9px] font-mono bg-amber-500/20 px-1.5 py-0.5 rounded text-amber-300">ADMIN</span>
              </div>
              <div className="py-1 max-h-48 overflow-y-auto space-y-1">
                {companies.map((comp) => (
                  <button
                    key={comp.id}
                    onClick={() => {
                      setActiveCompanyId(comp.id);
                      setShowCompanyDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      comp.id === activeCompany?.id 
                        ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30' 
                        : 'text-slate-300 hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="truncate">
                      <div className="truncate font-semibold">{comp.name}</div>
                      <div className="text-[10px] font-mono text-slate-400">{comp.gstin}</div>
                    </div>
                    {comp.id === activeCompany?.id && <FileCheck className="w-4 h-4 text-amber-400 shrink-0 ml-2" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Session & Actions */}
        <div className="flex items-center space-x-1.5 sm:space-x-2.5 shrink-0">
          {/* Admin Console Shortcut */}
          {isSuperAdmin && (
            <button
              onClick={onOpenAdminConsole}
              className="flex items-center space-x-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg px-2 sm:px-3 py-1.5 text-xs font-bold transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Admin</span>
            </button>
          )}

          {/* Backup Data */}
          <button
            onClick={exportAllDataJSON}
            title="Backup data to JSON file"
            className="hidden lg:flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/60 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Backup</span>
          </button>

          {/* Restore Data */}
          <label 
            title="Restore data from JSON backup"
            className="hidden lg:flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/60 rounded-lg px-3 py-1.5 text-xs font-medium cursor-pointer transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-400" />
            <span>Restore</span>
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>

          {/* New Bill Button */}
          <button
            onClick={onNewInvoice}
            className="flex items-center space-x-1 sm:space-x-1.5 bg-gradient-to-r from-amber-500 via-rose-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-white font-black text-xs px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl shadow-lg shadow-amber-500/20 transition-all transform active:scale-95 shrink-0"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
            <span>+ Bill</span>
          </button>

          {/* Logout */}
          <button
            onClick={onLogout}
            title="Log out"
            className="p-1.5 sm:p-2 bg-slate-900 hover:bg-slate-800 text-rose-400 border border-slate-700/80 rounded-xl transition-colors shrink-0"
          >
            <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>

      </div>
    </header>
  );
}
