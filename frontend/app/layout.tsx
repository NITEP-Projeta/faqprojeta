import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import AppWrapper from "@/components/appWrapper";
import AnalyticsListener from "./analytics-listener";
import Script from 'next/script';
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
  title: "FaqProjeta",
  description: "Sistema interno da Projeta Consultoria",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  // ✅ CORRETO: URL HTTPS do Ngrok
  const CHATWOOT_BASE_URL = "https://chat.boingaestrutural.com";

  // ✅ CORRETO: Token do Widget
  const CHATWOOT_TOKEN = 'WhnkViuGFgJCHcB1qNbtPYwL';

  return (
    <html lang="pt-BR">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AnalyticsListener/>
        <AppWrapper>{children}</AppWrapper>
        {/* ❌ REMOVIDO: Uso do componente ChatwootWidget (remoção da injeção duplicada) */}
      </body>
      <Script
        id="chatwoot-script"
        // 'lazyOnload' é ideal para widgets de chat
        strategy="lazyOnload" 
        dangerouslySetInnerHTML={{
          __html: `
            (function(d,t) {
              var BASE_URL="${CHATWOOT_BASE_URL}";
              var g=d.createElement(t),s=d.getElementsByTagName(t)[0];
              g.src=BASE_URL+"/packs/js/sdk.js";
              g.async = true;
              s.parentNode.insertBefore(g,s);
              g.onload=function(){
                window.chatwootSDK.run({
                  websiteToken: '${CHATWOOT_TOKEN}',
                  baseUrl: BASE_URL
                })
              }
            })(document,"script");
          `,
        }}
      />
    </html>
  );
}