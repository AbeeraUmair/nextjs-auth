import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AuthFlow Documentation",
  description: "Documentation for AuthFlow authentication system",
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${inter.className} antialiased bg-gray-50 min-h-screen`}>
      {children}
    </div>
  );
} 