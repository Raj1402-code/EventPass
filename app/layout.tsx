import './globals.css';
import { AuthProvider } from '@/components/AuthContext';
import { Navbar } from '@/components/Navbar';

export const metadata = {
  title: 'EventPass AI - Real-Time Check-In & Operations System',
  description: 'Production-Ready Event Check-In System with PostgreSQL Row-Locking, TOTP Rotating QR Codes, Offline Sync, and AI Insights.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          <Navbar />
          <main className="min-h-[calc(100vh-4rem)]">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
