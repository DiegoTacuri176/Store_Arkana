import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    // 1. Capturamos el userId opcional del formulario
    const userId = formData.get("userId") as string | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed." },
        { status: 400 },
      )
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File size exceeds 10MB limit" }, { status: 400 })
    }

    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    // Limpiamos el nombre del archivo de caracteres especiales
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "")
    
    // 2. Lógica para definir la ruta del archivo
    let filename = `${timestamp}-${random}-${sanitizedName}`
    
    if (userId) {
      // Si hay usuario, guardamos en: users/USER_ID/nombre_archivo.jpg
      filename = `users/${userId}/${filename}`
    } else {
      // Si no (ej. productos generales), guardamos en uploads/nombre_archivo.jpg
      filename = `uploads/${filename}`
    }

    const blob = await put(filename, file, {
      access: "public",
    })

    return NextResponse.json({
      url: blob.url,
    })
  } catch (error) {
    console.error("[v0] Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}