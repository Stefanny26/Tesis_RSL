"use client"

import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeMenuItem() {
  const [mounted, setMounted] = React.useState(false)
  const { theme, setTheme } = useTheme()

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const themes = [
    { value: "light", label: "Claro", icon: Sun },
    { value: "dark", label: "Oscuro", icon: Moon },
    { value: "system", label: "Sistema", icon: Monitor },
  ]

  return (
    <>
      {themes.map((themeOption) => {
        const Icon = themeOption.icon
        const isActive = theme === themeOption.value
        
        return (
          <button
            key={themeOption.value}
            onClick={() => setTheme(themeOption.value)}
            className={`
              w-full flex items-center px-2 py-1.5 text-sm rounded-sm cursor-pointer
              ${isActive 
                ? "bg-accent text-accent-foreground" 
                : "hover:bg-accent hover:text-accent-foreground"
              }
            `}
          >
            <Icon className="mr-2 h-4 w-4" />
            <span>{themeOption.label}</span>
            {isActive && (
              <span className="ml-auto text-xs">✓</span>
            )}
          </button>
        )
      })}
    </>
  )
}
