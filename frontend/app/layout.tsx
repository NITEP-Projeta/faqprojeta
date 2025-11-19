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

  const CHATWOOT_BASE_URL = "http://192.168.15.101:3001";
  const CHATWOOT_TOKEN = 'QZE8T7cqYSoWbyG19CpDVApz';

  return (
    <html lang="pt-BR">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AnalyticsListener/>
        <AppWrapper>{children}</AppWrapper>
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
