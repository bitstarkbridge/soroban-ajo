'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { navLinks } from '@/config/nav'

interface MobileBottomNavProps {
  onOpenMenu: () => void
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenMenu }) => {
  const pathname = usePathname() || ''

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 md:hidden">
      <nav aria-label="Bottom navigation" className="grid grid-cols-5 px-1 pb-2">
        {navLinks.map((link) => {
          const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href)

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex min-h-[64px] flex-col items-center justify-center gap-1 rounded-lg text-xs font-medium transition ${
                isActive ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="text-base">{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          )
        })}

        <button
          type="button"
          onClick={onOpenMenu}
          className="flex min-h-[64px] flex-col items-center justify-center gap-1 rounded-lg text-xs font-medium text-gray-600"
          aria-label="Open navigation menu"
        >
          <span className="text-lg leading-none">☰</span>
          <span>Menu</span>
        </button>
      </nav>
    </div>
  )
}
