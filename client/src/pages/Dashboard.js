import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { FiUser, FiSettings, FiLogOut, FiHome, FiClipboard, FiShield } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { contributionsService, localityService, authService } from '../services/api';
import toast from 'react-hot-toast';
import Profile from './Profile';
import PriceSubmissionForm from '../components/PriceSubmissionForm';

const DashboardContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
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

const ContentHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  color: var(--gray-800);
`; 

const QuickActions = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const ActionCard = styled(Link)`
  background: var(--gray-50);
  border: 1px solid var(--gray-200);
  border-radius: 12px;
  padding: 1rem;
  text-decoration: none;
  color: var(--gray-800);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: #eef2ff;
    border-color: #c7d2fe;
    transform: translateY(-1px);
  }
`;

const LogoutButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  border: 1px solid var(--gray-200);
  background: white;
  color: var(--gray-700);
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: var(--gray-50);
    color: var(--primary-color);
  }
`;

// Styled components for contributor application
const ContributionSection = styled.div`
  margin-top: 1.5rem;
  border-top: 1px solid var(--gray-100);
  padding-top: 1rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  color: var(--gray-800);
  margin-bottom: 0.75rem;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.25rem;
`;

const InputField = styled.input`
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--gray-200);
  border-radius: 8px;
  background: white;
  color: var(--gray-800);
`;

const SelectField = styled.select`
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--gray-200);
  border-radius: 8px;
  background: white;
  color: var(--gray-800);
  appearance: none;
`;

// Champ autonome pour les inputs hors grille (espacement vertical)
const StandaloneField = styled(InputField)`
  margin-top: 0.75rem;
`;

const TextareaField = styled.textarea`
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--gray-200);
  border-radius: 8px;
  background: white;
  color: var(--gray-800);
  margin-top: 0.75rem;
`;

const CheckboxRow = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--gray-200);
  border-radius: 8px;
  background: var(--gray-50);
  margin-top: 0.75rem;
`;

const SubmitRequestButton = styled.button`
  margin-top: 0.75rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.9rem;
  border-radius: 8px;
  border: 1px solid #2563eb;
  background: #3b82f6;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover {
    background: #2563eb;
  }
`;

const StatusBox = styled.div`
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid var(--gray-200);
  background: var(--gray-50);
  color: var(--gray-800);
  margin-bottom: 0.75rem;
`;

const Dashboard = () => {
  const { user, logout, isAuthenticated, roles } = useAuth();
  const navigate = useNavigate();

  // removed local roles fetch; using roles from AuthContext
  // const [roles, setRoles] = React.useState([]);
  // React.useEffect(() => {
  //   if (isAuthenticated && user) {
  //     authService.getRoles()
  //       .then(resp => setRoles(resp?.data?.data?.roles || []))
  //       .catch(() => setRoles([]));
  //   } else {
  //     setRoles([]);
  //   }
  // }, [isAuthenticated, user?.id]);

  const isAdmin = !!(
    (roles && (roles.includes('admin') || roles.includes('super_admin'))) ||
    (user?.user_metadata && (user.user_metadata.role === 'admin' || user.user_metadata.role === 'super_admin')) ||
    (user?.app_metadata && (user.app_metadata.role === 'admin' || user.app_metadata.role === 'super_admin')) ||
    (user?.role === 'admin' || user?.role === 'super_admin')
  );

  const displayName = user?.user_metadata?.firstName
    ? `${user.user_metadata.firstName} ${user.user_metadata.lastName || ''}`.trim()
    : (user?.user_metadata?.username || user?.email || 'Utilisateur');

  const initials = (displayName || 'U')
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const queryClient = useQueryClient();
  const isContributor = !!(
    (roles && roles.includes('contributor')) ||
    (user?.user_metadata && user.user_metadata.role === 'contributor') ||
    (user?.app_metadata && user.app_metadata.role === 'contributor') ||
    user?.role === 'contributor'
  );
  const canContribute = isContributor || isAdmin;
  const showApplySection = !isAdmin && !isContributor;
  const location = useLocation();
  const applySectionRef = React.useRef(null);

  const [activeMenu, setActiveMenu] = React.useState('overview');
  React.useEffect(() => {
    const fromHash = (window.location.hash || '').replace('#', '');
    if (fromHash) setActiveMenu(fromHash);
  }, []);
  const handleMenuClick = (key) => (e) => {
    e.preventDefault();
    if (key === 'contribute') {
      if (canContribute) {
        setActiveMenu('contribute');
        window.location.hash = 'contribute';
      } else {
        setActiveMenu('apply');
        window.location.hash = 'apply';
        setShowApplyForm(true);
      }
      return;
    }
    setActiveMenu(key);
    window.location.hash = key;
  };

  const { data: myReqResponse, isLoading: isMyReqLoading } = useQuery(
    ['contribution-me'],
    () => contributionsService.getMyRequest().then(r => r?.data?.data || null)
  );
  const myRequest = myReqResponse || null;

  const [address, setAddress] = React.useState('');
  const [commune, setCommune] = React.useState('');
  const [activity, setActivity] = React.useState('');
  const [cooperativeMember, setCooperativeMember] = React.useState(false);
  const [cooperativeName, setCooperativeName] = React.useState('');
  const [hasSmartphone, setHasSmartphone] = React.useState(true);
  const [hasInternet, setHasInternet] = React.useState(true);
  const [contactPhone, setContactPhone] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [showApplyForm, setShowApplyForm] = React.useState(false);

  // Charger les communes depuis l’API
  const { data: localitiesResp, isLoading: localitiesLoading, isError: localitiesError } = useQuery(
    'localities-all',
    () => localityService.getAll()
  );
  const localities = localitiesResp?.data?.data || [];

  const applyMutation = useMutation(
    (payload) => contributionsService.apply(payload),
    {
      onSuccess: () => {
        toast.success('Demande soumise avec succès');
        queryClient.invalidateQueries(['contribution-me']);
      },
      onError: (err) => {
        const msg = err?.response?.data?.message || 'Erreur lors de la soumission';
        toast.error(msg);
      },
    }
  );

  const handleSubmitContribution = (e) => {
    e.preventDefault();
    applyMutation.mutate({
      address: address || null,
      commune: commune || null,
      activity: activity || null,
      cooperative_member: cooperativeMember ? 1 : 0,
      cooperative_name: cooperativeName || null,
      has_smartphone: hasSmartphone ? 1 : 0,
      has_internet: hasInternet ? 1 : 0,
      contact_phone: contactPhone || null,
      notes: notes || null,
      submission_method: 'web',
    });
  };

  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('apply') === '1') {
      setShowApplyForm(true);
      if (applySectionRef.current) {
        applySectionRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location]);

  return (
    <DashboardContainer>
      <Sidebar>
        <SidebarHeader>
          <Avatar>{initials}</Avatar>
          <UserInfo>
            <UserName>{displayName}</UserName>
            {(() => {
              const roleSource = (user?.app_metadata && user.app_metadata.role) 
                || (user?.user_metadata && user.user_metadata.role) 
                || user?.role;
              const hasSuperAdmin = roles?.includes?.('super_admin') || roleSource === 'super_admin';
              const hasAdmin = roles?.includes?.('admin') || roleSource === 'admin';
              const hasContributor = roles?.includes?.('contributor') || roleSource === 'contributor';
              const badgeText = hasSuperAdmin ? 'Super Admin' : hasAdmin ? 'Admin' : hasContributor ? 'Contributeur' : 'Utilisateur';
              const isAdminBadge = hasSuperAdmin || hasAdmin;
              return (
                <RoleBadge $isAdmin={isAdminBadge}>{badgeText}</RoleBadge>
              );
            })()}
          </UserInfo>
        </SidebarHeader>
        <NavList>
          <NavAnchor href="#overview" onClick={handleMenuClick('overview')} $active={activeMenu === 'overview'}><FiHome /> Aperçu</NavAnchor>
          <NavAnchor href="#profile" onClick={handleMenuClick('profile')} $active={activeMenu === 'profile'}><FiUser /> Mon Profil</NavAnchor>
          {showApplySection && (
            <NavAnchor href="#apply" onClick={handleMenuClick('apply')} $active={activeMenu === 'apply'}><FiClipboard /> Devenir contributeur</NavAnchor>
          )}
          <NavAnchor href="#contribute" onClick={handleMenuClick('contribute')} $active={activeMenu === 'contribute'}><FiClipboard /> Contribuer</NavAnchor>
          {isAdmin && (
            <NavItem to="/admin" $active={location.pathname === '/admin'}><FiShield /> Espace Admin</NavItem>
          )}
          <NavItem to="/cost-comparator" $active={location.pathname === '/cost-comparator'}><FiSettings /> Outils (Calculateur)</NavItem>
        </NavList>
      </Sidebar>

      <Content>
        <ContentHeader>
          <Title>Mon Espace</Title>
          <LogoutButton onClick={handleLogout}>
            <FiLogOut /> Déconnexion
          </LogoutButton>
        </ContentHeader>

        {activeMenu === 'overview' && (
          <>
            <p style={{ color: 'var(--gray-700)' }}>
              Bienvenue, {displayName}. Voici un accès rapide à vos principales actions.
            </p>

        <QuickActions>
          <ActionCard as="a" href="#profile" onClick={handleMenuClick('profile')}>
            <FiUser /> Gérer mon profil
          </ActionCard>
          <ActionCard
            as="a"
            href={canContribute ? '#contribute' : '#apply'}
            onClick={(e) => {
              e.preventDefault();
              if (canContribute) {
                setActiveMenu('contribute');
                window.location.hash = 'contribute';
              } else {
                setActiveMenu('apply');
                window.location.hash = 'apply';
                setShowApplyForm(true);
              }
            }}
          >
            <FiClipboard /> Soumettre un prix
          </ActionCard>
          {isAdmin && (
            <ActionCard to="/admin">
              <FiShield /> Accéder à l'espace admin
            </ActionCard>
          )}
          <ActionCard to="/cost-comparator">
            <FiSettings /> Calculer les coûts
          </ActionCard>
        </QuickActions>
          </>
        )}
        {activeMenu === 'profile' && (
          <section>
            <Profile />
          </section>
        )}
        {showApplySection && activeMenu === 'apply' && (
          <ContributionSection ref={applySectionRef}>
            <SectionTitle>Devenir contributeur</SectionTitle>
            {isMyReqLoading ? (
              <StatusBox>Chargement du statut de votre demande...</StatusBox>
            ) : myRequest ? (
              myRequest.status === 'pending' ? (
                <StatusBox>Votre demande est en attente de validation par un administrateur.</StatusBox>
              ) : myRequest.status === 'approved' ? (
                <StatusBox>Votre demande a été approuvée. Merci pour votre engagement !</StatusBox>
              ) : (
                <StatusBox>
                  Votre demande a été rejetée{myRequest.rejection_reason ? `: ${myRequest.rejection_reason}` : ''}.
                </StatusBox>
              )
            ) : (
              <div>
                {showApplyForm ? (
                  <form onSubmit={handleSubmitContribution}>
                    <InfoGrid>
                      <InputField placeholder="Adresse" value={address} onChange={e => setAddress(e.target.value)} />
                      {localitiesLoading || localitiesError ? (
                      <InputField placeholder="Commune" value={commune} onChange={e => setCommune(e.target.value)} />
                    ) : (
                      <SelectField value={commune} onChange={e => setCommune(e.target.value)} aria-label="Sélectionner une commune">
                        <option value="">Sélectionner une commune</option>
                        {localities.map(loc => (
                          <option key={loc.id} value={loc.name}>{loc.name}</option>
                        ))}
                      </SelectField>
                    )}
                      <InputField placeholder="Activité" value={activity} onChange={e => setActivity(e.target.value)} />
                      <InputField placeholder="Téléphone" value={contactPhone} onChange={e => setContactPhone(e.target.value)} />
                    </InfoGrid>
                    <CheckboxRow>
                      <input type="checkbox" checked={cooperativeMember} onChange={e => setCooperativeMember(e.target.checked)} />
                      Membre d'une coopérative
                    </CheckboxRow>
                    {cooperativeMember && (
                    <StandaloneField placeholder="Nom de la coopérative" value={cooperativeName} onChange={e => setCooperativeName(e.target.value)} />
                  )}
                    <InfoGrid>
                      <CheckboxRow>
                        <input type="checkbox" checked={hasSmartphone} onChange={e => setHasSmartphone(e.target.checked)} />
                        Je dispose d'un smartphone
                      </CheckboxRow>
                      <CheckboxRow>
                        <input type="checkbox" checked={hasInternet} onChange={e => setHasInternet(e.target.checked)} />
                        Je dispose d'Internet
                      </CheckboxRow>
                    </InfoGrid>
                    <TextareaField placeholder="Notes (optionnel)" value={notes} onChange={e => setNotes(e.target.value)} />
                    <SubmitRequestButton type="submit">Soumettre ma demande</SubmitRequestButton>
                  </form>
                ) : (
                  <>
                    <p style={{ marginBottom: '0.75rem', color: 'var(--gray-700)' }}>
                      Pour contribuer, merci de nous envoyer une demande de contribution.
                    </p>
                    <SubmitRequestButton type="button" onClick={() => setShowApplyForm(true)}>
                      Contribuer
                    </SubmitRequestButton>
                  </>
                )}
              </div>
            )}
          </ContributionSection>
        )}
        {activeMenu === 'contribute' && (
          <section>
            <PriceSubmissionForm />
          </section>
        )}
      </Content>
    </DashboardContainer>
  );
};

export default Dashboard;