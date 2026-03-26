import { Link } from "react-router-dom";
import { useCallback, useMemo, useState } from "react";
import { MobileNav } from "../components/MobileNav";
import { SiteHeader } from "../components/SiteHeader";
import { StarsFieldBackground } from "../components/StarsFieldBackground";
import { COMPONENTS_ASSESSMENT_QUESTIONS } from "../data/componentsAssessment";

const STORAGE_BEST = "aarambhsat-assessment-components-best-v1";

function saveBestScore(score: number, total: number) {
  try {
    const pct = total > 0 ? Math.round((score / total) * 100) : 0;
    const prev = localStorage.getItem(STORAGE_BEST);
    const prevPct = prev ? Number.parseInt(prev, 10) : -1;
    if (pct > prevPct) localStorage.setItem(STORAGE_BEST, String(pct));
  } catch {
    /* ignore */
  }
}

export function ComponentsAssessmentPage() {
  const questions = COMPONENTS_ASSESSMENT_QUESTIONS;
  const total = questions.length;

  const [idx, setIdx] = useState(0);
  const [choice, setChoice] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const q = questions[idx]!;

  const isCorrect = useMemo(
    () => confirmed && choice !== null && choice === q.correctKey,
    [confirmed, choice, q.correctKey]
  );

  const resetQuiz = useCallback(() => {
    setIdx(0);
    setChoice(null);
    setConfirmed(false);
    setScore(0);
    setFinished(false);
  }, []);

  const goNext = useCallback(() => {
    if (idx >= total - 1) {
      setFinished(true);
      setScore((s) => {
        saveBestScore(s, total);
        return s;
      });
      return;
    }
    setIdx((i) => i + 1);
    setChoice(null);
    setConfirmed(false);
  }, [idx, total]);

  const onConfirm = useCallback(() => {
    if (!choice || confirmed) return;
    setConfirmed(true);
    if (choice === q.correctKey) setScore((s) => s + 1);
  }, [choice, confirmed, q.correctKey]);

  const onSkip = useCallback(() => {
    if (idx >= total - 1) {
      setFinished(true);
      setScore((s) => {
        saveBestScore(s, total);
        return s;
      });
      return;
    }
    setIdx((i) => i + 1);
    setChoice(null);
    setConfirmed(false);
  }, [idx, total]);

  if (finished) {
    const pct = total > 0 ? Math.round((score / total) * 100) : 0;
    return (
      <div className="min-h-screen overflow-x-hidden bg-surface font-body text-on-surface antialiased">
        <StarsFieldBackground />
        <SiteHeader />
        <main className="relative z-10 mx-auto max-w-lg px-6 pb-28 pt-32">
          <div className="glass-panel rounded-[28px] border border-secondary/30 p-8 text-center md:p-10">
            <span className="material-symbols-outlined mb-4 text-5xl text-secondary">
              military_tech
            </span>
            <h1 className="font-headline mb-2 text-2xl font-bold text-on-surface">
              Hardware check complete
            </h1>
            <p className="mb-6 text-sm text-on-surface-variant">
              Score{" "}
              <span className="font-bold text-primary">
                {score} / {total}
              </span>{" "}
              ({pct}%)
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={resetQuiz}
                className="font-label rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-xs uppercase tracking-widest hover:bg-white/10"
              >
                Retake
              </button>
              <Link
                to="/components"
                className="font-label rounded-xl bg-primary px-6 py-3 text-xs font-bold uppercase tracking-widest text-on-primary"
              >
                Back to Components
              </Link>
              <Link
                to="/assessments"
                className="font-label rounded-xl border border-primary/40 px-6 py-3 text-xs uppercase tracking-widest text-primary hover:bg-primary/10"
              >
                All assessments
              </Link>
            </div>
          </div>
        </main>
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-surface font-body text-on-surface antialiased">
      <StarsFieldBackground />
      <SiteHeader />
      <main className="relative z-10 mx-auto max-w-3xl px-6 pb-28 pt-32">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/assessments"
              className="font-label text-xs uppercase tracking-widest text-on-surface-variant hover:text-primary"
            >
              Assessments
            </Link>
            <span className="text-on-surface-variant/50">/</span>
            <span className="font-label text-xs uppercase tracking-widest text-secondary">
              Hardware
            </span>
          </div>
          <div className="font-label rounded-full bg-white/10 px-3 py-1 text-xs text-primary">
            {idx + 1} / {total}
          </div>
        </div>

        <div className="mb-4 h-1 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full bg-secondary transition-all duration-300"
            style={{ width: `${((idx + 1) / total) * 100}%` }}
          />
        </div>

        <div className="glass-panel relative overflow-hidden rounded-[32px] border-white/10">
          <div className="p-8 md:p-12">
            <div className="mb-10">
              <span className="font-label mb-3 block text-xs uppercase tracking-[0.2em] text-secondary">
                Knowledge Check
              </span>
              <h1 className="font-headline text-xl font-bold leading-snug text-on-surface md:text-2xl">
                {q.question}
              </h1>
            </div>
            <div className="mb-10 space-y-3">
              {q.options.map((opt) => {
                const disabled = confirmed;
                const selected = choice === opt.key;
                const showWrong =
                  confirmed && selected && opt.key !== q.correctKey;
                const showRight = confirmed && opt.key === q.correctKey;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    disabled={disabled}
                    onClick={() => !disabled && setChoice(opt.key)}
                    className={`relative flex w-full items-start gap-4 rounded-2xl border p-4 text-left backdrop-blur-md transition-all md:p-5 ${
                      showRight
                        ? "border-tertiary/60 bg-tertiary/10"
                        : showWrong
                          ? "border-error/50 bg-error/5"
                          : selected
                            ? "border-2 border-primary bg-primary/10"
                            : "border border-white/10 bg-black/20 hover:border-primary/50 hover:bg-primary/5"
                    } ${disabled && !selected && !showRight ? "opacity-55" : ""}`}
                  >
                    <div
                      className={`font-label flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                        selected
                          ? "bg-primary text-on-primary"
                          : "border border-white/10 bg-black/40 text-primary"
                      }`}
                    >
                      {opt.key}
                    </div>
                    <span
                      className={`font-body text-sm md:text-base ${
                        selected ? "font-semibold text-on-surface" : "text-on-surface/90"
                      }`}
                    >
                      {opt.text}
                    </span>
                    {showRight && (
                      <span
                        className="material-symbols-outlined absolute right-4 top-4 text-tertiary"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        check_circle
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {confirmed && (
              <div
                className={`mb-10 flex items-start gap-4 rounded-xl border p-6 ${
                  isCorrect
                    ? "border-tertiary/30 bg-tertiary/5"
                    : "border-error/30 bg-error/5"
                }`}
              >
                <span
                  className={`material-symbols-outlined mt-0.5 ${
                    isCorrect ? "text-tertiary" : "text-error"
                  }`}
                >
                  {isCorrect ? "check_circle" : "cancel"}
                </span>
                <p className="text-sm leading-relaxed text-on-surface-variant">
                  {q.explanation}
                </p>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-4">
              <button
                type="button"
                onClick={onSkip}
                className="font-label rounded-xl border border-white/10 px-5 py-3 text-xs uppercase text-on-surface-variant transition-colors hover:bg-white/10"
              >
                Skip
              </button>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/components"
                  className="font-label rounded-xl border border-white/10 px-5 py-3 text-xs uppercase text-on-surface-variant hover:bg-white/10"
                >
                  Exit
                </Link>
                {!confirmed ? (
                  <button
                    type="button"
                    disabled={!choice}
                    onClick={onConfirm}
                    className="font-label rounded-xl bg-primary px-8 py-3 text-xs font-bold uppercase tracking-widest text-on-primary shadow-[0_0_20px_rgba(111,221,255,0.4)] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Confirm
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={goNext}
                    className="font-label rounded-xl border border-white/10 bg-white/5 px-8 py-3 text-xs font-bold uppercase tracking-widest hover:border-primary/50"
                  >
                    {idx >= total - 1 ? "Finish" : "Next"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel mt-8 flex flex-col items-center justify-between gap-4 rounded-[24px] border-white/5 p-6 md:flex-row md:p-8">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-secondary/20 bg-secondary/10 text-secondary">
              <span className="material-symbols-outlined text-2xl">emoji_events</span>
            </div>
            <div>
              <h2 className="font-headline text-base font-bold">Session score</h2>
              <p className="text-xs text-on-surface-variant">
                Updates after each confirmed answer (this run only).
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="font-label mb-1 block text-xs uppercase text-on-surface-variant">
              Correct answers
            </span>
            <span className="font-headline text-2xl font-bold text-on-surface">{score}</span>
          </div>
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
