import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial Default Seed State for Production
const DEFAULT_DB = {
  users: [
    {
      id: 'user_admin_1',
      email: 'rvimalrajcse@gmail.com',
      passwordHash: '$2a$10$wB5e5NqK9n.Y8m4tE4pW1eG2YQ7GZ1Q5k0GZ5k0GZ5k0GZ5k0GZ5k', // Rajiniroy@1527 hashed
      passwordRaw: 'Rajiniroy@1527',
      name: 'Vimal Raj (Super Admin)',
      role: 'SuperAdmin',
      companyId: 'comp_bloomarina_1',
      status: 'Active',
      createdAt: '2026-09-28'
    }
  ],
  companies: [
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
  ],
  invoices: [],
  parties: [],
  items: []
};

class JSONDatabase {
  constructor() {
    this.data = this.load();
  }

  load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileData = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(fileData);
        return {
          users: parsed.users || DEFAULT_DB.users,
          companies: parsed.companies || DEFAULT_DB.companies,
          invoices: parsed.invoices || [],
          parties: parsed.parties || [],
          items: parsed.items || []
        };
      }
    } catch (err) {
      console.error('Error reading db.json, using defaults:', err.message);
    }
    this.save(DEFAULT_DB);
    return DEFAULT_DB;
  }

  save(dataToSave) {
    try {
      const data = dataToSave || this.data;
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving db.json:', err.message);
    }
  }

  getUsers() { return this.data.users; }
  setUsers(users) { this.data.users = users; this.save(); }

  getCompanies() { return this.data.companies; }
  setCompanies(companies) { this.data.companies = companies; this.save(); }

  getInvoices() { return this.data.invoices; }
  setInvoices(invoices) { this.data.invoices = invoices; this.save(); }

  getParties() { return this.data.parties; }
  setParties(parties) { this.data.parties = parties; this.save(); }

  getItems() { return this.data.items; }
  setItems(items) { this.data.items = items; this.save(); }

  exportAll() {
    return {
      software: 'Bloomarina Billing Software API',
      version: '2.0',
      exportDate: new Date().toISOString(),
      users: this.data.users,
      companies: this.data.companies,
      parties: this.data.parties,
      items: this.data.items,
      invoices: this.data.invoices
    };
  }

  importAll(payload) {
    if (payload.companies && payload.invoices && payload.parties && payload.items) {
      if (payload.users) this.data.users = payload.users;
      this.data.companies = payload.companies;
      this.data.invoices = payload.invoices;
      this.data.parties = payload.parties;
      this.data.items = payload.items;
      this.save();
      return true;
    }
    return false;
  }
}

export const db = new JSONDatabase();
