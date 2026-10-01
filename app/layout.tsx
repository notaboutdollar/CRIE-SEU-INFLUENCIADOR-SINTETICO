import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Crie seu Influenciador Sintético",
  description:
    "Wizard em etapas para definir, de forma clara, quem é seu influenciador sintético. Gera a ficha completa e o Prompt Mestre pronto para usar.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="min-h-screen bg-bg text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
