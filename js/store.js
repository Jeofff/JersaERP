// JERSA ERP — store.js
// LocalStorage is the "database" for this offline demo. One JSON blob,
// loaded once per page view and written back on every mutation.

import { buildSeed, SCHEMA_VERSION } from './seed.js';

const DB_KEY = 'jersa_erp_db_v1';
let cache = null;

function isStale(data) {
  return !data || data.schemaVersion !== SCHEMA_VERSION;
}

export function getDB() {
  if (cache) return cache;
  const raw = localStorage.getItem(DB_KEY);
  if (!raw) {
    cache = buildSeed();
    localStorage.setItem(DB_KEY, JSON.stringify(cache));
    return cache;
  }
  try {
    const parsed = JSON.parse(raw);
    if (isStale(parsed)) {
      // The seeded data shape changed since this browser last visited —
      // reseed rather than showing outdated numbers forever.
      cache = buildSeed();
      localStorage.setItem(DB_KEY, JSON.stringify(cache));
    } else {
      cache = parsed;
    }
  } catch (e) {
    cache = buildSeed();
    localStorage.setItem(DB_KEY, JSON.stringify(cache));
  }
  return cache;
}

export function saveDB() {
  if (!cache) return;
  localStorage.setItem(DB_KEY, JSON.stringify(cache));
}

export function resetDB() {
  cache = buildSeed();
  localStorage.setItem(DB_KEY, JSON.stringify(cache));
  return cache;
}
