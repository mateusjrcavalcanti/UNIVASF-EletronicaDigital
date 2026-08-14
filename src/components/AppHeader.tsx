import { BookOpen, History } from "lucide-react";
import { Button } from "./ui/button";

interface AppHeaderProps {
  onToggleHistory: () => void;
  onToggleHelp: () => void;
  showHistory: boolean;
  showHelp: boolean;
  historyCount: number;
}

export function AppHeader({
  onToggleHistory,
  onToggleHelp,
  showHistory,
  showHelp,
  historyCount,
}: AppHeaderProps) {
  return (
    <header className="shrink-0 border-b border-border bg-bg-secondary">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:py-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-accent sm:text-sm sm:tracking-[0.18em]">
            Eletrônica Digital
          </p>
          <h1 className="mt-1 text-xl font-semibold leading-tight sm:text-2xl lg:text-3xl">
            Conversor de Bases
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            aria-label="Histórico"
            onClick={onToggleHistory}
            size="icon"
            title={`Histórico (${historyCount})`}
            aria-pressed={showHistory}
            variant={showHistory ? "default" : "secondary"}
          >
            <History className="size-4" />
            {historyCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
                {historyCount > 9 ? "9+" : historyCount}
              </span>
            )}
          </Button>

          <Button
            aria-label="Como funciona"
            onClick={onToggleHelp}
            size="icon"
            title="Como funciona"
            aria-pressed={showHelp}
            variant={showHelp ? "default" : "secondary"}
          >
            <BookOpen className="size-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
