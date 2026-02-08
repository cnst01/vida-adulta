// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthContextProvider } from "@/context/AuthContext"; // Importe aqui
import { HouseholdProvider } from "@/context/HouseholdContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Finanças Casal",
  description: "Controle financeiro inteligente",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <AuthContextProvider>
          <HouseholdProvider> 
            {children}
          </HouseholdProvider>
        </AuthContextProvider>
      </body>
    </html>
  );
}