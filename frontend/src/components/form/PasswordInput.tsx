'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { FloatingInput } from './FloatingInput'

function getStrength(password: string) {
  if (password.length < 6) return 1
  if (password.match(/[A-Z]/) && password.match(/[0-9]/)) return 3
  return 2
}

export function PasswordInput(props: any) {
  const [show, setShow] = useState(false)
  const [value, setValue] = useState('')

  const strength = getStrength(value)

  return (
    <div className="space-y-2">
      <div className="relative">
        <FloatingInput
          {...props}
          type={show ? 'text' : 'password'}
          onChange={(e) => setValue(e.target.value)}
        />

        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {/* Strength bar */}
      <div className="h-1 w-full rounded bg-gray-200 overflow-hidden">
        <div
          className={`
            h-full transition-all duration-300
            ${strength === 1 && 'w-1/3 bg-red-500'}
            ${strength === 2 && 'w-2/3 bg-yellow-500'}
            ${strength === 3 && 'w-full bg-green-500'}
          `}
        />
      </div>
    </div>
  )
}
