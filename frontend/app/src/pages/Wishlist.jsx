import { useEffect, useState } from 'react';
import TreeCard from '../components/TreeCard';
import {
  Button,
  EmptyState,
  SkeletonTreeCard,
} from '../components/ui';
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wishlist</h1>
        <p className="text-gray-500 mb-8">Trees you've saved for later.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonTreeCard key={i} />
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
        <EmptyState
          icon={
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          }
          title="Your wishlist is empty"
          description="Tap the heart on any tree to save it here for later. Your saved trees stay just a click away."
          action={<Button to="/trees" size="md">Browse Trees</Button>}
          secondaryAction={<Button to="/trending" variant="ghost" size="md">See trending</Button>}
        />
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
