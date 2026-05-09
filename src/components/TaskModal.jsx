import { useState } from 'react';
import { Modal } from './ui/Modal';
import { Field } from './ui/Field';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Button } from './ui/Button';
import { useAppContext } from '../context/AppContext';
import { DAYS } from '../lib/constants';
import { validateTask } from '../lib/validators';
import { sanitize, toMin } from '../lib/utils';

export default function TaskModal() {
  const { courses, tasks, editTarget, editInitial, blankTask, saveTask, setModal, setEditTarget } = useAppContext();

  const initial = editTarget ? editInitial : blankTask();
  const [f, setF]     = useState(initial);
  const [errs, setErrs] = useState({});

  const set = k => v => setF(p => ({ ...p, [k]: v }));

  const durationMin = toMin(f.endTime) - toMin(f.startTime);
  const durationLabel = durationMin > 0
    ? `${Math.floor(durationMin/60)}h${durationMin%60>0?` ${durationMin%60}m`:''}`.trim()
    : null;

  function submit() {
    const e = validateTask(f, tasks, editTarget);
    if (f.gradeWeight !== '' && (isNaN(+f.gradeWeight) || +f.gradeWeight < 0 || +f.gradeWeight > 100)) {
      e.gradeWeight = 'Enter 0–100';
    }
    if (f.estimatedHours !== '' && (isNaN(+f.estimatedHours) || +f.estimatedHours < 0)) {
      e.estimatedHours = 'Enter a positive number';
    }
    if (Object.keys(e).length) { setErrs(e); return; }
    saveTask({
      ...f,
      title:          sanitize(f.title),
      notes:          sanitize(f.notes),
      gradeWeight:    f.gradeWeight === '' ? null : +f.gradeWeight,
      estimatedHours: f.estimatedHours === '' ? null : +f.estimatedHours,
      dueDate:        f.dueDate || null,
    }, editTarget || null);
  }

  function onClose() { setModal(null); setEditTarget(null); }

  return (
    <Modal onClose={onClose} title={editTarget ? 'Edit Task' : 'New Task'}>
      <Field label="Title *" error={errs.title} htmlFor="task-title">
        <Input
          id="task-title"
          value={f.title}
          onChange={e => set('title')(e.target.value)}
          placeholder="e.g. Chapter 7 homework"
          maxLength={120}
          autoFocus
          error={!!errs.title}
          onKeyDown={e => e.key === 'Enter' && submit()}
        />
      </Field>

      <div className="flex gap-3 mb-3">
        <Field label="Day" className="flex-1 mb-0" htmlFor="task-day">
          <Select id="task-day" value={f.day} onChange={e => set('day')(+e.target.value)}>
            {DAYS.map((d,i) => <option key={d} value={i}>{d}</option>)}
          </Select>
        </Field>
        <Field label="Course" className="flex-1 mb-0" htmlFor="task-course">
          <Select
            id="task-course"
            value={f.category}
            onChange={e => set('category')(e.target.value)}
            disabled={courses.length === 0}
          >
            {courses.length === 0
              ? <option value="">Add a course first</option>
              : courses.map(c => <option key={c.id} value={c.id}>{c.label}</option>)
            }
          </Select>
        </Field>
      </div>

      <div className="flex gap-3 mb-3 items-end">
        <Field label="Start *" error={errs.time} className="flex-1 mb-0" htmlFor="task-start">
          <Input
            id="task-start"
            type="time"
            value={f.startTime}
            onChange={e => set('startTime')(e.target.value)}
            error={!!errs.time}
          />
        </Field>
        <Field label="End *" className="flex-1 mb-0" htmlFor="task-end">
          <Input
            id="task-end"
            type="time"
            value={f.endTime}
            onChange={e => set('endTime')(e.target.value)}
            error={!!errs.time}
          />
        </Field>
        {durationLabel && (
          <div className="text-[11px] font-mono text-subtle pb-2 flex-shrink-0">{durationLabel}</div>
        )}
      </div>

      {errs.time && (
        <p className="-mt-2 mb-3 text-[11px] text-danger-text">{errs.time}</p>
      )}

      <div className="flex gap-3 mb-3">
        <Field label="Due Date" className="flex-1 mb-0" htmlFor="task-due">
          <Input
            id="task-due"
            type="date"
            value={f.dueDate || ''}
            onChange={e => set('dueDate')(e.target.value)}
          />
        </Field>
        <Field label="Grade Weight %" error={errs.gradeWeight} className="w-32 mb-0" htmlFor="task-gw">
          <Input
            id="task-gw"
            value={f.gradeWeight ?? ''}
            onChange={e => set('gradeWeight')(e.target.value)}
            placeholder="0–100"
            maxLength={5}
            error={!!errs.gradeWeight}
          />
        </Field>
        <Field label="Est. Hours" error={errs.estimatedHours} className="w-28 mb-0" htmlFor="task-hours">
          <Input
            id="task-hours"
            value={f.estimatedHours ?? ''}
            onChange={e => set('estimatedHours')(e.target.value)}
            placeholder="e.g. 2"
            maxLength={4}
            error={!!errs.estimatedHours}
          />
        </Field>
      </div>

      <Field label="Notes" htmlFor="task-notes">
        <Input
          id="task-notes"
          value={f.notes}
          onChange={e => set('notes')(e.target.value)}
          placeholder="Optional details…"
          maxLength={200}
        />
      </Field>

      <div className="flex gap-2 justify-end pt-1">
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={submit}>
          {editTarget ? 'Save Changes' : 'Add Task'}
        </Button>
      </div>
    </Modal>
  );
}
