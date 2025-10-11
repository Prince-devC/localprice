import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { FiTrendingUp, FiFilter, FiRefreshCw } from 'react-icons/fi';
import { useQuery, useQueryClient } from 'react-query';
import { comparisonService, productService } from '../services/api';
// Affichage en tableau, on n'utilise plus les cartes e-commerce
// import ProductCard from '../components/ProductCard';
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

// Nouveau tableau pour l'affichage de comparaison
const ComparisonTable = styled.div`
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow);
  overflow: hidden;
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
`;

const ComparisonTableHeader = styled.div`
  background: var(--gray-50);
  border-bottom: 1px solid var(--gray-200);
  flex-shrink: 0;
`;

const ComparisonHeaderRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1.2fr 1fr 1fr 0.8fr 1fr;
  gap: 1rem;
  padding: 1rem;
  font-weight: 600;
  color: var(--gray-700);
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
`;

const ComparisonHeaderCell = styled.div`
  padding: 0.5rem;
  text-align: left;

  @media (max-width: 768px) {
    display: none;
  }
`;

const ComparisonTableBody = styled.div`
  flex: 1;
  min-height: 0;
`;

const ComparisonRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1.2fr 1fr 1fr 0.8fr 1fr;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid var(--gray-100);
  transition: var(--transition);

  &:hover {
    background: var(--gray-50);
  }

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0.5rem;
    padding: 0.75rem;
  }
`;

const ComparisonCell = styled.div`
  padding: 0.5rem;
  display: flex;
  align-items: center;

  @media (max-width: 768px) {
    padding: 0.25rem;
  }
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
    product: '',
    sort: 'price_asc'
  });
  const queryClient = useQueryClient();

  // (Filtre catégorie supprimé)

  const { data: cheapestProducts, isLoading: loadingCheapest } = useQuery(
    'cheapest-products',
    () => comparisonService.getCheapest(20),
    {
      select: (response) => response.data.data,
    }
  );

  // (Requête meilleurs prix par catégorie supprimée)

  // Liste de produits pour le sélecteur
  const { data: products } = useQuery(
    'comparison-products',
    () => productService.getAll({ limit: 200 }),
    {
      select: (response) => response.data.data,
    }
  );

  // Comparaison du produit par localités
  const { data: byLocalities, isLoading: loadingByLocalities } = useQuery(
    ['product-localities', filters.product],
    () => comparisonService.getProductLocalityComparison(filters.product, 100),
    {
      enabled: !!filters.product,
      select: (response) => response.data.data,
    }
  );

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: (key === 'product') ? (value ? Number(value) : '') : value
    }));
  };

  const refreshData = () => {
    // Rafraîchir proprement les données via React Query
    queryClient.invalidateQueries('cheapest-products');
    if (filters.product) {
      queryClient.invalidateQueries(['product-localities', filters.product]);
    }
  };

  const currentProducts = filters.product ? byLocalities : cheapestProducts;
  const loading = filters.product ? loadingByLocalities : loadingCheapest;

  // Tri côté client selon le filtre sélectionné
  const sortedProducts = useMemo(() => {
    if (!currentProducts) return [];
    const copy = [...currentProducts];
    switch (filters.sort) {
      case 'price_desc':
        return copy.sort((a, b) => (b.price || 0) - (a.price || 0));
      case 'name_asc':
        return copy.sort((a, b) => (a.product_name || a.name || '').localeCompare(b.product_name || b.name || ''));
      case 'name_desc':
        return copy.sort((a, b) => (b.product_name || b.name || '').localeCompare(a.product_name || a.name || ''));
      case 'price_asc':
      default:
        return copy.sort((a, b) => (a.price || 0) - (b.price || 0));
    }
  }, [currentProducts, filters.sort]);

  // Statistiques mémoïsées
  const stats = useMemo(() => {
    const count = sortedProducts.length;
    const min = count > 0 ? Math.min(...sortedProducts.map(p => p.price || 0)) : 0;
    const avg = count > 0 ? sortedProducts.reduce((sum, p) => sum + (p.price || 0), 0) / count : 0;
    const hasSupplierNames = sortedProducts.some(p => !!p.store_name);
    const supplierCount = hasSupplierNames
      ? new Set(sortedProducts.map(p => (p.store_name || '').trim().toLowerCase())).size
      : 0;
    const localityCount = new Set(sortedProducts.map(p => (p.city || '').trim().toLowerCase())).size;
    return { count, min, avg, supplierCount, localityCount, hasSupplierNames };
  }, [sortedProducts]);

  return (
    <ComparisonContainer>
      <div className="container">
        <ComparisonHeader>
          <ComparisonTitle>Comparaison de prix</ComparisonTitle>
          <ComparisonSubtitle>
            Découvrez les meilleures offres et comparez les prix entre fournisseurs
          </ComparisonSubtitle>
          
          <FilterContainer>
            <FilterSelect
              value={filters.product}
              onChange={(e) => handleFilterChange('product', e.target.value)}
            >
              <option value="">Tous les produits</option>
              {(products || []).map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
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
              <StatValue>{stats.count}</StatValue>
              <StatLabel>Produits comparés</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>
                {new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: 'XOF',
                  minimumFractionDigits: 0
                }).format(stats.min).replace('XOF', 'FCFA')}
              </StatValue>
              <StatLabel>Prix minimum</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>
                {new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: 'XOF',
                  minimumFractionDigits: 0
                }).format(stats.avg).replace('XOF', 'FCFA')}
              </StatValue>
              <StatLabel>Prix moyen</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{stats.hasSupplierNames ? stats.supplierCount : stats.localityCount}</StatValue>
              <StatLabel>{stats.hasSupplierNames ? 'Fournisseurs' : 'Localités'}</StatLabel>
            </StatCard>
          </StatsGrid>
        </StatsContainer>

        {loading ? (
          <LoadingSpinner text="Chargement des produits..." />
        ) : sortedProducts && sortedProducts.length > 0 ? (
          <ComparisonTable>
            <ComparisonTableHeader>
              <ComparisonHeaderRow>
                <ComparisonHeaderCell>Produit</ComparisonHeaderCell>
                {filters.product ? null : <ComparisonHeaderCell>Fournisseur</ComparisonHeaderCell>}
                <ComparisonHeaderCell>Ville</ComparisonHeaderCell>
                <ComparisonHeaderCell>Prix</ComparisonHeaderCell>
                <ComparisonHeaderCell>Unité</ComparisonHeaderCell>
                <ComparisonHeaderCell>Mis à jour</ComparisonHeaderCell>
              </ComparisonHeaderRow>
            </ComparisonTableHeader>
            <ComparisonTableBody>
              {sortedProducts.map((p, index) => (
                <ComparisonRow key={`${p.product_id || p.id}-${p.store_name || index}-${index}`}>
                  <ComparisonCell>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--gray-800)', fontSize: '0.9rem' }}>
                        {p.product_name || p.name || 'Produit'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                        {p.category_name || ''}
                      </div>
                    </div>
                  </ComparisonCell>
                  {filters.product ? null : <ComparisonCell>{p.store_name || '—'}</ComparisonCell>}
                  <ComparisonCell>{p.city || '—'}</ComparisonCell>
                  <ComparisonCell>
                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 })
                      .format(p.price || 0).replace('XOF', 'FCFA')}
                  </ComparisonCell>
                  <ComparisonCell>{p.unit || '—'}</ComparisonCell>
                  <ComparisonCell>
                    {p.last_updated ? new Date(p.last_updated).toLocaleDateString('fr-FR') : '—'}
                  </ComparisonCell>
                </ComparisonRow>
              ))}
            </ComparisonTableBody>
          </ComparisonTable>
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
