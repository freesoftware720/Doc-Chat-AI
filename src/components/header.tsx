import { ThemeToggle } from "@/components/theme-toggle"
import { Logo } from "@/components/icons"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 flex items-center">
          <Logo className="h-6 w-6 text-primary" />
          <span className="ml-3 font-bold font-headline text-xl">DocuChat Lite</span>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
