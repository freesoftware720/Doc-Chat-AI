'use client';

import { Megaphone, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const ANNOUNCEMENT_STORAGE_KEY = 'announcement_dismissed_message';

export function AnnouncementBanner({ message }: { message: string | null }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (message) {
      const dismissedMessage = sessionStorage.getItem(ANNOUNCEMENT_STORAGE_KEY);
      if (dismissedMessage !== message) {
        setIsVisible(true);
      }
    } else {
      setIsVisible(false);
    }
  }, [message]);

  const handleDismiss = () => {
    setIsVisible(false);
    if (message) {
      sessionStorage.setItem(ANNOUNCEMENT_STORAGE_KEY, message);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && message && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="relative bg-primary text-primary-foreground overflow-hidden"
          role="alert"
        >
          <div className="container mx-auto px-4 py-2.5 text-center text-sm font-medium flex items-center justify-center gap-2">
            <Megaphone className="h-5 w-5 flex-shrink-0" />
            <span className="flex-grow">{message}</span>
            <button
              onClick={handleDismiss}
              className="p-1 rounded-full hover:bg-black/10 flex-shrink-0"
              aria-label="Dismiss announcement"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
