import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { FiSettings, FiFilter, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import AdvancedFilters from '../components/AdvancedFilters';
import SimpleFilters from '../components/SimpleFilters';
import PriceTable from '../components/PriceTable';
import LoadingSpinner from '../components/LoadingSpinner';

const AllPricesContainer = styled.div`
  padding: 0;
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
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const PageTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--gray-800);
  margin: 0 0 0.5rem 0;
  text-align: center;
`;

const PageSubtitle = styled.p`
  font-size: 1.1rem;
  color: var(--gray-600);
  text-align: center;
  margin: 0;
`;

const Section = styled.section`
  margin-bottom: 3rem;
  padding: 0 1rem;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
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
    border-top-left-radius: var(--border-radius);
    border-bottom-left-radius: var(--border-radius);
    border-right: none;
  }

  &:last-child {
    border-top-right-radius: var(--border-radius);
    border-bottom-right-radius: var(--border-radius);
    border-left: none;
  }

  &:hover:not(:disabled) {
    background: ${props => props.active ? 'var(--primary-dark)' : 'var(--gray-50)'};
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  padding: 2rem 0;
`;

const PaginationButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: ${props => props.disabled ? 'var(--gray-200)' : 'var(--primary-color)'};
  color: ${props => props.disabled ? 'var(--gray-400)' : 'white'};
  border: none;
  padding: 0.75rem 1rem;
  border-radius: var(--border-radius);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    background: var(--primary-dark);
    transform: translateY(-1px);
  }
`;

const PageInfo = styled.div`
  font-size: 0.875rem;
  color: var(--gray-600);
  font-weight: 500;
`;

const PriceTableWrapper = styled.div`
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow);
  padding: 2rem;
`;

const AllPrices = () => {
  const [searchParams] = useSearchParams();
  const [useAdvancedFilters, setUseAdvancedFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [listLoading, setListLoading] = useState(false);
  const [filters, setFilters] = useState({
    categories: [],
    products: [],
    localities: [],
    period: '7',
    search: '',
    minPrice: '',
    maxPrice: ''
  });

  const itemsPerPage = 24;

  // Scroll vers le haut au montage du composant
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Pré-remplir et mettre à jour le filtre de catégorie via paramètre d'URL (category_id)
  useEffect(() => {
    const catParam = searchParams.get('category_id') || searchParams.get('category');
    const categoryId = parseInt(catParam || '', 10);
    setFilters((prev) => {
      // Si pas de catégorie dans l’URL, on ne modifie pas les autres filtres
      if (isNaN(categoryId) || categoryId <= 0) {
        // Si une catégorie était déjà sélectionnée via URL, la retirer
        if (prev.categories && prev.categories.length > 0) {
          return { ...prev, categories: [] };
        }
        return prev;
      }
      // Mettre à jour uniquement si l’ID change
      const currentId = prev.categories && prev.categories.length > 0 ? prev.categories[0].id : null;
      if (currentId === categoryId) return prev;
      return { ...prev, categories: [{ id: categoryId }] };
    });
  }, [searchParams]);

  const handleDataLoaded = (data) => {
    console.log('handleDataLoaded received:', data);
    // Vérifier si on reçoit un objet avec pagination ou juste un tableau
    if (data && typeof data === 'object' && data.total !== undefined) {
      // Nouveau format avec pagination
      console.log('Setting totalItems from data.total:', data.total);
      setTotalItems(data.total);
    } else if (data && typeof data === 'object' && data.pagination && data.pagination.total !== undefined) {
      // Format avec pagination dans un sous-objet
      console.log('Setting totalItems from data.pagination.total:', data.pagination.total);
      setTotalItems(data.pagination.total);
    } else if (Array.isArray(data)) {
      // Ancien format (tableau simple) - ne pas utiliser pour la pagination
      console.log('Received array data, not setting totalItems for pagination');
      // Ne pas définir totalItems pour les tableaux car cela ne donne pas le total réel
    } else {
      console.log('Setting totalItems to 0, data:', data);
      setTotalItems(0);
    }
  };

  const handleToggleFilters = (advanced) => {
    setUseAdvancedFilters(advanced);
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
    // Réinitialiser totalItems pour forcer un nouveau calcul
    setTotalItems(0);
  };

  // Réinitialiser la page quand les filtres changent
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Forcer le rechargement des données quand la page change
  useEffect(() => {
    // Cette fonction sera appelée par PriceTable via onDataLoaded
    console.log('Page changed to:', currentPage);
  }, [currentPage]);

  const handleFiltersReset = () => {
    const resetFilters = {
      categories: [],
      products: [],
      localities: [],
      period: '7',
      search: '',
      minPrice: '',
      maxPrice: ''
    };
    setFilters(resetFilters);
    setCurrentPage(1);
    // Réinitialiser totalItems pour forcer un nouveau calcul
    setTotalItems(0);
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
    // Si period est '7' (par défaut), ne pas appliquer de filtre de date pour afficher tous les prix
    
    // Toujours ajouter la pagination
    apiFilters.limit = itemsPerPage;
    apiFilters.offset = (currentPage - 1) * itemsPerPage;
    apiFilters.status = 'validated';
    
    console.log('Mapped filters for API:', apiFilters);
    console.log('Current page:', currentPage, 'Items per page:', itemsPerPage);
    return apiFilters;
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    setCurrentPage(currentPage + 1);
  };

  return (
    <AllPricesContainer>
      <PageHeader>
        <HeaderContent>
          <PageTitle>Tous les Prix de Produits Agricoles</PageTitle>
          <PageSubtitle>
            Consultez l'ensemble des prix des produits agricoles disponibles sur notre plateforme
          </PageSubtitle>
        </HeaderContent>
      </PageHeader>
      
      <Section>
        <FilterToggleContainer>
          <FilterToggleButton 
            active={!useAdvancedFilters}
            onClick={() => handleToggleFilters(false)}
            disabled={listLoading}
          >
            <FiFilter />
            Filtres simples
          </FilterToggleButton>
          <FilterToggleButton 
            active={useAdvancedFilters}
            onClick={() => handleToggleFilters(true)}
            disabled={listLoading}
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
        
        <PriceTableWrapper>
          <PriceTable
            key={`prices-${currentPage}-${JSON.stringify(filters)}`}
            filters={mapFiltersForAPI(filters)}
            showViewAllLink={false}
            onDataLoaded={handleDataLoaded}
            onLoadingChange={setListLoading}
            onRefresh={() => {
              // Optionnel: actions supplémentaires lors du rafraîchissement
            }}
          />
        </PriceTableWrapper>

        {totalItems > itemsPerPage && totalItems > 0 && (
          <PaginationContainer>
            <PaginationButton 
              onClick={handlePreviousPage}
              disabled={currentPage === 1 || listLoading}
            >
              {listLoading ? <LoadingSpinner size="small" text="" /> : <FiChevronLeft />}
              Précédent
            </PaginationButton>
            
            <PageInfo>
              Page {currentPage} sur {Math.ceil(totalItems / itemsPerPage)}
            </PageInfo>
            
            <PaginationButton 
              onClick={handleNextPage}
              disabled={currentPage >= Math.ceil(totalItems / itemsPerPage) || listLoading}
            >
              Suivant
              {listLoading ? <LoadingSpinner size="small" text="" /> : <FiChevronRight />}
            </PaginationButton>
          </PaginationContainer>
        )}
      </Section>
    </AllPricesContainer>
  );
};

export default AllPrices;