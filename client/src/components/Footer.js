import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FiMapPin, FiPhone, FiMail, FiGithub, FiTwitter, FiFacebook } from 'react-icons/fi';
import { categoryService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const FooterContainer = styled.footer`
  background-color: var(--gray-800);
  color: white;
  padding-top: 60px; /* Ajout d’un padding supérieur de 20px */
  padding-bottom: 1rem;
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
  
  .logo-container {
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
    
    img {
      height: 48px;
      width: auto;
    }
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
  const { isAuthenticated, roles } = useAuth();
  const isContributor = roles?.includes('contributor');
  const isAdmin = roles?.includes('admin');
  const contributeLink = isAuthenticated ? ((isContributor || isAdmin) ? '/submit-price' : '/dashboard?apply=1') : '/login';

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    let mounted = true;
    categoryService.getAll()
      .then((res) => {
        const data = res?.data?.data || [];
        if (mounted) setCategories(data);
      })
      .catch((err) => {
        console.error('[footer] Échec du chargement des catégories', err);
      })
      .finally(() => {
        if (mounted) setLoadingCategories(false);
      });
    return () => { mounted = false; };
  }, []);

  return (
    <FooterContainer>
      <FooterContent>
        <FooterGrid>
          <FooterSection>
            <div className="logo-container">
              <img src="/assets/lokali_white.svg" alt="Lokali" />
            </div>
            <p style={{ color: 'var(--gray-300)', marginBottom: '1rem' }}>
              Consultez les prix par localité et connectez-vous directement aux fournisseurs.
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
              {/* Liens alignés sur la barre de navigation */}
              <li><Link to="/all-prices">Tous les prix</Link></li>
              <li><Link to="/price-map">Cartes</Link></li>
              <li><Link to="/suppliers">Fournisseurs</Link></li>
              <li><Link to="/stores">Magasins de stockages</Link></li>
              <li><Link to="/compare">Comparer prix</Link></li>
              <li><Link to={contributeLink}>Contribuer</Link></li>
            </ul>
          </FooterSection>
          
          <FooterSection>
            <h3>Catégories</h3>
            <ul>
              {loadingCategories ? (
                <li style={{ color: 'var(--gray-400)' }}>Chargement…</li>
              ) : categories && categories.length > 0 ? (
                categories.slice(0, 6).map(cat => (
                  <li key={cat.id}>
                    <Link to={`/all-prices?category_id=${cat.id}`}>{cat.name}</Link>
                  </li>
                ))
              ) : (
                <li style={{ color: 'var(--gray-400)' }}>Aucune catégorie</li>
              )}
            </ul>
          </FooterSection>
          
          <FooterSection>
            <h3>Contact</h3>
            <ContactInfo>
              <FiMapPin />
              <span>Cotonou, Bénin</span>
            </ContactInfo>
            <ContactInfo>
              <FiPhone />
              <span>+229 01 67 65 97 17</span>
            </ContactInfo>
            <ContactInfo>
              <FiMail />
              <span>contact@lokali.bj</span>
            </ContactInfo>
          </FooterSection>
        </FooterGrid>
        
        <FooterBottom>
          <p>&copy; 2024 Lokali. Tous droits réservés.</p>
        </FooterBottom>
      </FooterContent>
    </FooterContainer>
  );
};

export default Footer;
