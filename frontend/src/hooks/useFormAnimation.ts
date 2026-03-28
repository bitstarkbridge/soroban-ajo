import { useEffect, useState } from 'react'

export function useFormAnimation(trigger: any) {
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    if (trigger) {
      setAnimate(true)
      const t = setTimeout(() => setAnimate(false), 300)
      return () => clearTimeout(t)
    }
  }, [trigger])

  return animate
}
