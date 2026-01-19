import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { adminService, settingsService, productCategoryService, productService, languageService, authService, filterOptionsService, unitService, agriculturalPriceService, seoService, localityService } from '../services/api';
import { useSeo } from '../contexts/SeoContext';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmModal from '../components/ConfirmModal';
import PromptModal from '../components/PromptModal';
import FormModal from '../components/FormModal';
import Modal, { SecondaryButton } from '../components/Modal';
import styled, { keyframes } from 'styled-components';
import { FiUsers, FiDollarSign, FiPackage, FiMapPin, FiCheck, FiX, FiEye, FiHome, FiClipboard, FiUser, FiPlusCircle, FiMinusCircle, FiInfo, FiTrash, FiUserX, FiCheckSquare, FiSquare, FiRefreshCcw, FiChevronLeft, FiChevronRight, FiSearch, FiLoader, FiSettings, FiDownload, FiEdit } from 'react-icons/fi';
import { exportToCSV } from '../utils/csv';
import toast from 'react-hot-toast';

// Format compact pour les grands nombres (à partir de 10K)
const formatCompactCount = (value) => {
  const v = Number(value) || 0;
  if (v >= 1000000) return `${Math.round(v / 1000000)}M`;
  if (v >= 10000) return `${Math.round(v / 1000)}K`;
  return new Intl.NumberFormat('fr-FR').format(v);
};

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

// Champs pour l'édition des paramètres Kobo
const FormRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  margin-bottom: 0.75rem;
`;

const InputText = styled.input`
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

const SelectControl = styled.select`
  padding: 0.35rem 0.6rem;
  border: 1px solid var(--gray-200);
  border-radius: 8px;
  background: white;
  color: var(--gray-800);
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  min-width: 160px;
  &:focus {
    border-color: #93c5fd;
    box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
  }
  &:disabled {
    background: #f9fafb;
    color: #9ca3af;
    cursor: not-allowed;
  }
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
  /* Basculer en layout block sur mobile pour autoriser grid/flex sur les lignes */
  @media (max-width: 640px) {
    display: block;
  }

  /* Cacher l'entête sur mobile et rendre le tbody block */
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

  /* Comportement en mode mobile (grid) */
  @media (max-width: 640px) {
    grid-column: auto;
    box-sizing: border-box;
    min-width: 0; /* permet au contenu de réduire sans débordement */
    line-height: 1.35;
    min-height: 44px; /* cible de toucher confortable */
  }

  &.cell-actions {
    @media (max-width: 640px) {
      /* La cellule d'actions s'étend sur toute la ligne */
      grid-column: 1 / -1;
    }
  }

  /* Permet à certaines cellules marquées d'occuper toute la largeur en mobile */
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

  /* Sur mobile, utiliser un layout grid 2 colonnes */
  @media (max-width: 640px) {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
    align-items: start;
    padding: 8px 0;
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
  margin-bottom: 0.4rem; /* espace vertical quand les boutons se superposent */
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

// Effet de rotation pour les icônes de chargement
const spinAnim = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const SpinnerIcon = styled(FiLoader)`
  animation: ${spinAnim} 1s linear infinite;
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
  const { refresh } = useSeo();

  // Fallback: récupérer le rôle local via /auth/profile (si les rôles n'ont pas été chargés)
  const { data: profileResp, isLoading: profileLoading } = useQuery(
    ['auth-profile'],
    () => authService.getProfile().then(r => r?.data?.data || null),
    { staleTime: 30_000 }
  );
  const profileRole = profileResp?.role || null;
  const roleSource = (user?.app_metadata && user.app_metadata.role)
    || (user?.user_metadata && user.user_metadata.role)
    || user?.role
    || null;
  const isAdmin = hasRole('admin') || hasRole('super_admin')
    || profileRole === 'admin' || profileRole === 'super_admin'
    || roleSource === 'admin' || roleSource === 'super_admin';
  const isSuperAdmin = hasRole('super_admin')
    || profileRole === 'super_admin'
    || roleSource === 'super_admin';
  // Global confirm/prompt modals (hooks must be declared unconditionally)
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [confirmConfig, setConfirmConfig] = React.useState({ title: 'Confirmer', message: '', onConfirm: null, confirmText: 'Confirmer', cancelText: 'Annuler' });
  const [confirmContext, setConfirmContext] = React.useState(null);
  const openConfirm = (title, message, onConfirm, confirmText = 'Confirmer', cancelText = 'Annuler') => {
    setConfirmConfig({ title, message, onConfirm, confirmText, cancelText });
    setConfirmOpen(true);
  };
  const closeConfirm = () => { setConfirmOpen(false); setConfirmConfig({ title: 'Confirmer', message: '', onConfirm: null, confirmText: 'Confirmer', cancelText: 'Annuler' }); setConfirmContext(null); };

  const [promptOpen, setPromptOpen] = React.useState(false);
  const [promptConfig, setPromptConfig] = React.useState({ title: 'Saisie', label: 'Valeur', placeholder: '', defaultValue: '', multiline: false, required: false, submitText: 'Valider', cancelText: 'Annuler', onSubmit: null });
  const [promptContext, setPromptContext] = React.useState(null);
  const openPrompt = (cfg) => { setPromptConfig(cfg); setPromptOpen(true); };
  const closePrompt = () => { setPromptOpen(false); setPromptConfig({ title: 'Saisie', label: 'Valeur', placeholder: '', defaultValue: '', multiline: false, required: false, submitText: 'Valider', cancelText: 'Annuler', onSubmit: null }); setPromptContext(null); };
  // Menu latéral: élément actif
  const [activeMenu, setActiveMenu] = React.useState('stats');
  React.useEffect(() => {
    const fromHash = (window.location.hash || '').replace('#', '');
    if (fromHash) setActiveMenu(fromHash);
  }, []);
  const handleMenuClick = (key) => (e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    setActiveMenu(key);
    try { window.location.hash = key; } catch {}
  };

  // XLSForm generation state and handler (super admin)
  const [xlsGenerating, setXlsGenerating] = React.useState(false);
  const handleGenerateXLS = async () => {
    try {
      setXlsGenerating(true);
      const res = await adminService.generateKoboXlsForm({ format: 'xlsx' });
      const blob = (res && res.data) ? res.data : res;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'kobo_price_submission.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('XLSForm généré et téléchargé');
    } catch (err) {
      console.error('Failed to generate XLSForm', err);
      toast.error("Échec de génération de l'XLSForm Kobo");
    } finally {
      setXlsGenerating(false);
    }
  };

  // Récupérer les données du tableau de bord
  const { data: dashboardData, isLoading: loadingDashboard, isFetching: fetchingDashboard, refetch: refetchDashboard } = useQuery(
    'admin-dashboard',
    adminService.getDashboard,
    {
      // Sélection robuste: accepte plusieurs formes possibles
      // - { data: { data: {...} } }
      // - { data: {...} }
      // - { ... }
      select: (response) => (
        (response && response.data && (response.data.data || response.data))
        || response
        || null
      ),
      enabled: !!isAdmin && (activeMenu === 'stats' || activeMenu === 'recent'),
      // Rafraîchir pour éviter des valeurs obsolètes et s'assurer que les comptes sont à jour
      keepPreviousData: false,
      staleTime: 0,
      cacheTime: 0,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: true,
      refetchInterval: 30000,
      refetchIntervalInBackground: true
    }
  );
  // Utilitaires de lecture robuste des stats et fallbacks
  const pickNumber = React.useCallback((obj, path) => {
    try {
      const parts = Array.isArray(path) ? path : String(path).split('.');
      let cur = obj;
      for (const p of parts) {
        if (!cur || typeof cur !== 'object') return null;
        cur = cur[p];
      }
      const n = Number(cur);
      return Number.isFinite(n) ? n : null;
    } catch {
      return null;
    }
  }, []);

  const getStat = React.useCallback((primaryPaths = [], fallbackValue = 0) => {
    for (const path of primaryPaths) {
      const v = pickNumber(dashboardData, path);
      if (v !== null) return v;
    }
    return fallbackValue;
  }, [dashboardData, pickNumber]);
  // Etats pour prix récents (client-side pagination & recherche)
  const [recentLimit] = React.useState(20);
  const [recentPage, setRecentPage] = React.useState(1);
  const recentOffset = (recentPage - 1) * recentLimit;
  const [recentSearch, setRecentSearch] = React.useState('');
  const recentPrices = React.useMemo(() => dashboardData?.recentPrices || [], [dashboardData]);
  const visibleRecent = React.useMemo(() => {
    const term = recentSearch.trim().toLowerCase();
    if (!term) return recentPrices || [];
    return (recentPrices || []).filter((p) => (
      (p.product_name || '').toLowerCase().includes(term) ||
      (p.locality_name || '').toLowerCase().includes(term) ||
      (String(p.price || '')).toLowerCase().includes(term) ||
      (p.status || '').toLowerCase().includes(term)
    ));
  }, [recentPrices, recentSearch]);
  const pageRecent = React.useMemo(() => (
    (visibleRecent || []).slice(recentOffset, recentOffset + recentLimit)
  ), [visibleRecent, recentOffset, recentLimit]);
  React.useEffect(() => { setRecentPage(1); }, [recentSearch]);

  // Etats pagination/filtre pour prix en attente
  const [pendingLimit] = React.useState(20);
  const [pendingPage, setPendingPage] = React.useState(1);
  const pendingOffset = (pendingPage - 1) * pendingLimit;
  const [pendingSearch, setPendingSearch] = React.useState('');
  // Récupérer les prix en attente
  const { data: pendingPrices = [], isLoading: loadingPending, isFetching: fetchingPending, refetch: refetchPending } = useQuery(
    'pending-prices',
    () => adminService.getPendingPrices({ limit: pendingLimit, offset: pendingOffset }),
    {
      select: (response) => response?.data?.data || [],
      enabled: !!isAdmin && activeMenu === 'pending',
      refetchOnMount: true,
      refetchInterval: 30000,
      refetchIntervalInBackground: true
    }
  );
  const visiblePending = React.useMemo(() => {
    const term = pendingSearch.trim().toLowerCase();
    if (!term) return pendingPrices || [];
    return (pendingPrices || []).filter((p) => (
      (p.product_name || '').toLowerCase().includes(term) ||
      (p.category_name || '').toLowerCase().includes(term) ||
      (p.locality_name || '').toLowerCase().includes(term) ||
      (String(p.price || '')).toLowerCase().includes(term) ||
      (p.unit_symbol || '').toLowerCase().includes(term) ||
      (p.status || '').toLowerCase().includes(term)
    ));
  }, [pendingPrices, pendingSearch]);
  React.useEffect(() => { setPendingPage(1); }, [pendingSearch]);

  // Options pour édition (produits, localités, unités)
  const { data: productOpts = [] } = useQuery(
    'filter-products',
    () => filterOptionsService.getProducts(),
    { select: (r) => r?.data?.data || [] }
  );
  const { data: localityOpts = [] } = useQuery(
    'filter-localities',
    () => filterOptionsService.getLocalities(),
    { select: (r) => r?.data?.data || [] }
  );
  // Anciennes requêtes de catégories non utilisées supprimées
  const { data: regionOpts = [] } = useQuery(
    'filter-regions',
    () => filterOptionsService.getRegions(),
    { select: (r) => r?.data?.data || [] }
  );
  const { data: units = [] } = useQuery(
    'units',
    () => unitService.getAll(),
    { select: (r) => r?.data?.data || [] }
  );
  const { data: languages = [] } = useQuery(
    'admin-languages-options',
    () => languageService.getAll().then((r) => r?.data?.data || r?.data || []),
    { staleTime: 60_000 }
  );
  const productOptions = React.useMemo(() => (productOpts || []).map(o => ({ value: o.product_id, label: o.display_name })), [productOpts]);
  const localityOptions = React.useMemo(() => (localityOpts || []).map(o => ({ value: o.locality_id, label: o.display_name })), [localityOpts]);
  const unitOptions = React.useMemo(() => (units || []).map(u => ({ value: u.id, label: u.symbol ? `${u.name} (${u.symbol})` : u.name })), [units]);
  const languageOptions = React.useMemo(() => (languages || []).map(l => ({ value: l.id, label: l.name })), [languages]);

  // Edition d'un prix en attente
  const [editOpen, setEditOpen] = React.useState(false);
  const [editPrice, setEditPrice] = React.useState(null);
  const updatePendingMutation = useMutation(
    ({ id, data }) => agriculturalPriceService.update(id, data),
    {
      onSuccess: () => {
        toast.success('Prix mis à jour');
        queryClient.invalidateQueries('pending-prices');
        queryClient.invalidateQueries('admin-dashboard');
        setEditOpen(false);
        setEditPrice(null);
      },
      onError: (err) => {
        const msg = err?.response?.data?.message || 'Erreur lors de la mise à jour';
        toast.error(msg);
      }
    }
  );
  const editFields = React.useMemo(() => {
    if (!editPrice) return [];
    const ensureOption = (opts, value, label) => {
      if (value === undefined || value === null) return opts || [];
      const arr = opts || [];
      const exists = arr.some(o => String(o.value) === String(value));
      if (exists) return arr;
      return [{ value, label: label || String(value) }, ...arr];
    };
    const effectiveProductOptions = ensureOption(
      productOptions,
      editPrice.product_id,
      editPrice.product_name
    );
    const effectiveLocalityOptions = ensureOption(
      localityOptions,
      editPrice.locality_id,
      editPrice.locality_name
    );
    const effectiveUnitOptions = ensureOption(
      unitOptions,
      editPrice.unit_id,
      editPrice.unit_name
        ? (editPrice.unit_symbol ? `${editPrice.unit_name} (${editPrice.unit_symbol})` : editPrice.unit_name)
        : undefined
    );
    const baseSourceTypeOptions = [
      { value: '', label: 'Type de source' },
      { value: 'producteur', label: 'Producteur' },
      { value: 'cooperative', label: 'Coopérative' },
      { value: 'transformateur', label: 'Transformateur' },
      { value: 'grossiste', label: 'Grossiste' },
      { value: 'commercant', label: 'Commerçant' },
      { value: 'autre', label: 'Autre' }
    ];
    const sourceTypeOptions = editPrice.source_type && !baseSourceTypeOptions.some(o => o.value === editPrice.source_type)
      ? [...baseSourceTypeOptions, { value: editPrice.source_type, label: editPrice.source_type }]
      : baseSourceTypeOptions;
    const baseRelationOptions = [
      { value: '', label: 'Lien du contact (optionnel)' },
      { value: 'moi', label: 'Moi' },
      { value: 'proche', label: 'Proche' },
      { value: 'autre', label: 'Autre' }
    ];
    const relationOptions = editPrice.source_contact_relation && !baseRelationOptions.some(o => o.value === editPrice.source_contact_relation)
      ? [...baseRelationOptions, { value: editPrice.source_contact_relation, label: editPrice.source_contact_relation }]
      : baseRelationOptions;
    let sourceLanguageDefault = '';
    if (editPrice.source_language_id) {
      sourceLanguageDefault = editPrice.source_language_id;
    } else if (editPrice.source_languages && Array.isArray(languageOptions) && languageOptions.length > 0) {
      const names = String(editPrice.source_languages)
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      for (const name of names) {
        const match = languageOptions.find(l => String(l.label).toLowerCase() === name.toLowerCase());
        if (match) {
          sourceLanguageDefault = match.value;
          break;
        }
      }
    }
    return [
      { name: 'product_id', label: 'Produit', type: 'select', required: true, options: effectiveProductOptions, defaultValue: editPrice.product_id },
      { name: 'locality_id', label: 'Localité', type: 'select', required: true, options: effectiveLocalityOptions, defaultValue: editPrice.locality_id },
      { name: 'unit_id', label: 'Unité', type: 'select', required: true, options: effectiveUnitOptions, defaultValue: editPrice.unit_id },
      { name: 'price', label: 'Prix', type: 'number', required: true, defaultValue: editPrice.price },
      { name: 'date', label: 'Date (YYYY-MM-DD)', type: 'text', required: true, defaultValue: (editPrice.date || '').slice(0, 10) },
      { name: 'sub_locality', label: 'Sous-localité', type: 'text', defaultValue: editPrice.sub_locality || '' },
      { name: 'latitude', label: 'Latitude', type: 'number', defaultValue: editPrice.latitude ?? '' },
      { name: 'longitude', label: 'Longitude', type: 'number', defaultValue: editPrice.longitude ?? '' },
      { name: 'geo_accuracy', label: 'Précision GPS (m)', type: 'number', defaultValue: editPrice.geo_accuracy ?? '' },
      { name: 'comment', label: 'Commentaire', type: 'textarea', defaultValue: editPrice.comment || '' },
      { name: 'source_type', label: 'Type de source', type: 'select', defaultValue: editPrice.source_type || '', options: sourceTypeOptions },
      { name: 'source', label: 'Source', type: 'text', defaultValue: editPrice.source || '' },
      { name: 'source_contact_name', label: 'Nom du contact', type: 'text', defaultValue: editPrice.source_contact_name || '' },
      { name: 'source_contact_phone', label: 'Téléphone du contact', type: 'text', defaultValue: editPrice.source_contact_phone || '' },
      { name: 'source_contact_relation', label: 'Relation du contact', type: 'select', defaultValue: editPrice.source_contact_relation || '', options: relationOptions },
      { name: 'source_language_id', label: 'Langue de communication', type: 'select', defaultValue: sourceLanguageDefault || '', options: [
        { value: '', label: 'Sélectionner une langue (optionnel)' },
        ...languageOptions
      ] }
    ];
  }, [editPrice, productOptions, localityOptions, unitOptions, languageOptions]);
  const handleEditSubmit = (values) => {
    if (!editPrice) return;
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
    updatePendingMutation.mutate({ id: editPrice.id, data: payload });
  };

  // Modale de détails pour prix (lecture dans l'espace admin, états non validés inclus)
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [detailPrice, setDetailPrice] = React.useState(null);

  // Lecture des offres (lecture seule pour admins et super-admins)
  const [offersLimit] = React.useState(20);
  const [offersPage, setOffersPage] = React.useState(1);
  const offersOffset = (offersPage - 1) * offersLimit;
  const [offersSearch, setOffersSearch] = React.useState('');
  const { data: offers = [], isLoading: loadingOffers, isFetching: fetchingOffers, refetch: refetchOffers } = useQuery(
    'admin-offers',
    () => adminService.getOffers({ limit: offersLimit, offset: offersOffset }),
    {
      select: (response) => response?.data?.data || [],
      enabled: !!isAdmin && activeMenu === 'offers',
      refetchOnMount: true,
      refetchInterval: 30000,
      refetchIntervalInBackground: true
    }
  );
  const visibleOffers = React.useMemo(() => {
    const term = offersSearch.trim().toLowerCase();
    if (!term) return offers || [];
    return (offers || []).filter((o) => (
      (o.name || '').toLowerCase().includes(term) ||
      (o.description || '').toLowerCase().includes(term) ||
      (String(o.price || '')).toLowerCase().includes(term) ||
      (o.currency || '').toLowerCase().includes(term) ||
      (o.period || '').toLowerCase().includes(term) ||
      ((o.is_active ? 'oui' : 'non')).includes(term)
    ));
  }, [offers, offersSearch]);
  React.useEffect(() => { setOffersPage(1); }, [offersSearch]);

  // Mutation pour valider un prix
  const validatePriceMutation = useMutation(
    ({ priceId, comment }) => adminService.validatePrice(priceId, { comment }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('pending-prices');
        queryClient.invalidateQueries('admin-dashboard');
        try { toast.success('Prix validé'); } catch {}
        try { closePrompt(); } catch {}
      },
      onError: (err) => {
        const msg = err?.response?.data?.message || 'Erreur lors de la validation du prix';
        try { toast.error(msg); } catch {}
      }
    }
  );

  // Mutation pour rejeter un prix
  const rejectPriceMutation = useMutation(
    ({ priceId, rejection_reason }) => adminService.rejectPrice(priceId, { rejection_reason }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('pending-prices');
        queryClient.invalidateQueries('admin-dashboard');
        try { toast.success('Prix rejeté'); } catch {}
        try { closePrompt(); } catch {}
      },
      onError: (err) => {
        const msg = err?.response?.data?.message || 'Erreur lors du rejet du prix';
        try { toast.error(msg); } catch {}
      }
    }
  );

  // Compteurs additionnels (fallback) retirés car non utilisés
  // Sélection multiple pour prix en attente
  const [pendingSelectedIds, setPendingSelectedIds] = React.useState([]);
  const togglePendingSelect = (id) => {
    setPendingSelectedIds((prev) => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  const clearPendingSelection = () => setPendingSelectedIds([]);
  const togglePendingSelectAll = (visible) => {
    const ids = (visible || []).map(p => p.id).filter(Boolean);
    setPendingSelectedIds((prev) => prev.length === ids.length ? [] : ids);
  };

  // Actions groupées: valider / rejeter
  const handleBulkPendingValidate = () => {
    if (pendingSelectedIds.length === 0) return;
    openPrompt({
      title: 'Valider la sélection',
      label: 'Commentaire (optionnel) pour la validation',
      placeholder: 'Ajoutez un commentaire (facultatif)…',
      defaultValue: '',
      multiline: true,
      required: false,
      submitText: 'Valider',
      cancelText: 'Annuler',
      onSubmit: async (comment) => {
        closePrompt();
        try {
          const results = await Promise.allSettled(
            pendingSelectedIds.map((id) => adminService.validatePrice(id, { comment: comment || '' }))
          );
          const ok = results.filter(r => r.status === 'fulfilled').length;
          const ko = results.length - ok;
          if (ok > 0) toast.success(`${ok} prix validé(s)`);
          if (ko > 0) toast.error(`${ko} échec(s) de validation`);
          queryClient.invalidateQueries('pending-prices');
          queryClient.invalidateQueries('admin-dashboard');
        } catch (err) {
          const msg = err?.response?.data?.message || 'Erreur lors de la validation groupée';
          toast.error(msg);
        } finally {
          clearPendingSelection();
        }
      }
    });
  };

  const handleBulkPendingReject = () => {
    if (pendingSelectedIds.length === 0) return;
    openPrompt({
      title: 'Rejeter la sélection',
      label: 'Raison du rejet (obligatoire)',
      placeholder: 'Expliquez la raison du rejet…',
      defaultValue: '',
      multiline: true,
      required: true,
      submitText: 'Rejeter',
      cancelText: 'Annuler',
      onSubmit: async (reason) => {
        closePrompt();
        try {
          const results = await Promise.allSettled(
            pendingSelectedIds.map((id) => adminService.rejectPrice(id, { rejection_reason: reason }))
          );
          const ok = results.filter(r => r.status === 'fulfilled').length;
          const ko = results.length - ok;
          if (ok > 0) toast.success(`${ok} prix rejeté(s)`);
          if (ko > 0) toast.error(`${ko} échec(s) de rejet`);
          queryClient.invalidateQueries('pending-prices');
          queryClient.invalidateQueries('admin-dashboard');
        } catch (err) {
          const msg = err?.response?.data?.message || 'Erreur lors du rejet groupé';
          toast.error(msg);
        } finally {
          clearPendingSelection();
        }
      }
    });
  };

  // Paramètres Kobo: chargement et édition (URL + identifiant)
  const { data: koboSettings, isLoading: loadingKoboSettings } = useQuery(
    'kobo-settings',
    () => settingsService.getKoboSettings().then((r) => r?.data?.data || null),
    { enabled: !!isSuperAdmin }
  );
  const [serverUrl, setServerUrl] = React.useState('');
  const [koboUsername, setKoboUsername] = React.useState('');
  const [koboPassword, setKoboPassword] = React.useState('');
  React.useEffect(() => {
    const fallbackUrl = process.env.REACT_APP_KOBO_SERVER_URL || 'https://kc.kobotoolbox.org';
    setServerUrl(koboSettings?.server_url || fallbackUrl);
    setKoboUsername(koboSettings?.username || '');
    setKoboPassword(koboSettings?.password || '');
  }, [koboSettings]);
  const updateKoboMutation = useMutation(
    (payload) => settingsService.updateKoboSettings(payload),
    {
      onSuccess: () => {
        toast.success('Paramètres Kobo mis à jour');
        queryClient.invalidateQueries('kobo-settings');
      },
      onError: (err) => {
        const msg = err?.response?.data?.message || 'Erreur mise à jour paramètres';
        toast.error(msg);
      }
    }
  );

  // Demandes de contribution (en attente) avec pagination et recherche
  const [requestsLimit] = React.useState(20);
  const [requestsPage, setRequestsPage] = React.useState(1);
  const requestsOffset = (requestsPage - 1) * requestsLimit;
  const [requestsSearch, setRequestsSearch] = React.useState('');
  const { data: contributionRequests, isLoading: loadingContribs, isFetching: fetchingContribs, refetch: refetchContribs } = useQuery(
    'admin-contributions',
    () => adminService.getContributionRequests({ status: 'pending', limit: requestsLimit, offset: requestsOffset }),
    {
      select: (response) => response.data.data,
      enabled: !!isAdmin
    }
  );

  // Liste des utilisateurs (lecture) avec pagination et recherche
  const [usersLimit] = React.useState(20);
  const [usersPage, setUsersPage] = React.useState(1);
  const usersOffset = (usersPage - 1) * usersLimit;
  const [usersSearch, setUsersSearch] = React.useState('');
  const { data: users, isLoading: loadingUsers, isFetching: fetchingUsers, refetch: refetchUsers } = useQuery(
    'admin-users',
    () => adminService.getUsers({ limit: usersLimit, offset: usersOffset }),
    {
      select: (response) => response.data.data,
      enabled: !!isAdmin
    }
  );

  // Contributeurs (acceptés) – inclure ceux sans activité, avec pagination et recherche
  const [contributorsLimit] = React.useState(20);
  const [contributorsPage, setContributorsPage] = React.useState(1);
  const contributorsOffset = (contributorsPage - 1) * contributorsLimit;
  const [contributorsSearch, setContributorsSearch] = React.useState('');
  const { data: contributors, isLoading: loadingContributors, isFetching: fetchingContributors, error: contributorsError, refetch: refetchContributors } = useQuery(
    'admin-contributors',
    () => adminService.getContributors({ limit: contributorsLimit, offset: contributorsOffset }),
    {
      select: (response) => response.data.data,
      enabled: !!isAdmin,
      // Forcer une actualisation plus fréquente pour éviter le besoin de recharger
      staleTime: 0,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchInterval: 20000,
      refetchIntervalInBackground: true,
      retry: 2,
      onError: (err) => {
        const msg = err?.response?.data?.message || 'Erreur de récupération des contributeurs';
        try { toast.error(msg); } catch {}
      }
    }
  );

  // Quand on ouvre l’onglet Contributeurs, relancer la requête
  React.useEffect(() => {
    if (activeMenu === 'contributors') {
      refetchContributors();
    }
  }, [activeMenu, refetchContributors]);

  // Rafraîchissement automatique des listes selon onglet actif et pagination
  React.useEffect(() => {
    if (activeMenu === 'users') {
      refetchUsers();
    }
  }, [activeMenu, usersLimit, usersOffset, refetchUsers]);

  React.useEffect(() => {
    if (activeMenu === 'requests') {
      refetchContribs();
    }
  }, [activeMenu, requestsLimit, requestsOffset, refetchContribs]);

  // États pour la gestion SEO
  const [seoSettings, setSeoSettings] = React.useState({
    site_title: '',
    site_description: '',
    site_keywords: '',
    home_title: '',
    home_description: '',
    home_keywords: '',
    prices_title: '',
    prices_description: '',
    prices_keywords: '',
    about_title: '',
    about_description: '',
    about_keywords: ''
  });
  const [seoLoading, setSeoLoading] = React.useState(false);

  // Charger les paramètres SEO
  useQuery(
    'admin-seo-settings',
    () => seoService.getSettings().then((r) => r?.data?.data || {}),
    { 
      enabled: !!isAdmin,
      onSuccess: (data) => {
        if (data) {
          setSeoSettings(prev => ({ ...prev, ...data }));
        }
      }
    }
  );

  // Mutation pour sauvegarder les paramètres SEO
  const updateSeoMutation = useMutation(
    (settings) => seoService.updateSettings(settings),
    {
      onSuccess: () => {
        toast.success('Paramètres SEO mis à jour');
        queryClient.invalidateQueries('admin-seo-settings');
      },
      onError: (err) => {
        const msg = err?.response?.data?.message || 'Erreur lors de la mise à jour des paramètres SEO';
        toast.error(msg);
      }
    }
  );

  // Fonction pour sauvegarder les paramètres SEO
  const handleSeoSave = async () => {
    setSeoLoading(true);
    try {
      await updateSeoMutation.mutateAsync(seoSettings);
      // Rafraîchir le contexte SEO pour mettre à jour le titre/meta sans rechargement
      await refresh();
    } catch (error) {
      // Erreur SEO gérée silencieusement
    } finally {
      setSeoLoading(false);
    }
  };

  // Listes visibles (recherche côté client)
  const visibleUsers = React.useMemo(() => {
    const term = usersSearch.trim().toLowerCase();
    return (users || [])
      .filter(u => !((u.roles || []).includes('super_admin')))
      .filter((u) => {
        if (!term) return true;
        const hay = [u.display_name, u.first_name, u.last_name, u.username, u.email]
          .map((s) => (s || '').toString().toLowerCase())
          .join(' ');
        return hay.includes(term);
      });
  }, [users, usersSearch]);

  const visibleRequests = React.useMemo(() => {
    const term = requestsSearch.trim().toLowerCase();
    return (contributionRequests || []).filter((req) => {
      if (!term) return true;
      const hay = [
        req.display_name,
        req.first_name,
        req.last_name,
        req.username,
        req.email,
        req.commune,
        req.cooperative_name
      ].map((s) => (s || '').toString().toLowerCase()).join(' ');
      return hay.includes(term);
    });
  }, [contributionRequests, requestsSearch]);

  const visibleContributors = React.useMemo(() => {
    const term = contributorsSearch.trim().toLowerCase();
    // Le serveur renvoie déjà uniquement les utilisateurs ayant le rôle contributeur
    // On applique simplement l'exclusion super_admin (déjà faite côté serveur) et la recherche locale
    return (contributors || [])
      .filter((c) => {
        if (!term) return true;
        const hay = [c.display_name, c.username, c.email]
          .map((s) => (s || '').toString().toLowerCase())
          .join(' ');
        return hay.includes(term);
      });
  }, [contributors, contributorsSearch]);

  // Gestion des rôles (super-admin)
  const [roleSelection, setRoleSelection] = React.useState({});

  // Rôles disponibles (liste statique côté client pour simplicité)
  // Autoriser l’attribution du rôle de base "user" et des rôles admin
  const availableRoles = isSuperAdmin ? ['user', 'admin', 'super_admin'] : [];

  const addRoleMutation = useMutation(
    ({ userId, role }) => adminService.addUserRole(userId, role),
    { 
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries('admin-users');
        try {
          const r = variables?.role ? `Rôle "${variables.role}" ajouté` : 'Rôle ajouté';
          toast.success(r);
        } catch {}
        try { closeConfirm(); } catch {}
      },
      onError: (err, variables) => {
        const msg = err?.response?.data?.message || `Échec de l'ajout du rôle ${variables?.role || ''}`.trim();
        toast.error(msg);
      }
    }
  );

  const removeRoleMutation = useMutation(
    ({ userId, role }) => adminService.removeUserRole(userId, role),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-users');
        queryClient.invalidateQueries('admin-contributors');
        queryClient.invalidateQueries('admin-dashboard');
        try { toast.success('Rôle retiré'); } catch {}
        try { closeConfirm(); } catch {}
      },
      onError: (err, variables) => {
        const msg = err?.response?.data?.message || `Échec du retrait du rôle ${variables?.role || ''}`.trim();
        toast.error(msg);
      }
    }
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
    { 
      onSuccess: (_data, variables) => { 
        queryClient.invalidateQueries('admin-users'); 
        clearSelection();
        try {
          const count = Array.isArray(variables?.ids) ? variables.ids.length : 1;
          const action = variables?.ban ? 'banni' : 'débanni';
          toast.success(`${count} utilisateur(s) ${action}`);
        } catch {}
        try { closeConfirm(); } catch {}
      },
      onError: (err, variables) => {
        const action = variables?.ban ? 'bannir' : 'débannir';
        const msg = err?.response?.data?.message || `Échec pour ${action} les utilisateurs`;
        toast.error(msg);
      }
    }
  );
  const deleteUsersMutation = useMutation(
    (ids) => adminService.deleteUsers(ids),
    { 
      onSuccess: (_data, variables) => { 
        queryClient.invalidateQueries('admin-users'); 
        clearSelection(); 
        try {
          const affected = _data?.data?.affected;
          const count = typeof affected === 'number' ? affected : (Array.isArray(variables) ? variables.length : 1);
          const skipped = Array.isArray(_data?.data?.skipped) ? _data.data.skipped.length : 0;
          if (count > 0) {
            toast.success(`${count} utilisateur(s) supprimé(s)` + (skipped > 0 ? `, ${skipped} ignoré(s)` : ''));
          } else {
            toast((skipped > 0 ? `${skipped} ignoré(s)` : 'Aucune suppression effectuée'), { icon: '⚠️' });
          }
        } catch {}
        try { closeConfirm(); } catch {}
      },
      onError: (err) => {
        const msg = err?.response?.data?.message || 'Échec de la suppression des utilisateurs';
        toast.error(msg);
      }
    }
  );
  const handleBulkBan = (ban) => {
    if (selectedIds.length > 0) banUsersMutation.mutate({ ids: selectedIds, ban });
  };
  const handleBulkDelete = () => {
    if (selectedIds.length > 0) {
      setConfirmContext('delete_users');
      openConfirm(
        'Supprimer les utilisateurs',
        'Supprimer les utilisateurs sélectionnés ?',
        () => { deleteUsersMutation.mutate(selectedIds); }
      );
    }
  };

  const handleAddRole = (userId) => {
    const role = roleSelection[userId];
    if (role) addRoleMutation.mutate({ userId, role });
  };

  const approveContributionMutation = useMutation(
    (id) => adminService.approveContributionRequest(id),
    {
      onSuccess: (_data, id, context) => {
        queryClient.invalidateQueries('admin-contributions');
        queryClient.invalidateQueries('admin-contributors');
        queryClient.invalidateQueries('admin-dashboard');
        try {
          // Ne pas afficher la recommandation de méthode (ex: "Formulaire web") dans le toast
          toast.success('Demande approuvée');
        } catch {}
        closeConfirm();
      }
    }
  );

  const rejectContributionMutation = useMutation(
    ({ id, rejection_reason }) => adminService.rejectContributionRequest(id, { rejection_reason }),
    {
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries('admin-contributions');
        queryClient.invalidateQueries('admin-contributors');
        queryClient.invalidateQueries('admin-dashboard');
        try {
          toast.success('Demande rejetée avec succès');
        } catch {}
        closePrompt();
      }
    }
  );

  const handleApproveRequest = (id) => {
    setConfirmContext('approve_contrib');
    openConfirm(
      'Approuver la demande',
      "Confirmer l'approbation de cette demande ?",
      () => { approveContributionMutation.mutate(id); }
    );
  };

  const handleRejectRequest = (id) => {
    openConfirm(
      'Rejeter la demande',
      'Confirmer le rejet de cette demande ?',
      () => {
        closeConfirm();
        setPromptContext('reject_contrib');
        openPrompt({
          title: 'Motif du rejet',
          label: 'Raison du rejet',
          placeholder: '',
          defaultValue: '',
          multiline: true,
          required: true,
          submitText: rejectContributionMutation.isLoading ? 'Rejet…' : 'Rejeter',
          cancelText: 'Annuler',
          onSubmit: (reason) => {
            rejectContributionMutation.mutate({ id, rejection_reason: reason });
          }
        });
      }
    );
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

  if (!isAdmin && !profileLoading) {
    return (
      <AccessDenied>
        <h2>Accès refusé</h2>
        <p>Seuls les administrateurs peuvent accéder à cette page.</p>
      </AccessDenied>
    );
  }

  // Global confirm/prompt modals moved to top to satisfy hooks rules

  const handleValidate = (priceId) => {
    setPromptContext('validate_price');
    openPrompt({
      title: 'Valider le prix',
      label: 'Commentaire de validation (optionnel)',
      placeholder: 'Ajoutez un commentaire (facultatif)…',
      defaultValue: '',
      multiline: true,
      required: false,
      submitText: validatePriceMutation.isLoading ? 'Validation…' : 'Valider',
      cancelText: 'Annuler',
      onSubmit: (comment) => {
        validatePriceMutation.mutate({ priceId, comment: comment || '' });
      }
    });
  };

  const handleReject = (priceId) => {
    setPromptContext('reject_price');
    openPrompt({
      title: 'Rejeter le prix',
      label: 'Raison du rejet',
      placeholder: 'Expliquez la raison du rejet…',
      defaultValue: '',
      multiline: true,
      required: true,
      submitText: rejectPriceMutation.isLoading ? 'Rejet…' : 'Rejeter',
      cancelText: 'Annuler',
      onSubmit: (reason) => {
        rejectPriceMutation.mutate({ priceId, rejection_reason: reason });
      }
    });
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

  const initialLoading = (
    (activeMenu === 'pending' && loadingPending) ||
    (activeMenu === 'stats' && loadingDashboard) ||
    (activeMenu === 'recent' && loadingDashboard) ||
    (activeMenu === 'contributors' && loadingContributors) ||
    (activeMenu === 'requests' && loadingContribs) ||
    (activeMenu === 'users' && loadingUsers)
  );

  if (initialLoading) {
    return <LoadingSpinner text="Chargement de l'espace admin..." />;
  }

  // Section Aperçu (stats) supprimée: les calculs des compteurs ne sont plus nécessaires

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
          {/* Aperçu supprimé */}
          {/* Aperçu */}
          <NavAnchor href="#stats" onClick={handleMenuClick('stats')} $active={activeMenu === 'stats'}><FiHome /> Aperçu</NavAnchor>

          {/* Modération des prix */}
          <NavAnchor href="#pending" onClick={handleMenuClick('pending')} $active={activeMenu === 'pending'}><FiClipboard /> Prix en attente</NavAnchor>
          <NavAnchor href="#recent" onClick={handleMenuClick('recent')} $active={activeMenu === 'recent'}><FiDollarSign /> Prix récents</NavAnchor>

          {/* Gestion des contributeurs */}
          <NavAnchor href="#requests" onClick={handleMenuClick('requests')} $active={activeMenu === 'requests'}><FiUsers /> Demandes de contributeur</NavAnchor>
          <NavAnchor href="#contributors" onClick={handleMenuClick('contributors')} $active={activeMenu === 'contributors'} data-testid="nav-contributors"><FiUser /> Contributeurs (acceptés)</NavAnchor>

          {/* Gestion des données produits */}
          <NavAnchor href="#categories" onClick={handleMenuClick('categories')} $active={activeMenu === 'categories'}><FiPackage /> Catégories</NavAnchor>
          <NavAnchor href="#products" onClick={handleMenuClick('products')} $active={activeMenu === 'products'}><FiPackage /> Produits</NavAnchor>
          <NavAnchor href="#localities" onClick={handleMenuClick('localities')} $active={activeMenu === 'localities'}><FiMapPin /> Localités</NavAnchor>
          <NavAnchor href="#units" onClick={handleMenuClick('units')} $active={activeMenu === 'units'}><FiPackage /> Unités</NavAnchor>
          <NavAnchor href="#languages" onClick={handleMenuClick('languages')} $active={activeMenu === 'languages'}><FiPackage /> Langues</NavAnchor>

          {/* Gestion SEO */}
          <NavAnchor href="#seo" onClick={handleMenuClick('seo')} $active={activeMenu === 'seo'}><FiSettings /> SEO</NavAnchor>

          {/* Gestion des utilisateurs et paramètres (super admin uniquement) */}
          {isSuperAdmin && (
            <>
              <NavAnchor href="#users" onClick={handleMenuClick('users')} $active={activeMenu === 'users'}><FiUsers /> Utilisateurs</NavAnchor>
              <NavAnchor href="#offers" onClick={handleMenuClick('offers')} $active={activeMenu === 'offers'}><FiPackage /> Offres</NavAnchor>
              <NavAnchor href="#settings" onClick={handleMenuClick('settings')} $active={activeMenu === 'settings'}><FiSettings /> Paramètres Kobo</NavAnchor>
              <NavAnchor href="#kobo_xlsform" onClick={handleMenuClick('kobo_xlsform')} $active={activeMenu === 'kobo_xlsform'}><FiDownload /> Générer XLSForm Kobo</NavAnchor>
            </>
          )}

          {/* Liens généraux */}
          <NavItem to="/dashboard"><FiUser /> Espace personnel</NavItem>
          <NavItem to="/"><FiHome /> Accueil</NavItem>
        </NavList>
      </Sidebar>
      <Content>
        <Title>Tableau de Bord Administrateur</Title>
        {/* Global modals */}
        <ConfirmModal
          open={confirmOpen}
          title={confirmConfig.title}
          message={confirmConfig.message}
          confirmText={
            confirmContext === 'approve_contrib' && approveContributionMutation.isLoading
              ? 'Approbation…'
              : confirmContext === 'remove_contrib' && removeRoleMutation.isLoading
                ? 'Retrait…'
                : confirmContext === 'delete_users' && deleteUsersMutation.isLoading
                  ? 'Suppression…'
                : confirmContext === 'bulk_delete' && deleteUsersMutation.isLoading
                  ? 'Suppression…'
                : confirmContext === 'add_role' && addRoleMutation.isLoading
                  ? 'Ajout…'
                : (['bulk_ban', 'bulk_unban', 'ban_unban_user'].includes(confirmContext) && banUsersMutation.isLoading)
                  ? 'Mise à jour…'
                : confirmConfig.confirmText
          }
          cancelText={confirmConfig.cancelText}
          busy={
            confirmContext === 'approve_contrib'
              ? !!approveContributionMutation.isLoading
              : confirmContext === 'remove_contrib'
                ? !!removeRoleMutation.isLoading
                : confirmContext === 'delete_users'
                  ? !!deleteUsersMutation.isLoading
                : confirmContext === 'bulk_delete'
                  ? !!deleteUsersMutation.isLoading
                : confirmContext === 'add_role'
                  ? !!addRoleMutation.isLoading
                : (['bulk_ban', 'bulk_unban', 'ban_unban_user'].includes(confirmContext))
                  ? !!banUsersMutation.isLoading
                : false
          }
          onConfirm={() => { try { confirmConfig.onConfirm && confirmConfig.onConfirm(); } finally { /* fermeture dans onSuccess */ } }}
          onCancel={closeConfirm}
        />
        <PromptModal
          open={promptOpen}
          title={promptConfig.title}
          label={promptConfig.label}
          placeholder={promptConfig.placeholder}
          defaultValue={promptConfig.defaultValue}
          multiline={promptConfig.multiline}
          required={promptConfig.required}
          submitText={(() => {
            if (promptContext === 'reject_contrib') return rejectContributionMutation.isLoading ? 'Rejet…' : promptConfig.submitText;
            if (promptContext === 'validate_price') return validatePriceMutation.isLoading ? 'Validation…' : promptConfig.submitText;
            if (promptContext === 'reject_price') return rejectPriceMutation.isLoading ? 'Rejet…' : promptConfig.submitText;
            return promptConfig.submitText;
          })()}
          cancelText={promptConfig.cancelText}
          busy={promptContext === 'reject_contrib' ? !!rejectContributionMutation.isLoading : promptContext === 'validate_price' ? !!validatePriceMutation.isLoading : promptContext === 'reject_price' ? !!rejectPriceMutation.isLoading : false}
          onSubmit={(v) => { try { promptConfig.onSubmit && promptConfig.onSubmit(v); } finally { /* prompt closed in handler */ } }}
          onCancel={closePrompt}
        />
        {isSuperAdmin && (
          <div style={{ color: '#7f8c8d', textAlign: 'left', marginBottom: '1rem' }}>
            Accès Super Administrateur
          </div>
        )}

      {/* Section Aperçu (statistiques Supabase/BDD) */}
      {activeMenu === 'stats' && (
      <div id="stats">
        {loadingDashboard ? (
          <LoadingSpinner text="Chargement des statistiques…" />
        ) : (
          <StatsGrid>
            {/* Prix */}
            {(() => {
              const total = getStat(['priceStats.total_prices', 'priceStats.total'], 0);
              const validated = getStat(['priceStats.validated_prices', 'priceStats.validated'], 0);
              const pending = getStat(['priceStats.pending_prices', 'priceStats.pending'], 0);
              const rejected = getStat(['priceStats.rejected_prices', 'priceStats.rejected'], 0);
              return (<>
                <StatCard>
                  <StatIcon><FiDollarSign /></StatIcon>
                  <StatValue>{formatCompactCount(total)}</StatValue>
                  <StatLabel>Total des prix</StatLabel>
                </StatCard>
                <StatCard>
                  <StatIcon><FiCheck /></StatIcon>
                  <StatValue>{formatCompactCount(validated)}</StatValue>
                  <StatLabel>Prix validés</StatLabel>
                </StatCard>
                <StatCard>
                  <StatIcon><FiClipboard /></StatIcon>
                  <StatValue>{formatCompactCount(pending)}</StatValue>
                  <StatLabel>Prix en attente</StatLabel>
                </StatCard>
                <StatCard>
                  <StatIcon><FiX /></StatIcon>
                  <StatValue>{formatCompactCount(rejected)}</StatValue>
                  <StatLabel>Prix rejetés</StatLabel>
                </StatCard>
              </>);
            })()}

            {/* Utilisateurs */}
            {(() => {
              const usersTotal = getStat(['userStats.total_users', 'userStats.total'], 0);
              const usersAdmins = getStat(['userStats.admins'], 0);
              const usersContribs = getStat(['userStats.contributors'], 0);
              return (<>
                {isSuperAdmin && (
                  <StatCard>
                    <StatIcon><FiUsers /></StatIcon>
                    <StatValue>{formatCompactCount(usersTotal)}</StatValue>
                    <StatLabel>Total utilisateurs</StatLabel>
                  </StatCard>
                )}
                <StatCard>
                  <StatIcon><FiUser /></StatIcon>
                  <StatValue>{formatCompactCount(usersContribs)}</StatValue>
                  <StatLabel>Contributeurs</StatLabel>
                </StatCard>
                {isSuperAdmin && (
                  <StatCard>
                    <StatIcon><FiSettings /></StatIcon>
                    <StatValue>{formatCompactCount(usersAdmins)}</StatValue>
                    <StatLabel>Admins</StatLabel>
                  </StatCard>
                )}
              </>);
            })()}

            {/* Produits */}
            {(() => {
              const totalProducts = getStat(['productStats.total_products'], 0);
              const totalCategories = getStat(['productStats.total_categories'], 0);
              return (<>
                <StatCard>
                  <StatIcon><FiPackage /></StatIcon>
                  <StatValue>{formatCompactCount(totalProducts)}</StatValue>
                  <StatLabel>Produits</StatLabel>
                </StatCard>
                <StatCard>
                  <StatIcon><FiPackage /></StatIcon>
                  <StatValue>{formatCompactCount(totalCategories)}</StatValue>
                  <StatLabel>Catégories</StatLabel>
                </StatCard>
              </>);
            })()}

            {/* Localités */}
            {(() => {
              const totalLocalities = getStat(['localityStats.total_localities'], 0);
              const totalRegions = getStat(['localityStats.total_regions'], 0);
              return (<>
                <StatCard>
                  <StatIcon><FiMapPin /></StatIcon>
                  <StatValue>{formatCompactCount(totalLocalities)}</StatValue>
                  <StatLabel>Localités</StatLabel>
                </StatCard>
                <StatCard>
                  <StatIcon><FiMapPin /></StatIcon>
                  <StatValue>{formatCompactCount(totalRegions)}</StatValue>
                  <StatLabel>Régions</StatLabel>
                </StatCard>
              </>);
            })()}

            {/* Demandes de contribution */}
            {(() => {
              const contribPending = getStat(['contributionStats.pending'], 0);
              const contribApproved = getStat(['contributionStats.approved'], 0);
              const contribRejected = getStat(['contributionStats.rejected'], 0);
              return (<>
                <StatCard>
                  <StatIcon><FiClipboard /></StatIcon>
                  <StatValue>{formatCompactCount(contribPending)}</StatValue>
                  <StatLabel>Demandes en attente</StatLabel>
                </StatCard>
                <StatCard>
                  <StatIcon><FiCheckSquare /></StatIcon>
                  <StatValue>{formatCompactCount(contribApproved)}</StatValue>
                  <StatLabel>Demandes approuvées</StatLabel>
                </StatCard>
                <StatCard>
                  <StatIcon><FiSquare /></StatIcon>
                  <StatValue>{formatCompactCount(contribRejected)}</StatValue>
                  <StatLabel>Demandes rejetées</StatLabel>
                </StatCard>
              </>);
            })()}

            {/* Modération (super admin uniquement) */}
            {isSuperAdmin && (() => {
              const bannedUsers = getStat(['moderationStats.banned_users'], 0);
              const deletedUsers = getStat(['moderationStats.deleted_users'], 0);
              return (<>
                <StatCard>
                  <StatIcon><FiUserX /></StatIcon>
                  <StatValue>{formatCompactCount(bannedUsers)}</StatValue>
                  <StatLabel>Utilisateurs bannis</StatLabel>
                </StatCard>
                <StatCard>
                  <StatIcon><FiTrash /></StatIcon>
                  <StatValue>{formatCompactCount(deletedUsers)}</StatValue>
                  <StatLabel>Utilisateurs supprimés</StatLabel>
                </StatCard>
              </>);
            })()}

            {/* Offres (super admin uniquement) */}
            {isSuperAdmin && (() => {
              const totalOffers = getStat(['offerStats.total_offers'], 0);
              const activeOffers = getStat(['offerStats.active_offers'], 0);
              return (<>
                <StatCard>
                  <StatIcon><FiPackage /></StatIcon>
                  <StatValue>{formatCompactCount(totalOffers)}</StatValue>
                  <StatLabel>Offres</StatLabel>
                </StatCard>
                <StatCard>
                  <StatIcon><FiPackage /></StatIcon>
                  <StatValue>{formatCompactCount(activeOffers)}</StatValue>
                  <StatLabel>Offres actives</StatLabel>
                </StatCard>
              </>);
            })()}
          </StatsGrid>
        )}
      </div>
      )}

      {/* Prix en attente de validation */}
      {activeMenu === 'pending' && (
      <Section id="pending">
        <SectionTitle>
          <FiEye />
          Prix en attente de validation
        </SectionTitle>
        <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'0.75rem', flexWrap:'wrap' }}>
          <div style={{ position:'relative', flex:'1 1 240px', minWidth:'240px' }}>
            <FiSearch style={{ position:'absolute', left:8, top:8, color:'#6b7280' }} />
            <input
              type="search"
              value={pendingSearch}
              onChange={(e) => setPendingSearch(e.target.value)}
              placeholder="Rechercher (produit, localité, statut...)"
              style={{ width:'100%', padding:'0.4rem 0.8rem 0.4rem 2rem', border:'1px solid #e5e7eb', borderRadius:'8px' }}
              aria-label="Recherche"
            />
          </div>
          <button
            type="button"
            onClick={() => refetchPending()}
            disabled={loadingPending || fetchingPending}
            aria-busy={loadingPending || fetchingPending}
            style={{ padding:'0.4rem 0.8rem', border:'none', borderRadius:'8px', background:'#2563eb', color:'#fff', display:'inline-flex', alignItems:'center', gap:'0.5rem' }}
            title="Rafraîchir"
          >
            <FiRefreshCcw /> {fetchingPending || loadingPending ? 'Rafraîchissement…' : 'Rafraîchir'}
          </button>
          <button
            type="button"
            onClick={() => exportToCSV('prix_en_attente.csv', [
              { header: 'Produit', accessor: 'product_name' },
              { header: 'Catégorie', accessor: 'category_name' },
              { header: 'Localité', accessor: 'locality_name' },
              { header: 'Région', accessor: 'region_name' },
              { header: 'Prix', accessor: 'price' },
              { header: 'Unité', accessor: 'unit_symbol' },
              { header: 'Date', accessor: (row) => row.date ? new Date(row.date).toLocaleDateString('fr-FR') : '' },
              { header: 'Statut', accessor: 'status' },
            ], visiblePending || [])}
            style={{ padding:'0.4rem 0.8rem', border:'none', borderRadius:'8px', background:'#10b981', color:'#fff', display:'inline-flex', alignItems:'center', gap:'0.5rem' }}
            title="Exporter CSV"
          >
            <FiDownload /> Export CSV
          </button>
          <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:'0.375rem' }}>
            <button
              onClick={() => setPendingPage((p) => Math.max(1, p - 1))}
              disabled={pendingPage === 1 || loadingPending || fetchingPending}
              style={{ padding:'0.35rem 0.6rem', border:'1px solid #e5e7eb', borderRadius:'6px', background:'#fff', color:'#111827' }}
              aria-label="Précédent"
            >
              <FiChevronLeft />
            </button>
            <span style={{ color:'#6b7280' }}>Page {pendingPage}</span>
            <button
              onClick={() => setPendingPage((p) => p + 1)}
              disabled={(pendingPrices?.length || 0) < pendingLimit || loadingPending || fetchingPending}
              style={{ padding:'0.35rem 0.6rem', border:'1px solid #e5e7eb', borderRadius:'6px', background:'#fff', color:'#111827' }}
              aria-label="Suivant"
            >
              <FiChevronRight />
            </button>
          </div>
        </div>

        {loadingPending ? (
          <LoadingSpinner />
        ) : !visiblePending || visiblePending.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#7f8c8d', padding: '2rem' }}>
            Aucun prix en attente de validation
          </p>
        ) : (
          <TableWrapper>
            {/* Barre d'actions groupées */}
            {pendingSelectedIds.length > 0 && (
              <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.5rem 0' }}>
                <span style={{ color:'#6b7280' }}>{pendingSelectedIds.length} sélectionné(s)</span>
                <ValidateButton onClick={handleBulkPendingValidate} disabled={validatePriceMutation.isLoading}>
                  <FiCheck style={{ marginRight:'0.35rem' }} /> Valider sélection
                </ValidateButton>
                <RejectButton onClick={handleBulkPendingReject} disabled={rejectPriceMutation.isLoading}>
                  <FiX style={{ marginRight:'0.35rem' }} /> Rejeter sélection
                </RejectButton>
                <button type="button" onClick={clearPendingSelection} style={{ padding:'0.35rem 0.6rem', border:'1px solid #e5e7eb', borderRadius:'6px', background:'#fff', color:'#111827' }}>
                  Effacer la sélection
                </button>
              </div>
            )}
            <Table>
              <thead>
                <tr>
                  <TableHeader>
                    <input
                      type="checkbox"
                      aria-label="Sélectionner tout"
                      onChange={() => togglePendingSelectAll(visiblePending)}
                      checked={pendingSelectedIds.length > 0 && pendingSelectedIds.length === (visiblePending?.length || 0)}
                    />
                  </TableHeader>
                  <TableHeader>Produit</TableHeader>
                  <TableHeader>Localité</TableHeader>
                  <TableHeader>Prix</TableHeader>
                  <TableHeader>Date</TableHeader>
                  <TableHeader style={{ width: 140 }}>Statut</TableHeader>
                  <TableHeader>Actions</TableHeader>
                </tr>
              </thead>
              <tbody>
                {visiblePending?.map((price) => (
                  <TableRow key={price.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        aria-label={`Sélectionner le prix ${price.id}`}
                        checked={pendingSelectedIds.includes(price.id)}
                        onChange={() => togglePendingSelect(price.id)}
                      />
                    </TableCell>
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
                    <TableCell className="cell-actions">
                      <button
                        type="button"
                        onClick={() => { setDetailPrice(price); setDetailOpen(true); }}
                        style={{ marginRight:'0.3rem', color:'#2563eb', background:'#fff', border:'1px solid #e5e7eb', borderRadius:'6px', cursor:'pointer', display:'inline-flex', alignItems:'center', padding:'0.3rem' }}
                        aria-label="Voir le détail"
                        title="Voir le détail"
                      >
                        <FiEye />
                      </button>
                      <button
                        type="button"
                        onClick={() => { setEditPrice(price); setEditOpen(true); }}
                        style={{ marginRight:'0.3rem', color:'#2563eb', background:'#fff', border:'1px solid #e5e7eb', borderRadius:'6px', cursor:'pointer', display:'inline-flex', alignItems:'center', padding:'0.3rem' }}
                        aria-label="Modifier le prix"
                        title="Modifier le prix"
                      >
                        <FiEdit />
                      </button>
                      {price.status !== 'rejected' ? (
                        <Link 
                          to={`/price-map?product_id=${price.product_id}&locality_id=${price.locality_id}${(price.latitude!=null && price.longitude!=null) ? `&lat=${price.latitude}&lng=${price.longitude}&zoom=14` : ''}`}
                          style={{ marginRight:'0.5rem', color:'#10b981', textDecoration:'none', border:'1px solid #e5e7eb', borderRadius:'6px', padding:'0.3rem', display:'inline-flex', alignItems:'center' }} 
                          aria-label="Voir sur la carte"
                          title="Voir sur la carte"
                        >
                          <FiMapPin />
                        </Link>
                      ) : (
                        <span 
                          style={{ marginRight:'0.5rem', color:'#9ca3af', border:'1px solid #e5e7eb', borderRadius:'6px', padding:'0.3rem', display:'inline-flex', alignItems:'center', background:'#f9fafb', cursor:'not-allowed' }} 
                          aria-label="Lien carte indisponible"
                          title="Lien carte indisponible pour les prix rejetés"
                        >
                          <FiMapPin />
                        </span>
                      )}
                      <ValidateButton
                        onClick={() => { setConfirmContext('validate_price'); openConfirm(
                          'Valider le prix',
                          `Valider ce prix de ${price.price} pour ${price.product_name} ?`,
                          () => { closeConfirm(); handleValidate(price.id); }
                        ); }}
                        disabled={validatePriceMutation.isLoading}
                        aria-label="Valider"
                        title="Valider"
                      >
                        {validatePriceMutation.isLoading ? <SpinnerIcon /> : <FiCheck />}
                      </ValidateButton>
                      <RejectButton
                        onClick={() => { setConfirmContext('reject_price'); openConfirm(
                          'Rejeter le prix',
                          `Rejeter ce prix de ${price.price} pour ${price.product_name} ?`,
                          () => { closeConfirm(); handleReject(price.id); }
                        ); }}
                        disabled={rejectPriceMutation.isLoading}
                        aria-label="Rejeter"
                        title="Rejeter"
                      >
                        {rejectPriceMutation.isLoading ? <SpinnerIcon /> : <FiX />}
                      </RejectButton>
                    </TableCell>
                  </TableRow>
                ))}
              </tbody>
            </Table>
            {/* Modale de détails du prix (admin) */}
              <Modal
              open={detailOpen}
              title="Détails du prix"
              onClose={() => setDetailOpen(false)}
              actions={(<>
                <SecondaryButton type="button" onClick={() => setDetailOpen(false)}>Fermer</SecondaryButton>
              </>)}
              >
              {!detailPrice ? (
                <p style={{ color: 'var(--gray-600)' }}>Aucun prix sélectionné.</p>
              ) : (
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
                  <div>
                    <div style={{ fontWeight:600, color:'var(--gray-800)' }}>Produit</div>
                    <div>{detailPrice.product_name}</div>
                    <small style={{ color:'#6b7280' }}>{detailPrice.category_name}</small>
                  </div>
                  <div>
                    <div style={{ fontWeight:600, color:'var(--gray-800)' }}>Localité</div>
                    <div>{detailPrice.locality_name}{detailPrice.region_name ? ` (${detailPrice.region_name})` : ''}</div>
                  </div>
                  {detailPrice.sub_locality && (
                    <div>
                      <div style={{ fontWeight:600, color:'var(--gray-800)' }}>Sous-localité</div>
                      <div>{detailPrice.sub_locality}</div>
                    </div>
                  )}
                  <div>
                    <div style={{ fontWeight:600, color:'var(--gray-800)' }}>Unité</div>
                    <div>{detailPrice.unit_name} {detailPrice.unit_symbol}</div>
                  </div>
                  <div>
                    <div style={{ fontWeight:600, color:'var(--gray-800)' }}>Prix</div>
                    <div><strong>{detailPrice.price}</strong></div>
                  </div>
                  <div>
                    <div style={{ fontWeight:600, color:'var(--gray-800)' }}>Date</div>
                    <div>{detailPrice.date ? new Date(detailPrice.date).toLocaleDateString('fr-FR') : ''}</div>
                  </div>
                  <div>
                    <div style={{ fontWeight:600, color:'var(--gray-800)' }}>Statut</div>
                    <div>{getStatusBadge(detailPrice.status)}</div>
                  </div>
                  {detailPrice.comment && (
                    <div style={{ gridColumn:'1 / -1' }}>
                      <div style={{ fontWeight:600, color:'var(--gray-800)' }}>{detailPrice.status === 'validated' ? 'Commentaire de validation' : 'Commentaire'}</div>
                      <div style={{ whiteSpace:'pre-wrap' }}>{detailPrice.comment}</div>
                    </div>
                  )}
                  <div>
                    <div style={{ fontWeight:600, color:'var(--gray-800)' }}>Source</div>
                    <div>{detailPrice.source_type || '—'}{detailPrice.source ? ` — ${detailPrice.source}` : ''}</div>
                  </div>
                  <div>
                    <div style={{ fontWeight:600, color:'var(--gray-800)' }}>Méthode de soumission</div>
                    <div>{detailPrice.submission_method || detailPrice.source_type || '—'}</div>
                  </div>
                  {detailPrice.sub_locality && (
                    <div>
                      <div style={{ fontWeight:600, color:'var(--gray-800)' }}>Adresse</div>
                      <div>{detailPrice.sub_locality}</div>
                    </div>
                  )}
                  <div>
                    <div style={{ fontWeight:600, color:'var(--gray-800)' }}>Coordonnées</div>
                    <div>{detailPrice.latitude && detailPrice.longitude ? `${detailPrice.latitude}, ${detailPrice.longitude}` : '—'}</div>
                  </div>
                  {detailPrice.geo_accuracy !== undefined && detailPrice.geo_accuracy !== null && (
                    <div>
                      <div style={{ fontWeight:600, color:'var(--gray-800)' }}>Précision GPS</div>
                      <div>{detailPrice.geo_accuracy} m</div>
                    </div>
                  )}
                  {(detailPrice.source_contact_name || detailPrice.source_contact_phone || detailPrice.source_contact_relation) && (
                    <div style={{ gridColumn:'1 / -1' }}>
                      <div style={{ fontWeight:600, color:'var(--gray-800)' }}>Contact source</div>
                      <div style={{ color:'#374151' }}>
                        {detailPrice.source_contact_name ? `Nom: ${detailPrice.source_contact_name}` : ''}
                        {detailPrice.source_contact_phone ? `${detailPrice.source_contact_name ? ' — ' : ''}Téléphone: ${detailPrice.source_contact_phone}` : ''}
                        {detailPrice.source_contact_relation ? `${(detailPrice.source_contact_name || detailPrice.source_contact_phone) ? ' — ' : ''}Relation: ${detailPrice.source_contact_relation}` : ''}
                      </div>
                    </div>
                  )}
                  {detailPrice.source_languages && (
                    <div style={{ gridColumn:'1 / -1' }}>
                      <div style={{ fontWeight:600, color:'var(--gray-800)' }}>Langues de communication</div>
                      <div>{detailPrice.source_languages}</div>
                    </div>
                  )}
                  {(detailPrice.submitted_by_username || detailPrice.submitted_by_email) && (
                    <div style={{ gridColumn:'1 / -1' }}>
                      <div style={{ fontWeight:600, color:'var(--gray-800)' }}>Contributeur</div>
                      <div>{detailPrice.submitted_by_username ? detailPrice.submitted_by_username : '—'}{detailPrice.submitted_by_email ? ` — ${detailPrice.submitted_by_email}` : ''}</div>
                    </div>
                  )}
                  {(detailPrice.contributor_address || detailPrice.contributor_phone) && (
                    <div style={{ gridColumn:'1 / -1' }}>
                      <div style={{ fontWeight:600, color:'var(--gray-800)' }}>Coordonnées du contributeur</div>
                      <div style={{ color:'#374151' }}>
                        {detailPrice.contributor_address ? `Adresse: ${detailPrice.contributor_address}` : ''}
                        {detailPrice.contributor_phone ? `${detailPrice.contributor_address ? ' — ' : ''}Téléphone: ${detailPrice.contributor_phone}` : ''}
                      </div>
                    </div>
                  )}
                  <div>
                    <div style={{ fontWeight:600, color:'var(--gray-800)' }}>Identifiant</div>
                    <div>#{detailPrice.id}</div>
                  </div>
                  <div>
                    <div style={{ fontWeight:600, color:'var(--gray-800)' }}>Créé le</div>
                    <div>{detailPrice.created_at ? new Date(detailPrice.created_at).toLocaleString('fr-FR') : '—'}</div>
                  </div>
                </div>
              )}
              </Modal>
              <FormModal
                open={editOpen}
                title="Modifier le prix en attente"
                fields={editFields}
                submitText={updatePendingMutation.isLoading ? 'Enregistrement…' : 'Enregistrer'}
                cancelText="Annuler"
                onSubmit={handleEditSubmit}
                onCancel={() => { setEditOpen(false); setEditPrice(null); }}
              />
          </TableWrapper>
        )}
      </Section>
      )}

      {/* Gestion des catégories */}
      {activeMenu === 'categories' && (
      <Section id="categories">
        <SectionTitle>
          <FiPackage /> Gérer les catégories
        </SectionTitle>
        {/* Chargement & données */}
        {/** Requêtes */}
        {/** Hook de requête placé plus bas */}
        <CategoriesSection queryClient={queryClient} isAdmin={isAdmin} />
      </Section>
      )}

      {/* Gestion des produits */}
      {activeMenu === 'products' && (
      <Section id="products">
        <SectionTitle>
          <FiPackage /> Gérer les produits
        </SectionTitle>
        <ProductsSection queryClient={queryClient} isAdmin={isAdmin} />
      </Section>
      )}

      {/* Gestion des langues */}
      {activeMenu === 'languages' && (
      <Section id="languages">
        <SectionTitle>
          <FiPackage /> Gérer les langues de communication
        </SectionTitle>
        <LanguagesSection queryClient={queryClient} isAdmin={isAdmin} />
      </Section>
      )}

      {/* Gestion des unités */}
      {activeMenu === 'units' && (
      <Section id="units">
        <SectionTitle>
          <FiPackage /> Gérer les unités
        </SectionTitle>
        <UnitsSection queryClient={queryClient} isAdmin={isAdmin} />
      </Section>
      )}

      {/* Gestion des localités */}
      {activeMenu === 'localities' && (
      <Section id="localities">
        <SectionTitle>
          <FiMapPin /> Gérer les localités
        </SectionTitle>
        <LocalitiesSection queryClient={queryClient} isAdmin={isAdmin} regionOpts={regionOpts} />
      </Section>
      )}

      {/* Demandes de contribution */}
      {activeMenu === 'requests' && (
      <Section id="requests">
        <SectionTitle>
          <FiUsers />
          Demandes de contribution (en attente)
        </SectionTitle>
        <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'0.75rem', flexWrap:'wrap' }}>
          <div style={{ position:'relative', flex:'1 1 240px', minWidth:'240px' }}>
            <FiSearch style={{ position:'absolute', left:8, top:8, color:'#6b7280' }} />
            <input
              type="search"
              value={requestsSearch}
              onChange={(e) => setRequestsSearch(e.target.value)}
              placeholder="Rechercher (nom, email, commune...)"
              style={{ width:'100%', padding:'0.4rem 0.8rem 0.4rem 2rem', border:'1px solid #e5e7eb', borderRadius:'8px' }}
              aria-label="Recherche"
            />
          </div>
          <button
            type="button"
            onClick={() => refetchContribs()}
            disabled={loadingContribs || fetchingContribs}
            aria-busy={loadingContribs || fetchingContribs}
            style={{ padding:'0.4rem 0.8rem', border:'none', borderRadius:'8px', background:'#2563eb', color:'#fff', display:'inline-flex', alignItems:'center', gap:'0.5rem' }}
            title="Rafraîchir"
          >
            <FiRefreshCcw /> {fetchingContribs || loadingContribs ? 'Rafraîchissement…' : 'Rafraîchir'}
          </button>
          <button
            type="button"
            onClick={() => exportToCSV('demandes_contribution.csv', [
              { header: 'Utilisateur', accessor: (r) => r.display_name || ([r.first_name, r.last_name].filter(Boolean).join(' ').trim()) || r.username || r.email || 'Utilisateur' },
              { header: 'Email', accessor: 'email' },
              { header: 'Commune', accessor: 'commune' },
              { header: 'Activité', accessor: 'activity' },
              { header: 'Membre coopérative', accessor: (r) => r.cooperative_member ? 'Oui' : 'Non' },
              { header: 'Coopérative', accessor: 'cooperative_name' },
              { header: 'Téléphone', accessor: 'contact_phone' },
              { header: 'WhatsApp', accessor: (r) => r.has_whatsapp ? 'Oui' : 'Non' },
              { header: 'Expérience', accessor: 'experience_level' },
              { header: 'Date', accessor: (r) => r.created_at ? new Date(r.created_at).toLocaleDateString('fr-FR') : '' },
            ], visibleRequests || [])}
            style={{ padding:'0.4rem 0.8rem', border:'none', borderRadius:'8px', background:'#10b981', color:'#fff', display:'inline-flex', alignItems:'center', gap:'0.5rem' }}
            title="Exporter CSV"
          >
            <FiDownload /> Export CSV
          </button>
          <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:'0.375rem' }}>
            <button
              onClick={() => setRequestsPage((p) => Math.max(1, p - 1))}
              disabled={requestsPage === 1 || loadingContribs || fetchingContribs}
              style={{ padding:'0.35rem 0.6rem', border:'1px solid #e5e7eb', borderRadius:'6px', background:'#fff', color:'#111827' }}
              aria-label="Précédent"
            >
              <FiChevronLeft />
            </button>
            <span style={{ color:'#6b7280' }}>Page {requestsPage}</span>
            <button
              onClick={() => setRequestsPage((p) => p + 1)}
              disabled={(contributionRequests?.length || 0) < requestsLimit || loadingContribs || fetchingContribs}
              style={{ padding:'0.35rem 0.6rem', border:'1px solid #e5e7eb', borderRadius:'6px', background:'#fff', color:'#111827' }}
              aria-label="Suivant"
            >
              <FiChevronRight />
            </button>
          </div>
        </div>

        {loadingContribs ? (
          <LoadingSpinner />
        ) : !visibleRequests || visibleRequests.length === 0 ? (
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
                  <TableHeader>Coopérative / Contact</TableHeader>
                  <TableHeader>Date</TableHeader>
                  <TableHeader>Actions</TableHeader>
                </tr>
              </thead>
              <tbody>
                {visibleRequests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell className="cell-wide">
                      {(() => {
                        const displayName = req.display_name
                          || ([req.first_name, req.last_name].filter(Boolean).join(' ').trim())
                          || req.username
                          || req.email
                          || 'Utilisateur';
                        return (
                          <>
                            <strong>{displayName}</strong>
                            <br />
                            <small style={{ color: '#6b7280', overflowWrap: 'anywhere', wordBreak: 'break-word' }}>{req.email}</small>
                          </>
                        );
                      })()}
                    </TableCell>
                    <TableCell>
                      {req.commune || '-'}
                      <br />
                      <small style={{ color: '#6b7280' }}>{req.activity || '-'}</small>
                    </TableCell>
                    <TableCell className="cell-wide">
                      {req.cooperative_member ? `Membre: ${req.cooperative_name || '-'}` : 'Non membre'}
                      <br />
                      <small style={{ color: '#6b7280' }}>
                        Téléphone: {req.contact_phone || '-'} {req.has_whatsapp ? '(WhatsApp)' : ''}
                      </small>
                      {req.experience_level ? (
                        <>
                          <br />
                          <small style={{ color: '#6b7280' }}>
                            Expérience: {req.experience_level}
                          </small>
                        </>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      {new Date(req.created_at).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell className="cell-actions">
                      <ValidateButton
                        onClick={() => handleApproveRequest(req.id)}
                        disabled={approveContributionMutation.isLoading}
                        aria-label="Approuver"
                        title="Approuver"
                      >
                        {approveContributionMutation.isLoading ? <SpinnerIcon /> : <FiCheck />}
                      </ValidateButton>
                      <RejectButton
                        onClick={() => handleRejectRequest(req.id)}
                        disabled={rejectContributionMutation.isLoading}
                        aria-label="Rejeter"
                        title="Rejeter"
                      >
                        {rejectContributionMutation.isLoading ? <SpinnerIcon /> : <FiX />}
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

      {/* Contributeurs (acceptés) */}
      {activeMenu === 'contributors' && (
      <Section id="contributors">
        <SectionTitle>
          <FiUser />
          Contributeurs (acceptés)
        </SectionTitle>
        <div style={{ color:'#6b7280', margin:'0.25rem 0 0.75rem' }}>
          Ici, les statistiques affichées sont les statuts des prix (Total, Validés, En attente, Rejetés).
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'0.75rem', flexWrap:'wrap' }}>
          <div style={{ position:'relative', flex:'1 1 240px', minWidth:'240px' }}>
            <FiSearch style={{ position:'absolute', left:8, top:8, color:'#6b7280' }} />
            <input
              type="search"
              value={contributorsSearch}
              onChange={(e) => setContributorsSearch(e.target.value)}
              placeholder="Rechercher (nom, email, pseudo...)"
              style={{ width:'100%', padding:'0.4rem 0.8rem 0.4rem 2rem', border:'1px solid #e5e7eb', borderRadius:'8px' }}
              aria-label="Recherche"
            />
          </div>
          <button
            type="button"
            onClick={() => refetchContributors()}
            disabled={loadingContributors || fetchingContributors}
            aria-busy={loadingContributors || fetchingContributors}
            style={{ padding:'0.4rem 0.8rem', border:'none', borderRadius:'8px', background:'#2563eb', color:'#fff', display:'inline-flex', alignItems:'center', gap:'0.5rem' }}
            title="Rafraîchir"
          >
            <FiRefreshCcw style={{ animation: (fetchingContributors ? 'spin 0.8s linear infinite' : 'none') }} /> {fetchingContributors || loadingContributors ? 'Rafraîchissement…' : 'Rafraîchir'}
          </button>
          <button
            type="button"
            onClick={() => exportToCSV('contributeurs_acceptes.csv', [
              { header: 'Utilisateur', accessor: (c) => c.display_name || c.username || (c.email ? c.email.split('@')[0] : 'Utilisateur') },
              { header: 'Email', accessor: 'email' },
              { header: 'Validés', accessor: (c) => Number(c.validated_prices || 0) },
              { header: 'En attente', accessor: (c) => Number(c.pending_prices || 0) },
              { header: 'Rejetés', accessor: (c) => Number(c.rejected_prices || 0) },
              { header: 'Total', accessor: (c) => Number(c.total_prices || 0) },
              { header: 'Smartphone', accessor: (c) => typeof c.pref_has_smartphone !== 'undefined' ? (c.pref_has_smartphone ? 'Oui' : 'Non') : '—' },
              { header: 'Internet', accessor: (c) => typeof c.pref_has_internet !== 'undefined' ? (c.pref_has_internet ? 'Oui' : 'Non') : '—' },
              { header: 'Méthode', accessor: (c) => { const m=(c.preferred_method||'').toLowerCase(); if(m==='web') return 'Formulaire web'; if(m==='offline') return 'KoboCollect (hors ligne)'; if(m==='whatsapp') return 'WhatsApp'; if(m==='sms') return 'SMS'; if(m==='mobile') return 'Application mobile'; return c.preferred_method || '-'; } },
            ], visibleContributors || [])}
            style={{ padding:'0.4rem 0.8rem', border:'none', borderRadius:'8px', background:'#10b981', color:'#fff', display:'inline-flex', alignItems:'center', gap:'0.5rem' }}
            title="Exporter CSV"
          >
            <FiDownload /> Export CSV
          </button>
          <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:'0.375rem' }}>
            <button
              onClick={() => setContributorsPage((p) => Math.max(1, p - 1))}
              disabled={contributorsPage === 1 || loadingContributors || fetchingContributors}
              style={{ padding:'0.35rem 0.6rem', border:'1px solid #e5e7eb', borderRadius:'6px', background:'#fff', color:'#111827' }}
              aria-label="Précédent"
            >
              <FiChevronLeft />
            </button>
            <span style={{ color:'#6b7280' }}>Page {contributorsPage}</span>
            <button
              onClick={() => setContributorsPage((p) => p + 1)}
              disabled={(contributors?.length || 0) < contributorsLimit || loadingContributors || fetchingContributors}
              style={{ padding:'0.35rem 0.6rem', border:'1px solid #e5e7eb', borderRadius:'6px', background:'#fff', color:'#111827' }}
              aria-label="Suivant"
            >
              <FiChevronRight />
            </button>
          </div>
        </div>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>

        {loadingContributors ? (
          <LoadingSpinner />
        ) : contributorsError ? (
          <p style={{ textAlign: 'center', color: '#dc2626', padding: '1rem', background:'#fef2f2', border:'1px solid #fee2e2', borderRadius:'8px' }}>
            Erreur lors du chargement des contributeurs. Veuillez réessayer.
          </p>
        ) : !visibleContributors || visibleContributors.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#7f8c8d', padding: '2rem' }}>
            Aucun contributeur trouvé
          </p>
        ) : (
          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <TableHeader>Utilisateur</TableHeader>
                  <TableHeader>Prix collectés (statuts des prix)</TableHeader>
                  <TableHeader>Préférences (compte)</TableHeader>
                  {isSuperAdmin && (<TableHeader>Actions</TableHeader>)}
                </tr>
              </thead>
              <tbody>
                {visibleContributors.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <strong>{c.display_name || c.username || (c.email ? c.email.split('@')[0] : 'Utilisateur')}</strong>
                      <br />
                      <small style={{ color: '#6b7280' }}>{c.email || '-'}</small>
                    </TableCell>
                    <TableCell>
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{ background:'#d4edda', color:'#155724', padding:'0.125rem 0.5rem', borderRadius:'999px', fontSize:'0.75rem' }}>
                          Validés: {formatCompactCount(c.validated_prices || 0)}
                        </span>
                        <span style={{ background:'#fff3cd', color:'#856404', padding:'0.125rem 0.5rem', borderRadius:'999px', fontSize:'0.75rem' }}>
                          En attente: {formatCompactCount(c.pending_prices || 0)}
                        </span>
                        <span style={{ background:'#f8d7da', color:'#721c24', padding:'0.125rem 0.5rem', borderRadius:'999px', fontSize:'0.75rem' }}>
                          Rejetés: {formatCompactCount(c.rejected_prices || 0)}
                        </span>
                        <span style={{ background:'#e5e7eb', color:'#374151', padding:'0.125rem 0.5rem', borderRadius:'999px', fontSize:'0.75rem' }}>
                          Total: {formatCompactCount(c.total_prices || 0)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <small style={{ color: '#6b7280' }}>
                        {typeof c.pref_has_smartphone !== 'undefined' ? (c.pref_has_smartphone ? 'Smartphone' : 'Pas de smartphone') : '—'} • {typeof c.pref_has_internet !== 'undefined' ? (c.pref_has_internet ? 'Internet' : "Pas d'internet") : '—'} • Méthode: {(() => {
                          const m = (c.preferred_method || '').toLowerCase();
                          if (m === 'web') return 'Formulaire web';
                          if (m === 'offline') return 'KoboCollect (hors ligne)';
                          if (m === 'whatsapp') return 'WhatsApp';
                          if (m === 'sms') return 'SMS';
                          if (m === 'mobile') return 'Application mobile';
                          return c.preferred_method || '-';
                        })()}
                      </small>
                    </TableCell>
                    {isSuperAdmin && (
                      <TableCell>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => { setConfirmContext('remove_contrib'); openConfirm(
                              'Retirer le rôle contributeur',
                              'Retirer le rôle contributeur pour cet utilisateur ?',
                              () => { removeRoleMutation.mutate({ userId: c.id, role: 'contributor' }); }
                            )}}
                            disabled={removeRoleMutation.isLoading}
                            style={{ padding: '0.25rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', display: 'flex', alignItems: 'center' }}
                            title="Retirer le rôle contributeur"
                            aria-label="Retirer rôle contributeur"
                          >
                            <FiMinusCircle />
                          </button>
                        </div>
                      </TableCell>
                    )}
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
        <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'0.75rem', flexWrap:'wrap' }}>
          <div style={{ position:'relative', flex:'1 1 240px', minWidth:'240px' }}>
            <FiSearch style={{ position:'absolute', left:8, top:8, color:'#6b7280' }} />
            <input
              type="search"
              value={recentSearch}
              onChange={(e) => setRecentSearch(e.target.value)}
              placeholder="Rechercher (produit, localité, statut...)"
              style={{ width:'100%', padding:'0.4rem 0.8rem 0.4rem 2rem', border:'1px solid #e5e7eb', borderRadius:'8px' }}
              aria-label="Recherche"
            />
          </div>
          <button
            type="button"
            onClick={() => refetchDashboard()}
            disabled={loadingDashboard || fetchingDashboard}
            aria-busy={loadingDashboard || fetchingDashboard}
            style={{ padding:'0.4rem 0.8rem', border:'none', borderRadius:'8px', background:'#2563eb', color:'#fff', display:'inline-flex', alignItems:'center', gap:'0.5rem' }}
            title="Rafraîchir"
          >
            <FiRefreshCcw /> {fetchingDashboard || loadingDashboard ? 'Rafraîchissement…' : 'Rafraîchir'}
          </button>
          <button
            type="button"
            onClick={() => exportToCSV('prix_recents.csv', [
              { header: 'Produit', accessor: 'product_name' },
              { header: 'Localité', accessor: 'locality_name' },
              { header: 'Prix', accessor: 'price' },
              { header: 'Statut', accessor: 'status' },
              { header: 'Date', accessor: (row) => row.created_at ? new Date(row.created_at).toLocaleDateString('fr-FR') : '' },
            ], visibleRecent || [])}
            style={{ padding:'0.4rem 0.8rem', border:'none', borderRadius:'8px', background:'#10b981', color:'#fff', display:'inline-flex', alignItems:'center', gap:'0.5rem' }}
            title="Exporter CSV"
          >
            <FiDownload /> Export CSV
          </button>
          <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:'0.375rem' }}>
            <button
              onClick={() => setRecentPage((p) => Math.max(1, p - 1))}
              disabled={recentPage === 1}
              style={{ padding:'0.35rem 0.6rem', border:'1px solid #e5e7eb', borderRadius:'6px', background:'#fff', color:'#111827' }}
              aria-label="Précédent"
            >
              <FiChevronLeft />
            </button>
            <span style={{ color:'#6b7280' }}>Page {recentPage}</span>
            <button
              onClick={() => setRecentPage((p) => p + 1)}
              disabled={(recentOffset + recentLimit) >= (visibleRecent?.length || 0)}
              style={{ padding:'0.35rem 0.6rem', border:'1px solid #e5e7eb', borderRadius:'6px', background:'#fff', color:'#111827' }}
              aria-label="Suivant"
            >
              <FiChevronRight />
            </button>
          </div>
        </div>

        {(!visibleRecent || visibleRecent.length === 0) ? (
          <p style={{ textAlign: 'center', color: '#7f8c8d', padding: '2rem' }}>
            Aucun prix récent
          </p>
        ) : (
          <TableWrapper>
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
              {pageRecent?.map((price) => (
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
          </TableWrapper>
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
        <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'0.75rem', flexWrap:'wrap' }}>
          <div style={{ position:'relative', flex:'1 1 240px', minWidth:'240px' }}>
            <FiSearch style={{ position:'absolute', left:8, top:8, color:'#6b7280' }} />
            <input
              type="search"
              value={offersSearch}
              onChange={(e) => setOffersSearch(e.target.value)}
              placeholder="Rechercher (nom, description, période, actif...)"
              style={{ width:'100%', padding:'0.4rem 0.8rem 0.4rem 2rem', border:'1px solid #e5e7eb', borderRadius:'8px' }}
              aria-label="Recherche"
            />
          </div>
          <button
            type="button"
            onClick={() => refetchOffers()}
            disabled={loadingOffers || fetchingOffers}
            aria-busy={loadingOffers || fetchingOffers}
            style={{ padding:'0.4rem 0.8rem', border:'none', borderRadius:'8px', background:'#2563eb', color:'#fff', display:'inline-flex', alignItems:'center', gap:'0.5rem' }}
            title="Rafraîchir"
          >
            <FiRefreshCcw /> {fetchingOffers || loadingOffers ? 'Rafraîchissement…' : 'Rafraîchir'}
          </button>
          <button
            type="button"
            onClick={() => exportToCSV('offres.csv', [
              { header: 'Nom', accessor: 'name' },
              { header: 'Description', accessor: 'description' },
              { header: 'Prix', accessor: 'price' },
              { header: 'Devise', accessor: 'currency' },
              { header: 'Période', accessor: 'period' },
              { header: 'Actif', accessor: (o) => o.is_active ? 'Oui' : 'Non' },
            ], visibleOffers || [])}
            style={{ padding:'0.4rem 0.8rem', border:'none', borderRadius:'8px', background:'#10b981', color:'#fff', display:'inline-flex', alignItems:'center', gap:'0.5rem' }}
            title="Exporter CSV"
          >
            <FiDownload /> Export CSV
          </button>
          <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:'0.375rem' }}>
            <button
              onClick={() => setOffersPage((p) => Math.max(1, p - 1))}
              disabled={offersPage === 1 || loadingOffers || fetchingOffers}
              style={{ padding:'0.35rem 0.6rem', border:'1px solid #e5e7eb', borderRadius:'6px', background:'#fff', color:'#111827' }}
              aria-label="Précédent"
            >
              <FiChevronLeft />
            </button>
            <span style={{ color:'#6b7280' }}>Page {offersPage}</span>
            <button
              onClick={() => setOffersPage((p) => p + 1)}
              disabled={(offers?.length || 0) < offersLimit || loadingOffers || fetchingOffers}
              style={{ padding:'0.35rem 0.6rem', border:'1px solid #e5e7eb', borderRadius:'6px', background:'#fff', color:'#111827' }}
              aria-label="Suivant"
            >
              <FiChevronRight />
            </button>
          </div>
        </div>

         {loadingOffers ? (
           <LoadingSpinner />
         ) : !visibleOffers || visibleOffers.length === 0 ? (
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
                 {visibleOffers.map((offer) => (
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
        <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'0.75rem', flexWrap:'wrap' }}>
          <div style={{ position:'relative', flex:'1 1 240px', minWidth:'240px' }}>
            <FiSearch style={{ position:'absolute', left:8, top:8, color:'#6b7280' }} />
            <input
              type="search"
              value={usersSearch}
              onChange={(e) => setUsersSearch(e.target.value)}
              placeholder="Rechercher (nom, email, pseudo...)"
              style={{ width:'100%', padding:'0.4rem 0.8rem 0.4rem 2rem', border:'1px solid #e5e7eb', borderRadius:'8px' }}
              aria-label="Recherche"
            />
          </div>
          <button
            type="button"
            onClick={() => refetchUsers()}
            disabled={loadingUsers || fetchingUsers}
            aria-busy={loadingUsers || fetchingUsers}
            style={{ padding:'0.4rem 0.8rem', border:'none', borderRadius:'8px', background:'#2563eb', color:'#fff', display:'inline-flex', alignItems:'center', gap:'0.5rem' }}
            title="Rafraîchir"
          >
            <FiRefreshCcw /> {fetchingUsers || loadingUsers ? 'Rafraîchissement…' : 'Rafraîchir'}
          </button>
          <button
            type="button"
            onClick={() => exportToCSV('utilisateurs.csv', [
              { header: 'Nom affiché', accessor: (u) => u.display_name || ((u.first_name || u.last_name) ? `${u.first_name || ''} ${u.last_name || ''}`.trim() : null) || u.username || (u.email ? u.email.split('@')[0] : '-') },
              { header: 'Email', accessor: 'email' },
              { header: 'Pseudo', accessor: 'username' },
              { header: 'Rôles', accessor: (u) => (u.roles || []).join(', ') },
              { header: 'Banni', accessor: (u) => u.is_banned ? 'Oui' : 'Non' },
              { header: 'Créé le', accessor: (u) => u.created_at ? new Date(u.created_at).toLocaleDateString('fr-FR') : '' },
            ], visibleUsers || [])}
            style={{ padding:'0.4rem 0.8rem', border:'none', borderRadius:'8px', background:'#10b981', color:'#fff', display:'inline-flex', alignItems:'center', gap:'0.5rem' }}
            title="Exporter CSV"
          >
            <FiDownload /> Export CSV
          </button>
          <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:'0.375rem' }}>
            <button
              onClick={() => setUsersPage((p) => Math.max(1, p - 1))}
              disabled={usersPage === 1 || loadingUsers || fetchingUsers}
              style={{ padding:'0.35rem 0.6rem', border:'1px solid #e5e7eb', borderRadius:'6px', background:'#fff', color:'#111827' }}
              aria-label="Précédent"
            >
              <FiChevronLeft />
            </button>
            <span style={{ color:'#6b7280' }}>Page {usersPage}</span>
            <button
              onClick={() => setUsersPage((p) => p + 1)}
              disabled={(users?.length || 0) < usersLimit || loadingUsers || fetchingUsers}
              style={{ padding:'0.35rem 0.6rem', border:'1px solid #e5e7eb', borderRadius:'6px', background:'#fff', color:'#111827' }}
              aria-label="Suivant"
            >
              <FiChevronRight />
            </button>
          </div>
        </div>

        {loadingUsers ? (
          <LoadingSpinner />
        ) : !visibleUsers || visibleUsers.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#7f8c8d', padding: '2rem' }}>
            Aucun utilisateur trouvé
          </p>
        ) : (
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.75rem', flexWrap:'wrap' }}>
            <button
              onClick={() => toggleSelectAll(visibleUsers)}
              style={{ padding:'0.4rem 0.8rem', border:'1px solid #e5e7eb', borderRadius:'8px', background:'#fff', color:'#111827' }}
              title="Sélectionner/Désélectionner tout"
            >
              {selectedIds.length === (visibleUsers?.length || 0) ? <FiCheckSquare /> : <FiSquare />} Tout
            </button>
            <button
              onClick={() => { setConfirmContext('bulk_ban'); openConfirm(
                'Bannir la sélection',
                `Bannir ${selectedIds.length} utilisateur(s) sélectionné(s) ?`,
                () => { handleBulkBan(true); }
              ); }}
              disabled={selectedIds.length === 0 || banUsersMutation.isLoading}
              style={{ padding:'0.4rem 0.8rem', border:'none', borderRadius:'8px', background:'#f59e0b', color:'#fff' }}
              title="Bannir la sélection"
              aria-busy={banUsersMutation.isLoading}
            >
              {banUsersMutation.isLoading ? <SpinnerIcon style={{ marginRight:'0.35rem' }} /> : <FiUserX style={{ marginRight:'0.35rem' }} />} Bannir sélection
            </button>
            <button
              onClick={() => { setConfirmContext('bulk_unban'); openConfirm(
                'Débannir la sélection',
                `Débannir ${selectedIds.length} utilisateur(s) sélectionné(s) ?`,
                () => { handleBulkBan(false); }
              ); }}
              disabled={selectedIds.length === 0 || banUsersMutation.isLoading}
              style={{ padding:'0.4rem 0.8rem', border:'none', borderRadius:'8px', background:'#10b981', color:'#fff' }}
              title="Débannir la sélection"
              aria-busy={banUsersMutation.isLoading}
            >
              {banUsersMutation.isLoading ? <SpinnerIcon style={{ marginRight:'0.35rem' }} /> : <FiCheck style={{ marginRight:'0.35rem' }} />} Débannir sélection
            </button>
            <button
              onClick={() => { setConfirmContext('bulk_delete'); openConfirm(
                'Supprimer la sélection',
                `Supprimer (soft) ${selectedIds.length} utilisateur(s) sélectionné(s) ?`,
                () => { handleBulkDelete(); }
              ); }}
              disabled={selectedIds.length === 0 || deleteUsersMutation.isLoading}
              style={{ padding:'0.4rem 0.8rem', border:'none', borderRadius:'8px', background:'#ef4444', color:'#fff' }}
              title="Supprimer (soft) la sélection"
              aria-busy={deleteUsersMutation.isLoading}
            >
              {deleteUsersMutation.isLoading ? <SpinnerIcon style={{ marginRight:'0.35rem' }} /> : <FiTrash style={{ marginRight:'0.35rem' }} />} Supprimer sélection
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
                {visibleUsers.map((u) => {
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
                    <TableCell className="cell-wide">
                      <strong>{displayName}</strong>
                      {u.is_banned ? (
                        <span style={{ marginLeft:'0.5rem', background:'#fee2e2', color:'#b91c1c', padding:'0.125rem 0.375rem', borderRadius:'4px', fontSize:'0.75rem' }}>Banni</span>
                      ) : null}
                    </TableCell>
                    <TableCell className="cell-wide"><span style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}>{u.email}</span></TableCell>
                    <TableCell>
                      <span style={{ color: '#374151' }}>{u.username || '-'}</span>
                    </TableCell>
                    <TableCell>{(u.roles || []).join(', ') || '-'}</TableCell>
                    {isSuperAdmin ? (
                      <>
                        <TableCell className="cell-wide">
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                            <SelectControl
                              value={roleSelection[u.id] || ''}
                              onChange={(e) => setRoleSelection((prev) => ({ ...prev, [u.id]: e.target.value }))}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  const val = roleSelection[u.id];
                                  if (val) handleAddRole(u.id);
                                }
                              }}
                              disabled={availableRoles.length === 0}
                              aria-label="Sélection de rôle"
                              title="Attribuer un rôle"
                            >
                              <option value="">Choisir un rôle…</option>
                              {availableRoles
                                .filter((r) => !(u.roles || []).includes(r))
                                .map((r) => (
                                  <option key={r} value={r}>
                                    {r === 'super_admin' ? 'Super Admin' : r === 'admin' ? 'Admin' : r === 'user' ? 'Utilisateur' : r}
                                  </option>
                                ))}
                            </SelectControl>
                            <button
                              onClick={() => { 
                                const selectedRole = roleSelection[u.id];
                                if (selectedRole) {
                                  setConfirmContext('add_role'); 
                                  openConfirm(
                                    'Ajouter un rôle',
                                    `Ajouter le rôle "${selectedRole}" à l'utilisateur ${u.email} ?`,
                                    () => { handleAddRole(u.id); }
                                  );
                                }
                              }}
                              disabled={!roleSelection[u.id] || addRoleMutation.isLoading}
                              style={{ padding: '0.25rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', display: 'flex', alignItems: 'center' }}
                              title="Ajouter le rôle sélectionné"
                              aria-label="Ajouter le rôle"
                              aria-busy={addRoleMutation.isLoading}
                            >
                              {addRoleMutation.isLoading ? <SpinnerIcon /> : <FiPlusCircle />}
                            </button>
                          </div>
                          <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {(u.roles || [])
                              .filter((role) => role !== 'user' && role !== 'contributor')
                              .map((role) => (
                              <button
                                key={role}
                                onClick={() => removeRoleMutation.mutate({ userId: u.id, role })}
                                disabled={removeRoleMutation.isLoading || (role === 'super_admin' && u.id === user?.id)}
                                style={{ padding: '0.25rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', display: 'flex', alignItems: 'center' }}
                                title={role === 'super_admin' && u.id === user?.id ? 'Impossible de retirer votre propre rôle super_admin' : `Retirer le rôle ${role}`}
                                aria-label={`Retirer le rôle ${role}`}
                                aria-busy={removeRoleMutation.isLoading}
                              >
                                {removeRoleMutation.isLoading ? <SpinnerIcon /> : <FiMinusCircle />}
                              </button>
                            ))}
                            {(u.roles || []).includes('contributor') && (
                              <button
                                onClick={() => { setConfirmContext('remove_contrib'); openConfirm(
                                  'Retirer le rôle contributeur',
                                  'Retirer le rôle contributeur pour cet utilisateur ?',
                                  () => { removeRoleMutation.mutate({ userId: u.id, role: 'contributor' }); }
                                )}}
                                disabled={removeRoleMutation.isLoading}
                                style={{ padding: '0.25rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', display: 'flex', alignItems: 'center' }}
                                title="Retirer le rôle contributeur"
                                aria-label="Retirer le rôle contributeur"
                                aria-busy={removeRoleMutation.isLoading}
                              >
                                {removeRoleMutation.isLoading ? <SpinnerIcon /> : <FiMinusCircle />}
                              </button>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="cell-actions">
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                            <button
                              style={{ padding: '0.25rem', background: '#e5e7eb', color: '#111827', border: 'none', borderRadius: '6px', display: 'flex', alignItems: 'center' }}
                              title={`ID: ${u.id}\nCréé: ${u.created_at ? new Date(u.created_at).toLocaleString('fr-FR') : '-'}`}
                              aria-label="Infos utilisateur"
                            >
                              <FiInfo />
                            </button>
                            <button
                              onClick={() => { setConfirmContext('ban_unban_user'); openConfirm(
                                u.is_banned ? 'Débannir l\'utilisateur' : 'Bannir l\'utilisateur',
                                u.is_banned ? `Débannir l'utilisateur ${u.email} ?` : `Bannir l'utilisateur ${u.email} ?`,
                                () => { banUsersMutation.mutate({ ids: [u.id], ban: !u.is_banned }); }
                              ); }}
                              disabled={banUsersMutation.isLoading}
                              style={{ padding: '0.25rem', background: u.is_banned ? '#10b981' : '#f59e0b', color: 'white', border: 'none', borderRadius: '6px', display: 'flex', alignItems: 'center' }}
                              title={u.is_banned ? 'Débannir cet utilisateur' : 'Bannir cet utilisateur'}
                              aria-label={u.is_banned ? 'Débannir' : 'Bannir'}
                              aria-busy={banUsersMutation.isLoading}
                            >
                              {banUsersMutation.isLoading ? <SpinnerIcon /> : (u.is_banned ? <FiCheck /> : <FiUserX />)}
                            </button>
                            <button
                              onClick={() => { setConfirmContext('delete_users'); openConfirm(
                                "Supprimer l'utilisateur",
                                'Supprimer cet utilisateur ?',
                                () => { deleteUsersMutation.mutate([u.id]); }
                              ); }}
                              disabled={deleteUsersMutation.isLoading}
                              style={{ padding: '0.25rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', display: 'flex', alignItems: 'center' }}
                              title="Supprimer (soft) cet utilisateur"
                              aria-label="Supprimer"
                              aria-busy={deleteUsersMutation.isLoading}
                            >
                              {deleteUsersMutation.isLoading ? <SpinnerIcon /> : <FiTrash />}
                            </button>
                          </div>
                        </TableCell>
                      </>
                    ) : (
                      <TableCell className="cell-actions">
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

      {/* Paramètres Kobo (édition admin) */}
      {activeMenu === 'settings' && (
      <Section id="settings">
        <SectionTitle>
          <FiSettings />
          Paramètres Kobo
        </SectionTitle>
        
        <StatusBox style={{ marginBottom: '1.5rem', borderLeft: '4px solid #3b82f6' }}>
          <h4 style={{ margin:'0 0 0.5rem 0', color:'#1e40af' }}>Configuration Webhook KoboToolbox</h4>
          <p style={{ margin:'0 0 0.5rem 0', fontSize:'0.9rem' }}>
            Pour recevoir les données automatiquement, configurez ce Webhook dans votre projet KoboToolbox (Settings &gt; REST Services &gt; Register a new endpoint) :
          </p>
          <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', background:'white', padding:'0.5rem', borderRadius:'6px', border:'1px solid #e5e7eb' }}>
            <code style={{ flex:1, wordBreak:'break-all', color:'#d63384' }}>
              {(() => {
                const apiBase = process.env.REACT_APP_API_URL || `${window.location.origin}/api`;
                const baseUrl = apiBase.startsWith('http') ? apiBase : `${window.location.origin}${apiBase.startsWith('/') ? '' : '/'}${apiBase}`;
                return `${baseUrl.replace(/\/$/, '')}/kobo/webhook`;
              })()}
            </code>
            <Button 
              size="small" 
              onClick={() => {
                const apiBase = process.env.REACT_APP_API_URL || `${window.location.origin}/api`;
                const baseUrl = apiBase.startsWith('http') ? apiBase : `${window.location.origin}${apiBase.startsWith('/') ? '' : '/'}${apiBase}`;
                const url = `${baseUrl.replace(/\/$/, '')}/kobo/webhook`;
                navigator.clipboard.writeText(url);
                toast.success('URL copiée !');
              }}
              style={{ padding:'0.25rem 0.75rem', fontSize:'0.85rem' }}
            >
              Copier
            </Button>
          </div>
        </StatusBox>

        <div style={{ color:'#6b7280', marginBottom:'0.75rem' }}>
          Configurez ci-dessous l'URL du serveur et l'identifiant qui seront affichés aux contributeurs dans leurs instructions KoboCollect.
        </div>
        {loadingKoboSettings ? (
          <LoadingSpinner />
        ) : (
          <>
            <FormRow>
              <label htmlFor="kobo-server-url"><strong>URL du serveur</strong></label>
              <InputText id="kobo-server-url" value={serverUrl} onChange={(e) => setServerUrl(e.target.value)} placeholder="https://kc.kobotoolbox.org" />
            </FormRow>
            <FormRow>
              <label htmlFor="kobo-username"><strong>Nom d'utilisateur</strong></label>
              <InputText id="kobo-username" value={koboUsername} onChange={(e) => setKoboUsername(e.target.value)} placeholder="identifiant Kobo" />
              <small style={{ color:'#6b7280' }}>Identifiant commun à tous les contributeurs (affiché dans leur Dashboard).</small>
            </FormRow>
            <FormRow>
              <label htmlFor="kobo-password"><strong>Mot de passe (commun à tous)</strong></label>
              <InputText id="kobo-password" type="password" value={koboPassword} onChange={(e) => setKoboPassword(e.target.value)} placeholder="mot de passe Kobo" />
              <small style={{ color:'#6b7280' }}>Ce mot de passe sera affiché aux contributeurs dans leur Dashboard.</small>
            </FormRow>
            <Button
              onClick={() => updateKoboMutation.mutate({ server_url: serverUrl, username: koboUsername, password: koboPassword })}
              disabled={updateKoboMutation.isLoading}
            >
              {updateKoboMutation.isLoading ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </>
        )}
      </Section>
      )}

      {/* Génération XLSForm Kobo (super admin) */}
      {activeMenu === 'kobo_xlsform' && (
      <Section id="kobo_xlsform">
        <SectionTitle>
          <FiDownload />
          Générer et télécharger l'XLSForm Kobo
        </SectionTitle>
        <div style={{ color:'#6b7280', marginBottom:'0.75rem' }}>
          Ce formulaire XLSX est basé sur vos catégories, produits, unités et langues actuels.
          Utilisez-le avec KoboToolbox/KoboCollect pour la collecte de prix.
        </div>
        <Button onClick={handleGenerateXLS} disabled={xlsGenerating} aria-busy={xlsGenerating}>
          {xlsGenerating ? 'Génération…' : (<><FiDownload /> Télécharger XLSForm</>)}
        </Button>
      </Section>
      )}

      {/* Section SEO */}
      {activeMenu === 'seo' && (
      <Section id="seo">
        <SectionTitle>
          <FiSettings />
          Paramètres SEO
        </SectionTitle>
        <div style={{ color:'#6b7280', marginBottom:'0.75rem' }}>
          Configurez les paramètres SEO du site (titres, méta-descriptions, mots-clés).
        </div>
        <>
            <FormRow>
              <label htmlFor="site-title"><strong>Titre du site</strong></label>
              <InputText 
                id="site-title" 
                value={seoSettings.site_title || ''} 
                onChange={(e) => setSeoSettings(prev => ({ ...prev, site_title: e.target.value }))} 
                placeholder="Titre principal du site" 
              />
              <small style={{ color:'#6b7280' }}>Titre affiché dans l'onglet du navigateur et les résultats de recherche.</small>
            </FormRow>
            
            <FormRow>
              <label htmlFor="site-description"><strong>Description du site</strong></label>
              <textarea
                id="site-description"
                value={seoSettings.site_description || ''}
                onChange={(e) => setSeoSettings(prev => ({ ...prev, site_description: e.target.value }))}
                placeholder="Description du site pour les moteurs de recherche"
                style={{
                  width: '100%',
                  padding: '0.6rem 0.85rem',
                  border: '1px solid var(--gray-200)',
                  borderRadius: '8px',
                  background: 'white',
                  color: 'var(--gray-800)',
                  outline: 'none',
                  transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                  minHeight: '80px',
                  resize: 'vertical'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#93c5fd';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--gray-200)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <small style={{ color:'#6b7280' }}>Description affichée dans les résultats de recherche (recommandé : 150-160 caractères).</small>
            </FormRow>

            <FormRow>
              <label htmlFor="site-keywords"><strong>Mots-clés</strong></label>
              <InputText 
                id="site-keywords" 
                value={seoSettings.site_keywords || ''} 
                onChange={(e) => setSeoSettings(prev => ({ ...prev, site_keywords: e.target.value }))} 
                placeholder="mot-clé1, mot-clé2, mot-clé3" 
              />
              <small style={{ color:'#6b7280' }}>Mots-clés séparés par des virgules pour le référencement.</small>
            </FormRow>

            <FormRow>
              <label htmlFor="home-title"><strong>Titre de la page d'accueil</strong></label>
              <InputText 
                id="home-title" 
                value={seoSettings.home_title || ''} 
                onChange={(e) => setSeoSettings(prev => ({ ...prev, home_title: e.target.value }))} 
                placeholder="Titre spécifique à la page d'accueil" 
              />
              <small style={{ color:'#6b7280' }}>Titre spécifique pour la page d'accueil (si différent du titre général).</small>
            </FormRow>

            <FormRow>
              <label htmlFor="home-description"><strong>Description de la page d'accueil</strong></label>
              <textarea
                id="home-description"
                value={seoSettings.home_description || ''}
                onChange={(e) => setSeoSettings(prev => ({ ...prev, home_description: e.target.value }))}
                placeholder="Description spécifique à la page d'accueil"
                style={{
                  width: '100%',
                  padding: '0.6rem 0.85rem',
                  border: '1px solid var(--gray-200)',
                  borderRadius: '8px',
                  background: 'white',
                  color: 'var(--gray-800)',
                  outline: 'none',
                  transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                  minHeight: '80px',
                  resize: 'vertical'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#93c5fd';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--gray-200)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <small style={{ color:'#6b7280' }}>Description spécifique pour la page d'accueil.</small>
            </FormRow>

            <FormRow>
              <label htmlFor="og-image"><strong>Image Open Graph (URL)</strong></label>
              <InputText 
                id="og-image" 
                value={seoSettings.og_image || ''} 
                onChange={(e) => setSeoSettings(prev => ({ ...prev, og_image: e.target.value }))} 
                placeholder="https://example.com/image.jpg" 
              />
              <small style={{ color:'#6b7280' }}>URL de l'image affichée lors du partage sur les réseaux sociaux.</small>
            </FormRow>

            <Button
              onClick={handleSeoSave}
              disabled={seoLoading || updateSeoMutation.isLoading}
              style={{ background: '#10b981', color: 'white' }}
            >
              {(seoLoading || updateSeoMutation.isLoading) ? 'Enregistrement…' : 'Enregistrer les paramètres SEO'}
            </Button>
          </>
      </Section>
      )}
    </Content>
  </DashboardContainer>
  );
};

// --- Sections CRUD ---
function CategoriesSection({ queryClient, isAdmin }) {
  const { data: categories = [], isLoading, refetch } = useQuery(
    'admin-product-categories',
    () => productCategoryService.getAll().then((r) => r?.data?.data || r?.data || []),
    { enabled: !!isAdmin }
  );

  const [form, setForm] = React.useState({ name: '', type: 'brut', description: '' });
  const [search, setSearch] = React.useState('');
  const [catLimit] = React.useState(20);
  const [catPage, setCatPage] = React.useState(1);
  const catOffset = (catPage - 1) * catLimit;
  const visibleCategories = React.useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return categories || [];
    return (categories || []).filter((c) => (
      (c.name || '').toLowerCase().includes(term) ||
      (c.type || '').toLowerCase().includes(term) ||
      (c.description || '').toLowerCase().includes(term)
    ));
  }, [categories, search]);
  const pageCategories = React.useMemo(() => {
    return (visibleCategories || []).slice(catOffset, catOffset + catLimit);
  }, [visibleCategories, catOffset, catLimit]);
  React.useEffect(() => { setCatPage(1); }, [search]);
  // Confirmation de suppression (catégories)
  const [catDeleteConfirm, setCatDeleteConfirm] = React.useState({ open: false, category: null });
  const createCategory = useMutation((payload) => productCategoryService.create(payload), {
    onSuccess: () => {
      toast.success('Catégorie créée');
      queryClient.invalidateQueries('admin-product-categories');
      setForm({ name: '', type: 'brut', description: '' });
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Erreur de création')
  });
  const updateCategory = useMutation(({ id, data }) => productCategoryService.update(id, data), {
    onSuccess: () => {
      toast.success('Catégorie mise à jour');
      queryClient.invalidateQueries('admin-product-categories');
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Erreur de mise à jour')
  });
  const deleteCategory = useMutation((id) => productCategoryService.delete(id), {
    onSuccess: () => {
      toast.success('Catégorie supprimée');
      queryClient.invalidateQueries('admin-product-categories');
      setCatDeleteConfirm({ open: false, category: null });
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Erreur de suppression')
  });

  const handleCreate = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Nom requis');
    createCategory.mutate({ name: form.name.trim(), type: form.type, description: form.description || '' });
  };
  // Edit category modal
  const [catEditOpen, setCatEditOpen] = React.useState(false);
  const [catEditTitle, setCatEditTitle] = React.useState('Modifier la catégorie');
  const [catEditFields, setCatEditFields] = React.useState([]);
  const [catEditSubmit, setCatEditSubmit] = React.useState(null);
  const openEditCategory = (cat) => {
    setCatEditTitle('Modifier la catégorie');
    setCatEditFields([
      { name: 'name', label: 'Nom', type: 'text', defaultValue: cat.name, required: true },
      { name: 'type', label: 'Type', type: 'select', defaultValue: cat.type || 'brut', required: true, options: [
        { value: 'brut', label: 'Brut' },
        { value: 'transforme', label: 'Transformé' }
      ] },
      { name: 'description', label: 'Description', type: 'textarea', defaultValue: cat.description || '' }
    ]);
    setCatEditSubmit(() => (values) => {
      updateCategory.mutate({ id: cat.id, data: { name: String(values.name || '').trim(), type: String(values.type || 'brut'), description: values.description || '' } });
      setCatEditOpen(false);
    });
    setCatEditOpen(true);
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'0.75rem', flexWrap:'wrap' }}>
        <div style={{ position:'relative', flex:'1 1 240px', minWidth:'240px' }}>
          <FiSearch style={{ position:'absolute', left:8, top:8, color:'#6b7280' }} />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher (nom, type, description)"
            style={{ width:'100%', padding:'0.4rem 0.8rem 0.4rem 2rem', border:'1px solid #e5e7eb', borderRadius:'8px' }}
            aria-label="Recherche"
          />
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          style={{ padding:'0.4rem 0.8rem', border:'none', borderRadius:'8px', background:'#2563eb', color:'#fff', display:'inline-flex', alignItems:'center', gap:'0.5rem' }}
          title="Rafraîchir"
        >
          <FiRefreshCcw /> Rafraîchir
        </button>
        <button
          type="button"
          onClick={() => exportToCSV('categories.csv', [
            { header: 'Nom', accessor: 'name' },
            { header: 'Type', accessor: 'type' },
            { header: 'Description', accessor: 'description' },
          ], visibleCategories || [])}
          style={{ padding:'0.4rem 0.8rem', border:'none', borderRadius:'8px', background:'#10b981', color:'#fff', display:'inline-flex', alignItems:'center', gap:'0.5rem' }}
          title="Exporter CSV"
        >
          <FiDownload /> Export CSV
        </button>
        <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:'0.375rem' }}>
          <button
            onClick={() => setCatPage((p) => Math.max(1, p - 1))}
            disabled={catPage === 1 || isLoading}
            style={{ padding:'0.35rem 0.6rem', border:'1px solid #e5e7eb', borderRadius:'6px', background:'#fff', color:'#111827' }}
            aria-label="Précédent"
          >
            <FiChevronLeft />
          </button>
          <span style={{ color:'#6b7280' }}>Page {catPage}</span>
          <button
            onClick={() => setCatPage((p) => p + 1)}
            disabled={((pageCategories?.length || 0) < catLimit) || (catOffset + catLimit >= (visibleCategories?.length || 0)) || isLoading}
            style={{ padding:'0.35rem 0.6rem', border:'1px solid #e5e7eb', borderRadius:'6px', background:'#fff', color:'#111827' }}
            aria-label="Suivant"
          >
            <FiChevronRight />
          </button>
        </div>
      </div>

      {isAdmin && (
        <form onSubmit={handleCreate} style={{ display:'grid', gridTemplateColumns:'1fr 160px 1fr auto', gap:'0.5rem', marginBottom:'0.75rem' }}>
          <InputText placeholder="Nom de la catégorie" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} style={{ padding:'0.6rem 0.85rem', border:'1px solid #e5e7eb', borderRadius:'8px' }}>
            <option value="brut">Brut</option>
            <option value="transforme">Transformé</option>
          </select>
          <InputText placeholder="Description (facultatif)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Button type="submit" disabled={createCategory.isLoading} style={{ background:'#2563eb', color:'#fff' }}>
            {createCategory.isLoading ? 'Ajout…' : 'Ajouter'}
          </Button>
        </form>
      )}

      {(!visibleCategories || visibleCategories.length === 0) ? (
        <p style={{ textAlign: 'center', color: '#7f8c8d', padding: '2rem' }}>
          Aucune catégorie
        </p>
      ) : (
        <TableWrapper>
          <Table>
            <thead>
              <tr>
                <TableHeader>Nom</TableHeader>
                <TableHeader>Type</TableHeader>
                <TableHeader>Description</TableHeader>
                <TableHeader>Actions</TableHeader>
              </tr>
            </thead>
            <tbody>
              {pageCategories.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell className="cell-wide"><strong>{cat.name}</strong></TableCell>
                  <TableCell>{cat.type || 'brut'}</TableCell>
                  <TableCell className="cell-wide"><span style={{ color:'#6b7280' }}>{cat.description || '-'}</span></TableCell>
                  <TableCell className="cell-actions">
                    {isAdmin ? (
                      <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap' }}>
                        <button
                          onClick={() => openEditCategory(cat)}
                          disabled={updateCategory.isLoading}
                          style={{ padding:'0.25rem', border:'none', borderRadius:'6px', background:'#2563eb', color:'#fff', display:'inline-flex', alignItems:'center' }}
                          title="Modifier"
                          aria-label="Modifier"
                          aria-busy={updateCategory.isLoading}
                        >
                          {updateCategory.isLoading ? <SpinnerIcon /> : <FiEdit />}
                        </button>
                        <button
                          onClick={() => setCatDeleteConfirm({ open: true, category: cat })}
                          disabled={deleteCategory.isLoading}
                          style={{ padding:'0.25rem', border:'none', borderRadius:'6px', background:'#ef4444', color:'#fff', display:'inline-flex', alignItems:'center' }}
                          title="Supprimer"
                          aria-label="Supprimer"
                          aria-busy={deleteCategory.isLoading}
                        >
                          {deleteCategory.isLoading ? <SpinnerIcon /> : <FiTrash />}
                        </button>
                      </div>
                    ) : (
                      <span style={{ color:'#6b7280' }}>Actions réservées aux admins</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        </TableWrapper>
      )}
      <ConfirmModal
        open={catDeleteConfirm.open}
        title="Supprimer cette catégorie ?"
        message={catDeleteConfirm.category ? `Cette action supprimera définitivement la catégorie "${catDeleteConfirm.category.name}".` : ''}
        confirmText={deleteCategory.isLoading ? 'Suppression…' : 'Oui, supprimer'}
        cancelText="Annuler"
        busy={deleteCategory.isLoading}
        onConfirm={() => {
          const id = catDeleteConfirm.category?.id;
          if (!id) { setCatDeleteConfirm({ open: false, category: null }); return; }
          deleteCategory.mutate(id);
        }}
        onCancel={() => setCatDeleteConfirm({ open: false, category: null })}
      />
      <FormModal
        open={catEditOpen}
        title={catEditTitle}
        fields={catEditFields}
        onSubmit={(values) => { catEditSubmit && catEditSubmit(values); }}
        onCancel={() => setCatEditOpen(false)}
      />
    </div>
  );
}

function UnitsSection({ queryClient, isAdmin }) {
  const { data: units = [], isLoading, refetch } = useQuery(
    'admin-units',
    () => unitService.getAll().then((r) => r?.data?.data || r?.data || []),
    { enabled: !!isAdmin }
  );
  const [name, setName] = React.useState('');
  const [symbol, setSymbol] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [unitLimit] = React.useState(20);
  const [unitPage, setUnitPage] = React.useState(1);
  const unitOffset = (unitPage - 1) * unitLimit;
  const visibleUnits = React.useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return units || [];
    return (units || []).filter((u) =>
      ((u.name || '').toLowerCase().includes(term)) || ((u.symbol || '').toLowerCase().includes(term))
    );
  }, [units, search]);
  const pageUnits = React.useMemo(() => {
    return (visibleUnits || []).slice(unitOffset, unitOffset + unitLimit);
  }, [visibleUnits, unitOffset, unitLimit]);
  React.useEffect(() => { setUnitPage(1); }, [search]);
  // Confirmation de suppression (unités)
  const [unitDeleteConfirm, setUnitDeleteConfirm] = React.useState({ open: false, unit: null });

  const createUnit = useMutation((data) => unitService.create(data), {
    onSuccess: () => {
      toast.success("Unité créée");
      queryClient.invalidateQueries('admin-units');
      queryClient.invalidateQueries('units');
      setName('');
      setSymbol('');
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Erreur de création')
  });
  const updateUnit = useMutation(({ id, data }) => unitService.update(id, data), {
    onSuccess: () => {
      toast.success('Unité mise à jour');
      queryClient.invalidateQueries('admin-units');
      queryClient.invalidateQueries('units');
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Erreur de mise à jour')
  });
  const deleteUnit = useMutation((id) => unitService.delete(id), {
    onSuccess: () => {
      toast.success('Unité supprimée');
      queryClient.invalidateQueries('admin-units');
      queryClient.invalidateQueries('units');
      setUnitDeleteConfirm({ open: false, unit: null });
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Erreur de suppression')
  });

  const handleCreate = (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Nom requis');
    createUnit.mutate({ name: name.trim(), symbol: symbol.trim() });
  };

  const [unitEditOpen, setUnitEditOpen] = React.useState(false);
  const [unitEditTitle, setUnitEditTitle] = React.useState('Modifier l\'unité');
  const [unitEditFields, setUnitEditFields] = React.useState([]);
  const [unitEditSubmit, setUnitEditSubmit] = React.useState(null);
  const openEditUnit = (unit) => {
    setUnitEditTitle('Modifier l\'unité');
    setUnitEditFields([
      { name: 'name', label: 'Nom', type: 'text', defaultValue: unit?.name || '', required: true },
      { name: 'symbol', label: 'Symbole', type: 'text', defaultValue: unit?.symbol || '', required: false },
    ]);
    setUnitEditSubmit(() => (values) => {
      updateUnit.mutate({ id: unit.id, data: { name: String(values.name || '').trim(), symbol: String(values.symbol || '').trim() } });
      setUnitEditOpen(false);
    });
    setUnitEditOpen(true);
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'0.75rem', flexWrap:'wrap' }}>
        <div style={{ position:'relative', flex:'1 1 240px', minWidth:'240px' }}>
          <FiSearch style={{ position:'absolute', left:8, top:8, color:'#6b7280' }} />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher (nom ou symbole)"
            style={{ width:'100%', padding:'0.4rem 0.8rem 0.4rem 2rem', border:'1px solid #e5e7eb', borderRadius:'8px' }}
            aria-label="Recherche"
          />
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          style={{ padding:'0.4rem 0.8rem', border:'none', borderRadius:'8px', background:'#2563eb', color:'#fff', display:'inline-flex', alignItems:'center', gap:'0.5rem' }}
          title="Rafraîchir"
        >
          <FiRefreshCcw /> Rafraîchir
        </button>
        <button
          type="button"
          onClick={() => exportToCSV('unites.csv', [
            { header: 'Nom', accessor: 'name' },
            { header: 'Symbole', accessor: 'symbol' },
          ], visibleUnits || [])}
          style={{ padding:'0.4rem 0.8rem', border:'none', borderRadius:'8px', background:'#10b981', color:'#fff', display:'inline-flex', alignItems:'center', gap:'0.5rem' }}
          title="Exporter CSV"
        >
          <FiDownload /> Export CSV
        </button>
        <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:'0.375rem' }}>
          <button
            onClick={() => setUnitPage((p) => Math.max(1, p - 1))}
            disabled={unitPage === 1 || isLoading}
            style={{ padding:'0.35rem 0.6rem', border:'1px solid #e5e7eb', borderRadius:'6px', background:'#fff', color:'#111827' }}
            aria-label="Précédent"
          >
            <FiChevronLeft />
          </button>
          <span style={{ color:'#6b7280' }}>Page {unitPage}</span>
          <button
            onClick={() => setUnitPage((p) => p + 1)}
            disabled={((pageUnits?.length || 0) < unitLimit) || (unitOffset + unitLimit >= (visibleUnits?.length || 0)) || isLoading}
            style={{ padding:'0.35rem 0.6rem', border:'1px solid #e5e7eb', borderRadius:'6px', background:'#fff', color:'#111827' }}
            aria-label="Suivant"
          >
            <FiChevronRight />
          </button>
        </div>
      </div>

      {isAdmin && (
        <form onSubmit={handleCreate} style={{ display:'grid', gridTemplateColumns:'1fr 200px auto', gap:'0.5rem', marginBottom:'0.75rem' }}>
          <InputText placeholder="Nom de l\'unité" value={name} onChange={(e) => setName(e.target.value)} />
          <InputText placeholder="Symbole (ex: kg, L, m)" value={symbol} onChange={(e) => setSymbol(e.target.value)} />
          <Button type="submit" disabled={createUnit.isLoading} style={{ background:'#2563eb', color:'#fff' }}>
            {createUnit.isLoading ? 'Ajout…' : 'Ajouter'}
          </Button>
        </form>
      )}

      {(!visibleUnits || visibleUnits.length === 0) ? (
        <p style={{ textAlign: 'center', color: '#7f8c8d', padding: '2rem' }}>
          Aucune unité
        </p>
      ) : (
        <TableWrapper>
          <Table>
            <thead>
              <tr>
                <TableHeader>Nom</TableHeader>
                <TableHeader>Symbole</TableHeader>
                <TableHeader>Actions</TableHeader>
              </tr>
            </thead>
            <tbody>
              {pageUnits.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="cell-wide"><strong>{u.name}</strong></TableCell>
                  <TableCell>{u.symbol || '—'}</TableCell>
                  <TableCell className="cell-actions">
                    {isAdmin ? (
                      <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap' }}>
                        <button
                          onClick={() => openEditUnit(u)}
                          disabled={updateUnit.isLoading}
                          style={{ padding:'0.25rem', border:'none', borderRadius:'6px', background:'#2563eb', color:'#fff', display:'inline-flex', alignItems:'center' }}
                          title="Modifier"
                          aria-label="Modifier"
                          aria-busy={updateUnit.isLoading}
                        >
                          {updateUnit.isLoading ? <SpinnerIcon /> : <FiEdit />}
                        </button>
                        <button
                          onClick={() => setUnitDeleteConfirm({ open: true, unit: u })}
                          disabled={deleteUnit.isLoading}
                          style={{ padding:'0.25rem', border:'none', borderRadius:'6px', background:'#ef4444', color:'#fff', display:'inline-flex', alignItems:'center' }}
                          title="Supprimer"
                          aria-label="Supprimer"
                          aria-busy={deleteUnit.isLoading}
                        >
                          {deleteUnit.isLoading ? <SpinnerIcon /> : <FiTrash />}
                        </button>
                      </div>
                    ) : (
                      <span style={{ color:'#6b7280' }}>Actions réservées aux admins</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        </TableWrapper>
      )}
      <ConfirmModal
        open={unitDeleteConfirm.open}
        title="Supprimer cette unité ?"
        message={unitDeleteConfirm.unit ? `Cette action supprimera définitivement l'unité "${unitDeleteConfirm.unit.name}".` : ''}
        confirmText={deleteUnit.isLoading ? 'Suppression…' : 'Oui, supprimer'}
        cancelText="Annuler"
        busy={deleteUnit.isLoading}
        onConfirm={() => {
          const id = unitDeleteConfirm.unit?.id;
          if (!id) { setUnitDeleteConfirm({ open: false, unit: null }); return; }
          deleteUnit.mutate(id);
        }}
        onCancel={() => setUnitDeleteConfirm({ open: false, unit: null })}
      />
      <FormModal
        open={unitEditOpen}
        title={unitEditTitle}
        fields={unitEditFields}
        submitText={updateUnit.isLoading ? 'Enregistrement…' : 'Enregistrer'}
        onSubmit={(values) => { if (updateUnit.isLoading) return; unitEditSubmit && unitEditSubmit(values); }}
        onCancel={() => setUnitEditOpen(false)}
      />
    </div>
  );
}

// Section localités avec filtre par région, recherche, pagination et rafraîchissement
function LocalitiesSection({ queryClient, isAdmin, regionOpts = [] }) {
  const [search, setSearch] = React.useState('');
  const [selectedRegion, setSelectedRegion] = React.useState('');
  const [locLimit] = React.useState(20);
  const [locPage, setLocPage] = React.useState(1);
  const locOffset = (locPage - 1) * locLimit;

  const { data: localities = [], isLoading, refetch } = useQuery(
    ['admin-localities', selectedRegion || 'all'],
    () => {
      if (selectedRegion) {
        return localityService.getByRegion(selectedRegion).then((r) => r?.data?.data || r?.data || []);
      }
      return localityService.getAll().then((r) => r?.data?.data || r?.data || []);
    }
  );

  const regionOptions = React.useMemo(() => {
    const base = [{ value: '', label: '— Région —' }];
    const opts = (regionOpts || []).map((r) => ({ value: String(r.region_id), label: r.display_name }));
    return base.concat(opts);
  }, [regionOpts]);

  const visibleLocalities = React.useMemo(() => {
    const term = search.trim().toLowerCase();
    const rows = localities || [];
    if (!term) return rows;
    return rows.filter((l) => (
      (String(l.name || '').toLowerCase().includes(term)) ||
      (String(l.region_name || '').toLowerCase().includes(term)) ||
      String(l.id || '').includes(term)
    ));
  }, [localities, search]);

  const pageLocalities = React.useMemo(() => {
    return (visibleLocalities || []).slice(locOffset, locOffset + locLimit);
  }, [visibleLocalities, locOffset, locLimit]);

  React.useEffect(() => { setLocPage(1); }, [search, selectedRegion]);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'0.75rem', flexWrap:'wrap' }}>
        <div style={{ position:'relative', flex:'1 1 220px', minWidth:'220px' }}>
          <FiSearch style={{ position:'absolute', left:8, top:8, color:'#6b7280' }} />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher (nom, région, identifiant)"
            style={{ width:'100%', padding:'0.4rem 0.8rem 0.4rem 2rem', border:'1px solid #e5e7eb', borderRadius:'8px' }}
            aria-label="Recherche"
          />
        </div>
        <select
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
          style={{ padding:'0.6rem 0.85rem', border:'1px solid #e5e7eb', borderRadius:'8px' }}
          aria-label="Filtrer par région"
        >
          {regionOptions.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => { refetch(); queryClient.invalidateQueries('filter-regions'); }}
          style={{ padding:'0.4rem 0.8rem', border:'none', borderRadius:'8px', background:'#2563eb', color:'#fff', display:'inline-flex', alignItems:'center', gap:'0.5rem' }}
          title="Rafraîchir"
        >
          <FiRefreshCcw /> Rafraîchir
        </button>
        <button
          type="button"
          onClick={() => exportToCSV('localites.csv', [
            { header: 'Nom', accessor: 'name' },
            { header: 'Région', accessor: (l) => l.region_name || '—' },
            { header: 'Identifiant', accessor: 'id' },
          ], visibleLocalities || [])}
          style={{ padding:'0.4rem 0.8rem', border:'none', borderRadius:'8px', background:'#10b981', color:'#fff', display:'inline-flex', alignItems:'center', gap:'0.5rem' }}
          title="Exporter CSV"
        >
          <FiDownload /> Export CSV
        </button>
        <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:'0.375rem' }}>
          <button
            onClick={() => setLocPage((p) => Math.max(1, p - 1))}
            disabled={locPage === 1 || isLoading}
            style={{ padding:'0.35rem 0.6rem', border:'1px solid #e5e7eb', borderRadius:'6px', background:'#fff', color:'#111827' }}
            aria-label="Précédent"
          >
            <FiChevronLeft />
          </button>
          <span style={{ color:'#6b7280' }}>Page {locPage}</span>
          <button
            onClick={() => setLocPage((p) => p + 1)}
            disabled={((pageLocalities?.length || 0) < locLimit) || (locOffset + locLimit >= (visibleLocalities?.length || 0)) || isLoading}
            style={{ padding:'0.35rem 0.6rem', border:'1px solid #e5e7eb', borderRadius:'6px', background:'#fff', color:'#111827' }}
            aria-label="Suivant"
          >
            <FiChevronRight />
          </button>
        </div>
      </div>

      {(!visibleLocalities || visibleLocalities.length === 0) ? (
        <p style={{ textAlign: 'center', color: '#7f8c8d', padding: '2rem' }}>
          Aucune localité
        </p>
      ) : (
        <TableWrapper>
          <Table>
            <thead>
              <tr>
                <TableHeader>Nom</TableHeader>
                <TableHeader>Région</TableHeader>
                <TableHeader>Identifiant</TableHeader>
              </tr>
            </thead>
            <tbody>
              {pageLocalities.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="cell-wide"><strong>{l.name}</strong></TableCell>
                  <TableCell>{l.region_name || '—'}</TableCell>
                  <TableCell>{l.id}</TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        </TableWrapper>
      )}
    </div>
  );
}

function ProductsSection({ queryClient, isAdmin }) {
  const { data: products = [], isLoading, refetch } = useQuery(
    'admin-products',
    () => productService.getAll({ limit: 1000 }).then((r) => r?.data?.data || r?.data || []),
    { enabled: !!isAdmin }
  );
  const { data: categories = [], refetch: refetchCategories } = useQuery(
    'admin-product-categories',
    () => productCategoryService.getAll().then((r) => r?.data?.data || r?.data || []),
    { enabled: !!isAdmin }
  );
  const [form, setForm] = React.useState({ name: '', category_id: '' });
  const [search, setSearch] = React.useState('');
  const [prodLimit] = React.useState(20);
  const [prodPage, setProdPage] = React.useState(1);
  const prodOffset = (prodPage - 1) * prodLimit;
  const catMap = React.useMemo(() => {
    const m = new Map();
    (categories || []).forEach((c) => m.set(c.id, c.name));
    return m;
  }, [categories]);
  const visibleProducts = React.useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return products || [];
    return (products || []).filter((p) => (
      (p.name || '').toLowerCase().includes(term) ||
      String(p.category_id || '').includes(term)
    ));
  }, [products, search]);
  const pageProducts = React.useMemo(() => {
    return (visibleProducts || []).slice(prodOffset, prodOffset + prodLimit);
  }, [visibleProducts, prodOffset, prodLimit]);
  React.useEffect(() => { setProdPage(1); }, [search]);
  // Confirmation de suppression (produits)
  const [prodDeleteConfirm, setProdDeleteConfirm] = React.useState({ open: false, product: null });
  const createProduct = useMutation((payload) => productService.create(payload), {
    onSuccess: () => {
      toast.success('Produit créé');
      queryClient.invalidateQueries('admin-products');
      setForm({ name: '', category_id: '' });
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Erreur de création')
  });
  const updateProduct = useMutation(({ id, data }) => productService.update(id, data), {
    onSuccess: () => {
      toast.success('Produit mis à jour');
      queryClient.invalidateQueries('admin-products');
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Erreur de mise à jour')
  });
  const deleteProduct = useMutation((id) => productService.delete(id), {
    onSuccess: () => {
      toast.success('Produit supprimé');
      queryClient.invalidateQueries('admin-products');
      setProdDeleteConfirm({ open: false, product: null });
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Erreur de suppression')
  });

  const handleCreate = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Nom requis');
    const payload = { name: form.name.trim() };
    if (form.category_id) payload.category_id = Number(form.category_id);
    createProduct.mutate(payload);
  };
  // Edit product modal
  const [prodEditOpen, setProdEditOpen] = React.useState(false);
  const [prodEditTitle, setProdEditTitle] = React.useState('Modifier le produit');
  const [prodEditFields, setProdEditFields] = React.useState([]);
  const [prodEditSubmit, setProdEditSubmit] = React.useState(null);
  const openEditProduct = (p) => {
    const categoryOptions = [{ value: '', label: '— Catégorie —' }, ...(categories || []).map((c) => ({ value: String(c.id), label: c.name }))];
    setProdEditTitle('Modifier le produit');
    setProdEditFields([
      { name: 'name', label: 'Nom du produit', type: 'text', defaultValue: p.name, required: true },
      { name: 'category_id', label: 'Catégorie', type: 'select', defaultValue: p.category_id ? String(p.category_id) : '', options: categoryOptions }
    ]);
    setProdEditSubmit(() => (values) => {
      const data = { name: String(values.name || '').trim() };
      if (values.category_id) data.category_id = Number(values.category_id);
      updateProduct.mutate({ id: p.id, data });
      setProdEditOpen(false);
    });
    setProdEditOpen(true);
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'0.75rem', flexWrap:'wrap' }}>
        <div style={{ position:'relative', flex:'1 1 240px', minWidth:'240px' }}>
          <FiSearch style={{ position:'absolute', left:8, top:8, color:'#6b7280' }} />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher (nom, catégorie)"
            style={{ width:'100%', padding:'0.4rem 0.8rem 0.4rem 2rem', border:'1px solid #e5e7eb', borderRadius:'8px' }}
            aria-label="Recherche"
          />
        </div>
        <button
          type="button"
          onClick={() => { refetch(); refetchCategories(); }}
          style={{ padding:'0.4rem 0.8rem', border:'none', borderRadius:'8px', background:'#2563eb', color:'#fff', display:'inline-flex', alignItems:'center', gap:'0.5rem' }}
          title="Rafraîchir"
        >
          <FiRefreshCcw /> Rafraîchir
        </button>
        <button
          type="button"
          onClick={() => exportToCSV('produits.csv', [
            { header: 'Nom', accessor: 'name' },
            { header: 'Catégorie', accessor: (p) => catMap.get(p.category_id) || '—' },
          ], visibleProducts || [])}
          style={{ padding:'0.4rem 0.8rem', border:'none', borderRadius:'8px', background:'#10b981', color:'#fff', display:'inline-flex', alignItems:'center', gap:'0.5rem' }}
          title="Exporter CSV"
        >
          <FiDownload /> Export CSV
        </button>
        <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:'0.375rem' }}>
          <button
            onClick={() => setProdPage((p) => Math.max(1, p - 1))}
            disabled={prodPage === 1 || isLoading}
            style={{ padding:'0.35rem 0.6rem', border:'1px solid #e5e7eb', borderRadius:'6px', background:'#fff', color:'#111827' }}
            aria-label="Précédent"
          >
            <FiChevronLeft />
          </button>
          <span style={{ color:'#6b7280' }}>Page {prodPage}</span>
          <button
            onClick={() => setProdPage((p) => p + 1)}
            disabled={((pageProducts?.length || 0) < prodLimit) || (prodOffset + prodLimit >= (visibleProducts?.length || 0)) || isLoading}
            style={{ padding:'0.35rem 0.6rem', border:'1px solid #e5e7eb', borderRadius:'6px', background:'#fff', color:'#111827' }}
            aria-label="Suivant"
          >
            <FiChevronRight />
          </button>
        </div>
      </div>

      {isAdmin && (
        <form onSubmit={handleCreate} style={{ display:'grid', gridTemplateColumns:'1fr 1fr auto', gap:'0.5rem', marginBottom:'0.75rem' }}>
          <InputText placeholder="Nom du produit" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} style={{ padding:'0.6rem 0.85rem', border:'1px solid #e5e7eb', borderRadius:'8px' }}>
            <option value="">— Catégorie —</option>
            {categories.map((c) => (
              <option value={c.id} key={c.id}>{c.name}</option>
            ))}
          </select>
          <Button type="submit" disabled={createProduct.isLoading} style={{ background:'#2563eb', color:'#fff' }}>
            {createProduct.isLoading ? 'Ajout…' : 'Ajouter'}
          </Button>
        </form>
      )}

      {(!visibleProducts || visibleProducts.length === 0) ? (
        <p style={{ textAlign: 'center', color: '#7f8c8d', padding: '2rem' }}>
          Aucun produit
        </p>
      ) : (
        <TableWrapper>
          <Table>
            <thead>
              <tr>
                <TableHeader>Nom</TableHeader>
                <TableHeader>Catégorie</TableHeader>
                <TableHeader>Actions</TableHeader>
              </tr>
            </thead>
            <tbody>
              {pageProducts.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="cell-wide"><strong>{p.name}</strong></TableCell>
                  <TableCell>{catMap.get(p.category_id) || '—'}</TableCell>
                  <TableCell className="cell-actions">
                    {isAdmin ? (
                      <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap' }}>
                        <button
                          onClick={() => openEditProduct(p)}
                          disabled={updateProduct.isLoading}
                          style={{ padding:'0.25rem', border:'none', borderRadius:'6px', background:'#2563eb', color:'#fff', display:'inline-flex', alignItems:'center' }}
                          title="Modifier"
                          aria-label="Modifier"
                          aria-busy={updateProduct.isLoading}
                        >
                          {updateProduct.isLoading ? <SpinnerIcon /> : <FiEdit />}
                        </button>
                        <button
                          onClick={() => setProdDeleteConfirm({ open: true, product: p })}
                          disabled={deleteProduct.isLoading}
                          style={{ padding:'0.25rem', border:'none', borderRadius:'6px', background:'#ef4444', color:'#fff', display:'inline-flex', alignItems:'center' }}
                          title="Supprimer"
                          aria-label="Supprimer"
                          aria-busy={deleteProduct.isLoading}
                        >
                          {deleteProduct.isLoading ? <SpinnerIcon /> : <FiTrash />}
                        </button>
                      </div>
                    ) : (
                      <span style={{ color:'#6b7280' }}>Actions réservées aux admins</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        </TableWrapper>
      )}
      <ConfirmModal
        open={prodDeleteConfirm.open}
        title="Supprimer ce produit ?"
        message={prodDeleteConfirm.product ? `Cette action supprimera définitivement le produit "${prodDeleteConfirm.product.name}".` : ''}
        confirmText={deleteProduct.isLoading ? 'Suppression…' : 'Oui, supprimer'}
        cancelText="Annuler"
        busy={deleteProduct.isLoading}
        onConfirm={() => {
          const id = prodDeleteConfirm.product?.id;
          if (!id) { setProdDeleteConfirm({ open: false, product: null }); return; }
          deleteProduct.mutate(id);
        }}
        onCancel={() => setProdDeleteConfirm({ open: false, product: null })}
      />
      <FormModal
        open={prodEditOpen}
        title={prodEditTitle}
        fields={prodEditFields}
        submitText={updateProduct.isLoading ? 'Enregistrement…' : 'Enregistrer'}
        onSubmit={(values) => { if (updateProduct.isLoading) return; prodEditSubmit && prodEditSubmit(values); }}
        onCancel={() => setProdEditOpen(false)}
      />
    </div>
  );
}

function LanguagesSection({ queryClient, isAdmin }) {
  const { data: languages = [], isLoading, refetch } = useQuery(
    'admin-languages',
    () => languageService.getAll().then((r) => r?.data?.data || r?.data || []),
    { enabled: !!isAdmin }
  );
  const [name, setName] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [langLimit] = React.useState(20);
  const [langPage, setLangPage] = React.useState(1);
  const langOffset = (langPage - 1) * langLimit;
  const visibleLanguages = React.useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return languages || [];
    return (languages || []).filter((l) => (l.name || '').toLowerCase().includes(term));
  }, [languages, search]);
  const pageLanguages = React.useMemo(() => {
    return (visibleLanguages || []).slice(langOffset, langOffset + langLimit);
  }, [visibleLanguages, langOffset, langLimit]);
  React.useEffect(() => { setLangPage(1); }, [search]);
  // Confirmation de suppression (langues)
  const [langDeleteConfirm, setLangDeleteConfirm] = React.useState({ open: false, language: null });
  const createLanguage = useMutation((n) => languageService.create(n), {
    onSuccess: () => {
      toast.success('Langue créée');
      queryClient.invalidateQueries('admin-languages');
      setName('');
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Erreur de création')
  });
  const updateLanguage = useMutation(({ id, name }) => languageService.update(id, name), {
    onSuccess: () => {
      toast.success('Langue mise à jour');
      queryClient.invalidateQueries('admin-languages');
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Erreur de mise à jour')
  });
  const deleteLanguage = useMutation((id) => languageService.delete(id), {
    onSuccess: () => {
      toast.success('Langue supprimée');
      queryClient.invalidateQueries('admin-languages');
      setLangDeleteConfirm({ open: false, language: null });
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Erreur de suppression')
  });

  const handleCreate = (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Nom requis');
    createLanguage.mutate(name.trim());
  };
  const [langPromptOpen, setLangPromptOpen] = React.useState(false);
  const [editingLang, setEditingLang] = React.useState(null);
  const openEditLanguage = (lang) => {
    setEditingLang(lang);
    setLangPromptOpen(true);
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'0.75rem', flexWrap:'wrap' }}>
        <div style={{ position:'relative', flex:'1 1 240px', minWidth:'240px' }}>
          <FiSearch style={{ position:'absolute', left:8, top:8, color:'#6b7280' }} />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher (nom de langue)"
            style={{ width:'100%', padding:'0.4rem 0.8rem 0.4rem 2rem', border:'1px solid #e5e7eb', borderRadius:'8px' }}
            aria-label="Recherche"
          />
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          style={{ padding:'0.4rem 0.8rem', border:'none', borderRadius:'8px', background:'#2563eb', color:'#fff', display:'inline-flex', alignItems:'center', gap:'0.5rem' }}
          title="Rafraîchir"
        >
          <FiRefreshCcw /> Rafraîchir
        </button>
        <button
          type="button"
          onClick={() => exportToCSV('langues.csv', [
            { header: 'Nom', accessor: 'name' },
          ], visibleLanguages || [])}
          style={{ padding:'0.4rem 0.8rem', border:'none', borderRadius:'8px', background:'#10b981', color:'#fff', display:'inline-flex', alignItems:'center', gap:'0.5rem' }}
          title="Exporter CSV"
        >
          <FiDownload /> Export CSV
        </button>
        <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:'0.375rem' }}>
          <button
            onClick={() => setLangPage((p) => Math.max(1, p - 1))}
            disabled={langPage === 1 || isLoading}
            style={{ padding:'0.35rem 0.6rem', border:'1px solid #e5e7eb', borderRadius:'6px', background:'#fff', color:'#111827' }}
            aria-label="Précédent"
          >
            <FiChevronLeft />
          </button>
          <span style={{ color:'#6b7280' }}>Page {langPage}</span>
          <button
            onClick={() => setLangPage((p) => p + 1)}
            disabled={((pageLanguages?.length || 0) < langLimit) || (langOffset + langLimit >= (visibleLanguages?.length || 0)) || isLoading}
            style={{ padding:'0.35rem 0.6rem', border:'1px solid #e5e7eb', borderRadius:'6px', background:'#fff', color:'#111827' }}
            aria-label="Suivant"
          >
            <FiChevronRight />
          </button>
        </div>
      </div>

      {isAdmin && (
        <form onSubmit={handleCreate} style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:'0.5rem', marginBottom:'0.75rem' }}>
          <InputText placeholder="Nom de la langue" value={name} onChange={(e) => setName(e.target.value)} />
          <Button type="submit" disabled={createLanguage.isLoading} style={{ background:'#2563eb', color:'#fff' }}>
            {createLanguage.isLoading ? 'Ajout…' : 'Ajouter'}
          </Button>
        </form>
      )}

      {(!visibleLanguages || visibleLanguages.length === 0) ? (
        <p style={{ textAlign: 'center', color: '#7f8c8d', padding: '2rem' }}>
          Aucune langue
        </p>
      ) : (
        <TableWrapper>
          <Table>
            <thead>
              <tr>
                <TableHeader>Nom</TableHeader>
                <TableHeader>Actions</TableHeader>
              </tr>
            </thead>
            <tbody>
              {pageLanguages.map((lang) => (
                <TableRow key={lang.id}>
                  <TableCell className="cell-wide"><strong>{lang.name}</strong></TableCell>
                  <TableCell className="cell-actions">
                    {isAdmin ? (
                      <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap' }}>
                        <button
                          onClick={() => openEditLanguage(lang)}
                          disabled={updateLanguage.isLoading}
                          style={{ padding:'0.25rem', border:'none', borderRadius:'6px', background:'#2563eb', color:'#fff', display:'inline-flex', alignItems:'center' }}
                          title={'Modifier la langue'}
                          aria-label="Modifier"
                          aria-busy={updateLanguage.isLoading}
                        >
                          {updateLanguage.isLoading ? <SpinnerIcon /> : <FiEdit />}
                        </button>
                        <button
                          onClick={() => setLangDeleteConfirm({ open: true, language: lang })}
                          disabled={deleteLanguage.isLoading}
                          style={{ padding:'0.25rem', border:'none', borderRadius:'6px', background:'#ef4444', color:'#fff', display:'inline-flex', alignItems:'center' }}
                          title="Supprimer"
                          aria-label="Supprimer"
                          aria-busy={deleteLanguage.isLoading}
                        >
                          {deleteLanguage.isLoading ? <SpinnerIcon /> : <FiTrash />}
                        </button>
                      </div>
                    ) : (
                      <span style={{ color:'#6b7280' }}>Actions réservées aux admins</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        </TableWrapper>
      )}
      <ConfirmModal
        open={langDeleteConfirm.open}
        title="Supprimer cette langue ?"
        message={langDeleteConfirm.language ? `Cette action supprimera définitivement la langue "${langDeleteConfirm.language.name}".` : ''}
        confirmText={deleteLanguage.isLoading ? 'Suppression…' : 'Oui, supprimer'}
        cancelText="Annuler"
        busy={deleteLanguage.isLoading}
        onConfirm={() => {
          const id = langDeleteConfirm.language?.id;
          if (!id) { setLangDeleteConfirm({ open: false, language: null }); return; }
          deleteLanguage.mutate(id);
        }}
        onCancel={() => setLangDeleteConfirm({ open: false, language: null })}
      />
      <PromptModal
        open={langPromptOpen}
        title={'Modifier la langue'}
        label={'Nom'}
        defaultValue={editingLang?.name || ''}
        required={true}
        submitText={'Enregistrer'}
        cancelText={'Annuler'}
        onSubmit={(v) => { setLangPromptOpen(false); const nv = String(v || '').trim(); if (!nv || !editingLang) return; updateLanguage.mutate({ id: editingLang.id, name: nv }); }}
        onCancel={() => setLangPromptOpen(false)}
      />
    </div>
  );
}

export default AdminDashboard;
