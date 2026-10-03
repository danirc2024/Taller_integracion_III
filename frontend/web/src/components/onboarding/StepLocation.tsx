"use client"

import { MapPin, LocateFixed, Info } from "lucide-react"

interface StepLocationProps {
  address: string
  onAddressChange: (value: string) => void
}

export function StepLocation({ address, onAddressChange }: StepLocationProps) {
  function useCurrentLocation() {
    if (!("geolocation" in navigator)) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        onAddressChange(`Ubicación actual (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`)
      },
      () => {
        onAddressChange("No pudimos obtener tu ubicación")
      },
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold tracking-tight text-foreground text-balance">Tu ubicación base</h2>
        <p className="text-muted-foreground leading-relaxed">
          Ingresa la dirección donde haces la mayoría de tus compras.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <label htmlFor="address" className="text-sm font-medium text-foreground">
          Dirección principal de compras
        </label>
        <div className="relative">
          <MapPin
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            id="address"
            type="text"
            value={address}
            onChange={(e) => onAddressChange(e.target.value)}
            placeholder="Av. Providencia 1234, Santiago"
            className="w-full rounded-xl border border-input bg-card py-3.5 pl-12 pr-4 text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10"
          />
        </div>

        <button
          type="button"
          onClick={useCurrentLocation}
          className="inline-flex w-fit items-center gap-2 rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm font-medium text-secondary-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <LocateFixed className="h-4 w-4" aria-hidden="true" />
          Usar mi ubicación actual
        </button>
      </div>

      <div className="flex items-start gap-2.5 rounded-xl bg-accent/60 p-4">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
        <p className="text-sm leading-relaxed text-accent-foreground">
          Necesitamos esto para calcular la ruta al supermercado más cercano.
        </p>
      </div>
    </div>
  )
}
