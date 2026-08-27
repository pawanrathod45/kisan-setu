import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, languages } from '../utils/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    try {
      return localStorage.getItem('language') || 'en';
    } catch {
      return 'en';
    }
  });

  const setLanguage = (newLang) => {
    if (!newLang || !translations[newLang]) return;
    setLanguageState(newLang);
    try {
      localStorage.setItem('language', newLang);
      document.documentElement.lang = newLang;
      // Dispatch event for any non-React listeners
      window.dispatchEvent(new CustomEvent('ks-language-change', { detail: newLang }));
    } catch (e) {
      console.error('Failed to save language preference:', e);
    }
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  // Sync across tabs/windows
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'language' && e.newValue && translations[e.newValue]) {
        setLanguageState(e.newValue);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const t = translations[language] || translations.en;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languages }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    // Fallback if rendered outside provider
    const fallbackLang = typeof window !== 'undefined' ? localStorage.getItem('language') || 'en' : 'en';
    return {
      language: fallbackLang,
      setLanguage: () => {},
      t: translations[fallbackLang] || translations.en,
      languages
    };
  }
  return context;
};

export default LanguageContext;
