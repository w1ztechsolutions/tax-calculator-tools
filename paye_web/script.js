// script.js
// PAYE logic (Malawi monthly-based thresholds) with final band at 40%.

function formatMK(value) {
  return 'MK' + Number(value).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2});
}

// Calculate PAYE using monthly thresholds from the original Python,
// with the final band taxed at 40% (updated per user request).
function calculatePAYE_monthly(monthlyGross, monthlyDeductions = 0) {
  const amount = monthlyGross;
  let paye = 0;
  let netSalary = amount;
  let taxable = 0;
  let bandDetails = [];

  if (amount <= 170000) {
    paye = 0;
    taxable = 0;
    netSalary = amount - monthlyDeductions;
    bandDetails.push({label: 'PAYE', amount: 0});
  } else if (amount <= 1570000) {
    taxable = amount - 170000;
    paye = taxable * 0.3;
    netSalary = amount - paye - monthlyDeductions;
    bandDetails.push({label: '0 - 170000', amount: 0});
    bandDetails.push({label: '170001 - 1570000 taxed at 30%', amount: taxable});
  } else if (amount <= 10000000) {
    taxable = amount - 1570000;
    paye = taxable * 0.35 + (1400000 * 0.3);
    netSalary = amount - paye - monthlyDeductions;
    bandDetails.push({label: '0 - 170000', amount: 0});
    bandDetails.push({label: '170001 - 1570000 taxed at 30%', amount: 420000});
    bandDetails.push({label: '1570001 - current taxed at 35%', amount: taxable});
  } else { // amount > 10000000
    taxable = amount - 10000000;
    // Final band now taxed at 40% (updated)
    paye = taxable * 0.40 + (8430000 * 0.35) + (1400000 * 0.3);
    netSalary = amount - paye - monthlyDeductions;
    bandDetails.push({label: '0 - 170000', amount: 0});
    bandDetails.push({label: '170001 - 1570000 taxed at 30%', amount: 420000});
    bandDetails.push({label: '1570001 - 10000000 taxed at 35%', amount: 8430000});
    bandDetails.push({label: '10000001+ taxed at 40%', amount: taxable});
  }

  if (netSalary < 0) netSalary = 0;

  return {
    monthlyGross: amount,
    monthlyDeductions,
    taxable,
    paye,
    netSalary,
    bandDetails
  };
}

document.getElementById('calculate').addEventListener('click', () => {
  const rawGross = parseFloat(document.getElementById('gross').value) || 0;
  const freq = document.getElementById('frequency').value;
  const rawDeductions = parseFloat(document.getElementById('deductions').value) || 0;

  const monthlyGross = freq === 'annual' ? rawGross / 12 : rawGross;
  const monthlyDeductions = rawDeductions;

  const result = calculatePAYE_monthly(monthlyGross, monthlyDeductions);

  const annualGross = result.monthlyGross * 12;
  const annualDeductions = result.monthlyDeductions * 12;
  const annualPAYE = result.paye * 12;
  const annualNet = result.netSalary * 12;

  let breakdownHtml = '';
  breakdownHtml += `<p class="small"><strong>Input interpreted as</strong>: ${freq === 'annual' ? 'Annual' : 'Monthly'}; calculations use monthly thresholds (Malawi).</p>`;

  breakdownHtml += `<div class="row"><div class="label">Gross (Monthly)</div><div class="value">${formatMK(result.monthlyGross)}</div></div>`;
  breakdownHtml += `<div class="row"><div class="label">Gross (Annual)</div><div class="value">${formatMK(annualGross)}</div></div>`;

  breakdownHtml += `<div style="height:8px"></div>`;

  breakdownHtml += `<div class="row"><div class="label">Deductions (Monthly)</div><div class="value">${formatMK(result.monthlyDeductions)}</div></div>`;
  breakdownHtml += `<div class="row"><div class="label">Deductions (Annual)</div><div class="value">${formatMK(annualDeductions)}</div></div>`;

  breakdownHtml += `<hr />`;

  breakdownHtml += `<div class="row"><div class="label">Taxable this month</div><div class="value">${formatMK(result.taxable)}</div></div>`;
  breakdownHtml += `<div class="row"><div class="label">PAYE this month</div><div class="value">${formatMK(result.paye)}</div></div>`;
  breakdownHtml += `<div class="row"><div class="label">Net pay this month</div><div class="value">${formatMK(result.netSalary)}</div></div>`;

  breakdownHtml += `<div style="height:8px"></div>`;

  breakdownHtml += `<div class="row"><div class="label">PAYE (Annual)</div><div class="value">${formatMK(annualPAYE)}</div></div>`;
  breakdownHtml += `<div class="row"><div class="label">Net pay (Annual)</div><div class="value">${formatMK(annualNet)}</div></div>`;

  breakdownHtml += `<hr />`;
  breakdownHtml += `<h3>Band details (monthly)</h3>`;
  result.bandDetails.forEach(b => {
    breakdownHtml += `<div class="row"><div class="label">${b.label}</div><div class="value">${formatMK(b.amount)}</div></div>`;
  });

  document.getElementById('breakdown').innerHTML = breakdownHtml;
  document.getElementById('results').classList.remove('hidden');
});

document.getElementById('reset').addEventListener('click', () => {
  document.getElementById('results').classList.add('hidden');
});