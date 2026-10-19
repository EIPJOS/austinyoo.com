import { useCallback } from 'react';
import { useLocation } from 'react-router-dom';

export const LANGS = ['en', 'ko'];
export const DEFAULT_LANG = 'en';
export const LANG_STORAGE_KEY = 'austinyoo:lang';

/** The language is determined by the URL: `/ko/...` is Korean, everything else is English. */
export function langFromPath(pathname) {
  return pathname === '/ko' || pathname.startsWith('/ko/') ? 'ko' : 'en';
}

/** Remove the language prefix: `/ko/projects` -> `/projects`, `/ko` -> `/`. */
export function stripLang(pathname) {
  if (pathname === '/ko') return '/';
  return pathname.startsWith('/ko/') ? pathname.slice(3) : pathname;
}

/** Add the language prefix for `lang` to a language-agnostic path (hash/query are preserved). */
export function localePath(lang, path) {
  if (lang !== 'ko') return path;
  if (path === '/') return '/ko';
  return `/ko${path}`;
}

export function useLang() {
  const { pathname } = useLocation();
  return langFromPath(pathname);
}

/** Returns a function that turns `/projects` into `/ko/projects` when the site is in Korean. */
export function useLocalePath() {
  const lang = useLang();
  return useCallback((path) => localePath(lang, path), [lang]);
}

export function rememberLang(lang) {
  try {
    localStorage.setItem(LANG_STORAGE_KEY, lang);
  } catch {
    /* storage may be unavailable (private mode); the URL still carries the language */
  }
}

export function storedLang() {
  try {
    const value = localStorage.getItem(LANG_STORAGE_KEY);
    return LANGS.includes(value) ? value : null;
  } catch {
    return null;
  }
}
