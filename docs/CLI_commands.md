# AarambhSat CLI Commands

![Website Aarambhsat](../diagrams/website_project_page.png)
---
### List of Commands

| Command    | Description |
|-----------|-------------|
| `right_90`  | Rotate right by 90° (setpoint += 90) |
| `right_180` | Rotate right by 180° |
| `left_90`   | Rotate left by 90° (setpoint -= 90) |
| `left_180`  | Rotate left by 180° |
| `hold`      | Hold current setpoint indefinitely |
| `hold N`    | Hold current setpoint for N seconds (N integer) |
| `stop`      | Emergency stop: stop motor, clear queue, optional mode switch |
| `auto`      | Switch to AUTO mode (LDR sun tracking) |


## Rotation Commands

- `right_90`  
Rotate yaw by `+90°`.
- `left_90`  
Rotate yaw by `-90°`.
- `rotate <x|y|z> <degrees>`  
Rotate the selected axis by signed degrees.  
Example: `rotate y 15`, `rotate x -30`, `rotate z 45`.

## Timing and Mode

- `hold <seconds>`  
Hold the current orientation for the requested time (especially useful inside sequences).  
Example: `hold 2`.
- `auto`  
Switch to auto mode (simulation acknowledgement in web UI).

## System Commands

- `reset`  
Reset pose and restore signal to default.
- `status`  
Print signal and current roll/pitch/yaw angles.
- `signal <0-100>`  
Set simulated signal strength percentage.  
Example: `signal 80`.
- `help`  
Print command help.
- `stop`  
Stop currently running sequence.

## Sequence Syntax

Use comma-separated steps to run a command sequence:

- `right_90, hold 2, left_90`
- `rotate x 20, hold 1.5, rotate x -20`

