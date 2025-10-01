import React from 'react';
import { Link } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { FiArrowRight } from 'react-icons/fi';

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const HeroSection = styled.section`
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
  color: white;
  padding: 5rem 0;
  text-align: center;
  margin-bottom: 3rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.05);
    opacity: 0.3;
  }
`;

const HeroContent = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 0 1rem;
  position: relative;
  z-index: 1;
`;

const HeroTitle = styled.h1`
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  line-height: 1.2;
  animation: ${fadeInUp} 0.8s ease-out;

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }

  @media (max-width: 480px) {
    font-size: 2rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.4rem;
  margin-bottom: 3rem;
  opacity: 0.95;
  line-height: 1.6;
  animation: ${fadeInUp} 0.8s ease-out 0.2s both;

  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;



const HeroCTA = styled.div`
  margin-top: 3rem;
  animation: ${fadeInUp} 0.8s ease-out 0.6s both;
`;

const CTAButton = styled.button`\n  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(255, 255, 255, 0.15);
  color: white;
  padding: 1rem 2rem;
  border-radius: 50px;
  text-decoration: none;
  font-weight: 600;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);

  &:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    color: white;
  }

  svg {
    transition: transform 0.3s ease;
  }

  &:hover svg {
    transform: translateX(5px);
  }
`;

const Hero = () => {
  return (
    <HeroSection>
      <HeroContent>
        <HeroTitle>
          Votre courtier digital pour l'agriculture béninoise
        </HeroTitle>
        <HeroSubtitle>
          Accédez aux prix des produits agricoles, bruts ou transformés, directement auprès des producteurs et coopératives. Rejoignez notre réseau de centaines d'acteurs pour des achats plus stratégiques.
        </HeroSubtitle>
        <HeroCTA>
          <CTAButton onClick={() => { document.getElementById('filters-section').scrollIntoView({ behavior: 'smooth' }); }}>
            Explorer les prix
            <FiArrowRight />
          </CTAButton>
        </HeroCTA>
      </HeroContent>
    </HeroSection>
  );
};

export default Hero;