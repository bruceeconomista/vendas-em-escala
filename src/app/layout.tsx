import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google"; // Importe suas fontes
import "./globals.css"; // Seus estilos globais

// Importe SessionProvider do next-auth/react
import { SessionProvider } from 'next-auth/react';
// Importe a função 'auth' do seu arquivo [...nextauth]/route.ts
// Ajuste o caminho se seu arquivo [...nextauth]/route.ts não estiver diretamente em app/auth
import { auth } from '../../auth'

// Definição de metadados - exportada separadamente, sem estar dentro do componente async
export const metadata: Metadata = {
  title: "Nome do Seu Aplicativo", // Ajuste o título
  description: "Descrição do seu aplicativo", // Ajuste a descrição
};

// Configuração das suas fontes
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// O componente RootLayout deve ser 'async' para buscar a sessão no servidor
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Obtenha a sessão no lado do servidor
  // Isso permite que o SessionProvider inicialize a sessão sem um carregamento inicial
  const session = await auth(); 

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`} // Mantenha suas classes de fonte/tailwind
      >
        {/* O SessionProvider deve envolver toda a sua aplicação */}
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
