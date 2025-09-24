import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import Header from "@/components/Header";

// 1. We import both of our "brains"
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "VidStream",
  description: "The best place to share and watch premium videos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        {/* 2. We wrap our entire application in the AuthProvider */}
        <AuthProvider>
          {/* 3. Then we wrap it in the CartProvider, so all components inside have access */}
          <CartProvider>
            <Header />
            <main className="pt-14">{children}</main>
            <Toaster position="top-center" />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}