import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { PWARegister } from "@/components/pwa-register";

import "./globals.css";
import { SessionProvider } from "next-auth/react";

export const metadata: Metadata = {
  metadataBase: new URL("https://aj-studioz-07.vercel.app"),
  title: {
    default: "AJ Studioz AI",
    template: "%s | AJ Studioz AI"
  },
  description: "Advanced AI assistant with HTML preview, Grok-style responses, and mobile-optimized design. Get instant code previews, smart conversations, and creative solutions.",
  keywords: [
    "AI chat", "AJ STUDIOZ", "3D visualization", "code playground", "interactive diagrams", 
    "PDF generation", "Excel integration", "artificial intelligence", "AI assistant", 
    "Three.js", "D3.js", "Mermaid", "PWA", "offline AI", "advanced chatbot"
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
    description: "Revolutionary AI chatbot featuring 3D visualizations, interactive diagrams, sandboxed code execution, PDF generation, Excel integration, and offline PWA capabilities.",
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
    description: "🚀 Advanced AI with Three.js 3D scenes, interactive D3.js charts, Monaco code editor, PDF generation & more! Now with PWA offline support.",
    images: ["/logo.jpg"],
    creator: "@ajstudioz",
    site: "@ajstudioz",
  },
  // Additional meta tags for better social media sharing
  other: {
    "og:image:width": "1200",
    "og:image:height": "630",
    "og:image:type": "image/jpeg",
  },
};

export const viewport = {
  maximumScale: 1, // Disable auto-zoom on mobile Safari
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f0f0f" }
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover"
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
      // `next-themes` injects an extra classname to the body element to avoid
      // visual flicker before hydration. Hence the `suppressHydrationWarning`
      // prop is necessary to avoid the React hydration mismatch warning.
      // https://github.com/pacocoursey/next-themes?tab=readme-ov-file#with-app
      lang="en"
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="/logo.jpg" type="image/jpeg" />
        <link rel="alternate icon" href="/logo.jpg" />
        <link rel="apple-touch-icon" href="/logo.jpg" />
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: "Required"
          dangerouslySetInnerHTML={{
            __html: THEME_COLOR_SCRIPT,
          }}
        />
        {/* PWA Install Prompt */}
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: "Required for PWA"
          dangerouslySetInnerHTML={{
            __html: `
              let deferredPrompt;
              window.addEventListener('beforeinstallprompt', (e) => {
                console.log('PWA install prompt available');
                e.preventDefault();
                deferredPrompt = e;
                // You can show a custom install button here
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
          <PWARegister />
          <Toaster position="top-center" />
          <SessionProvider>{children}</SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
