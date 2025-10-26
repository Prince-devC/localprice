import React, { useMemo, useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useParams, useLocation, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { agriculturalPriceService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { FiChevronLeft, FiInfo } from 'react-icons/fi';

const PageContainer = styled.div`
  min-height: 100vh;
  background: var(--gray-50);
`;

const Content = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
`;

const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--gray-800);
  margin: 0;
`;

const Meta = styled.div`
  display: flex;
  gap: 0.75rem;
  color: var(--gray-600);
  flex-wrap: wrap;
  align-items: center;
`;

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
  margin-bottom: 0.75rem;

  &:hover {
    text-decoration: underline;
  }
`;

const Chip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: var(--gray-700);
  background: var(--gray-100);
  border-radius: 9999px;
  padding: 0.35rem 0.6rem;
`;

const VariationBadge = styled.span.withConfig({ shouldForwardProp: (prop) => prop !== 'positive' })`
  font-weight: 600;
  font-size: 0.875rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  text-align: center;
  color: ${props => props.positive ? '#0a7c52' : '#a51313'};
  background: ${props => props.positive ? '#dcfce7' : '#fee2e2'};
  font-family: 'Courier New', monospace;
`;

const Card = styled.div`
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow);
  padding: 1.5rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--gray-700);
  margin: 0 0 1rem 0;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  color: var(--gray-700);
`;

const Label = styled.span`
  color: var(--gray-500);
`;

const Value = styled.span`
  font-weight: 600;
`;

const ChartContainer = styled.div`
  position: relative;
  height: 380px;
`;

const ChartSvg = styled.svg`
  width: 100%;
  height: 100%;
`;

const PeriodControls = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const PeriodButton = styled.button`
  padding: 0.5rem 0.75rem;
  border-radius: var(--border-radius);
  border: 1px solid var(--gray-300);
  background: ${props => props.active ? 'var(--primary-color)' : 'white'};
  color: ${props => props.active ? 'white' : 'var(--gray-700)'};
  cursor: pointer;
`;

const InfoBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: baseline;
  margin-bottom: 0.5rem;
  color: var(--gray-800);
`;

const InfoValue = styled.span`
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--gray-900);
  margin-left: 0.35rem;
`;

const HelpPanel = styled.div`
  margin-top: 0.75rem;
  padding: 0.75rem 1rem;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: var(--border-radius);
  color: var(--gray-700);
  font-size: 0.95rem;
  line-height: 1.4;
`;

const HelpToggle = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.6rem;
  border-radius: 9999px;
  border: 1px solid var(--primary-color);
  background: var(--gray-100);
  color: var(--primary-color);
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  margin-left: 0.5rem;
`;

function usePriceDetail(id, initialPrice) {
  return useQuery(['agri-price-detail', id], () => agriculturalPriceService.getAll({ id }), {
    enabled: !!id && !initialPrice, // si on a l'objet depuis la navigation, éviter la requête
    select: (resp) => ({
      data: Array.isArray(resp?.data?.data) ? resp.data.data[0] : null,
    })
  });
}

function usePriceEvolution(productId, localityId) {
  return useQuery(
    ['agri-price-evolution', productId, localityId],
    () => agriculturalPriceService.getEvolution({ product_id: productId, locality_id: localityId }),
    { enabled: !!productId && !!localityId }
  );
}

function SimpleLineChart({ data, onHoverChange }) {
  const svgRef = useRef(null);
  const [hoverIdx, setHoverIdx] = useState(null);

  const margin = { top: 20, right: 20, bottom: 30, left: 40 };
  const width = 1100;
  const height = 280;
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const calc = useMemo(() => {
    if (!data || data.length === 0) {
      return { points: [], xMin: 0, xMax: 0, yMin: 0, yMax: 0 };
    }
    const xs = data.map(d => new Date(d.date).getTime());
    const ys = data.map(d => Number(d.avg_price));
    const xMin = Math.min(...xs);
    const xMax = Math.max(...xs);
    const yMin = Math.min(...ys);
    const yMax = Math.max(...ys);
    const sx = (t) => {
      if (xMax === xMin) return margin.left;
      return margin.left + (t - xMin) / (xMax - xMin) * innerW;
    };
    const sy = (v) => {
      if (yMax === yMin) return height - margin.bottom;
      return margin.top + (1 - (v - yMin) / (yMax - yMin)) * innerH;
    };
    const points = data.map(d => ({ x: sx(new Date(d.date).getTime()), y: sy(Number(d.avg_price)) }));
    return { points, xMin, xMax, yMin, yMax, sx, sy };
  }, [data]);

  const path = useMemo(() => {
    if (!calc.points || calc.points.length === 0) return '';
    return calc.points.map((p, i) => (i === 0 ? `M ${p.x},${p.y}` : `L ${p.x},${p.y}`)).join(' ');
  }, [calc]);

  const yTicks = useMemo(() => {
    const n = 4;
    const ticks = [];
    if (calc.yMax === calc.yMin) {
      ticks.push(calc.yMin);
    } else {
      for (let i = 0; i <= n; i++) {
        ticks.push(calc.yMin + i * (calc.yMax - calc.yMin) / n);
      }
    }
    return ticks;
  }, [calc]);

  const handleMove = (e) => {
    if (!svgRef.current || !calc.points || calc.points.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const vx = x / rect.width * width; // convertir en coordonnée du viewBox
    let nearest = 0;
    let best = Number.POSITIVE_INFINITY;
    for (let i = 0; i < calc.points.length; i++) {
      const d = Math.abs(calc.points[i].x - vx);
      if (d < best) { best = d; nearest = i; }
    }
    setHoverIdx(nearest);
    if (onHoverChange) {
      onHoverChange(data ? data[nearest] : null);
    }
  };

  const handleLeave = () => {
    setHoverIdx(null);
    if (onHoverChange) onHoverChange(null);
  };

  const hoveredPoint = (hoverIdx !== null && calc.points[hoverIdx]) ? calc.points[hoverIdx] : null;
  const hoveredDatum = (hoverIdx !== null && data && data[hoverIdx]) ? data[hoverIdx] : null;

  // dimensions du tooltip
  const boxW = 220;
  const boxH = 104;
  const tx = hoveredPoint ? Math.min(Math.max(hoveredPoint.x + 8, margin.left + 4), width - margin.right - boxW - 4) : 0;
  const ty = hoveredPoint ? Math.min(Math.max(hoveredPoint.y - 8 - boxH, margin.top + 4), height - margin.bottom - boxH - 4) : 0;

  return (
    <ChartSvg
      ref={svgRef}
      viewBox={`0 0 ${width} ${height}`}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ cursor: 'crosshair' }}
    >
      {/* Axes */}
      <line x1={margin.left} y1={height - margin.bottom} x2={width - margin.right} y2={height - margin.bottom} stroke="#e5e7eb" />
      <line x1={margin.left} y1={margin.top} x2={margin.left} y2={height - margin.bottom} stroke="#e5e7eb" />
      {/* Grid + Y labels */}
      {yTicks.map((t, i) => {
        const y = calc.sy ? calc.sy(t) : margin.top + innerH;
        return (
          <g key={i}>
            <line x1={margin.left} y1={y} x2={width - margin.right} y2={y} stroke="#f1f5f9" />
            <text x={margin.left - 8} y={y} fill="#4b5563" fontSize="14" textAnchor="end" dominantBaseline="central">
              {new Intl.NumberFormat('fr-FR').format(Math.round(t))}
            </text>
          </g>
        );
      })}
      {/* X start/end labels */}
      {data && data.length > 0 && (
        <>
          <text x={margin.left} y={height - margin.bottom + 24} fill="#4b5563" fontSize="14" textAnchor="start">
            {new Date(calc.xMin).toLocaleDateString('fr-FR')}
          </text>
          <text x={width - margin.right} y={height - margin.bottom + 24} fill="#4b5563" fontSize="14" textAnchor="end">
            {new Date(calc.xMax).toLocaleDateString('fr-FR')}
          </text>
        </>
      )}
      {/* Courbe */}
      <path d={path} fill="none" stroke="var(--primary-color)" strokeWidth="2" />
      {/* Points */}
      {calc.points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={4} fill="var(--primary-color)" />
      ))}

      {/* Hover helpers + Tooltip */}
      {hoveredPoint && (
        <>
          {/* Ligne verticale guide */}
          <line x1={hoveredPoint.x} y1={margin.top} x2={hoveredPoint.x} y2={height - margin.bottom} stroke="#9ca3af" strokeDasharray="4,3" />
          {/* Point surligné */}
          <circle cx={hoveredPoint.x} cy={hoveredPoint.y} r={5} fill="var(--primary-color)" />
          {/* Tooltip (dans l'SVG pour éviter les conversions px) */}
          <g>
            <rect x={tx} y={ty} width={boxW} height={boxH} fill="white" stroke="#d1d5db" rx="6" ry="6" />
            <text x={tx + 8} y={ty + 22} fontSize="14" fontWeight="600" fill="#111827">
              {new Intl.NumberFormat('fr-FR').format(Number(hoveredDatum?.avg_price || 0))} FCFA
            </text>
            <text x={tx + 8} y={ty + 42} fontSize="13" fill="#6b7280">
              {hoveredDatum?.date ? new Date(hoveredDatum.date).toLocaleDateString('fr-FR') : ''}
            </text>
            {hoveredDatum?.price_count !== undefined && (
              <text x={tx + 8} y={ty + 60} fontSize="13" fill="#6b7280">
                Observations (jour): {hoveredDatum.price_count}
              </text>
            )}
            {hoveredDatum?.min_price !== undefined && hoveredDatum?.max_price !== undefined && (
              <text x={tx + 8} y={ty + 78} fontSize="13" fill="#6b7280">
                Écart jour: {new Intl.NumberFormat('fr-FR').format(Number(hoveredDatum.min_price))}–{new Intl.NumberFormat('fr-FR').format(Number(hoveredDatum.max_price))} FCFA
              </text>
            )}
          </g>
        </>
      )}
    </ChartSvg>
  );
}

const PriceDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const initialPrice = location.state?.price || null;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [id]);

  const [periodDays, setPeriodDays] = useState(30);
  const [showHelp, setShowHelp] = useState(true);
  const [hoverInfo, setHoverInfo] = useState(null);

  const { data: fetchedDetail, isLoading: loadingDetail } = usePriceDetail(id, initialPrice);
  const price = initialPrice || fetchedDetail?.data || null;

  const { data: evolutionResp, isLoading: loadingEvolution } = usePriceEvolution(price?.product_id, price?.locality_id);
  const evolution = evolutionResp?.data?.data || [];

  // Filtrer par période
  const filteredEvolution = useMemo(() => {
    if (!evolution || evolution.length === 0) return [];
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - periodDays);
    return evolution.filter(pt => new Date(pt.date) >= cutoff);
  }, [evolution, periodDays]);

  const stats = useMemo(() => {
    if (!filteredEvolution || filteredEvolution.length === 0) return null;
    const ys = filteredEvolution.map(pt => Number(pt.avg_price));
    const min = Math.min(...ys);
    const max = Math.max(...ys);
    const avg = ys.reduce((a, b) => a + b, 0) / ys.length;
    const count = filteredEvolution.reduce((acc, pt) => acc + (Number(pt.price_count) || 0), 0);
  
    let varDay = null;
    if (filteredEvolution.length >= 2) {
      const last = Number(filteredEvolution[filteredEvolution.length - 1].avg_price);
      const prev = Number(filteredEvolution[filteredEvolution.length - 2].avg_price);
      if (prev !== 0) {
        varDay = ((last - prev) / prev) * 100;
      }
    }
  
    let varPeriod = null;
    if (filteredEvolution.length >= 2) {
      const first = Number(filteredEvolution[0].avg_price);
      const last = Number(filteredEvolution[filteredEvolution.length - 1].avg_price);
      if (first !== 0) {
        varPeriod = ((last - first) / first) * 100;
      }
    }
  
    return { min, max, avg: Math.round(avg * 100) / 100, count, varDay, varPeriod };
  }, [filteredEvolution]);

  return (
    <PageContainer>
      <Content>
        <BackLink to={-1}><FiChevronLeft /> Retour</BackLink>
        <Header>
          <Title>{price ? price.product_name : 'Détail du prix'}</Title>
          <Meta>
            <Chip>{price?.locality_name}</Chip>
            <Chip>{price?.region_name}</Chip>
            <Chip>{price?.unit_symbol || price?.unit_name}</Chip>
          </Meta>
        </Header>

        {(loadingDetail || (!price && !initialPrice)) && (
          <Card>
            <LoadingSpinner />
          </Card>
        )}

        {price && (
          <Grid>
            <Card>
              <SectionTitle>Informations</SectionTitle>
              <InfoRow>
                <Label>Prix actuel</Label>
                <Value>{price.price ? `${new Intl.NumberFormat('fr-FR').format(price.price)} FCFA` : 'N/A'}</Value>
              </InfoRow>
              <InfoRow>
                <Label>Variation (relevé vs précédent)</Label>
                <VariationBadge positive={price.price_change >= 0}>
                  {price.price_change !== null && price.price_change !== undefined ? 
                    `${price.price_change >= 0 ? '+' : ''}${Number(price.price_change).toFixed(1)}%` : 
                    'N/A'
                  }
                </VariationBadge>
              </InfoRow>
              <InfoRow>
                <Label>Mis à jour</Label>
                <Value>{price.date ? new Date(price.date).toLocaleDateString('fr-FR') : 'N/A'}</Value>
              </InfoRow>
              <InfoRow>
                <Label>Unité</Label>
                <Value>{price.unit_name} ({price.unit_symbol})</Value>
              </InfoRow>
            </Card>

            <Card>
              <SectionTitle>Historique
                <HelpToggle
                  onClick={() => setShowHelp(s => !s)}
                  title="Afficher/masquer l’aide"
                  aria-label="Afficher/masquer l’aide"
                >
                  <FiInfo size={16} /> Aide
                </HelpToggle>
              </SectionTitle>
              <PeriodControls>
                {[7, 30, 90, 180].map(d => (
                  <PeriodButton key={d} active={periodDays === d} onClick={() => setPeriodDays(d)}>
                    {d} jours
                  </PeriodButton>
                ))}
              </PeriodControls>
              {/* Barre d'informations au-dessus du graphe */}
              <InfoBar>
                <div>
                  Prix moyen:
                  <InfoValue>
                    {(() => {
                      const latest = filteredEvolution[filteredEvolution.length - 1] || null;
                      const dp = hoverInfo || latest;
                      return dp ? `${new Intl.NumberFormat('fr-FR').format(Number(dp.avg_price))} FCFA` : '—';
                    })()}
                  </InfoValue>
                </div>
                <div>
                  Date:
                  <InfoValue>
                    {(() => {
                      const latest = filteredEvolution[filteredEvolution.length - 1] || null;
                      const dp = hoverInfo || latest;
                      return dp?.date ? new Date(dp.date).toLocaleDateString('fr-FR') : '—';
                    })()}
                  </InfoValue>
                </div>
                {(hoverInfo?.price_count !== undefined || (filteredEvolution[filteredEvolution.length - 1]?.price_count !== undefined)) && (
                  <div>
                    Observations (jour):
                    <InfoValue>
                      {(() => {
                        const latest = filteredEvolution[filteredEvolution.length - 1] || null;
                        const dp = hoverInfo || latest;
                        return dp?.price_count !== undefined ? dp.price_count : '—';
                      })()}
                    </InfoValue>
                  </div>
                )}
                {(hoverInfo?.min_price !== undefined || (filteredEvolution[filteredEvolution.length - 1]?.min_price !== undefined)) && (
                  <div>
                    Écart jour:
                    <InfoValue>
                      {(() => {
                        const latest = filteredEvolution[filteredEvolution.length - 1] || null;
                        const dp = hoverInfo || latest;
                        return (dp?.min_price !== undefined && dp?.max_price !== undefined)
                          ? `${new Intl.NumberFormat('fr-FR').format(Number(dp.min_price))}–${new Intl.NumberFormat('fr-FR').format(Number(dp.max_price))} FCFA`
                          : '—';
                      })()}
                    </InfoValue>
                  </div>
                )}
               </InfoBar>
              {showHelp && (
                <HelpPanel>
                  <strong>Lecture du graphique</strong><br />
                  • Chaque point = prix moyen du jour (produit + localité)<br />
                  • Observations (jour) = nombre de relevés ce jour-là<br />
                  • Observations (période) = total sur la période sélectionnée<br />
                  • Unité: {price.unit_name} ({price.unit_symbol})<br />
                  • Survolez un point pour le détail (date, moyenne, observations)<br />
                  • Variation (jour/période) calculée sur la moyenne quotidienne
                </HelpPanel>
              )}
              <ChartContainer>
                {loadingEvolution ? (
                  <LoadingSpinner />
                ) : (
                  <SimpleLineChart data={filteredEvolution} onHoverChange={setHoverInfo} />
                )}
              </ChartContainer>
              {stats && (
                <Meta style={{ marginTop: '1rem' }}>
                  <span>Min: {new Intl.NumberFormat('fr-FR').format(stats.min)} FCFA</span>
                  <span>Max: {new Intl.NumberFormat('fr-FR').format(stats.max)} FCFA</span>
                  <span>Moy: {new Intl.NumberFormat('fr-FR').format(stats.avg)} FCFA</span>
                  <span>Observations (période): {stats.count}</span>
                  {stats.varDay !== null && (
                    <span>
                      Variation (jour): <VariationBadge positive={stats.varDay >= 0}>
                        {`${stats.varDay >= 0 ? '+' : ''}${stats.varDay.toFixed(1)}%`}
                      </VariationBadge>
                    </span>
                  )}
                  {stats.varPeriod !== null && (
                    <span>
                      Variation (période): <VariationBadge positive={stats.varPeriod >= 0}>
                        {`${stats.varPeriod >= 0 ? '+' : ''}${stats.varPeriod.toFixed(1)}%`}
                      </VariationBadge>
                    </span>
                  )}
                </Meta>
              )}
            </Card>
          </Grid>
        )}
      </Content>
    </PageContainer>
  );
};

export default PriceDetail;