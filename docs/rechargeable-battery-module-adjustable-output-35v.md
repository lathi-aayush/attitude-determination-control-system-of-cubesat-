![Battery Module](diagram/battery_module.jpg)
# 🔋 **Battery Module**

## **1. Components**

- **Battery:** 3.7V 400mAh (HTCFR26650, protected)
    
- **Charger:** TP4056 Type-C (B+/B– for battery, OUT+/OUT– for load)
    
- **Booster:** XL6009 (3–32V in → adjustable out)
    
- **Switch:** between battery power line
    
---

## **2. Wiring**

**Battery → TP4056**

```
B+ ← Battery +
B– ← Battery –
USB-C → charges battery
```

**Power Out → System**

```
TP4056 OUT+ → Switch → XL6009 IN+
TP4056 OUT– → XL6009 IN–
```

**Booster → Arduino**

```
XL6009 OUT+ → 5V
XL6009 OUT– → GND
```

---

## **3. Purpose (Why)**

- **B+ / B–:** direct battery charging
    
- **OUT+ / OUT–:** protected output (cuts off during short/low-voltage)
    
- **Switch:** turn system on/off; charging still works when off
    
- **XL6009:** keeps Arduino at steady 5V from 3.0–4.2V battery
    

---

## **4. Booster Adjustment**

1. Switch ON
    
2. Measure XL6009 OUT
    
3. Turn potentiometer → set **exactly 5.00V**
    
4. Confirm stable reading
    

---

## **5. Tests**

**Charger:**

- Red = charging, Blue/Green = full
    
- Battery voltage rises toward 4.2V
    

**Protection Output:**

- OUT+ / OUT– = battery voltage
    
- 0V = protection triggered
    

**Switch:**

- OFF = 0V at booster
    
- ON = battery voltage to booster
    

**Booster:**

- Output must be **5.00V**
    

**Load Test:**

- 10Ω resistor → output stays >4.8V
    
- No overheating
    

**Arduino Test:**

- Connect 5V/GND
    
- Switch ON → stable boot, no resets
    

---

## **6. Final Status**

- Battery charges safely
    
- Protection works
    
- Booster outputs clean 5V
    
- Switch isolates system
    
- Arduino powered reliably
    

**Battery module complete and functional.** 