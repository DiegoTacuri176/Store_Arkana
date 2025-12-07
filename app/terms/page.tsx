import { Header } from "@/components/header"
import { Card, CardContent } from "@/components/ui/card"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container py-16">
        <div className="mx-auto max-w-4xl">
          <h1 className="font-heading text-4xl font-bold md:text-5xl">Términos y Condiciones</h1>
          <p className="mt-4 text-muted-foreground">Última actualización: Enero 2025</p>

          <div className="mt-12 space-y-8">
            <Card>
              <CardContent className="prose prose-gray max-w-none p-8 dark:prose-invert">
                <h2>1. Aceptación de los Términos</h2>
                <p>
                  Al acceder y utilizar Student Market, aceptas estar sujeto a estos términos y condiciones. Si no estás
                  de acuerdo con alguna parte de estos términos, no debes utilizar nuestra plataforma.
                </p>

                <h2>2. Descripción del Servicio</h2>
                <p>
                  Student Market es una plataforma que conecta estudiantes creativos con compradores interesados en
                  adquirir trabajos creativos. Facilitamos las transacciones pero no somos parte de los acuerdos entre
                  compradores y vendedores.
                </p>

                <h2>3. Registro de Cuenta</h2>
                <p>Para utilizar ciertas funciones de la plataforma, debes:</p>
                <ul>
                  <li>Proporcionar información precisa y completa</li>
                  <li>Mantener la seguridad de tu contraseña</li>
                  <li>Ser mayor de 18 años o tener el consentimiento de un tutor legal</li>
                  <li>Notificarnos inmediatamente sobre cualquier uso no autorizado de tu cuenta</li>
                </ul>

                <h2>4. Responsabilidades del Vendedor</h2>
                <p>Como vendedor en Student Market, te comprometes a:</p>
                <ul>
                  <li>Publicar solo trabajos originales o para los que tengas los derechos necesarios</li>
                  <li>Proporcionar descripciones precisas de tus trabajos</li>
                  <li>Entregar los archivos según lo prometido</li>
                  <li>Responder a las consultas de los compradores de manera oportuna</li>
                  <li>Cumplir con todas las leyes aplicables de propiedad intelectual</li>
                </ul>

                <h2>5. Responsabilidades del Comprador</h2>
                <p>Como comprador en Student Market, te comprometes a:</p>
                <ul>
                  <li>Utilizar los trabajos adquiridos de acuerdo con los términos de licencia</li>
                  <li>No redistribuir o revender los trabajos sin autorización</li>
                  <li>Respetar los derechos de propiedad intelectual de los vendedores</li>
                  <li>Proporcionar información de pago válida</li>
                </ul>

                <h2>6. Pagos y Comisiones</h2>
                <p>
                  Student Market cobra una comisión del 15% sobre cada venta. Los pagos se procesan a través de
                  proveedores de pago externos seguros. Los vendedores recibirán sus pagos dentro de 3-5 días hábiles
                  después de cada venta.
                </p>

                <h2>7. Propiedad Intelectual</h2>
                <p>
                  Los vendedores retienen todos los derechos de propiedad intelectual sobre sus trabajos. Al comprar un
                  trabajo, el comprador recibe una licencia de uso según los términos especificados en la publicación.
                </p>

                <h2>8. Política de Reembolsos</h2>
                <p>
                  Ofrecemos reembolsos en casos donde el trabajo no cumple con la descripción publicada o hay problemas
                  técnicos con los archivos. Las solicitudes deben hacerse dentro de los 7 días posteriores a la compra.
                </p>

                <h2>9. Limitación de Responsabilidad</h2>
                <p>
                  Student Market no se hace responsable por disputas entre compradores y vendedores, la calidad de los
                  trabajos, o cualquier daño indirecto resultante del uso de la plataforma.
                </p>

                <h2>10. Modificaciones</h2>
                <p>
                  Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios entrarán en
                  vigor inmediatamente después de su publicación en la plataforma.
                </p>

                <h2>11. Contacto</h2>
                <p>Si tienes preguntas sobre estos términos, contáctanos en: legal@studentmarket.com</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
