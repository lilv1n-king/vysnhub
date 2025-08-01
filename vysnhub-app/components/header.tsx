'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Search, Settings, Bot } from 'lucide-react';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 border-b border-gray-200 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop Header */}
        <div className="hidden md:flex justify-between items-center h-20">
          <Link href="/" className="flex items-center space-x-2">
            <Image 
              src="/logo.png" 
              alt="VYSN" 
              width={240} 
              height={90}
              className="h-16 w-auto"
            />
          </Link>
          
          <nav className="flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-black font-medium">
              Home
            </Link>
            <Link href="/products" className="text-gray-700 hover:text-black font-medium">
              Products
            </Link>
            <Link href="/ai-chat" className="text-gray-700 hover:text-black font-medium flex items-center gap-2">
              <Bot className="h-4 w-4" />
              AI Chat
            </Link>
            <Link href="/projects" className="text-gray-700 hover:text-black font-medium">
              Projects
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <Link href="/products" className="p-2 hover:bg-gray-100 rounded-md">
              <Search className="h-5 w-5" />
            </Link>
            <Link href="/settings" className="p-2 hover:bg-gray-100 rounded-md">
              <Settings className="h-5 w-5" />
            </Link>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="md:hidden flex justify-between items-center h-20">
          <Link href="/" className="flex items-center">
            <Image 
              src="/logo.png" 
              alt="VYSN" 
              width={240} 
              height={75}
              className="h-16 w-auto"
            />
          </Link>
          
          <Link href="/settings" className="p-3 hover:bg-gray-100 rounded-lg">
            <Settings className="h-6 w-6" />
          </Link>
        </div>
      </div>
    </header>
  );
}