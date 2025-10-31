import React from 'react';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const SpinnerContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  min-height: 220px; /* assure un centrage visuel dans les panneaux */
  padding: 1.5rem;
  text-align: center;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid var(--gray-200);
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const LoadingText = styled.p`
  margin: 0 0 0.75rem 0; /* texte au-dessus du spinner */
  color: var(--gray-600);
  font-size: 0.875rem;
`;

const LoadingSpinner = ({ text = 'Chargement...', size = 'medium' }) => {
  const spinnerSize = size === 'small' ? '20px' : size === 'large' ? '60px' : '40px';
  const borderWidth = size === 'small' ? '2px' : size === 'large' ? '6px' : '4px';

  return (
    <SpinnerContainer>
      {text && <LoadingText>{text}</LoadingText>}
      <Spinner 
        style={{ 
          width: spinnerSize, 
          height: spinnerSize,
          borderWidth: borderWidth
        }} 
      />
    </SpinnerContainer>
  );
};

export default LoadingSpinner;
