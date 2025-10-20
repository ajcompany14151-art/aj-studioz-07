import type { ComponentProps, MouseEvent } from "react";

import { type SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { SidebarLeftIcon } from "./icons";
import { Button } from "./ui/button";

export function SidebarToggle({
  className,
}: ComponentProps<typeof SidebarTrigger>) {
  const { toggleSidebar, state, open } = useSidebar();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          className={cn(
            "h-8 px-2 md:h-fit md:px-2 transition-all duration-200",
            // Ensure button is always visible and properly styled
            "opacity-100 hover:bg-accent hover:text-accent-foreground",
            className
          )}
          data-testid="sidebar-toggle-button"
          onClick={(e: MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
            e.stopPropagation();
            toggleSidebar();
          }}
          variant="outline"
          aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
        >
          <SidebarLeftIcon size={16} />
        </Button>
      </TooltipTrigger>
      <TooltipContent align="start" className="hidden md:block">
        {open ? "Collapse" : "Expand"} Sidebar
      </TooltipContent>
    </Tooltip>
  );
}
