import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import useStore, { DELIVERY_FEE } from '../store/useStore';
import CheckoutModal from './CheckoutModal';

const PLACEHOLDER_IMG = 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=200&q=60';

export default function CartDrawer() {
  const { cart, cartDrawerOpen, setCartDrawerOpen, removeFromCart, getCartTotal, getCartCount } = useStore();
  const [showCheckout, setShowCheckout] = useState(false);
  const [singleCheckoutItem, setSingleCheckoutItem] = useState(null);
  const [hoveredTreeId, setHoveredTreeId] = useState(null);
  const [lockedTreeId, setLockedTreeId] = useState(null);
  const backdropRef = useRef(null);
  const hoverTimer = useRef(null);

  const handleMouseEnter = (id) => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setHoveredTreeId(id);
  };

  const handleMouseLeave = () => {
    hoverTimer.current = setTimeout(() => {
      setHoveredTreeId(null);
    }, 300);
  };

  useEffect(() => {
    if (cartDrawerOpen) {
      document.body.style.overflow = 'hidden';
      if (cart.length > 0 && !lockedTreeId) {
        setLockedTreeId(cart[0].tree.id);
      }
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [cartDrawerOpen, cart, lockedTreeId]);

  useEffect(() => {
    if (cart.length > 0) {
      if (!lockedTreeId || !cart.some(item => item.tree.id === lockedTreeId)) {
        setLockedTreeId(cart[0].tree.id);
      }
    } else {
      setLockedTreeId(null);
    }
  }, [cart, lockedTreeId]);

  if (!cartDrawerOpen && !showCheckout) return null;

  const total = getCartTotal();
  const count = getCartCount();

  const seasonSubtotal = cart.reduce(
    (sum, item) => sum + (Number(item.tree.price_per_season) || 0),
    0,
  );
  const deliverySubtotal = cart.length * DELIVERY_FEE;

  return (
    <>
      {/* Drawer */}
      {cartDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            ref={backdropRef}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
            onClick={() => setCartDrawerOpen(false)}
          />

          {/* Hover Preview Panel (Desktop only) */}
          {(hoveredTreeId || lockedTreeId) && (() => {
            const activeId = hoveredTreeId || lockedTreeId;
            const previewTree = cart.find(item => item.tree.id === activeId)?.tree;
            if (!previewTree) return null;
            return (
              <div 
                className="hidden md:flex flex-col w-[400px] bg-white rounded-3xl shadow-2xl mr-6 my-auto h-auto max-h-[85vh] self-center animate-scale-in border border-gray-100 z-50 overflow-hidden"
                onMouseEnter={() => { if (hoverTimer.current) clearTimeout(hoverTimer.current); }}
                onMouseLeave={handleMouseLeave}
              >
                <div className="h-56 relative shrink-0">
                  <img 
                    src={previewTree.image_urls?.[0] || previewTree.image_url || PLACEHOLDER_IMG} 
                    alt={previewTree.name} 
                    className="w-full h-full object-cover" 
                    onError={(e) => { e.target.src = PLACEHOLDER_IMG; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-6">
                    <div>
                      <h3 className="text-white font-extrabold text-2xl truncate drop-shadow-sm mb-1">{previewTree.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 bg-primary/90 backdrop-blur-sm text-white text-[11px] uppercase tracking-wider font-bold rounded-md">
                          {previewTree.type}
                        </span>
                        {previewTree.variety && (
                          <span className="px-2.5 py-0.5 bg-white/20 backdrop-blur-sm text-white text-[11px] uppercase tracking-wider font-semibold rounded-md">
                            {previewTree.variety}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-6 overflow-y-auto w-full">
                  <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                    {previewTree.description || `Experience the joy of fresh ${previewTree.type || 'fruits'} straight from your adopted tree. Perfect for individuals and families looking to bond with nature and eat organic.`}
                  </p>
                  
                  <div className="mb-6">
                    <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      </div>
                      Premium Benefits
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-2 pl-2">
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                        <span>100% Organic & Chemical-free farming</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                        <span>Regular photo updates of your tree's progress</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                        <span>Guaranteed prime seasonal harvest yield</span>
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100/80 mt-auto shadow-sm">
                    <div className="flex items-center gap-2 mb-2.5">
                      <div className="flex -space-x-1">
                        {[1, 2, 3, 4, 5].map(i => (
                          <svg key={i} className="w-4 h-4 text-accent drop-shadow-sm" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-[13px] font-bold text-gray-800">4.9<span className="text-gray-400 font-medium ml-1">(24 reviews)</span></span>
                    </div>
                    <p className="text-[13px] text-gray-500 italic leading-relaxed">"The {previewTree.type || 'fruits'} were incredibly sweet and fresh. Best decision ever to rent this tree!" – Verified Adopter</p>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Panel */}
          <div className="relative w-full max-w-md bg-white shadow-2xl flex flex-col animate-slide-in-right">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                </svg>
                <h2 className="text-lg font-bold text-gray-900">Your Cart</h2>
                {count > 0 && (
                  <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-bold rounded-full">
                    {count} {count === 1 ? 'tree' : 'trees'}
                  </span>
                )}
              </div>
              <button
                onClick={() => setCartDrawerOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            {cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                  </svg>
                </div>
                <p className="text-gray-500 font-medium mb-1">Your cart is empty</p>
                <p className="text-sm text-gray-400 mb-4">Browse our trees and add some to your cart</p>
                <Link
                  to="/trees"
                  onClick={() => setCartDrawerOpen(false)}
                  className="px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-colors"
                >
                  Browse Trees
                </Link>
              </div>
            ) : (
              <>
                {/* Items */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                  {cart.map(({ tree }) => {
                    const img = tree.image_urls?.[0] || tree.image_url || PLACEHOLDER_IMG;
                    const price = Number(tree.price_per_season) || 0;
                    const itemTotal = price + DELIVERY_FEE;
                    const locationParts = [tree.city, tree.state].filter(Boolean);

                    return (
                      <div 
                        key={tree.id} 
                        onClick={() => setLockedTreeId(tree.id)}
                        className={`flex gap-3 p-3 rounded-xl border transition-all duration-300 cursor-pointer shadow-sm ${
                          lockedTreeId === tree.id 
                            ? 'bg-primary/5 border-primary shadow-md' 
                            : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-md hover:-translate-y-1'
                        }`}
                        onMouseEnter={() => handleMouseEnter(tree.id)}
                        onMouseLeave={handleMouseLeave}
                      >
                        <Link
                          to={`/trees/${tree.id}`}
                          onClick={() => setCartDrawerOpen(false)}
                          className="shrink-0"
                        >
                          <img
                            src={img}
                            alt={tree.name}
                            className="w-16 h-16 rounded-lg object-cover"
                            onError={(e) => { e.target.src = PLACEHOLDER_IMG; }}
                          />
                        </Link>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <Link
                                to={`/trees/${tree.id}`}
                                onClick={() => setCartDrawerOpen(false)}
                                className="text-sm font-semibold text-gray-900 hover:text-primary truncate block transition-colors"
                              >
                                {tree.name}
                              </Link>
                              <p className="text-xs text-gray-500 capitalize">{tree.type}{tree.variety ? ` · ${tree.variety}` : ''}</p>
                              {locationParts.length > 0 && (
                                <p className="text-[11px] text-gray-400 mt-0.5">{locationParts.join(', ')}</p>
                              )}
                            </div>
                            <button
                              onClick={() => removeFromCart(tree.id)}
                              className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors shrink-0"
                              title="Remove"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                              </svg>
                            </button>
                          </div>
                          <div className="flex items-center justify-between mt-1.5">
                            <p className="text-sm font-bold text-gray-900">
                              ₹{itemTotal.toLocaleString('en-IN')}
                            </p>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                setSingleCheckoutItem(tree);
                                setCartDrawerOpen(false);
                                setShowCheckout(true);
                              }}
                              className="px-3 py-1 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg text-[11px] uppercase tracking-wider font-bold transition-colors"
                            >
                              Buy Now
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 px-6 py-4 space-y-3 bg-white">
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between text-gray-500">
                      <span>Season rates ({count} {count === 1 ? 'tree' : 'trees'})</span>
                      <span>₹{seasonSubtotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>Delivery fees</span>
                      <span>₹{deliverySubtotal.toLocaleString('en-IN')}</span>
                    </div>
                    <hr className="border-gray-100" />
                    <div className="flex justify-between font-bold text-gray-900">
                      <span>Total</span>
                      <span>₹{total.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => { 
                      setSingleCheckoutItem(null); 
                      setCartDrawerOpen(false); 
                      setShowCheckout(true); 
                    }}
                    className="w-full py-3.5 bg-linear-to-r from-primary to-emerald-600 text-white text-sm font-bold rounded-xl hover:brightness-105 transition-all shadow-md"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Checkout modal */}
      {showCheckout && (
        <CheckoutModal 
          onClose={() => {
            setShowCheckout(false);
            setSingleCheckoutItem(null);
          }} 
          specificItem={singleCheckoutItem}
        />
      )}
    </>
  );
}
