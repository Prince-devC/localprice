import React, { useState } from 'react';
import { useQuery } from 'react-query';
import styled from 'styled-components';
import { FiSearch, FiUsers } from 'react-icons/fi';
import { supplierService } from '../services/api';
import SupplierCard from '../components/SupplierCard';
import LoadingSpinner from '../components/LoadingSpinner';

const PageContainer = styled.div`
  padding: 2rem 0;
`;

const SearchHeader = styled.div`
  background: white;
  padding: 2rem;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow);
  margin-bottom: 2rem;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: bold;
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

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const Empty = styled.div`
  text-align: center;
  padding: 3rem;
  color: var(--gray-500);
`;

const SuppliersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: suppliers, isLoading, error } = useQuery(
    'suppliers-list',
    () => supplierService.getAll(),
    {
      select: (res) => Array.isArray(res.data?.data) ? res.data.data : (res.data || []),
    }
  );

  const filtered = (suppliers || []).filter((s) => {
    const term = searchTerm.toLowerCase();
    return (
      (s.name || '').toLowerCase().includes(term) ||
      (s.city || '').toLowerCase().includes(term) ||
      (s.address || '').toLowerCase().includes(term)
    );
  });

  const handleSearch = (e) => {
    e.preventDefault();
  };

  if (isLoading) return <LoadingSpinner text="Chargement des fournisseurs..." />;

  if (error) {
    return (
      <PageContainer>
        <div className="container">
          <Empty>
            <h3>Erreur lors du chargement</h3>
            <p>Impossible de charger la liste des fournisseurs.</p>
          </Empty>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="container">
        <SearchHeader>
          <TitleRow>
            <FiUsers style={{ color: 'var(--primary-color)' }} />
            <PageTitle>Fournisseurs</PageTitle>
          </TitleRow>
          <SearchForm onSubmit={handleSearch}>
            <SearchInput
              type="text"
              placeholder="Rechercher un fournisseur, une ville..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <SearchButton type="submit">
              <FiSearch />
              Rechercher
            </SearchButton>
          </SearchForm>
        </SearchHeader>

        {filtered.length > 0 ? (
          <Grid>
            {filtered.map((s) => (
              <SupplierCard key={s.id} supplier={s} />
            ))}
          </Grid>
        ) : (
          <Empty>
            <h3>Aucun fournisseur trouvé</h3>
            <p>Essayez de modifier vos critères de recherche.</p>
          </Empty>
        )}
      </div>
    </PageContainer>
  );
};

export default SuppliersPage;