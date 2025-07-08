
'use client';
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileUp,
  MessageSquare,
  Settings,
  LogOut,
  ShieldCheck,
  Star,
  Zap,
  Gift,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import {
  Sidebar,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { User } from "lucide-react";
import { logout } from "@/app/actions/auth";
import { useEffect, useState } from "react";
import { isSuperAdmin } from "@/app/actions/super-admin";
import { Progress } from "@/components/ui/progress";
import { Button } from "./ui/button";


export function AppSidebar({ user, plan, creditsUsed, creditLimit }: { 
  user: { email?: string, user_metadata: { avatar_url?: string, full_name?: string } } | null,
  plan: string,
  creditsUsed: number,
  creditLimit: number
}) {
  const pathname = usePathname();
  const [showSuperAdmin, setShowSuperAdmin] = useState(false);
  const { toggleSidebar, state } = useSidebar();

  useEffect(() => {
    isSuperAdmin().then(setShowSuperAdmin);
  }, []);

  const menuItems = [
    { href: "/app", label: "Dashboard", icon: LayoutDashboard },
    { href: "/app/uploads", label: "Uploads", icon: FileUp },
    { href: "/app/chat", label: "Chat", icon: MessageSquare },
  ];

  return (
    <Sidebar
      variant="floating"
      collapsible="icon"
    >
      <SidebarContent>
        <SidebarHeader>
          <Link href="/" className="flex items-center gap-2 group-data-[state=collapsed]:justify-center">
            <Logo className="w-7 h-7" />
            <span className="font-bold font-headline text-xl group-data-[state=collapsed]:hidden">Doc-Chat AI</span>
          </Link>
        </SidebarHeader>
        <SidebarMenu className="group-data-[state=collapsed]:items-center">
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                href={item.href}
                asChild
                isActive={pathname === item.href || (item.href !== '/app' && pathname.startsWith(item.href + '/'))}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          {showSuperAdmin && (
             <SidebarMenuItem>
                <SidebarSeparator className="my-2" />
                 <SidebarMenuButton
                    href="/app/super-admin"
                    asChild
                    isActive={pathname.startsWith("/app/super-admin")}
                >
                    <Link href="/app/super-admin">
                        <ShieldCheck />
                        <span>Super Admin</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
         {plan === 'Free' && creditLimit > 0 && (
            <div className="p-2 group-data-[state=collapsed]:hidden">
                <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <p className="text-xs font-medium text-muted-foreground">Messages Used Today</p>
                    <p className="text-lg font-bold text-foreground mt-1">{creditsUsed} / {creditLimit}</p>
                    <Progress value={(creditsUsed / creditLimit) * 100} className="h-2 mt-2" />
                </div>
            </div>
        )}
        <div className="flex items-center justify-between group-data-[state=collapsed]:justify-center gap-2 p-2 border-t border-border/40">
           <div className="flex-1 overflow-hidden group-data-[state=collapsed]:hidden">
             <p className="text-sm font-semibold truncate">{user?.user_metadata.full_name || user?.email}</p>
             <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
           </div>
           <Avatar className="h-9 w-9">
            <AvatarImage src={user?.user_metadata.avatar_url} alt={user?.user_metadata.full_name || 'User avatar'}/>
            <AvatarFallback>
              <User className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
        </div>
        <SidebarMenu className="group-data-[state=collapsed]:items-center">
          <SidebarMenuItem>
            <SidebarMenuButton
              href="/app/billing"
              asChild
              isActive={pathname === "/app/billing"}
            >
              <Link href="/app/billing">
                <Zap />
                <span>Upgrade</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              href="/app/affiliate"
              asChild
              isActive={pathname === "/app/affiliate"}
            >
              <Link href="/app/affiliate">
                <Gift />
                <span>Affiliate</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
             <SidebarMenuButton 
                href="/app/review" 
                asChild 
                isActive={pathname === "/app/review"}
            >
              <Link href="/app/review">
                <Star />
                <span>Leave a Review</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
             <SidebarMenuButton 
                href="/app/settings" 
                asChild 
                isActive={pathname === "/app/settings"}
            >
              <Link href="/app/settings">
                <Settings />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
             <form action={logout}>
                <SidebarMenuButton
                  type="submit"
                  asChild
                  className="hover:bg-destructive/35 hover:border-destructive hover:text-destructive-foreground hover:[text-shadow:none]"
                >
                    <button className="w-full">
                        <LogOut />
                        <span>Logout</span>
                    </button>
                </SidebarMenuButton>
             </form>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="p-2 border-t border-border/40">
          <Button variant="ghost" className="w-full justify-center group-data-[state=expanded]:justify-start" onClick={toggleSidebar}>
            <ChevronsLeft className="h-5 w-5 group-data-[state=collapsed]:hidden" />
            <ChevronsRight className="h-5 w-5 hidden group-data-[state=collapsed]:block" />
            <span className="sr-only group-data-[state=expanded]:not-sr-only group-data-[state=expanded]:ml-2">
              {state === 'expanded' ? 'Collapse' : 'Expand'}
            </span>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
