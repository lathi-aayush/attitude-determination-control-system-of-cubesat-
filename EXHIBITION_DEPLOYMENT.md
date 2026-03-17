# AarambhSat ADCS – Exhibition Deployment Instructions

## Goal

Run the ADCS control system reliably in an **offline** exhibition environment: visitors use a browser on a single PC/laptop to connect to the Arduino via Bluetooth and send commands.

---

## Checklist

### Hardware

- [ ] CubeSat prototype powered and stable (battery or USB as per design).
- [ ] HC-05 paired with the exhibition PC/laptop; COM port known (e.g. COM3).
- [ ] Reaction wheel and MPU6050 working (tested beforehand with the same firmware).

### Software (on exhibition PC)

- [ ] **Node.js** (v18+) installed.
- [ ] Project copied to the PC (e.g. `ADCS` folder with `backend/`, `web/`, `firmware/`).
- [ ] Dependencies installed: `cd backend && npm install`.
- [ ] No other application using the Bluetooth COM port (Serial Monitor, other tools closed).

### One-time setup on the day

1. Power the Arduino and wait for the sketch to start.
2. On the PC, start the backend:
   ```bash
   cd path\to\ADCS\backend
   set SERIAL_PORT=COM3
   npm start
   ```
   Replace `COM3` with the actual HC-05 COM port. If you prefer to choose the port from the UI, omit `set SERIAL_PORT=...` and use the website “Connect” button.
3. Open the browser and go to: **http://localhost:3080**
4. If not using auto-connect: select the HC-05 port, click **Connect**. Confirm “Serial connected” and that orientation/status update.
5. Optionally run one test sequence (e.g. `right_90, hold 2, left_90`) to confirm end-to-end.

### During the exhibition

- Keep the backend running and the browser tab open.
- Visitors can:
  - View **orientation**, **mode**, and **system status**.
  - Type commands or sequences and click **Send**.
  - Click **Stop** for emergency stop.
- If Bluetooth disconnects: click **Disconnect**, then **Connect** again (and select the port if needed). If the port changed after a reboot, use **Refresh** then **Connect**.

### Optional: run without internet

- The system works fully **offline**: no external servers. Only the browser and the backend on the same machine, and Bluetooth to the Arduino.
- To allow other devices on the same Wi‑Fi to open the UI (e.g. tablet), start the server bound to the LAN IP and open `http://<LAN_IP>:3080` (and ensure firewall allows port 3080). This is optional; the default localhost is enough for a single exhibition laptop.

### Optional: auto-start backend

- Create a shortcut or batch file that:
  1. Sets `SERIAL_PORT` to your HC-05 port.
  2. Runs `node server.js` from the `backend` folder.
- Or use a process manager / task scheduler to run `npm start` in `backend` at login.

### If something goes wrong

- **No telemetry:** Check power and wiring; reconnect Bluetooth from the UI; restart the backend if needed.
- **Port in use:** Close any app using the COM port (Arduino IDE Serial Monitor, etc.); then reconnect from the UI.
- **Motor not moving:** Verify hardware and firmware (e.g. test with Serial Monitor over USB with the same sketch); check safety limits (angle, emergency stop).

---

Summary: **Backend on PC → Bluetooth COM port → Arduino.** **Browser → WebSocket → Backend.** All code is modular and commented for quick adjustments (e.g. COM port, baud rate, safety limits) without changing the overall architecture.
