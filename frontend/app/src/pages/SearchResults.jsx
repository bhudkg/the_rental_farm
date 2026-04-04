import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import MapplsMap from '../components/MapplsMap';
import TreeListItem from '../components/TreeListItem';
import { fetchTrees, fetchFilterOptions } from '../services/api';

function useClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (e) => {
      if (!ref.current || ref.current.contains(e.target)) return;
      handler();
    };
    document.addEventListener('mousedown', listener);
    return () => document.removeEventListener('mousedown', listener);
  }, [ref, handler]);
}

function SearchDropdown({ open, onToggle, label, icon, placeholder, value, displayValue, children, dropdownRef }) {
  return (
    <div className="flex-1 min-w-0 relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-2 pl-4 pr-2 py-2.5 hover:bg-gray-50 transition-colors cursor-pointer text-left"
      >
        {icon}
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide leading-none mb-0.5">{label}</p>
          <p className={`text-sm truncate ${value ? 'font-medium text-gray-900' : 'text-gray-400'}`}>
            {displayValue || placeholder}
          </p>
        </div>
        <svg className={`w-3.5 h-3.5 text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-2 w-72 max-h-72 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-xl z-50">
          {children}
        </div>
      )}
    </div>
  );
}

const CATEGORIES = [
  { type: null, label: 'For You', img: 'https://img.icons8.com/color/96/deciduous-tree.png' },
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
  { label: 'All Prices', min: null, max: null },
  { label: 'Under ₹30', min: null, max: 30 },
  { label: '₹30 – ₹50', min: 30, max: 50 },
  { label: '₹50+', min: 50, max: null },
];

const SIZES = ['All', 'Small', 'Medium', 'Large', 'Extra Large'];

const SORT_OPTIONS = [
  { value: '', label: 'Newest' },
  { value: 'price_low', label: 'Price: Low → High' },
  { value: 'price_high', label: 'Price: High → Low' },
  { value: 'name_asc', label: 'Name: A → Z' },
];

export default function SearchResults() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialCity = searchParams.get('city') || '';
  const initialState = searchParams.get('state') || '';
  const initialType = searchParams.get('type') || '';
  const initialNearby = searchParams.get('nearby') === '1';
  const initialLat = searchParams.get('lat');
  const initialLng = searchParams.get('lng');
  const initialLocation = initialNearby && initialLat && initialLng
    ? JSON.stringify({ nearby: true, lat: parseFloat(initialLat), lng: parseFloat(initialLng) })
    : initialCity && initialState
      ? JSON.stringify({ city: initialCity, state: initialState })
      : '';

  const [trees, setTrees] = useState([]);
  const [activeType, setActiveType] = useState(initialType || null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [hoveredTree, setHoveredTree] = useState(null);
  const scrollRef = useRef(null);

  const [priceRange, setPriceRange] = useState(0);
  const [sizeFilter, setSizeFilter] = useState('All');
  const [sortBy, setSortBy] = useState('');
  const [maintenance, setMaintenance] = useState(null);

  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [filterOptions, setFilterOptions] = useState({ locations: [], types: [] });

  const [pendingLocation, setPendingLocation] = useState(initialLocation);
  const [pendingType, setPendingType] = useState(initialType);
  const [locOpen, setLocOpen] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState('');
  const locRef = useRef(null);
  const typeRef = useRef(null);

  useClickOutside(locRef, useCallback(() => setLocOpen(false), []));
  useClickOutside(typeRef, useCallback(() => setTypeOpen(false), []));

  const activeFilterCount =
    (priceRange !== 0 ? 1 : 0) +
    (sizeFilter !== 'All' ? 1 : 0) +
    (sortBy !== '' ? 1 : 0) +
    (maintenance !== null ? 1 : 0) +
    (selectedLocation !== '' ? 1 : 0);

  useEffect(() => {
    fetchFilterOptions().then(setFilterOptions);
  }, []);

  const parsedLocation = selectedLocation
    ? (() => { try { return JSON.parse(selectedLocation); } catch { return null; } })()
    : null;

  useEffect(() => {
    setLoading(true);
    const filters = {};
    if (activeType) filters.type = activeType;
    if (parsedLocation) {
      if (parsedLocation.nearby) {
        filters.lat = parsedLocation.lat;
        filters.lng = parsedLocation.lng;
        filters.radius_km = 150;
      } else {
        filters.city = parsedLocation.city;
        filters.state = parsedLocation.state;
      }
    }
    const pr = PRICE_RANGES[priceRange];
    if (pr.min != null) filters.price_min = pr.min;
    if (pr.max != null) filters.price_max = pr.max;
    if (sizeFilter !== 'All') filters.size = sizeFilter;
    if (sortBy) filters.sort_by = sortBy;
    if (maintenance !== null) filters.maintenance = maintenance;
    fetchTrees(filters)
      .then(setTrees)
      .finally(() => setLoading(false));
  }, [activeType, selectedLocation, priceRange, sizeFilter, sortBy, maintenance]);

  const handleNearMe = () => {
    const cached = sessionStorage.getItem('userCoords');
    if (cached) {
      try {
        const { lat, lng } = JSON.parse(cached);
        setPendingLocation(JSON.stringify({ nearby: true, lat, lng }));
        setLocOpen(false);
        return;
      } catch { /* fall through to geolocation */ }
    }
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser');
      return;
    }
    setGeoLoading(true);
    setGeoError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        sessionStorage.setItem('userCoords', JSON.stringify(coords));
        setPendingLocation(JSON.stringify({ nearby: true, ...coords }));
        setGeoLoading(false);
        setLocOpen(false);
      },
      () => {
        setGeoError('Location access denied. Please enable it in your browser settings.');
        setGeoLoading(false);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  };

  const applySearch = () => {
    const params = {};
    let loc = pendingLocation;
    let type = pendingType;

    if (loc) {
      try {
        const p = JSON.parse(loc);
        if (p.nearby) {
          params.nearby = '1';
          params.lat = p.lat;
          params.lng = p.lng;
        } else {
          params.city = p.city;
          params.state = p.state;
        }
      } catch { /* ignore */ }
    }
    if (type) params.type = type;

    setSearchParams(params, { replace: true });
    setSelectedLocation(loc);
    setActiveType(type || null);
  };

  const clearAll = () => {
    setPriceRange(0);
    setSizeFilter('All');
    setSortBy('');
    setMaintenance(null);
    setSelectedLocation('');
    setPendingLocation('');
    setPendingType('');
    setActiveType(null);
    setLocOpen(false);
    setTypeOpen(false);
    setSearchParams({}, { replace: true });
  };

  return (
    <div>
      {/* Search bar */}
      <section className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2">
            <div className="flex flex-1 items-center bg-white border-2 border-gray-200 rounded-full shadow-sm hover:shadow-md transition-shadow">
              <SearchDropdown
                open={locOpen}
                onToggle={() => { setLocOpen((p) => !p); setTypeOpen(false); }}
                label="Where to?"
                placeholder="Select location"
                value={pendingLocation}
                displayValue={pendingLocation ? (() => { try { const p = JSON.parse(pendingLocation); return p.nearby ? 'Near my location' : `${p.city}, ${p.state}`; } catch { return ''; } })() : ''}
                dropdownRef={locRef}
                icon={
                  <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                }
              >
                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => { setPendingLocation(''); setLocOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${!pendingLocation ? 'text-primary font-semibold bg-primary/5' : 'text-gray-500'}`}
                  >
                    All locations
                  </button>
                  <button
                    type="button"
                    onClick={handleNearMe}
                    disabled={geoLoading}
                    className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2.5 hover:bg-blue-50 transition-colors border-b border-gray-100 ${
                      (() => { try { return JSON.parse(pendingLocation)?.nearby; } catch { return false; } })()
                        ? 'text-blue-600 font-semibold bg-blue-50/50'
                        : 'text-blue-600'
                    }`}
                  >
                    {geoLoading ? (
                      <svg className="w-3.5 h-3.5 shrink-0 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v3m0 14v3m10-10h-3M5 12H2" />
                      </svg>
                    )}
                    {geoLoading ? 'Getting location...' : 'Near my location'}
                    {(() => { try { return JSON.parse(pendingLocation)?.nearby; } catch { return false; } })() && (
                      <svg className="w-4 h-4 ml-auto text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                  </button>
                  {geoError && (
                    <p className="px-4 py-2 text-xs text-red-500">{geoError}</p>
                  )}
                  {(() => {
                    const grouped = {};
                    filterOptions.locations.forEach((loc) => {
                      if (!grouped[loc.state]) grouped[loc.state] = [];
                      grouped[loc.state].push(loc);
                    });
                    return Object.entries(grouped).map(([state, cities]) => (
                      <div key={state}>
                        <p className="px-4 pt-3 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">{state}</p>
                        {cities.map((loc) => {
                          const val = JSON.stringify({ city: loc.city, state: loc.state });
                          const isSelected = pendingLocation === val;
                          return (
                            <button
                              key={val}
                              type="button"
                              onClick={() => { setPendingLocation(val); setLocOpen(false); }}
                              className={`w-full text-left px-4 py-2 flex items-center gap-2.5 text-sm hover:bg-gray-50 transition-colors ${isSelected ? 'text-primary font-semibold bg-primary/5' : 'text-gray-700'}`}
                            >
                              <svg className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-primary' : 'text-gray-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                              </svg>
                              {loc.city}
                              {isSelected && (
                                <svg className="w-4 h-4 ml-auto text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    ));
                  })()}
                </div>
              </SearchDropdown>

              <div className="w-px h-9 bg-gray-200 shrink-0" />

              <SearchDropdown
                open={typeOpen}
                onToggle={() => { setTypeOpen((p) => !p); setLocOpen(false); }}
                label="Fruit Type"
                placeholder="All types"
                value={pendingType}
                displayValue={pendingType ? pendingType.charAt(0).toUpperCase() + pendingType.slice(1) : ''}
                dropdownRef={typeRef}
                icon={
                  <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
                  </svg>
                }
              >
                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => { setPendingType(''); setTypeOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${!pendingType ? 'text-green-600 font-semibold bg-green-50/50' : 'text-gray-500'}`}
                  >
                    All types
                  </button>
                  <div className="grid grid-cols-2 gap-0.5 p-1.5">
                    {filterOptions.types.map((t) => {
                      const isSelected = pendingType === t;
                      const cat = CATEGORIES.find((c) => c.type === t);
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => { setPendingType(t); setTypeOpen(false); }}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${isSelected ? 'bg-green-50 text-green-700 font-semibold ring-1 ring-green-200' : 'text-gray-700 hover:bg-gray-50'}`}
                        >
                          {cat?.img && <img src={cat.img} alt="" className="w-5 h-5" />}
                          {t.charAt(0).toUpperCase() + t.slice(1)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </SearchDropdown>

              <button
                onClick={applySearch}
                disabled={!pendingLocation && !pendingType}
                className="m-1.5 w-12 h-12 shrink-0 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </button>
            </div>

            <button
              onClick={clearAll}
              className="shrink-0 w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors"
              title="Clear search"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Category bar */}
      <section className="bg-white border-b border-gray-200 shadow-sm sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-2 sm:px-4">
          <div
            ref={scrollRef}
            className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-3"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {CATEGORIES.map((cat) => (
              <button
                key={cat.label}
                onClick={() => setActiveType(cat.type)}
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

      {/* Results header */}
      <section className="border-b border-gray-100">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-gray-900">
              {activeType ? `${activeType.charAt(0).toUpperCase() + activeType.slice(1)} Trees` : 'All Fruit Trees'}
              {parsedLocation && (
                <span className="text-gray-400 font-normal">
                  {parsedLocation.nearby ? ' near you (within 150 km)' : ` in ${parsedLocation.city}, ${parsedLocation.state}`}
                </span>
              )}
            </h2>
            <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full font-medium">
              {trees.length} {trees.length === 1 ? 'result' : 'results'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                showFilters || activeFilterCount > 0
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
              </svg>
              Filters
              {activeFilterCount > 0 && (
                <span className="inline-flex items-center justify-center w-4 h-4 bg-primary text-white text-[9px] font-bold rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </button>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-600 focus:ring-1 focus:ring-primary/20 focus:border-primary outline-none"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>Sort: {opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {showFilters && (
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 my-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Price / Season</label>
                  <div className="flex flex-wrap gap-1.5">
                    {PRICE_RANGES.map((pr, i) => (
                      <button
                        key={i}
                        onClick={() => setPriceRange(i)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          priceRange === i ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {pr.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Size</label>
                  <div className="flex flex-wrap gap-1.5">
                    {SIZES.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSizeFilter(s)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          sizeFilter === s ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Maintenance</label>
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
                          maintenance === opt.val ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {activeFilterCount > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
                  <p className="text-xs text-gray-500">{activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} applied</p>
                  <button onClick={clearAll} className="text-xs text-red-500 font-medium hover:text-red-600">
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Split list + map */}
        <div className="flex" style={{ height: 'calc(100vh - 220px)' }}>
          <div className="w-full lg:w-[55%] overflow-y-auto border-r border-gray-100" style={{ scrollbarWidth: 'thin' }}>
            <div className="p-4 sm:p-5 space-y-3">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex gap-4 bg-gray-100 rounded-2xl h-36 animate-pulse" />
                ))
              ) : trees.length === 0 ? (
                <div className="text-center py-20">
                  <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                  <p className="text-gray-400 text-lg mb-1">No trees found</p>
                  <p className="text-gray-400 text-sm mb-4">Try adjusting your filters.</p>
                  <button
                    onClick={clearAll}
                    className="text-primary font-medium text-sm hover:underline"
                  >
                    Clear filters & show all
                  </button>
                </div>
              ) : (
                trees.map((tree) => (
                  <TreeListItem
                    key={tree.id}
                    tree={tree}
                    isActive={hoveredTree === tree.id}
                    onHover={setHoveredTree}
                  />
                ))
              )}
            </div>
          </div>

          <div className="hidden lg:block lg:w-[45%] relative">
            <MapplsMap
              height="100%"
              mapId="search-map"
              markers={(() => {
                const cityCoords = {};
                trees.forEach((t) => {
                  if (t.latitude && t.longitude) {
                    const key = `${t.city}|${t.state}`.toLowerCase();
                    if (!cityCoords[key]) cityCoords[key] = { lat: Number(t.latitude), lng: Number(t.longitude) };
                  }
                });

                const placed = [];
                return trees.map((t, i) => {
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
              })()}
              onMarkerClick={(m) => navigate(`/trees/${m.id}`)}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
