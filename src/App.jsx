import { useState, useEffect, useCallback, useRef, createContext, useContext } from "react";

// ════════════════════════════════════════════════════════════════════════════════
// CONSTANTS & CONFIG
// ════════════════════════════════════════════════════════════════════════════════
const DAYS        = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const SHORT_DAYS  = ["MON","TUE","WED","THU","FRI","SAT","SUN"];
const PRIORITIES  = ["High","Medium","Low"];
const APP_VERSION = "2.0.0";

const COLORS = {
  bg:        "#07090d",
  panel:     "#0c1018",
  panelAlt:  "#0f1520",
  border:    "#182030",
  borderHi:  "#1e2d44",
  accent:    "#3b82f6",
  accentDim: "#1d3a5e",
  text:      "#dce8f4",
  textMid:   "#5a7a99",
  textDim:   "#283848",
  success:   "#22c55e",
  warn:      "#f59e0b",
  danger:    "#ef4444",
  ai:        "#8b5cf6",
};

const PRIORITY_META = {
  High:   { color:"#f87171", bg:"rgba(248,113,113,0.08)", border:"rgba(248,113,113,0.2)" },
  Medium: { color:"#fbbf24", bg:"rgba(251,191,36,0.08)",  border:"rgba(251,191,36,0.2)"  },
  Low:    { color:"#4ade80", bg:"rgba(74,222,128,0.08)",  border:"rgba(74,222,128,0.2)"  },
};

const DEFAULT_CATEGORIES = [
  { id:"class",   label:"Class",   color:"#60a5fa", icon:"📚", locked:true },
  { id:"study",   label:"Study",   color:"#a78bfa", icon:"✏️",  locked:true },
  { id:"workout", label:"Workout", color:"#fbbf24", icon:"💪", locked:true },
  { id:"golf",    label:"Golf",    color:"#34d399", icon:"⛳", locked:true },
];

const STORAGE_KEYS = { tasks:"sched_v2_tasks", cats:"sched_v2_cats", prefs:"sched_v2_prefs" };
const FONT = "'DM Mono', 'Fira Code', 'Courier New', monospace";

// ════════════════════════════════════════════════════════════════════════════════
// UTILITIES
// ════════════════════════════════════════════════════════════════════════════════
const uid        = () => Date.now().toString(36) + Math.random().toString(36).slice(2,7);
const todayIdx   = () => { const d = new Date().getDay(); return d === 0 ? 6 : d - 1; };
const toMin      = t  => { const [h,m] = t.split(":").map(Number); return h*60+m; };
const sanitize   = s  => String(s).replace(/[<>"'`]/g,"").trim().slice(0,300);
const clamp      = (v,min,max) => Math.min(Math.max(v,min),max);

function findConflicts(tasks) {
  const ids = new Set();
  const byDay = {};
  tasks.forEach(t => (byDay[t.day] = byDay[t.day] || []).push(t));
  Object.values(byDay).forEach(group => {
    const sorted = [...group].sort((a,b) => toMin(a.startTime) - toMin(b.startTime));
    for (let i = 0; i < sorted.length; i++) {
      for (let j = i+1; j < sorted.length; j++) {
        const [a,b] = [sorted[i], sorted[j]];
        if (toMin(a.startTime) < toMin(b.endTime) && toMin(a.endTime) > toMin(b.startTime)) {
          ids.add(a.id); ids.add(b.id);
        }
      }
    }
  });
  return ids;
}

function validateTask(f, tasks, editId) {
  const errs = {};
  if (!f.title.trim()) errs.title = "Title required";
  else if (f.title.trim().length > 120) errs.title = "Max 120 chars";
  if (toMin(f.startTime) >= toMin(f.endTime)) errs.time = "End must be after start";
  return errs;
}

function validateCat(f, cats) {
  const errs = {};
  if (!f.label.trim()) errs.label = "Label required";
  else if (f.label.trim().length > 40) errs.label = "Max 40 chars";
  else if (cats.find(c => c.label.toLowerCase() === f.label.trim().toLowerCase())) errs.label = "Already exists";
  return errs;
}

// ════════════════════════════════════════════════════════════════════════════════
// DATA LAYER  (swap this out for a real API later — one file, one place)
// ════════════════════════════════════════════════════════════════════════════════
const DataLayer = {
  async get(key) {
    // Try artifact storage first, fall back to localStorage
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

// ════════════════════════════════════════════════════════════════════════════════
// HOOKS
// ════════════════════════════════════════════════════════════════════════════════
function useToast() {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((msg, type = "success") => {
    const id = uid();
    setToasts(p => [...p.slice(-4), { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3800);
  }, []);
  return { toasts, push };
}

function useAsyncStorage(key, fallback, shared = false) {
  const [state, setState] = useState(fallback);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const val = shared ? await DataLayer.getShared(key) : await DataLayer.get(key);
      if (val !== null) setState(val);
      setReady(true);
    })();
  }, [key, shared]);

  const set = useCallback(async (updater) => {
    setState(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      if (shared) DataLayer.setShared(key, next).catch(() => {});
      else DataLayer.set(key, next).catch(() => {});
      return next;
    });
  }, [key, shared]);

  return [state, set, ready];
}

// ════════════════════════════════════════════════════════════════════════════════
// PRIMITIVE COMPONENTS
// ════════════════════════════════════════════════════════════════════════════════
function Toast({ toasts }) {
  const typeStyle = {
    success: { bg:"#0a1f12", border:"#14532d", color:"#86efac" },
    warn:    { bg:"#1c1200", border:"#713f12", color:"#fde68a" },
    error:   { bg:"#1c0808", border:"#7f1d1d", color:"#fca5a5" },
    info:    { bg:"#0a1220", border:"#1e3a5f", color:"#93c5fd" },
  };
  return (
    <div style={{ position:"fixed", bottom:24, right:24, zIndex:1000, display:"flex", flexDirection:"column", gap:8, pointerEvents:"none" }}>
      {toasts.map(t => {
        const ts = typeStyle[t.type] || typeStyle.info;
        return (
          <div key={t.id} style={{
            padding:"9px 15px", borderRadius:5, fontSize:11, fontFamily:FONT,
            letterSpacing:"0.06em", boxShadow:"0 8px 32px rgba(0,0,0,0.6)",
            background:ts.bg, border:`1px solid ${ts.border}`, color:ts.color,
            animation:"slideUp 0.2s ease",
          }}>{t.msg}</div>
        );
      })}
    </div>
  );
}

function Modal({ onClose, title, width = 440, children }) {
  useEffect(() => {
    const fn = e => e.key === "Escape" && onClose();
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);
  return (
    <div onClick={onClose} style={{
      position:"fixed", inset:0, zIndex:500,
      background:"rgba(0,0,0,0.8)", backdropFilter:"blur(8px)",
      display:"flex", alignItems:"center", justifyContent:"center",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background:COLORS.panel, border:`1px solid ${COLORS.borderHi}`,
        borderRadius:8, padding:28, width, maxWidth:"94vw",
        boxShadow:"0 32px 80px rgba(0,0,0,0.8)",
        animation:"modalIn 0.18s ease",
      }}>
        <div style={{ fontSize:10, letterSpacing:"0.22em", color:COLORS.textMid, textTransform:"uppercase", marginBottom:22, fontWeight:600 }}>{title}</div>
        {children}
      </div>
    </div>
  );
}

function Btn({ children, variant = "default", onClick, style: sx, disabled, title }) {
  const v = {
    primary: { bg:"#0f2240", border:COLORS.accentDim, color:"#60a5fa" },
    ai:      { bg:"#130d28", border:"#3b1f6e",        color:"#a78bfa" },
    danger:  { bg:"#1a0808", border:"#6b1010",        color:"#f87171" },
    success: { bg:"#0a1f10", border:"#1a5c2a",        color:"#4ade80" },
    default: { bg:"#0a0f16", border:COLORS.border,    color:COLORS.textMid },
  }[variant] || {};
  return (
    <button disabled={disabled} title={title} onClick={onClick} style={{
      padding:"6px 13px", borderRadius:4, fontSize:10, letterSpacing:"0.1em",
      cursor:disabled?"not-allowed":"pointer", fontFamily:FONT, textTransform:"uppercase",
      border:`1px solid ${v.border}`, background:v.bg, color:v.color,
      opacity:disabled?0.4:1, transition:"all 0.12s", ...sx,
    }}>{children}</button>
  );
}

function Field({ label, error, children }) {
  return (
    <div style={{ marginBottom:12 }}>
      {label && <div style={{ fontSize:9, letterSpacing:"0.18em", color:COLORS.textDim, textTransform:"uppercase", marginBottom:5 }}>{label}</div>}
      {children}
      {error && <div style={{ fontSize:10, color:COLORS.danger, marginTop:3, letterSpacing:"0.04em" }}>{error}</div>}
    </div>
  );
}

function Input({ value, onChange, placeholder, type="text", maxLength, error, autoFocus, onKeyDown, style:sx }) {
  return (
    <input
      type={type} value={value} onChange={onChange} placeholder={placeholder}
      maxLength={maxLength} autoFocus={autoFocus} onKeyDown={onKeyDown}
      style={{
        width:"100%", background:"#08101a", border:`1px solid ${error?COLORS.danger:COLORS.border}`,
        borderRadius:4, color:COLORS.text, padding:"8px 10px", fontSize:12,
        fontFamily:FONT, outline:"none", boxSizing:"border-box", ...sx,
      }}
    />
  );
}

function Select({ value, onChange, children, style:sx }) {
  return (
    <select value={value} onChange={onChange} style={{
      width:"100%", background:"#08101a", border:`1px solid ${COLORS.border}`,
      borderRadius:4, color:COLORS.text, padding:"8px 10px", fontSize:12,
      fontFamily:FONT, boxSizing:"border-box", ...sx,
    }}>{children}</select>
  );
}

function Tag({ children, color, bg }) {
  return (
    <span style={{ fontSize:9, padding:"2px 7px", borderRadius:3, background:bg, color, letterSpacing:"0.1em", textTransform:"uppercase", whiteSpace:"nowrap" }}>
      {children}
    </span>
  );
}

function ProgressBar({ pct }) {
  return (
    <div style={{ height:2, background:COLORS.border, borderRadius:1, overflow:"hidden" }}>
      <div style={{ height:"100%", width:`${pct}%`, background:`linear-gradient(90deg,${COLORS.accentDim},${COLORS.accent})`, borderRadius:1, transition:"width 0.5s ease" }}/>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// TASK FORM MODAL
// ════════════════════════════════════════════════════════════════════════════════
function TaskModal({ initial, editId, categories, tasks, onSave, onClose }) {
  const [f, setF] = useState(initial);
  const [errs, setErrs] = useState({});
  const set = k => v => setF(p => ({ ...p, [k]: v }));

  function submit() {
    const e = validateTask(f, tasks, editId);
    if (Object.keys(e).length) { setErrs(e); return; }
    onSave({ ...f, title: sanitize(f.title), notes: sanitize(f.notes) });
  }

  return (
    <Modal onClose={onClose} title={editId ? "Edit Task" : "New Task"}>
      <Field label="Title *" error={errs.title}>
        <Input value={f.title} onChange={e=>set("title")(e.target.value)} placeholder="e.g. Accounting lecture" maxLength={120} autoFocus error={errs.title} onKeyDown={e=>e.key==="Enter"&&submit()}/>
      </Field>

      <div style={{ display:"flex", gap:10 }}>
        <Field label="Day" style={{ flex:1 }}>
          <Select value={f.day} onChange={e=>set("day")(+e.target.value)}>
            {DAYS.map((d,i) => <option key={d} value={i}>{d}</option>)}
          </Select>
        </Field>
        <Field label="Category" style={{ flex:1 }}>
          <Select value={f.category} onChange={e=>set("category")(e.target.value)}>
            {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
          </Select>
        </Field>
      </div>

      <div style={{ display:"flex", gap:10 }}>
        <Field label="Start *" error={errs.time} style={{ flex:1 }}>
          <Input type="time" value={f.startTime} onChange={e=>set("startTime")(e.target.value)} error={errs.time}/>
        </Field>
        <Field label="End *" style={{ flex:1 }}>
          <Input type="time" value={f.endTime} onChange={e=>set("endTime")(e.target.value)} error={errs.time}/>
        </Field>
        <Field label="Priority" style={{ flex:1 }}>
          <Select value={f.priority} onChange={e=>set("priority")(e.target.value)}>
            {PRIORITIES.map(p => <option key={p}>{p}</option>)}
          </Select>
        </Field>
      </div>

      <Field label="Notes (optional)">
        <Input value={f.notes} onChange={e=>set("notes")(e.target.value)} placeholder="Optional details..." maxLength={200}/>
      </Field>

      <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:8 }}>
        <Btn onClick={onClose}>Cancel</Btn>
        <Btn variant="primary" onClick={submit}>{editId ? "Save Changes" : "Add Task"}</Btn>
      </div>
    </Modal>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// CATEGORY FORM MODAL
// ════════════════════════════════════════════════════════════════════════════════
function CatModal({ categories, onSave, onClose }) {
  const [f, setF] = useState({ label:"", color:"#6366f1", icon:"📌" });
  const [errs, setErrs] = useState({});
  const set = k => v => setF(p => ({ ...p, [k]: v }));

  function submit() {
    const e = validateCat(f, categories);
    if (Object.keys(e).length) { setErrs(e); return; }
    onSave({ id: uid(), label: sanitize(f.label), color: f.color, icon: f.icon || "📌", locked: false });
  }

  return (
    <Modal onClose={onClose} title="New Category" width={360}>
      <Field label="Label *" error={errs.label}>
        <Input value={f.label} onChange={e=>set("label")(e.target.value)} placeholder="e.g. Drill Weekend" maxLength={40} autoFocus error={errs.label} onKeyDown={e=>e.key==="Enter"&&submit()}/>
      </Field>
      <div style={{ display:"flex", gap:10 }}>
        <Field label="Emoji" style={{ flex:1 }}>
          <Input value={f.icon} onChange={e=>set("icon")(e.target.value)} placeholder="🎯" maxLength={4}/>
        </Field>
        <Field label="Color" style={{ flex:1 }}>
          <input type="color" value={f.color} onChange={e=>set("color")(e.target.value)} style={{ width:"100%", height:36, background:"transparent", border:`1px solid ${COLORS.border}`, borderRadius:4, cursor:"pointer", padding:2 }}/>
        </Field>
      </div>
      <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:8 }}>
        <Btn onClick={onClose}>Cancel</Btn>
        <Btn variant="primary" onClick={submit}>Add Category</Btn>
      </div>
    </Modal>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// AI PANEL
// ════════════════════════════════════════════════════════════════════════════════
function AIPanel({ tasks, categories, conflicts, onClose }) {
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [err, setErr] = useState("");

  const getCat = id => categories.find(c => c.id === id) || { label: id, icon: "📌" };

  async function run() {
    setLoading(true); setText(""); setErr("");
    const summary = tasks.length
      ? tasks.map(t => `${DAYS[t.day]} ${t.startTime}-${t.endTime} [${getCat(t.category).label}] "${t.title}" (${t.priority} priority)${t.completed?" ✓":""}`).join("\n")
      : "No tasks scheduled.";
    const conflictTitles = tasks.filter(t => conflicts.has(t.id)).map(t => `"${t.title}"`).join(", ");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:1000,
          system:`You are a scheduling advisor for a college student (accounting major at Ave Maria University) who is in the Army National Guard and is a competitive golfer. Analyze their weekly schedule and provide 4-6 specific, direct, actionable recommendations. Identify real problems: overloading, poor recovery time, academic-military conflicts, insufficient study blocks. Be direct and honest. Format as a clean numbered list. No preamble or filler.`,
          messages:[{ role:"user", content:`Schedule:\n${summary}\n${conflictTitles ? `\nTime conflicts detected: ${conflictTitles}` : ""}\n\nAnalyze and give optimization recommendations.` }]
        })
      });
      if (!res.ok) throw new Error(`API ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      setText(data?.content?.find(b => b.type==="text")?.text || "No response.");
    } catch(e) {
      setErr(e.message || "Request failed. Try again.");
    }
    setLoading(false);
  }

  useEffect(() => { run(); }, []);

  return (
    <div style={{
      position:"fixed", right:0, top:0, bottom:0, width:380, zIndex:400,
      background:"#08060f", borderLeft:"1px solid #1a1030",
      display:"flex", flexDirection:"column", padding:24,
      boxShadow:"-16px 0 60px rgba(0,0,0,0.6)",
      animation:"slideLeft 0.2s ease",
    }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div style={{ fontSize:10, letterSpacing:"0.22em", color:"#7c5cbf", textTransform:"uppercase", fontWeight:600 }}>⚡ AI Analysis</div>
        <button onClick={onClose} style={{ background:"none", border:"none", color:COLORS.textDim, cursor:"pointer", fontSize:14, fontFamily:FONT }}>✕</button>
      </div>
      <div style={{ flex:1, overflow:"auto", fontSize:12, color:"#a89cc8", lineHeight:1.95, whiteSpace:"pre-wrap" }}>
        {loading && <div style={{ color:"#3d2a60", letterSpacing:"0.1em" }}>ANALYZING SCHEDULE...</div>}
        {err && <div style={{ color:COLORS.danger }}>{err}</div>}
        {text}
      </div>
      {!loading && (
        <Btn variant="ai" onClick={run} sx={{ marginTop:16 }}>↺ Regenerate</Btn>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// WEEKLY VIEW
// ════════════════════════════════════════════════════════════════════════════════
function WeeklyView({ tasks, categories, conflicts, onDayClick }) {
  const getCat = id => categories.find(c => c.id === id) || { color:"#4a5568", icon:"📌" };
  const today = todayIdx();

  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:8, height:"100%" }}>
      {DAYS.map((day, i) => {
        const isToday = i === today;
        const list = tasks.filter(t => t.day === i).sort((a,b) => a.startTime.localeCompare(b.startTime));
        const hasConflict = list.some(t => conflicts.has(t.id));
        return (
          <div key={day} style={{
            background: isToday ? "#0c1828" : COLORS.panel,
            border: `1px solid ${hasConflict?"#5a1010":isToday?COLORS.accentDim:COLORS.border}`,
            borderRadius:6, overflow:"hidden", display:"flex", flexDirection:"column",
            cursor:"pointer", transition:"border-color 0.15s",
          }} onClick={() => onDayClick(i)}>
            <div style={{ padding:"8px 10px", borderBottom:`1px solid ${COLORS.border}`, background: isToday?"#0f2030":COLORS.panelAlt }}>
              <div style={{ fontSize:9, letterSpacing:"0.2em", color:isToday?COLORS.accent:COLORS.textDim, textTransform:"uppercase", fontWeight:600 }}>{SHORT_DAYS[i]}</div>
              <div style={{ fontSize:9, color:COLORS.textDim, marginTop:2 }}>{list.length} task{list.length!==1?"s":""}</div>
            </div>
            <div style={{ padding:6, flex:1, overflow:"hidden" }}>
              {list.length === 0 && <div style={{ fontSize:9, color:COLORS.textDim, textAlign:"center", padding:"12px 4px" }}>—</div>}
              {list.slice(0, 6).map(task => {
                const cat = getCat(task.category);
                return (
                  <div key={task.id} style={{
                    padding:"4px 7px", borderRadius:3, marginBottom:3,
                    background: task.completed ? "rgba(255,255,255,0.02)" : `${cat.color}14`,
                    borderLeft: `2px solid ${conflicts.has(task.id)?"#f87171":task.completed?"#1e2a38":cat.color}`,
                    opacity: task.completed ? 0.4 : 1,
                  }}>
                    <div style={{ fontSize:10, color:"#c5d4e3", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{cat.icon} {task.title}</div>
                    <div style={{ fontSize:9, color:COLORS.textDim, marginTop:1 }}>{task.startTime}</div>
                  </div>
                );
              })}
              {list.length > 6 && <div style={{ fontSize:9, color:COLORS.textDim, padding:"2px 4px" }}>+{list.length-6} more</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// DAILY VIEW
// ════════════════════════════════════════════════════════════════════════════════
function DailyView({ tasks, categories, conflicts, selectedDay, onDayChange, filter, onToggle, onEdit, onDelete }) {
  const getCat = id => categories.find(c => c.id === id) || { label:id, color:"#4a5568", icon:"📌" };
  const list = tasks
    .filter(t => t.day === selectedDay && (filter === "all" || t.category === filter))
    .sort((a,b) => a.startTime.localeCompare(b.startTime));
  const dayConflict = list.some(t => conflicts.has(t.id));

  return (
    <div style={{ maxWidth:680, margin:"0 auto" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <button onClick={() => onDayChange(d => Math.max(0, d-1))} style={{ padding:"7px 14px", background:COLORS.panelAlt, border:`1px solid ${COLORS.border}`, borderRadius:4, color:COLORS.textMid, cursor:"pointer", fontSize:12, fontFamily:FONT }}>← Prev</button>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:18, fontWeight:700, color:"#f0f6ff", letterSpacing:"0.04em" }}>{DAYS[selectedDay]}</div>
          <div style={{ fontSize:9, color:COLORS.textDim, marginTop:2, letterSpacing:"0.1em" }}>{list.length} TASK{list.length!==1?"S":""}</div>
        </div>
        <button onClick={() => onDayChange(d => Math.min(6, d+1))} style={{ padding:"7px 14px", background:COLORS.panelAlt, border:`1px solid ${COLORS.border}`, borderRadius:4, color:COLORS.textMid, cursor:"pointer", fontSize:12, fontFamily:FONT }}>Next →</button>
      </div>

      {dayConflict && (
        <div style={{ background:"#1a0808", border:"1px solid #7f1d1d", borderRadius:5, padding:"8px 14px", marginBottom:14, fontSize:11, color:"#f87171", letterSpacing:"0.05em" }}>
          ⚠ Time conflict on {DAYS[selectedDay]} — overlapping tasks highlighted below
        </div>
      )}

      {list.length === 0 ? (
        <div style={{ textAlign:"center", padding:"60px 20px", color:COLORS.textDim, fontSize:11, letterSpacing:"0.12em" }}>
          NO TASKS<br/><span style={{ fontSize:9, color:COLORS.textDim }}>USE + ADD TASK TO BEGIN</span>
        </div>
      ) : list.map(task => {
        const cat = getCat(task.category);
        const conflict = conflicts.has(task.id);
        const pm = PRIORITY_META[task.priority];
        return (
          <div key={task.id} style={{
            background: task.completed ? "#090d12" : COLORS.panelAlt,
            border: `1px solid ${conflict?"#7f1d1d30":task.completed?COLORS.border:`${cat.color}22`}`,
            borderLeft: `3px solid ${conflict?"#f87171":task.completed?COLORS.textDim:cat.color}`,
            borderRadius:6, padding:"13px 15px", marginBottom:9,
            opacity: task.completed ? 0.5 : 1, transition:"opacity 0.2s",
          }}>
            <div style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
              <div onClick={() => onToggle(task.id)} style={{
                width:16, height:16, borderRadius:3, marginTop:2, flexShrink:0,
                border:`1px solid ${task.completed?"#22c55e":"#2d3f52"}`,
                background: task.completed?"#14532d":"transparent",
                cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:10, color:"#4ade80", userSelect:"none",
              }}>{task.completed?"✓":""}</div>

              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:600, color:task.completed?COLORS.textDim:"#e2eaf4", textDecoration:task.completed?"line-through":"none", letterSpacing:"0.02em" }}>{task.title}</div>
                <div style={{ display:"flex", gap:6, marginTop:6, flexWrap:"wrap", alignItems:"center" }}>
                  <span style={{ fontSize:10, color:COLORS.textDim, letterSpacing:"0.04em" }}>{task.startTime} – {task.endTime}</span>
                  <Tag color={cat.color} bg={`${cat.color}18`}>{cat.icon} {cat.label}</Tag>
                  <Tag color={pm.color} bg={pm.bg}>{task.priority}</Tag>
                  {conflict && <Tag color="#f87171" bg="rgba(248,113,113,0.08)">⚠ conflict</Tag>}
                </div>
                {task.notes && <div style={{ fontSize:11, color:COLORS.textDim, marginTop:7, lineHeight:1.6 }}>{task.notes}</div>}
              </div>

              <div style={{ display:"flex", gap:4, flexShrink:0 }}>
                <button onClick={() => onEdit(task)} title="Edit" style={{ background:"none", border:"none", color:COLORS.textDim, cursor:"pointer", fontSize:12, padding:"2px 5px", fontFamily:FONT }}>✎</button>
                <button onClick={() => onDelete(task.id)} title="Delete" style={{ background:"none", border:"none", color:COLORS.textDim, cursor:"pointer", fontSize:12, padding:"2px 5px", fontFamily:FONT }}>✕</button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// ROOT APP
// ════════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [tasks,      setTasks,      tasksReady] = useAsyncStorage(STORAGE_KEYS.tasks, []);
  const [categories, setCategories, catsReady]  = useAsyncStorage(STORAGE_KEYS.cats,  DEFAULT_CATEGORIES);
  const [prefs,      setPrefs]                  = useAsyncStorage(STORAGE_KEYS.prefs, { sharedMode: false });

  const [view,        setView]        = useState("weekly");
  const [selectedDay, setSelectedDay] = useState(todayIdx());
  const [filter,      setFilter]      = useState("all");
  const [modal,       setModal]       = useState(null); // null | "addTask" | "editTask" | "addCat"
  const [editTarget,  setEditTarget]  = useState(null);
  const [aiOpen,      setAiOpen]      = useState(false);
  const importRef = useRef();
  const { toasts, push } = useToast();

  const ready = tasksReady && catsReady;
  const conflicts = findConflicts(tasks);

  const blankTask = () => ({
    title:"", category: categories[0]?.id || "class", day: selectedDay,
    startTime:"08:00", endTime:"09:00", priority:"Medium", notes:"",
  });

  const getCat = id => categories.find(c => c.id === id) || { label:id, color:"#4a5568", icon:"📌" };

  // ── Task CRUD ────────────────────────────────────────────────────────────────
  function saveTask(data) {
    if (editTarget) {
      setTasks(p => p.map(t => t.id === editTarget ? { ...data, id:editTarget, completed:t.completed } : t));
      push("Task updated ✓");
    } else {
      setTasks(p => [...p, { ...data, id:uid(), completed:false }]);
      push("Task added ✓");
    }
    setModal(null); setEditTarget(null);
  }

  function openEdit(task) {
    setEditTarget(task.id);
    setModal("editTask");
  }

  function deleteTask(id) {
    setTasks(p => p.filter(t => t.id !== id));
    push("Task deleted", "warn");
  }

  function toggleComplete(id) {
    setTasks(p => p.map(t => t.id === id ? { ...t, completed:!t.completed } : t));
  }

  // ── Category CRUD ────────────────────────────────────────────────────────────
  function saveCat(cat) {
    setCategories(p => [...p, cat]);
    push("Category added ✓");
    setModal(null);
  }

  function deleteCat(id) {
    if (categories.find(c => c.id === id)?.locked) { push("Cannot delete built-in category", "error"); return; }
    setCategories(p => p.filter(c => c.id !== id));
    setTasks(p => p.map(t => t.category === id ? { ...t, category:"class" } : t));
    push("Category removed", "warn");
  }

  // ── Export / Import ──────────────────────────────────────────────────────────
  function exportData() {
    const payload = { version: APP_VERSION, exportedAt: new Date().toISOString(), tasks, categories };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type:"application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `ops-schedule-${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url);
    push("Exported ✓");
  }

  function importData(e) {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const d = JSON.parse(ev.target.result);
        if (!Array.isArray(d.tasks) || !Array.isArray(d.categories)) throw new Error("Invalid format");
        setTasks(d.tasks); setCategories(d.categories);
        push("Imported ✓");
      } catch { push("Invalid file — import failed", "error"); }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  // ── Stats ────────────────────────────────────────────────────────────────────
  const done  = tasks.filter(t => t.completed).length;
  const total = tasks.length;
  const pct   = total ? Math.round((done/total)*100) : 0;

  if (!ready) return (
    <div style={{ minHeight:"100vh", background:COLORS.bg, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:FONT, fontSize:11, color:COLORS.textDim, letterSpacing:"0.2em" }}>
      LOADING...
    </div>
  );

  const editInitial = editTarget ? (() => { const t = tasks.find(x=>x.id===editTarget); return t ? { title:t.title, category:t.category, day:t.day, startTime:t.startTime, endTime:t.endTime, priority:t.priority, notes:t.notes } : blankTask(); })() : blankTask();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,400&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        body { background:${COLORS.bg}; }
        ::-webkit-scrollbar { width:4px; height:4px; }
        ::-webkit-scrollbar-track { background:${COLORS.bg}; }
        ::-webkit-scrollbar-thumb { background:${COLORS.borderHi}; border-radius:2px; }
        select option { background:#0c1018; }
        @keyframes slideUp   { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes modalIn   { from{opacity:0;transform:scale(0.97)} to{opacity:1;transform:scale(1)} }
        @keyframes slideLeft { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
      `}</style>

      <div style={{ minHeight:"100vh", background:COLORS.bg, color:COLORS.text, fontFamily:FONT, display:"flex", flexDirection:"column" }}>

        {/* ── HEADER ── */}
        <header style={{ background:COLORS.panel, borderBottom:`1px solid ${COLORS.border}`, padding:"14px 24px", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
          <div>
            <div style={{ fontSize:9, letterSpacing:"0.25em", color:COLORS.textMid, textTransform:"uppercase", fontWeight:600 }}>GRID / OPS PLANNER · v{APP_VERSION}</div>
            <div style={{ fontSize:21, fontWeight:700, color:"#eef4ff", letterSpacing:"0.04em", marginTop:2 }}>Weekly Schedule</div>
          </div>
          <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
            {conflicts.size > 0 && (
              <div style={{ fontSize:9, color:COLORS.danger, letterSpacing:"0.1em", padding:"3px 9px", border:"1px solid #7f1d1d30", borderRadius:4, background:"#1a080820" }}>
                ⚠ {Math.ceil(conflicts.size/2)} CONFLICT{conflicts.size>2?"S":""}
              </div>
            )}
            <div style={{ fontSize:10, color:COLORS.textMid, letterSpacing:"0.08em", padding:"4px 10px", border:`1px solid ${COLORS.border}`, borderRadius:4, background:"#090e14" }}>{done}/{total} DONE · {pct}%</div>
          </div>
        </header>

        <div style={{ display:"flex", flex:1, overflow:"hidden" }}>

          {/* ── SIDEBAR ── */}
          <aside style={{ width:200, background:COLORS.panel, borderRight:`1px solid ${COLORS.border}`, display:"flex", flexDirection:"column", padding:"18px 0", flexShrink:0, overflowY:"auto" }}>

            {/* Filter */}
            <div style={{ padding:"0 14px", marginBottom:24 }}>
              <div style={{ fontSize:9, letterSpacing:"0.2em", color:COLORS.textDim, textTransform:"uppercase", marginBottom:8 }}>Filter</div>
              {[{ id:"all", label:"All tasks", color:COLORS.textMid, icon:"◈" }, ...categories].map(cat => (
                <div key={cat.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"5px 8px", borderRadius:4, cursor:"pointer", fontSize:11, marginBottom:2, color: filter===cat.id?"#f0f6ff":COLORS.textMid, background: filter===cat.id?`${cat.color}14`:"transparent", border: filter===cat.id?`1px solid ${cat.color}30`:"1px solid transparent", transition:"all 0.12s" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6, flex:1 }} onClick={() => setFilter(cat.id)}>
                    <div style={{ width:5, height:5, borderRadius:"50%", background:cat.color, flexShrink:0 }}/>
                    <span>{cat.icon} {cat.label}</span>
                  </div>
                  {cat.id !== "all" && !cat.locked && (
                    <span onClick={() => deleteCat(cat.id)} style={{ fontSize:9, color:COLORS.textDim, cursor:"pointer", padding:"0 2px", lineHeight:1 }}>✕</span>
                  )}
                </div>
              ))}
              <div onClick={() => setModal("addCat")} style={{ fontSize:10, color:COLORS.textDim, cursor:"pointer", padding:"6px 8px", display:"flex", alignItems:"center", gap:4, marginTop:4 }}>+ Add category</div>
            </div>

            {/* Progress */}
            <div style={{ padding:"0 14px", marginBottom:24 }}>
              <div style={{ fontSize:9, letterSpacing:"0.2em", color:COLORS.textDim, textTransform:"uppercase", marginBottom:8 }}>Progress</div>
              <ProgressBar pct={pct}/>
              <div style={{ fontSize:10, color:COLORS.textDim, marginTop:6 }}>{done} of {total} complete</div>
            </div>

            {/* Data */}
            <div style={{ padding:"0 14px" }}>
              <div style={{ fontSize:9, letterSpacing:"0.2em", color:COLORS.textDim, textTransform:"uppercase", marginBottom:8 }}>Data</div>
              <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                <Btn onClick={exportData} sx={{ width:"100%", justifyContent:"center" }}>↓ Export JSON</Btn>
                <Btn onClick={() => importRef.current.click()} sx={{ width:"100%", justifyContent:"center" }}>↑ Import JSON</Btn>
                <input ref={importRef} type="file" accept=".json" style={{ display:"none" }} onChange={importData}/>
              </div>
            </div>
          </aside>

          {/* ── MAIN ── */}
          <main style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>

            {/* Toolbar */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 20px", borderBottom:`1px solid ${COLORS.border}`, background:COLORS.panel, flexShrink:0, gap:8, flexWrap:"wrap" }}>
              <div style={{ display:"flex", gap:2, background:"#080d14", border:`1px solid ${COLORS.border}`, borderRadius:5, padding:2 }}>
                {["daily","weekly"].map(v => (
                  <button key={v} onClick={() => setView(v)} style={{ padding:"5px 14px", borderRadius:3, fontSize:9, letterSpacing:"0.14em", cursor:"pointer", border:"none", background:view===v?"#172030":"transparent", color:view===v?COLORS.accent:COLORS.textDim, textTransform:"uppercase", fontFamily:FONT, fontWeight:view===v?600:400, transition:"all 0.12s" }}>{v}</button>
                ))}
              </div>
              <div style={{ display:"flex", gap:6 }}>
                <Btn variant="ai" onClick={() => setAiOpen(p => !p)}>⚡ AI Optimize</Btn>
                <Btn variant="primary" onClick={() => { setEditTarget(null); setModal("addTask"); }}>+ Add Task</Btn>
              </div>
            </div>

            {/* Content */}
            <div style={{ flex:1, overflow:"auto", padding:20 }}>
              {view === "weekly" ? (
                <WeeklyView tasks={tasks} categories={categories} conflicts={conflicts} onDayClick={i => { setSelectedDay(i); setView("daily"); }}/>
              ) : (
                <DailyView tasks={tasks} categories={categories} conflicts={conflicts} selectedDay={selectedDay} onDayChange={setSelectedDay} filter={filter} onToggle={toggleComplete} onEdit={openEdit} onDelete={deleteTask}/>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* ── MODALS ── */}
      {(modal === "addTask" || modal === "editTask") && (
        <TaskModal
          initial={editInitial}
          editId={editTarget}
          categories={categories}
          tasks={tasks}
          onSave={saveTask}
          onClose={() => { setModal(null); setEditTarget(null); }}
        />
      )}
      {modal === "addCat" && (
        <CatModal categories={categories} onSave={saveCat} onClose={() => setModal(null)}/>
      )}

      {/* ── AI PANEL ── */}
      {aiOpen && (
        <AIPanel tasks={tasks} categories={categories} conflicts={conflicts} onClose={() => setAiOpen(false)}/>
      )}

      <Toast toasts={toasts}/>
    </>
  );
}
