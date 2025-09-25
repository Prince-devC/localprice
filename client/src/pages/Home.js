import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FiSearch, FiMapPin, FiTrendingUp, FiStar, FiArrowRight } from 'react-icons/fi';
import { agriculturalPriceService, productCategoryService, localityService } from '../services/api';
import ProductCard from '../components/ProductCard';
import StoreCard from '../components/StoreCard';
import LoadingSpinner from '../components/LoadingSpinner';

const HomeContainer = styled.div`
  padding: 2rem 0;
`;

const HeroSection = styled.section`
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
  color: white;
  padding: 4rem 0;
  text-align: center;
  margin-bottom: 3rem;
`;

const HeroContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const HeroTitle = styled.h1`
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.25rem;
  margin-bottom: 2rem;
  opacity: 0.9;
`;

const SearchBox = styled.div`
  max-width: 500px;
  margin: 0 auto;
  position: relative;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border: none;
  border-radius: 50px;
  font-size: 1rem;
  box-shadow: var(--shadow-lg);
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.3);
  }
`;

const SearchIcon = styled(FiSearch)`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.25rem;
  color: var(--gray-500);
`;

const SearchButton = styled.button`
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: var(--primary-dark);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  
  &:hover {
    background: var(--gray-800);
  }
`;

const Section = styled.section`
  margin-bottom: 4rem;
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 2rem;
  text-align: center;
  color: var(--gray-800);
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
`;

const FeatureCard = styled.div`
  background: white;
  padding: 2rem;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow);
  text-align: center;
  transition: var(--transition);
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-lg);
  }
`;

const FeatureIcon = styled.div`
  width: 60px;
  height: 60px;
  background: var(--primary-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  color: white;
  font-size: 1.5rem;
`;

const FeatureTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--gray-800);
`;

const FeatureDescription = styled.p`
  color: var(--gray-600);
  line-height: 1.6;
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StoresGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
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

const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Récupérer les prix agricoles validés
  const { data: agriculturalPrices, isLoading: loadingPrices } = useQuery(
    'agricultural-prices',
    () => agriculturalPriceService.getAll({ limit: 8 }),
    {
      select: (response) => response.data.data,
    }
  );

  // Récupérer les catégories de produits agricoles
  const { data: categories, isLoading: loadingCategories } = useQuery(
    'product-categories',
    () => productCategoryService.getAll(),
    {
      select: (response) => response.data.data.slice(0, 6),
    }
  );

  // Récupérer les localités
  const { data: localities, isLoading: loadingLocalities } = useQuery(
    'localities',
    () => localityService.getAll(),
    {
      select: (response) => response.data.data.slice(0, 6),
    }
  );

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchTerm.trim())}`;
    }
  };

  return (
    <HomeContainer>
      <HeroSection>
        <HeroContent>
          <HeroTitle>Comparez les prix localement</HeroTitle>
          <HeroSubtitle>
            Trouvez les meilleures offres dans vos magasins de proximité
          </HeroSubtitle>
          <SearchBox>
            <form onSubmit={handleSearch}>
              <SearchIcon />
              <SearchInput
                type="text"
                placeholder="Rechercher un produit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <SearchButton type="submit">Rechercher</SearchButton>
            </form>
          </SearchBox>
        </HeroContent>
      </HeroSection>

      <div className="container">
        <Section>
          <SectionTitle>Pourquoi choisir LocalPrice ?</SectionTitle>
          <FeaturesGrid>
            <FeatureCard>
              <FeatureIcon>
                <FiMapPin />
              </FeatureIcon>
              <FeatureTitle>Magasins locaux</FeatureTitle>
              <FeatureDescription>
                Découvrez les magasins près de chez vous et comparez leurs prix en temps réel.
              </FeatureDescription>
            </FeatureCard>
            
            <FeatureCard>
              <FeatureIcon>
                <FiTrendingUp />
              </FeatureIcon>
              <FeatureTitle>Économies garanties</FeatureTitle>
              <FeatureDescription>
                Trouvez toujours les meilleurs prix et économisez sur vos achats quotidiens.
              </FeatureDescription>
            </FeatureCard>
            
            <FeatureCard>
              <FeatureIcon>
                <FiStar />
              </FeatureIcon>
              <FeatureTitle>Comparaison facile</FeatureTitle>
              <FeatureDescription>
                Interface intuitive pour comparer rapidement les prix entre différents magasins.
              </FeatureDescription>
            </FeatureCard>
          </FeaturesGrid>
        </Section>

        <Section>
          <SectionTitle>Prix agricoles récents</SectionTitle>
          {loadingPrices ? (
            <LoadingSpinner />
          ) : (
            <>
              <ProductsGrid>
                {agriculturalPrices?.map((price, index) => (
                  <ProductCard key={price.id || `price-${index}`} product={price} />
                ))}
              </ProductsGrid>
              <div style={{ textAlign: 'center' }}>
                <ViewAllLink to="/agricultural-prices">
                  Voir tous les prix
                  <FiArrowRight />
                </ViewAllLink>
              </div>
            </>
          )}
        </Section>

        <Section>
          <SectionTitle>Catégories de produits</SectionTitle>
          {loadingCategories ? (
            <LoadingSpinner />
          ) : (
            <>
              <StoresGrid>
                {categories?.map((category, index) => (
                  <div key={category.id || `category-${index}`} style={{ 
                    padding: '1rem', 
                    border: '1px solid #e0e0e0', 
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <h4>{category.name}</h4>
                    <p style={{ color: '#666', fontSize: '0.9rem' }}>
                      {category.type === 'brut' ? 'Produit brut' : 'Produit transformé'}
                    </p>
                  </div>
                ))}
              </StoresGrid>
              <div style={{ textAlign: 'center' }}>
                <ViewAllLink to="/categories">
                  Voir toutes les catégories
                  <FiArrowRight />
                </ViewAllLink>
              </div>
            </>
          )}
        </Section>
      </div>
    </HomeContainer>
  );
};

export default Home;
