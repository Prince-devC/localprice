import React from 'react';
import styled from 'styled-components';
import { FiMapPin } from 'react-icons/fi';

const StoreListContainer = styled.div`
  padding: 2rem 0;
`;

// En-tête simplifié sans filtre ni recherche

const SearchTitle = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: var(--gray-800);
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const DevNotice = styled.div`
  border: 1px dashed var(--primary-color);
  background: #fff8e1;
  color: var(--gray-800);
  padding: 1.25rem;
  border-radius: var(--border-radius);
  margin-bottom: 2rem;
  text-align: center;
`;

const StoreList = () => {
  return (
    <StoreListContainer>
      <div className="container">
        <TitleRow>
          <FiMapPin style={{ color: 'var(--primary-color)' }} />
          <SearchTitle>Magasins</SearchTitle>
        </TitleRow>
        <DevNotice>
          <strong>Module en cours de développement</strong>
          <p>La gestion des magasins est en construction et sera disponible bientôt.</p>
        </DevNotice>
      </div>
    </StoreListContainer>
  );
};

export default StoreList;
