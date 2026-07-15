import type { Metadata } from "next";
import { Geist, Geist_Mono, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import localFont from 'next/font/local'
import Navbar from '@/components/navbar'

const dunggeunmo = localFont({
  src: '../fonts/DungGeunMo/DungGeunMo.woff2',
  display: 'swap',
  weight: '100 900',
  variable: '--font-dunggeunmo',
})

const JetBrainsMono = localFont({
  src: '../fonts/JetbrainsMono/jetbrains-mono-latin-wght-normal.woff2',
  display: 'swap',
  variable: '--font-JetBrainsMono',
})

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "nexus by yuktn",
  description: "a server health checker",
    icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><text y="1.1em" font-size="90">🖥️</text></svg>',
  },
};

const RootLayout = async ({
  params,
  children,
}: {
  params: Promise<any>
  children: React.ReactNode
}) => {
  console.log('RootLayout', await params)
  return (
    <html lang="ko" className={`${JetBrainsMono.variable}`}>
      <body className={JetBrainsMono.className}>
        <Navbar />
        <div className="flex">
          <div className="flex flex-col flex-1">
            <main className="w-full bg-light">{children}</main>
          </div>
        </div>
      </body>
    </html>
  )
}

export default RootLayout