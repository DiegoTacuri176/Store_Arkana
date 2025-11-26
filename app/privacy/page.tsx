import { Header } from "@/components/header"
import { Card, CardContent } from "@/components/ui/card"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container py-16">
        <div className="mx-auto max-w-4xl">
          <h1 className="font-heading text-4xl font-bold md:text-5xl">Política de Privacidad</h1>
          <p className="mt-4 text-muted-foreground">Última actualización: Enero 2025</p>

          <div className="mt-12 space-y-8">
            <Card>
              <CardContent className="prose prose-gray max-w-none p-8 dark:prose-invert">
                <h2>1. Información que Recopilamos</h2>
                <p>Recopilamos diferentes tipos de información para proporcionar y mejorar nuestro servicio:</p>

                <h3>Información Personal</h3>
                <ul>
                  <li>Nombre completo</li>
                  <li>Dirección de correo electrónico</li>
                  <li>Información de pago</li>
                  <li>Universidad y carrera (opcional)</li>
                  <li>Fotografía de perfil (opcional)</li>
                </ul>

                <h3>Información de Uso</h3>
                <ul>
                  <li>Páginas visitadas</li>
                  <li>Tiempo de permanencia en la plataforma</li>
                  <li>Trabajos visualizados y comprados</li>
                  <li>Interacciones con otros usuarios</li>
                </ul>

                <h2>2. Cómo Utilizamos tu Información</h2>
                <p>Utilizamos la información recopilada para:</p>
                <ul>
                  <li>Proporcionar y mantener nuestro servicio</li>
                  <li>Procesar transacciones y pagos</li>
                  <li>Enviar notificaciones sobre tu cuenta y actividad</li>
                  <li>Mejorar la experiencia del usuario</li>
                  <li>Detectar y prevenir fraudes</li>
                  <li>Cumplir con obligaciones legales</li>
                </ul>

                <h2>3. Compartir Información</h2>
                <p>No vendemos tu información personal. Podemos compartir tu información con:</p>
                <ul>
                  <li>Proveedores de servicios que nos ayudan a operar la plataforma</li>
                  <li>Procesadores de pago para completar transacciones</li>
                  <li>Autoridades legales cuando sea requerido por ley</li>
                </ul>

                <h2>4. Seguridad de los Datos</h2>
                <p>
                  Implementamos medidas de seguridad técnicas y organizativas para proteger tu información personal
                  contra acceso no autorizado, alteración, divulgación o destrucción.
                </p>

                <h2>5. Cookies y Tecnologías Similares</h2>
                <p>
                  Utilizamos cookies y tecnologías similares para mejorar tu experiencia, analizar el uso de la
                  plataforma y personalizar el contenido. Puedes controlar el uso de cookies a través de la
                  configuración de tu navegador.
                </p>

                <h2>6. Tus Derechos</h2>
                <p>Tienes derecho a:</p>
                <ul>
                  <li>Acceder a tu información personal</li>
                  <li>Corregir información inexacta</li>
                  <li>Solicitar la eliminación de tu información</li>
                  <li>Oponerte al procesamiento de tu información</li>
                  <li>Solicitar la portabilidad de tus datos</li>
                  <li>Retirar tu consentimiento en cualquier momento</li>
                </ul>

                <h2>7. Retención de Datos</h2>
                <p>
                  Conservamos tu información personal solo durante el tiempo necesario para cumplir con los propósitos
                  descritos en esta política, a menos que la ley requiera o permita un período de retención más largo.
                </p>

                <h2>8. Privacidad de Menores</h2>
                <p>
                  Nuestro servicio no está dirigido a menores de 18 años. No recopilamos intencionalmente información
                  personal de menores sin el consentimiento de sus padres o tutores.
                </p>

                <h2>9. Cambios a esta Política</h2>
                <p>
                  Podemos actualizar nuestra política de privacidad periódicamente. Te notificaremos sobre cualquier
                  cambio publicando la nueva política en esta página y actualizando la fecha de "última actualización".
                </p>

                <h2>10. Contacto</h2>
                <p>Si tienes preguntas sobre esta política de privacidad, contáctanos en: privacy@studentmarket.com</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
