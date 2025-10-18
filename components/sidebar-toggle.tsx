"use client";

import { useSidebar } from "@/components/ui/sidebar";
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
}: React.ComponentProps<typeof Button>) {
  const { toggleSidebar, open } = useSidebar();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          className={cn(
            "h-8 w-8 rounded-lg p-2 transition-all duration-200 hover:bg-gray-800 text-gray-400 hover:text-white",
            className
          )}
          data-testid="sidebar-toggle-button"
          onClick={toggleSidebar}
          variant="ghost"
        >
          <span className={open ? "rotate-180" : ""}>
            <SidebarLeftIcon size={16} />
          </span>
        </Button>
      </TooltipTrigger>
      <TooltipContent align="start" className="bg-gray-800 text-white border-gray-700 hidden md:block">
        {open ? "Collapse Sidebar" : "Expand Sidebar"}
      </TooltipContent>
    </Tooltip>
  );
}
