import { redirect } from "next/navigation"
import { Header } from "@/components/header"
import { DashboardNav } from "@/components/dashboard-nav"
import { ProfileForm } from "@/components/profile-form"
import { getServerAuth } from "@/lib/auth"

export default async function ProfilePage() {
  const user = await getServerAuth()

  if (!user) {
    redirect("/login")
  }

  console.log(user)

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container py-8 px-12">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold">Mi Perfil</h1>
          <p className="text-muted-foreground">Gestiona tu información personal</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          <DashboardNav userRole={user.role} />

          <div className="max-w-2xl">
            <ProfileForm user={user} />
          </div>
        </div>
      </div>
    </div>
  )
}
