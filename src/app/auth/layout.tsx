
import { Logo } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
       <div className="absolute inset-0 -z-10 h-full w-full bg-background">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-0 dark:opacity-20"></div>
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_15%_50%,hsl(var(--primary)/0.1),transparent_30%),radial-gradient(circle_at_85%_30%,hsl(var(--accent)/0.1),transparent_30%)]"></div>
      </div>

      <header className="absolute top-0 left-0 right-0 py-4 px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <Logo className="h-7 w-7" />
            <span className="font-bold font-headline text-2xl tracking-tight">Doc-Chat AI</span>
          </a>
          <ThemeToggle />
        </nav>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        {children}
      </main>
    </div>
  );
}
