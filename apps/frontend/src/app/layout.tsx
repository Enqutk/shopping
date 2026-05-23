import { DM_Sans, Cormorant_Garamond, Great_Vibes } from 'next/font/google';
import './global.css';
import AuthProvider from '../components/AuthProvider';
import RealtimeProvider from '../components/RealtimeProvider';
import ToastProvider from '../components/ToastProvider';

const fontSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const fontDisplay = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
});

const fontScript = Great_Vibes({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-script',
  display: 'swap',
  preload: false,
});

export const metadata = {
  title: 'LUXE — Natural Beauty Collection',
  description: 'Premium fashion & lifestyle. Dark luxe editorial storefront.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${fontSans.variable} ${fontDisplay.variable} ${fontScript.variable}`}
    >
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[300] focus:px-4 focus:py-2 focus:bg-femme-champagne focus:text-femme-black focus:rounded-lg"
        >
          Skip to main content
        </a>
        <AuthProvider>
          <RealtimeProvider>
            {children}
            <ToastProvider />
          </RealtimeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
