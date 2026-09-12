import { useState, useEffect } from 'react';

export const useTheme = () => {
  const [isCosmic, setIsCosmic] = useState(() => {
    return localStorage.getItem('taskforge_cosmic_theme') === 'true';
  });

  useEffect(() => {
    // Sync theme class on mount
    if (isCosmic) {
      document.body.classList.add('cosmic-theme');
    } else {
      document.body.classList.remove('cosmic-theme');
    }

    const handleSync = () => {
      const active = localStorage.getItem('taskforge_cosmic_theme') === 'true';
      setIsCosmic(active);
      if (active) {
        document.body.classList.add('cosmic-theme');
      } else {
        document.body.classList.remove('cosmic-theme');
      }
    };

    window.addEventListener('storage', handleSync);
    window.addEventListener('taskforge_theme_toggle', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('taskforge_theme_toggle', handleSync);
    };
  }, [isCosmic]);

  const toggleTheme = (val) => {
    const nextVal = typeof val === 'boolean' ? val : !isCosmic;
    setIsCosmic(nextVal);
    localStorage.setItem('taskforge_cosmic_theme', nextVal ? 'true' : 'false');
    if (nextVal) {
      document.body.classList.add('cosmic-theme');
    } else {
      document.body.classList.remove('cosmic-theme');
    }
    window.dispatchEvent(new Event('taskforge_theme_toggle'));
  };

  return { isCosmic, toggleTheme };
};
