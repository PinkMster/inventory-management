import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/auth/AuthProvider';

// Load Poppins font with multiple weights for better typography
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata: Metadata = {
  title: '재고 관리 시스템',
  description: '현대적인 창고 및 재고 관리 솔루션',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="h-full scroll-smooth">
      <body className={`${poppins.variable} font-sans antialiased h-full`}>
        <AuthProvider>
          <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}