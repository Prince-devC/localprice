import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const RegisterContainer = styled.div`
  min-height: calc(100vh - 160px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
`;

const RegisterCard = styled.div`
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-lg);
  padding: 2rem;
  width: 100%;
  max-width: 680px;
`;

const RegisterHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const RegisterTitle = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  color: var(--gray-800);
  margin-bottom: 0.5rem;
`;

const RegisterSubtitle = styled.p`
  color: var(--gray-600);
`;

const RegisterForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FormLabel = styled.label`
  font-weight: 500;
  color: var(--gray-700);
`;

const InputContainer = styled.div`
  position: relative;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  padding-right: ${props => props.hasIcon ? '3rem' : '1rem'};
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
  transition: var(--transition);
  
  &:hover {
    color: var(--gray-600);
  }
`;

const RegisterButton = styled.button`
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

const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: 1.5rem 0;
  
  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--gray-200);
  }
  
  span {
    padding: 0 1rem;
    color: var(--gray-500);
    font-size: 0.875rem;
  }
`;

const LoginLink = styled(Link)`
  text-align: center;
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
  transition: var(--transition);
  
  &:hover {
    text-decoration: underline;
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

const PasswordRequirements = styled.div`
  background: var(--gray-50);
  border: 1px solid var(--gray-200);
  border-radius: var(--border-radius);
  padding: 0.75rem;
  font-size: 0.875rem;
  color: var(--gray-600);
  
  ul {
    margin: 0.5rem 0 0 1rem;
    padding: 0;
  }
  
  li {
    margin-bottom: 0.25rem;
  }
`;

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [acceptPolicies, setAcceptPolicies] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError('');
  };

  

  

  

  const validateForm = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Veuillez remplir tous les champs');
      return false;
    }

    if (!acceptPolicies) {
      setError("Veuillez accepter les conditions d’utilisation et la politique de confidentialité");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Veuillez entrer une adresse email valide');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    const result = await register(formData.firstName, formData.lastName, formData.email, formData.password);
    
    if (result.success) {
      // Ne pas dupliquer le toast: AuthContext affiche déjà le succès
      // Vider le formulaire et rediriger après un court délai
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
      setShowPassword(false);
      setShowConfirmPassword(false);
      toast('Redirection vers la connexion...', { icon: '➡️' });
      setTimeout(() => navigate('/login'), 1500);
    } else {
      setError(result.message);
    }
  };

  return (
    <RegisterContainer>
      <RegisterCard>
        <RegisterHeader>
          <RegisterTitle>Inscription</RegisterTitle>
          <RegisterSubtitle>Créer son compte Lokali</RegisterSubtitle>
        </RegisterHeader>

        <RegisterForm onSubmit={handleSubmit}>
          {error && <ErrorMessage>{error}</ErrorMessage>}


          <>
           <FormGroup>
            <FormLabel>Prénom</FormLabel>
            <InputContainer>
              <FormInput
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Votre prénom"
                required
              />
              <InputIcon>
                <FiUser />
              </InputIcon>
            </InputContainer>
          </FormGroup>

          <FormGroup>
            <FormLabel>Nom</FormLabel>
            <InputContainer>
              <FormInput
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Votre nom"
                required
              />
              <InputIcon>
                <FiUser />
              </InputIcon>
            </InputContainer>
          </FormGroup>

          <FormGroup>
            <FormLabel>Email</FormLabel>
            <InputContainer>
              <FormInput
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="votre@email.com"
                required
              />
              <InputIcon>
                <FiMail />
              </InputIcon>
            </InputContainer>
          </FormGroup>

          <FormGroup>
            <FormLabel>Mot de passe</FormLabel>
            <InputContainer>
              <FormInput
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Votre mot de passe"
                required
              />
              <InputIcon onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </InputIcon>
            </InputContainer>
            <PasswordRequirements>
              <strong>Le mot de passe doit contenir :</strong>
              <ul>
                <li>Au moins 6 caractères</li>
                <li>Des lettres et des chiffres</li>
              </ul>
            </PasswordRequirements>
          </FormGroup>

          <FormGroup>
            <FormLabel>Confirmer le mot de passe</FormLabel>
            <InputContainer>
              <FormInput
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirmez votre mot de passe"
                required
              />
              <InputIcon onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
              </InputIcon>
            </InputContainer>
          </FormGroup>

          <FormGroup>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                checked={acceptPolicies}
                onChange={(e) => setAcceptPolicies(e.target.checked)}
              />
              <span>
                J’accepte les <Link to="/terms">conditions d’utilisation</Link> et la <Link to="/privacy">politique de confidentialité</Link>
              </span>
            </label>
          </FormGroup>

          <RegisterButton type="submit" disabled={loading}>
            {loading ? 'Inscription...' : 'S\'inscrire'}
          </RegisterButton>

          <Divider>
            <span>ou</span>
          </Divider>

          <LoginLink to="/login">
            Se connecter
          </LoginLink>
            </>
          </RegisterForm>
      </RegisterCard>
    </RegisterContainer>
  );
};

export default Register;
