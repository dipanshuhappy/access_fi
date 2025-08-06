import "~/styles/globals.css";
import '@rainbow-me/rainbowkit/styles.css';

import type { Metadata } from "next";
import { Geist } from "next/font/google";

import Navbar from "~/components/Navbar";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "Access Fi - Decentralized Finance Revolution",
  description: "Experience the future of DeFi with Access Fi. Seamless transactions, innovative protocols, and financial freedom at your fingertips.",
  keywords: "DeFi, Decentralized Finance, Crypto, Blockchain, Web3, Access Fi",
  authors: [{ name: "Access Fi Team" }],
  openGraph: {
    title: "Access Fi - Decentralized Finance Revolution",
    description: "Experience the future of DeFi with Access Fi. Seamless transactions, innovative protocols, and financial freedom at your fingertips.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Access Fi - Decentralized Finance Revolution",
    description: "Experience the future of DeFi with Access Fi. Seamless transactions, innovative protocols, and financial freedom at your fingertips.",
  },
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body className="overflow-x-hidden">
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
