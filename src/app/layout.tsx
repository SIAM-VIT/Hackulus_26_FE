import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/hooks/useAuth";
import { Toaster } from "@/components/ui/sonner";
import MockProvider from "@/components/mock-provider";

export const metadata: Metadata = {
  title: "Hackulus'25",
  description: "The official portal for Hackulus 2025 by SIAM-VIT.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Afacad:ital,wght@0,400..700;1,400..700&family=Anta&family=Bebas+Neue&family=Castoro:ital@0;1&family=Hanken+Grotesk:ital,wght@0,100..900;1,100..900&display=swap"
          rel="stylesheet"
        />
        <meta name="apple-mobile-web-app-title" content="Hackulus" />
      </head>
      <body className="antialiased bg-black">
        <MockProvider>
          <AuthProvider>
            {children}
            <Toaster position="top-center" richColors />
          </AuthProvider>
        </MockProvider>
      </body>
    </html>
  );
}
