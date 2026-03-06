// OCPP 2.0.1 Message Types

// OCPP RPC Message Types
export const CALL = 2;
export const CALL_RESULT = 3;
export const CALL_ERROR = 4;

export type OcppCall = [typeof CALL, string, string, Record<string, unknown>];
export type OcppCallResult = [
  typeof CALL_RESULT,
  string,
  Record<string, unknown>,
];
export type OcppCallError = [
  typeof CALL_ERROR,
  string,
  string,
  string,
  Record<string, unknown>,
];
export type OcppMessage = OcppCall | OcppCallResult | OcppCallError;

// OCPP 2.0.1 Actions (CS -> CSMS)
export type CsTocsmsAction =
  | "BootNotification"
  | "Heartbeat"
  | "StatusNotification"
  | "Authorize"
  | "TransactionEvent"
  | "MeterValues"
  | "NotifyReport"
  | "FirmwareStatusNotification"
  | "SecurityEventNotification";

// OCPP 2.0.1 Actions (CSMS -> CS)
export type CsmsToCsAction =
  | "RequestStartTransaction"
  | "RequestStopTransaction"
  | "Reset"
  | "ChangeAvailability"
  | "GetVariables"
  | "SetVariables"
  | "TriggerMessage"
  | "UnlockConnector";

// BootNotification
export interface BootNotificationRequest {
  chargingStation: {
    model: string;
    vendorName: string;
    serialNumber?: string;
    firmwareVersion?: string;
  };
  reason:
    | "PowerUp"
    | "ApplicationReset"
    | "FirmwareUpdate"
    | "RemoteReset"
    | "Triggered"
    | "Unknown"
    | "Watchdog";
}

export interface BootNotificationResponse {
  currentTime: string;
  interval: number;
  status: "Accepted" | "Pending" | "Rejected";
}

// Heartbeat
export interface HeartbeatRequest {
  // Empty for OCPP 2.0.1
}

export interface HeartbeatResponse {
  currentTime: string;
}

// StatusNotification
export interface StatusNotificationRequest {
  timestamp: string;
  connectorStatus:
    | "Available"
    | "Occupied"
    | "Reserved"
    | "Unavailable"
    | "Faulted";
  evseId: number;
  connectorId: number;
}

export interface StatusNotificationResponse {
  // Empty for OCPP 2.0.1
}

// Authorize
export interface AuthorizeRequest {
  idToken: {
    idToken: string;
    type:
      | "Central"
      | "eMAID"
      | "ISO14443"
      | "ISO15693"
      | "KeyCode"
      | "Local"
      | "MacAddress"
      | "NoAuthorization";
  };
}

export interface AuthorizeResponse {
  idTokenInfo: {
    status:
      | "Accepted"
      | "Blocked"
      | "Expired"
      | "Invalid"
      | "NoCredit"
      | "NotAllowedTypeEVSE"
      | "NotAtThisLocation"
      | "NotAtThisTime"
      | "Unknown";
  };
}

// TransactionEvent
export interface TransactionEventRequest {
  eventType: "Started" | "Updated" | "Ended";
  timestamp: string;
  triggerReason: string;
  seqNo: number;
  transactionInfo: {
    transactionId: string;
    chargingState?:
      | "Charging"
      | "EVConnected"
      | "SuspendedEV"
      | "SuspendedEVSE"
      | "Idle";
    stoppedReason?: string;
  };
  evse?: {
    id: number;
    connectorId?: number;
  };
  idToken?: {
    idToken: string;
    type: string;
  };
  meterValue?: Array<{
    timestamp: string;
    sampledValue: Array<{
      value: number;
      measurand?: string;
      unit?: string;
    }>;
  }>;
}

export interface TransactionEventResponse {
  totalCost?: number;
  chargingPriority?: number;
  idTokenInfo?: {
    status: string;
  };
}

// RequestStartTransaction (CSMS -> CS)
export interface RequestStartTransactionRequest {
  idToken: {
    idToken: string;
    type: string;
  };
  evseId?: number;
}

export interface RequestStartTransactionResponse {
  status: "Accepted" | "Rejected";
  transactionId?: string;
}

// RequestStopTransaction (CSMS -> CS)
export interface RequestStopTransactionRequest {
  transactionId: string;
}

export interface RequestStopTransactionResponse {
  status: "Accepted" | "Rejected";
}

// Reset (CSMS -> CS)
export interface ResetRequest {
  type: "Hard" | "Soft";
}

export interface ResetResponse {
  status: "Accepted" | "Rejected";
}

// ChangeAvailability (CSMS -> CS)
export interface ChangeAvailabilityRequest {
  operational: boolean;
  evseId?: number;
}

export interface ChangeAvailabilityResponse {
  status: "Accepted" | "Rejected" | "Scheduled";
}

// UnlockConnector (CSMS -> CS)
export interface UnlockConnectorRequest {
  evseId?: number;
  connectorId?: number;
}

export interface UnlockConnectorResponse {
  status:
    | "Unlocked"
    | "UnlockFailed"
    | "OngoingAuthorizedTransaction"
    | "UnknownConnector";
}

// GetVariables (CSMS -> CS)
export interface GetVariablesRequest {
  getVariableData: Array<{
    attributeType?: "Actual" | "Target" | "MinSet" | "MaxSet";
    component?: {
      name: string;
      instance?: string;
    };
    variable?: {
      name: string;
      instance?: string;
    };
  }>;
}

export interface GetVariablesResponse {
  getVariableResult: Array<{
    attributeType?: "Actual" | "Target" | "MinSet" | "MaxSet";
    attributeStatus:
      | "Accepted"
      | "Rejected"
      | "UnknownComponent"
      | "UnknownVariable";
    attributeValue?: string;
    component?: {
      name: string;
      instance?: string;
    };
    variable?: {
      name: string;
      instance?: string;
    };
  }>;
}

// SetVariables (CSMS -> CS)
export interface SetVariablesRequest {
  setVariableData: Array<{
    attributeType?: "Target" | "MinSet" | "MaxSet";
    attributeValue: string;
    component: {
      name: string;
      instance?: string;
    };
    variable: {
      name: string;
      instance?: string;
    };
  }>;
}

export interface SetVariablesResponse {
  setVariableResult: Array<{
    attributeType?: "Target" | "MinSet" | "MaxSet";
    attributeStatus:
      | "Accepted"
      | "Rejected"
      | "UnknownComponent"
      | "UnknownVariable"
      | "NotSupportedAttributeType";
    component: {
      name: string;
      instance?: string;
    };
    variable: {
      name: string;
      instance?: string;
    };
  }>;
}

// TriggerMessage (CSMS -> CS)
export interface TriggerMessageRequest {
  requestedMessage:
    | "BootNotification"
    | "LogStatusNotification"
    | "FirmwareStatusNotification"
    | "Heartbeat"
    | "MeterValues"
    | "SignChargingStationCertificate"
    | "StatusNotification";
  evseId?: number;
}

export interface TriggerMessageResponse {
  status: "Accepted" | "Rejected" | "NotImplemented";
}
