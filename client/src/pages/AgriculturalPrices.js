import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiMapPin, FiCalendar, FiTrendingUp, FiFilter, FiRefreshCw } from 'react-icons/fi';
import PriceTable from '../components/PriceTable';
import AdvancedFilters from '../components/AdvancedFilters';
import SimpleFilters from '../components/SimpleFilters';

const AgriculturalPricesContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem 0;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 1rem;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: var(--gray-600);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
`;

const StatCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: var(--border-radius);
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  text-align: center;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

const StatIcon = styled.div`
  font-size: 2rem;
  color: var(--primary-color);
  margin-bottom: 1rem;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: var(--gray-800);
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: var(--gray-600);
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const FilterSection = styled.div`
  background: white;
  padding: 2rem;
  border-radius: var(--border-radius);
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
`;

const FilterToggleContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
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

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: var(--border-radius);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 1rem;

  &:hover {
    background: var(--primary-dark);
    transform: translateY(-1px);
  }
`;

const AgriculturalPrices = () => {
  const [filters, setFilters] = useState({
    categories: [],
    localities: [],
    products: [],
    period: '30',
    search: '',
    minPrice: '',
    maxPrice: ''
  });

  const [useAdvancedFilters, setUseAdvancedFilters] = useState(false);
  const [stats, setStats] = useState({
    totalPrices: 0,
    averagePrice: 0,
    priceRange: { min: 0, max: 0 },
    lastUpdate: null
  });

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleFiltersReset = () => {
    const resetFilters = {
      categories: [],
      localities: [],
      products: [],
      period: '30',
      search: '',
      minPrice: '',
      maxPrice: ''
    };
    setFilters(resetFilters);
  };

  const handleToggleFilters = (advanced) => {
    setUseAdvancedFilters(advanced);
    if (!advanced) {
      const simpleFilters = {
        categories: filters.categories || [],
        localities: filters.localities || [],
        search: filters.search || '',
        products: [],
        period: '30',
        minPrice: '',
        maxPrice: ''
      };
      setFilters(simpleFilters);
    }
  };

  const mapFiltersForAPI = (filters) => {
    const apiFilters = {};
    
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
    if (filters.period) apiFilters.days = parseInt(filters.period);
    
    apiFilters.limit = 100;
    apiFilters.status = 'validated';
    
    return apiFilters;
  };

  const handleRefresh = () => {
    // Force refresh of the price table
    window.location.reload();
  };

  return (
    <AgriculturalPricesContainer>
      <Container>
        <Header>
          <Title>Prix Agricoles</Title>
          <Subtitle>
            Consultez les prix des produits agricoles en temps réel à travers le Bénin. 
            Données validées et mises à jour régulièrement.
          </Subtitle>
        </Header>

        <StatsContainer>
          <StatCard>
            <StatIcon>
              <FiTrendingUp />
            </StatIcon>
            <StatValue>15+</StatValue>
            <StatLabel>Produits suivis</StatLabel>
          </StatCard>
          <StatCard>
            <StatIcon>
              <FiMapPin />
            </StatIcon>
            <StatValue>3</StatValue>
            <StatLabel>Régions couvertes</StatLabel>
          </StatCard>
          <StatCard>
            <StatIcon>
              <FiCalendar />
            </StatIcon>
            <StatValue>Quotidien</StatValue>
            <StatLabel>Mise à jour</StatLabel>
          </StatCard>
        </StatsContainer>

        <FilterSection>
          <RefreshButton onClick={handleRefresh}>
            <FiRefreshCw />
            Actualiser les données
          </RefreshButton>

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
              <FiFilter />
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
            <SimpleFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onReset={handleFiltersReset}
            />
          )}
        </FilterSection>

        <PriceTable
          filters={mapFiltersForAPI(filters)}
          onRefresh={handleRefresh}
          title="Prix des Produits Agricoles"
          showAgriculturalPrices={true}
        />
      </Container>
    </AgriculturalPricesContainer>
  );
};

export default AgriculturalPrices;
