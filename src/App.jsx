import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import LoginModal from './components/LoginModal';
import AdminConsole from './components/AdminConsole';
import MandatoryOnboardingModal from './components/MandatoryOnboardingModal';
import Dashboard from './components/Dashboard';
import InvoiceList from './components/InvoiceList';
import InvoiceEditor from './components/InvoiceEditor';
import PartyManager from './components/PartyManager';
import InventoryManager from './components/InventoryManager';
import GstrReports from './components/GstrReports';
import CompanySettings from './components/CompanySettings';
import SairamExactTemplate from './components/InvoiceTemplates/SairamExactTemplate';
import ModernTemplate from './components/InvoiceTemplates/ModernTemplate';
import ClassicTemplate from './components/InvoiceTemplates/ClassicTemplate';
import MinimalTemplate from './components/InvoiceTemplates/MinimalTemplate';
import ThermalTemplate from './components/InvoiceTemplates/ThermalTemplate';
import html2pdf from 'html2pdf.js';
import { Download, Printer, X, AlertTriangle } from 'lucide-react';
import { 
  getCurrentSession,
  setCurrentSession,
  getStoredUsers,
  saveUsers,
  getStoredCompanies, 
  saveCompanies, 
  getActiveCompany, 
  setActiveCompanyId as setStoredActiveCompanyId,
  getStoredInvoices, 
  saveInvoices, 
  getStoredParties, 
  saveParties, 
  getStoredItems, 
  saveItems 
} from './utils/storage';
import { checkCompanyProfileCompleteness } from './utils/gstCalculations';

export default function App() {
  const [currentUser, setCurrentUser] = useState(getCurrentSession());
  const [activeTab, setActiveTab] = useState('dashboard');

  // Master Data States
  const [users, setUsers] = useState(getStoredUsers());
  const [companies, setCompanies] = useState(getStoredCompanies());
  const [activeCompany, setActiveCompany] = useState(getActiveCompany());
  const [invoices, setInvoices] = useState(getStoredInvoices());
  const [parties, setParties] = useState(getStoredParties());
  const [items, setItems] = useState(getStoredItems());

  // Invoice Editor & View Modal State
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [viewingInvoice, setViewingInvoice] = useState(null);
  const [previewTemplate, setPreviewTemplate] = useState('sairam');

  // Sync active company based on current logged in user
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'SuperAdmin') {
        setActiveTab('admin');
      } else {
        setActiveTab('dashboard');
        const userComp = companies.find(c => c.id === currentUser.companyId) || companies[0];
        if (userComp) {
          setActiveCompany(userComp);
          setStoredActiveCompanyId(userComp.id);
        }
      }
    }
  }, [currentUser]);

  const companyCompleteness = checkCompanyProfileCompleteness(activeCompany);

  // Handle Login & Logout
  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentSession(null);
    setCurrentUser(null);
  };

  // Reload data state handler
  const refreshAllData = () => {
    const usrs = getStoredUsers();
    const comps = getStoredCompanies();
    setUsers(usrs);
    setCompanies(comps);
    setActiveCompany(getActiveCompany());
    setInvoices(getStoredInvoices());
    setParties(getStoredParties());
    setItems(getStoredItems());
  };

  const handleCompanyChange = (id) => {
    setStoredActiveCompanyId(id);
    const comps = getStoredCompanies();
    const act = comps.find(c => c.id === id) || comps[0];
    setActiveCompany(act);
  };

  // Save Company handler
  const handleSaveCompany = (updatedCompany) => {
    const updatedComps = companies.map(c => c.id === updatedCompany.id ? updatedCompany : c);
    setCompanies(updatedComps);
    saveCompanies(updatedComps);
    if (updatedCompany.id === activeCompany.id) {
      setActiveCompany(updatedCompany);
    }
  };

  // Add new company
  const handleAddNewCompany = (newComp) => {
    const updated = [...companies, newComp];
    setCompanies(updated);
    saveCompanies(updated);
    handleCompanyChange(newComp.id);
  };

  // SUPER ADMIN HANDLERS
  const handleSaveUserAccount = (userPayload, companyPayload) => {
    let updatedComps;
    const compExists = companies.some(c => c.id === companyPayload.id);
    if (compExists) {
      updatedComps = companies.map(c => c.id === companyPayload.id ? companyPayload : c);
    } else {
      updatedComps = [...companies, companyPayload];
    }
    setCompanies(updatedComps);
    saveCompanies(updatedComps);

    let updatedUsers;
    const userExists = users.some(u => u.id === userPayload.id);
    if (userExists) {
      updatedUsers = users.map(u => u.id === userPayload.id ? userPayload : u);
    } else {
      updatedUsers = [...users, userPayload];
    }
    setUsers(updatedUsers);
    saveUsers(updatedUsers);

    alert(`Account for ${userPayload.email} saved successfully!`);
  };

  const handleDeleteUserAccount = (userId) => {
    const updated = users.filter(u => u.id !== userId);
    setUsers(updated);
    saveUsers(updated);
  };

  const handleSuperAdminSwitchView = (companyId) => {
    handleCompanyChange(companyId);
    setActiveTab('invoices');
  };

  // INVOICE HANDLERS WITH PROFILE ENFORCEMENT
  const handleStartNewInvoice = () => {
    if (!companyCompleteness.isComplete) {
      alert(`Mandatory Setup Required!\n\nPlease fill in all required business profile details before creating GST invoices: ${companyCompleteness.missingFields.slice(0, 3).join(', ')}.`);
      setActiveTab('settings');
      return;
    }
    setEditingInvoice(null);
    setActiveTab('editor');
  };

  const handleEditInvoice = (inv) => {
    setEditingInvoice(inv);
    setActiveTab('editor');
  };

  const handleSaveInvoice = (invPayload) => {
    const fullPayload = { ...invPayload, companyId: activeCompany?.id };
    
    // Dynamic Stock Decrement
    if (invPayload.items && Array.isArray(invPayload.items)) {
      let updatedItemsList = [...items];
      invPayload.items.forEach(invItem => {
        const catIdx = updatedItemsList.findIndex(i => i.name.trim().toLowerCase() === invItem.name.trim().toLowerCase() && i.companyId === activeCompany?.id);
        if (catIdx !== -1 && updatedItemsList[catIdx].type !== 'Service') {
          const newQty = Math.max(0, (updatedItemsList[catIdx].stockQty || 0) - (Number(invItem.quantity) || 0));
          updatedItemsList[catIdx] = { ...updatedItemsList[catIdx], stockQty: newQty };
        }
      });
      setItems(updatedItemsList);
      saveItems(updatedItemsList);
    }

    let updated;
    const exists = invoices.some(i => i.id === fullPayload.id);
    if (exists) {
      updated = invoices.map(i => i.id === fullPayload.id ? fullPayload : i);
    } else {
      updated = [fullPayload, ...invoices];
    }
    setInvoices(updated);
    saveInvoices(updated);
    setActiveTab('invoices');
  };

  const handleDeleteInvoice = (id) => {
    const updated = invoices.filter(i => i.id !== id);
    setInvoices(updated);
    saveInvoices(updated);
  };

  const handleDuplicateInvoice = (inv) => {
    const duplicate = {
      ...inv,
      id: `inv_${Date.now()}`,
      companyId: activeCompany?.id,
      invoiceNumber: `${activeCompany?.invoicePrefix || 'BLOOM-2425-'}${Math.floor(100 + Math.random() * 900)}`,
      invoiceDate: new Date().toISOString().slice(0, 10)
    };
    const updated = [duplicate, ...invoices];
    setInvoices(updated);
    saveInvoices(updated);
  };

  // PARTY & ITEM HANDLERS
  const handleSaveParty = (partyPayload) => {
    const payloadWithComp = { ...partyPayload, companyId: activeCompany?.id };
    let updated;
    const exists = parties.some(p => p.id === partyPayload.id);
    if (exists) {
      updated = parties.map(p => p.id === partyPayload.id ? payloadWithComp : p);
    } else {
      updated = [payloadWithComp, ...parties];
    }
    setParties(updated);
    saveParties(updated);
  };

  const handleDeleteParty = (id) => {
    const updated = parties.filter(p => p.id !== id);
    setParties(updated);
    saveParties(updated);
  };

  const handleSaveItem = (itemPayload) => {
    const payloadWithComp = { ...itemPayload, companyId: activeCompany?.id };
    let updated;
    const exists = items.some(i => i.id === itemPayload.id);
    if (exists) {
      updated = items.map(i => i.id === itemPayload.id ? payloadWithComp : i);
    } else {
      updated = [payloadWithComp, ...items];
    }
    setItems(updated);
    saveItems(updated);
  };

  const handleDeleteItem = (id) => {
    const updated = items.filter(i => i.id !== id);
    setItems(updated);
    saveItems(updated);
  };

  // Filter scoped data based on active company safely
  const scopedInvoices = (invoices || []).filter(i => i.companyId === activeCompany?.id);
  const scopedParties = (parties || []).filter(p => p.companyId === activeCompany?.id);
  const scopedItems = (items || []).filter(i => i.companyId === activeCompany?.id);

  // PDF Export
  const downloadInvoicePDF = () => {
    const element = document.getElementById('invoice-print-area');
    if (!element || !viewingInvoice) return;

    const opt = {
      margin: 5,
      filename: `Bloomarina_${viewingInvoice.docType.replace(/\s+/g, '_')}_${viewingInvoice.invoiceNumber}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: previewTemplate === 'thermal' ? [80, 200] : 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

  // If not logged in, render Login Modal
  if (!currentUser) {
    return <LoginModal onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Mandatory Onboarding Modal Lock for Incomplete Profiles */}
      {currentUser.role !== 'SuperAdmin' && !companyCompleteness.isComplete && (
        <MandatoryOnboardingModal company={activeCompany} onSaveCompany={handleSaveCompany} />
      )}

      {/* Top Bar */}
      <Navbar
        currentUser={currentUser}
        companies={companies}
        activeCompany={activeCompany}
        setActiveCompanyId={handleCompanyChange}
        onNewInvoice={handleStartNewInvoice}
        onDataRefresh={refreshAllData}
        onLogout={handleLogout}
        onOpenAdminConsole={() => setActiveTab('admin')}
      />

      {/* Incomplete Profile Warning Banner */}
      {!companyCompleteness.isComplete && (
        <div className="bg-amber-500/20 border-b border-amber-500/40 px-4 py-2 text-center text-xs font-bold text-amber-300 flex items-center justify-center space-x-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
          <span>
            Business Profile Incomplete ({companyCompleteness.completionPercentage}%)! Please complete mandatory GST details to enable invoice creation.
          </span>
          <button 
            onClick={() => setActiveTab('settings')}
            className="underline font-black text-amber-200 ml-2 hover:text-white"
          >
            Complete Setup Now →
          </button>
        </div>
      )}

      {/* Main Body */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 gap-6 pb-20 md:pb-6">
        {/* Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} currentUser={currentUser} />

        {/* Tab View Container */}
        <main className="flex-1 min-w-0">
          {activeTab === 'admin' && currentUser.role === 'SuperAdmin' && (
            <AdminConsole
              currentUser={currentUser}
              users={users}
              companies={companies}
              invoices={invoices}
              onSaveUser={handleSaveUserAccount}
              onDeleteUser={handleDeleteUserAccount}
              onSwitchCompanyView={handleSuperAdminSwitchView}
            />
          )}

          {activeTab === 'dashboard' && (
            <Dashboard
              invoices={scopedInvoices}
              parties={scopedParties}
              items={scopedItems}
              company={activeCompany}
              onNewInvoice={handleStartNewInvoice}
              onViewInvoice={(inv) => {
                setViewingInvoice(inv);
                setPreviewTemplate(activeCompany.defaultTemplate || 'sairam');
              }}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'invoices' && (
            <InvoiceList
              invoices={scopedInvoices}
              company={activeCompany}
              onNewInvoice={handleStartNewInvoice}
              onEditInvoice={handleEditInvoice}
              onViewInvoice={(inv) => {
                setViewingInvoice(inv);
                setPreviewTemplate(activeCompany.defaultTemplate || 'sairam');
              }}
              onDeleteInvoice={handleDeleteInvoice}
              onDuplicateInvoice={handleDuplicateInvoice}
              onSaveInvoice={handleSaveInvoice}
            />
          )}

          {activeTab === 'proformas' && (
            <InvoiceList
              invoices={scopedInvoices.filter(i => i.docType === 'Proforma Invoice')}
              company={activeCompany}
              onNewInvoice={handleStartNewInvoice}
              onEditInvoice={handleEditInvoice}
              onViewInvoice={(inv) => {
                setViewingInvoice(inv);
                setPreviewTemplate(activeCompany.defaultTemplate || 'sairam');
              }}
              onDeleteInvoice={handleDeleteInvoice}
              onDuplicateInvoice={handleDuplicateInvoice}
              onSaveInvoice={handleSaveInvoice}
            />
          )}

          {activeTab === 'notes' && (
            <InvoiceList
              invoices={scopedInvoices.filter(i => i.docType === 'Credit Note' || i.docType === 'Debit Note')}
              company={activeCompany}
              onNewInvoice={handleStartNewInvoice}
              onEditInvoice={handleEditInvoice}
              onViewInvoice={(inv) => {
                setViewingInvoice(inv);
                setPreviewTemplate(activeCompany.defaultTemplate || 'sairam');
              }}
              onDeleteInvoice={handleDeleteInvoice}
              onDuplicateInvoice={handleDuplicateInvoice}
              onSaveInvoice={handleSaveInvoice}
            />
          )}

          {activeTab === 'parties' && (
            <PartyManager
              parties={scopedParties}
              onSaveParty={handleSaveParty}
              onDeleteParty={handleDeleteParty}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryManager
              items={scopedItems}
              onSaveItem={handleSaveItem}
              onDeleteItem={handleDeleteItem}
            />
          )}

          {activeTab === 'gstr' && (
            <GstrReports invoices={scopedInvoices} company={activeCompany} />
          )}

          {activeTab === 'settings' && (
            <CompanySettings
              company={activeCompany}
              companies={companies}
              onSaveCompany={handleSaveCompany}
              onAddNewCompany={handleAddNewCompany}
            />
          )}

          {activeTab === 'editor' && (
            <InvoiceEditor
              company={activeCompany}
              parties={scopedParties}
              itemsCatalog={scopedItems}
              editingInvoice={editingInvoice}
              onSave={handleSaveInvoice}
              onCancel={() => setActiveTab('invoices')}
            />
          )}
        </main>
      </div>

      {/* Global Invoice View & Print Modal */}
      {viewingInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <span className="font-heading font-bold text-sm text-white">Select Layout:</span>
                <select
                  value={previewTemplate}
                  onChange={(e) => setPreviewTemplate(e.target.value)}
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
                  onClick={downloadInvoicePDF}
                  className="flex items-center space-x-1.5 bg-gradient-to-r from-amber-500 to-emerald-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg transition-colors shadow-md"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print</span>
                </button>

                <button
                  onClick={() => setViewingInvoice(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-3 sm:p-6 overflow-x-auto overflow-y-auto bg-slate-950 flex justify-center print-container min-w-0">
              <div className="w-full max-w-full overflow-x-auto flex justify-center">
                {previewTemplate === 'sairam' && (
                  <SairamExactTemplate invoice={viewingInvoice} company={activeCompany} />
                )}
                {previewTemplate === 'modern' && (
                  <ModernTemplate invoice={viewingInvoice} company={activeCompany} />
                )}
                {previewTemplate === 'classic' && (
                  <ClassicTemplate invoice={viewingInvoice} company={activeCompany} />
                )}
                {previewTemplate === 'minimal' && (
                  <MinimalTemplate invoice={viewingInvoice} company={activeCompany} />
                )}
                {previewTemplate === 'thermal' && (
                  <ThermalTemplate invoice={viewingInvoice} company={activeCompany} />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
