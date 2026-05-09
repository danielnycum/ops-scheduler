import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, Sparkles, TrendingUp, Target, SkipForward, AlertTriangle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { todayIdx } from '../lib/utils';
import { DAYS } from '../lib/constants';

function daysUntil(dueDate) {
  if (!dueDate) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.round((new Date(dueDate + 'T00:00:00') - now) / 86400000);
}

function calcScore(task) {
  const gw = Number(task.gradeWeight);
  if (!task.dueDate || isNaN(gw) || gw <= 0) return null;
  const days = daysUntil(task.dueDate);
  if (days === null) return null;
  if (days <= 0) return +(gw * 10).toFixed(2);
  return +(gw / days).toFixed(2);
}

function ScoreChip({ score }) {
  if (score === null) {
    return <span className="text-[10px] text-disabled italic flex-shrink-0">unweighted</span>;
  }
  const color = score >= 5 ? '#f87171' : score >= 2 ? '#fbbf24' : score >= 1 ? '#818cf8' : '#64748b';
  return (
    <span
      className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded flex-shrink-0"
      style={{ color, background: `${color}18` }}
    >
      {score >= 100 ? '!!' : score.toFixed(1)}
    </span>
  );
}

function formatDue(dueDate) {
  if (!dueDate) return null;
  const days = daysUntil(dueDate);
  if (days < 0)  return { label: `${Math.abs(days)}d overdue`, color: '#f87171' };
  if (days === 0) return { label: 'Due today',  color: '#fbbf24' };
  if (days === 1) return { label: 'Due tomorrow', color: '#fbbf24' };
  return { label: `Due in ${days}d`, color: '#64748b' };
}

function TaskRow({ task, courses }) {
  const score  = calcScore(task);
  const course = courses.find(c => c.id === task.category);
  const due    = formatDue(task.dueDate);

  return (
    <div className="flex items-center gap-2 py-1.5 border-b border-[#1a1030] last:border-0">
      {/* Course color bar */}
      <div
        className="w-1 self-stretch rounded-full flex-shrink-0"
        style={{ background: course?.color ?? '#334155', minHeight: '1.25rem' }}
      />

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[12px] text-text font-medium truncate flex-1 leading-snug">
            {task.title}
          </span>
          <ScoreChip score={score} />
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          {course && (
            <span
              className="text-[10px] font-medium truncate"
              style={{ color: course.color }}
            >
              {course.label}
            </span>
          )}
          {due && (
            <span className="text-[10px] flex-shrink-0" style={{ color: due.color }}>
              {due.label}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, color, children, empty }) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={12} style={{ color }} />
        <span className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color }}>
          {title}
        </span>
      </div>
      {empty
        ? <p className="text-[11px] text-disabled italic pl-0.5">{empty}</p>
        : children
      }
    </div>
  );
}

export default function AIPanel() {
  const { tasks, courses, setAiOpen } = useAppContext();
  const today = todayIdx();

  const { todayTasks, weekRanked, toSkip, allOverdue } = useMemo(() => {
    const incomplete = tasks.filter(t => !t.completed);

    const withMeta = incomplete.map(t => ({
      task:  t,
      score: calcScore(t),
      days:  daysUntil(t.dueDate),
    }));

    const byPriority = (a, b) => {
      if (a.score !== null && b.score !== null) return b.score - a.score;
      if (a.score !== null) return -1;
      if (b.score !== null) return 1;
      return (a.days ?? 999) - (b.days ?? 999);
    };

    const todayAll = withMeta
      .filter(({ task, days }) => task.day === today || (days !== null && days <= 3))
      .sort(byPriority);

    const allOverdue = todayAll.length === 0
      && withMeta.some(({ days }) => days !== null && days < 0);

    const weekRanked = withMeta
      .filter(({ task, score }) => task.dueDate || score !== null)
      .sort(byPriority)
      .slice(0, 7);

    const toSkip = withMeta
      .filter(({ score }) => score !== null && score < 1.0)
      .sort((a, b) => a.score - b.score);

    return { todayTasks: todayAll.slice(0, 3), weekRanked, toSkip, allOverdue };
  }, [tasks, today]);

  const todayEmpty = todayTasks.length === 0
    ? (allOverdue ? 'All upcoming tasks are overdue — check your due dates.' : 'Nothing due in the next 3 days.')
    : null;

  return (
    <motion.div
      className="fixed right-0 top-0 bottom-0 w-96 z-40 flex flex-col border-l border-[#1a1030]"
      style={{ background: '#08060f', boxShadow: '-16px 0 60px rgba(0,0,0,0.65)' }}
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0,      opacity: 1 }}
      exit={{    x: '100%', opacity: 0 }}
      transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a1030]">
        <div className="flex items-center gap-2">
          <Sparkles size={15} className="text-ai-text" />
          <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-ai-text">
            AI Analysis
          </span>
        </div>
        <button
          onClick={() => setAiOpen(false)}
          className="w-7 h-7 flex items-center justify-center rounded-md text-subtle hover:text-text hover:bg-[#1a1030] transition-colors"
        >
          <X size={15} />
        </button>
      </div>

      {/* Legend */}
      <div className="px-5 pt-2.5 pb-2 border-b border-[#1a1030]">
        <p className="text-[10px] text-disabled leading-relaxed">
          Score = Grade Weight ÷ Days Until Due · higher = more urgent
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-5 py-4">

        {tasks.length === 0 && (
          <div className="flex flex-col items-center gap-3 pt-12 text-center">
            <AlertTriangle size={24} className="text-disabled" />
            <p className="text-[12px] text-disabled">
              Add tasks with due dates and grade weights to see analysis.
            </p>
          </div>
        )}

        {tasks.length > 0 && (
          <>
            <Section
              icon={Target}
              title="Today's Focus"
              color="#a855f7"
              empty={todayEmpty}
            >
              {todayTasks.map(({ task }) => (
                <TaskRow key={task.id} task={task} courses={courses} />
              ))}
            </Section>

            <Section
              icon={TrendingUp}
              title="This Week — Ranked"
              color="#6366f1"
              empty={weekRanked.length === 0 ? 'Add due dates to tasks to see them ranked here.' : null}
            >
              {weekRanked.map(({ task }) => (
                <TaskRow key={task.id} task={task} courses={courses} />
              ))}
            </Section>

            <Section
              icon={SkipForward}
              title="What To Skip"
              color="#64748b"
              empty={toSkip.length === 0 ? 'Nothing scores below 1.0 right now.' : null}
            >
              {toSkip.map(({ task }) => (
                <TaskRow key={task.id} task={task} courses={courses} />
              ))}
            </Section>
          </>
        )}
      </div>
    </motion.div>
  );
}
