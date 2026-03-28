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
        setError('Map timed out. Your Mappls API token may be invalid or the network is unreachable.');
        setInitializing(false);
      }
    }, 12000);

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
  }, [mapId]);

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
          const markerOpts = {
            map: mapRef.current,
            position: { lat, lng },
            popupHtml: m.popupHtml || `<div style="padding:4px;font-size:13px;"><strong>${m.name || 'Tree'}</strong></div>`,
            popupOptions: { openPopup: validMarkers.length === 1, autoClose: true, maxWidth: 250 },
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

      if (validMarkers.length === 1 && center) {
        try { mapRef.current.setCenter({ lat: Number(center[0]), lng: Number(center[1]) }); } catch { /* ok */ }
        try { mapRef.current.setZoom(zoom || 14); } catch { /* ok */ }
      } else if (validMarkers.length > 1 && !center) {
        try {
          const lats = validMarkers.map((mk) => Number(mk.lat));
          const lngs = validMarkers.map((mk) => Number(mk.lng));
          mapRef.current.fitBounds(
            [[Math.min(...lats), Math.min(...lngs)], [Math.max(...lats), Math.max(...lngs)]],
            { padding: 60, maxZoom: 14 },
          );
        } catch { /* fitBounds not always available */ }
      }
    };

    const timer = setTimeout(addMarkers, 1200);
    return () => clearTimeout(timer);
  }, [loaded, markers, center, zoom, onMarkerClick]);

  if (error) {
    return (
      <div
        style={{ width: '100%', height }}
        className="flex flex-col items-center justify-center bg-red-50 border border-red-200 rounded-2xl text-sm text-red-600 gap-2 px-4"
      >
        <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
        <p className="text-center">{error}</p>
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
