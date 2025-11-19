import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import AppWrapper from "@/components/appWrapper";
import AnalyticsListener from "./analytics-listener";
import "./globals.css";
// 👇 ADICIONADO: Import do componente
import ChatwootWidget from "@/components/ChatwootWidget"; 

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FaqProjeta",
  description: "Sistema interno da Projeta Consultoria",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AnalyticsListener/>
        <AppWrapper>{children}</AppWrapper>
        {/* 👇 ADICIONADO: O widget entra aqui no final */}
        <ChatwootWidget /> 
      </body>
    </html>
  );
}