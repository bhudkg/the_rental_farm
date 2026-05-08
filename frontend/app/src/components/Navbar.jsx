import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import NotificationBell from './NotificationBell';

/* ── Logo ────────────────────────────────────────────── */

function Logo({ className = '' }) {
  return (
    <Link
      to="/"
      className={`flex items-center gap-2.5 group ${className}`}
      aria-label="The Rental Farm — home"
    >
      <span className="relative inline-flex w-9 h-9 items-center justify-center rounded-full bg-primary text-cream shadow-soft ring-1 ring-primary-dark/20 transition-transform group-hover:rotate-[8deg]">
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 22V13M12 13c-3.5 0-6-2.5-6-6 0-3 2-5 4-5 1.5 0 2 1 2 2 0-1 .5-2 2-2 2 0 4 2 4 5 0 3.5-2.5 6-6 6z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 22h6" />
        </svg>
        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-accent ring-2 ring-cream" aria-hidden="true" />
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-display text-lg font-semibold tracking-tight text-ink">
          The Rental Farm
        </span>
        <span className="text-[10px] uppercase tracking-[0.18em] text-ink-muted -mt-0.5 hidden sm:inline">
          Rent the season
        </span>
      </span>
    </Link>
  );
}

/* ── Cart button ─────────────────────────────────────── */

function CartButton({ count, onClick }) {
  return (
    <button
      onClick={onClick}
      className="relative p-2 rounded-full text-ink hover:bg-primary-soft transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      aria-label={count > 0 ? `Open cart, ${count} item${count === 1 ? '' : 's'}` : 'Open cart'}
    >
      <span key={`icon-${count}`} className={`block ${count > 0 ? 'animate-bounce-once' : ''}`}>
        <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
        </svg>
      </span>
      {count > 0 && (
        <span
          key={`badge-${count}`}
          className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-accent text-cream text-[10px] font-bold rounded-full flex items-center justify-center px-1 ring-2 ring-cream animate-bounce-once"
        >
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  );
}

/* ── Navbar ──────────────────────────────────────────── */

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { token, user, logout, getCartCount, setCartDrawerOpen } = useStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setProfileOpen(false);
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate('/');
  };

  const desktopLinks = [
    { to: '/trees', label: 'Browse trees' },
    { to: '/trending', label: 'Trending' },
    { to: '/owner', label: 'Become a host' },
  ];

  const profileMenuItems = [
    { to: '/profile', label: 'My profile' },
    { to: '/orders', label: 'My orders' },
    { to: '/wishlist', label: 'My wishlist' },
    { to: '/owner/trees', label: 'Listed trees' },
    { to: '/owner', label: 'Owner dashboard' },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-cream/90 backdrop-blur-md shadow-soft'
          : 'bg-cream/70 backdrop-blur-sm'
      }`}
    >
      {/* Hairline gold rule under the navbar */}
      <span
        aria-hidden="true"
        className={`absolute left-0 right-0 bottom-0 h-px rule-gold transition-opacity duration-300 ${
          scrolled ? 'opacity-100' : 'opacity-50'
        }`}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-[72px]">
          <Logo />

          {/* Desktop links */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Primary">
            {desktopLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`relative px-4 py-2 text-[14px] font-medium transition-colors ${
                  isActive(l.to)
                    ? 'text-primary'
                    : 'text-ink-soft hover:text-ink'
                }`}
              >
                {l.label}
                {isActive(l.to) && (
                  <span
                    className="absolute left-1/2 -bottom-1 w-1.5 h-1.5 rounded-full -translate-x-1/2"
                    style={{ background: 'var(--color-gold)' }}
                  />
                )}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            {/* Primary CTA — hidden on mobile in favor of menu */}
            <Link
              to="/trees"
              className="hidden md:inline-flex items-center gap-1.5 px-5 h-10 rounded-full bg-primary text-cream text-sm font-semibold hover:bg-primary-dark transition-all shadow-soft hover:shadow-card"
            >
              Rent a tree
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            <CartButton count={getCartCount()} onClick={() => setCartDrawerOpen(true)} />
            {token && <NotificationBell />}

            {/* Profile */}
            {token ? (
              <div className="relative ml-1" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen((p) => !p)}
                  aria-haspopup="menu"
                  aria-expanded={profileOpen}
                  className="flex items-center gap-1.5 pl-1 pr-2 sm:pr-3 h-10 rounded-full bg-paper border border-line hover:border-ink/30 hover:shadow-soft transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  <span className="w-7 h-7 rounded-full bg-primary text-cream font-semibold text-xs flex items-center justify-center">
                    {(user?.name || '?').slice(0, 1).toUpperCase()}
                  </span>
                  <span className="hidden sm:inline text-sm font-medium text-ink max-w-[110px] truncate">
                    {user?.name?.split(' ')[0] || 'You'}
                  </span>
                  <svg
                    className={`w-3.5 h-3.5 text-ink-muted transition-transform ${profileOpen ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>

                {profileOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-64 bg-paper rounded-2xl shadow-pop border border-line py-1.5 z-50 animate-fade-in-up overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-line bg-cream-dark/40">
                      <p className="text-sm font-semibold text-ink truncate">{user?.name}</p>
                      {user?.email && (
                        <p className="text-xs text-ink-muted truncate mt-0.5">{user.email}</p>
                      )}
                    </div>
                    <div className="py-1">
                      {profileMenuItems.map((item) => (
                        <Link
                          key={item.to}
                          to={item.to}
                          onClick={() => setProfileOpen(false)}
                          role="menuitem"
                          className={`flex items-center px-4 py-2.5 text-sm transition-colors ${
                            isActive(item.to)
                              ? 'text-primary bg-primary-soft font-semibold'
                              : 'text-ink-soft hover:bg-cream-dark/60 hover:text-ink'
                          }`}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                    <div className="border-t border-line py-1">
                      <button
                        onClick={handleLogout}
                        role="menuitem"
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-700 hover:bg-red-50 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                        </svg>
                        Log out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden sm:inline-flex items-center px-4 h-10 rounded-full text-sm font-semibold text-ink hover:bg-primary-soft transition-colors ml-1"
              >
                Sign in
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen((s) => !s)}
              className="lg:hidden ml-1 p-2 rounded-full text-ink hover:bg-primary-soft transition-colors"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile sheet */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-line bg-cream animate-fade-in-up">
          <div className="px-4 sm:px-6 py-4 space-y-1">
            {desktopLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`block px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                  isActive(l.to)
                    ? 'bg-primary-soft text-primary font-semibold'
                    : 'text-ink-soft hover:bg-cream-dark/60'
                }`}
              >
                {l.label}
              </Link>
            ))}
            <div className="pt-2">
              <Link
                to="/trees"
                className="flex items-center justify-center gap-1.5 w-full px-5 h-12 rounded-full bg-primary text-cream font-semibold shadow-soft"
              >
                Rent a tree
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            {token ? (
              <div className="pt-3 mt-3 border-t border-line space-y-1">
                <div className="px-4 py-2 flex items-center gap-3">
                  <span className="w-9 h-9 rounded-full bg-primary text-cream font-semibold flex items-center justify-center">
                    {(user?.name || '?').slice(0, 1).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink truncate">{user?.name}</p>
                    {user?.email && <p className="text-xs text-ink-muted truncate">{user.email}</p>}
                  </div>
                </div>
                {profileMenuItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="block px-4 py-2.5 rounded-xl text-sm text-ink-soft hover:bg-cream-dark/60"
                  >
                    {item.label}
                  </Link>
                ))}
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2.5 rounded-xl text-sm text-red-700 hover:bg-red-50"
                >
                  Log out
                </button>
              </div>
            ) : (
              <div className="pt-3 mt-3 border-t border-line">
                <Link
                  to="/login"
                  className="block w-full text-center px-5 h-12 leading-[3rem] rounded-full bg-paper border border-line text-ink font-semibold"
                >
                  Sign in
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
