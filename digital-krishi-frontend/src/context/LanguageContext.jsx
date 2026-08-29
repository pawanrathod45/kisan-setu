import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
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

  const setLanguage = useCallback((newLang) => {
    if (!newLang || !translations[newLang]) return;
    setLanguageState(newLang);
    try {
      localStorage.setItem('language', newLang);
      document.documentElement.lang = newLang;
      // Dispatch event for non-React listeners
      window.dispatchEvent(new CustomEvent('ks-language-change', { detail: newLang }));
    } catch (e) {
      console.error('Failed to save language preference:', e);
    }
  }, []);

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

  // Universal translation function with interpolation and fallback
  const t = useMemo(() => {
    const currentDict = translations[language] || translations.en;
    const fallbackDict = translations.en;

    const translateFn = (key, paramsOrFallback = {}) => {
      if (!key) return '';
      
      let str = currentDict[key] || fallbackDict[key];
      
      // If not found in dictionary, check if a fallback string was passed
      if (!str) {
        if (typeof paramsOrFallback === 'string') {
          return paramsOrFallback;
        }
        return key;
      }

      // Handle interpolation: {count}, {revenue}, {name}, {acres}, {liters}, etc.
      if (typeof paramsOrFallback === 'object' && paramsOrFallback !== null) {
        Object.keys(paramsOrFallback).forEach((paramKey) => {
          str = str.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), paramsOrFallback[paramKey]);
        });
      }

      return str;
    };

    // Return a Proxy so t can be called as a function t('key', { params }) OR accessed as t.key
    return new Proxy(translateFn, {
      get: (target, prop) => {
        if (typeof prop === 'string') {
          if (prop in target) {
            return target[prop];
          }
          return currentDict[prop] || fallbackDict[prop] || prop;
        }
        return target[prop];
      }
    });
  }, [language]);

  const value = useMemo(() => ({
    language,
    setLanguage,
    t,
    languages
  }), [language, setLanguage, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    const fallbackLang = typeof window !== 'undefined' ? localStorage.getItem('language') || 'en' : 'en';
    const currentDict = translations[fallbackLang] || translations.en;
    const fallbackDict = translations.en;

    const fallbackFn = (key, paramsOrFallback = {}) => {
      let str = currentDict[key] || fallbackDict[key] || (typeof paramsOrFallback === 'string' ? paramsOrFallback : key);
      if (typeof paramsOrFallback === 'object' && paramsOrFallback !== null) {
        Object.keys(paramsOrFallback).forEach((k) => {
          str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), paramsOrFallback[k]);
        });
      }
      return str;
    };

    const tProxy = new Proxy(fallbackFn, {
      get: (target, prop) => currentDict[prop] || fallbackDict[prop] || prop
    });

    return {
      language: fallbackLang,
      setLanguage: () => {},
      t: tProxy,
      languages
    };
  }
  return context;
};

export default LanguageContext;
