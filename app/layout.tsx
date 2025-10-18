import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/app/(auth)/auth"; // 使用 auth 函数而不是 getServerSession
import type { Session } from "next-auth"; // Import Session type

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://aj-studioz-07.vercel.app"),
  title: {
    default: "AJ Studioz AI",
    template: "%s | AJ Studioz AI",
  },
  description:
    "Advanced AI assistant with HTML preview, Grok-style responses, and mobile-optimized design. Get instant code previews, smart conversations, and creative solutions.",
  keywords: [
    "AI chat",
    "AJ STUDIOZ",
    "3D visualization",
    "code playground",
    "interactive diagrams",
    "PDF generation",
    "Excel integration",
    "artificial intelligence",
    "AI assistant",
    "Three.js",
    "D3.js",
    "Mermaid",
    "PWA",
    "offline AI",
    "advanced chatbot",
  ],
  authors: [{ name: "AJ STUDIOZ", url: "https://ajstudioz.com" }],
  creator: "AJ STUDIOZ",
  publisher: "AJ STUDIOZ",
  applicationName: "AJ Studioz AI",
  category: "productivity",
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://aj-studioz-07.vercel.app",
    title: "AJ Studioz AI - Advanced AI with 3D Visualizations & Code Playground",
    description:
      "Revolutionary AI chatbot featuring 3D visualizations, interactive diagrams, sandboxed code execution, PDF generation, Excel integration, and offline PWA capabilities.",
    siteName: "AJ Studioz AI",
    images: [
      {
        url: "/logo.jpg",
        width: 1200,
        height: 630,
        alt: "AJ Studioz AI - Advanced Chatbot with 3D & Code Features",
      },
      {
        url: "/screenshot-desktop.png",
        width: 1280,
        height: 720,
        alt: "AJ Studioz AI Desktop Interface",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AJ Studioz AI - 3D Visualizations & Code Playground",
    description:
      "🚀 Advanced AI with Three.js 3D scenes, interactive D3.js charts, Monaco code editor, PDF generation & more! Now with PWA offline support.",
    images: ["/logo.jpg"],
    creator: "@ajstudioz",
    site: "@ajstudioz",
  },
  other: {
    "og:image:width": "1200",
    "og:image:height": "630",
    "og:image:type": "image/jpeg",
  },
};

export const viewport = {
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f0f0f" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth(); // 使用 auth() 函数而不是 getServerSession(authOptions)

  return (
    <html
      className={`${geist.variable} ${geistMono.variable}`}
      lang="en"
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="/logo.jpg" type="image/jpeg" />
        <link rel="alternate icon" href="/logo.jpg" />
        <link rel="apple-touch-icon" href="/logo.jpg" />
        <script
          dangerouslySetInnerHTML={{
            __html: THEME_COLOR_SCRIPT,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js')
                    .then((registration) => {
                      console.log('SW registered: ', registration);
                    })
                    .catch((registrationError) => {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              let deferredPrompt;
              window.addEventListener('beforeinstallprompt', (e) => {
                console.log('PWA install prompt available');
                e.preventDefault();
                deferredPrompt = e;
                const installBtn = document.getElementById('pwa-install-btn');
                if (installBtn) {
                  installBtn.style.display = 'block';
                  installBtn.addEventListener('click', () => {
                    deferredPrompt.prompt();
                    deferredPrompt.userChoice.then((choiceResult) => {
                      if (choiceResult.outcome === 'accepted') {
                        console.log('User accepted the PWA install');
                      } else {
                        console.log('User dismissed the PWA install');
                      }
                      deferredPrompt = null;
                    });
                  });
                }
              });
            `,
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
              <div className="flex min-h-screen">
                <AppSidebar user={session?.user ?? undefined} /> {/* Pass undefined if no session */}
                <main className="flex-1 p-4">
                  <SidebarTrigger className="mb-4" />
                  {children}
                </main>
              </div>
            </SidebarProvider>
            <Toaster position="top-center" />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
