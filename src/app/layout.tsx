import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Prompt Architect",
  description:
    "Assistente dinâmico para construção de prompts complexos e personalizados."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="bg-slate-950 text-slate-50">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
