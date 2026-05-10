import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Pencil, Trash2, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
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
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const dayConflict = list.some(t => conflicts.has(t.id));
  const allDone     = list.length > 0 && list.every(t => t.completed);

  const activeCat = filter !== 'all' ? getCat(filter) : null;
  const today     = todayIdx();
  const weekDates = getWeekDates();

  return (
    <div className="max-w-2xl mx-auto w-full" style={{ minHeight: '100%' }}>
      {/* Back to week — desktop only */}
      <button
        onClick={() => setView('weekly')}
        className="hidden md:flex items-center gap-1.5 text-[11px] text-subtle hover:text-muted transition-colors mb-4 group"
      >
        <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform duration-150" />
        Week view
      </button>

      {/* Mobile day picker */}
      <div className="flex md:hidden overflow-x-auto gap-1 mb-4 pb-0.5">
        {DAYS.map((day, i) => {
          const isActive = i === selectedDay;
          const isToday  = i === today;
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(i)}
              className="flex-shrink-0 flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-150 min-w-[3rem]"
              style={{
                background: isActive ? 'rgba(20,184,166,0.15)' : 'var(--surface-1)',
                border: isActive ? '1px solid rgba(20,184,166,0.4)' : '1px solid var(--border-subtle)',
                color: isActive ? 'var(--teal)' : 'var(--color-subtle)',
              }}
            >
              <span className="text-[9px] font-bold uppercase tracking-[0.08em]">{SHORT_DAYS[i]}</span>
              <span
                className="text-[15px] font-bold leading-tight"
                style={{ color: isActive ? 'var(--teal)' : isToday ? 'var(--color-text)' : 'var(--color-muted)' }}
              >
                {weekDates[i]}
              </span>
              {isToday && (
                <span className="w-1 h-1 rounded-full mt-0.5" style={{ background: 'var(--teal)' }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Day nav */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={() => setSelectedDay(d => Math.max(0, d - 1))}
          className="hidden md:flex w-8 h-8 items-center justify-center rounded-md border border-border bg-panel-alt text-subtle hover:text-text hover:border-border-hi transition-all duration-150"
        >
          <ChevronLeft size={16} />
        </button>

        <div className="text-center flex-1 md:flex-none">
          <h2 className="text-[18px] font-bold tracking-tight text-text">{DAYS[selectedDay]}</h2>
          <div className="text-[11px] mt-0.5 font-mono text-subtle">
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
  const [hovered, setHovered]       = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);

  const borderColor = conflict ? '#f87171' : task.completed ? 'var(--border-subtle)' : 'var(--teal)';

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
        onClick={onEdit}
        style={{
          borderRadius: 12,
          padding: '12px 16px',
          marginBottom: 10,
          background: conflict
            ? 'rgba(239,68,68,0.04)'
            : task.completed
            ? 'var(--surface-3)'
            : 'var(--surface-1)',
          border: '1px solid var(--border-subtle)',
          borderLeft: `3px solid ${borderColor}`,
          opacity: task.completed ? 0.6 : 1,
          cursor: 'pointer',
          transition: 'border-color 0.15s, background 0.15s',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>

          {/* Checkbox — teal rounded square */}
          <motion.button
            onClick={e => { e.stopPropagation(); onToggle(); }}
            whileTap={{ scale: 1.2 }}
            transition={{ type: 'spring', stiffness: 500, damping: 20 }}
            aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
            style={{
              width: 20, height: 20, borderRadius: 6, flexShrink: 0, marginTop: 2,
              border: task.completed ? 'none' : `2px solid ${conflict ? '#f87171' : 'var(--teal)'}`,
              background: task.completed ? 'var(--teal)' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            {task.completed && (
              <motion.span
                initial={{ scale: 0.3, opacity: 0 }}
                animate={{ scale: 1,   opacity: 1 }}
                transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
                style={{ color: 'white', fontSize: 11, fontWeight: 800, lineHeight: 1 }}
              >
                ✓
              </motion.span>
            )}
          </motion.button>

          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>

            {/* Title with strikethrough on complete */}
            <div style={{ position: 'relative', display: 'inline-block', maxWidth: '100%' }}>
              <span style={{
                fontSize: 15, fontWeight: 700, lineHeight: 1.3,
                color: task.completed ? 'var(--color-subtle)' : 'var(--color-text)',
                display: 'block',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {task.title}
              </span>
              {task.completed && (
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                  style={{
                    position: 'absolute', top: '50%', left: 0, right: 0,
                    height: 1, background: 'var(--color-subtle)',
                    transformOrigin: 'left center',
                  }}
                />
              )}
            </div>

            {/* Time + badges */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginTop: 5 }}>
              <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--color-subtle)' }}>
                {task.allDay ? 'All day' : `${task.startTime} – ${task.endTime}`}
              </span>

              {/* Course badge */}
              <span style={{
                fontSize: 10, fontWeight: 600,
                padding: '2px 7px', borderRadius: 9999,
                background: `${cat.color}18`,
                color: cat.color,
                border: `1px solid ${cat.color}40`,
              }}>
                {cat.icon} {cat.label}
              </span>

              {/* Conflict pill */}
              {conflict && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 3,
                  fontSize: 10, fontWeight: 700,
                  padding: '2px 7px', borderRadius: 9999,
                  background: 'rgba(239,68,68,0.12)',
                  border: '1px solid rgba(239,68,68,0.35)',
                  color: '#f87171',
                }}>
                  ⚠ Conflict
                </span>
              )}
            </div>

            {task.notes && (
              <p style={{ fontSize: 11, color: 'var(--color-subtle)', marginTop: 7, lineHeight: 1.5 }}>
                {task.notes}
              </p>
            )}
          </div>

          {/* Action buttons */}
          <motion.div
            animate={{ opacity: hovered ? 1 : 0 }}
            transition={{ duration: 0.15 }}
            onClick={e => e.stopPropagation()}
            style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}
          >
            {confirmDel ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 10, color: '#f87171', fontWeight: 600 }}>Delete?</span>
                <Button variant="danger" onClick={onDelete} className="text-[10px] px-2 py-1">Yes</Button>
                <Button onClick={() => setConfirmDel(false)} className="text-[10px] px-2 py-1">No</Button>
              </div>
            ) : (
              <>
                <motion.button
                  onClick={onEdit}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Edit task"
                  style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: 'none', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--color-subtle)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--teal)'; e.currentTarget.style.background = 'var(--teal-surface)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-subtle)'; e.currentTarget.style.background = 'none'; }}
                >
                  <Pencil size={13} />
                </motion.button>
                <motion.button
                  onClick={() => setConfirmDel(true)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Delete task"
                  style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: 'none', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--color-subtle)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-subtle)'; e.currentTarget.style.background = 'none'; }}
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
