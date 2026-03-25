import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import localFont from 'next/font/local';
import './globals.css';

// 1. Puxando a Poppins direto do Google
const poppins = Poppins({
  weight: ['400', '500', '600', '700', '900'],
  subsets: ['latin'],
  variable: '--font-poppins',
});

// 2. Puxando as suas fontes locais (da pasta src/fonts)
// ⚠️ ATENÇÃO: Se os seus arquivos terminarem em .otf em vez de .ttf, mude as extensões aqui embaixo!
const monigue = localFont({
  src: './fonts/Monigue.otf',
  variable: '--font-Monigue',
});

const collsmith = localFont({
  src: './fonts/Collsmith.otf',
  variable: '--font-Collsmith',
});

export const metadata: Metadata = {
  title: 'El Roi - Streetwear',
  description: 'Streetwear Cristão com alma.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      {/* Aqui nós injetamos as 3 fontes no corpo do site inteiro */}
      <body className={`${poppins.variable} ${monigue.variable} ${collsmith.variable} font-sans`}>
        {children}
      </body>
    </html>
  );
}