export type Theme = 'system' | 'dark' | 'light';

const storageThemeKey = 'theme';

export function saveTheme(selectedTheme: Theme) {
  if (selectedTheme === 'dark' || selectedTheme === 'light') {
    localStorage.setItem(storageThemeKey, selectedTheme);
  } else {
    localStorage.removeItem(storageThemeKey);
  }
}

export function getTheme() {
  return localStorage.getItem(storageThemeKey) as Theme | null;
}

export function setTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
}
