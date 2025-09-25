import React from 'react';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const SpinnerContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
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
  margin-top: 1rem;
  color: var(--gray-600);
  font-size: 0.875rem;
`;

const LoadingSpinner = ({ text = 'Chargement...', size = 'medium' }) => {
  const spinnerSize = size === 'small' ? '20px' : size === 'large' ? '60px' : '40px';
  const borderWidth = size === 'small' ? '2px' : size === 'large' ? '6px' : '4px';

  return (
    <SpinnerContainer>
      <div style={{ textAlign: 'center' }}>
        <Spinner 
          style={{ 
            width: spinnerSize, 
            height: spinnerSize,
            borderWidth: borderWidth
          }} 
        />
        {text && <LoadingText>{text}</LoadingText>}
      </div>
    </SpinnerContainer>
  );
};

export default LoadingSpinner;
