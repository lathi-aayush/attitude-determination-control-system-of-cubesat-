import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { MobileNav } from "../components/MobileNav";
import { SiteHeader } from "../components/SiteHeader";
import { StarsLearningBackground } from "../components/StarsLearningBackground";

const STORAGE_LEARNING = "aarambhsat-assessment-learning-best-v1";
const STORAGE_COMPONENTS = "aarambhsat-assessment-components-best-v1";

const CARDS = [
  {
    to: "/learning/assessment",
    storageKey: STORAGE_LEARNING,
    title: "ADCS — Reaction wheels",
    desc: "Angular momentum, torque, and attitude concepts (Module 04).",
    icon: "psychology",
  },
  {
    to: "/components/assessment",
    storageKey: STORAGE_COMPONENTS,
    title: "Hardware manifest",
    desc: "Sensors, power, and motion components on the satellite bus.",
    icon: "precision_manufacturing",
  },
] as const;

function readBestPct(key: string): number | null {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null || raw === "") return null;
    const n = Number.parseInt(raw, 10);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

export function AssessmentsHubPage() {
  const [best, setBest] = useState<Record<string, number | null>>({});

  useEffect(() => {
    setBest({
      [STORAGE_LEARNING]: readBestPct(STORAGE_LEARNING),
      [STORAGE_COMPONENTS]: readBestPct(STORAGE_COMPONENTS),
    });
  }, []);

  return (
    <div className="min-h-screen font-body text-on-surface selection:bg-primary/30">
      <StarsLearningBackground />
      <SiteHeader />
      <main className="relative mx-auto max-w-3xl px-6 pb-28 pt-32">
        <h1 className="font-headline mb-2 text-3xl font-bold text-on-surface md:text-4xl">
          Assessments
        </h1>
        <p className="mb-10 text-sm text-on-surface-variant">
          Choose a module. Your best score for each quiz is saved in this browser.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {CARDS.map((c) => (
            <Link
              key={c.to}
              to={c.to}
              className="glass-panel group rounded-2xl border border-white/10 p-6 transition-all hover:border-primary/40 hover:bg-white/[0.03]"
            >
              <span className="material-symbols-outlined mb-3 block text-3xl text-primary transition-transform group-hover:scale-110">
                {c.icon}
              </span>
              <h2 className="font-headline text-lg font-bold text-on-surface">
                {c.title}
              </h2>
              <p className="mt-2 text-sm text-on-surface-variant">{c.desc}</p>
              {best[c.storageKey] != null && (
                <p className="mt-3 font-label text-xs uppercase tracking-wider text-tertiary">
                  Best: {best[c.storageKey]}%
                </p>
              )}
              <span className="font-label mt-4 inline-flex items-center gap-1 text-xs uppercase tracking-widest text-primary">
                Start
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </span>
            </Link>
          ))}
        </div>
        <Link
          to="/learning"
          className="font-label mt-10 inline-block text-xs uppercase tracking-widest text-on-surface-variant hover:text-primary"
        >
          ← Back to Learning
        </Link>
      </main>
      <MobileNav />
    </div>
  );
}
