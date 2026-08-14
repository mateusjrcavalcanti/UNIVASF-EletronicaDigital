"use client"

import { useCallback, useEffect, useState } from "react"

type Theme = "dark" | "light"

const STORAGE_KEY = "conversor-bases-numericas:theme"
const LEGACY_STORAGE_KEY = "baselab-theme"

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("dark")

  useEffect(() => {
    const stored = (localStorage.getItem(STORAGE_KEY) as Theme | null)
      ?? (localStorage.getItem(LEGACY_STORAGE_KEY) as Theme | null)
      ?? "dark"
    localStorage.setItem(STORAGE_KEY, stored)
    setTheme(stored)
    document.documentElement.classList.toggle("dark", stored === "dark")
    document.documentElement.classList.toggle("light", stored === "light")
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark"
      localStorage.setItem(STORAGE_KEY, next)
      document.documentElement.classList.toggle("dark", next === "dark")
      document.documentElement.classList.toggle("light", next === "light")
      return next
    })
  }, [])

  return { theme, toggleTheme }
}
