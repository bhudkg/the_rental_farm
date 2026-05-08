export default function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  size = 'md',
  className = '',
}) {
  const padding = size === 'sm' ? 'py-12 px-6' : 'py-16 sm:py-20 px-6';

  return (
    <div
      className={
        'relative overflow-hidden rounded-3xl border border-line bg-paper ' +
        `${padding} text-center animate-fade-in-up ` +
        className
      }
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-24 h-48 bg-linear-to-b from-primary/8 via-primary/3 to-transparent blur-2xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-accent/10 blur-3xl"
      />

      {icon && (
        <div className="relative inline-flex items-center justify-center w-16 h-16 mb-4 rounded-2xl bg-cream-dark text-primary ring-1 ring-line shadow-soft animate-zoom-in">
          {icon}
        </div>
      )}

      {title && (
        <h3 className="font-display relative text-2xl font-semibold text-ink mb-1.5">
          {title}
        </h3>
      )}
      {description && (
        <p className="relative text-sm text-ink-muted max-w-sm mx-auto mb-6">
          {description}
        </p>
      )}

      {(action || secondaryAction) && (
        <div className="relative flex flex-col sm:flex-row items-center justify-center gap-2.5">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}
