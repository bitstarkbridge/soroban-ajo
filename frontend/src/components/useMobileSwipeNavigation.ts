'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { navLinks } from '@/config/nav'

const MIN_DISTANCE = 72
const MAX_VERTICAL_DRIFT = 64

export const useMobileSwipeNavigation = () => {
  const router = useRouter()
  const pathname = usePathname() || ''

  useEffect(() => {
    if (typeof window === 'undefined') return

    let startX = 0
    let startY = 0
    let active = false

    const onTouchStart = (event: TouchEvent) => {
      if (window.innerWidth >= 768) return

      const target = event.target as HTMLElement | null
      if (
        target?.closest('input, textarea, [contenteditable="true"], [data-swipe-ignore="true"]')
      ) {
        return
      }

      const touch = event.touches[0]
      startX = touch.clientX
      startY = touch.clientY
      active = true
    }

    const onTouchEnd = (event: TouchEvent) => {
      if (!active || window.innerWidth >= 768) return

      const touch = event.changedTouches[0]
      const deltaX = touch.clientX - startX
      const deltaY = Math.abs(touch.clientY - startY)

      active = false

      if (Math.abs(deltaX) < MIN_DISTANCE || deltaY > MAX_VERTICAL_DRIFT) {
        return
      }

      const currentIndex = navLinks.findIndex((link) =>
        link.href === '/' ? pathname === '/' : pathname.startsWith(link.href)
      )

      if (currentIndex === -1) return

      if (deltaX < 0 && currentIndex < navLinks.length - 1) {
        router.push(navLinks[currentIndex + 1].href)
      }

      if (deltaX > 0 && currentIndex > 0) {
        router.push(navLinks[currentIndex - 1].href)
      }
    }

    document.addEventListener('touchstart', onTouchStart, { passive: true })
    document.addEventListener('touchend', onTouchEnd, { passive: true })

    return () => {
      document.removeEventListener('touchstart', onTouchStart)
      document.removeEventListener('touchend', onTouchEnd)
    }
  }, [pathname, router])
}
