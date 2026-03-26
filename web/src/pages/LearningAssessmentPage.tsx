import { Link } from "react-router-dom";
import { useCallback, useMemo, useState } from "react";
import { MobileNav } from "../components/MobileNav";
import { SiteHeader } from "../components/SiteHeader";
import { StarsLearningBackground } from "../components/StarsLearningBackground";
import { LEARNING_ASSESSMENT_QUESTIONS } from "../data/learningAssessment";

const STORAGE_BEST = "aarambhsat-assessment-learning-best-v1";

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

export function LearningAssessmentPage() {
  const questions = LEARNING_ASSESSMENT_QUESTIONS;
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
      <div className="min-h-screen font-body text-on-surface selection:bg-primary-container selection:text-on-primary-container">
        <StarsLearningBackground />
        <SiteHeader />
        <main className="relative mx-auto max-w-lg px-6 pb-28 pt-32">
          <div className="glass-panel rounded-2xl border border-tertiary/30 p-8 text-center md:p-10">
            <span className="material-symbols-outlined mb-4 text-5xl text-tertiary">
              workspace_premium
            </span>
            <h1 className="font-headline mb-2 text-2xl font-bold text-on-surface">
              Module 04 complete
            </h1>
            <p className="mb-6 text-sm text-on-surface-variant">
              You scored{" "}
              <span className="font-bold text-primary">
                {score} / {total}
              </span>{" "}
              ({pct}%)
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={resetQuiz}
                className="font-label rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-xs uppercase tracking-widest text-on-surface hover:bg-white/10"
              >
                Retake
              </button>
              <Link
                to="/learning"
                className="font-label rounded-xl bg-primary px-6 py-3 text-xs font-bold uppercase tracking-widest text-on-primary"
              >
                Back to Learning
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
    <div className="min-h-screen font-body text-on-surface selection:bg-primary-container selection:text-on-primary-container">
      <StarsLearningBackground />
      <SiteHeader />
      <main className="relative mx-auto max-w-3xl px-6 pb-28 pt-32">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/assessments"
              className="font-label text-xs uppercase tracking-widest text-on-surface-variant hover:text-primary"
            >
              Assessments
            </Link>
            <span className="text-on-surface-variant/50">/</span>
            <span className="font-label text-xs uppercase tracking-widest text-primary">
              Module 04
            </span>
          </div>
          <div className="font-label rounded-full bg-white/10 px-3 py-1 text-xs text-primary">
            {idx + 1} / {total}
          </div>
        </div>

        <div className="mb-4 h-1 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${((idx + 1) / total) * 100}%` }}
          />
        </div>

        <div className="glass-panel relative overflow-hidden rounded-2xl p-8 md:p-12">
          <div className="pointer-events-none absolute right-0 top-0 select-none p-8 opacity-10">
            <span className="material-symbols-outlined text-[120px]">quiz</span>
          </div>
          <div className="relative z-10">
            <div className="mb-8">
              <h1 className="font-headline mb-2 flex items-center gap-3 text-xl font-bold text-primary-fixed md:text-2xl">
                <span className="rounded-lg border border-white/10 bg-white/5 p-2">
                  <span className="material-symbols-outlined">psychology</span>
                </span>
                Knowledge Check
              </h1>
              <p className="text-sm text-on-surface-variant">ADCS & reaction wheels</p>
            </div>
            <div className="space-y-8">
              <h2 className="font-body text-base leading-relaxed text-on-surface md:text-lg">
                {q.question}
              </h2>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
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
                      className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all md:gap-4 md:p-5 ${
                        showRight
                          ? "border-tertiary border-tertiary/60 bg-tertiary/10"
                          : showWrong
                            ? "border-error/50 bg-error/5"
                            : selected
                              ? "border-primary/50 bg-primary/10 shadow-[0_0_15px_rgba(58,214,255,0.1)]"
                              : "border-white/10 bg-black/20 hover:border-white/30"
                      } ${disabled && !selected && !showRight ? "opacity-60" : ""}`}
                    >
                      <span
                        className={`font-label flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs ${
                          selected
                            ? "bg-primary text-on-primary"
                            : "border border-white/20"
                        }`}
                      >
                        {opt.key}
                      </span>
                      <span className="font-body text-sm text-on-surface">{opt.text}</span>
                    </button>
                  );
                })}
              </div>

              {confirmed && (
                <div
                  className={`flex items-start gap-4 rounded-xl border p-6 backdrop-blur-md ${
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
                  <div>
                    <h3 className="mb-1 font-bold text-on-surface">
                      {isCorrect ? "Correct" : "Incorrect"}
                    </h3>
                    <p className="text-sm leading-relaxed text-on-surface-variant">
                      {q.explanation}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={onSkip}
                  className="font-label rounded-lg border border-white/10 px-4 py-2.5 text-xs uppercase tracking-widest text-on-surface-variant hover:bg-white/10"
                >
                  Skip
                </button>
                <div className="flex flex-wrap gap-3">
                  <Link
                    to="/learning"
                    className="font-label rounded-lg border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:border-primary/50"
                  >
                    Exit
                  </Link>
                  {!confirmed ? (
                    <button
                      type="button"
                      disabled={!choice}
                      onClick={onConfirm}
                      className="font-label rounded-lg bg-primary px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-on-primary shadow-[0_0_20px_rgba(111,221,255,0.4)] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Confirm
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={goNext}
                      className="font-label flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-8 py-2.5 text-xs font-bold uppercase tracking-widest hover:border-primary/50"
                    >
                      {idx >= total - 1 ? "Finish" : "Next"}
                      <span className="material-symbols-outlined text-sm">chevron_right</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
