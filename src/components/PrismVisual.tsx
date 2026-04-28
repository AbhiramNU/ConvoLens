import { useEffect, useRef, useState } from "react";

type Signal = "decision" | "responsibility" | "deadline";

interface Scene {
  noise: { time: string; sender: string; message: string }[];
  insights: { type: Signal; label: string; title: string; meta?: string; ref?: string }[];
}

const SCENES: Scene[] = [
  {
    noise: [
      { time: "09:42", sender: "Marcus", message: "so are we dropping redis entirely or scaling it down?" },
      { time: "09:43", sender: "Elara", message: "dropping redis. it's causing state desyncs." },
      { time: "09:44", sender: "Elara", message: "i'll own the auth middleware rewrite." },
      { time: "09:51", sender: "Jin", message: "i'll get the api endpoints done by friday latest" },
    ],
    insights: [
      { type: "decision", label: "DECISION", title: "Deprecate Redis caching layer entirely.", ref: "09:43" },
      { type: "responsibility", label: "RESPONSIBILITY", title: "Rewrite auth middleware.", meta: "@Elara", ref: "09:44" },
      { type: "deadline", label: "DEADLINE", title: "Finalize API endpoints.", meta: "@Jin · Friday", ref: "09:51" },
    ],
  },
  {
    noise: [
      { time: "14:02", sender: "Priya", message: "who's handling the vendor demo on the 24th??" },
      { time: "14:03", sender: "Sam", message: "i can. give me the deck by wed." },
      { time: "14:05", sender: "Priya", message: "cool. also we agreed — no feature freeze till monday." },
      { time: "14:07", sender: "Arjun", message: "i'll prep the deck. done tuesday night." },
    ],
    insights: [
      { type: "responsibility", label: "RESPONSIBILITY", title: "Lead vendor demo presentation.", meta: "@Sam", ref: "14:03" },
      { type: "decision", label: "DECISION", title: "No feature freeze until Monday.", ref: "14:05" },
      { type: "deadline", label: "DEADLINE", title: "Deliver vendor pitch deck.", meta: "@Arjun · Tue", ref: "14:07" },
    ],
  },
];

const barColor: Record<Signal, string> = {
  decision: "bg-lens-magenta",
  responsibility: "bg-lens-cyan",
  deadline: "bg-lens-amber",
};
const textColor: Record<Signal, string> = {
  decision: "text-lens-magenta",
  responsibility: "text-lens-cyan",
  deadline: "text-lens-amber",
};
const bgTint: Record<Signal, string> = {
  decision: "bg-lens-magenta/10",
  responsibility: "bg-lens-cyan/10",
  deadline: "bg-lens-amber/10",
};

export const PrismVisual = () => {
  const [sceneIdx, setSceneIdx] = useState(0);
  const [tick, setTick] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const id = setInterval(() => {
      setSceneIdx((s) => (s + 1) % SCENES.length);
      setTick((t) => t + 1);
    }, 6500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const dx = (e.clientX - rect.left - rect.width / 2) / rect.width;
      const dy = (e.clientY - rect.top - rect.height / 2) / rect.height;
      setParallax({ x: dx, y: dy });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const scene = SCENES[sceneIdx];

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[560px] bg-surface-base border border-border shadow-lens overflow-hidden"
      style={{
        transform: `perspective(1400px) rotateY(${parallax.x * 3}deg) rotateX(${-parallax.y * 3}deg)`,
        transition: "transform 300ms cubic-bezier(0.4,0,0.2,1)",
      }}
    >
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at ${50 + parallax.x * 30}% ${50 + parallax.y * 30}%, hsl(var(--lens-cyan) / 0.14), transparent 55%)`,
          transition: "background 300ms ease-out",
        }}
      />

      <div className="h-10 border-b border-border flex items-center justify-between px-4 bg-surface-elevated relative z-10">
        <span className="text-[10px] text-mid tracking-[0.2em] uppercase font-mono">
          input · whatsapp_export.txt
        </span>
        <div className="flex items-center gap-1.5">
          <div className="size-1.5 bg-[hsl(var(--text-low))] rounded-full" />
          <div className="size-1.5 bg-[hsl(var(--text-low))] rounded-full" />
          <div className="size-1.5 bg-lens-cyan rounded-full animate-focal-pulse" />
        </div>
      </div>

      <div className="flex w-full h-[calc(100%-2.5rem)] relative">
        {/* NOISE */}
        <div className="group w-1/2 relative overflow-hidden border-r border-border bg-[hsl(var(--surface-void))]/60">
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-r from-transparent to-surface-base z-10 pointer-events-none" />
          <div className="absolute inset-x-0 h-16 bg-gradient-to-b from-transparent via-lens-cyan/10 to-transparent animate-scan-line z-10 pointer-events-none" />

          <div key={`noise-${tick}`} className="p-6 flex flex-col gap-4">
            {scene.noise.map((m, i) => {
              const isMe = i % 2 === 1; // alternate sides
              return (
                <div
                  key={`${tick}-${i}`}
                  className={`flex gap-3 items-end ${isMe ? "flex-row-reverse" : ""}`}
                  style={{
                    animation: `fade-in 0.5s ease-out ${i * 0.15}s both`,
                    transform: `translateX(${parallax.x * -6}px)`,
                    transition: "transform 300ms ease-out",
                  }}
                >
                  <div className="size-7 rounded-full bg-surface-elevated border border-border shrink-0 flex items-center justify-center text-[9px] font-mono text-low">
                    {m.sender.slice(0, 2).toUpperCase()}
                  </div>
                  <div className={`flex flex-col gap-1 max-w-[75%] ${isMe ? "items-end" : "items-start"}`}>
                    <span className="text-[9px] text-low font-mono tracking-[0.2em] uppercase">
                      {m.time} · {m.sender}
                    </span>
                    <p
                      className={`wa-bubble ${isMe ? "wa-me" : "wa-them"} text-sm leading-snug px-3 py-2 rounded-md`}
                    >
                      {m.message}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* FOCAL LINE */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 z-20 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-foreground to-transparent animate-focal-pulse" />
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-32 h-32 opacity-60">
            <div className="w-full h-full bg-gradient-prism blur-3xl" />
          </div>
        </div>

        {/* SIGNAL */}
        <div className="w-1/2 p-6 bg-surface-elevated relative overflow-hidden">
          <div className="flex items-center gap-2 mb-4">
            <div className="size-1.5 bg-lens-cyan rounded-full animate-focal-pulse" />
            <span className="text-[9px] text-high tracking-[0.25em] uppercase font-mono">
              extracted · {scene.insights.length} signals
            </span>
          </div>

          <div
            key={`signal-${tick}`}
            className="flex flex-col gap-3"
            style={{
              transform: `translateX(${parallax.x * 8}px)`,
              transition: "transform 300ms ease-out",
            }}
          >
            {scene.insights.map((ins, i) => (
              <div
                key={`${tick}-${i}`}
                className="group/card relative bg-surface-base border border-border p-4 hover-tint reveal-color"
                style={{
                  animation: `materialize 0.7s cubic-bezier(0.4,0,0.2,1) ${0.6 + i * 0.25}s both`,
                }}
              >
                <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${barColor[ins.type]}`} />
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[9px] ${textColor[ins.type]} ${bgTint[ins.type]} tracking-[0.25em] uppercase font-mono px-2 py-0.5`}
                  >
                    [{ins.label}]
                  </span>
                  {ins.ref && (
                    <span className="text-[9px] text-low font-mono tabular-nums">
                      ref · {ins.ref}
                    </span>
                  )}
                </div>
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm text-high font-semibold leading-snug hover-glow">{ins.title}</p>
                  {ins.meta && (
                    <span className="text-[10px] text-mid shrink-0 font-mono">{ins.meta}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
