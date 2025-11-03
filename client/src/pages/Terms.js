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

const Terms = () => {
  return (
    <PageContainer>
      <Card>
        <Title>Conditions d’utilisation</Title>
        

        <Section>
          <SectionTitle>Objet</SectionTitle>
          <Text>
            Lokali fournit une plateforme d’information sur les prix locaux et la mise en relation avec des fournisseurs. 
            L’accès et l’utilisation du site impliquent l’acceptation des présentes conditions.
          </Text>
        </Section>

        <Section>
          <SectionTitle>Compte et sécurité</SectionTitle>
          <Text>
            Vous êtes responsable du maintien de la confidentialité de vos identifiants et de l’activité réalisée via votre compte.
          </Text>
        </Section>

        <Section>
          <SectionTitle>Contributions et contenus</SectionTitle>
          <Text>
            Les données soumises doivent être exactes et conformes aux lois en vigueur. Lokali se réserve le droit de modérer ou de retirer tout contenu non conforme.
          </Text>
        </Section>

        <Section>
          <SectionTitle>Limitation de responsabilité</SectionTitle>
          <Text>
            Les informations publiées le sont à titre indicatif. Lokali ne peut être tenue responsable des décisions prises sur la base de ces informations.
          </Text>
        </Section>

        <Section>
          <SectionTitle>Évolution</SectionTitle>
          <Text>
            Ces conditions sont susceptibles d’évoluer. La version mise à jour s’appliquera dès sa publication.
          </Text>
        </Section>
      </Card>
    </PageContainer>
  );
};

export default Terms;