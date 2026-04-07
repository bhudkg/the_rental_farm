import { useEffect, useState } from 'react';
import { fetchOrderUpdates } from '../services/api';

export default function OrderTimeline({ orderId, status }) {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    fetchOrderUpdates(orderId)
      .then(setUpdates)
      .catch(() => setUpdates([]))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (!['active', 'delivered', 'completed'].includes(status)) return null;

  if (loading) {
    return (
      <div className="mt-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-100 rounded w-1/3" />
          <div className="h-40 bg-gray-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Tree Updates</h3>

      {updates.length === 0 ? (
        <div className="bg-gray-50 rounded-2xl p-6 text-center">
          <svg
            className="w-10 h-10 text-gray-300 mx-auto mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"
            />
          </svg>
          <p className="text-sm text-gray-400">No updates yet. The owner will post weekly updates here.</p>
        </div>
      ) : (
        <div className="relative pl-6 border-l-2 border-green-200 space-y-6">
          {updates.map((update) => (
            <div key={update.id} className="relative">
              {/* Timeline dot */}
              <div className="absolute -left-[25px] top-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />

              <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                {/* Media */}
                {update.media_type === 'video' ? (
                  <video
                    src={update.media_url}
                    controls
                    className="w-full max-h-80 object-contain bg-black"
                    preload="metadata"
                  />
                ) : (
                  <img
                    src={update.media_url}
                    alt={`Week ${update.week_number} update`}
                    className="w-full max-h-80 object-cover"
                  />
                )}

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                      Week {update.week_number}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(update.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  {update.caption && (
                    <p className="text-sm text-gray-700 mt-2">{update.caption}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
