import React, { useState } from 'react';
import styled from 'styled-components';
import { FiSettings, FiFilter } from 'react-icons/fi';
import Hero from '../components/Hero';
import AdvancedFilters from '../components/AdvancedFilters';
import SimpleFilters from '../components/SimpleFilters';
import PriceTable from '../components/PriceTable';
import WhyChoose from '../components/WhyChoose';
import ProductCategories from '../components/ProductCategories';
import PricingPlans from '../components/PricingPlans';
import Contributor from '../components/Contributor';
import Testimonials from '../components/Testimonials';

const HomeContainer = styled.div`
  padding: 0;
`;

const Section = styled.section`
  margin-bottom: 4rem;
  padding: 0 1rem;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
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

const Home = () => {
  const [filters, setFilters] = useState({
    categories: [],
    localities: [],
    products: [],
    period: '7',
    search: '',
    minPrice: '',
    maxPrice: ''
  });

  const [useAdvancedFilters, setUseAdvancedFilters] = useState(false);

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
    // Réinitialiser les filtres lors du changement de mode
    if (!advanced) {
      // Garder seulement les filtres compatibles avec le mode simple
      const simpleFilters = {
        categories: filters.categories || [],
        localities: filters.localities || [],
        search: filters.search || '',
        products: [],
        period: '7',
        minPrice: '',
        maxPrice: ''
      };
      setFilters(simpleFilters);
    }
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
    if (filters.period) apiFilters.days = parseInt(filters.period);
    
    // Ajouter des paramètres par défaut pour l'API des prix agricoles
    apiFilters.limit = 50;
    apiFilters.status = 'validated';
    
    console.log('Mapped filters for API:', apiFilters);
    return apiFilters;
  };

  return (
    <HomeContainer>
      <Hero />
      
      <Section id="filters-section">
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
            <FiSettings />
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
        
        <PriceTable
          filters={mapFiltersForAPI(filters)}
          onRefresh={() => {
            // Optionnel: actions supplémentaires lors du rafraîchissement
          }}
        />
      </Section>

      <WhyChoose />
      
      <ProductCategories />
      
      <PricingPlans />
      
      <Contributor />
      
      <Testimonials />
    </HomeContainer>
  );
};

export default Home;
