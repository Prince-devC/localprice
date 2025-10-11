import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FiArrowLeft, FiMapPin, FiPhone, FiMail, FiInfo } from 'react-icons/fi';
import { supplierService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const Container = styled.div`
  padding: 2rem 0;
`;

const Card = styled.div`
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow);
  padding: 2rem;
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: bold;
  color: var(--gray-800);
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: var(--gray-100);
  color: var(--gray-700);
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  &:hover { background: var(--gray-200); }
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--gray-700);
`;

const SupplierContact = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true, state: { redirectTo: `/supplier/${id}/contact` } });
      return;
    }
    const fetchSummary = async () => {
      try {
        const res = await supplierService.getSummary(id);
        setSummary(res.data);
      } catch (err) {
        console.error('Erreur chargement résumé fournisseur:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, [id, isAuthenticated, navigate]);

  if (!isAuthenticated) return null;
  if (loading) return <LoadingSpinner text="Chargement des informations de contact..." />;
  if (!summary?.details) {
    return (
      <Container>
        <div className="container">
          <Card>
            <HeaderRow>
              <Title><FiInfo /> Informations indisponibles</Title>
              <BackButton onClick={() => window.history.back()}>
                <FiArrowLeft /> Retour
              </BackButton>
            </HeaderRow>
            <p>Impossible d’afficher les informations de contact pour ce fournisseur.</p>
          </Card>
        </div>
      </Container>
    );
  }

  const d = summary.details;
  return (
    <Container>
      <div className="container">
        <Card>
          <HeaderRow>
            <Title>{d.name}</Title>
            <BackButton onClick={() => window.history.back()}>
              <FiArrowLeft /> Retour
            </BackButton>
          </HeaderRow>
          <Row style={{ marginBottom: '1rem' }}>
            <InfoItem>
              <FiMapPin />
              <span>{d.address || '—'}, {d.locality_name || '—'}</span>
            </InfoItem>
            {d.contact_phone && (
              <InfoItem>
                <FiPhone />
                <a href={`tel:${d.contact_phone}`}>{d.contact_phone}</a>
              </InfoItem>
            )}
            {d.contact_email && (
              <InfoItem>
                <FiMail />
                <a href={`mailto:${d.contact_email}`}>{d.contact_email}</a>
              </InfoItem>
            )}
          </Row>
          <p style={{ color: 'var(--gray-600)' }}>
            Ces informations de contact sont réservées aux utilisateurs connectés.
          </p>
        </Card>
      </div>
    </Container>
  );
};

export default SupplierContact;