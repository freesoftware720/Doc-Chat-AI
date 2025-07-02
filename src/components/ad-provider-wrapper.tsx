
'use client';

import { AdProvider } from '@/hooks/use-ad-modal';
import type { ReactNode } from 'react';

interface AdProviderWrapperProps {
  children: ReactNode;
  settings: {
    videoAdUrl: string | null;
    videoAdSkipTimer: number;
    adsEnabled: boolean;
  };
  isFreeUser: boolean;
}

export function AdProviderWrapper({ children, settings, isFreeUser }: AdProviderWrapperProps) {
  return (
    <AdProvider settings={settings} isFreeUser={isFreeUser}>
      {children}
    </AdProvider>
  )
}
