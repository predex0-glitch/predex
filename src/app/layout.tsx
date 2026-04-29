import type { Metadata } from "next";
import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
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
  title: "Predex",
  description: "Nucleo da gestao do seu condominio.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <header className="brandHeader">
          <Link href="/" className="brandLink">
            <Image
              src="/logo-predex.svg"
              alt="Predex"
              className="brandLogo"
              width={132}
              height={132}
              priority
            />
            <span className="brandName">
              Pre<span>dex</span>
            </span>
          </Link>
        </header>
        {children}
      </body>
    </html>
  );
}
