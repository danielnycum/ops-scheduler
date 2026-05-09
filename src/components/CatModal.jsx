import { useState } from 'react';
import { Modal } from './ui/Modal';
import { Field } from './ui/Field';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { useAppContext } from '../context/AppContext';
import { validateCat } from '../lib/validators';
import { uid, sanitize } from '../lib/utils';

export default function CatModal() {
  const { categories, saveCat, setModal } = useAppContext();

  const [f, setF]     = useState({ label: '', color: '#6366f1', icon: '📌' });
  const [errs, setErrs] = useState({});
  const set = k => v => setF(p => ({ ...p, [k]: v }));

  function submit() {
    const e = validateCat(f, categories);
    if (Object.keys(e).length) { setErrs(e); return; }
    saveCat({ id: uid(), label: sanitize(f.label), color: f.color, icon: f.icon || '📌', locked: false });
  }

  return (
    <Modal onClose={() => setModal(null)} title="New Category" width={360}>
      <Field label="Label *" error={errs.label} htmlFor="cat-label">
        <Input
          id="cat-label"
          value={f.label}
          onChange={e => set('label')(e.target.value)}
          placeholder="e.g. Drill Weekend"
          maxLength={40}
          autoFocus
          error={!!errs.label}
          onKeyDown={e => e.key === 'Enter' && submit()}
        />
      </Field>

      <div className="flex gap-3 mb-4">
        <Field label="Emoji" className="flex-1 mb-0" htmlFor="cat-icon">
          <Input
            id="cat-icon"
            value={f.icon}
            onChange={e => set('icon')(e.target.value)}
            placeholder="🎯"
            maxLength={4}
          />
        </Field>
        <Field label="Color" className="flex-1 mb-0">
          <input
            type="color"
            value={f.color}
            onChange={e => set('color')(e.target.value)}
            className="w-full h-9 rounded-md border border-border bg-transparent cursor-pointer p-0.5"
          />
        </Field>
      </div>

      <div className="flex gap-2 justify-end">
        <Button onClick={() => setModal(null)}>Cancel</Button>
        <Button variant="primary" onClick={submit}>Add Category</Button>
      </div>
    </Modal>
  );
}
