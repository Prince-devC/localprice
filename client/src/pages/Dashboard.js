import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { FiUser, FiSettings, FiLogOut, FiHome, FiClipboard, FiShield, FiInfo } from 'react-icons/fi';
import { isValidPhone, isValidExperience } from '../utils/validation';
import { useAuth } from '../contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { contributionsService, localityService, authService, settingsService, agriculturalPriceService, filterOptionsService, unitService, languageService } from '../services/api';
import toast from 'react-hot-toast';
import Profile from './Profile';
import PriceSubmissionForm from '../components/PriceSubmissionForm';
import Modal, { SecondaryButton } from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import { FiEye, FiEdit, FiSearch, FiRefreshCcw, FiChevronLeft, FiChevronRight, FiDownload, FiMapPin, FiTrash, FiLoader } from 'react-icons/fi';
import { exportToCSV } from '../utils/csv';
import LoadingSpinner from '../components/LoadingSpinner';
import FormModal from '../components/FormModal';

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
  margin-bottom: 1rem;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem 1.25rem; /* row-gap, column-gap */
  margin-top: 0.75rem;
  margin-bottom: 0.75rem;
`;

// Bloc d'instructions Kobo avec mise en page robuste (évite les chevauchements)
const KoboPanel = styled.div`
  margin-top: 0.5rem;
  border: 1px solid var(--gray-200);
  border-radius: 8px;
  background: var(--gray-50);
  padding: 0.75rem;
`;

const KoboRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem 0.75rem;
  padding: 0.25rem 0;
`;

const KoboLabel = styled.strong`
  color: var(--gray-800);
  min-width: 180px;
`;

const KoboValue = styled.code`
  display: inline-block;
  background: #fff;
  border: 1px solid var(--gray-200);
  border-radius: 6px;
  padding: 0.25rem 0.5rem;
  color: #111827;
  max-width: 100%;
  word-break: break-all;
`;

const CopyButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin-left: 0.5rem;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  border: 1px solid var(--gray-200);
  background: #fff;
  color: var(--gray-800);
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover { background: var(--gray-100); }
`;

// Groupe champ avec label et aide
const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const LabelRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.3rem;
`;

const FormLabel = styled.label`
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--gray-800);
`;

const Help = styled.span`
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  color: #3b82f6;
  cursor: help;
  font-size: 0.9rem;
  &:hover > span { opacity: 1; transform: translateY(0); }
`;

const Tooltip = styled.span`
  position: absolute;
  top: 125%;
  right: 0;
  background: #111827;
  color: white;
  padding: 0.5rem 0.6rem;
  border-radius: 8px;
  box-shadow: 0 6px 16px rgba(0,0,0,0.15);
  width: 260px;
  font-size: 0.8rem;
  opacity: 0;
  transform: translateY(-6px);
  transition: all 0.15s ease;
  pointer-events: none;
  z-index: 5;
`;

const InputField = styled.input`
  width: 100%;
  padding: 0.6rem 0.85rem;
  border: 1px solid var(--gray-200);
  border-radius: 8px;
  background: white;
  color: var(--gray-800);
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  &:focus {
    border-color: #93c5fd;
    box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
  }
`;

// Styles de tableau harmonisés avec l’admin
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
  @media (max-width: 640px) {
    display: block;
  }
  @media (max-width: 640px) {
    thead { display: none; }
    tbody { display: block; }
  }
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
  @media (max-width: 640px) {
    grid-column: auto;
    box-sizing: border-box;
    min-width: 0;
    line-height: 1.35;
    min-height: 44px;
  }
  &.cell-actions {
    @media (max-width: 640px) {
      grid-column: 1 / -1;
    }
  }
  &.cell-wide {
    @media (max-width: 640px) {
      grid-column: 1 / -1;
    }
  }
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background: #fcfdff;
  }
  &:hover {
    background: #f5f7fb;
  }
  @media (max-width: 640px) {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
    align-items: start;
    padding: 8px 0;
  }
`;

// Badges de statut cohérents avec l’admin
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

const SelectField = styled.select`
  width: 100%;
  padding: 0.6rem 0.85rem;
  border: 1px solid var(--gray-200);
  border-radius: 8px;
  background: white;
  color: var(--gray-800);
  appearance: none;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  &:focus {
    border-color: #93c5fd;
    box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
  }
`;

// Champ autonome pour les inputs hors grille (espacement vertical)
const StandaloneField = styled(InputField)`
  margin-top: 0.75rem;
`;

const TextareaField = styled.textarea`
  width: 100%;
  padding: 0.6rem 0.85rem;
  border: 1px solid var(--gray-200);
  border-radius: 8px;
  background: white;
  color: var(--gray-800);
  margin-top: 0.75rem;
  min-height: 90px;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  &:focus {
    border-color: #93c5fd;
    box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
  }
`;

const CheckboxRow = styled.label`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.6rem 0.9rem;
  border: 1px solid var(--gray-200);
  border-radius: 8px;
  background: var(--gray-50);
  margin-top: 0.85rem;
`;

const SubmitRequestButton = styled.button`
  margin-top: 1rem;
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  border: 1px solid #2563eb;
  background: #3b82f6;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover {
    background: #2563eb;
  }
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    filter: grayscale(10%);
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

const ErrorText = styled.small`
  color: #b91c1c;
  margin-top: 0.25rem;
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

  // Badge de statut harmonisé
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

  const queryClient = useQueryClient();
  // Profil étendu (inclut is_banned via API)
  const { data: profileResp, isLoading: loadingProfile } = useQuery(
    ['auth-profile', user?.id],
    () => authService.getProfile().then(r => r?.data?.data || null),
    { enabled: !!isAuthenticated, keepPreviousData: false, staleTime: 0, cacheTime: 0 }
  );
  const isBanned = !!(profileResp?.is_banned);
  // Charger le statut de demande de contribution pour déterminer l'accès
  const { data: myReqResponse, isLoading: isMyReqLoading } = useQuery(
    ['contribution-me', user?.id],
    () => contributionsService.getMyRequest().then(r => r?.data?.data || null),
    { enabled: !!isAuthenticated, keepPreviousData: false, staleTime: 0, cacheTime: 0 }
  );
  const myRequest = myReqResponse || null;
  const isContributor = !!(
    (roles && roles.includes('contributor')) ||
    (user?.user_metadata && user.user_metadata.role === 'contributor') ||
    (user?.app_metadata && user.app_metadata.role === 'contributor') ||
    user?.role === 'contributor' ||
    (myRequest?.status === 'approved')
  );
  const canContribute = !isBanned && (isContributor || isAdmin);
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
        if (isBanned) {
          toast.error('Votre compte est banni : action indisponible');
          setActiveMenu('overview');
          window.location.hash = 'overview';
        } else {
          setActiveMenu('apply');
          window.location.hash = 'apply';
          setShowApplyForm(true);
        }
      }
      return;
    }
    setActiveMenu(key);
    window.location.hash = key;
  };

  // myRequest est déjà chargé plus haut

  const [address, setAddress] = React.useState('');
  const [commune, setCommune] = React.useState('');
  const [activity, setActivity] = React.useState('');
  const [cooperativeMember, setCooperativeMember] = React.useState(false);
  const [cooperativeName, setCooperativeName] = React.useState('');
  // Les informations d'équipement et de connexion sont issues des Préférences
  // const [hasSmartphone, setHasSmartphone] = React.useState(true);
  // const [hasInternet, setHasInternet] = React.useState(true);
  const [contactPhone, setContactPhone] = React.useState('');
  const [hasWhatsapp, setHasWhatsapp] = React.useState(false);
  const [experienceLevel, setExperienceLevel] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [showApplyForm, setShowApplyForm] = React.useState(false);
  const [acceptContributionTerms, setAcceptContributionTerms] = React.useState(false);

  const [phoneError, setPhoneError] = React.useState('');
  const [expError, setExpError] = React.useState('');

  // Charger les communes depuis l’API
  const { data: localitiesResp, isLoading: localitiesLoading, isError: localitiesError } = useQuery(
    'localities-all',
    () => localityService.getAll()
  );
  const localities = localitiesResp?.data?.data || [];

  const { data: prefsResp } = useQuery(
    ['contribution-preferences'],
    () => contributionsService.getPreferences().then(r => r?.data?.data || null)
  );
  const prefData = prefsResp || null;
  const [prefSmartphone, setPrefSmartphone] = React.useState(true);
  const [prefInternet, setPrefInternet] = React.useState(true);
  const [prefMethod, setPrefMethod] = React.useState('web');
  React.useEffect(() => {
    if (prefData) {
      setPrefSmartphone(!!prefData.has_smartphone_default);
      setPrefInternet(!!prefData.has_internet_default);
      setPrefMethod(prefData.preferred_method || 'web');
    }
  }, [prefData]);
  const updatePrefsMutation = useMutation(
    (payload) => contributionsService.updatePreferences(payload),
    {
      onSuccess: () => {
        toast.success('Préférences mises à jour');
        queryClient.invalidateQueries('contribution-preferences');
      },
      onError: (err) => {
        const msg = err?.response?.data?.message || 'Erreur lors de la mise à jour des préférences';
        toast.error(msg);
      }
    }
  );
  const applyMutation = useMutation(
    (payload) => contributionsService.apply(payload),
    {
      onSuccess: () => {
        toast.success('Demande soumise avec succès');
        queryClient.invalidateQueries(['contribution-me']);
        // Optionnel: réinitialiser le formulaire
        setAddress(''); setCommune(''); setActivity(''); setCooperativeMember(false);
        setCooperativeName(''); setContactPhone(''); setHasWhatsapp(false); setExperienceLevel(''); setNotes('');
        setPhoneError(''); setExpError('');
      },
      onError: (err) => {
        const msg = err?.response?.data?.message || 'Erreur lors de la soumission';
        toast.error(msg);
      },
    }
  );

  // Mes prix: filtres, pagination et sélection
  const [myPricesStatus, setMyPricesStatus] = React.useState('all');
  const [myPricesLimit] = React.useState(20);
  const [myPricesOffset, setMyPricesOffset] = React.useState(0);
  const [mySelectedIds, setMySelectedIds] = React.useState([]);
  const toggleMySelect = (id) => setMySelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const clearMySelection = () => setMySelectedIds([]);
  const toggleMySelectAll = (rows) => {
    if (!rows || rows.length === 0) return;
    const allIds = rows.map(p => p.id);
    const allSelected = allIds.every(id => mySelectedIds.includes(id));
    setMySelectedIds(allSelected ? [] : allIds);
  };
  const { data: myPricesResp, isLoading: isMyPricesLoading, isError: isMyPricesError, error: myPricesError, isFetching: isMyPricesFetching } = useQuery(
    ['agro-my-prices', user?.id, myPricesStatus, myPricesLimit, myPricesOffset],
    () => agriculturalPriceService.getMyPrices({ status: myPricesStatus, limit: myPricesLimit, offset: myPricesOffset }),
    { keepPreviousData: false, staleTime: 0, cacheTime: 0 }
  );
  const myPrices = React.useMemo(
    () => myPricesResp?.data?.data || [],
    [myPricesResp]
  );

  // Recherche locale et liste visible (filtrée sur la page courante)
  const [myPricesSearch, setMyPricesSearch] = React.useState('');
  const visibleMyPrices = React.useMemo(() => {
    const term = (myPricesSearch || '').toLowerCase().trim();
    if (!term) return myPrices;
    return myPrices.filter(p => {
      return [
        p?.product_name,
        p?.category_name,
        p?.locality_name,
        p?.region_name,
        p?.sub_locality,
        p?.unit_name,
        p?.unit_symbol,
        p?.status,
        p?.price != null ? String(p.price) : ''
      ].some(v => v && String(v).toLowerCase().includes(term));
    });
  }, [myPrices, myPricesSearch]);

  // Options pour édition (produits, localités, unités)
  const { data: productOpts = [], isLoading: loadingProductOpts } = useQuery(
    'filter-products',
    () => filterOptionsService.getProducts(),
    { select: (r) => r?.data?.data || [] }
  );
  const { data: localityOpts = [], isLoading: loadingLocalityOpts } = useQuery(
    'filter-localities',
    () => filterOptionsService.getLocalities(),
    { select: (r) => r?.data?.data || [] }
  );
  const { data: localityCoords = [], isLoading: loadingLocalityCoords } = useQuery(
    'localities-with-coordinates',
    () => localityService.getWithCoordinates(),
    { select: (r) => r?.data?.data || [] }
  );
  const { data: units = [], isLoading: loadingUnits } = useQuery(
    'units',
    () => unitService.getAll(),
    { select: (r) => r?.data?.data || [] }
  );
  const { data: languageOpts = [], isLoading: loadingLanguageOpts } = useQuery(
    'filter-languages',
    () => languageService.getAll(),
    { select: (r) => r?.data?.data || [] }
  );
  const productOptions = React.useMemo(() => (productOpts || []).map(o => ({ value: o.product_id, label: o.display_name })), [productOpts]);
  const localityOptions = React.useMemo(() => (localityOpts || []).map(o => ({ value: o.locality_id, label: o.display_name })), [localityOpts]);
  const unitOptions = React.useMemo(() => (units || []).map(u => ({ value: u.id, label: u.symbol ? `${u.name} (${u.symbol})` : u.name })), [units]);
  const languageOptions = React.useMemo(() => (languageOpts || []).map(l => ({ value: l.id, label: l.name })), [languageOpts]);

  // Simple stats for regular users (no contribution rights)
  // GeneralStats supprimé car non utilisé

  // Edition d'un prix "Mes prix"
  const [myEditOpen, setMyEditOpen] = React.useState(false);
  const [myEditPrice, setMyEditPrice] = React.useState(null);
  const [myDeleteConfirm, setMyDeleteConfirm] = React.useState({ open: false, price: null });
  const [myBulkDeleteConfirm, setMyBulkDeleteConfirm] = React.useState({ open: false, ids: [] });
  const eligibleSelectedIds = React.useMemo(() => {
    return myPrices.filter(p => mySelectedIds.includes(p.id) && (p.status === 'pending' || p.status === 'rejected')).map(p => p.id);
  }, [mySelectedIds, myPrices]);
  const deleteMyPriceMutation = useMutation(
    (id) => agriculturalPriceService.delete(id),
    {
      onSuccess: () => {
        toast.success('Prix supprimé');
        setMyDeleteConfirm({ open: false, price: null });
        clearMySelection();
        queryClient.invalidateQueries('agro-my-prices');
      },
      onError: (err) => {
        const msg = err?.response?.data?.message || 'Suppression refusée';
        toast.error(msg);
      }
    }
  );
  const bulkDeleteMyPricesMutation = useMutation(
    async (ids) => {
      const results = await Promise.allSettled(ids.map((id) => agriculturalPriceService.delete(id)));
      const successCount = results.filter(r => r.status === 'fulfilled').length;
      const failCount = results.length - successCount;
      if (failCount > 0) {
        throw new Error(`${successCount} supprimé(s), ${failCount} échec(s)`);
      }
      return successCount;
    },
    {
      onSuccess: (count) => {
        toast.success(`${count} prix supprimés`);
        clearMySelection();
        queryClient.invalidateQueries('agro-my-prices');
      },
      onError: (err) => {
        toast.error(err?.message || 'Erreur lors de la suppression groupée');
        queryClient.invalidateQueries('agro-my-prices');
      }
    }
  );
  const updateMyPriceMutation = useMutation(
    ({ id, data }) => agriculturalPriceService.update(id, data),
    {
      onSuccess: () => {
        toast.success('Prix mis à jour');
        queryClient.invalidateQueries('agro-my-prices');
        setMyEditOpen(false);
        setMyEditPrice(null);
      },
      onError: (err) => {
        const msg = err?.response?.data?.message || 'Erreur lors de la mise à jour';
        toast.error(msg);
      }
    }
  );
  const myButtonsBusy = isMyPricesLoading || isMyPricesFetching || updateMyPriceMutation.isLoading || deleteMyPriceMutation.isLoading || bulkDeleteMyPricesMutation.isLoading;
  const myEditFields = React.useMemo(() => {
    if (!myEditPrice) return [];
    const languageDefault = (() => {
      if (Array.isArray(myEditPrice.source_language_ids) && myEditPrice.source_language_ids.length > 0) {
        return myEditPrice.source_language_ids[0];
      }
      const s = myEditPrice.source_languages;
      if (typeof s === 'string' && s.trim()) {
        const firstName = s.split(',')[0].trim().toLowerCase();
        const match = (languageOpts || []).find(l => String(l.name).trim().toLowerCase() === firstName);
        return match?.id ?? '';
      }
      return '';
    })();
    return [
      { name: 'product_id', label: 'Produit', type: 'select', required: true, options: productOptions, defaultValue: myEditPrice.product_id },
      { name: 'locality_id', label: 'Localité', type: 'select', required: true, options: localityOptions, defaultValue: myEditPrice.locality_id },
      { name: 'unit_id', label: 'Unité', type: 'select', required: true, options: unitOptions, defaultValue: myEditPrice.unit_id },
      { name: 'price', label: 'Prix', type: 'number', required: true, defaultValue: myEditPrice.price },
      { name: 'date', label: 'Date (YYYY-MM-DD)', type: 'text', required: true, defaultValue: (myEditPrice.date || '').slice(0, 10) },
      { name: 'sub_locality', label: 'Sous-localité', type: 'text', defaultValue: myEditPrice.sub_locality || '' },
      { name: 'latitude', label: 'Latitude', type: 'number', defaultValue: myEditPrice.latitude ?? '' },
      { name: 'longitude', label: 'Longitude', type: 'number', defaultValue: myEditPrice.longitude ?? '' },
      { name: 'geo_accuracy', label: 'Précision GPS (m)', type: 'number', defaultValue: myEditPrice.geo_accuracy ?? '' },
      { name: 'comment', label: 'Commentaire', type: 'textarea', defaultValue: myEditPrice.comment || '' },
      { name: 'source_type', label: 'Type de source', type: 'select', defaultValue: myEditPrice.source_type || '', options: [
        { value: '', label: 'Type de source' },
        { value: 'producteur', label: 'Producteur' },
        { value: 'cooperative', label: 'Coopérative' },
        { value: 'transformateur', label: 'Transformateur' },
        { value: 'grossiste', label: 'Grossiste' },
        { value: 'commercant', label: 'Commerçant' },
        { value: 'autre', label: 'Autre' }
      ] },
      { name: 'source', label: 'Source', type: 'text', defaultValue: myEditPrice.source || '' },
      { name: 'source_contact_name', label: 'Nom du contact', type: 'text', defaultValue: myEditPrice.source_contact_name || '' },
      { name: 'source_contact_phone', label: 'Téléphone du contact', type: 'text', defaultValue: myEditPrice.source_contact_phone || '' },
      { name: 'source_contact_relation', label: 'Relation du contact', type: 'select', defaultValue: myEditPrice.source_contact_relation || '', options: [
        { value: '', label: 'Lien du contact (optionnel)' },
        { value: 'moi', label: 'Moi' },
        { value: 'proche', label: 'Proche' },
        { value: 'autre', label: 'Autre' }
      ] },
      { name: 'source_language_id', label: 'Langue de communication', type: 'select', defaultValue: languageDefault, options: [
        { value: '', label: 'Sélectionner une langue (optionnel)' },
        ...languageOptions
      ] }
    ];
  }, [myEditPrice, productOptions, localityOptions, unitOptions, languageOptions, languageOpts]);
  const handleMyEditSubmit = (values) => {
    if (!myEditPrice) return;
    // Omettre produit et localité du payload de mise à jour
    const payload = {
      unit_id: parseInt(values.unit_id),
      price: parseFloat(values.price),
      date: values.date,
      comment: values.comment ? values.comment : null,
      latitude: values.latitude !== '' ? parseFloat(values.latitude) : null,
      longitude: values.longitude !== '' ? parseFloat(values.longitude) : null,
      geo_accuracy: values.geo_accuracy !== '' ? parseFloat(values.geo_accuracy) : null,
      source: values.source ? values.source : null,
      source_type: values.source_type ? values.source_type : null,
      source_contact_name: values.source_contact_name ? values.source_contact_name : null,
      source_contact_phone: values.source_contact_phone ? values.source_contact_phone : null,
      source_contact_relation: values.source_contact_relation ? values.source_contact_relation : null,
      sub_locality: values.sub_locality ? values.sub_locality : null
    };
    if (values.source_language_id) {
      const langId = parseInt(values.source_language_id);
      if (!Number.isNaN(langId)) payload.source_language_ids = [langId];
    }
    const acc = payload.geo_accuracy;
    if (typeof acc === 'number' && acc > 10) {
      toast("Attention: précision GPS > 10 m. Votre prix sera enregistré, mais la validation peut être refusée.", { icon: '⚠️' });
    }
    updateMyPriceMutation.mutate({ id: myEditPrice.id, data: payload });
  };
  const toRad = (deg) => (deg * Math.PI) / 180;
  const haversineMeters = (lat1, lon1, lat2, lon2) => {
    const R = 6371000;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const [accuracyConfirm, setAccuracyConfirm] = React.useState({ open: false, payload: null });
  const [myGeoBusy, setMyGeoBusy] = React.useState(false);

  // Modale de détails pour "Mes prix" (lecture, statuts non validés autorisés)
  const [myDetailOpen, setMyDetailOpen] = React.useState(false);
  const [myDetailPrice, setMyDetailPrice] = React.useState(null);

  // Paramètres Kobo (URL + identifiant) – admin définissables
  const { data: koboSettingsResp } = useQuery(
    ['kobo-settings'],
    () => settingsService.getKoboSettings().then(r => r?.data?.data || null),
    { staleTime: 30_000 }
  );
  // Fallback priority: DB setting > Env var > API URL (if absolute) > Default Kobo
  const apiUrl = process.env.REACT_APP_API_URL;
  const defaultServerUrl = (apiUrl && apiUrl.startsWith('http')) ? apiUrl : 'https://kc.kobotoolbox.org';
  const koboServerUrl = (koboSettingsResp?.server_url || process.env.REACT_APP_KOBO_SERVER_URL || defaultServerUrl);
  const koboUsername = (koboSettingsResp?.username || 'Identifiant défini par l’admin');
  const koboPassword = (koboSettingsResp?.password || 'Mot de passe défini par l’admin');
  // Identifiant personnel à renseigner dans le formulaire Kobo (pour lier les contributions)
  const myLokaliUsername = (
    (user?.user_metadata && user.user_metadata.username)
    || (typeof user?.email === 'string' ? user.email.split('@')[0] : '')
    || (user?.id || '')
  );
  // ID technique Supabase de l’utilisateur (pour référence si nécessaire)
  const mySupabaseUserId = (user?.id || '');

  const handleSubmitContribution = (e) => {
    e.preventDefault();
    if (isBanned) {
      toast.error('Votre compte est banni : demande indisponible');
      return;
    }
    if (!acceptContributionTerms) {
      toast.error('Veuillez accepter les conditions de contribution');
      return;
    }
    const phone = (contactPhone || '').trim();
    const exp = (experienceLevel || '').toLowerCase();
    let hasError = false;
    if (!phone) {
      setPhoneError('Le numéro de téléphone est requis');
      hasError = true;
    } else if (!isValidPhone(phone)) {
      setPhoneError('Format invalide. Utilisez 01XXXXXXXX');
      hasError = true;
    } else {
      setPhoneError('');
    }
    if (!isValidExperience(exp)) {
      setExpError("Sélectionnez votre niveau d'expérience");
      hasError = true;
    } else {
      setExpError('');
    }
    if (hasError) {
      toast.error('Veuillez corriger les erreurs du formulaire');
      return;
    }
    applyMutation.mutate({
      address: address || null,
      commune: commune || null,
      activity: activity || null,
      cooperative_member: cooperativeMember ? 1 : 0,
      cooperative_name: cooperativeName || null,
      contact_phone: phone,
      has_whatsapp: hasWhatsapp ? 1 : 0,
      experience_level: exp,
      notes: notes || null,
      // Les préférences ne sont plus prises en compte dans la demande ;
      // on laisse le backend appliquer ses valeurs par défaut.
    });
  };

  // Autosauvegarde locale (RGPD: stockage minimal et effaçable)
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem('contrib-apply-draft');
      if (raw) {
        const draft = JSON.parse(raw);
        if (draft.address) setAddress(draft.address);
        if (draft.commune) setCommune(draft.commune);
        if (draft.activity) setActivity(draft.activity);
        if (typeof draft.cooperativeMember === 'boolean') setCooperativeMember(draft.cooperativeMember);
        if (draft.cooperativeName) setCooperativeName(draft.cooperativeName);
        if (draft.contactPhone) setContactPhone(draft.contactPhone);
        if (typeof draft.hasWhatsapp === 'boolean') setHasWhatsapp(draft.hasWhatsapp);
        if (draft.experienceLevel) setExperienceLevel(draft.experienceLevel);
        if (draft.notes) setNotes(draft.notes);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    const draft = {
      address,
      commune,
      activity,
      cooperativeMember,
      cooperativeName,
      contactPhone,
      hasWhatsapp,
      experienceLevel,
      notes,
    };
    try { localStorage.setItem('contrib-apply-draft', JSON.stringify(draft)); } catch {}
  }, [address, commune, activity, cooperativeMember, cooperativeName, contactPhone, hasWhatsapp, experienceLevel, notes]);

  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('apply') === '1') {
      setShowApplyForm(true);
      if (applySectionRef.current) {
        applySectionRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location]);

  const initialLoading = (
    loadingProfile ||
    isMyReqLoading ||
    localitiesLoading ||
    isMyPricesLoading ||
    loadingProductOpts ||
    loadingLocalityOpts ||
    loadingUnits ||
    loadingLanguageOpts ||
    loadingLocalityCoords
  );

  if (initialLoading) {
    return <LoadingSpinner text="Chargement du tableau de bord..." />;
  }

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
          {/* Aperçu */}
          <NavAnchor href="#overview" onClick={handleMenuClick('overview')} $active={activeMenu === 'overview'}><FiHome /> Aperçu</NavAnchor>

          {/* Mes prix (si contributeur) */}
          {isContributor && (
            <NavAnchor href="#my-prices" onClick={handleMenuClick('my-prices')} $active={activeMenu === 'my-prices'}>
              <FiClipboard /> Mes prix
            </NavAnchor>
          )}

          {/* Actions de contribution */}
          <NavAnchor href="#contribute" onClick={handleMenuClick('contribute')} $active={activeMenu === (canContribute ? 'contribute' : 'apply')}>
            <FiClipboard /> {canContribute ? 'Soumettre un prix' : 'Devenir contributeur'}
          </NavAnchor>
          {isContributor && (
            <NavAnchor href="#preferences" onClick={handleMenuClick('preferences')} $active={activeMenu === 'preferences'}><FiSettings /> Préférences</NavAnchor>
          )}

          {/* Profil */}
          <NavAnchor href="#profile" onClick={handleMenuClick('profile')} $active={activeMenu === 'profile'}><FiUser /> Mon Profil</NavAnchor>

          {/* Accès admin (si autorisé) */}
          {isAdmin && (
            <NavItem to="/admin" $active={location.pathname === '/admin'}><FiShield /> Espace Admin</NavItem>
          )}
        </NavList>
      </Sidebar>

      <Content>
        <ContentHeader>
          <Title>Mon Espace</Title>
          <LogoutButton onClick={handleLogout}>
            <FiLogOut /> Déconnexion
          </LogoutButton>
        </ContentHeader>

        {isBanned && (
          <StatusBox style={{ marginBottom: '0.75rem', background: '#fee2e2', color: '#b91c1c', borderColor: '#fecaca' }}>
            Votre compte est actuellement banni. Certaines actions sont désactivées.
          </StatusBox>
        )}

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
                if (isBanned) {
                  toast.error('Votre compte est banni : action indisponible');
                  setActiveMenu('overview');
                  window.location.hash = 'overview';
                } else {
                  setActiveMenu('apply');
                  window.location.hash = 'apply';
                  setShowApplyForm(true);
                }
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
          
        </QuickActions>
        {/* Stats rapides (uniquement pour contributeurs) */}
        {isContributor && (
          <div style={{ marginTop:'1rem', display:'grid', gridTemplateColumns:'repeat(4, minmax(0, 1fr))', gap:'0.75rem' }}>
            <>
              <div style={{ padding:'0.75rem', border:'1px solid var(--gray-200)', borderRadius:8, background:'#f9fafb' }}>
                <div style={{ color:'var(--gray-500)', fontSize:'0.85rem' }}>Total</div>
                <div style={{ fontWeight:700, fontSize:'1.1rem' }}>{myPrices.length}</div>
              </div>
              <div style={{ padding:'0.75rem', border:'1px solid var(--gray-200)', borderRadius:8, background:'#f9fafb' }}>
                <div style={{ color:'var(--gray-500)', fontSize:'0.85rem' }}>Validés</div>
                <div style={{ fontWeight:700, fontSize:'1.1rem' }}>{myPrices.filter(p => p.status === 'validated').length}</div>
              </div>
              <div style={{ padding:'0.75rem', border:'1px solid var(--gray-200)', borderRadius:8, background:'#f9fafb' }}>
                <div style={{ color:'var(--gray-500)', fontSize:'0.85rem' }}>En attente</div>
                <div style={{ fontWeight:700, fontSize:'1.1rem' }}>{myPrices.filter(p => p.status === 'pending').length}</div>
              </div>
              <div style={{ padding:'0.75rem', border:'1px solid var(--gray-200)', borderRadius:8, background:'#f9fafb' }}>
                <div style={{ color:'var(--gray-500)', fontSize:'0.85rem' }}>Rejetés</div>
                <div style={{ fontWeight:700, fontSize:'1.1rem', color:'#b91c1c' }}>{myPrices.filter(p => p.status === 'rejected').length}</div>
              </div>
            </>
          </div>
        )}
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
            <StatusBox style={{ marginBottom: '0.5rem' }}>
              Consultez les <Link to="/contribution-terms">conditions de contribution</Link>.
            </StatusBox>
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
                      <FieldGroup>
                        <LabelRow>
                          <FormLabel htmlFor="address">Adresse</FormLabel>
                          <Help><FiInfo /><Tooltip>Indiquez le village, quartier, hameau ou un point de repère.</Tooltip></Help>
                        </LabelRow>
                        <InputField id="address" placeholder="Ex: Village, quartier, hameau, point de repère" value={address} onChange={e => setAddress(e.target.value)} />
                      </FieldGroup>

                      <FieldGroup>
                        <LabelRow>
                          <FormLabel htmlFor="commune">Commune</FormLabel>
                          <Help><FiInfo /><Tooltip>Choisissez votre commune de collecte principale.</Tooltip></Help>
                        </LabelRow>
                        {localitiesLoading || localitiesError ? (
                          <InputField id="commune" placeholder="Commune" value={commune} onChange={e => setCommune(e.target.value)} />
                        ) : (
                          <SelectField id="commune" value={commune} onChange={e => setCommune(e.target.value)} aria-label="Sélectionner une commune">
                            <option value="">Sélectionner une commune</option>
                            {localities.map(loc => (
                              <option key={loc.id} value={loc.name}>{loc.name}</option>
                            ))}
                          </SelectField>
                        )}
                      </FieldGroup>

                      <FieldGroup>
                        <LabelRow>
                          <FormLabel htmlFor="activity">Activité</FormLabel>
                          <Help><FiInfo /><Tooltip>Votre activité principale (ex: commerçant, producteur).</Tooltip></Help>
                        </LabelRow>
                        <InputField id="activity" placeholder="Ex: Commerçant, Producteur…" value={activity} onChange={e => setActivity(e.target.value)} />
                      </FieldGroup>

                      <FieldGroup>
                        <LabelRow>
                          <FormLabel htmlFor="contactPhone">Numéro de téléphone</FormLabel>
                          <Help><FiInfo /><Tooltip>Format: 01XXXXXXXX. Utilisé uniquement pour vous contacter (RGPD).</Tooltip></Help>
                        </LabelRow>
                        <InputField
                          id="contactPhone"
                          placeholder="01XXXXXXXX"
                          value={contactPhone}
                          onChange={e => {
                            const v = e.target.value;
                            setContactPhone(v);
                            if (!v) {
                              setPhoneError('Le numéro de téléphone est requis');
                            } else if (!isValidPhone(v.trim())) {
                              setPhoneError('Format invalide. Utilisez 01XXXXXXXX');
                            } else {
                              setPhoneError('');
                            }
                          }}
                        />
                        {phoneError && <ErrorText>{phoneError}</ErrorText>}
                        <small style={{ color: '#6b7280', marginTop: '0.25rem' }}>Confidentialité: conforme RGPD, non partagé publiquement.</small>
                      </FieldGroup>

                      <FieldGroup>
                        <LabelRow>
                          <FormLabel htmlFor="experienceLevel">Expérience en collecte de données</FormLabel>
                          <Help><FiInfo /><Tooltip>Indiquez votre niveau: Débutant, Intermédiaire ou Expert.</Tooltip></Help>
                        </LabelRow>
                        <SelectField id="experienceLevel" value={experienceLevel} onChange={e => {
                          const v = e.target.value;
                          setExperienceLevel(v);
                          if (!isValidExperience((v || '').toLowerCase())) {
                            setExpError("Sélectionnez votre niveau d'expérience");
                          } else {
                            setExpError('');
                          }
                        }} aria-label="Niveau d'expérience">
                          <option value="">Sélectionner votre niveau</option>
                          <option value="debutant">Débutant</option>
                          <option value="intermediaire">Intermédiaire</option>
                          <option value="expert">Expert</option>
                        </SelectField>
                        {expError && <ErrorText>{expError}</ErrorText>}
                      </FieldGroup>
                    </InfoGrid>
                    <CheckboxRow>
                      <input type="checkbox" checked={cooperativeMember} onChange={e => setCooperativeMember(e.target.checked)} />
                      Membre d'une coopérative
                    </CheckboxRow>
                    {cooperativeMember && (
                    <StandaloneField placeholder="Nom de la coopérative" value={cooperativeName} onChange={e => setCooperativeName(e.target.value)} />
                  )}

                    <CheckboxRow>
                      <input type="checkbox" checked={hasWhatsapp} onChange={e => setHasWhatsapp(e.target.checked)} />
                      Je dispose de WhatsApp
                    </CheckboxRow>
                    
                    {!prefInternet && (
                      <StatusBox style={{ marginTop: '0.5rem' }}>
                        {"Méthode de collecte recommandée: KoboCollect (hors ligne)."}
                      </StatusBox>
                    )}
                      <TextareaField placeholder="Notes (optionnel)" value={notes} onChange={e => setNotes(e.target.value)} />
                      <CheckboxRow>
                        <input type="checkbox" required checked={acceptContributionTerms} onChange={e => setAcceptContributionTerms(e.target.checked)} />
                        <span>
                          J’ai lu et j’accepte les <Link to="/contribution-terms">conditions de contribution</Link>
                        </span>
                      </CheckboxRow>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <small style={{ color: '#6b7280' }}>Brouillon auto-enregistré localement</small>
                        <button type="button" onClick={() => {
                          try { localStorage.removeItem('contrib-apply-draft'); } catch {}
                          setAddress(''); setCommune(''); setActivity(''); setCooperativeMember(false);
                          setCooperativeName(''); setContactPhone(''); setHasWhatsapp(false); setExperienceLevel(''); setNotes('');
                          setPhoneError(''); setExpError('');
                          toast.success('Brouillon effacé');
                        }} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}>Effacer le brouillon</button>
                      </div>
                     <SubmitRequestButton type="submit" disabled={applyMutation.isLoading || !acceptContributionTerms} aria-busy={applyMutation.isLoading}>
                       {applyMutation.isLoading ? 'Envoi…' : 'Soumettre ma demande'}
                     </SubmitRequestButton>
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
        {activeMenu === 'preferences' && (
          <section>
            <SectionTitle>Préférences de collecte</SectionTitle>
            <div>
              <CheckboxRow>
                <input type="checkbox" checked={prefSmartphone} onChange={e => setPrefSmartphone(e.target.checked)} />
                Je dispose d'un smartphone (par défaut)
              </CheckboxRow>
              <CheckboxRow>
                <input type="checkbox" checked={prefInternet} onChange={e => setPrefInternet(e.target.checked)} />
                Je dispose d'une connexion sur le lieu de collecte (par défaut)
              </CheckboxRow>
              <InfoGrid>
                <SelectField value={prefMethod} onChange={e => setPrefMethod(e.target.value)} aria-label="Méthode de collecte préférée">
                  <option value="web">Formulaire web</option>
                  <option value="offline">KoboCollect (hors ligne)</option>
                </SelectField>
              </InfoGrid>
              <SubmitRequestButton
                type="button"
                onClick={() => updatePrefsMutation.mutate({
                  has_smartphone_default: prefSmartphone ? 1 : 0,
                  has_internet_default: prefInternet ? 1 : 0,
                  preferred_method: prefMethod
                })}
              >
                Enregistrer les préférences
              </SubmitRequestButton>
            </div>
          </section>
        )}
        {activeMenu === 'contribute' && (
          <section>
            {isContributor && (
              <p style={{ marginBottom: '0.75rem', color: 'var(--gray-700)' }}>
                Vous pouvez ajuster vos préférences de collecte dans <a href="#preferences" onClick={handleMenuClick('preferences')}>Préférences</a>.
              </p>
            )}
            {isBanned ? (
              <StatusBox style={{ background: '#fee2e2', color: '#b91c1c', borderColor: '#fecaca' }}>
                Action indisponible : votre compte est banni.
              </StatusBox>
            ) : (
              (prefMethod === 'web' ? (
                <PriceSubmissionForm />
              ) : (
                <div>
                  <SectionTitle>Instructions KoboCollect (hors ligne)</SectionTitle>
                  <StatusBox style={{ marginBottom: '0.75rem' }}>
                    Votre préférence actuelle n'est pas le formulaire web. Utilisez KoboCollect pour saisir vos prix hors ligne.
                  </StatusBox>
                  <div style={{ marginBottom: '0.75rem' }}>
                    1) Installez KoboCollect sur votre smartphone: {' '}
                    <a href="https://play.google.com/store/apps/details?id=org.koboc.collect.android" target="_blank" rel="noreferrer">Lien Play Store</a>
                  </div>
                  <div style={{ marginBottom: '0.75rem' }}>
                    2) Ouvrez l'application → Paramètres → Serveur, puis renseignez:
                  </div>
                  <StatusBox style={{ marginBottom: '0.75rem' }}>
                    Ces informations concernent <strong>le serveur Kobo</strong> (URL, identifiant et mot de passe). Elles ne sont <strong>pas</strong> vos identifiants Lokali.
                  </StatusBox>
                  <KoboPanel>
                    <KoboRow>
                      <KoboLabel>URL du serveur Kobo</KoboLabel>
                      <span>
                        <KoboValue>{koboServerUrl}</KoboValue>
                        <CopyButton type="button" onClick={() => {
                          try { navigator.clipboard.writeText(koboServerUrl); toast.success('URL copiée'); } catch {}
                        }}>Copier</CopyButton>
                      </span>
                    </KoboRow>
                    <KoboRow>
                      <KoboLabel>Nom d'utilisateur Kobo (commun)</KoboLabel>
                      <span>
                        <KoboValue>{koboUsername}</KoboValue>
                        <CopyButton type="button" onClick={() => {
                          try { navigator.clipboard.writeText(koboUsername); toast.success('Identifiant copié'); } catch {}
                        }}>Copier</CopyButton>
                      </span>
                    </KoboRow>
                    <KoboRow>
                      <KoboLabel>Mot de passe Kobo (commun)</KoboLabel>
                      <span>
                        <KoboValue>{koboPassword}</KoboValue>
                        <CopyButton type="button" onClick={() => {
                          try { navigator.clipboard.writeText(koboPassword); toast.success('Mot de passe copié'); } catch {}
                        }}>Copier</CopyButton>
                      </span>
                    </KoboRow>
                    <KoboRow>
                      <KoboLabel>Votre identifiant Lokali (pour lier les soumissions)</KoboLabel>
                      <span>
                        <KoboValue>{myLokaliUsername || '—'}</KoboValue>
                        <CopyButton type="button" onClick={() => {
                          const v = myLokaliUsername || '';
                          if (!v) { toast('Identifiant indisponible', { icon: 'ℹ️' }); return; }
                          try { navigator.clipboard.writeText(v); toast.success("Identifiant copié"); } catch {}
                        }}>Copier</CopyButton>
                      </span>
                    </KoboRow>
                    <KoboRow>
                      <KoboLabel>Votre ID Lokali (Supabase)</KoboLabel>
                      <span>
                        <KoboValue>{mySupabaseUserId || '—'}</KoboValue>
                        <CopyButton type="button" onClick={() => {
                          const v = mySupabaseUserId || '';
                          if (!v) { toast('ID indisponible', { icon: 'ℹ️' }); return; }
                          try { navigator.clipboard.writeText(v); toast.success('ID copié'); } catch {}
                        }}>Copier</CopyButton>
                      </span>
                    </KoboRow>
                  </KoboPanel>
                  <div style={{ marginTop: '0.75rem' }}>
                    3) Synchronisez (actualisez les formulaires), puis <strong>téléchargez et ouvrez</strong> le formulaire « Soumettre un prix de produit agricole ».
                  </div>
                  <StatusBox style={{ marginTop: '0.5rem' }}>
                    Dans KoboCollect: Menu principal → « Télécharger un formulaire vierge » → sélectionnez « Soumettre un prix de produit agricole » → Télécharger, puis ouvrez le formulaire pour saisir vos prix.
                  </StatusBox>
                  <StatusBox style={{ marginTop: '0.75rem' }}>
                    Les identifiants affichés <strong>en bas</strong> (identifiant Lokali et ID Lokali) servent à vous <strong>identifier comme contributeur</strong>.
                    Au début du formulaire Kobo, renseignez votre <strong>identifiant Lokali</strong> (<strong>{myLokaliUsername || '—'}</strong>) dans le champ « Nom d'utilisateur » pour lier vos soumissions à votre compte.
                  </StatusBox>
                </div>
              ))
            )}
          </section>
        )}
        {activeMenu === 'my-prices' && (
          <section>
            <SectionTitle>Mes prix soumis</SectionTitle>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
              <SelectField aria-label="Filtrer par statut" value={myPricesStatus} onChange={e => { setMyPricesStatus(e.target.value); setMyPricesOffset(0); }}>
                <option value="all">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="validated">Validés</option>
                <option value="rejected">Rejetés</option>
              </SelectField>
              <div style={{ position: 'relative' }}>
                <FiSearch style={{ position:'absolute', left:8, top:'50%', transform:'translateY(-50%)', color:'#6b7280' }} />
                <input
                  type="search"
                  aria-label="Rechercher"
                  value={myPricesSearch}
                  onChange={e => setMyPricesSearch(e.target.value)}
                  placeholder="Rechercher"
                  style={{ width: 300, padding: '0.5rem 0.75rem', paddingLeft: '2rem', border: '1px solid var(--gray-200)', borderRadius: 8 }}
                />
              </div>
              <button type="button" onClick={() => queryClient.invalidateQueries('agro-my-prices')} disabled={myButtonsBusy} style={{ border: '1px solid var(--gray-200)', background: myButtonsBusy ? 'var(--gray-100)' : 'white', borderRadius: 6, padding: '0.4rem 0.6rem', color: 'var(--gray-700)', display:'inline-flex', alignItems:'center', gap:'0.35rem' }}>
                {myButtonsBusy ? <FiLoader /> : <FiRefreshCcw />} {myButtonsBusy ? 'Chargement…' : 'Actualiser'}
              </button>
              <button
                type="button"
                onClick={() => exportToCSV('mes-prix.csv', [
                  { header: 'Produit', accessor: 'product_name' },
                  { header: 'Catégorie', accessor: 'category_name' },
                  { header: 'Localité', accessor: (p) => p.region_name ? `${p.locality_name} (${p.region_name})` : p.locality_name },
                  { header: 'Unité', accessor: (p) => p.unit_symbol ? `${p.unit_name} (${p.unit_symbol})` : p.unit_name },
                  { header: 'Prix', accessor: 'price' },
                  { header: 'Date', accessor: (p) => p.date ? new Date(p.date).toLocaleDateString('fr-FR') : '' },
                  { header: 'Statut', accessor: 'status' },
                ], visibleMyPrices || [])}
                disabled={myButtonsBusy}
                style={{ padding:'0.4rem 0.6rem', border:'none', borderRadius:6, background: myButtonsBusy ? '#6ee7b7' : '#10b981', color:'#fff', display:'inline-flex', alignItems:'center', gap:'0.35rem' }}
                title="Exporter CSV"
              >
                {myButtonsBusy ? <FiLoader /> : <FiDownload />} {myButtonsBusy ? 'Export…' : 'Export CSV'}
              </button>
              <div style={{ display:'inline-flex', alignItems:'center', gap:'0.35rem', marginLeft:'auto' }}>
                <button
                  type="button"
                  disabled={myPricesOffset === 0 || myButtonsBusy}
                  onClick={() => setMyPricesOffset(prev => Math.max(0, prev - myPricesLimit))}
                  style={{ border: '1px solid var(--gray-200)', background: (myPricesOffset === 0 || myButtonsBusy) ? 'var(--gray-100)' : 'white', borderRadius: 6, padding: '0.35rem 0.5rem', color: 'var(--gray-700)', display:'inline-flex', alignItems:'center' }}
                  aria-label="Précédent"
                  title="Précédent"
                >
                  {myButtonsBusy ? <FiLoader /> : <FiChevronLeft />}
                </button>
                <small style={{ color: 'var(--gray-600)' }}>Page {Math.floor(myPricesOffset / myPricesLimit) + 1}</small>
                <button
                  type="button"
                  disabled={(myPrices.length < myPricesLimit) || myButtonsBusy}
                  onClick={() => setMyPricesOffset(prev => prev + myPricesLimit)}
                  style={{ border: '1px solid var(--gray-200)', background: ((myPrices.length < myPricesLimit) || myButtonsBusy) ? 'var(--gray-100)' : 'white', borderRadius: 6, padding: '0.35rem 0.5rem', color: 'var(--gray-700)', display:'inline-flex', alignItems:'center' }}
                  aria-label="Suivant"
                  title="Suivant"
                >
                  {myButtonsBusy ? <FiLoader /> : <FiChevronRight />}
                </button>
              </div>
            </div>
            {mySelectedIds.length > 0 && (
              <div style={{ padding:'0.5rem', background:'#f9fafb', border:'1px solid var(--gray-200)', borderRadius:8, marginTop:'0.5rem', marginBottom:'0.5rem', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div style={{ color:'var(--gray-700)' }}>{mySelectedIds.length} sélectionné(s)</div>
                <div>
                  <button type="button" onClick={clearMySelection} disabled={myButtonsBusy} style={{ border:'1px solid var(--gray-200)', background: myButtonsBusy ? 'var(--gray-100)' : 'white', borderRadius:6, padding:'0.35rem 0.6rem', color:'var(--gray-700)', marginRight:'0.35rem' }}>{myButtonsBusy ? (<><FiLoader /> Effacement…</>) : 'Effacer la sélection'}</button>
                  <button type="button" onClick={() => setMyBulkDeleteConfirm({ open: true, ids: eligibleSelectedIds })} disabled={eligibleSelectedIds.length === 0 || myButtonsBusy} style={{ border:'1px solid #fecaca', background: myButtonsBusy ? '#fee2e2' : '#fff5f5', borderRadius:6, padding:'0.35rem 0.6rem', color:'#b91c1c' }}>
                    {bulkDeleteMyPricesMutation.isLoading ? <FiLoader /> : <FiTrash />} Supprimer sélection
                  </button>
                </div>
              </div>
            )}
            {isMyPricesLoading ? (
              <StatusBox>Chargement de vos prix…</StatusBox>
            ) : isMyPricesError ? (
              <StatusBox style={{ background: '#fee2e2', color: '#b91c1c', borderColor: '#fecaca' }}>
                {myPricesError?.response?.data?.message || 'Erreur lors du chargement de vos prix'}
              </StatusBox>
            ) : (
              <div>
                <TableWrapper>
                  <Table>
                    <thead>
                      <tr>
                        <TableHeader style={{ width: 36 }}>
                          <input type="checkbox" aria-label="Tout sélectionner" onChange={() => toggleMySelectAll(visibleMyPrices)} checked={visibleMyPrices.length > 0 && visibleMyPrices.every(p => mySelectedIds.includes(p.id))} />
                        </TableHeader>
                        <TableHeader>Produit</TableHeader>
                        <TableHeader>Catégorie</TableHeader>
                        <TableHeader>Localité</TableHeader>
                        <TableHeader>Unité</TableHeader>
                        <TableHeader>Prix</TableHeader>
                        <TableHeader>Date</TableHeader>
                        <TableHeader style={{ width: 140 }}>Statut</TableHeader>
                        <TableHeader>Actions</TableHeader>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleMyPrices.length === 0 ? (
                        <TableRow><TableCell colSpan={9} style={{ color: 'var(--gray-600)' }}>Aucun prix trouvé pour ce filtre.</TableCell></TableRow>
                      ) : visibleMyPrices.map(p => (
                        <TableRow key={p.id}>
                          <TableCell>
                            <input type="checkbox" aria-label={`Sélectionner prix ${p.id}`} checked={mySelectedIds.includes(p.id)} onChange={() => toggleMySelect(p.id)} />
                          </TableCell>
                          <TableCell>{p.product_name}</TableCell>
                          <TableCell>{p.category_name}</TableCell>
                          <TableCell className="cell-wide">{p.locality_name} {p.region_name ? `(${p.region_name})` : ''}</TableCell>
                          <TableCell>{p.unit_name} {p.unit_symbol ? `(${p.unit_symbol})` : ''}</TableCell>
                          <TableCell><strong>{p.price}</strong></TableCell>
                          <TableCell>{p.date ? new Date(p.date).toLocaleDateString('fr-FR') : ''}</TableCell>
                          <TableCell>
                            {getStatusBadge(p.status)}
                          </TableCell>
                          <TableCell className="cell-actions">
                            <div style={{ display: 'inline-flex', gap: '0.3rem' }}>
                              <button
                                type="button"
                                onClick={() => { setMyDetailPrice(p); setMyDetailOpen(true); }}
                                disabled={myButtonsBusy}
                                style={{ border: '1px solid var(--gray-200)', background: myButtonsBusy ? 'var(--gray-100)' : 'white', borderRadius: 6, padding: '0.3rem', color: '#2563eb', cursor: 'pointer', display:'inline-flex', alignItems:'center' }}
                                aria-label="Voir le détail"
                                title="Voir le détail"
                              >
                                {myButtonsBusy ? <FiLoader /> : <FiEye />}
                              </button>
                              {p.status === 'validated' ? (
                                <Link 
                                  to={`/price-map?product_id=${p.product_id}&locality_id=${p.locality_id}${(p.latitude!=null && p.longitude!=null) ? `&lat=${p.latitude}&lng=${p.longitude}&zoom=14` : ''}`}
                                  style={{ background:'transparent', border:'1px solid var(--gray-200)', borderRadius:6, padding:'0.3rem', color:'#10b981', textDecoration:'none', display:'inline-flex', alignItems:'center' }}
                                  aria-label="Voir sur la carte"
                                  title="Voir sur la carte"
                                >
                                  <FiMapPin />
                                </Link>
                              ) : (
                                <span 
                                  style={{ background:'#f9fafb', border:'1px solid var(--gray-200)', borderRadius:6, padding:'0.3rem', color:'#9ca3af', display:'inline-flex', alignItems:'center', cursor:'not-allowed' }}
                                  aria-label="Lien carte indisponible"
                                  title="Lien carte indisponible pour les prix non validés"
                                >
                                  <FiMapPin />
                                </span>
                              )}
                              {p.status === 'pending' && (
                                <button
                                  type="button"
                                  onClick={() => { setMyEditPrice(p); setMyEditOpen(true); }}
                                  disabled={myButtonsBusy}
                                  style={{ border: '1px solid var(--gray-200)', background: myButtonsBusy ? 'var(--gray-100)' : 'white', borderRadius: 6, padding: '0.3rem', color: '#2563eb', cursor: 'pointer', display:'inline-flex', alignItems:'center' }}
                                  aria-label="Modifier"
                                  title="Modifier"
                                >
                                  {myButtonsBusy ? <FiLoader /> : <FiEdit />}
                                </button>
                              )}
                              {(p.status === 'pending' || p.status === 'rejected') && (
                                <button
                                  type="button"
                                  onClick={() => setMyDeleteConfirm({ open: true, price: p })}
                                  disabled={myButtonsBusy}
                                  style={{ border: '1px solid #fecaca', background: myButtonsBusy ? '#fee2e2' : '#fff5f5', borderRadius: 6, padding: '0.3rem', color: '#b91c1c', cursor: 'pointer', display:'inline-flex', alignItems:'center' }}
                                  aria-label="Supprimer"
                                  title="Supprimer ce prix"
                                >
                                  {myButtonsBusy ? <FiLoader /> : <FiTrash />}
                                </button>
                              )}
                            </div>
                          </TableCell>
                      </TableRow>
                      ))}
                    </tbody>
                  </Table>
                </TableWrapper>
                {/* Pagination déjà en haut pour cohérence avec l’admin */}
              </div>
            )}
            {/* Modale de détails (Mon espace → Mes prix) */}
            <Modal
              open={myDetailOpen}
              title="Détails du prix"
              onClose={() => setMyDetailOpen(false)}
              actions={(<>
                <SecondaryButton type="button" onClick={() => setMyDetailOpen(false)}>Fermer</SecondaryButton>
              </>)}
            >
              {!myDetailPrice ? (
                <p style={{ color: 'var(--gray-600)' }}>Aucun prix sélectionné.</p>
              ) : (
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
                  <div>
                    <div style={{ fontWeight:600, color:'var(--gray-800)' }}>Produit</div>
                    <div>{myDetailPrice.product_name}</div>
                    <small style={{ color:'#6b7280' }}>{myDetailPrice.category_name}</small>
                  </div>
                  <div>
                    <div style={{ fontWeight:600, color:'var(--gray-800)' }}>Localité</div>
                    <div>{myDetailPrice.locality_name}{myDetailPrice.region_name ? ` (${myDetailPrice.region_name})` : ''}</div>
                  </div>
                  <div>
                    <div style={{ fontWeight:600, color:'var(--gray-800)' }}>Unité</div>
                    <div>{myDetailPrice.unit_name} {myDetailPrice.unit_symbol}</div>
                  </div>
                  <div>
                    <div style={{ fontWeight:600, color:'var(--gray-800)' }}>Prix</div>
                    <div><strong>{myDetailPrice.price}</strong></div>
                  </div>
                  <div>
                    <div style={{ fontWeight:600, color:'var(--gray-800)' }}>Date</div>
                    <div>{myDetailPrice.date ? new Date(myDetailPrice.date).toLocaleDateString('fr-FR') : ''}</div>
                  </div>
                  <div>
                    <div style={{ fontWeight:600, color:'var(--gray-800)' }}>Statut</div>
                    <div><span style={{ display: 'inline-block', padding: '0.15rem 0.5rem', borderRadius: 999, fontSize: '0.75rem',
                      border: `1px solid ${myDetailPrice.status === 'validated' ? '#c3e6cb' : myDetailPrice.status === 'pending' ? '#fde68a' : '#fecaca'}`,
                      background: `${myDetailPrice.status === 'validated' ? '#d4edda' : myDetailPrice.status === 'pending' ? '#fef3c7' : '#fee2e2'}`,
                      color: `${myDetailPrice.status === 'validated' ? '#155724' : myDetailPrice.status === 'pending' ? '#92400e' : '#b91c1c'}`
                    }}>{myDetailPrice.status}</span></div>
                  </div>
                  {myDetailPrice.comment && (
                    <div style={{ gridColumn:'1 / -1' }}>
                      <div style={{ fontWeight:600, color:'var(--gray-800)' }}>{myDetailPrice.status === 'validated' ? 'Commentaire de validation' : 'Commentaire'}</div>
                      <div style={{ whiteSpace:'pre-wrap' }}>{myDetailPrice.comment}</div>
                    </div>
                  )}
                  <div>
                    <div style={{ fontWeight:600, color:'var(--gray-800)' }}>Source</div>
                    <div>{myDetailPrice.source_type || '—'}{myDetailPrice.source ? ` — ${myDetailPrice.source}` : ''}</div>
                  </div>
                  <div>
                    <div style={{ fontWeight:600, color:'var(--gray-800)' }}>Langue(s)</div>
                    <div>{myDetailPrice.source_languages || '—'}</div>
                  </div>
                  <div>
                    <div style={{ fontWeight:600, color:'var(--gray-800)' }}>Contact source</div>
                    <div>{myDetailPrice.source_contact_name || '—'}{myDetailPrice.source_contact_phone ? ` — ${myDetailPrice.source_contact_phone}` : ''}{myDetailPrice.source_contact_relation ? ` (${myDetailPrice.source_contact_relation})` : ''}</div>
                  </div>
                  <div>
                    <div style={{ fontWeight:600, color:'var(--gray-800)' }}>Coordonnées</div>
                    <div>
                      {(
                        myDetailPrice.latitude != null && myDetailPrice.longitude != null
                      ) ? (
                        `${myDetailPrice.latitude}, ${myDetailPrice.longitude}`
                      ) : (
                        myDetailPrice.locality_latitude != null && myDetailPrice.locality_longitude != null
                          ? `${myDetailPrice.locality_latitude}, ${myDetailPrice.locality_longitude} (localité)`
                          : '—'
                      )}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontWeight:600, color:'var(--gray-800)' }}>Précision GPS</div>
                    <div>{(typeof myDetailPrice.geo_accuracy === 'number' && !Number.isNaN(myDetailPrice.geo_accuracy)) ? `${myDetailPrice.geo_accuracy} m` : '—'}</div>
                  </div>
                  <div>
                    <div style={{ fontWeight:600, color:'var(--gray-800)' }}>Sous-localité</div>
                    <div>{myDetailPrice.sub_locality || '—'}</div>
                  </div>
                  <div>
                    <div style={{ fontWeight:600, color:'var(--gray-800)' }}>Identifiant</div>
                    <div>#{myDetailPrice.id}</div>
                  </div>
                  <div>
                    <div style={{ fontWeight:600, color:'var(--gray-800)' }}>Créé le</div>
                    <div>{myDetailPrice.created_at ? new Date(myDetailPrice.created_at).toLocaleString('fr-FR') : '—'}</div>
                  </div>
                  {myDetailPrice.status === 'rejected' && myDetailPrice.rejection_reason && (
                    <div style={{ gridColumn:'1 / -1' }}>
                      <div style={{ fontWeight:600, color:'var(--gray-800)' }}>Motif du rejet</div>
                      <div style={{ color:'#b91c1c' }}>{myDetailPrice.rejection_reason}</div>
                    </div>
                  )}
                </div>
              )}
            </Modal>
            <ConfirmModal
              open={accuracyConfirm.open}
              title="Précision GPS élevée"
              message="La précision indiquée dépasse 10 m. Voulez-vous enregistrer malgré tout ?"
              confirmText={updateMyPriceMutation.isLoading ? 'Enregistrement…' : 'Oui, enregistrer'}
              cancelText="Annuler"
              onConfirm={() => {
                const payload = accuracyConfirm.payload;
                setAccuracyConfirm({ open: false, payload: null });
                if (!payload) return;
                updateMyPriceMutation.mutate({ id: myEditPrice.id, data: payload });
              }}
              onCancel={() => setAccuracyConfirm({ open: false, payload: null })}
            />
            <ConfirmModal
              open={myBulkDeleteConfirm.open}
              title="Supprimer ces prix ?"
              message={`Cette action supprimera définitivement ${myBulkDeleteConfirm.ids.length} prix (en attente ou rejetés).`}
              confirmText={bulkDeleteMyPricesMutation.isLoading ? 'Suppression…' : 'Oui, supprimer'}
              cancelText="Annuler"
              onConfirm={() => {
                const ids = myBulkDeleteConfirm.ids || [];
                setMyBulkDeleteConfirm({ open: false, ids: [] });
                if (ids.length === 0) return;
                bulkDeleteMyPricesMutation.mutate(ids);
              }}
              onCancel={() => setMyBulkDeleteConfirm({ open: false, ids: [] })}
            />
            <ConfirmModal
              open={myDeleteConfirm.open}
              title="Supprimer ce prix ?"
              message={(() => {
                const s = myDeleteConfirm.price?.status;
                const label = s === 'pending' ? 'en attente' : s === 'rejected' ? 'rejeté' : s || '';
                return `Cette action supprimera définitivement votre prix (${label}).`;
              })()}
              confirmText={deleteMyPriceMutation.isLoading ? 'Suppression…' : 'Oui, supprimer'}
              cancelText="Annuler"
              busy={deleteMyPriceMutation.isLoading}
              onConfirm={() => {
                const id = myDeleteConfirm.price?.id;
                if (!id) { setMyDeleteConfirm({ open:false, price:null }); return; }
                deleteMyPriceMutation.mutate(id);
              }}
              onCancel={() => setMyDeleteConfirm({ open:false, price:null })}
            />
            <FormModal
              open={myEditOpen}
              title="Modifier mon prix"
              fields={myEditFields}
              submitText={updateMyPriceMutation.isLoading ? 'Enregistrement…' : 'Enregistrer'}
              cancelText="Annuler"
              onSubmit={handleMyEditSubmit}
              onCancel={() => { setMyEditOpen(false); setMyEditPrice(null); }}
              renderExtras={(values, setValues) => (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.5rem', alignItems: 'center' }}>
                  <small style={{ color: 'var(--gray-600)' }}>
                    Astuce: utilisez votre position pour mettre à jour automatiquement la latitude, la longitude,
                    la précision et la localité la plus proche.
                  </small>
                  <button
                    type="button"
                    style={{ padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid var(--gray-200)', background: myGeoBusy ? '#e5e7eb' : 'var(--gray-50)', color: 'var(--gray-800)', opacity: myGeoBusy ? 0.7 : 1 }}
                    disabled={myGeoBusy}
                    aria-busy={myGeoBusy}
                    onClick={async () => {
                      try {
                        setMyGeoBusy(true);
                        let lat = parseFloat(values.latitude);
                        let lon = parseFloat(values.longitude);
                        let accVal = (values.geo_accuracy !== '' && values.geo_accuracy != null) ? parseFloat(values.geo_accuracy) : null;
                        const tryGeo = !!navigator.geolocation;
                        if (tryGeo) {
                          await new Promise((resolve, reject) => {
                            navigator.geolocation.getCurrentPosition(
                              (pos) => {
                                lat = pos.coords.latitude;
                                lon = pos.coords.longitude;
                                accVal = pos.coords.accuracy;
                                resolve();
                              },
                              (err) => reject(err),
                              { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
                            );
                          });
                        }
                        if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
                          toast.error("Position indisponible: renseignez Latitude/Longitude ou autorisez la localisation");
                          return;
                        }
                        // Trouver la localité la plus proche
                        let nearest = null;
                        let best = Infinity;
                        for (const loc of localityCoords || []) {
                          const la = parseFloat(loc.latitude);
                          const lo = parseFloat(loc.longitude);
                          if (!Number.isFinite(la) || !Number.isFinite(lo)) continue;
                          const d = haversineMeters(lat, lon, la, lo);
                          if (d < best) { best = d; nearest = loc; }
                        }
                        const next = { ...values };
                        next.latitude = Number(lat);
                        next.longitude = Number(lon);
                        next.geo_accuracy = accVal != null && Number.isFinite(accVal) ? Number(accVal) : values.geo_accuracy;
                        if (nearest && nearest.id != null) {
                          next.locality_id = String(nearest.id);
                        } else {
                          toast('Localité non mise à jour: aucune correspondance avec coordonnées', { icon: 'ℹ️' });
                        }
                        setValues(next);
                      } catch (err) {
                        console.error('Auto-localisation error:', err);
                        toast.error("Impossible d'obtenir la position. Vérifiez les permissions.");
                      } finally {
                        setMyGeoBusy(false);
                      }
                    }}
                  >
                    {myGeoBusy ? 'Mise à jour…' : 'Mise à jour auto de la localisation'}
                  </button>
                </div>
              )}
            />
          </section>
        )}
      </Content>
    </DashboardContainer>
  );
};

export default Dashboard;
