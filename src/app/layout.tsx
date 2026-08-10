import type { Metadata } from 'next';
import { IBM_Plex_Sans_Arabic } from 'next/font/google';
import '../index.css';
import { Providers } from './providers';
import { ClientShell } from './client-shell';
import { fetchConfig } from '../api/general';

// LOBBY CARE brand typeface (matches the Figma design system)
const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-ibm-plex-arabic',
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  try {
    const config = await fetchConfig('ar');
    return {
      title: config?.name || 'لوحة التحكم',
      description: config?.description || 'وصف مختصر للموقع',
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'لوحة التحكم',
      description: 'وصف مختصر للموقع',
    };
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" className={ibmPlexArabic.variable} suppressHydrationWarning>
      <body className="font-sans" suppressHydrationWarning>
        <Providers>
          <ClientShell>
            {children}
          </ClientShell>
        </Providers>
      </body>
    </html>
  );
}
