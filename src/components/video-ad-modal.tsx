
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface VideoAdModalProps {
  adCode: string;
  skipTimer: number;
  onAdCompleted: () => void;
}

export function VideoAdModal({ adCode, skipTimer, onAdCompleted }: VideoAdModalProps) {
  const [countdown, setCountdown] = useState(skipTimer);

  useEffect(() => {
    // If there's no ad code, complete immediately.
    if (!adCode) {
      onAdCompleted();
      return;
    }

    if (countdown > 0) {
      const timerId = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [adCode, countdown, onAdCompleted]);

  // Don't render anything if there's no ad code to show.
  if (!adCode) {
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
          <DialogDescription className="sr-only">
            A video ad is displayed. You can skip it after the timer ends.
          </DialogDescription>
        </DialogHeader>
        <div className="aspect-video bg-black flex items-center justify-center">
            {/* This div will render the ad network's script */}
            <div
                className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full" // Ensure iframes from ad networks are responsive
                dangerouslySetInnerHTML={{ __html: adCode }}
            />
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
