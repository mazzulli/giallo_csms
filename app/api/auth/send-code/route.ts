import { NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { sendVerificationEmail } from "@/lib/email"

const sql = neon(process.env.DATABASE_URL!)

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Check if user exists
    const users = await sql`
      SELECT id, email FROM users WHERE LOWER(email) = ${normalizedEmail}
    `

    if (users.length === 0) {
      return NextResponse.json(
        { error: "Email not found" },
        { status: 404 }
      )
    }

    // Invalidate old codes
    await sql`
      UPDATE verification_codes 
      SET used = true 
      WHERE email = ${normalizedEmail} AND used = false
    `

    // Generate new OTP
    const code = generateOTP()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Save to database
    await sql`
      INSERT INTO verification_codes (id, email, code, "expiresAt", used, "createdAt")
      VALUES (gen_random_uuid()::text, ${normalizedEmail}, ${code}, ${expiresAt.toISOString()}, false, NOW())
    `

    // Send email
    const emailResult = await sendVerificationEmail(normalizedEmail, code)

    if (!emailResult.success) {
      // In development, log the code to console as fallback
      console.log(`[CSMS] Verification code for ${normalizedEmail}: ${code}`)
      return NextResponse.json({
        success: true,
        message: "Code generated (check console if email fails)",
        devCode: process.env.NODE_ENV === "development" ? code : undefined,
      })
    }

    return NextResponse.json({
      success: true,
      message: "Verification code sent to your email",
    })
  } catch (error) {
    console.error("Send code error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
