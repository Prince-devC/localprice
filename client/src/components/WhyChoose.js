import React from 'react';
import styled from 'styled-components';
import { FiMapPin, FiTrendingUp, FiStar } from 'react-icons/fi';

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

const WhyChoose = () => {
  return (
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
  );
};

export default WhyChoose;