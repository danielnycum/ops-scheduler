import { useRef } from 'react';
import { Plus, Download, Upload, X, BookOpen, PenLine, Dumbbell, Flag, Tag, Layers, GraduationCap, Pencil, FileUp, Calculator, Sparkles, CalendarDays } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { ProgressBar } from '../ui/ProgressBar';
import { gradeLabel } from '../../lib/constants';

const CAT_ICONS = {
  class:   BookOpen,
  study:   PenLine,
  workout: Dumbbell,
  golf:    Flag,
};

function getCatIcon(cat) {
  return CAT_ICONS[cat.id] || Tag;
}

const BG        = 'var(--gradient-sidebar)';
const SURFACE   = 'var(--surface-1)';
const DIVIDER   = 'var(--border-subtle)';
const TEAL      = 'var(--teal)';
const TEAL_BG   = 'var(--teal-dim-bg)';
const TEAL_BD   = 'var(--teal-border)';

export function Sidebar({ onClose }) {
  const {
    courses, regularCats, filter, setFilter,
    deleteCat, deleteCourse, openEditCourse, openGradeCalc,
    done, total, pct,
    exportData, importData,
    setModal, aiOpen, setAiOpen,
  } = useAppContext();

  const importRef = useRef();

  return (
    <aside
      className="w-full h-full flex flex-col flex-shrink-0"
      style={{ background: BG }}
    >

      {/* ── Scrollable content ── */}
      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>

      {/* ── Mobile-only: brand header ── */}
      <div className="md:hidden" style={{ borderBottom: `1px solid ${DIVIDER}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 20px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: 44, height: 44, borderRadius: 14, flexShrink: 0,
              background: 'linear-gradient(135deg, var(--teal-dark) 0%, var(--teal) 100%)',
              boxShadow: '0 4px 16px var(--teal-glow)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <CalendarDays size={20} color="white" strokeWidth={2} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text)', lineHeight: 1.1 }}>Clarus</div>
              <div style={{ fontSize: 11, color: 'var(--color-subtle)', marginTop: 2 }}>Study smarter. Not harder.</div>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close menu"
            style={{
              width: 48, height: 48, borderRadius: 14, flexShrink: 0,
              background: 'var(--surface-1)',
              border: '1px solid var(--border-subtle)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={22} color="var(--color-subtle)" />
          </button>
        </div>

        {/* AI Optimize */}
        <div style={{ padding: '0 20px 20px' }}>
          <button
            onClick={() => { setAiOpen(p => !p); onClose?.(); }}
            style={{
              width: '100%', borderRadius: 14, padding: '14px 20px',
              background: aiOpen
                ? 'linear-gradient(135deg, var(--teal-deeper) 0%, var(--teal-dark) 100%)'
                : 'linear-gradient(135deg, var(--teal) 0%, var(--teal-dark) 100%)',
              boxShadow: '0 4px 20px var(--teal-glow)',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              fontSize: 15, fontWeight: 700, color: 'white',
            }}
          >
            <Sparkles size={18} />
            {aiOpen ? 'Close AI' : 'AI Optimize'}
          </button>
        </div>
      </div>

      {/* ── COURSES ── */}
      <section style={{ padding: '24px 20px 8px' }}>
        <SectionHeader label="COURSES" />

        {courses.length === 0 && (
          <p style={{ fontSize: 13, color: 'var(--color-subtle)', fontStyle: 'italic', marginBottom: 12 }}>No courses yet</p>
        )}

        {courses.map(course => (
          <CourseCard
            key={course.id}
            course={course}
            active={filter === course.id}
            onSelect={() => { setFilter(course.id); onClose?.(); }}
            onEdit={() => openEditCourse(course.id)}
            onDelete={() => deleteCourse(course.id)}
            onCalc={() => openGradeCalc(course.id)}
          />
        ))}

        <ActionButton Icon={Plus}   label="Add Course"      onClick={() => { setModal('addCourse'); onClose?.(); }} />
        <ActionButton Icon={FileUp} label="Upload Syllabus" onClick={() => { setModal('syllabus');  onClose?.(); }} />
      </section>

      <Divider />

      {/* ── CATEGORIES ── */}
      <section style={{ padding: '24px 20px 8px' }}>
        <SectionHeader label="CATEGORIES" />

        <CategoryPill
          id="all" label="All Tasks" color={TEAL} Icon={Layers}
          active={filter === 'all'}
          onSelect={() => { setFilter('all'); onClose?.(); }}
        />

        {regularCats.map(cat => {
          const Icon = getCatIcon(cat);
          return (
            <CategoryPill
              key={cat.id} id={cat.id} label={cat.label} color={cat.color} Icon={Icon}
              active={filter === cat.id} locked={cat.locked}
              onSelect={() => { setFilter(cat.id); onClose?.(); }}
              onDelete={() => deleteCat(cat.id)}
            />
          );
        })}

        <ActionButton Icon={Plus} label="Add Category" onClick={() => { setModal('addCat'); onClose?.(); }} />
      </section>

      <Divider />

      {/* ── PROGRESS ── */}
      <section style={{ padding: '24px 20px 8px' }}>
        <SectionHeader label="PROGRESS" />
        <div style={{ borderRadius: 12, background: SURFACE, border: '1px solid var(--border-subtle)', padding: '16px 18px', marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: 'var(--color-muted)' }}>This week</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)', fontFamily: 'monospace' }}>{done}/{total}</span>
          </div>
          <ProgressBar pct={pct} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
            <span style={{ fontSize: 12, color: 'var(--color-subtle)' }}>
              {total === 0 ? 'No tasks yet' : `${total - done} remaining`}
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'monospace', color: pct === 100 ? 'var(--color-success-text)' : TEAL }}>
              {pct}%
            </span>
          </div>
        </div>
      </section>

      <div style={{ height: 8 }} />
      </div>{/* end scrollable */}

      {/* ── DATA — pinned footer ── */}
      <div style={{ flexShrink: 0, borderTop: `1px solid ${DIVIDER}` }}>
        <section style={{ padding: '20px' }}>
          <SectionHeader label="DATA" />
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={exportData}
              style={{
                flex: 1, borderRadius: 12, padding: '13px 12px',
                background: SURFACE, border: '1px solid var(--border-subtle)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                fontSize: 13, fontWeight: 600, color: 'var(--color-muted)', cursor: 'pointer',
              }}
            >
              <Download size={15} />
              Export
            </button>
            <button
              onClick={() => importRef.current?.click()}
              style={{
                flex: 1, borderRadius: 12, padding: '13px 12px',
                background: SURFACE, border: '1px solid var(--border-subtle)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                fontSize: 13, fontWeight: 600, color: 'var(--color-muted)', cursor: 'pointer',
              }}
            >
              <Upload size={15} />
              Import
            </button>
          </div>
          <input
            ref={importRef} type="file" accept=".json" className="hidden"
            onChange={e => { importData(e.target.files[0]); e.target.value = ''; }}
          />
        </section>
      </div>
    </aside>
  );
}

/* ─── Section header ──────────────────────────────────────── */
function SectionHeader({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
      <div style={{
        width: 3, height: 16, borderRadius: 2, flexShrink: 0,
        background: TEAL,
        boxShadow: '0 0 10px var(--teal-glow)',
      }} />
      <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.16em', color: TEAL }}>
        {label}
      </span>
    </div>
  );
}

/* ─── Divider ─────────────────────────────────────────────── */
function Divider() {
  return <div style={{ height: 1, background: DIVIDER, margin: '0 20px' }} />;
}

/* ─── Course card ─────────────────────────────────────────── */
function CourseCard({ course, active, onSelect, onEdit, onDelete, onCalc }) {
  const gl = (course.grade !== null && course.grade !== undefined) ? gradeLabel(course.grade) : null;

  return (
    <div
      onClick={onSelect}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 12,
        borderRadius: 12, padding: '12px 16px', minHeight: 60, marginBottom: 10,
        background: active ? 'var(--teal-surface)' : SURFACE,
        border: `1px solid ${active ? 'var(--teal-border)' : 'var(--border-subtle)'}`,
        borderLeft: `4px solid ${course.color}`,
        cursor: 'pointer',
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)', lineHeight: 1.3 }}>
          {course.label}
        </div>
        {course.professor && (
          <div style={{ fontSize: 12, color: 'var(--color-subtle)', marginTop: 4, lineHeight: 1.4 }}>
            {course.professor}
          </div>
        )}
        {gl && <div style={{ fontSize: 11, fontWeight: 700, marginTop: 3, color: gl.color }}>{gl.letter}</div>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
        <IconBtn onClick={e => { e.stopPropagation(); onCalc(); }} title="Grade calculator"><Calculator size={14} /></IconBtn>
        <IconBtn onClick={e => { e.stopPropagation(); onEdit(); }} title="Edit"><Pencil size={14} /></IconBtn>
        <IconBtn onClick={e => { e.stopPropagation(); onDelete(); }} title="Delete" danger><X size={14} /></IconBtn>
      </div>
    </div>
  );
}

/* ─── Action button ── */
function ActionButton({ Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', borderRadius: 12, padding: '12px 16px', marginBottom: 10,
        background: TEAL_BG, border: `1px solid ${TEAL_BD}`,
        display: 'flex', alignItems: 'center', gap: 12,
        fontSize: 14, fontWeight: 600, color: TEAL, cursor: 'pointer',
      }}
    >
      <div style={{
        width: 30, height: 30, borderRadius: 8, flexShrink: 0,
        background: 'var(--teal-surface)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={15} color={TEAL} />
      </div>
      {label}
    </button>
  );
}

/* ─── Category pill ───────────────────────────────────────── */
function CategoryPill({ id, label, color, Icon, active, locked, onSelect, onDelete }) {
  return (
    <div
      onClick={onSelect}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        borderRadius: 12, padding: '12px 16px', minHeight: 48, marginBottom: 8,
        background: active ? 'var(--teal-surface)' : SURFACE,
        border: `1px solid ${active ? 'var(--teal-border)' : 'var(--border-subtle)'}`,
        borderLeft: active ? `4px solid var(--teal)` : `4px solid transparent`,
        cursor: 'pointer',
      }}
    >
      <div style={{
        width: 34, height: 34, borderRadius: 10, flexShrink: 0,
        background: active ? 'var(--teal-dim-bg)' : 'var(--surface-1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: active ? TEAL : 'var(--color-subtle)',
      }}>
        <Icon size={16} strokeWidth={2} />
      </div>
      <span style={{ fontSize: 15, fontWeight: 600, flex: 1, color: active ? 'var(--color-text)' : 'var(--color-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {label}
      </span>
      {!locked && id !== 'all' && onDelete && (
        <button
          onClick={e => { e.stopPropagation(); onDelete(); }}
          style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-subtle)' }}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

/* ─── Small icon button ─────────────────────────────── */
function IconBtn({ onClick, title, danger, children }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
        background: 'none', border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: danger ? '#f87171' : 'var(--color-subtle)',
      }}
    >
      {children}
    </button>
  );
}
