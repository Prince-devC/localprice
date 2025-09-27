import React, { useState, useEffect } from 'react';
import { costService, localityService } from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import styled from 'styled-components';

const ComparatorContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin: 2rem 0;
`;

const Title = styled.h2`
  color: #2c3e50;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
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

const Button = styled.button`
  background: linear-gradient(135deg, #3498db, #2980b9);
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

const ResultsContainer = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 1.5rem;
`;

const ResultsTitle = styled.h3`
  color: #2c3e50;
  margin-bottom: 1rem;
  text-align: center;
`;

const CostBreakdown = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
`;

const CostItem = styled.div`
  background: white;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  border-left: 4px solid #3498db;
`;

const CostLabel = styled.div`
  font-size: 0.9rem;
  color: #7f8c8d;
  margin-bottom: 0.5rem;
`;

const CostValue = styled.div`
  font-size: 1.2rem;
  font-weight: 600;
  color: #2c3e50;
`;

const TotalCost = styled.div`
  background: linear-gradient(135deg, #27ae60, #2ecc71);
  color: white;
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
  margin-top: 1rem;
`;

const TotalLabel = styled.div`
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
`;

const TotalValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
`;

const ErrorMessage = styled.div`
  background: #e74c3c;
  color: white;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  margin-top: 1rem;
`;

const CostComparator = () => {
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    distance: '',
    volume: 1,
    unit: 'kg',
    storageDays: 0
  });

  const [localities, setLocalities] = useState([]);
  const [costs, setCosts] = useState({
    transport: 0,
    storage: 0
  });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Charger les localités au montage
  useEffect(() => {
    const fetchLocalities = async () => {
      try {
        const response = await localityService.getAll();
        setLocalities(response.data.data || []);
      } catch (err) {
        console.error('Erreur lors du chargement des localités:', err);
      }
    };

    fetchLocalities();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateDistance = (origin, destination) => {
    // Calcul simple basé sur les coordonnées (à améliorer avec une vraie API de distance)
    const originLocality = localities.find(l => l.name === origin);
    const destLocality = localities.find(l => l.name === destination);
    
    if (originLocality && destLocality) {
      const R = 6371; // Rayon de la Terre en km
      const dLat = (destLocality.latitude - originLocality.latitude) * Math.PI / 180;
      const dLon = (destLocality.longitude - originLocality.longitude) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(originLocality.latitude * Math.PI / 180) * Math.cos(destLocality.latitude * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    }
    return 0;
  };

  const handleCalculate = async () => {
    try {
      setLoading(true);
      setError(null);

      // Calculer la distance si pas fournie
      let distance = parseFloat(formData.distance);
      if (!distance && formData.origin && formData.destination) {
        distance = calculateDistance(formData.origin, formData.destination);
      }

      if (!distance) {
        throw new Error('Distance requise pour le calcul');
      }

      // Calculer les coûts
      const transportResponse = await costService.calculateTransport({
        distance: distance,
        volume: formData.volume
      });

      const storageResponse = await costService.calculateStorage({
        days: formData.storageDays,
        volume: formData.volume,
        unit: formData.unit
      });

      const transportCost = transportResponse.data.data.cost;
      const storageCost = storageResponse.data.data.cost;
      const totalCost = transportCost + storageCost;

      setResults({
        transportCost,
        storageCost,
        totalCost,
        distance,
        volume: formData.volume,
        unit: formData.unit,
        storageDays: formData.storageDays
      });

    } catch (err) {
      console.error('Erreur lors du calcul:', err);
      setError(err.message || 'Erreur lors du calcul des coûts');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ComparatorContainer>
      <Title>Comparateur de Coûts Agricoles</Title>
      
      <FormGrid>
        <FormGroup>
          <Label>Origine</Label>
          <Select
            name="origin"
            value={formData.origin}
            onChange={handleInputChange}
          >
            <option value="">Sélectionner une localité</option>
            {localities.map(locality => (
              <option key={locality.id} value={locality.name}>
                {locality.name}
              </option>
            ))}
          </Select>
        </FormGroup>

        <FormGroup>
          <Label>Destination</Label>
          <Select
            name="destination"
            value={formData.destination}
            onChange={handleInputChange}
          >
            <option value="">Sélectionner une localité</option>
            {localities.map(locality => (
              <option key={locality.id} value={locality.name}>
                {locality.name}
              </option>
            ))}
          </Select>
        </FormGroup>

        <FormGroup>
          <Label>Distance (km)</Label>
          <Input
            type="number"
            name="distance"
            value={formData.distance}
            onChange={handleInputChange}
            placeholder="Distance en kilomètres"
            min="0"
            step="0.1"
          />
        </FormGroup>

        <FormGroup>
          <Label>Volume</Label>
          <Input
            type="number"
            name="volume"
            value={formData.volume}
            onChange={handleInputChange}
            min="0"
            step="0.1"
          />
        </FormGroup>

        <FormGroup>
          <Label>Unité</Label>
          <Select
            name="unit"
            value={formData.unit}
            onChange={handleInputChange}
          >
            <option value="kg">Kilogramme (kg)</option>
            <option value="tonne">Tonne (t)</option>
            <option value="q">Quintal (q)</option>
          </Select>
        </FormGroup>

        <FormGroup>
          <Label>Durée de stockage (jours)</Label>
          <Input
            type="number"
            name="storageDays"
            value={formData.storageDays}
            onChange={handleInputChange}
            min="0"
            step="1"
          />
        </FormGroup>
      </FormGrid>

      <div style={{ textAlign: 'center' }}>
        <Button 
          onClick={handleCalculate} 
          disabled={loading || !formData.origin || !formData.destination}
        >
          {loading ? <LoadingSpinner /> : 'Calculer les coûts'}
        </Button>
      </div>

      {error && (
        <ErrorMessage>
          {error}
        </ErrorMessage>
      )}

      {results && (
        <ResultsContainer>
          <ResultsTitle>Résultats du calcul</ResultsTitle>
          
          <CostBreakdown>
            <CostItem>
              <CostLabel>Distance</CostLabel>
              <CostValue>{results.distance.toFixed(1)} km</CostValue>
            </CostItem>
            
            <CostItem>
              <CostLabel>Volume</CostLabel>
              <CostValue>{results.volume} {results.unit}</CostValue>
            </CostItem>
            
            <CostItem>
              <CostLabel>Coût transport</CostLabel>
              <CostValue>{results.transportCost.toFixed(0)} FCFA</CostValue>
            </CostItem>
            
            <CostItem>
              <CostLabel>Coût stockage</CostLabel>
              <CostValue>{results.storageCost.toFixed(0)} FCFA</CostValue>
            </CostItem>
          </CostBreakdown>

          <TotalCost>
            <TotalLabel>Coût total estimé</TotalLabel>
            <TotalValue>{results.totalCost.toFixed(0)} FCFA</TotalValue>
          </TotalCost>
        </ResultsContainer>
      )}
    </ComparatorContainer>
  );
};

export default CostComparator;



