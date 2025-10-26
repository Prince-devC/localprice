import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FiUser, FiLogOut, FiMenu, FiX, FiChevronDown, FiTrendingUp, FiHome, FiShield } from 'react-icons/fi';
import { FaCalculator } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/api';

const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  height: 80px;
  
  @media (max-width: 480px) {
    height: 70px;
  }
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  @media (max-width: 480px) {
    padding: 0 1rem;
  }
`;

const Logo = styled(Link)`
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--primary-color);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
  
  img {
    height: 60px;
    width: auto;
  }
  
  @media (max-width: 1024px) {
    img {
      height: 50px;
    }
  }
  
  @media (max-width: 768px) {
    img {
      height: 45px;
    }
  }
  
  @media (max-width: 480px) {
    font-size: 1.25rem;
    gap: 0.25rem;
    
    img {
      height: 40px;
    }
  }
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  justify-content: center;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLink = styled(Link)`
  color: var(--gray-700);
  text-decoration: none;
  font-weight: 500;
  padding: 0.625rem 0.875rem;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  position: relative;
  font-size: 0.9rem;
  
  &:hover {
    color: var(--primary-color);
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(59, 130, 246, 0.04) 100%);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.15);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 1px 4px rgba(59, 130, 246, 0.1);
  }
`;

// Dropdown pour regrouper "Calculer les coûts" et "Comparer"
const DropdownContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const DropdownButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--gray-700);
  background: none;
  border: none;
  font-weight: 500;
  padding: 0.625rem 0.875rem;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  font-size: 0.9rem;
  cursor: pointer;
  
  &:hover {
    color: var(--primary-color);
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(59, 130, 246, 0.04) 100%);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.15);
  }
  
  svg {
    transition: transform 0.3s ease;
    transform: ${props => props.$isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  border: 1px solid var(--gray-100);
  min-width: 200px;
  z-index: 1001;
  opacity: ${props => props.$isOpen ? 1 : 0};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  transform: ${props => props.$isOpen ? 'translateY(0) scale(1)' : 'translateY(-10px) scale(0.95)'};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  
  &::before {
    content: '';
    position: absolute;
    top: -8px;
    left: 20px;
    width: 16px;
    height: 16px;
    background: white;
    border: 1px solid var(--gray-100);
    border-bottom: none;
    border-right: none;
    transform: rotate(45deg);
    z-index: -1;
  }
`;

const ToolsDropdownItem = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  color: var(--gray-700);
  text-decoration: none;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 500;
  border-radius: 8px;
  margin: 0.25rem;
  
  &:hover {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(59, 130, 246, 0.04) 100%);
    color: var(--primary-color);
    transform: translateX(4px);
  }
  
  &:first-child {
    margin-top: 0.5rem;
  }
  
  &:last-child {
    margin-bottom: 0.5rem;
  }
`;

const UserMenu = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
`;

const UserButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 2px solid var(--gray-200);
  border-radius: 12px;
  color: var(--gray-700);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
  
  &:hover {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(59, 130, 246, 0.04) 100%);
    border-color: var(--primary-color);
    color: var(--primary-color);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(59, 130, 246, 0.1);
  }
`;

const Dropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  border: 1px solid var(--gray-100);
  min-width: 180px;
  z-index: 1001;
  opacity: ${props => props.$isOpen ? 1 : 0};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  transform: ${props => props.$isOpen ? 'translateY(0) scale(1)' : 'translateY(-10px) scale(0.95)'};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  
  &::before {
    content: '';
    position: absolute;
    top: -8px;
    right: 20px;
    width: 16px;
    height: 16px;
    background: white;
    border: 1px solid var(--gray-100);
    border-bottom: none;
    border-right: none;
    transform: rotate(45deg);
    z-index: -1;
  }
`;

const UserDropdownItem = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  color: var(--gray-700);
  text-decoration: none;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 500;
  border-radius: 8px;
  margin: 0.25rem;
  
  &:hover {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(59, 130, 246, 0.04) 100%);
    color: var(--primary-color);
    transform: translateX(4px);
  }
  
  &:first-child {
    margin-top: 0.5rem;
  }
  
  &:last-child {
    margin-bottom: 0.5rem;
  }
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.875rem 1rem;
  background: none;
  border: none;
  color: var(--gray-700);
  text-align: left;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 500;
  border-radius: 8px;
  margin: 0.25rem;
  
  &:hover {
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(239, 68, 68, 0.04) 100%);
    color: #dc2626;
    transform: translateX(4px);
  }
  
  &:last-child {
    margin-bottom: 0.5rem;
  }
`;

// Bouton de connexion stylisé
const LoginButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  background: var(--primary-color);
  color: white;
  text-decoration: none;
  font-weight: 500;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
  
  &:hover {
    background: var(--primary-dark);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
  }
`;

const RegisterButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  background: transparent;
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
  border: 2px solid var(--primary-color);
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    background: var(--primary-color);
    color: white;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const AuthButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 2px solid var(--gray-200);
  border-radius: 12px;
  padding: 0.75rem;
  color: var(--gray-700);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
  
  &:hover {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(59, 130, 246, 0.04) 100%);
    border-color: var(--primary-color);
    color: var(--primary-color);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(59, 130, 246, 0.1);
  }
  
  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const MobileMenu = styled.div`
  position: fixed;
  top: 80px;
  left: 0;
  right: 0;
  background: white;
  border-bottom: 1px solid var(--gray-200);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 999;
  transform: translateY(${props => props.$isOpen ? '0' : '-100%'});
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: calc(100vh - 80px);
  overflow-y: auto;
  
  @media (max-width: 480px) {
    top: 70px;
    max-height: calc(100vh - 70px);
  }
  
  @media (min-width: 769px) {
    display: none;
  }
`;

const MobileNavLink = styled(Link)`
  display: block;
  padding: 1rem 1.25rem;
  color: var(--gray-700);
  text-decoration: none;
  border-bottom: 1px solid var(--gray-100);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 500;
  position: relative;
  
  &:hover {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(59, 130, 246, 0.04) 100%);
    color: var(--primary-color);
    transform: translateX(8px);
  }
  
  &:active {
    transform: translateX(4px);
  }
  
  @media (max-width: 480px) {
    padding: 0.875rem 1rem;
    font-size: 0.875rem;
  }
`;

const MobileDropdownSection = styled.div`
  margin: 0.5rem 0;
`;

const MobileDropdownHeader = styled.div`
  padding: 0.75rem 1.25rem;
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--gray-600);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: var(--gray-50);
  border-left: 3px solid var(--primary-color);
`;

const MobileOverlay = styled.div`
  position: fixed;
  top: 80px;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 998;
  display: ${props => props.$isOpen ? 'block' : 'none'};
  
  @media (max-width: 480px) {
    top: 70px;
  }
  
  @media (min-width: 769px) {
    display: none;
  }
`;

const Header = () => {
  const { user, logout, isAuthenticated, roles } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isToolsDropdownOpen, setIsToolsDropdownOpen] = useState(false);
  const [isDirectoryDropdownOpen, setIsDirectoryDropdownOpen] = useState(false);
  const navigate = useNavigate();

  // using roles from AuthContext; removed local fetch
  // const [roles, setRoles] = useState([]);
  // useEffect(() => {
  //   if (isAuthenticated && user) {
  //     authService.getRoles()
  //       .then(resp => setRoles(resp?.data?.data?.roles || []))
  //       .catch(() => setRoles([]));
  //   } else {
  //     setRoles([]);
  //   }
  // }, [isAuthenticated, user?.id]);

  const isAdmin = !!(
    (roles && (roles.includes('admin') || roles.includes('super_admin')))
    || (user?.user_metadata && (user.user_metadata.role === 'admin' || user.user_metadata.role === 'super_admin'))
    || (user?.app_metadata && (user.app_metadata.role === 'admin' || user.app_metadata.role === 'super_admin'))
    || (user?.role === 'admin' || user?.role === 'super_admin')
  );

  const isContributor = !!(
    (roles && roles.includes('contributor'))
    || (user?.user_metadata && user.user_metadata.role === 'contributor')
    || (user?.app_metadata && user.app_metadata.role === 'contributor')
    || user?.role === 'contributor'
  );

  const displayName = user?.user_metadata?.firstName
    ? `${user.user_metadata.firstName} ${user.user_metadata.lastName || ''}`.trim()
    : (user?.user_metadata?.username || user?.email || 'Utilisateur');

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  // Fermer les menus quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isUserMenuOpen) {
        setIsUserMenuOpen(false);
      }
      if (isToolsDropdownOpen) {
        setIsToolsDropdownOpen(false);
      }
      if (isDirectoryDropdownOpen) {
        setIsDirectoryDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen, isToolsDropdownOpen, isDirectoryDropdownOpen]);

  // Fermer le menu mobile quand on navigue
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [navigate]);

  return (
    <>
      <HeaderContainer>
        <HeaderContent>
          <Logo to="/">
            <img src="/assets/lokali_blue.svg" alt="Lokali" />
          </Logo>
          
          <Nav>
            <NavLink to="/all-prices">Tous les prix</NavLink>
            <NavLink to="/price-map">Cartes</NavLink>

            <DropdownContainer>
              <DropdownButton 
                onClick={() => setIsDirectoryDropdownOpen(!isDirectoryDropdownOpen)}
                $isOpen={isDirectoryDropdownOpen}
              >
                Ressources
                <FiChevronDown />
              </DropdownButton>
              <DropdownMenu $isOpen={isDirectoryDropdownOpen}>
                <ToolsDropdownItem to="/suppliers">
                  Fournisseurs
                </ToolsDropdownItem>
                <ToolsDropdownItem to="/stores">
                  Magasins de stockages
                </ToolsDropdownItem>
              </DropdownMenu>
            </DropdownContainer>
            
            <DropdownContainer>
              <DropdownButton 
                onClick={() => setIsToolsDropdownOpen(!isToolsDropdownOpen)}
                $isOpen={isToolsDropdownOpen}
              >
                Outils
                <FiChevronDown />
              </DropdownButton>
              <DropdownMenu $isOpen={isToolsDropdownOpen}>
                <ToolsDropdownItem to="/cost-comparator">
                  <FaCalculator />
                  Calculer les coûts
                </ToolsDropdownItem>
                <ToolsDropdownItem to="/compare">
                  <FiTrendingUp />
                  Comparer prix
                </ToolsDropdownItem>
              </DropdownMenu>
            </DropdownContainer>
            
            <NavLink to={isAuthenticated ? ((isContributor || isAdmin) ? '/submit-price' : '/dashboard?apply=1') : '/login'}>Contribuer</NavLink>
            {/* Retiré: Mon Espace & Espace Admin du menu principal */}
          </Nav>

          {isAuthenticated ? (
            <UserMenu>
              <UserButton onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}>
                <FiUser />
                {displayName}
              </UserButton>
              <Dropdown $isOpen={isUserMenuOpen}>
                {isAdmin && (
                  <UserDropdownItem to="/admin">
                    <FiShield />
                    Espace Admin
                  </UserDropdownItem>
                )}
                {(roles?.includes('contributor') || roles?.includes('user')) && (
                  <UserDropdownItem to="/dashboard">
                    <FiHome />
                    Mon Espace
                  </UserDropdownItem>
                )}

                <UserDropdownItem to="/profile">
                  <FiUser />
                  Mon Profil
                </UserDropdownItem>
                <LogoutButton onClick={handleLogout}>
                  <FiLogOut />
                  Déconnexion
                </LogoutButton>
              </Dropdown>
            </UserMenu>
          ) : (
            <AuthButtons>
              <LoginButton to="/login">
                <FiUser />
                Connexion
              </LoginButton>
              <RegisterButton to="/register">
                S'inscrire
              </RegisterButton>
            </AuthButtons>
          )}
          
          <MobileMenuButton onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <FiX /> : <FiMenu />}
          </MobileMenuButton>
        </HeaderContent>
      </HeaderContainer>
      
      <MobileOverlay 
        $isOpen={isMobileMenuOpen} 
        onClick={() => setIsMobileMenuOpen(false)}
      />
      
      <MobileMenu $isOpen={isMobileMenuOpen}>
        <MobileNavLink to="/all-prices">Tous les prix</MobileNavLink>
        <MobileNavLink to="/price-map">Cartes</MobileNavLink>

        {/* Section Ressources */}
        <MobileDropdownSection>
          <MobileDropdownHeader>Ressources</MobileDropdownHeader>
          <MobileNavLink to="/suppliers" style={{paddingLeft: '2rem'}}>
            Fournisseurs
          </MobileNavLink>
          <MobileNavLink to="/stores" style={{paddingLeft: '2rem'}}>
            Magasins de stockages
          </MobileNavLink>
        </MobileDropdownSection>
        
        {/* Section Outils */}
        <MobileDropdownSection>
          <MobileDropdownHeader>Outils</MobileDropdownHeader>
          <MobileNavLink to="/cost-comparator" style={{paddingLeft: '2rem'}}>
            <FaCalculator />
            Calculer les coûts
          </MobileNavLink>
          <MobileNavLink to="/compare" style={{paddingLeft: '2rem'}}>
            <FiTrendingUp />
            Comparer prix
          </MobileNavLink>
        </MobileDropdownSection>
        
        <MobileNavLink to={isAuthenticated ? ((isContributor || isAdmin) ? '/submit-price' : '/dashboard?apply=1') : '/login'}>Contribuer</MobileNavLink>
        {/* Retiré: Espace Admin et Mon Espace du menu mobile principal */}
        
        {isAuthenticated ? (
          <>
            {/* Garder seulement les options Profil/Déconnexion ici; accès Admin/Espace via menu profil */}
            <MobileNavLink to="/profile">Mon Profil</MobileNavLink>
            <MobileNavLink to="#" onClick={handleLogout}>Déconnexion</MobileNavLink>
          </>
        ) : (
          <>
            <MobileNavLink to="/login">Connexion</MobileNavLink>
            <MobileNavLink to="/register">S'inscrire</MobileNavLink>
          </>
        )}
      </MobileMenu>
    </>
  );
};

export default Header;
