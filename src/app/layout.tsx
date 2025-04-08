import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import { Link } from "@heroui/link";
import clsx from "clsx";

import { Providers } from "./providers";

import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";
import { Navbar } from "@/src/components/navbar";
import { AuthProvider } from "@/context/TokenProvider";
import { ProtectedRoute } from "@/src/components/auth/ProtectedRoute"; // ✅ Add this line

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <head />
      <body
        className={clsx(
          "h-screen overflow-hidden bg-background font-sans antialiased",
          fontSans.variable,
        )}
      >
        <AuthProvider>
          <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
            <div className="flex flex-col h-screen">
              {/* Navbar stays fixed at the top */}
              <Navbar />

              {/* Main content wrapped with ProtectedRoute */}
              <main className="flex-1 overflow-y-auto px-0 md:px-8 pt-0 container mx-auto max-w-7xl">
                <ProtectedRoute>
                  {children}
                </ProtectedRoute>
              </main>

              {/* Optional footer (stays fixed at the bottom) */}
              <footer className="hidden md:block w-full flex items-center justify-center py-3">
                <Link
                  isExternal
                  className="flex items-center gap-1 text-current"
                  href="https://heroui.com?utm_source=next-app-template"
                  title="heroui.com homepage"
                >
                  {/* <span className="text-default-600">Powered by</span>
                  <p className="text-primary">HeroUI</p> */}
                </Link>
              </footer>
            </div>
          </Providers>
        </AuthProvider>
      </body>
    </html>
  );
}
