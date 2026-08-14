"use client"

import { useCallback, useEffect, useState } from "react"

export interface HistoryItem {
  id: string
  value: string
  fromBase: number
  toBase: number
  result: string
  timestamp: number
}

const STORAGE_KEY = "conversor-bases-numericas:history"
const LEGACY_STORAGE_KEY = "baselab-history"
const MAX_ITEMS = 30

export function useHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY)
      if (raw) {
        setHistory(JSON.parse(raw))
        localStorage.setItem(STORAGE_KEY, raw)
      }
    } catch {
      // ignora dados corrompidos
    }
  }, [])

  const persist = useCallback((items: HistoryItem[]) => {
    setHistory(items)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // storage indisponível
    }
  }, [])

  const addHistory = useCallback(
    (item: Omit<HistoryItem, "id" | "timestamp">) => {
      setHistory((prev) => {
        const next: HistoryItem[] = [
          { ...item, id: crypto.randomUUID(), timestamp: Date.now() },
          ...prev,
        ].slice(0, MAX_ITEMS)
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
        } catch {
          // ignora
        }
        return next
      })
    },
    [],
  )

  const clearHistory = useCallback(() => persist([]), [persist])

  return { history, addHistory, clearHistory }
}
