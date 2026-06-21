// scenarios/scenario2.js
// Hospitality scenario — Tourism Levy, PPDA, VAT, optional hall hire with adjustable WHT rates
// Exports: computeScenario2(options)
// Defaults: vatRate = 17.5, ppdaRate = 1.0, tourismRate = 1.0, remainingWhtRate = 3.0, hallHireWhtRate = 20.0

export function computeScenario2({
  invoice,
  vatRate = 17.5,
  ppdaRate = 1.0,
  tourismRate = 1.0,
  remainingWhtRate = 3.0,
  hallHireWhtRate = 20.0,
  hallHireIncluded = false,
  hallHireAmount = 0,
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
  const tourism = toNumber(tourismRate) / 100;
  const remainingWht = toNumber(remainingWhtRate) / 100;
  const hallWht = toNumber(hallHireWhtRate) / 100;

  // Reverse invoice to taxable amount before VAT, PPDA, tourism levy
  const taxableAmountRaw = invoiceAmt / (1 + vat + ppda + tourism);

  const vatAmountRaw = taxableAmountRaw * vat;
  const ppdaAmountRaw = taxableAmountRaw * ppda;
  const tourismAmountRaw = taxableAmountRaw * tourism;

  let whtAmountRaw = 0;
  let whtHallRaw = 0;
  let whtRemainingRaw = 0;

  if (hallHireIncluded) {
    const hallAmt = toNumber(hallHireAmount);
    if (hallAmt < 0) throw new Error('Hall hire amount must be non-negative');
    if (hallAmt > invoiceAmt) throw new Error('Hall hire amount cannot exceed total invoice amount');

    const proportionHall = hallAmt / invoiceAmt;
    const taxableHallRaw = taxableAmountRaw * proportionHall;

    whtHallRaw = taxableHallRaw * hallWht;
    const remainingTaxableRaw = taxableAmountRaw - taxableHallRaw;
    whtRemainingRaw = remainingTaxableRaw * remainingWht;

    whtAmountRaw = whtHallRaw + whtRemainingRaw;
  } else {
    whtAmountRaw = taxableAmountRaw * remainingWht;
    whtRemainingRaw = whtAmountRaw;
  }

  const paySupplierRaw = invoiceAmt - ppdaAmountRaw - whtAmountRaw;

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
    tourismAmount: round(tourismAmountRaw, d),
    whtAmount: round(whtAmountRaw, d),
    whtHall: round(whtHallRaw, d),
    whtRemaining: round(whtRemainingRaw, d),
    paySupplier: round(paySupplierRaw, d),
    _raw: {
      taxableAmount: taxableAmountRaw,
      vatAmount: vatAmountRaw,
      ppdaAmount: ppdaAmountRaw,
      tourismAmount: tourismAmountRaw,
      whtAmount: whtAmountRaw,
      whtHall: whtHallRaw,
      whtRemaining: whtRemainingRaw,
      paySupplier: paySupplierRaw
    }
  };
}