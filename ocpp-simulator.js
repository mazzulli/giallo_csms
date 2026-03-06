#!/usr/bin/env node

/**
 * OCPP 2.0.1 Charging Station Simulator
 *
 * Simula uma estação de recarga que se conecta ao CSMS via WebSocket
 * e responde aos comandos OCPP
 *
 * Uso: node ocpp-simulator.js [identity] [url]
 * Ex:  node ocpp-simulator.js INTELBRAS-EVC-01 ws://localhost:3000
 */

import WebSocket from "ws";
import * as readline from "readline";

const stationIdentity = process.argv[2] || "INTELBRAS-EVC-01";
const csmsUrl = process.argv[3] || "ws://localhost:3000";
const wsUrl = `${csmsUrl}/ocpp/${stationIdentity}`;

console.log(`\n🔌 OCPP 2.0.1 Charging Station Simulator`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`📍 Station Identity: ${stationIdentity}`);
console.log(`🌐 CSMS URL: ${csmsUrl}`);
console.log(`🔗 WebSocket: ${wsUrl}\n`);

// Station state
let ws = null;
let isConnected = false;
let messageId = 1;
let transactionId = null;
let lastTransaction = null;

const CALL = 2;
const CALL_RESULT = 3;
const CALL_ERROR = 4;

function generateMessageId() {
  return `msg-${messageId++}`;
}

function sendMessage(action, payload) {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    console.error("❌ Not connected to CSMS");
    return;
  }

  const msgId = generateMessageId();
  const message = [CALL, msgId, action, payload];

  console.log(`📤 → Sending ${action}:`, JSON.stringify(payload, null, 2));
  ws.send(JSON.stringify(message));
}

function sendBootNotification() {
  sendMessage("BootNotification", {
    chargingStation: {
      model: "EVC-90B",
      vendorName: "Intelbras",
      serialNumber: "EVB0001",
      firmwareVersion: "2.0.1-sim",
    },
    reason: "PowerUp",
  });
}

function sendHeartbeat() {
  sendMessage("Heartbeat", {});
}

function sendStatusNotification(evseId, connectorId, status) {
  sendMessage("StatusNotification", {
    timestamp: new Date().toISOString(),
    connectorStatus: status,
    evseId,
    connectorId,
  });
}

function handleRequestStartTransaction(msgId, payload) {
  console.log(`\n⚡ Starting transaction...`);
  const evseId = payload.evseId || 1;

  transactionId = `txn-${Date.now()}`;
  lastTransaction = {
    id: transactionId,
    startTime: new Date(),
    energy: 0,
  };

  // Prepare response
  const response = [
    CALL_RESULT,
    msgId,
    {
      status: "Accepted",
      transactionId,
    },
  ];

  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(response));
    console.log(`✅ Transaction started: ${transactionId}`);

    // Simulate charging
    sendStatusNotification(evseId, 1, "Occupied");

    // Simulate meter updates every 5 seconds
    const updateInterval = setInterval(() => {
      if (!transactionId) {
        clearInterval(updateInterval);
        return;
      }
      const energy = (Math.random() * 5 + 10).toFixed(1);
      console.log(`  📊 Energy: ${energy} kWh`);
    }, 5000);

    // Store for cleanup
    global.updateInterval = updateInterval;
  }
}

function handleRequestStopTransaction(msgId, payload) {
  console.log(`\n🛑 Stopping transaction...`);
  const stopTxnId = payload.transactionId;
  const evseId = 1;

  const response = [
    CALL_RESULT,
    msgId,
    {
      status: "Accepted",
    },
  ];

  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(response));
    console.log(`✅ Transaction stopped: ${stopTxnId}`);

    // Clear update interval
    if (global.updateInterval) {
      clearInterval(global.updateInterval);
    }

    // Send final event
    if (transactionId === stopTxnId) {
      sendStatusNotification(evseId, 1, "Available");
      transactionId = null;
    }
  }
}

function handleReset(msgId, payload) {
  console.log(`\n🔄 Reset requested: ${payload.type}`);

  const response = [
    CALL_RESULT,
    msgId,
    {
      status: "Accepted",
    },
  ];

  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(response));
    console.log(`✅ Reset accepted`);
  }
}

function handleChangeAvailability(msgId, payload) {
  const operational = payload.operational;
  console.log(
    `\n📍 Availability change requested: ${operational ? "Online" : "Offline"}`,
  );

  const response = [
    CALL_RESULT,
    msgId,
    {
      status: "Accepted",
    },
  ];

  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(response));
    console.log(
      `✅ Availability changed: ${operational ? "Online" : "Offline"}`,
    );
  }
}

function handleUnlockConnector(msgId, payload) {
  console.log(`\n🔓 Unlock connector requested`);

  const response = [
    CALL_RESULT,
    msgId,
    {
      status: "Unlocked",
    },
  ];

  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(response));
    console.log(`✅ Connector unlocked`);
  }
}

function handleGetVariables(msgId, payload) {
  console.log(`\n📊 GetVariables requested`);
  const data = payload.getVariableData;

  const getVariableResult = data.map((item) => ({
    attributeStatus: "Accepted",
    attributeValue:
      item.variable?.name === "SerialNumber"
        ? "EVC-001"
        : item.variable?.name === "FirmwareVersion"
          ? "2.0.1-sim"
          : item.variable?.name === "HeartbeatInterval"
            ? "60"
            : "value",
    component: item.component,
    variable: item.variable,
  }));

  const response = [
    CALL_RESULT,
    msgId,
    {
      getVariableResult,
    },
  ];

  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(response));
    console.log(`✅ Variables returned:`, getVariableResult);
  }
}

function handleSetVariables(msgId, payload) {
  console.log(`\n⚙️  SetVariables requested`);
  const data = payload.setVariableData;

  const setVariableResult = data.map((item) => ({
    attributeStatus: "Accepted",
    component: item.component,
    variable: item.variable,
  }));

  const response = [
    CALL_RESULT,
    msgId,
    {
      setVariableResult,
    },
  ];

  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(response));
    console.log(`✅ Variables set:`, setVariableResult);
  }
}

function handleTriggerMessage(msgId, payload) {
  const message = payload.requestedMessage;
  console.log(`\n📢 TriggerMessage requested: ${message}`);

  const response = [
    CALL_RESULT,
    msgId,
    {
      status: "Accepted",
    },
  ];

  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(response));
    console.log(`✅ Message triggered: ${message}`);
  }
}

function connect() {
  console.log(`🔌 Connecting to ${wsUrl}...`);

  ws = new WebSocket(wsUrl, ["ocpp2.0.1"]);

  ws.on("open", () => {
    isConnected = true;
    console.log(`✅ Connected to CSMS!\n`);
    sendBootNotification();

    // Send heartbeat every 60 seconds
    setInterval(() => {
      if (isConnected) {
        sendHeartbeat();
      }
    }, 60000);
  });

  ws.on("message", (data) => {
    try {
      const message = JSON.parse(data.toString());
      const [msgType, msgId, actionOrPayload, payload] = message;

      if (msgType === CALL) {
        const action = actionOrPayload;
        const callPayload = payload;

        console.log(`\n📥 ← Received ${action}:`, callPayload);

        switch (action) {
          case "RequestStartTransaction":
            handleRequestStartTransaction(msgId, callPayload);
            break;
          case "RequestStopTransaction":
            handleRequestStopTransaction(msgId, callPayload);
            break;
          case "Reset":
            handleReset(msgId, callPayload);
            break;
          case "ChangeAvailability":
            handleChangeAvailability(msgId, callPayload);
            break;
          case "UnlockConnector":
            handleUnlockConnector(msgId, callPayload);
            break;
          case "GetVariables":
            handleGetVariables(msgId, callPayload);
            break;
          case "SetVariables":
            handleSetVariables(msgId, callPayload);
            break;
          case "TriggerMessage":
            handleTriggerMessage(msgId, callPayload);
            break;
          default:
            console.log(`⚠️  Unknown action: ${action}`);
        }
      }
    } catch (error) {
      console.error("❌ Error parsing message:", error);
    }
  });

  ws.on("close", () => {
    isConnected = false;
    console.log(`\n❌ Disconnected from CSMS`);
    console.log(`🔄 Reconnecting in 5 seconds...\n`);
    setTimeout(connect, 5000);
  });

  ws.on("error", (error) => {
    console.error(`❌ WebSocket error:`, error.message);
  });
}

// Interactive CLI
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function printMenu() {
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`📋 Commands:`);
  console.log(`  status  - Show current state`);
  console.log(`  help    - Show this menu`);
  console.log(`  exit    - Exit simulator`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  console.log(`💡 Tip: Send commands via API POST /api/stations/{id}/command`);
  console.log(`   Example: { "action": "start", "evseId": 1 }\n`);
}

function prompt() {
  if (!isConnected) {
    rl.question(`[Connecting...] `, (input) => {
      prompt();
    });
    return;
  }

  rl.question(`[${stationIdentity}] `, (input) => {
    const cmd = input.trim().toLowerCase();

    switch (cmd) {
      case "status":
        console.log(`\nStation Status:`);
        console.log(`  Identity: ${stationIdentity}`);
        console.log(`  Connected: ${isConnected ? "✅ Yes" : "❌ No"}`);
        console.log(
          `  Transaction: ${transactionId ? `🔋 ${transactionId}` : "❌ None"}`,
        );
        console.log(``);
        break;

      case "help":
        printMenu();
        break;

      case "exit":
        console.log(`\nGoodbye! 👋\n`);
        ws?.close();
        process.exit(0);

      case "":
        // Empty input, just reprompt
        break;

      default:
        console.log(`⚠️  Unknown command: ${cmd}. Type 'help' for menu.`);
    }

    prompt();
  });
}

// Start
printMenu();
connect();
setTimeout(prompt, 1000);
