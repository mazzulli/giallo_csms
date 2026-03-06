# OCPP 2.0.1 Comandos - Documentação de Uso

## Visão Geral

Este documento descreve como usar os novos endpoints da API para enviar comandos OCPP 2.0.1 para as estações de recarga. Todos os comandos POST devem ser autenticados e enviados para o endpoint `/api/stations`.

## Estrutura Básica de Requisição

```json
{
  "identity": "string", // Identificador único da estação (obrigatório)
  "stationId": "string", // ID da estação no banco de dados (opcional)
  "command": "string", // Nome do comando OCPP (obrigatório)
  "params": {} // Parâmetros específicos do comando (varia por comando)
}
```

---

## Comandos Disponíveis

### 1. RequestStartTransaction

**Descrição**: Inicia uma transação de carregamento remotamente.

```bash
curl -X POST http://localhost:3000/api/stations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "identity": "CS-001",
    "command": "RequestStartTransaction",
    "params": {
      "evseId": 1
    }
  }'
```

**Resposta**:

```json
{
  "success": true,
  "command": "RequestStartTransaction",
  "result": {
    "status": "Accepted",
    "transactionId": "12345"
  }
}
```

---

### 2. RequestStopTransaction

**Descrição**: Para uma transação de carregamento em andamento.

```bash
curl -X POST http://localhost:3000/api/stations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "identity": "CS-001",
    "command": "RequestStopTransaction",
    "params": {
      "transactionId": "12345"
    }
  }'
```

**Resposta**:

```json
{
  "success": true,
  "command": "RequestStopTransaction",
  "result": {
    "status": "Accepted"
  }
}
```

---

### 3. Reset

**Descrição**: Reinicia a estação de recarga (Hard = desligamento completo, Soft = reinicialização suave).

```bash
curl -X POST http://localhost:3000/api/stations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "identity": "CS-001",
    "command": "Reset",
    "params": {
      "type": "Soft"
    }
  }'
```

**Parâmetros**:

- `type`: "Hard" ou "Soft" (padrão: "Soft")

**Resposta**:

```json
{
  "success": true,
  "command": "Reset",
  "result": {
    "status": "Accepted"
  }
}
```

---

### 4. ChangeAvailability

**Descrição**: Altera a disponibilidade de uma estação ou EVSE específico.

```bash
curl -X POST http://localhost:3000/api/stations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "identity": "CS-001",
    "command": "ChangeAvailability",
    "params": {
      "operational": true,
      "evseId": 1
    }
  }'
```

**Parâmetros**:

- `operational`: boolean (obrigatório) - true = disponível, false = indisponível
- `evseId`: number (opcional) - ID do EVSE. Se não fornecido, aplica a toda a estação

**Resposta**:

```json
{
  "success": true,
  "command": "ChangeAvailability",
  "result": {
    "status": "Accepted"
  }
}
```

---

### 5. UnlockConnector

**Descrição**: Desbloqueia um conector específico (útil se EV fica preso).

```bash
curl -X POST http://localhost:3000/api/stations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "identity": "CS-001",
    "command": "UnlockConnector",
    "params": {
      "evseId": 1,
      "connectorId": 1
    }
  }'
```

**Parâmetros**:

- `evseId`: number (opcional)
- `connectorId`: number (opcional)

**Resposta**:

```json
{
  "success": true,
  "command": "UnlockConnector",
  "result": {
    "status": "Unlocked"
  }
}
```

---

### 6. GetVariables

**Descrição**: Obtém o valor de variáveis/configurações da estação.

```bash
curl -X POST http://localhost:3000/api/stations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "identity": "CS-001",
    "command": "GetVariables",
    "params": {
      "getVariableData": [
        {
          "component": {
            "name": "ChargingStation"
          },
          "variable": {
            "name": "MaxNumberOfConnectors"
          },
          "attributeType": "Actual"
        }
      ]
    }
  }'
```

**Parâmetros**:

- `getVariableData`: Array de variáveis a obter
  - `component`: {name: string, instance?: string}
  - `variable`: {name: string, instance?: string}
  - `attributeType`: "Actual" | "Target" | "MinSet" | "MaxSet" (opcional)

**Resposta**:

```json
{
  "success": true,
  "command": "GetVariables",
  "result": {
    "getVariableResult": [
      {
        "attributeStatus": "Accepted",
        "attributeValue": "2",
        "component": {
          "name": "ChargingStation"
        },
        "variable": {
          "name": "MaxNumberOfConnectors"
        }
      }
    ]
  }
}
```

---

### 7. SetVariables

**Descrição**: Define o valor de variáveis/configurações na estação.

```bash
curl -X POST http://localhost:3000/api/stations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "identity": "CS-001",
    "command": "SetVariables",
    "params": {
      "setVariableData": [
        {
          "component": {
            "name": "Monitoring"
          },
          "variable": {
            "name": "HeartbeatInterval"
          },
          "attributeValue": "300",
          "attributeType": "Target"
        }
      ]
    }
  }'
```

**Parâmetros**:

- `setVariableData`: Array de variáveis a definir (obrigatório)
  - `component`: {name: string, instance?: string} (obrigatório)
  - `variable`: {name: string, instance?: string} (obrigatório)
  - `attributeValue`: string (obrigatório)
  - `attributeType`: "Target" | "MinSet" | "MaxSet" (opcional)

**Resposta**:

```json
{
  "success": true,
  "command": "SetVariables",
  "result": {
    "setVariableResult": [
      {
        "attributeStatus": "Accepted",
        "component": {
          "name": "Monitoring"
        },
        "variable": {
          "name": "HeartbeatInterval"
        }
      }
    ]
  }
}
```

---

### 8. TriggerMessage

**Descrição**: Força a estação a enviar uma mensagem específica (úteis para testes e sincronização).

```bash
curl -X POST http://localhost:3000/api/stations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "identity": "CS-001",
    "command": "TriggerMessage",
    "params": {
      "requestedMessage": "MeterValues",
      "evseId": 1
    }
  }'
```

**Parâmetros**:

- `requestedMessage`:
  - "BootNotification"
  - "LogStatusNotification"
  - "FirmwareStatusNotification"
  - "Heartbeat"
  - "MeterValues"
  - "SignChargingStationCertificate"
  - "StatusNotification"
- `evseId`: number (opcional)

**Resposta**:

```json
{
  "success": true,
  "command": "TriggerMessage",
  "result": {
    "status": "Accepted"
  }
}
```

---

## Códigos de Erro

| Status | Mensagem                 | Descrição                                 |
| ------ | ------------------------ | ----------------------------------------- |
| 400    | Missing required fields  | Faltando `identity` ou `command`          |
| 400    | Missing parameter        | Um parâmetro necessário para o comando    |
| 401    | Unauthorized             | Token de autenticação inválido ou ausente |
| 404    | Station not found        | Station ID não existe                     |
| 503    | Station is not connected | Estação não está conectada ao CSMS        |
| 500    | Internal Server Error    | Erro ao processar comando                 |

---

## Variáveis Comuns (GetVariables/SetVariables)

### Componentes e Variáveis Principais

#### ChargingStation

- `MaxNumberOfConnectors`: Número máximo de conectores
- `SerialNumber`: Número de série da estação
- `VendorName`: Fabricante
- `ModelNumber`: Modelo
- `FirmwareVersion`: Versão do firmware

#### Monitoring

- `HeartbeatInterval`: Intervalo de heartbeat em segundos
- `ReportBaseInterval`: Intervalo base de relatórios

#### EVSE

- `Available`: Status de disponibilidade do EVSE
- `Power`: Potência disponível

#### Connector

- `AvailabilityState`: Estado de disponibilidade do conector
- `ConnectorType`: Tipo de conector

---

## Exemplos JavaScript/TypeScript

### Exemplo com Fetch API

```typescript
async function sendCommand(command: string, params: any) {
  const response = await fetch("/api/stations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      identity: "CS-001",
      command,
      params,
    }),
  });

  if (!response.ok) {
    throw new Error(`Command failed: ${response.statusText}`);
  }

  return response.json();
}

// Usar
const result = await sendCommand("RequestStartTransaction", {
  evseId: 1,
});

console.log(result); // { success: true, command: "RequestStartTransaction", result: {...} }
```

### Exemplo com Axios

```typescript
import axios from "axios";

async function sendCommand(command: string, params: any) {
  const { data } = await axios.post(
    "/api/stations",
    {
      identity: "CS-001",
      stationId: "123e4567-e89b-12d3-a456-426614174000",
      command,
      params,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return data;
}

// Inicia carregamento
const startResult = await sendCommand("RequestStartTransaction", {
  evseId: 1,
});

// Para carregamento
const stopResult = await sendCommand("RequestStopTransaction", {
  transactionId: startResult.result.transactionId,
});
```

---

## Fluxo Típico de Carregamento

1. **Iniciar Carregamento**

   ```json
   {
     "command": "RequestStartTransaction",
     "params": { "evseId": 1 }
   }
   ```

2. **Monitorar Medidor** (opcional)

   ```json
   {
     "command": "TriggerMessage",
     "params": { "requestedMessage": "MeterValues", "evseId": 1 }
   }
   ```

3. **Parar Carregamento**
   ```json
   {
     "command": "RequestStopTransaction",
     "params": { "transactionId": "12345" }
   }
   ```

---

## Notas Importantes

- Todos os comandos requerem autenticação (token JWT)
- A estação deve estar **conectada** ao CSMS para receber comandos
- Comandos têm timeout de **30 segundos**
- As respostas dependem da implementação da estação de recarga
- Para OCPP 2.0.1 completo, consulte: https://openchargealliance.org/my-oca/ocpp/
