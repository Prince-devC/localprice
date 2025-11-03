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

const ContributionTerms = () => {
  return (
    <PageContainer>
      <Card>
        <Title>Conditions de contribution</Title>
        <SubTitle>Participation bénévole pour le moment</SubTitle>

        <Section>
          <SectionTitle>Nature de la contribution</SectionTitle>
          <Text>
            Les contributions consistent à partager des prix et informations locales de manière responsable et honnête, afin d’améliorer la transparence des marchés.
          </Text>
        </Section>

        <Section>
          <SectionTitle>Statut bénévole</SectionTitle>
          <Text>
            La participation est bénévole à ce stade. Aucune rémunération n’est due pour les contributions. Toute évolution sera communiquée via cette page.
          </Text>
        </Section>

        <Section>
          <SectionTitle>Exactitude et respect</SectionTitle>
          <Text>
            Les prix soumis doivent être fidèles à la réalité observée et recueillis dans le respect des personnes et des lieux.
          </Text>
        </Section>

        <Section>
          <SectionTitle>Modération</SectionTitle>
          <Text>
            Les contributions peuvent être vérifiées et modérées avant publication. Les informations non conformes peuvent être rejetées.
          </Text>
        </Section>
      </Card>
    </PageContainer>
  );
};

export default ContributionTerms;