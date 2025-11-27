'use client'
import { Button } from "@/components/ui/button";
import { AuthService } from "@/lib/auth";
import Link from "next/link";

export function SeccionPageLayout() {

   const user = AuthService.getCurrentUser();
 

  return (
    <>
        {
        user == null &&    
        <section className="border-t py-16">
        <div className="container">
          <div className="mx-auto max-w-2xl rounded-2xl bg-primary p-8 text-center text-primary-foreground md:p-12">
            <h2 className="font-heading text-3xl font-bold">
              ¿Eres estudiante creativo?
            </h2>
            <p className="mt-4 text-lg opacity-90">
              Únete a nuestra comunidad y comienza a vender tus trabajos hoy
              mismo
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/register">Crear Cuenta Gratis</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground/20 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
                asChild
              >
                <Link href="/about">Conocer Más</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>}
    </>
  );
}