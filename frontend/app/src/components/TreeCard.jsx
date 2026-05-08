import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toggleWishlist } from '../services/api';
import useStore from '../store/useStore';
import { PLACEHOLDER_TREE_IMG } from '../constants/images';

const MONTHS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
const TRENDING_THRESHOLD = 5.0;

function imgSrc(tree) {
  return tree.image_urls?.[0] || tree.image_url || PLACEHOLDER_TREE_IMG;
}

function priceText(tree) {
  if (tree.price_per_season == null) return null;
  return `₹${tree.price_per_season.toLocaleString('en-IN')}`;
}

function inSeason(tree, monthIdx) {
  if (!tree.season_start || !tree.season_end) return false;
  const start = tree.season_start - 1;
  const end = tree.season_end - 1;
  // Wrap-around season (e.g. Nov → Feb)
  if (start <= end) return monthIdx >= start && monthIdx <= end;
  return monthIdx >= start || monthIdx <= end;
}

/* ── Wishlist heart ────────────────────────────────── */

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
    if (!user || busy) return;

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

function HeartButton({ tree }) {
  const { wishlisted, toggle, loggedIn } = useWishlist(tree);

  return (
    <button
      onClick={toggle}
      disabled={!loggedIn}
      title={loggedIn ? (wishlisted ? 'Remove from wishlist' : 'Save to wishlist') : 'Sign in to save'}
      className={`absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center bg-paper/95 backdrop-blur-sm shadow-soft ring-1 ring-line transition-all duration-200 hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
        loggedIn ? 'cursor-pointer' : 'cursor-not-allowed opacity-80'
      }`}
      aria-label={wishlisted ? 'Saved' : 'Save'}
    >
      <svg
        className={`w-4 h-4 transition-colors ${
          wishlisted ? 'text-accent fill-accent' : 'text-ink-soft fill-none'
        }`}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
    </button>
  );
}

/* ── Trending pill ─────────────────────────────────── */

function TrendingPill({ tree }) {
  if (!tree.trending_score || tree.trending_score < TRENDING_THRESHOLD) return null;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-ink text-cream text-[10px] font-bold tracking-[0.14em] uppercase shadow-sm ring-1 ring-[color:var(--color-gold)]/60">
      <svg className="w-2.5 h-2.5 text-[color:var(--color-gold-bright)]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 23c-3.866 0-7-2.686-7-6 0-1.665.602-3.202 1.604-4.396L12 2l5.396 10.604C18.398 13.798 19 15.335 19 17c0 3.314-3.134 6-7 6z" />
      </svg>
      <span className="text-gold-foil">Coveted</span>
    </span>
  );
}

/* ── Season strip — 12-dot mini calendar ───────────── */

function SeasonStrip({ tree }) {
  if (!tree.season_start || !tree.season_end) return null;
  return (
    <div className="flex items-center gap-1">
      <span className="text-[10px] uppercase tracking-wider text-ink-muted font-semibold mr-1">
        Season
      </span>
      <div className="flex items-center gap-[2px]">
        {MONTHS.map((m, i) => {
          const active = inSeason(tree, i);
          return (
            <span
              key={i}
              className={`w-[7px] h-[7px] rounded-full ${
                active ? 'bg-accent' : 'bg-line'
              }`}
              title={active ? 'In fruiting season' : ''}
              aria-hidden="true"
            />
          );
        })}
      </div>
    </div>
  );
}

/* ── Owner / rating chip ───────────────────────────── */

function OwnerChip({ tree }) {
  const hasRating = tree.owner_avg_rating != null && tree.owner_avg_rating > 0;
  return (
    <span className="inline-flex items-center gap-1 text-[11px] text-ink-soft font-medium">
      <svg
        className={`w-3.5 h-3.5 ${hasRating ? 'text-harvest fill-[color:var(--color-harvest)]' : 'text-line fill-line'}`}
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
      {hasRating ? (
        <span className="font-tabular font-semibold text-ink">
          {Number(tree.owner_avg_rating).toFixed(1)}
          <span className="text-ink-muted font-normal"> ({tree.owner_rating_count})</span>
        </span>
      ) : (
        <span className="text-ink-muted">New farmer</span>
      )}
    </span>
  );
}

/* ── Default canonical TreeCard ────────────────────── */

export default function TreeCard({ tree }) {
  const price = priceText(tree);
  const location = [tree.city, tree.state].filter(Boolean).join(', ');
  const inStock = tree.available_quantity == null || tree.available_quantity > 0;

  return (
    <Link
      to={`/trees/${tree.id}`}
      className="group relative block focus:outline-none"
    >
      <article className="relative bg-paper rounded-3xl ring-1 ring-line overflow-hidden shadow-soft transition-all duration-300 group-hover:shadow-pop group-hover:-translate-y-1 group-hover:ring-[color:var(--color-gold)]/45 group-focus-visible:ring-2 group-focus-visible:ring-primary/40">
        {/* Gold corner mark — appears on hover */}
        <span
          aria-hidden="true"
          className="absolute top-3.5 right-3.5 z-20 w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            background:
              'conic-gradient(from 90deg at 100% 0%, transparent 0deg 90deg, var(--color-gold) 90deg 91deg, transparent 91deg)',
          }}
        />
        {/* Image */}
        <div className="relative">
          <div className="aspect-[4/3] overflow-hidden bg-cream-dark">
            <img
              src={imgSrc(tree)}
              alt={tree.name}
              loading="lazy"
              onError={(e) => { e.currentTarget.src = PLACEHOLDER_TREE_IMG; }}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
            />
          </div>

          {/* Subtle bottom fade for legibility */}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-ink/40 to-transparent pointer-events-none" />

          {/* Top-left overlays */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-paper/95 backdrop-blur-sm text-[11px] font-semibold text-ink ring-1 ring-line capitalize">
              {tree.type}
            </span>
            <TrendingPill tree={tree} />
          </div>

          {/* Heart */}
          <HeartButton tree={tree} />

          {/* Type / variety on bottom-left */}
          {tree.variety && (
            <span className="absolute bottom-3 left-3 text-[11px] font-medium text-cream/90 tracking-wide">
              {tree.variety}
            </span>
          )}

          {!inStock && (
            <div className="absolute inset-0 bg-paper/65 backdrop-blur-[1px] flex items-center justify-center">
              <span className="px-3 py-1.5 rounded-full bg-ink text-cream text-xs font-semibold uppercase tracking-wider">
                Booked for the season
              </span>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-display text-[19px] leading-tight font-semibold text-ink truncate group-hover:text-primary transition-colors">
                {tree.name}
              </h3>
              {location && (
                <p className="flex items-center gap-1 text-[12px] text-ink-muted mt-0.5">
                  <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  <span className="truncate">{location}</span>
                </p>
              )}
            </div>

            {price && (
              <div className="text-right shrink-0">
                <p className="font-display font-tabular text-[22px] leading-none font-semibold text-primary">{price}</p>
                <p className="text-[10px] uppercase tracking-[0.18em] text-ink-muted mt-1 font-semibold">/ season</p>
              </div>
            )}
          </div>

          <SeasonStrip tree={tree} />

          <div className="relative flex items-center justify-between pt-3">
            <span aria-hidden="true" className="absolute left-0 right-0 top-0 h-px rule-gold opacity-60" />
            <OwnerChip tree={tree} />
            {tree.previous_year_yield != null && (
              <span className="inline-flex items-center gap-1 text-[11px] text-ink-soft font-medium">
                <svg className="w-3.5 h-3.5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21c-2.485 0-4.5-2.015-4.5-4.5 0-1.5 1.5-3.5 4.5-7.5 3 4 4.5 6 4.5 7.5 0 2.485-2.015 4.5-4.5 4.5z" />
                </svg>
                <span className="font-tabular font-semibold">{tree.previous_year_yield} kg</span>
                <span className="text-ink-muted">last yr</span>
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}

/* Backwards-compatible variant exports — all map to canonical now */
export const TreeCardA = TreeCard;
export const TreeCardB = TreeCard;
export const TreeCardC = TreeCard;
