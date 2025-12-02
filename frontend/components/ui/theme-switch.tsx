"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeSwitch() {
  const [mounted, setMounted] = React.useState(false)
  const { resolvedTheme, setTheme } = useTheme()

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="h-10 w-[70px] rounded-full bg-muted animate-pulse" />
    )
  }

  const isDark = resolvedTheme === "dark"

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`
        relative inline-flex h-10 w-[70px] items-center rounded-full transition-colors
        ${isDark ? "bg-primary" : "bg-input"}
        hover:opacity-80
      `}
      aria-label="Cambiar tema"
    >
      {/* Circle slider */}
      <span
        className={`
          inline-flex h-8 w-8 transform items-center justify-center rounded-full bg-background shadow-lg transition-transform
          ${isDark ? "translate-x-[34px]" : "translate-x-1"}
        `}
      >
        {/* Icon inside circle */}
        {isDark ? (
          <Moon className="h-4 w-4 text-foreground" />
        ) : (
          <Sun className="h-4 w-4 text-foreground" />
        )}
      </span>
    </button>
  )
}
