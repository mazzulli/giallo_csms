import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Clean existing data
  await prisma.ocppMessage.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.connector.deleteMany();
  await prisma.evse.deleteMany();
  await prisma.chargeStation.deleteMany();
  await prisma.verificationCode.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.user.deleteMany();

  // Seed admin user
  const hashedPassword = await bcrypt.hash("info1978", 12);
  await prisma.user.create({
    data: {
      name: "Admin CSMS",
      email: "mazzulli.danilo@gmail.com",
      password: hashedPassword,
      role: "admin",
      emailVerified: new Date(),
    },
  });

  console.log("Admin user created.");

  // Seed Charge Stations
  const stations = [
    {
      identity: "INTELBRAS-001",
      name: "Intelbras Station Alpha",
      vendor: "Intelbras",
      model: "ICA 200",
      serialNumber: "INT-2024-001",
      firmwareVersion: "1.2.0",
      status: "ONLINE" as const,
      lastHeartbeat: new Date(),
      lastBootAt: new Date(Date.now() - 3600000),
      evses: [
        {
          evseId: 1,
          status: "AVAILABLE" as const,
          connectors: [
            {
              connectorId: 1,
              type: "Type2",
              maxPowerKw: 22.0,
              status: "AVAILABLE" as const,
            },
          ],
        },
      ],
    },
    {
      identity: "INTELBRAS-002",
      name: "Intelbras Station Beta",
      vendor: "Intelbras",
      model: "ICA 200",
      serialNumber: "INT-2024-002",
      firmwareVersion: "1.2.0",
      status: "OFFLINE" as const,
      evses: [
        {
          evseId: 1,
          status: "UNAVAILABLE" as const,
          connectors: [
            {
              connectorId: 1,
              type: "Type2",
              maxPowerKw: 22.0,
              status: "UNAVAILABLE" as const,
            },
          ],
        },
      ],
    },
    {
      identity: "WEG-001",
      name: "WEG Station Gamma",
      vendor: "WEG",
      model: "WEMOB 50",
      serialNumber: "WEG-2024-001",
      firmwareVersion: "2.1.0",
      status: "ONLINE" as const,
      lastHeartbeat: new Date(),
      lastBootAt: new Date(Date.now() - 7200000),
      evses: [
        {
          evseId: 1,
          status: "AVAILABLE" as const,
          connectors: [
            {
              connectorId: 1,
              type: "CCS2",
              maxPowerKw: 50.0,
              status: "AVAILABLE" as const,
            },
          ],
        },
        {
          evseId: 2,
          status: "OCCUPIED" as const,
          connectors: [
            {
              connectorId: 1,
              type: "Type2",
              maxPowerKw: 22.0,
              status: "OCCUPIED" as const,
            },
          ],
        },
      ],
    },
    {
      identity: "WEG-002",
      name: "WEG Station Delta",
      vendor: "WEG",
      model: "WEMOB 150",
      serialNumber: "WEG-2024-002",
      firmwareVersion: "2.3.0",
      status: "ONLINE" as const,
      lastHeartbeat: new Date(),
      lastBootAt: new Date(Date.now() - 1800000),
      evses: [
        {
          evseId: 1,
          status: "AVAILABLE" as const,
          connectors: [
            {
              connectorId: 1,
              type: "CCS2",
              maxPowerKw: 150.0,
              status: "AVAILABLE" as const,
            },
          ],
        },
        {
          evseId: 2,
          status: "AVAILABLE" as const,
          connectors: [
            {
              connectorId: 1,
              type: "CHAdeMO",
              maxPowerKw: 50.0,
              status: "AVAILABLE" as const,
            },
          ],
        },
      ],
    },
    {
      identity: "ABB-001",
      name: "ABB Station Epsilon",
      vendor: "ABB",
      model: "Terra AC W22-T-RD-M-0",
      serialNumber: "ABB-2024-001",
      firmwareVersion: "3.0.1",
      status: "FAULTED" as const,
      lastHeartbeat: new Date(Date.now() - 86400000),
      lastBootAt: new Date(Date.now() - 172800000),
      evses: [
        {
          evseId: 1,
          status: "FAULTED" as const,
          connectors: [
            {
              connectorId: 1,
              type: "Type2",
              maxPowerKw: 22.0,
              status: "FAULTED" as const,
            },
          ],
        },
      ],
    },
    {
      identity: "ABB-002",
      name: "ABB Station Zeta",
      vendor: "ABB",
      model: "Terra DC 184",
      serialNumber: "ABB-2024-002",
      firmwareVersion: "3.2.0",
      status: "ONLINE" as const,
      lastHeartbeat: new Date(),
      lastBootAt: new Date(Date.now() - 600000),
      evses: [
        {
          evseId: 1,
          status: "AVAILABLE" as const,
          connectors: [
            {
              connectorId: 1,
              type: "CCS2",
              maxPowerKw: 180.0,
              status: "AVAILABLE" as const,
            },
          ],
        },
        {
          evseId: 2,
          status: "AVAILABLE" as const,
          connectors: [
            {
              connectorId: 1,
              type: "CHAdeMO",
              maxPowerKw: 50.0,
              status: "AVAILABLE" as const,
            },
          ],
        },
      ],
    },
  ];

  for (const station of stations) {
    const { evses, ...stationData } = station;
    const created = await prisma.chargeStation.create({
      data: stationData,
    });

    for (const evse of evses) {
      const { connectors, ...evseData } = evse;
      const createdEvse = await prisma.evse.create({
        data: {
          ...evseData,
          chargeStationId: created.id,
        },
      });

      for (const connector of connectors) {
        await prisma.connector.create({
          data: {
            ...connector,
            evseId: createdEvse.id,
          },
        });
      }
    }

    console.log(`Created station: ${station.name} (${station.identity})`);
  }

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
