'use client';

import Header from '@/components/header';
import BarcodeScanner from '@/components/qr-scanner';

export default function ScannerPage() {
  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <main className="h-[calc(100vh-80px)]">
        <BarcodeScanner />
      </main>
    </div>
  );
} 