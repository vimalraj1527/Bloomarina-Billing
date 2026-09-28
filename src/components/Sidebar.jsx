import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  FileCheck2, 
  ArrowLeftRight, 
  Users, 
  Package, 
  BarChart3, 
  Settings,
  ShieldCheck,
  Flower2
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, currentUser }) {
  const isSuperAdmin = currentUser?.role === 'SuperAdmin';

  const menuItems = [
    ...(isSuperAdmin ? [{ id: 'admin', label: 'Super Admin Console', icon: ShieldCheck, badge: 'ADMIN' }] : []),
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'invoices', label: 'Sales Invoices', icon: FileText, badge: 'GST' },
    { id: 'proformas', label: 'Quotations / Proforma', icon: FileCheck2 },
    { id: 'notes', label: 'Credit / Debit Notes', icon: ArrowLeftRight },
    { id: 'parties', label: 'Customers & Vendors', icon: Users },
    { id: 'inventory', label: 'Items & Inventory', icon: Package },
    { id: 'gstr', label: 'GSTR Reports', icon: BarChart3, badge: 'CA Ready' },
    { id: 'settings', label: 'Company Settings', icon: Settings },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-64 shrink-0 glass-panel border-r border-slate-800/80 min-h-[calc(100vh-65px)] p-4 hidden md:flex flex-col justify-between">
        <div className="space-y-1.5">
          <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Main Navigation
          </div>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500/20 to-emerald-500/10 text-amber-400 border border-amber-500/30 shadow-md shadow-slate-950/50'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                    isActive ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer Session Info */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/60 p-3.5 rounded-2xl border border-slate-800 space-y-1.5">
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-400 truncate">
            <Flower2 className="w-4 h-4 shrink-0" />
            <span className="truncate">{currentUser?.name || 'Bloomarina User'}</span>
          </div>
          <p className="text-[10px] text-slate-400 truncate">
            {currentUser?.email}
          </p>
        </div>
      </aside>

      {/* Mobile Sticky Bottom Navigation Bar (For Mobile Bookmarks & PWA) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/90 px-1 py-2 flex items-center justify-around shadow-2xl pb-safe">
        {menuItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                isActive
                  ? 'text-amber-400 font-bold bg-amber-500/10 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 mb-1 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
              <span className="text-[10px] leading-none truncate max-w-[64px]">
                {item.id === 'dashboard' ? 'Home' : item.id === 'invoices' ? 'Bills' : item.id === 'parties' ? 'Clients' : item.id === 'inventory' ? 'Stock' : item.id === 'gstr' ? 'GSTR' : 'More'}
              </span>
            </button>
          );
        })}

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
            activeTab === 'settings'
              ? 'text-amber-400 font-bold bg-amber-500/10 border border-amber-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Settings className={`w-5 h-5 mb-1 ${activeTab === 'settings' ? 'text-amber-400' : 'text-slate-400'}`} />
          <span className="text-[10px] leading-none">Settings</span>
        </button>
      </nav>
    </>
  );
}
