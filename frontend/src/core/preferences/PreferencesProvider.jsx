import { useState, useEffect, useCallback } from 'react';
import { translations } from './translations';
import { PreferencesContext } from './PreferencesContext';

export function PreferencesProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('civiclink-theme') || 'light';
  });
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('civiclink-language') || 'English';
  });

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('civiclink-theme', theme);
  }, [theme]);

  // Persist language
  useEffect(() => {
    localStorage.setItem('civiclink-language', language);
  }, [language]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  const t = useCallback((key) => {
    return translations[language]?.[key] || translations.English[key] || key;
  }, [language]);

  const isDark = theme === 'dark';

  return (
    <PreferencesContext.Provider value={{ theme, isDark, toggleTheme, setTheme, language, setLanguage, t }}>
      {children}
    </PreferencesContext.Provider>
  );
}
