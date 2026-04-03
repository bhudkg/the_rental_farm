import { mappls } from 'mappls-web-maps';
import { Component, useEffect, useRef, useState } from 'react';

const MAPPLS_TOKEN = import.meta.env.VITE_MAPPLS_TOKEN;
const INDIA_CENTER = [22.5, 78.9];

let sdk = null;
try {
  sdk = new mappls();
} catch {
  /* SDK failed to instantiate */
}

class MapErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMsg: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, errorMsg: error?.message || 'Map failed to render' };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{ width: '100%', height: this.props.height || '500px' }}
          className="flex flex-col items-center justify-center bg-red-50 border border-red-200 rounded-2xl text-sm text-red-600 gap-2 px-4"
        >
          <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <p className="text-center">Map could not be loaded. Please check your Mappls API token.</p>
          <p className="text-xs text-red-400">{this.state.errorMsg}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

function MapplsMapInner({
  center,
  zoom = 5,
  markers = [],
  height = '500px',
  mapId = 'mappls-map',
  onMarkerClick,
}) {
  const mapRef = useRef(null);
  const markerRefs = useRef([]);
  const initTimerRef = useRef(null);
  const mountedRef = useRef(true);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (!MAPPLS_TOKEN) {
      setError('Mappls token not configured. Add VITE_MAPPLS_TOKEN to your .env file.');
      setInitializing(false);
      return;
    }

    if (!sdk) {
      setError('Mappls SDK failed to load.');
      setInitializing(false);
      return;
    }

    setInitializing(true);
    setLoaded(false);
    setError(null);

    initTimerRef.current = setTimeout(() => {
      if (mountedRef.current && !loaded) {
        setError('Map timed out. Your Mappls API token may be invalid or expired. Regenerate it at mappls.com/api.');
        setInitializing(false);
      }
    }, 20000);

    try {
      sdk.initialize(MAPPLS_TOKEN, { map: true }, () => {
        if (!mountedRef.current) return;

        try {
          if (mapRef.current) {
            try { mapRef.current.remove(); } catch { /* ok */ }
            mapRef.current = null;
          }

          const el = document.getElementById(mapId);
          if (!el) return;

          const mapInstance = sdk.Map({
            id: mapId,
            properties: {
              center: center || INDIA_CENTER,
              zoom,
              zoomControl: true,
              location: true,
            },
          });

          if (!mapInstance || typeof mapInstance.on !== 'function') {
            clearTimeout(initTimerRef.current);
            if (mountedRef.current) {
              setError('Map creation failed. Your API token may be invalid.');
              setInitializing(false);
            }
            return;
          }

          mapRef.current = mapInstance;

          mapInstance.on('load', () => {
            clearTimeout(initTimerRef.current);
            if (mountedRef.current) {
              setLoaded(true);
              setInitializing(false);
            }
          });
        } catch (innerErr) {
          clearTimeout(initTimerRef.current);
          if (mountedRef.current) {
            setError(`Map init error: ${innerErr.message}`);
            setInitializing(false);
          }
        }
      });
    } catch (outerErr) {
      clearTimeout(initTimerRef.current);
      setError(`SDK error: ${outerErr.message}`);
      setInitializing(false);
    }

    return () => {
      clearTimeout(initTimerRef.current);
      markerRefs.current.forEach((m) => {
        try { m.remove?.(); } catch { /* ok */ }
      });
      markerRefs.current = [];
      if (mapRef.current) {
        try { mapRef.current.remove(); } catch { /* ok */ }
        mapRef.current = null;
      }
    };
  }, [mapId, retryCount]);

  useEffect(() => {
    if (!loaded || !mapRef.current || !sdk) return;

    const addMarkers = (attempt = 1) => {
      markerRefs.current.forEach((m) => {
        try { m.remove?.(); } catch { /* ok */ }
      });
      markerRefs.current = [];

      const validMarkers = markers.filter((m) => m.lat != null && m.lng != null);
      if (validMarkers.length === 0) return;

      let anyCreated = false;

      validMarkers.forEach((m) => {
        const lat = Number(m.lat);
        const lng = Number(m.lng);
        if (Number.isNaN(lat) || Number.isNaN(lng)) return;

        try {
          const label = m.label || m.name || 'Tree';
          const markerOpts = {
            map: mapRef.current,
            position: { lat, lng },
            html: '<table style="border-collapse:collapse;cursor:pointer;"><tr><td style="background:#fff;border-radius:20px;padding:6px 14px 6px 10px;font-size:12px;font-weight:600;color:#15803d;white-space:nowrap;box-shadow:0 2px 10px rgba(0,0,0,0.18);font-family:system-ui,sans-serif;">' + (m.icon ? '<img src="' + m.icon + '" style="width:16px;height:16px;vertical-align:middle;margin-right:6px;" alt=""/>' : '<span style="font-size:14px;vertical-align:middle;margin-right:5px;">🌳</span>') + '<span style="vertical-align:middle;">' + label + '</span></td></tr><tr><td style="text-align:center;"><div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:6px solid #fff;margin:0 auto;filter:drop-shadow(0 1px 1px rgba(0,0,0,0.1));"></div></td></tr></table>',
            popupHtml: m.popupHtml || `<div style="padding:4px;font-size:13px;"><strong>${m.name || 'Tree'}</strong></div>`,
            popupOptions: { openPopup: false, autoClose: true, maxWidth: 250 },
          };

          const marker = typeof sdk.Marker === 'function'
            ? sdk.Marker(markerOpts)
            : sdk.marker(markerOpts);

          if (onMarkerClick && marker && typeof marker.addListener === 'function') {
            marker.addListener('click', () => onMarkerClick(m));
          }
          if (marker) {
            markerRefs.current.push(marker);
            anyCreated = true;
          }
        } catch { /* skip bad marker */ }
      });

      if (!anyCreated && attempt < 3) {
        setTimeout(() => addMarkers(attempt + 1), 800 * attempt);
        return;
      }

      const lats = validMarkers.map((mk) => Number(mk.lat));
      const lngs = validMarkers.map((mk) => Number(mk.lng));
      const avgLat = lats.reduce((a, b) => a + b, 0) / lats.length;
      const avgLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;

      try { mapRef.current.setCenter({ lat: avgLat, lng: avgLng }); } catch { /* ok */ }

      if (validMarkers.length === 1) {
        try { mapRef.current.setZoom(13); } catch { /* ok */ }
      } else {
        const latSpread = Math.max(...lats) - Math.min(...lats);
        const lngSpread = Math.max(...lngs) - Math.min(...lngs);
        const spread = Math.max(latSpread, lngSpread);
        const zoomLevel = spread < 0.01 ? 14 : spread < 0.05 ? 13 : spread < 0.1 ? 12 : spread < 0.5 ? 11 : spread < 1 ? 9 : 7;
        try { mapRef.current.setZoom(zoomLevel); } catch { /* ok */ }
      }
    };

    const timer = setTimeout(addMarkers, 1200);
    return () => clearTimeout(timer);
  }, [loaded, markers, center, zoom, onMarkerClick]);

  if (error) {
    return (
      <div
        style={{ width: '100%', height }}
        className="flex flex-col items-center justify-center bg-red-50 border border-red-200 rounded-2xl text-sm text-red-600 gap-3 px-6"
      >
        <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
        <p className="text-center">{error}</p>
        <button
          onClick={() => setRetryCount((c) => c + 1)}
          className="px-4 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-medium rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height }}>
      {initializing && (
        <div
          style={{ position: 'absolute', inset: 0, zIndex: 10 }}
          className="flex flex-col items-center justify-center bg-gray-50 rounded-2xl gap-2"
        >
          <svg className="w-6 h-6 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-xs text-gray-400">Loading map...</p>
        </div>
      )}
      <div
        id={mapId}
        style={{ width: '100%', height, borderRadius: '16px', overflow: 'hidden' }}
      />
    </div>
  );
}

export default function MapplsMap(props) {
  return (
    <MapErrorBoundary height={props.height}>
      <MapplsMapInner {...props} />
    </MapErrorBoundary>
  );
}
