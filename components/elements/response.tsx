"use client";

import { type ComponentProps, memo } from "react";
import { Streamdown } from "streamdown";
import { cn } from "@/lib/utils";

type ResponseProps = ComponentProps<typeof Streamdown>;

export const Response = memo(
  ({ className, ...props }: ResponseProps) => (
    <Streamdown
      className={cn(
        "size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_code]:whitespace-pre-wrap [&_code]:break-words [&_pre]:max-w-full [&_pre]:overflow-x-auto",
        // Enhanced heading styles with gradients
        "[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:mt-5 [&_h1]:bg-gradient-to-r [&_h1]:from-blue-600 [&_h1]:to-purple-600 [&_h1]:bg-clip-text [&_h1]:text-transparent",
        "[&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-3 [&_h2]:mt-4 [&_h2]:text-slate-800 dark:[&_h2]:text-slate-200",
        "[&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mb-2 [&_h3]:mt-3 [&_h3]:text-slate-700 dark:[&_h3]:text-slate-300",
        // Subheading and paragraph styles
        "[&_h4]:text-base [&_h4]:font-medium [&_h4]:mb-2 [&_h4]:mt-3 [&_h4]:text-slate-600 dark:[&_h4]:text-slate-400",
        "[&_h5]:text-sm [&_h5]:font-medium [&_h5]:mb-1 [&_h5]:mt-2 [&_h5]:text-slate-600 dark:[&_h5]:text-slate-400",
        "[&_p]:mb-3 [&_p]:leading-relaxed [&_p]:text-slate-700 dark:[&_p]:text-slate-300",
        // Enhanced list styles
        "[&_ul]:mb-4 [&_ul]:ml-5 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul_li]:marker:text-blue-500 dark:[&_ul_li]:marker:text-blue-400",
        "[&_ol]:mb-4 [&_ol]:ml-5 [&_ol]:list-decimal [&_ol]:space-y-1.5 [&_ol_li]:marker:text-purple-500 dark:[&_ol_li]:marker:text-purple-400",
        "[&_li]:leading-relaxed",
        // Enhanced strong and emphasis
        "[&_strong]:font-bold [&_strong]:text-slate-800 dark:[&_strong]:text-slate-100",
        "[&_em]:italic [&_em]:text-slate-600 dark:[&_em]:text-slate-400",
        // Enhanced code styling
        "[&_code:not(pre_*)]:rounded-md [&_code:not(pre_*)]:bg-slate-100 [&_code:not(pre_*)]:px-1.5 [&_code:not(pre_*)]:py-0.5 [&_code:not(pre_*)]:text-sm [&_code:not(pre_*)]:font-mono [&_code:not(pre_*)]:text-blue-700 dark:[&_code:not(pre_*)]:bg-slate-800 dark:[&_code:not(pre_*)]:text-blue-300",
        // Enhanced pre/code block styling
        "[&_pre]:mb-4 [&_pre]:mt-3 [&_pre]:rounded-lg [&_pre]:border [&_pre]:border-slate-200 [&_pre]:bg-slate-50 [&_pre]:p-4 [&_pre]:shadow-md dark:[&_pre]:border-slate-700 dark:[&_pre]:bg-slate-900/50 dark:[&_pre]:shadow-slate-900/25",
        "[&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-slate-700 dark:[&_pre_code]:text-slate-300",
        // Blockquote styling
        "[&_blockquote]:border-l-2 [&_blockquote]:border-blue-500 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-slate-600 dark:[&_blockquote]:border-blue-400 dark:[&_blockquote]:text-slate-400",
        // Link styling
        "[&_a]:text-blue-600 [&_a]:underline [&_a]:decoration-blue-500/50 [&_a]:underline-offset-2 hover:[&_a]:decoration-blue-500 dark:[&_a]:text-blue-400 dark:[&_a]:decoration-blue-400/50",
        // Table styling
        "[&_table]:w-full [&_table]:border-collapse [&_table]:mb-4",
        "[&_th]:border [&_th]:border-slate-200 [&_th]:bg-slate-50 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold dark:[&_th]:border-slate-700 dark:[&_th]:bg-slate-800/50",
        "[&_td]:border [&_td]:border-slate-200 [&_td]:px-3 [&_td]:py-2 dark:[&_td]:border-slate-700]",
        // Horizontal rule
        "[&_hr]:my-4 [&_hr]:border-0 [&_hr]:h-px [&_hr]:bg-gradient-to-r [&_hr]:from-transparent [&_hr]:via-slate-300 [&_hr]:to-transparent dark:[&_hr]:via-slate-700",
        className
      )}
      {...props}
    />
  ),
  (prevProps, nextProps) => prevProps.children === nextProps.children
);

Response.displayName = "Response";
