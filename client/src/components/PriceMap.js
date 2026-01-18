import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { agriculturalPriceService, storeService, localityService, supplierService } from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import 'leaflet/dist/leaflet.css';

// Configuration des icônes Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Composant pour centrer la carte
function MapCenter({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);
  return null;
}

// Helpers visibilité
const formatK = (value) => {
  const v = Number(value) || 0;
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(v);
};



// Composant pour les marqueurs colorés
function PriceMarkers({ prices, onMarkerClick, jitter = false }) {
  const getMarkerColor = (price) => {
    const priceValue = parseFloat(price.price);
    if (priceValue < 1000) return '#22c55e'; // Vert pour prix bas
    if (priceValue < 2000) return '#eab308'; // Jaune pour prix moyen
    if (priceValue < 3000) return '#f97316'; // Orange pour prix élevé
    return '#ef4444'; // Rouge pour prix très élevé
  };

  const getMarkerSize = (price) => {
    const priceValue = parseFloat(price.price);
    if (priceValue < 1000) return 18;
    if (priceValue < 2000) return 22;
    if (priceValue < 3000) return 26;
    return 32;
  };

  const createCustomIcon = (price) => {
    const color = getMarkerColor(price);
    const size = getMarkerSize(price);
    const priceValue = parseFloat(price.price);
    return L.divIcon({
      className: 'custom-div-icon',
      html: '<div style="' +
        'background-color: ' + color + ';' +
        'width: ' + size + 'px;' +
        'height: ' + size + 'px;' +
        'border-radius: 50%;' +
        'border: 3px solid white;' +
        'box-shadow: 0 4px 8px rgba(0,0,0,0.45);' +
        'display: flex;' +
        'align-items: center;' +
        'justify-content: center;' +
        'font-size: ' + (size >= 26 ? '12px' : '11px') + ';' +
        'font-weight: 800;' +
        'color: white;' +
        'text-shadow: 1px 1px 2px rgba(0,0,0,0.6);' +
      '">' + formatK(priceValue) + '</div>',
      iconSize: [size, size],
      iconAnchor: [size/2, size/2]
    });
  };

  const jitterPosition = (lat, lon, id) => {
    // Petit décalage déterministe basé sur l'id pour éviter la superposition
    const angleDeg = (parseInt(id, 10) * 53) % 360;
    const angle = (angleDeg * Math.PI) / 180;
    const radius = 0.0015; // ~150m
    const dLat = radius * Math.cos(angle);
    const latRad = (lat * Math.PI) / 180;
    const dLon = (radius * Math.sin(angle)) / Math.max(Math.cos(latRad), 0.1);
    return [lat + dLat, lon + dLon];
  };

  return (
    <>
      {prices.map((price) => {
        if (!price.latitude || !price.longitude) return null;
        
        const icon = createCustomIcon(price);
        const position = jitter
          ? jitterPosition(price.latitude, price.longitude, price.id)
          : [price.latitude, price.longitude];
        
        return (
          <Marker
            key={price.id}
            position={position}
            icon={icon}
            zIndexOffset={500}
            eventHandlers={{
              click: () => onMarkerClick && onMarkerClick(price)
            }}
          >
            <Popup>
              <div style={{ minWidth: '250px', padding: '8px' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  marginBottom: '12px',
                  paddingBottom: '8px',
                  borderBottom: '1px solid #eee'
                }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    backgroundColor: getMarkerColor(price),
                    borderRadius: '50%'
                  }}></div>
                  <h4 style={{ margin: '0', color: '#333', fontSize: '16px' }}>
                    {price.product_name}
                  </h4>
                </div>
                
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ 
                    fontSize: '20px', 
                    fontWeight: 'bold', 
                    color: getMarkerColor(price),
                    marginBottom: '4px'
                  }}>
                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(price.price).replace('XOF', 'FCFA')}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    Prix par {price.unit_name || 'unité'}
                  </div>
                </div>
                
                <div style={{ marginBottom: '6px', fontSize: '14px' }}>
                  <strong>📍 Localité:</strong> {price.locality_name}
                </div>
                <div style={{ marginBottom: '6px', fontSize: '14px' }}>
                  <strong>📦 Catégorie:</strong> {price.category_name}
                </div>
                <div style={{ marginBottom: '6px', fontSize: '14px' }}>
                  <strong>🏷️ Type:</strong> {price.category_type || 'Non spécifié'}
                </div>
                <div style={{ 
                  fontSize: '12px', 
                  color: '#666', 
                  marginTop: '8px',
                  paddingTop: '8px',
                  borderTop: '1px solid #eee'
                }}>
                  📅 Mis à jour le {new Date(price.date).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}

// Composant pour les marqueurs de fournisseurs (magasins)
function SupplierMarkers({ stores, jitter = false, summaries = {}, onPopupOpen }) {
  const jitterPosition = (lat, lon, id) => {
    const angleDeg = (parseInt(id, 10) * 37) % 360;
    const angle = (angleDeg * Math.PI) / 180;
    const radius = 0.002;
    const dLat = radius * Math.cos(angle);
    const latRad = (lat * Math.PI) / 180;
    const dLon = (radius * Math.sin(angle)) / Math.max(Math.cos(latRad), 0.1);
    return [lat + dLat, lon + dLon];
  };
  const createSupplierIcon = (store) => {
    const size = 22;
    return L.divIcon({
      className: 'supplier-div-icon',
      html: `<div style="
        background-color: #2563eb;
        width: ${size}px;
        height: ${size}px;
        border-radius: 4px;
        border: 2px solid white;
        box-shadow: 0 3px 6px rgba(0,0,0,0.35);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        font-weight: 700;
        color: white;
        letter-spacing: 0.5px;
      ">S</div>`,
      iconSize: [size, size],
      iconAnchor: [size/2, size/2]
    });
  };

  return (
    <>
      {stores.map((store) => {
        if (!store.latitude || !store.longitude) return null;
        const icon = createSupplierIcon(store);
        const position = jitter
          ? jitterPosition(store.latitude, store.longitude, store.id)
          : [store.latitude, store.longitude];
        return (
          <Marker
            key={`store-${store.id}`}
            position={position}
            icon={icon}
            zIndexOffset={600}
            eventHandlers={{
              popupopen: () => {
                if (onPopupOpen) onPopupOpen(store.id);
              }
            }}
          >
            <Popup>
              <div style={{ minWidth: '220px', padding: '8px' }}>
                <h4 style={{ margin: 0, color: '#2563eb' }}>{store.name}</h4>
                {store.address && (
                  <div style={{ marginTop: '6px', fontSize: '13px', color: '#444' }}>
                    📍 {store.address}
                  </div>
                )}
                <div style={{ marginTop: '4px', fontSize: '12px', color: '#666' }}>
                  Ville: {store.city || '—'}
                </div>
                {store.phone && (
                  <div style={{ marginTop: '4px', fontSize: '12px', color: '#666' }}>
                    ☎️ {store.phone}
                  </div>
                )}
                {store.email && (
                  <div style={{ marginTop: '4px', fontSize: '12px', color: '#666' }}>
                    ✉️ {store.email}
                  </div>
                )}
                {store.__approxLocation && (
                  <div style={{ marginTop: '8px', fontSize: '11px', color: '#999' }}>
                    📌 Localisation approximative basée sur la ville
                  </div>
                )}
                <div style={{ marginTop: '10px', fontSize: '12px', color: '#333' }}>
                  <strong>Produits et prix:</strong>
                  {summaries[store.id]?.prices && summaries[store.id].prices.length > 0 ? (
                    <ul style={{ margin: '6px 0 0 0', padding: 0, listStyle: 'none' }}>
                      {summaries[store.id].prices.slice(0, 3).map((p) => (
                        <li key={`p-${store.id}-${p.price_id}`} style={{ marginBottom: '4px' }}>
                          {p.product_name} — {new Intl.NumberFormat('fr-FR').format(p.price)} FCFA
                          {p.unit_symbol ? `/${p.unit_symbol}` : p.unit_name ? `/${p.unit_name}` : ''}
                          <span style={{ color: '#777' }}> ({new Date(p.date).toLocaleDateString('fr-FR')})</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div style={{ marginTop: '4px', color: '#777' }}>—</div>
                  )}
                </div>
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#333' }}>
                  <strong>Disponibilités:</strong>
                  {summaries[store.id]?.availability && summaries[store.id].availability.length > 0 ? (
                    <ul style={{ margin: '6px 0 0 0', padding: 0, listStyle: 'none' }}>
                      {summaries[store.id].availability.slice(0, 2).map((a, idx) => (
                        <li key={`a-${store.id}-${a.product_id}-${idx}`} style={{ marginBottom: '4px' }}>
                          {a.product_name}: {a.is_available ? 'Disponible' : 'Indisponible'}
                          {a.available_quantity ? ` (${a.available_quantity} ${a.quantity_unit || ''})` : ''}
                          {a.expected_restock_date ? `, réappro. ${new Date(a.expected_restock_date).toLocaleDateString('fr-FR')}` : ''}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div style={{ marginTop: '4px', color: '#777' }}>—</div>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}

const PriceMap = ({ 
  filters = {}, 
  onMarkerClick, 
  height = '400px',
  center = [9.3077, 2.3158], // Centre du Bénin par défaut
  zoom = 7,
  disableInitialAutoFit = false
}) => {
  const [prices, setPrices] = useState([]);
  const [stores, setStores] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [supplierSummaries, setSupplierSummaries] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fitRequested, setFitRequested] = useState(false);

  // Normaliser les noms pour matcher villes/localités sans accents
  const normalizeName = useCallback((name) => {
    if (!name || typeof name !== 'string') return '';
    return name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }, []);

  // Mémoriser les filtres pour éviter les re-renders inutiles
  const memoizedFilters = useMemo(() => filters, [filters]);

  const fetchPrices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await agriculturalPriceService.getMap(memoizedFilters);
      setPrices(response.data.data || []);
    } catch (err) {
      console.error('Erreur lors du chargement des prix:', err);
      if (err.code === 'ERR_NETWORK') {
        setError('Erreur de connexion. Vérifiez que le serveur est démarré.');
      } else if (err.response?.status === 429) {
        setError('Trop de requêtes. Veuillez patienter un moment.');
      } else {
        setError('Erreur lors du chargement des données');
      }
    } finally {
      setLoading(false);
    }
  }, [memoizedFilters]);

  const fetchStores = useCallback(async () => {
    try {
      const [storesRes, localitiesRes] = await Promise.all([
        storeService.getAll(),
        localityService.getWithCoordinates()
      ]);

      const rawStores = Array.isArray(storesRes.data?.data)
        ? storesRes.data.data
        : (storesRes.data || []);

      const localities = Array.isArray(localitiesRes.data?.data)
        ? localitiesRes.data.data
        : (localitiesRes.data || []);

      const localityByName = new Map(
        localities.map((l) => [normalizeName(l.name), l])
      );

      const enrichedStores = rawStores.map((s) => {
        const hasCoords = s.latitude != null && s.longitude != null;
        if (hasCoords) return s;
        const key = normalizeName(s.city);
        const match = key ? localityByName.get(key) : undefined;
        if (match && match.latitude != null && match.longitude != null) {
          return {
            ...s,
            latitude: match.latitude,
            longitude: match.longitude,
            __approxLocation: true,
          };
        }
        return s;
      });

      setStores(enrichedStores);
    } catch (err) {
      console.error('Erreur lors du chargement des fournisseurs:', err);
      // On ne bloque pas l’affichage si les magasins ne sont pas disponibles
    }
  }, [normalizeName]);

  const fetchSuppliers = useCallback(async () => {
    try {
      const res = await supplierService.getAll();
      const raw = Array.isArray(res.data?.data) ? res.data.data : (res.data || []);
      const normalized = raw.map((s) => ({
        id: s.id,
        name: s.name,
        address: s.address || null,
        city: s.city || null,
        phone: s.phone || null,
        email: s.email || null,
        latitude: s.latitude,
        longitude: s.longitude,
        __approxLocation: Boolean(s.approx_location),
      }));
      setSuppliers(normalized);
    } catch (err) {
      console.error('Erreur lors du chargement des fournisseurs (table suppliers):', err);
    }
  }, []);

  useEffect(() => {
    // Debounce pour éviter les requêtes trop fréquentes
    const timeoutId = setTimeout(() => {
      fetchPrices();
      fetchStores();
      fetchSuppliers();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [fetchPrices, fetchStores]);

  const handleSupplierPopupOpen = useCallback(async (supplierId) => {
    try {
      if (supplierSummaries[supplierId]) return;
      const res = await supplierService.getSummary(supplierId);
      setSupplierSummaries((prev) => ({ ...prev, [supplierId]: res.data }));
    } catch (err) {
      console.error('Erreur lors du chargement du résumé fournisseur:', err);
    }
  }, [supplierSummaries]);

  const bounds = useMemo(() => {
    const pts = [];
    prices.forEach((p) => { if (p.latitude && p.longitude) pts.push([p.latitude, p.longitude]); });
    stores.forEach((s) => { if (s.latitude && s.longitude) pts.push([s.latitude, s.longitude]); });
    suppliers.forEach((s) => { if (s.latitude && s.longitude) pts.push([s.latitude, s.longitude]); });
    return pts.length ? L.latLngBounds(pts) : null;
  }, [prices, stores, suppliers]);

  if (loading) {
    return (
      <div style={{ 
        height, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        border: '1px solid #ddd',
        borderRadius: '8px'
      }}>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        height, 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        border: '1px solid #ddd',
        borderRadius: '8px',
        color: '#666',
        padding: '20px'
      }}>
        <div style={{ marginBottom: '10px' }}>{error}</div>
        <button 
          onClick={fetchPrices}
          style={{
            padding: '8px 16px',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div style={{ height, width: '100%', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <MapCenter center={center} zoom={zoom} />
        {bounds && (
          <FitBoundsOnData 
            bounds={bounds} 
            initialFitEnabled={!disableInitialAutoFit}
            fitRequested={fitRequested} 
            onDone={() => setFitRequested(false)} 
          />
        )}
        <TileLayer
          attribution='&copy; OpenStreetMap & CartoDB'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          errorTileUrl="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9W9Hq1kAAAAASUVORK5CYII="
          crossOrigin
        />
        <PriceMarkers prices={prices} onMarkerClick={onMarkerClick} jitter />
        <SupplierMarkers stores={stores} />
        <SupplierMarkers 
          stores={suppliers} 
          jitter 
          summaries={supplierSummaries}
          onPopupOpen={handleSupplierPopupOpen}
        />
      </MapContainer>
      
      {/* Stats overlay + action */}
      <div style={{
        position: 'absolute', top: '60px', left: '10px', zIndex: 1000,
        background: 'rgba(255,255,255,0.95)', padding: '10px 12px',
        borderRadius: '8px', boxShadow: '0 3px 6px rgba(0,0,0,0.25)', fontSize: '13px', color: '#333'
      }}>
        <div style={{ fontWeight: 700, marginBottom: '6px' }}>Résultats sur carte</div>
        <div style={{ marginBottom: '8px' }}>Prix: {prices.length} • Fournisseurs: {stores.length + suppliers.length}</div>
        <button onClick={() => setFitRequested(true)} style={{
          padding: '6px 10px', backgroundColor: '#2563eb', color: 'white',
          border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px'
        }}>
          Zoom sur résultats
        </button>
      </div>
      {/* Légende */}
      <div style={{
        position: 'absolute',
        bottom: '10px',
        right: '10px',
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '12px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
        fontSize: '12px',
        zIndex: 1000,
        minWidth: '180px'
      }}>
        <div style={{ marginBottom: '8px', fontWeight: 'bold', fontSize: '13px' }}>Légende des prix:</div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
          <div style={{ 
            width: '16px', 
            height: '16px', 
            backgroundColor: '#22c55e', 
            borderRadius: '50%', 
            marginRight: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '8px',
            fontWeight: 'bold',
            color: 'white'
          }}>B</div>
          <span>Bas (&lt; 1,000 FCFA)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
          <div style={{ 
            width: '20px', 
            height: '20px', 
            backgroundColor: '#eab308', 
            borderRadius: '50%', 
            marginRight: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            fontWeight: 'bold',
            color: 'white'
          }}>M</div>
          <span>Moyen (1,000-2,000 FCFA)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
          <div style={{ 
            width: '24px', 
            height: '24px', 
            backgroundColor: '#f97316', 
            borderRadius: '50%', 
            marginRight: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            fontWeight: 'bold',
            color: 'white'
          }}>H</div>
          <span>Élevé (2,000-3,000 FCFA)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ 
            width: '28px', 
            height: '28px', 
            backgroundColor: '#ef4444', 
            borderRadius: '50%', 
            marginRight: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            fontWeight: 'bold',
            color: 'white'
          }}>V</div>
          <span>Très élevé (&gt; 3,000 FCFA)</span>
        </div>
        <div style={{ marginTop: '10px', fontWeight: 'bold', fontSize: '13px' }}>Fournisseurs:</div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ 
            width: '22px', 
            height: '22px', 
            backgroundColor: '#2563eb', 
            borderRadius: '4px', 
            marginRight: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11px',
            fontWeight: 'bold',
            color: 'white'
          }}>S</div>
          <span>Fournisseurs (magasins et marchés)</span>
        </div>
        <div style={{ marginTop: '8px', fontSize: '11px', color: '#555' }}>
          Le nombre dans le rond correspond au prix en FCFA.
        </div>
      </div>
    </div>
  );
};

export default PriceMap;

function FitBoundsOnData({ bounds, fitRequested, onDone, initialFitEnabled = true }) {
  const map = useMap();
  const didAutoFitRef = useRef(false);
  useEffect(() => {
    if (bounds && !didAutoFitRef.current && initialFitEnabled) {
      map.fitBounds(bounds, { padding: [30, 30] });
      didAutoFitRef.current = true;
    }
  }, [map, bounds]);
  useEffect(() => {
    if (bounds && fitRequested) {
      map.fitBounds(bounds, { padding: [30, 30], maxZoom: 12 });
      onDone && onDone();
    }
  }, [map, bounds, fitRequested, onDone]);
  return null;
}
