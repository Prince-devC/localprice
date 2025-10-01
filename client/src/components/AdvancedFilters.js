import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import styled from 'styled-components';
import { FiSearch, FiX, FiFilter, FiRefreshCw } from 'react-icons/fi';
import { productCategoryService, localityService, productService } from '../services/api';

const FiltersContainer = styled.div`
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow);
  padding: 1.5rem;
  margin-bottom: 2rem;
`;

const FiltersHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const FiltersTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--gray-800);
  margin: 0;
`;

const ClearFiltersButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  color: var(--gray-500);
  border: 1px solid var(--gray-300);
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: var(--gray-50);
    color: var(--gray-700);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
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
  font-size: 0.875rem;
  background: white;
  color: var(--gray-700);
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &:hover {
    border-color: var(--gray-400);
  }
`;

const FilterInput = styled.input`
  padding: 0.75rem;
  border: 1px solid var(--gray-300);
  border-radius: var(--border-radius);
  font-size: 0.875rem;
  background: white;
  color: var(--gray-700);
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &:hover {
    border-color: var(--gray-400);
  }

  &::placeholder {
    color: var(--gray-400);
  }
`;

const SearchInputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const SearchIcon = styled(FiSearch)`
  position: absolute;
  left: 0.75rem;
  color: var(--gray-400);
  pointer-events: none;
`;

const SearchInput = styled(FilterInput)`
  padding-left: 2.5rem;
`;

const PeriodButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const PeriodButton = styled.button`
  padding: 0.5rem 1rem;
  border: 1px solid var(--gray-300);
  border-radius: var(--border-radius);
  background: ${props => props.active ? 'var(--primary-color)' : 'white'};
  color: ${props => props.active ? 'white' : 'var(--gray-700)'};
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.active ? 'var(--primary-dark)' : 'var(--gray-50)'};
  }
`;

const ActiveFiltersContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--gray-200);
`;

const ActiveFilterTag = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--primary-color);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
`;

const RemoveFilterButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  
  &:hover {
    opacity: 0.8;
  }
`;

const AdvancedFilters = ({ filters, onFiltersChange, onReset }) => {
  const [localFilters, setLocalFilters] = useState({
    categories: [],
    products: [],
    localities: [],
    period: '7',
    search: '',
    minPrice: '',
    maxPrice: '',
    ...filters
  });

  const { data: categoriesResponse } = useQuery(
    'product-categories',
    () => productCategoryService.getAll(),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const { data: localitiesResponse } = useQuery(
    'localities',
    () => localityService.getAll(),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const { data: productsResponse } = useQuery(
    'products',
    () => productService.getAll(),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Extraire les données de la réponse API
  const categories = categoriesResponse?.data || [];
  const localities = localitiesResponse?.data || [];
  const products = productsResponse?.data || [];

  console.log('AdvancedFilters: Categories loaded:', categories);
  console.log('AdvancedFilters: Localities loaded:', localities);
  console.log('AdvancedFilters: Products loaded:', products);
  console.log('AdvancedFilters: Current filters:', localFilters);
  

  const periodOptions = [
    { value: '1', label: '24h' },
    { value: '7', label: '7 jours' },
    { value: '30', label: '30 jours' },
    { value: '90', label: '3 mois' },
    { value: '365', label: '1 an' }
  ];

  // Synchroniser les filtres locaux avec les props
  useEffect(() => {
    setLocalFilters(prev => ({
      ...prev,
      ...filters
    }));
  }, [filters]);

  const handleFilterChange = (key, value) => {
    const newFilters = {
      ...localFilters,
      [key]: value
    };
    
    setLocalFilters(newFilters);
    
    // Appliquer les filtres immédiatement
    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      categories: [],
      products: [],
      localities: [],
      period: '7',
      search: '',
      minPrice: '',
      maxPrice: ''
    };
    
    setLocalFilters(clearedFilters);
    
    if (onReset) {
      onReset();
    }
    
    if (onFiltersChange) {
      onFiltersChange(clearedFilters);
    }
  };

  const getActiveFilters = () => {
    const active = [];
    
    if (localFilters.categories && localFilters.categories.length > 0) {
      localFilters.categories.forEach(category => {
        active.push({ key: `category-${category.id}`, label: `Catégorie: ${category.name}`, type: 'category', value: category });
      });
    }
    
    if (localFilters.products && localFilters.products.length > 0) {
      localFilters.products.forEach(product => {
        active.push({ key: `product-${product.id}`, label: `Produit: ${product.name}`, type: 'product', value: product });
      });
    }
    
    if (localFilters.localities && localFilters.localities.length > 0) {
      localFilters.localities.forEach(locality => {
        active.push({ key: `locality-${locality.id}`, label: `Localité: ${locality.name}`, type: 'locality', value: locality });
      });
    }
    
    if (localFilters.search) {
      active.push({ key: 'search', label: `Recherche: ${localFilters.search}`, type: 'search' });
    }
    
    if (localFilters.minPrice) {
      active.push({ key: 'minPrice', label: `Prix min: ${localFilters.minPrice} FCFA`, type: 'minPrice' });
    }
    
    if (localFilters.maxPrice) {
      active.push({ key: 'maxPrice', label: `Prix max: ${localFilters.maxPrice} FCFA`, type: 'maxPrice' });
    }
    
    if (localFilters.period && localFilters.period !== '7') {
      const period = periodOptions.find(p => p.value === localFilters.period);
      active.push({ key: 'period', label: `Période: ${period?.label || localFilters.period}`, type: 'period' });
    }
    
    return active;
  };

  const removeActiveFilter = (filter) => {
    switch (filter.type) {
      case 'category':
        const newCategories = localFilters.categories.filter(cat => cat.id !== filter.value.id);
        handleFilterChange('categories', newCategories);
        break;
      case 'product':
        const newProducts = localFilters.products.filter(prod => prod.id !== filter.value.id);
        handleFilterChange('products', newProducts);
        break;
      case 'locality':
        const newLocalities = localFilters.localities.filter(loc => loc.id !== filter.value.id);
        handleFilterChange('localities', newLocalities);
        break;
      case 'search':
        handleFilterChange('search', '');
        break;
      case 'minPrice':
        handleFilterChange('minPrice', '');
        break;
      case 'maxPrice':
        handleFilterChange('maxPrice', '');
        break;
      case 'period':
        handleFilterChange('period', '7');
        break;
      default:
        break;
    }
  };

  const activeFilters = getActiveFilters();

  return (
    <FiltersContainer>
      <FiltersHeader>
        <FiltersTitle>
          <FiFilter />
          Filtres avancés
        </FiltersTitle>
        <ClearFiltersButton 
          onClick={handleClearFilters}
          disabled={activeFilters.length === 0}
        >
          <FiRefreshCw />
          Réinitialiser
        </ClearFiltersButton>
      </FiltersHeader>

      <FiltersGrid>
        <FilterGroup>
          <FilterLabel>Recherche globale</FilterLabel>
          <SearchInputContainer>
            <SearchIcon />
            <SearchInput
              type="text"
              placeholder="Rechercher un produit, localité..."
              value={localFilters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </SearchInputContainer>
        </FilterGroup>

        <FilterGroup>
          <FilterLabel>Catégorie</FilterLabel>
          <FilterSelect
            value={localFilters.categories.length > 0 ? localFilters.categories[0].id : ''}
            onChange={(e) => {
              const selectedId = e.target.value;
              if (selectedId) {
                const selectedCategory = categories.find(cat => cat.id === parseInt(selectedId));
                if (selectedCategory) {
                  handleFilterChange('categories', [selectedCategory]);
                }
              } else {
                handleFilterChange('categories', []);
              }
            }}
          >
            <option value="">Sélectionner une catégorie...</option>
            {categories && Array.isArray(categories) && categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </FilterSelect>
        </FilterGroup>

        <FilterGroup>
          <FilterLabel>Produit</FilterLabel>
          <FilterSelect
            value={localFilters.products.length > 0 ? localFilters.products[0].id : ''}
            onChange={(e) => {
              const selectedId = e.target.value;
              if (selectedId) {
                const selectedProduct = products.find(prod => prod.id === parseInt(selectedId));
                if (selectedProduct) {
                  handleFilterChange('products', [selectedProduct]);
                }
              } else {
                handleFilterChange('products', []);
              }
            }}
          >
            <option value="">Sélectionner un produit...</option>
            {products && Array.isArray(products) && products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </FilterSelect>
        </FilterGroup>

        <FilterGroup>
          <FilterLabel>Localité</FilterLabel>
          <FilterSelect
            value={localFilters.localities.length > 0 ? localFilters.localities[0].id : ''}
            onChange={(e) => {
              const selectedId = e.target.value;
              if (selectedId) {
                const selectedLocality = localities.find(loc => loc.id === parseInt(selectedId));
                if (selectedLocality) {
                  handleFilterChange('localities', [selectedLocality]);
                }
              } else {
                handleFilterChange('localities', []);
              }
            }}
          >
            <option value="">Sélectionner une localité...</option>
            {localities && Array.isArray(localities) && localities.map((locality) => (
              <option key={locality.id} value={locality.id}>
                {locality.name}
              </option>
            ))}
          </FilterSelect>
        </FilterGroup>

        <FilterGroup>
          <FilterLabel>Prix minimum (FCFA)</FilterLabel>
          <FilterInput
            type="number"
            placeholder="0"
            value={localFilters.minPrice}
            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
          />
        </FilterGroup>

        <FilterGroup>
          <FilterLabel>Prix maximum (FCFA)</FilterLabel>
          <FilterInput
            type="number"
            placeholder="10000"
            value={localFilters.maxPrice}
            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
          />
        </FilterGroup>
      </FiltersGrid>

      <FilterGroup>
        <FilterLabel>Période</FilterLabel>
        <PeriodButtons>
          {periodOptions && Array.isArray(periodOptions) && periodOptions.map((option) => (
            <PeriodButton
              key={option.value}
              active={localFilters.period === option.value}
              onClick={() => handleFilterChange('period', option.value)}
            >
              {option.label}
            </PeriodButton>
          ))}
        </PeriodButtons>
      </FilterGroup>

      {activeFilters.length > 0 && (
        <ActiveFiltersContainer>
          {activeFilters && Array.isArray(activeFilters) && activeFilters.map((filter) => (
            <ActiveFilterTag key={filter.key}>
              {filter.label}
              <RemoveFilterButton onClick={() => removeActiveFilter(filter)}>
                <FiX size={14} />
              </RemoveFilterButton>
            </ActiveFilterTag>
          ))}
        </ActiveFiltersContainer>
      )}
    </FiltersContainer>
  );
};

export default AdvancedFilters;