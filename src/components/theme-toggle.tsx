'use client'

import { useTheme } from 'next-themes'
import { useSyncExternalStore } from 'react'
import { Sun, Moon } from 'lucide-react'

const emptySubscribe = () => () => {}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false)

  if (!mounted) {
    return (
      <button
        className="h-8 w-8 rounded-full flex items-center justify-center"
        aria-label="Toggle theme"
      >
        <span className="sr-only">Toggle theme</span>
      </button>
    )
  }

  const isDark = theme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="h-8 w-8 rounded-full flex items-center justify-center hover:ring-2 hover:ring-[#006633]/40 transition-all duration-300 group"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div className="relative h-5 w-5">
        <Sun
          className={`absolute inset-0 size-5 text-amber-300 transition-all duration-500 ${
            isDark
              ? 'opacity-100 rotate-0 scale-100'
              : 'opacity-0 rotate-90 scale-50'
          }`}
        />
        <Moon
          className={`absolute inset-0 size-5 text-white/80 transition-all duration-500 ${
            isDark
              ? 'opacity-0 -rotate-90 scale-50'
              : 'opacity-100 rotate-0 scale-100'
          }`}
        />
      </div>
      <span className="sr-only">{isDark ? 'Switch to light mode' : 'Switch to dark mode'}</span>
    </button>
  )
}
