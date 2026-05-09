import { createContext, useContext } from 'react';
import { useToast } from '../hooks/useToast';
import Toast from '../components/ui/Toast';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const { toasts, push, dismiss } = useToast();
  return (
    <ToastContext.Provider value={{ push, dismiss }}>
      {children}
      <Toast toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToastContext must be inside ToastProvider');
  return ctx;
}
