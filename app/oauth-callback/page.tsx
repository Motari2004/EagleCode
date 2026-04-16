"use client";

import dynamic from 'next/dynamic';

// Dynamically import the actual component with SSR disabled
const OAuthCallbackContent = dynamic(
  () => import('./OAuthCallbackContent'),
  { ssr: false }
);

export default function OAuthCallbackPage() {
  return <OAuthCallbackContent />;
}