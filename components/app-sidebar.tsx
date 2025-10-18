// components/app-sidebar.tsx
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
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { motion } from "framer-motion";

export function AppSidebar({ user }: { user: User | undefined }) {
  const router = useRouter();
  const { setOpenMobile, state } = useSidebar();

  return (
    <Sidebar
      className={cn(
        "group-data-[side=left]:border-r-0 border-r border-border/50",
        "transition-all duration-300 ease-in-out",
        state === "collapsed" ? "w-16" : "w-64"
      )}
    >
      <SidebarHeader className="border-b border-border/50 pb-4">
        <SidebarMenu>
          <div className={cn(
            "flex flex-row items-center justify-between px-2",
            state === "collapsed" && "justify-center"
          )}>
            <Link
              className={cn(
                "flex flex-row items-center gap-3 group",
                state === "collapsed" && "justify-center"
              )}
              href="/"
              onClick={() => {
                setOpenMobile(false);
              }}
            >
              <motion.div
                className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-accent p-0.5 shadow-lg shadow-primary/20 transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl group-hover:shadow-primary/30"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="size-full rounded-2xl bg-background p-1">
                  <Image
                    src="/logo.jpg"
                    alt="Logo"
                    width={32}
                    height={32}
                    className="rounded-xl object-cover"
                  />
                </div>
              </motion.div>
              {state !== "collapsed" && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="cursor-pointer rounded-xl px-2 py-1 font-black text-lg tracking-tight transition-all duration-300 hover:bg-muted/50"
                >
                  AJ
                </motion.span>
              )}
            </Link>
            
            {state !== "collapsed" && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      className="h-9 w-9 rounded-2xl p-2 transition-all duration-300 hover:bg-primary/10 hover:text-primary"
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
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent align="end" className="hidden md:block">
                  New Chat
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </SidebarMenu>
      </SidebarHeader>
      
      <SidebarContent className={cn(
        "px-2",
        state === "collapsed" && "px-0"
      )}>
        <SidebarHistory user={user} />
      </SidebarContent>
      
      <SidebarFooter className={cn(
        "border-t border-border/50 pt-4 px-2",
        state === "collapsed" && "px-0"
      )}>
        {user && <SidebarUserNav user={user} />}
      </SidebarFooter>
    </Sidebar>
  );
}
