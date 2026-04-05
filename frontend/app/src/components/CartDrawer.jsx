import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import useStore, { DELIVERY_FEE } from '../store/useStore';
import CheckoutModal from './CheckoutModal';

const PLACEHOLDER_IMG = 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=200&q=60';

export default function CartDrawer() {
  const { cart, cartDrawerOpen, setCartDrawerOpen, removeFromCart, getCartTotal, getCartCount } = useStore();
  const [showCheckout, setShowCheckout] = useState(false);
  const [singleCheckoutItem, setSingleCheckoutItem] = useState(null);
  const backdropRef = useRef(null);

  useEffect(() => {
    if (cartDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [cartDrawerOpen]);

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
                        className="flex gap-3 p-3 rounded-xl border transition-all duration-300 cursor-pointer shadow-sm border-gray-100 bg-white hover:border-gray-200 hover:shadow-md hover:-translate-y-1"
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
