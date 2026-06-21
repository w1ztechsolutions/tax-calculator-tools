// scenarios/scenario5.js

export function computeBaseAmount({
    invoice,        //total invoice amount
    whtRate = 3.0, //percent (to be used for cuculating WHT)
    rounding = 2   // decimal places for returned values
} = {}) {
    //input validation
    const toNumber = (v) => {
        const n = typeof v === 'number' ? v: parseFloat(String(v).replace(/,/g, ''));
        if (!isFinite(n)) throw new Error('Invalid numeric input');
        return n;
    };

    const invoiceAmt = toNumber(invoice);
    if (invoiceAmt < 0) throw new Error('Invoice amount must be non-negative');

    //taxable amount
    const taxableAmountRAw = invoiceAmt

    //convert percents to decimals
    const wht = toNumber(whtRate) / 100;

    //calculate the WHT
    const whtAmountRaw = invoiceAmt * wht;

    //Amount to pay supplier: invoice minus WHT
    const paySupplierRaw = invoiceAmt - whtAmountRaw;

    //rounding helper
    const round = (v, d) => {
        const factor = Math.pow(10, d);
        return Math.round((v + Number.EPSILON) * factor) / factor;
    };

    const d = Number.isInteger(rounding) ? rounding : 2;

    return {
        invoice: round(invoiceAmt, d),
        taxableAmount: round(taxableAmountRAw, d),
        whtAmount: round(whtAmountRaw, d),
        paySupplier: round(paySupplierRaw, d),

        //raw values (Unrounded) for precise downstream
        _raw: {
            taxableAmount: taxableAmountRAw,
            whtAmount: whtAmountRaw,
            paySupplier: paySupplierRaw
        }
    };
}