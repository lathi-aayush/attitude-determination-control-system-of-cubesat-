# AarambhSat ADCS – Step-by-Step Setup Guide

## 1. Hardware

- Ensure the CubeSat prototype is built as in the [original repo](https://github.com/lathi-aayush/attitude-determination-control-system-of-cubesat).
- Add **HC-05** Bluetooth module:
  - HC-05 **TX** → Arduino **pin 2** (RX) via voltage divider (HC-05 is 3.3 V).
  - HC-05 **RX** → Arduino **pin 3** (TX) via voltage divider.
- LDRs for AUTO mode: left = A0, right = A1 (if used).

## 2. Arduino firmware

1. Open the `firmware/AarambhSat_ADCS` folder in Arduino IDE (or open `AarambhSat_ADCS.ino`).
2. Install the same **MPU6050** library used in the original repo (the sketch expects `getAngleY()`, `begin()`, `update()`). If you use Adafruit_MPU6050, add a wrapper or switch to a library that provides angle output. See `firmware/AarambhSat_ADCS/README.md`.
3. Select your board and port (USB for upload).
4. Upload the sketch.
5. Set HC-05 baud rate to **9600** if needed (default in sketch is 9600).

## 3. Backend (PC/Laptop)

1. Install **Node.js** (v18 or newer): https://nodejs.org/
2. Open a terminal in the project root (e.g. `c:\Users\mayan\Documents\ADCS`).
3. Go to backend and install dependencies:
   ```bash
   cd backend
   npm install
   ```
4. (Optional) Set the Bluetooth COM port so the backend auto-connects:
   - Windows: e.g. `set SERIAL_PORT=COM3` then `npm start`
   - Or start without it and use the website to select the port and click “Connect”.
5. Start the server:
   ```bash
   npm start
   ```
   You should see: `AarambhSat ADCS backend: http://localhost:3080`

## 4. Pair Bluetooth (first time)

1. On the PC, open **Bluetooth settings**.
2. Put HC-05 in pairing mode (see module manual).
3. Pair the device. Note the **COM port** assigned (e.g. COM3, COM4). On Windows: Device Manager → Ports (COM & LPT).

## 5. Website

1. With the backend running, open a browser and go to: **http://localhost:3080**
2. In the UI:
   - Click **Refresh** to load the list of COM ports.
   - Select the port that corresponds to the HC-05 (e.g. COM3).
   - Click **Connect**. Status should show “Connected” / “Serial connected”.
3. You can now:
   - See orientation, mode, and system status.
   - Type a command or sequence (e.g. `right_90`, or `right_90, hold 2, left_90`).
   - Click **Send** to run it.
   - Click **Stop** for emergency stop.

## 6. Troubleshooting

- **No COM port for HC-05:** Re-pair the device; install any required Bluetooth serial driver; check Device Manager.
- **“Serial not connected”:** Ensure the correct COM port is selected and the Arduino is powered and running the sketch; try Disconnect then Connect again.
- **No telemetry:** Check HC-05 wiring (TX→Arduino RX, RX→Arduino TX with divider); confirm baud rate 9600 on both sides; open Serial Monitor on USB to see if the sketch runs (if you add debug prints to Serial).
- **Port in use:** Close other apps (Arduino Serial Monitor, other terminal tools) that might be using the same COM port.
