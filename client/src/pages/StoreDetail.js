import React from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { FiArrowLeft, FiMapPin, FiPhone, FiMail, FiGlobe, FiClock } from 'react-icons/fi';
import { useQuery } from 'react-query';
import { storeService, productService } from '../services/api';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';

const StoreDetailContainer = styled.div`
  padding: 2rem 0;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: var(--primary-color);
  cursor: pointer;
  font-weight: 500;
  margin-bottom: 2rem;
  transition: var(--transition);
  
  &:hover {
    text-decoration: underline;
  }
`;

const StoreCard = styled.div`
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow);
  overflow: hidden;
  margin-bottom: 2rem;
`;

const StoreHeader = styled.div`
  padding: 2rem;
  border-bottom: 1px solid var(--gray-200);
`;

const StoreName = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: var(--gray-800);
`;

const StoreAddress = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--gray-600);
  margin-bottom: 1rem;
`;

const ContactInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
`;

const ContactItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--gray-700);
  
  a {
    color: var(--primary-color);
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const HoursSection = styled.div`
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow);
  padding: 2rem;
  margin-bottom: 2rem;
`;

const HoursTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: var(--gray-800);
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const HoursText = styled.pre`
  color: var(--gray-700);
  line-height: 1.6;
  white-space: pre-line;
  font-family: inherit;
`;

const ProductsSection = styled.div`
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow);
  padding: 2rem;
`;

const ProductsTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
  color: var(--gray-800);
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
`;

const NoProducts = styled.div`
  text-align: center;
  padding: 3rem;
  color: var(--gray-500);
`;

const StoreDetail = () => {
  const { id } = useParams();

  const { data: store, isLoading: loadingStore } = useQuery(
    ['store', id],
    () => storeService.getById(id),
    {
      enabled: !!id,
      select: (response) => response.data.data,
    }
  );

  const { data: products, isLoading: loadingProducts } = useQuery(
    ['store-products', id],
    () => productService.getAll({ store_id: id, limit: 20 }),
    {
      enabled: !!id,
      select: (response) => response.data.data,
    }
  );

  const formatOpeningHours = (hours) => {
    if (!hours) return 'Horaires non disponibles';
    
    try {
      const parsed = typeof hours === 'string' ? JSON.parse(hours) : hours;
      if (parsed && typeof parsed === 'object') {
        return Object.entries(parsed)
          .map(([day, time]) => `${day}: ${time}`)
          .join('\n');
      }
    } catch (error) {
      console.error('Error parsing opening hours:', error);
    }
    
    return 'Horaires non disponibles';
  };

  if (loadingStore) {
    return <LoadingSpinner text="Chargement du magasin..." />;
  }

  if (!store) {
    return (
      <StoreDetailContainer>
        <div className="container">
          <BackButton onClick={() => window.history.back()}>
            <FiArrowLeft />
            Retour
          </BackButton>
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <h2>Magasin non trouvé</h2>
            <p>Le magasin que vous recherchez n'existe pas.</p>
          </div>
        </div>
      </StoreDetailContainer>
    );
  }

  return (
    <StoreDetailContainer>
      <div className="container">
        <BackButton onClick={() => window.history.back()}>
          <FiArrowLeft />
          Retour
        </BackButton>

        <StoreCard>
          <StoreHeader>
            <StoreName>{store.name}</StoreName>
            <StoreAddress>
              <FiMapPin />
              <span>{store.address}, {store.postal_code} {store.city}</span>
            </StoreAddress>
            
            <ContactInfo>
              {store.phone && (
                <ContactItem>
                  <FiPhone />
                  <a href={`tel:${store.phone}`}>{store.phone}</a>
                </ContactItem>
              )}
              
              {store.email && (
                <ContactItem>
                  <FiMail />
                  <a href={`mailto:${store.email}`}>{store.email}</a>
                </ContactItem>
              )}
              
              {store.website && (
                <ContactItem>
                  <FiGlobe />
                  <a href={store.website} target="_blank" rel="noopener noreferrer">
                    Site web
                  </a>
                </ContactItem>
              )}
            </ContactInfo>
          </StoreHeader>
        </StoreCard>

        <HoursSection>
          <HoursTitle>
            <FiClock />
            Horaires d'ouverture
          </HoursTitle>
          <HoursText>
            {formatOpeningHours(store.opening_hours)}
          </HoursText>
        </HoursSection>

        <ProductsSection>
          <ProductsTitle>Produits disponibles</ProductsTitle>
          {loadingProducts ? (
            <LoadingSpinner text="Chargement des produits..." />
          ) : products && products.length > 0 ? (
            <ProductsGrid>
              {products.map((product, index) => (
                <ProductCard key={product.id || product.product_id || `product-${index}`} product={product} />
              ))}
            </ProductsGrid>
          ) : (
            <NoProducts>
              <h3>Aucun produit disponible</h3>
              <p>Ce magasin n'a pas encore de produits enregistrés.</p>
            </NoProducts>
          )}
        </ProductsSection>
      </div>
    </StoreDetailContainer>
  );
};

export default StoreDetail;
