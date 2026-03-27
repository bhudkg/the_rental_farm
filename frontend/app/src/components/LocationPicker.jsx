import { useCallback, useEffect, useState } from 'react';
import { geocodeAddress } from '../services/api';
import MapplsMap from './MapplsMap';

export default function LocationPicker({ city, state, latitude, longitude, onChange }) {
  const [detecting, setDetecting] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [error, setError] = useState(null);

  const hasCoords = latitude != null && longitude != null && latitude !== '' && longitude !== '';
  const lat = hasCoords ? parseFloat(latitude) : null;
  const lng = hasCoords ? parseFloat(longitude) : null;

  const handleDetectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setDetecting(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setDetecting(false);
      },
      (err) => {
        const messages = {
          1: 'Location permission denied. Please allow location access in your browser.',
          2: 'Unable to determine your location. Please try again.',
          3: 'Location request timed out. Please try again.',
        };
        setError(messages[err.code] || 'Failed to detect location.');
        setDetecting(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }, [onChange]);

  useEffect(() => {
    if (hasCoords) return;
    if (!city || !state) return;

    const timer = setTimeout(async () => {
      setGeocoding(true);
      const result = await geocodeAddress(`${city}, ${state}, India`);
      if (result) {
        onChange({ latitude: result.lat, longitude: result.lng });
      }
      setGeocoding(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [city, state, hasCoords, onChange]);

  return (
    <div className="space-y-3">
      {/* Actions row */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          type="button"
          onClick={handleDetectLocation}
          disabled={detecting}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-primary border border-primary/30 rounded-xl hover:bg-primary/5 transition-colors disabled:opacity-50"
        >
          {detecting ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Detecting...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              Use my current location
            </>
          )}
        </button>

        {geocoding && (
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Looking up city coordinates...
          </span>
        )}

        {hasCoords && !geocoding && (
          <span className="text-xs text-green-600 flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Location detected ({lat.toFixed(4)}, {lng.toFixed(4)})
          </span>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}

      {/* Map preview */}
      {hasCoords && (
        <MapplsMap
          center={[lat, lng]}
          zoom={12}
          height="200px"
          mapId="location-picker-map"
          markers={[{
            id: 'picked',
            lat,
            lng,
            name: 'Tree location',
            popupHtml: `<div style="padding:4px;font-size:13px;font-family:system-ui,sans-serif;"><strong>Tree location</strong><br/><span style="color:#666;">${[city, state].filter(Boolean).join(', ')}</span></div>`,
          }]}
        />
      )}

      {!hasCoords && !geocoding && !detecting && (
        <p className="text-xs text-gray-400">
          Click "Use my current location" or fill in City &amp; State above to auto-detect coordinates.
        </p>
      )}
    </div>
  );
}
