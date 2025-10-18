import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useSeoSettings } from '../hooks/useSeoSettings';

export default function SeoHead() {
  const seo = useSeoSettings();

  return (
    <Helmet>
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={seo.canonical} />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:image" content={seo.ogImage} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={seo.ogImage} />
      {seo.twitterHandle && <meta name="twitter:site" content={seo.twitterHandle} />}

      {/* Canonical and robots */}
      <link rel="canonical" href={seo.canonical} />
      <meta name="robots" content={seo.robots} />
    </Helmet>
  );
}