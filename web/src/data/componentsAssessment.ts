/** Hardware manifest — sensors, power, motion (knowledge check). */

export type QuizOption = { key: string; text: string };

export type QuizQuestion = {
  id: string;
  question: string;
  options: QuizOption[];
  correctKey: string;
  explanation: string;
};

export const COMPONENTS_ASSESSMENT_QUESTIONS: QuizQuestion[] = [
  {
    id: "hw-1",
    question:
      "Which component is appropriate to step up a 3.7 V Li-ion cell to a stable 5 V rail for an Arduino Uno?",
    options: [
      { key: "A", text: "MPU6050 (IMU)" },
      { key: "B", text: "XL6009 boost converter module" },
      { key: "C", text: "LDR only" },
      { key: "D", text: "TP4056 charger (output is charge control, not generic 5 V boost)" },
    ],
    correctKey: "B",
    explanation:
      "A boost (step-up) converter raises voltage; the XL6009 module is a common adjustable boost board.",
  },
  {
    id: "hw-2",
    question: "Which part is primarily used to charge a single-cell Li-ion safely on the bench?",
    options: [
      { key: "A", text: "L293D motor driver" },
      { key: "B", text: "TP4056 charging module" },
      { key: "C", text: "MPU6050" },
      { key: "D", text: "Raw 9 V battery clip to cell terminals" },
    ],
    correctKey: "B",
    explanation:
      "TP4056 modules implement constant-current / constant-voltage charging with protection on many boards.",
  },
  {
    id: "hw-3",
    question:
      "You need bidirectional speed control of a small DC motor from microcontroller PWM. A typical choice is:",
    options: [
      { key: "A", text: "L293D H-bridge driver" },
      { key: "B", text: "LDR alone" },
      { key: "C", text: "TP4056" },
      { key: "D", text: "Arduino analog pin only (no driver)" },
    ],
    correctKey: "A",
    explanation:
      "H-bridge drivers like the L293D allow direction and speed control; MCU pins cannot drive motors directly.",
  },
  {
    id: "hw-4",
    question: "An LDR (photoresistor) is best described as:",
    options: [
      { key: "A", text: "A light-dependent resistor for rough ambient light sensing" },
      { key: "B", text: "A 6-axis inertial sensor" },
      { key: "C", text: "A precision voltage reference" },
      { key: "D", text: "A Bluetooth radio" },
    ],
    correctKey: "A",
    explanation:
      "LDR resistance changes with light; often used in a divider for sun presence / simple tracking experiments.",
  },
  {
    id: "hw-5",
    question:
      "On a student CubeSat bench, which board usually runs the main control loop and reads I2C sensors?",
    options: [
      { key: "A", text: "Arduino Uno (ATmega328P) or similar MCU board" },
      { key: "B", text: "XL6009 alone" },
      { key: "C", text: "18650 cell without BMS" },
      { key: "D", text: "Passive breadboard only" },
    ],
    correctKey: "A",
    explanation:
      "The Uno (or compatible) runs firmware, reads MPU6050 over I2C, and commands drivers.",
  },
  {
    id: "hw-6",
    question:
      "Why is a 10 kΩ resistor often paired with an LDR in a voltage divider for Arduino analog input?",
    options: [
      { key: "A", text: "To convert varying light into a usable 0–5 V range at the ADC pin" },
      { key: "B", text: "To increase motor torque" },
      { key: "C", text: "To enable Wi-Fi" },
      { key: "D", text: "To replace the need for ground" },
    ],
    correctKey: "A",
    explanation:
      "The divider maps photoresistance changes to a voltage the ADC can sample.",
  },
];
