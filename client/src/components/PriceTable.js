import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FiArrowRight, FiRefreshCw } from 'react-icons/fi';
import { agriculturalPriceService } from '../services/api';
import LoadingSpinner from './LoadingSpinner';

const PriceTableContainer = styled.div`
  margin-bottom: 3rem;
`;

const TableHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const TableTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--gray-800);
  margin: 0;
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: var(--primary-dark);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  svg {
    transition: transform 0.3s ease;
  }

  &.refreshing svg {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const LastUpdateInfo = styled.div`
  font-size: 0.75rem;
  color: var(--gray-500);
  margin-bottom: 1rem;
  text-align: right;
`;

const TradingTable = styled.div`
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow);
  overflow: hidden;
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
`;

const TradingHeader = styled.div`
  background: var(--gray-50);
  border-bottom: 1px solid var(--gray-200);
  flex-shrink: 0;
`;

const TradingHeaderRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
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

const TradingHeaderCell = styled.div`
  padding: 0.5rem;
  text-align: left;

  @media (max-width: 768px) {
    display: none;
  }
`;

const TradingBody = styled.div`
  flex: 1;
  min-height: 0;
`;

const TradingRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
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

const TradingCell = styled.div`
  padding: 0.5rem;
  display: flex;
  align-items: center;

  @media (max-width: 768px) {
    padding: 0.25rem;
  }
`;

const ProductInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const ProductName = styled.div`
  font-weight: 600;
  color: var(--gray-800);
  font-size: 0.875rem;
`;

const ProductCategory = styled.div`
  font-size: 0.75rem;
  color: var(--gray-500);
  text-transform: capitalize;
`;

const LocationInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const LocationName = styled.div`
  font-weight: 500;
  color: var(--gray-700);
  font-size: 0.875rem;
`;

const PriceValue = styled.div`
  font-weight: 700;
  color: var(--gray-800);
  font-size: 1rem;
  font-family: 'Courier New', monospace;
`;

const PriceChange = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'positive'
})`
  font-weight: 600;
  font-size: 0.875rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  text-align: center;
  color: ${props => props.positive ? '#10b981' : '#ef4444'};
  background: ${props => props.positive ? '#dcfce7' : '#fee2e2'};
  font-family: 'Courier New', monospace;
`;

const LastUpdate = styled.div`
  font-size: 0.75rem;
  color: var(--gray-500);
  font-family: 'Courier New', monospace;
`;

const ViewAllLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
  margin: 0 auto;
  padding: 0.75rem 1.5rem;
  border: 2px solid var(--primary-color);
  border-radius: var(--border-radius);
  transition: var(--transition);

  &:hover {
    background: var(--primary-color);
    color: white;
  }
`;

const EmptyState = styled.div`
  padding: 3rem 2rem;
  text-align: center;
  color: var(--gray-500);
  font-style: italic;
`;

const PriceTable = ({ filters, onRefresh, showViewAllLink = true, limit = null, onDataLoaded }) => {
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  console.log('PriceTable: Received filters:', filters);

  const { 
    data: agriculturalPricesResponse, 
    isLoading, 
    refetch,
    isFetching,
    isError,
    error
  } = useQuery(
    ['agricultural-prices', filters],
    () => agriculturalPriceService.getAll(filters),
    {
      refetchInterval: autoRefresh ? 30000 : false, // Rafraîchissement toutes les 30 secondes
      refetchIntervalInBackground: false,
      onSuccess: () => {
        setLastRefresh(new Date());
        console.log('Agricultural prices fetched successfully');
      },
      onError: (error) => {
        console.error('Error fetching agricultural prices:', error);
      }
    }
  );

  console.log('Current filters:', filters);
  console.log('Agricultural prices response:', agriculturalPricesResponse);

  // Extraire les données de la réponse API
  let agriculturalPrices = agriculturalPricesResponse?.data?.data || [];
  
  // Appeler le callback avec les données originales (avant limitation côté client)
  // Note: Les données sont déjà filtrées côté serveur selon les critères de recherche
  useEffect(() => {
    if (onDataLoaded && agriculturalPrices) {
      onDataLoaded(agriculturalPrices);
    }
  }, [agriculturalPrices, onDataLoaded]);
  
  // Limiter les prix si une limite est spécifiée (pour la page d'accueil)
  // Cette limitation ne s'applique que pour l'affichage, pas pour le comptage
  let displayedPrices = agriculturalPrices;
  if (limit && agriculturalPrices.length > limit) {
    displayedPrices = agriculturalPrices.slice(0, limit);
  }
  
  console.log('Extracted agricultural prices:', agriculturalPrices);
  console.log('Displayed agricultural prices:', displayedPrices);

  const handleManualRefresh = async () => {
    await refetch();
    if (onRefresh) {
      onRefresh();
    }
  };

  const formatLastUpdate = (date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  return (
    <PriceTableContainer>
      <TableHeader>
        <TableTitle>Prix des produits en temps réels</TableTitle>
        <div>
          <LastUpdateInfo>
            Dernière mise à jour: {formatLastUpdate(lastRefresh)}
          </LastUpdateInfo>
          <RefreshButton 
            onClick={handleManualRefresh}
            disabled={isFetching}
            className={isFetching ? 'refreshing' : ''}
          >
            <FiRefreshCw />
            {isFetching ? 'Actualisation...' : 'Actualiser'}
          </RefreshButton>
        </div>
      </TableHeader>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <LoadingSpinner />
        </div>
      ) : (
        <>
          <TradingTable>
            <TradingHeader>
              <TradingHeaderRow>
                <TradingHeaderCell>Produit</TradingHeaderCell>
                <TradingHeaderCell>Localité</TradingHeaderCell>
                <TradingHeaderCell>Prix</TradingHeaderCell>
                <TradingHeaderCell>Variation</TradingHeaderCell>
                <TradingHeaderCell>Mis à jour</TradingHeaderCell>
              </TradingHeaderRow>
            </TradingHeader>
            <TradingBody>
              {isError ? (
                <EmptyState>
                  Erreur lors du chargement des prix: {error?.message || 'Erreur inconnue'}
                </EmptyState>
              ) : agriculturalPrices.length > 0 ? (
                displayedPrices.map((price, index) => (
                  <TradingRow key={price.id || `price-${index}`}>
                    <TradingCell>
                      <ProductInfo>
                        <ProductName>{price.product_name || 'Produit inconnu'}</ProductName>
                        <ProductCategory>{price.category_name || 'Catégorie inconnue'}</ProductCategory>
                      </ProductInfo>
                    </TradingCell>
                    <TradingCell>
                      <LocationInfo>
                        <LocationName>{price.locality_name || 'Localité inconnue'}</LocationName>
                        <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                          {price.region_name || 'Région inconnue'}
                        </div>
                      </LocationInfo>
                    </TradingCell>
                    <TradingCell>
                      <PriceValue>
                        {price.price ? 
                          `${new Intl.NumberFormat('fr-FR').format(price.price)} FCFA` : 
                          'N/A'
                        }
                      </PriceValue>
                    </TradingCell>
                    <TradingCell>
                      <PriceChange positive={price.price_change >= 0}>
                        {price.price_change !== null && price.price_change !== undefined ? 
                          `${price.price_change >= 0 ? '+' : ''}${price.price_change.toFixed(1)}%` : 
                          'N/A'
                        }
                      </PriceChange>
                    </TradingCell>
                    <TradingCell>
                      <LastUpdate>
                        {price.date ? 
                          new Date(price.date).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          }) : 
                          'N/A'
                        }
                      </LastUpdate>
                    </TradingCell>
                  </TradingRow>
                ))
              ) : (
                <EmptyState>
                  📭 Aucune donnée disponible pour les filtres sélectionnés
                </EmptyState>
              )}
            </TradingBody>
          </TradingTable>
          {showViewAllLink && (
            <div style={{ textAlign: 'center' }}>
              <ViewAllLink to="/all-prices">
                Voir tous les prix
                <FiArrowRight />
              </ViewAllLink>
            </div>
          )}
        </>
      )}
    </PriceTableContainer>
  );
};

export default PriceTable;