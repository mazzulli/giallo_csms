-- NextAuth tables
CREATE TABLE IF NOT EXISTS "users" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "name" TEXT,
  "email" TEXT,
  "emailVerified" TIMESTAMP(3),
  "image" TEXT,
  "password" TEXT,
  "role" TEXT NOT NULL DEFAULT 'user',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");

CREATE TABLE IF NOT EXISTS "accounts" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  "refresh_token" TEXT,
  "access_token" TEXT,
  "expires_at" INTEGER,
  "token_type" TEXT,
  "scope" TEXT,
  "id_token" TEXT,
  "session_state" TEXT,
  CONSTRAINT "accounts_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

CREATE TABLE IF NOT EXISTS "sessions" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "sessionToken" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "expires" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "sessions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "sessions_sessionToken_key" ON "sessions"("sessionToken");

CREATE TABLE IF NOT EXISTS "verification_tokens" (
  "identifier" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "expires" TIMESTAMP(3) NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");
CREATE UNIQUE INDEX IF NOT EXISTS "verification_tokens_token_key" ON "verification_tokens"("token");

-- OTP Verification Code
CREATE TABLE IF NOT EXISTS "verification_codes" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "email" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "used" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "verification_codes_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "verification_codes_email_idx" ON "verification_codes"("email");

-- Charge Stations (OCPP 2.0.1)
CREATE TABLE IF NOT EXISTS "charge_stations" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "identity" TEXT NOT NULL,
  "vendor" TEXT NOT NULL,
  "model" TEXT NOT NULL,
  "serialNumber" TEXT,
  "firmwareVersion" TEXT,
  "ocppProtocol" TEXT NOT NULL DEFAULT 'ocpp2.0.1',
  "registrationStatus" TEXT NOT NULL DEFAULT 'Pending',
  "isOnline" BOOLEAN NOT NULL DEFAULT false,
  "lastHeartbeat" TIMESTAMP(3),
  "lastBootNotification" TIMESTAMP(3),
  "endpoint" TEXT,
  "latitude" DOUBLE PRECISION,
  "longitude" DOUBLE PRECISION,
  "address" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "charge_stations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "charge_stations_identity_key" ON "charge_stations"("identity");

-- EVSEs (Electric Vehicle Supply Equipment)
CREATE TABLE IF NOT EXISTS "evses" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "chargeStationId" TEXT NOT NULL,
  "evseId" INTEGER NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'Available',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "evses_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "evses_chargeStationId_fkey" FOREIGN KEY ("chargeStationId") REFERENCES "charge_stations"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "evses_chargeStationId_evseId_key" ON "evses"("chargeStationId", "evseId");

-- Connectors
CREATE TABLE IF NOT EXISTS "connectors" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "evseId" TEXT NOT NULL,
  "connectorId" INTEGER NOT NULL,
  "type" TEXT NOT NULL DEFAULT 'cType2',
  "status" TEXT NOT NULL DEFAULT 'Available',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "connectors_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "connectors_evseId_fkey" FOREIGN KEY ("evseId") REFERENCES "evses"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "connectors_evseId_connectorId_key" ON "connectors"("evseId", "connectorId");

-- Transactions
CREATE TABLE IF NOT EXISTS "transactions" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "transactionId" TEXT NOT NULL,
  "chargeStationId" TEXT NOT NULL,
  "evseId" TEXT,
  "connectorId" TEXT,
  "idToken" TEXT,
  "status" TEXT NOT NULL DEFAULT 'Started',
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "stoppedAt" TIMESTAMP(3),
  "meterStart" DOUBLE PRECISION DEFAULT 0,
  "meterStop" DOUBLE PRECISION,
  "energyDelivered" DOUBLE PRECISION DEFAULT 0,
  "reason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "transactions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "transactions_chargeStationId_fkey" FOREIGN KEY ("chargeStationId") REFERENCES "charge_stations"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "transactions_transactionId_key" ON "transactions"("transactionId");

-- OCPP Messages Log
CREATE TABLE IF NOT EXISTS "ocpp_messages" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "chargeStationId" TEXT NOT NULL,
  "messageId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "direction" TEXT NOT NULL,
  "payload" JSONB NOT NULL,
  "response" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ocpp_messages_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ocpp_messages_chargeStationId_fkey" FOREIGN KEY ("chargeStationId") REFERENCES "charge_stations"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "ocpp_messages_chargeStationId_idx" ON "ocpp_messages"("chargeStationId");
CREATE INDEX IF NOT EXISTS "ocpp_messages_action_idx" ON "ocpp_messages"("action");
