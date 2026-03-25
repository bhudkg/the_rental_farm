import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import BookingModal from '../components/BookingModal';
import DateRangePicker from '../components/DateRangePicker';
import { checkAvailability, fetchTree } from '../services/api';

const PLACEHOLDER_IMG = 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=800&q=80';

export default function TreeDetail() {
  const { id } = useParams();
  const [tree, setTree] = useState(null);
  const [loading, setLoading] = useState(true);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [availability, setAvailability] = useState(null);
  const [checking, setChecking] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchTree(id)
      .then(setTree)
      .finally(() => setLoading(false));
  }, [id]);

  const handleCheckAvailability = async () => {
    if (!startDate || !endDate) return;
    setChecking(true);
    setAvailability(null);
    try {
      const result = await checkAvailability(id, startDate, endDate);
      setAvailability(result);
    } catch {
      setAvailability({ available: false, error: true });
    } finally {
      setChecking(false);
    }
  };

  const totalDays = startDate && endDate
    ? Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24))
    : 0;
  const totalPrice = tree ? totalDays * tree.price_per_day : 0;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="animate-pulse grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="bg-gray-100 rounded-2xl aspect-square" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-100 rounded w-2/3" />
            <div className="h-4 bg-gray-100 rounded w-1/3" />
            <div className="h-20 bg-gray-100 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!tree) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 text-lg">Tree not found</p>
        <Link to="/trees" className="text-primary font-medium mt-4 inline-block">&larr; Back to trees</Link>
      </div>
    );
  }

  const locationParts = [tree.location, tree.city, tree.state].filter(Boolean);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link to="/trees" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to trees
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Image */}
        <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100">
          <img
            src={tree.image_url || PLACEHOLDER_IMG}
            alt={tree.name}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.src = PLACEHOLDER_IMG; }}
          />
        </div>

        {/* Details */}
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm font-semibold rounded-full capitalize">
              {tree.type}
            </span>
            {tree.variety && (
              <span className="text-sm text-gray-500">{tree.variety}</span>
            )}
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">{tree.name}</h1>

          {/* Location */}
          {locationParts.length > 0 && (
            <div className="flex items-center gap-1.5 mb-3">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              <span className="text-sm text-gray-500">{locationParts.join(', ')}</span>
            </div>
          )}

          {/* Speciality badge */}
          {tree.speciality && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 mb-4">
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-0.5">Speciality</p>
              <p className="text-sm text-amber-800">{tree.speciality}</p>
            </div>
          )}

          <p className="text-gray-500 mb-6 leading-relaxed">{tree.description}</p>

          {/* Info grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-[11px] text-gray-400 mb-0.5">Daily Rate</p>
              <p className="text-lg font-bold text-gray-900">₹{tree.price_per_day}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-[11px] text-gray-400 mb-0.5">Monthly Rate</p>
              <p className="text-lg font-bold text-gray-900">₹{tree.price_per_month}</p>
            </div>
            {tree.price_per_season && (
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-3">
                <p className="text-[11px] text-primary mb-0.5">Season Rate</p>
                <p className="text-lg font-bold text-primary">₹{tree.price_per_season.toLocaleString()}</p>
              </div>
            )}
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-[11px] text-gray-400 mb-0.5">Deposit</p>
              <p className="text-lg font-bold text-gray-900">₹{tree.deposit}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-[11px] text-gray-400 mb-0.5">Size</p>
              <p className="text-lg font-bold text-gray-900">{tree.size}</p>
            </div>
            {tree.min_quantity > 1 && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                <p className="text-[11px] text-blue-500 mb-0.5">Min Guarantee</p>
                <p className="text-lg font-bold text-blue-700">{tree.min_quantity} trees</p>
              </div>
            )}
          </div>

          {/* Date selection */}
          <div className="border border-gray-200 rounded-2xl p-6 space-y-5">
            <h3 className="font-semibold text-gray-900">Select Rental Dates</h3>

            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onStartChange={(d) => { setStartDate(d); setAvailability(null); }}
              onEndChange={(d) => { setEndDate(d); setAvailability(null); }}
            />

            <button
              onClick={handleCheckAvailability}
              disabled={!startDate || !endDate || checking}
              className="w-full py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {checking ? 'Checking...' : 'Check Availability'}
            </button>

            {availability && (
              <div
                className={`p-4 rounded-xl text-sm font-medium ${
                  availability.available
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {availability.available ? (
                  <>
                    Available! {totalDays} days &times; ₹{tree.price_per_day}/day ={' '}
                    <span className="font-bold">₹{totalPrice.toFixed(2)}</span>
                  </>
                ) : (
                  'Sorry, this tree is not available for the selected dates.'
                )}
              </div>
            )}

            {availability?.available && (
              <button
                onClick={() => setShowModal(true)}
                className="w-full py-3.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20"
              >
                Book Now &mdash; ₹{totalPrice.toFixed(2)}
              </button>
            )}
          </div>

          {/* Extra info */}
          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0H21M3.375 14.25h17.25" />
              </svg>
              Free delivery
            </span>
            {tree.maintenance_required && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                </svg>
                Maintenance included
              </span>
            )}
            <span>{tree.available_quantity} in stock</span>
          </div>
        </div>
      </div>

      {showModal && (
        <BookingModal
          tree={tree}
          startDate={startDate}
          endDate={endDate}
          totalPrice={totalPrice}
          deposit={tree.deposit}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
