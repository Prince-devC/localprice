import React, { createContext, useContext, useEffect, useState } from 'react';
import { seoService } from '../services/api';

const SeoContext = createContext(null);

const defaultSettings = {
  siteTitle: 'Lokali - Prix agricoles au Bénin',
  siteDescription: 'Accédez aux prix des produits agricoles en temps réel sur les marchés du Bénin. Connectez-vous aux producteurs et acheteurs locaux.',
  siteKeywords: 'prix, produits agricoles, transparence, coopératives, acheteurs, bénin, marché, vivrier',
  homepageTitle: '',
  homepageDescription: '',
  openGraphImage: 'https://lokali.bj/assets/lokali_blue.svg'
};

export function SeoProvider({ children }) {
  const [settings, setSettings] = useState(defaultSettings);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const resp = await seoService.getSettings();
        const data = resp?.data || resp; // Axios vs direct
        if (data && data.success !== false) {
          const s = data?.data || data;
          if (mounted && s) {
            setSettings({
              siteTitle: s.site_title || s.siteTitle || defaultSettings.siteTitle,
              siteDescription: s.site_description || s.siteDescription || defaultSettings.siteDescription,
              siteKeywords: s.site_keywords || s.siteKeywords || defaultSettings.siteKeywords,
              homepageTitle: s.home_title || s.homepageTitle || '',
              homepageDescription: s.home_description || s.homepageDescription || '',
              openGraphImage: s.og_image || s.openGraphImage || ''
            });
          }
        }
      } catch (err) {
        // Garder les valeurs par défaut si l’API n’est pas accessible
      } finally {
        if (mounted) setLoaded(true);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const value = { settings, loaded, refresh: async () => {
    try {
      const resp = await seoService.getSettings();
      const data = resp?.data || resp;
      const s = data?.data || data;
      if (s) {
        setSettings({
          siteTitle: s.site_title || s.siteTitle || defaultSettings.siteTitle,
          siteDescription: s.site_description || s.siteDescription || defaultSettings.siteDescription,
          siteKeywords: s.site_keywords || s.siteKeywords || defaultSettings.siteKeywords,
          homepageTitle: s.home_title || s.homepageTitle || '',
          homepageDescription: s.home_description || s.homepageDescription || '',
          openGraphImage: s.og_image || s.openGraphImage || ''
        });
      }
    } catch (e) {}
  }};

  return (
    <SeoContext.Provider value={value}>
      {children}
    </SeoContext.Provider>
  );
}

export function useSeo() {
  const ctx = useContext(SeoContext);
  if (!ctx) throw new Error('useSeo must be used within SeoProvider');
  return ctx;
}