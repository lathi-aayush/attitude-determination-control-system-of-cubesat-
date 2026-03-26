import { useEffect, useId } from "react";

/** Components page: dense procedural starfield (matches Stitch script). */
export function StarsFieldBackground() {
  const id = useId().replace(/:/g, "");
  useEffect(() => {
    const container = document.getElementById(`stars-${id}`);
    if (!container) return;
    container.innerHTML = "";
    const starCount = 150;
    for (let i = 0; i < starCount; i++) {
      const star = document.createElement("div");
      star.className = "star-drift";
      const size = Math.random() * 2 + 1;
      const left = Math.random() * 100;
      const duration = Math.random() * 20 + 20;
      const delay = Math.random() * -40;
      const opacity = Math.random() * 0.5 + 0.1;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.left = `${left}%`;
      star.style.setProperty("--duration", `${duration}s`);
      star.style.animationDelay = `${delay}s`;
      star.style.opacity = String(opacity);
      if (Math.random() > 0.8) {
        star.style.boxShadow = `0 0 ${size * 2}px #6fddff`;
        star.style.background = "#6fddff";
      }
      container.appendChild(star);
    }
  }, [id]);
  return <div id={`stars-${id}`} className="stars-field" aria-hidden />;
}
