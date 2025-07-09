
'use client';

import { AdProvider } from '@/hooks/use-ad-modal';
import type { ReactNode } from 'react';

interface AdProviderWrapperProps {
  children: ReactNode;
  settings: {
    videoAdCode: string | null;
    videoAdSkipTimer: number;
    videoAdsEnabled: boolean;
    multiplexAdCode: string | null;
    multiplexAdsEnabled: boolean;
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
