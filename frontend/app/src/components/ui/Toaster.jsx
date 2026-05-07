import useToastStore from './toastStore';

const TONE_STYLES = {
  success: {
    bar: 'bg-emerald-500',
    icon: 'text-emerald-500 bg-emerald-50',
    path: 'M5 13l4 4L19 7',
  },
  danger: {
    bar: 'bg-red-500',
    icon: 'text-red-500 bg-red-50',
    path: 'M6 18L18 6M6 6l12 12',
  },
  warning: {
    bar: 'bg-amber-500',
    icon: 'text-amber-500 bg-amber-50',
    path: 'M12 9v3.75m0 3.75h.008M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  info: {
    bar: 'bg-blue-500',
    icon: 'text-blue-500 bg-blue-50',
    path: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
};

export default function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  if (toasts.length === 0) return null;

  return (
    <div
      role="region"
      aria-label="Notifications"
      className="fixed z-[100] inset-x-0 top-4 sm:top-6 sm:right-6 sm:left-auto flex flex-col items-center sm:items-end gap-2 px-4 pointer-events-none"
    >
      {toasts.map((t) => {
        const style = TONE_STYLES[t.tone] ?? TONE_STYLES.info;
        return (
          <div
            key={t.id}
            role="status"
            aria-live="polite"
            className="pointer-events-auto w-full sm:w-auto sm:min-w-[300px] max-w-md bg-white shadow-lg ring-1 ring-gray-200/80 rounded-xl overflow-hidden flex items-stretch animate-slide-in-up"
          >
            <div className={`w-1 ${style.bar}`} aria-hidden="true" />
            <div className="flex items-start gap-3 px-4 py-3 flex-1">
              <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${style.icon}`}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={style.path} />
                </svg>
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                {t.title && (
                  <p className="text-sm font-semibold text-gray-900 mb-0.5">{t.title}</p>
                )}
                <p className="text-sm text-gray-600">{t.message}</p>
              </div>
              <button
                onClick={() => dismiss(t.id)}
                className="shrink-0 p-1 -mr-1 text-gray-400 hover:text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
                aria-label="Dismiss notification"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
