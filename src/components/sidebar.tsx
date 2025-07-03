"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileUp,
  MessageSquare,
  Settings,
  LogOut,
  ShieldCheck,
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
} from "@/components/ui/sidebar";
import { Logo } from "@/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { User } from "lucide-react";
import { logout } from "@/app/actions/auth";
import { useEffect, useState } from "react";
import { isSuperAdmin } from "@/app/actions/super-admin";
import { Progress } from "@/components/ui/progress";


export function AppSidebar({ user, plan, creditsUsed, creditLimit }: { 
  user: { email?: string, user_metadata: { avatar_url?: string, full_name?: string } } | null,
  plan: string,
  creditsUsed: number,
  creditLimit: number
}) {
  const pathname = usePathname();
  const [showSuperAdmin, setShowSuperAdmin] = useState(false);

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
      variant="sidebar"
      collapsible="icon"
      className="border-r border-border/40 bg-card/40 backdrop-blur-lg"
    >
      <SidebarContent>
        <SidebarHeader>
          <Link href="/" className="flex items-center gap-2">
            <Logo className="w-7 h-7" />
            <span className="font-bold font-headline text-xl">Doc-Chat AI</span>
          </Link>
        </SidebarHeader>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                href={item.href}
                asChild
                isActive={pathname === item.href || (item.href !== '/app' && pathname.startsWith(item.href + '/'))}
                tooltip={item.label}
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
                    tooltip="Super Admin"
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
            <div className="p-2 group-data-[collapsible=icon]:hidden">
                <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <p className="text-xs font-medium text-muted-foreground">Messages Used Today</p>
                    <p className="text-lg font-bold text-foreground mt-1">{creditsUsed} / {creditLimit}</p>
                    <Progress value={(creditsUsed / creditLimit) * 100} className="h-2 mt-2" />
                </div>
            </div>
        )}
        <SidebarMenu>
           <SidebarMenuItem>
             <SidebarMenuButton 
                href="/app/settings" 
                asChild 
                tooltip="Settings"
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
                  tooltip="Logout"
                  className="hover:bg-destructive/15 hover:text-destructive hover:[text-shadow:none]"
                >
                    <button className="w-full">
                        <LogOut />
                        <span>Logout</span>
                    </button>
                </SidebarMenuButton>
             </form>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="flex items-center justify-between gap-2 p-2 border-t border-border/40">
           <div className="flex-1 overflow-hidden group-data-[collapsible=icon]:hidden">
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
      </SidebarFooter>
    </Sidebar>
  );
}
