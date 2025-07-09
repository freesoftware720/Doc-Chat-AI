
'use client';

import { Megaphone, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const ANNOUNCEMENT_STORAGE_KEY = 'announcement_dismissed_message';

export function AnnouncementBanner({ message }: { message: string | null }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) {
      return;
    }

    if (message) {
      const dismissedMessage = sessionStorage.getItem(ANNOUNCEMENT_STORAGE_KEY);
      if (dismissedMessage !== message) {
        setIsVisible(true);
        const openTimeout = setTimeout(() => setIsExpanded(true), 1000);
        return () => clearTimeout(openTimeout);
      } else {
        setIsVisible(true);
        setIsExpanded(false);
      }
    } else {
      setIsVisible(false);
    }
  }, [message, isMounted]);

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the click from re-opening the banner
    setIsExpanded(false);
    if (message) {
      sessionStorage.setItem(ANNOUNCEMENT_STORAGE_KEY, message);
    }
  };

  const containerVariants = {
    collapsed: {
      width: '3.5rem',
      height: '3.5rem',
      borderRadius: '9999px',
      transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
    },
    expanded: {
      width: '380px',
      height: 'auto',
      borderRadius: '1.5rem', // rounded-2xl
      transition: {
        type: 'tween', // Use a tween for smoother, non-bouncy animation
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1], // A very smooth ease-out curve
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };
  
  const contentVariants = {
      collapsed: { opacity: 0, y: 10, transition: { duration: 0.2 } },
      expanded: { opacity: 1, y: 0, transition: { duration: 0.4, delay: 0.1 } }, // Slight delay for content
  };

  if (!isMounted) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && message && (
        <motion.div
          className="fixed bottom-6 right-6 z-50"
          initial={{ opacity: 0, y: 50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.8 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        >
          <motion.div
            variants={containerVariants}
            initial="collapsed"
            animate={isExpanded ? "expanded" : "collapsed"}
            className="overflow-hidden bg-primary/90 backdrop-blur-xl border border-white/20 shadow-2xl shadow-primary/20 cursor-pointer"
            onClick={() => !isExpanded && setIsExpanded(true)}
          >
            <AnimatePresence mode="wait" initial={false}>
                {isExpanded ? (
                    <motion.div 
                        key="content"
                        variants={contentVariants}
                        initial="collapsed"
                        animate="expanded"
                        exit="collapsed"
                        className="p-5 flex flex-col h-full pointer-events-auto"
                    >
                        <div 
                            className="flex items-start gap-4 text-primary-foreground"
                        >
                            <div className="p-2 bg-white/10 rounded-full mt-1">
                                <Megaphone className="h-6 w-6" />
                            </div>
                            <div className="flex-grow">
                                <h4 className="font-bold">Announcement</h4>
                                <p className="text-sm font-medium mt-1">{message}</p>
                            </div>
                            <button
                                onClick={handleDismiss}
                                className="p-1.5 rounded-full hover:bg-white/20 transition-colors flex-shrink-0 -mr-2 -mt-2"
                                aria-label="Dismiss announcement"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="icon"
                        className="flex items-center justify-center h-full w-full"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1, transition: { delay: 0.4 } }}
                        exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                    >
                         <Megaphone className="h-7 w-7 text-primary-foreground" />
                    </motion.div>
                )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
