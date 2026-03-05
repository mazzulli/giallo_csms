import { execSync } from "child_process"

// Run Prisma generate, push schema, and seed
console.log("Generating Prisma client...")
execSync("npx prisma generate", { stdio: "inherit", cwd: process.cwd() })

console.log("\nPushing schema to database...")
execSync("npx prisma db push --accept-data-loss", { stdio: "inherit", cwd: process.cwd() })

console.log("\nSeeding database...")
execSync("npx tsx prisma/seed.ts", { stdio: "inherit", cwd: process.cwd() })

console.log("\nDatabase setup complete!")
