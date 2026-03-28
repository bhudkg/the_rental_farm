import { Link } from 'react-router-dom';

const TYPE_COLORS = {
  mango: 'bg-yellow-100 text-yellow-700',
  banana: 'bg-yellow-50 text-yellow-600',
  orange: 'bg-orange-100 text-orange-700',
  lemon: 'bg-lime-100 text-lime-700',
  coconut: 'bg-amber-100 text-amber-700',
  guava: 'bg-green-100 text-green-700',
  apple: 'bg-red-100 text-red-700',
  papaya: 'bg-orange-50 text-orange-600',
  pomegranate: 'bg-rose-100 text-rose-700',
  jackfruit: 'bg-emerald-100 text-emerald-700',
  chiku: 'bg-amber-50 text-amber-600',
};

const PLACEHOLDER_IMG = 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=400&q=80';

export default function TreeCard({ tree }) {
  return (
    <Link
      to={`/trees/${tree.id}`}
      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      {/* Image */}
      <div className="aspect-[4/3] overflow-hidden bg-gray-100 relative">
        <img
          src={tree.image_urls?.[0] || tree.image_url || PLACEHOLDER_IMG}
          alt={tree.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => { e.target.src = PLACEHOLDER_IMG; }}
        />
        {tree.price_per_season && (
          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-xs font-bold text-primary px-2 py-1 rounded-lg shadow-sm">
            ₹{tree.price_per_season.toLocaleString()}/season
          </div>
        )}
      </div>

      <div className="p-4">
        {/* Type badge + variety */}
        <div className="flex items-center gap-2 mb-1.5">
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
              TYPE_COLORS[tree.type] || 'bg-gray-100 text-gray-600'
            }`}
          >
            {tree.type}
          </span>
          {tree.variety && (
            <span className="text-[10px] text-gray-400 font-medium truncate">{tree.variety}</span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-sm font-bold text-gray-900 mb-1 group-hover:text-primary transition-colors line-clamp-1">
          {tree.name}
        </h3>

        {/* Location */}
        {(tree.city || tree.state) && (
          <div className="flex items-center gap-1 mb-2">
            <svg className="w-3 h-3 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            <span className="text-[11px] text-gray-500 truncate">
              {[tree.city, tree.state].filter(Boolean).join(', ')}
            </span>
          </div>
        )}

        {/* Min guarantee + Price */}
        <div className="flex items-end justify-between pt-2 border-t border-gray-50">
          <div>
            <span className="text-lg font-bold text-gray-900">
              ₹{tree.price_per_season != null ? Number(tree.price_per_season).toLocaleString('en-IN') : '—'}
            </span>
            <span className="text-[11px] text-gray-400">/season</span>
          </div>
          {tree.min_quantity > 1 && (
            <span className="text-[10px] bg-blue-50 text-blue-600 font-semibold px-1.5 py-0.5 rounded">
              Min {tree.min_quantity} trees
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
