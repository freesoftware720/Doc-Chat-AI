"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/icons";
import { Button } from "@/components/ui/button";

export function Header() {
  const pathname = usePathname();
  const isLandingPage = pathname === "/";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-lg">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Logo className="h-7 w-7" />
          <span className="font-bold font-headline text-2xl tracking-tight">DocuChat AI</span>
        </Link>
        
        {isLandingPage && (
          <nav className="hidden md:flex flex-1 items-center gap-6 text-sm">
            <Link href="/#features" className="text-muted-foreground transition-colors hover:text-foreground">Features</Link>
            <Link href="/#pricing" className="text-muted-foreground transition-colors hover:text-foreground">Pricing</Link>
            <Link href="/#faq" className="text-muted-foreground transition-colors hover:text-foreground">FAQ</Link>
          </nav>
        )}

        <div className="flex flex-1 items-center justify-end space-x-2">
          {isLandingPage && (
             <div className="hidden sm:flex items-center space-x-2">
              <Button variant="ghost" asChild>
                <Link href="/app">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/app">Get Started Free</Link>
              </Button>
            </div>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
