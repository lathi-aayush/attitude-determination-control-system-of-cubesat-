# AarambhSat ADCS – Exhibition Software

This repository contains the **software architecture and implementation** for the **AarambhSat** CubeSat Attitude Determination and Control System (ADCS) prototype, used for a **web-based control interface via Bluetooth** at a technical exhibition.

The **hardware and core ADCS logic** follow the project:

**https://github.com/lathi-aayush/attitude-determination-control-system-of-cubesat**

This project **extends** that repo with:

- **Bluetooth command and telemetry** (HC-05)
- **Backend server** (Node.js) as a bridge between browser and serial
- **Website UI** for connection status, orientation, mode, commands, and sequence display
- **Structured command language** and **telemetry format** for reliability

---

## Architecture (summary)

```
Browser (UI)  ←→  WebSocket  ←→  Backend (Node.js)  ←→  Serial (Bluetooth COM)  ←→  HC-05  ←→  Arduino  ←→  ADCS hardware
```

- The **browser** never talks to the Arduino directly.
- The **backend** opens the Bluetooth COM port, parses telemetry from the Arduino, and forwards it to the browser over WebSocket; it also sends commands from the browser to the Arduino.
- The **Arduino** firmware parses command sequences (e.g. `right_90, hold 2, left_90`), runs them in a queue, and prints telemetry lines (`angle:45`, `mode:command`, etc.).

---

## What’s in this repo

| Item | Description |
|------|-------------|
| **docs/ARCHITECTURE.md** | System architecture diagram and component roles |
| **docs/PROTOCOL.md** | Command language and telemetry format |
| **docs/WEBSOCKET_FLOW.md** | WebSocket message types and flow |
| **firmware/AarambhSat_ADCS/** | Arduino sketch: Bluetooth, command queue, COMMAND/AUTO modes, telemetry |
| **backend/** | Node.js + Express + WebSocket + Serial bridge |
| **web/** | Single-page UI: connect, status, command input, Send/Stop, sequence display |
| **SETUP_GUIDE.md** | Step-by-step setup |
| **TESTING.md** | Testing procedure |
| **EXHIBITION_DEPLOYMENT.md** | Exhibition deployment instructions |
| **FOLDER_STRUCTURE.md** | Folder layout |

---

## Quick start

1. **Arduino:** Upload `firmware/AarambhSat_ADCS/AarambhSat_ADCS.ino` (see firmware README for library and wiring).
2. **PC:** Pair HC-05, note the COM port (e.g. COM3).
3. **Backend:**  
   `cd backend && npm install && set SERIAL_PORT=COM3 && npm start`
4. **Browser:** Open http://localhost:3080 → select port (if needed) → Connect → send e.g. `right_90` or `right_90, hold 2, left_90`.

---

## Safety

- **Arduino:** Max angle, emergency angle, command timeout, and `stop` command (see PROTOCOL.md and firmware).
- **Backend:** Optional command rate limiting.
- **UI:** Stop button sends `stop` for emergency stop.

---

## License

Use and adapt as needed for the exhibition. The original hardware/code is under the license of the [attitude-determination-control-system-of-cubesat](https://github.com/lathi-aayush/attitude-determination-control-system-of-cubesat) repository.
