import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { FiFilter, FiChevronDown } from 'react-icons/fi';
import { filterOptionsService } from '../services/api';

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

// Valeurs par défaut extraites pour éviter la répétition
const DEFAULT_FILTERS = {
  category: 'tous',
  product: 'tous',
  locality: 'tous',
  period: '7'
};

// Options de fallback en cas d'erreur API
const FALLBACK_OPTIONS = {
  categories: [
    { value: 'tous', label: 'Toutes les catégories' },
    { value: 'brut', label: 'Brut' },
    { value: 'transforme', label: 'Transformé' }
  ],
  products: [
    { value: 'tous', label: 'Tous les produits' },
    { value: 'riz', label: 'Riz' },
    { value: 'mais', label: 'Maïs' },
    { value: 'manioc', label: 'Manioc' }
  ],
  localities: [
    { value: 'tous', label: 'Toutes les localités' },
    { value: 'dakar', label: 'Dakar' },
    { value: 'thies', label: 'Thiès' }
  ],
  periods: [
    { value: '7', label: '7 derniers jours' },
    { value: '30', label: '30 derniers jours' },
    { value: '90', label: '3 derniers mois' }
  ]
};

const PriceFilters = ({ onFilterChange, filters }) => {
  // Initialisation avec les valeurs par défaut ou les filtres passés en props
  const [localFilters, setLocalFilters] = useState(() => ({
    category: filters?.category || DEFAULT_FILTERS.category,
    product: filters?.product || DEFAULT_FILTERS.product,
    locality: filters?.locality || DEFAULT_FILTERS.locality,
    period: filters?.period || DEFAULT_FILTERS.period
  }));

  const [filterOptions, setFilterOptions] = useState({
    categories: [],
    products: [],
    localities: [],
    periods: []
  });

  const [loading, setLoading] = useState(true);

  // Mise à jour des filtres locaux quand les props changent
  useEffect(() => {
    setLocalFilters(prevFilters => ({
      category: filters?.category || prevFilters.category,
      product: filters?.product || prevFilters.product,
      locality: filters?.locality || prevFilters.locality,
      period: filters?.period || prevFilters.period
    }));
  }, [filters]);

  // Charger les options de filtres depuis la base de données
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        setLoading(true);
        const response = await filterOptionsService.getAll();
        
        if (response.data.success) {
          const { categories, products, localities, periods } = response.data.data;
          
          setFilterOptions({
            categories: [
              { value: 'tous', label: 'Toutes les catégories' },
              ...categories.map(cat => ({
                value: cat.category_id.toString(),
                label: cat.display_name
              }))
            ],
            products: [
              { value: 'tous', label: 'Tous les produits' },
              ...products.map(prod => ({
                value: prod.product_id.toString(),
                label: prod.display_name
              }))
            ],
            localities: [
              { value: 'tous', label: 'Toutes les localités' },
              ...localities.map(loc => ({
                value: loc.locality_id.toString(),
                label: loc.display_name
              }))
            ],
            periods: periods.map(per => ({
              value: per.period_key,
              label: per.display_name
            }))
          });
        }
      } catch (error) {
        console.error('Erreur lors du chargement des options de filtres:', error);
        // Fallback vers les options statiques en cas d'erreur
        setFilterOptions(FALLBACK_OPTIONS);
      } finally {
        setLoading(false);
      }
    };

    loadFilterOptions();
  }, []);

  // Optimisation avec useCallback pour éviter de recréer la fonction à chaque rendu
  const handleFilterChange = useCallback((filterType, value) => {
    const newFilters = {
      ...localFilters,
      [filterType]: value
    };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  }, [localFilters, onFilterChange]);

  // Mémorisation des options pour éviter les re-rendus inutiles
  const memoizedFilterOptions = useMemo(() => filterOptions, [filterOptions]);

  return (
    <FiltersContainer>
      <FiltersContent>
        <FiltersTitle>
          <FiFilter />
          Filtres
        </FiltersTitle>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
            Chargement des options de filtres...
          </div>
        ) : (
          <FiltersGrid>
            <FilterGroup>
              <FilterLabel htmlFor="category-filter">Catégorie</FilterLabel>
              <FilterSelect
                id="category-filter"
                value={localFilters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                aria-label="Sélectionner une catégorie de produit"
              >
                {memoizedFilterOptions.categories.map(category => (
                  <FilterOption key={category.value} value={category.value}>
                    {category.label}
                  </FilterOption>
                ))}
              </FilterSelect>
            </FilterGroup>

            <FilterGroup>
              <FilterLabel htmlFor="product-filter">Produit</FilterLabel>
              <FilterSelect
                id="product-filter"
                value={localFilters.product}
                onChange={(e) => handleFilterChange('product', e.target.value)}
                aria-label="Sélectionner un produit"
              >
                {memoizedFilterOptions.products.map(product => (
                  <FilterOption key={product.value} value={product.value}>
                    {product.label}
                  </FilterOption>
                ))}
              </FilterSelect>
            </FilterGroup>

            <FilterGroup>
              <FilterLabel htmlFor="locality-filter">Localité</FilterLabel>
              <FilterSelect
                id="locality-filter"
                value={localFilters.locality}
                onChange={(e) => handleFilterChange('locality', e.target.value)}
                aria-label="Sélectionner une localité"
              >
                {memoizedFilterOptions.localities.map(locality => (
                  <FilterOption key={locality.value} value={locality.value}>
                    {locality.label}
                  </FilterOption>
                ))}
              </FilterSelect>
            </FilterGroup>

            <FilterGroup>
              <FilterLabel htmlFor="period-filter">Période</FilterLabel>
              <FilterSelect
                id="period-filter"
                value={localFilters.period}
                onChange={(e) => handleFilterChange('period', e.target.value)}
                aria-label="Sélectionner une période"
              >
                {memoizedFilterOptions.periods.map(period => (
                  <FilterOption key={period.value} value={period.value}>
                    {period.label}
                  </FilterOption>
                ))}
              </FilterSelect>
            </FilterGroup>
          </FiltersGrid>
        )}
      </FiltersContent>
    </FiltersContainer>
  );
};

export default PriceFilters;
