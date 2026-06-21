// scenarios/scenario1.js
// Compute base amounts for Scenario 1 — General transactions having VAT and PPDA
// Exports: computeBaseAmount(options)
// Defaults: vatRate = 17.5 (%), ppdaRate = 1 (%), whtRate = 3 (%)
// All numeric inputs may be numbers or numeric strings. Results are numbers (not formatted).

export function computeBaseAmount({
  invoice,        // total invoice amount (includes VAT and PPDA)
  vatRate = 17.5, // percent
  ppdaRate = 1.0, // percent
  whtRate = 3.0,  // percent (used to compute WHT on taxable base)
  rounding = 2    // decimal places for returned values (optional)
} = {}) {
  // Input validation
  const toNumber = (v) => {
    const n = typeof v === 'number' ? v : parseFloat(String(v).replace(/,/g, ''));
    if (!isFinite(n)) throw new Error('Invalid numeric input');
    return n;
  };

  const invoiceAmt = toNumber(invoice);
  if (invoiceAmt < 0) throw new Error('Invoice amount must be non-negative');

  // Convert percents to decimals
  const vat = toNumber(vatRate) / 100;
  const ppda = toNumber(ppdaRate) / 100;
  const wht = toNumber(whtRate) / 100;

  // Reverse the invoice to get the taxable amount (amount before VAT and PPDA)
  // taxable = invoice / (1 + vat + ppda)
  const taxableAmountRaw = invoiceAmt / (1 + vat + ppda);

  // Compute components based on taxable amount (matches original Python logic)
  const vatAmountRaw = taxableAmountRaw * vat;
  const ppdaAmountRaw = taxableAmountRaw * ppda;
  const whtAmountRaw = taxableAmountRaw * wht;

  // Amount to pay supplier: invoice minus PPDA and WHT (these are deducted)
  const paySupplierRaw = invoiceAmt - ppdaAmountRaw - whtAmountRaw;

  // Rounding helper
  const round = (v, d) => {
    const factor = Math.pow(10, d);
    return Math.round((v + Number.EPSILON) * factor) / factor;
  };

  const d = Number.isInteger(rounding) ? rounding : 2;

  return {
    invoice: round(invoiceAmt, d),
    taxableAmount: round(taxableAmountRaw, d),
    vatAmount: round(vatAmountRaw, d),
    ppdaAmount: round(ppdaAmountRaw, d),
    whtAmount: round(whtAmountRaw, d),
    paySupplier: round(paySupplierRaw, d),
    // raw values (unrounded) for precise downstream use
    _raw: {
      taxableAmount: taxableAmountRaw,
      vatAmount: vatAmountRaw,
      ppdaAmount: ppdaAmountRaw,
      whtAmount: whtAmountRaw,
      paySupplier: paySupplierRaw
    }
  };
}

/*
Example usage (for testing):
import { computeBaseAmount } from './scenario1.js';

console.log(computeBaseAmount({ invoice: 1185 }));
// Expected (approx):
// {
//   invoice: 1185.00,
//   taxableAmount: 1000.00,
//   vatAmount: 175.00,
//   ppdaAmount: 10.00,
//   whtAmount: 30.00,
//   paySupplier: 1145.00
// }
*/