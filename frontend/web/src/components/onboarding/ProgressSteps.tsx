import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProgressStepsProps {
  steps: string[]
  current: number
}

export function ProgressSteps({ steps, current }: ProgressStepsProps) {
  return (
    <div className="flex items-center gap-2" aria-label={`Paso ${current + 1} de ${steps.length}`}>
      {steps.map((label, index) => {
        const isDone = index < current
        const isActive = index === current
        return (
          <div key={label} className="flex flex-1 items-center gap-2">
            <div className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all duration-300",
                  isDone && "border-primary bg-primary text-primary-foreground",
                  isActive && "border-primary bg-primary/10 text-primary",
                  !isDone && !isActive && "border-border bg-card text-muted-foreground",
                )}
              >
                {isDone ? <Check className="h-4 w-4" aria-hidden="true" /> : index + 1}
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className="relative h-0.5 flex-1 overflow-hidden rounded-full bg-border">
                <div
                  className={cn(
                    "absolute inset-y-0 left-0 rounded-full bg-primary transition-all duration-500",
                    isDone ? "w-full" : "w-0",
                  )}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
