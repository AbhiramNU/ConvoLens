import { CheckCircle2, Clock, Lightbulb, Users, Download, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AnalysisData {
  tasks: Array<{ task: string; assignee?: string; priority?: string }>;
  deadlines: Array<{ deadline: string; description: string; date?: string }>;
  decisions: Array<{ decision: string; context?: string }>;
  responsibilities: Array<{ person: string; responsibility: string }>;
  summary?: string;
}

interface AnalysisResultsProps {
  results: AnalysisData;
  chatFileName: string;
}

interface SectionProps {
  label: string;
  count: number;
  accent: "cyan" | "magenta" | "amber" | "emerald";
  icon: React.ReactNode;
  children: React.ReactNode;
}

const accentMap = {
  cyan: { bar: "bg-lens-cyan", text: "text-lens-cyan", bg: "bg-lens-cyan/10" },
  magenta: { bar: "bg-lens-magenta", text: "text-lens-magenta", bg: "bg-lens-magenta/10" },
  amber: { bar: "bg-lens-amber", text: "text-lens-amber", bg: "bg-lens-amber/10" },
  emerald: { bar: "bg-lens-emerald", text: "text-lens-emerald", bg: "bg-lens-emerald/10" },
};

const Section = ({ label, count, accent, icon, children }: SectionProps) => {
  const c = accentMap[accent];
  return (
    <div className="relative bg-surface-base border border-border hover:border-sharp transition-colors group">
      <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${c.bar}`} />
      <div className="p-6 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`${c.bg} p-2`}>{icon}</div>
          <div>
            <span className={`text-[9px] font-mono tracking-[0.25em] uppercase ${c.text}`}>
              [{label}]
            </span>
            <p className="text-lg font-semibold text-high">
              {count} <span className="text-low font-normal">signals</span>
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono text-low tabular-nums">
          {String(count).padStart(2, "0")}
        </span>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
};

export const AnalysisResults = ({ results, chatFileName }: AnalysisResultsProps) => {
  const handleExport = () => {
    const exportContent = `
ConvoLens Analysis — ${chatFileName}
Generated: ${new Date().toLocaleString()}

${results.summary ? `SUMMARY\n${results.summary}\n\n` : ""}

TASKS (${results.tasks.length}):
${results.tasks.map((t, i) => `${i + 1}. ${t.task}${t.assignee ? ` — ${t.assignee}` : ""}${t.priority ? ` [${t.priority}]` : ""}`).join("\n")}

DEADLINES (${results.deadlines.length}):
${results.deadlines.map((d, i) => `${i + 1}. ${d.deadline}${d.date ? ` — ${d.date}` : ""}${d.description ? `\n   ${d.description}` : ""}`).join("\n")}

DECISIONS (${results.decisions.length}):
${results.decisions.map((d, i) => `${i + 1}. ${d.decision}${d.context ? `\n   ${d.context}` : ""}`).join("\n")}

RESPONSIBILITIES (${results.responsibilities.length}):
${results.responsibilities.map((r, i) => `${i + 1}. ${r.person}: ${r.responsibility}`).join("\n")}
    `.trim();

    const blob = new Blob([exportContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `convolens-${chatFileName.replace(".txt", "")}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="size-1.5 bg-lens-cyan rounded-full animate-focal-pulse" />
            <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-lens-cyan">
              refraction complete
            </span>
          </div>
          <h2 className="text-4xl font-bold tracking-tight text-high">Clarity, extracted.</h2>
          <p className="text-sm text-mid font-mono">
            source · <span className="text-high">{chatFileName}</span>
          </p>
        </div>
        <Button
          onClick={handleExport}
          className="gap-2 bg-foreground text-background hover:bg-lens-cyan uppercase tracking-[0.2em] text-xs font-bold h-11 px-6 rounded-none"
        >
          <Download className="h-4 w-4" />
          Export report
        </Button>
      </div>

      {results.summary && (
        <div className="relative bg-surface-base border border-border p-8">
          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-lens-cyan via-lens-magenta to-lens-amber" />
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-4 w-4 text-lens-cyan" strokeWidth={1.5} />
            <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-lens-cyan">
              executive summary
            </span>
          </div>
          <p className="text-lg text-high leading-relaxed font-light">{results.summary}</p>
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <Section
          label="TASKS"
          count={results.tasks.length}
          accent="cyan"
          icon={<CheckCircle2 className="h-4 w-4 text-lens-cyan" strokeWidth={1.5} />}
        >
          {results.tasks.length > 0 ? (
            <ul className="space-y-4">
              {results.tasks.map((task, idx) => (
                <li key={idx} className="border-l border-border pl-4 py-1">
                  <p className="text-high">{task.task}</p>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {task.assignee && (
                      <span className="text-[10px] font-mono uppercase tracking-wider bg-surface-elevated text-mid px-2 py-1">
                        {task.assignee}
                      </span>
                    )}
                    {task.priority && (
                      <span className="text-[10px] font-mono uppercase tracking-wider border border-border text-low px-2 py-1">
                        {task.priority}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-low text-sm font-mono">// no tasks identified</p>
          )}
        </Section>

        <Section
          label="DEADLINES"
          count={results.deadlines.length}
          accent="amber"
          icon={<Clock className="h-4 w-4 text-lens-amber" strokeWidth={1.5} />}
        >
          {results.deadlines.length > 0 ? (
            <ul className="space-y-4">
              {results.deadlines.map((d, idx) => (
                <li key={idx} className="border-l border-border pl-4 py-1">
                  <p className="text-high font-medium">{d.deadline}</p>
                  {d.date && (
                    <p className="text-xs font-mono text-lens-amber mt-1 tabular-nums">
                      {d.date}
                    </p>
                  )}
                  {d.description && (
                    <p className="text-sm text-mid mt-1">{d.description}</p>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-low text-sm font-mono">// no deadlines identified</p>
          )}
        </Section>

        <Section
          label="DECISIONS"
          count={results.decisions.length}
          accent="magenta"
          icon={<Lightbulb className="h-4 w-4 text-lens-magenta" strokeWidth={1.5} />}
        >
          {results.decisions.length > 0 ? (
            <ul className="space-y-4">
              {results.decisions.map((d, idx) => (
                <li key={idx} className="border-l border-border pl-4 py-1">
                  <p className="text-high">{d.decision}</p>
                  {d.context && <p className="text-sm text-mid mt-1">{d.context}</p>}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-low text-sm font-mono">// no decisions identified</p>
          )}
        </Section>

        <Section
          label="RESPONSIBILITIES"
          count={results.responsibilities.length}
          accent="emerald"
          icon={<Users className="h-4 w-4 text-lens-emerald" strokeWidth={1.5} />}
        >
          {results.responsibilities.length > 0 ? (
            <ul className="space-y-4">
              {results.responsibilities.map((r, idx) => (
                <li key={idx} className="border-l border-border pl-4 py-1">
                  <p className="text-high">
                    <span className="font-semibold text-lens-emerald">{r.person}</span>
                    <span className="text-low mx-2">·</span>
                    {r.responsibility}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-low text-sm font-mono">// no responsibilities identified</p>
          )}
        </Section>
      </div>
    </div>
  );
};
