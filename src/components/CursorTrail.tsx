import { useEffect, useRef } from "react";

/**
 * Global cursor + star trail.
 * - A bright dot follows the cursor 1:1
 * - A soft ring eases behind it
 * - Every few pixels a small colored "star" spawns and fades out
 * - Dot swells + shifts color over interactive elements (WandaVision reveal cue)
 */
export const CursorTrail = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(hover: none)").matches) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let lastStarX = mouseX;
    let lastStarY = mouseY;
    let raf = 0;

    const palette = [
      "hsl(var(--lens-cyan))",
      "hsl(var(--lens-magenta))",
      "hsl(var(--lens-amber))",
      "hsl(var(--lens-emerald))",
    ];

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
      }

      const dx = mouseX - lastStarX;
      const dy = mouseY - lastStarY;
      const dist = Math.hypot(dx, dy);

      if (dist > 18 && layerRef.current) {
        lastStarX = mouseX;
        lastStarY = mouseY;
        const star = document.createElement("span");
        star.className = "cursor-star";
        const size = 4 + Math.random() * 6;
        const color = palette[Math.floor(Math.random() * palette.length)];
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.background = color;
        star.style.boxShadow = `0 0 ${8 + size}px ${color}`;
        star.style.left = `${mouseX + (Math.random() - 0.5) * 8}px`;
        star.style.top = `${mouseY + (Math.random() - 0.5) * 8}px`;
        layerRef.current.appendChild(star);
        // Auto-cleanup after animation
        window.setTimeout(() => star.remove(), 1000);
      }

      const target = e.target as HTMLElement | null;
      const interactive =
        !!target &&
        !!target.closest(
          "a, button, [role='button'], input, textarea, select, label, .hover-tint, .hover-glow, .wa-bubble"
        );
      dotRef.current?.classList.toggle("is-hovering", interactive);
    };

    const tick = () => {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div ref={layerRef} aria-hidden className="pointer-events-none fixed inset-0 z-[9997]" />
      <div ref={ringRef} aria-hidden className="cursor-ring" />
      <div ref={dotRef} aria-hidden className="cursor-dot" />
    </>
  );
};
