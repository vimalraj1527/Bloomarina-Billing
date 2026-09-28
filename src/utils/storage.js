// LocalStorage keys for Bloomarina Billing Software with Multi-User RBAC
const STORAGE_KEYS = {
  USERS: 'bloomarina_users',
  SESSION: 'bloomarina_current_session',
  COMPANIES: 'bloomarina_companies',
  INVOICES: 'bloomarina_invoices',
  PARTIES: 'bloomarina_parties',
  ITEMS: 'bloomarina_items'
};

// Seed Users (Cleaned for Production Publishing)
const DEFAULT_USERS = [
  {
    id: 'user_admin_1',
    email: 'rvimalrajcse@gmail.com',
    password: 'Rajiniroy@1527',
    name: 'Vimal Raj (Super Admin)',
    role: 'SuperAdmin',
    companyId: 'comp_bloomarina_1',
    status: 'Active',
    createdAt: '2026-09-28'
  }
];

// Seed Companies - Cleaned Initial State for Publishing
const DEFAULT_COMPANIES = [
  {
    id: 'comp_bloomarina_1',
    name: 'Bloomarina Technologies Pvt Ltd',
    tradeName: 'Bloomarina Billing',
    gstin: '',
    pan: '',
    stateCode: '',
    stateName: '',
    email: 'rvimalrajcse@gmail.com',
    phone: '',
    address: '',
    city: '',
    pincode: '',
    bankName: '',
    accountNo: '',
    ifsc: '',
    branch: '',
    upiId: '',
    logoUrl: '',
    signatureUrl: '',
    termsAndConditions: '1. Goods once sold will not be returned without valid verification.\n2. Payment due within 15 days of invoice issue date.',
    invoicePrefix: 'INV-2425-',
    nextInvoiceNumber: 101,
    defaultTemplate: 'sairam'
  }
];

// Clean Production State (Zero Sample Records)
const DEFAULT_PARTIES = [];
const DEFAULT_ITEMS = [];
const DEFAULT_INVOICES = [];

// USER & AUTH FUNCTIONS
export function getStoredUsers() {
  const data = localStorage.getItem(STORAGE_KEYS.USERS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
    return DEFAULT_USERS;
  }
  return JSON.parse(data);
}

export function saveUsers(users) {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

export function getCurrentSession() {
  const data = localStorage.getItem(STORAGE_KEYS.SESSION);
  return data ? JSON.parse(data) : null;
}

export function setCurrentSession(user) {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  }
}

import { api } from './api';

export async function authenticateUserAsync(email, password) {
  try {
    const res = await api.login(email, password);
    if (res.success && res.user) {
      const sessionUser = { ...res.user, token: res.token };
      setCurrentSession(sessionUser);
      return { success: true, user: sessionUser };
    }
  } catch (err) {
    console.warn('Backend API authentication unavailable, attempting local storage fallback:', err.message);
  }
  return authenticateUser(email, password);
}

export function authenticateUser(email, password) {
  const users = getStoredUsers();
  const cleanEmail = email.trim().toLowerCase();
  const user = users.find(u => u.email.toLowerCase() === cleanEmail && u.password === password);
  if (user) {
    if (user.status === 'Disabled') {
      return { success: false, message: 'This account has been disabled by the Super Admin.' };
    }
    setCurrentSession(user);
    return { success: true, user };
  }
  return { success: false, message: 'Invalid Email address or Password.' };
}

// COMPANY & DATA PERSISTENCE
export function getStoredCompanies() {
  const data = localStorage.getItem(STORAGE_KEYS.COMPANIES);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(DEFAULT_COMPANIES));
    return DEFAULT_COMPANIES;
  }
  return JSON.parse(data);
}

export function saveCompanies(companies) {
  localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(companies));
}

export function getActiveCompany() {
  const companies = getStoredCompanies();
  const activeId = localStorage.getItem(STORAGE_KEYS.ACTIVE_COMPANY_ID);
  return companies.find(c => c.id === activeId) || companies[0] || DEFAULT_COMPANIES[0];
}

export function setActiveCompanyId(id) {
  localStorage.setItem(STORAGE_KEYS.ACTIVE_COMPANY_ID, id);
}

export function getStoredParties() {
  const data = localStorage.getItem(STORAGE_KEYS.PARTIES);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.PARTIES, JSON.stringify(DEFAULT_PARTIES));
    return DEFAULT_PARTIES;
  }
  return JSON.parse(data);
}

export function saveParties(parties) {
  localStorage.setItem(STORAGE_KEYS.PARTIES, JSON.stringify(parties));
}

export function getStoredItems() {
  const data = localStorage.getItem(STORAGE_KEYS.ITEMS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(DEFAULT_ITEMS));
    return DEFAULT_ITEMS;
  }
  return JSON.parse(data);
}

export function saveItems(items) {
  localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
}

export function getStoredInvoices() {
  const data = localStorage.getItem(STORAGE_KEYS.INVOICES);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(DEFAULT_INVOICES));
    return DEFAULT_INVOICES;
  }
  return JSON.parse(data);
}

export function saveInvoices(invoices) {
  localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
}

// BACKUP & RESTORE
export function exportAllDataJSON() {
  const backup = {
    software: 'Bloomarina Billing Software',
    version: '2.0',
    exportDate: new Date().toISOString(),
    users: getStoredUsers(),
    companies: getStoredCompanies(),
    parties: getStoredParties(),
    items: getStoredItems(),
    invoices: getStoredInvoices()
  };
  const jsonStr = JSON.stringify(backup, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Bloomarina_Backup_${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importAllDataJSON(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    if (data.companies && data.invoices && data.parties && data.items) {
      if (data.users) saveUsers(data.users);
      saveCompanies(data.companies);
      saveParties(data.parties);
      saveItems(data.items);
      saveInvoices(data.invoices);
      if (data.companies[0]) {
        setActiveCompanyId(data.companies[0].id);
      }
      return { success: true };
    }
    return { success: false, message: 'Invalid Bloomarina backup file structure.' };
  } catch (err) {
    return { success: false, message: 'Failed to parse JSON file: ' + err.message };
  }
}
