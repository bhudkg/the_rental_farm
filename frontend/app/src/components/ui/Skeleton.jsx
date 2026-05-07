export function Skeleton({ className = '', rounded = 'rounded-lg', ...rest }) {
  return (
    <div
      className={`shimmer ${rounded} bg-gray-100 ${className}`}
      aria-hidden="true"
      {...rest}
    />
  );
}

export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={i === lines - 1 ? 'h-3 w-2/3' : 'h-3 w-full'}
        />
      ))}
    </div>
  );
}

export function SkeletonTreeCard() {
  return (
    <div
      className="bg-white border border-gray-100 rounded-2xl overflow-hidden"
      aria-hidden="true"
    >
      <Skeleton className="aspect-[4/3] w-full" rounded="rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-8 w-16 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonOrderRow() {
  return (
    <div
      className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl p-5"
      aria-hidden="true"
    >
      <Skeleton className="w-16 h-16 rounded-xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
      <Skeleton className="h-5 w-16" />
    </div>
  );
}

export function SkeletonStat() {
  return (
    <div
      className="bg-white border border-gray-100 rounded-2xl p-5"
      aria-hidden="true"
    >
      <Skeleton className="h-3 w-20 mb-3" />
      <Skeleton className="h-8 w-24" />
    </div>
  );
}

export default Skeleton;
