### 🧠 Concept Recap (in simple terms)

MPU6050 gives:

- **Accelerometer angle** → stable but noisy during motion
    
- **Gyroscope rate** → smooth but drifts over time
    

We combine them:

```
roll = α * (previous_roll + gyro_rate * dt) + (1 - α) * accel_angle
```

where α ≈ 0.98

This blends the fast gyroscope with stable accelerometer → smooth + accurate roll.

---

---

### 🧩 Connection Summary

|Component|Arduino Pin|
|---|---|
|VCC|5V|
|GND|GND|
|SDA|A4|
|SCL|A5|

---

### 🧾 Serial Plotter

1. Upload the code.
    
2. Open **Serial Plotter (Ctrl+Shift+L)**.
    
3. Set baud rate to **9600**.
    
4. Tilt your CubeSat → you’ll see **smooth roll variation** between roughly -90° to +90°.
    
