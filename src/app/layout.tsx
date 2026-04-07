import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import localFont from 'next/font/local';
import './globals.css';

const poppins = Poppins({
  weight: ['400', '500', '600', '700', '900'],
  subsets: ['latin'],
  variable: '--font-poppins',
});

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
  description: 'Streetwear Cristao com alma.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${poppins.variable} ${monigue.variable} ${collsmith.variable} font-sans`}>
        {children}
      </body>
    </html>
  );
}
