import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { FiSearch, FiX } from 'react-icons/fi';
import { comparisonService } from '../services/api';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';

const SearchContainer = styled.div`
  padding: 2rem 0;
`;

const SearchHeader = styled.div`
  background: white;
  padding: 2rem;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow);
  margin-bottom: 2rem;
`;

const SearchTitle = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: var(--gray-800);
`;

const SearchForm = styled.form`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px solid var(--gray-200);
  border-radius: var(--border-radius);
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const SearchButton = styled.button`
  padding: 0.75rem 2rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  
  &:hover {
    background: var(--primary-dark);
  }
`;

const FiltersContainer = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
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
  padding: 0.5rem;
  border: 1px solid var(--gray-300);
  border-radius: var(--border-radius);
  font-size: 0.875rem;
  min-width: 150px;
`;

const FilterInput = styled.input`
  padding: 0.5rem;
  border: 1px solid var(--gray-300);
  border-radius: var(--border-radius);
  font-size: 0.875rem;
  width: 120px;
`;

const ClearFiltersButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--gray-200);
  color: var(--gray-700);
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: var(--transition);
  
  &:hover {
    background: var(--gray-300);
  }
`;

const ResultsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const NoResults = styled.div`
  text-align: center;
  padding: 3rem;
  color: var(--gray-500);
`;

const NoResultsIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
  color: var(--gray-300);
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 2rem;
`;

const PageButton = styled.button`
  padding: 0.5rem 1rem;
  border: 1px solid var(--gray-300);
  background: ${props => props.active ? 'var(--primary-color)' : 'white'};
  color: ${props => props.active ? 'white' : 'var(--gray-700)'};
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: var(--transition);
  
  &:hover:not(:disabled) {
    background: ${props => props.active ? 'var(--primary-dark)' : 'var(--gray-100)'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    q: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    city: searchParams.get('city') || '',
    page: 1,
    limit: 20
  });

  // Recherche avec les filtres
  const { data: searchResults, isLoading, error } = useQuery(
    ['search', filters],
    () => comparisonService.search(filters),
    {
      enabled: !!filters.q || !!filters.category || !!filters.min_price || !!filters.max_price || !!filters.city,
      select: (response) => response.data.data,
    }
  );

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams({
      ...filters,
      page: 1
    });
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  const clearFilters = () => {
    setFilters({
      q: '',
      category: '',
      min_price: '',
      max_price: '',
      city: '',
      page: 1,
      limit: 20
    });
    setSearchParams({});
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value && value !== '' && value !== 1 && value !== 20
  );

  return (
    <SearchContainer>
      <div className="container">
        <SearchHeader>
          <SearchTitle>Rechercher des produits</SearchTitle>
          
          <SearchForm onSubmit={handleSearch}>
            <SearchInput
              type="text"
              placeholder="Nom du produit, marque..."
              value={filters.q}
              onChange={(e) => handleFilterChange('q', e.target.value)}
            />
            <SearchButton type="submit">
              <FiSearch />
              Rechercher
            </SearchButton>
          </SearchForm>
          
          <FiltersContainer>
            <FilterGroup>
              <FilterLabel>Catégorie</FilterLabel>
              <FilterSelect
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="">Toutes les catégories</option>
                <option value="1">Alimentation</option>
                <option value="2">Électronique</option>
                <option value="3">Vêtements</option>
                <option value="4">Maison & Jardin</option>
                <option value="5">Santé & Beauté</option>
                <option value="6">Sports & Loisirs</option>
              </FilterSelect>
            </FilterGroup>
            
            <FilterGroup>
              <FilterLabel>Prix min (€)</FilterLabel>
              <FilterInput
                type="number"
                placeholder="0"
                value={filters.min_price}
                onChange={(e) => handleFilterChange('min_price', e.target.value)}
              />
            </FilterGroup>
            
            <FilterGroup>
              <FilterLabel>Prix max (€)</FilterLabel>
              <FilterInput
                type="number"
                placeholder="1000"
                value={filters.max_price}
                onChange={(e) => handleFilterChange('max_price', e.target.value)}
              />
            </FilterGroup>
            
            <FilterGroup>
              <FilterLabel>Ville</FilterLabel>
              <FilterInput
                type="text"
                placeholder="Paris"
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
              />
            </FilterGroup>
            
            {hasActiveFilters && (
              <ClearFiltersButton onClick={clearFilters}>
                <FiX />
                Effacer les filtres
              </ClearFiltersButton>
            )}
          </FiltersContainer>
        </SearchHeader>

        {isLoading ? (
          <LoadingSpinner text="Recherche en cours..." />
        ) : error ? (
          <NoResults>
            <NoResultsIcon>⚠️</NoResultsIcon>
            <h3>Erreur lors de la recherche</h3>
            <p>Veuillez réessayer plus tard.</p>
          </NoResults>
        ) : searchResults && searchResults.length > 0 ? (
          <>
            <ResultsContainer>
              {searchResults.map((product, index) => (
                <ProductCard key={product.id || product.product_id || `product-${index}`} product={product} />
              ))}
            </ResultsContainer>
            
            {/* Pagination simple */}
            <Pagination>
              <PageButton
                disabled={filters.page <= 1}
                onClick={() => handlePageChange(filters.page - 1)}
              >
                Précédent
              </PageButton>
              <PageButton active>
                Page {filters.page}
              </PageButton>
              <PageButton
                disabled={!searchResults || searchResults.length < filters.limit}
                onClick={() => handlePageChange(filters.page + 1)}
              >
                Suivant
              </PageButton>
            </Pagination>
          </>
        ) : (
          <NoResults>
            <NoResultsIcon>🔍</NoResultsIcon>
            <h3>Aucun résultat trouvé</h3>
            <p>Essayez de modifier vos critères de recherche.</p>
          </NoResults>
        )}
      </div>
    </SearchContainer>
  );
};

export default Search;
