
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { AdRenderer } from './ad-renderer';

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
        className="sm:max-w-4xl p-0 overflow-hidden border-none bg-transparent shadow-2xl shadow-primary/20" 
        onPointerDownOutside={(e) => e.preventDefault()}
        hideCloseButton={true}
      >
        <div className="bg-card/80 backdrop-blur-2xl rounded-3xl overflow-hidden border border-white/10">
          <DialogHeader className="p-4 text-center">
            <DialogTitle className="text-xl font-bold font-headline">Advertisement</DialogTitle>
          </DialogHeader>
          <div className="aspect-video bg-black flex items-center justify-center">
              <AdRenderer 
                adCode={adCode} 
                className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full"
              />
          </div>
          <DialogFooter className="p-4 justify-center">
            <Button onClick={onAdCompleted} disabled={countdown > 0} size="lg" className="h-14 text-lg">
              {countdown > 0 ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Skip in {countdown}s
                </>
              ) : (
                'Continue to App'
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
