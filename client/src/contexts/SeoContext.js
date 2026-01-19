import React, { createContext, useContext, useEffect, useState } from 'react';
import { seoService } from '../services/api';

const SeoContext = createContext(null);

const defaultSettings = {
  siteTitle: 'Lokali',
  siteDescription: 'Plateforme de transparence de prix des produits agricoles et de mise en relation des coopératives et acheteurs.',
  siteKeywords: 'prix, produits agricoles, transparence, coopératives, acheteurs, bénin',
  homepageTitle: '',
  homepageDescription: '',
  openGraphImage: ''
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