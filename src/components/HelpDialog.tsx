import { useRef } from "react";
import { X } from "lucide-react";
import { useFocusTrap } from "../hooks/useFocusTrap";
import { Button } from "./ui/button";

interface HelpDialogProps {
  onClose: () => void;
}

export function HelpDialog({ onClose }: HelpDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef);

  return (
    <div
      ref={dialogRef}
      className="fixed inset-0 z-40 flex items-center justify-center bg-bg-primary/75 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-title"
      aria-describedby="help-description"
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      <div className="max-h-full w-full max-w-2xl overflow-auto rounded-2xl bg-bg-secondary p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-accent">
              Ajuda
            </p>
            <h2 id="help-title" className="mt-1 text-2xl font-semibold">
              Como funciona a conversão
            </h2>
          </div>
          <Button aria-label="Fechar diálogo" onClick={onClose} size="icon" variant="ghost">
            <X className="size-5" />
          </Button>
        </div>

        <div id="help-description" className="mt-5 space-y-4 text-sm leading-6 text-text-secondary">
          <section className="rounded-xl border border-border bg-bg-card p-4">
            <h3 className="font-semibold text-text-primary">Bases numéricas</h3>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>
                <strong>Binário (base 2):</strong> usa apenas 0 e 1
              </li>
              <li>
                <strong>Ternário (base 3):</strong> usa dígitos de 0 a 2
              </li>
              <li>
                <strong>Quinário (base 5):</strong> usa dígitos de 0 a 4
              </li>
              <li>
                <strong>Setenário (base 7):</strong> usa dígitos de 0 a 6
              </li>
              <li>
                <strong>Octal (base 8):</strong> usa dígitos de 0 a 7
              </li>
              <li>
                <strong>Decimal (base 10):</strong> sistema que usamos no dia a dia
              </li>
              <li>
                <strong>Duodecimal (base 12):</strong> usa 0-9, A e B
              </li>
              <li>
                <strong>Hexadecimal (base 16):</strong> usa 0-9 e letras A-F
              </li>
              <li>
                <strong>Vigesimal (base 20):</strong> usa 0-9 e letras A-J
              </li>
              <li>
                <strong>Hexatrigesimal (base 36):</strong> usa 0-9 e letras A-Z
              </li>
            </ul>
          </section>

          <section className="rounded-xl border border-border bg-bg-card p-4">
            <h3 className="font-semibold text-text-primary">Métodos de conversão</h3>
            <div className="mt-2 space-y-2">
              <p>
                <strong>Para Decimal:</strong> cada dígito é multiplicado pela base elevada à sua posição (método polinomial).
              </p>
              <p>
                <strong>De Decimal:</strong> divide o número sucessivamente pela base nova, pegando os restos na ordem inversa.
              </p>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-bg-card p-4">
            <h3 className="font-semibold text-text-primary">Dicas</h3>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Use o botão ↔ para inverter as bases rapidamente</li>
              <li>O histórico salva automaticamente no navegador</li>
              <li>Clique em qualquer item do histórico para recarregar a conversão</li>
              <li>O passo a passo mostra cada operação matemática</li>
              <li>Pressione Escape para fechar esta janela</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
