import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { localePath, useLang } from '../i18n/index.js';

const SITE_URL = 'https://austinyoo.com';
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;

/**
 * hreflang alternates and JSON-LD are *additive* head tags: if one is ever left behind
 * (react-helmet-async can leak an instance on some pages), they pile up across pages.
 * Managing them in an effect guarantees they are removed when the page changes.
 */
function useAdditiveHeadTags(alternates, jsonLd) {
  const alternatesKey = JSON.stringify(alternates);
  const jsonLdKey = jsonLd ? JSON.stringify(jsonLd) : '';

  useEffect(() => {
    const nodes = [];

    JSON.parse(alternatesKey).forEach(({ hrefLang, href }) => {
      const link = document.createElement('link');
      link.rel = 'alternate';
      link.setAttribute('hreflang', hrefLang);
      link.href = href;
      document.head.appendChild(link);
      nodes.push(link);
    });

    if (jsonLdKey) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.text = jsonLdKey;
      document.head.appendChild(script);
      nodes.push(script);
    }

    return () => nodes.forEach((node) => node.remove());
  }, [alternatesKey, jsonLdKey]);
}

/**
 * `path` is the language-agnostic path (e.g. "/projects"); the canonical URL,
 * hreflang alternates and og:locale are derived from the current language.
 */
export default function Seo({ title, description, path = '/', jsonLd }) {
  const lang = useLang();
  const url = `${SITE_URL}${localePath(lang, path)}`;
  const enUrl = `${SITE_URL}${localePath('en', path)}`;
  const koUrl = `${SITE_URL}${localePath('ko', path)}`;
  const fullTitle = title
    ? `${title} | Austin Yoo`
    : 'Austin Yoo | BI Analyst, Automation Developer, Full-Stack Developer';

  useAdditiveHeadTags(
    [
      { hrefLang: 'en', href: enUrl },
      { hrefLang: 'ko', href: koUrl },
      { hrefLang: 'x-default', href: enUrl },
    ],
    jsonLd
  );

  return (
    // defer={false}: apply tags synchronously instead of waiting for requestAnimationFrame
    <Helmet defer={false}>
      <html lang={lang} />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      <meta property="og:type" content="website" />
      <meta property="og:locale" content={lang === 'ko' ? 'ko_KR' : 'en_US'} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={DEFAULT_IMAGE} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={DEFAULT_IMAGE} />
    </Helmet>
  );
}
