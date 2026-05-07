import { create } from 'zustand';

let nextId = 1;

const useToastStore = create((set, get) => ({
  toasts: [],

  push: (toast) => {
    const id = nextId++;
    const item = {
      id,
      tone: 'info',
      duration: 3500,
      ...toast,
    };
    set((state) => ({ toasts: [...state.toasts, item] }));
    if (item.duration > 0) {
      setTimeout(() => get().dismiss(id), item.duration);
    }
    return id;
  },

  dismiss: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

  clear: () => set({ toasts: [] }),
}));

// Convenience helpers — import { toast } from this module.
export const toast = {
  success: (message, opts) =>
    useToastStore.getState().push({ tone: 'success', message, ...opts }),
  error: (message, opts) =>
    useToastStore.getState().push({ tone: 'danger', message, ...opts }),
  info: (message, opts) =>
    useToastStore.getState().push({ tone: 'info', message, ...opts }),
  warning: (message, opts) =>
    useToastStore.getState().push({ tone: 'warning', message, ...opts }),
};

export default useToastStore;
