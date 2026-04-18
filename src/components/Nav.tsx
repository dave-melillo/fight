'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function Nav() {
  const pathname = usePathname();

  return (
    <header className="bg-gray-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-tight text-red-500">FIGHT</span>
            <span className="text-xs text-gray-400 hidden sm:inline">UFC Betting Companion</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/"
              className={cn(
                'text-sm font-medium transition-colors hover:text-red-400',
                pathname === '/' ? 'text-red-400' : 'text-gray-300'
              )}
            >
              Events
            </Link>
            <Link
              href="/how-it-works"
              className={cn(
                'text-sm font-medium transition-colors hover:text-red-400',
                pathname === '/how-it-works' ? 'text-red-400' : 'text-gray-300'
              )}
            >
              How It Works
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
