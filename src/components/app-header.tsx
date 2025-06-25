
'use client';

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Logo } from "@/components/icons";
import Link from "next/link";

export function AppHeader() {
    return (
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between gap-4 border-b bg-background/95 px-4 backdrop-blur-lg md:hidden">
            <SidebarTrigger />
            <Link href="/app" className="flex items-center gap-2">
                <Logo className="h-6 w-6" />
                <span className="font-bold font-headline text-lg tracking-tight">Doc-Chat AI</span>
            </Link>
            {/* Empty div for spacing */}
            <div className="w-8"></div>
        </header>
    );
}
