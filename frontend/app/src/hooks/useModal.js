import { useEffect } from 'react';

// Locks body scroll, closes on Esc, restores focus to the previously
// focused element on unmount. Pass `enabled` so the modal can be
// conditionally rendered without disabling the hook.
export default function useModal({ open, onClose, closeOnEsc = true } = {}) {
  useEffect(() => {
    if (!open) return undefined;

    const previouslyFocused = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKey = (e) => {
      if (closeOnEsc && e.key === 'Escape' && typeof onClose === 'function') {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener('keydown', handleKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', handleKey);
      if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
        try {
          previouslyFocused.focus({ preventScroll: true });
        } catch {
          /* noop */
        }
      }
    };
  }, [open, onClose, closeOnEsc]);
}
