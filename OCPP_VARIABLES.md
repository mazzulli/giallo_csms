# Variáveis e Componentes OCPP 2.0.1

Este arquivo lista as variáveis e componentes mais comuns usadas com os comandos `GetVariables` e `SetVariables` conforme a especificação OCPP 2.0.1.

## Estrutura de Componente e Variável

```json
{
  "component": {
    "name": "string", // Nome do componente (obrigatório)
    "instance": "string" // Instância do componente (opcional)
  },
  "variable": {
    "name": "string", // Nome da variável (obrigatório)
    "instance": "string" // Instância da variável (opcional)
  },
  "attributeType": "Actual|Target|MinSet|MaxSet"
}
```

---

## Componentes Principais

### 1. Componente: ChargingStation

Configurações gerais da estação de recarga.

| Variável              | Tipo    | Descrição                   | Exemplo      |
| --------------------- | ------- | --------------------------- | ------------ |
| MaxNumberOfConnectors | integer | Número máximo de conectores | 2            |
| SerialNumber          | string  | Número de série             | CS-12345-001 |
| VendorName            | string  | Nome do fabricante          | ChargePoint  |
| ModelNumber           | string  | Número do modelo            | CP-7100      |
| FirmwareVersion       | string  | Versão do firmware          | 2.0.1-rev5   |
| VendorErrorCode       | string  | Código de erro do vendor    | E001         |

**Exemplo GetVariables**:

```json
{
  "command": "GetVariables",
  "params": {
    "getVariableData": [
      {
        "component": { "name": "ChargingStation" },
        "variable": { "name": "SerialNumber" }
      },
      {
        "component": { "name": "ChargingStation" },
        "variable": { "name": "FirmwareVersion" }
      }
    ]
  }
}
```

---

### 2. Componente: Monitoring

Configurações de monitoramento e relatórios.

| Variável              | Tipo    | Descrição                                | Exemplo |
| --------------------- | ------- | ---------------------------------------- | ------- |
| HeartbeatInterval     | integer | Intervalo de heartbeat em segundos       | 60      |
| ReportBaseInterval    | integer | Intervalo base de relatórios em segundos | 300     |
| NotifyAttemptInterval | integer | Intervalo de tentativa de notificação    | 86400   |

**Exemplo SetVariables**:

```json
{
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
}
```

---

### 3. Componente: ConfigurationCtrlr

Controlador de configuração.

| Variável         | Tipo   | Descrição             | Exemplo                  |
| ---------------- | ------ | --------------------- | ------------------------ |
| ConfigurationKey | string | Chave de configuração | SupportedFeatureProfiles |
| OcppVersion      | string | Versão OCPP suportada | 2.0.1                    |

---

### 4. Componente: EVSE (Electric Vehicle Supply Equipment)

Configurações e status do EVSE.

| Variável              | Tipo    | Descrição                      | Exemplo   |
| --------------------- | ------- | ------------------------------ | --------- |
| Available             | boolean | Se EVSE está disponível        | true      |
| IsolationStatus       | string  | Status de isolamento           | normal    |
| IsScheduledTxn        | boolean | Se há transação agendada       | false     |
| AvailabilityState     | string  | Estado de disponibilidade      | Available |
| AvailabilitySchedule  | object  | Agendamento de disponibilidade | {...}     |
| Power                 | float   | Potência disponível em watts   | 7000      |
| MaxCurrent            | double  | Corrente máxima em amperes     | 32        |
| PhaseToNeutralVoltage | double  | Voltagem fase-neutro           | 230       |
| AlternateVoltageMode  | string  | Modo de voltagem alternativa   | 3PH       |

**Nota**: Use a instância `instance` para referenciar EVSE específicos:

```json
{
  "component": {
    "name": "EVSE",
    "instance": "1"
  },
  "variable": { "name": "Available" }
}
```

---

### 5. Componente: Connector

Configurações de conectores específicos.

| Variável            | Tipo   | Descrição                 | Exemplo                      |
| ------------------- | ------ | ------------------------- | ---------------------------- |
| AvailabilityState   | string | Estado de disponibilidade | Available                    |
| ConnectorType       | string | Tipo do conector          | IEC62196Type2                |
| ConnectorStatus     | string | Status do conector        | Available                    |
| ConnectorLocation   | string | Localização do conector   | Inside                       |
| ConnectorsSupported | string | Conectores suportados     | IEC62196Type1, IEC62196Type2 |

**Nota**: Use instância para referenciar conectores específicos:

```json
{
  "component": {
    "name": "Connector",
    "instance": "1_1" // EVSE_1_Connector_1
  },
  "variable": { "name": "AvailabilityState" }
}
```

---

### 6. Componente: AuthorizationCtrlr

Controle de autorização.

| Variável                                  | Tipo    | Descrição                             | Exemplo   |
| ----------------------------------------- | ------- | ------------------------------------- | --------- |
| AuthorizeRemoteTxnRequests                | boolean | Autorizar pedidos de transação remota | true      |
| CiPerMessage                              | boolean | Como validar credenciais              | true      |
| LocalAuthorizeOffline                     | boolean | Autorização local offline             | true      |
| LocalPreAuthorize                         | boolean | Pré-autorização local                 | false     |
| MasterPassGroupId                         | string  | ID do grupo master pass               | MASTER001 |
| OfflineRejectedTxnMessagesQueuedForUpload | boolean | Fila de rejeição offline              | true      |

---

### 7. Componente: CSMS (Central System Management System)

Configurações de comunicação com CSMS.

| Variável            | Tipo    | Descrição                 | Exemplo                |
| ------------------- | ------- | ------------------------- | ---------------------- |
| CSMSUrl             | string  | URL do CSMS               | wss://csms.example.com |
| BasicAuthPassword   | string  | Senha auth básica         | **\*\***               |
| BasicAuthUsername   | string  | Usuário auth básica       | chargestation01        |
| CertificateHostname | string  | Hostname do certificado   | csms.example.com       |
| ConnectAttemptsMax  | integer | Máximo de tentativas      | 3                      |
| ConnectRetrySeconds | integer | Segundos entre tentativas | 60                     |

---

### 8. Componente: TxnCtrlr (Transaction Controller)

Controle de transações.

| Variável                 | Tipo    | Descrição                         | Exemplo |
| ------------------------ | ------- | --------------------------------- | ------- |
| EVConnectionTimeOut      | integer | Timeout de conexão EV em segundos | 30      |
| TxnBeforeAcceptedEnabled | boolean | Transação antes de aceitar        | false   |
| TxnExpiryInterval        | integer | Intervalo de expiração de txn     | 3600    |

---

### 9. Componente: ParkingBrakeStatus

Status do freio de estacionamento (se aplicável).

| Variável            | Tipo    | Descrição       | Exemplo |
| ------------------- | ------- | --------------- | ------- |
| ParkingBrakeEngaged | boolean | Freio engrenado | true    |

---

### 10. Componente: SecurityCtrlr

Controle de segurança.

| Variável              | Tipo    | Descrição                          | Exemplo    |
| --------------------- | ------- | ---------------------------------- | ---------- |
| TransactionLogMaxSize | integer | Tamanho máximo do log de transação | 10000      |
| OrganizationName      | string  | Nome da organização                | GialloVolt |

---

## Tipos de Atributos

| Atributo | Uso     | Descrição                        |
| -------- | ------- | -------------------------------- |
| Actual   | GET     | Valor real/atual do parâmetro    |
| Target   | SET/GET | Valor desejado/alvo do parâmetro |
| MinSet   | SET/GET | Valor mínimo para Set            |
| MaxSet   | SET/GET | Valor máximo para Set            |

---

## Exemplos Práticos

### Obter Informações da Estação

```json
{
  "command": "GetVariables",
  "params": {
    "getVariableData": [
      {
        "component": { "name": "ChargingStation" },
        "variable": { "name": "SerialNumber" },
        "attributeType": "Actual"
      },
      {
        "component": { "name": "ChargingStation" },
        "variable": { "name": "ModelNumber" },
        "attributeType": "Actual"
      },
      {
        "component": { "name": "ChargingStation" },
        "variable": { "name": "FirmwareVersion" },
        "attributeType": "Actual"
      },
      {
        "component": { "name": "CSMS" },
        "variable": { "name": "CSMSUrl" },
        "attributeType": "Actual"
      }
    ]
  }
}
```

### Configurar Intervalo de Heartbeat

```json
{
  "command": "SetVariables",
  "params": {
    "setVariableData": [
      {
        "component": { "name": "Monitoring" },
        "variable": { "name": "HeartbeatInterval" },
        "attributeValue": "60",
        "attributeType": "Target"
      }
    ]
  }
}
```

### Verificar Disponibilidade de EVSE

```json
{
  "command": "GetVariables",
  "params": {
    "getVariableData": [
      {
        "component": { "name": "EVSE", "instance": "1" },
        "variable": { "name": "Available" },
        "attributeType": "Actual"
      },
      {
        "component": { "name": "EVSE", "instance": "1" },
        "variable": { "name": "Power" },
        "attributeType": "Actual"
      }
    ]
  }
}
```

### Permitir Transações Remotas

```json
{
  "command": "SetVariables",
  "params": {
    "setVariableData": [
      {
        "component": { "name": "AuthorizationCtrlr" },
        "variable": { "name": "AuthorizeRemoteTxnRequests" },
        "attributeValue": "true",
        "attributeType": "Target"
      }
    ]
  }
}
```

---

## Referências

- Especificação OCPP 2.0.1: https://openchargealliance.org/my-oca/ocpp/
- Variáveis podem variar por fabricante e implementação
- Consulte a documentação específica da sua estação para lista completa
