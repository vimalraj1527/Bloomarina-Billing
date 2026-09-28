// GST State Codes Map according to Indian GST Rules
export const GST_STATES = [
  { code: '01', name: 'Jammu & Kashmir' },
  { code: '02', name: 'Himachal Pradesh' },
  { code: '03', name: 'Punjab' },
  { code: '04', name: 'Chandigarh' },
  { code: '05', name: 'Uttarakhand' },
  { code: '06', name: 'Haryana' },
  { code: '07', name: 'Delhi' },
  { code: '08', name: 'Rajasthan' },
  { code: '09', name: 'Uttar Pradesh' },
  { code: '10', name: 'Bihar' },
  { code: '11', name: 'Sikkim' },
  { code: '12', name: 'Arunachal Pradesh' },
  { code: '13', name: 'Nagaland' },
  { code: '14', name: 'Manipur' },
  { code: '15', name: 'Mizoram' },
  { code: '16', name: 'Tripura' },
  { code: '17', name: 'Meghalaya' },
  { code: '18', name: 'Assam' },
  { code: '19', name: 'West Bengal' },
  { code: '20', name: 'Jharkhand' },
  { code: '21', name: 'Odisha' },
  { code: '22', name: 'Chhattisgarh' },
  { code: '23', name: 'Madhya Pradesh' },
  { code: '24', name: 'Gujarat' },
  { code: '26', name: 'Dadra & Nagar Haveli and Daman & Diu' },
  { code: '27', name: 'Maharashtra' },
  { code: '28', name: 'Andhra Pradesh (Old)' },
  { code: '29', name: 'Karnataka' },
  { code: '30', name: 'Goa' },
  { code: '31', name: 'Lakshadweep' },
  { code: '32', name: 'Kerala' },
  { code: '33', name: 'Tamil Nadu' },
  { code: '34', name: 'Puducherry' },
  { code: '35', name: 'Andaman & Nicobar Islands' },
  { code: '36', name: 'Telangana' },
  { code: '37', name: 'Andhra Pradesh (New)' },
  { code: '38', name: 'Ladakh' },
  { code: '97', name: 'Other Territory' }
];

// Helper to extract State Code from GSTIN (First 2 digits)
export function getStateCodeFromGSTIN(gstin) {
  if (!gstin || gstin.trim().length < 2) return '';
  return gstin.trim().substring(0, 2);
}

// Find state name by state code
export function getStateNameByCode(code) {
  const state = GST_STATES.find(s => s.code === code);
  return state ? state.name : '';
}

// Validate GSTIN format (Flexible 15 Alphanumeric characters or 10-15 char GSTIN)
export function validateGSTIN(gstin) {
  if (!gstin || !gstin.trim()) return { valid: false, message: 'GSTIN is empty' };
  const clean = gstin.trim().toUpperCase();
  const pattern = /^[0-9]{2}[A-Z0-9]{13}$/;
  if (pattern.test(clean) || clean.length >= 10) {
    return { valid: true, state: getStateNameByCode(clean.substring(0, 2)) };
  }
  return { valid: false, message: 'Invalid 15-digit GSTIN format' };
}

// Check mandatory company details completeness for GST billing compliance
export function checkCompanyProfileCompleteness(company) {
  if (!company) return { isComplete: false, missingFields: ['Company Profile'], completionPercentage: 0, mandatoryChecks: [] };

  // Infer stateCode from gstin if stateCode is empty but gstin has first 2 digits
  let stateCode = company.stateCode;
  if (!stateCode && company.gstin && company.gstin.trim().length >= 2) {
    const derived = getStateCodeFromGSTIN(company.gstin);
    if (derived) stateCode = derived;
  }

  const mandatoryChecks = [
    { field: 'name', label: 'Company Legal Name', valid: Boolean(company.name && company.name.trim().length > 0) },
    { field: 'gstin', label: '15-Digit GSTIN', valid: Boolean(company.gstin && company.gstin.trim().length >= 5) },
    { field: 'stateCode', label: 'State Code', valid: Boolean(stateCode && stateCode.trim().length > 0) },
    { field: 'address', label: 'Registered Address', valid: Boolean(company.address && company.address.trim().length > 0) },
    { field: 'city', label: 'City', valid: Boolean(company.city && company.city.trim().length > 0) },
    { field: 'pincode', label: 'PIN Code', valid: Boolean(company.pincode && company.pincode.trim().length > 0) },
    { field: 'phone', label: 'Contact Phone Number', valid: Boolean(company.phone && company.phone.trim().length > 0) },
    { field: 'email', label: 'Billing Email', valid: Boolean(company.email && company.email.trim().length > 0) },
    { field: 'bankName', label: 'Bank Name', valid: Boolean(company.bankName && company.bankName.trim().length > 0) },
    { field: 'accountNo', label: 'Account Number', valid: Boolean(company.accountNo && company.accountNo.trim().length > 0) },
    { field: 'ifsc', label: 'Bank IFSC Code', valid: Boolean(company.ifsc && company.ifsc.trim().length > 0) }
  ];

  // Optional UPI ID check - if filled, included as valid
  if (company.upiId && company.upiId.trim().length > 0) {
    mandatoryChecks.push({ field: 'upiId', label: 'UPI Payment ID', valid: true });
  }

  const validCount = mandatoryChecks.filter(c => c.valid).length;
  const missingFields = mandatoryChecks.filter(c => !c.valid).map(c => c.label);
  const completionPercentage = Math.round((validCount / mandatoryChecks.length) * 100);

  return {
    isComplete: missingFields.length === 0,
    missingFields,
    completionPercentage,
    mandatoryChecks
  };
}

// Determine if supply is Intrastate (CGST+SGST) or Interstate (IGST)
export function isIntraState(supplierStateCode, partyStateCode) {
  if (!supplierStateCode || !partyStateCode) return true;
  return supplierStateCode.trim() === partyStateCode.trim();
}

// Format Currency in INR
export function formatCurrency(amount) {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  }).format(num);
}

// Format plain number to Indian commas format
export function formatIndianNumber(num) {
  const n = Number(num) || 0;
  return n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Convert Number to Words in Indian Rupee format
export function numberToWordsINR(amount) {
  const num = Math.round((Number(amount) || 0) * 100) / 100;
  if (num === 0) return 'Rupees Zero Only';

  const single = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 
                  'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertTwoDigits(n) {
    if (n < 20) return single[n];
    return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + single[n % 10] : '');
  }

  function convertThreeDigits(n) {
    let str = '';
    if (Math.floor(n / 100) > 0) {
      str += single[Math.floor(n / 100)] + ' Hundred';
      if (n % 100 !== 0) str += ' ';
    }
    if (n % 100 !== 0) {
      str += convertTwoDigits(n % 100);
    }
    return str;
  }

  let integerPart = Math.floor(num);
  let paisaPart = Math.round((num - integerPart) * 100);

  let result = '';

  if (integerPart >= 10000000) {
    const crore = Math.floor(integerPart / 10000000);
    result += convertThreeDigits(crore) + ' Crore ';
    integerPart %= 10000000;
  }
  if (integerPart >= 100000) {
    const lakh = Math.floor(integerPart / 100000);
    result += convertTwoDigits(lakh) + ' Lakh ';
    integerPart %= 100000;
  }
  if (integerPart >= 1000) {
    const thousand = Math.floor(integerPart / 1000);
    result += convertTwoDigits(thousand) + ' Thousand ';
    integerPart %= 1000;
  }
  if (integerPart > 0) {
    result += convertThreeDigits(integerPart);
  }

  result = result.trim() + ' Rupees';

  if (paisaPart > 0) {
    result += ' and ' + convertTwoDigits(paisaPart) + ' Paisa';
  }

  return result + ' Only';
}

// Calculate line item totals
export function calculateLineItem(item, supplierStateCode, partyStateCode) {
  const qty = Number(item.quantity) || 0;
  const price = Number(item.unitPrice) || 0;
  const discountPercent = Number(item.discountPercent) || 0;
  const gstRate = Number(item.gstRate) || 0;
  const cessRate = Number(item.cessRate) || 0;
  const isTaxInclusive = Boolean(item.isTaxInclusive);

  let grossAmount = qty * price;
  let discountAmount = (grossAmount * discountPercent) / 100;
  let amountAfterDiscount = grossAmount - discountAmount;

  let taxableAmount = 0;
  let gstAmount = 0;

  if (isTaxInclusive && gstRate > 0) {
    taxableAmount = amountAfterDiscount / (1 + (gstRate / 100));
    gstAmount = amountAfterDiscount - taxableAmount;
  } else {
    taxableAmount = amountAfterDiscount;
    gstAmount = (taxableAmount * gstRate) / 100;
  }

  let cessAmount = (taxableAmount * cessRate) / 100;

  const isIntra = isIntraState(supplierStateCode, partyStateCode);
  let cgstRate = 0;
  let sgstRate = 0;
  let igstRate = 0;
  let cgstAmount = 0;
  let sgstAmount = 0;
  let igstAmount = 0;

  if (isIntra) {
    cgstRate = gstRate / 2;
    sgstRate = gstRate / 2;
    cgstAmount = gstAmount / 2;
    sgstAmount = gstAmount / 2;
  } else {
    igstRate = gstRate;
    igstAmount = gstAmount;
  }

  const totalAmount = taxableAmount + gstAmount + cessAmount;

  return {
    quantity: qty,
    unitPrice: price,
    discountAmount: Number(discountAmount.toFixed(2)),
    taxableAmount: Number(taxableAmount.toFixed(2)),
    gstRate,
    gstAmount: Number(gstAmount.toFixed(2)),
    isIntraState: isIntra,
    cgstRate,
    cgstAmount: Number(cgstAmount.toFixed(2)),
    sgstRate,
    sgstAmount: Number(sgstAmount.toFixed(2)),
    igstRate,
    igstAmount: Number(igstAmount.toFixed(2)),
    cessRate,
    cessAmount: Number(cessAmount.toFixed(2)),
    totalAmount: Number(totalAmount.toFixed(2))
  };
}

// Calculate Invoice Totals (Accepts either item array or invoice object)
export function calculateInvoiceTotals(itemsOrInvoice = [], supplierStateCode = '', partyStateCode = '', extraCharges = 0, roundOff = true) {
  let items = [];
  let suppState = supplierStateCode;
  let partyState = partyStateCode;
  let charges = extraCharges;
  let isRound = roundOff;

  if (itemsOrInvoice && !Array.isArray(itemsOrInvoice) && typeof itemsOrInvoice === 'object') {
    items = itemsOrInvoice.items || [];
    suppState = supplierStateCode || itemsOrInvoice.supplierStateCode || itemsOrInvoice.companyStateCode || '';
    partyState = partyStateCode || itemsOrInvoice.partyStateCode || '';
    charges = extraCharges || itemsOrInvoice.extraCharges || 0;
    if (itemsOrInvoice.roundOff !== undefined) isRound = itemsOrInvoice.roundOff !== false;
  } else {
    items = Array.isArray(itemsOrInvoice) ? itemsOrInvoice : [];
  }

  let subtotalTaxable = 0;
  let totalCGST = 0;
  let totalSGST = 0;
  let totalIGST = 0;
  let totalCess = 0;

  const calculatedItems = items.map(item => {
    const calc = calculateLineItem(item, suppState, partyState);
    subtotalTaxable += calc.taxableAmount;
    totalCGST += calc.cgstAmount;
    totalSGST += calc.sgstAmount;
    totalIGST += calc.igstAmount;
    totalCess += calc.cessAmount;
    return { ...item, ...calc };
  });

  const rawTotal = subtotalTaxable + totalCGST + totalSGST + totalIGST + totalCess + (Number(charges) || 0);

  let roundOffAmount = 0;
  let finalGrandTotal = rawTotal;

  if (isRound) {
    finalGrandTotal = Math.round(rawTotal);
    roundOffAmount = finalGrandTotal - rawTotal;
  }

  return {
    items: calculatedItems,
    subtotalTaxable: Number(subtotalTaxable.toFixed(2)),
    totalCGST: Number(totalCGST.toFixed(2)),
    totalSGST: Number(totalSGST.toFixed(2)),
    totalIGST: Number(totalIGST.toFixed(2)),
    totalCess: Number(totalCess.toFixed(2)),
    extraCharges: Number(charges) || 0,
    rawTotal: Number(rawTotal.toFixed(2)),
    roundOffAmount: Number(roundOffAmount.toFixed(2)),
    grandTotal: Number(finalGrandTotal.toFixed(2)),
    amountInWords: numberToWordsINR(finalGrandTotal)
  };
}
