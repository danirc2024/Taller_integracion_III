"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowRight, Eye, EyeOff, Leaf, Lock, Mail } from "lucide-react"

import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/Field"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import { PasswordStrength } from "@/components/auth/PasswordStrength"
import { SocialButtons } from "@/components/auth/SocialButtons"

export function AuthPanel() {
  const [tab, setTab] = useState("login")
  const [showLoginPw, setShowLoginPw] = useState(false)
  const [showSignupPw, setShowSignupPw] = useState(false)
  const [signupPassword, setSignupPassword] = useState("")
  const navigate = useNavigate()

  const handleLogin = (e?: React.FormEvent) => {
    e?.preventDefault()
    navigate("/dashboard")
  }

  const handleSignup = (e?: React.FormEvent) => {
    e?.preventDefault()
    navigate("/onboarding")
  }

  return (
    <div className="flex h-full items-center justify-center overflow-y-auto bg-surface px-5 py-10 sm:px-8">
      <div className="w-full max-w-md">
        {/* Mobile brand */}
        <div className="mb-8 flex items-center justify-center gap-2.5 lg:hidden">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
            <Leaf className="size-5 text-primary" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight text-foreground">
            PrecioRuta
          </span>
        </div>

        <div className="rounded-3xl border border-border/60 bg-background p-6 shadow-xl sm:p-8">
          <Tabs value={tab} onValueChange={(v: string) => setTab(v)}>
            <TabsList className="mb-7 grid h-11 w-full grid-cols-2 rounded-xl bg-surface p-1">
              <TabsTrigger value="login" className="rounded-lg text-sm">
                Iniciar Sesión
              </TabsTrigger>
              <TabsTrigger value="signup" className="rounded-lg text-sm">
                Crear Cuenta
              </TabsTrigger>
            </TabsList>

            {/* LOGIN */}
            <TabsContent value="login">
              <div className="mb-6">
                <h2 className="font-display text-2xl font-bold tracking-tight text-foreground text-balance">
                  Bienvenido de nuevo
                </h2>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Accede para seguir ahorrando en tus compras.
                </p>
              </div>

              <form className="flex flex-col gap-5" onSubmit={handleLogin}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="login-email">Correo electrónico</FieldLabel>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="tu@correo.com"
                        autoComplete="email"
                        className="h-11 rounded-xl pl-10"
                      />
                    </div>
                  </Field>

                  <Field>
                    <div className="flex items-center justify-between">
                      <FieldLabel htmlFor="login-password">Contraseña</FieldLabel>
                      <a
                        href="#"
                        className="text-xs font-medium text-primary underline-offset-4 hover:underline"
                      >
                        ¿Olvidaste tu contraseña?
                      </a>
                    </div>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type={showLoginPw ? "text" : "password"}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        className="h-11 rounded-xl pr-10 pl-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPw((s) => !s)}
                        aria-label={showLoginPw ? "Ocultar contraseña" : "Mostrar contraseña"}
                        className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {showLoginPw ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                    </div>
                  </Field>
                </FieldGroup>

                <Button type="submit" className="h-11 w-full rounded-xl text-sm font-semibold">
                  Entrar
                  <ArrowRight data-icon="inline-end" />
                </Button>
              </form>

              <FieldSeparator className="my-6">O continuar con</FieldSeparator>
              <SocialButtons onClick={handleLogin} />
            </TabsContent>

            {/* SIGNUP */}
            <TabsContent value="signup">
              <div className="mb-6">
                <h2 className="font-display text-2xl font-bold tracking-tight text-foreground text-balance">
                  Crea tu cuenta gratis
                </h2>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Empieza a comparar precios en menos de un minuto.
                </p>
              </div>

              <form className="flex flex-col gap-5" onSubmit={handleSignup}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="signup-email">Correo electrónico</FieldLabel>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="tu@correo.com"
                        autoComplete="email"
                        className="h-11 rounded-xl pl-10"
                      />
                    </div>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="signup-password">Contraseña</FieldLabel>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type={showSignupPw ? "text" : "password"}
                        placeholder="Crea una contraseña segura"
                        autoComplete="new-password"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        className="h-11 rounded-xl pr-10 pl-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignupPw((s) => !s)}
                        aria-label={showSignupPw ? "Ocultar contraseña" : "Mostrar contraseña"}
                        className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {showSignupPw ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                    </div>
                    <div className="mt-1">
                      <PasswordStrength password={signupPassword} />
                    </div>
                  </Field>
                </FieldGroup>

                <Button type="submit" className="h-11 w-full rounded-xl text-sm font-semibold">
                  Registrarse
                  <ArrowRight data-icon="inline-end" />
                </Button>
              </form>

              <FieldSeparator className="my-6">O continuar con</FieldSeparator>
              <SocialButtons onClick={handleSignup} />

              <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground text-balance">
                Al crear una cuenta aceptas nuestros{" "}
                <a href="#" className="text-primary underline-offset-4 hover:underline">
                  Términos
                </a>{" "}
                y la{" "}
                <a href="#" className="text-primary underline-offset-4 hover:underline">
                  Política de Privacidad
                </a>
                .
              </p>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
