# AarambhSat ADCS – System Architecture

## 1. High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        EXHIBITION VISITOR / OPERATOR                         │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  BROWSER (Website UI)                                                        │
│  • Connect Bluetooth button    • Command input & Send / Stop                 │
│  • Connection status           • Current angle, mode, status                │
│  • Sequence display             • Executing step                             │
│  • WebSocket client (ws://)                                                 │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ WebSocket (JSON: commands ↑, telemetry ↓)
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  LOCAL BACKEND SERVER (PC/Laptop)                                            │
│  • Node.js + Express (static files + HTTP)                                   │
│  • WebSocket server (ws)                                                     │
│  • Serial port client (Bluetooth COM port)                                    │
│  • Telemetry parser → forward to browser                                     │
│  • Command forward: browser → serial                                         │
│  • Reconnection, status, anti-flood                                          │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ Serial (SPP over Bluetooth)
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  HC-05 BLUETOOTH MODULE                                                      │
│  • SPP profile (virtual COM port on PC)                                      │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ UART (RX/TX) or SoftwareSerial
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  ARDUINO FIRMWARE                                                            │
│  • Command parser (sequences, queue)                                         │
│  • Modes: COMMAND (setpoint from commands) / AUTO (LDR sun tracking)          │
│  • PID + reaction wheel control (existing logic)                             │
│  • MPU6050 attitude, safety limits, emergency stop                           │
│  • Telemetry output (key:value lines)                                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  ADCS HARDWARE                                                               │
│  • MPU6050 (IMU)   • L293 + DC Motor (reaction wheel)   • LDRs (sun)          │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Data Flow Summary

| Direction   | Path                    | Content |
|------------|--------------------------|--------|
| **Command**| Browser → Backend → Serial → Arduino | User types sequence (e.g. `right_90, hold 2, left_90`); backend sends as single line; Arduino queues and executes. |
| **Telemetry** | Arduino → Serial → Backend → WebSocket → Browser | Arduino prints lines like `angle:45`, `mode:command`, `step:2 cmd:hold 2`; backend parses and forwards as JSON to UI. |

---

## 3. Component Responsibilities

### 3.1 Browser (Website UI)
- Load UI from backend (same host, no direct Arduino access).
- Establish WebSocket to backend (`ws://<host>:<port>/ws`).
- Show connection status (Disconnected / Connecting / Connected / Error).
- Send commands (single or sequence) when user clicks Send.
- Send emergency **stop** on Stop button.
- Display: current angle, mode, system status, current sequence, executing step.

### 3.2 Backend Server
- Serve static website (HTML/CSS/JS).
- Run WebSocket server; accept one or more browser clients.
- Open and hold Bluetooth serial port (configurable port name).
- **To Arduino:** forward command strings from browser (one line per send; optional newline).
- **From Arduino:** read serial line-by-line; parse telemetry (`key:value`); broadcast JSON to all WebSocket clients.
- Handle serial disconnect/reconnect; expose connection status to UI.
- Optional: rate-limit commands (anti-flood).

### 3.3 Arduino Firmware
- **Serial:** Read from HC-05 (SoftwareSerial or hardware Serial); write telemetry to same.
- **Commands:** Parse text commands; support sequence (comma-separated); queue and execute one-by-one.
- **Modes:** COMMAND (setpoint from queue), AUTO (LDR-based sun tracking).
- **Control:** Reuse existing PID + reaction wheel logic; enforce max angle, timeout, emergency stop.
- **Telemetry:** Emit lines: `angle:`, `mode:`, `status:`, `cmd:`, `step:` (and optional others).

---

## 4. Safety Architecture

- **Arduino:** Max rotation limit (e.g. ±60°), emergency angle (e.g. 80°), command timeout, immediate reaction to `stop` and invalid command rejection.
- **Backend:** Optional command rate limit; no direct hardware control.
- **Browser:** Stop button always sends `stop`; UI can show “Emergency stop” when status indicates it.

---

## 5. Exhibition Deployment (Offline)

- PC/laptop runs backend (Node.js); no internet required.
- Browser connects to `http://localhost:<port>` (or host LAN IP).
- Bluetooth: pair HC-05 with PC once; backend uses the assigned COM port.
- All communication stays local: Browser ↔ Backend ↔ Bluetooth ↔ Arduino.

---

## 6. Optional Hooks (Future)

- **LED status:** Arduino sets GPIO by mode/status; backend/UI unchanged.
- **Demo mode:** Backend or UI sends a predefined sequence on a timer.
- **Auto sequence loop:** Arduino or backend repeats a sequence (design hook only).
- **Error monitoring:** Backend logs telemetry and errors; optional log file for debugging.
