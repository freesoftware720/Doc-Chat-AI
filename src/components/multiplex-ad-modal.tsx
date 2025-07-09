
'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AdRenderer } from './ad-renderer';

interface MultiplexAdModalProps {
  adCode: string;
  onClose: () => void;
}

export function MultiplexAdModal({ adCode, onClose }: MultiplexAdModalProps) {
  if (!adCode) {
    return null;
  }

  return (
    <Dialog open={true} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent 
        className="sm:max-w-lg p-0 border-none bg-transparent shadow-2xl shadow-primary/20"
        onPointerDownOutside={(e) => e.preventDefault()}
        hideCloseButton={true}
      >
        <div className="bg-card/80 backdrop-blur-2xl rounded-3xl overflow-hidden border border-white/10">
            <DialogHeader className="p-6 text-center">
                <DialogTitle className="text-xl font-bold font-headline">Sponsored Content</DialogTitle>
                <DialogDescription>
                    Your action will continue after closing this ad.
                </DialogDescription>
            </DialogHeader>
            <div className="px-6 pb-6">
                <div className="bg-background/50 rounded-2xl p-2 min-h-[250px]">
                    <AdRenderer 
                      adCode={adCode} 
                      className="w-full h-full"
                    />
                </div>
            </div>
            <DialogFooter className="p-4 bg-muted/30">
              <DialogClose asChild>
                <Button type="button" variant="ghost" className="w-full h-12 text-lg font-bold text-primary">
                  Continue
                </Button>
              </DialogClose>
            </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
