import { useEffect, useState } from 'react'

/**
 * useSkeletonDelay - delays showing skeleton to avoid flash on fast loads
 *
 * @param isLoading - whether data is currently loading
 * @param delay - ms to wait before showing skeleton (default 300ms)
 * @returns boolean - true when skeleton should be visible
 */
export function useSkeletonDelay(isLoading: boolean, delay = 300): boolean {
  const [showSkeleton, setShowSkeleton] = useState(false)

  useEffect(() => {
    if (!isLoading) {
      setShowSkeleton(false)
      return
    }

    const timer = setTimeout(() => {
      if (isLoading) setShowSkeleton(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [isLoading, delay])

  return showSkeleton
}
