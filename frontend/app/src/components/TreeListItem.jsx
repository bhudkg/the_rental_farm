import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PLACEHOLDER_TREE_IMG } from '../constants/images';

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

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function TreeListItem({ tree, isActive, onHover }) {
  const images = tree.image_urls?.length ? tree.image_urls : [tree.image_url || PLACEHOLDER_TREE_IMG];
  const [imgIdx, setImgIdx] = useState(0);

  const goImg = (dir, e) => {
    e.preventDefault();
    e.stopPropagation();
    setImgIdx((prev) => (prev + dir + images.length) % images.length);
  };

  return (
    <Link
      to={`/trees/${tree.id}`}
      className={`group flex gap-0 bg-white rounded-2xl overflow-hidden border hover:shadow-lg transition-all duration-200 ${
        isActive ? 'border-primary shadow-md ring-1 ring-primary/20' : 'border-gray-200'
      }`}
      onMouseEnter={() => onHover?.(tree.id)}
      onMouseLeave={() => onHover?.(null)}
    >
      {/* Image with carousel arrows */}
      <div className="w-[280px] shrink-0 relative bg-gray-100 aspect-4/3">
        <img
          src={images[imgIdx]}
          alt={tree.name}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => { e.target.src = PLACEHOLDER_TREE_IMG; }}
        />
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => goImg(-1, e)}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
            >
              <svg className="w-3.5 h-3.5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <button
              onClick={(e) => goImg(1, e)}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
            >
              <svg className="w-3.5 h-3.5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {images.map((_, i) => (
                <span key={i} className={`w-1.5 h-1.5 rounded-full ${i === imgIdx ? 'bg-white' : 'bg-white/50'}`} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0 p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            {(tree.city || tree.state) && (
              <p className="text-xs text-gray-500">
                Within {[tree.city, tree.state].filter(Boolean).join(', ')}
              </p>
            )}
            {tree.distance_km != null && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">
                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                {tree.distance_km} km
              </span>
            )}
          </div>

          <h3 className="text-[15px] font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-1 mb-1.5">
            {tree.name}
          </h3>

          <p className="text-xs text-gray-400 line-clamp-1 mb-2">
            <span className="capitalize">{tree.type}</span>
            {tree.variety && <> &middot; {tree.variety}</>}
            {tree.size && <> &middot; {tree.size}</>}
            {tree.season_start && tree.season_end && (
              <> &middot; {MONTHS[tree.season_start - 1]} – {MONTHS[tree.season_end - 1]}</>
            )}
          </p>
        </div>

        {/* Price — bottom right like Vrbo */}
        <div className="flex items-end justify-between">
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
              TYPE_COLORS[tree.type] || 'bg-gray-100 text-gray-600'
            }`}
          >
            {tree.type}
          </span>
          {tree.price_per_season != null && (
            <div className="text-right">
              <span className="text-lg font-bold text-gray-900">
                ₹{tree.price_per_season.toLocaleString()}
              </span>
              <p className="text-[11px] text-gray-400 -mt-0.5">per season</p>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
