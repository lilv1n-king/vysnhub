'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Search, 
  FolderOpen, 
  Phone,
  QrCode 
} from 'lucide-react';

export default function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    {
      href: '/',
      icon: Home,
      label: 'Home',
      active: pathname === '/'
    },
    {
      href: '/products',
      icon: Search,
      label: 'Products',
      active: pathname.startsWith('/products')
    },
    {
      href: '/scanner',
      icon: QrCode,
      label: 'Scanner',
      active: pathname === '/scanner'
    },
    {
      href: '/projects',
      icon: FolderOpen,
      label: 'Projects',
      active: pathname === '/projects'
    },
    {
      href: '/contact',
      icon: Phone,
      label: 'Contact',
      active: pathname === '/contact'
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden">
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center transition-colors ${
                item.active 
                  ? 'text-black bg-gray-50' 
                  : 'text-gray-600 hover:text-black hover:bg-gray-50'
              }`}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
} 