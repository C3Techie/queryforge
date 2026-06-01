import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNavWrapper } from "@/components/layout/MobileNavWrapper";
import { MobileTabProvider } from "@/lib/mobileTabContext";
import { ToastProvider } from "@/components/ui/toast";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "600", "900"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "QueryForge",
  description: "Advanced Query Builder with Stitch Design System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="h-screen flex flex-col overflow-hidden bg-background text-on-background transition-colors duration-200">
        <MobileTabProvider>
          <ToastProvider>
            <Header />

            {/* Workspace Shell */}
            <div className="flex flex-1 overflow-hidden pt-14 pb-16 lg:pb-0 relative">
              <Sidebar className="hidden lg:flex shrink-0" />
              <main className="flex-1 flex flex-col overflow-hidden min-w-0 bg-background">
                {children}
              </main>
            </div>

            {/* Mobile Navigation */}
            <MobileNavWrapper />
          </ToastProvider>
        </MobileTabProvider>
      </body>
    </html>
  );
}
