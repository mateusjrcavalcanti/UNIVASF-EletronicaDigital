"use client"

import { Share2 } from "lucide-react"
import { useCallback, useState, type ReactNode } from "react"
import { CopyButton } from "@/components/copy-button"
import { Button } from "@/components/ui/button"
import { baseLabel, groupBits } from "@/lib/base-conversion"

interface ResultDisplayProps {
  inputValue: string
  fromBase: number
  toBase: number
  result: string
  valid: boolean
  children?: ReactNode
}

export function ResultDisplay({
  inputValue,
  fromBase,
  toBase,
  result,
  valid,
  children,
}: ResultDisplayProps) {
  const [shared, setShared] = useState(false)

  const handleShare = useCallback(async () => {
    const url = new URL(window.location.href)
    url.searchParams.set("v", inputValue)
    url.searchParams.set("from", String(fromBase))
    url.searchParams.set("to", String(toBase))
    try {
      await navigator.clipboard.writeText(url.toString())
      setShared(true)
      setTimeout(() => setShared(false), 1600)
    } catch {
      // ignora
    }
  }, [inputValue, fromBase, toBase])

  const shortForm = toBase === 2 && valid ? groupBits(result, 4) : null

  return (
    <section
      aria-label="Resultado da conversão"
      className="flex flex-col gap-4 rounded-2xl border border-primary/25 bg-card p-5 sm:p-6"
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
        {/* Resultado */}
        <div className="flex min-w-0 flex-col gap-2">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Resultado
          </span>
          <output
            aria-live="polite"
            className="block break-all font-mono text-4xl font-semibold leading-tight text-primary sm:text-5xl"
          >
            {valid ? result : "—"}
          </output>
          {shortForm && (
            <p className="font-mono text-sm text-muted-foreground">{shortForm}</p>
          )}
          <span className="text-xs font-medium uppercase tracking-wide text-foreground/70">
            {baseLabel(toBase)} · base {toBase}
          </span>
        </div>

        <div className="flex min-w-32 flex-col gap-2">
          <CopyButton
            text={valid ? result : ""}
            label="Copiar resultado"
            variant="default"
            className="w-full"
          />
          <Button className="w-full" type="button" variant="outline" size="sm" onClick={handleShare}>
            <Share2 aria-hidden="true" />
            <span>{shared ? "Link copiado" : "Compartilhar"}</span>
          </Button>
        </div>
      </div>

      {children && <div className="-mx-5 -mb-5 mt-1 border-t border-border sm:-mx-6 sm:-mb-6">{children}</div>}
    </section>
  )
}
