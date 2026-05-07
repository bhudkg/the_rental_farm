import { forwardRef } from 'react';
import { Link } from 'react-router-dom';

const VARIANTS = {
  primary:
    'bg-primary text-white hover:bg-primary-dark active:bg-primary-dark shadow-sm hover:shadow-md focus-visible:ring-primary/40',
  gradient:
    'bg-linear-to-r from-primary to-emerald-600 text-white hover:brightness-105 shadow-md hover:shadow-lg focus-visible:ring-primary/40',
  secondary:
    'bg-white text-gray-800 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 focus-visible:ring-gray-300',
  ghost:
    'bg-transparent text-gray-700 hover:bg-gray-100 focus-visible:ring-gray-300',
  outline:
    'bg-transparent text-primary border border-primary/40 hover:bg-primary/5 hover:border-primary focus-visible:ring-primary/30',
  danger:
    'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500/40 shadow-sm',
  subtle:
    'bg-primary/10 text-primary hover:bg-primary/15 focus-visible:ring-primary/30',
};

const SIZES = {
  xs: 'h-8 px-3 text-xs gap-1.5',
  sm: 'h-9 px-3.5 text-sm gap-1.5',
  md: 'h-11 px-5 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
};

const BASE =
  'inline-flex items-center justify-center font-semibold rounded-xl ' +
  'transition-all duration-200 ease-out ' +
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white ' +
  'disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none ' +
  'select-none whitespace-nowrap';

const Spinner = () => (
  <svg
    className="w-4 h-4 animate-spin"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
    <path
      fill="currentColor"
      className="opacity-90"
      d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z"
    />
  </svg>
);

const Button = forwardRef(function Button(
  {
    as,
    to,
    href,
    type = 'button',
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    loading = false,
    disabled = false,
    leftIcon,
    rightIcon,
    className = '',
    children,
    ...rest
  },
  ref,
) {
  const classes = [
    BASE,
    VARIANTS[variant] ?? VARIANTS.primary,
    SIZES[size] ?? SIZES.md,
    fullWidth ? 'w-full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      {loading ? <Spinner /> : leftIcon}
      <span className="inline-flex items-center">{children}</span>
      {!loading && rightIcon}
    </>
  );

  const isDisabled = disabled || loading;

  if (to) {
    return (
      <Link
        ref={ref}
        to={to}
        aria-disabled={isDisabled || undefined}
        tabIndex={isDisabled ? -1 : undefined}
        className={classes}
        {...rest}
      >
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a ref={ref} href={href} className={classes} {...rest}>
        {content}
      </a>
    );
  }

  const Tag = as || 'button';
  return (
    <Tag
      ref={ref}
      type={Tag === 'button' ? type : undefined}
      disabled={Tag === 'button' ? isDisabled : undefined}
      aria-busy={loading || undefined}
      className={classes}
      {...rest}
    >
      {content}
    </Tag>
  );
});

export default Button;
