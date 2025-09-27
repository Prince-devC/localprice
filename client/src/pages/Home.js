import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FiMapPin, FiTrendingUp, FiStar, FiArrowRight } from 'react-icons/fi';
import { agriculturalPriceService, productCategoryService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import PriceFilters from '../components/PriceFilters';

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

const HeroDescription = styled.p`
  font-size: 1.125rem;
  margin-bottom: 2rem;
  opacity: 0.9;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
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

const PricingSection = styled.section`
  background: var(--gray-50);
  padding: 4rem 0;
  margin-bottom: 4rem;
`;

const PricingContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const PricingTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 1rem;
  color: var(--gray-800);
`;

const PricingSubtitle = styled.p`
  font-size: 1.125rem;
  text-align: center;
  color: var(--gray-600);
  margin-bottom: 3rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`;

const PricingGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
`;

const PricingCard = styled.div`
  background: white;
  padding: 2rem;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow);
  text-align: center;
  position: relative;
  transition: var(--transition);
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-lg);
  }
  
  ${props => props.featured && `
    border: 2px solid var(--primary-color);
    transform: scale(1.05);
  `}
`;

const PricingBadge = styled.div`
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--primary-color);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
`;

const PricingName = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--gray-800);
`;

const PricingPrice = styled.div`
  font-size: 3rem;
  font-weight: bold;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
`;

const PricingPeriod = styled.p`
  color: var(--gray-600);
  margin-bottom: 2rem;
`;

const PricingFeatures = styled.ul`
  list-style: none;
  padding: 0;
  margin-bottom: 2rem;
  text-align: left;
`;

const PricingFeature = styled.li`
  padding: 0.5rem 0;
  color: var(--gray-700);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:before {
    content: '✓';
    color: var(--primary-color);
    font-weight: bold;
  }
`;

const PricingButton = styled(Link)`
  display: inline-block;
  width: 100%;
  padding: 1rem 2rem;
  background: ${props => props.featured ? 'var(--primary-color)' : 'transparent'};
  color: ${props => props.featured ? 'white' : 'var(--primary-color)'};
  border: 2px solid var(--primary-color);
  border-radius: var(--border-radius);
  text-decoration: none;
  font-weight: 600;
  transition: var(--transition);
  
  &:hover {
    background: var(--primary-color);
    color: white;
  }
`;

const ContributorSection = styled.section`
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
  color: white;
  padding: 4rem 0;
  margin-bottom: 4rem;
  text-align: center;
`;

const ContributorContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const ContributorTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
`;

const ContributorDescription = styled.p`
  font-size: 1.125rem;
  margin-bottom: 2rem;
  opacity: 0.9;
`;

const ContributorButton = styled(Link)`
  display: inline-block;
  padding: 1rem 2rem;
  background: white;
  color: var(--primary-color);
  border-radius: var(--border-radius);
  text-decoration: none;
  font-weight: 600;
  transition: var(--transition);
  
  &:hover {
    background: var(--gray-100);
    transform: translateY(-2px);
  }
`;

const TestimonialsSection = styled.section`
  padding: 4rem 0;
  margin-bottom: 4rem;
`;

const TestimonialsContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const TestimonialsTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 3rem;
  color: var(--gray-800);
`;

const TestimonialsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
`;

const TestimonialCard = styled.div`
  background: white;
  padding: 2rem;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow);
  text-align: center;
`;

const TestimonialText = styled.p`
  font-style: italic;
  color: var(--gray-700);
  margin-bottom: 1.5rem;
  line-height: 1.6;
`;

const TestimonialAuthor = styled.div`
  font-weight: 600;
  color: var(--gray-800);
`;

const TestimonialRole = styled.div`
  font-size: 0.875rem;
  color: var(--gray-600);
  margin-top: 0.25rem;
`;

const TradingTable = styled.div`
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow);
  overflow: hidden;
  margin-bottom: 2rem;
`;

const TradingHeader = styled.div`
  background: var(--gray-50);
  border-bottom: 1px solid var(--gray-200);
`;

const TradingHeaderRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr;
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
  max-height: 400px;
  overflow-y: auto;
`;

const TradingRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr;
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

const PriceChange = styled.div`
  font-weight: 600;
  font-size: 0.875rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  text-align: center;
  color: ${props => props.positive ? '#059669' : '#dc2626'};
  background: ${props => props.positive ? '#d1fae5' : '#fee2e2'};
  font-family: 'Courier New', monospace;
`;

const VolumeValue = styled.div`
  font-weight: 500;
  color: var(--gray-600);
  font-size: 0.875rem;
  font-family: 'Courier New', monospace;
`;

const LastUpdate = styled.div`
  font-size: 0.75rem;
  color: var(--gray-500);
  font-family: 'Courier New', monospace;
`;

const Home = () => {
  const [filters, setFilters] = useState({
    category: 'tous',
    product: 'tous',
    locality: 'tous',
    period: '7'
  });

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


  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    // Ici on pourrait déclencher une nouvelle requête avec les filtres
    console.log('Filtres appliqués:', newFilters);
  };

  return (
    <HomeContainer>
      <HeroSection>
        <HeroContent>
          <HeroTitle>Trouver le prix</HeroTitle>
          <HeroSubtitle>
            Découvrez les prix des produits agricoles dans votre région
          </HeroSubtitle>
          <HeroDescription>
            Utilisez les filtres ci-dessous pour trouver les prix des produits agricoles selon vos critères
          </HeroDescription>
        </HeroContent>
      </HeroSection>

      <PriceFilters filters={filters} onFilterChange={handleFilterChange} />

      <div className="container">
        <Section>
          <SectionTitle style={{ marginTop: '2rem' }}>Prix agricoles récents</SectionTitle>
          {loadingPrices ? (
            <LoadingSpinner />
          ) : (
            <>
              <TradingTable>
                <TradingHeader>
                  <TradingHeaderRow>
                    <TradingHeaderCell>Produit</TradingHeaderCell>
                    <TradingHeaderCell>Localité</TradingHeaderCell>
                    <TradingHeaderCell>Prix actuel</TradingHeaderCell>
                    <TradingHeaderCell>Variation</TradingHeaderCell>
                    <TradingHeaderCell>Volume</TradingHeaderCell>
                    <TradingHeaderCell>Dernière MAJ</TradingHeaderCell>
                  </TradingHeaderRow>
                </TradingHeader>
                <TradingBody>
                  {agriculturalPrices?.map((price, index) => (
                    <TradingRow key={price.id || `price-${index}`}>
                      <TradingCell>
                        <ProductInfo>
                          <ProductName>{price.product_name || 'Produit'}</ProductName>
                          <ProductCategory>{price.category_name || 'Catégorie'}</ProductCategory>
                        </ProductInfo>
                      </TradingCell>
                      <TradingCell>
                        <LocationInfo>
                          <LocationName>{price.locality_name || 'Localité'}</LocationName>
                        </LocationInfo>
                      </TradingCell>
                      <TradingCell>
                        <PriceValue>{price.price ? `${price.price} FCFA` : 'N/A'}</PriceValue>
                      </TradingCell>
                      <TradingCell>
                        <PriceChange positive={Math.random() > 0.5}>
                          {Math.random() > 0.5 ? '+' : ''}{Math.floor(Math.random() * 20)}%
                        </PriceChange>
                      </TradingCell>
                      <TradingCell>
                        <VolumeValue>{Math.floor(Math.random() * 1000)}</VolumeValue>
                      </TradingCell>
                      <TradingCell>
                        <LastUpdate>
                          {price.updated_at ? new Date(price.updated_at).toLocaleDateString('fr-FR') : 'N/A'}
                        </LastUpdate>
                      </TradingCell>
                    </TradingRow>
                  ))}
                </TradingBody>
              </TradingTable>
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
          <SectionTitle>Pourquoi choisir Lokali ?</SectionTitle>
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

        <PricingSection>
          <PricingContainer>
            <PricingTitle>Nos Offres</PricingTitle>
            <PricingSubtitle>
              Choisissez l'offre qui correspond à vos besoins
            </PricingSubtitle>
            <PricingGrid>
              <PricingCard>
                <PricingName>Gratuit</PricingName>
                <PricingPrice>0 FCFA</PricingPrice>
                <PricingPeriod>par mois</PricingPeriod>
                <PricingFeatures>
                  <PricingFeature>Consultation des prix de base</PricingFeature>
                  <PricingFeature>Comparaison simple</PricingFeature>
                  <PricingFeature>Accès aux données publiques</PricingFeature>
                  <PricingFeature>Support communautaire</PricingFeature>
                </PricingFeatures>
                <PricingButton to="/register">Commencer gratuitement</PricingButton>
              </PricingCard>

              <PricingCard featured>
                <PricingBadge>Populaire</PricingBadge>
                <PricingName>Premium</PricingName>
                <PricingPrice>5 000 FCFA</PricingPrice>
                <PricingPeriod>par mois</PricingPeriod>
                <PricingFeatures>
                  <PricingFeature>Tout du plan gratuit</PricingFeature>
                  <PricingFeature>Alertes de prix personnalisées</PricingFeature>
                  <PricingFeature>Historique des prix détaillé</PricingFeature>
                  <PricingFeature>Calculateur de coûts avancé</PricingFeature>
                  <PricingFeature>Support prioritaire</PricingFeature>
                </PricingFeatures>
                <PricingButton featured to="/register">Choisir Premium</PricingButton>
              </PricingCard>

              <PricingCard>
                <PricingName>Pro</PricingName>
                <PricingPrice>15 000 FCFA</PricingPrice>
                <PricingPeriod>par mois</PricingPeriod>
                <PricingFeatures>
                  <PricingFeature>Tout du plan Premium</PricingFeature>
                  <PricingFeature>API d'accès aux données</PricingFeature>
                  <PricingFeature>Rapports personnalisés</PricingFeature>
                  <PricingFeature>Intégration avec vos systèmes</PricingFeature>
                  <PricingFeature>Support dédié</PricingFeature>
                </PricingFeatures>
                <PricingButton to="/register">Choisir Pro</PricingButton>
              </PricingCard>
            </PricingGrid>
          </PricingContainer>
        </PricingSection>

        <ContributorSection>
          <ContributorContent>
            <ContributorTitle>Devenez Contributeur</ContributorTitle>
            <ContributorDescription>
              Aidez-nous à collecter les données de prix et contribuez à la transparence du marché agricole au Bénin
            </ContributorDescription>
            <ContributorButton to="/submit-price">
              Commencer à contribuer
            </ContributorButton>
          </ContributorContent>
        </ContributorSection>

        <TestimonialsSection>
          <TestimonialsContainer>
            <TestimonialsTitle>Ce que pensent nos clients</TestimonialsTitle>
            <TestimonialsGrid>
              <TestimonialCard>
                <TestimonialText>
                  "Lokali m'a permis de trouver les meilleurs prix pour mes achats agricoles. 
                  J'économise maintenant 20% sur mes dépenses mensuelles."
                </TestimonialText>
                <TestimonialAuthor>Marie Koffi</TestimonialAuthor>
                <TestimonialRole>Agricultrice, Cotonou</TestimonialRole>
              </TestimonialCard>

              <TestimonialCard>
                <TestimonialText>
                  "Interface très intuitive et données toujours à jour. 
                  C'est devenu un outil indispensable pour mon commerce."
                </TestimonialText>
                <TestimonialAuthor>Jean-Baptiste Agbessi</TestimonialAuthor>
                <TestimonialRole>Commerçant, Porto-Novo</TestimonialRole>
              </TestimonialCard>

              <TestimonialCard>
                <TestimonialText>
                  "En tant que contributeur, je participe à la transparence du marché 
                  tout en ayant accès à des données précieuses pour mon activité."
                </TestimonialText>
                <TestimonialAuthor>Fatouma Ouedraogo</TestimonialAuthor>
                <TestimonialRole>Distributeur, Parakou</TestimonialRole>
              </TestimonialCard>
            </TestimonialsGrid>
          </TestimonialsContainer>
        </TestimonialsSection>
      </div>
    </HomeContainer>
  );
};

export default Home;
