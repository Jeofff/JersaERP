// Simplified Philippine payroll math for demo purposes.
// Not a substitute for the official BIR / SSS / PhilHealth / Pag-IBIG tables.

function computeSSS(basic) {
  return Math.min(basic * 0.045, 1350);
}

function computePhilHealth(basic) {
  return Math.min(basic * 0.025, 2500);
}

function computePagIbig() {
  return 100;
}

function computeTax(taxable) {
  if (taxable <= 20833) return 0;
  if (taxable <= 33332) return (taxable - 20833) * 0.15;
  if (taxable <= 66666) return 1875 + (taxable - 33333) * 0.20;
  if (taxable <= 166666) return 8541.8 + (taxable - 66667) * 0.25;
  return 33541.8 + (taxable - 166667) * 0.30;
}

function computePayroll(emp) {
  const allowances = emp.allowances || {};
  const allowanceTotal = Object.values(allowances).reduce((a, b) => a + Number(b || 0), 0);
  const basic = Number(emp.basic || 0);
  const overtime = Number(emp.overtime || 0);
  const bonus = Number(emp.bonus || 0);

  const gross = basic + allowanceTotal + overtime + bonus;
  const sss = computeSSS(basic);
  const philhealth = computePhilHealth(basic);
  const pagibig = computePagIbig();
  const taxable = gross - sss - philhealth - pagibig;
  const tax = computeTax(Math.max(taxable, 0));
  const totalDeductions = sss + philhealth + pagibig + tax;
  const net = gross - totalDeductions;

  return {
    allowanceTotal: round2(allowanceTotal),
    gross: round2(gross),
    sss: round2(sss),
    philhealth: round2(philhealth),
    pagibig: round2(pagibig),
    tax: round2(tax),
    totalDeductions: round2(totalDeductions),
    net: round2(net),
  };
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

module.exports = { computeSSS, computePhilHealth, computePagIbig, computeTax, computePayroll };
