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
import { MessageSquare } from "lucide-react";

export function AppSidebar({ user }: { user: User | undefined }) {
  const router = useRouter();
  const { setOpenMobile, open, isMobile } = useSidebar();

  return (
    <Sidebar
      className="border-r-0 bg-black text-white"
      collapsible="icon"
      variant="sidebar"
    >
      <SidebarHeader className="pb-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className={`h-9 w-9 rounded-lg p-2 transition-all duration-200 hover:bg-gray-800 ${
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
                  <PlusIcon size={18} className="text-white" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-gray-800 text-white border-gray-700">
                <p>New chat</p>
              </TooltipContent>
            </Tooltip>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
      <SidebarContent className="px-2 py-2">
        <SidebarHistory user={user} />
      </SidebarContent>
      
      <SidebarFooter className="border-t border-gray-800 pt-2">
        {user && <SidebarUserNav user={user} />}
      </SidebarFooter>
    </Sidebar>
  );
}
