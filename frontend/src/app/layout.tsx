import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter,Montserrat } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Providers from "./providers";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner"
import AuthInitializer from "./AuthInitializer";

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});


const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Welcome to Planeflow",
  description: "Set up your workspace in minutes and start planning, tracking, and shipping projects with your team.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("", "antialiased", geistSans.variable, geistMono.variable, "font-sans", inter.variable)}
    >
      <body className="min-h-full flex flex-col">
          <Providers>
          <AuthInitializer>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
          >
              {children}
            <Toaster />
          </ThemeProvider>
            </AuthInitializer>
        </Providers>
      </body>
    </html >
  );
}
