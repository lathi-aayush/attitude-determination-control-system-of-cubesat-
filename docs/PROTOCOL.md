# AarambhSat ADCS – Communication Protocol

## 1. Transport

- **PC ↔ Arduino:** Serial over Bluetooth (HC-05 SPP). Backend opens a COM port and uses line-based text.
- **Browser ↔ Backend:** WebSocket (binary or text frames). Recommended format: JSON for both commands and telemetry.

---

## 2. Command Language (PC → Arduino)

### 2.1 Syntax Rules
- **Encoding:** UTF-8 or ASCII text, one line per “message”.
- **Separator for sequences:** Comma (`,`). Spaces around commas allowed.
- **Line terminator:** Newline (`\n`) or CRLF; Arduino accepts both.

### 2.2 Single Commands

| Command    | Description |
|-----------|-------------|
| `right_90`  | Rotate right by 90° (setpoint += 90) |
| `right_180` | Rotate right by 180° |
| `left_90`   | Rotate left by 90° (setpoint -= 90) |
| `left_180`  | Rotate left by 180° |
| `hold`      | Hold current setpoint indefinitely |
| `hold N`    | Hold current setpoint for N seconds (N integer) |
| `stop`      | Emergency stop: stop motor, clear queue, optional mode switch |
| `auto`      | Switch to AUTO mode (LDR sun tracking) |

### 2.3 Sequence Example
One line sent from backend to Arduino:
```text
right_90, hold 2, left_90
```
Arduino parses into three steps, queues them, executes in order, and sends progress via telemetry.

### 2.4 Invalid Commands
- Unknown token (e.g. `right_45` if only 90/180 supported): Arduino rejects and may send `status:error` or `error:invalid_cmd`.
- Backend may optionally validate before sending to reduce traffic.

---

## 3. Telemetry (Arduino → PC)

### 3.1 Format
- **One key-value per line.**  
  Format: `key:value`  
  Optional: trim spaces; value is the rest of the line after the first `:`.

### 3.2 Standard Keys

| Key     | Meaning | Example |
|--------|---------|--------|
| `angle` | Current orientation angle (degrees) | `angle:45` |
| `mode`  | Current mode | `mode:command` or `mode:auto` |
| `status`| System status | `status:ok`, `status:error`, `status:emergency_stop` |
| `cmd`   | Current command being executed | `cmd:right_90` |
| `step`  | Current step index in sequence (1-based) | `step:2` |

### 3.3 Example Telemetry Stream
```text
mode:command
angle:15
step:1 cmd:right_90
status:ok
angle:42
...
step:2 cmd:hold 2
status:ok
```

### 3.4 Backend Parsing
- Read serial line-by-line.
- Split on first `:`: `key = part before ':'`, `value = part after ':'` (trimmed).
- Build a telemetry object (e.g. JSON) and forward to all WebSocket clients (e.g. `{ "angle": 15, "mode": "command", "step": 1, "cmd": "right_90", "status": "ok" }`).
- Last value per key overwrites previous (or keep last N lines for “log” view if needed).

---

## 4. WebSocket (Browser ↔ Backend)

### 4.1 Messages: Backend → Browser (Telemetry)
- **Format:** JSON object.
- **Contents:** Parsed telemetry fields (e.g. `angle`, `mode`, `status`, `cmd`, `step`).
- **Frequency:** On every new line from Arduino, or batched (e.g. every 100 ms) to reduce UI updates.

Example:
```json
{ "angle": 45, "mode": "command", "status": "ok", "step": 2, "cmd": "hold 2" }
```

### 4.2 Messages: Browser → Backend (Commands)
- **Format:** JSON recommended.
- **Suggested shape:** `{ "type": "command", "payload": "right_90, hold 2, left_90" }` or plain string `"right_90, hold 2, left_90"`.
- Backend extracts the command string and sends it to the serial port (one line).

### 4.3 Connection Status
- Backend can send a separate message type for “serial connected” / “serial disconnected” so the UI can show: Connecting / Connected / Disconnected / Error.

---

## 5. Safety and Limits (Arduino Side)

- **Max angle:** e.g. ±60° (configurable); beyond that, reduce or stop motor.
- **Emergency angle:** e.g. ±80° → immediate stop and `status:emergency_stop`.
- **Command timeout:** If a step (e.g. `right_90`) does not complete within N seconds, abort and send `status:timeout`.
- **Emergency stop:** On `stop` command, clear queue, stop motor, set `status:ok` or `status:stopped` when idle.

This document is the single source of truth for the exhibition software; Arduino and backend implementations must conform to it.
