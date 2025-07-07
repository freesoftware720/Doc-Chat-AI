
import type {Metadata} from 'next';
import './globals.css';
import { Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/toaster';
import { SpeedInsights } from "@vercel/speed-insights/next"

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
})

export const metadata: Metadata = {
  title: 'Doc-Chat AI',
  description: 'Chat with your documents using AI.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${inter.variable}`}>
      <body className="font-body antialiased min-h-screen bg-background flex flex-col">
          {children}
          <Toaster />
        <SpeedInsights />
      </body>
    </html>
  );
}
