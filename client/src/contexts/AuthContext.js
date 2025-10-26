import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import toast from 'react-hot-toast';
import { authService } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState([]);

  const fetchRoles = async () => {
    try {
      const response = await authService.getRoles();
      const fetched = response?.data?.data?.roles || [];
      setRoles(fetched);
      try { localStorage.setItem('roles', JSON.stringify(fetched)); } catch (_) {}
    } catch (e) {
      console.warn('Failed to fetch roles:', e.message);
      setRoles([]);
      try { localStorage.removeItem('roles'); } catch (_) {}
    }
  };

  useEffect(() => {
    // Init session from Supabase
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        if (session.access_token) {
          localStorage.setItem('token', session.access_token);
        }
        localStorage.setItem('user', JSON.stringify(session.user));
        await fetchRoles();
      } else {
        setRoles([]);
        try { localStorage.removeItem('roles'); } catch (_) {}
      }
      setLoading(false);
    };
    init();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
        if (session.access_token) {
          localStorage.setItem('token', session.access_token);
        }
        localStorage.setItem('user', JSON.stringify(session.user));
        await fetchRoles();
      } else {
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setRoles([]);
        try { localStorage.removeItem('roles'); } catch (_) {}
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        const message = error.message || 'Erreur de connexion';
        toast.error(message);
        return { success: false, message };
      }
      const session = data.session;
      if (session?.user) {
        setUser(session.user);
        if (session.access_token) {
          localStorage.setItem('token', session.access_token);
        }
        localStorage.setItem('user', JSON.stringify(session.user));
        toast.success('Connexion réussie !');
        return { success: true };
      }
      toast.error('Erreur de connexion');
      return { success: false, message: 'Erreur de connexion' };
    } catch (error) {
      const message = error.message || 'Erreur de connexion';
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (firstName, lastName, email, password) => {
    // Génère un username auto-généré (quasi unique) basé sur nom/prénom ou email
    const generateUsername = () => {
      const nameBase = [String(firstName || '').trim(), String(lastName || '').trim()].filter(Boolean).join(' ');
      const baseRaw = nameBase || String(email).split('@')[0] || 'lokali';
      const base = (baseRaw || '').toLowerCase().replace(/[^a-z0-9]/g, '') || 'lokali';
      const suffix = Math.random().toString(36).slice(2, 8);
      return `${base}-${suffix}`;
    };

    try {
      setLoading(true);
      const username = generateUsername();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { firstName, lastName, username, role: 'user' },
          emailRedirectTo: window.location.origin // Redirection après vérification
        }
      });
      if (error) {
        const message = error.message || "Erreur d'inscription";
        toast.error(message);
        return { success: false, message };
      }
      // Supabase envoie un email de confirmation automatiquement
      toast.success('Compte créé. Vérifiez votre email pour valider.');
      return { success: true };
    } catch (error) {
      const message = error.message || "Erreur d'inscription";
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Déconnexion réussie');
  };

  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({ data: profileData });
      if (error) {
        const message = error.message || 'Erreur de mise à jour';
        toast.error(message);
        return { success: false, message };
      }
      const current = user || (JSON.parse(localStorage.getItem('user')) || {});
      const updatedUser = { ...current, user_metadata: { ...(current?.user_metadata || {}), ...profileData } };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      toast.success('Profil mis à jour !');
      return { success: true };
    } catch (error) {
      const message = error.message || 'Erreur de mise à jour';
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (_currentPassword, newPassword) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        const message = error.message || 'Erreur de changement de mot de passe';
        toast.error(message);
        return { success: false, message };
      }
      toast.success('Mot de passe changé !');
      return { success: true };
    } catch (error) {
      const message = error.message || 'Erreur de changement de mot de passe';
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const hasRole = (r) => roles.includes(r);

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    roles,
    hasRole,
    refreshRoles: fetchRoles,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
