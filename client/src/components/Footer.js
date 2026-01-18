import React, { useEffect, useState } from 'react';
import { Link, NavLink as RouterNavLink, useLocation } from 'react-router-dom';
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

    &[aria-current="page"] {
      color: var(--primary-color);
      font-weight: 600;
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
  const location = useLocation();
  const { isAuthenticated, roles } = useAuth();
  const isContributor = roles?.includes('contributor');
  const isAdmin = roles?.includes('admin');
  const contributeLink = isAuthenticated ? ((isContributor || isAdmin) ? '/submit-price' : '/dashboard?apply=1') : '/login';

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const searchParams = new URLSearchParams(location.search);
  const activeCategoryId = location.pathname.startsWith('/all-prices')
    ? searchParams.get('category_id')
    : null;

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
              <li><RouterNavLink to="/all-prices">Tous les prix</RouterNavLink></li>
              <li><RouterNavLink to="/price-map">Cartes</RouterNavLink></li>
              <li><RouterNavLink to="/suppliers">Fournisseurs</RouterNavLink></li>
              <li><RouterNavLink to="/stores">Magasins de stockages</RouterNavLink></li>
              <li><RouterNavLink to="/compare">Comparer prix</RouterNavLink></li>
              <li><RouterNavLink to={contributeLink}>Contribuer</RouterNavLink></li>
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
                    <Link
                      to={`/all-prices?category_id=${cat.id}`}
                      aria-current={activeCategoryId === String(cat.id) ? 'page' : undefined}
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))
              ) : (
                <li style={{ color: 'var(--gray-400)' }}>Aucune catégorie</li>
              )}
            </ul>
          </FooterSection>

          <FooterSection>
            <h3>Mentions</h3>
            <ul>
              <li><RouterNavLink to="/terms">Conditions d’utilisation</RouterNavLink></li>
              <li><RouterNavLink to="/privacy">Politique de confidentialité</RouterNavLink></li>
              <li><RouterNavLink to="/contribution-terms">Conditions de contribution</RouterNavLink></li>
            </ul>
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
