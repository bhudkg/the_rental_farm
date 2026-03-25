import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import TreeCard from '../components/TreeCard';
import { fetchTrees } from '../services/api';

const CATEGORIES = [
  {
    type: 'indoor',
    label: 'Indoor',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    ),
    color: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100',
  },
  {
    type: 'outdoor',
    label: 'Outdoor',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
      </svg>
    ),
    color: 'bg-sky-50 text-sky-600 hover:bg-sky-100',
  },
  {
    type: 'bonsai',
    label: 'Bonsai',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
    color: 'bg-amber-50 text-amber-600 hover:bg-amber-100',
  },
  {
    type: 'decorative',
    label: 'Decorative',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    ),
    color: 'bg-purple-50 text-purple-600 hover:bg-purple-100',
  },
];

const STEPS = [
  { num: '01', title: 'Browse & Choose', desc: 'Explore our curated collection of beautiful trees for any space or occasion.' },
  { num: '02', title: 'Pick Your Dates', desc: 'Select the rental period that works for you — a day, a week, or a month.' },
  { num: '03', title: 'We Deliver', desc: 'We deliver your tree to your doorstep, set it up, and make sure it looks perfect.' },
  { num: '04', title: 'Return & Relax', desc: 'When your rental ends, we pick it up. No mess, no stress.' },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    fetchTrees().then((trees) => setFeatured(trees.slice(0, 4)));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-emerald-50 via-white to-sky-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-2xl">
            <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-6">
              Sustainable Rentals
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
              Rent Trees,
              <br />
              <span className="text-primary">Not Buy Them.</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Transform your space with beautiful, living trees — delivered to your door.
              Perfect for homes, offices, events, and photo shoots.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/trees"
                className="px-8 py-3.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20"
              >
                Browse Trees
              </Link>
              <a
                href="#how-it-works"
                className="px-8 py-3.5 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-gray-300 transition-colors"
              >
                How It Works
              </a>
            </div>
          </div>
        </div>
        {/* Decorative blob */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-10">
          Explore by Category
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.type}
              to={`/trees?type=${cat.type}`}
              className={`flex flex-col items-center gap-3 p-6 rounded-2xl transition-colors ${cat.color}`}
            >
              {cat.icon}
              <span className="font-semibold">{cat.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="bg-surface py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Featured Trees</h2>
                <p className="text-gray-500 mt-1">Our most popular rentals this month</p>
              </div>
              <Link to="/trees" className="text-primary font-medium hover:underline hidden sm:block">
                View all &rarr;
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map((tree) => (
                <TreeCard key={tree.id} tree={tree} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How it works */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-4">
          How It Works
        </h2>
        <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">
          Renting a tree has never been easier. Four simple steps and you're all set.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {STEPS.map((s) => (
            <div key={s.num} className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary font-bold text-lg mb-4">
                {s.num}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{s.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to green up your space?
          </h2>
          <p className="text-primary-light mb-8 max-w-lg mx-auto">
            Join hundreds of happy renters who chose sustainability over ownership.
          </p>
          <Link
            to="/trees"
            className="inline-block px-8 py-3.5 bg-white text-primary font-semibold rounded-xl hover:bg-gray-50 transition-colors"
          >
            Start Browsing
          </Link>
        </div>
      </section>
    </div>
  );
}
