import React from 'react';
import { useParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import { FiArrowLeft, FiMapPin, FiTrendingUp, FiStar } from 'react-icons/fi';
import { useQuery } from 'react-query';
import { productService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const ProductDetailContainer = styled.div`
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

const ProductCard = styled.div`
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow);
  overflow: hidden;
  margin-bottom: 2rem;
`;

const ProductHeader = styled.div`
  padding: 2rem;
  border-bottom: 1px solid var(--gray-200);
`;

const ProductImage = styled.img`
  width: 100%;
  height: 300px;
  object-fit: cover;
  background: var(--gray-100);
`;

const ProductInfo = styled.div`
  padding: 2rem;
`;

const ProductName = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: var(--gray-800);
`;

const ProductBrand = styled.p`
  color: var(--gray-600);
  font-size: 1.125rem;
  margin-bottom: 1rem;
`;

const ProductDescription = styled.p`
  color: var(--gray-700);
  line-height: 1.6;
  margin-bottom: 2rem;
`;

const ViewOnMapLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--gray-200);
  border-radius: var(--border-radius);
  color: #10b981;
  text-decoration: none;
  background: white;
  transition: var(--transition);

  &:hover {
    background: var(--gray-50);
    border-color: var(--gray-300);
  }
`;

const PricesContainer = styled.div`
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow);
  padding: 2rem;
`;

const PricesTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
  color: var(--gray-800);
`;

const PriceList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const PriceItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid var(--gray-200);
  border-radius: var(--border-radius);
  transition: var(--transition);
  
  &:hover {
    border-color: var(--primary-color);
    box-shadow: var(--shadow);
  }
`;

const StoreInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const StoreName = styled.span`
  font-weight: 600;
  color: var(--gray-800);
`;

const StoreLocation = styled.span`
  color: var(--gray-600);
  font-size: 0.875rem;
`;

const Price = styled.span`
  font-size: 1.25rem;
  font-weight: bold;
  color: var(--primary-color);
`;

const NoPrices = styled.div`
  text-align: center;
  padding: 3rem;
  color: var(--gray-500);
`;

const ProductDetail = () => {
  const { id } = useParams();

  const { data: product, isLoading: loadingProduct } = useQuery(
    ['product', id],
    () => productService.getById(id),
    {
      enabled: !!id,
      select: (response) => response.data.data,
    }
  );

  const { data: prices, isLoading: loadingPrices } = useQuery(
    ['product-prices', id],
    () => productService.getPrices(id),
    {
      enabled: !!id,
      select: (response) => response.data.data,
    }
  );

  const { data: stats } = useQuery(
    ['product-stats', id],
    () => productService.getStats(id),
    {
      enabled: !!id,
      select: (response) => response.data.data,
    }
  );

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  if (loadingProduct) {
    return <LoadingSpinner text="Chargement du produit..." />;
  }

  if (!product) {
    return (
      <ProductDetailContainer>
        <div className="container">
          <BackButton onClick={() => window.history.back()}>
            <FiArrowLeft />
            Retour
          </BackButton>
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <h2>Produit non trouvé</h2>
            <p>Le produit que vous recherchez n'existe pas.</p>
          </div>
        </div>
      </ProductDetailContainer>
    );
  }

  return (
    <ProductDetailContainer>
      <div className="container">
        <BackButton onClick={() => window.history.back()}>
          <FiArrowLeft />
          Retour
        </BackButton>

        <ProductCard>
          <ProductHeader>
            {product.image_url ? (
              <ProductImage src={product.image_url} alt={product.name} />
            ) : (
              <div style={{ 
                height: '300px', 
                background: 'var(--gray-100)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'var(--gray-500)',
                fontSize: '3rem'
              }}>
                📦
              </div>
            )}
          </ProductHeader>
          
          <ProductInfo>
            <ProductName>{product.name}</ProductName>
            {product.brand && <ProductBrand>Marque: {product.brand}</ProductBrand>}
            {product.description && (
              <ProductDescription>{product.description}</ProductDescription>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
              <ViewOnMapLink 
                to={`/price-map?product_id=${product.id}&search=${encodeURIComponent(product.name)}`}
                aria-label="Voir sur la carte"
                title="Voir sur la carte"
              >
                <FiMapPin /> Voir sur la carte
              </ViewOnMapLink>
            </div>
            
            {stats && (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '1rem',
                marginBottom: '2rem'
              }}>
                <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--gray-50)', borderRadius: 'var(--border-radius)' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--success-color)' }}>
                    {formatPrice(stats.min_price)}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>Prix minimum</div>
                </div>
                <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--gray-50)', borderRadius: 'var(--border-radius)' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                    {formatPrice(stats.avg_price)}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>Prix moyen</div>
                </div>
                <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--gray-50)', borderRadius: 'var(--border-radius)' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--danger-color)' }}>
                    {formatPrice(stats.max_price)}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>Prix maximum</div>
                </div>
                <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--gray-50)', borderRadius: 'var(--border-radius)' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--gray-700)' }}>
                    {stats.store_count}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>Magasins</div>
                </div>
              </div>
            )}
          </ProductInfo>
        </ProductCard>

        <PricesContainer>
          <PricesTitle>Prix dans les magasins</PricesTitle>
          {loadingPrices ? (
            <LoadingSpinner text="Chargement des prix..." />
          ) : prices && prices.length > 0 ? (
            <PriceList>
              {prices.map((price, index) => (
                <PriceItem key={index}>
                  <StoreInfo>
                    <FiMapPin />
                    <div>
                      <StoreName>{price.store_name}</StoreName>
                      <StoreLocation>{price.address}, {price.city}</StoreLocation>
                    </div>
                  </StoreInfo>
                  <Price>
                    {formatPrice(price.price)}
                    {price.unit && <span style={{ fontSize: '0.875rem', fontWeight: 'normal', color: 'var(--gray-500)' }}> / {price.unit}</span>}
                  </Price>
                  <Link 
                    to={`/price-map?product_id=${product.id}${(price.latitude!=null && price.longitude!=null) ? `&lat=${price.latitude}&lng=${price.longitude}&zoom=14` : ''}`}
                    style={{ marginLeft:'0.75rem', border:'1px solid var(--gray-200)', borderRadius:6, padding:'0.3rem', color:'#10b981', textDecoration:'none', display:'inline-flex', alignItems:'center' }}
                    aria-label="Voir sur la carte"
                    title="Voir sur la carte"
                  >
                    <FiMapPin />
                  </Link>
                </PriceItem>
              ))}
            </PriceList>
          ) : (
            <NoPrices>
              <FiTrendingUp style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--gray-300)' }} />
              <h3>Aucun prix disponible</h3>
              <p>Ce produit n'est actuellement disponible dans aucun magasin.</p>
            </NoPrices>
          )}
        </PricesContainer>
      </div>
    </ProductDetailContainer>
  );
};

export default ProductDetail;
