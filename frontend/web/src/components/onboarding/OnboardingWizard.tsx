"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, ArrowRight, ShoppingCart, PartyPopper } from "lucide-react"
import { ProgressSteps } from "./ProgressSteps"
import { StepLocation } from "./StepLocation"
import { StepSupermarkets } from "./StepSupermarkets"
import { StepDiet } from "./StepDiet"
import { cn } from "@/lib/utils"

const STEPS = ["Ubicación", "Supermercados", "Dieta"]

export function OnboardingWizard() {
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState<"forward" | "back">("forward")
  const [finished, setFinished] = useState(false)
  const navigate = useNavigate()

  const [address, setAddress] = useState("")
  const [chains, setChains] = useState<string[]>([])
  const [diet, setDiet] = useState<string[]>([])

  function toggle(list: string[], setList: (v: string[]) => void, id: string) {
    setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id])
  }

  function next() {
    if (step < STEPS.length - 1) {
      setDirection("forward")
      setStep((s) => s + 1)
    } else {
      setFinished(true)
    }
  }

  function back() {
    if (step > 0) {
      setDirection("back")
      setStep((s) => s - 1)
    }
  }

  const isLast = step === STEPS.length - 1

  return (
    <div className="w-full max-w-xl">
      <div className="mb-6 flex items-center justify-center gap-2 text-primary">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <ShoppingCart className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="text-lg font-bold tracking-tight text-foreground">SuperAhorro</span>
      </div>

      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-lg shadow-black/5">
        {finished ? (
          <div className="flex flex-col items-center gap-4 px-8 py-16 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <PartyPopper className="h-8 w-8" aria-hidden="true" />
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-foreground text-balance">¡Todo listo!</h2>
            <p className="max-w-sm text-muted-foreground leading-relaxed text-pretty">
              Configuramos tu perfil. Ya puedes empezar a ahorrar en cada compra con recomendaciones hechas para ti.
            </p>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="mt-4 inline-flex items-center justify-center rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:brightness-105 active:scale-[0.98]"
            >
              Ir al Dashboard
            </button>
          </div>
        ) : (
          <>
            <div className="border-b border-border px-6 py-6 sm:px-8">
              <p className="mb-4 text-sm font-medium text-muted-foreground">
                Paso {step + 1} de {STEPS.length}
              </p>
              <ProgressSteps steps={STEPS} current={step} />
            </div>

            <div className="relative px-6 py-8 sm:px-8">
              <div
                key={step}
                className={cn(
                  "duration-300 ease-out",
                  direction === "forward" ? "animate-in fade-in slide-in-from-right-6" : "animate-in fade-in slide-in-from-left-6",
                )}
              >
                {step === 0 && <StepLocation address={address} onAddressChange={setAddress} />}
                {step === 1 && (
                  <StepSupermarkets selected={chains} onToggle={(id) => toggle(chains, setChains, id)} />
                )}
                {step === 2 && <StepDiet selected={diet} onToggle={(id) => toggle(diet, setDiet, id)} />}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-border px-6 py-5 sm:px-8">
              <button
                type="button"
                onClick={back}
                disabled={step === 0}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:pointer-events-none disabled:opacity-0"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Atrás
              </button>

              <button
                type="button"
                onClick={next}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:brightness-105 active:scale-[0.98]"
              >
                {isLast ? "Finalizar" : "Siguiente"}
                {!isLast && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
