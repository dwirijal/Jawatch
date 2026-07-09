'use client';
import Script from 'next/script';
const ADS_ID = process.env.NEXT_PUBLIC_GADS_CLIENT_ID;
export function GoogleAds() {
  if (!ADS_ID) return null;
  return <Script src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADS_ID}`} strategy="lazyOnload" crossOrigin="anonymous" />;
}
