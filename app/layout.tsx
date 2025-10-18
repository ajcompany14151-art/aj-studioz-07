// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarToggle } from "@/components/sidebar-toggle";

import "./globals.css";
import { SessionProvider } from "next-auth/react";

export const metadata: Metadata = {
  metadataBase: new URL("https://chat.vercel.ai"),
  title: "AJ STUDIOZ CHAT",
  description: "AI-powered chat assistant by AJ STUDIOZ with Lynxa AI models - Fast, Pro, and Reasoning capabilities",
  keywords: ["AI chat", "AJ STUDIOZ", "Lynxa AI", "chatbot", "artificial intelligence", "AI assistant"],
  authors: [{ name: "AJ STUDIOZ" }],
  creator: "AJ STUDIOZ",
  publisher: "AJ STUDIOZ",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://chat.vercel.ai",
    title: "AJ STUDIOZ CHAT - Powered by Lynxa AI",
    description: "Experience the power of AI with Lynxa - Choose from Lite, Pro, and Reasoning models for your conversations",
    siteName: "AJ STUDIOZ CHAT",
    images: [
      {
        url: "/logo.jpg",
        width: 1200,
        height: 630,
        alt: "AJ STUDIOZ CHAT - AI Assistant",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AJ STUDIOZ CHAT - Powered by Lynxa AI",
    description: "Experience the power of AI with Lynxa - Choose from Lite, Pro, and Reasoning models for your conversations",
    images: ["/logo.jpg"],
    creator: "@ajstudioz",
  },
  other: {
    "og:image:width": "1200",
    "og:image:height": "630",
    "og:image:type": "image/jpeg",
  },
};

export const viewport = {
  maximumScale: 1,
};

const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-mono",
});

const LIGHT_THEME_COLOR = "hsl(0 0% 100%)";
const DARK_THEME_COLOR = "hsl(240deg 10% 3.92%)";
const THEME_COLOR_SCRIPT = `\
(function() {
  var html = document.documentElement;
  var meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    document.head.appendChild(meta);
  }
  function updateThemeColor() {
    var isDark = html.classList.contains('dark');
    meta.setAttribute('content', isDark ? '${DARK_THEME_COLOR}' : '${LIGHT_THEME_COLOR}');
  }
  var observer = new MutationObserver(updateThemeColor);
  observer.observe(html, { attributes: true, attributeFilter: ['class'] });
  updateThemeColor();
})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      className={`${geist.variable} ${geistMono.variable}`}
      lang="en"
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: THEME_COLOR_SCRIPT,
          }}
        />
      </head>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          disableTransitionOnChange
          enableSystem
        >
          <SessionProvider>
            <SidebarProvider>
              <AppSidebar user={undefined} />
              <SidebarInset className="flex-1 flex flex-col">
                <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300">
                  <div className="flex items-center gap-2 px-4">
                    <SidebarToggle />
                  </div>
                  <div className="flex-1" />
                </header>
                <main className="flex-1 overflow-hidden">
                  {children}
                </main>
              </SidebarInset>
            </SidebarProvider>
          </SessionProvider>
          <Toaster position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
