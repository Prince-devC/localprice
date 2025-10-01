import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

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

const PricingCard = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'featured',
})`
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
  position: relative;
  padding-left: 1.5rem;
  
  &:before {
    content: '✓';
    position: absolute;
    left: 0;
    color: var(--primary-color);
    font-weight: bold;
  }
`;

const PricingButton = styled(Link).withConfig({
  shouldForwardProp: (prop) => prop !== 'featured',
})`
  display: inline-block;
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

const PricingPlans = () => {
  return (
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

          <PricingCard featured={true}>
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
            <PricingButton featured={true} to="/register">Choisir Premium</PricingButton>
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
  );
};

export default PricingPlans;