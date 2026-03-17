# AarambhSat ADCS – Testing Procedure

## Pre-requisites

- Hardware assembled; HC-05 connected; firmware uploaded.
- Backend running; browser open at http://localhost:3080.
- Serial (Bluetooth) connected from the UI.

---

## 1. Connection

- [ ] Click **Refresh**; at least one COM port appears.
- [ ] Select the HC-05 COM port; click **Connect**; status shows “Connected” / “Serial connected”.
- [ ] **Orientation** and **System** values update over time (telemetry from Arduino).
- [ ] Click **Disconnect**; status shows disconnected; telemetry stops updating.
- [ ] Connect again; telemetry resumes.

## 2. Single commands

- [ ] Send `right_90`: platform rotates right; orientation value changes; step/command display updates.
- [ ] Send `left_90`: platform rotates left.
- [ ] Send `hold 2`: platform holds for ~2 seconds then step completes (if in a sequence).
- [ ] Send `auto`: mode switches to Auto; behaviour follows LDR (if wired).

## 3. Sequence

- [ ] Send `right_90, hold 2, left_90`.
- [ ] **Current sequence** shows three steps.
- [ ] **Executing** shows “Step 1 — right_90”, then “Step 2 — hold 2”, then “Step 3 — left_90”.
- [ ] After completion, step goes to 0 and sequence clears or shows idle.

## 4. Stop

- [ ] Start a sequence (e.g. `right_90, left_90`).
- [ ] While it is running, click **Stop**.
- [ ] Motor stops; queue clears; status returns to ok (or similar); no further steps execute.

## 5. Safety

- [ ] Tilt the platform beyond the safe angle (e.g. > 60°): motor behaviour reduces or stops; telemetry may show limit/emergency.
- [ ] Return to safe angle: control resumes.
- [ ] Send an invalid command (e.g. `right_45` if not supported): backend may still send it; Arduino should reject and report error/status.

## 6. Exhibition-style run

- [ ] Run backend on exhibition laptop; open UI in browser.
- [ ] Connect Bluetooth; run a short sequence (e.g. `right_90, hold 2, left_90`).
- [ ] Verify visitors can read orientation and status and use Send/Stop without errors.
- [ ] Disconnect and reconnect once to confirm robustness.

---

Record any failures (command, step, message) for debugging. Use Serial Monitor over USB (if debug output is enabled) to see raw Arduino telemetry and command reception.
