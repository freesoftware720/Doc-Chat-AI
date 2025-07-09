
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { VideoAdModal } from '@/components/video-ad-modal';
import { MultiplexAdModal } from '@/components/multiplex-ad-modal';

interface AdModalContextType {
  showAd: (onComplete: () => void) => void;
}

const AdModalContext = createContext<AdModalContextType | undefined>(undefined);

interface AdProviderProps {
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

export function AdProvider({ children, settings, isFreeUser }: AdProviderProps) {
  const [isVideoVisible, setIsVideoVisible] = useState(false);
  const [isMultiplexVisible, setIsMultiplexVisible] = useState(false);
  const [onCompleteCallback, setOnCompleteCallback] = useState<(() => void) | null>(null);

  const showAd = (onComplete: () => void) => {
    // Priority: Multiplex > Video > No ad
    if (isFreeUser && settings.multiplexAdsEnabled && settings.multiplexAdCode) {
        setOnCompleteCallback(() => onComplete);
        setIsMultiplexVisible(true);
    } else if (isFreeUser && settings.videoAdsEnabled && settings.videoAdCode) {
      setOnCompleteCallback(() => onComplete);
      setIsVideoVisible(true);
    } else {
      onComplete(); // If ads are disabled or user is Pro, run callback immediately
    }
  };

  const handleAdCompleted = () => {
    setIsVideoVisible(false);
    setIsMultiplexVisible(false); // Close both just in case
    if (onCompleteCallback) {
      onCompleteCallback();
      setOnCompleteCallback(null);
    }
  };

  return (
    <AdModalContext.Provider value={{ showAd }}>
      {children}
      {isVideoVisible && settings.videoAdCode && (
        <VideoAdModal
          adCode={settings.videoAdCode}
          skipTimer={settings.videoAdSkipTimer}
          onAdCompleted={handleAdCompleted}
        />
      )}
      {isMultiplexVisible && settings.multiplexAdCode && (
        <MultiplexAdModal
          adCode={settings.multiplexAdCode}
          onClose={handleAdCompleted}
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
