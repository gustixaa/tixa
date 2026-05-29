import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Tixa Store | Marketplace Game Online",
  description: "Platform menjual game online termurah dan terpercaya",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full antialiased dark">
      <body className="min-h-full bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-[#D4AF37] selection:text-zinc-950">
        
        {/* Main Content Aplikasi */}
        {children}
        
        {/* MIDTRANS SNAP - afterInteractive agar termuat sebelum user klik bayar */}
        <Script
          src="https://app.sandbox.midtrans.com/snap/snap.js"
          data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
