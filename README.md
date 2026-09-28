# Bloomarina Billing Software 🌸

> **Professional Multi-Tenant GST Billing, Inventory Management & Super Admin Console**

Bloomarina Billing Software is a full-featured, multi-tenant web application designed for Indian businesses to issue GST-compliant Tax Invoices, Quotations/Proforma Invoices, Credit/Debit Notes, manage Customer/Vendor directories, track Inventory stock, and generate GSTR-1 / GSTR-3B tax reports.

---

## 🌟 Key Features

- **GST Tax Invoice Generation**: Pixel-perfect General Template matching exact GST compliance requirements (CGST, SGST, IGST, HSN/SAC codes, reverse charge, bank details, and terms).
- **Multi-Tenant Architecture**: Complete data isolation per business account. Regular users only access their own company's invoices, clients, and stock.
- **Super Admin Console**: Central control panel for managing user accounts, business profiles, role-based permissions (`SuperAdmin` / `User`), and account status (`Active` / `Disabled`).
- **Mobile Responsive & PWA Ready**: Optimized sticky touch navigation bar for seamless mobile phone usage.
- **Node.js Express REST API Backend**: Centralized API server with JWT authentication (`jsonwebtoken`), password hashing (`bcryptjs`), and disk data persistence (`server/data/db.json`).
- **Multiple Invoice Layout Templates**:
  - General Template (Default SRI SAIRAM format)
  - Emerald Modern
  - Classic Accounting Grid
  - Minimal Clean
  - 3-Inch (80mm) Thermal POS Receipt
- **GSTR Tax Reports**: One-click B2B, HSN-wise, and GSTR-3B CSV exports for Chartered Accountants.
- **Client & Inventory Masters**: Auto-calculating HSN tax rates (0%, 5%, 12%, 18%, 28%) and live stock quantity decrement.

---

## 🚀 Quick Start & Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/vimalraj1527/Bloomarina-Billing.git
cd Bloomarina-Billing
npm install
```

### 2. Run Development Server
```bash
# Frontend Vite Dev Server
npm run dev

# Full Stack (Frontend + Backend Server)
npm run build
npm start
```

Default local server URL: `http://localhost:5000` or `http://localhost:3000`

---

## 🔑 Default Super Admin Credentials

| Email / Username | Password | Role |
| :--- | :--- | :--- |
| `rvimalrajcse@gmail.com` | `Rajiniroy@1527` | SuperAdmin |

---

## 🌐 Deploying to Production

### Option A: Render / Railway / Heroku (One-Click Cloud Hosting)
1. Push this repository to your GitHub account:
   ```bash
   git remote add origin https://github.com/vimalraj1527/Bloomarina-Billing.git
   git branch -M main
   git push -u origin main
   ```
2. Connect your repository on Render or Railway as a **Web Service**.
3. Set configuration:
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Environment Variables**:
     - `NODE_ENV` = `production`
     - `JWT_SECRET` = `your_secure_custom_jwt_secret`

---

## 📜 License

MIT License - feel free to use and customize for your business.
