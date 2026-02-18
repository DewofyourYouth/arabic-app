import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

const SETTINGS_KEY = 'haki_settings_v1';

const defaultSettings = {
  showArabicScript: true,
  dialect: 'bedouin', // 'urban' (Ah-weh) or 'bedouin' (Gah-weh)
  gChar: 'گ', // Character to use for "Hard G" sound (e.g. 'گ', 'ڨ', 'g')
  nativeLanguage: 'english' // 'english' or 'hebrew'
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      try {
        return { ...defaultSettings, ...JSON.parse(saved) };
      } catch (e) {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const toggleArabicScript = () => {
    setSettings(prev => ({ ...prev, showArabicScript: !prev.showArabicScript }));
  };

  const setDialect = (dialect) => {
    setSettings(prev => ({ ...prev, dialect }));
  };

  const resetOnboarding = () => {
    localStorage.removeItem('haki_onboarding_completed');
    window.location.reload(); // Simple way to re-trigger the check in App.jsx
  };

  const value = {
    settings,
    toggleArabicScript,
    setDialect,
    setGChar: (char) => setSettings(prev => ({ ...prev, gChar: char })),
    setNativeLanguage: (lang) => setSettings(prev => ({ ...prev, nativeLanguage: lang })),
    resetOnboarding
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
