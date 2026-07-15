// JERSA ERP — utils.js
// Small, dependency-free helpers shared across pages.

export function peso(amount, opts = {}) {
  const n = Number(amount || 0);
  return '₱' + n.toLocaleString('en-PH', { maximumFractionDigits: opts.decimals ?? 0, minimumFractionDigits: opts.decimals ?? 0 });
}

export function number(n) {
  return Number(n || 0).toLocaleString('en-PH');
}

export function initials(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase();
}

export function uid(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function formatDate(iso, opts = {}) {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-PH', { month: opts.month || 'short', day: 'numeric', year: opts.year !== false ? 'numeric' : undefined });
}

export function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' });
}

export function monthLabel(offsetFromNow) {
  const d = new Date();
  d.setMonth(d.getMonth() + offsetFromNow);
  return d.toLocaleDateString('en-PH', { month: 'short' });
}

export function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

export function el(html) {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  return template.content.firstElementChild;
}

export function qs(root, sel) { return root.querySelector(sel); }
export function qsa(root, sel) { return Array.from(root.querySelectorAll(sel)); }

export function daysInMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate();
}
