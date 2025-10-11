import React, { useState } from 'react';
import styled from 'styled-components';
import { FiMapPin, FiFilter, FiRefreshCw } from 'react-icons/fi';
import PriceMap from '../components/PriceMap';
import AdvancedFilters from '../components/AdvancedFilters';

const PriceMapPageContainer = styled.div`
  min-height: 100vh;
  background: var(--gray-50);
`;

const PageHeader = styled.div`
  background: white;
  padding: 2rem 0;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const HeaderContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const PageTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--gray-800);
  margin: 0 0 0.5rem 0;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
`;

const PageSubtitle = styled.p`
  font-size: 1.1rem;
  color: var(--gray-600);
  text-align: center;
  margin: 0;
`;

const MapSection = styled.section`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1rem 2rem 1rem;
`;

const MapContainer = styled.div`
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow);
  padding: 1.5rem;
  margin-bottom: 2rem;
`;

const FiltersContainer = styled.div`
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow);
  padding: 1.5rem;
  margin-bottom: 2rem;
`;

const FilterToggleContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
`;

const FilterToggleButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: ${props => props.active ? 'var(--primary-color)' : 'white'};
  color: ${props => props.active ? 'white' : 'var(--gray-600)'};
  border: 1px solid ${props => props.active ? 'var(--primary-color)' : 'var(--gray-300)'};
  padding: 0.75rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &:first-child {
    border-radius: var(--border-radius) 0 0 var(--border-radius);
    border-right: none;
  }

  &:last-child {
    border-radius: 0 var(--border-radius) var(--border-radius) 0;
  }

  &:hover {
    background: ${props => props.active ? 'var(--primary-dark)' : 'var(--gray-50)'};
    color: ${props => props.active ? 'white' : 'var(--gray-700)'};
  }
`;

const MapWrapper = styled.div`
  position: relative;
  height: 70vh;
  min-height: 600px;
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const MapInfo = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(255, 255, 255, 0.95);
  padding: 10px 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  font-size: 14px;
  font-weight: 500;
  color: var(--gray-700);
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const PriceMapPage = () => {
  const [useAdvancedFilters, setUseAdvancedFilters] = useState(false);
  const [filters, setFilters] = useState({
    categories: [],
    localities: [],
    products: [],
    period: '7',
    search: '',
    minPrice: '',
    maxPrice: ''
  });

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleFiltersReset = () => {
    const resetFilters = {
      categories: [],
      localities: [],
      products: [],
      period: '7',
      search: '',
      minPrice: '',
      maxPrice: ''
    };
    setFilters(resetFilters);
  };

  const handleToggleFilters = (advanced) => {
    setUseAdvancedFilters(advanced);
  };

  const mapFiltersForAPI = (filters) => {
    const apiFilters = {};
    
    // Convertir les tableaux de catégories et localités en IDs
    if (filters.categories && filters.categories.length > 0) {
      apiFilters.category_id = filters.categories.map(cat => cat.id).join(',');
    }
    if (filters.localities && filters.localities.length > 0) {
      apiFilters.locality_id = filters.localities.map(loc => loc.id).join(',');
    }
    if (filters.products && filters.products.length > 0) {
      apiFilters.product_id = filters.products.map(prod => prod.id).join(',');
    }
    if (filters.search) apiFilters.search = filters.search;
    if (filters.minPrice) apiFilters.price_min = parseFloat(filters.minPrice);
    if (filters.maxPrice) apiFilters.price_max = parseFloat(filters.maxPrice);
    
    // Convertir le filtre de période en dates
    if (filters.period && filters.period !== '7') {
      const days = parseInt(filters.period);
      const today = new Date();
      const fromDate = new Date(today);
      fromDate.setDate(today.getDate() - days);
      
      // Formater les dates au format ISO (YYYY-MM-DD)
      apiFilters.date_from = fromDate.toISOString().split('T')[0];
      apiFilters.date_to = today.toISOString().split('T')[0];
    }
    
    return apiFilters;
  };

  const handleMarkerClick = (price) => {
    console.log('Prix sélectionné:', price);
    // Ici vous pouvez ajouter une logique pour afficher plus de détails
  };

  return (
    <PriceMapPageContainer>
      <PageHeader>
        <HeaderContent>
          <PageTitle>
            <FiMapPin />
            Carte des Prix Agricoles
          </PageTitle>
          <PageSubtitle>
            Visualisez la répartition géographique des prix des produits agricoles
          </PageSubtitle>
        </HeaderContent>
      </PageHeader>
      
      <MapSection>
        <FiltersContainer>
          <FilterToggleContainer>
            <FilterToggleButton 
              active={!useAdvancedFilters}
              onClick={() => handleToggleFilters(false)}
            >
              <FiFilter />
              Filtres simples
            </FilterToggleButton>
            <FilterToggleButton 
              active={useAdvancedFilters}
              onClick={() => handleToggleFilters(true)}
            >
              <FiRefreshCw />
              Filtres avancés
            </FilterToggleButton>
          </FilterToggleContainer>

          {useAdvancedFilters ? (
            <AdvancedFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onReset={handleFiltersReset}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--gray-600)' }}>
              Utilisez les filtres avancés pour affiner votre recherche sur la carte
            </div>
          )}
        </FiltersContainer>

        <MapContainer>
          <MapInfo>
            <FiMapPin />
            Cliquez sur les marqueurs pour voir les détails des prix
          </MapInfo>
          <MapWrapper>
            <PriceMap
              filters={mapFiltersForAPI(filters)}
              onMarkerClick={handleMarkerClick}
              height="100%"
              center={[9.3077, 2.3158]} // Centre du Bénin
              zoom={7} // Zoom adapté pour couvrir le Bénin
            />
          </MapWrapper>
        </MapContainer>
      </MapSection>
    </PriceMapPageContainer>
  );
};

export default PriceMapPage;
