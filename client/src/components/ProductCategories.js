import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import styled from 'styled-components';
import { FiArrowRight } from 'react-icons/fi';
import { productCategoryService } from '../services/api';
import LoadingSpinner from './LoadingSpinner';

const Section = styled.section`
  margin-bottom: 4rem;
  padding: 0 1rem;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 2rem;
  text-align: center;
  color: var(--gray-800);
`;

const StoresGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const CategoryCard = styled.div`
  padding: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  text-align: center;
  background: white;
  transition: var(--transition);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow);
    border-color: var(--primary-color);
  }
  
  h4 {
    margin: 0 0 0.5rem 0;
    color: var(--gray-800);
    font-size: 1.125rem;
    font-weight: 600;
  }
  
  p {
    color: #666;
    font-size: 0.9rem;
    margin: 0;
  }
`;

const ViewAllContainer = styled.div`
  text-align: center;
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

const ProductCategories = () => {
  const { data: categories, isLoading: loadingCategories } = useQuery(
    'product-categories',
    () => productCategoryService.getAll(),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  return (
    <Section>
      <SectionTitle>Catégories de produits</SectionTitle>
      {loadingCategories ? (
        <LoadingSpinner />
      ) : (
        <>
          <StoresGrid>
            {Array.isArray(categories) && categories.map((category, index) => (
              <CategoryCard key={category.id || `category-${index}`}>
                <h4>{category.name}</h4>
                <p>
                  {category.type === 'brut' ? 'Produit brut' : 'Produit transformé'}
                </p>
              </CategoryCard>
            ))}
          </StoresGrid>
          <ViewAllContainer>
            <ViewAllLink to="/categories">
              Voir toutes les catégories
              <FiArrowRight />
            </ViewAllLink>
          </ViewAllContainer>
        </>
      )}
    </Section>
  );
};

export default ProductCategories;