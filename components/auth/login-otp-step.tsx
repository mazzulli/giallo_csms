"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp"
import { ArrowLeft, Loader2, ShieldCheck } from "lucide-react"

interface LoginOtpStepProps {
  email: string
  userName: string
  onBack: () => void
}

export function LoginOtpStep({ email, userName, onBack }: LoginOtpStepProps) {
  const [code, setCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (code.length !== 6) return

    setError("")
    setIsLoading(true)

    try {
      const result = await signIn("otp-login", {
        email,
        code,
        redirect: false,
      })

      if (result?.error) {
        setError("Codigo invalido ou expirado. Tente novamente.")
        setCode("")
        setIsLoading(false)
        return
      }

      router.push("/dashboard")
    } catch {
      setError("Erro ao verificar codigo. Tente novamente.")
      setIsLoading(false)
    }
  }

  async function handleResend() {
    setIsResending(true)
    setError("")

    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (!res.ok) {
        setError("Erro ao reenviar codigo")
      }
    } catch {
      setError("Erro de conexao")
    } finally {
      setIsResending(false)
    }
  }

  async function handleCodeComplete(value: string) {
    setCode(value)
    if (value.length === 6) {
      setError("")
      setIsLoading(true)

      try {
        const result = await signIn("otp-login", {
          email,
          code: value,
          redirect: false,
        })

        if (result?.error) {
          setError("Codigo invalido ou expirado. Tente novamente.")
          setCode("")
          setIsLoading(false)
          return
        }

        router.push("/dashboard")
      } catch {
        setError("Erro ao verificar codigo. Tente novamente.")
        setIsLoading(false)
      }
    }
  }

  return (
    <Card className="border-border/50 bg-card shadow-lg">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <ShieldCheck className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-lg">Codigo de verificacao</CardTitle>
        <CardDescription>
          {userName ? `Ola, ${userName}! ` : ""}
          Enviamos um codigo de 6 digitos para{" "}
          <span className="font-medium text-foreground">{email}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
          <InputOTP
            maxLength={6}
            value={code}
            onChange={handleCodeComplete}
            autoFocus
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>

          {error && (
            <p className="text-sm text-destructive-foreground" role="alert">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={isLoading || code.length !== 6}
            className="w-full"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {isLoading ? "Verificando..." : "Entrar"}
          </Button>

          <div className="flex w-full items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-muted-foreground"
            >
              <ArrowLeft className="mr-1 h-3 w-3" />
              Voltar
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleResend}
              disabled={isResending}
              className="text-muted-foreground"
            >
              {isResending ? "Reenviando..." : "Reenviar codigo"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
