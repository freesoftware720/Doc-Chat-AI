
import Link from "next/link";
import { Logo } from "@/components/icons";

export function Footer() {
  return (
    <footer className="relative mt-20 rounded-t-[3rem] border-t border-primary/20 bg-background/80 backdrop-blur-lg shadow-[0_-15px_40px_-15px_hsl(var(--primary)/0.25)]">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <Logo className="h-8 w-8 drop-shadow-[0_0_5px_hsl(var(--primary)/0.7)]" />
              <span className="font-bold font-headline text-xl">Doc-Chat AI</span>
            </Link>
            <p className="max-w-xs text-muted-foreground text-sm">
              Unlock insights from your documents with the power of AI.
            </p>
          </div>
          <div className="flex flex-col md:flex-row gap-8 text-center md:text-left">
            <div className="flex flex-col gap-3">
              <h4 className="font-semibold font-headline text-foreground">Product</h4>
              <Link href="/#features" className="text-sm text-muted-foreground hover:text-primary">Features</Link>
              <Link href="/#pricing" className="text-sm text-muted-foreground hover:text-primary">Pricing</Link>
              <Link href="/#faq" className="text-sm text-muted-foreground hover:text-primary">FAQ</Link>
            </div>
            <div className="flex flex-col gap-3">
              <h4 className="font-semibold font-headline text-foreground">Legal</h4>
              <Link href="/pages/privacy" className="text-sm text-muted-foreground hover:text-primary">Privacy Policy</Link>
              <Link href="/pages/terms" className="text-sm text-muted-foreground hover:text-primary">Terms of Service</Link>
            </div>
             <div className="flex flex-col gap-3">
              <h4 className="font-semibold font-headline text-foreground">Company</h4>
              <Link href="/pages/about" className="text-sm text-muted-foreground hover:text-primary">About</Link>
              <Link href="/pages/contact" className="text-sm text-muted-foreground hover:text-primary">Contact</Link>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-border/40 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Doc-Chat AI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
