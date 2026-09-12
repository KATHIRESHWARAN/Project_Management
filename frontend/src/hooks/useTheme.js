import { useState, useEffect } from 'react';

export const useTheme = () => {
  const [isCosmic, setIsCosmic] = useState(() => {
    const saved = localStorage.getItem('taskforge_cosmic_theme');
    return saved !== null ? saved === 'true' : true; // Default to Dark Mode
  });

  useEffect(() => {
    // Sync theme class on mount
    if (isCosmic) {
      document.body.classList.add('cosmic-theme');
    } else {
      document.body.classList.remove('cosmic-theme');
    }

    const handleSync = () => {
      const saved = localStorage.getItem('taskforge_cosmic_theme');
      const active = saved !== null ? saved === 'true' : true;
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
