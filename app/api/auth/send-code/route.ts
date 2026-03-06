import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { sendVerificationEmail } from "@/lib/email";

const prisma = new PrismaClient();

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Email not found" }, { status: 404 });
    }

    // Invalidate old codes
    await prisma.verificationCode.updateMany({
      where: { email: normalizedEmail, used: false },
      data: { used: true },
    });

    // Generate new OTP
    const code = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save to database
    await prisma.verificationCode.create({
      data: {
        email: normalizedEmail,
        code,
        expiresAt,
        used: false,
      },
    });

    // Send email
    const emailResult = await sendVerificationEmail(normalizedEmail, code);

    if (!emailResult.success) {
      // In development, log the code to console as fallback
      console.log(`[CSMS] Verification code for ${normalizedEmail}: ${code}`);
      return NextResponse.json({
        success: true,
        message: "Code generated (check console if email fails)",
        devCode: process.env.NODE_ENV === "development" ? code : undefined,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Verification code sent to your email",
    });
  } catch (error) {
    console.error("Send code error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
