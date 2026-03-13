link : [Power any arduino project](https://youtu.be/ewZY9oNbcds?si=LO1CGngkC8jY5ozl)
___
#### **How Arduino Receives Power:**
- **Three Main Ways:**
    - **VIN Pin / Barrel Jack:** Can accept 7–12V (sometimes slightly outside this range, depending on Arduino model). Input goes to an internal voltage regulator, converting it down to 5V.
    - **USB Port:** Provides 5V directly (bypasses voltage regulator). Used for development—allows uploading code and monitoring serial data.
    - **5V Pin:** Direct input to the board’s 5V rail, bypassing the regulator. Meant for advanced setups with stable regulated 5V supply.
- **Safe Dual Supply Handling:** If both VIN/barrel power and USB are connected, Arduino cuts off USB power using a P-Channel MOSFET, but USB data connectivity still works.

**Supplying Power via Arduino for Simple Projects:**
- For projects needing less than 1A and only 5V or 3.3V, you can supply power through the board (USB or VIN) and distribute 5V/GND from those pins to your circuit.
- Example: A breadboard setup with Arduino Nano, LED powered from the 5V rail.
- **Limitations:** Most boards supply up to 1A; Nano may be rated for 800mA. Check your supply’s capacity.

**Supplying Higher Voltage for Demanding Projects:**
- Use a higher voltage supply through VIN/barrel jack (e.g., 12V). The voltage regulator provides the Arduino’s internal 5V, while the external supply can power components like motors or solenoids, controlled by the Arduino.
- **Breadboard Limit:** Breadboards are not suited for handling high currents (>1A)—soldered perf boards are better for real builds.

**Bypassing the Regulator for High-Power Projects (Direct 5V Supply):**

- Use an external, regulated 5V supply connected directly to Arduino’s 5V pin.
- This allows unlimited 5V current to the circuit, great for big projects with LED strips, motors, etc.
- If you pull out the Arduino, the rest of the circuit remains powered.

**Using Multiple Power Supplies:**

- For projects needing different voltages (e.g., a 24V solenoid and 5V electronics):
    - Use a 24V supply only for the solenoid.
    - Use a separate regulated 5V supply for the Arduino via its 5V pin.
    - Connect all grounds together for proper reference, unless purposely isolated.

**Critical Tips When Powering via 5V Pin:**

- Only use a stable, regulated 5V supply. Do not use batteries or higher voltages.
- Never connect VIN/barrel power or USB at the same time as 5V pin supply—this can damage the board.
- Disconnect the Arduino from a project when programming via USB; consult the official Arduino website warnings and best practices.

**Battery Power Considerations:**

- For portable projects, you can use batteries:
    - **9V Alkaline Battery:** Acceptable voltage range for VIN; use a battery barrel connector.
    - **LiPo Batteries:** Use only with protection circuitry. New boards may have dedicated LiPo connectors with built-in safety features.

**Conclusion and Additional Resources:**

- Emphasizes not mixing supplies and following safe wiring practices.
- Links to further tutorials (e.g., using solenoids, battery power).
- Encourages leaving questions or comments for more battery-specific project guides.

**Key Warnings:**

- Do not mix power input types.
- Mind the maximum current ratings.
- Breadboards are not for high-power use.
- Solder connections for safety and reliability in final projects.
- Double-check voltage and supply specs for your components.

This summary covers concepts in detail, including practical setups, safety cautions, and multiple wiring scenarios, helping ensure any Arduino project is powered safely and efficiently.
