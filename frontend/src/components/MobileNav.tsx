// Issue #20: Global layout shell - Mobile Navigation component
// Complexity: Trivial (100 pts)

import React, { useState, useEffect, useRef } from 'react'

interface MobileNavProps {
  currentView?: string
  onNavigate?: (view: string) => void
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentView, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'create', label: 'Create Group', icon: '➕' },
    { id: 'detail', label: 'My Groups', icon: '👥' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
  ]

  const handleNavigate = (view: string) => {
    onNavigate?.(view)
    setIsOpen(false)
    // Return focus to trigger after close
    triggerRef.current?.focus()
  }

  const handleClose = () => {
    setIsOpen(false)
    triggerRef.current?.focus()
  }

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  // Focus first menu item when opened
  useEffect(() => {
    if (isOpen) {
      const firstBtn = menuRef.current?.querySelector<HTMLButtonElement>('button')
      firstBtn?.focus()
    }
  }, [isOpen])

  return (
    <div className="lg:hidden">
      {/* Hamburger Button */}
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
        aria-controls="mobile-nav-menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={handleClose}
            aria-hidden="true"
          />
          <nav
            id="mobile-nav-menu"
            ref={menuRef}
            className="fixed top-16 left-0 right-0 bg-white shadow-lg z-50 p-4"
            aria-label="Mobile navigation"
          >
            <div className="space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  aria-current={currentView === item.id ? 'page' : undefined}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    currentView === item.id
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span aria-hidden="true" className="text-xl">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </nav>
        </>
      )}
    </div>
  )
}
