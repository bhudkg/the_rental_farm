import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import TreeCard from '../components/TreeCard';
import { fetchWishlist } from '../services/api';

export default function Wishlist() {
  const [trees, setTrees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist()
      .then(setTrees)
      .catch(() => setTrees([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Wishlist</h1>
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
      <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wishlist</h1>
      <p className="text-gray-500 mb-8">Trees you've saved for later.</p>

      {trees.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
          <p className="text-gray-400 text-lg mb-4">Your wishlist is empty</p>
          <Link
            to="/trees"
            className="inline-block px-6 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors"
          >
            Browse Trees
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {trees.map((tree) => (
            <TreeCard key={tree.id} tree={tree} variant="B" />
          ))}
        </div>
      )}
    </div>
  );
}
