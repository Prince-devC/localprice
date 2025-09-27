import React, { useState } from 'react';
import styled from 'styled-components';
import { FiFilter, FiChevronDown } from 'react-icons/fi';

const FiltersContainer = styled.div`
  position: sticky;
  top: 80px;
  background: white;
  border-bottom: 1px solid var(--gray-200);
  padding: 1rem 0;
  z-index: 100;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  
  @media (max-width: 480px) {
    top: 70px;
  }
`;

const FiltersContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const FiltersTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--gray-800);
  margin-bottom: 1rem;
`;

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FilterLabel = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--gray-700);
`;

const FilterSelect = styled.select`
  padding: 0.75rem;
  border: 1px solid var(--gray-300);
  border-radius: var(--border-radius);
  background: white;
  font-size: 0.875rem;
  color: var(--gray-700);
  cursor: pointer;
  transition: var(--transition);
  
  &:hover {
    border-color: var(--gray-400);
  }
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const FilterOption = styled.option`
  padding: 0.5rem;
`;

const PriceFilters = ({ onFilterChange, filters }) => {
  const [localFilters, setLocalFilters] = useState({
    category: filters?.category || 'tous',
    product: filters?.product || 'tous',
    locality: filters?.locality || 'tous',
    period: filters?.period || '7'
  });

  const handleFilterChange = (filterType, value) => {
    const newFilters = {
      ...localFilters,
      [filterType]: value
    };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const categories = [
    { value: 'tous', label: 'Tous' },
    { value: 'brut', label: 'Brut' },
    { value: 'transforme', label: 'Transformé' }
  ];

  const products = [
    { value: 'tous', label: 'Tous les produits' },
    { value: 'mais', label: 'Maïs' },
    { value: 'riz', label: 'Riz' },
    { value: 'manioc', label: 'Manioc' },
    { value: 'piment', label: 'Piment' },
    { value: 'arachide', label: 'Arachide' },
    { value: 'lait', label: 'Lait' },
    { value: 'huile-palme', label: 'Huile de palme' }
  ];

  const localities = [
    { value: 'tous', label: 'Toutes les localités' },
    { value: 'cotonou', label: 'Cotonou' },
    { value: 'porto-novo', label: 'Porto-Novo' },
    { value: 'parakou', label: 'Parakou' },
    { value: 'abomey-calavi', label: 'Abomey-Calavi' },
    { value: 'djougou', label: 'Djougou' },
    { value: 'bohicon', label: 'Bohicon' },
    { value: 'natitingou', label: 'Natitingou' },
    { value: 'lokossa', label: 'Lokossa' }
  ];

  const periods = [
    { value: '7', label: '7 derniers jours' },
    { value: '30', label: '30 derniers jours' },
    { value: '90', label: '3 derniers mois' }
  ];

  return (
    <FiltersContainer>
      <FiltersContent>
        <FiltersTitle>
          <FiFilter />
          Filtres
        </FiltersTitle>
        <FiltersGrid>
          <FilterGroup>
            <FilterLabel>Catégorie</FilterLabel>
            <FilterSelect
              value={localFilters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              {categories.map(category => (
                <FilterOption key={category.value} value={category.value}>
                  {category.label}
                </FilterOption>
              ))}
            </FilterSelect>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>Produit</FilterLabel>
            <FilterSelect
              value={localFilters.product}
              onChange={(e) => handleFilterChange('product', e.target.value)}
            >
              {products.map(product => (
                <FilterOption key={product.value} value={product.value}>
                  {product.label}
                </FilterOption>
              ))}
            </FilterSelect>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>Localité</FilterLabel>
            <FilterSelect
              value={localFilters.locality}
              onChange={(e) => handleFilterChange('locality', e.target.value)}
            >
              {localities.map(locality => (
                <FilterOption key={locality.value} value={locality.value}>
                  {locality.label}
                </FilterOption>
              ))}
            </FilterSelect>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>Période</FilterLabel>
            <FilterSelect
              value={localFilters.period}
              onChange={(e) => handleFilterChange('period', e.target.value)}
            >
              {periods.map(period => (
                <FilterOption key={period.value} value={period.value}>
                  {period.label}
                </FilterOption>
              ))}
            </FilterSelect>
          </FilterGroup>
        </FiltersGrid>
      </FiltersContent>
    </FiltersContainer>
  );
};

export default PriceFilters;
