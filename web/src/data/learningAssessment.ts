/** Module 04 — ADCS / reaction wheels (knowledge check). */

export type QuizOption = { key: string; text: string };

export type QuizQuestion = {
  id: string;
  question: string;
  options: QuizOption[];
  /** Correct option key, e.g. "B" */
  correctKey: string;
  explanation: string;
};

export const LEARNING_ASSESSMENT_QUESTIONS: QuizQuestion[] = [
  {
    id: "rw-1",
    question:
      "If a reaction wheel accelerates clockwise (as viewed from above), in which direction does the spacecraft body tend to rotate to conserve angular momentum?",
    options: [
      { key: "A", text: "Clockwise (same as the wheel)" },
      { key: "B", text: "Counter-clockwise (opposite to the wheel’s added angular momentum)" },
      { key: "C", text: "No rotation — wheels do not affect the body" },
      { key: "D", text: "Linear translation only, no rotation" },
    ],
    correctKey: "B",
    explanation:
      "The total angular momentum of the system is conserved. The wheel’s change in angular momentum is balanced by an opposite change in the spacecraft body.",
  },
  {
    id: "rw-2",
    question:
      "In τ = I·α, what does τ represent in a typical ADCS context?",
    options: [
      { key: "A", text: "Linear momentum" },
      { key: "B", text: "Torque applied about the spin axis" },
      { key: "C", text: "Rotational kinetic energy only" },
      { key: "D", text: "Orbital altitude" },
    ],
    correctKey: "B",
    explanation: "τ is torque (N·m). I is moment of inertia and α is angular acceleration (rad/s²).",
  },
  {
    id: "rw-3",
    question:
      "Why are reaction wheels often preferred over chemical thrusters for fine attitude control?",
    options: [
      { key: "A", text: "They do not consume propellant for small corrections" },
      { key: "B", text: "They always provide more thrust than thrusters" },
      { key: "C", text: "They work only outside Earth orbit" },
      { key: "D", text: "They replace the need for any star tracker" },
    ],
    correctKey: "A",
    explanation:
      "Reaction wheels exchange momentum electrically; thrusters expend mass. Wheels are ideal for continuous, low-torque pointing.",
  },
  {
    id: "rw-4",
    question:
      "A gyro (rate) and accelerometer pair in an IMU such as the MPU6050 is primarily used to estimate:",
    options: [
      { key: "A", text: "Battery voltage" },
      { key: "B", text: "Orientation and rotational motion of the spacecraft body" },
      { key: "C", text: "Downlink data rate" },
      { key: "D", text: "Solar panel manufacturing date" },
    ],
    correctKey: "B",
    explanation:
      "Fusion of gyro and accel (with calibration/filters) supports attitude estimation on board.",
  },
  {
    id: "rw-5",
    question:
      "If angular acceleration α is held constant, how does angular velocity change over time t (starting from 0)?",
    options: [
      { key: "A", text: "ΔΩ = α · t" },
      { key: "B", text: "ΔΩ = α / t" },
      { key: "C", text: "ΔΩ = α² · t" },
      { key: "D", text: "ΔΩ is always zero" },
    ],
    correctKey: "A",
    explanation: "With constant α, angular velocity grows linearly: ΔΩ = α·t (same axis, consistent units).",
  },
  {
    id: "rw-6",
    question:
      "What is a common limitation of reaction wheels that must be managed over a long mission?",
    options: [
      { key: "A", text: "They cannot spin in vacuum" },
      { key: "B", text: "Angular momentum can saturate; momentum must be dumped (e.g. with thrusters)" },
      { key: "C", text: "They only work when the Sun is behind Earth" },
      { key: "D", text: "They require continuous radio uplink" },
    ],
    correctKey: "B",
    explanation:
      "Wheels store momentum; eventually desaturation is needed so torques stay within actuator limits.",
  },
];
