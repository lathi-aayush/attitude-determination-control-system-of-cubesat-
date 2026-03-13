![Reaction Wheel Diagram](diagrams/reaction-wheel-diagram-2.png)
---

Reference Link : [Tutorial/Theory on Reaction Wheel](https://youtu.be/zkB3eqjh_mk?si=pBcxIVd9OCK9g9aG)

## What is a Reaction Wheel?

- A reaction wheel is a type of electrically driven flywheel used mainly in spacecraft and satellites for precise attitude (orientation) control. By accelerating or decelerating the rotation of the wheel, a spacecraft can be made to rotate in the opposite direction, thanks to the conservation of angular momentum.
- A reaction wheel is an electric motor attached to a rotating mass (flywheel), typically arranged along an axis inside the satellite or spacecraft.
- When the wheel spins faster, the spacecraft responds by rotating in the reverse direction about the same axis; slowing the wheel has the opposite effect.

## Scientific Theory Behind Reaction Wheels

A reaction wheel operates on the **conservation of angular momentum**. In the absence of external torques, the total angular momentum of a closed system (here: the spacecraft plus the internal flywheel) remains constant.

## Key Scientific Concepts:

- **Angular Momentum Conservation:** If the angular velocity (rotational speed) of the wheel changes, the spacecraft must rotate in the opposite direction by an equal amount, so the vector sum of angular momenta stays constant.[](https://en.wikipedia.org/wiki/Reaction_wheel)
    
- **Torque Generation:** The torque applied to the wheel (using an electric motor) results in an equal and opposite torque applied to the spacecraft body, causing it to rotate.
    
- **Internal Momentum Exchange:** Reaction wheels cannot change the **total** angular momentum of the spacecraft, but they can **redistribute** it between the wheel and the spacecraft body to control orientation.[](https://www.aero.iitb.ac.in/satelliteWiki/index.php/Reaction_Wheels)
    
- **No External Forces Needed:** Since the forces involved are entirely internal to the spacecraft, attitude adjustment is possible without expending propellant or interacting with the external environment.
    

Mathematically, 
![Conservation of Angular Momentum](diagram/conservation-of-angular-momentom-in-reaction-wheel.png)
This is the core scientific principle behind how reaction wheels control a spacecraft's orientation.

### Purpose and Applications

- The main purpose is to achieve attitude control — to point or orient the spacecraft very precisely without using fuel or rockets.
- Reaction wheels are crucial for missions requiring steady pointing, like telescopes observing a star, or for reorienting satellites after deployment.
- For full three-axis (X, Y, Z) control in space, usually three or four reaction wheels are installed, each aligned along a different axis.


### Key Benefits

- Allows accurate positioning and stabilization without consuming fuel.
- Reduces the need for rocket thrusters or propellant, saving mass and cost.
- Provides continuous and fine attitude adjustments, essential for high-precision instruments.

In hobby and educational projects, like the Arduino MPU6050 model found on Printables, a reaction wheel demonstrates these principles in one axis, showing how software (typically PID control) manages the balancing and stabilization process.

---

![Reaction Wheel Diagram](diagrams/reaction-wheel-diagram.png)

---

