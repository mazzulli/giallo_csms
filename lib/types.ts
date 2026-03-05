// OCPP 2.0.1 Types for CSMS

export interface ChargeStation {
  id: string
  identity: string
  vendor: string
  model: string
  serialNumber: string | null
  firmwareVersion: string | null
  ocppProtocol: string
  registrationStatus: "Pending" | "Accepted" | "Rejected"
  isOnline: boolean
  lastHeartbeat: string | null
  lastBootNotification: string | null
  endpoint: string | null
  latitude: number | null
  longitude: number | null
  address: string | null
  createdAt: string
  updatedAt: string
  evses?: Evse[]
}

export interface Evse {
  id: string
  chargeStationId: string
  evseId: number
  status: ConnectorStatus
  createdAt: string
  updatedAt: string
  connectors?: Connector[]
}

export interface Connector {
  id: string
  evseId: string
  connectorId: number
  type: ConnectorType
  status: ConnectorStatus
  createdAt: string
  updatedAt: string
}

export interface Transaction {
  id: string
  transactionId: string
  chargeStationId: string
  evseId: string | null
  connectorId: string | null
  idToken: string | null
  status: "Started" | "Updated" | "Ended"
  startedAt: string
  stoppedAt: string | null
  meterStart: number
  meterStop: number | null
  energyDelivered: number
  reason: string | null
  createdAt: string
  updatedAt: string
}

// OCPP 2.0.1 Enums
export type ConnectorStatus =
  | "Available"
  | "Occupied"
  | "Reserved"
  | "Unavailable"
  | "Faulted"

export type ConnectorType =
  | "Type1"
  | "Type2"
  | "CCS1"
  | "CCS2"
  | "CHAdeMO"
  | "cType2"

export type RegistrationStatus = "Accepted" | "Pending" | "Rejected"

// API response types
export interface StationsResponse {
  stations: ChargeStation[]
  total: number
  online: number
  offline: number
  faulted: number
  charging: number
}
