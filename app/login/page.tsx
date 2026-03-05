"use client"

import { useState } from "react"
import { LoginEmailStep } from "@/components/auth/login-email-step"
import { LoginOtpStep } from "@/components/auth/login-otp-step"
import { ThemeToggle } from "@/components/theme-toggle"
import { Zap } from "lucide-react"

export default function LoginPage() {
  const [step, setStep] = useState<"email" | "otp">("email")
  const [email, setEmail] = useState("")
  const [userName, setUserName] = useState("")

  function handleEmailVerified(verifiedEmail: string, name: string) {
    setEmail(verifiedEmail)
    setUserName(name)
    setStep("otp")
  }

  function handleBackToEmail() {
    setStep("email")
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="flex items-center justify-center rounded-xl bg-primary p-3">
          <Zap className="h-8 w-8 text-primary-foreground" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">CSMS</h1>
          <p className="text-sm text-muted-foreground">
            Charge Station Management System
          </p>
        </div>
      </div>

      <div className="w-full max-w-sm">
        {step === "email" ? (
          <LoginEmailStep onVerified={handleEmailVerified} />
        ) : (
          <LoginOtpStep
            email={email}
            userName={userName}
            onBack={handleBackToEmail}
          />
        )}
      </div>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        OCPP 2.0.1 Compliant
      </p>
    </div>
  )
}
