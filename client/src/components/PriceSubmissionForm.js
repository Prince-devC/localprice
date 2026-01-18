import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { agriculturalPriceService, productCategoryService, localityService, unitService, productService, languageService, contributionsService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import ConfirmModal from './ConfirmModal';
import styled, { keyframes } from 'styled-components';
import { toast } from 'react-hot-toast';
import { isValidPhone } from '../utils/validation';

const FormContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 720px;
  margin: 2rem auto;
  width: 100%;

  @media (max-width: 640px) {
    padding: 1rem;
    margin: 1rem auto;
    border-radius: 10px;
  }
`;

const Title = styled.h2`
  color: var(--gray-800);
  margin-bottom: 1.5rem;
  text-align: center;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
`;

const Label = styled.label`
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--gray-700);
`;

const Required = styled.span`
  color: var(--danger-color);
  margin-left: 0.25rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 2px solid var(--gray-200);
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }

  &:invalid {
    border-color: var(--danger-color);
  }
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 2px solid var(--gray-200);
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem;
  border: 2px solid var(--gray-200);
  border-radius: 8px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const Button = styled.button`
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 0.5rem;
  line-height: 1;

  &:hover {
    background: var(--primary-dark);
    transform: translateY(-2px);
  }

  &:disabled {
    background: var(--gray-300);
    cursor: not-allowed;
    transform: none;
  }
`;

const spinAnim = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const BtnSpinner = styled.span`
  display: inline-block;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-top-color: #ffffff;
  animation: ${spinAnim} 0.8s linear infinite;
`;

const SuccessMessage = styled.div`
  background: #d4edda;
  color: #155724;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  margin-bottom: 1rem;
  border: 1px solid #c3e6cb;
`;

const ErrorMessage = styled.div`
  background: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  margin-bottom: 1rem;
  border: 1px solid #f5c6cb;
`;

const InfoMessage = styled.div`
  background: #d1ecf1;
  color: #0c5460;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  margin-bottom: 1rem;
  border: 1px solid #bee5eb;
`;

const HubActions = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
`;

const HubButton = styled.button`
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  border: 1px solid var(--gray-200);
  background: var(--gray-50);
  color: var(--gray-800);
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover { background: #eef2ff; }
  &:disabled { cursor: not-allowed; opacity: 0.6; }
`;

// Actions inline pour éviter que les boutons collent aux champs
const InlineActions = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: flex-start;
  margin-top: 0.5rem;
`;

const HelpText = styled.div`
  color: var(--gray-600);
  font-size: 0.875rem;
`;

const AccuracyBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.5rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
  background: ${props => props.$level === 'good' ? 'var(--success-color)' : props.$level === 'ok' ? 'var(--accent-color)' : 'var(--danger-color)'};
`;

const GridTwoCols = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const PriceSubmissionForm = () => {
  const { user, roles, isAuthenticated } = useAuth();
  // Statut de demande de contribution pour compléter la détection du rôle
  const { data: myReqResponse } = useQuery(
    ['contribution-me'],
    () => contributionsService.getMyRequest().then(r => r?.data?.data || null),
    { enabled: !!isAuthenticated, staleTime: 10_000 }
  );
  const myRequest = myReqResponse || null;
  const isAdmin = !!(
    (roles && (roles.includes('admin') || roles.includes('super_admin'))) ||
    (user?.user_metadata && (user.user_metadata.role === 'admin' || user.user_metadata.role === 'super_admin')) ||
    (user?.app_metadata && (user.app_metadata.role === 'admin' || user.app_metadata.role === 'super_admin')) ||
    (user?.role === 'admin' || user?.role === 'super_admin')
  );
  const isContributor = !!(
    (roles && roles.includes('contributor')) ||
    (user?.user_metadata && user.user_metadata.role === 'contributor') ||
    (user?.app_metadata && user.app_metadata.role === 'contributor') ||
    user?.role === 'contributor'
  );
  const isContributorAlt = isContributor || (myRequest?.status === 'approved');
  const [activeTab, setActiveTab] = useState('price');
  const [formData, setFormData] = useState({
    product_id: '',
    locality_id: '',
    unit_id: '',
    price: '',
    date: new Date().toISOString().split('T')[0],
    comment: '',
    latitude: '',
    longitude: '',
    source: '',
    source_type: '',
    source_contact_name: '',
    source_contact_phone: '',
    source_contact_relation: ''
  });

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [localities, setLocalities] = useState([]);
  const [units, setUnits] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [selectedLanguageId, setSelectedLanguageId] = useState('');
  const [showNewLanguage, setShowNewLanguage] = useState(false);
  const [newLanguageName, setNewLanguageName] = useState('');
  const [creatingLanguage, setCreatingLanguage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [geoAccuracy, setGeoAccuracy] = useState(null);
  const [locating, setLocating] = useState(false);
  const [gpsConfirm, setGpsConfirm] = useState({ open: false, payload: null });
  const [draftLoaded, setDraftLoaded] = useState(false);

  // Création inline
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryType, setNewCategoryType] = useState('brut');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [creatingCategory, setCreatingCategory] = useState(false);

  const [showNewProduct, setShowNewProduct] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [creatingProduct, setCreatingProduct] = useState(false);
  const [showNewUnit, setShowNewUnit] = useState(false);
  const [newUnitName, setNewUnitName] = useState('');
  const [newUnitSymbol, setNewUnitSymbol] = useState('');
  const [creatingUnit, setCreatingUnit] = useState(false);
  // Sous-localité (village/quartier/hameau)
  const [subLocality, setSubLocality] = useState('');
  // Autosauvegarde locale
  useEffect(() => {
    try {
      const raw = localStorage.getItem('price-submit-draft');
      if (raw) {
        const draft = JSON.parse(raw);
        if (draft.formData && typeof draft.formData === 'object') {
          setFormData(prev => ({ ...prev, ...draft.formData }));
        }
        if (typeof draft.subLocality === 'string') setSubLocality(draft.subLocality);
        if (typeof draft.selectedLanguageId !== 'undefined') setSelectedLanguageId(draft.selectedLanguageId);
      }
    } catch {}
    finally {
      // Marquer le brouillon comme chargé pour éviter d'écraser les données au premier rendu
      setDraftLoaded(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!draftLoaded) return;
    const draft = { formData, subLocality, selectedLanguageId };
    try { localStorage.setItem('price-submit-draft', JSON.stringify(draft)); } catch {}
  }, [formData, subLocality, selectedLanguageId, draftLoaded]);

  // Charger les données de référence
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, localitiesRes, unitsRes, languagesRes] = await Promise.all([
          productCategoryService.getAll(),
          localityService.getAll(),
          unitService.getAll(),
          languageService.getAll()
        ]);

        setCategories(categoriesRes.data.data || []);
        setLocalities(localitiesRes.data.data || []);
        setUnits(unitsRes.data.data || []);
        const langs = (languagesRes.data?.data) || [];
        setLanguages(langs);
        // Sélectionner par défaut Français ou Fon si présents
        const defaultLang = langs.find(l => ['français','fon'].includes(String(l.name).trim().toLowerCase())) || langs[0];
        // Ne pas écraser une langue déjà restaurée depuis le brouillon
        setSelectedLanguageId(prev => prev || (defaultLang ? defaultLang.id : ''));
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
        setError('Erreur lors du chargement des données de référence');
      }
    };

    fetchData();
  }, []);

  // Charger les produits quand une catégorie est sélectionnée
  useEffect(() => {
    const loadProducts = async () => {
      try {
        if (!formData.category_id) { setProducts([]); return; }
        const res = await productService.getByCategory(formData.category_id);
        setProducts(res.data.data || []);
      } catch (err) {
        console.error('Erreur chargement produits par catégorie:', err);
        setError('Erreur lors du chargement des produits de la catégorie');
      }
    };
    loadProducts();
  }, [formData.category_id]);

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) { setError('Nom de catégorie requis'); return; }
    if (!['brut','transforme'].includes(newCategoryType)) { setError('Type de catégorie invalide'); return; }
    // Éviter les doublons côté client
    if (categories.some(c => String(c.name).trim().toLowerCase() === newCategoryName.trim().toLowerCase())) {
      setError('Catégorie déjà existante');
      return;
    }
    try {
      setCreatingCategory(true);
      setError(null);
      const res = await productCategoryService.create({ name: newCategoryName.trim(), type: newCategoryType, description: newCategoryDescription || null });
      const newId = res.data?.data?.id;
      const newCat = { id: newId, name: newCategoryName.trim(), type: newCategoryType, description: newCategoryDescription || null };
      setCategories(prev => [newCat, ...prev]);
      setShowNewCategory(false);
      setNewCategoryName('');
      setNewCategoryType('brut');
      setNewCategoryDescription('');
      setFormData(prev => ({ ...prev, category_id: newId }));
    } catch (err) {
      console.error('Erreur création catégorie:', err);
      setError(err.response?.data?.message || 'Impossible de créer la catégorie');
    } finally {
      setCreatingCategory(false);
    }
  };

  const handleCreateProduct = async () => {
    if (!formData.category_id) { setError('Sélectionnez une catégorie avant de créer un produit'); return; }
    if (!newProductName.trim()) { setError('Nom de produit requis'); return; }
    // Éviter les doublons côté client (sur la catégorie sélectionnée)
    if (products.some(p => String(p.name).trim().toLowerCase() === newProductName.trim().toLowerCase())) {
      setError('Produit déjà existant dans cette catégorie');
      return;
    }
    try {
      setCreatingProduct(true);
      setError(null);
      const payload = { name: newProductName.trim(), category_id: parseInt(formData.category_id, 10), description: null, brand: null, barcode: null, image_url: null };
      const res = await productService.create(payload);
      const newId = res.data?.data?.id;
      const newProd = { id: newId, name: newProductName.trim(), category_id: parseInt(formData.category_id, 10) };
      setProducts(prev => [newProd, ...prev]);
      setShowNewProduct(false);
      setNewProductName('');
      setFormData(prev => ({ ...prev, product_id: newId }));
    } catch (err) {
      console.error('Erreur création produit:', err);
      setError(err.response?.data?.message || 'Impossible de créer le produit');
    } finally {
      setCreatingProduct(false);
    }
  };

  const handleCreateUnit = async () => {
    if (!newUnitName.trim()) { setError('Nom d\'unité requis'); return; }
    // Éviter les doublons côté client
    if (units.some(u => String(u.name).trim().toLowerCase() === newUnitName.trim().toLowerCase())) {
      setError('Unité déjà existante');
      return;
    }
    try {
      setCreatingUnit(true);
      setError(null);
      const payload = { name: newUnitName.trim(), symbol: newUnitSymbol.trim() };
      const res = await unitService.create(payload);
      const newId = res.data?.data?.id;
      const newUnit = { id: newId, name: newUnitName.trim(), symbol: newUnitSymbol.trim() };
      setUnits(prev => [newUnit, ...prev]);
      setShowNewUnit(false);
      setNewUnitName('');
      setNewUnitSymbol('');
      setFormData(prev => ({ ...prev, unit_id: newId }));
    } catch (err) {
      console.error('Erreur création unité:', err);
      setError(err.response?.data?.message || 'Impossible de créer l\'unité');
    } finally {
      setCreatingUnit(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const proceedSubmit = async (payload) => {
    try {
      setLoading(true);
      setError(null);
      const response = await agriculturalPriceService.submit(payload);
      
      if (response.data.success) {
        setSuccess(true);
        toast.success('Prix soumis avec succès');
        setFormData({
          product_id: '',
          locality_id: '',
          unit_id: '',
          price: '',
          date: new Date().toISOString().split('T')[0],
          comment: '',
          latitude: '',
          longitude: '',
          source: '',
          source_type: '',
          source_contact_name: '',
          source_contact_phone: '',
          source_contact_relation: ''
        });
        const defaultLang = languages.find(l => ['français','fon'].includes(String(l.name).trim().toLowerCase())) || languages[0];
        setSelectedLanguageId(defaultLang ? defaultLang.id : '');
        setGeoAccuracy(null);
        setSubLocality('');
        try { localStorage.removeItem('price-submit-draft'); } catch {}
      } else {
        setError(response.data.message || 'Erreur lors de la soumission');
      }
    } catch (err) {
      console.error('Erreur lors de la soumission:', err);
      setError(err.response?.data?.message || 'Erreur lors de la soumission du prix');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated || !user) {
      setError('Vous devez être connecté pour soumettre un prix');
      return;
    }

    if (!isContributorAlt && !isAdmin) {
      setError('Seuls les contributeurs peuvent soumettre des prix');
      return;
    }

    try {
      setError(null);

      if (!formData.source || !formData.source.trim()) {
        setError('La source est requise pour assurer la fiabilité.');
        setLoading(false);
        return;
      }
      const allowedTypes = ['producteur','transformateur','cooperative','grossiste','commercant','autre'];
      if (!formData.source_type || !allowedTypes.includes(String(formData.source_type).toLowerCase())) {
        setError('Sélectionnez le type de source (producteur, transformateur, coopérative, grossiste, commerçant, autre).');
        setLoading(false);
        return;
      }
      if (formData.source_contact_phone && !isValidPhone(formData.source_contact_phone)) {
        setError('Numéro de contact invalide. Utilisez le format 01XXXXXXXX.');
        setLoading(false);
        return;
      }

      const payload = { ...formData };
      if (subLocality && subLocality.trim()) {
        payload.sub_locality = subLocality.trim();
      }
      if (formData.latitude && formData.longitude) {
        payload.latitude = Number(formData.latitude);
        payload.longitude = Number(formData.longitude);
      } else {
        payload.latitude = null;
        payload.longitude = null;
      }
      payload.geo_accuracy = geoAccuracy != null ? Number(geoAccuracy) : null;
      // Langue choisie (select mono) envoyée sous forme de liste à 1 élément
      payload.source_language_ids = selectedLanguageId ? [selectedLanguageId] : [];

      const acc = payload.geo_accuracy;
      const hasCoords = payload.latitude != null && payload.longitude != null;
      // Ouvrir la confirmation si :
      // - précision absente mais des coordonnées sont présentes, ou
      // - précision mesurée >= 10 m
      if ((hasCoords && (acc == null || (typeof acc === 'number' && acc >= 10)))) {
        setGpsConfirm({ open: true, payload });
        return;
      }
      await proceedSubmit(payload);
    } catch (err) {
      console.error('Erreur lors de la soumission:', err);
      setError(err.response?.data?.message || 'Erreur lors de la soumission du prix');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <FormContainer>
        <InfoMessage>
          Vous devez être connecté pour soumettre des prix agricoles.
        </InfoMessage>
      </FormContainer>
    );
  }

  if (!isContributorAlt && !isAdmin) {
    return (
      <FormContainer>
        <InfoMessage>
          Seuls les contributeurs peuvent soumettre des prix. Contactez un administrateur pour obtenir les droits.
        </InfoMessage>
      </FormContainer>
    );
  }

  return (
    <FormContainer>
      <Title>Soumettre un Prix de Produit Agricole</Title>
      <HubActions>
        <HubButton onClick={() => setActiveTab('price')}>Ajouter un prix</HubButton>
        <HubButton disabled onClick={() => setActiveTab('supplier')}>Ajouter un fournisseur</HubButton>
        <HubButton disabled onClick={() => setActiveTab('store')}>Ajouter un magasin</HubButton>
      </HubActions>
      
      {success && (
        <SuccessMessage>
          Prix soumis avec succès ! Il sera examiné par un administrateur avant publication.
        </SuccessMessage>
      )}

      {error && (
        <ErrorMessage>
          {error}
        </ErrorMessage>
      )}

      {activeTab === 'price' ? (
        <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label>
            Catégorie de produit <Required>*</Required>
          </Label>
          <Select
            name="category_id"
            value={formData.category_id}
            onChange={handleInputChange}
            required
          >
            <option value="">Sélectionner une catégorie</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name} ({category.type})
              </option>
            ))}
          </Select>
          <InlineActions>
            <HubButton type="button" onClick={() => setShowNewCategory(v => !v)}>
              {showNewCategory ? 'Annuler' : 'Ajouter une catégorie'}
            </HubButton>
          </InlineActions>
          {showNewCategory && (
            <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:'0.5rem', marginTop:'0.5rem' }}>
              <Input type="text" placeholder="Nom de la nouvelle catégorie" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} />
              <Select value={newCategoryType} onChange={e => setNewCategoryType(e.target.value)} aria-label="Type de catégorie">
                <option value="brut">Brut</option>
                <option value="transforme">Transformé</option>
              </Select>
              <Input type="text" placeholder="Description (optionnel)" value={newCategoryDescription} onChange={e => setNewCategoryDescription(e.target.value)} />
              <InlineActions>
                <HubButton type="button" disabled={creatingCategory} onClick={handleCreateCategory}>{creatingCategory ? 'Création…' : 'Créer la catégorie'}</HubButton>
              </InlineActions>
            </div>
          )}
        </FormGroup>

        <FormGroup>
          <Label>
            Produit <Required>*</Required>
          </Label>
          <Select
            name="product_id"
            value={formData.product_id}
            onChange={handleInputChange}
            required
          >
            <option value="">Sélectionner un produit</option>
            {products.map(product => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </Select>
          <InlineActions>
            <HubButton type="button" disabled={!formData.category_id} onClick={() => setShowNewProduct(v => !v)}>
              {showNewProduct ? 'Annuler' : 'Ajouter un produit'}
            </HubButton>
          </InlineActions>
          {showNewProduct && (
            <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:'0.5rem', marginTop:'0.5rem' }}>
              <Input type="text" placeholder="Nom du nouveau produit" value={newProductName} onChange={e => setNewProductName(e.target.value)} />
              <HelpText>Le produit sera ajouté dans la catégorie sélectionnée ci-dessus.</HelpText>
              <InlineActions>
                <HubButton type="button" disabled={creatingProduct} onClick={handleCreateProduct}>{creatingProduct ? 'Création…' : 'Créer le produit'}</HubButton>
              </InlineActions>
            </div>
          )}
        </FormGroup>

        <FormGroup>
          <Label>
            Commune / Localité <Required>*</Required>
          </Label>
          <Select
            name="locality_id"
            value={formData.locality_id}
            onChange={handleInputChange}
            required
          >
            <option value="">Sélectionner une localité</option>
            {localities.map(locality => (
              <option key={locality.id} value={locality.id}>
                {locality.name}
              </option>
            ))}
          </Select>
          <Input
            type="text"
            placeholder="Village / Quartier / Hameau (optionnel)"
            value={subLocality}
            onChange={(e) => setSubLocality(e.target.value)}
          />
          <HelpText>Décrivez la sous-localité précise (village, quartier, hameau) si utile.</HelpText>
        </FormGroup>

        <FormGroup>
          <Label>
            Prix (FCFA) <Required>*</Required>
          </Label>
          <Input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            placeholder="Prix en FCFA"
            min="0"
            step="0.01"
            required
          />
        </FormGroup>

        <FormGroup>
          <Label>
            Unité <Required>*</Required>
          </Label>
          <Select
            name="unit_id"
            value={formData.unit_id}
            onChange={handleInputChange}
            required
          >
            <option value="">Sélectionner une unité</option>
            {units.map(unit => (
              <option key={unit.id} value={unit.id}>
                {unit.name} ({unit.symbol})
              </option>
            ))}
          </Select>
          <InlineActions>
            <HubButton type="button" onClick={() => setShowNewUnit(v => !v)}>
              {showNewUnit ? 'Annuler' : 'Ajouter une unité'}
            </HubButton>
          </InlineActions>
          {showNewUnit && (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 200px', gap:'0.5rem', marginTop:'0.5rem' }}>
              <Input type="text" placeholder="Nom de la nouvelle unité" value={newUnitName} onChange={e => setNewUnitName(e.target.value)} />
              <Input type="text" placeholder="Symbole (ex: kg, L, m)" value={newUnitSymbol} onChange={e => setNewUnitSymbol(e.target.value)} />
              <InlineActions>
                <HubButton type="button" disabled={creatingUnit} onClick={handleCreateUnit}>{creatingUnit ? 'Création…' : 'Créer l\'unité'}</HubButton>
              </InlineActions>
            </div>
          )}
        </FormGroup>

        <FormGroup>
          <Label>
            Date <Required>*</Required>
          </Label>
          <Input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            max={new Date().toISOString().split('T')[0]}
            required
          />
        </FormGroup>

        <FormGroup>
          <Label>Commentaire (optionnel)</Label>
          <TextArea
            name="comment"
            value={formData.comment}
            onChange={handleInputChange}
            placeholder="Informations supplémentaires sur ce prix..."
            maxLength="500"
          />
        </FormGroup>

        <FormGroup>
          <Label>
            Fiabilité de la source <Required>*</Required>
          </Label>
          <Input
            type="text"
            name="source"
            value={formData.source}
            onChange={handleInputChange}
            placeholder="Nom de la source (ex: K. Diarra, marché X)"
            required
          />
          <GridTwoCols>
            <Select
              name="source_type"
              value={formData.source_type}
              onChange={handleInputChange}
              required
            >
              <option value="">Type de source</option>
              <option value="producteur">Producteur</option>
              <option value="cooperative">Coopérative</option>
              <option value="transformateur">Transformateur</option>
              <option value="grossiste">Grossiste</option>
              <option value="commercant">Commerçant</option>
              <option value="autre">Autre</option>
            </Select>
            <Input
              type="text"
              name="source_contact_name"
              value={formData.source_contact_name}
              onChange={handleInputChange}
              placeholder="Nom du contact (optionnel)"
            />
          </GridTwoCols>
          <GridTwoCols>
            <Input
              type="tel"
              name="source_contact_phone"
              value={formData.source_contact_phone}
              onChange={handleInputChange}
              placeholder="Téléphone du contact (01XXXXXXXX)"
            />
            <Select
              name="source_contact_relation"
              value={formData.source_contact_relation}
              onChange={handleInputChange}
            >
              <option value="">Lien du contact (optionnel)</option>
              <option value="moi">Moi</option>
              <option value="proche">Proche</option>
              <option value="autre">Autre</option>
            </Select>
          </GridTwoCols>
          <HelpText>
            Ces informations aident à vérifier la fiabilité (type de source requis; contact facultatif).
          </HelpText>
        </FormGroup>

        <FormGroup>
          <Label>
            Géolocalisation (idéalement &le; 10 m)
          </Label>
          <HubActions>
            <HubButton
              type="button"
              onClick={() => {
                if (!navigator.geolocation) {
                  setError('La géolocalisation n\'est pas supportée par votre navigateur.');
                  return;
                }
                setError(null);
                setLocating(true);
                navigator.geolocation.getCurrentPosition(
                  (pos) => {
                    const { latitude, longitude, accuracy } = pos.coords;
                    setFormData(prev => ({ ...prev, latitude, longitude }));
                    setGeoAccuracy(accuracy);
                    setLocating(false);
                  },
                  (err) => {
                    console.error('Geolocation error:', err);
                    setError('Impossible d\'obtenir la position. Veuillez autoriser la localisation ou réessayer.');
                    setLocating(false);
                  },
                  { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
                );
              }}
            >
              {locating ? 'Recherche…' : 'Utiliser ma position'}
            </HubButton>
          </HubActions>
          {geoAccuracy != null && (
            <div className="mt-2">
              <HelpText>
                Précision capturée:
                { ' ' }
                <AccuracyBadge $level={geoAccuracy <= 10 ? 'good' : geoAccuracy <= 50 ? 'ok' : 'bad'}>
                  {geoAccuracy.toFixed(1)} m
                </AccuracyBadge>
              </HelpText>
            </div>
          )}
          <HelpText className="mt-2">
            Conseil: activez la haute précision GPS et restez à ciel ouvert pour une meilleure précision (idéalement ≤ 10 m). Si la précision mesurée dépasse 10 m, le prix sera rejeté.
          </HelpText>
          <GridTwoCols>
            <Input
              type="number"
              name="latitude"
              value={formData.latitude}
              onChange={handleInputChange}
              placeholder="Latitude"
              step="0.000001"
            />
            <Input
              type="number"
              name="longitude"
              value={formData.longitude}
              onChange={handleInputChange}
              placeholder="Longitude"
              step="0.000001"
            />
          </GridTwoCols>
        </FormGroup>

        <FormGroup>
          <Label>
            Langue de communication avec la source
          </Label>
          <Select
            value={selectedLanguageId}
            onChange={(e) => setSelectedLanguageId(e.target.value)}
          >
            <option value="">Sélectionner une langue</option>
            {languages.map(lang => (
              <option key={lang.id} value={lang.id}>{lang.name}</option>
            ))}
          </Select>
          <HelpText>Par défaut: Français ou Fon si disponibles.</HelpText>
          <InlineActions>
            <HubButton type="button" onClick={() => setShowNewLanguage(v => !v)}>
              {showNewLanguage ? 'Annuler' : 'Ajouter une langue'}
            </HubButton>
          </InlineActions>
          {showNewLanguage && (
            <div style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:'0.5rem', marginTop:'0.5rem' }}>
              <Input type="text" placeholder="Nouvelle langue" value={newLanguageName} onChange={e => setNewLanguageName(e.target.value)} />
              <HubButton
                type="button"
                disabled={creatingLanguage}
                onClick={async () => {
                  const name = newLanguageName.trim();
                  if (!name) { setError('Nom de langue requis'); return; }
                  if (languages.some(l => String(l.name).trim().toLowerCase() === name.toLowerCase())) {
                    setError('La langue existe déjà');
                    return;
                  }
                  try {
                    setCreatingLanguage(true);
                    setError(null);
                    const res = await languageService.create(name);
                    const id = res.data?.data?.id;
                    const created = { id, name };
                    setLanguages(prev => [created, ...prev]);
                    setSelectedLanguageId(id);
                    setNewLanguageName('');
                    setShowNewLanguage(false);
                  } catch (err) {
                    setError(err.response?.data?.message || 'Impossible de créer la langue');
                  } finally {
                    setCreatingLanguage(false);
                  }
                }}
              >{creatingLanguage ? 'Création…' : 'Ajouter'}</HubButton>
            </div>
          )}
        </FormGroup>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <small style={{ color: '#6b7280' }}>Brouillon auto-enregistré localement</small>
          <button type="button" onClick={() => {
            try { localStorage.removeItem('price-submit-draft'); } catch {}
            setFormData({
              product_id: '',
              locality_id: '',
              unit_id: '',
              price: '',
              date: new Date().toISOString().split('T')[0],
              comment: '',
              latitude: '',
              longitude: '',
              source: '',
              source_type: '',
              source_contact_name: '',
              source_contact_phone: '',
              source_contact_relation: ''
            });
            const defaultLang = languages.find(l => ['français','fon'].includes(String(l.name).trim().toLowerCase())) || languages[0];
            setSelectedLanguageId(defaultLang ? defaultLang.id : '');
            setGeoAccuracy(null);
            setSubLocality('');
            toast.success('Brouillon effacé');
          }} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}>Effacer le brouillon</button>
        </div>

        <Button type="submit" disabled={loading} aria-busy={loading}>
          {loading ? (<>
            <BtnSpinner aria-hidden="true" />
            Envoi…
          </>) : 'Soumettre le prix'}
        </Button>
      </Form>
      ) : (
        <InfoMessage>Fonctionnalité à venir</InfoMessage>
      )}
      <ConfirmModal
        open={gpsConfirm.open}
        title="Précision GPS supérieure à 10 m"
        message="La précision mesurée est supérieure à 10 m. Si vous soumettez, ce prix sera rejeté. Voulez-vous continuer ?"
        onConfirm={() => { const p = gpsConfirm.payload; setGpsConfirm({ open: false, payload: null }); if (p) proceedSubmit(p); }}
        onCancel={() => setGpsConfirm({ open: false, payload: null })}
      />
    </FormContainer>
  );
};

export default PriceSubmissionForm;



