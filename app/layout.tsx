import './globals.css';
import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/components/providers/AuthProvider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const viewport = {
  themeColor: '#ffffff',
};

export const metadata: Metadata = {
  title: 'Mentor | AI-Powered Learning Platform',
  description: 'AI-powered retention-first learning system for competitive exams.',
  icons: {
    icon: '/Mentor.png',
    apple: '/Mentor.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="bg-background text-foreground font-sans antialiased min-h-screen" suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
