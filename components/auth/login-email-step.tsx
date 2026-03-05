"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Mail, ArrowRight, Loader2 } from "lucide-react"

interface LoginEmailStepProps {
  onVerified: (email: string, name: string) => void
}

export function LoginEmailStep({ onVerified }: LoginEmailStepProps) {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // Step 1: Verify email exists
      const verifyRes = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      })

      const verifyData = await verifyRes.json()

      if (!verifyRes.ok) {
        setError(verifyData.error || "Email nao encontrado no sistema")
        setIsLoading(false)
        return
      }

      // Step 2: Send OTP code
      const sendRes = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      })

      const sendData = await sendRes.json()

      if (!sendRes.ok) {
        setError(sendData.error || "Erro ao enviar codigo")
        setIsLoading(false)
        return
      }

      onVerified(email.trim().toLowerCase(), verifyData.userName || "")
    } catch {
      setError("Erro de conexao. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-border/50 bg-card shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-lg">Entrar no sistema</CardTitle>
        <CardDescription>
          Informe seu email cadastrado para receber o codigo de acesso
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
                autoFocus
                autoComplete="email"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive-foreground" role="alert">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={isLoading || !email.trim()}
            className="w-full"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="mr-2 h-4 w-4" />
            )}
            {isLoading ? "Verificando..." : "Continuar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
