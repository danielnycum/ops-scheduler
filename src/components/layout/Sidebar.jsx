import { useRef } from 'react';
import { Plus, Download, Upload, X, BookOpen, PenLine, Dumbbell, Flag, Tag, Layers, GraduationCap, Pencil, FileUp, Calculator, Sparkles } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { ProgressBar } from '../ui/ProgressBar';
import { Button } from '../ui/Button';
import { gradeLabel } from '../../lib/constants';

const CAT_ICONS = {
  class:   BookOpen,
  study:   PenLine,
  workout: Dumbbell,
  golf:    Flag,
};

function getCatIcon(cat) {
  const Icon = CAT_ICONS[cat.id] || Tag;
  return Icon;
}

export function Sidebar({ onClose }) {
  const {
    courses, regularCats, filter, setFilter, deleteCat, deleteCourse, openEditCourse, openGradeCalc,
    done, total, pct,
    exportData, importData,
    setModal, aiOpen, setAiOpen,
  } = useAppContext();

  const importRef = useRef();

  return (
    <aside
      className="w-64 md:w-56 h-full flex flex-col flex-shrink-0 overflow-y-auto border-r border-border"
      style={{
        background: 'linear-gradient(180deg, var(--color-panel) 0%, #0d1320 100%)',
      }}
    >

      {/* ── Mobile top bar (close button + AI Optimize) ── */}
      <div className="md:hidden flex-shrink-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-subtle">Menu</span>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-subtle hover:text-text hover:bg-panel-hi transition-colors"
            aria-label="Close menu"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-3 py-2.5 border-b border-border">
          <button
            onClick={() => { setAiOpen(p => !p); onClose?.(); }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-[12px] font-semibold border transition-all duration-150"
            style={{
              color:       aiOpen ? '#c084fc' : '#94a3b8',
              borderColor: aiOpen ? 'rgba(168,85,247,0.4)' : 'rgba(255,255,255,0.08)',
              background:  aiOpen ? 'rgba(168,85,247,0.1)' : 'rgba(255,255,255,0.03)',
            }}
          >
            <Sparkles size={13} />
            {aiOpen ? 'Close AI' : 'AI Optimize'}
          </button>
        </div>
      </div>

      {/* ── Courses ──────────────────────────────── */}
      <div className="pt-5 pb-3">
        <div className="px-4 mb-2 flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-subtle">
            Courses
          </span>
          <GraduationCap size={11} className="text-disabled" />
        </div>

        <div className="px-2">
          {courses.length === 0 && (
            <div className="px-2.5 py-2 text-[11px] text-disabled italic">
              No courses yet
            </div>
          )}
          {courses.map(course => (
            <CourseItem
              key={course.id}
              course={course}
              active={filter === course.id}
              onSelect={() => { setFilter(course.id); onClose?.(); }}
              onEdit={() => openEditCourse(course.id)}
              onDelete={() => deleteCourse(course.id)}
              onCalc={() => openGradeCalc(course.id)}
            />
          ))}
        </div>

        <div className="px-2 mt-1 flex flex-col gap-0.5">
          <button
            onClick={() => setModal('addCourse')}
            className="w-full flex items-center gap-2 px-2.5 py-2 text-[12px] text-subtle hover:text-muted rounded-lg transition-colors duration-150 hover:bg-panel-hi group"
          >
            <div className="w-5 h-5 rounded flex items-center justify-center border border-dashed border-border group-hover:border-border-hi transition-colors">
              <Plus size={10} />
            </div>
            Add course
          </button>
          <button
            onClick={() => setModal('syllabus')}
            className="w-full flex items-center gap-2 px-2.5 py-2 text-[12px] text-subtle hover:text-muted rounded-lg transition-colors duration-150 hover:bg-panel-hi group"
          >
            <div className="w-5 h-5 rounded flex items-center justify-center border border-dashed border-border group-hover:border-border-hi transition-colors">
              <FileUp size={10} />
            </div>
            Upload syllabus
          </button>
        </div>
      </div>

      <div className="mx-4 border-t border-border" />

      {/* ── Categories ───────────────────────────── */}
      <div className="pt-4 pb-3">
        <div className="px-4 mb-2 flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-subtle">
            Categories
          </span>
          <Layers size={11} className="text-disabled" />
        </div>

        <div className="px-2">
          <FilterItem
            id="all"
            label="All Tasks"
            color="var(--color-muted)"
            Icon={Layers}
            active={filter === 'all'}
            onSelect={() => { setFilter('all'); onClose?.(); }}
          />

          {regularCats.map(cat => {
            const Icon = getCatIcon(cat);
            return (
              <FilterItem
                key={cat.id}
                id={cat.id}
                label={cat.label}
                color={cat.color}
                Icon={Icon}
                active={filter === cat.id}
                locked={cat.locked}
                onSelect={() => { setFilter(cat.id); onClose?.(); }}
                onDelete={() => deleteCat(cat.id)}
              />
            );
          })}
        </div>

        <div className="px-2 mt-1">
          <button
            onClick={() => setModal('addCat')}
            className="w-full flex items-center gap-2 px-2.5 py-2 text-[12px] text-subtle hover:text-muted rounded-lg transition-colors duration-150 hover:bg-panel-hi group"
          >
            <div className="w-5 h-5 rounded flex items-center justify-center border border-dashed border-border group-hover:border-border-hi transition-colors">
              <Plus size={10} />
            </div>
            Add category
          </button>
        </div>
      </div>

      <div className="mx-4 border-t border-border" />

      {/* ── Progress ─────────────────────────────── */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-subtle">
            Progress
          </span>
          <span className="text-[11px] font-mono text-muted tabular-nums">
            {done}/{total}
          </span>
        </div>

        <ProgressBar pct={pct} />

        <div className="flex items-center justify-between mt-2.5">
          <span className="text-[11px] text-subtle">
            {total === 0 ? 'No tasks yet' : `${total - done} remaining`}
          </span>
          <span
            className="text-[11px] font-semibold font-mono"
            style={{ color: pct === 100 ? 'var(--color-success-text)' : 'var(--color-accent-text)' }}
          >
            {pct}%
          </span>
        </div>
      </div>

      <div className="mx-4 border-t border-border" />

      {/* ── Data ─────────────────────────────────── */}
      <div className="px-4 py-4 mt-auto">
        <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-subtle mb-3">
          Data
        </div>
        <div className="flex flex-col gap-1.5">
          <Button onClick={exportData} className="w-full justify-center text-[12px]">
            <Download size={12} />
            Export JSON
          </Button>
          <Button onClick={() => importRef.current?.click()} className="w-full justify-center text-[12px]">
            <Upload size={12} />
            Import JSON
          </Button>
          <input
            ref={importRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={e => { importData(e.target.files[0]); e.target.value = ''; }}
          />
        </div>
      </div>
    </aside>
  );
}

function CourseItem({ course, active, onSelect, onEdit, onDelete, onCalc }) {
  const gl = course.grade !== null && course.grade !== undefined ? gradeLabel(course.grade) : null;
  const bg = hexToRgba(course.color);

  return (
    <div
      className="group flex items-center gap-2 px-2.5 py-2 rounded-lg mb-0.5 cursor-pointer transition-all duration-150 relative"
      style={{
        background: active ? `${bg},0.1)` : 'transparent',
        borderLeft: active ? `2px solid ${course.color}` : '2px solid transparent',
      }}
      onClick={onSelect}
    >
      <div
        className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
        style={{
          background: active ? `${bg},0.2)` : `${bg},0.08)`,
          color: course.color,
        }}
      >
        <GraduationCap size={11} strokeWidth={2.2} />
      </div>

      <div className="flex-1 min-w-0">
        <div
          className="text-[12px] font-medium truncate leading-tight"
          style={{ color: active ? 'var(--color-text)' : 'var(--color-muted)' }}
        >
          {course.label}
        </div>
        {course.professor && (
          <div className="text-[10px] truncate leading-tight" style={{ color: 'var(--color-disabled)' }}>
            {course.professor}
          </div>
        )}
      </div>

      {gl && (
        <span
          className="group-hover:opacity-0 text-[10px] font-bold flex-shrink-0 transition-opacity duration-100"
          style={{ color: gl.color }}
        >
          {gl.letter}
        </span>
      )}

      {/* Hover actions */}
      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 flex-shrink-0 transition-opacity duration-100 absolute right-2">
        <button
          onClick={e => { e.stopPropagation(); onCalc(); }}
          className="w-5 h-5 flex items-center justify-center rounded text-subtle hover:text-ai-text transition-colors"
          title="Grade calculator"
        >
          <Calculator size={10} />
        </button>
        <button
          onClick={e => { e.stopPropagation(); onEdit(); }}
          className="w-5 h-5 flex items-center justify-center rounded text-subtle hover:text-accent-text transition-colors"
          title="Edit course"
        >
          <Pencil size={10} />
        </button>
        <button
          onClick={e => { e.stopPropagation(); onDelete(); }}
          className="w-5 h-5 flex items-center justify-center rounded text-subtle hover:text-danger-text transition-colors"
          title="Delete course"
        >
          <X size={10} />
        </button>
      </div>
    </div>
  );
}

function FilterItem({ id, label, color, Icon, active, locked, onSelect, onDelete }) {
  return (
    <div
      className="group flex items-center gap-2.5 px-2.5 py-2 rounded-lg mb-0.5 cursor-pointer transition-all duration-150 relative"
      style={{
        background: active ? `${color === 'var(--color-muted)' ? 'rgba(148,163,184' : hexToRgba(color)},0.1)` : 'transparent',
        borderLeft: active ? `2px solid ${color}` : '2px solid transparent',
      }}
      onClick={onSelect}
    >
      <div
        className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-all duration-150"
        style={{
          background: active ? `${color === 'var(--color-muted)' ? 'rgba(148,163,184' : hexToRgba(color)},0.15)` : 'rgba(255,255,255,0.04)',
          color: active ? color : 'var(--color-subtle)',
        }}
      >
        <Icon size={11} strokeWidth={2.2} />
      </div>

      <span
        className="text-[13px] flex-1 truncate font-medium transition-colors duration-150"
        style={{ color: active ? 'var(--color-text)' : 'var(--color-muted)' }}
      >
        {label}
      </span>

      {!locked && id !== 'all' && onDelete && (
        <button
          onClick={e => { e.stopPropagation(); onDelete(); }}
          className="opacity-0 group-hover:opacity-100 w-4 h-4 flex items-center justify-center rounded text-subtle hover:text-danger-text transition-all duration-150 flex-shrink-0"
        >
          <X size={10} />
        </button>
      )}
    </div>
  );
}

function hexToRgba(hex) {
  if (!hex || !hex.startsWith('#')) return 'rgba(148,163,184';
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return 'rgba(148,163,184';
  return `rgba(${r},${g},${b}`;
}
