import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { DAYS } from '../lib/constants';
import { getCategoryById } from '../lib/utils';

function fmtTime(ts) {
  if (!ts) return null;
  return new Date(ts).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function fmtDate(ts, dayIdx) {
  if (ts) {
    return new Date(ts).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  }
  return DAYS[dayIdx];
}

export default function HistoryView() {
  const { tasks, categories } = useAppContext();

  const completed = [...tasks]
    .filter(t => t.completed)
    .sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));

  const groups = [];
  const seen = new Map();

  completed.forEach(t => {
    const label = fmtDate(t.completedAt, t.day);
    if (!seen.has(label)) {
      seen.set(label, { label, ts: t.completedAt || 0, tasks: [] });
      groups.push(seen.get(label));
    }
    seen.get(label).tasks.push(t);
  });

  return (
    <div className="w-full flex flex-col" style={{ minHeight: '100%' }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text)', marginBottom: 4 }}>
          Completed Tasks
        </h2>
        <p style={{ fontSize: 12, color: 'var(--color-subtle)' }}>
          {completed.length} task{completed.length !== 1 ? 's' : ''} completed
        </p>
      </div>

      {completed.length === 0 ? (
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', minHeight: 300,
          color: 'var(--color-subtle)', gap: 12,
        }}>
          <Clock size={32} style={{ opacity: 0.3 }} />
          <p style={{ fontSize: 14 }}>No completed tasks yet</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {groups.map((group, gi) => (
            <motion.div
              key={group.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: gi * 0.04, ease: [0.4, 0, 0.2, 1] }}
            >
              <div style={{
                fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.12em', color: 'var(--teal)',
                marginBottom: 10, paddingBottom: 8,
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <Clock size={11} />
                {group.label}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {group.tasks.map(task => {
                  const cat = getCategoryById(task.category, categories);
                  const time = fmtTime(task.completedAt);
                  return (
                    <div
                      key={task.id}
                      style={{
                        borderRadius: 10,
                        padding: '10px 14px',
                        background: 'var(--surface-1)',
                        border: '1px solid var(--border-subtle)',
                        borderLeft: '3px solid var(--teal)',
                        opacity: 0.75,
                        display: 'flex', alignItems: 'center', gap: 12,
                      }}
                    >
                      <span style={{
                        width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                        background: 'var(--teal)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, fontWeight: 800, color: 'white',
                      }}>
                        ✓
                      </span>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{
                          fontSize: 14, fontWeight: 600,
                          color: 'var(--color-subtle)',
                          textDecoration: 'line-through',
                          display: 'block',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {task.title}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                          {cat && (
                            <span style={{
                              fontSize: 10, fontWeight: 600,
                              padding: '1px 6px', borderRadius: 9999,
                              background: `${cat.color}18`,
                              color: cat.color,
                              border: `1px solid ${cat.color}40`,
                            }}>
                              {cat.icon} {cat.label}
                            </span>
                          )}
                          {time && (
                            <span style={{ fontSize: 10, fontFamily: 'monospace', color: 'var(--color-subtle)' }}>
                              Completed at {time}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
