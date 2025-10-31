import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { supabase } from '../services/supabase';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';

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
  cursor: pointer;
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

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRecovery, setIsRecovery] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Détecter la présence du token recovery de Supabase dans l’URL (hash)
    const params = new URLSearchParams(window.location.hash.replace('#', ''));
    const type = params.get('type');
    if (type === 'recovery') {
      setIsRecovery(true);
    }

    // Fallback: écouter les changements d’état auth de Supabase
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecovery(true);
      }
    });
    return () => authListener.subscription.unsubscribe();
  }, []);

  const validate = () => {
    if (!password || !confirm) return 'Veuillez remplir tous les champs';
    if (password.length < 8) return 'Le mot de passe doit contenir au moins 8 caractères';
    if (password !== confirm) return 'Les mots de passe ne correspondent pas';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const v = validate();
    if (v) { setError(v); return; }
    if (!isRecovery) {
      setError('Lien invalide ou expiré. Redemandez une réinitialisation.');
      return;
    }

    try {
      setLoading(true);
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) {
        let message = err.message || 'Erreur de réinitialisation';
        toast.error(message);
        setError(message);
        return;
      }
      toast.success('Mot de passe mis à jour');
      setPassword('');
      setConfirm('');
      setShow(false);
      setTimeout(() => navigate('/login'), 800);
    } catch (ex) {
      const message = ex.message || 'Erreur de réinitialisation';
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
          <Title>Réinitialiser le mot de passe</Title>
          <Subtitle>
            {isRecovery
              ? 'Choisissez un nouveau mot de passe pour votre compte.'
              : 'Lien invalide ou expiré. Demandez un nouveau email de réinitialisation.'}
          </Subtitle>
        </Header>

        {!isRecovery && (
          <InfoMessage>
            <span>
              Retourner à la page <Link to="/forgot-password">Mot de passe oublié</Link> pour redemander un lien.
            </span>
          </InfoMessage>
        )}

        <Form onSubmit={handleSubmit}>
          {error && <ErrorMessage>{error}</ErrorMessage>}

          <FormGroup>
            <Label>Nouveau mot de passe</Label>
            <InputContainer>
              <Input
                type={show ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Au moins 8 caractères"
                required
                hasIcon
              />
              <InputIcon onClick={() => setShow(!show)}>
                {show ? <FiEyeOff /> : <FiEye />}
              </InputIcon>
            </InputContainer>
          </FormGroup>

          <FormGroup>
            <Label>Confirmer le mot de passe</Label>
            <InputContainer>
              <Input
                type={show ? 'text' : 'password'}
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Répétez votre mot de passe"
                required
                hasIcon
              />
              <InputIcon>
                <FiLock />
              </InputIcon>
            </InputContainer>
          </FormGroup>

          <Button type="submit" disabled={loading || !isRecovery}>
            {loading ? 'Mise à jour...' : 'Réinitialiser'}
          </Button>
        </Form>
      </Card>
    </PageContainer>
  );
};

export default ResetPassword;