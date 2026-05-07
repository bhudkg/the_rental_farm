import { Link } from 'react-router-dom';

export default function Breadcrumbs({ items = [], className = '' }) {
  if (!items.length) return null;

  return (
    <nav aria-label="Breadcrumb" className={`text-sm ${className}`}>
      <ol className="flex items-center flex-wrap gap-1 text-gray-500">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={i} className="flex items-center min-w-0">
              {item.to && !isLast ? (
                <Link
                  to={item.to}
                  className="hover:text-primary transition-colors truncate"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={
                    isLast
                      ? 'text-gray-900 font-medium truncate max-w-[60vw] sm:max-w-none'
                      : 'truncate'
                  }
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
              {!isLast && (
                <svg
                  className="w-4 h-4 mx-1 text-gray-300 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
