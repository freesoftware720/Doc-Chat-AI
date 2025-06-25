
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReactNode, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const adminNavItems = [
  { href: '/app/admin', label: 'Overview' },
  { href: '/app/admin/settings', label: 'Settings' },
  { href: '/app/admin/audit-log', label: 'Audit Log' },
  { href: '/app/admin/members', label: 'Members' },
];

function AdminLayoutSkeleton() {
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

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <Suspense fallback={<AdminLayoutSkeleton />}>
        <div className="p-4 md:p-6 space-y-6">
            <header className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold font-headline">Admin Dashboard</h1>
                <p className="text-muted-foreground mt-1">Manage your workspace settings and view analytics.</p>
            </header>

            <Tabs value={pathname} className="w-full">
                <TabsList className="grid w-full grid-cols-4 max-w-lg">
                    {adminNavItems.map(item => (
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
