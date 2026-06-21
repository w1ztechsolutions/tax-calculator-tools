// scenarios/scenario3.js
// Construction scenario — Retention, NCIC, PPDA, VAT
// Exports: computeScenario3(options)
// Defaults: vatRate = 17.5 (%), retentionRate = 5 (%), ppdaRate = 1 (%), ncicRate = 1 (%), whtRate = 10 (%)

export function computeScenario3({
  invoice,               // total invoice amount (includes VAT, retention, PPDA, NCIC)
  vatRate = 17.5,
  retentionRate = 5.0,
  ppdaRate = 1.0,
  ncicRate = 1.0,
  whtRate = 10.0,
  rounding = 2
} = {}) {
  const toNumber = (v) => {
    const n = typeof v === 'number' ? v : parseFloat(String(v).replace(/,/g, ''));
    if (!isFinite(n)) throw new Error('Invalid numeric input');
    return n;
  };

  const invoiceAmt = toNumber(invoice);
  if (invoiceAmt < 0) throw new Error('Invoice amount must be non-negative');

  const vat = toNumber(vatRate) / 100;
  const retention = toNumber(retentionRate) / 100;
  const ppda = toNumber(ppdaRate) / 100;
  const ncic = toNumber(ncicRate) / 100;
  const wht = toNumber(whtRate) / 100;

  // Reverse the invoice to get taxable amount before VAT, PPDA, NCIC
  // divisor = 1 + vat + ppda + ncic
  const divisor = 1 + vat + ppda + ncic;
  if (divisor <= 0) throw new Error('Invalid rate configuration');

  const taxableAmountRaw = invoiceAmt / divisor;

  // Component amounts based on taxable amount
  const vatAmountRaw = taxableAmountRaw * vat;
  const retentionAmountRaw = taxableAmountRaw * retention;
  const ppdaAmountRaw = taxableAmountRaw * ppda;
  const ncicAmountRaw = taxableAmountRaw * ncic;
  const whtAmountRaw = taxableAmountRaw * wht;

  // Amount to pay contractor: invoice minus retention, PPDA, NCIC, WHT
  const payContractorRaw = invoiceAmt - retentionAmountRaw - ppdaAmountRaw - ncicAmountRaw - whtAmountRaw;

  const round = (v, d) => {
    const factor = Math.pow(10, d);
    return Math.round((v + Number.EPSILON) * factor) / factor;
  };
  const d = Number.isInteger(rounding) ? rounding : 2;

  return {
    invoice: round(invoiceAmt, d),
    taxableAmount: round(taxableAmountRaw, d),
    vatAmount: round(vatAmountRaw, d),
    retentionAmount: round(retentionAmountRaw, d),
    ppdaAmount: round(ppdaAmountRaw, d),
    ncicAmount: round(ncicAmountRaw, d),
    whtAmount: round(whtAmountRaw, d),
    payContractor: round(payContractorRaw, d),
    _raw: {
      taxableAmount: taxableAmountRaw,
      vatAmount: vatAmountRaw,
      retentionAmount: retentionAmountRaw,
      ppdaAmount: ppdaAmountRaw,
      ncicAmount: ncicAmountRaw,
      whtAmount: whtAmountRaw,
      payContractor: payContractorRaw
    }
  };
}

/*
Example usage for testing:
import { computeScenario3 } from './scenario3.js';

console.log(computeScenario3({ invoice: 1245 }));
// Expected approximate results with defaults:
// taxableAmount ≈ 1000.00
// VAT ≈ 175.00
// Retention ≈ 50.00
// PPDA ≈ 10.00
// NCIC ≈ 10.00
// WHT ≈ 100.00
// payContractor ≈ 1245 - 50 - 10 - 10 - 100 = 1075.00
*/