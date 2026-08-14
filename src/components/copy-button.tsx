"use client"

import { Check, Copy } from "lucide-react"
import { useCallback, useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CopyButtonProps {
  text: string
  label?: string
  variant?: "default" | "outline" | "secondary" | "ghost"
  size?: "default" | "sm" | "icon" | "icon-sm"
  className?: string
}

export function CopyButton({
  text,
  label = "Copiar",
  variant = "outline",
  size = "sm",
  className,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      // clipboard indisponível
    }
  }, [text])

  const iconOnly = size === "icon" || size === "icon-sm"

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleCopy}
      aria-label={copied ? "Copiado" : label}
      className={cn(className)}
    >
      {copied ? (
        <Check className="text-primary" aria-hidden="true" />
      ) : (
        <Copy aria-hidden="true" />
      )}
      {!iconOnly && <span>{copied ? "Copiado" : label}</span>}
    </Button>
  )
}
