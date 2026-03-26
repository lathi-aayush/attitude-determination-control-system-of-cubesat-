import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { MobileNav } from "../components/MobileNav";
import { SiteHeader } from "../components/SiteHeader";
import { StarStreakBackground } from "../components/StarStreakBackground";

const SatelliteModelViewport = lazy(() =>
  import("../components/SatelliteModelViewport").then((m) => ({
    default: m.SatelliteModelViewport,
  }))
);

type LogLine = { ts: string; text: string; kind: "info" | "ok" | "cmd" | "err" };
type Rotation = [number, number, number];

function nowTime() {
  return new Date().toLocaleTimeString("en-GB", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

const INITIAL_LOGS: LogLine[] = [
  { ts: "12:04:22", text: "Initializing orbital synchronization...", kind: "info" },
  { ts: "12:04:23", text: "[OK] Core systems operational.", kind: "ok" },
  { ts: "12:05:01", text: "> right_90", kind: "cmd" },
  { ts: "12:05:02", text: "[OK] Yaw adjusted +90°", kind: "ok" },
];

const FRONT_TO_TOP_ROTATION: Rotation = [-Math.PI / 2, 0, 0];

function normalizeRadians(rad: number) {
  const twoPi = Math.PI * 2;
  let next = rad % twoPi;
  if (next > Math.PI) next -= twoPi;
  if (next < -Math.PI) next += twoPi;
  return next;
}

function toDeg(rad: number) {
  return Math.round((rad * 180) / Math.PI);
}

export function ProjectPage() {
  const [signalPct, setSignalPct] = useState(98);
  const [logs, setLogs] = useState<LogLine[]>(INITIAL_LOGS);
  const [command, setCommand] = useState("");
  const [modelRotation, setModelRotation] = useState<Rotation>(FRONT_TO_TOP_ROTATION);
  const [autoRotateEnabled, setAutoRotateEnabled] = useState(true);
  const sequenceRunIdRef = useRef(0);
  const logsContainerRef = useRef<HTMLDivElement | null>(null);
  const holdTimeoutRef = useRef<number | null>(null);

  const logClass = useCallback((k: LogLine["kind"]) => {
    if (k === "cmd") return "text-primary-dim";
    if (k === "ok") return "text-tertiary";
    if (k === "err") return "text-error";
    return "text-on-surface";
  }, []);

  const applyRotationStep = useCallback((axis: "x" | "y" | "z", degrees: number) => {
    const radians = (degrees * Math.PI) / 180;
    setModelRotation((prev) => {
      const next: Rotation = [...prev];
      const index = axis === "x" ? 0 : axis === "y" ? 1 : 2;
      next[index] = normalizeRadians(next[index] + radians);
      return next;
    });
  }, []);

  const setResetPose = useCallback(() => {
    setModelRotation(FRONT_TO_TOP_ROTATION);
  }, []);

  const appendReply = useCallback((text: string, kind: LogLine["kind"]) => {
    setLogs((prev) => [...prev, { ts: nowTime(), text, kind }]);
  }, []);

  const clearHoldTimer = useCallback(() => {
    if (holdTimeoutRef.current !== null) {
      window.clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    const el = logsContainerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [logs]);

  useEffect(() => () => clearHoldTimer(), [clearHoldTimer]);

  const executeSingleCommand = useCallback(
    async (line: string): Promise<boolean> => {
      const lower = line.toLowerCase();

      if (lower === "help") {
        appendReply(
          "[OK] Commands: right_90 | left_90 | rotate <x|y|z> <deg> | hold | hold <s> | auto | reset | status | signal NN | stop",
          "ok"
        );
        return true;
      }

      if (lower === "right_90") {
        applyRotationStep("z", 90);
        appendReply("[OK] Yaw adjusted +90°", "ok");
        return true;
      }

      if (lower === "left_90") {
        applyRotationStep("z", -90);
        appendReply("[OK] Yaw adjusted -90°", "ok");
        return true;
      }

      if (lower === "auto") {
        clearHoldTimer();
        setAutoRotateEnabled(true);
        appendReply("[OK] Auto mode enabled (visual simulation).", "ok");
        return true;
      }

      if (lower === "reset") {
        sequenceRunIdRef.current += 1;
        clearHoldTimer();
        setAutoRotateEnabled(true);
        setSignalPct(98);
        setResetPose();
        appendReply("[OK] Subsystems nominal. Pose reset. Signal 98%.", "ok");
        return true;
      }

      if (lower === "status") {
        const [x, y, z] = modelRotation;
        appendReply(
          `[OK] Signal ${signalPct}% · Roll ${toDeg(x)}° · Pitch ${toDeg(y)}° · Yaw ${toDeg(z)}°`,
          "ok"
        );
        return true;
      }

      if (lower === "stop") {
        sequenceRunIdRef.current += 1;
        clearHoldTimer();
        setAutoRotateEnabled(false);
        appendReply("[OK] Sequence stopped.", "ok");
        return true;
      }

      if (/^signal\s+\d{1,3}$/.test(lower)) {
        const n = Math.min(100, Math.max(0, Number.parseInt(lower.split(/\s+/)[1]!, 10)));
        setSignalPct(n);
        appendReply(`[OK] Signal set to ${n}%`, "ok");
        return true;
      }

      const rotateMatch = lower.match(/^rotate\s+([xyz])\s+(-?\d+(?:\.\d+)?)$/);
      if (rotateMatch) {
        const axis = rotateMatch[1] as "x" | "y" | "z";
        const degrees = Number.parseFloat(rotateMatch[2]);
        applyRotationStep(axis, degrees);
        appendReply(`[OK] ${axis.toUpperCase()} adjusted ${degrees >= 0 ? "+" : ""}${degrees}°`, "ok");
        return true;
      }

      if (lower === "hold") {
        clearHoldTimer();
        setAutoRotateEnabled(false);
        appendReply("[OK] Hold active. Movement paused until auto/resume command.", "ok");
        return true;
      }

      const holdMatch = lower.match(/^hold\s+(\d+(?:\.\d+)?)$/);
      if (holdMatch) {
        const seconds = Number.parseFloat(holdMatch[1]);
        clearHoldTimer();
        setAutoRotateEnabled(false);
        appendReply(`[OK] Holding orientation for ${seconds.toFixed(1)}s...`, "info");
        await new Promise<void>((resolve) => {
          holdTimeoutRef.current = window.setTimeout(() => {
            holdTimeoutRef.current = null;
            resolve();
          }, Math.max(0, seconds * 1000));
        });
        setAutoRotateEnabled(true);
        appendReply("[OK] Hold completed.", "ok");
        return true;
      }

      return false;
    },
    [appendReply, applyRotationStep, clearHoldTimer, modelRotation, setResetPose, signalPct]
  );

  const runCommand = useCallback(
    async (raw: string) => {
      const line = raw.trim();
      if (!line) return;
      setLogs((prev) => [...prev, { ts: nowTime(), text: `> ${line}`, kind: "cmd" }]);

      if (line.includes(",")) {
        const steps = line
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        if (!steps.length) {
          appendReply("[WARN] Empty sequence.", "err");
          setCommand("");
          return;
        }

        const runId = Date.now();
        sequenceRunIdRef.current = runId;
        appendReply(`[OK] Sequence accepted (${steps.length} steps).`, "ok");
        for (let i = 0; i < steps.length; i += 1) {
          if (sequenceRunIdRef.current !== runId) return;
          appendReply(`[OK] Step ${i + 1}/${steps.length} — ${steps[i]}`, "info");
          const handled = await executeSingleCommand(steps[i]);
          if (!handled) {
            appendReply(`[WARN] Invalid command in sequence: ${steps[i]}`, "err");
            return;
          }
        }
        if (sequenceRunIdRef.current === runId) appendReply("[OK] Sequence complete.", "ok");
        setCommand("");
        return;
      }

      const handled = await executeSingleCommand(line);
      if (!handled) appendReply("[WARN] Unknown command — type help", "err");
      setCommand("");
    },
    [appendReply, executeSingleCommand]
  );

  return (
    <div className="selection:bg-primary/30 flex h-[100dvh] flex-col overflow-hidden font-body text-on-surface">
      <StarStreakBackground />
      <SiteHeader />
      <main className="relative mx-auto flex h-full w-full max-w-[1400px] flex-1 flex-col items-center overflow-hidden px-4 pb-16 pt-24 sm:px-6">
        <header className="mb-4 pt-1 text-center lg:mb-5">
          <h1 className="font-headline pb-1 text-3xl leading-[1.18] font-bold text-primary-fixed drop-shadow-[0_0_12px_rgba(58,214,255,0.35)] sm:text-4xl">
            AARAMBHSAT ADCS PROJECT
          </h1>
          <p className="font-label mt-2 text-[10px] uppercase tracking-[0.22em] text-on-surface-variant">
            Attitude Determination and Control System
          </p>
        </header>

        <div className="grid w-full flex-1 min-h-0 grid-cols-1 gap-4 lg:grid-cols-[1fr_1.08fr] lg:items-stretch lg:gap-6">
        {/* Left: 3D viewport */}
        <div className="flex min-h-0 w-full flex-col gap-6">
          <div className="relative mx-auto flex h-[44vh] min-h-[18rem] w-full items-center justify-center md:h-[48vh] lg:h-full lg:min-h-0 lg:mx-0">
            <div
              className="group relative flex aspect-square w-full max-w-[min(82vh,880px)] items-center justify-center rounded-[2rem] transition-all duration-700"
              id="modelCircle"
            >
              <div className="pointer-events-none absolute -inset-[3%] rounded-[2.3rem] bg-[radial-gradient(circle_at_50%_45%,rgba(120,218,255,0.22)_0%,rgba(120,218,255,0.1)_40%,rgba(8,14,28,0.02)_70%,rgba(2,4,10,0)_88%)] blur-[2px]" />
              <div className="pointer-events-none absolute inset-[4%] rounded-[2rem] bg-[radial-gradient(circle_at_50%_58%,rgba(255,255,255,0.14)_0%,rgba(120,218,255,0.06)_44%,rgba(2,4,10,0)_78%)]" />
              <div className="pointer-events-none absolute inset-x-[10%] top-[7%] h-8 rounded-full bg-primary/32 blur-3xl" />
              <div className="pointer-events-none absolute inset-0 rounded-[2rem] shadow-[inset_0_0_30px_rgba(2,4,10,0.18)]" />
                <div className="font-mono absolute right-3 top-1/2 z-10 hidden translate-x-[20px] -translate-y-1/2 flex-col gap-3 text-[9px] text-on-surface-variant/70 sm:text-[10px] md:flex md:right-4">
                  <div className="flex items-center gap-2">
                    <span className="bg-error h-[1px] w-6" />
                    <span className="text-error">X: ROLL</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-tertiary h-[1px] w-6" />
                    <span className="text-tertiary">Y: PITCH</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-primary h-[1px] w-6" />
                    <span className="text-primary">Z: YAW</span>
                  </div>
                </div>
                <div className="h-full w-full overflow-hidden rounded-[2rem] p-1 sm:p-2 [mask-image:radial-gradient(circle_at_center,black_74%,rgba(0,0,0,0.94)_86%,transparent_100%)]">
                  <Suspense
                    fallback={
                      <div className="flex min-h-[12rem] items-center justify-center font-mono text-[10px] text-on-surface-variant/60">
                        Loading 3D viewport…
                      </div>
                    }
                  >
                    <SatelliteModelViewport
                      rotation={modelRotation}
                      autoRotateEnabled={autoRotateEnabled}
                      onReset={setResetPose}
                    />
                  </Suspense>
                </div>
            </div>
          </div>
        </div>

        {/* Right column: terminal */}
        <div className="flex min-h-0 w-full min-w-0 flex-col gap-5">
          <section className="z-20 flex h-[44vh] min-h-[18rem] w-full md:h-[48vh] lg:h-full lg:min-h-0">
            <div className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-2xl backdrop-blur-[20px]">
              <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="bg-error/40 h-2.5 w-2.5 rounded-full" />
                  <div className="bg-tertiary/40 h-2.5 w-2.5 rounded-full" />
                  <div className="bg-primary/40 h-2.5 w-2.5 rounded-full" />
                </div>
                <span className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">
                  Telemetry Terminal v1.0.4
                </span>
              </div>
              <div
                ref={logsContainerRef}
                className="terminal-scroll font-mono min-h-0 flex-1 space-y-2 overflow-y-auto overflow-x-hidden overscroll-contain p-4 text-xs text-on-surface-variant/80 sm:p-6"
              >
                {logs.map((line, i) => (
                  <div key={`${line.ts}-${i}`} className="flex gap-3">
                    <span className="shrink-0 text-tertiary/60">{line.ts}</span>
                    <span className={logClass(line.kind)}>{line.text}</span>
                  </div>
                ))}
                <div className="animate-pulse flex gap-3">
                  <span className="text-tertiary/60">{nowTime()}</span>
                  <span className="text-primary-dim">&gt; _</span>
                </div>
              </div>
              <div className="border-t border-white/10 bg-white/5 px-4 py-3 sm:px-6">
                <form
                  className="flex items-center gap-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    runCommand(command);
                  }}
                >
                  <span className="font-mono text-base text-primary">&gt;</span>
                  <input
                    className="placeholder:text-on-surface-variant/30 min-w-0 flex-1 border-none bg-transparent p-0 font-mono text-sm text-on-surface outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0"
                    placeholder="Enter command (e.g. right_90, hold 2, auto)"
                    value={command}
                    onChange={(e) => setCommand(e.target.value)}
                    type="text"
                  />
                </form>
              </div>
            </div>
          </section>
        </div>
        </div>
      </main>

      <MobileNav />
    </div>
  );
}
