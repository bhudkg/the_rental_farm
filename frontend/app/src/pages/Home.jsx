import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import TreeCard from '../components/TreeCard';
import { fetchTrees } from '../services/api';

const CATEGORIES = [
  { type: 'indoor', label: 'Indoor', emoji: '🏠' },
  { type: 'outdoor', label: 'Outdoor', emoji: '☀️' },
  { type: 'bonsai', label: 'Bonsai', emoji: '🌿' },
  { type: 'decorative', label: 'Decorative', emoji: '🌸' },
];

const STEPS = [
  { num: '01', title: 'Browse & Choose', desc: 'Explore our curated collection of beautiful trees for any space or occasion.' },
  { num: '02', title: 'Pick Your Dates', desc: 'Select the rental period that works for you — a day, a week, or a month.' },
  { num: '03', title: 'We Deliver', desc: 'We deliver your tree to your doorstep, set it up, and make sure it looks perfect.' },
  { num: '04', title: 'Return & Relax', desc: 'When your rental ends, we pick it up. No mess, no stress.' },
];

export default function Home() {
  const [trees, setTrees] = useState([]);
  const [activeType, setActiveType] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchTrees(activeType)
      .then(setTrees)
      .finally(() => setLoading(false));
  }, [activeType]);

  return (
    <div>
      {/* Compact hero + categories */}
      <section className="bg-gradient-to-b from-emerald-50/60 to-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Rent a Tree <span className="text-primary">Today</span>
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Beautiful trees delivered to your door — for a day, a week, or a month.
              </p>
            </div>
            <Link to="/trees" className="text-primary font-medium text-sm hover:underline whitespace-nowrap">
              View all trees &rarr;
            </Link>
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveType(null)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                !activeType
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.type}
                onClick={() => setActiveType(cat.type)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  activeType === cat.type
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="text-xs">{cat.emoji}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Trees — main content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-2xl h-80 animate-pulse" />
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trees.map((tree) => (
              <TreeCard key={tree.id} tree={tree} />
            ))}
          </div>
        )}
      </section>

      {/* List your trees banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Link
          to="/owner"
          className="group flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Have trees to rent out?</h3>
              <p className="text-sm text-gray-500">List your trees, set your price, and get QR codes for each one.</p>
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
      <section id="how-it-works" className="bg-surface-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-3">
            How It Works
          </h2>
          <p className="text-gray-500 text-center mb-10 max-w-xl mx-auto">
            Renting a tree has never been easier. Four simple steps and you're all set.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STEPS.map((s) => (
              <div key={s.num} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary font-bold text-sm mb-3">
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Ready to green up your space?
          </h2>
          <p className="text-primary-light mb-6 max-w-lg mx-auto text-sm">
            Join hundreds of happy renters who chose sustainability over ownership.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/trees"
              className="px-8 py-3 bg-white text-primary font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              Rent a Tree
            </Link>
            <Link
              to="/owner"
              className="px-8 py-3 border-2 border-white/40 text-white font-semibold rounded-xl hover:bg-white/10 transition-colors"
            >
              List Your Trees
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
