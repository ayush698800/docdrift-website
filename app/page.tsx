"use client";
import { motion } from "framer-motion";
import { Github, Terminal, Zap, Shield, GitBranch, Code2, FileText, Star } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } }
};

const terminalLines = [
  { text: "$ git add .", color: "#fff", delay: 0 },
  { text: "$ docdrift commit", color: "#fff", delay: 800 },
  { text: "", color: "", delay: 1400 },
  { text: "DocDrift scanning before commit...", color: "#00ff88", delay: 1800 },
  { text: "", color: "", delay: 2200 },
  { text: "Found 1 errors · 0 warnings · 2 undocumented", color: "#ff6b6b", delay: 2600 },
  { text: "", color: "", delay: 3000 },
  { text: "ERROR validate_token", color: "#ff6b6b", delay: 3200 },
  { text: "  README.md line 7", color: "#555", delay: 3600 },
  { text: "  Docs say returns True/False but raises exception", color: "#888", delay: 4000 },
  { text: "", color: "", delay: 4400 },
  { text: "Fix this? (y/n): y", color: "#00ff88", delay: 4600 },
  { text: "Generating fix...", color: "#555", delay: 5200 },
  { text: "✔ Fixed — README.md updated", color: "#00ff88", delay: 6800 },
  { text: "", color: "", delay: 7200 },
  { text: "Auto-document all? (y/n): y", color: "#00ff88", delay: 7400 },
  { text: "✔ Added 2 new sections to README", color: "#00ff88", delay: 8400 },
  { text: "", color: "", delay: 8800 },
  { text: "Commit now? (y/n): y", color: "#00ff88", delay: 9000 },
  { text: "✔ Committed — refactor auth flow", color: "#00ff88", delay: 9800 },
];

function AnimatedTerminal() {
  const [visibleLines, setVisibleLines] = useState<number[]>([]);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    terminalLines.forEach((line, i) => {
      setTimeout(() => {
        setVisibleLines(prev => [...prev, i]);
      }, line.delay);
    });
  }, [started]);

  const replay = () => {
    setVisibleLines([]);
    setStarted(false);
    setTimeout(() => setStarted(true), 200);
  };

  return (
    <div ref={ref} style={{ background: "#111", border: "1px solid #222", borderRadius: "12px", overflow: "hidden" }}>
      <div style={{ background: "#1a1a1a", padding: "12px 16px", display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid #222" }}>
        <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#ff5f57" }} />
        <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#ffbd2e" }} />
        <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#28c840" }} />
        <span style={{ color: "#555", fontSize: "12px", marginLeft: "8px", fontFamily: "var(--font-mono)" }}>terminal</span>
        <button type="button" onClick={replay}
          style={{ marginLeft: "auto", background: "none", border: "1px solid #333", color: "#555", fontSize: "11px", padding: "2px 8px", borderRadius: "4px", cursor: "pointer" }}>
          replay
        </button>
      </div>
      <div style={{ padding: "24px", fontFamily: "var(--font-mono)", fontSize: "13px", lineHeight: 2, minHeight: "400px" }}>
        {terminalLines.map((line, i) => (
          visibleLines.includes(i) ? (
            <motion.p key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }} style={{ color: line.color || "transparent", minHeight: "1.5em" }}>
              {line.text}
            </motion.p>
          ) : null
        ))}
        {started && visibleLines.length < terminalLines.length && (
          <motion.span animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }}
            style={{ color: "#00ff88" }}>▋</motion.span>
        )}
      </div>
    </div>
  );
}

function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { error: supabaseError } = await supabase
        .from('waitlist')
        .insert({ email });

      if (supabaseError) {
        console.error('Supabase error:', supabaseError);
      }

      await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      setSubmitted(true);
    } catch (e) {
      console.error('Submit error:', e);
      setSubmitted(true);
    }

    setLoading(false);
  };

  if (submitted) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        style={{ textAlign: "center", padding: "1rem", color: "#00ff88", fontSize: "14px" }}>
        ✔ You are on the waitlist — we will reach out soon
      </motion.div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center" }}>
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={e => { setEmail(e.target.value); setError(""); }}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
          style={{
            background: "#1a1a1a", border: `1px solid ${error ? "#ff6b6b" : "#333"}`,
            borderRadius: "8px", padding: "10px 16px", color: "#fff",
            fontSize: "14px", outline: "none", width: "220px"
          }}
        />
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          style={{
            background: loading ? "#00ff8866" : "#00ff88",
            color: "#0a0a0a", border: "none", borderRadius: "8px",
            padding: "10px 20px", fontSize: "14px", fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer"
          }}>
          {loading ? "Joining..." : "Join waitlist"}
        </button>
      </div>
      {error && <p style={{ color: "#ff6b6b", fontSize: "12px", textAlign: "center", margin: 0 }}>{error}</p>}
    </div>
  );
}

function GitHubStars() {
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    fetch("https://api.github.com/repos/ayush698800/docwatcher")
      .then(r => r.json())
      .then(d => setStars(d.stargazers_count))
      .catch(() => setStars(null));
  }, []);

  if (stars === null) return null;

  return (
    <a href="https://github.com/ayush698800/docwatcher" target="_blank"
      style={{ display: "flex", alignItems: "center", gap: "6px", background: "#1a1a1a", border: "1px solid #333", borderRadius: "6px", padding: "4px 10px", textDecoration: "none", color: "#ccc", fontSize: "12px" }}>
      <Star size={12} style={{ color: "#ffbd2e" }} />
      {stars} stars
    </a>
  );
}

export default function Home() {
  return (
    <main style={{ fontFamily: "var(--font-inter)" }}>

      <nav style={{
        position: "fixed", top: 0, width: "100%", zIndex: 100,
        background: "rgba(10,10,10,0.9)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid #1a1a1a", padding: "0 2rem",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: "60px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ color: "#00ff88", fontSize: "20px", fontWeight: 700 }}>DocDrift</span>
          <span style={{ background: "#00ff8822", color: "#00ff88", fontSize: "11px", padding: "2px 8px", borderRadius: "20px", border: "1px solid #00ff8844" }}>v2.0.0</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <GitHubStars />
          <a href="https://github.com/ayush698800/docwatcher" target="_blank"
            style={{ color: "#888", textDecoration: "none", fontSize: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
            <Github size={16} /> GitHub
          </a>
          <a href="https://pypi.org/project/docdrift/" target="_blank"
            style={{ background: "#00ff88", color: "#0a0a0a", padding: "6px 16px", borderRadius: "6px", textDecoration: "none", fontSize: "13px", fontWeight: 600 }}>
            pip install docdrift
          </a>
        </div>
      </nav>

      <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", textAlign: "center", padding: "80px 2rem 4rem", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 0%, #00ff8811 0%, transparent 60%)", pointerEvents: "none" }} />
        <motion.div initial="hidden" animate="visible" variants={stagger}>
          <motion.div variants={fadeUp} style={{ marginBottom: "24px" }}>
            <span style={{ background: "#00ff8815", color: "#00ff88", border: "1px solid #00ff8830", padding: "6px 16px", borderRadius: "20px", fontSize: "13px" }}>
              Now on PyPI — pip install docdrift
            </span>
          </motion.div>
          <motion.h1 variants={fadeUp} style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)", fontWeight: 800, lineHeight: 1.1, marginBottom: "24px", letterSpacing: "-0.02em" }}>
            Your docs are lying.<br />
            <span style={{ color: "#00ff88" }}>DocDrift fixes them.</span>
          </motion.h1>
          <motion.p variants={fadeUp} style={{ fontSize: "clamp(1rem, 2vw, 1.25rem)", color: "#888", maxWidth: "600px", margin: "0 auto 40px", lineHeight: 1.6 }}>
            DocDrift watches your git commits, finds documentation that is now wrong,
            and fixes it automatically using AI — before you merge.
          </motion.p>
          <motion.div variants={fadeUp} style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap", marginBottom: "20px" }}>
            <div style={{ background: "#111", border: "1px solid #222", borderRadius: "8px", padding: "12px 20px", fontFamily: "var(--font-mono)", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "#00ff88" }}>$</span>
              <span>pip install docdrift</span>
              <button type="button" onClick={() => navigator.clipboard.writeText("pip install docdrift")}
                style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: "12px" }}>copy</button>
            </div>
            <a href="https://github.com/ayush698800/docwatcher" target="_blank"
              style={{ display: "flex", alignItems: "center", gap: "8px", border: "1px solid #333", borderRadius: "8px", padding: "12px 20px", textDecoration: "none", color: "#fff", fontSize: "14px" }}>
              <Github size={16} /> View on GitHub
            </a>
          </motion.div>
          <motion.div variants={fadeUp} style={{ display: "flex", gap: "24px", justifyContent: "center", color: "#555", fontSize: "13px", flexWrap: "wrap" }}>
            <span>✓ Free and open source</span>
            <span>✓ Works locally — no data sent</span>
            <span>✓ GitHub Actions ready</span>
          </motion.div>
        </motion.div>
      </section>

      <section style={{ padding: "2rem 2rem 6rem", maxWidth: "900px", margin: "0 auto" }}>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
          style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "8px" }}>See it in action</h2>
          <p style={{ color: "#555", fontSize: "14px" }}>Scroll down and watch the magic happen</p>
        </motion.div>
        <AnimatedTerminal />
      </section>

      <section style={{ padding: "3rem 2rem", borderTop: "1px solid #111", borderBottom: "1px solid #111", background: "#080808" }}>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
          style={{ maxWidth: "900px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "2rem", textAlign: "center" }}>
          {[
            { number: "v2.0.0", label: "Latest version" },
            { number: "Free", label: "Open source forever" },
            { number: "3 AI", label: "Groq · Ollama · LM Studio" },
            { number: "2 langs", label: "Python · JavaScript" },
          ].map(s => (
            <motion.div key={s.label} variants={fadeUp}>
              <div style={{ fontSize: "2rem", fontWeight: 700, color: "#00ff88", marginBottom: "4px" }}>{s.number}</div>
              <div style={{ fontSize: "13px", color: "#555" }}>{s.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section style={{ padding: "6rem 2rem", maxWidth: "1000px", margin: "0 auto" }}>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
          <motion.h2 variants={fadeUp} style={{ textAlign: "center", fontSize: "2rem", fontWeight: 700, marginBottom: "3rem" }}>
            How it works
          </motion.h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "2rem" }}>
            {[
              { step: "01", title: "You change code", desc: "Edit a function, class, or config in your project" },
              { step: "02", title: "DocDrift detects it", desc: "Tree-sitter parses the diff and finds what changed" },
              { step: "03", title: "Semantic search", desc: "Finds every doc section related to that change" },
              { step: "04", title: "AI checks accuracy", desc: "LLM reads both code and docs — is this still true?" },
              { step: "05", title: "Fix generated", desc: "AI writes updated documentation matching the code" },
              { step: "06", title: "You approve", desc: "One keypress applies the fix before committing" },
            ].map((item) => (
              <motion.div key={item.step} variants={fadeUp}
                style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: "12px", padding: "1.5rem" }}>
                <div style={{ color: "#00ff88", fontFamily: "var(--font-mono)", fontSize: "12px", marginBottom: "8px" }}>{item.step}</div>
                <h3 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "8px" }}>{item.title}</h3>
                <p style={{ fontSize: "13px", color: "#666", lineHeight: 1.5 }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      <section style={{ padding: "6rem 2rem", maxWidth: "1000px", margin: "0 auto" }}>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
          <motion.h2 variants={fadeUp} style={{ textAlign: "center", fontSize: "2rem", fontWeight: 700, marginBottom: "3rem" }}>
            Everything you need
          </motion.h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
            {[
              { icon: <Zap size={20} />, title: "Auto-fix stale docs", desc: "AI generates correct documentation and applies it with one keypress" },
              { icon: <FileText size={20} />, title: "Auto-document new code", desc: "New functions with no docs get documented automatically" },
              { icon: <Terminal size={20} />, title: "Interactive commit flow", desc: "docdrift commit — scan, fix, and commit in one command" },
              { icon: <GitBranch size={20} />, title: "GitHub Actions", desc: "Automatic PR checks — every PR gets verified before merge" },
              { icon: <Shield size={20} />, title: "Local AI support", desc: "Run fully private with LM Studio or Ollama — code never leaves your machine" },
              { icon: <Code2 size={20} />, title: "Pre-commit hook", desc: "Blocks commits with critical doc errors before they reach the repo" },
            ].map((f) => (
              <motion.div key={f.title} variants={fadeUp}
                style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: "12px", padding: "1.5rem", display: "flex", gap: "1rem" }}>
                <div style={{ color: "#00ff88", flexShrink: 0, marginTop: "2px" }}>{f.icon}</div>
                <div>
                  <h3 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "6px" }}>{f.title}</h3>
                  <p style={{ fontSize: "13px", color: "#666", lineHeight: 1.5 }}>{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      <section style={{ padding: "6rem 2rem", maxWidth: "900px", margin: "0 auto" }}>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
          <motion.h2 variants={fadeUp} style={{ textAlign: "center", fontSize: "2rem", fontWeight: 700, marginBottom: "1rem" }}>
            Add to any repo in 30 seconds
          </motion.h2>
          <motion.p variants={fadeUp} style={{ textAlign: "center", color: "#666", marginBottom: "2rem" }}>
            Every PR gets automatically checked. Findings posted as comments.
          </motion.p>
          <motion.div variants={fadeUp} style={{ background: "#111", border: "1px solid #222", borderRadius: "12px", overflow: "hidden" }}>
            <div style={{ background: "#1a1a1a", padding: "10px 16px", borderBottom: "1px solid #222" }}>
              <span style={{ fontSize: "12px", color: "#555", fontFamily: "var(--font-mono)" }}>.github/workflows/docdrift.yml</span>
            </div>
            <pre style={{ padding: "24px", fontFamily: "var(--font-mono)", fontSize: "13px", lineHeight: 1.8, color: "#ccc", overflow: "auto", margin: 0 }}>
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
          </motion.div>
        </motion.div>
      </section>

      <section style={{ padding: "6rem 2rem", maxWidth: "800px", margin: "0 auto" }}>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
          <motion.h2 variants={fadeUp} style={{ textAlign: "center", fontSize: "2rem", fontWeight: 700, marginBottom: "3rem" }}>
            Simple pricing
          </motion.h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
            <motion.div variants={fadeUp} style={{ background: "#111", border: "1px solid #222", borderRadius: "16px", padding: "2rem" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "8px" }}>Open Source</h3>
              <div style={{ fontSize: "3rem", fontWeight: 800, marginBottom: "8px" }}>Free</div>
              <p style={{ color: "#666", fontSize: "13px", marginBottom: "1.5rem" }}>Forever. Self-hosted.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "2rem" }}>
                {["pip install docdrift", "Local AI — fully private", "Pre-commit hook", "GitHub Actions", "CLI tool"].map(f => (
                  <div key={f} style={{ display: "flex", gap: "8px", fontSize: "13px", color: "#ccc" }}>
                    <span style={{ color: "#00ff88" }}>✓</span> {f}
                  </div>
                ))}
              </div>
              <a href="https://github.com/ayush698800/docwatcher" target="_blank"
                style={{ display: "block", textAlign: "center", border: "1px solid #333", borderRadius: "8px", padding: "10px", textDecoration: "none", color: "#fff", fontSize: "14px" }}>
                Get started free
              </a>
            </motion.div>

            <motion.div variants={fadeUp} style={{ background: "#111", border: "2px solid #00ff88", borderRadius: "16px", padding: "2rem", position: "relative" }}>
              <div style={{ position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)", background: "#00ff88", color: "#0a0a0a", fontSize: "11px", fontWeight: 700, padding: "4px 12px", borderRadius: "20px" }}>
                COMING SOON
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "8px" }}>Hosted</h3>
              <div style={{ fontSize: "3rem", fontWeight: 800, marginBottom: "4px" }}>$7<span style={{ fontSize: "1rem", color: "#666" }}>/mo</span></div>
              <p style={{ color: "#666", fontSize: "13px", marginBottom: "1.5rem" }}>Zero setup. Always on.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "2rem" }}>
                {["Everything in free", "Zero setup — connect GitHub", "Cloud AI included", "Dashboard", "PR notifications", "Email alerts"].map(f => (
                  <div key={f} style={{ display: "flex", gap: "8px", fontSize: "13px", color: "#ccc" }}>
                    <span style={{ color: "#00ff88" }}>✓</span> {f}
                  </div>
                ))}
              </div>
              <WaitlistForm />
            </motion.div>
          </div>
        </motion.div>
      </section>

      <section style={{ padding: "6rem 2rem", textAlign: "center", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 50%, #00ff8808 0%, transparent 70%)", pointerEvents: "none" }} />
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
          <motion.h2 variants={fadeUp} style={{ fontSize: "clamp(1.5rem, 4vw, 3rem)", fontWeight: 800, marginBottom: "16px" }}>
            Stop letting your docs lie.
          </motion.h2>
          <motion.p variants={fadeUp} style={{ color: "#666", fontSize: "16px", marginBottom: "32px" }}>
            Free. Open source. Works in 60 seconds.
          </motion.p>
          <motion.div variants={fadeUp} style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <div style={{ background: "#111", border: "1px solid #222", borderRadius: "8px", padding: "12px 20px", fontFamily: "var(--font-mono)", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "#00ff88" }}>$</span>
              <span>pip install docdrift</span>
              <button type="button" onClick={() => navigator.clipboard.writeText("pip install docdrift")}
                style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: "12px" }}>copy</button>
            </div>
            <a href="https://github.com/ayush698800/docwatcher" target="_blank"
              style={{ display: "flex", alignItems: "center", gap: "8px", border: "1px solid #333", borderRadius: "8px", padding: "12px 20px", textDecoration: "none", color: "#fff", fontSize: "14px" }}>
              <Github size={16} /> Star on GitHub
            </a>
          </motion.div>
        </motion.div>
      </section>

      <footer style={{ borderTop: "1px solid #1a1a1a", padding: "2rem", textAlign: "center", color: "#444", fontSize: "13px" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: "24px", marginBottom: "1rem", flexWrap: "wrap" }}>
          <a href="https://github.com/ayush698800/docwatcher" target="_blank" style={{ color: "#555", textDecoration: "none" }}>GitHub</a>
          <a href="https://pypi.org/project/docdrift/" target="_blank" style={{ color: "#555", textDecoration: "none" }}>PyPI</a>
          <a href="https://github.com/marketplace/actions/docdrift" target="_blank" style={{ color: "#555", textDecoration: "none" }}>Marketplace</a>
          <a href="https://github.com/ayush698800/docwatcher/blob/main/README.md" target="_blank" style={{ color: "#555", textDecoration: "none" }}>Docs</a>
        </div>
        <p>Built by ayush698800 · MIT License · DocDrift v2.0.0</p>
      </footer>

    </main>
  );
}