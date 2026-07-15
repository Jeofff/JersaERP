// JERSA ERP — store.js
// LocalStorage is the "database" for this offline demo. One JSON blob,
// loaded once per page view and written back on every mutation.

import { buildSeed } from './seed.js';

const DB_KEY = 'jersa_erp_db_v1';
let cache = null;

export function getDB() {
  if (cache) return cache;
  const raw = localStorage.getItem(DB_KEY);
  if (!raw) {
    cache = buildSeed();
    localStorage.setItem(DB_KEY, JSON.stringify(cache));
    return cache;
  }
  try {
    cache = JSON.parse(raw);
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
