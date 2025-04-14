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
      {/* <body
        className={clsx(
          "h-screen overflow-hidden bg-background font-sans antialiased",
          fontSans.variable,
        )}
      > */}
      <body
        className={clsx(
          "h-screen bg-background font-sans antialiased",
          fontSans.variable,
        )}
      >
        {/* <AuthProvider> */}
        <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
          <div className="flex flex-col h-screen">
            {/* Navbar stays fixed at the top */}
            <Navbar />

            {/* Main content wrapped with ProtectedRoute */}
            <main className="flex-grow px-6 md:px-8 lg:px-8">
              <ProtectedRoute>
                {children}
              </ProtectedRoute>
            </main>
          </div>
        </Providers>
        {/* </AuthProvider> */}
      </body>
    </html>
  );
}
