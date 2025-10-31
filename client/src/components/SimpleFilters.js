import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import styled from 'styled-components';
import { FiSearch, FiX } from 'react-icons/fi';
import { productCategoryService, localityService } from '../services/api';

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

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 2.5rem;
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

const ClearButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gray-100);
  color: var(--gray-600);
  border: 1px solid var(--gray-300);
  padding: 0.75rem 1rem;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.875rem;
  min-width: 120px;

  &:hover {
    background: var(--gray-200);
    color: var(--gray-700);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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

const SimpleFilters = ({ filters, onFiltersChange, onReset }) => {
  const [localFilters, setLocalFilters] = useState({
    categories: [],
    localities: [],
    search: '',
    ...filters
  });

  const { data: categoriesResponse, isLoading: categoriesLoading, isError: categoriesErrorFlag, error: categoriesError } = useQuery(
    'product-categories',
    () => productCategoryService.getAll(),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      onError: (error) => console.error('Error loading categories:', error),
    }
  );

  const { data: localitiesResponse, isLoading: localitiesLoading, isError: localitiesErrorFlag, error: localitiesError } = useQuery(
    'localities',
    () => localityService.getAll(),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      onError: (error) => console.error('Error loading localities:', error),
    }
  );

  // Extraire les données des réponses API
  const categories = categoriesResponse?.data?.data || [];
  const localities = localitiesResponse?.data?.data || [];

  console.log('SimpleFilters: Categories loaded:', categories);
  console.log('SimpleFilters: Localities loaded:', localities);
  console.log('SimpleFilters: Categories loading:', categoriesLoading, 'Error:', categoriesErrorFlag, categoriesError);
  console.log('SimpleFilters: Localities loading:', localitiesLoading, 'Error:', localitiesErrorFlag, localitiesError);
  

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
      localities: [],
      search: ''
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
    
    if (localFilters.localities && localFilters.localities.length > 0) {
      localFilters.localities.forEach(locality => {
        active.push({ key: `locality-${locality.id}`, label: `Localité: ${locality.name}`, type: 'locality', value: locality });
      });
    }
    
    if (localFilters.search) {
      active.push({ key: 'search', label: `Recherche: ${localFilters.search}`, type: 'search' });
    }
    
    return active;
  };

  const removeActiveFilter = (filterToRemove) => {
    if (filterToRemove.type === 'category') {
      const newCategories = localFilters.categories.filter(cat => cat.id !== filterToRemove.value.id);
      handleFilterChange('categories', newCategories);
    } else if (filterToRemove.type === 'locality') {
      const newLocalities = localFilters.localities.filter(loc => loc.id !== filterToRemove.value.id);
      handleFilterChange('localities', newLocalities);
    } else if (filterToRemove.type === 'search') {
      handleFilterChange('search', '');
    }
  };

  const activeFilters = getActiveFilters();
  const hasActiveFilters = activeFilters.length > 0;

  // Enrichir le filtre catégorie si seul l'ID est présent (pré-remplissage via URL)
  useEffect(() => {
    if (!categoriesLoading && !categoriesErrorFlag) {
      if (localFilters.categories && localFilters.categories.length > 0) {
        const cat = localFilters.categories[0];
        if (cat && cat.id && !cat.name) {
          const selectedCategory = categories.find(c => c.id === parseInt(cat.id));
          if (selectedCategory) {
            handleFilterChange('categories', [selectedCategory]);
          }
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoriesLoading, categoriesErrorFlag, categories, localFilters.categories]);

  return (
    <FiltersContainer>
      <FiltersHeader>
        <FiltersTitle>
          <FiSearch />
          Filtres de recherche
        </FiltersTitle>
        <ClearFiltersButton
          onClick={handleClearFilters}
          disabled={!hasActiveFilters}
        >
          <FiX />
          Effacer les filtres
        </ClearFiltersButton>
      </FiltersHeader>
      
      <FiltersGrid>
        <FilterGroup>
          <FilterLabel>Recherche</FilterLabel>
          <SearchInputContainer>
            <SearchIcon />
            <SearchInput
              type="text"
              placeholder="Rechercher un produit..."
              value={localFilters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </SearchInputContainer>
        </FilterGroup>

        <FilterGroup>
          <FilterLabel>Catégorie</FilterLabel>
          {categoriesLoading ? (
            <div>Chargement des catégories...</div>
          ) : categoriesErrorFlag ? (
            <div>Erreur lors du chargement des catégories: {categoriesError?.message || 'Erreur inconnue'}</div>
          ) : (
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
          )}
        </FilterGroup>

        <FilterGroup>
          <FilterLabel>Localité</FilterLabel>
          {localitiesLoading ? (
            <div>Chargement des localités...</div>
          ) : localitiesErrorFlag ? (
            <div>Erreur lors du chargement des localités: {localitiesError?.message || 'Erreur inconnue'}</div>
          ) : (
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
          )}
        </FilterGroup>
      </FiltersGrid>

      {hasActiveFilters && (
        <>
          <ActiveFiltersContainer>
            {activeFilters.map((filter) => (
              <ActiveFilterTag key={filter.key}>
                {filter.label}
                <RemoveFilterButton onClick={() => removeActiveFilter(filter)}>
                  <FiX size={14} />
                </RemoveFilterButton>
              </ActiveFilterTag>
            ))}
          </ActiveFiltersContainer>
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <ClearButton onClick={handleClearFilters}>
              <FiX style={{ marginRight: '0.5rem' }} />
              Effacer tous les filtres
            </ClearButton>
          </div>
        </>
      )}
    </FiltersContainer>
  );
};

export default SimpleFilters;