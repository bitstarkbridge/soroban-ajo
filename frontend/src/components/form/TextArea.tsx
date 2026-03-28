'use client'

import { useRef } from 'react'

export function Textarea({ label, ...props }: any) {
  const ref = useRef<HTMLTextAreaElement>(null)

  const handleInput = () => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }

  return (
    <div className="relative">
      <textarea
        ref={ref}
        onInput={handleInput}
        placeholder=" "
        className="peer w-full resize-none rounded-xl border-2 border-gray-300 bg-transparent px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500"
        {...props}
      />

      <label className="absolute left-4 top-3 text-gray-400 transition-all peer-focus:-top-2 peer-focus:text-sm peer-focus:text-purple-500 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base">
        {label}
      </label>
    </div>
  )
}
