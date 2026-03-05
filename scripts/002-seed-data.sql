-- Seed data: Admin user and 6 charge stations (2x Intelbras, 2x WEG, 2x ABB)
-- Admin password: admin123 (bcrypt hash)

INSERT INTO users (id, name, email, "emailVerified", password, role, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'Admin CSMS',
  'admin@csms.com',
  NOW(),
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  'ADMIN',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Intelbras Station 1 - Online
INSERT INTO charge_stations (id, identity, vendor, model, "serialNumber", "firmwareVersion", "registrationStatus", "isOnline", "lastHeartbeat", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'INTELBRAS-EVC-01',
  'Intelbras',
  'EVC 30',
  'INT-2024-001',
  '1.2.0',
  'Accepted',
  true,
  NOW() - INTERVAL '30 seconds',
  NOW(),
  NOW()
)
ON CONFLICT (identity) DO NOTHING;

INSERT INTO evses (id, "evseId", "chargeStationId", status, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  1,
  (SELECT id FROM charge_stations WHERE identity = 'INTELBRAS-EVC-01'),
  'Available',
  NOW(),
  NOW()
)
ON CONFLICT ("chargeStationId", "evseId") DO NOTHING;

INSERT INTO connectors (id, "connectorId", "evseId", type, status, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  1,
  (SELECT id FROM evses WHERE "chargeStationId" = (SELECT id FROM charge_stations WHERE identity = 'INTELBRAS-EVC-01') AND "evseId" = 1),
  'Type2',
  'Available',
  NOW(),
  NOW()
)
ON CONFLICT ("evseId", "connectorId") DO NOTHING;

-- Intelbras Station 2 - Offline
INSERT INTO charge_stations (id, identity, vendor, model, "serialNumber", "firmwareVersion", "registrationStatus", "isOnline", "lastHeartbeat", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'INTELBRAS-EVC-02',
  'Intelbras',
  'EVC 22',
  'INT-2024-002',
  '1.1.5',
  'Accepted',
  false,
  NOW() - INTERVAL '2 hours',
  NOW(),
  NOW()
)
ON CONFLICT (identity) DO NOTHING;

INSERT INTO evses (id, "evseId", "chargeStationId", status, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  1,
  (SELECT id FROM charge_stations WHERE identity = 'INTELBRAS-EVC-02'),
  'Unavailable',
  NOW(),
  NOW()
)
ON CONFLICT ("chargeStationId", "evseId") DO NOTHING;

INSERT INTO connectors (id, "connectorId", "evseId", type, status, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  1,
  (SELECT id FROM evses WHERE "chargeStationId" = (SELECT id FROM charge_stations WHERE identity = 'INTELBRAS-EVC-02') AND "evseId" = 1),
  'Type2',
  'Unavailable',
  NOW(),
  NOW()
)
ON CONFLICT ("evseId", "connectorId") DO NOTHING;

-- WEG Station 1 - Online / Charging
INSERT INTO charge_stations (id, identity, vendor, model, "serialNumber", "firmwareVersion", "registrationStatus", "isOnline", "lastHeartbeat", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'WEG-WEMOB-01',
  'WEG',
  'WEMOB AC 22kW',
  'WEG-2024-001',
  '2.0.3',
  'Accepted',
  true,
  NOW() - INTERVAL '15 seconds',
  NOW(),
  NOW()
)
ON CONFLICT (identity) DO NOTHING;

INSERT INTO evses (id, "evseId", "chargeStationId", status, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  1,
  (SELECT id FROM charge_stations WHERE identity = 'WEG-WEMOB-01'),
  'Occupied',
  NOW(),
  NOW()
)
ON CONFLICT ("chargeStationId", "evseId") DO NOTHING;

INSERT INTO connectors (id, "connectorId", "evseId", type, status, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  1,
  (SELECT id FROM evses WHERE "chargeStationId" = (SELECT id FROM charge_stations WHERE identity = 'WEG-WEMOB-01') AND "evseId" = 1),
  'CCS2',
  'Occupied',
  NOW(),
  NOW()
)
ON CONFLICT ("evseId", "connectorId") DO NOTHING;

-- WEG Station 2 - Online
INSERT INTO charge_stations (id, identity, vendor, model, "serialNumber", "firmwareVersion", "registrationStatus", "isOnline", "lastHeartbeat", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'WEG-WEMOB-02',
  'WEG',
  'WEMOB DC 60kW',
  'WEG-2024-002',
  '2.1.0',
  'Accepted',
  true,
  NOW() - INTERVAL '45 seconds',
  NOW(),
  NOW()
)
ON CONFLICT (identity) DO NOTHING;

INSERT INTO evses (id, "evseId", "chargeStationId", status, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  1,
  (SELECT id FROM charge_stations WHERE identity = 'WEG-WEMOB-02'),
  'Available',
  NOW(),
  NOW()
)
ON CONFLICT ("chargeStationId", "evseId") DO NOTHING;

INSERT INTO connectors (id, "connectorId", "evseId", type, status, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  1,
  (SELECT id FROM evses WHERE "chargeStationId" = (SELECT id FROM charge_stations WHERE identity = 'WEG-WEMOB-02') AND "evseId" = 1),
  'CCS2',
  'Available',
  NOW(),
  NOW()
)
ON CONFLICT ("evseId", "connectorId") DO NOTHING;

-- ABB Station 1 - Online
INSERT INTO charge_stations (id, identity, vendor, model, "serialNumber", "firmwareVersion", "registrationStatus", "isOnline", "lastHeartbeat", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'ABB-TERRA-01',
  'ABB',
  'Terra AC W22-T-0',
  'ABB-2024-001',
  '3.0.1',
  'Accepted',
  true,
  NOW() - INTERVAL '20 seconds',
  NOW(),
  NOW()
)
ON CONFLICT (identity) DO NOTHING;

INSERT INTO evses (id, "evseId", "chargeStationId", status, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  1,
  (SELECT id FROM charge_stations WHERE identity = 'ABB-TERRA-01'),
  'Available',
  NOW(),
  NOW()
)
ON CONFLICT ("chargeStationId", "evseId") DO NOTHING;

INSERT INTO connectors (id, "connectorId", "evseId", type, status, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  1,
  (SELECT id FROM evses WHERE "chargeStationId" = (SELECT id FROM charge_stations WHERE identity = 'ABB-TERRA-01') AND "evseId" = 1),
  'Type2',
  'Available',
  NOW(),
  NOW()
)
ON CONFLICT ("evseId", "connectorId") DO NOTHING;

-- ABB Station 2 - Faulted
INSERT INTO charge_stations (id, identity, vendor, model, "serialNumber", "firmwareVersion", "registrationStatus", "isOnline", "lastHeartbeat", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'ABB-TERRA-02',
  'ABB',
  'Terra DC 180kW',
  'ABB-2024-002',
  '3.1.0',
  'Accepted',
  false,
  NOW() - INTERVAL '30 minutes',
  NOW(),
  NOW()
)
ON CONFLICT (identity) DO NOTHING;

INSERT INTO evses (id, "evseId", "chargeStationId", status, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  1,
  (SELECT id FROM charge_stations WHERE identity = 'ABB-TERRA-02'),
  'Faulted',
  NOW(),
  NOW()
)
ON CONFLICT ("chargeStationId", "evseId") DO NOTHING;

INSERT INTO connectors (id, "connectorId", "evseId", type, status, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  1,
  (SELECT id FROM evses WHERE "chargeStationId" = (SELECT id FROM charge_stations WHERE identity = 'ABB-TERRA-02') AND "evseId" = 1),
  'CCS2',
  'Faulted',
  NOW(),
  NOW()
)
ON CONFLICT ("evseId", "connectorId") DO NOTHING;
