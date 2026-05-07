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
        'relative overflow-hidden rounded-2xl border border-dashed border-gray-200 ' +
        'bg-gradient-to-b from-gray-50/80 to-white ' +
        `${padding} text-center animate-fade-in-up ` +
        className
      }
    >
      {/* Soft glow accent */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-24 h-48 bg-gradient-to-b from-primary/8 to-transparent blur-2xl"
      />

      {icon && (
        <div className="relative inline-flex items-center justify-center w-16 h-16 mb-4 rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 text-primary animate-zoom-in">
          {icon}
        </div>
      )}

      {title && (
        <h3 className="relative text-lg font-semibold text-gray-900 mb-1">
          {title}
        </h3>
      )}
      {description && (
        <p className="relative text-sm text-gray-500 max-w-sm mx-auto mb-6">
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
