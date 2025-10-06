import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { agriculturalPriceService } from '../services/api';
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

// Composant pour les marqueurs colorés
function PriceMarkers({ prices, onMarkerClick }) {
  const getMarkerColor = (price) => {
    const priceValue = parseFloat(price.price);
    if (priceValue < 1000) return '#22c55e'; // Vert pour prix bas
    if (priceValue < 2000) return '#eab308'; // Jaune pour prix moyen
    if (priceValue < 3000) return '#f97316'; // Orange pour prix élevé
    return '#ef4444'; // Rouge pour prix très élevé
  };

  const getMarkerSize = (price) => {
    const priceValue = parseFloat(price.price);
    if (priceValue < 1000) return 16;
    if (priceValue < 2000) return 20;
    if (priceValue < 3000) return 24;
    return 28;
  };

  const createCustomIcon = (price) => {
    const color = getMarkerColor(price);
    const size = getMarkerSize(price);
    const priceValue = parseFloat(price.price);
    
    return L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="
        background-color: ${color};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 3px 6px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${size > 20 ? '10px' : '8px'};
        font-weight: bold;
        color: white;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.7);
      ">${priceValue < 1000 ? 'B' : priceValue < 2000 ? 'M' : priceValue < 3000 ? 'H' : 'V'}</div>`,
      iconSize: [size, size],
      iconAnchor: [size/2, size/2]
    });
  };

  return (
    <>
      {prices.map((price) => {
        if (!price.latitude || !price.longitude) return null;
        
        const icon = createCustomIcon(price);
        
        return (
          <Marker
            key={price.id}
            position={[price.latitude, price.longitude]}
            icon={icon}
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
                    {new Intl.NumberFormat('fr-FR').format(price.price)} {price.unit_symbol}
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

const PriceMap = ({ 
  filters = {}, 
  onMarkerClick, 
  height = '400px',
  center = [14.6928, -17.4467], // Dakar par défaut
  zoom = 8 
}) => {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    // Debounce pour éviter les requêtes trop fréquentes
    const timeoutId = setTimeout(() => {
      fetchPrices();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [fetchPrices]);

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
    <div style={{ height, width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <MapCenter center={center} zoom={zoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <PriceMarkers prices={prices} onMarkerClick={onMarkerClick} />
      </MapContainer>
      
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
      </div>
    </div>
  );
};

export default PriceMap;
