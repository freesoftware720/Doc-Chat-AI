
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, MessageSquare, FileUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BottomNav() {
    const pathname = usePathname();

    return (
        <div className="fixed bottom-0 left-0 right-0 z-40 h-16 border-t bg-background/95 backdrop-blur-lg md:hidden">
            <nav className="flex h-full items-center justify-around">
                <Link href="/app" passHref className={cn(
                    "flex flex-col items-center justify-center gap-1 rounded-md p-2 transition-colors w-24 h-full",
                    (pathname === '/app') ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-primary'
                )}>
                    <LayoutDashboard className="h-6 w-6" />
                    <span className="text-xs">Dashboard</span>
                </Link>

                <div className="flex-shrink-0">
                     <Link href="/app/uploads" passHref>
                        <Button size="lg" className="h-16 w-16 rounded-full shadow-lg -translate-y-6 flex items-center justify-center bg-primary hover:bg-primary/90 text-primary-foreground">
                            <FileUp className="h-7 w-7" />
                            <span className="sr-only">Upload</span>
                        </Button>
                    </Link>
                </div>

                <Link href="/app/chat" passHref className={cn(
                    "flex flex-col items-center justify-center gap-1 rounded-md p-2 transition-colors w-24 h-full",
                    (pathname.startsWith('/app/chat')) ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-primary'
                )}>
                    <MessageSquare className="h-6 w-6" />
                    <span className="text-xs">Chat</span>
                </Link>
            </nav>
        </div>
    );
}
