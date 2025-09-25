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
    if (priceValue < 200) return 'green';
    if (priceValue < 300) return 'yellow';
    if (priceValue < 400) return 'orange';
    return 'red';
  };

  const createCustomIcon = (color) => {
    return L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="
        background-color: ${color};
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      "></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
  };

  return (
    <>
      {prices.map((price) => {
        if (!price.latitude || !price.longitude) return null;
        
        const color = getMarkerColor(price);
        const icon = createCustomIcon(color);
        
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
              <div style={{ minWidth: '200px' }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#333' }}>
                  {price.product_name}
                </h4>
                <p style={{ margin: '4px 0', fontSize: '14px' }}>
                  <strong>Prix:</strong> {price.price} {price.unit_symbol}
                </p>
                <p style={{ margin: '4px 0', fontSize: '14px' }}>
                  <strong>Localité:</strong> {price.locality_name}
                </p>
                <p style={{ margin: '4px 0', fontSize: '14px' }}>
                  <strong>Catégorie:</strong> {price.category_name}
                </p>
                <p style={{ margin: '4px 0', fontSize: '12px', color: '#666' }}>
                  {new Date(price.date).toLocaleDateString('fr-FR')}
                </p>
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
  const memoizedFilters = useMemo(() => filters, [
    filters.product_id,
    filters.category_id,
    filters.locality_id,
    filters.region_id,
    filters.date_from,
    filters.date_to,
    filters.min_price,
    filters.max_price
  ]);

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
        background: 'white',
        padding: '10px',
        borderRadius: '5px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        fontSize: '12px',
        zIndex: 1000
      }}>
        <div style={{ marginBottom: '5px', fontWeight: 'bold' }}>Légende des prix:</div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2px' }}>
          <div style={{ 
            width: '12px', 
            height: '12px', 
            backgroundColor: 'green', 
            borderRadius: '50%', 
            marginRight: '5px' 
          }}></div>
          <span>Moins de 200 FCFA</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2px' }}>
          <div style={{ 
            width: '12px', 
            height: '12px', 
            backgroundColor: 'yellow', 
            borderRadius: '50%', 
            marginRight: '5px' 
          }}></div>
          <span>200-300 FCFA</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2px' }}>
          <div style={{ 
            width: '12px', 
            height: '12px', 
            backgroundColor: 'orange', 
            borderRadius: '50%', 
            marginRight: '5px' 
          }}></div>
          <span>300-400 FCFA</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ 
            width: '12px', 
            height: '12px', 
            backgroundColor: 'red', 
            borderRadius: '50%', 
            marginRight: '5px' 
          }}></div>
          <span>Plus de 400 FCFA</span>
        </div>
      </div>
    </div>
  );
};

export default PriceMap;
