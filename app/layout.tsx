import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from 'sonner';
import Script from 'next/script';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DivWelly",
  description: "Household management and bill splitting done well",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster position="top-right" richColors />

        {/* LoggerLizard Analytics */}
        {process.env.NEXT_PUBLIC_LOGGERLIZARD_API_KEY && (
          <Script
            src="/lib/loggerlizard.js"
            strategy="afterInteractive"
            type="module"
          />
        )}
      </body>
    </html>
  );
}
