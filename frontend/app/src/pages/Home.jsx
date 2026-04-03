import { useEffect, useRef, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

const STEPS = [
  { num: '01', title: 'Browse & Choose', desc: 'Explore our curated collection of fruit trees for your farm or garden.' },
  { num: '02', title: 'Pick Your Dates', desc: 'Select the rental period that works for you — a week, a month, or a season.' },
  { num: '03', title: 'We Deliver', desc: 'We deliver and plant the tree at your location, ready to grow.' },
  { num: '04', title: 'Return & Relax', desc: 'When your rental ends, we handle pickup. No hassle.' },
];

export default function Home() {
  const navigate = useNavigate();
  const [trees, setTrees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterOptions, setFilterOptions] = useState({ locations: [], types: [] });
  const scrollRef = useRef(null);

  const [pendingLocation, setPendingLocation] = useState('');
  const [pendingType, setPendingType] = useState('');
  const [locOpen, setLocOpen] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);
  const locRef = useRef(null);
  const typeRef = useRef(null);

  useClickOutside(locRef, useCallback(() => setLocOpen(false), []));
  useClickOutside(typeRef, useCallback(() => setTypeOpen(false), []));

  useEffect(() => {
    fetchFilterOptions().then(setFilterOptions);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchTrees({})
      .then(setTrees)
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = () => {
    if (!pendingLocation && !pendingType) return;
    const params = new URLSearchParams();
    if (pendingLocation) {
      try {
        const p = JSON.parse(pendingLocation);
        params.set('city', p.city);
        params.set('state', p.state);
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
                  displayValue={pendingLocation ? (() => { try { const p = JSON.parse(pendingLocation); return `${p.city}, ${p.state}`; } catch { return ''; } })() : ''}
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
            {CATEGORIES.filter((c) => c.type !== null).map((cat) => (
              <button
                key={cat.label}
                onClick={() => navigate(`/search?type=${cat.type}`)}
                className="flex flex-col items-center gap-1 px-3 py-1.5 min-w-[72px] rounded-lg transition-all shrink-0 hover:bg-gray-50"
              >
                <img src={cat.img} alt={cat.label} className="w-9 h-9 object-contain" loading="lazy" />
                <span className="text-[11px] font-semibold whitespace-nowrap leading-tight text-gray-600">
                  {cat.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured trees */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">Featured Trees</h2>
            <p className="text-gray-400 text-sm mt-0.5">{trees.length} trees available for rent</p>
          </div>
          <Link to="/search" className="text-primary font-medium text-sm hover:underline hidden sm:block">
            View all &rarr;
          </Link>
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
            {trees.slice(0, 8).map((tree) => (
              <TreeCard key={tree.id} tree={tree} />
            ))}
          </div>
        )}

        {!loading && trees.length > 8 && (
          <div className="text-center mt-6">
            <Link
              to="/search"
              className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors text-sm"
            >
              Browse All Trees
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        )}
      </section>

      {/* List your trees banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Link
          to="/owner"
          className="group flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Have fruit trees to rent out?</h3>
              <p className="text-xs text-gray-500">List your trees, set your price, and get QR codes for each one.</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-amber-600 font-semibold text-sm whitespace-nowrap group-hover:gap-2 transition-all">
            Start Listing
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </span>
        </Link>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-xl font-bold text-gray-900 text-center mb-8">How It Works</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STEPS.map((s) => (
              <div key={s.num} className="text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary font-bold text-xs mb-2">
                  {s.num}
                </div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">{s.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h2 className="text-xl md:text-2xl font-bold mb-2">Ready to grow your garden?</h2>
          <p className="text-primary-light mb-5 text-sm">Rent premium fruit trees delivered and planted at your doorstep.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/search" className="px-6 py-2.5 bg-white text-primary font-semibold rounded-xl hover:bg-gray-50 transition-colors text-sm">
              Browse Trees
            </Link>
            <Link to="/owner" className="px-6 py-2.5 border-2 border-white/40 text-white font-semibold rounded-xl hover:bg-white/10 transition-colors text-sm">
              Register Tree
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
