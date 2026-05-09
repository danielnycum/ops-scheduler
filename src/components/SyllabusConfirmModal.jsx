import { useState } from 'react';
import { CheckCircle2, Calendar, BookOpen, Clock, Weight } from 'lucide-react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { useAppContext } from '../context/AppContext';

export default function SyllabusConfirmModal() {
  const { syllabusItems, importSyllabusTasks, setModal } = useAppContext();
  const [importing, setImporting] = useState(false);

  function onClose() { setModal(null); }

  function handleImport() {
    setImporting(true);
    importSyllabusTasks(syllabusItems);
  }

  return (
    <Modal
      onClose={onClose}
      title={`Review Extracted Tasks — ${syllabusItems.length} found`}
      width={540}
    >
      <p className="text-[12px] text-subtle mb-4 leading-relaxed">
        Clarus extracted the tasks below from your syllabus.
        Click <strong className="text-muted">Import All</strong> to add them to your schedule.
      </p>

      {/* Task list */}
      <div className="max-h-[340px] overflow-y-auto space-y-1.5 mb-5 pr-0.5">
        {syllabusItems.length === 0 && (
          <p className="text-[12px] text-disabled italic px-1 py-4 text-center">
            No tasks were found in this syllabus. Try a different file.
          </p>
        )}

        {syllabusItems.map((item, i) => (
          <div
            key={i}
            className="flex flex-col gap-1.5 px-3.5 py-2.5 rounded-lg border border-border"
            style={{ background: 'rgba(255,255,255,0.025)' }}
          >
            {/* Title row */}
            <div className="flex items-start justify-between gap-2">
              <span className="text-[13px] font-medium text-text leading-snug flex-1">
                {item.taskTitle || '(untitled)'}
              </span>
              {item.gradeWeight > 0 && (
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 font-mono"
                  style={{
                    color: 'var(--teal-light)',
                    background: 'var(--teal-surface)',
                    border: '1px solid var(--teal-border)',
                  }}
                >
                  {item.gradeWeight}%
                </span>
              )}
            </div>

            {/* Meta row */}
            <div className="flex items-center gap-3 flex-wrap">
              {item.courseName && (
                <span className="flex items-center gap-1 text-[10px] text-subtle">
                  <BookOpen size={10} />
                  {item.courseName}
                </span>
              )}
              {item.dueDate && (
                <span className="flex items-center gap-1 text-[10px] text-subtle">
                  <Calendar size={10} />
                  {item.dueDate}
                </span>
              )}
              {item.estimatedHours > 0 && (
                <span className="flex items-center gap-1 text-[10px] text-subtle">
                  <Clock size={10} />
                  {item.estimatedHours}h est.
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 justify-end pt-2 border-t border-border">
        <Button onClick={onClose} disabled={importing}>Cancel</Button>
        <Button
          variant="primary"
          onClick={handleImport}
          disabled={importing || syllabusItems.length === 0}
        >
          <CheckCircle2 size={14} />
          Import All ({syllabusItems.length})
        </Button>
      </div>
    </Modal>
  );
}
