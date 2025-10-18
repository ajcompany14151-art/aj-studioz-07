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
        className={`h-10 rounded-xl transition-all duration-200 ${
          isActive 
            ? "bg-gray-800 text-white border border-gray-700/50 shadow-sm" 
            : "text-gray-400 hover:bg-gray-800/50 hover:text-white border border-transparent hover:border-gray-800"
        }`}
      >
        <Link
          href={`/chat/${chat.id}`}
          onClick={() => setOpenMobile(false)}
          className="flex items-center gap-3 px-3"
        >
          <div className={`flex-shrink-0 ${isActive ? "text-white" : "text-gray-500"}`}>
            <MessageSquare size={18} strokeWidth={1.5} />
          </div>
          {open && (
            <span className={`truncate text-sm font-medium ${isActive ? "text-white" : "text-gray-300"}`}>
              {chat.title}
            </span>
          )}
        </Link>
      </SidebarMenuButton>

      <DropdownMenu modal={true}>
        <DropdownMenuTrigger asChild>
          <SidebarMenuAction
            className={`opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg mr-1 ${
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
          className="bg-gray-900 text-white border-gray-700 shadow-xl"
        >
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="cursor-pointer text-gray-300 hover:bg-gray-800 hover:text-white focus:bg-gray-800 focus:text-white">
              <ShareIcon />
              <span>Share</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="bg-gray-900 text-white border-gray-700 shadow-xl">
                <DropdownMenuItem
                  className="cursor-pointer flex-row justify-between text-gray-300 hover:bg-gray-800 hover:text-white focus:bg-gray-800 focus:text-white"
                  onClick={() => {
                    setVisibilityType("private");
                  }}
                >
                  <div className="flex flex-row items-center gap-2">
                    <LockIcon size={14} />
                    <span>Private</span>
                  </div>
                  {visibilityType === "private" ? (
                    <CheckCircleFillIcon />
                  ) : null}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer flex-row justify-between text-gray-300 hover:bg-gray-800 hover:text-white focus:bg-gray-800 focus:text-white"
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
            className="cursor-pointer text-red-400 hover:bg-red-500/10 hover:text-red-300 focus:bg-red-500/10 focus:text-red-300"
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
