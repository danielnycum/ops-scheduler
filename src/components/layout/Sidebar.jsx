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

const BG = 'linear-gradient(180deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%)';
const SURFACE   = 'rgba(255,255,255,0.05)';
const DIVIDER   = 'rgba(255,255,255,0.07)';
const PURPLE    = '#818cf8';
const PURPLE_BG = 'rgba(99,102,241,0.2)';
const PURPLE_BD = 'rgba(99,102,241,0.4)';

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
      className="w-full h-full flex flex-col flex-shrink-0 overflow-y-auto"
      style={{ background: BG }}
    >

      {/* ── Mobile-only: brand header ── */}
      <div className="md:hidden" style={{ borderBottom: `1px solid ${DIVIDER}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 20px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: 44, height: 44, borderRadius: 14, flexShrink: 0,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              boxShadow: '0 4px 16px rgba(99,102,241,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <CalendarDays size={20} color="white" strokeWidth={2} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#e8edf5', lineHeight: 1.1 }}>Clarus</div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Study smarter. Not harder.</div>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close menu"
            style={{
              width: 48, height: 48, borderRadius: 14, flexShrink: 0,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={22} color="#94a3b8" />
          </button>
        </div>

        {/* AI Optimize */}
        <div style={{ padding: '0 20px 20px' }}>
          <button
            onClick={() => { setAiOpen(p => !p); onClose?.(); }}
            style={{
              width: '100%', borderRadius: 14, padding: '14px 20px',
              background: aiOpen
                ? 'linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)'
                : 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
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
          <p style={{ fontSize: 13, color: '#475569', fontStyle: 'italic', marginBottom: 12 }}>No courses yet</p>
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
          id="all" label="All Tasks" color={PURPLE} Icon={Layers}
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
        <div style={{ borderRadius: 12, background: SURFACE, padding: '16px 18px', marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: '#94a3b8' }}>This week</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f4', fontFamily: 'monospace' }}>{done}/{total}</span>
          </div>
          <ProgressBar pct={pct} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
            <span style={{ fontSize: 12, color: '#64748b' }}>
              {total === 0 ? 'No tasks yet' : `${total - done} remaining`}
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'monospace', color: pct === 100 ? '#4ade80' : PURPLE }}>
              {pct}%
            </span>
          </div>
        </div>
      </section>

      <Divider />

      {/* ── DATA ── */}
      <section style={{ padding: '24px 20px', marginTop: 'auto' }}>
        <SectionHeader label="DATA" />
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={exportData}
            style={{
              flex: 1, borderRadius: 12, padding: '13px 12px',
              background: SURFACE, border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              fontSize: 13, fontWeight: 600, color: '#94a3b8', cursor: 'pointer',
            }}
          >
            <Download size={15} />
            Export
          </button>
          <button
            onClick={() => importRef.current?.click()}
            style={{
              flex: 1, borderRadius: 12, padding: '13px 12px',
              background: SURFACE, border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              fontSize: 13, fontWeight: 600, color: '#94a3b8', cursor: 'pointer',
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

      <div style={{ height: 16, flexShrink: 0 }} />
    </aside>
  );
}

/* ─── Section header ──────────────────────────────────────── */
function SectionHeader({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
      <div style={{
        width: 3, height: 16, borderRadius: 2, flexShrink: 0,
        background: PURPLE,
        boxShadow: `0 0 10px ${PURPLE}, 0 0 4px ${PURPLE}`,
      }} />
      <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.16em', color: PURPLE }}>
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
        display: 'flex', alignItems: 'center', gap: 12,
        borderRadius: 12, padding: '12px 16px', minHeight: 60, marginBottom: 10,
        background: active ? 'rgba(99,102,241,0.15)' : SURFACE,
        border: `1px solid ${active ? 'rgba(99,102,241,0.35)' : 'rgba(255,255,255,0.07)'}`,
        borderLeft: `4px solid ${course.color}`,
        cursor: 'pointer',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#e2e8f4', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {course.label}
        </div>
        {course.professor && (
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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

/* ─── Action button (Add Course / Upload Syllabus / Add Category) ── */
function ActionButton({ Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', borderRadius: 12, padding: '12px 16px', marginBottom: 10,
        background: PURPLE_BG, border: `1px solid ${PURPLE_BD}`,
        display: 'flex', alignItems: 'center', gap: 12,
        fontSize: 14, fontWeight: 600, color: PURPLE, cursor: 'pointer',
      }}
    >
      <div style={{
        width: 30, height: 30, borderRadius: 8, flexShrink: 0,
        background: 'rgba(99,102,241,0.25)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={15} color={PURPLE} />
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
        background: active ? 'rgba(99,102,241,0.25)' : SURFACE,
        border: `1px solid ${active ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.07)'}`,
        borderLeft: active ? '4px solid #6366f1' : `4px solid transparent`,
        cursor: 'pointer',
      }}
    >
      <div style={{
        width: 34, height: 34, borderRadius: 10, flexShrink: 0,
        background: active ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: active ? PURPLE : '#64748b',
      }}>
        <Icon size={16} strokeWidth={2} />
      </div>
      <span style={{ fontSize: 15, fontWeight: 600, flex: 1, color: active ? '#e2e8f4' : '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {label}
      </span>
      {!locked && id !== 'all' && onDelete && (
        <button
          onClick={e => { e.stopPropagation(); onDelete(); }}
          style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

/* ─── Small icon button (for course card actions) ─────────── */
function IconBtn({ onClick, title, danger, children }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
        background: 'none', border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: danger ? '#f87171' : '#64748b',
      }}
    >
      {children}
    </button>
  );
}
