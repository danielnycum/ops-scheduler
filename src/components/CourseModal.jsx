import { useState } from 'react';
import { GraduationCap, Palette } from 'lucide-react';
import { Modal } from './ui/Modal';
import { Field } from './ui/Field';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { useAppContext } from '../context/AppContext';
import { COURSE_COLORS, gradeLabel } from '../lib/constants';
import { sanitize } from '../lib/utils';

export default function CourseModal() {
  const { categories, courses, saveCourse, courseEditTarget, courseEditInitial, setModal, setCourseEditTarget } = useAppContext();

  const isEdit    = Boolean(courseEditTarget);
  const autoColor = COURSE_COLORS[courses.length % COURSE_COLORS.length];

  const [f, setF] = useState(() => isEdit && courseEditInitial ? {
    name:      courseEditInitial.label,
    professor: courseEditInitial.professor || '',
    grade:     courseEditInitial.grade !== null && courseEditInitial.grade !== undefined
                 ? String(courseEditInitial.grade)
                 : '',
    color:     courseEditInitial.color,
  } : {
    name:      '',
    professor: '',
    grade:     '',
    color:     autoColor,
  });

  const [errs, setErrs] = useState({});
  const set = k => v => setF(p => ({ ...p, [k]: v }));

  const gl = f.grade !== '' && !isNaN(+f.grade) ? gradeLabel(+f.grade) : null;

  function submit() {
    const e = {};
    if (!f.name.trim()) {
      e.name = 'Course name required';
    } else {
      const conflict = categories.find(c =>
        c.label.toLowerCase() === f.name.trim().toLowerCase() &&
        c.id !== courseEditTarget
      );
      if (conflict) e.name = 'A course or category with this name already exists';
    }
    if (f.grade !== '' && (isNaN(+f.grade) || +f.grade < 0 || +f.grade > 100)) {
      e.grade = 'Enter a number between 0 and 100';
    }
    if (Object.keys(e).length) { setErrs(e); return; }

    saveCourse(
      {
        name:      f.name.trim(),
        professor: f.professor.trim(),
        grade:     f.grade === '' ? null : +f.grade,
        color:     f.color,
      },
      courseEditTarget || null
    );
  }

  function onClose() {
    setModal(null);
    setCourseEditTarget(null);
  }

  return (
    <Modal onClose={onClose} title={isEdit ? 'Edit Course' : 'Add Course'} width={420}>

      {/* Color picker row */}
      <div className="flex items-center gap-3 mb-5 p-3 rounded-xl border border-border" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg"
          style={{
            background: `linear-gradient(135deg, ${f.color}dd 0%, ${f.color}88 100%)`,
            boxShadow: `0 4px 12px ${f.color}44`,
          }}
        >
          <GraduationCap size={18} className="text-white" strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[12px] font-semibold text-text truncate">
            {f.name.trim() || 'Course name'}
          </div>
          {f.professor && (
            <div className="text-[11px] text-subtle truncate">{f.professor}</div>
          )}
        </div>
        {gl && (
          <div
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[12px] font-bold"
            style={{ background: `${gl.color}18`, color: gl.color, border: `1px solid ${gl.color}30` }}
          >
            {gl.letter}
            <span className="font-normal text-[11px] opacity-70">{f.grade}%</span>
          </div>
        )}
      </div>

      {/* Course name */}
      <Field label="Course Name *" error={errs.name} htmlFor="course-name">
        <Input
          id="course-name"
          value={f.name}
          onChange={e => set('name')(e.target.value)}
          placeholder="e.g. Accounting 301"
          maxLength={80}
          autoFocus
          error={!!errs.name}
          onKeyDown={e => e.key === 'Enter' && submit()}
        />
      </Field>

      <div className="flex gap-3 mb-3">
        {/* Professor */}
        <Field label="Professor" className="flex-1 mb-0" htmlFor="course-prof">
          <Input
            id="course-prof"
            value={f.professor}
            onChange={e => set('professor')(e.target.value)}
            placeholder="e.g. Dr. Smith"
            maxLength={60}
          />
        </Field>

        {/* Grade */}
        <Field label="Current Grade %" error={errs.grade} className="w-32 mb-0" htmlFor="course-grade">
          <div className="relative">
            <Input
              id="course-grade"
              value={f.grade}
              onChange={e => set('grade')(e.target.value)}
              placeholder="0–100"
              maxLength={5}
              error={!!errs.grade}
              style={{ paddingRight: gl ? '2.25rem' : undefined }}
            />
            {gl && (
              <span
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold pointer-events-none"
                style={{ color: gl.color }}
              >
                {gl.letter}
              </span>
            )}
          </div>
        </Field>
      </div>

      {/* Color swatches */}
      <Field label="Color">
        <div className="flex items-center gap-1.5 flex-wrap">
          {COURSE_COLORS.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => set('color')(c)}
              title={c}
              className="w-6 h-6 rounded-md transition-all duration-150 flex-shrink-0"
              style={{
                background: c,
                outline: f.color === c ? `2px solid ${c}` : '2px solid transparent',
                outlineOffset: '2px',
                transform: f.color === c ? 'scale(1.2)' : 'scale(1)',
                boxShadow: f.color === c ? `0 0 8px ${c}66` : 'none',
              }}
            />
          ))}
          {/* Custom color input */}
          <label
            className="w-6 h-6 rounded-md flex items-center justify-center border border-dashed border-border cursor-pointer hover:border-border-hi transition-colors relative overflow-hidden"
            title="Custom color"
          >
            <Palette size={12} className="text-subtle" />
            <input
              type="color"
              value={f.color}
              onChange={e => set('color')(e.target.value)}
              className="absolute opacity-0 w-full h-full cursor-pointer"
            />
          </label>
        </div>
      </Field>

      <div className="flex gap-2 justify-end pt-2 border-t border-border mt-2">
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={submit}>
          {isEdit ? 'Save Changes' : 'Add Course'}
        </Button>
      </div>
    </Modal>
  );
}
