
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface VideoAdModalProps {
  videoUrl: string;
  skipTimer: number;
  onAdCompleted: () => void;
}

// Helper to convert youtube.com/watch?v=... to youtube.com/embed/...
const getEmbedUrl = (url: string) => {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname.includes('youtube.com') && urlObj.pathname === '/watch') {
      const videoId = urlObj.searchParams.get('v');
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&rel=0`;
    }
    // You could add more handlers for other video services here (e.g., Vimeo)
    return url;
  } catch (error) {
    console.error("Invalid video URL for embedding:", error);
    return ""; // Return empty string if URL is invalid
  }
};


export function VideoAdModal({ videoUrl, skipTimer, onAdCompleted }: VideoAdModalProps) {
  const [countdown, setCountdown] = useState(skipTimer);
  const embedUrl = getEmbedUrl(videoUrl);

  useEffect(() => {
    if (countdown > 0) {
      const timerId = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [countdown]);

  if (!embedUrl) {
      // Don't render the modal if the URL is invalid, and call completion handler
      onAdCompleted();
      return null;
  }

  return (
    <Dialog open={true} modal={true}>
      <DialogContent 
        className="sm:max-w-4xl p-0 overflow-hidden" 
        onPointerDownOutside={(e) => e.preventDefault()}
        hideCloseButton={true}
      >
        <DialogHeader className="p-4 border-b">
          <DialogTitle>Advertisement</DialogTitle>
        </DialogHeader>
        <div className="aspect-video bg-black">
          <iframe
            src={embedUrl}
            title="Advertisement"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full h-full"
          ></iframe>
        </div>
        <DialogFooter className="p-4 border-t">
          <Button onClick={onAdCompleted} disabled={countdown > 0}>
            {countdown > 0 ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Skip in {countdown}s
              </>
            ) : (
              'Skip Ad'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
