// Popular HSN & SAC Codes in India for Goods and Services
export const HSN_DATABASE = [
  // Goods (HSN)
  { code: '8471', description: 'Automatic data processing machines (Laptops, Desktops, Servers)', type: 'Goods', defaultGst: 18 },
  { code: '8517', description: 'Telephone sets, Smartphones & networking equipment', type: 'Goods', defaultGst: 18 },
  { code: '8528', description: 'Monitors, Projectors & Television sets', type: 'Goods', defaultGst: 18 },
  { code: '8443', description: 'Printers, Copiers & Fax machines', type: 'Goods', defaultGst: 18 },
  { code: '8504', description: 'Power adaptors, Transformers, Uninterruptible Power Supply (UPS)', type: 'Goods', defaultGst: 18 },
  { code: '8414', description: 'Air conditioners, Ceiling fans & Exhaust fans', type: 'Goods', defaultGst: 28 },
  { code: '9403', description: 'Wooden & Metal Furniture (Desks, Chairs, Cabinets)', type: 'Goods', defaultGst: 18 },
  { code: '3004', description: 'Medicines & Pharmaceutical Products', type: 'Goods', defaultGst: 12 },
  { code: '0401', description: 'Milk & Cream (Fresh, not concentrated)', type: 'Goods', defaultGst: 0 },
  { code: '0402', description: 'Milk Powder & Condensed Milk', type: 'Goods', defaultGst: 5 },
  { code: '0902', description: 'Tea & Packed Tea leaves', type: 'Goods', defaultGst: 5 },
  { code: '0901', description: 'Coffee beans & Instant Coffee', type: 'Goods', defaultGst: 5 },
  { code: '1006', description: 'Rice (Pre-packaged & labeled)', type: 'Goods', defaultGst: 5 },
  { code: '1101', description: 'Wheat Flour / Atta (Pre-packaged)', type: 'Goods', defaultGst: 5 },
  { code: '6109', description: 'T-Shirts, Singlets & Vests (Garments)', type: 'Goods', defaultGst: 5 },
  { code: '6203', description: 'Mens Suits, Trousers, Jackets & Shirts', type: 'Goods', defaultGst: 12 },
  { code: '6403', description: 'Footwear (Leather, Rubber, Sports Shoes)', type: 'Goods', defaultGst: 12 },
  { code: '4820', description: 'Registers, Notebooks, Account books & Stationery', type: 'Goods', defaultGst: 12 },
  { code: '7308', description: 'Structures of Iron or Steel (Construction)', type: 'Goods', defaultGst: 18 },
  { code: '2710', description: 'Petroleum oils, Lubricating oils & Greases', type: 'Goods', defaultGst: 18 },
  { code: '8703', description: 'Motor Cars & Automobiles', type: 'Goods', defaultGst: 28 },
  { code: '8711', description: 'Motorcycles & Scooters', type: 'Goods', defaultGst: 28 },

  // Services (SAC)
  { code: '998311', description: 'Management consulting and management services', type: 'Services', defaultGst: 18 },
  { code: '998313', description: 'IT Consulting, Software Architecture & Advisory', type: 'Services', defaultGst: 18 },
  { code: '998314', description: 'Information Technology (IT) Design & Development services', type: 'Services', defaultGst: 18 },
  { code: '998315', description: 'Hosting, Cloud Infrastructure & Data Processing Services', type: 'Services', defaultGst: 18 },
  { code: '998319', description: 'Other Information Technology services n.e.c.', type: 'Services', defaultGst: 18 },
  { code: '998361', description: 'Advertising, Digital Marketing & Branding Services', type: 'Services', defaultGst: 18 },
  { code: '998211', description: 'Legal advisory, representation & documentation services', type: 'Services', defaultGst: 18 },
  { code: '998222', description: 'Accounting, Auditing & Bookkeeping Services', type: 'Services', defaultGst: 18 },
  { code: '998231', description: 'Tax consulting, GST return filing & planning services', type: 'Services', defaultGst: 18 },
  { code: '995411', description: 'General Construction Services of Commercial Buildings', type: 'Services', defaultGst: 18 },
  { code: '996311', description: 'Room Accommodation Services provided by Hotels', type: 'Services', defaultGst: 12 },
  { code: '996331', description: 'Restaurant, Catering & Food Serving Services', type: 'Services', defaultGst: 5 },
  { code: '996511', description: 'Road freight transport services (Goods Transport Agency GTA)', type: 'Services', defaultGst: 5 },
  { code: '997212', description: 'Real Estate Renting & Leasing of Commercial Properties', type: 'Services', defaultGst: 18 },
  { code: '998713', description: 'Repair & Maintenance of Computers & Peripheral Equipment', type: 'Services', defaultGst: 18 }
];

export function searchHSN(query) {
  if (!query || query.trim() === '') return HSN_DATABASE.slice(0, 10);
  const q = query.trim().toLowerCase();
  return HSN_DATABASE.filter(item => 
    item.code.toLowerCase().includes(q) || 
    item.description.toLowerCase().includes(q)
  ).slice(0, 15);
}
