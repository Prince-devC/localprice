import { useEffect } from 'react';
import { useSeo } from '../contexts/SeoContext';

function ensureMetaName(name, content) {
  if (content === undefined || content === null) return;
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', String(content));
}

function ensureMetaProperty(property, content) {
  if (content === undefined || content === null) return;
  let el = document.querySelector(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('property', property);
    document.head.appendChild(el);
  }
  el.setAttribute('content', String(content));
}

export default function Seo({ title, description, keywords, image }) {
  const { settings } = useSeo();

  useEffect(() => {
    const finalTitle = title || settings.homepageTitle || settings.siteTitle;
    const finalDescription = description || settings.homepageDescription || settings.siteDescription;
    const finalKeywords = keywords || settings.siteKeywords;
    const finalImage = image || settings.openGraphImage;

    if (finalTitle) document.title = finalTitle;
    ensureMetaName('description', finalDescription || '');
    ensureMetaName('keywords', finalKeywords || '');

    // Open Graph
    ensureMetaProperty('og:title', finalTitle || '');
    ensureMetaProperty('og:description', finalDescription || '');
    if (finalImage) ensureMetaProperty('og:image', finalImage);
    ensureMetaProperty('og:type', 'website');

    // Twitter Cards
    ensureMetaName('twitter:title', finalTitle || '');
    ensureMetaName('twitter:description', finalDescription || '');
    if (finalImage) ensureMetaName('twitter:image', finalImage);
  }, [title, description, keywords, image, settings]);

  return null;
}