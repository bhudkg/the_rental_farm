import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import BookingModal from '../components/BookingModal';
import MapplsMap from '../components/MapplsMap';
import { fetchTree, toggleWishlist, fetchOwnerRatings } from '../services/api';
import useStore, { DELIVERY_FEE } from '../store/useStore';
import { PLACEHOLDER_TREE_IMG } from '../constants/images';
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function TreeDetail() {
  const { id } = useParams();
  const [tree, setTree] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const { addToCart, isInCart, setCartDrawerOpen, user, wishlistOverrides, setWishlistOverride } = useStore();

  useEffect(() => {
    fetchTree(id)
      .then(setTree)
      .finally(() => setLoading(false));
  }, [id]);

  const seasonPrice = tree ? (Number(tree.price_per_season) || 0) : 0;
  const totalPrice = seasonPrice + DELIVERY_FEE;
  const depositAmount = tree ? Number(tree.deposit || 0) : 0;
  const grandTotal = totalPrice + depositAmount;

  const alreadyInCart = tree ? isInCart(tree.id) : false;

  const wlOverride = tree ? wishlistOverrides[tree.id] : null;
  const isWishlisted = wlOverride ? wlOverride.wishlisted : !!tree?.is_wishlisted;
  const wishlistCount = wlOverride ? wlOverride.count : (tree?.wishlist_count || 0);
  const [wlBusy, setWlBusy] = useState(false);

  const handleToggleWishlist = async () => {
    if (!user || !tree) return;
    if (wlBusy) return;
    const newWl = !isWishlisted;
    const newCount = newWl ? wishlistCount + 1 : Math.max(0, wishlistCount - 1);
    setWishlistOverride(tree.id, { wishlisted: newWl, count: newCount });
    setWlBusy(true);
    try {
      const res = await toggleWishlist(tree.id);
      setWishlistOverride(tree.id, { wishlisted: res.wishlisted, count: res.wishlist_count });
    } catch {
      setWishlistOverride(tree.id, { wishlisted: isWishlisted, count: wishlistCount });
    } finally {
      setWlBusy(false);
    }
  };

  const handleAddToCart = () => {
    if (!tree) return;
    addToCart(tree);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

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

  const images = tree.image_urls?.length ? tree.image_urls : (tree.image_url ? [tree.image_url] : [PLACEHOLDER_TREE_IMG]);
  const locationParts = [tree.location, tree.city, tree.state].filter(Boolean);
  const seasonText = tree.season_start && tree.season_end
    ? `${MONTHS[tree.season_start - 1]} – ${MONTHS[tree.season_end - 1]}`
    : null;

  const specs = [
    tree.size && { icon: 'size', label: 'Size', value: tree.size },
    seasonText && { icon: 'season', label: 'Fruiting Season', value: seasonText },
    tree.min_quantity > 0 && { icon: 'yield', label: 'Min Yield Guarantee', value: `${tree.min_quantity} kg/season` },
    tree.age != null && { icon: 'age', label: 'Tree Age', value: `${tree.age} years` },
    tree.previous_year_yield != null && { icon: 'harvest', label: 'Last Year Yield', value: `${tree.previous_year_yield} kg` },
    { icon: 'maintenance', label: 'Maintenance', value: tree.maintenance_required ? 'Included' : 'Not included' },
  ].filter(Boolean);

  const availableCount = tree.available_quantity ?? 0;

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
                onError={(e) => { e.target.src = PLACEHOLDER_TREE_IMG; }}
              />
              <img
                src={images[activeImg]}
                alt={tree.name}
                className="relative z-10 w-full h-full object-contain cursor-pointer transition-all duration-300"
                onClick={() => setShowAllPhotos(true)}
                onError={(e) => { e.target.src = PLACEHOLDER_TREE_IMG; }}
              />
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setActiveImg((prev) => (prev - 1 + images.length) % images.length); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-white/80 hover:bg-white text-gray-800 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setActiveImg((prev) => (prev + 1) % images.length); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-white/80 hover:bg-white text-gray-800 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </button>
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
              <img src={images[0]} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover blur-md scale-110 opacity-35" onError={(e) => { e.target.src = PLACEHOLDER_TREE_IMG; }} />
              <img src={images[0]} alt={tree.name} className="relative z-10 w-full h-full object-contain" onError={(e) => { e.target.src = PLACEHOLDER_TREE_IMG; }} />
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

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div className="hidden sm:flex gap-2 mb-8 overflow-x-auto pb-1">
            {images.map((url, idx) => (
              <button
                key={url}
                type="button"
                onClick={() => setActiveImg(idx)}
                className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${idx === activeImg ? 'border-primary ring-2 ring-primary/20' : 'border-transparent opacity-60 hover:opacity-90'}`}
              >
                <img src={url} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.src = PLACEHOLDER_TREE_IMG; }} />
              </button>
            ))}
          </div>
        )}

        {/* ── Two-column layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10 lg:gap-12">

          {/* ─ Left: Info ─ */}
          <div>
            {/* Title + meta */}
            <div className="mb-6">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 bg-primary/10 text-primary text-xs font-bold rounded-full capitalize">{tree.type}</span>
                {tree.variety && <span className="text-sm text-gray-500">{tree.variety}</span>}
                {availableCount > 0 && (
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full">
                    {availableCount} available
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mb-1.5">
                <h1 className="text-2xl sm:text-[28px] font-bold text-gray-900 leading-tight">{tree.name}</h1>
                <button
                  onClick={handleToggleWishlist}
                  disabled={!user}
                  className="flex items-center gap-1.5 shrink-0"
                  title={user ? (isWishlisted ? 'Remove from wishlist' : 'Add to wishlist') : 'Login to wishlist'}
                >
                  <svg
                    className={`w-6 h-6 transition-colors duration-200 ${
                      isWishlisted
                        ? 'text-red-500 fill-red-500'
                        : 'text-gray-400 fill-none hover:text-red-400'
                    } ${!user ? 'opacity-50' : 'cursor-pointer'}`}
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                    />
                  </svg>
                  {wishlistCount > 0 && (
                    <span className="text-xs font-semibold text-gray-500">{wishlistCount}</span>
                  )}
                </button>
              </div>
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

            {/* Key specs */}
            {specs.length > 0 && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                  {specs.map((s) => (
                    <div key={s.label} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="w-9 h-9 rounded-lg bg-white border border-gray-100 flex items-center justify-center shrink-0">
                        <SpecIcon type={s.icon} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] text-gray-400 font-medium mb-0.5">{s.label}</p>
                        <p className="text-sm font-semibold text-gray-800 truncate">{s.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <hr className="border-gray-100 mb-6" />
              </>
            )}

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

            {/* Owner info + ratings */}
            {tree.owner && (
              <>
                <OwnerSection owner={tree.owner} />
                <hr className="border-gray-100 mb-6" />
              </>
            )}

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
                {/* Price header */}
                <div className="px-6 pt-6 pb-4">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-bold text-gray-900">
                      ₹{seasonPrice > 0 ? seasonPrice.toLocaleString('en-IN') : '—'}
                    </span>
                    <span className="text-sm text-gray-500">/ season</span>
                  </div>
                </div>

                {/* Price breakdown */}
                <div className="px-6 pb-5">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-500">
                      <span className="underline decoration-dotted underline-offset-2">Season rate</span>
                      <span className="text-gray-700">₹{seasonPrice.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span className="underline decoration-dotted underline-offset-2">Delivery fee</span>
                      <span className="text-gray-700">₹{DELIVERY_FEE.toLocaleString('en-IN')}</span>
                    </div>
                    {depositAmount > 0 && (
                      <div className="flex justify-between text-gray-500">
                        <span className="underline decoration-dotted underline-offset-2">Refundable deposit</span>
                        <span className="text-gray-700">₹{depositAmount.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    <hr className="border-gray-200 my-1!" />
                    <div className="flex justify-between font-semibold text-gray-900">
                      <span>Total</span>
                      <span>₹{grandTotal.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* CTA buttons */}
                <div className="px-6 pb-6 space-y-2.5">
                  {alreadyInCart ? (
                    <button
                      onClick={() => setCartDrawerOpen(true)}
                      className="w-full py-3.5 bg-emerald-50 text-emerald-700 text-base font-bold rounded-xl text-center flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      In Cart &mdash; View Cart
                    </button>
                  ) : justAdded ? (
                    <div className="w-full py-3.5 bg-emerald-50 text-emerald-700 text-base font-bold rounded-xl text-center flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      Added to Cart
                    </div>
                  ) : (
                    <button
                      onClick={handleAddToCart}
                      className="w-full py-3.5 bg-linear-to-r from-primary to-emerald-600 text-white text-base font-bold rounded-xl hover:brightness-105 transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                      </svg>
                      Add to Cart
                    </button>
                  )}

                  <button
                    onClick={() => setShowModal(true)}
                    className="w-full py-3 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all"
                  >
                    Buy Now
                  </button>
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

      {/* Single-tree booking modal (Buy Now) */}
      {showModal && (
        <BookingModal
          tree={tree}
          totalPrice={totalPrice}
          deposit={depositAmount}
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

function SpecIcon({ type }) {
  const cls = 'w-4 h-4';
  switch (type) {
    case 'size':
      return (
        <svg className={`${cls} text-violet-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
        </svg>
      );
    case 'season':
      return (
        <svg className={`${cls} text-orange-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-2.25l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
        </svg>
      );
    case 'yield':
      return (
        <svg className={`${cls} text-emerald-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z" />
        </svg>
      );
    case 'age':
      return (
        <svg className={`${cls} text-blue-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
      );
    case 'harvest':
      return (
        <svg className={`${cls} text-amber-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
        </svg>
      );
    case 'maintenance':
      return (
        <svg className={`${cls} text-teal-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.384 5.384a2.025 2.025 0 01-2.853-2.853l5.384-5.384m0 0L15.17 11.42m-3.75 3.75L15.17 11.42m0 0l5.384-5.384a2.025 2.025 0 00-2.853-2.853L12.317 8.567" />
        </svg>
      );
    default:
      return null;
  }
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

function StarRow({ rating, size = 'sm' }) {
  const cls = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4.5 h-4.5';
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`${cls} ${
            star <= Math.round(rating)
              ? 'text-amber-400 fill-amber-400'
              : 'text-gray-200 fill-gray-200'
          }`}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}


function OwnerSection({ owner }) {
  const [showReviews, setShowReviews] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const hasRating = owner.avg_rating != null && owner.rating_count > 0;

  const handleToggleReviews = async () => {
    if (!showReviews && !loaded) {
      setLoadingReviews(true);
      try {
        const data = await fetchOwnerRatings(owner.id);
        setReviews(data);
      } catch {
        setReviews([]);
      } finally {
        setLoadingReviews(false);
        setLoaded(true);
      }
    }
    setShowReviews((prev) => !prev);
  };

  return (
    <div className="mb-6">
      {/* Owner card */}
      <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <span className="text-lg font-bold text-primary">
            {owner.name?.charAt(0)?.toUpperCase() || '?'}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">Listed by {owner.name}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Member since {new Date(owner.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Rating summary — always visible */}
        <button
          onClick={handleToggleReviews}
          className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors shrink-0"
          title={hasRating ? 'View all reviews' : 'No reviews yet'}
        >
          {hasRating ? (
            <>
              <span className="flex items-center gap-1">
                <StarRow rating={owner.avg_rating} />
              </span>
              <span className="text-xs text-gray-500">
                <span className="font-bold text-gray-800">{owner.avg_rating}</span>
                {' '}({owner.rating_count} {owner.rating_count === 1 ? 'review' : 'reviews'})
              </span>
            </>
          ) : (
            <>
              <StarRow rating={0} />
              <span className="text-[11px] text-gray-400">No reviews yet</span>
            </>
          )}
        </button>
      </div>

      {/* Expandable reviews section */}
      {showReviews && (
        <div className="mt-3 border border-gray-100 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">
              Reviews for {owner.name}
            </h3>
            <button
              onClick={() => setShowReviews(false)}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Close
            </button>
          </div>

          {loadingReviews ? (
            <div className="p-6 text-center">
              <div className="w-5 h-5 border-2 border-gray-300 border-t-primary rounded-full animate-spin mx-auto" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="p-6 text-center">
              <svg className="w-10 h-10 text-gray-200 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-sm text-gray-400">No reviews yet.</p>
              <p className="text-xs text-gray-300 mt-1">Reviews appear after renters receive their delivery and leave feedback.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
              {reviews.map((r) => (
                <div key={r.id} className="px-4 py-3.5">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-gray-500">
                        {r.user_name?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-800">{r.user_name || 'Anonymous'}</span>
                    <StarRow rating={r.rating} />
                    <span className="text-[11px] text-gray-400 ml-auto shrink-0">
                      {new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  {r.review && (
                    <p className="text-sm text-gray-600 leading-relaxed ml-9">{r.review}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}


function LoadingSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      <div className="h-4 bg-gray-100 rounded w-48 mb-5" />
      <div className="rounded-2xl overflow-hidden h-[340px] bg-gray-100 mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12">
        <div className="space-y-5">
          <div className="h-6 bg-gray-100 rounded w-40" />
          <div className="h-8 bg-gray-100 rounded w-72" />
          <div className="h-4 bg-gray-100 rounded w-56" />
          <div className="h-px bg-gray-100 w-full" />
          <div className="grid grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl" />)}
          </div>
          <div className="h-px bg-gray-100 w-full" />
          <div className="h-24 bg-gray-100 rounded-xl" />
        </div>
        <div className="h-80 bg-gray-100 rounded-2xl" />
      </div>
    </div>
  );
}
