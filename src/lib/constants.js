export const DAYS       = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
export const SHORT_DAYS = ["MON","TUE","WED","THU","FRI","SAT","SUN"];
export const PRIORITIES = ["High","Medium","Low"];
export const APP_VERSION = "2.0.0";

export const COLORS = {
  bg:             "#0b0f1a",
  panel:          "#0f1523",
  panelAlt:       "#141d2e",
  panelHi:        "#1a2438",
  border:         "#1e2d45",
  borderHi:       "#2d4265",
  accent:         "#6366f1",
  accentDim:      "#3730a3",
  accentText:     "#818cf8",
  accentSurface:  "#1e1b4b",
  text:           "#e2e8f4",
  muted:          "#94a3b8",
  subtle:         "#64748b",
  disabled:       "#475569",
  success:        "#22c55e",
  successText:    "#4ade80",
  successSurface: "#052010",
  warn:           "#f59e0b",
  warnText:       "#fbbf24",
  warnSurface:    "#1c1002",
  danger:         "#ef4444",
  dangerText:     "#f87171",
  dangerSurface:  "#1c0505",
  ai:             "#a855f7",
  aiDim:          "#6b21a8",
  aiText:         "#c084fc",
  aiSurface:      "#2e1065",
};

export const PRIORITY_META = {
  High:   { color:"#f87171", bg:"rgba(248,113,113,0.1)", border:"rgba(248,113,113,0.3)" },
  Medium: { color:"#fbbf24", bg:"rgba(251,191,36,0.1)",  border:"rgba(251,191,36,0.3)"  },
  Low:    { color:"#4ade80", bg:"rgba(74,222,128,0.1)",  border:"rgba(74,222,128,0.3)"  },
};

export const DEFAULT_CATEGORIES = [
  { id:"class",   label:"Class",   color:"#60a5fa", icon:"📚", locked:true },
  { id:"study",   label:"Study",   color:"#a78bfa", icon:"✏️",  locked:true },
  { id:"workout", label:"Workout", color:"#fbbf24", icon:"💪", locked:true },
  { id:"golf",    label:"Golf",    color:"#34d399", icon:"⛳", locked:true },
];

export const STORAGE_KEYS = {
  tasks: "sched_v2_tasks",
  cats:  "sched_v2_cats",
  prefs: "sched_v2_prefs",
};

/* Distinct from default category colors (blue, violet, amber, emerald) */
export const COURSE_COLORS = [
  '#f472b6', // pink-400
  '#fb923c', // orange-400
  '#2dd4bf', // teal-400
  '#e879f9', // fuchsia-400
  '#22d3ee', // cyan-400
  '#a3e635', // lime-400
  '#f87171', // red-400
  '#38bdf8', // sky-400
  '#c084fc', // purple-400
  '#4ade80', // green-400
];

export function gradeLabel(grade) {
  if (grade === null || grade === undefined || grade === '') return null;
  const n = +grade;
  if (n >= 90) return { letter: 'A', color: '#4ade80' };
  if (n >= 80) return { letter: 'B', color: '#818cf8' };
  if (n >= 70) return { letter: 'C', color: '#fbbf24' };
  if (n >= 60) return { letter: 'D', color: '#fb923c' };
  return           { letter: 'F', color: '#f87171' };
}
