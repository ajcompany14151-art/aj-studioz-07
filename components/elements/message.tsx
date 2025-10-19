import type { UIMessage } from "ai";
import type { ComponentProps, HTMLAttributes } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export type MessageProps = HTMLAttributes<HTMLDivElement> & {
  from: UIMessage["role"];
};

export const Message = ({ className, from, ...props }: MessageProps) => (
  <div
    className={cn(
      "group flex w-full items-end gap-2 py-6",
      from === "user" 
        ? "is-user justify-end" 
        : "is-assistant justify-start",
      "[&>div]:max-w-[80%] md:[&>div]:max-w-[70%]",
      className
    )}
    {...props}
  />
);

export type MessageContentProps = HTMLAttributes<HTMLDivElement>;

export const MessageContent = ({
  children,
  className,
  ...props
}: MessageContentProps) => (
  <div
    className={cn(
      "relative flex flex-col gap-2 overflow-hidden rounded-2xl px-4 py-3 text-sm shadow-md transition-all duration-200",
      // User message styling with gradient
      "group-[.is-user]:bg-gradient-to-r group-[.is-user]:from-blue-500 group-[.is-user]:to-purple-600 group-[.is-user]:text-white group-[.is-user]:shadow-lg group-[.is-user]:shadow-blue-500/25",
      // Assistant message styling with glassmorphism
      "group-[.is-assistant]:bg-white/80 group-[.is-assistant]:text-slate-800 group-[.is-assistant]:backdrop-blur-sm group-[.is-assistant]:border group-[.is-assistant]:border-slate-200/50 group-[.is-assistant]:shadow-md",
      "dark:group-[.is-assistant]:bg-slate-900/80 dark:group-[.is-assistant]:text-slate-200 dark:group-[.is-assistant]:border-slate-700/50 dark:group-[.is-assistant]:shadow-slate-900/25",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export type MessageAvatarProps = ComponentProps<typeof Avatar> & {
  src: string;
  name?: string;
};

export const MessageAvatar = ({
  src,
  name,
  className,
  ...props
}: MessageAvatarProps) => (
  <Avatar 
    className={cn(
      "size-9 ring-2 ring-offset-2 ring-offset-background transition-all duration-200",
      "group-[.is-user]:ring-blue-500/50 group-[.is-user]:ring-offset-white",
      "group-[.is-assistant]:ring-purple-500/50 group-[.is-assistant]:ring-offset-white",
      "dark:group-[.is-user]:ring-offset-slate-950 dark:group-[.is-assistant]:ring-offset-slate-950",
      className
    )} 
    {...props}
  >
    <AvatarImage alt="" className="my-0" src={src} />
    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
      {name?.slice(0, 2) || "ME"}
    </AvatarFallback>
  </Avatar>
);
