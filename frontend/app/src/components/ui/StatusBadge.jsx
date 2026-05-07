import Badge from './Badge';

// Single source of truth for order/booking statuses across the app.
// Tones map to Badge tones — keep keys lowercase.
const STATUS_TONE = {
  pending: 'warning',
  confirmed: 'info',
  active: 'success',
  in_transit: 'info',
  planted: 'success',
  growing: 'success',
  harvested: 'primary',
  delivered: 'success',
  completed: 'muted',
  cancelled: 'danger',
  failed: 'danger',
};

const STATUS_LABEL = {
  pending: 'Booked',
  confirmed: 'Confirmed',
  active: 'Active',
  in_transit: 'In transit',
  planted: 'Planted',
  growing: 'Growing',
  harvested: 'Harvested',
  delivered: 'Delivered',
  completed: 'Completed',
  cancelled: 'Cancelled',
  failed: 'Failed',
};

export default function StatusBadge({ status, size = 'sm', dot = true, className = '' }) {
  const key = (status || '').toLowerCase();
  const tone = STATUS_TONE[key] ?? 'neutral';
  const label = STATUS_LABEL[key] ?? status ?? '—';

  return (
    <Badge tone={tone} size={size} dot={dot} ring className={className}>
      {label}
    </Badge>
  );
}

export { STATUS_TONE, STATUS_LABEL };
