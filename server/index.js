import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'bloomarina_super_secret_jwt_key_2026';

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Auth Token Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access denied. Token missing.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token.' });
    }
    req.user = user;
    next();
  });
};

// Super Admin Middleware
const requireSuperAdmin = (req, res, next) => {
  if (req.user?.role !== 'SuperAdmin') {
    return res.status(403).json({ message: 'Access restricted to Super Admin only.' });
  }
  next();
};

// ==================== AUTH ROUTES ====================

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const users = db.getUsers();
    const user = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      return res.status(401).json({ message: 'Invalid Email address or Password.' });
    }

    if (user.status === 'Disabled') {
      return res.status(403).json({ message: 'This account has been disabled by the Super Admin.' });
    }

    // Password validation (supports both raw password and hashed passwords)
    let isMatch = user.passwordRaw ? user.passwordRaw === password : false;
    if (!isMatch && user.passwordHash) {
      isMatch = await bcrypt.compare(password, user.passwordHash);
    }

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid Email address or Password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, companyId: user.companyId },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    const safeUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      companyId: user.companyId,
      status: user.status,
      createdAt: user.createdAt,
      password: user.passwordRaw || password
    };

    return res.json({
      success: true,
      token,
      user: safeUser
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error during authentication.' });
  }
});

// GET /api/auth/me
app.get('/api/auth/me', authenticateToken, (req, res) => {
  const users = db.getUsers();
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(444).json({ message: 'User not found.' });

  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    companyId: user.companyId,
    status: user.status,
    createdAt: user.createdAt,
    password: user.passwordRaw || ''
  });
});

// ==================== USER MANAGEMENT (ADMIN) ====================

// GET /api/users (Super Admin)
app.get('/api/users', authenticateToken, requireSuperAdmin, (req, res) => {
  const users = db.getUsers().map(u => ({
    id: u.id,
    email: u.email,
    password: u.passwordRaw || '••••••••',
    name: u.name,
    role: u.role,
    companyId: u.companyId,
    status: u.status,
    createdAt: u.createdAt
  }));
  res.json(users);
});

// POST /api/users (Super Admin - Save User & Company)
app.post('/api/users', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { userPayload, companyPayload } = req.body;
    if (!userPayload || !companyPayload) {
      return res.status(400).json({ message: 'User and company payloads are required.' });
    }

    // 1. Save or update company
    let companies = db.getCompanies();
    const compIdx = companies.findIndex(c => c.id === companyPayload.id);
    if (compIdx !== -1) {
      companies[compIdx] = { ...companies[compIdx], ...companyPayload };
    } else {
      companies.push(companyPayload);
    }
    db.setCompanies(companies);

    // 2. Save or update user
    let users = db.getUsers();
    const userIdx = users.findIndex(u => u.id === userPayload.id);
    const passwordHash = await bcrypt.hash(userPayload.password, 10);

    const formattedUser = {
      ...userPayload,
      passwordRaw: userPayload.password,
      passwordHash
    };

    if (userIdx !== -1) {
      users[userIdx] = { ...users[userIdx], ...formattedUser };
    } else {
      users.push(formattedUser);
    }
    db.setUsers(users);

    res.json({ success: true, message: 'User account & business profile saved.' });
  } catch (err) {
    console.error('Save user error:', err);
    res.status(500).json({ message: 'Failed to save user account.' });
  }
});

// DELETE /api/users/:id (Super Admin)
app.delete('/api/users/:id', authenticateToken, requireSuperAdmin, (req, res) => {
  const { id } = req.params;
  let users = db.getUsers();
  users = users.filter(u => u.id !== id);
  db.setUsers(users);
  res.json({ success: true, message: 'User account deleted.' });
});

// ==================== COMPANIES API ====================

// GET /api/companies
app.get('/api/companies', authenticateToken, (req, res) => {
  const companies = db.getCompanies();
  if (req.user.role === 'SuperAdmin') {
    return res.json(companies);
  }
  const userComp = companies.filter(c => c.id === req.user.companyId);
  res.json(userComp);
});

// PUT /api/companies/:id
app.put('/api/companies/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const updatedCompany = req.body;

  let companies = db.getCompanies();
  const idx = companies.findIndex(c => c.id === id);
  if (idx !== -1) {
    companies[idx] = { ...companies[idx], ...updatedCompany };
  } else {
    companies.push(updatedCompany);
  }
  db.setCompanies(companies);
  res.json({ success: true, company: updatedCompany });
});

// ==================== INVOICES API ====================

// GET /api/invoices
app.get('/api/invoices', authenticateToken, (req, res) => {
  const invoices = db.getInvoices();
  if (req.user.role === 'SuperAdmin') {
    return res.json(invoices);
  }
  const scoped = invoices.filter(i => i.companyId === req.user.companyId);
  res.json(scoped);
});

// POST /api/invoices
app.post('/api/invoices', authenticateToken, (req, res) => {
  const invPayload = req.body;
  let invoices = db.getInvoices();
  const idx = invoices.findIndex(i => i.id === invPayload.id);

  if (idx !== -1) {
    invoices[idx] = invPayload;
  } else {
    invoices.unshift(invPayload);
  }

  db.setInvoices(invoices);
  res.json({ success: true, invoice: invPayload });
});

// DELETE /api/invoices/:id
app.delete('/api/invoices/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  let invoices = db.getInvoices();
  invoices = invoices.filter(i => i.id !== id);
  db.setInvoices(invoices);
  res.json({ success: true, message: 'Invoice deleted.' });
});

// ==================== PARTIES API ====================

// GET /api/parties
app.get('/api/parties', authenticateToken, (req, res) => {
  const parties = db.getParties();
  if (req.user.role === 'SuperAdmin') {
    return res.json(parties);
  }
  const scoped = parties.filter(p => p.companyId === req.user.companyId);
  res.json(scoped);
});

// POST /api/parties
app.post('/api/parties', authenticateToken, (req, res) => {
  const partyPayload = req.body;
  let parties = db.getParties();
  const idx = parties.findIndex(p => p.id === partyPayload.id);

  if (idx !== -1) {
    parties[idx] = partyPayload;
  } else {
    parties.push(partyPayload);
  }

  db.setParties(parties);
  res.json({ success: true, party: partyPayload });
});

// DELETE /api/parties/:id
app.delete('/api/parties/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  let parties = db.getParties();
  parties = parties.filter(p => p.id !== id);
  db.setParties(parties);
  res.json({ success: true, message: 'Party deleted.' });
});

// ==================== INVENTORY ITEMS API ====================

// GET /api/items
app.get('/api/items', authenticateToken, (req, res) => {
  const items = db.getItems();
  if (req.user.role === 'SuperAdmin') {
    return res.json(items);
  }
  const scoped = items.filter(i => i.companyId === req.user.companyId);
  res.json(scoped);
});

// POST /api/items
app.post('/api/items', authenticateToken, (req, res) => {
  const itemPayload = req.body;
  let items = db.getItems();
  const idx = items.findIndex(i => i.id === itemPayload.id);

  if (idx !== -1) {
    items[idx] = itemPayload;
  } else {
    items.push(itemPayload);
  }

  db.setItems(items);
  res.json({ success: true, item: itemPayload });
});

// DELETE /api/items/:id
app.delete('/api/items/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  let items = db.getItems();
  items = items.filter(i => i.id !== id);
  db.setItems(items);
  res.json({ success: true, message: 'Item deleted.' });
});

// ==================== BACKUP & RESTORE API ====================

// GET /api/backup
app.get('/api/backup', authenticateToken, (req, res) => {
  res.json(db.exportAll());
});

// POST /api/restore
app.post('/api/restore', authenticateToken, requireSuperAdmin, (req, res) => {
  const success = db.importAll(req.body);
  if (success) {
    res.json({ success: true, message: 'System data restored successfully.' });
  } else {
    res.status(400).json({ message: 'Invalid backup JSON payload.' });
  }
});

// ==================== SERVE FRONTEND DIST IN PRODUCTION ====================

const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ message: 'API route not found.' });
  }
  res.sendFile(path.join(distPath, 'index.html'));
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`🚀 Bloomarina Billing API Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
});
