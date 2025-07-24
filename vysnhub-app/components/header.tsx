import Link from 'next/link';
import Image from 'next/image';
import { Search } from 'lucide-react';

export default function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
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
            <Link href="/projects" className="text-gray-700 hover:text-black font-medium">
              Projects
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-black font-medium">
              Contact
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <Link href="/products" className="p-2 hover:bg-gray-100 rounded-md">
              <Search className="h-5 w-5" />
            </Link>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="md:hidden flex justify-center items-center h-18">
          <Link href="/" className="flex items-center">
            <Image 
              src="/logo.png" 
              alt="VYSN" 
              width={210} 
              height={68}
              className="h-14 w-auto"
            />
          </Link>
        </div>
      </div>
    </header>
  );
}