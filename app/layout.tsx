import type { Metadata } from "next";
import "./globals.css";
import Footer from "../components/Footer";
import React from "react";
import SafeInsetsProvider from "../components/SafeInsetsProvider";

export const metadata: Metadata = {
  title: "Sam Kort — Interactive Portfolio",
  description:
      "A living neural network portfolio by Sam Kort — Software Engineer (Frontend, Backend, AI, Blockchain, Cloud).",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
      <html lang="en">
      <body className="antialiased">
      <SafeInsetsProvider />
      <div className="pt-28 pb-24">{children}</div>
      <Footer />
      </body>
      </html>
  );
}
