"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface Chain {
  id: string
  name: string
  color: string
}

const CHAINS: Chain[] = [
  { id: "lider", name: "Líder", color: "oklch(0.55 0.2 250)" },
  { id: "jumbo", name: "Jumbo", color: "oklch(0.6 0.22 145)" },
  { id: "santa-isabel", name: "Santa Isabel", color: "oklch(0.62 0.2 25)" },
  { id: "unimarc", name: "Unimarc", color: "oklch(0.6 0.2 15)" },
  { id: "tottus", name: "Tottus", color: "oklch(0.62 0.2 40)" },
  { id: "acuenta", name: "aCuenta", color: "oklch(0.65 0.18 85)" },
]

interface StepSupermarketsProps {
  selected: string[]
  onToggle: (id: string) => void
}

export function StepSupermarkets({ selected, onToggle }: StepSupermarketsProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold tracking-tight text-foreground text-balance">Preferencias de supermercados</h2>
        <p className="text-muted-foreground leading-relaxed">¿Tienes preferencia por alguna cadena en particular?</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {CHAINS.map((chain) => {
          const isSelected = selected.includes(chain.id)
          return (
            <button
              key={chain.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onToggle(chain.id)}
              className={cn(
                "group relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 bg-card p-5 transition-all duration-200",
                isSelected
                  ? "border-primary shadow-md shadow-primary/10"
                  : "border-border hover:border-primary/40 hover:bg-secondary",
              )}
            >
              <span
                className={cn(
                  "absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground transition-all duration-200",
                  isSelected ? "scale-100 opacity-100" : "scale-50 opacity-0",
                )}
                aria-hidden="true"
              >
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>
              <span
                className="flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold text-white"
                style={{ backgroundColor: chain.color }}
                aria-hidden="true"
              >
                {chain.name.charAt(0)}
              </span>
              <span className="text-sm font-semibold text-foreground">{chain.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
