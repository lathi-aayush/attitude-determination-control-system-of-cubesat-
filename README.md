# AarambhSat – Attitude Direction and Control System
---
## Significance of ADCS 
• ADCS keeps the satellite <mark style="background: #BBFABBA6;">stable and correctly oriented </mark> <br>
• It helps point solar panels towards the Sun  
• It allows antennas to aim at Earth for communication  

---
## What We Achieved in Our Project
• Built a <mark style="background: #BBFABBA6;">working attitude control system using a reaction wheel  </mark><br>
• Implemented light based tracking with LDR sensors  
• Achieved stable orientation control with the MPU6050  
• <mark style="background: #BBFABBA6;">Designed modular 3D printed chassis</mark>

---
## What a Reaction Wheel Is
• A <mark style="background: #BBFABBA6;">spinning mass </mark> that causes the satellite to rotate the opposite way  
• It works using conservation of angular momentum  
• <mark style="background: #BBFABBA6;">It rotates the satellite without using fuel </mark> 

---
## Project Photo
![AarambhSat](diagrams/aarambhsat_cubesat.jpg)

## References 
KIBOCUBE Academy

## Project structure
- `docs/` – theory, notes, and design decisions
- `hardware/` – schematics and 3D models
- `firmware/` – Arduino / embedded code for the controller

## Quick start
1. Open `firmware/attitude-controller` in Arduino IDE or PlatformIO.
2. Flash to Arduino Uno.
3. See `docs/making-the-attitude-system.md` for wiring and setup.

## References
See `references/links.md` for tutorials, datasheets, and background reading.