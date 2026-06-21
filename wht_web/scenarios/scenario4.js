// scenarios/scenario4.js
// Scenario 4 — Labour charge handling
// Exports: computeScenario4(options)
// Defaults: vatRate = 17.5 (%), ppdaRate = 1.0 (%), standardWhtRate = 3.0 (%), labourThreshold = 35000, labourWhtRate = 20.0 (%)

export function computeScenario4({
  invoice,               // total invoice amount (includes VAT, PPDA, and possibly labour)
  vatRate = 17.5,
  ppdaRate = 1.0,
  standardWhtRate = 3.0,
  labourIncluded = false,
  labourAmount = 0,
  labourThreshold = 35000,
  labourWhtRate = 20.0,
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
  const ppda = toNumber(ppdaRate) / 100;
  const stdWht = toNumber(standardWhtRate) / 100;
  const labourWht = toNumber(labourWhtRate) / 100;
  const threshold = toNumber(labourThreshold);

  if (threshold < 0) throw new Error('Labour threshold must be non-negative');

  // If labour is included, separate labour portion and remainder
  let taxableRemainderRaw = 0;
  let vatAmountRaw = 0;
  let ppdaAmountRaw = 0;
  let whtRemainderRaw = 0;
  let whtLabourRaw = 0;
  let taxableLabourRaw = 0;

  if (labourIncluded) {
    const labourAmt = toNumber(labourAmount);
    if (labourAmt < 0) throw new Error('Labour amount must be non-negative');
    if (labourAmt > invoiceAmt) throw new Error('Labour amount cannot exceed total invoice amount');

    // remainder is invoice minus labour (both include VAT & PPDA)
    const remainder = invoiceAmt - labourAmt;

    // reverse remainder to taxable remainder (remove VAT and PPDA)
    taxableRemainderRaw = remainder / (1 + vat + ppda);

    vatAmountRaw = taxableRemainderRaw * vat;
    ppdaAmountRaw = taxableRemainderRaw * ppda;

    // WHT on remainder at standard rate
    whtRemainderRaw = taxableRemainderRaw * stdWht;

    // Labour handling: only amount above threshold is taxable at labourWht
    if (labourAmt > threshold) {
      taxableLabourRaw = labourAmt - threshold;
      whtLabourRaw = taxableLabourRaw * labourWht;
    } else {
      taxableLabourRaw = 0;
      whtLabourRaw = 0;
    }
  } else {
    // No labour: reverse entire invoice to taxable amount
    taxableRemainderRaw = invoiceAmt / (1 + vat + ppda);
    vatAmountRaw = taxableRemainderRaw * vat;
    ppdaAmountRaw = taxableRemainderRaw * ppda;
    whtRemainderRaw = taxableRemainderRaw * stdWht;
    taxableLabourRaw = 0;
    whtLabourRaw = 0;
  }

  const totalWhtRaw = whtRemainderRaw + whtLabourRaw;

  // Amount to pay customer: invoice minus PPDA and total WHT
  const payCustomerRaw = invoiceAmt - ppdaAmountRaw - totalWhtRaw;

  const round = (v, d) => {
    const factor = Math.pow(10, d);
    return Math.round((v + Number.EPSILON) * factor) / factor;
  };
  const d = Number.isInteger(rounding) ? rounding : 2;

  return {
    invoice: round(invoiceAmt, d),
    taxableRemainder: round(taxableRemainderRaw, d),
    vatAmount: round(vatAmountRaw, d),
    ppdaAmount: round(ppdaAmountRaw, d),
    taxableLabour: round(taxableLabourRaw, d),
    whtRemainder: round(whtRemainderRaw, d),
    whtLabour: round(whtLabourRaw, d),
    totalWht: round(totalWhtRaw, d),
    payCustomer: round(payCustomerRaw, d),
    _raw: {
      taxableRemainder: taxableRemainderRaw,
      vatAmount: vatAmountRaw,
      ppdaAmount: ppdaAmountRaw,
      taxableLabour: taxableLabourRaw,
      whtRemainder: whtRemainderRaw,
      whtLabour: whtLabourRaw,
      totalWht: totalWhtRaw,
      payCustomer: payCustomerRaw
    }
  };
}

/*
Example tests:
1) No labour:
   invoice = 1185 (VAT 17.5% + PPDA 1%)
   taxableRemainder ≈ 1000.00
   VAT ≈ 175.00
   PPDA ≈ 10.00
   WHT remainder (3%) ≈ 30.00
   payCustomer ≈ 1185 - 10 - 30 = 1145.00

2) Labour included:
   invoice = 1185, labourAmount = 500, threshold = 35000 (no labour WHT)
   remainder = 685, taxableRemainder ≈ 578.48, VAT ≈ 101.23, PPDA ≈ 5.78, whtRemainder ≈ 17.35
   taxableLabour = 0, whtLabour = 0, totalWht ≈ 17.35, payCustomer ≈ 1185 - 5.78 - 17.35 ≈ 1161.87

3) Labour included and above threshold:
   invoice = 40000, labourAmount = 38000, threshold = 35000
   remainder = 2000, taxableRemainder ≈ 1686.39, ppda ≈ 16.86, whtRemainder ≈ 50.59
   taxableLabour = 3000, whtLabour (20%) = 600.00
   totalWht ≈ 650.59, payCustomer ≈ 40000 - 16.86 - 650.59 ≈ 39232.55
*/