import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export function getInitialTheme() {
  try {
    const saved = window.localStorage.getItem('campussphere-theme');
    if (saved === 'dark' || saved === 'light') return saved;
  } catch {
    // fallback
  }
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

export function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  try {
    window.localStorage.setItem('campussphere-theme', theme);
  } catch {
    // ignore storage error
  }
}

export default function ThemeToggle({ className = '' }) {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    applyTheme(nextTheme);
  };

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      className={`campus-theme-toggle ${className}`}
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <span className="theme-toggle-indicator">
        {isDark ? <Sun size={15} /> : <Moon size={15} />}
      </span>
      <span className="theme-toggle-label">{isDark ? 'Light' : 'Dark'}</span>
    </button>
  );
}
