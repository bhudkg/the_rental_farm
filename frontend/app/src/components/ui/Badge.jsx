const TONES = {
  neutral: 'bg-cream-dark text-ink-soft ring-line',
  primary: 'bg-primary-soft text-primary-dark ring-primary/20',
  accent: 'bg-accent-soft text-accent-dark ring-accent/30',
  harvest: 'bg-harvest-soft text-[color:var(--color-harvest)] ring-harvest/30',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  warning: 'bg-amber-50 text-amber-700 ring-amber-200',
  info: 'bg-blue-50 text-blue-700 ring-blue-200',
  danger: 'bg-red-50 text-red-700 ring-red-200',
  muted: 'bg-cream-dark text-ink-muted ring-line',
};

const SIZES = {
  xs: 'text-[10px] px-2 py-0.5',
  sm: 'text-xs px-2.5 py-0.5',
  md: 'text-sm px-3 py-1',
};

export default function Badge({
  tone = 'neutral',
  size = 'sm',
  ring = false,
  dot = false,
  className = '',
  children,
  ...rest
}) {
  const classes = [
    'inline-flex items-center gap-1.5 font-semibold rounded-full capitalize tracking-wide',
    TONES[tone] ?? TONES.neutral,
    SIZES[size] ?? SIZES.sm,
    ring ? 'ring-1' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classes} {...rest}>
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full bg-current opacity-70"
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}
