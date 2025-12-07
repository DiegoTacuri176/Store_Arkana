"use client"

export class CookieService {
  static set(name: string, value: string, days = 7): void {
    if (typeof window === "undefined") return

    const expires = new Date()
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)

    const secureFlag = process.env.NODE_ENV === "production" ? ";Secure" : ""

    document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Lax${secureFlag}`
  }

  static get(name: string): string | null {
    if (typeof window === "undefined") return null

    const nameEQ = name + "="
    const cookies = document.cookie.split(";")

    for (let i = 0; i < cookies.length; i++) {
      let cookie = cookies[i]
      while (cookie.charAt(0) === " ") {
        cookie = cookie.substring(1, cookie.length)
      }
      if (cookie.indexOf(nameEQ) === 0) {
        return decodeURIComponent(cookie.substring(nameEQ.length, cookie.length))
      }
    }
    return null
  }

  static remove(name: string): void {
    if (typeof window === "undefined") return

    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Lax`
  }

  static getJSON<T>(name: string): T | null {
    const value = this.get(name)
    if (!value) return null

    try {
      return JSON.parse(value) as T
    } catch {
      return null
    }
  }

  static setJSON(name: string, value: unknown, days = 7): void {
    this.set(name, JSON.stringify(value), days)
  }
}
