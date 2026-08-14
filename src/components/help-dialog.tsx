"use client"

import { X } from "lucide-react"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"

interface HelpDialogProps {
  open: boolean
  onClose: () => void
}

const SECTIONS = [
  {
    title: "Conversor",
    items: [
      "Digite um valor, escolha a base de origem e a de destino.",
      "Use “Inverter bases” para trocar origem e destino rapidamente.",
      "O resultado mostra a conversão e permite abrir o cálculo passo a passo.",
    ],
  },
  {
    title: "Visualizador de bits",
    items: [
      "Cada célula representa um bit (LED aceso = 1).",
      "O bit de sinal (MSB) indica número positivo ou negativo em complemento de 2.",
      "Escolha entre 4, 8, 12 ou 16 bits.",
    ],
  },
  {
    title: "Operações",
    items: [
      "Defina dois operandos com bases independentes.",
      "Suporta adição, subtração, AND, OR, XOR e deslocamentos.",
      "As flags Carry, Borrow e Overflow são calculadas automaticamente.",
    ],
  },
  {
    title: "Quiz",
    items: [
      "Converta o valor apresentado para a base solicitada.",
      "Ganhe pontos e mantenha sua sequência de acertos.",
      "Ao errar, veja a resposta correta e a explicação.",
    ],
  },
]

export function HelpDialog({ open, onClose }: HelpDialogProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (open) document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-title"
    >
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="relative flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xl duration-200 animate-in fade-in zoom-in-95">
        <header className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 id="help-title" className="text-base font-semibold text-foreground">
            Como usar o Conversor de Bases Numéricas
          </h2>
          <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Fechar ajuda">
            <X aria-hidden="true" />
          </Button>
        </header>
        <div className="flex flex-col gap-5 overflow-y-auto p-5">
          {SECTIONS.map((section) => (
            <div key={section.title} className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold text-primary">{section.title}</h3>
              <ul className="flex flex-col gap-1.5">
                {section.items.map((item, i) => (
                  <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                    <span className="mt-2 size-1 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
