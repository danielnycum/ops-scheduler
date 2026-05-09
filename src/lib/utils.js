import { APP_VERSION } from './constants';

export const uid      = () => Date.now().toString(36) + Math.random().toString(36).slice(2,7);
export const todayIdx = () => { const d = new Date().getDay(); return d === 0 ? 6 : d - 1; };
export const toMin    = t  => { const [h,m] = t.split(":").map(Number); return h*60+m; };
export const sanitize = s  => String(s).replace(/[<>"'`]/g,"").trim().slice(0,300);
export const clamp    = (v,min,max) => Math.min(Math.max(v,min),max);
export const cn       = (...classes) => classes.filter(Boolean).join(' ');

export const getCategoryById = (id, categories) =>
  categories.find(c => c.id === id) || { label: id, color: "#4a5568", icon: "📌" };

export const buildExportPayload = (tasks, categories) => ({
  version:    APP_VERSION,
  exportedAt: new Date().toISOString(),
  tasks,
  categories,
});

export const parseImportFile = (jsonString) => {
  const d = JSON.parse(jsonString);
  if (!d || typeof d !== 'object') throw new Error('Not a valid JSON object');
  if (!Array.isArray(d.tasks))      throw new Error("Missing 'tasks' array");
  if (!Array.isArray(d.categories)) throw new Error("Missing 'categories' array");
  return { tasks: d.tasks, categories: d.categories, version: d.version };
};

export const fmtMin = m =>
  `${String(Math.floor(m / 60)).padStart(2,"0")}:${String(m % 60).padStart(2,"0")}`;
