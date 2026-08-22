import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { StoreDataProvider } from "@/context/StoreDataContext";

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sareethi — Women's Fashion Storefront",
  description: "AI-Powered Digital Operating System for Women's Fashion Retail",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} ${inter.variable} ${playfair.variable} antialiased bg-white text-gray-900`}
      >
        <StoreDataProvider>
          <CartProvider>{children}</CartProvider>
        </StoreDataProvider>
      </body>
    </html>
  );
}
