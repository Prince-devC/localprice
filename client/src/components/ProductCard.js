import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FiShoppingCart, FiMapPin, FiStar } from 'react-icons/fi';

const Card = styled.div`
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow);
  overflow: hidden;
  transition: var(--transition);
  height: 100%;
  display: flex;
  flex-direction: column;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-lg);
  }
`;

const ImageContainer = styled.div`
  width: 100%;
  height: 200px;
  background: var(--gray-100);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
`;

const ProductImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const PlaceholderImage = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, var(--gray-200), var(--gray-300));
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gray-500);
  font-size: 3rem;
`;

const Content = styled.div`
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const ProductName = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--gray-800);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const Brand = styled.p`
  color: var(--gray-500);
  font-size: 0.875rem;
  margin-bottom: 1rem;
`;

const PriceInfo = styled.div`
  margin-bottom: 1rem;
`;

const Price = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--primary-color);
  margin-bottom: 0.25rem;
`;

const PriceUnit = styled.span`
  font-size: 0.875rem;
  color: var(--gray-500);
  font-weight: normal;
`;

const StoreInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--gray-600);
  font-size: 0.875rem;
  margin-bottom: 1rem;
`;

const StoreName = styled.span`
  font-weight: 500;
`;

const Location = styled.span`
  color: var(--gray-500);
`;

const Actions = styled.div`
  margin-top: auto;
  display: flex;
  gap: 0.5rem;
`;

const ViewButton = styled(Link)`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: var(--primary-color);
  color: white;
  text-decoration: none;
  border-radius: var(--border-radius);
  font-weight: 500;
  transition: var(--transition);
  
  &:hover {
    background: var(--primary-dark);
  }
`;

const CompareButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem;
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

const ProductCard = ({ product }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  return (
    <Card>
      <ImageContainer>
        {product.image_url ? (
          <ProductImage src={product.image_url} alt={product.product_name} />
        ) : (
          <PlaceholderImage>
            <FiShoppingCart />
          </PlaceholderImage>
        )}
      </ImageContainer>
      
      <Content>
        <ProductName>{product.product_name}</ProductName>
        {product.brand && <Brand>{product.brand}</Brand>}
        
        <PriceInfo>
          <Price>
            {formatPrice(product.price)}
            {product.unit && <PriceUnit> / {product.unit}</PriceUnit>}
          </Price>
        </PriceInfo>
        
        <StoreInfo>
          <FiMapPin />
          <StoreName>{product.store_name}</StoreName>
          <Location>• {product.city}</Location>
        </StoreInfo>
        
        <Actions>
          <ViewButton to={`/product/${product.id || product.product_id}`}>
            Voir détails
          </ViewButton>
          <CompareButton title="Comparer">
            <FiStar />
          </CompareButton>
        </Actions>
      </Content>
    </Card>
  );
};

export default ProductCard;
