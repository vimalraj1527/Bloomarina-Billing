// API Client for Bloomarina Billing REST API Backend
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

function getToken() {
  const session = localStorage.getItem('bloomarina_current_session');
  if (session) {
    try {
      const parsed = JSON.parse(session);
      return parsed.token || '';
    } catch (e) {
      return '';
    }
  }
  return '';
}

async function apiRequest(endpoint, method = 'GET', body = null) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api${endpoint}`, options);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error ${response.status}`);
    }
    return await response.json();
  } catch (err) {
    console.warn(`API ${method} ${endpoint} failed:`, err.message);
    throw err;
  }
}

export const api = {
  login: (email, password) => apiRequest('/auth/login', 'POST', { email, password }),
  getMe: () => apiRequest('/auth/me'),
  getUsers: () => apiRequest('/users'),
  saveUserAccount: (userPayload, companyPayload) => apiRequest('/users', 'POST', { userPayload, companyPayload }),
  deleteUserAccount: (userId) => apiRequest(`/users/${userId}`, 'DELETE'),

  getCompanies: () => apiRequest('/companies'),
  saveCompany: (company) => apiRequest(`/companies/${company.id}`, 'PUT', company),

  getInvoices: () => apiRequest('/invoices'),
  saveInvoice: (invoice) => apiRequest('/invoices', 'POST', invoice),
  deleteInvoice: (invoiceId) => apiRequest(`/invoices/${invoiceId}`, 'DELETE'),

  getParties: () => apiRequest('/parties'),
  saveParty: (party) => apiRequest('/parties', 'POST', party),
  deleteParty: (partyId) => apiRequest(`/parties/${partyId}`, 'DELETE'),

  getItems: () => apiRequest('/items'),
  saveItem: (item) => apiRequest('/items', 'POST', item),
  deleteItem: (itemId) => apiRequest(`/items/${itemId}`, 'DELETE'),

  getBackup: () => apiRequest('/backup'),
  restoreData: (backupPayload) => apiRequest('/restore', 'POST', backupPayload)
};
