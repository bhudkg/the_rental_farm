import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import TreeCard from '../components/TreeCard';
import { fetchTrees } from '../services/api';

const TYPES = [
  'all', 'mango', 'banana', 'orange', 'lemon', 'coconut',
  'guava', 'apple', 'papaya', 'pomegranate', 'jackfruit', 'chiku',
];

export default function Trees() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [trees, setTrees] = useState([]);
  const [loading, setLoading] = useState(true);

  const activeType = searchParams.get('type') || 'all';

  useEffect(() => {
    setLoading(true);
    const type = activeType === 'all' ? null : activeType;
    fetchTrees(type)
      .then(setTrees)
      .finally(() => setLoading(false));
  }, [activeType]);

  const setType = (type) => {
    if (type === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ type });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Fruit Trees</h1>
        <p className="text-gray-500">Find the perfect fruit tree for your farm, garden, or backyard.</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`px-5 py-2 rounded-full text-sm font-medium capitalize transition-colors ${
              activeType === t
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-2xl h-72 animate-pulse" />
          ))}
        </div>
      ) : trees.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg">No trees found for this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {trees.map((tree) => (
            <TreeCard key={tree.id} tree={tree} />
          ))}
        </div>
      )}
    </div>
  );
}
