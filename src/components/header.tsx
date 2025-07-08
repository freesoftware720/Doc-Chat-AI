
"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Header({ user }: { user: User | null }) {
  const pathname = usePathname();
  const isLandingPage = pathname === "/";
  
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
        const currentScrollY = window.scrollY;
        
        // Always show if scrolling near the top
        if (currentScrollY < 100) {
            setIsVisible(true);
        }
        // Hide on scroll down
        else if (currentScrollY > lastScrollY.current) {
            setIsVisible(false);
        } 
        // Show on scroll up
        else {
            setIsVisible(true);
        }
        
        lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
        window.removeEventListener('scroll', handleScroll);
    };
  }, []);


  const navItems = [
    { href: "/#features", label: "Features" },
    { href: "/#pricing", label: "Pricing" },
    { href: "/#faq", label: "FAQ" },
  ];
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed top-0 z-50 w-full px-2 py-2 md:px-4 md:py-4"
          initial={{ y: "-100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
        >
          <header className="flex h-16 max-w-screen-2xl mx-auto items-center justify-between rounded-2xl border border-primary/20 bg-background/80 backdrop-blur-lg shadow-2xl shadow-primary/20 px-4 md:px-6">
            <Link href="/" className="flex items-center space-x-2">
              <Logo className="h-8 w-8 drop-shadow-[0_0_5px_hsl(var(--primary)/0.7)]" />
              <span className="font-bold font-headline text-2xl tracking-tight">Doc-Chat AI</span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              {isLandingPage && (
                <nav className="flex items-center gap-6 text-sm">
                  {navItems.map(item => (
                    <Link key={item.href} href={item.href} className="text-muted-foreground transition-colors hover:text-foreground">
                      {item.label}
                    </Link>
                  ))}
                </nav>
              )}
              <div className="flex items-center space-x-2">
                {user ? (
                  <Button asChild>
                      <Link href="/app">Go to Dashboard</Link>
                    </Button>
                ) : (
                  <>
                    <Button variant="ghost" asChild>
                      <Link href="/auth/login">Sign In</Link>
                    </Button>
                    <Button asChild>
                      <Link href="/auth/register">Get Started Free</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Menu className="h-6 w-6" />
                      <span className="sr-only">Toggle Menu</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="flex flex-col p-0">
                    <SheetHeader className="p-4 border-b">
                      <SheetTitle className="sr-only">Menu</SheetTitle>
                      <SheetDescription className="sr-only">Main navigation menu</SheetDescription>
                      <SheetClose asChild>
                        <Link href="/" className="flex items-center space-x-2">
                            <Logo className="h-7 w-7" />
                            <span className="font-bold font-headline text-xl">Doc-Chat AI</span>
                        </Link>
                      </SheetClose>
                    </SheetHeader>
                    
                    {isLandingPage && (
                      <nav className="flex flex-col gap-4 p-4">
                        {navItems.map(item => (
                        <SheetClose asChild key={item.href}>
                          <Link href={item.href} className="text-lg font-medium text-muted-foreground transition-colors hover:text-foreground">
                            {item.label}
                          </Link>
                        </SheetClose>
                        ))}
                      </nav>
                    )}

                    <div className="mt-auto p-4 border-t flex flex-col gap-4">
                        {user ? (
                          <SheetClose asChild>
                            <Button asChild size="lg">
                              <Link href="/app">Go to Dashboard</Link>
                            </Button>
                          </SheetClose>
                        ) : (
                          <>
                            <SheetClose asChild>
                              <Button variant="ghost" size="lg" asChild>
                                <Link href="/auth/login">Sign In</Link>
                              </Button>
                            </SheetClose>
                            <SheetClose asChild>
                                <Button size="lg" asChild>
                                <Link href="/auth/register">Get Started Free</Link>
                              </Button>
                            </SheetClose>
                          </>
                        )}
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
          </header>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
