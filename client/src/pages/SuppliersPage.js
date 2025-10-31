import React from 'react';
import styled from 'styled-components';
import { FiUsers } from 'react-icons/fi';

const PageContainer = styled.div`
  padding: 2rem 0;
`;

// En-tête simplifié sans filtre ni recherche

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  color: var(--gray-800);
`;


const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

// Plus de liste/état vide pendant le développement

const DevNotice = styled.div`
  border: 1px dashed var(--primary-color);
  background: #fff8e1;
  color: var(--gray-800);
  padding: 1.25rem;
  border-radius: var(--border-radius);
  margin-bottom: 2rem;
  text-align: center;
`;

const SuppliersPage = () => {
  return (
    <PageContainer>
      <div className="container">
        <TitleRow>
          <FiUsers style={{ color: 'var(--primary-color)' }} />
          <PageTitle>Fournisseurs</PageTitle>
        </TitleRow>
        <DevNotice>
          <strong>Module en cours de développement</strong>
          <p>La gestion des fournisseurs sera disponible prochainement.</p>
        </DevNotice>
      </div>
    </PageContainer>
  );
};

export default SuppliersPage;