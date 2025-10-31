import React from 'react';
import styled from 'styled-components';

const ComparisonContainer = styled.div`
  padding: 2rem 0;
`;

const ComparisonHeader = styled.div`
  background: white;
  padding: 2rem;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow);
  margin-bottom: 2rem;
`;

const ComparisonTitle = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: var(--gray-800);
`;

const ComparisonSubtitle = styled.p`
  color: var(--gray-600);
  margin-bottom: 2rem;
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

const Comparison = () => {
  return (
    <ComparisonContainer>
      <div className="container">
        <ComparisonHeader>
          <ComparisonTitle>Comparaison de prix</ComparisonTitle>
          <ComparisonSubtitle>
            Ce module est en cours de développement.
          </ComparisonSubtitle>
          <DevNotice>
            La comparaison avancée sera disponible prochainement.
          </DevNotice>
        </ComparisonHeader>
      </div>
    </ComparisonContainer>
  );
};

export default Comparison;
