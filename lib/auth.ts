import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export const { handlers, signIn, signOut, auth } = NextAuth({
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  providers: [
    Credentials({
      id: "otp-login",
      name: "OTP Login",
      credentials: {
        email: { label: "Email", type: "email" },
        code: { label: "Verification Code", type: "text" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string
        const code = credentials?.code as string

        if (!email || !code) return null

        // Verify the OTP code
        const codes = await sql`
          SELECT * FROM verification_codes 
          WHERE email = ${email} 
            AND code = ${code} 
            AND used = false 
            AND "expiresAt" > NOW()
          ORDER BY "createdAt" DESC
          LIMIT 1
        `

        if (codes.length === 0) return null

        // Mark code as used
        await sql`
          UPDATE verification_codes 
          SET used = true 
          WHERE id = ${codes[0].id}
        `

        // Get the user
        const users = await sql`
          SELECT id, name, email, role, image 
          FROM users 
          WHERE email = ${email}
        `

        if (users.length === 0) return null

        const user = users[0]
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role?: string }).role ?? "user"
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        ;(session.user as { role?: string }).role = token.role as string
      }
      return session
    },
    authorized({ auth: authSession, request: { nextUrl } }) {
      const isLoggedIn = !!authSession?.user
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard")
      const isOnLogin = nextUrl.pathname === "/login"

      if (isOnDashboard) {
        if (isLoggedIn) return true
        return false // Redirect to login
      }

      if (isOnLogin && isLoggedIn) {
        return Response.redirect(new URL("/dashboard", nextUrl))
      }

      return true
    },
  },
})
