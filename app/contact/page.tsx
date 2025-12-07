"use client"

import type React from "react"

import { useState } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Mail, MessageCircle, Phone } from "lucide-react"

export default function ContactPage() {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    await new Promise((resolve) => setTimeout(resolve, 1000))

    alert("Mensaje enviado exitosamente. Te responderemos pronto.")
    setFormData({ name: "", email: "", subject: "", message: "" })
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container py-16">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <h1 className="font-heading text-4xl font-bold md:text-5xl">Contáctanos</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Estamos aquí para ayudarte. Envíanos un mensaje y te responderemos pronto.
            </p>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-3">
            <div className="space-y-6">
              <Card>
                <CardContent className="flex flex-col items-center p-6 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mt-4 font-semibold">Email</h3>
                  <p className="mt-2 text-sm text-muted-foreground">support@studentmarket.com</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex flex-col items-center p-6 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <MessageCircle className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mt-4 font-semibold">Chat en Vivo</h3>
                  <p className="mt-2 text-sm text-muted-foreground">Lun - Vie, 9am - 6pm</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex flex-col items-center p-6 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mt-4 font-semibold">Teléfono</h3>
                  <p className="mt-2 text-sm text-muted-foreground">+1 (555) 123-4567</p>
                </CardContent>
              </Card>
            </div>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Envíanos un Mensaje</CardTitle>
                <CardDescription>Completa el formulario y te responderemos lo antes posible</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre</Label>
                      <Input
                        id="name"
                        placeholder="Tu nombre"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="tu@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Asunto</Label>
                    <Input
                      id="subject"
                      placeholder="¿En qué podemos ayudarte?"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Mensaje</Label>
                    <Textarea
                      id="message"
                      placeholder="Describe tu consulta o problema..."
                      rows={6}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Enviando..." : "Enviar Mensaje"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
