"use client"

import { WheatOff, Leaf, PiggyBank, Zap, Milk, Salad } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface Tag {
  id: string
  label: string
  icon: LucideIcon
}

const TAGS: Tag[] = [
  { id: "sin-gluten", label: "Sin Gluten", icon: WheatOff },
  { id: "vegano", label: "Vegano", icon: Leaf },
  { id: "ahorro-maximo", label: "Ahorro Máximo", icon: PiggyBank },
  { id: "compras-express", label: "Compras Express", icon: Zap },
  { id: "sin-lactosa", label: "Sin Lactosa", icon: Milk },
  { id: "saludable", label: "Saludable", icon: Salad },
]

interface StepDietProps {
  selected: string[]
  onToggle: (id: string) => void
}

export function StepDiet({ selected, onToggle }: StepDietProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold tracking-tight text-foreground text-balance">Restricciones y dieta</h2>
          <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            Opcional
          </span>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          Ayúdanos a personalizar tus recomendaciones de recetas y ofertas.
        </p>
      </div>

      <div className="flex flex-wrap gap-2.5">
        {TAGS.map((tag) => {
          const isSelected = selected.includes(tag.id)
          const Icon = tag.icon
          return (
            <button
              key={tag.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onToggle(tag.id)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border-2 px-4 py-2.5 text-sm font-medium transition-all duration-200",
                isSelected
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-secondary",
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {tag.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
