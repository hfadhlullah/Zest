import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zest — AI-powered UI Builder",
  description:
    "Turn natural language prompts into fully editable web interfaces with real-time visual editing and instant HTML output.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className="antialiased">{children}</body>
      </html>
    </ClerkProvider>
  );
}
