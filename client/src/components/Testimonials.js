import React from 'react';
import styled from 'styled-components';

const TestimonialsSection = styled.section`
  padding: 4rem 0;
  margin-bottom: 4rem;
`;

const TestimonialsContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const TestimonialsTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 3rem;
  color: var(--gray-800);
`;

const TestimonialsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
`;

const TestimonialCard = styled.div`
  background: white;
  padding: 2rem;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow);
  text-align: center;
  transition: var(--transition);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }
`;

const TestimonialText = styled.p`
  font-style: italic;
  color: var(--gray-700);
  margin-bottom: 1.5rem;
  line-height: 1.6;
`;

const TestimonialAuthor = styled.div`
  font-weight: 600;
  color: var(--gray-800);
`;

const TestimonialRole = styled.div`
  font-size: 0.875rem;
  color: var(--gray-600);
  margin-top: 0.25rem;
`;

const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      text: "Lokali m'a permis de trouver les meilleurs prix pour mes achats agricoles. J'économise maintenant 20% sur mes dépenses mensuelles.",
      author: "Marie Koffi",
      role: "Agricultrice, Cotonou"
    },
    {
      id: 2,
      text: "Interface très intuitive et données toujours à jour. C'est devenu un outil indispensable pour mon commerce.",
      author: "Jean-Baptiste Agbessi",
      role: "Commerçant, Porto-Novo"
    },
    {
      id: 3,
      text: "En tant que contributeur, je participe à la transparence du marché tout en ayant accès à des données précieuses pour mon activité.",
      author: "Fatouma Ouedraogo",
      role: "Distributeur, Parakou"
    }
  ];

  return (
    <TestimonialsSection>
      <TestimonialsContainer>
        <TestimonialsTitle>Ce que pensent nos clients</TestimonialsTitle>
        <TestimonialsGrid>
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id}>
              <TestimonialText>
                "{testimonial.text}"
              </TestimonialText>
              <TestimonialAuthor>{testimonial.author}</TestimonialAuthor>
              <TestimonialRole>{testimonial.role}</TestimonialRole>
            </TestimonialCard>
          ))}
        </TestimonialsGrid>
      </TestimonialsContainer>
    </TestimonialsSection>
  );
};

export default Testimonials;