import { NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

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

    // Check if user exists in database
    const users = await sql`
      SELECT id, email, name FROM users WHERE LOWER(email) = ${normalizedEmail}
    `

    if (users.length === 0) {
      return NextResponse.json(
        { error: "Email not found in the system" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Email verified",
      userName: users[0].name,
    })
  } catch (error) {
    console.error("Verify email error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
