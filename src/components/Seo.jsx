import { Helmet } from 'react-helmet-async';

const SITE_URL = 'https://austinyoo.com';
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;

export default function Seo({ title, description, path = '/', jsonLd }) {
  const url = `${SITE_URL}${path}`;
  const fullTitle = title
    ? `${title} | Austin Yoo`
    : 'Austin Yoo — BI Analyst, Automation Developer, Full-Stack Developer';

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={DEFAULT_IMAGE} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={DEFAULT_IMAGE} />

      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
}
