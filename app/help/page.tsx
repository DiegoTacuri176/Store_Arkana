import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"
import Link from "next/link"

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container py-16">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <h1 className="font-heading text-4xl font-bold md:text-5xl">Centro de Ayuda</h1>
            <p className="mt-4 text-lg text-muted-foreground">Encuentra respuestas a las preguntas más frecuentes</p>
          </div>

          <div className="mt-12 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Para Vendedores</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>¿Cómo publico mi primer trabajo?</AccordionTrigger>
                    <AccordionContent>
                      Para publicar tu primer trabajo, primero debes crear una cuenta como vendedor. Luego ve a tu
                      dashboard y haz clic en "Nuevo Trabajo". Completa el formulario con la información de tu trabajo,
                      sube imágenes de calidad y establece un precio justo. Tu trabajo será revisado por nuestro equipo
                      antes de ser publicado.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger>¿Cuánto tiempo tarda la aprobación?</AccordionTrigger>
                    <AccordionContent>
                      Nuestro equipo revisa las publicaciones en un plazo de 24-48 horas. Recibirás una notificación por
                      email cuando tu trabajo sea aprobado o si necesitamos que hagas algún ajuste.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3">
                    <AccordionTrigger>¿Cómo recibo mis pagos?</AccordionTrigger>
                    <AccordionContent>
                      Los pagos se procesan automáticamente después de cada venta. El dinero se deposita en tu cuenta
                      bancaria vinculada dentro de 3-5 días hábiles. Puedes configurar tu método de pago en la sección
                      de configuración de tu cuenta.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-4">
                    <AccordionTrigger>¿Qué comisión cobra la plataforma?</AccordionTrigger>
                    <AccordionContent>
                      Student Market cobra una comisión del 15% sobre cada venta. Esta comisión nos permite mantener la
                      plataforma, procesar pagos de forma segura y brindar soporte a nuestra comunidad.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Para Compradores</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>¿Cómo compro un trabajo?</AccordionTrigger>
                    <AccordionContent>
                      Navega por nuestro catálogo, encuentra el trabajo que te interesa y haz clic en "Agregar al
                      Carrito". Cuando estés listo, ve al carrito y completa el proceso de pago. Recibirás los archivos
                      digitales inmediatamente después de completar la compra.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger>¿Qué métodos de pago aceptan?</AccordionTrigger>
                    <AccordionContent>
                      Aceptamos tarjetas de crédito y débito (Visa, Mastercard, American Express), PayPal y
                      transferencias bancarias. Todos los pagos son procesados de forma segura a través de nuestros
                      proveedores de pago certificados.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3">
                    <AccordionTrigger>¿Puedo solicitar modificaciones?</AccordionTrigger>
                    <AccordionContent>
                      Puedes contactar directamente al vendedor a través de la sección de comentarios del trabajo para
                      discutir posibles modificaciones. Las modificaciones adicionales pueden tener un costo extra según
                      lo acuerdes con el vendedor.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-4">
                    <AccordionTrigger>¿Cuál es la política de reembolsos?</AccordionTrigger>
                    <AccordionContent>
                      Ofrecemos reembolsos completos si el trabajo no cumple con la descripción publicada o si hay
                      problemas técnicos con los archivos. Las solicitudes de reembolso deben hacerse dentro de los 7
                      días posteriores a la compra.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            <Card className="bg-muted">
              <CardContent className="flex flex-col items-center p-8 text-center">
                <MessageCircle className="h-12 w-12 text-primary" />
                <h3 className="mt-4 font-heading text-xl font-semibold">¿No encontraste lo que buscabas?</h3>
                <p className="mt-2 text-muted-foreground">Nuestro equipo de soporte está listo para ayudarte</p>
                <Button className="mt-4" asChild>
                  <Link href="/contact">Contactar Soporte</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
