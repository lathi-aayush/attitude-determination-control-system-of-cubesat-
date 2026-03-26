# WebSocket Data Flow

## Overview

- **Browser** talks only to the **backend** over WebSocket (and HTTP for static files and API).
- **Backend** talks to **Arduino** over the Bluetooth serial port.
- The browser never connects directly to the Arduino.

## WebSocket URL

- Same host as the page, path `/ws`.
- Example: if the UI is at `http://localhost:3080`, the WebSocket URL is `ws://localhost:3080/ws`.

## Messages: Backend → Browser

### 1. Connection status

Sent when serial is opened/closed or on client connect.

```json
{
  "type": "connection",
  "serialConnected": true,
  "error": null
}
```

- `serialConnected`: whether the backend is connected to the Arduino serial port.
- `error`: optional string when disconnected due to error.

### 2. Telemetry

Sent when the backend receives a line from the Arduino and parses a `key:value` pair. All known keys are merged into one object and sent.

```json
{
  "type": "telemetry",
  "angle": 45,
  "mode": "command",
  "status": "ok",
  "step": 2,
  "cmd": "hold 2"
}
```

- `angle`: current orientation (degrees).
- `mode`: `"command"` or `"auto"`.
- `status`: e.g. `"ok"`, `"error"`, `"emergency_stop"`, `"timeout"`.
- `step`: current step index in the sequence (0 when idle).
- `cmd`: current command string for that step.

### 3. Error (command send failed)

```json
{
  "type": "error",
  "message": "Serial not connected."
}
```

## Messages: Browser → Backend

The browser sends JSON with the command payload.

```json
{
  "type": "command",
  "payload": "right_90, hold 2, left_90"
}
```

The backend forwards `payload` as a single line to the serial port (plus newline). Rate limiting applies (e.g. 500 ms between commands).

## Reconnection

- The browser opens the WebSocket on load and reconnects automatically if the connection drops (e.g. every 5 s check).
- Serial connection is independent: user selects port and clicks “Connect” (or backend is started with `SERIAL_PORT` set for auto-connect).
