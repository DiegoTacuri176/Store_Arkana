import { redirect } from "next/navigation"
import { Header } from "@/components/header"
import { AdminNav } from "@/components/admin-nav"
import { AdminSettingsForm } from "@/components/admin-settings-form"
import { getServerAuth } from "@/lib/auth"

export default async function AdminSettingsPage() {
  const user = await getServerAuth()

  if (!user || user.role !== "admin") {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container py-8">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold">Configuración del Sistema</h1>
          <p className="text-muted-foreground">Gestiona las configuraciones globales de la plataforma</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          <AdminNav />

          <div className="max-w-4xl">
            <AdminSettingsForm user={user} />
          </div>
        </div>
      </div>
    </div>
  )
}