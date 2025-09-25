import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FiMapPin, FiPhone, FiMail, FiGlobe, FiClock } from 'react-icons/fi';

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

const Header = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid var(--gray-200);
`;

const StoreName = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--gray-800);
`;

const Address = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  color: var(--gray-600);
  font-size: 0.875rem;
  margin-bottom: 1rem;
`;

const Content = styled.div`
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const ContactInfo = styled.div`
  margin-bottom: 1rem;
`;

const ContactItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--gray-600);
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
  
  a {
    color: var(--primary-color);
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const Hours = styled.div`
  margin-bottom: 1rem;
`;

const HoursTitle = styled.h4`
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--gray-700);
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const HoursText = styled.p`
  font-size: 0.875rem;
  color: var(--gray-600);
  line-height: 1.4;
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

const ProductsButton = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1rem;
  background: var(--gray-200);
  color: var(--gray-700);
  text-decoration: none;
  border-radius: var(--border-radius);
  font-weight: 500;
  transition: var(--transition);
  
  &:hover {
    background: var(--gray-300);
  }
`;

const StoreCard = ({ store }) => {
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

  return (
    <Card>
      <Header>
        <StoreName>{store.name}</StoreName>
        <Address>
          <FiMapPin />
          <span>{store.address}, {store.postal_code} {store.city}</span>
        </Address>
      </Header>
      
      <Content>
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
        
        <Hours>
          <HoursTitle>
            <FiClock />
            Horaires
          </HoursTitle>
          <HoursText style={{ whiteSpace: 'pre-line' }}>
            {formatOpeningHours(store.opening_hours)}
          </HoursText>
        </Hours>
        
        <Actions>
          <ViewButton to={`/store/${store.id}`}>
            Voir détails
          </ViewButton>
          <ProductsButton to={`/search?store=${store.id}`}>
            Produits
          </ProductsButton>
        </Actions>
      </Content>
    </Card>
  );
};

export default StoreCard;
