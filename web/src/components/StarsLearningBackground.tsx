/** Learning page: lightweight drifting stars (matches Stitch HTML). */
export function StarsLearningBackground() {
  const stars = [
    { top: "10%", left: "20%", w: "w-0.5", h: "h-0.5", dur: "8s", delay: "0s" },
    { top: "5%", left: "45%", w: "w-[1px]", h: "h-[1px]", dur: "12s", delay: "2s" },
    { top: "15%", left: "75%", w: "w-0.5", h: "h-0.5", dur: "10s", delay: "1s" },
    { top: "25%", left: "10%", w: "w-[1px]", h: "h-[1px]", dur: "15s", delay: "4s" },
    { top: "40%", left: "85%", w: "w-0.5", h: "h-0.5", dur: "9s", delay: "3s" },
    { top: "60%", left: "30%", w: "w-[1px]", h: "h-[1px]", dur: "14s", delay: "0.5s" },
    { top: "80%", left: "55%", w: "w-0.5", h: "h-0.5", dur: "11s", delay: "5s" },
    { top: "35%", left: "65%", w: "w-[1px]", h: "h-[1px]", dur: "13s", delay: "2.5s" },
    { top: "50%", left: "15%", w: "w-0.5", h: "h-0.5", dur: "10s", delay: "6s" },
    { top: "70%", left: "90%", w: "w-[1px]", h: "h-[1px]", dur: "16s", delay: "1.5s" },
  ];
  return (
    <div className="stars-learning" aria-hidden>
      {stars.map((s, i) => (
        <div
          key={i}
          className={`star-fall ${s.w} ${s.h}`}
          style={{
            top: s.top,
            left: s.left,
            animationDuration: s.dur,
            animationDelay: s.delay,
          }}
        />
      ))}
    </div>
  );
}
