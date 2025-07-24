'use client';

import Header from '@/components/header';
import QRScanner from '@/components/qr-scanner';

export default function ScannerPage() {
  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <main className="h-[calc(100vh-72px)] md:h-[calc(100vh-80px)]">
        <QRScanner />
      </main>
    </div>
  );
} 