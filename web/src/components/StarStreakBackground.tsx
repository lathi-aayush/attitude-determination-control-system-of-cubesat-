import type { CSSProperties } from "react";

const STREAKS: { top: string; y: string; delay: string }[] = [
  { top: "10%", y: "10px", delay: "0s" },
  { top: "30%", y: "50px", delay: "2s" },
  { top: "70%", y: "-30px", delay: "4s" },
  { top: "85%", y: "20px", delay: "6s" },
  { top: "50%", y: "100px", delay: "3s" },
  { top: "20%", y: "-80px", delay: "5s" },
];

export function StarStreakBackground() {
  return (
    <div className="star-bg" aria-hidden>
      {STREAKS.map((s, i) => (
        <div
          key={i}
          className="star-streak"
          style={
            {
              top: s.top,
              "--y": s.y,
              animationDelay: s.delay,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
