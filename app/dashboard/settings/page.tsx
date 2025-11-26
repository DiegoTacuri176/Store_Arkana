import { redirect } from "next/navigation"
import { Header } from "@/components/header"
import { DashboardNav } from "@/components/dashboard-nav"
import { SettingsForm } from "@/components/settings-form"
import { getServerAuth } from "@/lib/auth"

export default async function SettingsPage() {
  const user = await getServerAuth()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container py-8 px-12">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold">Configuración</h1>
          <p className="text-muted-foreground">Gestiona las preferencias de tu cuenta</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          <DashboardNav />

          <div className="max-w-2xl">
            <SettingsForm user={user} />
          </div>
        </div>
      </div>
    </div>
  )
}
