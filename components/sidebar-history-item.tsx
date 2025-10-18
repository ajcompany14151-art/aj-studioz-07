import Link from "next/link";
import { memo } from "react";
import { useChatVisibility } from "@/hooks/use-chat-visibility";
import type { Chat } from "@/lib/db/schema";
import {
  CheckCircleFillIcon,
  GlobeIcon,
  LockIcon,
  MoreHorizontalIcon,
  ShareIcon,
  TrashIcon,
} from "./icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "./ui/sidebar";
import { MessageSquare } from "lucide-react";

const PureChatItem = ({
  chat,
  isActive,
  onDelete,
  setOpenMobile,
}: {
  chat: Chat;
  isActive: boolean;
  onDelete: (chatId: string) => void;
  setOpenMobile: (open: boolean) => void;
}) => {
  const { visibilityType, setVisibilityType } = useChatVisibility({
    chatId: chat.id,
    initialVisibilityType: chat.visibility,
  });
  const { open } = useSidebar();

  return (
    <SidebarMenuItem className="group">
      <SidebarMenuButton 
        asChild 
        isActive={isActive} 
        tooltip={chat.title}
        className={`h-9 rounded-lg transition-all duration-200 ${
          isActive 
            ? "bg-gray-800 text-white" 
            : "text-gray-400 hover:bg-gray-800 hover:text-white"
        }`}
      >
        <Link
          href={`/chat/${chat.id}`}
          onClick={() => setOpenMobile(false)}
          className="flex items-center gap-2"
        >
          <span className={open ? "hidden" : ""}>
            <MessageSquare size={16} />
          </span>
          {open && <span className="truncate">{chat.title}</span>}
        </Link>
      </SidebarMenuButton>

      <DropdownMenu modal={true}>
        <DropdownMenuTrigger asChild>
          <SidebarMenuAction
            className={`opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100 text-gray-400 hover:text-white ${
              open ? "" : "hidden"
            }`}
            showOnHover={!isActive}
          >
            <MoreHorizontalIcon />
            <span className="sr-only">More</span>
          </SidebarMenuAction>
        </DropdownMenuTrigger>

        <DropdownMenuContent 
          align="end" 
          side="bottom"
          className="bg-gray-800 text-white border-gray-700"
        >
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="cursor-pointer text-gray-300 hover:bg-gray-700 hover:text-white">
              <ShareIcon />
              <span>Share</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="bg-gray-800 text-white border-gray-700">
                <DropdownMenuItem
                  className="cursor-pointer flex-row justify-between text-gray-300 hover:bg-gray-700 hover:text-white"
                  onClick={() => {
                    setVisibilityType("private");
                  }}
                >
                  <div className="flex flex-row items-center gap-2">
                    <LockIcon size={12} />
                    <span>Private</span>
                  </div>
                  {visibilityType === "private" ? (
                    <CheckCircleFillIcon />
                  ) : null}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer flex-row justify-between text-gray-300 hover:bg-gray-700 hover:text-white"
                  onClick={() => {
                    setVisibilityType("public");
                  }}
                >
                  <div className="flex flex-row items-center gap-2">
                    <GlobeIcon />
                    <span>Public</span>
                  </div>
                  {visibilityType === "public" ? <CheckCircleFillIcon /> : null}
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          <DropdownMenuItem
            className="cursor-pointer text-red-400 focus:bg-gray-700 focus:text-red-400"
            onSelect={() => onDelete(chat.id)}
          >
            <TrashIcon />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
};

export const ChatItem = memo(PureChatItem, (prevProps, nextProps) => {
  if (prevProps.isActive !== nextProps.isActive) {
    return false;
  }
  return true;
});
