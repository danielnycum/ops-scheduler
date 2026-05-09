import { useState, useMemo } from 'react';
import { GraduationCap, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Modal } from './ui/Modal';
import { Field } from './ui/Field';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { useAppContext } from '../context/AppContext';
import { gradeLabel } from '../lib/constants';

const TARGET_OPTIONS = [
  { letter: 'A', label: 'A  (93%+)', value: 93, color: '#4ade80' },
  { letter: 'B', label: 'B  (83%+)', value: 83, color: '#5eead4' },
  { letter: 'C', label: 'C  (73%+)', value: 73, color: '#fbbf24' },
  { letter: 'D', label: 'D  (63%+)', value: 63, color: '#fb923c' },
];

const STATUS_META = {
  green: { color: '#4ade80', bg: 'rgba(74,222,128,0.08)',  border: 'rgba(74,222,128,0.25)',  Icon: CheckCircle2, label: 'Achievable'                  },
  amber: { color: '#fbbf24', bg: 'rgba(251,191,36,0.08)',  border: 'rgba(251,191,36,0.25)',  Icon: TrendingUp,   label: 'Close — needs high scores'  },
  red:   { color: '#f87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.25)', Icon: AlertTriangle, label: null },
};

function hexRgb(hex) {
  if (!hex?.startsWith('#')) return 'rgba(148,163,184';
  const r = parseInt(hex.slice(1,3), 16);
  const g = parseInt(hex.slice(3,5), 16);
  const b = parseInt(hex.slice(5,7), 16);
  if (isNaN(r+g+b)) return 'rgba(148,163,184';
  return `rgba(${r},${g},${b}`;
}

export default function GradeCalculatorModal() {
  const { tasks, gradeCalcTarget, courses, setModal } = useAppContext();

  const course = courses.find(c => c.id === gradeCalcTarget);

  const incompleteTasks = useMemo(
    () => tasks.filter(t => t.category === gradeCalcTarget && !t.completed),
    [tasks, gradeCalcTarget]
  );

  const [currentGrade, setCurrentGrade] = useState(
    course?.grade !== null && course?.grade !== undefined ? String(course.grade) : ''
  );
  const [targetIdx, setTargetIdx] = useState(0);
  const [expectedScores, setExpectedScores] = useState({});

  const target = TARGET_OPTIONS[targetIdx];

  const calc = useMemo(() => {
    const current = parseFloat(currentGrade);
    const hasGrade = !isNaN(current) && current >= 0 && current <= 100;

    const gradedTasks = incompleteTasks.filter(t => t.gradeWeight && +t.gradeWeight > 0);
    const incompleteWeight = gradedTasks.reduce((sum, t) => sum + +t.gradeWeight, 0);
    const completedWeight  = Math.max(0, 100 - incompleteWeight);

    if (!hasGrade) return { incompleteWeight, completedWeight, projectedFinal: null, minScore: null, highestPossible: null, status: null };

    const earnedFromCompleted = (current / 100) * completedWeight;

    // Projected final — 0 for unset scores (shows minimum projection)
    const projectedEarned = gradedTasks.reduce((sum, t) => {
      const score = parseFloat(expectedScores[t.id]);
      return sum + (isNaN(score) ? 0 : (score / 100) * +t.gradeWeight);
    }, 0);
    const projectedFinal = earnedFromCompleted + projectedEarned;

    // Highest possible (100% on all incomplete)
    const highestPossible = Math.min(100, earnedFromCompleted + incompleteWeight);

    // Minimum uniform score needed across all incomplete graded tasks
    const neededFromRemaining = target.value - earnedFromCompleted;
    const minScore = incompleteWeight > 0 ? (neededFromRemaining / incompleteWeight) * 100 : null;

    let status = null;
    if (minScore !== null) {
      status = minScore > 100 ? 'red' : minScore >= 95 ? 'amber' : 'green';
    }

    return { incompleteWeight, completedWeight, projectedFinal, minScore, highestPossible, status };
  }, [currentGrade, incompleteTasks, expectedScores, target]);

  const { projectedFinal, minScore, highestPossible, status, incompleteWeight } = calc;

  const sm   = status ? STATUS_META[status] : null;
  const gl   = projectedFinal !== null ? gradeLabel(projectedFinal) : null;
  const cRgb = hexRgb(course?.color);

  function fmtMin(v) {
    if (v === null) return '—';
    if (v > 100) return '>100%';
    return `${v.toFixed(0)}%`;
  }

  return (
    <Modal onClose={() => setModal(null)} title="Grade Calculator" width={480}>

      {/* Course pill */}
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-xl mb-5 border"
        style={{
          background:   `${cRgb},0.06)`,
          borderColor:  `${cRgb},0.2)`,
        }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${cRgb},0.18)`, color: course?.color ?? 'var(--color-subtle)' }}
        >
          <GraduationCap size={16} strokeWidth={2} />
        </div>
        <div className="min-w-0">
          <div className="text-[13px] font-semibold text-text truncate">{course?.label ?? 'Course'}</div>
          {course?.professor && (
            <div className="text-[11px] text-subtle truncate">{course.professor}</div>
          )}
        </div>
      </div>

      {/* Inputs row */}
      <div className="flex gap-3 mb-4">
        <Field label="Current Grade %" className="flex-1 mb-0" htmlFor="gc-current">
          <Input
            id="gc-current"
            value={currentGrade}
            onChange={e => setCurrentGrade(e.target.value)}
            placeholder="e.g. 85"
            maxLength={5}
            autoFocus
          />
        </Field>
        <Field label="Target Grade" className="w-44 mb-0" htmlFor="gc-target">
          <select
            id="gc-target"
            value={targetIdx}
            onChange={e => setTargetIdx(+e.target.value)}
            className="w-full h-[38px] rounded-md border border-border bg-[#070c14] text-text text-[13px] px-3 appearance-none cursor-pointer transition-colors hover:border-border-hi focus:border-accent focus:outline-none"
          >
            {TARGET_OPTIONS.map((opt, i) => (
              <option key={opt.letter} value={i}>{opt.label}</option>
            ))}
          </select>
        </Field>
      </div>

      {/* Status banner */}
      {sm && (
        <div
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg mb-4 text-[12px] font-medium border"
          style={{ background: sm.bg, borderColor: sm.border, color: sm.color }}
        >
          <sm.Icon size={13} strokeWidth={2.5} />
          {status === 'red'
            ? `${target.letter} not achievable — best case ${highestPossible !== null ? Math.floor(highestPossible) + '%' : '—'}`
            : sm.label
          }
        </div>
      )}

      {/* Stats */}
      {projectedFinal !== null && (
        <div className="grid grid-cols-3 gap-2.5 mb-5">
          <StatCard
            label="Projected Final"
            value={`${projectedFinal.toFixed(1)}%`}
            sub={gl?.letter}
            color={gl?.color ?? 'var(--color-subtle)'}
          />
          <StatCard
            label="Best Possible"
            value={highestPossible !== null ? `${highestPossible.toFixed(1)}%` : '—'}
            color="var(--color-subtle)"
          />
          <StatCard
            label={`Min for ${target.letter}`}
            value={incompleteWeight > 0 ? fmtMin(minScore) : 'N/A'}
            color={sm?.color ?? 'var(--color-subtle)'}
          />
        </div>
      )}

      {/* Task list */}
      <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-subtle mb-2">
        Remaining Tasks
      </div>
      {incompleteTasks.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-2xl mb-2" style={{ color: '#4ade80' }}>✓</div>
          <p className="text-[12px] text-subtle">All tasks complete for this course.</p>
        </div>
      ) : (
        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-0.5">
          {incompleteTasks.map(task => (
            <TaskScoreRow
              key={task.id}
              task={task}
              value={expectedScores[task.id] ?? ''}
              onChange={v => setExpectedScores(p => ({ ...p, [task.id]: v }))}
              courseColor={course?.color}
            />
          ))}
        </div>
      )}

      <div className="flex justify-end pt-4 border-t border-border mt-4">
        <Button onClick={() => setModal(null)}>Close</Button>
      </div>
    </Modal>
  );
}

function StatCard({ label, value, sub, color }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-0.5 p-3 rounded-xl border text-center"
      style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'var(--color-border)' }}
    >
      <span className="text-[9px] text-disabled font-semibold uppercase tracking-[0.1em] leading-tight">{label}</span>
      <span className="text-[18px] font-bold font-mono mt-1" style={{ color }}>{value}</span>
      {sub && <span className="text-[11px] font-bold" style={{ color }}>{sub}</span>}
    </div>
  );
}

function TaskScoreRow({ task, value, onChange, courseColor }) {
  const hasWeight = task.gradeWeight && +task.gradeWeight > 0;
  return (
    <div
      className="flex items-center gap-3 rounded-lg px-3 py-2 border"
      style={{
        background:  'rgba(255,255,255,0.02)',
        borderColor: 'var(--color-border)',
        borderLeft:  `3px solid ${courseColor ?? 'var(--color-border)'}`,
      }}
    >
      <div className="flex-1 min-w-0">
        <div className="text-[12px] font-medium text-text truncate">{task.title}</div>
        <div className="text-[10px] text-disabled mt-0.5 truncate">
          {hasWeight ? `${task.gradeWeight}% of grade` : 'No grade weight'}
          {task.dueDate && ` · Due ${task.dueDate}`}
        </div>
      </div>
      {hasWeight ? (
        <div className="w-20 flex-shrink-0">
          <Input
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder="Score %"
            maxLength={5}
            className="text-center text-[12px] py-1.5"
          />
        </div>
      ) : (
        <span className="text-[10px] text-disabled italic flex-shrink-0">unweighted</span>
      )}
    </div>
  );
}
