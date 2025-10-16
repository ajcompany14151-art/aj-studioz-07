"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { memo } from "react";
import { useWindowSize } from "usehooks-ts";
import { SidebarToggle } from "@/components/sidebar-toggle";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "./icons";
import { useSidebar } from "./ui/sidebar";

function PureChatHeader({
  chatId,
  isReadonly,
}: {
  chatId: string;
  isReadonly: boolean;
}) {
  const router = useRouter();
  const { open } = useSidebar();

  const { width: windowWidth } = useWindowSize();

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border/50 bg-background/80 backdrop-blur-xl px-4 sm:gap-4 sm:px-6">
      <SidebarToggle />

      {(!open || windowWidth < 768) && (
        <Button
          className="order-2 ml-auto h-9 rounded-2xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-105 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 md:order-1 md:ml-0"
          onClick={() => {
            router.push("/");
            router.refresh();
          }}
        >
          <PlusIcon size={18} />
          <span className="ml-2 md:sr-only">New</span>
        </Button>
      )}
    </header>
  );
}

export const ChatHeader = memo(PureChatHeader, (prevProps, nextProps) => {
  return (
    prevProps.chatId === nextProps.chatId &&
    prevProps.isReadonly === nextProps.isReadonly
  );
});
