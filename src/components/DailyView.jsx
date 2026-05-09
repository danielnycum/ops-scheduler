import { useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Pencil, Trash2, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Tag } from './ui/Tag';
import { Button } from './ui/Button';
import { DAYS, SHORT_DAYS } from '../lib/constants';
import { getCategoryById, todayIdx } from '../lib/utils';

export default function DailyView() {
  const {
    tasks, categories, conflicts,
    selectedDay, setSelectedDay,
    setView, filter,
    toggleComplete, openEdit, deleteTask,
    setModal, setEditTarget,
  } = useAppContext();

  const getCat = id => getCategoryById(id, categories);

  const list = tasks
    .filter(t => t.day === selectedDay && (filter === 'all' || t.category === filter))
    .sort((a,b) => a.startTime.localeCompare(b.startTime));

  const dayConflict = list.some(t => conflicts.has(t.id));
  const allDone     = list.length > 0 && list.every(t => t.completed);

  const activeCat  = filter !== 'all' ? getCat(filter) : null;
  const today      = todayIdx();
  const weekDates  = getWeekDates();

  return (
    <div className="max-w-2xl mx-auto w-full">
      {/* Back to week — desktop only */}
      <button
        onClick={() => setView('weekly')}
        className="hidden md:flex items-center gap-1.5 text-[11px] text-subtle hover:text-muted transition-colors mb-4 group"
      >
        <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform duration-150" />
        Week view
      </button>

      {/* Mobile day picker — horizontal scrollable pill row with date numbers */}
      <div className="flex md:hidden overflow-x-auto gap-1 mb-4 pb-0.5 scrollbar-none">
        {DAYS.map((day, i) => {
          const isActive = i === selectedDay;
          const isToday  = i === today;
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(i)}
              className="flex-shrink-0 flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-150 min-w-[3rem]"
              style={{
                background: isActive
                  ? 'rgba(99,102,241,0.2)'
                  : 'rgba(255,255,255,0.04)',
                border: isActive
                  ? '1px solid rgba(99,102,241,0.4)'
                  : '1px solid rgba(255,255,255,0.08)',
                color: isActive ? '#818cf8' : '#64748b',
              }}
            >
              <span className="text-[9px] font-bold uppercase tracking-[0.08em]">{SHORT_DAYS[i]}</span>
              <span
                className="text-[15px] font-bold leading-tight"
                style={{ color: isActive ? '#818cf8' : isToday ? 'var(--color-text)' : 'var(--color-muted)' }}
              >
                {weekDates[i]}
              </span>
              {isToday && (
                <span
                  className="w-1 h-1 rounded-full mt-0.5"
                  style={{ background: '#818cf8' }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Day nav — desktop arrows + centered title; mobile: just centered title */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={() => setSelectedDay(d => Math.max(0, d - 1))}
          className="hidden md:flex w-8 h-8 items-center justify-center rounded-md border border-border bg-panel-alt text-subtle hover:text-text hover:border-border-hi transition-all duration-150"
        >
          <ChevronLeft size={16} />
        </button>

        <div className="text-center flex-1 md:flex-none">
          <h2 className="text-[18px] font-bold tracking-tight" style={{ color: '#e2e8f4' }}>{DAYS[selectedDay]}</h2>
          <div className="text-[11px] mt-0.5 font-mono" style={{ color: '#64748b' }}>
            {list.length} task{list.length !== 1 ? 's' : ''}
            {filter !== 'all' && activeCat ? ` · ${activeCat.label}` : ''}
          </div>
        </div>

        <button
          onClick={() => setSelectedDay(d => Math.min(6, d + 1))}
          className="hidden md:flex w-8 h-8 items-center justify-center rounded-md border border-border bg-panel-alt text-subtle hover:text-text hover:border-border-hi transition-all duration-150"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Conflict banner */}
      {dayConflict && (
        <div className="flex items-center gap-2 bg-danger-surface border border-[rgba(127,29,29,0.5)] rounded-lg px-4 py-2.5 mb-4 text-[12px] text-danger-text">
          <AlertTriangle size={13} strokeWidth={2.5} />
          Time conflict on {DAYS[selectedDay]} — overlapping tasks highlighted below
        </div>
      )}

      {/* Task list */}
      {list.length === 0 ? (
        <EmptyState
          day={DAYS[selectedDay]}
          filterActive={filter !== 'all'}
          activeCat={activeCat}
          onAdd={() => { setEditTarget(null); setModal('addTask'); }}
          onClearFilter={() => {}}
        />
      ) : allDone ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16"
        >
          <div className="text-3xl mb-3 text-success-text">✓</div>
          <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-success-text mb-1">
            All tasks complete
          </div>
          <div className="text-[11px] text-subtle">{DAYS[selectedDay]} cleared</div>
        </motion.div>
      ) : (
        <AnimatePresence initial={false} mode="popLayout">
          {list.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              cat={getCat(task.category)}
              conflict={conflicts.has(task.id)}
              onToggle={() => toggleComplete(task.id)}
              onEdit={() => openEdit(task)}
              onDelete={() => deleteTask(task.id)}
            />
          ))}
        </AnimatePresence>
      )}
    </div>
  );
}

function TaskCard({ task, cat, conflict, onToggle, onEdit, onDelete }) {
  const [hovered, setHovered]     = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);

  const borderLeft = conflict
    ? '#f87171'
    : task.completed
    ? 'var(--color-border)'
    : cat.color;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8, height: 0 }}
      animate={{ opacity: 1, y: 0,  height: 'auto' }}
      exit={{    opacity: 0, x: 16, height: 0 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      className="overflow-hidden"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setConfirmDel(false); }}
    >
      <div
        className="rounded-lg px-4 py-3 mb-2 transition-colors duration-150 cursor-pointer"
        onClick={onEdit}
        style={{
          background: task.completed
            ? 'rgba(255,255,255,0.02)'
            : conflict
            ? 'rgba(239,68,68,0.06)'
            : 'rgba(255,255,255,0.05)',
          border: `1px solid ${conflict ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.08)'}`,
          borderLeft: `3px solid ${borderLeft}`,
          opacity: task.completed ? 0.5 : 1,
        }}
      >
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <motion.button
            onClick={e => { e.stopPropagation(); onToggle(); }}
            whileTap={{ scale: 1.25 }}
            transition={{ type: 'spring', stiffness: 500, damping: 20 }}
            className="mt-0.5 w-4 h-4 rounded flex-shrink-0 flex items-center justify-center border transition-colors duration-150 cursor-pointer"
            style={{
              border: `1px solid ${task.completed ? '#22c55e' : 'var(--color-border-hi)'}`,
              background: task.completed ? '#14532d' : 'transparent',
              color: '#4ade80',
            }}
            aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
          >
            {task.completed && (
              <motion.span
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1,   opacity: 1 }}
                transition={{ duration: 0.12, ease: [0.34, 1.56, 0.64, 1] }}
                className="text-[10px] leading-none font-bold"
              >
                ✓
              </motion.span>
            )}
          </motion.button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Title with animated strikethrough */}
            <div className="relative inline-block max-w-full">
              <span
                className="text-[13px] font-semibold leading-tight block truncate"
                style={{ color: task.completed ? 'var(--color-subtle)' : 'var(--color-text)' }}
              >
                {task.title}
              </span>
              {task.completed && (
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                  className="absolute top-1/2 left-0 right-0 h-px bg-subtle"
                  style={{ transformOrigin: 'left center' }}
                />
              )}
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              <span className="text-[11px] font-mono text-subtle">
                {task.startTime} – {task.endTime}
              </span>
              <Tag color={cat.color} bg={`${cat.color}18`}>
                {cat.icon} {cat.label}
              </Tag>
              {conflict && (
                <Tag color="#f87171" bg="rgba(239,68,68,0.1)" border="rgba(239,68,68,0.35)">
                  <AlertTriangle size={9} strokeWidth={2.5} />
                  Conflict
                </Tag>
              )}
            </div>

            {task.notes && (
              <p className="text-[11px] text-subtle mt-2 leading-relaxed">{task.notes}</p>
            )}
          </div>

          {/* Actions */}
          <motion.div
            className="flex items-center gap-1 flex-shrink-0"
            animate={{ opacity: hovered ? 1 : 0 }}
            transition={{ duration: 0.15 }}
            onClick={e => e.stopPropagation()}
          >
            {confirmDel ? (
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-danger-text font-medium">Delete?</span>
                <Button variant="danger" onClick={onDelete} className="text-[10px] px-2 py-1">
                  Yes
                </Button>
                <Button onClick={() => setConfirmDel(false)} className="text-[10px] px-2 py-1">
                  No
                </Button>
              </div>
            ) : (
              <>
                <motion.button
                  onClick={onEdit}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Edit task"
                  aria-label="Edit task"
                  className="w-7 h-7 flex items-center justify-center rounded-md text-subtle hover:text-accent-text hover:bg-panel-hi border border-transparent hover:border-border transition-all duration-150"
                >
                  <Pencil size={13} />
                </motion.button>
                <motion.button
                  onClick={() => setConfirmDel(true)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Delete task"
                  aria-label="Delete task"
                  className="w-7 h-7 flex items-center justify-center rounded-md text-subtle hover:text-danger-text hover:bg-danger-surface border border-transparent hover:border-[rgba(127,29,29,0.4)] transition-all duration-150"
                >
                  <Trash2 size={13} />
                </motion.button>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

function EmptyState({ day, filterActive, activeCat, onAdd }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="text-center py-20 max-w-xs mx-auto"
    >
      <div className="text-4xl mb-5 opacity-10 select-none">◫</div>

      {filterActive && activeCat ? (
        <>
          <p className="text-[13px] text-muted mb-1">
            No <span style={{ color: activeCat.color }}>{activeCat.icon} {activeCat.label}</span> tasks on {day}
          </p>
          <p className="text-[11px] text-subtle mb-6">Clear the filter to see all tasks</p>
        </>
      ) : (
        <>
          <p className="text-[13px] font-medium text-muted mb-1">{day} is clear</p>
          <p className="text-[11px] text-subtle mb-6 leading-relaxed">
            Add your first task to start building<br />your schedule.
          </p>
        </>
      )}

      <Button variant="primary" onClick={onAdd}>
        + Add Task for {day}
      </Button>

      <p className="mt-4 text-[10px] uppercase tracking-[0.1em] text-disabled">
        Shortcut: press N
      </p>
    </motion.div>
  );
}

function getWeekDates() {
  const now     = new Date();
  const js      = now.getDay(); // 0 = Sun
  const monday  = new Date(now);
  monday.setDate(now.getDate() - (js === 0 ? 6 : js - 1));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.getDate();
  });
}
