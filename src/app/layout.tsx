import type { Metadata } from 'next';
import { LanguageProvider } from '@/context/LanguageContext';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Saathi AI',
  description: 'A gentle companion for Hindi-speaking dementia patients',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hi">
      <body>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
