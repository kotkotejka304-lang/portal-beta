import { ActiveTheme, ThemePreference } from '../types/browser';

const THEME_STORAGE_KEY = 'portal_theme_preference_v1';

export function getSavedThemePreference(): ThemePreference {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemePreference;
    if (saved === 'light' || saved === 'dark' || saved === 'system') {
      return saved;
    }
    return 'system';
  } catch {
    return 'system';
  }
}

export function saveThemePreference(theme: ThemePreference): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (err) {
    console.error('Failed saving theme preference', err);
  }
}

export function getSystemTheme(): ActiveTheme {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'dark';
}

export function resolveActiveTheme(preference: ThemePreference): ActiveTheme {
  if (preference === 'system') {
    return getSystemTheme();
  }
  return preference;
}

export function applyThemeToDocument(theme: ActiveTheme): void {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }
}
