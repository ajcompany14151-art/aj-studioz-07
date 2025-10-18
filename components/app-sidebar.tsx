"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { User } from "next-auth";
import { PlusIcon } from "@/components/icons";
import { SidebarHistory } from "@/components/sidebar-history";
import { SidebarUserNav } from "@/components/sidebar-user-nav";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { useSidebar } from "@/components/ui/sidebar";

export function AppSidebar({ user }: { user: User | undefined }) {
  const router = useRouter();
  const { setOpenMobile, open, isMobile } = useSidebar();

  return (
    <Sidebar
      className="border-r border-border/50 bg-gradient-to-b from-gray-900 to-gray-800"
      collapsible="icon"
    >
      <SidebarHeader className="border-b border-border/50 pb-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Home">
              <Link
                className="flex items-center gap-3 group"
                href="/"
                onClick={() => setOpenMobile(false)}
              >
                <div className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-accent p-0.5 shadow-lg shadow-primary/20 transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl group-hover:shadow-primary/30">
                  <div className="size-full rounded-2xl bg-background p-1">
                    <Image
                      src="/logo.jpg"
                      alt="Logo"
                      width={32}
                      height={32}
                      className="rounded-xl object-cover"
                    />
                  </div>
                </div>
                {open && (
                  <span className="cursor-pointer rounded-xl px-2 py-1 font-black text-lg tracking-tight transition-all duration-300 hover:bg-muted/50">
                    AJ
                  </span>
                )}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className={`h-9 w-9 rounded-2xl p-2 transition-all duration-300 hover:bg-primary/10 hover:text-primary ${
                    open ? "ml-auto" : "mx-auto"
                  }`}
                  onClick={() => {
                    setOpenMobile(false);
                    router.push("/");
                    router.refresh();
                  }}
                  type="button"
                  variant="ghost"
                >
                  <PlusIcon size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent align="end" className="hidden md:block">
                New Chat
              </TooltipContent>
            </Tooltip>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="px-2">
        <SidebarHistory user={user} />
      </SidebarContent>
      <SidebarFooter className="border-t border-border/50 pt-4 px-2">
        {user && <SidebarUserNav user={user} />}
      </SidebarFooter>
    </Sidebar>
  );
}
