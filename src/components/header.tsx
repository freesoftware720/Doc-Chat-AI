import { ThemeToggle } from "@/components/theme-toggle"
import { Logo } from "@/components/icons"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <div className="mr-4 flex items-center">
          <Logo className="h-7 w-7 text-primary" />
          <span className="ml-3 font-bold font-headline text-2xl tracking-tight">DocuChat AI</span>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
