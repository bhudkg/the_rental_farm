import { Link } from 'react-router-dom';
import { Ornament } from './ui';

const COLUMNS = [
  {
    title: 'Browse',
    links: [
      { to: '/trees', label: 'All trees' },
      { to: '/trending', label: 'Trending now' },
      { to: '/wishlist', label: 'My wishlist' },
    ],
  },
  {
    title: 'Account',
    links: [
      { to: '/profile', label: 'My profile' },
      { to: '/orders', label: 'My orders' },
      { to: '/login', label: 'Sign in' },
    ],
  },
  {
    title: 'Hosts',
    links: [
      { to: '/owner', label: 'Become a host' },
      { to: '/owner/trees', label: 'My listings' },
      { to: '/owner/trees/new', label: 'List a tree' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative mt-24 bg-primary text-cream overflow-hidden">
      {/* Decorative blob */}
      <div
        aria-hidden="true"
        className="absolute -top-32 -right-24 w-96 h-96 rounded-full bg-accent/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-32 -left-24 w-96 h-96 rounded-full bg-harvest/10 blur-3xl"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
          {/* Brand block */}
          <div className="lg:col-span-5">
            <Link to="/" className="inline-flex items-center gap-2.5 group">
              <span className="w-10 h-10 rounded-full bg-cream text-primary inline-flex items-center justify-center shadow-sm">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 22V13M12 13c-3.5 0-6-2.5-6-6 0-3 2-5 4-5 1.5 0 2 1 2 2 0-1 .5-2 2-2 2 0 4 2 4 5 0 3.5-2.5 6-6 6z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 22h6" />
                </svg>
              </span>
              <span className="font-display text-2xl font-semibold tracking-tight">
                The Rental Farm
              </span>
            </Link>

            <p className="font-display text-2xl sm:text-[28px] leading-tight font-medium text-cream mt-6 max-w-md">
              Rent the season, <span className="font-display-italic text-gold-foil">not</span> the tree.
            </p>
            <p className="text-sm text-cream/70 mt-3 max-w-md">
              Pay once, receive weekly photo updates of your tree, and get the season's harvest delivered fresh to your door.
            </p>

            <div className="flex items-center gap-3 mt-6">
              <a
                href="#"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full bg-cream/10 hover:bg-cream/20 flex items-center justify-center transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
                </svg>
              </a>
              <a
                href="#"
                aria-label="X"
                className="w-9 h-9 rounded-full bg-cream/10 hover:bg-cream/20 flex items-center justify-center transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2H21l-6.52 7.45L22 22h-6.36l-4.99-6.51L4.8 22H2l7-8L2 2h6.36l4.49 5.97L18.244 2z" />
                </svg>
              </a>
              <a
                href="#"
                aria-label="YouTube"
                className="w-9 h-9 rounded-full bg-cream/10 hover:bg-cream/20 flex items-center justify-center transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.5 6.2a3 3 0 00-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 00.5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 002.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 002.1-2.1c.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8zM9.6 15.6V8.4l6.2 3.6-6.2 3.6z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Link columns */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-6 lg:gap-10">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cream/60 mb-4">
                  {col.title}
                </h3>
                <ul className="space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.to}>
                      <Link
                        to={l.to}
                        className="text-[14px] text-cream/85 hover:text-accent-soft transition-colors"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Gold ornament between sections */}
        <div className="mt-14 mb-8">
          <Ornament tone="cream" size="md" />
        </div>

        {/* Trust strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-cream/85">
          <TrustItem
            label="Verified hosts"
            text="ID-verified farmers"
            icon={<path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />}
          />
          <TrustItem
            label="Weekly updates"
            text="Photos every Sunday"
            icon={<path strokeLinecap="round" strokeLinejoin="round" d="M3 9.75h18M5.25 21h13.5A2.25 2.25 0 0021 18.75v-9A2.25 2.25 0 0018.75 7.5H5.25A2.25 2.25 0 003 9.75v9A2.25 2.25 0 005.25 21z" />}
          />
          <TrustItem
            label="Fresh delivery"
            text="Right to your door"
            icon={<path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-6 0H3.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />}
          />
          <TrustItem
            label="Refund guarantee"
            text="If we miss the yield"
            icon={<path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />}
          />
        </div>

        <div className="mt-10 pt-6 relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-cream/65">
          <span aria-hidden="true" className="absolute left-0 right-0 top-0 h-px rule-gold opacity-70" />
          <p className="tracking-wide">
            © {new Date().getFullYear()} The Rental Farm.
            <span className="mx-2 text-gold-foil">·</span>
            <span className="font-display-italic">Grown in India.</span>
          </p>
          <div className="flex items-center gap-5">
            <a href="#" className="hover:text-cream transition-colors">Terms</a>
            <a href="#" className="hover:text-cream transition-colors">Privacy</a>
            <a href="#" className="hover:text-cream transition-colors">Help</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function TrustItem({ label, text, icon }) {
  return (
    <div className="flex items-start gap-3">
      <span className="shrink-0 w-9 h-9 rounded-full bg-cream/10 flex items-center justify-center">
        <svg className="w-4 h-4 text-accent-soft" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
          {icon}
        </svg>
      </span>
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-[0.16em] text-cream/55 font-semibold">{label}</p>
        <p className="text-sm text-cream mt-0.5">{text}</p>
      </div>
    </div>
  );
}
