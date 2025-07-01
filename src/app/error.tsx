
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TriangleAlert } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex h-screen min-h-screen w-full items-center justify-center bg-background p-4">
       <div className="absolute inset-0 -z-10 h-full w-full bg-background">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-0 dark:opacity-20"></div>
        <div className="absolute inset-0 -z-20 overflow-hidden">
          <div className="absolute -left-40 -top-40 h-[40rem] w-[40rem] animate-gradient-move-1 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-40 -right-40 h-[40rem] w-[40rem] animate-gradient-move-2 rounded-full bg-accent/10 blur-3xl" />
        </div>
      </div>
      <Card className="w-full max-w-md text-center bg-card/60 backdrop-blur-md border-white/10 shadow-lg">
        <CardHeader>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <TriangleAlert className="h-10 w-10 text-destructive" />
          </div>
          <CardTitle className="mt-4 text-2xl font-bold">Something went wrong!</CardTitle>
          <CardDescription>
            An unexpected error occurred. You can try to reload the page.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <pre className="mt-2 text-left text-xs text-muted-foreground bg-muted p-2 rounded-md overflow-x-auto">
             <code>{error.message}</code>
           </pre>
          <Button onClick={() => reset()} className="mt-6 w-full">
            Try again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
