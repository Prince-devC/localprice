import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { FiMapPin, FiPhone, FiMail, FiBox, FiCheckCircle, FiAlertCircle, FiCalendar, FiXCircle, FiTag } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { supplierService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Card = styled.div`
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow);
  overflow: hidden;
  transition: var(--transition);
  height: 100%;
  display: flex;
  flex-direction: column;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-lg);
  }
`;

const Header = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid var(--gray-200);
`;

const SupplierName = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--gray-800);
`;

const Address = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  color: var(--gray-600);
  font-size: 0.875rem;
`;

const Content = styled.div`
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const SectionTitle = styled.h4`
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--gray-700);
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ItemList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 0.5rem 1rem;
`;

const Item = styled.li`
  font-size: 0.875rem;
  color: var(--gray-700);
`;

const PriceItem = styled(Item)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--gray-200);
  border-radius: var(--border-radius);
  background: var(--gray-50);
`;

const PriceBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.5rem;
  border-radius: var(--border-radius-sm);
  background: rgba(59, 130, 246, 0.10);
  color: var(--primary-color);
  font-weight: 600;
`;

const AvailabilityItem = styled(Item)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: var(--border-radius);
  border: 1px solid var(--gray-200);
  position: relative;
  background: var(--gray-50);
  &:before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    border-top-left-radius: var(--border-radius);
    border-bottom-left-radius: var(--border-radius);
    background: ${props =>
      props.$status === 'available' ? 'var(--success-color)' :
      props.$status === 'restock' ? 'var(--warning-color)' :
      'var(--danger-color)'};
  }
`;

const AvailabilityChip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.5rem;
  border-radius: var(--border-radius-sm);
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props =>
    props.$status === 'available' ? 'rgba(16, 185, 129, 0.12)' :
    props.$status === 'restock' ? 'rgba(245, 158, 11, 0.12)' :
    'rgba(239, 68, 68, 0.12)'};
  color: ${props =>
    props.$status === 'available' ? 'var(--success-color)' :
    props.$status === 'restock' ? 'var(--warning-color)' :
    'var(--danger-color)'};
`;

const ContactRow = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  color: var(--gray-600);
  font-size: 0.875rem;
`;

const Actions = styled.div`
  margin-top: auto;
  display: flex;
  gap: 0.5rem;
`;

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: var(--border-radius);
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  border: none;
`;

const DetailsButton = styled(Button)`
  background: var(--gray-200);
  color: var(--gray-800);
  &:hover { background: var(--gray-300); }
`;

const ContactButton = styled(Button)`
  flex: 1;
  background: var(--primary-color);
  color: white;
  &:hover { background: var(--primary-dark); }
`;

const EmptyText = styled.div`
  color: var(--gray-500);
  font-size: 0.85rem;
`;

const formatPrice = (price) => {
  if (price === null || price === undefined) return 'N/A';
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
  }).format(price).replace('XOF', 'FCFA');
};

const SupplierCard = ({ supplier }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const getAvailabilityStatus = (a) => {
    if (a.is_available) return { key: 'available', label: 'Disponible' };
    if (!a.is_available && a.expected_restock_date) return { key: 'restock', label: 'Réapprovisionnement prévu' };
    return { key: 'unavailable', label: 'Indisponible' };
  };

  useEffect(() => {
    const fetchSummary = async () => {
      if (!expanded || summary) return;
      try {
        setLoading(true);
        const res = await supplierService.getSummary(supplier.id);
        setSummary(res.data);
      } catch (err) {
        console.error('Erreur de chargement du résumé fournisseur:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, [expanded, summary, supplier.id]);

  const handleContact = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { redirectTo: `/supplier/${supplier.id}/contact` } });
    } else {
      navigate(`/supplier/${supplier.id}/contact`);
    }
  };

  return (
    <Card>
      <Header>
        <SupplierName>{supplier.name}</SupplierName>
        <Address>
          <FiMapPin />
          <span>{supplier.address || '—'}, {supplier.city || '—'}</span>
        </Address>
      </Header>

      <Content>
        <ContactRow>
          {supplier.phone && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <FiPhone /> {supplier.phone}
            </span>
          )}
          {supplier.email && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <FiMail /> {supplier.email}
            </span>
          )}
        </ContactRow>

        <Actions>
          <ContactButton onClick={handleContact}>Contacter</ContactButton>
          <DetailsButton onClick={() => setExpanded(!expanded)}>
            {expanded ? 'Masquer' : 'Voir plus'}
          </DetailsButton>
        </Actions>

        {expanded && (
          <div>
            <SectionTitle>
              <FiBox /> Produits et prix
            </SectionTitle>
            {loading && <EmptyText>Chargement...</EmptyText>}
            {!loading && summary?.prices?.length > 0 ? (
              <ItemList>
                {summary.prices.slice(0, 6).map((p, idx) => (
                  <PriceItem key={`p-${supplier.id}-${p.product_id}-${idx}`}>
                    <FiTag style={{ color: 'var(--primary-color)' }} />
                    <span style={{ flex: 1 }}>{p.product_name}</span>
                    <PriceBadge>
                      {formatPrice(p.price)} {p.unit_symbol || ''}
                    </PriceBadge>
                  </PriceItem>
                ))}
              </ItemList>
            ) : (
              <EmptyText>Aucun prix disponible</EmptyText>
            )}

            <SectionTitle style={{ marginTop: '0.75rem' }}>
              {summary?.availability?.some(a => a.is_available) ? <FiCheckCircle /> : <FiAlertCircle />}
              Disponibilités
            </SectionTitle>
            {!loading && summary?.availability?.length > 0 ? (
              <ItemList>
                {summary.availability.slice(0, 6).map((a, idx) => {
                  const st = getAvailabilityStatus(a);
                  return (
                    <AvailabilityItem key={`a-${supplier.id}-${a.product_id}-${idx}`} $status={st.key}>
                      {st.key === 'available' && <FiCheckCircle style={{ color: 'var(--success-color)' }} />}
                      {st.key === 'restock' && <FiCalendar style={{ color: 'var(--warning-color)' }} />}
                      {st.key === 'unavailable' && <FiXCircle style={{ color: 'var(--danger-color)' }} />}
                      <span style={{ flex: 1 }}>{a.product_name}</span>
                      <AvailabilityChip $status={st.key}>
                        {st.label}
                      </AvailabilityChip>
                      {a.available_quantity ? (
                        <span style={{ color: 'var(--gray-600)' }}>
                          {a.available_quantity} {a.quantity_unit || ''}
                        </span>
                      ) : null}
                      {(!a.is_available && a.expected_restock_date) ? (
                        <span style={{ color: 'var(--gray-500)' }}>
                          (dès {new Date(a.expected_restock_date).toLocaleDateString('fr-FR')})
                        </span>
                      ) : null}
                      {(a.available_from && a.available_until) ? (
                        <span style={{ color: 'var(--gray-500)' }}>
                          {new Date(a.available_from).toLocaleDateString('fr-FR')}–{new Date(a.available_until).toLocaleDateString('fr-FR')}
                        </span>
                      ) : null}
                    </AvailabilityItem>
                  );
                })}
              </ItemList>
            ) : (
              <EmptyText>Aucune information de disponibilité</EmptyText>
            )}
          </div>
        )}
      </Content>
    </Card>
  );
};

export default SupplierCard;