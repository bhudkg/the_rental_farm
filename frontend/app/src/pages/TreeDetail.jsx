import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import BookingModal from '../components/BookingModal';
import MapplsMap from '../components/MapplsMap';
import { fetchTree } from '../services/api';

const PLACEHOLDER_IMG = 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=800&q=80';
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function TreeDetail() {
  const { id } = useParams();
  const [tree, setTree] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [showAllPhotos, setShowAllPhotos] = useState(false);

  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchTree(id)
      .then(setTree)
      .finally(() => setLoading(false));
  }, [id]);

  const DELIVERY_FEE = 1000;
  const seasonPrice = tree ? (Number(tree.price_per_season) || 0) : 0;
  const totalPrice = seasonPrice + DELIVERY_FEE;

  if (loading) return <LoadingSkeleton />;

  if (!tree) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-6m0 0c-3.5 0-6-2.5-6-6 0-2.5 1.5-4.5 3-5.5C10 2.5 11 2 12 2s2 .5 3 1.5c1.5 1 3 3 3 5.5 0 3.5-2.5 6-6 6z" />
          </svg>
        </div>
        <p className="text-gray-400 text-lg font-medium">Tree not found</p>
        <Link to="/trees" className="text-primary font-semibold text-sm hover:underline">&larr; Browse all trees</Link>
      </div>
    );
  }

  const images = tree.image_urls?.length ? tree.image_urls : (tree.image_url ? [tree.image_url] : [PLACEHOLDER_IMG]);
  const locationParts = [tree.location, tree.city, tree.state].filter(Boolean);
  const seasonText = tree.season_start && tree.season_end
    ? `${MONTHS[tree.season_start - 1]} – ${MONTHS[tree.season_end - 1]}`
    : null;

  return (
    <>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-16">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-gray-400 mb-4">
          <Link to="/trees" className="hover:text-gray-600 transition-colors">Trees</Link>
          <ChevronRight />
          <span className="text-gray-500 capitalize">{tree.type}</span>
          <ChevronRight />
          <span className="text-gray-700 font-medium truncate max-w-[200px]">{tree.name}</span>
        </nav>

        {/* ── Image Gallery ── */}
        <div className="relative mb-7 rounded-2xl overflow-hidden bg-gray-100">
          {images.length > 1 ? (
            <div className="relative w-full h-[280px] sm:h-[400px] group">
              <img
                src={images[activeImg]}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover blur-md scale-110 opacity-35 transition-all duration-300"
                onError={(e) => { e.target.src = PLACEHOLDER_IMG; }}
              />
              <img
                src={images[activeImg]}
                alt={tree.name}
                className="relative z-10 w-full h-full object-contain cursor-pointer transition-all duration-300"
                onClick={() => setShowAllPhotos(true)}
                onError={(e) => { e.target.src = PLACEHOLDER_IMG; }}
              />
              
              {/* Prev Button */}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setActiveImg((prev) => (prev - 1 + images.length) % images.length); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-white/80 hover:bg-white text-gray-800 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              </button>

              {/* Next Button */}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setActiveImg((prev) => (prev + 1) % images.length); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-white/80 hover:bg-white text-gray-800 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </button>

              {/* Dots */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setActiveImg(idx); }}
                    className={`h-2 rounded-full transition-all ${idx === activeImg ? 'bg-white w-4' : 'bg-white/60 hover:bg-white/80 w-2'}`}
                  />
                ))}
              </div>
            </div>
          ) : (
            <button type="button" onClick={() => setShowAllPhotos(true)} className="relative w-full h-[280px] sm:h-[400px] cursor-pointer overflow-hidden bg-gray-100">
              {/* Full-width backdrop keeps the section visually rich even for portrait photos */}
              <img
                src={images[0]}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover blur-md scale-110 opacity-35"
                onError={(e) => { e.target.src = PLACEHOLDER_IMG; }}
              />
              <img
                src={images[0]}
                alt={tree.name}
                className="relative z-10 w-full h-full object-contain"
                onError={(e) => { e.target.src = PLACEHOLDER_IMG; }}
              />
            </button>
          )}

          {images.length > 1 && (
            <button
              type="button"
              onClick={() => setShowAllPhotos(true)}
              className="absolute top-4 right-4 z-20 px-3.5 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-sm transition-all flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
              Show all photos
            </button>
          )}
        </div>

        {/* ── Two-column layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10 lg:gap-12">

          {/* ─ Left: Info ─ */}
          <div>
            {/* Title + meta */}
            <div className="mb-6">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 bg-primary/10 text-primary text-xs font-bold rounded-full capitalize">{tree.type}</span>
                {tree.variety && <span className="text-sm text-gray-500">{tree.variety}</span>}
              </div>
              <h1 className="text-2xl sm:text-[28px] font-bold text-gray-900 leading-tight mb-1.5">{tree.name}</h1>
              {locationParts.length > 0 && (
                <p className="flex items-center gap-1.5 text-sm text-gray-500">
                  <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  {locationParts.join(', ')}
                </p>
              )}
            </div>

            <hr className="border-gray-100 mb-6" />

            {/* Key details — only real data */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-5 mb-6">
              {tree.size && (
                <DetailItem label="Size" value={tree.size} />
              )}
              {seasonText && (
                <DetailItem label="Fruiting Season" value={seasonText} />
              )}
              {tree.min_quantity > 0 && (
                <DetailItem label="Min Yield Guarantee" value={`${tree.min_quantity} kg/season`} />
              )}
              <DetailItem label="Available" value={`${tree.available_quantity} trees`} />
              {tree.deposit > 0 && (
                <DetailItem label="Refundable Deposit" value={`₹${Number(tree.deposit).toLocaleString('en-IN')}`} />
              )}
              <DetailItem
                label="Maintenance"
                value={tree.maintenance_required ? 'Included' : 'Not included'}
              />
            </div>

            <hr className="border-gray-100 mb-6" />

            {/* Description */}
            {tree.description && (
              <>
                <div className="mb-6">
                  <h2 className="text-base font-semibold text-gray-900 mb-2">About this tree</h2>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{tree.description}</p>
                </div>
                <hr className="border-gray-100 mb-6" />
              </>
            )}

            {/* Owner info */}
            {tree.owner && (
              <>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-lg font-bold text-primary">
                      {tree.owner.name?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Listed by {tree.owner.name}</p>
                    <p className="text-xs text-gray-400">
                      Member since {new Date(tree.owner.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <hr className="border-gray-100 mb-6" />
              </>
            )}

            {/* Pricing breakdown */}
            <div className="mb-6">
              <h2 className="text-base font-semibold text-gray-900 mb-3">Pricing</h2>
              <div className="bg-gray-50 rounded-xl p-4 space-y-2.5 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Season rate</span>
                  <span className="font-medium text-gray-800">
                    ₹{seasonPrice > 0 ? seasonPrice.toLocaleString('en-IN') : '—'}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery fee</span>
                  <span className="font-medium text-gray-800">₹{DELIVERY_FEE.toLocaleString('en-IN')}</span>
                </div>
                {tree.deposit > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Refundable deposit</span>
                    <span className="font-medium text-gray-800">₹{Number(tree.deposit).toLocaleString('en-IN')}</span>
                  </div>
                )}
                <hr className="border-gray-200" />
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-900">Total per season</span>
                  <span className="font-bold text-gray-900">₹{totalPrice.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <hr className="border-gray-100 mb-6" />

            {/* Location & Map */}
            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-1.5">Location</h2>
              {locationParts.length > 0 && (
                <p className="text-sm text-gray-500 mb-3">{locationParts.join(', ')}</p>
              )}
              {tree.latitude && tree.longitude ? (
                <div className="rounded-xl overflow-hidden border border-gray-100">
                  <MapplsMap
                    center={[Number(tree.latitude), Number(tree.longitude)]}
                    zoom={14}
                    height="260px"
                    mapId={`tree-detail-map-${tree.id}`}
                    markers={[{
                      id: String(tree.id),
                      lat: Number(tree.latitude),
                      lng: Number(tree.longitude),
                      name: tree.name,
                      popupHtml: `<div style="padding:6px 8px;font-size:13px;font-family:system-ui,sans-serif;"><strong>${tree.name}</strong><br/><span style="color:#666;">${locationParts.join(', ')}</span></div>`,
                    }]}
                  />
                </div>
              ) : (
                <div className="h-40 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center">
                  <p className="text-sm text-gray-400">Exact location provided after booking</p>
                </div>
              )}
            </div>
          </div>

          {/* ─ Right: Booking card (sticky) ─ */}
          <div className="lg:self-start">
            <div className="lg:sticky lg:top-6">
              <div className="border border-gray-200 rounded-2xl shadow-lg shadow-black/5 bg-white">
                {/* Price */}
                <div className="px-6 pt-6 pb-4">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-bold text-gray-900">
                      ₹{seasonPrice > 0 ? seasonPrice.toLocaleString('en-IN') : '—'}
                    </span>
                    <span className="text-sm text-gray-500">/ season</span>
                  </div>
                </div>

                {/* CTA */}
                <div className="px-6 pb-3">
                  <button
                    onClick={() => setShowModal(true)}
                    className="w-full py-3.5 bg-linear-to-r from-primary to-emerald-600 text-white text-base font-bold rounded-xl hover:brightness-105 transition-all shadow-md"
                  >
                    Own This Tree
                  </button>
                </div>

                {/* Price breakdown */}
                <div className="px-6 pb-6 pt-2">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-500">
                      <span className="underline decoration-dotted underline-offset-2">Season rate</span>
                      <span className="text-gray-700">₹{seasonPrice > 0 ? seasonPrice.toLocaleString('en-IN') : '—'}</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span className="underline decoration-dotted underline-offset-2">Delivery fee</span>
                      <span className="text-gray-700">₹{DELIVERY_FEE.toLocaleString('en-IN')}</span>
                    </div>
                    {tree.deposit > 0 && (
                      <div className="flex justify-between text-gray-500">
                        <span className="underline decoration-dotted underline-offset-2">Refundable deposit</span>
                        <span className="text-gray-700">₹{Number(tree.deposit).toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    <hr className="border-gray-200 my-3!" />
                    <div className="flex justify-between font-semibold text-gray-900">
                      <span>Total</span>
                      <span>₹{(totalPrice + Number(tree.deposit || 0)).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full-screen photo viewer */}
      {showAllPhotos && (
        <PhotoViewer
          images={images}
          treeName={tree.name}
          activeImg={activeImg}
          setActiveImg={setActiveImg}
          onClose={() => setShowAllPhotos(false)}
        />
      )}

      {/* Booking modal */}
      {showModal && (
        <BookingModal
          tree={tree}
          totalPrice={totalPrice}
          deposit={tree.deposit}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}

/* ─── Sub-components ─── */

function ChevronRight() {
  return (
    <svg className="w-3 h-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

function DetailItem({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-gray-800">{value}</p>
    </div>
  );
}

function PhotoViewer({ images, treeName, activeImg, setActiveImg, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/95">
      <div className="absolute top-4 left-4 z-10">
        <button onClick={onClose} className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-full text-sm font-medium hover:bg-white/20 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          Close
        </button>
      </div>
      <div className="absolute top-4 right-4 z-10 text-white/50 text-sm">
        {activeImg + 1} / {images.length}
      </div>

      <div className="h-full flex items-center justify-center px-14">
        {images.length > 1 && (
          <button onClick={() => setActiveImg((activeImg - 1 + images.length) % images.length)} className="absolute left-3 p-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>
        )}

        <img src={images[activeImg]} alt={`${treeName} ${activeImg + 1}`} className="max-h-[80vh] max-w-full object-contain rounded-lg" />

        {images.length > 1 && (
          <button onClick={() => setActiveImg((activeImg + 1) % images.length)} className="absolute right-3 p-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>
        )}
      </div>

      {images.length > 1 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-1.5 max-w-[80vw] overflow-x-auto pb-1">
          {images.map((url, idx) => (
            <button
              key={url}
              onClick={() => setActiveImg(idx)}
              className={`shrink-0 w-12 h-12 rounded-md overflow-hidden border-2 transition-all ${
                idx === activeImg ? 'border-white' : 'border-transparent opacity-40 hover:opacity-70'
              }`}
            >
              <img src={url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      <div className="h-4 bg-gray-100 rounded w-48 mb-5" />
      <div className="grid grid-cols-4 grid-rows-2 gap-1.5 rounded-2xl overflow-hidden h-[340px] mb-8">
        <div className="col-span-2 row-span-2 bg-gray-100" />
        <div className="bg-gray-100" /><div className="bg-gray-100" />
        <div className="bg-gray-100" /><div className="bg-gray-100" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-12">
        <div className="space-y-5">
          <div className="h-6 bg-gray-100 rounded w-40" />
          <div className="h-8 bg-gray-100 rounded w-72" />
          <div className="h-4 bg-gray-100 rounded w-56" />
          <div className="h-px bg-gray-100 w-full" />
          <div className="grid grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded" />)}
          </div>
          <div className="h-px bg-gray-100 w-full" />
          <div className="h-24 bg-gray-100 rounded-xl" />
        </div>
        <div className="h-72 bg-gray-100 rounded-2xl" />
      </div>
    </div>
  );
}
