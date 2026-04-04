import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toggleWishlist } from '../services/api';
import useStore from '../store/useStore';

const TYPE_COLORS = {
  mango: 'bg-yellow-100 text-yellow-700',
  banana: 'bg-yellow-50 text-yellow-600',
  orange: 'bg-orange-100 text-orange-700',
  lemon: 'bg-lime-100 text-lime-700',
  coconut: 'bg-amber-100 text-amber-700',
  guava: 'bg-green-100 text-green-700',
  grapes: 'bg-purple-100 text-purple-700',
  apple: 'bg-red-100 text-red-700',
  papaya: 'bg-orange-50 text-orange-600',
  pomegranate: 'bg-rose-100 text-rose-700',
  jackfruit: 'bg-emerald-100 text-emerald-700',
  chiku: 'bg-amber-50 text-amber-600',
};

const PLACEHOLDER_IMG = 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=400&q=80';
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function seasonLabel(tree) {
  if (!tree.season_start || !tree.season_end) return null;
  return `${MONTHS[tree.season_start - 1]} – ${MONTHS[tree.season_end - 1]}`;
}

function imgSrc(tree) {
  return tree.image_urls?.[0] || tree.image_url || PLACEHOLDER_IMG;
}

function priceText(tree) {
  if (tree.price_per_season == null) return null;
  return `₹${tree.price_per_season.toLocaleString('en-IN')}`;
}

function useWishlist(tree) {
  const user = useStore((s) => s.user);
  const override = useStore((s) => s.wishlistOverrides[tree.id]);
  const setOverride = useStore((s) => s.setWishlistOverride);

  const wishlisted = override ? override.wishlisted : !!tree.is_wishlisted;
  const count = override ? override.count : (tree.wishlist_count || 0);

  const [busy, setBusy] = useState(false);

  const toggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    if (busy) return;

    const newWishlisted = !wishlisted;
    const newCount = newWishlisted ? count + 1 : Math.max(0, count - 1);
    setOverride(tree.id, { wishlisted: newWishlisted, count: newCount });

    setBusy(true);
    try {
      const res = await toggleWishlist(tree.id);
      setOverride(tree.id, { wishlisted: res.wishlisted, count: res.wishlist_count });
    } catch {
      setOverride(tree.id, { wishlisted, count });
    } finally {
      setBusy(false);
    }
  };

  return { wishlisted, count, toggle, loggedIn: !!user };
}

function WishlistButton({ tree, className = '' }) {
  const { wishlisted, count, toggle, loggedIn } = useWishlist(tree);

  return (
    <button
      onClick={toggle}
      className={`flex items-center gap-1 ${className}`}
      title={loggedIn ? (wishlisted ? 'Remove from wishlist' : 'Add to wishlist') : 'Login to wishlist'}
      disabled={!loggedIn}
    >
      <svg
        className={`w-5 h-5 transition-colors duration-200 ${
          wishlisted
            ? 'text-red-500 fill-red-500'
            : 'text-gray-400 fill-none hover:text-red-400'
        } ${!loggedIn ? 'opacity-50' : 'cursor-pointer'}`}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
      {count > 0 && (
        <span className="text-[10px] font-semibold text-gray-500">{count}</span>
      )}
    </button>
  );
}

// ─── Option A: Airbnb-style (Clean & Minimal) ───────────────────────────────

export function TreeCardA({ tree }) {
  const season = seasonLabel(tree);
  const price = priceText(tree);

  return (
    <Link
      to={`/trees/${tree.id}`}
      className="group block"
    >
      <div className="aspect-4/3 overflow-hidden rounded-xl bg-gray-100 relative">
        <img
          src={imgSrc(tree)}
          alt={tree.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => { e.target.src = PLACEHOLDER_IMG; }}
        />
        <div className="absolute top-2 right-2 z-10">
          <WishlistButton tree={tree} className="bg-white/80 backdrop-blur-sm rounded-full p-1.5 shadow-sm hover:bg-white transition-colors" />
        </div>
      </div>

      <div className="mt-2.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-1 group-hover:text-primary transition-colors">
            {tree.name}
          </h3>
          {price && (
            <span className="text-sm font-bold text-gray-900 whitespace-nowrap shrink-0">
              {price}
            </span>
          )}
        </div>

        {(tree.city || tree.state) && (
          <p className="text-[12px] text-gray-500 mt-0.5">
            {[tree.city, tree.state].filter(Boolean).join(', ')}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-1.5 mt-2">
          {season && (
            <span className="text-[10px] font-medium text-gray-600 bg-orange-50 px-1.5 py-0.5 rounded-md">
              {season}
            </span>
          )}
          {tree.age != null && (
            <span className="text-[10px] font-medium text-gray-600 bg-green-50 px-1.5 py-0.5 rounded-md">
              {tree.age} yrs
            </span>
          )}
          {tree.size && (
            <span className="text-[10px] font-medium text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded-md">
              {tree.size}
            </span>
          )}
        </div>

        {price && (
          <p className="text-[11px] text-gray-400 mt-1">per season</p>
        )}
      </div>
    </Link>
  );
}

// ─── Option B: Property-listing (Info Grid) ──────────────────────────────────

export function TreeCardB({ tree }) {
  const season = seasonLabel(tree);
  const price = priceText(tree);

  const stats = [
    season && { icon: 'sun', label: 'Season', value: season },
    tree.age != null && { icon: 'calendar', label: 'Age', value: `${tree.age} yrs` },
    tree.previous_year_yield != null && { icon: 'yield', label: 'Yield', value: `${tree.previous_year_yield} kg` },
    tree.size && { icon: 'size', label: 'Size', value: tree.size },
  ].filter(Boolean);

  return (
    <Link
      to={`/trees/${tree.id}`}
      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      <div className="aspect-4/3 overflow-hidden bg-gray-100 relative">
        <img
          src={imgSrc(tree)}
          alt={tree.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => { e.target.src = PLACEHOLDER_IMG; }}
        />
        <div className="absolute top-2.5 left-2.5 z-10">
          <WishlistButton tree={tree} className="bg-white/80 backdrop-blur-sm rounded-full p-1.5 shadow-sm hover:bg-white transition-colors" />
        </div>
        {price && (
          <div className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-sm text-xs font-bold text-primary px-2.5 py-1 rounded-lg shadow-sm">
            {price}/season
          </div>
        )}
      </div>

      <div className="p-3.5">
        <div className="flex items-center gap-2 mb-1.5">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${TYPE_COLORS[tree.type] || 'bg-gray-100 text-gray-600'}`}>
            {tree.type}
          </span>
          {tree.variety && (
            <span className="text-[10px] text-gray-400 font-medium truncate">{tree.variety}</span>
          )}
        </div>

        <h3 className="text-sm font-bold text-gray-900 mb-0.5 group-hover:text-primary transition-colors line-clamp-1">
          {tree.name}
        </h3>

        {(tree.city || tree.state) && (
          <div className="flex items-center gap-1 mb-2.5">
            <svg className="w-3 h-3 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            <span className="text-[11px] text-gray-500 truncate">
              {[tree.city, tree.state].filter(Boolean).join(', ')}
            </span>
          </div>
        )}

        {stats.length > 0 && (
          <div className="grid grid-cols-2 gap-x-3 gap-y-2 pt-2.5 border-t border-gray-100">
            {stats.map((s) => (
              <div key={s.label} className="flex items-center gap-1.5">
                <StatIcon type={s.icon} />
                <div className="min-w-0">
                  <p className="text-[9px] text-gray-400 uppercase tracking-wider leading-none">{s.label}</p>
                  <p className="text-[11px] font-semibold text-gray-700 truncate">{s.value}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

function StatIcon({ type }) {
  const cls = "w-3.5 h-3.5 shrink-0";
  switch (type) {
    case 'sun':
      return (
        <svg className={`${cls} text-orange-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-2.25l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
        </svg>
      );
    case 'calendar':
      return (
        <svg className={`${cls} text-blue-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
      );
    case 'yield':
      return (
        <svg className={`${cls} text-emerald-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z" />
        </svg>
      );
    case 'size':
      return (
        <svg className={`${cls} text-violet-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
        </svg>
      );
    default:
      return null;
  }
}

// ─── Option C: Compact Info-dense (Stats Bar) ────────────────────────────────

export function TreeCardC({ tree }) {
  const season = seasonLabel(tree);
  const price = priceText(tree);

  const statItems = [
    season && { label: 'Season', value: season },
    tree.age != null && { label: 'Age', value: `${tree.age}y` },
    tree.previous_year_yield != null && { label: 'Yield', value: `${tree.previous_year_yield}kg` },
    tree.size && { label: 'Size', value: tree.size },
  ].filter(Boolean);

  return (
    <Link
      to={`/trees/${tree.id}`}
      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      <div className="aspect-4/3 overflow-hidden bg-gray-100 relative">
        <img
          src={imgSrc(tree)}
          alt={tree.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => { e.target.src = PLACEHOLDER_IMG; }}
        />
        <div className="absolute top-2.5 right-2.5 z-10">
          <WishlistButton tree={tree} className="bg-white/80 backdrop-blur-sm rounded-full p-1.5 shadow-sm hover:bg-white transition-colors" />
        </div>
        <span className={`absolute bottom-2.5 left-2.5 text-[10px] font-bold px-2 py-0.5 rounded-full capitalize backdrop-blur-sm ${TYPE_COLORS[tree.type] || 'bg-gray-100 text-gray-600'}`}>
          {tree.type}
        </span>
      </div>

      <div className="p-3.5">
        <div className="flex items-center gap-1.5 mb-0.5">
          <h3 className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-1">
            {tree.name}
          </h3>
          {tree.variety && (
            <span className="text-[11px] text-gray-400 shrink-0">&middot; {tree.variety}</span>
          )}
        </div>

        {(tree.city || tree.state) && (
          <div className="flex items-center gap-1 mb-2.5">
            <svg className="w-3 h-3 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            <span className="text-[11px] text-gray-500 truncate">
              {[tree.city, tree.state].filter(Boolean).join(', ')}
            </span>
          </div>
        )}

        {statItems.length > 0 && (
          <div className="flex items-stretch rounded-lg bg-gray-50 border border-gray-100 overflow-hidden mb-3">
            {statItems.map((s, i) => (
              <div key={s.label} className={`flex-1 text-center py-1.5 px-1 ${i > 0 ? 'border-l border-gray-200' : ''}`}>
                <p className="text-[8px] text-gray-400 uppercase tracking-wider leading-none mb-0.5">{s.label}</p>
                <p className="text-[10px] font-bold text-gray-700 truncate">{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {price && (
          <div className="flex items-baseline gap-1">
            <span className="text-base font-bold text-gray-900">{price}</span>
            <span className="text-[11px] text-gray-400">/season</span>
          </div>
        )}
      </div>
    </Link>
  );
}

// ─── Default export (backwards-compatible, uses Option B as default) ─────────

export default function TreeCard({ tree, variant = 'B' }) {
  switch (variant) {
    case 'A': return <TreeCardA tree={tree} />;
    case 'C': return <TreeCardC tree={tree} />;
    case 'B':
    default:  return <TreeCardB tree={tree} />;
  }
}
