import { useRef } from 'react';
import { Plus, Download, Upload, X, BookOpen, PenLine, Dumbbell, Flag, Tag, Layers, GraduationCap, Pencil, FileUp, Calculator, Sparkles, CalendarDays } from 'lucide-react';
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
      className="w-full md:w-56 h-full flex flex-col flex-shrink-0 border-r border-border"
      style={{
        background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
      }}
    >

      {/* ═══════════════ MOBILE LAYOUT ═══════════════ */}
      <div className="md:hidden flex flex-col flex-1 overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-6 pb-5 flex-shrink-0">
          <div className="flex items-center gap-3.5">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                boxShadow: '0 4px 16px rgba(99,102,241,0.45)',
              }}
            >
              <CalendarDays size={20} className="text-white" strokeWidth={2} />
            </div>
            <div>
              <div className="text-[22px] font-bold leading-tight" style={{ color: '#e8edf5' }}>Clarus</div>
              <div className="text-[12px] leading-tight" style={{ color: '#64748b' }}>Study smarter. Not harder.</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-13 h-13 flex items-center justify-center rounded-2xl transition-colors"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            aria-label="Close menu"
          >
            <X size={24} color="#94a3b8" />
          </button>
        </div>

        {/* AI Optimize */}
        <div className="px-4 pb-5 flex-shrink-0">
          <button
            onClick={() => { setAiOpen(p => !p); onClose?.(); }}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-[16px] font-bold text-white transition-opacity active:opacity-80"
            style={{
              background: aiOpen
                ? 'linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)'
                : 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              boxShadow: '0 4px 24px rgba(99,102,241,0.4)',
            }}
          >
            <Sparkles size={20} />
            {aiOpen ? 'Close AI' : 'AI Optimize'}
          </button>
        </div>

        <MobileDivider />

        {/* COURSES */}
        <div className="px-4 py-5 flex-shrink-0">
          <MobileSectionLabel label="COURSES" />

          {courses.length === 0 && (
            <div className="text-[14px] italic mb-3" style={{ color: '#475569' }}>No courses yet</div>
          )}

          {courses.map(course => (
            <MobileCourseCard
              key={course.id}
              course={course}
              active={filter === course.id}
              onSelect={() => { setFilter(course.id); onClose?.(); }}
              onEdit={() => openEditCourse(course.id)}
              onDelete={() => deleteCourse(course.id)}
              onCalc={() => openGradeCalc(course.id)}
            />
          ))}

          <MobileLargeButton
            Icon={Plus}
            label="Add Course"
            onClick={() => { setModal('addCourse'); onClose?.(); }}
          />
          <MobileLargeButton
            Icon={FileUp}
            label="Upload Syllabus"
            onClick={() => { setModal('syllabus'); onClose?.(); }}
          />
        </div>

        <MobileDivider />

        {/* CATEGORIES */}
        <div className="px-4 py-5 flex-shrink-0">
          <MobileSectionLabel label="CATEGORIES" />

          <MobileCategoryPill
            id="all"
            label="All Tasks"
            color="#818cf8"
            Icon={Layers}
            active={filter === 'all'}
            onSelect={() => { setFilter('all'); onClose?.(); }}
          />

          {regularCats.map(cat => {
            const Icon = getCatIcon(cat);
            return (
              <MobileCategoryPill
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

          <MobileLargeButton
            Icon={Plus}
            label="Add Category"
            onClick={() => { setModal('addCat'); onClose?.(); }}
            accent="#a855f7"
          />
        </div>

        <MobileDivider />

        {/* PROGRESS */}
        <div className="px-4 py-5 flex-shrink-0">
          <MobileSectionLabel label="PROGRESS" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-[14px]" style={{ color: '#94a3b8' }}>This week</span>
            <span className="text-[15px] font-bold font-mono" style={{ color: '#e2e8f4' }}>{done}/{total}</span>
          </div>
          <ProgressBar pct={pct} />
          <div className="flex items-center justify-between mt-3">
            <span className="text-[13px]" style={{ color: '#64748b' }}>
              {total === 0 ? 'No tasks yet' : `${total - done} remaining`}
            </span>
            <span
              className="text-[15px] font-bold font-mono"
              style={{ color: pct === 100 ? '#4ade80' : '#818cf8' }}
            >
              {pct}%
            </span>
          </div>
        </div>

        <MobileDivider />

        {/* DATA */}
        <div className="px-4 py-5 flex-shrink-0">
          <MobileSectionLabel label="DATA" />
          <div className="flex gap-3">
            <button
              onClick={exportData}
              className="flex-1 flex items-center justify-center gap-2.5 py-4 rounded-2xl text-[14px] font-semibold transition-opacity active:opacity-70"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#94a3b8',
              }}
            >
              <Download size={17} />
              Export
            </button>
            <button
              onClick={() => importRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-2.5 py-4 rounded-2xl text-[14px] font-semibold transition-opacity active:opacity-70"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#94a3b8',
              }}
            >
              <Upload size={17} />
              Import
            </button>
          </div>
          <input
            ref={importRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={e => { importData(e.target.files[0]); e.target.value = ''; }}
          />
        </div>

        {/* Safe area */}
        <div className="h-8 flex-shrink-0" />
      </div>

      {/* ═══════════════ DESKTOP LAYOUT ═══════════════ */}
      <div className="hidden md:flex flex-col flex-1 overflow-y-auto">

        {/* Courses */}
        <div className="pt-5 pb-3">
          <div className="px-4 mb-2 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-subtle">Courses</span>
            <GraduationCap size={11} className="text-disabled" />
          </div>
          <div className="px-2">
            {courses.length === 0 && (
              <div className="px-2.5 py-2 text-[11px] text-disabled italic">No courses yet</div>
            )}
            {courses.map(course => (
              <DesktopCourseItem
                key={course.id}
                course={course}
                active={filter === course.id}
                onSelect={() => setFilter(course.id)}
                onEdit={() => openEditCourse(course.id)}
                onDelete={() => deleteCourse(course.id)}
                onCalc={() => openGradeCalc(course.id)}
              />
            ))}
          </div>
          <div className="px-2 mt-1 flex flex-col gap-0.5">
            <button onClick={() => setModal('addCourse')} className="w-full flex items-center gap-2 px-2.5 py-2 text-[12px] text-subtle hover:text-muted rounded-lg transition-colors hover:bg-panel-hi group">
              <div className="w-5 h-5 rounded flex items-center justify-center border border-dashed border-border group-hover:border-border-hi transition-colors"><Plus size={10} /></div>
              Add course
            </button>
            <button onClick={() => setModal('syllabus')} className="w-full flex items-center gap-2 px-2.5 py-2 text-[12px] text-subtle hover:text-muted rounded-lg transition-colors hover:bg-panel-hi group">
              <div className="w-5 h-5 rounded flex items-center justify-center border border-dashed border-border group-hover:border-border-hi transition-colors"><FileUp size={10} /></div>
              Upload syllabus
            </button>
          </div>
        </div>

        <div className="mx-4 border-t border-border" />

        {/* Categories */}
        <div className="pt-4 pb-3">
          <div className="px-4 mb-2 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-subtle">Categories</span>
            <Layers size={11} className="text-disabled" />
          </div>
          <div className="px-2">
            <DesktopFilterItem id="all" label="All Tasks" color="var(--color-muted)" Icon={Layers} active={filter === 'all'} onSelect={() => setFilter('all')} />
            {regularCats.map(cat => {
              const Icon = getCatIcon(cat);
              return (
                <DesktopFilterItem key={cat.id} id={cat.id} label={cat.label} color={cat.color} Icon={Icon} active={filter === cat.id} locked={cat.locked} onSelect={() => setFilter(cat.id)} onDelete={() => deleteCat(cat.id)} />
              );
            })}
          </div>
          <div className="px-2 mt-1">
            <button onClick={() => setModal('addCat')} className="w-full flex items-center gap-2 px-2.5 py-2 text-[12px] text-subtle hover:text-muted rounded-lg transition-colors hover:bg-panel-hi group">
              <div className="w-5 h-5 rounded flex items-center justify-center border border-dashed border-border group-hover:border-border-hi transition-colors"><Plus size={10} /></div>
              Add category
            </button>
          </div>
        </div>

        <div className="mx-4 border-t border-border" />

        {/* Progress */}
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-subtle">Progress</span>
            <span className="text-[11px] font-mono text-muted tabular-nums">{done}/{total}</span>
          </div>
          <ProgressBar pct={pct} />
          <div className="flex items-center justify-between mt-2.5">
            <span className="text-[11px] text-subtle">{total === 0 ? 'No tasks yet' : `${total - done} remaining`}</span>
            <span className="text-[11px] font-semibold font-mono" style={{ color: pct === 100 ? 'var(--color-success-text)' : 'var(--color-accent-text)' }}>{pct}%</span>
          </div>
        </div>

        <div className="mx-4 border-t border-border" />

        {/* Data */}
        <div className="px-4 py-4 mt-auto">
          <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-subtle mb-3">Data</div>
          <div className="flex flex-col gap-1.5">
            <Button onClick={exportData} className="w-full justify-center text-[12px]"><Download size={12} />Export JSON</Button>
            <Button onClick={() => importRef.current?.click()} className="w-full justify-center text-[12px]"><Upload size={12} />Import JSON</Button>
            <input ref={importRef} type="file" accept=".json" className="hidden" onChange={e => { importData(e.target.files[0]); e.target.value = ''; }} />
          </div>
        </div>
      </div>
    </aside>
  );
}

/* ─── Mobile sub-components ─────────────────────────────── */

function MobileDivider() {
  return <div className="mx-4 flex-shrink-0" style={{ height: '1px', background: 'rgba(255,255,255,0.07)' }} />;
}

function MobileSectionLabel({ label }) {
  return (
    <div className="text-[11px] font-bold uppercase tracking-[0.18em] mb-4" style={{ color: '#475569' }}>
      {label}
    </div>
  );
}

function MobileLargeButton({ Icon, label, onClick, accent = '#6366f1' }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl mb-3 text-[16px] font-semibold transition-opacity active:opacity-70"
      style={{
        minHeight: '56px',
        background: `${accent}15`,
        border: `1px solid ${accent}30`,
        color: accent === '#6366f1' ? '#818cf8' : '#c084fc',
      }}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${accent}25` }}
      >
        <Icon size={18} color={accent === '#6366f1' ? '#818cf8' : '#c084fc'} />
      </div>
      {label}
    </button>
  );
}

function MobileCourseCard({ course, active, onSelect, onEdit, onDelete, onCalc }) {
  const gl = course.grade !== null && course.grade !== undefined ? gradeLabel(course.grade) : null;

  return (
    <div
      className="flex items-center gap-4 px-4 py-4 rounded-2xl mb-3 cursor-pointer transition-opacity active:opacity-70"
      style={{
        minHeight: '72px',
        background: active ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${active ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.07)'}`,
        borderLeft: `4px solid ${course.color}`,
      }}
      onClick={onSelect}
    >
      <div className="flex-1 min-w-0">
        <div className="text-[18px] font-bold truncate leading-tight" style={{ color: '#e2e8f4' }}>
          {course.label}
        </div>
        {course.professor && (
          <div className="text-[13px] mt-1 truncate" style={{ color: '#64748b' }}>
            {course.professor}
          </div>
        )}
        {gl && (
          <div className="text-[12px] font-bold mt-1" style={{ color: gl.color }}>{gl.letter}</div>
        )}
      </div>

      <div className="flex items-center gap-0.5 flex-shrink-0">
        <button
          onClick={e => { e.stopPropagation(); onCalc(); }}
          className="w-10 h-10 flex items-center justify-center rounded-xl transition-colors"
          style={{ color: '#64748b' }}
        >
          <Calculator size={17} />
        </button>
        <button
          onClick={e => { e.stopPropagation(); onEdit(); }}
          className="w-10 h-10 flex items-center justify-center rounded-xl transition-colors"
          style={{ color: '#64748b' }}
        >
          <Pencil size={17} />
        </button>
        <button
          onClick={e => { e.stopPropagation(); onDelete(); }}
          className="w-10 h-10 flex items-center justify-center rounded-xl transition-colors"
          style={{ color: '#64748b' }}
        >
          <X size={17} />
        </button>
      </div>
    </div>
  );
}

function MobileCategoryPill({ id, label, color, Icon, active, locked, onSelect, onDelete }) {
  return (
    <div
      className="flex items-center gap-4 px-4 py-3.5 rounded-2xl mb-2.5 cursor-pointer transition-opacity active:opacity-70"
      style={{
        minHeight: '56px',
        background: active ? `${color === 'var(--color-muted)' ? 'rgba(129,140,248' : hexToRgba(color)},0.14)` : 'rgba(255,255,255,0.04)',
        border: `1px solid ${active ? (color === 'var(--color-muted)' ? 'rgba(129,140,248,0.3)' : `${color}40`) : 'rgba(255,255,255,0.07)'}`,
      }}
      onClick={onSelect}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{
          background: active
            ? `${color === 'var(--color-muted)' ? 'rgba(129,140,248' : hexToRgba(color)},0.2)`
            : 'rgba(255,255,255,0.06)',
          color: active ? (color === 'var(--color-muted)' ? '#818cf8' : color) : '#64748b',
        }}
      >
        <Icon size={19} strokeWidth={2} />
      </div>

      <span className="text-[16px] font-semibold flex-1 truncate" style={{ color: active ? '#e2e8f4' : '#94a3b8' }}>
        {label}
      </span>

      {!locked && id !== 'all' && onDelete && (
        <button
          onClick={e => { e.stopPropagation(); onDelete(); }}
          className="w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0"
          style={{ color: '#475569' }}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}

/* ─── Desktop sub-components ────────────────────────────── */

function DesktopCourseItem({ course, active, onSelect, onEdit, onDelete, onCalc }) {
  const gl = course.grade !== null && course.grade !== undefined ? gradeLabel(course.grade) : null;
  const bg = hexToRgba(course.color);
  return (
    <div
      className="group flex items-center gap-2 px-2.5 py-2 rounded-lg mb-0.5 cursor-pointer transition-all duration-150 relative"
      style={{ background: active ? `${bg},0.1)` : 'transparent', borderLeft: active ? `2px solid ${course.color}` : '2px solid transparent' }}
      onClick={onSelect}
    >
      <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0" style={{ background: active ? `${bg},0.2)` : `${bg},0.08)`, color: course.color }}>
        <GraduationCap size={11} strokeWidth={2.2} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[12px] font-medium truncate leading-tight" style={{ color: active ? 'var(--color-text)' : 'var(--color-muted)' }}>{course.label}</div>
        {course.professor && <div className="text-[10px] truncate leading-tight" style={{ color: 'var(--color-disabled)' }}>{course.professor}</div>}
      </div>
      {gl && <span className="group-hover:opacity-0 text-[10px] font-bold flex-shrink-0 transition-opacity duration-100" style={{ color: gl.color }}>{gl.letter}</span>}
      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 flex-shrink-0 transition-opacity duration-100 absolute right-2">
        <button onClick={e => { e.stopPropagation(); onCalc(); }} className="w-5 h-5 flex items-center justify-center rounded text-subtle hover:text-ai-text transition-colors"><Calculator size={10} /></button>
        <button onClick={e => { e.stopPropagation(); onEdit(); }} className="w-5 h-5 flex items-center justify-center rounded text-subtle hover:text-accent-text transition-colors"><Pencil size={10} /></button>
        <button onClick={e => { e.stopPropagation(); onDelete(); }} className="w-5 h-5 flex items-center justify-center rounded text-subtle hover:text-danger-text transition-colors"><X size={10} /></button>
      </div>
    </div>
  );
}

function DesktopFilterItem({ id, label, color, Icon, active, locked, onSelect, onDelete }) {
  const isVar = color === 'var(--color-muted)';
  const rgba = isVar ? 'rgba(148,163,184' : hexToRgba(color);
  return (
    <div
      className="group flex items-center gap-2.5 px-2.5 py-2 rounded-lg mb-0.5 cursor-pointer transition-all duration-150 relative"
      style={{ background: active ? `${rgba},0.1)` : 'transparent', borderLeft: active ? `2px solid ${color}` : '2px solid transparent' }}
      onClick={onSelect}
    >
      <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-all duration-150" style={{ background: active ? `${rgba},0.15)` : 'rgba(255,255,255,0.04)', color: active ? color : 'var(--color-subtle)' }}>
        <Icon size={11} strokeWidth={2.2} />
      </div>
      <span className="text-[13px] flex-1 truncate font-medium transition-colors duration-150" style={{ color: active ? 'var(--color-text)' : 'var(--color-muted)' }}>{label}</span>
      {!locked && id !== 'all' && onDelete && (
        <button onClick={e => { e.stopPropagation(); onDelete(); }} className="opacity-0 group-hover:opacity-100 w-4 h-4 flex items-center justify-center rounded text-subtle hover:text-danger-text transition-all duration-150 flex-shrink-0">
          <X size={10} />
        </button>
      )}
    </div>
  );
}

/* ─── Helpers ───────────────────────────────────────────── */

function hexToRgba(hex) {
  if (!hex || !hex.startsWith('#')) return 'rgba(148,163,184';
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return 'rgba(148,163,184';
  return `rgba(${r},${g},${b}`;
}
