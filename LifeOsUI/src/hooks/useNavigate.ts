// Simple in-app navigation hook using a global page state
// Avoids adding react-router to keep deps minimal
import { useContext } from 'react';
import { NavContext } from '../context/NavContext';
export { NavContext } from '../context/NavContext';
export { NavProvider } from '../context/NavContext';
export type { Page } from '../context/NavContext';

export function useNavigate() {
  const ctx = useContext(NavContext);
  if (!ctx) throw new Error('useNavigate must be used inside NavProvider');
  return ctx;
}
