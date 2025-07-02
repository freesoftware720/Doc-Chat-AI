
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { VideoAdModal } from '@/components/video-ad-modal';

interface AdModalContextType {
  showAd: (onComplete: () => void) => void;
}

const AdModalContext = createContext<AdModalContextType | undefined>(undefined);

interface AdProviderProps {
  children: ReactNode;
  settings: {
    videoAdCode: string | null;
    videoAdSkipTimer: number;
    adsEnabled: boolean;
  };
  isFreeUser: boolean;
}

export function AdProvider({ children, settings, isFreeUser }: AdProviderProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [onCompleteCallback, setOnCompleteCallback] = useState<(() => void) | null>(null);

  const showAd = (onComplete: () => void) => {
    if (isFreeUser && settings.adsEnabled && settings.videoAdCode) {
      setOnCompleteCallback(() => onComplete);
      setIsVisible(true);
    } else {
      onComplete(); // If not a free user or ads are disabled, run callback immediately
    }
  };

  const handleAdCompleted = () => {
    setIsVisible(false);
    if (onCompleteCallback) {
      onCompleteCallback();
      setOnCompleteCallback(null);
    }
  };

  return (
    <AdModalContext.Provider value={{ showAd }}>
      {children}
      {isVisible && settings.videoAdCode && (
        <VideoAdModal
          adCode={settings.videoAdCode}
          skipTimer={settings.videoAdSkipTimer}
          onAdCompleted={handleAdCompleted}
        />
      )}
    </AdModalContext.Provider>
  );
}

export function useAdModal() {
  const context = useContext(AdModalContext);
  if (context === undefined) {
    throw new Error('useAdModal must be used within an AdProvider');
  }
  return context;
}
