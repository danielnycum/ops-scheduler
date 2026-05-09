import { useState, useCallback } from 'react';
import { uid } from '../lib/utils';

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts(p => p.filter(t => t.id !== id));
  }, []);

  const push = useCallback((msg, type = "success", onUndo) => {
    const id = uid();
    const duration = onUndo ? 5000 : 3800;
    setToasts(p => [...p.slice(-4), { id, msg, type, onUndo }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), duration);
  }, []);

  return { toasts, push, dismiss };
}
