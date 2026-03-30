import { Link } from 'react-router-dom';

const TYPE_COLORS = {
  mango: 'bg-yellow-100 text-yellow-700',
  banana: 'bg-yellow-50 text-yellow-600',
  orange: 'bg-orange-100 text-orange-700',
  lemon: 'bg-lime-100 text-lime-700',
  coconut: 'bg-amber-100 text-amber-700',
  guava: 'bg-green-100 text-green-700',
  grapes: 'bg-purple-100 text-purple-700',
  apple: 'bg-red-100 text-red-700',
  papaya: 'bg-orange-50 text-orange-600',
  pomegranate: 'bg-rose-100 text-rose-700',
  jackfruit: 'bg-emerald-100 text-emerald-700',
  chiku: 'bg-amber-50 text-amber-600',
};

const PLACEHOLDER_IMG = 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=400&q=80';
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

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
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${TYPE_COLORS[tree.type] || 'bg-gray-100 text-gray-600'
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
          <div className="flex items-center gap-1 mb-2.5">
            <svg className="w-3 h-3 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            <span className="text-[11px] text-gray-500 truncate">
              {[tree.city, tree.state].filter(Boolean).join(', ')}
            </span>
          </div>
        )}

        {/* Stats Row */}
        {(tree.season_start || tree.available_quantity != null) && (
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 mb-3">
            {tree.season_start && tree.season_end && (
              <div className="flex items-center gap-1 text-[11px] text-gray-600 bg-orange-50/50 px-1.5 py-0.5 rounded border border-orange-100/50">
                <svg className="w-3 h-3 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-2.25l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                </svg>
                <span className="font-medium">{MONTHS[tree.season_start - 1]} - {MONTHS[tree.season_end - 1]}</span>
              </div>
            )}

            {tree.available_quantity != null && (
              <div className="flex items-center gap-1 text-[11px] text-gray-600 bg-emerald-50/50 px-1.5 py-0.5 rounded border border-emerald-100/50">
                <svg className="w-3 h-3 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                </svg>
                <span className="font-medium">{tree.available_quantity} left</span>
              </div>
            )}
          </div>
        )}

        {/* Footer: Size & Min Guarantee */}
        {(tree.size || tree.min_quantity > 1) && (
          <div className="flex items-center justify-between pt-2 border-t border-gray-50 mt-1">
            {tree.size ? (
              <span className="text-[10px] text-gray-500 font-medium bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                Size: <span className="text-gray-700 font-semibold">{tree.size}</span>
              </span>
            ) : <span />}

            {tree.min_quantity > 1 && (
              <span className="text-[10px] bg-blue-50 text-blue-600 font-semibold px-1.5 py-0.5 rounded">
                Min {tree.min_quantity} trees
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
