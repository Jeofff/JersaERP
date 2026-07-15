// JERSA ERP — components/icons.js
// Small hand-built stroke icon set (24x24, currentColor) so the project has
// zero runtime dependency risk on an external icon CDN.

function svg(paths, size = 18) {
  return `<svg class="icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
}

export const icons = {
  users: (s) => svg('<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>', s),
  calendarCheck: (s) => svg('<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="m9 16 2 2 4-4"/>', s),
  calendarX: (s) => svg('<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="m9.5 14.5 5 5M14.5 14.5l-5 5"/>', s),
  calendarClock: (s) => svg('<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><circle cx="14.5" cy="15.5" r="3.3"/><path d="M14.5 14v1.6l1.1.9"/>', s),
  wallet: (s) => svg('<path d="M3 7a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v3"/><path d="M3 7v11a2 2 0 0 0 2 2h14a1 1 0 0 0 1-1v-4"/><path d="M17 13h3a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-3a2 2 0 0 1 0-4Z"/>', s),
  box: (s) => svg('<path d="m21 8-9-5-9 5 9 5 9-5Z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/>', s),
  cart: (s) => svg('<circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2.5 3h2l2.6 12.6a2 2 0 0 0 2 1.6h8.2a2 2 0 0 0 2-1.5L21 7H6"/>', s),
  trendingUp: (s) => svg('<path d="m3 16 6-6 4 4 8-8"/><path d="M17 4h4v4"/>', s),
  layoutDashboard: (s) => svg('<rect x="3" y="3" width="8" height="9" rx="1.5"/><rect x="13" y="3" width="8" height="5" rx="1.5"/><rect x="13" y="10" width="8" height="11" rx="1.5"/><rect x="3" y="14" width="8" height="7" rx="1.5"/>', s),
  sun: (s) => svg('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>', s),
  moon: (s) => svg('<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/>', s),
  search: (s) => svg('<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>', s),
  logOut: (s) => svg('<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/>', s),
  arrowRight: (s) => svg('<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>', s),
  building: (s) => svg('<rect x="4" y="2" width="16" height="20" rx="1"/><path d="M9 22v-4h6v4M8 6h.01M12 6h.01M16 6h.01M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01"/>', s),
  user: (s) => svg('<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>', s),
  bell: (s) => svg('<path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6"/><path d="M10.3 19a1.9 1.9 0 0 0 3.4 0"/>', s),
  megaphone: (s) => svg('<path d="m3 11 18-5v12L3 14v-3Z"/><path d="M7 14v5a2 2 0 0 0 2 2h1v-6"/>', s),
  calendar: (s) => svg('<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>', s),
  clock: (s) => svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>', s),
  download: (s) => svg('<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>', s),
  printer: (s) => svg('<path d="M6 9V3h12v6"/><rect x="4" y="9" width="16" height="8" rx="1.5"/><path d="M6 14h12v7H6z"/>', s),
  chevronRight: (s) => svg('<path d="m9 18 6-6-6-6"/>', s),
  sparkles: (s) => svg('<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M17.5 17.5 15 15M6 18l2.5-2.5M17.5 6.5 15 9"/>', s),
};
