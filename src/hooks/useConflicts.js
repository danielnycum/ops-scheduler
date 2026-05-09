import { useMemo } from 'react';
import { findConflicts } from '../lib/validators';

export function useConflicts(tasks) {
  return useMemo(() => findConflicts(tasks), [tasks]);
}
