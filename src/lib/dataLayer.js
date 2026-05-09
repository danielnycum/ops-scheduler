export const DataLayer = {
  async get(key) {
    try {
      const r = await window.storage.get(key);
      if (r) return JSON.parse(r.value);
    } catch {}
    try {
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw);
    } catch {}
    return null;
  },
  async set(key, value) {
    const serialized = JSON.stringify(value);
    try { await window.storage.set(key, serialized); } catch {}
    try { localStorage.setItem(key, serialized); } catch {}
  },
  async getShared(key) {
    try {
      const r = await window.storage.get(key, true);
      if (r) return JSON.parse(r.value);
    } catch {}
    return null;
  },
  async setShared(key, value) {
    try { await window.storage.set(key, JSON.stringify(value), true); } catch {}
  },
};
