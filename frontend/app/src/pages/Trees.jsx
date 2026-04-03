import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import MapplsMap from '../components/MapplsMap';
import TreeCard from '../components/TreeCard';
import { fetchTrees, fetchFilterOptions } from '../services/api';

const CATEGORIES = [
  { type: null, label: 'All', img: 'https://img.icons8.com/color/96/deciduous-tree.png' },
  { type: 'mango', label: 'Mango', img: 'https://img.icons8.com/color/96/mango.png' },
  { type: 'banana', label: 'Banana', img: 'https://img.icons8.com/color/96/banana.png' },
  { type: 'orange', label: 'Orange', img: 'https://img.icons8.com/color/96/orange.png' },
  { type: 'lemon', label: 'Lemon', img: 'https://img.icons8.com/color/96/citrus.png' },
  { type: 'coconut', label: 'Coconut', img: 'https://img.icons8.com/color/96/coconut.png' },
  { type: 'guava', label: 'Guava', img: 'https://img.icons8.com/color/96/pear.png' },
  { type: 'grapes', label: 'Grapes', img: 'https://img.icons8.com/color/96/grapes.png' },
  { type: 'apple', label: 'Apple', img: 'https://img.icons8.com/color/96/apple.png' },
  { type: 'papaya', label: 'Papaya', img: 'https://img.icons8.com/color/96/papaya.png' },
  { type: 'pomegranate', label: 'Pomegranate', img: 'https://img.icons8.com/color/96/pomegranate.png' },
  { type: 'jackfruit', label: 'Jackfruit', img: 'https://img.icons8.com/color/96/pineapple.png' },
  { type: 'chiku', label: 'Chiku', img: 'https://img.icons8.com/color/96/kiwi.png' },
];

const PRICE_RANGES = [
  { label: 'All', min: null, max: null },
  { label: 'Under ₹30', min: null, max: 30 },
  { label: '₹30 – ₹50', min: 30, max: 50 },
  { label: '₹50 – ₹80', min: 50, max: 80 },
  { label: '₹80+', min: 80, max: null },
];

const SIZES = ['All', 'Small', 'Medium', 'Large', 'Extra Large'];

const SORT_OPTIONS = [
  { value: '', label: 'Newest first' },
  { value: 'price_low', label: 'Price: Low → High' },
  { value: 'price_high', label: 'Price: High → Low' },
  { value: 'name_asc', label: 'Name: A → Z' },
  { value: 'name_desc', label: 'Name: Z → A' },
];

export default function Trees() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const [trees, setTrees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [filterOptions, setFilterOptions] = useState({ locations: [], types: [], varieties: [] });

  const activeType = searchParams.get('type') || null;
  const [priceRange, setPriceRange] = useState(0);
  const [sizeFilter, setSizeFilter] = useState('All');
  const [sortBy, setSortBy] = useState('');
  const [maintenance, setMaintenance] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 12;

  const activeFilterCount =
    (priceRange !== 0 ? 1 : 0) +
    (sizeFilter !== 'All' ? 1 : 0) +
    (sortBy !== '' ? 1 : 0) +
    (maintenance !== null ? 1 : 0) +
    (searchInput !== '' ? 1 : 0) +
    (locationFilter !== '' ? 1 : 0);

  useEffect(() => {
    fetchFilterOptions().then(setFilterOptions);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setLoading(true);
    setPage(1);
    const filters = {};
    if (activeType) filters.type = activeType;
    const pr = PRICE_RANGES[priceRange];
    if (pr.min != null) filters.price_min = pr.min;
    if (pr.max != null) filters.price_max = pr.max;
    if (sizeFilter !== 'All') filters.size = sizeFilter;
    if (sortBy) filters.sort_by = sortBy;
    if (maintenance !== null) filters.maintenance = maintenance;
    if (debouncedSearch.trim()) filters.search = debouncedSearch.trim();
    if (locationFilter) {
      try {
        const loc = JSON.parse(locationFilter);
        filters.city = loc.city;
        filters.state = loc.state;
      } catch { /* ignore */ }
    }
    fetchTrees(filters)
      .then(setTrees)
      .finally(() => setLoading(false));
  }, [activeType, priceRange, sizeFilter, sortBy, maintenance, debouncedSearch, locationFilter]);

  const setType = (type) => {
    if (type === null) setSearchParams({});
    else setSearchParams({ type });
  };

  const clearFilters = () => {
    setPriceRange(0);
    setSizeFilter('All');
    setSortBy('');
    setMaintenance(null);
    setSearchInput('');
    setDebouncedSearch('');
    setLocationFilter('');
  };

  const buildMarkers = () => {
    const cityCoords = {};
    trees.forEach((t) => {
      if (t.latitude && t.longitude) {
        const key = `${t.city}|${t.state}`.toLowerCase();
        if (!cityCoords[key]) cityCoords[key] = { lat: Number(t.latitude), lng: Number(t.longitude) };
      }
    });

    const placed = [];
    return trees.map((t) => {
      let lat = t.latitude ? Number(t.latitude) : null;
      let lng = t.longitude ? Number(t.longitude) : null;

      if (lat == null || lng == null) {
        const key = `${t.city}|${t.state}`.toLowerCase();
        const fallback = cityCoords[key];
        if (!fallback) return null;
        lat = fallback.lat;
        lng = fallback.lng;
      }

      const tooClose = placed.some((p) => Math.abs(p.lat - lat) < 0.0001 && Math.abs(p.lng - lng) < 0.0001);
      if (tooClose) {
        const angle = (placed.length * 137.5 * Math.PI) / 180;
        const offset = 0.0001 * (placed.length + 1);
        lat += offset * Math.cos(angle);
        lng += offset * Math.sin(angle);
      }
      placed.push({ lat, lng });

      const cat = CATEGORIES.find((c) => c.type === t.type);
      return {
        id: t.id,
        lat,
        lng,
        name: t.name,
        label: t.name,
        icon: cat?.img,
        popupHtml: `
          <div style="padding:8px;min-width:180px;font-family:system-ui,sans-serif;">
            <strong style="font-size:14px;display:block;margin-bottom:4px;">${t.name}</strong>
            <span style="font-size:12px;color:#666;">${t.type}${t.variety ? ' &middot; ' + t.variety : ''}</span><br/>
            <span style="font-size:12px;color:#666;">${[t.city, t.state].filter(Boolean).join(', ')}</span><br/>
            <span style="font-size:14px;font-weight:600;color:#16a34a;">&#8377;${t.price_per_season != null ? Number(t.price_per_season).toLocaleString('en-IN') : '—'}/season</span><br/>
            <a href="/trees/${t.id}" style="display:inline-block;margin-top:6px;font-size:12px;color:#2563eb;text-decoration:underline;">View Details &rarr;</a>
          </div>`,
      };
    }).filter(Boolean);
  };

  const totalPages = Math.ceil(trees.length / perPage);
  const paginatedTrees = trees.slice((page - 1) * perPage, page * perPage);

  const filterSidebarContent = (
    <div className="space-y-5">
      {/* Search */}
      <div>
        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Search</label>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name or variety..."
            className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
          />
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Location</label>
        <select
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
          className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
        >
          <option value="">All Locations</option>
          {filterOptions.locations.map((loc) => {
            const val = JSON.stringify({ city: loc.city, state: loc.state });
            return (
              <option key={val} value={val}>
                {loc.city}, {loc.state}
              </option>
            );
          })}
        </select>
      </div>

      {/* Price */}
      <div>
        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Price / Season</label>
        <div className="flex flex-wrap gap-1.5">
          {PRICE_RANGES.map((pr, i) => (
            <button
              key={i}
              onClick={() => setPriceRange(i)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                priceRange === i
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {pr.label}
            </button>
          ))}
        </div>
      </div>

      {/* Size */}
      <div>
        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Size</label>
        <div className="flex flex-wrap gap-1.5">
          {SIZES.map((s) => (
            <button
              key={s}
              onClick={() => setSizeFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                sizeFilter === s
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Maintenance */}
      <div>
        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Maintenance</label>
        <div className="flex flex-wrap gap-1.5">
          {[
            { val: null, label: 'Any' },
            { val: false, label: 'Self-care' },
            { val: true, label: 'We maintain' },
          ].map((opt) => (
            <button
              key={String(opt.val)}
              onClick={() => setMaintenance(opt.val)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                maintenance === opt.val
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {activeFilterCount > 0 && (
        <button
          onClick={clearFilters}
          className="w-full py-2.5 text-sm font-medium text-red-500 border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
        >
          Clear all filters ({activeFilterCount})
        </button>
      )}
    </div>
  );

  return (
    <div>
      {/* Category bar */}
      <section className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-2 sm:px-4">
          <div
            ref={scrollRef}
            className="flex items-center gap-1 overflow-x-auto py-3"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {CATEGORIES.map((cat) => (
              <button
                key={cat.label}
                onClick={() => setType(cat.type)}
                className={`flex flex-col items-center gap-1 px-3 py-1.5 min-w-[72px] rounded-lg transition-all shrink-0 ${
                  activeType === cat.type ? 'bg-primary/5' : 'hover:bg-gray-50'
                }`}
              >
                <img src={cat.img} alt={cat.label} className="w-9 h-9 object-contain" loading="lazy" />
                <span className={`text-[11px] font-semibold whitespace-nowrap leading-tight ${activeType === cat.type ? 'text-primary' : 'text-gray-600'}`}>
                  {cat.label}
                </span>
                {activeType === cat.type && <div className="w-6 h-0.5 bg-primary rounded-full" />}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">
              {activeType ? `${activeType.charAt(0).toUpperCase() + activeType.slice(1)} Trees` : 'Browse Fruit Trees'}
            </h1>
            <p className="text-gray-400 text-sm mt-0.5">{trees.length} trees available for rent</p>
          </div>
          <div className="flex items-center gap-3">
            {/* View toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'list' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'
                }`}
                title="Grid view"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'map' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'
                }`}
                title="Map view"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m0 0l-3-3m3 3l3-3m6 1.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
              </button>
            </div>
            <div className="hidden lg:flex items-center gap-2">
              <span className="text-xs text-gray-400">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-600 focus:ring-1 focus:ring-primary/20 focus:border-primary outline-none"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Mobile filter toggle */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors w-full justify-center ${
              mobileFiltersOpen || activeFilterCount > 0
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
            </svg>
            Filters & Sort
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full">
                {activeFilterCount}
              </span>
            )}
          </button>
          {mobileFiltersOpen && (
            <div className="mt-3 bg-gray-50 border border-gray-200 rounded-2xl p-4">
              {filterSidebarContent}
            </div>
          )}
        </div>

        <div className="flex gap-6">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-60 shrink-0">
            <div className="sticky top-36 bg-gray-50/80 border border-gray-200 rounded-2xl p-5">
              <h3 className="font-semibold text-gray-900 text-sm mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                </svg>
                Filters
                {activeFilterCount > 0 && (
                  <span className="inline-flex items-center justify-center w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full ml-auto">
                    {activeFilterCount}
                  </span>
                )}
              </h3>
              {filterSidebarContent}
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="bg-gray-100 rounded-2xl h-72 animate-pulse" />
                ))}
              </div>
            ) : trees.length === 0 ? (
              <div className="text-center py-20 bg-gray-50 rounded-2xl">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <p className="text-gray-500 text-lg mb-1">No trees found</p>
                <p className="text-gray-400 text-sm mb-4">Try adjusting your filters or search term.</p>
                <button
                  onClick={() => { setType(null); clearFilters(); }}
                  className="text-primary font-medium text-sm hover:underline"
                >
                  Clear all & show everything
                </button>
              </div>
            ) : viewMode === 'map' ? (
              <MapplsMap
                height="600px"
                mapId="trees-map"
                markers={buildMarkers()}
                onMarkerClick={(m) => navigate(`/trees/${m.id}`)}
              />
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {paginatedTrees.map((tree) => (
                    <TreeCard key={tree.id} tree={tree} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                      </svg>
                    </button>
                    {Array.from({ length: totalPages }).map((_, i) => {
                      const p = i + 1;
                      if (totalPages > 7 && Math.abs(p - page) > 2 && p !== 1 && p !== totalPages) {
                        if (p === page - 3 || p === page + 3) return <span key={p} className="text-gray-400 text-sm px-1">...</span>;
                        return null;
                      }
                      return (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                            page === p
                              ? 'bg-primary text-white'
                              : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
