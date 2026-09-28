"use client"

import { User } from "lucide-react"
import { cn } from "@/lib/utils"

const AVATARS = [
  "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Felix",
  "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Aneka",
  "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Oliver",
  "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Jessica",
  "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Peanut",
  "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Milo"
]

interface StepProfileProps {
  name: string
  onNameChange: (value: string) => void
  avatarUrl: string
  onAvatarChange: (value: string) => void
}

export function StepProfile({ name, onNameChange, avatarUrl, onAvatarChange }: StepProfileProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold tracking-tight text-foreground text-balance">Crea tu Identidad</h2>
        <p className="text-muted-foreground leading-relaxed">
          Dinos cómo quieres llamarte y elige un avatar que te represente.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <label htmlFor="name" className="text-sm font-medium text-foreground">
          Nombre Completo
        </label>
        <div className="relative">
          <User
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Ej. Juan Pérez"
            className="w-full rounded-xl border border-input bg-card py-3.5 pl-12 pr-4 text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10"
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 mt-2">
        <label className="text-sm font-medium text-foreground">
          Selecciona tu Avatar
        </label>
        <div className="grid grid-cols-3 gap-3">
          {AVATARS.map((url) => (
            <button
              key={url}
              type="button"
              onClick={() => onAvatarChange(url)}
              className={cn(
                "relative flex aspect-square cursor-pointer items-center justify-center rounded-2xl border-2 p-2 transition-all hover:scale-105 active:scale-95",
                avatarUrl === url
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-transparent bg-secondary/50 hover:bg-secondary"
              )}
            >
              <img src={url} alt="Avatar option" className="w-full h-full object-contain" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
