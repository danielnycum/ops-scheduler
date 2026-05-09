import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, AlertTriangle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { DAYS, SHORT_DAYS } from '../lib/constants';
import { todayIdx, getCategoryById, toMin } from '../lib/utils';

function getWeekDates() {
  const now    = new Date();
  const js     = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (js === 0 ? 6 : js - 1));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.getDate();
  });
}

export default function WeeklyView() {
  const { tasks, categories, conflicts, setView, setSelectedDay, setModal, setEditTarget } = useAppContext();
  const today     = todayIdx();
  const weekDates = getWeekDates();

  function getCat(id) { return getCategoryById(id, categories); }

  function handleAddTask(dayIdx, e) {
    e.stopPropagation();
    setSelectedDay(dayIdx);
    setEditTarget(null);
    setModal('addTask');
  }

  function handleDayClick(dayIdx) {
    setSelectedDay(dayIdx);
    setView('daily');
  }

  const totalScheduledHours = Math.round(
    tasks.reduce((sum, t) => sum + (toMin(t.endTime) - toMin(t.startTime)), 0) / 60 * 10
  ) / 10;

  // Today first, then the following days in order
  const orderedIndices = Array.from({ length: 7 }, (_, i) => (today + i) % 7);

  return (
    <div className="flex flex-col gap-4 max-w-3xl mx-auto w-full">
      {/* Summary bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[13px] font-semibold text-text">This Week</h2>
          <p className="text-[11px] text-subtle mt-0.5">
            {tasks.length} tasks · {totalScheduledHours}h scheduled
          </p>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-subtle">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: '#4ade80' }} />
            Light
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: '#fbbf24' }} />
            Moderate
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: '#f87171' }} />
            Heavy
          </span>
        </div>
      </div>

      {/* Vertical day stack */}
      <div className="flex flex-col gap-4">
        {orderedIndices.map((i, position) => {
          const isToday     = i === today;
          const list        = tasks.filter(t => t.day === i).sort((a, b) => a.startTime.localeCompare(b.startTime));
          const hasConflict = list.some(t => conflicts.has(t.id));

          const scheduledMin = list.reduce((sum, t) => sum + (toMin(t.endTime) - toMin(t.startTime)), 0);
          const loadPct   = Math.min(100, (scheduledMin / 480) * 100);
          const loadColor = loadPct < 33 ? '#4ade80' : loadPct < 66 ? '#fbbf24' : '#f87171';

          return (
            <DayRow
              key={DAYS[i]}
              day={DAYS[i]}
              shortDay={SHORT_DAYS[i]}
              dateNum={weekDates[i]}
              dayIdx={i}
              isToday={isToday}
              position={position}
              list={list}
              hasConflict={hasConflict}
              conflicts={conflicts}
              loadPct={loadPct}
              loadColor={loadColor}
              getCat={getCat}
              onDayClick={handleDayClick}
              onAddTask={handleAddTask}
            />
          );
        })}
      </div>
    </div>
  );
}

function DayRow({ day, shortDay, dateNum, dayIdx, isToday, position, list, hasConflict, conflicts, loadPct, loadColor, getCat, onDayClick, onAddTask }) {
  const [hovered, setHovered] = useState(false);

  const borderColor = hasConflict
    ? 'rgba(239,68,68,0.5)'
    : isToday
    ? 'rgba(99,102,241,0.5)'
    : hovered
    ? 'var(--color-border-hi)'
    : 'var(--color-border)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: position * 0.04, ease: [0.4, 0, 0.2, 1] }}
      className="rounded-xl overflow-hidden"
      style={{
        background: isToday
          ? 'linear-gradient(160deg, #1e1b4b 0%, #161d35 60%, var(--color-panel-alt) 100%)'
          : 'var(--color-panel-alt)',
        border: `1px solid ${borderColor}`,
        boxShadow: isToday
          ? '0 4px 24px rgba(99,102,241,0.18), 0 0 0 1px rgba(99,102,241,0.08)'
          : '0 2px 8px rgba(0,0,0,0.2)',
        transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Load bar */}
      <div className="h-0.5 w-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: loadColor, opacity: 0.8 }}
          animate={{ width: `${loadPct}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      {/* Header row */}
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
        style={{
          borderBottom: `1px solid ${isToday ? 'rgba(99,102,241,0.15)' : 'var(--color-border)'}`,
          background: isToday ? 'rgba(99,102,241,0.06)' : 'rgba(255,255,255,0.01)',
        }}
        onClick={() => onDayClick(dayIdx)}
      >
        {/* Left: pulse dot + date + name */}
        <div className="flex items-center gap-2.5">
          {isToday && (
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{
                background: 'var(--color-accent)',
                animation: 'todayPulse 2s ease-in-out infinite',
                boxShadow: '0 0 6px rgba(99,102,241,0.6)',
              }}
            />
          )}
          <span
            className="text-[24px] font-bold leading-none"
            style={{ color: isToday ? 'var(--color-accent-text)' : 'var(--color-text)' }}
          >
            {dateNum}
          </span>
          <div className="flex flex-col leading-tight">
            <span
              className="text-[13px] font-semibold"
              style={{ color: isToday ? 'var(--color-accent-text)' : 'var(--color-muted)' }}
            >
              {isToday ? 'Today' : day}
            </span>
            {!isToday && (
              <span className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--color-subtle)' }}>
                {shortDay}
              </span>
            )}
          </div>
        </div>

        {/* Right: task count + conflict + add */}
        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
          {list.length > 0 && (
            <span className="text-[11px]" style={{ color: isToday ? 'var(--color-accent-text)' : 'var(--color-subtle)' }}>
              {list.length} task{list.length !== 1 ? 's' : ''}
            </span>
          )}
          {hasConflict && (
            <AlertTriangle size={12} style={{ color: '#f87171' }} />
          )}
          <button
            onClick={e => onAddTask(dayIdx, e)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all duration-150"
            style={{
              color: 'var(--color-subtle)',
              borderColor: 'var(--color-border)',
              background: 'rgba(255,255,255,0.02)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = 'var(--color-accent-text)';
              e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)';
              e.currentTarget.style.background = 'rgba(99,102,241,0.08)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'var(--color-subtle)';
              e.currentTarget.style.borderColor = 'var(--color-border)';
              e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
            }}
          >
            <Plus size={11} />
            Add
          </button>
        </div>
      </div>

      {/* Task rows */}
      <div
        className="px-4 py-3 space-y-2 cursor-pointer min-h-[5rem] flex flex-col justify-center"
        onClick={() => onDayClick(dayIdx)}
      >
        {list.length === 0 ? (
          <div className="text-[11px] px-1 select-none" style={{ color: 'var(--color-disabled)' }}>
            Free day
          </div>
        ) : (
          <>
            {list.slice(0, 4).map(task => {
              const cat = getCat(task.category);
              return (
                <div
                  key={task.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
                  style={{
                    background: task.completed ? 'rgba(255,255,255,0.01)' : `${cat.color}10`,
                    borderLeft: `2px solid ${conflicts.has(task.id) ? '#f87171' : task.completed ? 'var(--color-border)' : cat.color}`,
                    opacity: task.completed ? 0.45 : 1,
                  }}
                >
                  <span className="text-[11px] font-mono flex-shrink-0" style={{ color: 'var(--color-disabled)' }}>
                    {task.startTime}
                  </span>
                  <span
                    className="text-[12px] font-medium flex-1 truncate"
                    style={{ color: task.completed ? 'var(--color-subtle)' : 'var(--color-text)' }}
                  >
                    {task.title}
                  </span>
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cat.color }} />
                </div>
              );
            })}
            {list.length > 4 && (
              <div className="text-[11px] px-3 pt-1" style={{ color: 'var(--color-disabled)' }}>
                +{list.length - 4} more
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}
