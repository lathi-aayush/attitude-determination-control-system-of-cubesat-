# AarambhSat – Attitude Direction and Control System
---
## Project Website
![Website Aarambhsat](diagrams/website_project_page.png)
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


| Concept                                  | Link                                                                                  |
| ---------------------------------------- | ------------------------------------------------------------------------------------- |
| Component Technical Sheet                | [Component Technical Sheet](assets/Component_Technical_Sheet.pdf)                  |
| What makes the satellite rotate          | [Reaction Wheel Theory](docs/reaction-wheel-theory.md)                                     |
| Cube sat Battery Module                  | [Rechargeable battery module](docs/rechargeable-battery-module-adjustable-output-35v.md)   |
| Physics behind reaction wheel            | [Tutorial/Theory on Reaction Wheel](https://youtu.be/zkB3eqjh_mk?si=pBcxIVd9OCK9g9aG) |
| About the MPU6050                        | [MPU6050 notes](docs/mpu6050-notes.md)                                                     |
| documentation of MPU6050                 | [MPU6050 datasheet (PDF)](assets/documentation_MPU6050_light.pdf)            |
| stablising the accelerometer and gyro    | [Stabilising Accelerometer and Gyro](docs/stabilising-accelerometer-and-gyro.md)          |
| failing motor threshold issue            | [Motor threshold Error debugging](docs/motor-threshold-error-debugging.md)                 |
| Lipo battery connections                 | [How to use the LiPo battery](docs/how-to-use-the-lipo-battery.md)                        |
| difference between li-ion and li-polymer | [Difference between lithium-ion and lithium-polymer](docs/difference-between-lithium-ion-and-lithium-polymer.md) |
| powering my arduino                      | [How to power my Arduino Uno](docs/how-to-power-my-arduino-uno.md)                        |
| CLI commands    | [AarambhSat CLI Commands](docs/CLI_commands.md)                                         |
| 3D model diagram                         | ![3D model – side view](hardware/cad/3D_model_side_aarambhsat.jpg)                |
|                                          | ![3D model – back view](hardware/cad/3D_model_back_aarambhsat.jpg)                |
|                                          | ![3D model – front view](hardware/cad/3D_model_front_aarambhsat.jpg)              |
| Schematic Connection diagram             | ![AarambhSat schematic](hardware/schematics/AarambhSat-block-diagram.png)         |

## Licensing

- **Code and documentation:** MIT License — see [LICENSE](LICENSE). You may use this repo to build your own attitude control system.
- **3D models and mechanical designs** (in `hardware/cad/` and `hardware/schematics/`): **All rights reserved.** Permission is required before using, modifying, or manufacturing from these designs. See [hardware/LICENSE-3D-MODELS.md](hardware/LICENSE-3D-MODELS.md).
