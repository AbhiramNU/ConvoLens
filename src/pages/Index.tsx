import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/FileUpload";
import { DateRangeSelector } from "@/components/DateRangeSelector";
import { AnalysisResults } from "@/components/AnalysisResults";
import { LoadingState } from "@/components/LoadingState";
import { PrismVisual } from "@/components/PrismVisual";
import { ConvoLensLogo } from "@/components/ConvoLensLogo";
import { useToast } from "@/hooks/use-toast";
import { DateRange } from "react-day-picker";
import {
  parseWhatsAppChat,
  filterMessagesByDateRange,
  formatChatForAnalysis,
} from "@/lib/chatParser";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const { toast } = useToast();

  // Cursor-reactive glow for the hero
  const heroRef = useRef<HTMLDivElement>(null);
  const [cursor, setCursor] = useState({ x: 50, y: 30 });

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 100;
      const y = ((e.clientY - r.top) / r.height) * 100;
      setCursor({ x, y });
    };
    el.addEventListener("mousemove", onMove);
    return () => el.removeEventListener("mousemove", onMove);
  }, []);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setAnalysisResults(null);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      toast({
        title: "No transcript loaded",
        description: "Drop a WhatsApp .txt export to begin refraction.",
        variant: "destructive",
      });
      return;
    }
    setIsAnalyzing(true);
    setAnalysisResults(null);
    try {
      const fileContent = await selectedFile.text();
      const messages = parseWhatsAppChat(fileContent);
      if (messages.length === 0) {
        toast({
          title: "No messages found",
          description: "The file doesn't contain valid WhatsApp messages.",
          variant: "destructive",
        });
        setIsAnalyzing(false);
        return;
      }
      const filteredMessages = filterMessagesByDateRange(
        messages,
        dateRange?.from,
        dateRange?.to
      );
      if (filteredMessages.length === 0) {
        toast({
          title: "Empty window",
          description: "No messages found in the selected date range.",
          variant: "destructive",
        });
        setIsAnalyzing(false);
        return;
      }
      const chatContent = formatChatForAnalysis(filteredMessages);
      const { data, error } = await supabase.functions.invoke("analyze-chat", {
        body: { chatContent },
      });
      if (error) {
        toast({
          title: "Refraction failed",
          description: error.message || "Please try again.",
          variant: "destructive",
        });
        setIsAnalyzing(false);
        return;
      }
      setAnalysisResults(data);
      toast({
        title: "Clarity achieved",
        description: `Refracted ${filteredMessages.length} messages into structured insight.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-high relative overflow-hidden">
      {/* NAV */}
      <nav className="border-b border-border bg-background/70 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <a href="#top" className="flex items-center gap-3 group">
            <ConvoLensLogo size={26} className="transition-transform group-hover:rotate-[-6deg]" />
            <span className="text-sm font-bold tracking-[0.3em] uppercase text-high">
              Convo<span className="text-lens-cyan">Lens</span>
            </span>
          </a>
          <div className="hidden md:flex items-center gap-10 text-[10px] font-mono tracking-[0.25em] uppercase text-mid">
            <a href="#how" className="hover:text-high transition-colors">How it works</a>
            <a href="#upload" className="hover:text-high transition-colors">Try it</a>
            <a href="#why" className="hover:text-high transition-colors">Why ConvoLens</a>
          </div>
          <a
            href="#upload"
            className="px-5 py-2.5 bg-foreground text-background text-[10px] font-bold uppercase tracking-[0.25em] hover:bg-lens-cyan transition-colors"
          >
            Begin
          </a>
        </div>
      </nav>

      {!analysisResults ? (
        <>
          {/* HERO */}
          <section
            id="top"
            ref={heroRef}
            className="relative max-w-[1400px] mx-auto px-6 pt-16 pb-28"
          >
            {/* cursor-reactive refraction glow */}
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none opacity-60 transition-[background] duration-300"
              style={{
                background: `radial-gradient(600px circle at ${cursor.x}% ${cursor.y}%, hsl(var(--lens-cyan) / 0.12), transparent 60%)`,
              }}
            />

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] gap-16 items-center relative">
              {/* LEFT — copy */}
              <div className="flex flex-col gap-8">
                <div className="flex items-center gap-3">
                  <div className="size-1.5 bg-lens-cyan rounded-full animate-focal-pulse" />
                  <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-lens-cyan">
                    for students · teams · project groups
                  </span>
                </div>

                <h1 className="text-6xl lg:text-7xl xl:text-8xl font-extrabold tracking-[-0.03em] leading-[0.9] text-balance hover-glow">
                  Refract
                  <br />
                  <span className="text-low">the</span> noise.
                </h1>

                <p className="text-lg text-mid max-w-[52ch] leading-relaxed">
                  Your WhatsApp group chats hide every deadline, decision, and promise
                  you've ever made. <span className="text-high">ConvoLens</span> reads
                  the whole transcript and hands you back a clean brief —
                  <span className="text-high"> tasks, deadlines, decisions, and who's on the hook.</span>
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <a
                    href="#upload"
                    className="group inline-flex items-center gap-3 bg-foreground text-background px-8 py-4 font-bold text-sm uppercase tracking-[0.25em] hover:bg-lens-cyan transition-colors"
                  >
                    Upload a chat
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" strokeWidth={2} />
                  </a>
                  <a
                    href="#how"
                    className="text-[11px] font-mono tracking-[0.25em] uppercase text-mid hover:text-high border-b border-mid/40 hover:border-foreground pb-0.5 transition-colors"
                  >
                    See how it works →
                  </a>
                </div>

                {/* inline spec row */}
                <div className="grid grid-cols-3 gap-6 pt-6 border-t border-border mt-4">
                  {[
                    { k: "Input", v: "WhatsApp .txt" },
                    { k: "Output", v: "Structured brief" },
                    { k: "Storage", v: "None · private" },
                  ].map((s) => (
                    <div key={s.k}>
                      <p className="text-[9px] font-mono tracking-[0.25em] uppercase text-low">
                        {s.k}
                      </p>
                      <p className="text-sm text-high mt-1 font-medium">{s.v}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT — live prism */}
              <div>
                <PrismVisual />
                <p className="mt-3 text-[10px] font-mono tracking-[0.25em] uppercase text-low text-center">
                  live preview · chaos → clarity, in real time
                </p>
              </div>
            </div>
          </section>

          {/* HOW IT WORKS */}
          <section id="how" className="border-t border-border bg-surface-void/40">
            <div className="max-w-[1400px] mx-auto px-6 py-24">
              <div className="flex items-end justify-between mb-14 flex-wrap gap-6">
                <div>
                  <p className="text-[10px] font-mono tracking-[0.3em] uppercase text-lens-cyan mb-4">
                    the process
                  </p>
                  <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-high max-w-2xl">
                    Three steps. One clean brief.
                  </h2>
                </div>
                <p className="text-mid max-w-md">
                  No accounts. No chat is stored. Your transcript passes through the lens and
                  only the structured output comes out the other side.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-px bg-border border border-border">
                {[
                  {
                    num: "01",
                    title: "Export your chat",
                    body: "In WhatsApp: open the group → More → Export chat → Without media. You'll get a .txt file.",
                    accent: "text-lens-cyan",
                  },
                  {
                    num: "02",
                    title: "Pick the window",
                    body: "Optionally narrow to a date range — say the last sprint, or the week before a deadline.",
                    accent: "text-lens-amber",
                  },
                  {
                    num: "03",
                    title: "Read your brief",
                    body: "ConvoLens extracts tasks, deadlines, decisions & owners — then lets you export as a text report.",
                    accent: "text-lens-magenta",
                  },
                ].map((s) => (
                  <div
                    key={s.num}
                    className="bg-background p-10 transition-colors group relative hover-tint reveal-color"
                  >
                    <div className={`text-6xl font-bold font-mono ${s.accent} opacity-80 group-hover:opacity-100 transition-opacity`}>
                      {s.num}
                    </div>
                    <h3 className="text-xl font-semibold text-high mt-8 mb-3 hover-glow">{s.title}</h3>
                    <p className="text-mid leading-relaxed">{s.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* UPLOAD */}
          <section id="upload" className="max-w-[1400px] mx-auto px-6 py-24">
            <div className="max-w-3xl mx-auto space-y-8">
              <div className="text-center space-y-4">
                <p className="text-[10px] font-mono tracking-[0.3em] uppercase text-lens-cyan">
                  try it now
                </p>
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-high">
                  Drop a chat. Get your brief.
                </h2>
                <p className="text-mid max-w-xl mx-auto">
                  Works best with project or club group chats. We'll never store your file.
                </p>
              </div>

              <FileUpload onFileSelect={handleFileSelect} />

              {selectedFile && !isAnalyzing && (
                <div className="space-y-6 animate-slide-up">
                  <DateRangeSelector
                    dateRange={dateRange}
                    onDateRangeChange={setDateRange}
                  />
                  <div className="flex justify-center pt-2">
                    <Button
                      onClick={handleAnalyze}
                      disabled={isAnalyzing}
                      className="group bg-foreground text-background hover:bg-lens-cyan rounded-none h-14 px-10 text-sm font-bold uppercase tracking-[0.3em] gap-3"
                    >
                      Initialize refraction
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </div>
                </div>
              )}

              {isAnalyzing && <LoadingState />}
            </div>
          </section>

          {/* WHY */}
          <section id="why" className="border-t border-border bg-surface-void/40">
            <div className="max-w-[1400px] mx-auto px-6 py-24">
              <div className="grid md:grid-cols-2 gap-16 items-start">
                <div>
                  <p className="text-[10px] font-mono tracking-[0.3em] uppercase text-lens-cyan mb-4">
                    why convolens
                  </p>
                  <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-high mb-6">
                    Nobody scrolls through 2,000 messages looking for the decision.
                  </h2>
                  <p className="text-mid text-lg leading-relaxed">
                    Group chats are where student projects actually live — but they're
                    also where tasks go to die. ConvoLens is the lens you point at the
                    chaos to see what was actually agreed, promised, and due.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-px bg-border border border-border">
                  {[
                    { label: "Tasks", desc: "Every action item extracted", color: "text-lens-cyan" },
                    { label: "Deadlines", desc: "Implicit & explicit dates", color: "text-lens-amber" },
                    { label: "Decisions", desc: "What was actually agreed", color: "text-lens-magenta" },
                    { label: "Owners", desc: "Who said they'd do it", color: "text-lens-emerald" },
                  ].map((c) => (
                    <div
                      key={c.label}
                      className="bg-background p-8 transition-colors hover-tint reveal-color"
                    >
                      <p className={`text-[10px] font-mono tracking-[0.25em] uppercase ${c.color} mb-3`}>
                        [{c.label}]
                      </p>
                      <p className="text-high font-semibold text-lg mb-1 hover-glow">{c.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </>
      ) : (
        <main className="max-w-[1400px] mx-auto px-6 py-12">
          <Button
            variant="ghost"
            onClick={() => {
              setAnalysisResults(null);
              setSelectedFile(null);
              setDateRange(undefined);
            }}
            className="mb-8 text-mid hover:text-high font-mono tracking-[0.2em] uppercase text-[11px] gap-2"
          >
            <ArrowLeft className="size-3.5" /> Refract another chat
          </Button>
          <AnalysisResults
            results={analysisResults}
            chatFileName={selectedFile?.name || "chat"}
          />
        </main>
      )}

      {/* FOOTER */}
      <footer className="border-t border-border">
        <div className="max-w-[1400px] mx-auto px-6 py-10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ConvoLensLogo size={20} />
            <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-mid">
              ConvoLens · v1.0 · refraction engine
            </span>
          </div>
          <p className="text-[10px] font-mono tracking-[0.25em] uppercase text-low">
            your chat is never stored · processed in memory
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
