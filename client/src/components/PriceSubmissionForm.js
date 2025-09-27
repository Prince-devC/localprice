import React, { useState, useEffect } from 'react';
import { agriculturalPriceService, productCategoryService, localityService, unitService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import styled from 'styled-components';

const FormContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  margin: 2rem auto;
`;

const Title = styled.h2`
  color: #2c3e50;
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
`;

const Label = styled.label`
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #34495e;
`;

const Required = styled.span`
  color: #e74c3c;
  margin-left: 0.25rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #3498db;
  }

  &:invalid {
    border-color: #e74c3c;
  }
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const Button = styled.button`
  background: linear-gradient(135deg, #27ae60, #2ecc71);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }

  &:disabled {
    background: #bdc3c7;
    cursor: not-allowed;
    transform: none;
  }
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

const PriceSubmissionForm = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    product_id: '',
    locality_id: '',
    unit_id: '',
    price: '',
    date: new Date().toISOString().split('T')[0],
    comment: ''
  });

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [localities, setLocalities] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Charger les données de référence
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, localitiesRes, unitsRes] = await Promise.all([
          productCategoryService.getAll(),
          localityService.getAll(),
          unitService.getAll()
        ]);

        setCategories(categoriesRes.data.data || []);
        setLocalities(localitiesRes.data.data || []);
        setUnits(unitsRes.data.data || []);
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
        setError('Erreur lors du chargement des données de référence');
      }
    };

    fetchData();
  }, []);

  // Charger les produits quand une catégorie est sélectionnée
  useEffect(() => {
    if (formData.category_id) {
      // Ici on pourrait charger les produits de la catégorie sélectionnée
      // Pour l'instant, on utilise tous les produits
    }
  }, [formData.category_id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setError('Vous devez être connecté pour soumettre un prix');
      return;
    }

    if (user.role !== 'contributor' && user.role !== 'admin') {
      setError('Seuls les contributeurs peuvent soumettre des prix');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await agriculturalPriceService.submit(formData);
      
      if (response.data.success) {
        setSuccess(true);
        setFormData({
          product_id: '',
          locality_id: '',
          unit_id: '',
          price: '',
          date: new Date().toISOString().split('T')[0],
          comment: ''
        });
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

  if (!user) {
    return (
      <FormContainer>
        <InfoMessage>
          Vous devez être connecté pour soumettre des prix agricoles.
        </InfoMessage>
      </FormContainer>
    );
  }

  if (user.role !== 'contributor' && user.role !== 'admin') {
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
      <Title>Soumettre un Prix Agricole</Title>
      
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
        </FormGroup>

        <FormGroup>
          <Label>
            Localité <Required>*</Required>
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

        <Button type="submit" disabled={loading}>
          {loading ? <LoadingSpinner /> : 'Soumettre le prix'}
        </Button>
      </Form>
    </FormContainer>
  );
};

export default PriceSubmissionForm;



