import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import TreeCard from '../components/TreeCard';
import { fetchTrendingTrees } from '../services/api';

function RankBadge({ rank }) {
  const colors = {
    1: 'bg-yellow-400 text-yellow-900',
    2: 'bg-gray-300 text-gray-700',
    3: 'bg-amber-600 text-amber-50',
  };
  return (
    <div className={`absolute top-2.5 left-2.5 z-20 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shadow-md ${colors[rank] || 'bg-white/90 text-gray-600'}`}>
      {rank}
    </div>
  );
}

export default function Trending() {
  const [trees, setTrees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrendingTrees(24)
      .then(setTrees)
      .catch(() => setTrees([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Trending Trees</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-4/3 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-3 mb-2">
        <svg className="w-7 h-7 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 23c-3.866 0-7-2.686-7-6 0-1.665.602-3.202 1.604-4.396L12 2l5.396 10.604C18.398 13.798 19 15.335 19 17c0 3.314-3.134 6-7 6zm0-2c2.761 0 5-1.79 5-4 0-1.093-.395-2.1-1.052-2.878L12 6.522l-3.948 7.6C7.395 14.9 7 15.907 7 17c0 2.21 2.239 4 5 4z" />
        </svg>
        <h1 className="text-3xl font-bold text-gray-900">Trending Trees</h1>
      </div>
      <p className="text-gray-500 mb-8">The most popular trees right now, ranked by views, wishlists, and bookings.</p>

      {trees.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
          </svg>
          <p className="text-gray-400 text-lg mb-4">No trending data yet</p>
          <Link
            to="/trees"
            className="inline-block px-6 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors"
          >
            Browse Trees
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {trees.map((tree, idx) => (
            <div key={tree.id} className="relative">
              {idx < 3 && <RankBadge rank={idx + 1} />}
              <TreeCard tree={tree} variant="B" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
