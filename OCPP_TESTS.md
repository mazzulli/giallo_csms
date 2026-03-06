# Guia de Testes - Comandos OCPP 2.0.1

Este arquivo contém exemplos de testes que você pode executar para validar os novos comandos OCPP implementados.

## Pré-requisitos

- Estação de recarga conectada ao CSMS
- Token de autenticação válido
- Conhecer a identidade da estação (ex: "CS-001")

## Coleção de Testes Postman/Insomnia

Se estiver usando Postman ou Insomnia, importe este JSON:

```json
{
  "info": {
    "name": "OCPP 2.0.1 Commands",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "RequestStartTransaction",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          },
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"identity\":\"CS-001\",\"command\":\"RequestStartTransaction\",\"params\":{\"evseId\":1}}"
        },
        "url": {
          "raw": "http://localhost:3000/api/stations",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "stations"]
        }
      }
    },
    {
      "name": "RequestStopTransaction",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          },
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"identity\":\"CS-001\",\"command\":\"RequestStopTransaction\",\"params\":{\"transactionId\":\"12345\"}}"
        },
        "url": {
          "raw": "http://localhost:3000/api/stations",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "stations"]
        }
      }
    },
    {
      "name": "Reset (Soft)",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          },
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"identity\":\"CS-001\",\"command\":\"Reset\",\"params\":{\"type\":\"Soft\"}}"
        },
        "url": {
          "raw": "http://localhost:3000/api/stations",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "stations"]
        }
      }
    },
    {
      "name": "ChangeAvailability - Make Available",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          },
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"identity\":\"CS-001\",\"command\":\"ChangeAvailability\",\"params\":{\"operational\":true,\"evseId\":1}}"
        },
        "url": {
          "raw": "http://localhost:3000/api/stations",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "stations"]
        }
      }
    },
    {
      "name": "ChangeAvailability - Make Unavailable",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          },
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"identity\":\"CS-001\",\"command\":\"ChangeAvailability\",\"params\":{\"operational\":false}}"
        },
        "url": {
          "raw": "http://localhost:3000/api/stations",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "stations"]
        }
      }
    },
    {
      "name": "UnlockConnector",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          },
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"identity\":\"CS-001\",\"command\":\"UnlockConnector\",\"params\":{\"evseId\":1,\"connectorId\":1}}"
        },
        "url": {
          "raw": "http://localhost:3000/api/stations",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "stations"]
        }
      }
    },
    {
      "name": "GetVariables - Serial Number",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          },
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"identity\":\"CS-001\",\"command\":\"GetVariables\",\"params\":{\"getVariableData\":[{\"component\":{\"name\":\"ChargingStation\"},\"variable\":{\"name\":\"SerialNumber\"}}]}}"
        },
        "url": {
          "raw": "http://localhost:3000/api/stations",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "stations"]
        }
      }
    },
    {
      "name": "SetVariables - Heartbeat Interval",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          },
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"identity\":\"CS-001\",\"command\":\"SetVariables\",\"params\":{\"setVariableData\":[{\"component\":{\"name\":\"Monitoring\"},\"variable\":{\"name\":\"HeartbeatInterval\"},\"attributeValue\":\"120\",\"attributeType\":\"Target\"}]}}"
        },
        "url": {
          "raw": "http://localhost:3000/api/stations",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "stations"]
        }
      }
    },
    {
      "name": "TriggerMessage - MeterValues",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          },
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"identity\":\"CS-001\",\"command\":\"TriggerMessage\",\"params\":{\"requestedMessage\":\"MeterValues\",\"evseId\":1}}"
        },
        "url": {
          "raw": "http://localhost:3000/api/stations",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "stations"]
        }
      }
    }
  ]
}
```

## Testes com cURL

### 1. Teste Básico - Listar Estações

```bash
curl -X GET http://localhost:3000/api/stations \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2. Inicia Transação

```bash
curl -X POST http://localhost:3000/api/stations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "identity": "CS-001",
    "command": "RequestStartTransaction",
    "params": {
      "evseId": 1
    }
  }'
```

**Esperado**: Status 200 com `{ "status": "Accepted", "transactionId": "..." }`

### 3. Para Transação

```bash
curl -X POST http://localhost:3000/api/stations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "identity": "CS-001",
    "command": "RequestStopTransaction",
    "params": {
      "transactionId": "TRANSACTION_ID_FROM_STEP_2"
    }
  }'
```

**Esperado**: Status 200 com `{ "status": "Accepted" }`

### 4. Reinicia Estação (Soft)

```bash
curl -X POST http://localhost:3000/api/stations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "identity": "CS-001",
    "command": "Reset",
    "params": {
      "type": "Soft"
    }
  }'
```

### 5. Desabilita Estação

```bash
curl -X POST http://localhost:3000/api/stations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "identity": "CS-001",
    "command": "ChangeAvailability",
    "params": {
      "operational": false
    }
  }'
```

**Esperado**: Estação deixa de aceitar novos carregamentos

### 6. Habilita Estação

```bash
curl -X POST http://localhost:3000/api/stations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "identity": "CS-001",
    "command": "ChangeAvailability",
    "params": {
      "operational": true
    }
  }'
```

### 7. Obtém Número de Série

```bash
curl -X POST http://localhost:3000/api/stations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "identity": "CS-001",
    "command": "GetVariables",
    "params": {
      "getVariableData": [
        {
          "component": { "name": "ChargingStation" },
          "variable": { "name": "SerialNumber" }
        }
      ]
    }
  }'
```

### 8. Define Intervalo de Heartbeat para 120 segundos

```bash
curl -X POST http://localhost:3000/api/stations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "identity": "CS-001",
    "command": "SetVariables",
    "params": {
      "setVariableData": [
        {
          "component": { "name": "Monitoring" },
          "variable": { "name": "HeartbeatInterval" },
          "attributeValue": "120",
          "attributeType": "Target"
        }
      ]
    }
  }'
```

### 9. Força Envio de MeterValues

```bash
curl -X POST http://localhost:3000/api/stations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "identity": "CS-001",
    "command": "TriggerMessage",
    "params": {
      "requestedMessage": "MeterValues",
      "evseId": 1
    }
  }'
```

---

## Testes em Node.js

```typescript
import fetch from "node-fetch";

const API_BASE = "http://localhost:3000";
const TOKEN = "YOUR_TOKEN";
const STATION_IDENTITY = "CS-001";

async function executeCommand(command: string, params: any) {
  const response = await fetch(`${API_BASE}/api/stations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({
      identity: STATION_IDENTITY,
      command,
      params,
    }),
  });

  return response.json();
}

async function runTests() {
  console.log("🧪 Iniciando testes OCPP 2.0.1...\n");

  try {
    // Test 1: Start Transaction
    console.log("1️⃣  Testando RequestStartTransaction...");
    const startTxn = await executeCommand("RequestStartTransaction", {
      evseId: 1,
    });
    console.log("✅", startTxn);
    const transactionId = startTxn.result.transactionId;
    console.log("\n");

    // Test 2: Get Variables
    console.log("2️⃣  Testando GetVariables...");
    const getVars = await executeCommand("GetVariables", {
      getVariableData: [
        {
          component: { name: "ChargingStation" },
          variable: { name: "SerialNumber" },
        },
      ],
    });
    console.log("✅", getVars);
    console.log("\n");

    // Test 3: Set Variables
    console.log("3️⃣  Testando SetVariables...");
    const setVars = await executeCommand("SetVariables", {
      setVariableData: [
        {
          component: { name: "Monitoring" },
          variable: { name: "HeartbeatInterval" },
          attributeValue: "120",
          attributeType: "Target",
        },
      ],
    });
    console.log("✅", setVars);
    console.log("\n");

    // Test 4: Trigger Message
    console.log("4️⃣  Testando TriggerMessage...");
    const trigger = await executeCommand("TriggerMessage", {
      requestedMessage: "MeterValues",
      evseId: 1,
    });
    console.log("✅", trigger);
    console.log("\n");

    // Test 5: Stop Transaction
    console.log("5️⃣  Testando RequestStopTransaction...");
    const stopTxn = await executeCommand("RequestStopTransaction", {
      transactionId,
    });
    console.log("✅", stopTxn);
    console.log("\n");

    // Test 6: Change Availability
    console.log("6️⃣  Testando ChangeAvailability...");
    const changeAvail = await executeCommand("ChangeAvailability", {
      operational: false,
    });
    console.log("✅", changeAvail);
    console.log("\n");

    // Test 7: Reset
    console.log("7️⃣  Testando Reset...");
    const reset = await executeCommand("Reset", { type: "Soft" });
    console.log("✅", reset);
    console.log("\n");

    console.log("✨ Todos os testes completados!");
  } catch (error) {
    console.error("❌ Erro durante testes:", error);
  }
}

runTests();
```

---

## Validação de Resposta

Cada resposta bem-sucedida deve ter este formato:

```json
{
  "success": true,
  "command": "COMMAND_NAME",
  "result": {
    // Conteúdo varia por comando
  }
}
```

### Erros Esperados

**Estação não conectada (503)**:

```json
{
  "error": "Station is not connected"
}
```

**Parâmetro faltando (400)**:

```json
{
  "error": "RequestStartTransaction requires evseId parameter"
}
```

**Não autenticado (401)**:

```json
{
  "error": "Unauthorized"
}
```

**Comando desconhecido (400)**:

```json
{
  "error": "Unknown command: InvalidCommand"
}
```

---

## Checklist de Testes

- [ ] RequestStartTransaction - Inicia carregamento
- [ ] RequestStopTransaction - Para carregamento
- [ ] Reset - Reinicia estação (Soft)
- [ ] ChangeAvailability - Disabilita estação
- [ ] ChangeAvailability - Habilita estação
- [ ] UnlockConnector - Desbloqueia conector
- [ ] GetVariables - Obtém informações
- [ ] SetVariables - Modifica configurações
- [ ] TriggerMessage - Força envio de mensagem
- [ ] Erro 401 sem token
- [ ] Erro 503 com estação desconectada
- [ ] Erro 400 com parâmetro faltando

---

## Dicas para Debugging

1. **Verifique logs do servidor**:

   ```bash
   # Terminal onde Next.js está rodando
   # Você verá mensagens como "[OCPP] Station connected: CS-001"
   ```

2. **Use o DevTools do navegador** para monitoring:
   - Abra Network tab
   - Faça as requisições
   - Verifique status e response

3. **Valide a identidade da estação**:
   - GET /api/stations deve listar todas as estações
   - Copie exatamente o `identity` da estação

4. **Confirme autenticação**:
   - Teste GET /api/stations primeiro
   - Se retornar 401, seu token está inválido
