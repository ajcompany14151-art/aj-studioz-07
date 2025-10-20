import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import SplashScreen from "@/components/splash-screen";
import PWAInstallButton from "@/components/pwa-install-button";

import "./globals.css";
import { SessionProvider } from "next-auth/react";

export const metadata: Metadata = {
  metadataBase: new URL("https://nexa.ajstudioz.co.in"),
  title: {
    default: "AJ STUDIOZ - Advanced AI Chat Assistant | Powered by Groq Llama 3.3",
    template: "%s | AJ STUDIOZ AI"
  },
  description: "Experience the future of AI with AJ STUDIOZ - Advanced chatbot powered by Groq's Llama 3.3 70B & 90B models. Features include intelligent document generation, live code execution, stunning 3D visualizations, interactive diagrams, PDF creation, Excel integration, and offline PWA support. Perfect for students, developers, and professionals.",
  keywords: [
    "AI chatbot", "artificial intelligence assistant", "Groq AI", "Llama 3.3 70B", "Llama 3 90B", "AJ STUDIOZ",
    "AI document generation", "code execution sandbox", "3D visualization AI", "AI assistant online",
    "productivity tools", "education AI platform", "intelligent chat assistant", "machine learning chatbot",
    "natural language processing", "automated AI assistant", "conversational AI platform",
    "AI-powered productivity", "student AI helper", "developer AI tools", "coding assistant",
    "Three.js 3D scenes", "D3.js data visualization", "Mermaid diagrams", "Monaco code editor",
    "PWA chatbot", "offline AI assistant", "advanced AI chatbot", "free AI assistant",
    "AI for education", "AI for developers", "AI for students", "homework helper AI",
    "code generator AI", "diagram creator", "PDF generator AI", "spreadsheet AI",
    "next-gen chatbot", "Claude alternative", "ChatGPT alternative", "Gemini alternative",
    "fast AI responses", "accurate AI answers", "multi-model AI", "AI reasoning",
    "AI artifacts", "interactive AI", "visual AI assistant", "smart chatbot 2025"
  ],
  authors: [{ name: "AJ STUDIOZ", url: "https://nexa.ajstudioz.co.in" }],
  creator: "AJ STUDIOZ",
  publisher: "AJ STUDIOZ",
  applicationName: "AJ STUDIOZ AI",
  category: "productivity",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/logo.jpg", sizes: "32x32", type: "image/jpeg" },
      { url: "/logo.jpg", sizes: "16x16", type: "image/jpeg" },
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/logo.jpg", sizes: "192x192", type: "image/jpeg" },
    ],
    apple: [
      { url: "/logo.jpg", sizes: "180x180", type: "image/jpeg" },
    ],
    shortcut: [
      { url: "/logo.jpg", type: "image/jpeg" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://nexa.ajstudioz.co.in",
    title: "AJ STUDIOZ - Advanced AI Chat Assistant | Free AI Powered by Groq",
    description: "🚀 Next-generation AI chatbot with Llama 3.3 90B & 70B models. Create documents, execute code, generate 3D visualizations, interactive diagrams, PDFs & more. Free to use with offline PWA support. Perfect for students, developers & professionals.",
    siteName: "AJ STUDIOZ AI Chat Assistant",
    images: [
      {
        url: "https://nexa.ajstudioz.co.in/logo.jpg",
        width: 1200,
        height: 1200,
        alt: "AJ STUDIOZ - Advanced AI Chat Assistant Logo",
        type: "image/jpeg",
      },
      {
        url: "https://nexa.ajstudioz.co.in/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "AJ STUDIOZ - AI Chat Assistant with Code Execution, 3D Visualization & Document Generation",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@ajstudioz",
    creator: "@ajstudioz",
    title: "AJ STUDIOZ - Advanced AI Chat Assistant | Groq Llama 3.3",
    description: "🚀 Free AI chatbot powered by Groq's Llama 3.3 90B & 70B models. Features: Three.js 3D scenes, D3.js charts, Monaco code editor, PDF/Excel generation, Mermaid diagrams, offline PWA support & more!",
    images: ["https://nexa.ajstudioz.co.in/logo.jpg"],
  },
  alternates: {
    canonical: "https://nexa.ajstudioz.co.in",
  },
  // Enhanced meta tags for better SEO and social sharing
  other: {
    "og:image:width": "1200",
    "og:image:height": "630",
    "og:image:type": "image/jpeg",
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "application-name": "AJ STUDIOZ AI",
    "msapplication-TileColor": "#000000",
    "theme-color": "#6366f1",
    "format-detection": "telephone=no",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
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
        {/* Favicon and Icons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/logo.jpg" type="image/jpeg" sizes="32x32" />
        <link rel="icon" href="/logo.jpg" type="image/jpeg" sizes="16x16" />
        <link rel="apple-touch-icon" href="/logo.jpg" />
        <link rel="shortcut icon" href="/logo.jpg" />
        
        {/* SEO and Social Sharing */}
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="bingbot" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        
        {/* WhatsApp and Social Media Specific */}
        <meta property="og:image" content="https://nexa.ajstudioz.co.in/logo.jpg" />
        <meta property="og:image:secure_url" content="https://nexa.ajstudioz.co.in/logo.jpg" />
        <meta property="og:image:width" content="512" />
        <meta property="og:image:height" content="512" />
        <meta property="og:image:alt" content="AJ STUDIOZ AI Assistant Logo" />
        <meta name="twitter:image" content="https://nexa.ajstudioz.co.in/logo.jpg" />
        <meta name="twitter:image:alt" content="AJ STUDIOZ AI Assistant Logo" />
        
        {/* PWA and Mobile Optimization */}
        <meta name="application-name" content="AJ STUDIOZ AI" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="AJ STUDIOZ" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#6366f1" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#1f2937" media="(prefers-color-scheme: dark)" />
        
        {/* Additional Performance and SEO */}
        <meta name="referrer" content="origin-when-cross-origin" />
        <meta name="color-scheme" content="light dark" />
        <meta name="supported-color-schemes" content="light dark" />
        
        <link rel="manifest" href="/manifest.json" />
        
        {/* Viewport for optimal PWA and mobile experience */}
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, user-scalable=no, viewport-fit=cover" />
        
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: "Required"
          dangerouslySetInnerHTML={{
            __html: THEME_COLOR_SCRIPT,
          }}
        />
        
        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: "Required for SEO"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "AJ STUDIOZ - Advanced AI Chat Assistant",
              "alternateName": "AJ STUDIOZ AI",
              "description": "Advanced AI Chat Assistant powered by Groq with Llama 3.3 70B & 90B models. Features intelligent document generation, live code execution, stunning 3D visualizations with Three.js, interactive diagrams, PDF creation, Excel integration, and offline PWA support.",
              "url": "https://nexa.ajstudioz.co.in",
              "applicationCategory": "ProductivityApplication",
              "operatingSystem": "Web Browser, iOS, Android, Windows, macOS, Linux",
              "browserRequirements": "Requires JavaScript. Optimized for Chrome 90+, Firefox 88+, Safari 14+, Edge 90+",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD",
                "availability": "https://schema.org/InStock"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.9",
                "ratingCount": "1250",
                "bestRating": "5",
                "worstRating": "1"
              },
              "publisher": {
                "@type": "Organization",
                "name": "AJ STUDIOZ",
                "url": "https://nexa.ajstudioz.co.in",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://nexa.ajstudioz.co.in/logo.jpg"
                }
              },
              "creator": {
                "@type": "Organization",
                "name": "AJ STUDIOZ"
              },
              "featureList": [
                "AI-powered conversations with Groq Llama 3.3 70B & 90B",
                "Intelligent document generation with Claude-style artifacts",
                "Live code execution with syntax highlighting",
                "3D visualizations with Three.js integration",
                "Interactive data charts with D3.js",
                "Mermaid diagram rendering",
                "Monaco code editor integration",
                "PDF document creation and export",
                "Excel spreadsheet generation",
                "Progressive Web App (PWA) with offline support",
                "Dark mode and light mode themes",
                "Mobile-responsive design",
                "Real-time streaming responses",
                "Multi-model AI support",
                "Code syntax highlighting for 50+ languages",
                "Image upload and analysis",
                "Document attachments support",
                "Chat history management",
                "Export conversations",
                "Voice input support"
              ],
              "screenshot": "https://nexa.ajstudioz.co.in/og-image.jpg",
              "softwareVersion": "3.1.0",
              "releaseNotes": "Enhanced AI capabilities, improved performance, and new visualization features",
              "datePublished": "2024-01-01",
              "dateModified": "2025-10-20",
              "inLanguage": "en-US",
              "copyrightYear": "2024",
              "copyrightHolder": {
                "@type": "Organization",
                "name": "AJ STUDIOZ"
              },
              "keywords": "AI chatbot, Groq AI, Llama 3.3, artificial intelligence, code execution, 3D visualization, document generation, productivity tools, education AI, developer tools"
            })
          }}
        />
        
        {/* Additional Structured Data for Better Discovery */}
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: "Required for SEO"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "AJ STUDIOZ AI Chat",
              "applicationCategory": "Productivity",
              "operatingSystem": "Any",
              "offers": {
                "@type": "Offer",
                "price": "0"
              }
            })
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
          <SplashScreen />
          <Toaster position="top-center" />
          <SessionProvider>{children}</SessionProvider>
          <PWAInstallButton />
        </ThemeProvider>
        
        {/* PWA Service Worker Registration */}
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: "Required for PWA"
          dangerouslySetInnerHTML={{
            __html: `
              // Only register service worker in production and HTTPS
              if ('serviceWorker' in navigator && location.protocol === 'https:') {
                window.addEventListener('load', async () => {
                  try {
                    const registration = await navigator.serviceWorker.register('/sw.js', {
                      scope: '/',
                      updateViaCache: 'none'
                    });
                    console.log('✅ SW registered:', registration.scope);
                    
                    // Handle updates gracefully
                    registration.addEventListener('updatefound', () => {
                      const newWorker = registration.installing;
                      if (newWorker) {
                        newWorker.addEventListener('statechange', () => {
                          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            console.log('🆕 New content available');
                          }
                        });
                      }
                    });
                  } catch (error) {
                    console.warn('❌ SW registration failed:', error.message || error);
                  }
                });
              } else if ('serviceWorker' in navigator) {
                console.log('ℹ️ SW not registered - requires HTTPS in production');
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
