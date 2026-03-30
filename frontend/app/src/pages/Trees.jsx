import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import MapplsMap from '../components/MapplsMap';
import TreeCard from '../components/TreeCard';
import { fetchTrees } from '../services/api';

const TYPES = [
  'all', 'mango', 'banana', 'orange', 'lemon', 'coconut',
  'guava', 'grapes', 'apple', 'papaya', 'pomegranate', 'jackfruit', 'chiku',
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
  const [trees, setTrees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState('list');

  const activeType = searchParams.get('type') || 'all';
  const [priceRange, setPriceRange] = useState(0);
  const [sizeFilter, setSizeFilter] = useState('All');
  const [sortBy, setSortBy] = useState('');
  const [maintenance, setMaintenance] = useState(null);
  const [search, setSearch] = useState('');

  const activeFilterCount =
    (priceRange !== 0 ? 1 : 0) +
    (sizeFilter !== 'All' ? 1 : 0) +
    (sortBy !== '' ? 1 : 0) +
    (maintenance !== null ? 1 : 0) +
    (search !== '' ? 1 : 0);

  useEffect(() => {
    setLoading(true);
    const filters = {};
    if (activeType !== 'all') filters.type = activeType;
    const pr = PRICE_RANGES[priceRange];
    if (pr.min != null) filters.price_min = pr.min;
    if (pr.max != null) filters.price_max = pr.max;
    if (sizeFilter !== 'All') filters.size = sizeFilter;
    if (sortBy) filters.sort_by = sortBy;
    if (maintenance !== null) filters.maintenance = maintenance;
    if (search.trim()) filters.search = search.trim();
    fetchTrees(filters)
      .then(setTrees)
      .finally(() => setLoading(false));
  }, [activeType, priceRange, sizeFilter, sortBy, maintenance, search]);

  const setType = (type) => {
    if (type === 'all') setSearchParams({});
    else setSearchParams({ type });
  };

  const clearFilters = () => {
    setPriceRange(0);
    setSizeFilter('All');
    setSortBy('');
    setMaintenance(null);
    setSearch('');
  };

  const FilterSidebar = () => (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Search</label>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search trees..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
          />
        </div>
      </div>

      {/* Price */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Price / Day</label>
        <div className="space-y-1">
          {PRICE_RANGES.map((pr, i) => (
            <button
              key={i}
              onClick={() => setPriceRange(i)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                priceRange === i
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {pr.label}
            </button>
          ))}
        </div>
      </div>

      {/* Size */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Size</label>
        <div className="space-y-1">
          {SIZES.map((s) => (
            <button
              key={s}
              onClick={() => setSizeFilter(s)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                sizeFilter === s
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Maintenance */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Maintenance</label>
        <div className="space-y-1">
          {[
            { val: null, label: 'Any' },
            { val: false, label: 'Self-care (no maintenance)' },
            { val: true, label: 'We maintain it for you' },
          ].map((opt) => (
            <button
              key={String(opt.val)}
              onClick={() => setMaintenance(opt.val)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                maintenance === opt.val
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Sort By</label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Browse Fruit Trees</h1>
        <p className="text-gray-500 text-sm">Find the perfect fruit tree for your farm, garden, or backyard.</p>
      </div>

      {/* Type pills */}
      <div className="flex flex-wrap gap-1.5 mb-6">
        {TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-colors ${
              activeType === t
                ? 'bg-primary text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t}
          </button>
        ))}
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
            <FilterSidebar />
          </div>
        )}
      </div>

      <div className="flex gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-60 flex-shrink-0">
          <div className="sticky top-36 bg-gray-50 border border-gray-200 rounded-2xl p-5">
            <h3 className="font-semibold text-gray-900 text-sm mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
              </svg>
              Filters
            </h3>
            <FilterSidebar />
          </div>
        </aside>

        {/* Grid */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">{trees.length} results</p>
            <div className="flex items-center gap-3">
              {/* View toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-md transition-colors ${
                    viewMode === 'list' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'
                  }`}
                  title="List view"
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
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m0 0l-3-3m3 3l3-3m-3 3V6.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                </button>
              </div>
              <div className="hidden lg:flex items-center gap-2">
                <span className="text-xs text-gray-400">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs text-gray-600 focus:ring-1 focus:ring-primary/20 focus:border-primary outline-none"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

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
              <p className="text-gray-400 text-lg mb-1">No trees found</p>
              <p className="text-gray-400 text-sm mb-4">Try adjusting your filters or search term.</p>
              <button
                onClick={() => { setType('all'); clearFilters(); }}
                className="text-primary font-medium text-sm hover:underline"
              >
                Clear all & show everything
              </button>
            </div>
          ) : viewMode === 'map' ? (
            <MapplsMap
              height="550px"
              mapId="trees-map"
              markers={trees
                .filter((t) => t.latitude && t.longitude)
                .map((t) => ({
                  id: t.id,
                  lat: t.latitude,
                  lng: t.longitude,
                  name: t.name,
                  popupHtml: `
                    <div style="padding:8px;min-width:180px;font-family:system-ui,sans-serif;">
                      <strong style="font-size:14px;display:block;margin-bottom:4px;">${t.name}</strong>
                      <span style="font-size:12px;color:#666;">${t.type} ${t.variety ? '&middot; ' + t.variety : ''}</span><br/>
                      <span style="font-size:12px;color:#666;">${[t.city, t.state].filter(Boolean).join(', ')}</span><br/>
                      <span style="font-size:14px;font-weight:600;color:#16a34a;">&#8377;${t.price_per_season != null ? Number(t.price_per_season).toLocaleString('en-IN') : '—'}/season</span><br/>
                      <a href="/trees/${t.id}" style="display:inline-block;margin-top:6px;font-size:12px;color:#2563eb;text-decoration:underline;">View Details &rarr;</a>
                    </div>`,
                }))}
              onMarkerClick={(m) => navigate(`/trees/${m.id}`)}
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {trees.map((tree) => (
                <TreeCard key={tree.id} tree={tree} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
