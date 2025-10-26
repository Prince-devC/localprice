import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FiMapPin, FiPhone, FiMail, FiGithub, FiTwitter, FiFacebook } from 'react-icons/fi';
import { productCategoryService } from '../services/api';

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
  const [categories, setCategories] = useState([]);
  const [catLoading, setCatLoading] = useState(true);
  const [catError, setCatError] = useState(null);

  useEffect(() => {
    let mounted = true;
    productCategoryService.getAll()
      .then(res => {
        if (!mounted) return;
        setCategories(Array.isArray(res.data) ? res.data : (res.data?.data || []));
      })
      .catch(err => {
        if (!mounted) return;
        setCatError('Impossible de charger les catégories');
      })
      .finally(() => {
        if (!mounted) return;
        setCatLoading(false);
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
              Comparez les prix observés des produits agricoles et trouvez les meilleures offres près de chez vous.
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
              <li><Link to="/stores">Magasins de stockage</Link></li>
              <li><Link to="/compare">Comparer</Link></li>
            </ul>
          </FooterSection>
          
          <FooterSection>
            <h3>Catégories</h3>
            <ul>
              {catLoading && <li style={{ color: 'var(--gray-400)' }}>Chargement des catégories...</li>}
              {!catLoading && catError && <li style={{ color: 'var(--danger-color)' }}>{catError}</li>}
              {!catLoading && !catError && categories.length === 0 && (
                <li style={{ color: 'var(--gray-400)' }}>Aucune catégorie disponible</li>
              )}
              {!catLoading && !catError && categories.map(cat => (
                <li key={cat.id}><Link to={`/search?category=${cat.id}`}>{cat.name}</Link></li>
              ))}
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
              <span>+2290167659717</span>
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
