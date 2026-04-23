import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import localFont from 'next/font/local';
import './globals.css';

const poppins = Poppins({
  subsets: ['latin'],
  variable: '--font-poppins',
  weight: ['400', '500', '600', '700', '900'],
});

const monigue = localFont({
  src: './fonts/Monigue.otf',
  variable: '--font-Monigue',
});

const collsmith = localFont({
  src: './fonts/Collsmith.otf',
  variable: '--font-Collsmith',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  applicationName: 'El Roi',
  description: 'Streetwear cristao com identidade, proposito e presenca digital profissional.',
  metadataBase: new URL(siteUrl),
  openGraph: {
    description:
      'Streetwear cristao com identidade, proposito e presenca digital profissional.',
    siteName: 'El Roi',
    title: 'El Roi',
    type: 'website',
    url: siteUrl,
  },
  title: {
    default: 'El Roi',
    template: '%s | El Roi',
  },
  twitter: {
    card: 'summary_large_image',
    description:
      'Streetwear cristao com identidade, proposito e presenca digital profissional.',
    title: 'El Roi',
  },
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
