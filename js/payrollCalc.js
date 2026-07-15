// JERSA ERP — payrollCalc.js
// Simplified Philippine payroll math for demonstration purposes.
// Not a substitute for the official BIR / SSS / PhilHealth / Pag-IBIG tables.

export function computeSSS(basic) {
  return Math.min(basic * 0.045, 1350);
}
export function computePhilHealth(basic) {
  return Math.min(basic * 0.025, 2500);
}
export function computePagIbig() {
  return 100;
}
export function computeTax(taxable) {
  if (taxable <= 20833) return 0;
  if (taxable <= 33332) return (taxable - 20833) * 0.15;
  if (taxable <= 66666) return 1875 + (taxable - 33333) * 0.20;
  if (taxable <= 166666) return 8541.8 + (taxable - 66667) * 0.25;
  return 33541.8 + (taxable - 166667) * 0.30;
}

export function computePayroll(emp) {
  const allowances = emp.allowances || {};
  const allowanceTotal = Object.values(allowances).reduce((a, b) => a + Number(b || 0), 0);
  const basic = Number(emp.basic || 0);
  const overtime = Number(emp.overtime || 0);
  const bonus = Number(emp.bonus || 0);

  const gross = basic + allowanceTotal + overtime + bonus;
  const sss = computeSSS(basic);
  const philhealth = computePhilHealth(basic);
  const pagibig = computePagIbig();
  const taxable = Math.max(gross - sss - philhealth - pagibig, 0);
  const tax = computeTax(taxable);
  const totalDeductions = sss + philhealth + pagibig + tax;
  const net = gross - totalDeductions;

  return {
    allowanceTotal: r2(allowanceTotal), gross: r2(gross), sss: r2(sss), philhealth: r2(philhealth),
    pagibig: r2(pagibig), tax: r2(tax), totalDeductions: r2(totalDeductions), net: r2(net),
  };
}

function r2(n) { return Math.round(n * 100) / 100; }
