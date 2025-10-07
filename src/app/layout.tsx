import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ThemeRegistry from "@/theme/ThemeRegistry";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { SettingsProvider } from "@/context/SettingsContext";
import { LiveKitProvider } from "@/context/LiveKitContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hamraaz",
  description: "Hamraaz AI Voice Assistant in urdu",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ThemeRegistry>
          <ProtectedRoute>
            <SettingsProvider>
              <LiveKitProvider>{children}</LiveKitProvider>
            </SettingsProvider>
          </ProtectedRoute>
        </ThemeRegistry>
      </body>
    </html>
  );
}
