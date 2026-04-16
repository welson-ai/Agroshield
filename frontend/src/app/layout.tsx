import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { ToasterComponent } from "@/components/toaster";
import '@rainbow-me/rainbowkit/styles.css';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AgroShield - Parametric Crop Insurance",
  description: "Decentralized parametric crop insurance protocol on Celo blockchain",
  other: {
    "talentapp:project_verification": "e54b8387bedc605952a4ae7ce248f00a5f7ad166ca9c844a546e671d8b4b22ef591020c9ef3510d9809d4f905050576efc3a3638b44c62d83051cb3db39dafc8"
  }
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
      <body className="min-h-full flex flex-col">
        <Providers>
          {children}
          <ToasterComponent />
        </Providers>
      </body>
    </html>
  );
}
