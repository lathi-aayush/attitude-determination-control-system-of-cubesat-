import { Link } from "react-router-dom";
import { useState } from "react";
import { MobileNav } from "../components/MobileNav";
import { SiteHeader } from "../components/SiteHeader";
import { StarsLearningBackground } from "../components/StarsLearningBackground";
import {
  deriveReactionWheelEducation,
  type PracticalRwInputs,
} from "../utils/reactionWheelEducation";

function fmtFixed(n: number, digits = 2): string {
  if (!Number.isFinite(n)) return "—";
  return n.toFixed(digits);
}

export function LearningPage() {
  const [showMomentum, setShowMomentum] = useState(true);
  const [wheelMode, setWheelMode] = useState<"cw" | "ccw" | "stop">("cw");
  const [wheelPercent, setWheelPercent] = useState(70);
  const [wheelMassG, setWheelMassG] = useState(50);
  const [bodyMassG, setBodyMassG] = useState(1200);
  const [motorMaxRpm, setMotorMaxRpm] = useState(4500);
  const [wheelDiameterMm, setWheelDiameterMm] = useState(50);
  const [bodyCubeSideCm, setBodyCubeSideCm] = useState(10);
  const [spinUpSec, setSpinUpSec] = useState(4);
  const [derived, setDerived] = useState<ReturnType<typeof deriveReactionWheelEducation> | null>(null);
  const [tips, setTips] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "good" | "warn">("idle");
  const [hasComputed, setHasComputed] = useState(false);

  const inputs: PracticalRwInputs = {
      wheelMassKg: wheelMassG / 1000,
      bodyMassKg: bodyMassG / 1000,
      motorMaxRpm,
      wheelDiameterMm,
      bodyCubeSideCm,
      spinUpSec,
  };

  const effectiveRpm = motorMaxRpm * (wheelPercent / 100);
  const spinDurationSec = effectiveRpm > 0 ? 60 / effectiveRpm : 60;
  const bodySpinDurationSec = derived
    ? Math.min(90, Math.max(0.35, derived.periodBodySec))
    : 12;
  const wheelAnimationState = wheelMode === "stop" ? "paused" : "running";
  const wheelAnimationDirection = wheelMode === "ccw" ? "reverse" : "normal";
  const bodyAnimationDirection = wheelMode === "ccw" ? "normal" : "reverse";

  const onCompute = () => {
    const next = deriveReactionWheelEducation(inputs);
    setHasComputed(true);
    setDerived(next);
    if (!next) {
      setStatus("warn");
      setTips(["Enter positive values in all fields before computing."]);
      return;
    }

    const messages: string[] = [];
    const ratio = next.iWheelKgM2 / next.iBodyKgM2;
    const bodyRateDegS = (next.omegaBodyRadS * 180) / Math.PI;

    if (ratio < 0.002) {
      messages.push(
        "Wheel is too small vs body inertia. Increase wheel mass/diameter, or reduce body mass/size."
      );
    } else if (ratio > 0.08) {
      messages.push(
        "Wheel is very dominant. Reduce wheel mass/diameter or lower commanded speed for smoother response."
      );
    } else {
      messages.push("Inertia ratio looks reasonable for a smooth educational demo.");
    }

    if (bodyRateDegS < 0.5) {
      messages.push("Body motion may look too slow. Try higher RPM or slightly larger flywheel.");
    } else if (bodyRateDegS > 20) {
      messages.push("Body rate is high. Lower max RPM or increase spin-up time to avoid aggressive motion.");
    } else {
      messages.push("Predicted body rate is in a smooth, observable range.");
    }

    if (spinUpSec < 1.5) {
      messages.push("Very short spin-up can create jerky response. Use 2–6 s for smoother movement.");
    }

    if (motorMaxRpm > 12000) {
      messages.push("Very high RPM can increase vibration in bench setups. Verify balance and mounting.");
    }

    setTips(messages);
    setStatus(messages.some((m) => m.includes("too") || m.includes("high") || m.includes("jerky")) ? "warn" : "good");
  };

  return (
    <div className="selection:bg-primary-container selection:text-on-primary-container min-h-screen font-body text-on-surface">
      <StarsLearningBackground />
      <SiteHeader />
      <main className="relative mx-auto w-full max-w-[1100px] px-4 pb-28 pt-28 sm:px-6">
        <header className="mb-10">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span className="font-label rounded-full border border-white/10 bg-primary/10 px-3 py-1 text-[10px] uppercase tracking-widest text-primary">
              Module 04
            </span>
            <span className="h-[1px] w-12 bg-white/10" />
            <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
              Attitude Control Systems
            </span>
          </div>
          <h1 className="font-headline mb-4 text-4xl font-bold tracking-tight text-on-surface md:text-5xl">
            Learn ADCS with{" "}
            <span className="text-primary-fixed drop-shadow-[0_0_12px_rgba(58,214,255,0.3)]">
              Reaction Wheels
            </span>
          </h1>
          <p className="font-body max-w-2xl text-base leading-relaxed text-on-surface-variant">
            Explore the fundamentals of Attitude Determination and Control Systems
            (ADCS). Learn how spacecraft manage orientation using the principle of
            conservation of angular momentum through high-speed rotating flywheels.
          </p>
          <Link
            to="/learning/assessment"
            className="font-label mt-6 inline-flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-4 py-2 text-xs uppercase tracking-widest text-primary transition-colors hover:bg-primary/20"
          >
            <span className="material-symbols-outlined text-base">quiz</span>
            Take assessment
          </Link>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
          <section className="glass-panel flex min-h-0 flex-col gap-5 rounded-2xl p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-headline flex items-center gap-2 text-lg font-bold text-primary sm:text-xl">
                  <span className="material-symbols-outlined">settings_overscan</span>
                  Component Visualizer
                </h2>
                <p className="mt-1 text-sm text-on-surface-variant">
                  Simulating Momentum Exchange
                </p>
              </div>
              <div className="font-label shrink-0 rounded border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-tertiary">
                SYSTEM_STABLE
              </div>
            </div>
            <p className="text-xs leading-relaxed text-on-surface-variant/90">
              Interactive wheel controls are below. Outer ring is the wheel and inner hub is the
              body counter-rotation (idealized, L ≈ 0).
            </p>
            <div className="relative mx-auto flex aspect-square w-full max-w-[280px] items-center justify-center sm:max-w-[300px]">
              <div
                className="absolute inset-0 rounded-full border border-dashed border-white/10"
                style={{
                  animation: `spin ${Math.max(spinDurationSec, 0.15)}s linear infinite`,
                  animationDirection: wheelAnimationDirection,
                  animationPlayState: wheelAnimationState,
                }}
              />
              <div className="relative flex h-52 w-52 items-center justify-center overflow-hidden rounded-full border-4 border-white/5 bg-black/20 shadow-[0_0_50px_rgba(58,214,255,0.05)] sm:h-56 sm:w-56">
                <div className="flex h-44 w-44 items-center justify-center rounded-full border-[10px] border-white/5 sm:h-48 sm:w-48">
                  <div
                    className="bg-primary absolute h-1 w-full opacity-20"
                    style={{
                      opacity: showMomentum ? 0.35 : 0.12,
                    }}
                  />
                  <div
                    className="bg-primary absolute h-1 w-full rotate-45 opacity-20"
                    style={{ opacity: showMomentum ? 0.35 : 0.12 }}
                  />
                  <div
                    className="bg-primary absolute h-1 w-full rotate-90 opacity-20"
                    style={{ opacity: showMomentum ? 0.35 : 0.12 }}
                  />
                  <div
                    className="bg-primary absolute h-1 w-full rotate-[135deg] opacity-20"
                    style={{ opacity: showMomentum ? 0.35 : 0.12 }}
                  />
                  <div
                    className="border-primary-fixed bg-surface-dim/80 z-10 flex h-24 w-24 items-center justify-center rounded-full border-2 backdrop-blur-md sm:h-28 sm:w-28"
                    style={{
                      animation: `spin ${Math.max(bodySpinDurationSec, 0.12)}s linear infinite`,
                      animationDirection: bodyAnimationDirection,
                      animationPlayState: wheelAnimationState,
                    }}
                  >
                    <span className="material-symbols-outlined text-2xl text-primary sm:text-3xl">
                      rotate_right
                    </span>
                  </div>
                </div>
                {showMomentum && (
                  <div className="glow-primary absolute left-1/2 top-3 h-10 w-[2px] -translate-x-1/2 bg-tertiary sm:h-12" />
                )}
              </div>
            </div>
            <div className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-6">
              <div className="flex items-center justify-between gap-3">
                <span className="font-body text-sm">Show Momentum Vector</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={showMomentum}
                  onClick={() => setShowMomentum((v) => !v)}
                  className="relative flex h-6 w-12 items-center rounded-full border border-white/10 bg-white/10 px-1 transition-colors"
                >
                  <span
                    className={`h-4 w-4 rounded-full bg-primary transition-all ${
                      showMomentum ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setWheelMode("cw")}
                  className={`font-label rounded-md border px-3 py-1.5 text-[10px] uppercase tracking-widest ${
                    wheelMode === "cw"
                      ? "border-primary/60 bg-primary/15 text-primary"
                      : "border-white/15 bg-black/20 text-on-surface-variant"
                  }`}
                >
                  Spin CW
                </button>
                <button
                  type="button"
                  onClick={() => setWheelMode("ccw")}
                  className={`font-label rounded-md border px-3 py-1.5 text-[10px] uppercase tracking-widest ${
                    wheelMode === "ccw"
                      ? "border-primary/60 bg-primary/15 text-primary"
                      : "border-white/15 bg-black/20 text-on-surface-variant"
                  }`}
                >
                  Spin CCW
                </button>
                <button
                  type="button"
                  onClick={() => setWheelMode("stop")}
                  className={`font-label rounded-md border px-3 py-1.5 text-[10px] uppercase tracking-widest ${
                    wheelMode === "stop"
                      ? "border-error/50 bg-error/10 text-error"
                      : "border-white/15 bg-black/20 text-on-surface-variant"
                  }`}
                >
                  Stop
                </button>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-white/10 bg-black/20 px-3 py-2">
                <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
                  Wheel speed
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setWheelPercent((p) => Math.max(10, p - 10))}
                    className="rounded border border-white/15 px-2 text-on-surface-variant hover:text-on-surface"
                    aria-label="Decrease wheel speed"
                  >
                    -
                  </button>
                  <span className="font-mono min-w-20 text-center text-sm text-primary">
                    {Math.round(effectiveRpm)} RPM
                  </span>
                  <button
                    type="button"
                    onClick={() => setWheelPercent((p) => Math.min(100, p + 10))}
                    className="rounded border border-white/15 px-2 text-on-surface-variant hover:text-on-surface"
                    aria-label="Increase wheel speed"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="glass-panel flex flex-col gap-6 rounded-2xl p-6 sm:p-8">
            <div>
              <h2 className="font-headline flex items-center gap-2 text-lg font-bold text-primary sm:text-xl">
                <span className="material-symbols-outlined">calculate</span>
                Practical torque &amp; momentum
              </h2>
              <p className="mt-1 text-sm text-on-surface-variant">
                Enter masses and motor data you can measure. Inertia and body motion are estimated
                using simple models (see assumptions below).
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <InputField
                label="Wheel mass (flywheel)"
                unit="g"
                value={wheelMassG}
                onChange={setWheelMassG}
              />
              <InputField
                label="Body mass (spacecraft)"
                unit="g"
                value={bodyMassG}
                onChange={setBodyMassG}
              />
              <InputField
                label="Max DC motor speed"
                unit="RPM"
                value={motorMaxRpm}
                onChange={setMotorMaxRpm}
              />
              <InputField
                label="Flywheel diameter"
                unit="mm"
                value={wheelDiameterMm}
                onChange={setWheelDiameterMm}
                hint="Measure the rotor with a ruler — needed for I_wheel."
              />
              <InputField
                label="Approx. cube side (bus size)"
                unit="cm"
                value={bodyCubeSideCm}
                onChange={setBodyCubeSideCm}
                hint="e.g. 10 for a 10 cm (1U-class) box if you model the bus as a cube."
              />
              <InputField
                label="Spin-up time (0 → max RPM)"
                unit="s"
                value={spinUpSec}
                onChange={setSpinUpSec}
                hint="How long you assume the motor takes to reach max speed — sets average τ."
              />
            </div>

            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={onCompute}
                className="font-label inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-on-primary shadow-[0_0_20px_rgba(58,214,255,0.35)] transition hover:bg-primary/90"
              >
                <span className="material-symbols-outlined text-base">calculate</span>
                Compute
              </button>
            </div>
            {hasComputed && derived ? (
              <div className="mt-1 inline-flex items-center gap-2 text-xs text-on-surface-variant">
                <span className="material-symbols-outlined text-sm text-tertiary">check_box</span>
                Results generated
              </div>
            ) : null}

            <div
              className={`rounded-xl border p-5 text-sm ${
                status === "warn"
                  ? "border-amber-300/30 bg-amber-400/5"
                  : status === "good"
                    ? "border-tertiary/30 bg-tertiary/5"
                    : "border-white/10 bg-white/5"
              }`}
            >
              <h3 className="font-label mb-2 text-[10px] uppercase tracking-widest text-primary">
                What to change
              </h3>
              {hasComputed ? (
                <ul className="list-inside list-disc space-y-1.5 text-on-surface-variant">
                  {tips.map((tip) => (
                    <li key={tip}>{tip}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-on-surface-variant">
                  Click Compute to check size ratios and suggestions for smoother movement.
                </p>
              )}
            </div>

            <div className="space-y-3 rounded-xl border border-primary/20 bg-primary/5 p-5">
              <h3 className="font-label text-[10px] uppercase tracking-widest text-primary">
                Quick result
              </h3>
              {hasComputed && derived ? (
                <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
                  <SimpleResult
                    label="Body turn speed"
                    value={`${fmtFixed((derived.omegaBodyRadS * 180) / Math.PI, 2)} deg/s`}
                    hint="How fast your body is expected to rotate."
                  />
                  <SimpleResult
                    label="Spin smoothness"
                    value={
                      spinUpSec < 1.5
                        ? "Aggressive"
                        : spinUpSec <= 6
                          ? "Smooth"
                          : "Very soft"
                    }
                    hint="Based on your 0 → max RPM time."
                  />
                  <SimpleResult
                    label="Control strength"
                    value={`${fmtFixed((derived.iWheelKgM2 / derived.iBodyKgM2) * 100, 2)} %`}
                    hint="Higher means wheel has more authority."
                  />
                </div>
              ) : (
                <p className="text-sm text-on-surface-variant">
                  Press Compute to evaluate the current setup.
                </p>
              )}
            </div>

            <p className="text-[11px] leading-relaxed text-on-surface-variant/80">
              This is a teaching model: real ADCS includes bearing loss, motor torque curves,
              structural flexibility, and sensor noise. Use it to connect measurable bench numbers
              to <span className="font-mono">I</span>,{" "}
              <span className="font-mono">τ</span>, and expected body rates.
            </p>
          </section>
        </div>
      </main>
      <MobileNav />
    </div>
  );
}

function InputField({
  label,
  unit,
  value,
  onChange,
  hint,
}: {
  label: string;
  unit: string;
  value: number;
  onChange: (n: number) => void;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="font-label px-1 text-xs uppercase tracking-widest text-on-surface-variant">
        {label}
      </label>
      <div className="relative flex items-center">
        <input
          className="font-body w-full rounded-lg border border-white/10 bg-black/30 py-2.5 pl-3 pr-16 text-sm text-on-surface transition-all focus:border-primary focus:ring-0"
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        <span className="font-label absolute right-3 text-xs text-outline-variant">{unit}</span>
      </div>
      {hint ? <p className="px-1 text-[11px] text-on-surface-variant/90">{hint}</p> : null}
    </div>
  );
}

function SimpleResult({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/20 p-3">
      <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">{label}</p>
      <p className="mt-1 font-mono text-base text-on-surface">{value}</p>
      <p className="mt-1 text-[11px] text-on-surface-variant/80">{hint}</p>
    </div>
  );
}
