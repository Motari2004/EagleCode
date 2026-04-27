import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Providers from "../components/Providers";
import { DeploymentSuccessModal } from "@/components/DeploymentSuccessModal";
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
  title: "EagleCode - AI-Powered Web Development",
  description: "Build production-ready Next.js applications with AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#f8fafc] text-[#1e293b]">
        <Providers>
          {/* Main content */}
          <main className="flex-grow">
            {children}
          </main>
          
          {/* Global deployment success modal - always available */}
          <DeploymentSuccessModal />
        </Providers>
      </body>
    </html>
  );
}