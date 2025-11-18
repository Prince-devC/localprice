import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Remonte automatiquement en haut lors des changements de route
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // Si on navigue vers une ancre (#section), laisser le navigateur gérer
    if (hash) return;
    // Remonter tout en haut
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname, hash]);

  return null;
}