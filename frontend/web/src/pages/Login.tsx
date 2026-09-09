import { AuthVisual } from "@/components/auth/auth-visual"
import { AuthPanel } from "@/components/auth/auth-panel"

export default function Page() {
  return (
    <main className="grid h-screen w-full grid-cols-1 overflow-hidden lg:grid-cols-2">
      <AuthVisual />
      <AuthPanel />
    </main>
  )
}
