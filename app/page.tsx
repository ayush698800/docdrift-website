"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Github, ArrowRight, Check, Terminal, Zap, Shield, GitBranch, Code2, FileText, Star, Copy, GripVertical } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

// ─── TERMINAL LINES ────────────────────────────────────────────────────────────
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

// ─── BEFORE / AFTER DOC CONTENT ───────────────────────────────────────────────
const docBefore = [
  { type: "heading", text: "## validate_token" },
  { type: "blank" },
  { type: "text", text: "Validates a token and its scope." },
  { type: "blank" },
  { type: "returns", text: "Returns: `bool` — True if valid, False otherwise.", bad: true },
  { type: "blank" },
  { type: "example", text: "result = validate_token(tok)\nif result:\n    proceed()" },
  { type: "blank" },
  { type: "heading", text: "## AuthService" },
  { type: "blank" },
  { type: "text", text: "Service class for authentication." },
  { type: "blank" },
  { type: "missing", text: "← no docs for .login()" },
  { type: "missing", text: "← no docs for .logout()" },
];

const docAfter = [
  { type: "heading", text: "## validate_token" },
  { type: "blank" },
  { type: "text", text: "Validates a token and its scope." },
  { type: "blank" },
  { type: "returns", text: "Raises: `NotImplementedError` — validation removed.", bad: false },
  { type: "note", text: "Use `AuthService.login()` instead." },
  { type: "blank" },
  { type: "example", text: "try:\n    validate_token(tok)\nexcept NotImplementedError:\n    use_auth_service()" },
  { type: "blank" },
  { type: "heading", text: "## AuthService" },
  { type: "blank" },
  { type: "text", text: "Service class for authentication." },
  { type: "blank" },
  { type: "added", text: "### .login(user, password)" },
  { type: "added_text", text: "Authenticates a user and returns a session token." },
  { type: "blank" },
  { type: "added", text: "### .logout(token)" },
  { type: "added_text", text: "Invalidates the session token and clears auth state." },
];

// ─── VS CODE FILE CONTENTS ────────────────────────────────────────────────────
type CodeLine = { n: number; text: string; color: string; highlight?: boolean };
type FileData = { lines: CodeLine[]; language: string };

const fileContents: Record<string, FileData> = {
  "auth.py": {
    language: "python",
    lines: [
      { n: 1,  text: "from exceptions import NotImplementedError", color: "#a78bfa" },
      { n: 2,  text: "", color: "" },
      { n: 3,  text: "def validate_token(token, scope=None):", color: "#60a5fa" },
      { n: 4,  text: '    """Validate a token."""', color: "#6b7280" },
      { n: 5,  text: "    # TODO: refactor — raise instead of return", color: "#374151" },
      { n: 6,  text: "    raise NotImplementedError(", color: "#f87171", highlight: true },
      { n: 7,  text: '        "validation removed — use AuthService"', color: "#fbbf24", highlight: true },
      { n: 8,  text: "    )", color: "#f87171", highlight: true },
      { n: 9,  text: "", color: "" },
      { n: 10, text: "class AuthService:", color: "#60a5fa" },
      { n: 11, text: "    def login(self, user, password):", color: "#34d399" },
      { n: 12, text: '        """Authenticate and return session."""', color: "#6b7280" },
      { n: 13, text: "        return self._create_session(user)", color: "#e4e4e7" },
      { n: 14, text: "", color: "" },
      { n: 15, text: "    def logout(self, token):", color: "#34d399" },
      { n: 16, text: '        """Invalidate session token."""', color: "#6b7280" },
      { n: 17, text: "        self._revoke(token)", color: "#e4e4e7" },
    ],
  },
  "README.md": {
    language: "markdown",
    lines: [
      { n: 1,  text: "# docwatcher", color: "#60a5fa" },
      { n: 2,  text: "", color: "" },
      { n: 3,  text: "AI-powered documentation drift detector.", color: "#a1a1aa" },
      { n: 4,  text: "", color: "" },
      { n: 5,  text: "## validate_token", color: "#34d399" },
      { n: 6,  text: "", color: "" },
      { n: 7,  text: "Returns: `bool` — True if valid, False otherwise.", color: "#f87171", highlight: true },
      { n: 8,  text: "", color: "" },
      { n: 9,  text: "```python", color: "#6b7280" },
      { n: 10, text: "result = validate_token(tok)", color: "#e4e4e7" },
      { n: 11, text: "if result: proceed()", color: "#e4e4e7" },
      { n: 12, text: "```", color: "#6b7280" },
      { n: 13, text: "", color: "" },
      { n: 14, text: "## AuthService", color: "#34d399" },
      { n: 15, text: "", color: "" },
      { n: 16, text: "Service class for authentication.", color: "#a1a1aa" },
      { n: 17, text: "", color: "" },
      { n: 18, text: "<!-- TODO: document .login() and .logout() -->", color: "#f87171", highlight: true },
    ],
  },
  "pyproject.toml": {
    language: "toml",
    lines: [
      { n: 1,  text: "[build-system]", color: "#60a5fa" },
      { n: 2,  text: 'requires = ["setuptools>=61.0"]', color: "#a1a1aa" },
      { n: 3,  text: 'build-backend = "setuptools.backends.legacy:build"', color: "#a1a1aa" },
      { n: 4,  text: "", color: "" },
      { n: 5,  text: "[project]", color: "#60a5fa" },
      { n: 6,  text: 'name = "docdrift"', color: "#4ade80" },
      { n: 7,  text: 'version = "2.0.0"', color: "#4ade80" },
      { n: 8,  text: 'description = "AI-powered doc drift detector"', color: "#fbbf24" },
      { n: 9,  text: 'requires-python = ">=3.9"', color: "#a1a1aa" },
      { n: 10, text: "", color: "" },
      { n: 11, text: "[project.scripts]", color: "#60a5fa" },
      { n: 12, text: 'docdrift = "docdrift.cli:main"', color: "#e4e4e7" },
      { n: 13, text: 'docdrift-install-hook = "docdrift.hooks:install"', color: "#e4e4e7" },
    ],
  },
  "requirements.txt": {
    language: "text",
    lines: [
      { n: 1,  text: "# core dependencies", color: "#52525b" },
      { n: 2,  text: "tree-sitter>=0.20.0", color: "#4ade80" },
      { n: 3,  text: "tree-sitter-python>=0.20.0", color: "#4ade80" },
      { n: 4,  text: "tree-sitter-javascript>=0.20.0", color: "#4ade80" },
      { n: 5,  text: "", color: "" },
      { n: 6,  text: "# vector store", color: "#52525b" },
      { n: 7,  text: "chromadb>=0.4.0", color: "#a78bfa" },
      { n: 8,  text: "sentence-transformers>=2.2.0", color: "#a78bfa" },
      { n: 9,  text: "", color: "" },
      { n: 10, text: "# LLM providers", color: "#52525b" },
      { n: 11, text: "groq>=0.4.0", color: "#60a5fa" },
      { n: 12, text: "requests>=2.28.0", color: "#60a5fa" },
      { n: 13, text: "", color: "" },
      { n: 14, text: "# cli", color: "#52525b" },
      { n: 15, text: "click>=8.1.0", color: "#fbbf24" },
      { n: 16, text: "rich>=13.0.0", color: "#fbbf24" },
    ],
  },
  "action.yml": {
    language: "yaml",
    lines: [
      { n: 1,  text: "name: DocDrift", color: "#60a5fa" },
      { n: 2,  text: "description: AI doc drift detector for PRs", color: "#a1a1aa" },
      { n: 3,  text: "", color: "" },
      { n: 4,  text: "inputs:", color: "#34d399" },
      { n: 5,  text: "  groq_api_key:", color: "#e4e4e7" },
      { n: 6,  text: "    description: Groq API key", color: "#6b7280" },
      { n: 7,  text: "    required: false", color: "#a1a1aa" },
      { n: 8,  text: "", color: "" },
      { n: 9,  text: "runs:", color: "#34d399" },
      { n: 10, text: "  using: composite", color: "#a1a1aa" },
      { n: 11, text: "  steps:", color: "#e4e4e7" },
      { n: 12, text: "    - name: Set up Python", color: "#fbbf24" },
      { n: 13, text: "      uses: actions/setup-python@v4", color: "#a1a1aa" },
      { n: 14, text: "    - name: Install docdrift", color: "#fbbf24" },
      { n: 15, text: "      run: pip install docdrift", color: "#4ade80" },
      { n: 16, text: "    - name: Run check", color: "#fbbf24" },
      { n: 17, text: "      run: docdrift check", color: "#4ade80" },
    ],
  },
  ".pre-commit-config.yaml": {
    language: "yaml",
    lines: [
      { n: 1,  text: "repos:", color: "#60a5fa" },
      { n: 2,  text: "  - repo: local", color: "#a1a1aa" },
      { n: 3,  text: "    hooks:", color: "#34d399" },
      { n: 4,  text: "      - id: docdrift", color: "#e4e4e7" },
      { n: 5,  text: "        name: DocDrift doc check", color: "#fbbf24" },
      { n: 6,  text: "        entry: docdrift check", color: "#4ade80" },
      { n: 7,  text: "        language: system", color: "#a1a1aa" },
      { n: 8,  text: "        pass_filenames: false", color: "#a1a1aa" },
      { n: 9,  text: "        stages: [commit]", color: "#a78bfa" },
    ],
  },
};

const fileIcons: Record<string, string> = {
  "auth.py": "🐍",
  "README.md": "📄",
  "pyproject.toml": "⚙️",
  "requirements.txt": "📦",
  "action.yml": "🔧",
  ".pre-commit-config.yaml": "🪝",
};

// ─── HOOKS ────────────────────────────────────────────────────────────────────
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

// ─── BEFORE / AFTER SLIDER ────────────────────────────────────────────────────
// Key fix: each panel is absolute-positioned with its own width (not clipPath),
// so content always stays full-width and readable — divider slides over it.
function DocLineRender({ item }: { item: (typeof docBefore)[0] }) {
  if (item.type === "blank") return <div style={{ height: "10px" }} />;
  if (item.type === "heading") return (
    <div style={{ color: "#60a5fa", fontWeight: 700, fontSize: "12.5px", marginTop: "2px" }}>{item.text}</div>
  );
  if (item.type === "returns") return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "7px", flexWrap: "wrap" }}>
      <span style={{ fontSize: "9px", background: (item as any).bad ? "#f871711a" : "#4ade801a", border: `1px solid ${(item as any).bad ? "#f8717140" : "#4ade8040"}`, padding: "2px 6px", borderRadius: "3px", color: (item as any).bad ? "#f87171" : "#4ade80", fontFamily: "monospace", flexShrink: 0, marginTop: "2px" }}>
        {(item as any).bad ? "STALE" : "FIXED"}
      </span>
      <span style={{ color: (item as any).bad ? "#f87171" : "#4ade80", fontSize: "11.5px", lineHeight: 1.5 }}>{item.text}</span>
    </div>
  );
  if (item.type === "note") return (
    <div style={{ color: "#a78bfa", fontSize: "11.5px", fontStyle: "italic", marginTop: "3px" }}>💡 {item.text}</div>
  );
  if (item.type === "missing") return (
    <div style={{ color: "#f87171", fontSize: "11px", opacity: 0.65, fontStyle: "italic", fontFamily: "monospace" }}>{item.text}</div>
  );
  if (item.type === "added") return (
    <div style={{ color: "#4ade80", fontSize: "12px", fontWeight: 600, borderLeft: "2px solid #4ade8060", paddingLeft: "8px" }}>{item.text}</div>
  );
  if (item.type === "added_text") return (
    <div style={{ color: "#a1a1aa", fontSize: "11px", paddingLeft: "8px", lineHeight: 1.5 }}>{item.text}</div>
  );
  if (item.type === "example") return (
    <div style={{ background: "#0a0a0f", border: "1px solid #27272a", borderRadius: "5px", padding: "8px 10px", fontSize: "10.5px", color: "#a1a1aa", whiteSpace: "pre", fontFamily: "monospace" }}>{item.text}</div>
  );
  return <div style={{ color: "#a1a1aa", fontSize: "11.5px", lineHeight: 1.6 }}>{item.text}</div>;
}

function BeforeAfterSlider() {
  const [pct, setPct] = useState(50);
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const PANEL_H = 440;

  const updatePct = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setPct(Math.min(Math.max(((clientX - rect.left) / rect.width) * 100, 2), 98));
  }, []);

  useEffect(() => {
    const mm = (e: MouseEvent) => { if (dragging) updatePct(e.clientX); };
    const mu = () => setDragging(false);
    const tm = (e: TouchEvent) => { if (dragging) updatePct(e.touches[0].clientX); };
    window.addEventListener("mousemove", mm);
    window.addEventListener("mouseup", mu);
    window.addEventListener("touchmove", tm, { passive: true });
    window.addEventListener("touchend", mu);
    return () => {
      window.removeEventListener("mousemove", mm);
      window.removeEventListener("mouseup", mu);
      window.removeEventListener("touchmove", tm);
      window.removeEventListener("touchend", mu);
    };
  }, [dragging, updatePct]);

  return (
    <div>
      <p style={{ textAlign: "center", fontSize: "11px", letterSpacing: "0.12em", color: "#3f3f46", textTransform: "uppercase", marginBottom: "16px", fontFamily: "monospace" }}>
        — drag to compare —
      </p>

      <div ref={containerRef}
        style={{ position: "relative", height: `${PANEL_H}px`, borderRadius: "12px", overflow: "hidden", border: "1px solid #27272a", cursor: dragging ? "grabbing" : "col-resize", userSelect: "none", fontFamily: "'JetBrains Mono','Fira Code',monospace" }}>

        {/* ── BEFORE panel: full width, z-index below, clips right edge at pct% ── */}
        {/* We render full-width content but mask with overflow:hidden on a wrapper that is pct% wide */}
        <div style={{ position: "absolute", inset: 0, background: "#09090b" }}>
          {/* Header always visible over full row, but visually it gets covered by AFTER header */}
          <div style={{ background: "#1a0a0a", padding: "10px 16px", borderBottom: "1px solid #3a1515", display: "flex", alignItems: "center", gap: "8px", height: "41px", boxSizing: "border-box" }}>
            <span style={{ fontSize: "10px", background: "#f871711a", color: "#f87171", border: "1px solid #f8717130", padding: "2px 8px", borderRadius: "4px", letterSpacing: "0.06em", fontFamily: "monospace", whiteSpace: "nowrap" }}>BEFORE</span>
            <span style={{ fontSize: "11px", color: "#52525b", fontFamily: "monospace", whiteSpace: "nowrap" }}>README.md</span>
            <span style={{ marginLeft: "auto", fontSize: "10px", color: "#f87171", fontFamily: "monospace", whiteSpace: "nowrap" }}>1 error · 2 missing</span>
          </div>
          <div style={{ padding: "18px 20px", overflowY: "auto", height: `${PANEL_H - 41}px` }}>
            {docBefore.map((item, i) => <div key={i} style={{ marginBottom: "3px" }}><DocLineRender item={item} /></div>)}
          </div>
        </div>

        {/* ── AFTER panel: positioned at pct% left, width fills the rest, z-index above ── */}
        {/* Content is also full-width but starts rendering from left:0 within its own space */}
        <div style={{ position: "absolute", top: 0, bottom: 0, left: `${pct}%`, right: 0, background: "#09090b", zIndex: 2, overflow: "hidden" }}>
          {/* This inner div has full panel width and starts at left edge of the after panel */}
          <div style={{ position: "absolute", top: 0, bottom: 0, right: 0, width: `${(100 / (100 - pct)) * 100}%`, right: "auto", left: 0, minWidth: "100%" }}>
            <div style={{ background: "#0a1a10", padding: "10px 16px", borderBottom: "1px solid #154a28", display: "flex", alignItems: "center", gap: "8px", height: "41px", boxSizing: "border-box" }}>
              <span style={{ fontSize: "10px", background: "#4ade801a", color: "#4ade80", border: "1px solid #4ade8030", padding: "2px 8px", borderRadius: "4px", letterSpacing: "0.06em", fontFamily: "monospace", whiteSpace: "nowrap" }}>AFTER</span>
              <span style={{ fontSize: "11px", color: "#52525b", fontFamily: "monospace", whiteSpace: "nowrap" }}>README.md</span>
              <span style={{ marginLeft: "auto", fontSize: "10px", color: "#4ade80", fontFamily: "monospace", whiteSpace: "nowrap" }}>✓ synced</span>
            </div>
            <div style={{ padding: "18px 20px", overflowY: "auto", height: `${PANEL_H - 41}px` }}>
              {docAfter.map((item, i) => <div key={i} style={{ marginBottom: "3px" }}><DocLineRender item={item} /></div>)}
            </div>
          </div>
        </div>

        {/* ── Divider glow line ── */}
        <div style={{
          position: "absolute", top: 0, bottom: 0, left: `${pct}%`, width: "2px",
          transform: "translateX(-50%)",
          background: "linear-gradient(180deg, transparent 0%, #4ade80 15%, #4ade80 85%, transparent 100%)",
          pointerEvents: "none", zIndex: 15,
        }} />

        {/* ── Drag handle ── */}
        <div
          onMouseDown={e => { e.preventDefault(); setDragging(true); }}
          onTouchStart={() => setDragging(true)}
          style={{
            position: "absolute", top: "50%", left: `${pct}%`,
            transform: "translate(-50%, -50%)",
            width: "38px", height: "38px", borderRadius: "50%",
            background: "#09090b", border: "2px solid #4ade80",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: dragging ? "grabbing" : "col-resize", zIndex: 20,
            boxShadow: dragging ? "0 0 28px #4ade8060" : "0 0 14px #4ade8030",
            transition: "box-shadow 0.2s",
          }}>
          <GripVertical size={14} style={{ color: "#4ade80" }} />
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px", padding: "0 4px" }}>
        <span style={{ fontSize: "10px", color: "#f87171", fontFamily: "monospace", letterSpacing: "0.05em", opacity: 0.7 }}>← stale / broken docs</span>
        <span style={{ fontSize: "10px", color: "#4ade80", fontFamily: "monospace", letterSpacing: "0.05em", opacity: 0.7 }}>ai-fixed & complete →</span>
      </div>
    </div>
  );
}

// ─── VS CODE SIMULATION ───────────────────────────────────────────────────────
function VSCodeSim() {
  const ref = useRef<HTMLDivElement>(null);
  const terminalScrollRef = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);
  const [simKey, setSimKey] = useState(0);
  const [activeFile, setActiveFile] = useState("auth.py");
  const [openTabs, setOpenTabs] = useState<string[]>(["auth.py"]);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [explorerExpanded, setExplorerExpanded] = useState(true);
  const visible = useTypewriter(started && terminalOpen);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setStarted(true);
        setTimeout(() => setTerminalOpen(true), 1400);
      }
    }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (terminalScrollRef.current) {
      terminalScrollRef.current.scrollTop = terminalScrollRef.current.scrollHeight;
    }
  }, [visible.length]);

  const replay = () => {
    setSimKey(k => k + 1);
    setTerminalOpen(false);
    setStarted(false);
    setActiveFile("auth.py");
    setOpenTabs(["auth.py"]);
    setTimeout(() => {
      setStarted(true);
      setTimeout(() => setTerminalOpen(true), 1400);
    }, 150);
  };

  const openFile = (name: string) => {
    if (!fileContents[name]) return;
    setActiveFile(name);
    setOpenTabs(prev => prev.includes(name) ? prev : [...prev, name]);
  };

  const closeTab = (e: React.MouseEvent, name: string) => {
    e.stopPropagation();
    const next = openTabs.filter(t => t !== name);
    setOpenTabs(next);
    if (activeFile === name) setActiveFile(next[next.length - 1] ?? "");
  };

  const currentContent = activeFile ? fileContents[activeFile] : null;
  const folders = [".github/workflows", ".docwatcher", "tests"];

  return (
    <div ref={ref} key={simKey} style={{ fontFamily: "'JetBrains Mono','Fira Code',monospace", background: "#0d0d10", border: "1px solid #27272a", borderRadius: "12px", overflow: "hidden", boxShadow: "0 32px 80px #00000090" }}>

      {/* Title bar */}
      <div style={{ background: "#1a1a1f", padding: "8px 16px", display: "flex", alignItems: "center", gap: "6px", borderBottom: "1px solid #27272a" }}>
        <div style={{ width: "11px", height: "11px", borderRadius: "50%", background: "#ff5f57" }} />
        <div style={{ width: "11px", height: "11px", borderRadius: "50%", background: "#febc2e" }} />
        <div style={{ width: "11px", height: "11px", borderRadius: "50%", background: "#28c840" }} />
        <span style={{ marginLeft: "12px", fontSize: "11px", color: "#52525b", letterSpacing: "0.04em", flex: 1, textAlign: "center" }}>
          docwatcher — Visual Studio Code
        </span>
        <button onClick={replay} type="button" style={{ fontSize: "10px", color: "#52525b", background: "none", border: "1px solid #27272a", padding: "2px 8px", borderRadius: "4px", cursor: "pointer", letterSpacing: "0.05em" }}>
          replay ↺
        </button>
      </div>

      {/* Layout: activity bar + sidebar + editor */}
      <div style={{ display: "flex", height: "530px" }}>

        {/* Activity bar */}
        <div style={{ width: "44px", background: "#141418", borderRight: "1px solid #1f1f24", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "12px", gap: "20px", flexShrink: 0 }}>
          {[
            { icon: "📋", label: "Explorer", active: true },
            { icon: "🔍", label: "Search", active: false },
            { icon: "⎇",  label: "Git",    active: false },
            { icon: "🐛", label: "Debug",  active: false },
            { icon: "🧩", label: "Ext",    active: false },
          ].map(item => (
            <div key={item.label} title={item.label} style={{ fontSize: "14px", opacity: item.active ? 1 : 0.3, cursor: "pointer", width: "100%", display: "flex", justifyContent: "center", padding: "4px 0", borderLeft: item.active ? "2px solid #4ade80" : "2px solid transparent" }}>
              {item.icon}
            </div>
          ))}
        </div>

        {/* Explorer sidebar */}
        <div style={{ width: "190px", background: "#141418", borderRight: "1px solid #1f1f24", display: "flex", flexDirection: "column", flexShrink: 0, overflow: "hidden" }}>
          <div style={{ padding: "8px 12px 4px", borderBottom: "1px solid #1f1f24", flexShrink: 0 }}>
            <span style={{ fontSize: "9px", color: "#52525b", letterSpacing: "0.12em", textTransform: "uppercase" }}>Explorer</span>
          </div>

          <div style={{ flex: 1, overflowY: "auto", paddingTop: "4px" }}>
            {/* Root folder row */}
            <div
              onClick={() => setExplorerExpanded(x => !x)}
              style={{ display: "flex", alignItems: "center", gap: "4px", padding: "3px 8px", cursor: "pointer", userSelect: "none" }}>
              <span style={{ fontSize: "9px", color: "#52525b", width: "10px" }}>{explorerExpanded ? "▾" : "▸"}</span>
              <span style={{ fontSize: "10px", color: "#52525b", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 700 }}>DOCWATCHER</span>
            </div>

            <AnimatePresence>
              {explorerExpanded && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.18 }}>
                  {/* Clickable files */}
                  {Object.keys(fileContents).map(fname => (
                    <div key={fname} onClick={() => openFile(fname)}
                      style={{
                        padding: "3px 8px 3px 22px", fontSize: "11.5px", cursor: "pointer",
                        color: activeFile === fname ? "#e4e4e7" : "#71717a",
                        background: activeFile === fname ? "#27272a" : "transparent",
                        display: "flex", alignItems: "center", gap: "6px",
                        borderLeft: activeFile === fname ? "1px solid #4ade8050" : "1px solid transparent",
                        transition: "background 0.1s, color 0.1s",
                      }}
                      onMouseEnter={e => { if (activeFile !== fname) { (e.currentTarget as HTMLDivElement).style.background = "#1f1f24"; (e.currentTarget as HTMLDivElement).style.color = "#a1a1aa"; } }}
                      onMouseLeave={e => { if (activeFile !== fname) { (e.currentTarget as HTMLDivElement).style.background = "transparent"; (e.currentTarget as HTMLDivElement).style.color = "#71717a"; } }}>
                      <span style={{ fontSize: "11px" }}>{fileIcons[fname] ?? "📄"}</span>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{fname}</span>
                    </div>
                  ))}
                  {/* Non-clickable folders */}
                  {folders.map(d => (
                    <div key={d} style={{ padding: "3px 8px 3px 22px", fontSize: "11.5px", color: "#3f3f46", display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: "9px" }}>▸</span>
                      <span style={{ fontSize: "11px" }}>📁</span>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d}</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Editor column */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>

          {/* Tab bar */}
          <div style={{ background: "#141418", borderBottom: "1px solid #1f1f24", display: "flex", alignItems: "stretch", overflowX: "auto", flexShrink: 0, scrollbarWidth: "none" }}>
            {openTabs.map(tab => {
              const isActive = tab === activeFile;
              const isDirty = tab === "README.md";
              return (
                <div key={tab} onClick={() => setActiveFile(tab)}
                  style={{
                    padding: "6px 12px", fontSize: "11.5px", cursor: "pointer", flexShrink: 0,
                    color: isActive ? "#e4e4e7" : "#52525b",
                    background: isActive ? "#0d0d10" : "transparent",
                    borderRight: "1px solid #1f1f24",
                    borderTop: isActive ? "1px solid #4ade8060" : "1px solid transparent",
                    display: "flex", alignItems: "center", gap: "5px",
                  }}>
                  <span style={{ fontSize: "10px" }}>{fileIcons[tab] ?? "📄"}</span>
                  {tab}
                  {isDirty && <span style={{ fontSize: "8px", color: "#f87171" }}>●</span>}
                  <span
                    onClick={e => closeTab(e, tab)}
                    style={{ fontSize: "11px", color: "#3f3f46", marginLeft: "2px", lineHeight: 1, cursor: "pointer" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#e4e4e7")}
                    onMouseLeave={e => (e.currentTarget.style.color = "#3f3f46")}>
                    ×
                  </span>
                </div>
              );
            })}
          </div>

          {/* Code editor */}
          <div style={{ flex: 1, overflowY: "auto", background: "#0d0d10", padding: "10px 0", minHeight: 0 }}>
            {currentContent ? (
              currentContent.lines.map(line => (
                <div key={line.n} style={{
                  display: "flex", alignItems: "flex-start",
                  background: line.highlight ? "#f871710a" : "transparent",
                  borderLeft: line.highlight ? "2px solid #f8717150" : "2px solid transparent",
                  padding: "0 12px",
                }}>
                  <span style={{ color: "#3f3f46", fontSize: "11px", minWidth: "28px", textAlign: "right", marginRight: "14px", lineHeight: "1.85", userSelect: "none", flexShrink: 0 }}>{line.n}</span>
                  <span style={{ color: line.color || "#52525b", fontSize: "12px", lineHeight: "1.85", whiteSpace: "pre", overflow: "hidden" }}>{line.text || " "}</span>
                </div>
              ))
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#3f3f46", fontSize: "13px" }}>
                select a file
              </div>
            )}
          </div>

          {/* Terminal panel */}
          <div style={{
            height: terminalOpen ? "195px" : "32px",
            transition: "height 0.45s cubic-bezier(0.4,0,0.2,1)",
            borderTop: "1px solid #27272a", background: "#09090b",
            display: "flex", flexDirection: "column", flexShrink: 0, overflow: "hidden",
          }}>
            {/* Terminal tabs */}
            <div style={{ background: "#141418", borderBottom: "1px solid #1f1f24", display: "flex", alignItems: "center", gap: "12px", padding: "0 14px", height: "32px", flexShrink: 0 }}>
              {["TERMINAL", "PROBLEMS", "OUTPUT"].map((t, i) => (
                <span key={t} style={{ fontSize: "10px", color: i === 0 && terminalOpen ? "#4ade80" : "#3f3f46", letterSpacing: "0.05em", cursor: "pointer", borderBottom: i === 0 && terminalOpen ? "1px solid #4ade80" : "none", paddingBottom: "2px" }}>
                  {t}
                </span>
              ))}
              {terminalOpen && <span style={{ marginLeft: "auto", fontSize: "9px", color: "#4ade8060" }}>bash</span>}
            </div>
            {/* Output */}
            <div ref={terminalScrollRef} style={{ flex: 1, overflowY: "auto", padding: "10px 16px", lineHeight: "1.85", fontSize: "12px" }}>
              {terminalLines.map((line, i) =>
                visible.includes(i) ? (
                  <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.12 }}
                    style={{ color: line.color || "transparent", minHeight: "1em", whiteSpace: "pre" }}>
                    {line.text || " "}
                  </motion.div>
                ) : null
              )}
              {terminalOpen && started && visible.length < terminalLines.length && (
                <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ repeat: Infinity, duration: 0.9 }}
                  style={{ color: "#4ade80" }}>█</motion.span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div style={{ background: "#0f1f15", borderTop: "1px solid #27272a", padding: "3px 16px", display: "flex", alignItems: "center", gap: "16px" }}>
        <span style={{ fontSize: "10px", color: "#4ade80" }}>⎇ main</span>
        <span style={{ fontSize: "10px", color: "#52525b" }}>{currentContent?.language ?? "text"}</span>
        <span style={{ fontSize: "10px", color: "#52525b" }}>{activeFile}</span>
        <span style={{ fontSize: "10px", color: visible.length > 14 ? "#4ade80" : "#f87171", marginLeft: "auto", transition: "color 0.4s" }}>
          {visible.length > 14 ? "✓ DocDrift: docs synced" : "⚠ DocDrift: 1 error found"}
        </span>
      </div>
    </div>
  );
}

// ─── COPY BUTTON ──────────────────────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button type="button" onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      style={{ background: "none", border: "none", cursor: "pointer", color: copied ? "#4ade80" : "#52525b", display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", letterSpacing: "0.05em", transition: "color 0.2s" }}>
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? "copied" : "copy"}
    </button>
  );
}

// ─── WAITLIST FORM ────────────────────────────────────────────────────────────
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
    } catch { setSubmitted(true); }
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

// ─── GITHUB STARS ─────────────────────────────────────────────────────────────
function GitHubStars() {
  const [stars, setStars] = useState<number | null>(null);
  useEffect(() => {
    fetch("https://api.github.com/repos/ayush698800/docwatcher")
      .then(r => r.json()).then(d => setStars(d.stargazers_count)).catch(() => { });
  }, []);
  if (stars === null) return null;
  return (
    <a href="https://github.com/ayush698800/docwatcher" target="_blank"
      style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", color: "#71717a", textDecoration: "none", border: "1px solid #27272a", padding: "4px 10px", borderRadius: "6px", background: "#18181b" }}>
      <Star size={11} style={{ color: "#eab308" }} fill="#eab308" />
      {stars}
    </a>
  );
}

// ─── DATA ─────────────────────────────────────────────────────────────────────
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

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <main style={{ background: "#09090b", color: "#e4e4e7", minHeight: "100vh", fontFamily: "'DM Sans', 'Inter', sans-serif", overflowX: "hidden" }}>

      <div style={{ position: "fixed", inset: 0, backgroundImage: "linear-gradient(#18181b 1px, transparent 1px), linear-gradient(90deg, #18181b 1px, transparent 1px)", backgroundSize: "40px 40px", opacity: 0.4, pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", top: "-200px", left: "50%", transform: "translateX(-50%)", width: "700px", height: "700px", background: "radial-gradient(circle, #4ade8010 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      {/* NAV */}
      <nav style={{ position: "fixed", top: 0, width: "100%", zIndex: 50, borderBottom: "1px solid #18181b", backdropFilter: "blur(16px)", background: "rgba(9,9,11,0.85)" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px", height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontWeight: 800, fontSize: "17px", letterSpacing: "-0.02em" }}>DocDrift</span>
            <span style={{ fontSize: "10px", color: "#4ade80", border: "1px solid #4ade8030", background: "#4ade8008", padding: "2px 7px", borderRadius: "4px", letterSpacing: "0.08em", fontFamily: "monospace" }}>v2.0.0</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <GitHubStars />
            <a href="https://github.com/ayush698800/docwatcher" target="_blank" style={{ color: "#71717a", textDecoration: "none", fontSize: "13px", display: "flex", alignItems: "center", gap: "5px" }}>
              <Github size={14} /> GitHub
            </a>
            <a href="https://pypi.org/project/docdrift/" target="_blank" style={{ background: "#4ade80", color: "#09090b", padding: "6px 14px", borderRadius: "7px", textDecoration: "none", fontSize: "12px", fontWeight: 700, letterSpacing: "0.02em" }}>
              pip install
            </a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ position: "relative", zIndex: 1, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "100px 24px 60px", textAlign: "center" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ marginBottom: "28px" }}>
          <span style={{ fontSize: "11px", letterSpacing: "0.15em", color: "#52525b", textTransform: "uppercase", border: "1px solid #27272a", padding: "5px 14px", borderRadius: "4px", fontFamily: "monospace" }}>
            now available on pypi
          </span>
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
          style={{ fontSize: "clamp(2.8rem, 7vw, 5.5rem)", fontWeight: 900, lineHeight: 1.05, letterSpacing: "-0.03em", marginBottom: "20px", maxWidth: "800px" }}>
          your docs are lying.
          <br /><span style={{ color: "#4ade80" }}>docdrift fixes them.</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
          style={{ fontSize: "clamp(1rem, 2vw, 1.15rem)", color: "#71717a", maxWidth: "520px", lineHeight: 1.7, marginBottom: "40px" }}>
          watches your git commits, finds documentation that is now wrong, and fixes it automatically using AI — before you merge.
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

      {/* BEFORE / AFTER SLIDER */}
      <section style={{ position: "relative", zIndex: 1, padding: "0 24px 80px", maxWidth: "900px", margin: "0 auto" }}>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <p style={{ fontSize: "11px", letterSpacing: "0.15em", color: "#52525b", textTransform: "uppercase", fontFamily: "monospace", marginBottom: "8px" }}>before → after</p>
          <h2 style={{ fontSize: "clamp(1.4rem, 2.5vw, 1.9rem)", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "28px" }}>see exactly what changes</h2>
          <BeforeAfterSlider />
        </motion.div>
      </section>

      {/* VS CODE SIM */}
      <section style={{ position: "relative", zIndex: 1, padding: "0 24px 80px", maxWidth: "980px", margin: "0 auto" }}>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <p style={{ textAlign: "center", fontSize: "11px", letterSpacing: "0.12em", color: "#3f3f46", textTransform: "uppercase", marginBottom: "20px", fontFamily: "monospace" }}>
            — watch it work —
          </p>
          <VSCodeSim />
        </motion.div>
      </section>

      {/* STATS */}
      <section style={{ position: "relative", zIndex: 1, borderTop: "1px solid #18181b", borderBottom: "1px solid #18181b", padding: "40px 24px", background: "#0a0a0f" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "2rem", textAlign: "center" }}>
          {[{ v: "v2.0.0", l: "stable release" }, { v: "free", l: "forever open source" }, { v: "3", l: "AI providers" }, { v: "2", l: "languages supported" }].map(s => (
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
              <CopyButton text={`name: DocDrift\non:\n  pull_request:\n    branches: [main, master]\n  workflow_dispatch:\n\njobs:\n  check-docs:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v3\n        with:\n          fetch-depth: 2\n      - name: DocDrift\n        uses: ayush698800/docwatcher@v2.0.0\n        with:\n          groq_api_key: \${{ secrets.GROQ_API_KEY }}`} />
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

      {/* CTA */}
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