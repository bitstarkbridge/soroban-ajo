'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { navLinks } from '@/config/nav'
import { WalletConnector } from './WalletConnector'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname() || ''
  const [startY, setStartY] = useState<number | null>(null)

  if (!isOpen) return null

  const onTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    setStartY(event.touches[0].clientY)
  }

  const onTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (startY === null) return

    const deltaY = event.changedTouches[0].clientY - startY
    if (deltaY > 80) {
      onClose()
    }

    setStartY(null)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/30 md:hidden" onClick={onClose}>
      <div
        className="fixed inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-white p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        data-swipe-ignore="true"
      >
        <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-gray-300" />

        <button className="mb-6 text-gray-500 hover:text-gray-800" onClick={onClose}>
          ✕ Close
        </button>
        <nav className="flex flex-col gap-2 mb-6">
          {navLinks.map((link) => {
            const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={`px-3 py-2 rounded-md font-medium flex gap-2 items-center ${
                  isActive ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-gray-100 pt-4 text-gray-800">
          <Link
            href="/profile"
            className="block px-4 py-2 hover:bg-gray-100 rounded-md"
            onClick={onClose}
          >
            Profile
          </Link>
          <Link
            href="/settings"
            className="block px-4 py-2 hover:bg-gray-100 rounded-md"
            onClick={onClose}
          >
            Settings
          </Link>
          <div className="block px-4 py-2 hover:bg-gray-100 rounded-md">
            <WalletConnector />
          </div>
        </div>
      </div>
    </div>
  )
}
