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
} from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { useSidebar } from "@/components/ui/sidebar";

export function AppSidebar({ user }: { user: User | undefined }) {
  const router = useRouter();
  const { setOpenMobile, open, isMobile } = useSidebar();

  return (
    <Sidebar
      className="border-r border-gray-800/50 bg-black text-white"
      collapsible="icon"
      variant="sidebar"
    >
      <SidebarHeader className="pb-4 pt-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className={`h-10 w-10 rounded-xl p-0 transition-all duration-200 bg-gray-800/50 hover:bg-gray-700 border border-gray-700/50 ${
                    open ? "ml-2" : "mx-auto"
                  }`}
                  onClick={() => {
                    setOpenMobile(false);
                    router.push("/");
                    router.refresh();
                  }}
                  type="button"
                  variant="ghost"
                >
                  {/* Remove className from PlusIcon - use a wrapper div instead */}
                  <div className="text-white">
                    <PlusIcon size={20} />
                  </div>
                </Button>
              </TooltipTrigger>
              <TooltipContent 
                side="right" 
                className="bg-gray-900 text-white border-gray-700 shadow-xl"
              >
                <p className="font-medium">New chat</p>
              </TooltipContent>
            </Tooltip>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
      <SidebarContent className="px-3 py-2">
        <SidebarHistory user={user} />
      </SidebarContent>
      
      <SidebarFooter className="border-t border-gray-800/50 pt-3 pb-3">
        {user && <SidebarUserNav user={user} />}
      </SidebarFooter>
    </Sidebar>
  );
}
