import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NextJS + Cloudflare Workers template",
  description: "A template for deploying static NextJS sites to Cloudflare Workers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
