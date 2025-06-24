"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileUp,
  MessageSquare,
  Settings,
  LogOut,
} from "lucide-react";
import {
  Sidebar,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/icons";
import { ThemeToggle } from "./theme-toggle";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { User } from "lucide-react";

export function AppSidebar() {
  const pathname = usePathname();

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
            <span className="font-bold font-headline text-xl">DocuChat AI</span>
          </Link>
        </SidebarHeader>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                href={item.href}
                asChild
                isActive={pathname === item.href}
                tooltip={item.label}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
           <SidebarMenuItem>
             <SidebarMenuButton href="/app/settings" asChild tooltip="Settings">
              <Link href="/app/settings">
                <Settings />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton href="#" asChild tooltip="Logout">
              <Link href="#">
                <LogOut />
                <span>Logout</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="flex items-center justify-center gap-2 p-2 border-t border-border/40">
           <div className="group-data-[collapsible=icon]:hidden">
             <ThemeToggle />
           </div>
           <Avatar className="h-9 w-9">
            <AvatarFallback>
              <User className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
