import type { Metadata } from "next";
import { Bodoni_Moda, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// The museum's voice: a high-contrast didone for titles and placards,
// the grotesque stays for labels, chrome and controls.
const museum = Bodoni_Moda({
  variable: "--font-museum",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "The Digital Room",
  description:
    "An immersive 3D room. The objects are the navigation. The environment is the experience.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${museum.variable} ${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="flex min-h-full flex-col bg-void text-bone antialiased">
        {children}
      </body>
    </html>
  );
}
