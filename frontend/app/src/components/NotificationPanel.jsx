import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../services/api';

/* Type → tone (matches our shared color palette). */
const TYPE_META = {
  new_update: {
    tone: 'primary',
    label: 'Tree update',
    path: 'M3 9.75h18M5.25 21h13.5A2.25 2.25 0 0021 18.75v-9A2.25 2.25 0 0018.75 7.5H5.25A2.25 2.25 0 003 9.75v9A2.25 2.25 0 005.25 21z',
  },
  status_change: {
    tone: 'gold',
    label: 'Order status',
    path: 'M12 6v6l4 2',
  },
  update_reminder: {
    tone: 'accent',
    label: 'Reminder',
    path: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z',
  },
  rating_penalty: {
    tone: 'danger',
    label: 'Rating',
    path: 'M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z',
  },
};

const TONE_STYLES = {
  primary: {
    bg: 'bg-primary-soft',
    text: 'text-primary',
    ring: 'ring-primary/20',
  },
  gold: {
    bg: 'bg-[color:var(--color-gold-soft)]',
    text: 'text-[color:var(--color-gold-deep)]',
    ring: 'ring-[color:var(--color-gold)]/30',
  },
  accent: {
    bg: 'bg-accent-soft',
    text: 'text-accent-dark',
    ring: 'ring-accent/25',
  },
  danger: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    ring: 'ring-red-200',
  },
};

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}
function startOfYesterday() {
  return startOfToday() - 86400000;
}

export default function NotificationPanel({ onClose, onCountChange }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = useCallback(() => {
    fetchNotifications()
      .then(setNotifications)
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.is_read).length,
    [notifications],
  );

  const groups = useMemo(() => {
    const today = [];
    const yesterday = [];
    const earlier = [];
    const todayStart = startOfToday();
    const yesterdayStart = startOfYesterday();
    notifications.forEach((n) => {
      const t = new Date(n.created_at).getTime();
      if (t >= todayStart) today.push(n);
      else if (t >= yesterdayStart) yesterday.push(n);
      else earlier.push(n);
    });
    return [
      { label: 'Today', items: today },
      { label: 'Yesterday', items: yesterday },
      { label: 'Earlier', items: earlier },
    ].filter((g) => g.items.length > 0);
  }, [notifications]);

  const handleClick = async (notif) => {
    if (!notif.is_read) {
      await markNotificationRead(notif.id).catch(() => {});
      onCountChange?.();
    }
    onClose();
    if (notif.order_id) navigate(`/orders/${notif.order_id}`);
  };

  const handleMarkAll = async () => {
    if (unreadCount === 0) return;
    await markAllNotificationsRead().catch(() => {});
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    onCountChange?.();
  };

  return (
    <div
      role="dialog"
      aria-label="Notifications"
      className="absolute right-0 top-full mt-2 w-[min(94vw,26rem)] max-h-[78vh] bg-cream rounded-3xl shadow-pop ring-1 ring-line overflow-hidden z-50 animate-fade-in-up flex flex-col"
    >
      {/* Gold hairline at top */}
      <span aria-hidden="true" className="absolute left-6 right-6 top-0 h-px rule-gold" />

      {/* Header */}
      <div className="px-5 py-4 bg-paper border-b border-line">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] font-semibold text-gold-foil">
              Correspondence
            </p>
            <h3 className="font-display text-xl font-semibold text-ink leading-tight mt-0.5">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-accent text-cream text-[10px] font-bold align-middle">
                  {unreadCount}
                </span>
              )}
            </h3>
          </div>

          <button
            onClick={handleMarkAll}
            disabled={unreadCount === 0}
            className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary hover:text-primary-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Mark all read
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 space-y-3" aria-hidden="true">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-10 h-10 shimmer rounded-full" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-3 w-1/2 shimmer rounded" />
                  <div className="h-3 w-3/4 shimmer rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="px-2 pb-3">
            {groups.map((group, gi) => (
              <section key={group.label}>
                <div className="px-4 pt-4 pb-2 flex items-center gap-3">
                  <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-ink-muted">
                    {group.label}
                  </p>
                  <span className="flex-1 h-px bg-line" />
                </div>
                <ul>
                  {group.items.map((notif) => (
                    <NotifRow
                      key={notif.id}
                      notif={notif}
                      onClick={() => handleClick(notif)}
                    />
                  ))}
                </ul>
                {gi < groups.length - 1 && <div className="h-1" />}
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── A single row ───────────────────────────────────── */

function NotifRow({ notif, onClick }) {
  const meta = TYPE_META[notif.type] || TYPE_META.status_change;
  const tone = TONE_STYLES[meta.tone];

  return (
    <li>
      <button
        onClick={onClick}
        className={`w-full text-left px-3 py-3 flex items-start gap-3 rounded-2xl transition-colors hover:bg-paper focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
          !notif.is_read ? 'bg-paper/70' : ''
        }`}
      >
        <span
          className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ring-1 ${tone.bg} ${tone.text} ${tone.ring}`}
          aria-hidden="true"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d={meta.path} />
          </svg>
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-[10px] uppercase tracking-[0.16em] font-semibold text-ink-muted">
              {meta.label}
            </p>
            <span className="text-ink-muted text-[10px]">·</span>
            <p className="text-[11px] text-ink-muted font-medium">
              {timeAgo(notif.created_at)}
            </p>
          </div>
          <p className={`text-sm ${!notif.is_read ? 'font-semibold text-ink' : 'text-ink-soft'}`}>
            {notif.title}
          </p>
          {notif.message && (
            <p className="text-[13px] text-ink-muted mt-0.5 line-clamp-2 leading-snug">
              {notif.message}
            </p>
          )}
        </div>

        {!notif.is_read && (
          <span
            className="shrink-0 mt-1.5 w-2 h-2 rounded-full"
            style={{ background: 'var(--color-accent)' }}
            aria-label="Unread"
          />
        )}
      </button>
    </li>
  );
}

/* ─── Empty state ────────────────────────────────────── */

function EmptyState() {
  return (
    <div className="px-6 py-14 text-center">
      <span
        aria-hidden="true"
        className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-paper ring-1 ring-line text-primary mb-4"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
      </span>
      <p className="text-[10px] uppercase tracking-[0.24em] font-semibold text-gold-foil mb-1.5">
        All clear
      </p>
      <p className="font-display text-lg font-semibold text-ink">
        No new dispatches.
      </p>
      <p className="text-sm text-ink-muted mt-1">
        We'll write when your tree has news.
      </p>
    </div>
  );
}
