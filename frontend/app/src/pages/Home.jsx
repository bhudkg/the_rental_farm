import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import TreeCard from '../components/TreeCard';
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


export default function Home() {
  const navigate = useNavigate();
  const [trees, setTrees] = useState([]);
  const [activeType, setActiveType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const perPage = 12;
  const [filterOptions, setFilterOptions] = useState({ locations: [], types: [] });
  const scrollRef = useRef(null);

  const [pendingLocation, setPendingLocation] = useState('');
  const [pendingType, setPendingType] = useState('');
  const [locOpen, setLocOpen] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState('');
  const locRef = useRef(null);
  const typeRef = useRef(null);

  useClickOutside(locRef, useCallback(() => setLocOpen(false), []));
  useClickOutside(typeRef, useCallback(() => setTypeOpen(false), []));

  useEffect(() => {
    fetchFilterOptions().then(setFilterOptions);
  }, []);

  useEffect(() => {
    setLoading(true);
    setPage(1);
    const filters = {};
    if (activeType) filters.type = activeType;
    fetchTrees(filters)
      .then(setTrees)
      .finally(() => setLoading(false));
  }, [activeType]);

  const totalPages = Math.ceil(trees.length / perPage);
  const paginatedTrees = trees.slice((page - 1) * perPage, page * perPage);

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

  const handleSearch = () => {
    if (!pendingLocation && !pendingType) return;
    const params = new URLSearchParams();
    if (pendingLocation) {
      try {
        const p = JSON.parse(pendingLocation);
        if (p.nearby) {
          params.set('nearby', '1');
          params.set('lat', p.lat);
          params.set('lng', p.lng);
        } else {
          params.set('city', p.city);
          params.set('state', p.state);
        }
      } catch { /* ignore */ }
    }
    if (pendingType) params.set('type', pendingType);
    navigate(`/search?${params.toString()}`);
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
                  onClick={handleSearch}
                  disabled={!pendingLocation && !pendingType}
                  className="m-1.5 w-12 h-12 shrink-0 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </button>
            </div>
          </div>
        </div>
      </section>

      {/* Browse by category */}
      <section className="bg-white border-b border-gray-200">
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

      {/* All trees */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">
              {activeType ? `${activeType.charAt(0).toUpperCase() + activeType.slice(1)} Trees` : 'All Fruit Trees'}
            </h2>
            <p className="text-gray-400 text-sm mt-0.5">{trees.length} trees available for rent</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-2xl h-72 animate-pulse" />
            ))}
          </div>
        ) : trees.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">No trees available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {paginatedTrees.map((tree) => (
              <TreeCard key={tree.id} tree={tree} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
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
      </section>
    </div>
  );
}
