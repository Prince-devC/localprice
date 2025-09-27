import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FiSearch, FiUser, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';

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
  padding: 0 1rem;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  @media (max-width: 480px) {
    padding: 0 0.75rem;
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
  margin-right: 2rem;
  
  @media (max-width: 1024px) {
    margin-right: 1.5rem;
  }
  
  @media (max-width: 768px) {
    margin-right: 1rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.25rem;
    gap: 0.25rem;
    margin-right: 0.5rem;
  }
`;

const SearchContainer = styled.div`
  flex: 1;
  min-width: 300px;
  max-width: 700px;
  margin: 0 1.5rem;
  position: relative;
  
  @media (max-width: 1024px) {
    margin: 0 1rem;
    min-width: 250px;
    max-width: 500px;
  }
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const SearchForm = styled.form`
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 3rem;
  border: 2px solid var(--gray-200);
  border-radius: 30px;
  font-size: 0.9rem;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.04),
    0 1px 2px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  
  &::placeholder {
    color: var(--gray-500);
    font-weight: 400;
    transition: all 0.3s ease;
  }
  
  &:hover {
    border-color: var(--gray-300);
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    box-shadow: 
      0 4px 12px rgba(0, 0, 0, 0.08),
      0 2px 4px rgba(0, 0, 0, 0.06),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
    
    &::placeholder {
      color: var(--gray-600);
      transform: translateX(2px);
    }
  }
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    background: white;
    box-shadow: 
      0 0 0 4px rgba(59, 130, 246, 0.12),
      0 8px 25px rgba(0, 0, 0, 0.12),
      0 4px 12px rgba(0, 0, 0, 0.08),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
    transform: translateY(-2px) scale(1.02);
    
    &::placeholder {
      color: var(--gray-400);
      transform: translateX(4px);
    }
  }
`;

const SearchIcon = styled(FiSearch)`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--gray-500);
  font-size: 1.3rem;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
  z-index: 1;
`;

const SearchButton = styled.button`
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: var(--primary-color);
  border: none;
  border-radius: 20px;
  padding: 0.5rem;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  visibility: hidden;
  
  &:hover {
    background: var(--primary-dark);
    transform: translateY(-50%) scale(1.05);
  }
  
  &:active {
    transform: translateY(-50%) scale(0.95);
  }
  
  ${SearchInput}:not(:placeholder-shown) + ${SearchIcon} + & {
    opacity: 1;
    visibility: visible;
  }
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
  margin-left: 1rem;
  
  @media (max-width: 1200px) {
    gap: 0.5rem;
    margin-left: 0.75rem;
  }
  
  @media (max-width: 1024px) {
    gap: 0.375rem;
    margin-left: 0.5rem;
  }
  
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
  
  @media (max-width: 1200px) {
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
  }
  
  @media (max-width: 1024px) {
    padding: 0.5rem 0.625rem;
    font-size: 0.8rem;
  }
`;

const UserMenu = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
  margin-left: 0.5rem;
  
  @media (max-width: 1200px) {
    gap: 0.5rem;
    margin-left: 0.25rem;
  }
  
  @media (max-width: 1024px) {
    gap: 0.375rem;
    margin-left: 0;
  }
`;

const UserButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid var(--gray-300);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  font-weight: 500;
  color: var(--gray-700);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  
  &:hover {
    background: linear-gradient(135deg, var(--gray-50) 0%, #f1f5f9 100%);
    border-color: var(--primary-color);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }
  
  @media (max-width: 1200px) {
    padding: 0.5rem 0.875rem;
    font-size: 0.875rem;
  }
  
  @media (max-width: 1024px) {
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.375rem 0.5rem;
    gap: 0.25rem;
  }
`;

const Dropdown = styled.div`
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: 12px;
  box-shadow: 
    0 10px 25px rgba(0, 0, 0, 0.1),
    0 4px 12px rgba(0, 0, 0, 0.05);
  min-width: 220px;
  z-index: 1001;
  display: ${props => props.isOpen ? 'block' : 'none'};
  backdrop-filter: blur(10px);
  animation: ${props => props.isOpen ? 'slideDown' : 'none'} 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
`;

const DropdownItem = styled(Link)`
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

const MobileMenuButton = styled.button`
  display: none;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid var(--gray-300);
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.75rem;
  border-radius: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: var(--gray-700);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  
  &:hover {
    background: linear-gradient(135deg, var(--gray-50) 0%, #f1f5f9 100%);
    border-color: var(--primary-color);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }
  
  @media (max-width: 768px) {
    display: block;
  }
  
  @media (max-width: 480px) {
    font-size: 1.25rem;
    padding: 0.625rem;
  }
`;

const MobileMenu = styled.div`
  position: fixed;
  top: 80px;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid var(--gray-200);
  box-shadow: 
    0 10px 25px rgba(0, 0, 0, 0.1),
    0 4px 12px rgba(0, 0, 0, 0.05);
  z-index: 999;
  display: ${props => props.isOpen ? 'block' : 'none'};
  max-height: calc(100vh - 80px);
  overflow-y: auto;
  backdrop-filter: blur(10px);
  animation: ${props => props.isOpen ? 'slideDown' : 'none'} 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  @media (max-width: 480px) {
    top: 70px;
    max-height: calc(100vh - 70px);
  }
  
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
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

const MobileSearchContainer = styled.div`
  padding: 1rem;
  border-bottom: 1px solid var(--gray-100);
  
  @media (min-width: 769px) {
    display: none;
  }
`;

const MobileSearchForm = styled.form`
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
`;

const MobileSearchInput = styled.input`
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 3rem;
  border: 2px solid var(--gray-200);
  border-radius: 30px;
  font-size: 0.9rem;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.04),
    0 1px 2px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  
  &::placeholder {
    color: var(--gray-500);
    font-weight: 400;
    transition: all 0.3s ease;
  }
  
  &:hover {
    border-color: var(--gray-300);
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    box-shadow: 
      0 4px 12px rgba(0, 0, 0, 0.08),
      0 2px 4px rgba(0, 0, 0, 0.06),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
    
    &::placeholder {
      color: var(--gray-600);
      transform: translateX(2px);
    }
  }
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    background: white;
    box-shadow: 
      0 0 0 4px rgba(59, 130, 246, 0.12),
      0 8px 25px rgba(0, 0, 0, 0.12),
      0 4px 12px rgba(0, 0, 0, 0.08),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
    transform: translateY(-2px) scale(1.02);
    
    &::placeholder {
      color: var(--gray-400);
      transform: translateX(4px);
    }
  }
`;

const MobileSearchIcon = styled(FiSearch)`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--gray-500);
  font-size: 1.3rem;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
  z-index: 1;
`;

const MobileSearchButton = styled.button`
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: var(--primary-color);
  border: none;
  border-radius: 20px;
  padding: 0.5rem;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  visibility: hidden;
  
  &:hover {
    background: var(--primary-dark);
    transform: translateY(-50%) scale(1.05);
  }
  
  &:active {
    transform: translateY(-50%) scale(0.95);
  }
  
  ${MobileSearchInput}:not(:placeholder-shown) + ${MobileSearchIcon} + & {
    opacity: 1;
    visibility: visible;
  }
`;

const MobileOverlay = styled.div`
  position: fixed;
  top: 80px;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 998;
  display: ${props => props.isOpen ? 'block' : 'none'};
  
  @media (max-width: 480px) {
    top: 70px;
  }
  
  @media (min-width: 769px) {
    display: none;
  }
`;

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
    }
  };

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
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  // Fermer le menu mobile quand on navigue
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [navigate]);

  return (
    <>
      <HeaderContainer>
        <HeaderContent>
          <Logo to="/">
            <FiSearch />
            Lokali
          </Logo>
          
          <SearchContainer>
            <SearchForm onSubmit={handleSearch}>
              <SearchInput
                type="text"
                placeholder="Rechercher un produit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <SearchIcon />
              <SearchButton type="submit" title="Rechercher">
                <FiSearch size={16} />
              </SearchButton>
            </SearchForm>
          </SearchContainer>
          
          <Nav>
              <NavLink to="/suppliers">Fournisseurs</NavLink>
              <NavLink to="/stores">Magasins de stockages</NavLink>
              <NavLink to="/price-map">Cartes</NavLink>
              <NavLink to="/cost-comparator">Calculer les coûts</NavLink>
              <NavLink to="/compare">Comparer prix</NavLink>
              <NavLink to="/submit-price">Contribuer</NavLink>
              {user && user.role === 'admin' && (
                <NavLink to="/admin">Espace Admin</NavLink>
              )}
            {isAuthenticated ? (
              <UserMenu>
                <UserButton onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}>
                  <FiUser />
                  {user?.username}
                </UserButton>
                <Dropdown isOpen={isUserMenuOpen}>
                  <DropdownItem to="/profile">
                    <FiUser />
                    Mon Profil
                  </DropdownItem>
                  <LogoutButton onClick={handleLogout}>
                    <FiLogOut />
                    Déconnexion
                  </LogoutButton>
                </Dropdown>
              </UserMenu>
            ) : (
              <>
                <NavLink to="/login">Login</NavLink>
                <NavLink to="/register">Register</NavLink>
              </>
            )}
          </Nav>
          
          <MobileMenuButton onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <FiX /> : <FiMenu />}
          </MobileMenuButton>
        </HeaderContent>
      </HeaderContainer>
      
      <MobileOverlay 
        isOpen={isMobileMenuOpen} 
        onClick={() => setIsMobileMenuOpen(false)}
      />
      
      <MobileMenu isOpen={isMobileMenuOpen}>
        <MobileSearchContainer>
          <MobileSearchForm onSubmit={handleSearch}>
            <MobileSearchInput
              type="text"
              placeholder="Rechercher un produit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <MobileSearchIcon />
            <MobileSearchButton type="submit" title="Rechercher">
              <FiSearch size={16} />
            </MobileSearchButton>
          </MobileSearchForm>
        </MobileSearchContainer>
        
        <MobileNavLink to="/suppliers">Fournisseurs</MobileNavLink>
        <MobileNavLink to="/stores">Magasins de stockages</MobileNavLink>
        <MobileNavLink to="/price-map">Cartes</MobileNavLink>
        <MobileNavLink to="/cost-comparator">Calculer les coûts</MobileNavLink>
        <MobileNavLink to="/compare">Comparer prix</MobileNavLink>
        <MobileNavLink to="/submit-price">Contribuer</MobileNavLink>
        
        {user && user.role === 'admin' && (
          <MobileNavLink to="/admin">Espace Admin</MobileNavLink>
        )}
        
        {isAuthenticated ? (
          <>
            <MobileNavLink to="/profile">Mon Profil</MobileNavLink>
            <MobileNavLink to="#" onClick={handleLogout}>Déconnexion</MobileNavLink>
          </>
        ) : (
          <>
            <MobileNavLink to="/login">Login</MobileNavLink>
            <MobileNavLink to="/register">Register</MobileNavLink>
          </>
        )}
      </MobileMenu>
    </>
  );
};

export default Header;
