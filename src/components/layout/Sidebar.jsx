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
      className="w-[85vw] md:w-56 h-full flex flex-col flex-shrink-0 overflow-y-auto border-r border-border"
      style={{
        background: 'linear-gradient(160deg, #131c30 0%, #0e1525 50%, #0b1019 100%)',
      }}
    >

      {/* ────────────── MOBILE TOP BAR ────────────── */}
      <div className="md:hidden flex-shrink-0">
        {/* Brand + close */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                boxShadow: '0 2px 12px rgba(99,102,241,0.4)',
              }}
            >
              <Sparkles size={17} className="text-white" />
            </div>
            <div>
              <div className="text-[17px] font-bold leading-tight" style={{ color: '#e8edf5' }}>Clarus</div>
              <div className="text-[11px] leading-tight" style={{ color: 'var(--color-subtle)' }}>Study smarter.</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-12 h-12 flex items-center justify-center rounded-2xl border border-border text-subtle hover:text-text hover:bg-panel-hi transition-colors"
            aria-label="Close menu"
          >
            <X size={22} />
          </button>
        </div>

        {/* AI Optimize pill */}
        <div className="px-4 pb-4">
          <button
            onClick={() => { setAiOpen(p => !p); onClose?.(); }}
            className="w-full flex items-center justify-center gap-3 px-5 py-4 rounded-2xl text-[15px] font-semibold border transition-all duration-150"
            style={{
              color:       aiOpen ? '#c084fc' : '#94a3b8',
              borderColor: aiOpen ? 'rgba(168,85,247,0.35)' : 'rgba(255,255,255,0.1)',
              background:  aiOpen ? 'rgba(168,85,247,0.12)' : 'rgba(255,255,255,0.04)',
            }}
          >
            <Sparkles size={17} />
            {aiOpen ? 'Close AI' : 'AI Optimize'}
          </button>
        </div>

        <div className="mx-4 border-t border-border" />
      </div>

      {/* ────────────── COURSES ────────────── */}
      <div className="pt-6 md:pt-5 pb-2 md:pb-3">
        <MobileSectionHeader label="Courses" color="#6366f1" />
        <DesktopSectionHeader label="Courses" Icon={GraduationCap} />

        <div className="px-4 md:px-2">
          {courses.length === 0 && (
            <div className="px-3 py-3 md:py-2 text-[13px] md:text-[11px] text-disabled italic">
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

        {/* Add / Upload buttons */}
        <div className="px-4 md:px-2 mt-3 md:mt-1 flex flex-col gap-2 md:gap-0.5">
          <MobileActionButton Icon={Plus}   label="Add Course"       onClick={() => setModal('addCourse')} accent="#6366f1" />
          <MobileActionButton Icon={FileUp} label="Upload Syllabus"  onClick={() => setModal('syllabus')}  accent="#a855f7" />

          {/* Desktop-only text buttons */}
          <button
            onClick={() => setModal('addCourse')}
            className="hidden md:flex w-full items-center gap-2 px-2.5 py-2 text-[12px] text-subtle hover:text-muted rounded-lg transition-colors duration-150 hover:bg-panel-hi group"
          >
            <div className="w-5 h-5 rounded flex items-center justify-center border border-dashed border-border group-hover:border-border-hi transition-colors">
              <Plus size={10} />
            </div>
            Add course
          </button>
          <button
            onClick={() => setModal('syllabus')}
            className="hidden md:flex w-full items-center gap-2 px-2.5 py-2 text-[12px] text-subtle hover:text-muted rounded-lg transition-colors duration-150 hover:bg-panel-hi group"
          >
            <div className="w-5 h-5 rounded flex items-center justify-center border border-dashed border-border group-hover:border-border-hi transition-colors">
              <FileUp size={10} />
            </div>
            Upload syllabus
          </button>
        </div>
      </div>

      <div className="mx-4 border-t border-border flex-shrink-0" />

      {/* ────────────── CATEGORIES ────────────── */}
      <div className="pt-6 md:pt-4 pb-2 md:pb-3">
        <MobileSectionHeader label="Categories" color="#a855f7" />
        <DesktopSectionHeader label="Categories" Icon={Layers} />

        <div className="px-4 md:px-2">
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

        <div className="px-4 md:px-2 mt-3 md:mt-1">
          <MobileActionButton Icon={Plus} label="Add Category" onClick={() => setModal('addCat')} accent="#22d3ee" />
          <button
            onClick={() => setModal('addCat')}
            className="hidden md:flex w-full items-center gap-2 px-2.5 py-2 text-[12px] text-subtle hover:text-muted rounded-lg transition-colors duration-150 hover:bg-panel-hi group"
          >
            <div className="w-5 h-5 rounded flex items-center justify-center border border-dashed border-border group-hover:border-border-hi transition-colors">
              <Plus size={10} />
            </div>
            Add category
          </button>
        </div>
      </div>

      <div className="mx-4 border-t border-border flex-shrink-0" />

      {/* ────────────── PROGRESS ────────────── */}
      <div className="px-5 md:px-4 py-5 md:py-4">
        <MobileSectionHeader label="Progress" color="#22d3ee" />
        <DesktopSectionHeader label="Progress" />

        <div className="flex items-center justify-between mb-3 md:mb-2.5">
          <span className="text-[13px] md:text-[11px] text-subtle">This week</span>
          <span className="text-[13px] md:text-[11px] font-mono text-muted tabular-nums">{done}/{total}</span>
        </div>
        <ProgressBar pct={pct} />
        <div className="flex items-center justify-between mt-3 md:mt-2.5">
          <span className="text-[13px] md:text-[11px] text-subtle">
            {total === 0 ? 'No tasks yet' : `${total - done} remaining`}
          </span>
          <span
            className="text-[13px] md:text-[11px] font-semibold font-mono"
            style={{ color: pct === 100 ? 'var(--color-success-text)' : 'var(--color-accent-text)' }}
          >
            {pct}%
          </span>
        </div>
      </div>

      <div className="mx-4 border-t border-border flex-shrink-0" />

      {/* ────────────── DATA ────────────── */}
      <div className="px-4 md:px-4 py-5 md:py-4 mt-auto">
        <MobileSectionHeader label="Data" color="#f59e0b" />
        <DesktopSectionHeader label="Data" />

        {/* Mobile: pill buttons */}
        <div className="flex flex-col gap-3 md:hidden">
          <MobileActionButton Icon={Download} label="Export JSON" onClick={exportData}                           accent="#f59e0b" />
          <MobileActionButton Icon={Upload}   label="Import JSON" onClick={() => importRef.current?.click()}    accent="#f59e0b" />
        </div>

        {/* Desktop: compact buttons */}
        <div className="hidden md:flex flex-col gap-1.5">
          <Button onClick={exportData} className="w-full justify-center text-[12px]">
            <Download size={12} />
            Export JSON
          </Button>
          <Button onClick={() => importRef.current?.click()} className="w-full justify-center text-[12px]">
            <Upload size={12} />
            Import JSON
          </Button>
        </div>

        <input
          ref={importRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={e => { importData(e.target.files[0]); e.target.value = ''; }}
        />
      </div>

      {/* Bottom safe-area padding on mobile */}
      <div className="md:hidden h-6 flex-shrink-0" />
    </aside>
  );
}

/* ─── Section headers ─────────────────────────────────────── */

function MobileSectionHeader({ label, color }) {
  return (
    <div className="md:hidden flex items-center gap-2.5 px-4 mb-3">
      <div
        className="w-1 h-5 rounded-full flex-shrink-0"
        style={{ background: color, boxShadow: `0 0 8px ${color}80` }}
      />
      <span
        className="text-[13px] font-bold uppercase tracking-[0.14em]"
        style={{ color: 'var(--color-subtle)' }}
      >
        {label}
      </span>
    </div>
  );
}

function DesktopSectionHeader({ label, Icon }) {
  return (
    <div className="hidden md:flex px-4 mb-2 items-center justify-between">
      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-subtle">{label}</span>
      {Icon && <Icon size={11} className="text-disabled" />}
    </div>
  );
}

/* ─── Mobile action button (pill style) ──────────────────── */

function MobileActionButton({ Icon, label, onClick, accent = '#6366f1' }) {
  return (
    <button
      onClick={onClick}
      className="md:hidden w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-[15px] font-semibold border transition-all duration-150 active:scale-[0.98]"
      style={{
        color: 'var(--color-muted)',
        borderColor: `${accent}25`,
        background: `${accent}0d`,
      }}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${accent}20`, color: accent }}
      >
        <Icon size={17} />
      </div>
      {label}
    </button>
  );
}

/* ─── Course item ─────────────────────────────────────────── */

function CourseItem({ course, active, onSelect, onEdit, onDelete, onCalc }) {
  const gl = course.grade !== null && course.grade !== undefined ? gradeLabel(course.grade) : null;
  const bg = hexToRgba(course.color);

  return (
    <>
      {/* Mobile pill */}
      <div
        className="md:hidden flex items-center gap-4 px-4 py-3.5 rounded-2xl mb-2.5 cursor-pointer border transition-all duration-150 active:scale-[0.98]"
        style={{
          minHeight: '60px',
          background: active ? `${bg},0.12)` : 'rgba(255,255,255,0.04)',
          borderColor: active ? `${course.color}40` : 'rgba(255,255,255,0.08)',
        }}
        onClick={onSelect}
      >
        {/* Color dot */}
        <div
          className="w-3.5 h-3.5 rounded-full flex-shrink-0"
          style={{ background: course.color, boxShadow: `0 0 8px ${course.color}80` }}
        />

        {/* Name + professor */}
        <div className="flex-1 min-w-0">
          <div
            className="text-[17px] font-semibold truncate leading-tight"
            style={{ color: active ? 'var(--color-text)' : 'var(--color-muted)' }}
          >
            {course.label}
          </div>
          {course.professor && (
            <div className="text-[12px] truncate leading-tight mt-0.5" style={{ color: 'var(--color-disabled)' }}>
              {course.professor}
            </div>
          )}
        </div>

        {/* Grade + actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {gl && (
            <span className="text-[13px] font-bold mr-1" style={{ color: gl.color }}>{gl.letter}</span>
          )}
          <button
            onClick={e => { e.stopPropagation(); onCalc(); }}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-subtle hover:text-ai-text transition-colors"
          >
            <Calculator size={15} />
          </button>
          <button
            onClick={e => { e.stopPropagation(); onEdit(); }}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-subtle hover:text-accent-text transition-colors"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={e => { e.stopPropagation(); onDelete(); }}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-subtle hover:text-danger-text transition-colors"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Desktop row (unchanged) */}
      <div
        className="hidden md:flex group items-center gap-2 px-2.5 py-2 rounded-lg mb-0.5 cursor-pointer transition-all duration-150 relative"
        style={{
          background: active ? `${bg},0.1)` : 'transparent',
          borderLeft: active ? `2px solid ${course.color}` : '2px solid transparent',
        }}
        onClick={onSelect}
      >
        <div
          className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
          style={{ background: active ? `${bg},0.2)` : `${bg},0.08)`, color: course.color }}
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
          <span className="group-hover:opacity-0 text-[10px] font-bold flex-shrink-0 transition-opacity duration-100" style={{ color: gl.color }}>
            {gl.letter}
          </span>
        )}
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 flex-shrink-0 transition-opacity duration-100 absolute right-2">
          <button onClick={e => { e.stopPropagation(); onCalc(); }} className="w-5 h-5 flex items-center justify-center rounded text-subtle hover:text-ai-text transition-colors" title="Grade calculator">
            <Calculator size={10} />
          </button>
          <button onClick={e => { e.stopPropagation(); onEdit(); }} className="w-5 h-5 flex items-center justify-center rounded text-subtle hover:text-accent-text transition-colors" title="Edit course">
            <Pencil size={10} />
          </button>
          <button onClick={e => { e.stopPropagation(); onDelete(); }} className="w-5 h-5 flex items-center justify-center rounded text-subtle hover:text-danger-text transition-colors" title="Delete course">
            <X size={10} />
          </button>
        </div>
      </div>
    </>
  );
}

/* ─── Filter / category item ──────────────────────────────── */

function FilterItem({ id, label, color, Icon, active, locked, onSelect, onDelete }) {
  const isVar = color === 'var(--color-muted)';
  const rgba  = isVar ? 'rgba(148,163,184' : hexToRgba(color);

  return (
    <>
      {/* Mobile pill */}
      <div
        className="md:hidden flex items-center gap-4 px-4 py-3.5 rounded-2xl mb-2 cursor-pointer border transition-all duration-150 active:scale-[0.98]"
        style={{
          background: active ? `${rgba},0.12)` : 'rgba(255,255,255,0.04)',
          borderColor: active ? (isVar ? 'rgba(148,163,184,0.3)' : `${color}40`) : 'rgba(255,255,255,0.08)',
        }}
        onClick={onSelect}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: active ? `${rgba},0.2)` : 'rgba(255,255,255,0.06)',
            color: active ? color : 'var(--color-subtle)',
          }}
        >
          <Icon size={18} strokeWidth={2} />
        </div>
        <span
          className="text-[16px] font-semibold flex-1 truncate"
          style={{ color: active ? 'var(--color-text)' : 'var(--color-muted)' }}
        >
          {label}
        </span>
        {!locked && id !== 'all' && onDelete && (
          <button
            onClick={e => { e.stopPropagation(); onDelete(); }}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-subtle hover:text-danger-text transition-colors flex-shrink-0"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Desktop row (unchanged) */}
      <div
        className="hidden md:flex group items-center gap-2.5 px-2.5 py-2 rounded-lg mb-0.5 cursor-pointer transition-all duration-150 relative"
        style={{
          background: active ? `${rgba},0.1)` : 'transparent',
          borderLeft: active ? `2px solid ${color}` : '2px solid transparent',
        }}
        onClick={onSelect}
      >
        <div
          className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-all duration-150"
          style={{
            background: active ? `${rgba},0.15)` : 'rgba(255,255,255,0.04)',
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
    </>
  );
}

/* ─── Helpers ─────────────────────────────────────────────── */

function hexToRgba(hex) {
  if (!hex || !hex.startsWith('#')) return 'rgba(148,163,184';
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return 'rgba(148,163,184';
  return `rgba(${r},${g},${b}`;
}
