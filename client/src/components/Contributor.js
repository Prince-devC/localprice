import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const ContributorSection = styled.section`
  background: var(--primary-color);
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

const Contributor = () => {
  return (
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
  );
};

export default Contributor;