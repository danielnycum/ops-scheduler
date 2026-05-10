import { toMin } from './utils';

export function findConflicts(tasks) {
  const ids = new Set();
  const byDay = {};
  // Skip all-day tasks — they have no specific time slot and can't conflict
  tasks.filter(t => !t.allDay).forEach(t => (byDay[t.day] = byDay[t.day] || []).push(t));
  Object.values(byDay).forEach(group => {
    const sorted = [...group].sort((a,b) => toMin(a.startTime) - toMin(b.startTime));
    for (let i = 0; i < sorted.length; i++) {
      for (let j = i+1; j < sorted.length; j++) {
        const [a,b] = [sorted[i], sorted[j]];
        if (toMin(a.startTime) < toMin(b.endTime) && toMin(a.endTime) > toMin(b.startTime)) {
          ids.add(a.id); ids.add(b.id);
        }
      }
    }
  });
  return ids;
}

export function validateTask(f, tasks, editId) {
  const errs = {};
  if (!f.title.trim())               errs.title = "Title required";
  else if (f.title.trim().length > 120) errs.title = "Max 120 chars";
  if (toMin(f.startTime) >= toMin(f.endTime)) errs.time = "End must be after start";
  return errs;
}

export function validateCat(f, cats) {
  const errs = {};
  if (!f.label.trim())               errs.label = "Label required";
  else if (f.label.trim().length > 40) errs.label = "Max 40 chars";
  else if (cats.find(c => c.label.toLowerCase() === f.label.trim().toLowerCase()))
    errs.label = "Already exists";
  return errs;
}
