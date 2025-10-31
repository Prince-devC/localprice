import React, { useState } from 'react';
import styled from 'styled-components';
import { FiMail } from 'react-icons/fi';
import { supabase } from '../services/supabase';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

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
  max-width: 680px;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 1.5rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  color: var(--gray-800);
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: var(--gray-600);
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 500;
  color: var(--gray-700);
`;

const InputContainer = styled.div`
  position: relative;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  padding-right: ${props => (props.hasIcon ? '3rem' : '1rem')};
  border: 2px solid var(--gray-200);
  border-radius: var(--border-radius);
  font-size: 1rem;
  transition: var(--transition);

  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const InputIcon = styled.div`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--gray-400);
`;

const Button = styled.button`
  width: 100%;
  padding: 0.75rem 1rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);

  &:hover:not(:disabled) {
    background: var(--primary-dark);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const HelperRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 0.5rem;
  color: var(--gray-600);
`;

const HelperLink = styled(Link)`
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
  transition: var(--transition);

  &:hover { text-decoration: underline; }
`;

const ErrorMessage = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 0.75rem;
  border-radius: var(--border-radius);
  font-size: 0.875rem;
`;

const InfoMessage = styled.div`
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  color: #1d4ed8;
  padding: 0.75rem;
  border-radius: var(--border-radius);
  font-size: 0.9rem;
`;

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSent(false);

    if (!email) {
      setError('Veuillez entrer votre email');
      return;
    }

    try {
      setLoading(true);
      const redirectTo = `${window.location.origin}/reset-password`;
      const { error: err } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (err) {
        let message = err.message || "Erreur d'envoi";
        if (/no user/i.test(message)) message = "Aucun utilisateur trouvé pour cet email.";
        toast.error(message);
        setError(message);
        return;
      }
      toast.success('Email de réinitialisation envoyé');
      setSent(true);
    } catch (ex) {
      const message = ex.message || "Erreur d'envoi";
      toast.error(message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <Card>
        <Header>
          <Title>Mot de passe oublié</Title>
          <Subtitle>Recevez un email pour réinitialiser votre mot de passe.</Subtitle>
        </Header>

        {sent && (
          <InfoMessage>
            Si un compte correspond à cet email, un lien de réinitialisation a été envoyé. Vérifiez votre boîte mail.
          </InfoMessage>
        )}

        <Form onSubmit={handleSubmit}>
          {error && <ErrorMessage>{error}</ErrorMessage>}

          <FormGroup>
            <Label>Email</Label>
            <InputContainer>
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
                hasIcon
              />
              <InputIcon>
                <FiMail />
              </InputIcon>
            </InputContainer>
          </FormGroup>

          <Button type="submit" disabled={loading}>
            {loading ? 'Envoi...' : 'Envoyer le lien'}
          </Button>
        </Form>

        <HelperRow>
          <span>Vous vous souvenez ?</span>
          <HelperLink to="/login">Se connecter</HelperLink>
        </HelperRow>
      </Card>
    </PageContainer>
  );
};

export default ForgotPassword;