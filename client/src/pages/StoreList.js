import React, { useState } from 'react';
import { useQuery } from 'react-query';
import styled from 'styled-components';
import { FiSearch, FiMapPin, FiFilter } from 'react-icons/fi';
import { storeService } from '../services/api';
import StoreCard from '../components/StoreCard';
import LoadingSpinner from '../components/LoadingSpinner';

const StoreListContainer = styled.div`
  padding: 2rem 0;
`;

const SearchHeader = styled.div`
  background: white;
  padding: 2rem;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow);
  margin-bottom: 2rem;
`;

const SearchTitle = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: var(--gray-800);
`;

const SearchForm = styled.form`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px solid var(--gray-200);
  border-radius: var(--border-radius);
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const SearchButton = styled.button`
  padding: 0.75rem 2rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  
  &:hover {
    background: var(--primary-dark);
  }
`;

const StoresGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const NoResults = styled.div`
  text-align: center;
  padding: 3rem;
  color: var(--gray-500);
`;

const StoreList = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: stores, isLoading, error } = useQuery(
    'stores',
    () => storeService.getAll(),
    {
      select: (response) => response.data.data,
    }
  );

  const filteredStores = stores?.filter(store => 
    store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.address.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleSearch = (e) => {
    e.preventDefault();
  };

  if (isLoading) {
    return <LoadingSpinner text="Chargement des magasins..." />;
  }

  if (error) {
    return (
      <StoreListContainer>
        <div className="container">
          <NoResults>
            <h3>Erreur lors du chargement</h3>
            <p>Impossible de charger la liste des magasins.</p>
          </NoResults>
        </div>
      </StoreListContainer>
    );
  }

  return (
    <StoreListContainer>
      <div className="container">
        <SearchHeader>
          <SearchTitle>Nos magasins partenaires</SearchTitle>
          <SearchForm onSubmit={handleSearch}>
            <SearchInput
              type="text"
              placeholder="Rechercher un magasin, une ville..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <SearchButton type="submit">
              <FiSearch />
              Rechercher
            </SearchButton>
          </SearchForm>
        </SearchHeader>

        {filteredStores.length > 0 ? (
          <StoresGrid>
            {filteredStores.map((store) => (
              <StoreCard key={store.id} store={store} />
            ))}
          </StoresGrid>
        ) : (
          <NoResults>
            <FiMapPin style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--gray-300)' }} />
            <h3>Aucun magasin trouvé</h3>
            <p>Essayez de modifier vos critères de recherche.</p>
          </NoResults>
        )}
      </div>
    </StoreListContainer>
  );
};

export default StoreList;
