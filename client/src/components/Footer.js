import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FiMapPin, FiPhone, FiMail, FiGithub, FiTwitter, FiFacebook } from 'react-icons/fi';

const FooterContainer = styled.footer`
  background-color: var(--gray-800);
  color: white;
  padding: 3rem 0 1rem;
  margin-top: auto;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const FooterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
`;

const FooterSection = styled.div`
  h3 {
    font-size: 1.125rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: white;
  }
  
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  li {
    margin-bottom: 0.5rem;
  }
  
  a {
    color: var(--gray-300);
    text-decoration: none;
    transition: var(--transition);
    
    &:hover {
      color: white;
    }
  }
`;

const ContactInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  color: var(--gray-300);
  
  svg {
    font-size: 1.125rem;
  }
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const SocialLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: var(--gray-700);
  border-radius: 50%;
  color: white;
  text-decoration: none;
  transition: var(--transition);
  
  &:hover {
    background-color: var(--primary-color);
    transform: translateY(-2px);
  }
`;

const FooterBottom = styled.div`
  border-top: 1px solid var(--gray-700);
  padding-top: 1rem;
  text-align: center;
  color: var(--gray-400);
  font-size: 0.875rem;
`;

const Footer = () => {
  return (
    <FooterContainer>
      <FooterContent>
        <FooterGrid>
          <FooterSection>
            <h3>LocalPrice</h3>
            <p style={{ color: 'var(--gray-300)', marginBottom: '1rem' }}>
              Comparez les prix dans vos magasins locaux et trouvez les meilleures offres près de chez vous.
            </p>
            <SocialLinks>
              <SocialLink href="#" aria-label="Facebook">
                <FiFacebook />
              </SocialLink>
              <SocialLink href="#" aria-label="Twitter">
                <FiTwitter />
              </SocialLink>
              <SocialLink href="#" aria-label="GitHub">
                <FiGithub />
              </SocialLink>
            </SocialLinks>
          </FooterSection>
          
          <FooterSection>
            <h3>Navigation</h3>
            <ul>
              <li><Link to="/">Accueil</Link></li>
              <li><Link to="/search">Rechercher</Link></li>
              <li><Link to="/stores">Magasins</Link></li>
              <li><Link to="/compare">Comparer</Link></li>
            </ul>
          </FooterSection>
          
          <FooterSection>
            <h3>Catégories</h3>
            <ul>
              <li><Link to="/search?category=1">Alimentation</Link></li>
              <li><Link to="/search?category=2">Électronique</Link></li>
              <li><Link to="/search?category=3">Vêtements</Link></li>
              <li><Link to="/search?category=4">Maison & Jardin</Link></li>
              <li><Link to="/search?category=5">Santé & Beauté</Link></li>
              <li><Link to="/search?category=6">Sports & Loisirs</Link></li>
            </ul>
          </FooterSection>
          
          <FooterSection>
            <h3>Contact</h3>
            <ContactInfo>
              <FiMapPin />
              <span>123 Rue de la Paix, 75001 Paris</span>
            </ContactInfo>
            <ContactInfo>
              <FiPhone />
              <span>01 23 45 67 89</span>
            </ContactInfo>
            <ContactInfo>
              <FiMail />
              <span>contact@localprice.fr</span>
            </ContactInfo>
          </FooterSection>
        </FooterGrid>
        
        <FooterBottom>
          <p>&copy; 2024 LocalPrice. Tous droits réservés.</p>
        </FooterBottom>
      </FooterContent>
    </FooterContainer>
  );
};

export default Footer;
