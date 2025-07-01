
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReactNode, Suspense, useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { redirect } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert } from 'lucide-react';
import { isSuperAdmin } from '@/app/actions/super-admin';

const superAdminNavItems = [
  { href: '/app/super-admin', label: 'Overview' },
  { href: '/app/super-admin/users', label: 'Users' },
  { href: '/app/super-admin/documents', label: 'Documents' },
  { href: '/app/super-admin/plans', label: 'Plans' },
  { href: '/app/super-admin/subscriptions', label: 'Subscriptions' },
  { href: '/app/super-admin/referrals', label: 'Referrals' },
  { href: '/app/super-admin/settings', label: 'App Settings' },
  { href: '/app/super-admin/payments', label: 'Payments' },
];

function SuperAdminLayoutSkeleton() {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <header className="mb-6">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-5 w-80 mt-2" />
        </header>
        <Card className="bg-card/60 backdrop-blur-md border-white/10 shadow-lg">
          <CardHeader>
            <div className="flex border-b">
                <Skeleton className="h-10 w-24 mr-2" />
                <Skeleton className="h-10 w-24 mr-2" />
                <Skeleton className="h-10 w-24 mr-2" />
                <Skeleton className="h-10 w-24 mr-2" />
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

export default function SuperAdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isAllowed, setIsAllowed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    isSuperAdmin().then(allowed => {
      setIsAllowed(allowed);
      setIsLoading(false);
      if (!allowed) {
        window.location.href = '/app';
      }
    });
  }, []);
  
  if (isLoading) {
    return <SuperAdminLayoutSkeleton />;
  }

  if (!isAllowed) {
     return (
        <div className="flex h-full items-center justify-center p-4">
            <Alert variant="destructive" className="max-w-lg">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>Access Denied</AlertTitle>
                <AlertDescription>
                   You do not have permission to view this page. Redirecting...
                </AlertDescription>
            </Alert>
        </div>
      )
  }

  // Find the base path for the active tab.
  // e.g., /app/super-admin/plans/edit/1 -> /app/super-admin/plans
  // Sort by href length descending to find the most specific match first.
  const sortedNavItems = [...superAdminNavItems].sort((a, b) => b.href.length - a.href.length);
  const activeTabValue = sortedNavItems.find(item => pathname.startsWith(item.href))?.href || '/app/super-admin';

  return (
    <Suspense fallback={<SuperAdminLayoutSkeleton />}>
        <div className="p-4 md:p-6 space-y-6">
            <header className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold font-headline">Super Admin Panel</h1>
                <p className="text-muted-foreground mt-1">Manage the entire application and all users.</p>
            </header>

            <Tabs value={activeTabValue} className="w-full">
                <TabsList className="grid w-full grid-cols-4 sm:grid-cols-4 lg:grid-cols-8 max-w-6xl">
                    {superAdminNavItems.map(item => (
                        <TabsTrigger key={item.href} value={item.href} asChild>
                           <Link href={item.href}>{item.label}</Link>
                        </TabsTrigger>
                    ))}
                </TabsList>
                <div className="mt-6">{children}</div>
            </Tabs>
        </div>
    </Suspense>
  );
}
