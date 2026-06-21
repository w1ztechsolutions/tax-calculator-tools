//scenarios/scenario6
//compute base amount for invoice inclusive VAT only

export function computeBaseAmount({
    invoice,   // Total invoice amount including VAT
    vatRate = 17.5, //percent
    whtRate = 3.0, //percent 
    rounding = 2   //decimal places for returnrd values
} = {}) {
    // Input validation
    const toNumber = (v) => {
        const n = typeof v === 'number' ? v : parseFloat(String(v).replace(/,/g, ''));
        if (!isFinite(n)) throw new Error('Invalid numeric input');
        return n;
    };

    const invoiceAmt = toNumber(invoice);
    if (invoiceAmt < 0) throw new Error('Invoice amount must be non-negative');

    //convert percents to decimals
    const vat = toNumber(vatRate) / 100;
    const wht = toNumber(whtRate) / 100;

    // reverse invoice to get taxable amount
    const taxableAmountRaw = invoiceAmt / (1 + vat);

    //compute componets based on taxable amount
    const vatAmountRaw = taxableAmountRaw * vat;
    const whtAmountRaw = taxableAmountRaw * wht;

    //Amount to pay supllier
    const paySupplierRaw = invoiceAmt - whtAmountRaw;

    //rounding helper
    const round = (v, d) => {
        const factor = Math.pow(10, d);
        return Math.round((v + Number.EPSILON) * factor) / factor;
    };

    const d = Number.isInteger(rounding) ? rounding : 2;

    return{
        imvoice: round(invoiceAmt, d),
        taxableAmount: round(taxableAmountRaw, d),
        vatAmount: round(vatAmountRaw, d),
        whtAmount: round(whtAmountRaw, d),
        paySupplier: round(paySupplierRaw, d),
        //raw values (unrounded) for precise downstream use
        _raw: {
            taxableAmount: taxableAmountRaw,
            vatAmount: vatAmountRaw,
            whtAmount: whtAmountRaw,
            paySupplier: paySupplierRaw
        }
    };
}