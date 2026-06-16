import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientProviders from "@/components/client-providers";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Secure Feedback Platform",
  description:
    "A secure and anonymous feedback system for students and institutions with real-time analytics and role-based access control.",

  icons: {
    icon: "./punith1117.jpg",
  },

  openGraph: {
    title: "Secure Feedback Platform",
    description:
      "A secure and anonymous feedback system for students and institutions with real-time analytics and role-based access control.",
    images: ["/punith1117.jpg"],
  },

  twitter: {
    card: "summary_large_image",
    title: "Secure Feedback Platform",
    description:
      "A secure and anonymous feedback system for students and institutions with real-time analytics and role-based access control.",
    images: ["/punith1117.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <link rel="icon" href="/punith1117.jpg" />
      <body className="min-h-full flex flex-col">
        <ClientProviders>{children}</ClientProviders> 
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
