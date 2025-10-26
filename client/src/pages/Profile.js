import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import styled from 'styled-components';
import { FiUser, FiMail, FiLock, FiSave, FiEdit3 } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ProfileContainer = styled.div`
  padding: 2rem 0;
`;

const ProfileCard = styled.div`
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow);
  padding: 2rem;
  max-width: 600px;
  margin: 0 auto;
`;

const ProfileHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--gray-200);
`;

const ProfileTitle = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: var(--gray-800);
`;

const ProfileSubtitle = styled.p`
  color: var(--gray-600);
`;

const ProfileForm = styled.form`
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
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid var(--gray-200);
  border-radius: var(--border-radius);
  font-size: 1rem;
  transition: var(--transition);
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &:disabled {
    background-color: var(--gray-100);
    cursor: not-allowed;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const SaveButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
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

const EditButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--gray-200);
  color: var(--gray-700);
  border: none;
  border-radius: var(--border-radius);
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  
  &:hover {
    background: var(--gray-300);
  }
`;

const UserInfo = styled.div`
  background: var(--gray-50);
  padding: 1rem;
  border-radius: var(--border-radius);
  margin-bottom: 1rem;
`;

const InfoItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--gray-200);
  
  &:last-child {
    border-bottom: none;
  }
`;

const InfoLabel = styled.span`
  font-weight: 500;
  color: var(--gray-700);
`;

const InfoValue = styled.span`
  color: var(--gray-600);
`;

const Profile = () => {
  const { user, updateProfile, changePassword, loading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: (user?.user_metadata && user.user_metadata.username) || '',
    email: user?.email || ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const handleProfileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handlePasswordChange = (e) => {
    setPasswordData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    const result = await updateProfile(formData);
    if (result.success) {
      setIsEditing(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    const result = await changePassword(passwordData.currentPassword, passwordData.newPassword);
    if (result.success) {
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordForm(false);
    }
  };

  const cancelEdit = () => {
    setFormData({
      username: (user?.user_metadata && user.user_metadata.username) || '',
      email: user?.email || ''
    });
    setIsEditing(false);
  };

  // Déterminer un rôle lisible depuis Supabase
  const roleSource = (user?.app_metadata && user.app_metadata.role) 
    || (user?.user_metadata && user.user_metadata.role) 
    || user?.role;
  const displayRole = roleSource === 'super_admin'
    ? 'Super Admin'
    : roleSource === 'admin' 
      ? 'Admin' 
      : roleSource === 'contributor' 
        ? 'Contributeur' 
        : (roleSource === 'user' || roleSource === 'authenticated' || roleSource === 'guest' || !roleSource)
          ? 'Utilisateur' 
          : roleSource;

  if (!user) {
    return (
      <ProfileContainer>
        <div className="container">
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <h2>Non connecté</h2>
            <p>Veuillez vous connecter pour accéder à votre profil.</p>
          </div>
        </div>
      </ProfileContainer>
    );
  }

  return (
    <ProfileContainer>
      <div className="container">
        <ProfileCard>
          <ProfileHeader>
            <ProfileTitle>Mon Profil</ProfileTitle>
            <ProfileSubtitle>Gérez vos informations personnelles</ProfileSubtitle>
          </ProfileHeader>

          <ProfileForm onSubmit={handleProfileSubmit}>
            <UserInfo>
              <InfoItem>
                <InfoLabel>Rôle</InfoLabel>
                <InfoValue>{displayRole}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Membre depuis</InfoLabel>
                <InfoValue>
                  {user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : 'N/A'}
                </InfoValue>
              </InfoItem>
            </UserInfo>

            <FormGroup>
              <FormLabel>
                <FiUser />
                Nom d'utilisateur
              </FormLabel>
              <FormInput
                type="text"
                name="username"
                value={formData.username}
                onChange={handleProfileChange}
                disabled={!isEditing}
                required
              />
            </FormGroup>

            <FormGroup>
              <FormLabel>
                <FiMail />
                Email
              </FormLabel>
              <FormInput
                type="email"
                name="email"
                value={formData.email}
                onChange={handleProfileChange}
                disabled={!isEditing}
                required
              />
            </FormGroup>

            <ButtonGroup>
              {isEditing ? (
                <>
                  <SaveButton type="submit" disabled={loading}>
                    <FiSave />
                    {loading ? 'Sauvegarde...' : 'Sauvegarder'}
                  </SaveButton>
                  <EditButton type="button" onClick={cancelEdit}>
                    Annuler
                  </EditButton>
                </>
              ) : (
                <EditButton type="button" onClick={() => setIsEditing(true)}>
                  <FiEdit3 />
                  Modifier
                </EditButton>
              )}
            </ButtonGroup>
          </ProfileForm>

          <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--gray-200)' }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--gray-800)' }}>Changer le mot de passe</h3>
            
            {!showPasswordForm ? (
              <EditButton onClick={() => setShowPasswordForm(true)}>
                <FiLock />
                Changer le mot de passe
              </EditButton>
            ) : (
              <form onSubmit={handlePasswordSubmit}>
                <FormGroup>
                  <FormLabel>Mot de passe actuel</FormLabel>
                  <FormInput
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <FormLabel>Nouveau mot de passe</FormLabel>
                  <FormInput
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <FormLabel>Confirmer le nouveau mot de passe</FormLabel>
                  <FormInput
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </FormGroup>

                <ButtonGroup>
                  <SaveButton type="submit" disabled={loading}>
                    <FiLock />
                    {loading ? 'Changement...' : 'Changer le mot de passe'}
                  </SaveButton>
                  <EditButton type="button" onClick={() => setShowPasswordForm(false)}>
                    Annuler
                  </EditButton>
                </ButtonGroup>
              </form>
            )}
          </div>
        </ProfileCard>
      </div>
    </ProfileContainer>
  );
};

export default Profile;
