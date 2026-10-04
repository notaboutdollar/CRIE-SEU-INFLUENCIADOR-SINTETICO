import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { CharactersSyncer } from "@/components/auth/CharactersSyncer";

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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-bg text-ink antialiased">
        <AuthProvider>
          <CharactersSyncer />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
