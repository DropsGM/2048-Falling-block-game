'use client';

export type Theme = 'light' | 'dark';

export function setTheme(theme: Theme) {
  localStorage.setItem('theme', theme);
  const doc = document.documentElement;
  if (theme === 'dark') {
    doc.classList.add('dark');
  } else {
    doc.classList.remove('dark');
  }
}

export function getTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  
  const stored = localStorage.getItem('theme') as Theme | null;
  if (stored) return stored;
  
  // System preference
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

export function initTheme() {
  const theme = getTheme();
  setTheme(theme);
}
