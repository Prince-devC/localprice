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
  
  @media (max-width: 480px) {
    font-size: 1.25rem;
    gap: 0.25rem;
  }
`;

const SearchContainer = styled.div`
  flex: 1;
  max-width: 500px;
  margin: 0 2rem;
  position: relative;
  
  @media (max-width: 1024px) {
    margin: 0 1rem;
    max-width: 400px;
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
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 2px solid var(--gray-200);
  border-radius: 25px;
  font-size: 0.875rem;
  background: var(--gray-50);
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  
  &::placeholder {
    color: var(--gray-400);
    font-weight: 400;
  }
  
  &:hover {
    border-color: var(--gray-300);
    background: white;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    background: white;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1), 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-1px);
  }
`;

const SearchIcon = styled(FiSearch)`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--gray-400);
  font-size: 1.25rem;
  transition: color 0.3s ease;
  pointer-events: none;
  
  ${SearchInput}:focus + & {
    color: var(--primary-color);
  }
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
  gap: 1rem;
  flex-shrink: 0;
  
  @media (max-width: 1024px) {
    gap: 0.5rem;
  }
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLink = styled(Link)`
  color: var(--gray-700);
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius);
  transition: var(--transition);
  white-space: nowrap;
  
  &:hover {
    color: var(--primary-color);
    background-color: var(--gray-100);
  }
  
  @media (max-width: 1024px) {
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
  }
`;

const UserMenu = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
  
  @media (max-width: 1024px) {
    gap: 0.5rem;
  }
`;

const UserButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: none;
  border: 1px solid var(--gray-300);
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: var(--transition);
  white-space: nowrap;
  
  &:hover {
    background-color: var(--gray-100);
  }
  
  @media (max-width: 1024px) {
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.375rem 0.5rem;
    gap: 0.25rem;
  }
`;

const Dropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-lg);
  min-width: 200px;
  z-index: 1001;
  display: ${props => props.isOpen ? 'block' : 'none'};
`;

const DropdownItem = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  color: var(--gray-700);
  text-decoration: none;
  transition: var(--transition);
  
  &:hover {
    background-color: var(--gray-100);
  }
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  color: var(--gray-700);
  text-align: left;
  cursor: pointer;
  transition: var(--transition);
  
  &:hover {
    background-color: var(--gray-100);
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: var(--border-radius);
  transition: var(--transition);
  
  &:hover {
    background-color: var(--gray-100);
  }
  
  @media (max-width: 768px) {
    display: block;
  }
  
  @media (max-width: 480px) {
    font-size: 1.25rem;
    padding: 0.375rem;
  }
`;

const MobileMenu = styled.div`
  position: fixed;
  top: 80px;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid var(--gray-200);
  box-shadow: var(--shadow-lg);
  z-index: 999;
  display: ${props => props.isOpen ? 'block' : 'none'};
  max-height: calc(100vh - 80px);
  overflow-y: auto;
  
  @media (max-width: 480px) {
    top: 70px;
    max-height: calc(100vh - 70px);
  }
`;

const MobileNavLink = styled(Link)`
  display: block;
  padding: 1rem;
  color: var(--gray-700);
  text-decoration: none;
  border-bottom: 1px solid var(--gray-100);
  transition: var(--transition);
  
  &:hover {
    background-color: var(--gray-100);
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
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 2px solid var(--gray-200);
  border-radius: 25px;
  font-size: 0.875rem;
  background: var(--gray-50);
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  
  &::placeholder {
    color: var(--gray-400);
    font-weight: 400;
  }
  
  &:hover {
    border-color: var(--gray-300);
    background: white;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    background: white;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1), 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-1px);
  }
`;

const MobileSearchIcon = styled(FiSearch)`
  position: absolute;
  left: 1.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--gray-400);
  font-size: 1.25rem;
  transition: color 0.3s ease;
  pointer-events: none;
  
  ${MobileSearchInput}:focus + & {
    color: var(--primary-color);
  }
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
            LocalPrice
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
              <NavLink to="/stores">Magasins</NavLink>
              <NavLink to="/compare">Comparer</NavLink>
              <NavLink to="/price-map">Carte des Prix</NavLink>
              <NavLink to="/cost-comparator">Calculer Coûts</NavLink>
              {user && (user.role === 'contributor' || user.role === 'admin') && (
                <NavLink to="/submit-price">Soumettre Prix</NavLink>
              )}
              {user && user.role === 'admin' && (
                <NavLink to="/admin">Administration</NavLink>
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
                <NavLink to="/login">Connexion</NavLink>
                <NavLink to="/register">Inscription</NavLink>
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
        
        <MobileNavLink to="/stores">Magasins</MobileNavLink>
        <MobileNavLink to="/compare">Comparer</MobileNavLink>
        <MobileNavLink to="/price-map">Carte des Prix</MobileNavLink>
        <MobileNavLink to="/cost-comparator">Calculer Coûts</MobileNavLink>
        
        {user && (user.role === 'contributor' || user.role === 'admin') && (
          <MobileNavLink to="/submit-price">Soumettre Prix</MobileNavLink>
        )}
        {user && user.role === 'admin' && (
          <MobileNavLink to="/admin">Administration</MobileNavLink>
        )}
        
        {isAuthenticated ? (
          <>
            <MobileNavLink to="/profile">Mon Profil</MobileNavLink>
            <MobileNavLink to="#" onClick={handleLogout}>Déconnexion</MobileNavLink>
          </>
        ) : (
          <>
            <MobileNavLink to="/login">Connexion</MobileNavLink>
            <MobileNavLink to="/register">Inscription</MobileNavLink>
          </>
        )}
      </MobileMenu>
    </>
  );
};

export default Header;
