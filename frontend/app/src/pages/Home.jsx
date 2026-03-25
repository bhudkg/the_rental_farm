import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import TreeCard from '../components/TreeCard';
import { fetchTrees } from '../services/api';

const CATEGORIES = [
  { type: null, label: 'For You', img: 'https://img.icons8.com/color/96/deciduous-tree.png' },
  { type: 'mango', label: 'Mango', img: 'https://img.icons8.com/color/96/mango.png' },
  { type: 'banana', label: 'Banana', img: 'https://img.icons8.com/color/96/banana.png' },
  { type: 'orange', label: 'Orange', img: 'https://img.icons8.com/color/96/orange.png' },
  { type: 'lemon', label: 'Lemon', img: 'https://img.icons8.com/color/96/lemon.png' },
  { type: 'coconut', label: 'Coconut', img: 'https://img.icons8.com/color/96/coconut.png' },
  { type: 'guava', label: 'Guava', img: 'https://img.icons8.com/color/96/guava.png' },
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
  const [trees, setTrees] = useState([]);
  const [activeType, setActiveType] = useState(null);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    fetchTrees(activeType)
      .then(setTrees)
      .finally(() => setLoading(false));
  }, [activeType]);

  return (
    <div>
      {/* Category bar — Flipkart style */}
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
                className={`flex flex-col items-center gap-1 px-3 py-1.5 min-w-[72px] rounded-lg transition-all flex-shrink-0 ${
                  activeType === cat.type
                    ? 'bg-primary/5'
                    : 'hover:bg-gray-50'
                }`}
              >
                <img
                  src={cat.img}
                  alt={cat.label}
                  className="w-9 h-9 object-contain"
                  loading="lazy"
                />
                <span
                  className={`text-[11px] font-semibold whitespace-nowrap leading-tight ${
                    activeType === cat.type ? 'text-primary' : 'text-gray-600'
                  }`}
                >
                  {cat.label}
                </span>
                {activeType === cat.type && (
                  <div className="w-6 h-0.5 bg-primary rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Trees grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-end justify-between mb-5">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">
              {activeType
                ? `${activeType.charAt(0).toUpperCase() + activeType.slice(1)} Trees`
                : 'All Fruit Trees'}
            </h2>
            <p className="text-gray-400 text-sm mt-0.5">
              {trees.length} trees available for rent
            </p>
          </div>
          <Link to="/trees" className="text-primary font-medium text-sm hover:underline hidden sm:block">
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
            <p className="text-gray-400 text-lg">No trees found in this category.</p>
            <button
              onClick={() => setActiveType(null)}
              className="mt-3 text-primary font-medium text-sm hover:underline"
            >
              Show all trees
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {trees.map((tree) => (
              <TreeCard key={tree.id} tree={tree} />
            ))}
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
            <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">
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
          <p className="text-primary-light mb-5 text-sm">
            Rent premium fruit trees delivered and planted at your doorstep.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/trees"
              className="px-6 py-2.5 bg-white text-primary font-semibold rounded-xl hover:bg-gray-50 transition-colors text-sm"
            >
              Rent a Tree
            </Link>
            <Link
              to="/owner"
              className="px-6 py-2.5 border-2 border-white/40 text-white font-semibold rounded-xl hover:bg-white/10 transition-colors text-sm"
            >
              List Your Trees
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
