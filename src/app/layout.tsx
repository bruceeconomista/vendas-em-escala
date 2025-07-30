import './globals.css';
// REMOVA completamente a linha abaixo, se ela ainda estiver lá:
// import type { Metadata } from 'next'; 
import localFont from 'next/font/local';
import { SessionWrapper } from '@/components/SessionWrapper';

const geistSans = localFont({
  src: [
    {
      path: '../../public/fonts/geist/Geist-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/geist/Geist-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-geist',
  display: 'swap',
});

const geistMono = localFont({
  src: [
    {
      path: '../../public/fonts/geist/GeistMono-Black.woff2',
      weight: '900',
      style: 'normal',
    },
  ],
  variable: '--font-geist-mono',
  display: 'swap',
});

// Mantenha apenas a definição do objeto, sem nenhuma anotação de tipo explícita para 'Metadata'
export const metadata = { 
  title: 'Seu app',
  description: 'Descrição',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        {/* REMOVA COMPLETAMENTE esta linha, pois não precisamos mais do Mapbox CSS com scattergeo. */}
        {/* <link
          href="https://api.mapbox.com/mapbox-gl-js/v1.13.0/mapbox-gl.css"
          rel="stylesheet"
        /> */}
      </head>
      <body>
        <SessionWrapper>
          {children}
        </SessionWrapper>
      </body>
    </html>
  );
}