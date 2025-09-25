import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { adminService, agriculturalPriceService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import styled from 'styled-components';
import { FiUsers, FiDollarSign, FiPackage, FiMapPin, FiCheck, FiX, FiEye } from 'react-icons/fi';

const DashboardContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h1`
  color: #2c3e50;
  margin-bottom: 2rem;
  text-align: center;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const StatIcon = styled.div`
  font-size: 2rem;
  color: #3498db;
  margin-bottom: 1rem;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: #7f8c8d;
  font-size: 0.9rem;
`;

const Section = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  color: #2c3e50;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
`;

const TableHeader = styled.th`
  background: #f8f9fa;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #2c3e50;
  border-bottom: 2px solid #e9ecef;
`;

const TableCell = styled.td`
  padding: 1rem;
  border-bottom: 1px solid #e9ecef;
  vertical-align: top;
`;

const TableRow = styled.tr`
  &:hover {
    background: #f8f9fa;
  }
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  margin-right: 0.5rem;
  transition: all 0.2s ease;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ValidateButton = styled(Button)`
  background: #27ae60;
  color: white;

  &:hover:not(:disabled) {
    background: #229954;
  }
`;

const RejectButton = styled(Button)`
  background: #e74c3c;
  color: white;

  &:hover:not(:disabled) {
    background: #c0392b;
  }
`;

const ViewButton = styled(Button)`
  background: #3498db;
  color: white;

  &:hover:not(:disabled) {
    background: #2980b9;
  }
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
`;

const PendingBadge = styled(StatusBadge)`
  background: #fff3cd;
  color: #856404;
`;

const ValidatedBadge = styled(StatusBadge)`
  background: #d4edda;
  color: #155724;
`;

const RejectedBadge = styled(StatusBadge)`
  background: #f8d7da;
  color: #721c24;
`;

const ErrorMessage = styled.div`
  background: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  margin: 1rem 0;
  border: 1px solid #f5c6cb;
`;

const AccessDenied = styled.div`
  background: #f8d7da;
  color: #721c24;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  margin: 2rem auto;
  max-width: 500px;
`;

const AdminDashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Récupérer les données du tableau de bord
  const { data: dashboardData, isLoading: loadingDashboard } = useQuery(
    'admin-dashboard',
    adminService.getDashboard,
    {
      select: (response) => response.data.data,
      enabled: !!(user && user.role === 'admin')
    }
  );

  // Récupérer les prix en attente
  const { data: pendingPrices, isLoading: loadingPending } = useQuery(
    'pending-prices',
    () => adminService.getPendingPrices({ limit: 20 }),
    {
      select: (response) => response.data.data,
      enabled: !!(user && user.role === 'admin')
    }
  );

  // Mutation pour valider un prix
  const validatePriceMutation = useMutation(
    ({ priceId, comment }) => adminService.validatePrice(priceId, { comment }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('pending-prices');
        queryClient.invalidateQueries('admin-dashboard');
        setSelectedPrice(null);
      }
    }
  );

  // Mutation pour rejeter un prix
  const rejectPriceMutation = useMutation(
    ({ priceId, rejectionReason }) => adminService.rejectPrice(priceId, { rejectionReason }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('pending-prices');
        queryClient.invalidateQueries('admin-dashboard');
        setSelectedPrice(null);
        setRejectionReason('');
      }
    }
  );

  // Vérifier les permissions
  if (!user || user.role !== 'admin') {
    return (
      <AccessDenied>
        <h2>Accès refusé</h2>
        <p>Seuls les administrateurs peuvent accéder à cette page.</p>
      </AccessDenied>
    );
  }

  const handleValidate = (priceId) => {
    const comment = prompt('Commentaire de validation (optionnel):');
    validatePriceMutation.mutate({ priceId, comment });
  };

  const handleReject = (priceId) => {
    const reason = prompt('Raison du rejet:');
    if (reason) {
      rejectPriceMutation.mutate({ priceId, rejectionReason: reason });
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <PendingBadge>En attente</PendingBadge>;
      case 'validated':
        return <ValidatedBadge>Validé</ValidatedBadge>;
      case 'rejected':
        return <RejectedBadge>Rejeté</RejectedBadge>;
      default:
        return <StatusBadge>{status}</StatusBadge>;
    }
  };

  if (loadingDashboard) {
    return <LoadingSpinner />;
  }

  return (
    <DashboardContainer>
      <Title>Tableau de Bord Administrateur</Title>

      {/* Statistiques générales */}
      <StatsGrid>
        <StatCard>
          <StatIcon>
            <FiDollarSign />
          </StatIcon>
          <StatValue>{dashboardData?.priceStats?.total_prices || 0}</StatValue>
          <StatLabel>Total des prix</StatLabel>
        </StatCard>

        <StatCard>
          <StatIcon>
            <FiPackage />
          </StatIcon>
          <StatValue>{dashboardData?.priceStats?.pending_prices || 0}</StatValue>
          <StatLabel>En attente de validation</StatLabel>
        </StatCard>

        <StatCard>
          <StatIcon>
            <FiUsers />
          </StatIcon>
          <StatValue>{dashboardData?.userStats?.total_users || 0}</StatValue>
          <StatLabel>Utilisateurs</StatLabel>
        </StatCard>

        <StatCard>
          <StatIcon>
            <FiMapPin />
          </StatIcon>
          <StatValue>{dashboardData?.localityStats?.total_localities || 0}</StatValue>
          <StatLabel>Localités</StatLabel>
        </StatCard>
      </StatsGrid>

      {/* Prix en attente de validation */}
      <Section>
        <SectionTitle>
          <FiEye />
          Prix en attente de validation
        </SectionTitle>

        {loadingPending ? (
          <LoadingSpinner />
        ) : pendingPrices?.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#7f8c8d', padding: '2rem' }}>
            Aucun prix en attente de validation
          </p>
        ) : (
          <Table>
            <thead>
              <tr>
                <TableHeader>Produit</TableHeader>
                <TableHeader>Localité</TableHeader>
                <TableHeader>Prix</TableHeader>
                <TableHeader>Date</TableHeader>
                <TableHeader>Statut</TableHeader>
                <TableHeader>Actions</TableHeader>
              </tr>
            </thead>
            <tbody>
              {pendingPrices?.map((price) => (
                <TableRow key={price.id}>
                  <TableCell>
                    <strong>{price.product_name}</strong>
                    <br />
                    <small style={{ color: '#7f8c8d' }}>
                      {price.category_name}
                    </small>
                  </TableCell>
                  <TableCell>
                    {price.locality_name}
                    <br />
                    <small style={{ color: '#7f8c8d' }}>
                      {price.region_name}
                    </small>
                  </TableCell>
                  <TableCell>
                    <strong>{price.price} {price.unit_symbol}</strong>
                  </TableCell>
                  <TableCell>
                    {new Date(price.date).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(price.status)}
                  </TableCell>
                  <TableCell>
                    <ValidateButton
                      onClick={() => handleValidate(price.id)}
                      disabled={validatePriceMutation.isLoading}
                    >
                      <FiCheck /> Valider
                    </ValidateButton>
                    <RejectButton
                      onClick={() => handleReject(price.id)}
                      disabled={rejectPriceMutation.isLoading}
                    >
                      <FiX /> Rejeter
                    </RejectButton>
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        )}
      </Section>

      {/* Prix récents */}
      <Section>
        <SectionTitle>
          <FiDollarSign />
          Prix récents
        </SectionTitle>

        {dashboardData?.recentPrices?.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#7f8c8d', padding: '2rem' }}>
            Aucun prix récent
          </p>
        ) : (
          <Table>
            <thead>
              <tr>
                <TableHeader>Produit</TableHeader>
                <TableHeader>Localité</TableHeader>
                <TableHeader>Prix</TableHeader>
                <TableHeader>Statut</TableHeader>
                <TableHeader>Date</TableHeader>
              </tr>
            </thead>
            <tbody>
              {dashboardData?.recentPrices?.map((price) => (
                <TableRow key={price.id}>
                  <TableCell>
                    <strong>{price.product_name}</strong>
                  </TableCell>
                  <TableCell>{price.locality_name}</TableCell>
                  <TableCell>
                    <strong>{price.price}</strong>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(price.status)}
                  </TableCell>
                  <TableCell>
                    {new Date(price.created_at).toLocaleDateString('fr-FR')}
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        )}
      </Section>
    </DashboardContainer>
  );
};

export default AdminDashboard;
