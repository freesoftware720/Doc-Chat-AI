
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { logout } from "../actions/auth";
import { AppHeader } from "@/components/app-header";
import { BottomNav } from "@/components/bottom-nav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('status')
    .eq('id', user.id)
    .single();

  if (profile?.status === 'banned') {
    await logout();
    // The logout action already handles redirection.
    // This check ensures a banned user is logged out and can't access the app.
  }
  
  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset className="flex flex-col h-screen overflow-hidden">
        <AppHeader />
        <main className="relative flex-1 overflow-y-auto pb-20 md:pb-0">
          <div className="absolute inset-0 -z-10 h-full w-full bg-background">
            <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-0 dark:opacity-20"></div>
            <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_15%_50%,hsl(var(--primary)/0.1),transparent_30%),radial-gradient(circle_at_85%_30%,hsl(var(--accent)/0.1),transparent_30%)]"></div>
          </div>
          {children}
        </main>
        <Toaster />
        <BottomNav />
      </SidebarInset>
    </SidebarProvider>
  );
}
