import { Link } from "react-router-dom";
import { useState } from "react";
import { MobileNav } from "../components/MobileNav";
import { SiteHeader } from "../components/SiteHeader";
import { StarsFieldBackground } from "../components/StarsFieldBackground";
import { IMG } from "../media";

const HARDWARE = [
  {
    title: "Arduino Uno",
    tag: "Brain",
    tagClass: "bg-primary/10 text-primary border-primary/20",
    img: IMG.arduino,
    desc: "Central processor for sensors and commands.",
    detail:
      "ATmega328P @ 16 MHz. 14 digital I/O, 6 analog inputs. Power at 5V from regulated supply. Ground common with sensors.",
  },
  {
    title: "MPU6050",
    tag: "Orientation",
    tagClass: "bg-secondary/10 text-secondary border-secondary/20",
    img: IMG.mpu6050,
    desc: "6-axis IMU for tilt and acceleration.",
    detail:
      "I2C interface (typ. 0x68). Combine gyro + accel with a fusion filter for stable attitude estimates.",
  },
  {
    title: "LDR Sensor",
    tag: "Environmental",
    tagClass: "bg-tertiary/10 text-tertiary border-tertiary/20",
    img: IMG.ldr,
    desc: "Ambient light for sun / shadow sensing.",
    detail:
      "Use a 10 kΩ divider. Mount with clear line-of-sight; avoid sealing inside opaque housings.",
  },
  {
    title: "XL6009",
    tag: "Power",
    tagClass: "bg-error/10 text-error border-error/20",
    img: IMG.xl6009,
    desc: "Boost converter for 5V / 12V rails.",
    detail:
      "Adjust output before load connect. Watch inductor temperature under continuous load.",
  },
  {
    title: "TP4056",
    tag: "Power",
    tagClass: "bg-error/10 text-error border-error/20",
    img: IMG.tp4056,
    desc: "Li-ion charge management.",
    detail:
      "Set charge current with prog resistor. Do not charge cold cells; monitor polarity.",
  },
  {
    title: "L293D",
    tag: "Motion",
    tagClass: "bg-secondary/10 text-secondary border-secondary/20",
    img: IMG.l293d,
    desc: "H-bridge motor driver.",
    detail:
      "PWM enable pins for speed. Heat sink if driving reaction wheel motor near stall.",
  },
  {
    title: "Battery",
    tag: "Power",
    tagClass: "bg-error/10 text-error border-error/20",
    img: IMG.battery,
    desc: "Primary energy storage.",
    detail:
      "Use protection circuit. Balance cells in multi-cell packs. Label polarity on harness.",
  },
] as const;

function HardwareCard({
  title,
  tag,
  tagClass,
  img,
  desc,
  detail,
}: {
  title: string;
  tag: string;
  tagClass: string;
  img: string;
  desc: string;
  detail: string;
}) {
  const [open, setOpen] = useState(false);
  const expanded = open;

  return (
    <div className="group relative">
      <div
        className={`glass-panel flex min-h-[280px] flex-col overflow-hidden rounded-2xl border border-white/10 p-3 transition-all duration-300 ease-out sm:min-h-[300px] sm:p-4 ${
          expanded ? "ring-1 ring-primary/40" : "hover:border-primary/30"
        }`}
      >
        <div className="mb-3 flex h-20 items-center justify-center overflow-hidden rounded-lg border border-white/5 bg-black/40 sm:mb-4 sm:h-24">
          <img
            src={img}
            alt=""
            className="h-full w-full object-cover mix-blend-luminosity transition-all duration-500 group-hover:mix-blend-normal"
          />
        </div>
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="font-headline text-sm font-bold leading-tight text-on-surface sm:text-base">
            {title}
          </h3>
          <span
            className={`font-label shrink-0 rounded border px-1.5 py-0.5 text-[9px] uppercase leading-tight sm:text-[10px] ${tagClass}`}
          >
            {tag}
          </span>
        </div>
        <p className="font-body mb-2 line-clamp-2 text-[11px] leading-snug text-on-surface-variant sm:text-xs">
          {desc}
        </p>
        <div
          className={`overflow-hidden border-t border-transparent transition-all duration-300 ease-out ${
            expanded
              ? "max-h-40 border-white/10 opacity-100"
              : "max-h-0 border-white/0 opacity-0 group-hover:max-h-36 group-hover:border-white/10 group-hover:opacity-100"
          }`}
        >
          <p className="font-body pt-2 text-[11px] leading-relaxed text-on-surface-variant sm:text-xs">
            {detail}
          </p>
        </div>
        <div className="mt-auto flex gap-2 pt-3">
          <button
            type="button"
            className="ion-glow font-label flex-1 rounded-lg border border-white/10 bg-white/5 py-2 text-[10px] uppercase tracking-wider text-primary transition-all hover:bg-white/10 sm:py-2.5 sm:text-xs"
            onClick={() => setOpen((v) => !v)}
          >
            {expanded ? "Less" : "Details"}
          </button>
          <button
            type="button"
            className="font-label rounded-lg border border-white/10 px-2 py-2 text-[10px] uppercase tracking-wider text-on-surface-variant hover:bg-white/5 sm:px-3 sm:text-xs"
            onClick={() => {
              void navigator.clipboard?.writeText(title);
            }}
          >
            Copy
          </button>
        </div>
      </div>
    </div>
  );
}

export function ComponentsPage() {
  return (
    <div className="overflow-x-hidden bg-surface font-body text-on-surface antialiased">
      <StarsFieldBackground />
      <SiteHeader />
      <main className="relative z-10 mx-auto w-full max-w-[1600px] px-4 pb-28 pt-28 sm:px-6 lg:px-10">
        <section className="mb-12">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <span className="font-label mb-3 block text-xs uppercase tracking-[0.2em] text-tertiary sm:text-sm">
                Manifest Library
              </span>
              <h1 className="font-headline text-3xl font-bold tracking-tighter text-on-surface sm:text-4xl md:text-5xl">
                Satellite Core <span className="text-primary-dim">Hardware</span>
              </h1>
            </div>
            <p className="font-body max-w-md text-sm leading-relaxed text-on-surface-variant sm:text-base">
              The instrumentation payload of your CanSat. Every sensor and controller is a
              critical data node in our interstellar mission.
            </p>
          </div>
          <Link
            to="/components/assessment"
            className="font-label mt-8 inline-flex items-center gap-2 rounded-lg border border-secondary/40 bg-secondary/10 px-4 py-2 text-xs uppercase tracking-widest text-secondary transition-colors hover:bg-secondary/20"
          >
            <span className="material-symbols-outlined text-base">quiz</span>
            Hardware assessment
          </Link>
        </section>

        <section className="mb-16 grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 xl:grid-cols-5">
          {HARDWARE.map((c) => (
            <HardwareCard key={c.title} {...c} />
          ))}
        </section>

        <section className="mx-auto max-w-2xl rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-center">
          <p className="font-body text-sm text-on-surface-variant">
            Tip: hover a card to unfold the technical note, or tap <strong>Details</strong>{" "}
            on touch devices.
          </p>
        </section>
      </main>
      <MobileNav />
    </div>
  );
}
