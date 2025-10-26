import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { adminService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import styled from 'styled-components';
import { FiUsers, FiDollarSign, FiPackage, FiMapPin, FiCheck, FiX, FiEye, FiHome, FiClipboard, FiUser, FiPlusCircle, FiMinusCircle, FiInfo, FiTrash, FiUserX, FiCheckSquare, FiSquare } from 'react-icons/fi';

const DashboardContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem 2rem;
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 1.5rem;
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    padding: 1rem;
  }
`;

const Sidebar = styled.aside`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  border: 1px solid var(--gray-100);
  padding: 1rem;
  height: fit-content;
`;

const SidebarHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--gray-100);
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const UserName = styled.div`
  font-weight: 600;
  color: var(--gray-800);
`;

const RoleBadge = styled.span`
  font-size: 0.75rem;
  color: ${props => props.$isAdmin ? '#155724' : '#1f2937'};
  background: ${props => props.$isAdmin ? '#d4edda' : '#e5e7eb'};
  border: 1px solid ${props => props.$isAdmin ? '#c3e6cb' : '#d1d5db'};
  padding: 0.125rem 0.5rem;
  border-radius: 999px;
  display: inline-block;
  width: fit-content;
  margin-top: 4px;
`;

const NavList = styled.nav`
  display: flex;
  flex-direction: column;
  padding: 0.5rem;
`;

const NavItem = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 0.875rem;
  border-radius: 8px;
  text-decoration: none;
  color: var(--gray-700);
  transition: all 0.2s ease;
  &:hover {
    background: var(--gray-50);
    color: var(--primary-color);
    transform: translateX(4px);
  }
`;

const NavAnchor = styled.a`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 0.875rem;
  border-radius: 8px;
  text-decoration: none;
  color: ${props => (props.$active ? 'var(--primary-color)' : 'var(--gray-700)')};
  background: ${props => (props.$active ? '#eef2ff' : 'transparent')};
  box-shadow: ${props => (props.$active ? 'inset 3px 0 0 #3b82f6' : 'none')};
  font-weight: ${props => (props.$active ? 600 : 400)};
  transition: all 0.2s ease;
  &:hover {
    background: var(--gray-50);
    color: var(--primary-color);
    transform: translateX(4px);
  }
`;

const Content = styled.section`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  border: 1px solid var(--gray-100);
  padding: 1.5rem;
`;

const Title = styled.h1`
  color: #2c3e50;
  margin-bottom: 0.75rem;
  text-align: left;
  font-size: 1.5rem;
  font-weight: 700;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const StatCard = styled.div`
  background: #ffffff;
  border-radius: 10px;
  padding: 1rem;
  border: 1px solid var(--gray-100);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
  text-align: left;
`;

const StatIcon = styled.div`
  font-size: 1.25rem;
  color: #2563eb;
  margin-bottom: 0.5rem;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  color: #6b7280;
  font-size: 0.85rem;
`;

const Section = styled.div`
  background: #ffffff;
  border-radius: 10px;
  padding: 1rem;
  border: 1px solid var(--gray-100);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h2`
  color: #1f2937;
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
  border-radius: 10px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 0.9rem;
`;

const TableHeader = styled.th`
  position: sticky;
  top: 0;
  background: #f9fafb;
  padding: 0.75rem 0.875rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
`;

const TableCell = styled.td`
  padding: 0.75rem 0.875rem;
  border-bottom: 1px solid #e5e7eb;
  vertical-align: top;
  color: #374151;
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background: #fcfdff;
  }
  &:hover {
    background: #f5f7fb;
  }
`;

const Button = styled.button`
  padding: 0.4rem 0.8rem;
  border: none;
  border-radius: 8px;
  font-size: 0.85rem;
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
  background: #10b981;
  color: white;

  &:hover:not(:disabled) {
    background: #0ea5e9;
  }
`;

const RejectButton = styled(Button)`
  background: #ef4444;
  color: white;

  &:hover:not(:disabled) {
    background: #dc2626;
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
  const { user, hasRole } = useAuth();
  const queryClient = useQueryClient();

  const isAdmin = hasRole('admin') || hasRole('super_admin');
  const isSuperAdmin = hasRole('super_admin');
  // Menu latéral: élément actif
  const [activeMenu, setActiveMenu] = React.useState('stats');
  React.useEffect(() => {
    const fromHash = (window.location.hash || '').replace('#', '');
    if (fromHash) setActiveMenu(fromHash);
  }, []);
  const handleMenuClick = (key) => (e) => {
    e.preventDefault();
    setActiveMenu(key);
    window.location.hash = key;
  };

  // Récupérer les données du tableau de bord
  const { data: dashboardData, isLoading: loadingDashboard } = useQuery(
    'admin-dashboard',
    adminService.getDashboard,
    {
      select: (response) => response.data.data,
      enabled: !!isAdmin
    }
  );

  // Récupérer les prix en attente
  const { data: pendingPrices, isLoading: loadingPending } = useQuery(
    'pending-prices',
    () => adminService.getPendingPrices({ limit: 20 }),
    {
      select: (response) => response.data.data,
      enabled: !!isAdmin
    }
  );

  // Lecture des offres (lecture seule pour admins et super-admins)
  const { data: offers, isLoading: loadingOffers } = useQuery(
    'admin-offers',
    () => adminService.getOffers({ limit: 50 }),
    {
      select: (response) => response.data.data,
      enabled: !!isAdmin
    }
  );

  // Mutation pour valider un prix
  const validatePriceMutation = useMutation(
    ({ priceId, comment }) => adminService.validatePrice(priceId, { comment }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('pending-prices');
        queryClient.invalidateQueries('admin-dashboard');
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
      }
    }
  );

  // Demandes de contribution (en attente)
  const { data: contributionRequests, isLoading: loadingContribs } = useQuery(
    'admin-contributions',
    () => adminService.getContributionRequests({ status: 'pending', limit: 50 }),
    {
      select: (response) => response.data.data,
      enabled: !!isAdmin
    }
  );

  // Liste des utilisateurs (lecture)
  const { data: users, isLoading: loadingUsers } = useQuery(
    'admin-users',
    () => adminService.getUsers({ limit: 50 }),
    {
      select: (response) => response.data.data,
      enabled: !!isAdmin
    }
  );

  // Gestion des rôles (super-admin)
  const [roleSelection, setRoleSelection] = React.useState({});
  const availableRoles = ['contributor', 'admin'];
  const loadingRoles = false;

  const addRoleMutation = useMutation(
    ({ userId, role }) => adminService.addUserRole(userId, role),
    { onSuccess: () => queryClient.invalidateQueries('admin-users') }
  );

  const removeRoleMutation = useMutation(
    ({ userId, role }) => adminService.removeUserRole(userId, role),
    { onSuccess: () => queryClient.invalidateQueries('admin-users') }
  );

  // Sélection multiple
  const [selectedIds, setSelectedIds] = React.useState([]);
  const toggleSelect = (id) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  const clearSelection = () => setSelectedIds([]);
  const toggleSelectAll = (visibleUsers) => {
    const ids = visibleUsers.map(u => u.id).filter(Boolean);
    setSelectedIds((prev) => prev.length === ids.length ? [] : ids);
  };

  // Mutations ban/débannir/suppression
  const banUsersMutation = useMutation(
    ({ ids, ban }) => adminService.banUsers(ids, ban),
    { onSuccess: () => { queryClient.invalidateQueries('admin-users'); clearSelection(); } }
  );
  const deleteUsersMutation = useMutation(
    (ids) => adminService.deleteUsers(ids),
    { onSuccess: () => { queryClient.invalidateQueries('admin-users'); clearSelection(); } }
  );

  // Gestion actions sur sélection
  const handleBulkBan = (ban) => {
    if (selectedIds.length > 0) banUsersMutation.mutate({ ids: selectedIds, ban });
  };
  const handleBulkDelete = () => {
    if (selectedIds.length > 0 && window.confirm('Supprimer (soft) les utilisateurs sélectionnés ?')) {
      deleteUsersMutation.mutate(selectedIds);
    }
  };
  const handleAddRole = (userId) => {
    const role = roleSelection[userId];
    if (role) addRoleMutation.mutate({ userId, role });
  };

  // Mutations approbation/rejet des demandes de contribution
  const approveContributionMutation = useMutation(
    (id) => adminService.approveContributionRequest(id),
    {
      onSuccess: () => queryClient.invalidateQueries('admin-contributions')
    }
  );

  const rejectContributionMutation = useMutation(
    ({ id, rejection_reason }) => adminService.rejectContributionRequest(id, { rejection_reason }),
    {
      onSuccess: () => queryClient.invalidateQueries('admin-contributions')
    }
  );

  const handleApproveRequest = (id) => {
    if (window.confirm('Confirmer l\u2019approbation de cette demande ?')) {
      approveContributionMutation.mutate(id);
    }
  };

  const handleRejectRequest = (id) => {
    const ok = window.confirm('Confirmer le rejet de cette demande ?');
    if (!ok) return;
    const reason = prompt('Raison du rejet:');
    if (reason) {
      rejectContributionMutation.mutate({ id, rejection_reason: reason });
    }
  };

  // Vérifier les permissions
  if (!user) {
    return (
      <AccessDenied>
        <h2>Connexion requise</h2>
        <p>Veuillez vous connecter pour accéder à cette page.</p>
      </AccessDenied>
    );
  }

  if (!isAdmin) {
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
      <Sidebar>
        <SidebarHeader>
          <Avatar>{((user?.user_metadata?.username || user?.email || 'U')[0] || 'U').toUpperCase()}</Avatar>
          <UserInfo>
            <UserName>{user?.user_metadata?.username || user?.email}</UserName>
            <RoleBadge $isAdmin={isAdmin}>{isSuperAdmin ? 'Super Admin' : 'Admin'}</RoleBadge>
          </UserInfo>
        </SidebarHeader>
        <NavList>
          <NavAnchor href="#stats" onClick={handleMenuClick('stats')} $active={activeMenu === 'stats'}><FiHome /> Aperçu</NavAnchor>
          <NavAnchor href="#users" onClick={handleMenuClick('users')} $active={activeMenu === 'users'}><FiUsers /> Utilisateurs</NavAnchor>
          {isSuperAdmin && (
            <NavAnchor href="#offers" onClick={handleMenuClick('offers')} $active={activeMenu === 'offers'}><FiPackage /> Offres</NavAnchor>
          )}
          <NavAnchor href="#pending" onClick={handleMenuClick('pending')} $active={activeMenu === 'pending'}><FiClipboard /> Prix en attente</NavAnchor>
          <NavAnchor href="#requests" onClick={handleMenuClick('requests')} $active={activeMenu === 'requests'}><FiUsers /> Demandes de contributeur</NavAnchor>
          <NavAnchor href="#recent" onClick={handleMenuClick('recent')} $active={activeMenu === 'recent'}><FiDollarSign /> Prix récents</NavAnchor>
          <NavItem to="/dashboard"><FiUser /> Espace personnel</NavItem>
          <NavItem to="/"><FiHome /> Accueil</NavItem>
        </NavList>
      </Sidebar>
      <Content>
        <Title>Tableau de Bord Administrateur</Title>
        {isSuperAdmin && (
          <div style={{ color: '#7f8c8d', textAlign: 'left', marginBottom: '1rem' }}>
            Accès Super Administrateur
          </div>
        )}

      {/* Statistiques générales */}
      {activeMenu === 'stats' && (
      <div id="stats">
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
        </div>
        )}

      {/* Prix en attente de validation */}
      {activeMenu === 'pending' && (
      <Section id="pending">
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
          <TableWrapper>
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
                      <small style={{ color: '#6b7280' }}>
                        {price.category_name}
                      </small>
                    </TableCell>
                    <TableCell>
                      {price.locality_name}
                      <br />
                      <small style={{ color: '#6b7280' }}>
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
          </TableWrapper>
        )}
      </Section>
      )}

      {/* Demandes de contribution */}
      {activeMenu === 'requests' && (
      <Section id="requests">
        <SectionTitle>
          <FiUsers />
          Demandes de contribution (en attente)
        </SectionTitle>

        {loadingContribs ? (
          <LoadingSpinner />
        ) : contributionRequests?.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#7f8c8d', padding: '2rem' }}>
            Aucune demande en attente
          </p>
        ) : (
          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <TableHeader>Utilisateur</TableHeader>
                  <TableHeader>Commune / Activité</TableHeader>
                  <TableHeader>Coopérative / Tech</TableHeader>
                  <TableHeader>Date</TableHeader>
                  <TableHeader>Actions</TableHeader>
                </tr>
              </thead>
              <tbody>
                {contributionRequests?.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell>
                      <strong>{req.display_name || req.username || req.email || 'Utilisateur introuvable'}</strong>
                      <br />
                      {(req.email || req.user_id) && (
                        <small style={{ color: '#6b7280' }}>{req.email ? req.email : `ID: ${req.user_id}`}</small>
                      )}
                    </TableCell>
                    <TableCell>
                      {req.commune || '-'}
                      <br />
                      <small style={{ color: '#6b7280' }}>{req.activity || '-'}</small>
                    </TableCell>
                    <TableCell>
                      {req.cooperative_member ? `Membre: ${req.cooperative_name || '-'}` : 'Non membre'}
                      <br />
                      <small style={{ color: '#6b7280' }}>
                        {req.has_smartphone ? 'Smartphone' : 'Pas de smartphone'} • {req.has_internet ? 'Internet' : "Pas d'internet"}
                      </small>
                    </TableCell>
                    <TableCell>
                      {new Date(req.created_at).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell>
                      <ValidateButton onClick={() => handleApproveRequest(req.id)} disabled={approveContributionMutation.isLoading} aria-label="Approuver" title="Approuver">
                        <FiCheck />
                      </ValidateButton>
                      <RejectButton onClick={() => handleRejectRequest(req.id)} disabled={rejectContributionMutation.isLoading} aria-label="Rejeter" title="Rejeter">
                        <FiX />
                      </RejectButton>
                    </TableCell>
                  </TableRow>
                ))}
              </tbody>
            </Table>
          </TableWrapper>
        )}
      </Section>
      )}

      {/* Prix récents */}
      {activeMenu === 'recent' && (
      <Section id="recent">
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
      )}
      {/* Offres (lecture seule) */}
      {isSuperAdmin && activeMenu === 'offers' && (
      <Section id="offers">
         <SectionTitle>
           <FiPackage />
           Offres (lecture seule)
         </SectionTitle>
      
         {loadingOffers ? (
           <LoadingSpinner />
         ) : !offers || offers.length === 0 ? (
           <p style={{ textAlign: 'center', color: '#7f8c8d', padding: '2rem' }}>
             Aucune offre disponible
           </p>
         ) : (
           <TableWrapper>
             <Table>
               <thead>
                 <tr>
                   <TableHeader>Nom</TableHeader>
                   <TableHeader>Description</TableHeader>
                   <TableHeader>Prix</TableHeader>
                   <TableHeader>Devise</TableHeader>
                   <TableHeader>Période</TableHeader>
                   <TableHeader>Actif</TableHeader>
                 </tr>
               </thead>
               <tbody>
                 {offers.map((offer) => (
                   <TableRow key={offer.id}>
                     <TableCell>
                       <strong>{offer.name}</strong>
                     </TableCell>
                     <TableCell style={{ maxWidth: '420px' }}>
                       <span style={{ color: '#6b7280' }}>{offer.description || '-'}</span>
                     </TableCell>
                     <TableCell>
                       <strong>{offer.price}</strong>
                     </TableCell>
                     <TableCell>{offer.currency || '-'}</TableCell>
                     <TableCell>{offer.period || '-'}</TableCell>
                     <TableCell>{offer.is_active ? 'Oui' : 'Non'}</TableCell>
                   </TableRow>
                 ))}
               </tbody>
             </Table>
           </TableWrapper>
         )}
      </Section>
      )}
      {/* Utilisateurs (lecture) */}
      {activeMenu === 'users' && (
      <Section id="users">
        <SectionTitle>
          <FiUsers />
          Utilisateurs
        </SectionTitle>

        {loadingUsers ? (
          <LoadingSpinner />
        ) : !users || users.filter(u => !((u.roles || []).includes('super_admin'))).length === 0 ? (
          <p style={{ textAlign: 'center', color: '#7f8c8d', padding: '2rem' }}>
            Aucun utilisateur trouvé
          </p>
        ) : (
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.75rem', flexWrap:'wrap' }}>
            <button
              onClick={() => toggleSelectAll(users.filter(u => !((u.roles || []).includes('super_admin'))))}
              style={{ padding:'0.4rem 0.8rem', border:'1px solid #e5e7eb', borderRadius:'8px', background:'#fff', color:'#111827' }}
              title="Sélectionner/Désélectionner tout"
              aria-label="Sélectionner/Désélectionner tout"
            >
              {selectedIds.length === (users?.filter(u => !((u.roles || []).includes('super_admin')))?.length || 0) ? <FiCheckSquare /> : <FiSquare />}
            </button>
            <button
              onClick={() => handleBulkBan(true)}
              disabled={selectedIds.length === 0 || banUsersMutation.isLoading}
              style={{ padding:'0.4rem 0.8rem', border:'none', borderRadius:'8px', background:'#f59e0b', color:'#fff' }}
              title="Bannir la sélection"
              aria-label="Bannir la sélection"
            >
              <FiUserX />
            </button>
            <button
              onClick={() => handleBulkBan(false)}
              disabled={selectedIds.length === 0 || banUsersMutation.isLoading}
              style={{ padding:'0.4rem 0.8rem', border:'none', borderRadius:'8px', background:'#10b981', color:'#fff' }}
              title="Débannir la sélection"
              aria-label="Débannir la sélection"
            >
              <FiCheck />
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={selectedIds.length === 0 || deleteUsersMutation.isLoading}
              style={{ padding:'0.4rem 0.8rem', border:'none', borderRadius:'8px', background:'#ef4444', color:'#fff' }}
              title="Supprimer (soft) la sélection"
              aria-label="Supprimer (soft) la sélection"
            >
              <FiTrash />
            </button>
            <span style={{ marginLeft:'auto', color:'#6b7280' }}>
              {selectedIds.length} sélectionné(s)
            </span>
          </div>
          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <TableHeader>Sélection</TableHeader>
                  <TableHeader>Nom affiché</TableHeader>
                  <TableHeader>Email</TableHeader>
                  <TableHeader>Pseudo</TableHeader>
                  <TableHeader>Rôles</TableHeader>
                  {isSuperAdmin ? (
                    <>
                      <TableHeader>Gestion des rôles</TableHeader>
                      <TableHeader>Modération</TableHeader>
                    </>
                  ) : (
                    <TableHeader>Actions</TableHeader>
                  )}
                </tr>
              </thead>
              <tbody>
                {users.filter(u => !((u.roles || []).includes('super_admin'))).map((u) => {
                  const displayName = u.display_name
                    || ((u.first_name || u.last_name) ? `${u.first_name || ''} ${u.last_name || ''}`.trim() : null)
                    || u.username
                    || (u.email ? u.email.split('@')[0] : '-');
                  return (
                  <TableRow key={u.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(u.id)}
                        onChange={() => toggleSelect(u.id)}
                        aria-label={`Sélectionner ${displayName}`}
                      />
                    </TableCell>
                    <TableCell>
                      <strong>{displayName}</strong>
                      {u.is_banned ? (
                        <span style={{ marginLeft:'0.5rem', background:'#fee2e2', color:'#b91c1c', padding:'0.125rem 0.375rem', borderRadius:'4px', fontSize:'0.75rem' }}>Banni</span>
                      ) : null}
                    </TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <span style={{ color: '#374151' }}>{u.username || '-'}</span>
                    </TableCell>
                    <TableCell>{(u.roles || []).join(', ') || '-'}</TableCell>
                    {isSuperAdmin ? (
                      <>
                        <TableCell>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                            <select
                              value={roleSelection[u.id] || ''}
                              onChange={(e) => setRoleSelection((prev) => ({ ...prev, [u.id]: e.target.value }))}
                              disabled={availableRoles.length === 0}
                              style={{ padding: '0.25rem 0.5rem' }}
                            >
                              <option value="">Choisir rôle</option>
                              {availableRoles.filter((r) => !(u.roles || []).includes(r)).map((r) => (
                                <option key={r} value={r}>{r}</option>
                              ))}
                            </select>
                            <button
                              onClick={() => handleAddRole(u.id)}
                              disabled={!roleSelection[u.id] || addRoleMutation.isLoading}
                              style={{ padding: '0.25rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', display: 'flex', alignItems: 'center' }}
                              title="Ajouter le rôle sélectionné"
                              aria-label="Ajouter le rôle"
                            >
                              <FiPlusCircle />
                            </button>
                          </div>
                          <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {(u.roles || [])
                              .filter((role) => role !== 'user')
                              .map((role) => (
                                <button
                                  key={role}
                                  onClick={() => removeRoleMutation.mutate({ userId: u.id, role })}
                                  disabled={removeRoleMutation.isLoading || (role === 'super_admin' && u.id === user?.id)}
                                  style={{ padding: '0.25rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', display: 'flex', alignItems: 'center' }}
                                  title={role === 'super_admin' && u.id === user?.id ? 'Impossible de retirer votre propre rôle super_admin' : `Retirer le rôle ${role}`}
                                  aria-label={`Retirer le rôle ${role}`}
                                >
                                  <FiMinusCircle />
                                </button>
                              ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                            <button
                              style={{ padding: '0.25rem', background: '#e5e7eb', color: '#111827', border: 'none', borderRadius: '6px', display: 'flex', alignItems: 'center' }}
                              title={`ID: ${u.id}\nCréé: ${u.created_at ? new Date(u.created_at).toLocaleString('fr-FR') : '-'}`}
                              aria-label="Infos utilisateur"
                            >
                              <FiInfo />
                            </button>
                            <button
                              onClick={() => banUsersMutation.mutate({ ids: [u.id], ban: !u.is_banned })}
                              disabled={banUsersMutation.isLoading}
                              style={{ padding: '0.25rem', background: u.is_banned ? '#10b981' : '#f59e0b', color: 'white', border: 'none', borderRadius: '6px', display: 'flex', alignItems: 'center' }}
                              title={u.is_banned ? 'Débannir cet utilisateur' : 'Bannir cet utilisateur'}
                              aria-label={u.is_banned ? 'Débannir' : 'Bannir'}
                            >
                              {u.is_banned ? <FiCheck /> : <FiUserX />}
                            </button>
                            <button
                              onClick={() => window.confirm('Supprimer (soft) cet utilisateur ?') && deleteUsersMutation.mutate([u.id])}
                              disabled={deleteUsersMutation.isLoading}
                              style={{ padding: '0.25rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', display: 'flex', alignItems: 'center' }}
                              title="Supprimer (soft) cet utilisateur"
                              aria-label="Supprimer"
                            >
                              <FiTrash />
                            </button>
                          </div>
                        </TableCell>
                      </>
                    ) : (
                      <TableCell>
                        <span style={{ color: '#6b7280' }}>Actions réservées aux super-admins</span>
                      </TableCell>
                    )}
                  </TableRow>
                  );
                })}
              </tbody>
            </Table>
          </TableWrapper>
          </div>
        )}
      </Section>
      )}
    </Content>
  </DashboardContainer>
  );
};

export default AdminDashboard;
