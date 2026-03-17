# AarambhSat ADCS Firmware

Upload this sketch to the Arduino. It extends the [attitude-determination-control-system-of-cubesat](https://github.com/lathi-aayush/attitude-determination-control-system-of-cubesat) logic with Bluetooth commands and telemetry.

## Library

The original repo uses an MPU6050 library that provides `getAngleY()` (and `begin()`, `update()`). If your repo uses **Adafruit_MPU6050**, that library does not provide `getAngleY()`; you need either:

- The same library as in the original repo (e.g. **MPU6050** by Electronic Cats, or a fork that adds angle calculation), or  
- A small wrapper that computes angle from accel/gyro and exposes `getAngleY()`.

Adjust the `#include` and `mpu` object in the sketch to match your library.

## Wiring

- **HC-05:** TX → Arduino pin 2 (RX), RX → Arduino pin 3 (TX) via voltage divider (HC-05 is 3.3 V).
- **LDRs (AUTO mode):** Left = A0, Right = A1.
- Motor and MPU6050 as in the original repo (ENA=5, A1=9, A2=10; I2C).

## Baud rate

- Bluetooth serial: **9600** (change `BTSerial.begin(9600)` if your HC-05 is configured differently).
