import React, { useState } from 'react';
import styled from 'styled-components';
import { FiTrendingUp, FiFilter, FiRefreshCw } from 'react-icons/fi';
import { useQuery } from 'react-query';
import { comparisonService } from '../services/api';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';

const ComparisonContainer = styled.div`
  padding: 2rem 0;
`;

const ComparisonHeader = styled.div`
  background: white;
  padding: 2rem;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow);
  margin-bottom: 2rem;
`;

const ComparisonTitle = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: var(--gray-800);
`;

const ComparisonSubtitle = styled.p`
  color: var(--gray-600);
  margin-bottom: 2rem;
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
`;

const FilterSelect = styled.select`
  padding: 0.5rem 1rem;
  border: 1px solid var(--gray-300);
  border-radius: var(--border-radius);
  font-size: 0.875rem;
  min-width: 150px;
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: var(--transition);
  
  &:hover {
    background: var(--primary-dark);
  }
`;

const ProductsGrid = styled.div`
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

const StatsContainer = styled.div`
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow);
  padding: 2rem;
  margin-bottom: 2rem;
`;

const StatsTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
  color: var(--gray-800);
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const StatCard = styled.div`
  text-align: center;
  padding: 1.5rem;
  background: var(--gray-50);
  border-radius: var(--border-radius);
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: var(--gray-600);
  font-size: 0.875rem;
`;

const Comparison = () => {
  const [filters, setFilters] = useState({
    category: '',
    sort: 'price_asc'
  });

  const { data: cheapestProducts, isLoading: loadingCheapest } = useQuery(
    'cheapest-products',
    () => comparisonService.getCheapest(20),
    {
      select: (response) => response.data.data,
    }
  );

  const { data: bestByCategory, isLoading: loadingCategory } = useQuery(
    ['best-by-category', filters.category],
    () => comparisonService.getBestByCategory(filters.category, 20),
    {
      enabled: !!filters.category,
      select: (response) => response.data.data,
    }
  );

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const refreshData = () => {
    // Les données seront automatiquement rafraîchies grâce à React Query
    window.location.reload();
  };

  const currentProducts = filters.category ? bestByCategory : cheapestProducts;
  const loading = filters.category ? loadingCategory : loadingCheapest;

  return (
    <ComparisonContainer>
      <div className="container">
        <ComparisonHeader>
          <ComparisonTitle>Comparaison de prix</ComparisonTitle>
          <ComparisonSubtitle>
            Découvrez les meilleures offres et comparez les prix entre magasins
          </ComparisonSubtitle>
          
          <FilterContainer>
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
            
            <FilterSelect
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
            >
              <option value="price_asc">Prix croissant</option>
              <option value="price_desc">Prix décroissant</option>
              <option value="name_asc">Nom A-Z</option>
              <option value="name_desc">Nom Z-A</option>
            </FilterSelect>
            
            <FilterButton onClick={refreshData}>
              <FiRefreshCw />
              Actualiser
            </FilterButton>
          </FilterContainer>
        </ComparisonHeader>

        <StatsContainer>
          <StatsTitle>Statistiques</StatsTitle>
          <StatsGrid>
            <StatCard>
              <StatValue>{currentProducts?.length || 0}</StatValue>
              <StatLabel>Produits comparés</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>
                {currentProducts?.length > 0 
                  ? new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: 'EUR'
                    }).format(Math.min(...currentProducts.map(p => p.price)))
                  : '0 €'
                }
              </StatValue>
              <StatLabel>Prix minimum</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>
                {currentProducts?.length > 0 
                  ? new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: 'EUR'
                    }).format(
                      currentProducts.reduce((sum, p) => sum + p.price, 0) / currentProducts.length
                    )
                  : '0 €'
                }
              </StatValue>
              <StatLabel>Prix moyen</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>
                {currentProducts?.length > 0 
                  ? new Set(currentProducts.map(p => p.store_name)).size
                  : 0
                }
              </StatValue>
              <StatLabel>Magasins</StatLabel>
            </StatCard>
          </StatsGrid>
        </StatsContainer>

        {loading ? (
          <LoadingSpinner text="Chargement des produits..." />
        ) : currentProducts && currentProducts.length > 0 ? (
          <ProductsGrid>
            {currentProducts.map((product, index) => (
              <ProductCard 
                key={`${product.product_id || product.id}-${product.store_name || index}-${index}`} 
                product={product} 
              />
            ))}
          </ProductsGrid>
        ) : (
          <NoResults>
            <FiTrendingUp style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--gray-300)' }} />
            <h3>Aucun produit à comparer</h3>
            <p>Essayez de modifier vos filtres ou revenez plus tard.</p>
          </NoResults>
        )}
      </div>
    </ComparisonContainer>
  );
};

export default Comparison;
