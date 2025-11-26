import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Users, Target, Heart, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container py-16">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <h1 className="font-heading text-4xl font-bold md:text-5xl text-balance">Sobre Store Arkana</h1>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              La plataforma que conecta el talento estudiantil con oportunidades reales
            </p>
          </div>

          <div className="mt-16 space-y-12">
            <Card>
              <CardContent className="p-8">
                <h2 className="font-heading text-2xl font-bold">Nuestra Misión</h2>
                <p className="mt-4 text-muted-foreground leading-relaxed">
                  Store Arkana nació con la visión de crear un espacio donde estudiantes creativos puedan mostrar su
                  talento, ganar experiencia real y generar ingresos mientras estudian. Creemos que el talento no
                  debería esperar hasta la graduación para ser reconocido y valorado.
                </p>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardContent className="flex flex-col items-center p-8 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="mt-4 font-heading text-xl font-semibold">Comunidad</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    Más de 500 estudiantes creativos de diferentes universidades compartiendo su trabajo
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex flex-col items-center p-8 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10">
                    <Target className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="mt-4 font-heading text-xl font-semibold">Oportunidades</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    Conectamos estudiantes con clientes que buscan trabajos creativos de calidad
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex flex-col items-center p-8 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10">
                    <Heart className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="mt-4 font-heading text-xl font-semibold">Apoyo</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    Brindamos herramientas y recursos para que los estudiantes crezcan profesionalmente
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex flex-col items-center p-8 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10">
                    <TrendingUp className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="mt-4 font-heading text-xl font-semibold">Crecimiento</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    Ayudamos a estudiantes a construir su portafolio y reputación profesional
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-primary text-primary-foreground">
              <CardContent className="p-8 text-center">
                <h2 className="font-heading text-2xl font-bold">¿Listo para comenzar?</h2>
                <p className="mt-2 text-lg opacity-90">Únete a nuestra comunidad de estudiantes creativos hoy mismo</p>
                <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:justify-center">
                  <Button size="lg" variant="secondary" asChild>
                    <Link href="/register">Crear Cuenta</Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-primary-foreground/20 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
                    asChild
                  >
                    <Link href="/explore">Explorar Trabajos</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
