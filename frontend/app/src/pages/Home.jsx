import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TreeCard from '../components/TreeCard';
import {
  fetchTrees,
  fetchFilterOptions,
  fetchTrendingTrees,
} from '../services/api';
import { FRUIT_CATEGORIES } from '../constants/images';
import { SkeletonTreeCard, Ornament, Crest } from '../components/ui';

const PER_PAGE = 12;

export default function Home() {
  const navigate = useNavigate();

  // ── data ──
  const [trees, setTrees] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trendingLoading, setTrendingLoading] = useState(false);
  const [filterOptions, setFilterOptions] = useState({ locations: [], types: [] });

  const [activeType, setActiveType] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [page, setPage] = useState(1);
  const [trendingPage, setTrendingPage] = useState(1);

  const [pendingCity, setPendingCity] = useState('');
  const [pendingType, setPendingType] = useState('');

  const gridRef = useRef(null);

  useEffect(() => {
    fetchFilterOptions().then(setFilterOptions).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    setPage(1);
    const filters = {};
    if (activeType) filters.type = activeType;
    fetchTrees(filters)
      .then(setTrees)
      .catch(() => setTrees([]))
      .finally(() => setLoading(false));
  }, [activeType]);

  useEffect(() => {
    if (activeTab === 'trending' && trending.length === 0 && !trendingLoading) {
      setTrendingLoading(true);
      fetchTrendingTrees(50)
        .then(setTrending)
        .catch(() => setTrending([]))
        .finally(() => setTrendingLoading(false));
    }
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalPages = Math.ceil(trees.length / PER_PAGE);
  const paginatedTrees = trees.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const trendingTotalPages = Math.ceil(trending.length / PER_PAGE);
  const paginatedTrending = trending.slice(
    (trendingPage - 1) * PER_PAGE,
    trendingPage * PER_PAGE,
  );

  const scrollToGrid = () => {
    if (!gridRef.current) return;
    const top = gridRef.current.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (pendingCity) {
      try {
        const p = JSON.parse(pendingCity);
        params.set('city', p.city);
        params.set('state', p.state);
      } catch { /* ignore */ }
    }
    if (pendingType) params.set('type', pendingType);
    if ([...params.keys()].length === 0) {
      scrollToGrid();
      return;
    }
    navigate(`/search?${params.toString()}`);
  };

  const handleTab = (tab) => {
    setActiveTab(tab);
    if (tab === 'all') setPage(1);
    else setTrendingPage(1);
  };

  return (
    <div>
      {/* ─── Slim hero ─── */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-b from-cream-dark/60 via-cream to-cream"
        />
        <div
          aria-hidden="true"
          className="absolute -top-20 left-1/2 -translate-x-1/2 w-[44rem] h-[44rem] rounded-full bg-primary/8 blur-3xl"
        />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 sm:pt-24 pb-10 sm:pb-14 text-center">
          {/* Crest medallion */}
          <Crest size={64} className="mx-auto mb-5" />

          {/* Eyebrow with double-line gold rules */}
          <p className="text-[11px] uppercase tracking-[0.32em] font-semibold text-gold-foil">
            By Appointment · Estd. 2024
          </p>

          <h1 className="font-display text-[34px] sm:text-[64px] font-semibold leading-[1.05] sm:leading-[1.02] tracking-tight text-ink mt-5">
            Rent the  <span className="font-display-italic text-primary">season</span>,
            <br className="hidden sm:block" /> not the <span className="font-display-italic text-accent">tree</span>.
          </h1>

          <Ornament className="mt-6" size="md" />

          <p className="mt-6 text-[15px] sm:text-base text-ink-soft max-w-lg mx-auto leading-relaxed">
            A private orchard, leased one tree at a time. Watch your fruit ripen
            through the season — delivered to your door at the peak of harvest.
          </p>

          {/* Search rail — gold inner hairline */}
          <div className="mt-8 max-w-2xl mx-auto bg-paper rounded-full shadow-card border border-line p-1.5 flex items-stretch gap-1 text-left ring-1 ring-[color:var(--color-gold)]/20 hover:ring-[color:var(--color-gold)]/40 transition-all">
            <label className="flex-1 min-w-0 flex items-center gap-2.5 px-4 py-2 rounded-full hover:bg-cream-dark/50 transition-colors cursor-pointer">
              <svg className="w-4 h-4 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              <select
                value={pendingCity}
                onChange={(e) => setPendingCity(e.target.value)}
                aria-label="Where"
                className="flex-1 min-w-0 bg-transparent text-sm font-medium text-ink outline-none cursor-pointer"
              >
                <option value="">Anywhere</option>
                {filterOptions.locations.map((loc) => (
                  <option key={`${loc.city}-${loc.state}`} value={JSON.stringify({ city: loc.city, state: loc.state })}>
                    {loc.city}, {loc.state}
                  </option>
                ))}
              </select>
            </label>

            <span aria-hidden="true" className="hidden sm:block w-px bg-line my-2" />

            <label className="hidden sm:flex flex-1 min-w-0 items-center gap-2.5 px-4 py-2 rounded-full hover:bg-cream-dark/50 transition-colors cursor-pointer">
              <svg className="w-4 h-4 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
              <select
                value={pendingType}
                onChange={(e) => setPendingType(e.target.value)}
                aria-label="What"
                className="flex-1 min-w-0 bg-transparent text-sm font-medium text-ink outline-none cursor-pointer capitalize"
              >
                <option value="">Any fruit</option>
                {filterOptions.types.map((t) => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </label>

            <button
              onClick={handleSearch}
              className="shrink-0 inline-flex items-center justify-center gap-1.5 px-5 sm:px-6 h-11 rounded-full bg-primary text-cream font-semibold hover:bg-primary-dark transition-colors shadow-soft"
              aria-label="Search"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <span className="hidden sm:inline">Search</span>
            </button>
          </div>
        </div>
      </section>

      {/* ─── Category chips ─── */}
      <section className="bg-paper border-y border-line">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div
            className="flex items-center gap-2 overflow-x-auto py-3"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {FRUIT_CATEGORIES.map((cat) => {
              const active = activeType === cat.type;
              return (
                <button
                  key={cat.label}
                  onClick={() => setActiveType(cat.type)}
                  className={`shrink-0 group flex items-center gap-2 pl-1.5 pr-3.5 py-1.5 rounded-full transition-all border ${
                    active
                      ? 'bg-primary text-cream border-primary shadow-soft'
                      : 'bg-cream text-ink border-line hover:border-primary/30 hover:bg-cream-dark'
                  }`}
                >
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center ${active ? 'bg-cream' : 'bg-paper border border-line'}`}>
                    <img src={cat.img} alt="" className="w-5 h-5 object-contain" loading="lazy" />
                  </span>
                  <span className="text-sm font-semibold whitespace-nowrap">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Grid + tabs ─── */}
      <section ref={gridRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="flex items-end justify-between border-b border-line pb-3 mb-8 gap-4 flex-wrap relative">
          <span aria-hidden="true" className="absolute left-0 right-0 -bottom-px h-px rule-gold pointer-events-none" />
          <div className="flex items-center gap-6">
            <button
              onClick={() => handleTab('all')}
              className={`relative pb-3 -mb-3 text-sm sm:text-base font-semibold transition-colors ${
                activeTab === 'all' ? 'text-ink' : 'text-ink-muted hover:text-ink'
              }`}
            >
              {activeType ? `${activeType} Trees` : 'All trees'}
              <span className="ml-1.5 text-xs font-normal text-ink-muted font-tabular">
                ({trees.length})
              </span>
              {activeTab === 'all' && (
                <span className="absolute -bottom-px left-0 right-0 h-[2px] bg-primary rounded-full" />
              )}
            </button>
            <button
              onClick={() => handleTab('trending')}
              className={`relative pb-3 -mb-3 inline-flex items-center gap-1.5 text-sm sm:text-base font-semibold transition-colors ${
                activeTab === 'trending' ? 'text-ink' : 'text-ink-muted hover:text-ink'
              }`}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 23c-3.866 0-7-2.686-7-6 0-1.665.602-3.202 1.604-4.396L12 2l5.396 10.604C18.398 13.798 19 15.335 19 17c0 3.314-3.134 6-7 6z" />
              </svg>
              Trending
              {trending.length > 0 && (
                <span className="text-xs font-normal text-ink-muted font-tabular">
                  ({trending.length})
                </span>
              )}
              {activeTab === 'trending' && (
                <span className="absolute -bottom-px left-0 right-0 h-[2px] bg-accent rounded-full" />
              )}
            </button>
          </div>

          <Link
            to={activeTab === 'trending' ? '/trending' : (activeType ? `/trees?type=${activeType}` : '/trees')}
            className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors inline-flex items-center gap-1"
          >
            See all
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {activeTab === 'all' ? (
          <>
            {loading ? (
              <Grid>
                {Array.from({ length: 8 }).map((_, i) => <SkeletonTreeCard key={i} />)}
              </Grid>
            ) : trees.length === 0 ? (
              <EmptyMessage text={`No ${activeType ? activeType + ' ' : ''}trees listed yet — try another fruit.`} />
            ) : (
              <>
                <Grid>
                  {paginatedTrees.map((tree) => <TreeCard key={tree.id} tree={tree} />)}
                </Grid>
                {totalPages > 1 && (
                  <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => { setPage(p); scrollToGrid(); }} />
                )}
              </>
            )}
          </>
        ) : (
          <>
            {trendingLoading ? (
              <Grid>
                {Array.from({ length: 8 }).map((_, i) => <SkeletonTreeCard key={i} />)}
              </Grid>
            ) : trending.length === 0 ? (
              <EmptyMessage text="Nothing trending right now — check back soon." />
            ) : (
              <>
                <Grid>
                  {paginatedTrending.map((tree) => <TreeCard key={tree.id} tree={tree} />)}
                </Grid>
                {trendingTotalPages > 1 && (
                  <Pagination currentPage={trendingPage} totalPages={trendingTotalPages} onPageChange={(p) => { setTrendingPage(p); scrollToGrid(); }} />
                )}
              </>
            )}
          </>
        )}
      </section>
    </div>
  );
}

/* ─── Helpers ─────────────────────────────────────────── */

function Grid({ children }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {children}
    </div>
  );
}

function EmptyMessage({ text }) {
  return (
    <div className="text-center py-20 text-ink-muted text-sm">{text}</div>
  );
}

function Pagination({ currentPage, totalPages, onPageChange }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5 mt-12">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="w-9 h-9 rounded-full border border-line bg-paper text-ink-soft flex items-center justify-center hover:border-ink/30 hover:bg-cream-dark disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Previous page"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>
      {Array.from({ length: totalPages }).map((_, i) => {
        const p = i + 1;
        if (totalPages > 7 && Math.abs(p - currentPage) > 2 && p !== 1 && p !== totalPages) {
          if (p === currentPage - 3 || p === currentPage + 3) return <span key={p} className="text-ink-muted text-sm px-1">…</span>;
          return null;
        }
        return (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-9 h-9 rounded-full text-sm font-semibold transition-colors font-tabular ${
              currentPage === p
                ? 'bg-primary text-cream'
                : 'border border-line bg-paper text-ink-soft hover:border-ink/30 hover:bg-cream-dark'
            }`}
          >
            {p}
          </button>
        );
      })}
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="w-9 h-9 rounded-full border border-line bg-paper text-ink-soft flex items-center justify-center hover:border-ink/30 hover:bg-cream-dark disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Next page"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>
    </div>
  );
}
