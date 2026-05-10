import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { useAsyncStorage } from '../hooks/useAsyncStorage';
import { useConflicts } from '../hooks/useConflicts';
import { useToastContext } from './ToastContext';
import { STORAGE_KEYS, APP_VERSION, COURSE_COLORS } from '../lib/constants';
import { uid, todayIdx, sanitize, getCategoryById, buildExportPayload, parseImportFile, toMin, fmtMin } from '../lib/utils';

function readStorage(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [tasks,      setTasks]      = useState(() => readStorage('clarus_tasks')      ?? []);
  const [categories, setCategories] = useState(() => readStorage('clarus_courses')    ?? []);
  const [prefs,      setPrefs]      = useAsyncStorage(STORAGE_KEYS.prefs, { sharedMode: false });

  const { push } = useToastContext();

  useEffect(() => {
    try { localStorage.setItem('clarus_tasks',   JSON.stringify(tasks));      } catch {}
  }, [tasks]);

  useEffect(() => {
    try { localStorage.setItem('clarus_courses', JSON.stringify(categories)); } catch {}
  }, [categories]);

  const [view,             setView]             = useState('weekly');
  const [selectedDay,      setSelectedDay]      = useState(todayIdx());
  const [filter,           setFilter]           = useState('all');
  const [modal,            setModal]            = useState(null);
  const [editTarget,       setEditTarget]       = useState(null);
  const [courseEditTarget, setCourseEditTarget] = useState(null);
  const [syllabusItems,    setSyllabusItems]    = useState([]);
  const [aiOpen,           setAiOpen]           = useState(false);
  const [gradeCalcTarget,  setGradeCalcTarget]  = useState(null);

  const conflicts = useConflicts(tasks);
  const ready     = true;

  /* Derived slices */
  const courses      = useMemo(() => categories.filter(c => c.isCourse),  [categories]);
  const regularCats  = useMemo(() => categories.filter(c => !c.isCourse), [categories]);

  const done  = tasks.filter(t => t.completed).length;
  const total = tasks.length;
  const pct   = total ? Math.round((done / total) * 100) : 0;

  const getCat = useCallback((id) => getCategoryById(id, categories), [categories]);

  const blankTask = useCallback(() => {
    const dayTasks  = tasks.filter(t => t.day === selectedDay);
    const latestEnd = dayTasks.length
      ? dayTasks.reduce((max, t) => toMin(t.endTime) > toMin(max) ? t.endTime : max, '07:00')
      : '08:00';
    const startMin = Math.min(toMin(latestEnd), toMin('21:00'));
    const endMin   = Math.min(startMin + 60, toMin('23:00'));
    return {
      title:          '',
      category:       courses[0]?.id || '',
      day:            selectedDay,
      startTime:      fmtMin(startMin),
      endTime:        fmtMin(endMin),
      notes:          '',
      gradeWeight:    '',
      dueDate:        '',
      estimatedHours: '',
    };
  }, [tasks, courses, selectedDay]);

  const editInitial = useMemo(() => {
    if (!editTarget) return null;
    const t = tasks.find(x => x.id === editTarget);
    if (!t) return null;
    return {
      title:          t.title,
      category:       t.category,
      day:            t.day,
      startTime:      t.startTime,
      endTime:        t.endTime,
      notes:          t.notes || '',
      gradeWeight:    t.gradeWeight ?? '',
      dueDate:        t.dueDate || '',
      estimatedHours: t.estimatedHours ?? '',
    };
  }, [editTarget, tasks]);

  const courseEditInitial = useMemo(() => {
    if (!courseEditTarget) return null;
    return categories.find(c => c.id === courseEditTarget) || null;
  }, [courseEditTarget, categories]);

  // ── Task CRUD ──────────────────────────────────────────────────────────────
  const saveTask = useCallback((data, eId) => {
    if (eId) {
      setTasks(p => p.map(t => t.id === eId ? { ...data, id: eId, completed: t.completed } : t));
      push('Task updated', 'success');
    } else {
      setTasks(p => [...p, { ...data, id: uid(), completed: false }]);
      push('Task added', 'success');
    }
    setModal(null);
    setEditTarget(null);
  }, [setTasks, push]);

  const deleteTask = useCallback((id) => {
    const deleted = tasks.find(t => t.id === id);
    setTasks(p => p.filter(t => t.id !== id));
    push('Task deleted', 'warn', () => {
      setTasks(p => [...p, deleted]);
      push('Restored', 'success');
    });
  }, [tasks, setTasks, push]);

  const toggleComplete = useCallback((id) => {
    setTasks(p => p.map(t => {
      if (t.id !== id) return t;
      const completed = !t.completed;
      return { ...t, completed, completedAt: completed ? Date.now() : null };
    }));
  }, [setTasks]);

  const openEdit = useCallback((task) => {
    setEditTarget(task.id);
    setModal('editTask');
  }, []);

  // ── Category CRUD ──────────────────────────────────────────────────────────
  const saveCat = useCallback((cat) => {
    setCategories(p => [...p, cat]);
    push('Category added', 'success');
    setModal(null);
  }, [setCategories, push]);

  const deleteCat = useCallback((id) => {
    if (categories.find(c => c.id === id)?.locked) {
      push('Cannot delete built-in category', 'error');
      return;
    }
    setCategories(p => p.filter(c => c.id !== id));
    setTasks(p => p.map(t => t.category === id ? { ...t, category: 'class' } : t));
    push('Category removed', 'warn');
  }, [categories, setCategories, setTasks, push]);

  // ── Course CRUD ────────────────────────────────────────────────────────────
  const saveCourse = useCallback((data, eId) => {
    if (eId) {
      setCategories(p => p.map(c =>
        c.id === eId
          ? { ...c, label: sanitize(data.name), color: data.color, professor: sanitize(data.professor), grade: data.grade }
          : c
      ));
      push('Course updated', 'success');
    } else {
      const existingCourses = categories.filter(c => c.isCourse);
      const autoColor = COURSE_COLORS[existingCourses.length % COURSE_COLORS.length];
      setCategories(p => [...p, {
        id:        uid(),
        label:     sanitize(data.name),
        color:     data.color || autoColor,
        icon:      '📖',
        locked:    false,
        isCourse:  true,
        professor: sanitize(data.professor),
        grade:     data.grade,
      }]);
      push('Course added', 'success');
    }
    setModal(null);
    setCourseEditTarget(null);
  }, [categories, setCategories, push]);

  const deleteCourse = useCallback((id) => {
    setCategories(p => p.filter(c => c.id !== id));
    setTasks(p => p.map(t => t.category === id ? { ...t, category: 'study' } : t));
    if (filter === id) setFilter('all');
    push('Course removed', 'warn');
  }, [setCategories, setTasks, filter, push]);

  const updateCourseGrade = useCallback((id, grade) => {
    setCategories(p => p.map(c => c.id === id ? { ...c, grade } : c));
  }, [setCategories]);

  const openEditCourse = useCallback((courseId) => {
    setCourseEditTarget(courseId);
    setModal('editCourse');
  }, []);

  const openGradeCalc = useCallback((courseId) => {
    setGradeCalcTarget(courseId);
    setModal('gradeCalc');
  }, []);

  const importSyllabusTasks = useCallback((items) => {
    // Build a local map so newly created courses are visible within this batch
    const catMap = new Map(
      categories.filter(c => c.isCourse).map(c => [c.label.toLowerCase(), c])
    );
    const newCats  = [];
    const newTasks = [];

    items.forEach(item => {
      const name = (item.courseName || 'Imported').trim();
      const key  = name.toLowerCase();

      if (!catMap.has(key)) {
        const allCourses = [...categories.filter(c => c.isCourse), ...newCats];
        const color = COURSE_COLORS[allCourses.length % COURSE_COLORS.length];
        const cat = {
          id:       uid(),
          label:    sanitize(name),
          color,
          icon:     '📖',
          locked:   false,
          isCourse: true,
          professor: '',
          grade:    null,
        };
        newCats.push(cat);
        catMap.set(key, cat);
      }

      const cat = catMap.get(key);

      let day = 0;
      if (item.dueDate) {
        const js = new Date(item.dueDate + 'T12:00:00').getDay();
        day = js === 0 ? 6 : js - 1;
      }

      newTasks.push({
        id:             uid(),
        title:          sanitize(item.taskTitle || 'Task'),
        category:       cat.id,
        day,
        startTime:      '09:00',
        endTime:        '10:00',
        allDay:         true,
        notes:          '',
        completed:      false,
        gradeWeight:    item.gradeWeight || null,
        dueDate:        item.dueDate     || null,
        estimatedHours: item.estimatedHours || null,
      });
    });

    if (newCats.length) setCategories(p => [...p, ...newCats]);
    setTasks(p => [...p, ...newTasks]);
    setSyllabusItems([]);
    push(`Imported ${newTasks.length} task${newTasks.length !== 1 ? 's' : ''}`, 'success');
    setModal(null);
  }, [categories, setCategories, setTasks, push]);

  // ── Export / Import ────────────────────────────────────────────────────────
  const exportData = useCallback(() => {
    const payload = buildExportPayload(tasks, categories);
    const blob    = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url     = URL.createObjectURL(blob);
    const a       = document.createElement('a');
    a.href = url;
    a.download = `clarus-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    push('Exported', 'success');
  }, [tasks, categories, push]);

  const importData = useCallback((file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const { tasks: t, categories: c, version } = parseImportFile(ev.target.result);
        if (version && version !== APP_VERSION) push(`Importing from v${version}`, 'warn');
        setTasks(t);
        setCategories(c);
        push(`Imported ${t.length} tasks`, 'success');
      } catch(e) {
        push(`Import failed: ${e.message}`, 'error');
      }
    };
    reader.readAsText(file);
  }, [setTasks, setCategories, push]);

  // ── Global keyboard shortcuts ──────────────────────────────────────────────
  useEffect(() => {
    function handler(e) {
      if (modal) return;
      const tag = document.activeElement?.tagName;
      if (['INPUT','SELECT','TEXTAREA'].includes(tag)) return;
      if ((e.key === 'n' || e.key === 'N') && !e.metaKey && !e.ctrlKey) {
        setEditTarget(null); setModal('addTask');
      }
      if (e.key === 'w' || e.key === 'W') setView('weekly');
      if (e.key === 'd' || e.key === 'D') setView('daily');
      if (e.key === 'ArrowLeft'  && view === 'daily') setSelectedDay(d => Math.max(0, d - 1));
      if (e.key === 'ArrowRight' && view === 'daily') setSelectedDay(d => Math.min(6, d + 1));
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [modal, view]);

  const value = {
    // Data
    tasks, categories, regularCats, courses, prefs, ready, conflicts,
    done, total, pct,
    // Task actions
    saveTask, deleteTask, toggleComplete, openEdit,
    // Category actions
    saveCat, deleteCat,
    // Course actions
    saveCourse, deleteCourse, updateCourseGrade, openEditCourse, openGradeCalc, importSyllabusTasks,
    gradeCalcTarget,
    syllabusItems, setSyllabusItems,
    // I/O
    exportData, importData,
    // UI state
    view, setView,
    selectedDay, setSelectedDay,
    filter, setFilter,
    modal, setModal,
    editTarget, setEditTarget,
    courseEditTarget, setCourseEditTarget, courseEditInitial,
    aiOpen, setAiOpen,
    // Helpers
    blankTask, editInitial, getCat,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be inside AppProvider');
  return ctx;
}
