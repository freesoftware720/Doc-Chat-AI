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
          className="overflow-hidden"
          role="alert"
        >
          <div className="p-2">
            <div
              className="w-full max-w-3xl mx-auto bg-primary/90 backdrop-blur-lg border border-white/10 text-primary-foreground rounded-2xl shadow-2xl shadow-primary/20 flex items-center gap-4 pl-5 pr-3 py-3"
            >
              <Megaphone className="h-6 w-6 flex-shrink-0" />
              <span className="flex-grow text-sm font-medium">{message}</span>
              <button
                onClick={handleDismiss}
                className="p-1.5 rounded-full hover:bg-white/10 transition-colors flex-shrink-0"
                aria-label="Dismiss announcement"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
