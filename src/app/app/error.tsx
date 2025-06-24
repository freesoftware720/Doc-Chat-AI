
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TriangleAlert } from 'lucide-react';
import Link from 'next/link';

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md text-center bg-card/60 backdrop-blur-md border-white/10 shadow-lg">
        <CardHeader>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <TriangleAlert className="h-10 w-10 text-destructive" />
          </div>
          <CardTitle className="mt-4 text-2xl font-bold">An Error Occurred</CardTitle>
          <CardDescription>
            Something went wrong inside the application.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            You can try to recover from this error or go back to your dashboard.
          </p>
           <pre className="mt-2 text-left text-xs text-muted-foreground bg-muted p-2 rounded-md overflow-x-auto">
             <code>{error.message}</code>
           </pre>
          <div className="flex gap-4">
            <Button onClick={() => reset()} className="w-full">
              Try again
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/app">Go to Dashboard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
