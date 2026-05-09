import { useState, useEffect, useCallback } from 'react';
import { DataLayer } from '../lib/dataLayer';

export function useAsyncStorage(key, fallback, shared = false) {
  const [state, setState] = useState(fallback);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const val = shared ? await DataLayer.getShared(key) : await DataLayer.get(key);
      if (val !== null) setState(val);
      setReady(true);
    })();
  }, [key, shared]);

  const set = useCallback(async (updater) => {
    setState(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      if (shared) DataLayer.setShared(key, next).catch(() => {});
      else        DataLayer.set(key, next).catch(() => {});
      return next;
    });
  }, [key, shared]);

  return [state, set, ready];
}
