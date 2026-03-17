/*
 * AarambhSat ADCS – Exhibition Firmware
 * Extends: attitude-determination-control-system-of-cubesat (stable motor + BT)
 *
 * Features:
 * - Bluetooth (HC-05) command and telemetry
 * - Command sequence parsing: right_90, left_90, hold, hold N, stop, auto
 * - COMMAND mode (setpoint from queue) and AUTO mode (LDR sun tracking)
 * - PID + reaction wheel control, MPU6050, safety limits
 *
 * Wiring: HC-05 TX → Arduino RX (pin 2), HC-05 RX → Arduino TX (pin 3) via voltage divider
 * LDRs: Left = A0, Right = A1 (optional for AUTO mode)
 */

// ----- MPU6050: use the SAME library as the original repo -----
// Required: mpu.begin() (return 0 on success), mpu.update(), mpu.getAngleY().
// Example: MPU6050 by Electronic Cats, or the library used in
// github.com/lathi-aayush/attitude-determination-control-system-of-cubesat
#include <Wire.h>
#include <SoftwareSerial.h>
// Replace the next two includes with your repo's MPU6050 library.
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>

SoftwareSerial BTSerial(2, 3); // RX, TX for HC-05
#define SERIAL_CMD BTSerial   // Command input and telemetry output over Bluetooth
#define SERIAL_DEBUG Serial   // Optional USB debug

Adafruit_MPU6050 mpu;
// If your library uses "MPU6050 mpu(Wire);" instead, use that and remove Adafruit includes.

// ----- Motor pins (L293) -----
#define ENA 5
#define A1  9
#define A2  10

// ----- LDR pins (for AUTO mode) -----
#define LDR_LEFT  A0
#define LDR_RIGHT A1

// ----- PID parameters -----
float Kp = 2.5;
float Ki = 0.08;
float Kd = 0.8;

// ----- Safety and limits -----
#define MAX_ANGLE       60.0f
#define MAX_SPEED       220
#define MIN_SPEED       15
#define EMERGENCY_ANGLE 80.0f
#define DEADBAND        0.3f
#define ANGLE_TOLERANCE 3.0f   // Degrees: consider "reached" setpoint
#define CMD_TIMEOUT_MS  30000  // Abort step if not reached in 30 s

// ----- Command queue -----
#define MAX_STEPS 16
#define MAX_CMD_LEN 32

enum CmdType {
  CMD_NONE,
  CMD_RIGHT_90,
  CMD_RIGHT_180,
  CMD_LEFT_90,
  CMD_LEFT_180,
  CMD_HOLD,      // Hold indefinitely
  CMD_HOLD_N,    // Hold N seconds
  CMD_STOP,
  CMD_AUTO
};

struct QueuedCmd {
  CmdType type;
  int value;  // For CMD_HOLD_N: seconds
};

QueuedCmd cmdQueue[MAX_STEPS];
int queueLen = 0;
int currentStep = 0;          // 1-based index of step being executed
bool queueActive = false;     // True while executing a sequence

// ----- Mode -----
enum Mode { MODE_COMMAND, MODE_AUTO };
Mode currentMode = MODE_COMMAND;

// ----- PID and control state -----
float setPoint = 0;
float error = 0, prevError = 0;
float integral = 0;
float derivative, output;
float targetSpeed = 0, currentSpeed = 0;
float speedRampRate = 100.0f;
unsigned long prevTime = 0;
unsigned long lastTelemetry = 0;
unsigned long stepStartTime = 0;
unsigned long holdUntil = 0;  // For hold N: millis() when to advance

bool emergencyStop = false;
bool motorEnabled = true;
bool holdIndefinite = false;

const unsigned long TELEMETRY_INTERVAL_MS = 150;

// ----- Forward declarations -----
void parseAndQueueCommand(const char* line);
void executeNextStep();
void updateCommandMode(float roll);
void updateAutoMode();
void sendTelemetry(float roll);
void sendTelemetryLine(const char* key, const char* value);
void sendTelemetryLine(const char* key, int value);
void sendTelemetryLine(const char* key, float value);

void setup() {
  SERIAL_DEBUG.begin(115200);
  SERIAL_CMD.begin(9600);
  Wire.begin();

  byte status = mpu.begin();
  if (status != 0) {
    SERIAL_DEBUG.println("MPU6050 connection failed!");
    sendTelemetryLine("status", "error");
    while (1) { delay(100); }
  }
  SERIAL_DEBUG.println("MPU6050 OK");

  pinMode(ENA, OUTPUT);
  pinMode(A1, OUTPUT);
  pinMode(A2, OUTPUT);
  pinMode(LDR_LEFT, INPUT);
  pinMode(LDR_RIGHT, INPUT);

  stopMotor();
  prevTime = millis();
  lastTelemetry = millis();

  sendTelemetryLine("status", "ok");
  sendTelemetryLine("mode", currentMode == MODE_AUTO ? "auto" : "command");
}

void loop() {
  mpu.update();
  float roll = mpu.getAngleY();

  // ----- Read Bluetooth commands -----
  static char cmdBuffer[128];
  static int cmdLen = 0;
  while (SERIAL_CMD.available()) {
    char c = SERIAL_CMD.read();
    if (c == '\n' || c == '\r') {
      if (cmdLen > 0) {
        cmdBuffer[cmdLen] = '\0';
        parseAndQueueCommand(cmdBuffer);
        cmdLen = 0;
      }
    } else if (cmdLen < (int)(sizeof(cmdBuffer) - 1)) {
      cmdBuffer[cmdLen++] = c;
    }
  }

  // ----- Emergency conditions -----
  if (abs(roll) > EMERGENCY_ANGLE) {
    emergencyStop = true;
    sendTelemetryLine("status", "emergency_stop");
  }
  if (emergencyStop && abs(roll) < MAX_ANGLE) {
    emergencyStop = false;
    motorEnabled = true;
    sendTelemetryLine("status", "ok");
  }

  if (emergencyStop) {
    emergencyStopMotor();
    sendTelemetry(roll);
    return;
  }

  // ----- Mode and control -----
  if (currentMode == MODE_AUTO) {
    updateAutoMode();
  } else {
    updateCommandMode(roll);
  }

  prevTime = millis();

  if (millis() - lastTelemetry >= TELEMETRY_INTERVAL_MS) {
    sendTelemetry(roll);
    lastTelemetry = millis();
  }
}

// ----- Command parsing -----
void parseAndQueueCommand(const char* line) {
  // Immediate stop clears queue and stops motor
  if (strstr(line, "stop") != nullptr && strlen(line) <= 6) {
    queueLen = 0;
    queueActive = false;
    currentStep = 0;
    stopMotor();
    setPoint = mpu.getAngleY();  // Hold current angle when resuming
    sendTelemetryLine("status", "ok");
    sendTelemetryLine("cmd", "stop");
    return;
  }

  // Switch to auto mode
  if (strstr(line, "auto") != nullptr && strlen(line) <= 6) {
    currentMode = MODE_AUTO;
    queueLen = 0;
    queueActive = false;
    sendTelemetryLine("mode", "auto");
    return;
  }

  // Parse sequence: split by comma
  queueLen = 0;
  char buf[128];
  strncpy(buf, line, sizeof(buf) - 1);
  buf[sizeof(buf) - 1] = '\0';
  char* token = strtok(buf, ",");
  while (token != nullptr && queueLen < MAX_STEPS) {
    // Trim spaces
    while (*token == ' ') token++;
    char* end = token + strlen(token) - 1;
    while (end > token && *end == ' ') *end-- = '\0';

    QueuedCmd cmd = { CMD_NONE, 0 };
    if (strcmp(token, "right_90") == 0)   { cmd.type = CMD_RIGHT_90; }
    else if (strcmp(token, "right_180") == 0) { cmd.type = CMD_RIGHT_180; }
    else if (strcmp(token, "left_90") == 0)   { cmd.type = CMD_LEFT_90; }
    else if (strcmp(token, "left_180") == 0)  { cmd.type = CMD_LEFT_180; }
    else if (strcmp(token, "hold") == 0)       { cmd.type = CMD_HOLD; }
    else if (strncmp(token, "hold ", 5) == 0) {
      cmd.type = CMD_HOLD_N;
      cmd.value = atoi(token + 5);
      if (cmd.value < 0) cmd.value = 0;
    } else {
      sendTelemetryLine("status", "error");
      sendTelemetryLine("error", "invalid_cmd");
      queueLen = 0;
      return;
    }
    cmdQueue[queueLen++] = cmd;
    token = strtok(nullptr, ",");
  }

  if (queueLen > 0) {
    currentMode = MODE_COMMAND;
    queueActive = true;
    currentStep = 1;
    stepStartTime = millis();
    holdIndefinite = false;
    holdUntil = 0;
    sendTelemetryLine("mode", "command");
    executeNextStep();  // Start first step
  }
}

void executeNextStep() {
  if (currentStep < 1 || currentStep > queueLen) {
    queueActive = false;
    currentStep = 0;
    sendTelemetryLine("step", 0);
    return;
  }

  QueuedCmd& cmd = cmdQueue[currentStep - 1];
  stepStartTime = millis();

  switch (cmd.type) {
    case CMD_RIGHT_90:
      setPoint += 90;
      setPoint = constrain(setPoint, -MAX_ANGLE, MAX_ANGLE);
      sendTelemetryLine("cmd", "right_90");
      sendTelemetryLine("step", currentStep);
      break;
    case CMD_RIGHT_180:
      setPoint += 180;
      setPoint = constrain(setPoint, -MAX_ANGLE, MAX_ANGLE);
      sendTelemetryLine("cmd", "right_180");
      sendTelemetryLine("step", currentStep);
      break;
    case CMD_LEFT_90:
      setPoint -= 90;
      setPoint = constrain(setPoint, -MAX_ANGLE, MAX_ANGLE);
      sendTelemetryLine("cmd", "left_90");
      sendTelemetryLine("step", currentStep);
      break;
    case CMD_LEFT_180:
      setPoint -= 180;
      setPoint = constrain(setPoint, -MAX_ANGLE, MAX_ANGLE);
      sendTelemetryLine("cmd", "left_180");
      sendTelemetryLine("step", currentStep);
      break;
    case CMD_HOLD:
      holdIndefinite = true;
      holdUntil = 0;
      sendTelemetryLine("cmd", "hold");
      sendTelemetryLine("step", currentStep);
      break;
    case CMD_HOLD_N:
      holdIndefinite = false;
      holdUntil = millis() + (unsigned long)cmd.value * 1000;
      sendTelemetryLine("cmd", "hold");
      sendTelemetryLine("step", currentStep);
      break;
    default:
      break;
  }
}

// Check if current step is done; if so, advance.
void checkStepComplete(float roll) {
  if (!queueActive || currentStep < 1 || currentStep > queueLen) return;

  QueuedCmd& cmd = cmdQueue[currentStep - 1];
  bool done = false;

  if (cmd.type == CMD_HOLD) {
    done = false;  // Never auto-advance indefinite hold
  } else if (cmd.type == CMD_HOLD_N) {
    done = (millis() >= holdUntil);
  } else {
    // Rotation command: check angle reached or timeout
    if (abs(roll - setPoint) <= ANGLE_TOLERANCE)
      done = true;
    else if ((millis() - stepStartTime) > CMD_TIMEOUT_MS) {
      done = true;
      sendTelemetryLine("status", "timeout");
    }
  }

  if (done) {
    currentStep++;
    if (currentStep <= queueLen) {
      executeNextStep();
    } else {
      queueActive = false;
      currentStep = 0;
      sendTelemetryLine("step", 0);
      sendTelemetryLine("status", "ok");
    }
  }
}

void updateCommandMode(float roll) {
  checkStepComplete(roll);

  if (motorEnabled && abs(roll) <= MAX_ANGLE) {
    unsigned long currTime = millis();
    float elapsed = (currTime - prevTime) / 1000.0f;
    if (elapsed <= 0) elapsed = 0.001f;

    error = setPoint - roll;
    if (abs(error) > 40)
      integral = 0;
    else {
      integral += error * elapsed;
      integral = constrain(integral, -50, 50);
    }
    derivative = (error - prevError) / elapsed;
    output = Kp * error + Ki * integral + Kd * derivative;
    output = constrain(output, -MAX_SPEED, MAX_SPEED);
    if (abs(error) < DEADBAND) output = 0;
    prevError = error;

    targetSpeed = abs(output);
    if (targetSpeed > 0 && targetSpeed < MIN_SPEED) targetSpeed = MIN_SPEED;
    rampSpeed();
    if (output > 0) {
      digitalWrite(A1, HIGH);
      digitalWrite(A2, LOW);
    } else if (output < 0) {
      digitalWrite(A1, LOW);
      digitalWrite(A2, HIGH);
    } else {
      digitalWrite(A1, LOW);
      digitalWrite(A2, LOW);
    }
    analogWrite(ENA, (int)currentSpeed);
  } else if (abs(roll) > MAX_ANGLE) {
    targetSpeed = MAX_SPEED * (MAX_ANGLE - abs(roll)) / MAX_ANGLE;
    targetSpeed = constrain(targetSpeed, 0, MAX_SPEED);
    rampSpeed();
    if (roll > 0) {
      digitalWrite(A1, HIGH);
      digitalWrite(A2, LOW);
    } else {
      digitalWrite(A1, LOW);
      digitalWrite(A2, HIGH);
    }
    analogWrite(ENA, (int)currentSpeed);
  } else {
    stopMotor();
  }
}

void rampSpeed() {
  unsigned long currTime = millis();
  float elapsed = (currTime - prevTime) / 1000.0f;
  float diff = targetSpeed - currentSpeed;
  float maxChange = speedRampRate * elapsed;
  if (abs(diff) <= maxChange)
    currentSpeed = targetSpeed;
  else
    currentSpeed += (diff > 0) ? maxChange : -maxChange;
  currentSpeed = constrain(currentSpeed, 0, MAX_SPEED);
}

void updateAutoMode() {
  int leftLDR = analogRead(LDR_LEFT);
  int rightLDR = analogRead(LDR_RIGHT);
  float roll = mpu.getAngleY();
  float diff = (float)(rightLDR - leftLDR);
  diff = constrain(diff, -1023, 1023);
  setPoint = roll + diff * 0.02f;  // Gentle correction toward light
  setPoint = constrain(setPoint, -MAX_ANGLE, MAX_ANGLE);

  if (abs(roll) > EMERGENCY_ANGLE) return;
  if (!motorEnabled || abs(roll) > MAX_ANGLE) {
    stopMotor();
    return;
  }

  unsigned long currTime = millis();
  float elapsed = (currTime - prevTime) / 1000.0f;
  if (elapsed <= 0) elapsed = 0.001f;
  error = setPoint - roll;
  integral += error * elapsed;
  integral = constrain(integral, -50, 50);
  derivative = (error - prevError) / elapsed;
  output = Kp * error + Ki * integral + Kd * derivative;
  output = constrain(output, -MAX_SPEED, MAX_SPEED);
  if (abs(error) < DEADBAND) output = 0;
  prevError = error;

  targetSpeed = abs(output);
  if (targetSpeed > 0 && targetSpeed < MIN_SPEED) targetSpeed = MIN_SPEED;
  rampSpeed();
  if (output > 0) {
    digitalWrite(A1, HIGH);
    digitalWrite(A2, LOW);
  } else if (output < 0) {
    digitalWrite(A1, LOW);
    digitalWrite(A2, HIGH);
  } else {
    digitalWrite(A1, LOW);
    digitalWrite(A2, LOW);
  }
  analogWrite(ENA, (int)currentSpeed);
}

void stopMotor() {
  digitalWrite(A1, LOW);
  digitalWrite(A2, LOW);
  analogWrite(ENA, 0);
  currentSpeed = 0;
  targetSpeed = 0;
  integral = 0;
}

void emergencyStopMotor() {
  digitalWrite(A1, LOW);
  digitalWrite(A2, LOW);
  analogWrite(ENA, 0);
  currentSpeed = 0;
  targetSpeed = 0;
  integral = 0;
  motorEnabled = false;
  if (abs(mpu.getAngleY()) < MAX_ANGLE)
    motorEnabled = true;
}

void sendTelemetry(float roll) {
  sendTelemetryLine("angle", (int)(roll + 0.5f));
  sendTelemetryLine("mode", currentMode == MODE_AUTO ? "auto" : "command");
}

void sendTelemetryLine(const char* key, const char* value) {
  SERIAL_CMD.print(key);
  SERIAL_CMD.print(':');
  SERIAL_CMD.println(value);
}

void sendTelemetryLine(const char* key, int value) {
  SERIAL_CMD.print(key);
  SERIAL_CMD.print(':');
  SERIAL_CMD.println(value);
}

void sendTelemetryLine(const char* key, float value) {
  SERIAL_CMD.print(key);
  SERIAL_CMD.print(':');
  SERIAL_CMD.println(value);
}
