"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { Github, ArrowRight, Check, Terminal, Zap, Shield, GitBranch, Code2, FileText, Star, Copy, ChevronRight } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const terminalLines = [
  { text: "$ git add .", color: "#e4e4e7", delay: 0 },
  { text: "$ docdrift commit", color: "#e4e4e7", delay: 700 },
  { text: "", delay: 1200 },
  { text: "◆ scanning changed symbols...", color: "#52525b", delay: 1500 },
  { text: "", delay: 1900 },
  { text: "  validate_token  →  README.md:7", color: "#a1a1aa", delay: 2100 },
  { text: "  AuthService.login  →  README.md:15", color: "#a1a1aa", delay: 2400 },
  { text: "", delay: 2700 },
  { text: "◆ running LLM consistency check...", color: "#52525b", delay: 2900 },
  { text: "", delay: 3600 },
  { text: "  ✗ ERROR  validate_token", color: "#f87171", delay: 3800 },
  { text: "    docs say returns bool — now raises exception", color: "#71717a", delay: 4100 },
  { text: "", delay: 4400 },
  { text: "  Fix this? [y/n] › y", color: "#e4e4e7", delay: 4600 },
  { text: "", delay: 5200 },
  { text: "  ◆ generating fix...", color: "#52525b", delay: 5400 },
  { text: "  ✓ README.md updated", color: "#4ade80", delay: 7100 },
  { text: "", delay: 7400 },
  { text: "  2 undocumented symbols found", color: "#a1a1aa", delay: 7600 },
  { text: "  Auto-document all? [y/n] › y", color: "#e4e4e7", delay: 7900 },
  { text: "  ✓ added 2 sections to README", color: "#4ade80", delay: 9200 },
  { text: "", delay: 9500 },
  { text: "  Commit message › refactor auth flow", color: "#e4e4e7", delay: 9700 },
  { text: "  ✓ committed", color: "#4ade80", delay: 10400 },
];

function useTypewriter(started: boolean) {
  const [visible, setVisible] = useState<number[]>([]);

  useEffect(() => {
    if (!started) { setVisible([]); return; }
    const timers: ReturnType<typeof setTimeout>[] = [];
    terminalLines.forEach((_, i) => {
      timers.push(setTimeout(() => setVisible(p => [...p, i]), terminalLines[i].delay));
    });
    return () => timers.forEach(clearTimeout);
  }, [started]);

  return visible;
}

function TerminalDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);
  const [key, setKey] = useState(0);
  const visible = useTypewriter(started);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStarted(true); }, { threshold: 0.2 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const replay = () => { setStarted(false); setKey(k => k + 1); setTimeout(() => setStarted(true), 100); };

  return (
    <div ref={ref} key={key} style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace", background: "#09090b", border: "1px solid #27272a", borderRadius: "12px", overflow: "hidden" }}>
      <div style={{ background: "#18181b", padding: "10px 16px", display: "flex", alignItems: "center", gap: "6px", borderBottom: "1px solid #27272a" }}>
        <div style={{ width: "11px", height: "11px", borderRadius: "50%", background: "#3f3f46" }} />
        <div style={{ width: "11px", height: "11px", borderRadius: "50%", background: "#3f3f46" }} />
        <div style={{ width: "11px", height: "11px", borderRadius: "50%", background: "#3f3f46" }} />
        <span style={{ marginLeft: "10px", fontSize: "11px", color: "#52525b", letterSpacing: "0.05em" }}>docdrift — bash</span>
        <button onClick={replay} type="button" style={{ marginLeft: "auto", fontSize: "10px", color: "#52525b", background: "none", border: "1px solid #27272a", padding: "2px 8px", borderRadius: "4px", cursor: "pointer", letterSpacing: "0.05em" }}>replay ↺</button>
      </div>
      <div style={{ padding: "20px 24px", minHeight: "380px", lineHeight: "1.9", fontSize: "12.5px" }}>
        {terminalLines.map((line, i) =>
          visible.includes(i) ? (
            <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }}
              style={{ color: line.color || "transparent", minHeight: "1em", whiteSpace: "pre" }}>
              {line.text || " "}
            </motion.div>
          ) : null
        )}
        {started && visible.length < terminalLines.length && (
          <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ repeat: Infinity, duration: 1 }}
            style={{ color: "#4ade80", fontSize: "13px" }}>█</motion.span>
        )}
      </div>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button type="button" onClick={copy} style={{ background: "none", border: "none", cursor: "pointer", color: copied ? "#4ade80" : "#52525b", display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", letterSpacing: "0.05em", transition: "color 0.2s" }}>
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? "copied" : "copy"}
    </button>
  );
}

function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.includes("@")) return;
    setLoading(true);
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!
      );
      await supabase.from("waitlist").insert({ email });
      await fetch("/api/waitlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      setSubmitted(true);
    } catch (e) {
      console.error(e);
      setSubmitted(true);
    }
    setLoading(false);
  };

  if (submitted) return (
    <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
      style={{ color: "#4ade80", fontSize: "13px", textAlign: "center", fontFamily: "monospace" }}>
      ✓ you are on the list
    </motion.p>
  );

  return (
    <div style={{ display: "flex", gap: "8px", width: "100%" }}>
      <input type="email" placeholder="your@email.com" value={email}
        onChange={e => setEmail(e.target.value)}
        onKeyDown={e => e.key === "Enter" && handleSubmit()}
        style={{ flex: 1, background: "#18181b", border: "1px solid #27272a", borderRadius: "8px", padding: "9px 14px", color: "#e4e4e7", fontSize: "13px", outline: "none", fontFamily: "inherit" }} />
      <button type="button" onClick={handleSubmit} disabled={loading}
        style={{ background: "#4ade80", color: "#09090b", border: "none", borderRadius: "8px", padding: "9px 18px", fontSize: "13px", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1, whiteSpace: "nowrap" }}>
        {loading ? "..." : "join waitlist"}
      </button>
    </div>
  );
}

function GitHubStars() {
  const [stars, setStars] = useState<number | null>(null);
  useEffect(() => {
    fetch("https://api.github.com/repos/ayush698800/docwatcher")
      .then(r => r.json()).then(d => setStars(d.stargazers_count)).catch(() => { });
  }, []);
  if (!stars && stars !== 0) return null;
  return (
    <a href="https://github.com/ayush698800/docwatcher" target="_blank"
      style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", color: "#71717a", textDecoration: "none", border: "1px solid #27272a", padding: "4px 10px", borderRadius: "6px", background: "#18181b" }}>
      <Star size={11} style={{ color: "#eab308" }} fill="#eab308" />
      {stars}
    </a>
  );
}

const features = [
  { icon: <Zap size={16} />, title: "auto-fix stale docs", desc: "AI rewrites the exact section that is now wrong. One keypress applies it." },
  { icon: <FileText size={16} />, title: "auto-document new code", desc: "New functions with no docs get documented automatically before commit." },
  { icon: <Terminal size={16} />, title: "docdrift commit", desc: "One command — scan, fix undocumented symbols, commit. Everything." },
  { icon: <GitBranch size={16} />, title: "github actions", desc: "Drop in two lines of YAML. Every PR gets checked automatically." },
  { icon: <Shield size={16} />, title: "fully local", desc: "LM Studio or Ollama. Your code never leaves your machine." },
  { icon: <Code2 size={16} />, title: "pre-commit hook", desc: "Blocks commits with critical doc errors before they hit the repo." },
];

const steps = [
  { n: "01", t: "change code", d: "Edit any function, class, or config" },
  { n: "02", t: "DocDrift detects it", d: "Tree-sitter parses the exact diff" },
  { n: "03", t: "semantic search", d: "Finds every doc section about that symbol" },
  { n: "04", t: "LLM verdict", d: "Is this documentation still accurate?" },
  { n: "05", t: "fix generated", d: "AI writes the corrected documentation" },
  { n: "06", t: "you approve", d: "One keypress. README updated. Done." },
];

export default function Home() {
  return (
    <main style={{ background: "#09090b", color: "#e4e4e7", minHeight: "100vh", fontFamily: "'DM Sans', 'Inter', sans-serif", overflowX: "hidden" }}>

      {/* grid bg */}
      <div style={{ position: "fixed", inset: 0, backgroundImage: "linear-gradient(#18181b 1px, transparent 1px), linear-gradient(90deg, #18181b 1px, transparent 1px)", backgroundSize: "40px 40px", opacity: 0.4, pointerEvents: "none", zIndex: 0 }} />

      {/* glow */}
      <div style={{ position: "fixed", top: "-200px", left: "50%", transform: "translateX(-50%)", width: "600px", height: "600px", background: "radial-gradient(circle, #4ade8012 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      {/* NAV */}
      <nav style={{ position: "fixed", top: 0, width: "100%", zIndex: 50, borderBottom: "1px solid #18181b", backdropFilter: "blur(16px)", background: "rgba(9,9,11,0.85)" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px", height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontWeight: 800, fontSize: "17px", letterSpacing: "-0.02em" }}>DocDrift</span>
            <span style={{ fontSize: "10px", color: "#4ade80", border: "1px solid #4ade8030", background: "#4ade8008", padding: "2px 7px", borderRadius: "4px", letterSpacing: "0.08em", fontFamily: "monospace" }}>v2.0.0</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <GitHubStars />
            <a href="https://github.com/ayush698800/docwatcher" target="_blank"
              style={{ color: "#71717a", textDecoration: "none", fontSize: "13px", display: "flex", alignItems: "center", gap: "5px" }}>
              <Github size={14} /> GitHub
            </a>
            <a href="https://pypi.org/project/docdrift/" target="_blank"
              style={{ background: "#4ade80", color: "#09090b", padding: "6px 14px", borderRadius: "7px", textDecoration: "none", fontSize: "12px", fontWeight: 700, letterSpacing: "0.02em" }}>
              pip install
            </a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ position: "relative", zIndex: 1, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "100px 24px 60px", textAlign: "center" }}>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          style={{ marginBottom: "28px" }}>
          <span style={{ fontSize: "11px", letterSpacing: "0.15em", color: "#52525b", textTransform: "uppercase", border: "1px solid #27272a", padding: "5px 14px", borderRadius: "4px", fontFamily: "monospace" }}>
            now available on pypi
          </span>
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
          style={{ fontSize: "clamp(2.8rem, 7vw, 5.5rem)", fontWeight: 900, lineHeight: 1.05, letterSpacing: "-0.03em", marginBottom: "20px", maxWidth: "800px" }}>
          your docs are lying.
          <br />
          <span style={{ color: "#4ade80" }}>docdrift fixes them.</span>
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
          style={{ fontSize: "clamp(1rem, 2vw, 1.15rem)", color: "#71717a", maxWidth: "520px", lineHeight: 1.7, marginBottom: "40px" }}>
          watches your git commits, finds documentation that is now wrong,
          and fixes it automatically using AI — before you merge.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
          style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center", marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#18181b", border: "1px solid #27272a", borderRadius: "8px", padding: "10px 16px", fontFamily: "monospace", fontSize: "13px" }}>
            <span style={{ color: "#4ade80" }}>$</span>
            <span>pip install docdrift</span>
            <CopyButton text="pip install docdrift" />
          </div>
          <a href="https://github.com/ayush698800/docwatcher" target="_blank"
            style={{ display: "flex", alignItems: "center", gap: "7px", border: "1px solid #27272a", borderRadius: "8px", padding: "10px 18px", textDecoration: "none", color: "#a1a1aa", fontSize: "13px", background: "#18181b" }}>
            <Github size={14} /> view on github <ArrowRight size={12} />
          </a>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          style={{ display: "flex", gap: "20px", color: "#3f3f46", fontSize: "12px", letterSpacing: "0.04em", flexWrap: "wrap", justifyContent: "center" }}>
          {["free & open source", "local AI — fully private", "github actions ready"].map(t => (
            <span key={t} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <Check size={10} style={{ color: "#4ade80" }} /> {t}
            </span>
          ))}
        </motion.div>
      </section>

      {/* TERMINAL */}
      <section style={{ position: "relative", zIndex: 1, padding: "0 24px 80px", maxWidth: "820px", margin: "0 auto" }}>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <p style={{ textAlign: "center", fontSize: "11px", letterSpacing: "0.12em", color: "#3f3f46", textTransform: "uppercase", marginBottom: "20px", fontFamily: "monospace" }}>
            — watch it work —
          </p>
          <TerminalDemo />
        </motion.div>
      </section>

      {/* STATS */}
      <section style={{ position: "relative", zIndex: 1, borderTop: "1px solid #18181b", borderBottom: "1px solid #18181b", padding: "40px 24px", background: "#0a0a0f" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "2rem", textAlign: "center" }}>
          {[
            { v: "v2.0.0", l: "stable release" },
            { v: "free", l: "forever open source" },
            { v: "3", l: "AI providers" },
            { v: "2", l: "languages supported" },
          ].map(s => (
            <motion.div key={s.l} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
              <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#4ade80", letterSpacing: "-0.02em", fontFamily: "monospace" }}>{s.v}</div>
              <div style={{ fontSize: "11px", color: "#52525b", marginTop: "4px", letterSpacing: "0.06em", textTransform: "uppercase" }}>{s.l}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ position: "relative", zIndex: 1, padding: "80px 24px", maxWidth: "1000px", margin: "0 auto" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p style={{ fontSize: "11px", letterSpacing: "0.15em", color: "#52525b", textTransform: "uppercase", fontFamily: "monospace", marginBottom: "12px" }}>process</p>
          <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "48px" }}>how it works</h2>
        </motion.div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1px", background: "#18181b", border: "1px solid #18181b", borderRadius: "12px", overflow: "hidden" }}>
          {steps.map((s, i) => (
            <motion.div key={s.n} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
              style={{ background: "#09090b", padding: "24px 20px" }}>
              <div style={{ fontSize: "10px", color: "#3f3f46", fontFamily: "monospace", letterSpacing: "0.1em", marginBottom: "10px" }}>{s.n}</div>
              <div style={{ fontSize: "13px", fontWeight: 600, marginBottom: "6px", color: "#e4e4e7" }}>{s.t}</div>
              <div style={{ fontSize: "12px", color: "#52525b", lineHeight: 1.5 }}>{s.d}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ position: "relative", zIndex: 1, padding: "0 24px 80px", maxWidth: "1000px", margin: "0 auto" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p style={{ fontSize: "11px", letterSpacing: "0.15em", color: "#52525b", textTransform: "uppercase", fontFamily: "monospace", marginBottom: "12px" }}>capabilities</p>
          <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "48px" }}>everything you need</h2>
        </motion.div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1px", background: "#18181b", border: "1px solid #18181b", borderRadius: "12px", overflow: "hidden" }}>
          {features.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
              style={{ background: "#09090b", padding: "24px", display: "flex", gap: "14px" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#0f0f12")}
              onMouseLeave={e => (e.currentTarget.style.background = "#09090b")}>
              <div style={{ color: "#4ade80", flexShrink: 0, marginTop: "1px" }}>{f.icon}</div>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 600, marginBottom: "5px", color: "#e4e4e7", fontFamily: "monospace" }}>{f.title}</div>
                <div style={{ fontSize: "12px", color: "#52525b", lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* GITHUB ACTIONS */}
      <section style={{ position: "relative", zIndex: 1, padding: "0 24px 80px", maxWidth: "860px", margin: "0 auto" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p style={{ fontSize: "11px", letterSpacing: "0.15em", color: "#52525b", textTransform: "uppercase", fontFamily: "monospace", marginBottom: "12px" }}>integration</p>
          <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "8px" }}>add to any repo in 30 seconds</h2>
          <p style={{ color: "#52525b", fontSize: "13px", marginBottom: "32px" }}>every PR gets checked automatically. findings posted as a comment.</p>
          <div style={{ background: "#09090b", border: "1px solid #27272a", borderRadius: "12px", overflow: "hidden" }}>
            <div style={{ background: "#18181b", padding: "10px 16px", borderBottom: "1px solid #27272a", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "11px", color: "#52525b", fontFamily: "monospace" }}>.github/workflows/docdrift.yml</span>
              <CopyButton text={`name: DocDrift
on:
  pull_request:
    branches: [main, master]
  workflow_dispatch:

jobs:
  check-docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 2
      - name: DocDrift
        uses: ayush698800/docwatcher@v2.0.0
        with:
          groq_api_key: \${{ secrets.GROQ_API_KEY }}`} />
            </div>
            <pre style={{ padding: "24px", fontFamily: "monospace", fontSize: "12.5px", lineHeight: 1.9, color: "#a1a1aa", margin: 0, overflowX: "auto" }}>
{`name: DocDrift
on:
  pull_request:
    branches: [main, master]
  workflow_dispatch:

jobs:
  check-docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 2

      - name: DocDrift
        uses: ayush698800/docwatcher@v2.0.0
        with:
          groq_api_key: \${{ secrets.GROQ_API_KEY }}`}
            </pre>
          </div>
        </motion.div>
      </section>

      {/* PRICING */}
      <section style={{ position: "relative", zIndex: 1, padding: "0 24px 80px", maxWidth: "780px", margin: "0 auto" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p style={{ fontSize: "11px", letterSpacing: "0.15em", color: "#52525b", textTransform: "uppercase", fontFamily: "monospace", marginBottom: "12px" }}>pricing</p>
          <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "40px" }}>simple pricing</h2>
        </motion.div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>

          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ background: "#09090b", border: "1px solid #27272a", borderRadius: "12px", padding: "28px" }}>
            <div style={{ fontSize: "12px", color: "#52525b", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "monospace", marginBottom: "16px" }}>open source</div>
            <div style={{ fontSize: "3rem", fontWeight: 900, letterSpacing: "-0.03em", marginBottom: "4px" }}>free</div>
            <div style={{ fontSize: "12px", color: "#52525b", marginBottom: "24px" }}>forever · self-hosted</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
              {["pip install docdrift", "local AI — fully private", "pre-commit hook", "github actions", "cli tool"].map(f => (
                <div key={f} style={{ display: "flex", gap: "8px", fontSize: "13px", color: "#a1a1aa", fontFamily: "monospace" }}>
                  <Check size={13} style={{ color: "#4ade80", flexShrink: 0, marginTop: "1px" }} /> {f}
                </div>
              ))}
            </div>
            <a href="https://github.com/ayush698800/docwatcher" target="_blank"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", border: "1px solid #27272a", borderRadius: "7px", padding: "10px", textDecoration: "none", color: "#a1a1aa", fontSize: "13px" }}>
              get started <ArrowRight size={12} />
            </a>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            style={{ background: "#09090b", border: "1px solid #4ade8040", borderRadius: "12px", padding: "28px", position: "relative" }}>
            <div style={{ position: "absolute", top: "-11px", left: "20px", background: "#4ade80", color: "#09090b", fontSize: "10px", fontWeight: 800, padding: "3px 10px", borderRadius: "4px", letterSpacing: "0.1em", fontFamily: "monospace" }}>
              COMING SOON
            </div>
            <div style={{ fontSize: "12px", color: "#4ade80", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "monospace", marginBottom: "16px" }}>hosted</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "4px" }}>
              <span style={{ fontSize: "3rem", fontWeight: 900, letterSpacing: "-0.03em" }}>$7</span>
              <span style={{ fontSize: "13px", color: "#52525b" }}>/month</span>
            </div>
            <div style={{ fontSize: "12px", color: "#52525b", marginBottom: "24px" }}>zero setup · always on</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
              {["everything in free", "connect github in one click", "cloud AI included", "dashboard", "pr notifications", "email alerts"].map(f => (
                <div key={f} style={{ display: "flex", gap: "8px", fontSize: "13px", color: "#a1a1aa", fontFamily: "monospace" }}>
                  <Check size={13} style={{ color: "#4ade80", flexShrink: 0, marginTop: "1px" }} /> {f}
                </div>
              ))}
            </div>
            <WaitlistForm />
          </motion.div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ position: "relative", zIndex: 1, padding: "60px 24px 80px", textAlign: "center", borderTop: "1px solid #18181b" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 100%, #4ade8008 0%, transparent 60%)", pointerEvents: "none" }} />
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", fontWeight: 900, letterSpacing: "-0.03em", marginBottom: "12px" }}>
            stop letting your docs lie.
          </h2>
          <p style={{ color: "#52525b", fontSize: "14px", marginBottom: "32px" }}>free · open source · works in 60 seconds</p>
          <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#18181b", border: "1px solid #27272a", borderRadius: "8px", padding: "10px 16px", fontFamily: "monospace", fontSize: "13px" }}>
              <span style={{ color: "#4ade80" }}>$</span>
              <span>pip install docdrift</span>
              <CopyButton text="pip install docdrift" />
            </div>
            <a href="https://github.com/ayush698800/docwatcher" target="_blank"
              style={{ display: "flex", alignItems: "center", gap: "7px", border: "1px solid #27272a", borderRadius: "8px", padding: "10px 18px", textDecoration: "none", color: "#a1a1aa", fontSize: "13px", background: "#18181b" }}>
              <Star size={13} /> star on github
            </a>
          </div>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer style={{ position: "relative", zIndex: 1, borderTop: "1px solid #18181b", padding: "24px", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: "24px", marginBottom: "12px", flexWrap: "wrap" }}>
          {[
            { label: "github", href: "https://github.com/ayush698800/docwatcher" },
            { label: "pypi", href: "https://pypi.org/project/docdrift/" },
            { label: "marketplace", href: "https://github.com/marketplace/actions/docdrift" },
            { label: "docs", href: "https://github.com/ayush698800/docwatcher/blob/main/README.md" },
          ].map(l => (
            <a key={l.label} href={l.href} target="_blank"
              style={{ color: "#3f3f46", textDecoration: "none", fontSize: "12px", fontFamily: "monospace", letterSpacing: "0.05em" }}>
              {l.label}
            </a>
          ))}
        </div>
        <p style={{ color: "#27272a", fontSize: "11px", fontFamily: "monospace", letterSpacing: "0.05em" }}>
          built by ayush698800 · mit license · docdrift v2.0.0
        </p>
      </footer>

    </main>
  );
}