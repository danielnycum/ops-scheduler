import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, AlertCircle, Loader } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { useAppContext } from '../context/AppContext';

pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://unpkg.com/pdfjs-dist@5.7.284/build/pdf.worker.min.mjs';

const API_BASE = import.meta.env.PROD
  ? 'https://ops-scheduler-production.up.railway.app'
  : 'http://localhost:3001';

async function pdfToText(file) {
  const buffer = await file.arrayBuffer();
  const pdf    = await pdfjsLib.getDocument({ data: buffer }).promise;
  const pages  = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page    = await pdf.getPage(i);
    const content = await page.getTextContent();
    pages.push(content.items.map(item => item.str).join(' '));
  }
  return pages.join('\n');
}

async function fileToText(file) {
  if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
    return pdfToText(file);
  }
  return new Promise((resolve, reject) => {
    const reader  = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

export default function SyllabusModal() {
  const { setModal, setSyllabusItems } = useAppContext();
  const [dragging, setDragging] = useState(false);
  const [status,   setStatus]   = useState('idle'); // idle | loading | error
  const [errMsg,   setErrMsg]   = useState('');
  const fileRef = useRef();

  function onClose() { setModal(null); }

  const processFile = useCallback(async (file) => {
    if (!file) return;
    const name = file.name.toLowerCase();
    if (!name.endsWith('.pdf') && !name.endsWith('.txt')) {
      setStatus('error');
      setErrMsg('Only PDF and .txt files are supported');
      return;
    }

    setStatus('loading');
    setErrMsg('');

    try {
      const text = await fileToText(file);
      console.log('[Clarus] Sending to backend, text length:', text.length);
      const res  = await fetch(`${API_BASE}/api/parse-syllabus`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Server error ${res.status}`);
      setSyllabusItems(data.items ?? []);
      setModal('syllabusConfirm');
    } catch (e) {
      console.error('[Clarus] Syllabus error:', e);
      setStatus('error');
      setErrMsg(e.message || 'Failed to parse syllabus');
    }
  }, [setModal, setSyllabusItems]);

  function onDrop(e) {
    e.preventDefault();
    setDragging(false);
    processFile(e.dataTransfer.files[0]);
  }

  return (
    <Modal onClose={onClose} title="Upload Syllabus" width={460}>
      <p className="text-[12px] text-subtle mb-4 leading-relaxed">
        Upload a course syllabus and Clarus will automatically extract all assignments,
        exams, and deadlines into your schedule.
      </p>

      {/* Drop zone */}
      <div
        className="relative rounded-xl border-2 border-dashed transition-colors duration-150 flex flex-col items-center justify-center gap-3 py-12 px-6 mb-4 select-none"
        style={{
          borderColor: dragging ? 'var(--teal)' : 'var(--border-subtle)',
          background:  dragging ? 'var(--teal-dim-bg)' : 'var(--surface-3)',
          cursor: status === 'loading' ? 'default' : 'pointer',
        }}
        onDragOver={e => { e.preventDefault(); if (status !== 'loading') setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => status !== 'loading' && fileRef.current?.click()}
      >
        {status === 'loading' ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
            >
              <Loader size={28} className="text-accent-text" />
            </motion.div>
            <p className="text-[12px] text-subtle">Extracting text and parsing syllabus…</p>
          </>
        ) : (
          <>
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{
                background: 'var(--teal-surface)',
                color: 'var(--teal-light)',
                boxShadow: '0 0 0 1px var(--teal-border)',
              }}
            >
              <Upload size={24} />
            </div>
            <div className="text-center">
              <p className="text-[13px] font-medium text-text mb-1">
                Drop your syllabus here
              </p>
              <p className="text-[11px] text-disabled">PDF or TXT · click to browse</p>
            </div>
          </>
        )}
      </div>

      {status === 'error' && (
        <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-danger-surface border border-[rgba(239,68,68,0.25)] mb-4">
          <AlertCircle size={13} className="text-danger-text mt-0.5 flex-shrink-0" />
          <span className="text-[12px] text-danger-text leading-snug">{errMsg}</span>
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept=".pdf,.txt,text/plain,application/pdf"
        className="hidden"
        onChange={e => { processFile(e.target.files[0]); e.target.value = ''; }}
      />

      <div className="flex gap-2 justify-end pt-2 border-t border-border">
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="primary"
          onClick={() => fileRef.current?.click()}
          disabled={status === 'loading'}
        >
          <FileText size={13} />
          Browse File
        </Button>
      </div>
    </Modal>
  );
}
