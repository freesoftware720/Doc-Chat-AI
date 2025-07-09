
'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
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
        className="sm:max-w-2xl"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Sponsored Content</DialogTitle>
        </DialogHeader>
        <div className="py-4">
            <AdRenderer 
              adCode={adCode} 
              className="w-full min-h-[250px]"
            />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
