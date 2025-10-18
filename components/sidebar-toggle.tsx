// components/sidebar-toggle.tsx
"use client";

import { useEffect, useState } from "react";
import type { ComponentProps } from "react";
import { type SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { SidebarLeftIcon, SidebarRightIcon } from "./icons";
import { Button } from "./ui/button";

export function SidebarToggle({
  className,
}: ComponentProps<typeof SidebarTrigger>) {
  const { toggleSidebar, open, isMobile, state } = useSidebar();
  const [mounted, setMounted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Ensure component is mounted on client side
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggle = () => {
    setIsAnimating(true);
    toggleSidebar();
    setTimeout(() => setIsAnimating(false), 300);
  };

  if (!mounted) {
    return (
      <div className="h-8 w-8 animate-pulse rounded-md bg-muted" />
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          className={cn(
            "h-8 w-8 px-0 transition-all duration-300 ease-in-out",
            "hover:bg-primary/10 hover:text-primary",
            "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
            isAnimating && "scale-95",
            state === "collapsed" && "rotate-180",
            className
          )}
          data-testid="sidebar-toggle-button"
          onClick={handleToggle}
          variant="ghost"
          size="sm"
        >
          <motion.div
            animate={{ rotate: state === "collapsed" ? 180 : 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {state === "collapsed" ? (
              <SidebarRightIcon size={16} />
            ) : (
              <SidebarLeftIcon size={16} />
            )}
          </motion.div>
        </Button>
      </TooltipTrigger>
      <TooltipContent align="center" side="bottom" className="hidden md:block">
        {state === "collapsed" ? "Open Sidebar" : "Close Sidebar"}
      </TooltipContent>
    </Tooltip>
  );
}
