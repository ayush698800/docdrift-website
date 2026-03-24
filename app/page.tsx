"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  Copy,
  Github,
  GitPullRequest,
  Lock,
  ShieldCheck,
  Sparkles,
  Terminal,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";

const installCommand = "pip install docdrift";

const proofPoints = [
  "Runs before commit and in PRs",
  "Works with local or cloud AI",
  "Repo-native and open source",
];

const idealFor = [
  {
    title: "API teams",
    text: "Catch outdated README examples, return values, and exceptions before customers copy the wrong flow.",
  },
  {
    title: "Open-source maintainers",
    text: "Keep installation steps, examples, and feature docs aligned with the code people actually pull.",
  },
  {
    title: "Small engineering teams",
    text: "Add one guardrail to your workflow instead of asking every engineer to remember docs manually.",
  },
];

const outcomes = [
  {
    title: "Catches docs drift where it happens",
    text: "DocDrift looks at staged code changes, maps them to related docs, and flags when the docs are now wrong.",
  },
  {
    title: "Fits the workflow developers already use",
    text: "Run it in the CLI before commit, or in GitHub Actions so every PR gets the same check automatically.",
  },
  {
    title: "Specialized beats generic",
    text: "General AI agents can update docs when you ask. DocDrift is valuable because it remembers to ask every time.",
  },
];

const comparisonRows = [
  {
    label: "Change-aware",
    docdrift: "Reads the staged diff and checks only what changed",
    agent: "Usually needs a prompt and human context",
  },
  {
    label: "Workflow-native",
    docdrift: "Works in commits and PR checks",
    agent: "Usually lives in chat or the editor",
  },
  {
    label: "Docs-specific",
    docdrift: "Focused on stale docs, examples, params, returns, and missing docs",
    agent: "Broad, but less opinionated and less repeatable",
  },
  {
    label: "Team consistency",
    docdrift: "Runs the same way every time",
    agent: "Quality depends on the person asking",
  },
];

const terminalLines = [
  "$ git add .",
  "$ docdrift commit",
  "",
  "Scanning staged changes...",
  "  validate_token -> README.md:42",
  "  AuthService.login -> README.md:58",
  "",
  "Checking documentation accuracy...",
  "  ERROR validate_token",
  "    docs still say it returns bool",
  "    code now raises InvalidTokenError on failure",
  "",
  "Fix this? [y/n] > y",
  "Generating fix...",
  "README.md updated",
  "",
  "Commit now? [y/n] > y",
  "Committed",
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.4rem",
        border: "none",
        background: "transparent",
        color: copied ? "#0f9f4f" : "#64748b",
        cursor: "pointer",
        fontSize: "0.8rem",
        fontWeight: 600,
      }}
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function GitHubStars() {
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    fetch("https://api.github.com/repos/ayush698800/docwatcher")
      .then((response) => response.json())
      .then((data) => {
        if (typeof data?.stargazers_count === "number") {
          setStars(data.stargazers_count);
        }
      })
      .catch(() => undefined);
  }, []);

  if (stars === null) {
    return null;
  }

  return (
    <a
      href="https://github.com/ayush698800/docwatcher"
      target="_blank"
      rel="noreferrer"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.45rem",
        border: "1px solid rgba(148, 163, 184, 0.16)",
        padding: "0.5rem 0.8rem",
        borderRadius: "999px",
        textDecoration: "none",
        color: "#cbd5e1",
        background: "rgba(15, 23, 42, 0.55)",
        fontSize: "0.85rem",
      }}
    >
      <Github size={14} />
      {stars} stars
    </a>
  );
}

function TerminalDemo() {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    const timers = terminalLines.map((_, index) =>
      setTimeout(() => setVisibleCount(index + 1), index * 330)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div
      style={{
        border: "1px solid rgba(148, 163, 184, 0.16)",
        borderRadius: "1.25rem",
        overflow: "hidden",
        background: "#08111f",
        boxShadow: "0 30px 80px rgba(2, 8, 23, 0.55)",
      }}
    >
      <div
        style={{
          padding: "0.9rem 1rem",
          borderBottom: "1px solid rgba(148, 163, 184, 0.1)",
          background: "rgba(15, 23, 42, 0.78)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", gap: "0.45rem" }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#fb7185", display: "block" }} />
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#fbbf24", display: "block" }} />
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#4ade80", display: "block" }} />
        </div>
        <span style={{ color: "#94a3b8", fontSize: "0.78rem", fontFamily: "monospace" }}>
          docdrift commit
        </span>
      </div>
      <div
        style={{
          padding: "1.25rem 1.1rem 1.35rem",
          fontFamily: "'IBM Plex Mono', 'JetBrains Mono', monospace",
          fontSize: "0.88rem",
          lineHeight: 1.9,
          minHeight: "22rem",
          color: "#e2e8f0",
        }}
      >
        {terminalLines.slice(0, visibleCount).map((line, index) => (
          <motion.div
            key={`${line}-${index}`}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.12 }}
            style={{
              color: line.startsWith("  ERROR")
                ? "#f87171"
                : line.includes("updated") || line === "Committed"
                  ? "#4ade80"
                  : line.startsWith("Scanning") || line.startsWith("Checking") || line === "Generating fix..."
                    ? "#94a3b8"
                    : "#e2e8f0",
              whiteSpace: "pre-wrap",
            }}
          >
            {line || " "}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function WorkflowCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div
      style={{
        padding: "1.35rem",
        borderRadius: "1rem",
        border: "1px solid rgba(148, 163, 184, 0.14)",
        background: "rgba(15, 23, 42, 0.5)",
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          display: "grid",
          placeItems: "center",
          background: "rgba(34, 197, 94, 0.12)",
          color: "#4ade80",
          marginBottom: "1rem",
        }}
      >
        {icon}
      </div>
      <h3 style={{ fontSize: "1rem", marginBottom: "0.55rem", color: "#f8fafc" }}>{title}</h3>
      <p style={{ color: "#94a3b8", fontSize: "0.95rem", lineHeight: 1.7 }}>{text}</p>
    </div>
  );
}

export default function Home() {
  const workflowYaml = useMemo(
    () => `name: DocDrift
on:
  pull_request:
    branches: [main, master]

jobs:
  check-docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: ayush698800/docwatcher@v2.1.0
        with:
          groq_api_key: \${{ secrets.GROQ_API_KEY }}`,
    []
  );

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, rgba(34,197,94,0.12), transparent 32%), linear-gradient(180deg, #020617 0%, #08111f 42%, #020617 100%)",
        color: "#e2e8f0",
      }}
    >
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(148,163,184,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.06) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "linear-gradient(180deg, rgba(0,0,0,0.52), rgba(0,0,0,0.08))",
          pointerEvents: "none",
        }}
      />

      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          backdropFilter: "blur(20px)",
          background: "rgba(2, 6, 23, 0.72)",
          borderBottom: "1px solid rgba(148, 163, 184, 0.1)",
        }}
      >
        <div
          style={{
            maxWidth: 1180,
            margin: "0 auto",
            padding: "0.95rem 1.25rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 12,
                background: "linear-gradient(135deg, #22c55e, #16a34a)",
                display: "grid",
                placeItems: "center",
                color: "#04130a",
                fontWeight: 900,
              }}
            >
              D
            </div>
            <div>
              <div style={{ fontWeight: 800, color: "#f8fafc" }}>DocDrift</div>
              <div style={{ fontSize: "0.75rem", color: "#64748b" }}>v2.1.0</div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
            <GitHubStars />
            <a
              href="https://github.com/ayush698800/docwatcher"
              target="_blank"
              rel="noreferrer"
              style={{
                textDecoration: "none",
                color: "#cbd5e1",
                fontSize: "0.92rem",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.45rem",
              }}
            >
              <Github size={15} />
              GitHub
            </a>
            <a
              href="https://pypi.org/project/docdrift/"
              target="_blank"
              rel="noreferrer"
              style={{
                textDecoration: "none",
                background: "#22c55e",
                color: "#04130a",
                padding: "0.72rem 1rem",
                borderRadius: "999px",
                fontSize: "0.92rem",
                fontWeight: 800,
              }}
            >
              Install from PyPI
            </a>
          </div>
        </div>
      </nav>

      <section style={{ position: "relative", zIndex: 1, padding: "5.5rem 1.25rem 3rem" }}>
        <div
          style={{
            maxWidth: 1180,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "3rem",
            alignItems: "center",
          }}
        >
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.45rem 0.75rem",
                borderRadius: "999px",
                border: "1px solid rgba(74, 222, 128, 0.18)",
                background: "rgba(34, 197, 94, 0.08)",
                color: "#86efac",
                fontSize: "0.82rem",
                marginBottom: "1.2rem",
              }}
            >
              <ShieldCheck size={14} />
              Docs drift guardrail for commits and PRs
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              style={{
                fontSize: "clamp(2.8rem, 6vw, 5.2rem)",
                lineHeight: 1.02,
                letterSpacing: "-0.05em",
                color: "#f8fafc",
                marginBottom: "1.25rem",
              }}
            >
              Catch stale docs
              <br />
              before they hit main.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.12 }}
              style={{
                maxWidth: 620,
                fontSize: "1.08rem",
                lineHeight: 1.8,
                color: "#94a3b8",
                marginBottom: "1.75rem",
              }}
            >
              DocDrift checks changed code against your README, docs, and examples. It flags when the docs are now wrong, incomplete, or missing, then helps fix them before merge.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.18 }}
              style={{ display: "flex", gap: "0.9rem", flexWrap: "wrap", marginBottom: "1.4rem" }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.85rem",
                  padding: "0.9rem 1rem",
                  borderRadius: "1rem",
                  border: "1px solid rgba(148, 163, 184, 0.14)",
                  background: "rgba(15, 23, 42, 0.6)",
                  fontFamily: "'IBM Plex Mono', 'JetBrains Mono', monospace",
                }}
              >
                <span style={{ color: "#4ade80" }}>$</span>
                <span>{installCommand}</span>
                <CopyButton text={installCommand} />
              </div>

              <a
                href="https://github.com/ayush698800/docwatcher"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.55rem",
                  padding: "0.95rem 1.1rem",
                  borderRadius: "1rem",
                  border: "1px solid rgba(148, 163, 184, 0.14)",
                  background: "rgba(15, 23, 42, 0.45)",
                  color: "#e2e8f0",
                  textDecoration: "none",
                  fontWeight: 700,
                }}
              >
                See the repo
                <ArrowRight size={16} />
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}
            >
              {proofPoints.map((point) => (
                <div key={point} style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem", color: "#cbd5e1", fontSize: "0.9rem" }}>
                  <Check size={15} style={{ color: "#4ade80" }} />
                  {point}
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.14 }}
          >
            <TerminalDemo />
          </motion.div>
        </div>
      </section>

      <section style={{ position: "relative", zIndex: 1, padding: "2rem 1.25rem 4rem" }}>
        <div
          style={{
            maxWidth: 1180,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "1rem",
          }}
        >
          {outcomes.map((item) => (
            <WorkflowCard
              key={item.title}
              icon={<Sparkles size={18} />}
              title={item.title}
              text={item.text}
            />
          ))}
        </div>
      </section>

      <section style={{ position: "relative", zIndex: 1, padding: "0 1.25rem 4.25rem" }}>
        <div
          style={{
            maxWidth: 1180,
            margin: "0 auto",
            padding: "2rem",
            borderRadius: "1.5rem",
            border: "1px solid rgba(148, 163, 184, 0.12)",
            background: "linear-gradient(180deg, rgba(15,23,42,0.75), rgba(15,23,42,0.38))",
          }}
        >
          <div style={{ maxWidth: 760, marginBottom: "1.6rem" }}>
            <p style={{ color: "#4ade80", fontSize: "0.82rem", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "0.85rem" }}>
              Why this instead of an agent
            </p>
            <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)", lineHeight: 1.15, color: "#f8fafc", marginBottom: "0.85rem" }}>
              Agents can update docs.
              <br />
              DocDrift makes sure someone remembers to.
            </h2>
            <p style={{ color: "#94a3b8", lineHeight: 1.8 }}>
              The real value is not that an LLM can write a paragraph. The real value is that DocDrift checks the same thing every time a repo changes, in the same place your team already reviews code.
            </p>
          </div>

          <div
            style={{
              overflowX: "auto",
              borderRadius: "1rem",
              border: "1px solid rgba(148, 163, 184, 0.1)",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}>
              <thead style={{ background: "rgba(15, 23, 42, 0.88)" }}>
                <tr>
                  <th style={tableHeadStyle}>Category</th>
                  <th style={tableHeadStyle}>DocDrift</th>
                  <th style={tableHeadStyle}>General AI agent</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr key={row.label}>
                    <td style={tableCellStyleLabel}>{row.label}</td>
                    <td style={tableCellStyle}>{row.docdrift}</td>
                    <td style={tableCellStyle}>{row.agent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section style={{ position: "relative", zIndex: 1, padding: "0 1.25rem 4.5rem" }}>
        <div
          style={{
            maxWidth: 1180,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1rem",
          }}
        >
          {idealFor.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: index * 0.08 }}
              style={{
                borderRadius: "1rem",
                border: "1px solid rgba(148, 163, 184, 0.14)",
                padding: "1.4rem",
                background: "rgba(15, 23, 42, 0.48)",
              }}
            >
              <h3 style={{ color: "#f8fafc", marginBottom: "0.6rem" }}>{item.title}</h3>
              <p style={{ color: "#94a3b8", lineHeight: 1.75 }}>{item.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section style={{ position: "relative", zIndex: 1, padding: "0 1.25rem 4.75rem" }}>
        <div
          style={{
            maxWidth: 1180,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1.15fr 0.85fr",
            gap: "1rem",
          }}
        >
          <div
            style={{
              borderRadius: "1.5rem",
              border: "1px solid rgba(148, 163, 184, 0.12)",
              background: "rgba(15, 23, 42, 0.48)",
              padding: "1.6rem",
            }}
          >
            <p style={{ color: "#4ade80", fontSize: "0.82rem", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "0.8rem" }}>
              GitHub Actions
            </p>
            <h2 style={{ color: "#f8fafc", marginBottom: "0.75rem" }}>
              Same detection logic in the CLI and in PRs
            </h2>
            <p style={{ color: "#94a3b8", lineHeight: 1.75, marginBottom: "1.25rem" }}>
              Run DocDrift locally before commit, then enforce the same check on pull requests. The specialized engine stays consistent across both surfaces.
            </p>
            <div
              style={{
                borderRadius: "1rem",
                overflow: "hidden",
                border: "1px solid rgba(148, 163, 184, 0.14)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.8rem 1rem",
                  background: "rgba(2, 6, 23, 0.7)",
                  borderBottom: "1px solid rgba(148, 163, 184, 0.1)",
                }}
              >
                <span style={{ color: "#94a3b8", fontSize: "0.84rem", fontFamily: "monospace" }}>
                  .github/workflows/docdrift.yml
                </span>
                <CopyButton text={workflowYaml} />
              </div>
              <pre
                style={{
                  margin: 0,
                  padding: "1.15rem 1rem",
                  overflowX: "auto",
                  fontSize: "0.88rem",
                  lineHeight: 1.75,
                  color: "#dbeafe",
                  background: "#08111f",
                  fontFamily: "'IBM Plex Mono', 'JetBrains Mono', monospace",
                }}
              >
                {workflowYaml}
              </pre>
            </div>
          </div>

          <div
            style={{
              borderRadius: "1.5rem",
              border: "1px solid rgba(148, 163, 184, 0.12)",
              background: "rgba(15, 23, 42, 0.48)",
              padding: "1.6rem",
            }}
          >
            <p style={{ color: "#4ade80", fontSize: "0.82rem", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "0.8rem" }}>
              Pricing path
            </p>
            <h2 style={{ color: "#f8fafc", marginBottom: "0.75rem" }}>
              Start free. Charge for private team convenience.
            </h2>
            <p style={{ color: "#94a3b8", lineHeight: 1.75, marginBottom: "1.2rem" }}>
              The easiest path to paid usage is keeping the open-source CLI free, then charging teams for private-repo workflows and convenience layers.
            </p>

            <div style={{ display: "grid", gap: "0.9rem" }}>
              <div style={pricingCardStyle}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.6rem" }}>
                  <strong style={{ color: "#f8fafc" }}>Open source</strong>
                  <span style={pillStyle}>Free</span>
                </div>
                <p style={pricingTextStyle}>CLI, local AI, open-source repos, pre-commit hook, and basic GitHub Action use.</p>
              </div>

              <div style={pricingCardStyle}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.6rem" }}>
                  <strong style={{ color: "#f8fafc" }}>Private repo plan</strong>
                  <span style={pillStyle}>$12-$19 / repo</span>
                </div>
                <p style={pricingTextStyle}>Best path for first 100 paying users: private repos, smoother onboarding, higher fix volume, and team support.</p>
              </div>

              <div style={pricingCardStyle}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.6rem" }}>
                  <strong style={{ color: "#f8fafc" }}>Team plan later</strong>
                  <span style={pillStyle}>Org workflow</span>
                </div>
                <p style={pricingTextStyle}>Add policies, org-wide defaults, PR reporting, and simple admin controls once the core paid path is proven.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ position: "relative", zIndex: 1, padding: "0 1.25rem 5.5rem" }}>
        <div
          style={{
            maxWidth: 1180,
            margin: "0 auto",
            padding: "2rem",
            borderRadius: "1.6rem",
            background: "linear-gradient(135deg, rgba(34,197,94,0.12), rgba(15,23,42,0.75))",
            border: "1px solid rgba(74, 222, 128, 0.18)",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1.5rem",
            alignItems: "center",
          }}
        >
          <div>
            <p style={{ color: "#86efac", fontSize: "0.82rem", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "0.85rem" }}>
              Start here
            </p>
            <h2 style={{ color: "#f8fafc", fontSize: "clamp(1.8rem, 3vw, 2.6rem)", lineHeight: 1.12, marginBottom: "0.8rem" }}>
              Stop shipping stale docs.
            </h2>
            <p style={{ color: "#d7f9e5", maxWidth: 560, lineHeight: 1.8 }}>
              Install DocDrift, run it on one real repo, and use that proof to attract your first users. The product sells best when it prevents a mistake someone almost merged today.
            </p>
          </div>

          <div style={{ display: "grid", gap: "0.9rem", justifyItems: "start" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.85rem",
                padding: "0.95rem 1rem",
                borderRadius: "1rem",
                background: "rgba(2, 6, 23, 0.55)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                fontFamily: "'IBM Plex Mono', 'JetBrains Mono', monospace",
              }}
            >
              <span style={{ color: "#4ade80" }}>$</span>
              <span>{installCommand}</span>
              <CopyButton text={installCommand} />
            </div>

            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <a
                href="https://github.com/ayush698800/docwatcher"
                target="_blank"
                rel="noreferrer"
                style={primaryActionStyle}
              >
                <Github size={16} />
                View GitHub
              </a>
              <a
                href="https://pypi.org/project/docdrift/"
                target="_blank"
                rel="noreferrer"
                style={secondaryActionStyle}
              >
                <Terminal size={16} />
                Install package
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer
        style={{
          position: "relative",
          zIndex: 1,
          borderTop: "1px solid rgba(148, 163, 184, 0.08)",
          padding: "1.4rem 1.25rem 2rem",
        }}
      >
        <div
          style={{
            maxWidth: 1180,
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            gap: "1rem",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <div style={{ color: "#64748b", fontSize: "0.88rem" }}>
            Built for developers who want docs to stay trustworthy.
          </div>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            {[
              { label: "GitHub", href: "https://github.com/ayush698800/docwatcher", icon: <Github size={15} /> },
              { label: "PyPI", href: "https://pypi.org/project/docdrift/", icon: <Terminal size={15} /> },
              { label: "Action", href: "https://github.com/marketplace/actions/docdrift", icon: <GitPullRequest size={15} /> },
              { label: "Private mode", href: "https://github.com/ayush698800/docwatcher", icon: <Lock size={15} /> },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.45rem",
                  color: "#94a3b8",
                  textDecoration: "none",
                  fontSize: "0.9rem",
                }}
              >
                {item.icon}
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </main>
  );
}

const tableHeadStyle: CSSProperties = {
  textAlign: "left",
  padding: "1rem",
  color: "#cbd5e1",
  fontSize: "0.84rem",
  letterSpacing: "0.04em",
  borderBottom: "1px solid rgba(148, 163, 184, 0.1)",
};

const tableCellStyle: CSSProperties = {
  padding: "1rem",
  color: "#94a3b8",
  fontSize: "0.93rem",
  lineHeight: 1.75,
  borderBottom: "1px solid rgba(148, 163, 184, 0.08)",
  verticalAlign: "top",
};

const tableCellStyleLabel: CSSProperties = {
  ...tableCellStyle,
  color: "#f8fafc",
  fontWeight: 700,
  width: "22%",
};

const pricingCardStyle: CSSProperties = {
  padding: "1rem",
  borderRadius: "1rem",
  border: "1px solid rgba(148, 163, 184, 0.12)",
  background: "rgba(2, 6, 23, 0.46)",
};

const pricingTextStyle: CSSProperties = {
  color: "#94a3b8",
  lineHeight: 1.7,
  fontSize: "0.92rem",
};

const pillStyle: CSSProperties = {
  padding: "0.28rem 0.6rem",
  borderRadius: "999px",
  background: "rgba(34, 197, 94, 0.12)",
  color: "#86efac",
  fontSize: "0.78rem",
  fontWeight: 700,
};

const primaryActionStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.55rem",
  textDecoration: "none",
  padding: "0.9rem 1rem",
  borderRadius: "999px",
  background: "#22c55e",
  color: "#04130a",
  fontWeight: 800,
};

const secondaryActionStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.55rem",
  textDecoration: "none",
  padding: "0.9rem 1rem",
  borderRadius: "999px",
  border: "1px solid rgba(255,255,255,0.14)",
  color: "#f8fafc",
  fontWeight: 700,
  background: "rgba(2, 6, 23, 0.42)",
};


