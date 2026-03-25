import { Link } from 'react-router-dom';

const TYPE_COLORS = {
  indoor: 'bg-emerald-100 text-emerald-700',
  outdoor: 'bg-sky-100 text-sky-700',
  bonsai: 'bg-amber-100 text-amber-700',
  decorative: 'bg-purple-100 text-purple-700',
};

export default function TreeCard({ tree }) {
  return (
    <Link
      to={`/trees/${tree.id}`}
      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      <div className="aspect-[4/3] overflow-hidden bg-gray-100">
        <img
          src={tree.image_url}
          alt={tree.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between mb-2">
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${
              TYPE_COLORS[tree.type] || 'bg-gray-100 text-gray-600'
            }`}
          >
            {tree.type}
          </span>
          {tree.maintenance_required && (
            <span className="text-xs text-gray-400">Care needed</span>
          )}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-primary transition-colors">
          {tree.name}
        </h3>
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{tree.description}</p>
        <div className="flex items-end justify-between">
          <div>
            <span className="text-2xl font-bold text-gray-900">
              ${tree.price_per_day}
            </span>
            <span className="text-sm text-gray-400"> /day</span>
          </div>
          <span className="text-xs text-gray-400">{tree.size}</span>
        </div>
      </div>
    </Link>
  );
}
