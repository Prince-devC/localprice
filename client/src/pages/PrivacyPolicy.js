import React from 'react';
import styled from 'styled-components';

const PageContainer = styled.div`
  min-height: calc(100vh - 160px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
`;

const Card = styled.div`
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-lg);
  padding: 2rem;
  width: 100%;
  max-width: 860px;
`;

const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: bold;
  color: var(--gray-800);
  margin-bottom: 0.75rem;
`;

const SubTitle = styled.p`
  color: var(--gray-600);
  margin-bottom: 1.25rem;
`;

const Section = styled.section`
  margin-bottom: 1.25rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.125rem;
  color: var(--gray-800);
  margin-bottom: 0.5rem;
`;

const Text = styled.p`
  color: var(--gray-700);
  line-height: 1.6;
`;

const PrivacyPolicy = () => {
  return (
    <PageContainer>
      <Card>
        <Title>Politique de confidentialité</Title>
        

        <Section>
          <SectionTitle>Collecte des données</SectionTitle>
          <Text>
            Nous collectons les informations nécessaires au fonctionnement du service (compte, contributions, préférences). Aucune donnée superflue n’est stockée.
          </Text>
        </Section>

        <Section>
          <SectionTitle>Utilisation</SectionTitle>
          <Text>
            Les données servent à améliorer la qualité des informations publiées et faciliter la mise en relation avec les fournisseurs.
          </Text>
        </Section>

        <Section>
          <SectionTitle>Partage et sécurité</SectionTitle>
          <Text>
            Les données personnelles ne sont pas partagées publiquement. Nous mettons en œuvre des mesures de sécurité adaptées au service.
          </Text>
        </Section>

        <Section>
          <SectionTitle>Vos droits</SectionTitle>
          <Text>
            Vous pouvez demander l’accès, la rectification ou la suppression de vos données. Contact: contact@lokali.bj.
          </Text>
        </Section>
      </Card>
    </PageContainer>
  );
};

export default PrivacyPolicy;