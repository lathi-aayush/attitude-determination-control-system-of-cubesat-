/**
 * Educational estimates from measurable bench values.
 * Wheel: solid disk about its axis. Body: uniform cube about center (1U-style default).
 */

export type PracticalRwInputs = {
  wheelMassKg: number;
  bodyMassKg: number;
  motorMaxRpm: number;
  /** Outer diameter of the flywheel (mm) — measurable with a ruler */
  wheelDiameterMm: number;
  /** Approximate side length of spacecraft modeled as a cube (cm), e.g. 10 for 1U */
  bodyCubeSideCm: number;
  /** Time to spin the wheel from rest to max RPM (s) — for average torque τ ≈ I·ω/t */
  spinUpSec: number;
};

export type PracticalRwDerived = {
  wheelRadiusM: number;
  /** Solid disk: I = ½ m r² */
  iWheelKgM2: number;
  /** Uniform cube side a: I = (1/6) m a² about any axis through center */
  iBodyKgM2: number;
  omegaWheelRadS: number;
  /** |ω_body| if wheel goes from 0 to ω_wheel and body was at rest (L ≈ 0) */
  omegaBodyRadS: number;
  /** L = I_wheel · ω_wheel */
  angularMomentumWheelNs: number;
  /** Average torque to reach ω in spinUpSec: τ ≈ I_wheel · ω / t */
  torqueAvgNm: number;
  /** ΔΩ_body ≈ |ω_body| in the ideal momentum-exchange step above */
  deltaOmegaBodyRad: number;
  periodWheelSec: number;
  periodBodySec: number;
};

const EPS = 1e-12;

export function deriveReactionWheelEducation(
  raw: PracticalRwInputs
): PracticalRwDerived | null {
  const {
    wheelMassKg,
    bodyMassKg,
    motorMaxRpm,
    wheelDiameterMm,
    bodyCubeSideCm,
    spinUpSec,
  } = raw;

  if (
    wheelMassKg <= EPS ||
    bodyMassKg <= EPS ||
    motorMaxRpm <= EPS ||
    wheelDiameterMm <= EPS ||
    bodyCubeSideCm <= EPS ||
    spinUpSec <= EPS
  ) {
    return null;
  }

  const wheelRadiusM = wheelDiameterMm / 2000;
  const iWheelKgM2 = 0.5 * wheelMassKg * wheelRadiusM * wheelRadiusM;

  const aM = bodyCubeSideCm / 100;
  const iBodyKgM2 = (1 / 6) * bodyMassKg * aM * aM;

  if (iWheelKgM2 <= EPS || iBodyKgM2 <= EPS) return null;

  const omegaWheelRadS = (motorMaxRpm * 2 * Math.PI) / 60;
  const ratio = iWheelKgM2 / iBodyKgM2;
  const omegaBodyRadS = ratio * omegaWheelRadS;
  const angularMomentumWheelNs = iWheelKgM2 * omegaWheelRadS;
  const torqueAvgNm = (iWheelKgM2 * omegaWheelRadS) / spinUpSec;
  const periodWheelSec = (2 * Math.PI) / omegaWheelRadS;
  const periodBodySec = (2 * Math.PI) / omegaBodyRadS;

  return {
    wheelRadiusM,
    iWheelKgM2,
    iBodyKgM2,
    omegaWheelRadS,
    omegaBodyRadS,
    angularMomentumWheelNs,
    torqueAvgNm,
    deltaOmegaBodyRad: omegaBodyRadS,
    periodWheelSec,
    periodBodySec,
  };
}
